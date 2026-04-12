import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config()

async function inspect() {
  const sql = postgres(process.env.DATABASE_URL!)
  try {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'blog_posts'
    `
    console.log('Columns in blog_posts:')
    console.table(columns)
  } catch (e) {
    console.error('Inspect failed:', e)
  } finally {
    await sql.end()
  }
}

inspect()
