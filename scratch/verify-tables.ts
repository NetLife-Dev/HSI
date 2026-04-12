import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config()

async function check() {
  const sql = postgres(process.env.DATABASE_URL!)
  try {
    const result = await sql`SELECT table_name FROM information_schema.tables WHERE table_name = 'blog_posts'`
    console.log('Results:', result)
    if (result.length > 0) {
      console.log('✅ Success: blog_posts table exists!')
    } else {
      console.log('❌ Error: blog_posts table still missing.')
    }
  } catch (e) {
    console.error('Error during check:', e)
  } finally {
    await sql.end()
  }
}

check()
