import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config()

async function test() {
  const url = process.env.DATABASE_URL!
  console.log('Connecting to:', url.replace(/:[^:]+@/, ':****@'))
  const client = postgres(url)
  const db = drizzle(client)
  
  try {
    const result = await db.execute('SELECT 1')
    console.log('Result:', result)
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await client.end()
  }
}

test()
