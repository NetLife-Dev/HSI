import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

export async function runMigrations(retries = 5, delayMs = 2000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const sql = postgres(process.env.DATABASE_URL!, { max: 1 })
      const db = drizzle(sql)
      await migrate(db, { migrationsFolder: './drizzle' })
      console.log('[migrate] All migrations applied successfully')
      await sql.end()
      return
    } catch (err) {
      console.error(`[migrate] Attempt ${attempt}/${retries} failed:`, err)
      if (attempt === retries) throw err
      await new Promise(r => setTimeout(r, delayMs * attempt))
    }
  }
}
