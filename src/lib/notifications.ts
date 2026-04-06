import { db } from '@/db'
import { notifications, users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export type NotificationType = 'new_booking' | 'payment_confirmed' | 'checkin_today' | 'checkout_pending'

export async function createNotification({
  type,
  title,
  message,
  relatedEntityType,
  relatedEntityId,
  targetUserId, // Optional: if not provided, send to all owners
}: {
  type: NotificationType
  title: string
  message: string
  relatedEntityType?: string
  relatedEntityId?: string
  targetUserId?: string
}) {
  try {
    // If targetUserId is provided, send to that user
    if (targetUserId) {
      await db.insert(notifications).values({
        userId: targetUserId,
        type,
        title,
        message,
        relatedEntityType,
        relatedEntityId,
      })
      return
    }

    // Otherwise, send to all owners
    const owners = await db.query.users.findMany({
      where: eq(users.role, 'owner'),
    })

    if (owners.length === 0) return

    const values = owners.map((owner) => ({
      userId: owner.id,
      type,
      title,
      message,
      relatedEntityType,
      relatedEntityId,
    }))

    await db.insert(notifications).values(values)
  } catch (err) {
    console.error('[createNotification] Failed:', err)
  }
}

export async function markAsRead(notificationId: string, userId: string) {
  try {
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, notificationId))
  } catch (err) {
    console.error('[markAsRead] Failed:', err)
  }
}
