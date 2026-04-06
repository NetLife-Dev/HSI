import ical from 'node-ical'
import { db } from '@/db'
import { icalFeeds, blockedDates } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { addDays } from 'date-fns'

export async function syncAllIcalFeeds() {
  console.log('[iCal] Starting global sync...')
  
  const feeds = await db.query.icalFeeds.findMany()
  
  for (const feed of feeds) {
    try {
      await syncIcalFeed(feed.id)
    } catch (err) {
      console.error(`[iCal] Failed to sync feed ${feed.name} (${feed.id}):`, err)
    }
  }
}

export async function syncIcalFeed(feedId: string) {
  const feed = await db.query.icalFeeds.findFirst({
    where: eq(icalFeeds.id, feedId)
  })

  if (!feed) return

  const data = await ical.fromURL(feed.url)
  
  // 1. Remove previous blocks from THIS SPECIFIC ical feed to refresh
  await db.delete(blockedDates).where(eq(blockedDates.source, `ical:${feed.id}`))

  const blocksToInsert = []

  for (const k in data) {
    const event = data[k]
    if (event.type === 'VEVENT') {
      let start = event.start
      let end = event.end
      
      if (!start || !end) continue

      // Airbnb Off-by-one fix: for 'DATE' only events, add 1 day to end
      // @ts-ignore - node-ical types might be missing 'datetype'
      if (event.datetype === 'date') {
        end = addDays(end, 1)
      }

      blocksToInsert.push({
        propertyId: feed.propertyId,
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        source: `ical:${feed.id}`,
        icalUid: event.uid || undefined,
      })
    }
  }

  if (blocksToInsert.length > 0) {
    await db.insert(blockedDates).values(blocksToInsert)
  }

  await db.update(icalFeeds)
    .set({ lastSyncedAt: new Date() })
    .where(eq(icalFeeds.id, feedId))

  console.log(`[iCal] Synced ${blocksToInsert.length} events for ${feed.name}`)
}
