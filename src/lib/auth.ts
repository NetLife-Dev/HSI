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
import { authConfig } from '@/auth.config'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: 'owner' | 'staff' }).role ?? 'owner'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = (token.role as 'owner' | 'staff') ?? 'owner'
      }
      return session
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      // Log magic link / OAuth sign-ins (credentials login is logged in the Server Action with IP/userAgent)
      if (account?.provider !== 'credentials') {
        void logAction({
          ...(user.id ? { userId: user.id, entityId: user.id } : {}),
          action: 'LOGIN_SUCCESS',
          entityType: 'user',
          metadata: { provider: account?.provider, isNewUser },
        })
      }
    },
  },
})
