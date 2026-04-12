import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from '../src/db/schema'
import { eq, desc } from 'drizzle-orm'
import * as dotenv from 'dotenv'

dotenv.config()

async function debugDirect() {
  const url = process.env.DATABASE_URL!
  const client = postgres(url)
  const db = drizzle(client, { schema })

  try {
    console.log('--- Direct DB Blog Check ---')
    const posts = await db.select().from(schema.blogPosts).where(eq(schema.blogPosts.status, 'published')).orderBy(desc(schema.blogPosts.publishedAt))
    console.log('Posts found:', posts.length)
    console.table(posts.map(p => ({ title: p.title, status: p.status })))
  } catch (e: any) {
    console.error('Direct query failed:', e.message)
  } finally {
    await client.end()
  }
}

debugDirect()
