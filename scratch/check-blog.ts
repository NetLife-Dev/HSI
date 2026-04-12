import { db } from './src/db'
import { blogPosts } from './src/db/schema'

async function checkBlog() {
  try {
    const allPosts = await db.select().from(blogPosts)
    console.log('Total Posts in DB:', allPosts.length)
    allPosts.forEach(p => {
      console.log(`- Title: ${p.title}, Status: ${p.status}, PublishedAt: ${p.publishedAt}`)
    })
  } catch (err) {
    console.error('DB Error:', err)
  }
}

checkBlog()
