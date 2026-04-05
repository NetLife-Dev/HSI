/**
 * auth.ts — stub for Plan 01-04 admin shell
 * Plan 01-03 (Authentication) replaces this with the real NextAuth v5 configuration.
 * This stub exists so the admin layout compiles before Plan 01-03 is merged.
 */
import type { Session } from 'next-auth'

// Stub: Plan 01-03 implements real NextAuth v5 auth() function
export async function auth(): Promise<Session | null> {
  return null
}
