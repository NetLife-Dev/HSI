import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config()

async function patch() {
  const sql = postgres(process.env.DATABASE_URL!)
  try {
    const result = await sql`UPDATE properties SET featured = true WHERE name = 'Casa do Lago'`
    console.log('Update result:', result)
    console.log('✅ Casa do Lago sets as Featured!')
  } catch (e) {
    console.error('Error during patch:', e)
  } finally {
    await sql.end()
  }
}

patch()
