import { db } from './src/db'
import { properties, blogPosts } from './src/db/schema'
import { count } from 'drizzle-orm'

async function checkDb() {
  try {
    const propertyCount = await db.select({ value: count() }).from(properties)
    const postCount = await db.select({ value: count() }).from(blogPosts)
    
    console.log('--- DB Check ---')
    console.log('Properties:', propertyCount[0].value)
    console.log('Blog Posts:', postCount[0].value)
    
    if (postCount[0].value > 0) {
      const sample = await db.select().from(blogPosts).limit(1)
      console.log('Sample Post Status:', sample[0].status)
    }
  } catch (err) {
    console.error('DB Error:', err)
  }
}

checkDb()
