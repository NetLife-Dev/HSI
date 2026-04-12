import { db } from '../src/db'
import { properties, propertyImages, blogPosts } from '../src/db/schema'
import { count, eq } from 'drizzle-orm'

async function check() {
  try {
    const propertyCount = await db.select({ value: count() }).from(properties)
    const activeProperties = await db.select().from(properties).where(eq(properties.status, 'active'))
    const blogCount = await db.select({ value: count() }).from(blogPosts)
    
    console.log('--- DB CHECK ---')
    console.log('Total Properties:', propertyCount[0].value)
    console.log('Active Properties:', activeProperties.length)
    console.log('Active Property Details:', activeProperties.map(p => ({ id: p.id, name: p.name, featured: p.featured, status: p.status })))
    console.log('Total Blog Posts:', blogCount[0].value)
    console.log('----------------')
    process.exit(0)
  } catch (err) {
    console.error('DB Check Failed:', err)
    process.exit(1)
  }
}

check()
