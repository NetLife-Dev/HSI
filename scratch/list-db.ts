import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config()

async function list() {
  const sql = postgres(process.env.DATABASE_URL!)
  try {
    const properties = await sql`SELECT name, status, featured FROM properties`
    console.log('--- Real Properties in DB ---')
    console.table(properties)
    // const blogs = await sql`SELECT id, title, status, "published_at" FROM blog_posts`
  } catch (e) {
    console.error('Error during list:', e)
  } finally {
    await sql.end()
  }
}

list()
