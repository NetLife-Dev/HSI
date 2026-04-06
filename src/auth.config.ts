import type { NextAuthConfig } from 'next-auth'

// Edge-safe NextAuth config — NO database adapter, NO Node.js-only imports.
// Used exclusively by middleware.ts to validate sessions in the Edge runtime.
// The full config with DrizzleAdapter lives in src/lib/auth.ts.
export const authConfig: NextAuthConfig = {
  // JWT strategy is required for Credentials provider in NextAuth v5 beta.
  // The DrizzleAdapter is still used for OAuth/magic-link accounts, but session
  // tokens are stored in encrypted JWTs (cookie) not in the sessions DB table.
  // Staff session revocability (Phase 5) will use a JWT blocklist via the DB.
  session: { strategy: 'jwt' },
  trustHost: true,
  pages: {
    signIn: '/login',
    verifyRequest: '/verify',
    error: '/login',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
      if (isAdminRoute) {
        if (isLoggedIn) return true
        return false // Redirect to /login
      }
      return true
    },
  },
}
