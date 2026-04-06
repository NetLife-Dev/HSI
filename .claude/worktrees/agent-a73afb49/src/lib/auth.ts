import NextAuth from 'next-auth'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import Credentials from 'next-auth/providers/credentials'
import Resend from 'next-auth/providers/resend'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '@/db/index'
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from '@/db/schema'
import { logAction } from '@/lib/audit'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: 'database' },
  pages: {
    signIn: '/login',
    verifyRequest: '/verify',
    error: '/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, parsed.data.email.toLowerCase()))
          .limit(1)

        if (!user?.passwordHash) return null

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
          role: user.role ?? 'owner',
        }
      },
    }),
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY!,
      from: process.env.AUTH_FROM_EMAIL ?? 'noreply@hostsemimposto.com.br',
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id
        session.user.role = (user as { role?: 'owner' | 'staff' }).role ?? 'owner'
      }
      return session
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      // Fire-and-forget audit log — never blocks auth flow
      void logAction({
        ...(user.id ? { userId: user.id, entityId: user.id } : {}),
        action: 'LOGIN_SUCCESS',
        entityType: 'user',
        metadata: { provider: account?.provider, isNewUser },
      })
    },
  },
})
