/**
 * Creates (or updates) the admin user in the database.
 * Usage: npx tsx scripts/seed-admin.ts
 *
 * Override defaults via env vars:
 *   SEED_EMAIL=me@example.com SEED_PASSWORD=MyPass1! npx tsx scripts/seed-admin.ts
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { hash } from 'bcryptjs'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq } from 'drizzle-orm'
import * as schema from '../src/db/schema'

// ── Load .env manually so the script works without dotenv installed ───────────
try {
  const envPath = resolve(process.cwd(), '.env')
  const lines = readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    if (!(key in process.env)) process.env[key] = val
  }
} catch {
  // .env not found — rely on environment variables already set
}

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('❌  DATABASE_URL não encontrado. Configure o .env ou exporte a variável.')
  process.exit(1)
}

const SEED_EMAIL    = process.env.SEED_EMAIL    ?? 'admin@hostsemimposto.com'
const SEED_PASSWORD = process.env.SEED_PASSWORD ?? 'Admin@123'
const SEED_NAME     = process.env.SEED_NAME     ?? 'Admin'

async function main() {
  const client = postgres(DATABASE_URL!, { max: 1 })
  const db = drizzle(client, { schema })

  console.log(`\n📧  E-mail : ${SEED_EMAIL}`)
  console.log(`🔑  Senha  : ${SEED_PASSWORD}`)
  console.log(`👤  Nome   : ${SEED_NAME}\n`)

  const passwordHash = await hash(SEED_PASSWORD, 10)

  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, SEED_EMAIL))
    .limit(1)

  if (existing.length > 0) {
    await db
      .update(schema.users)
      .set({ passwordHash, name: SEED_NAME, emailVerified: new Date() })
      .where(eq(schema.users.email, SEED_EMAIL))
    console.log('✅  Usuário admin atualizado (senha redefinida).')
  } else {
    await db.insert(schema.users).values({
      name: SEED_NAME,
      email: SEED_EMAIL,
      emailVerified: new Date(),
      passwordHash,
      role: 'owner',
    })
    console.log('✅  Usuário admin criado com sucesso.')
  }

  await client.end()
}

main().catch((err) => {
  console.error('❌  Erro:', err)
  process.exit(1)
})
