import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

/**
 * Use at the top of every admin Server Action and Route Handler.
 * Returns the session or redirects to /login.
 * Never throws — always redirects.
 */
export async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }
  return session
}

/**
 * Use when an action requires a specific role.
 * Redirects to /login if not authenticated, returns 403 error if wrong role.
 */
export async function requireRole(requiredRole: 'owner' | 'staff') {
  const session = await requireAuth()
  if (session.user.role !== requiredRole && session.user.role !== 'owner') {
    // 'owner' has access to everything; staff is checked against specific permissions in Phase 5
    return { error: 'Forbidden' as const, session: null }
  }
  return { error: null, session }
}

/**
 * Use in Server Components (layouts, pages) to get the current session.
 * Returns null if not authenticated (does not redirect — use requireAuth for actions).
 */
export async function getSession() {
  return auth()
}
