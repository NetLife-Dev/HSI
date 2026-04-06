import { describe, it } from 'vitest'

describe('OPS-02: Drizzle migrations', () => {
  it.todo('migrate() runs without error against test database')
  it.todo('users table exists after migration')
  it.todo('auditLog table exists with bigserial primary key')
  it.todo('instrumentation.ts calls migrate() when NEXT_RUNTIME is nodejs')
})
