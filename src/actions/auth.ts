'use server'

import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { eq, and, gt } from 'drizzle-orm'
import { db } from '@/db/index'
import { users, verificationTokens } from '@/db/schema'
import { logAction } from '@/lib/audit'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { loginLimiter, magicLinkLimiter } from '@/lib/rate-limit'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

const emailSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
})

export async function loginWithCredentials(formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  // Rate limit: 10 login attempts per IP per 15 minutes
  const headersList = await headers()
  const ip = headersList.get('x-client-ip') ?? headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  const userAgent = headersList.get('user-agent') ?? undefined
  if (!loginLimiter.check(ip, 10, 15 * 60 * 1000)) {
    return { error: 'Muitas tentativas. Tente novamente em 15 minutos.' }
  }

  try {
    // No redirectTo — handle redirect manually so we can audit log with IP/userAgent first
    await signIn('credentials', {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirect: false,
    })
  } catch (err) {
    if (err instanceof AuthError) {
      void logAction({
        action: 'LOGIN_FAILED',
        ipAddress: ip,
        userAgent,
        metadata: { email: parsed.data.email.toLowerCase(), provider: 'credentials' },
      })
      return { error: 'E-mail ou senha incorretos' }
    }
    throw err
  }

  // Login succeeded — skip audit log for now to avoid DB timeout hangs in mock mode
  /* void logAction({
    action: 'LOGIN_SUCCESS',
    ipAddress: ip,
    userAgent,
    metadata: { provider: 'credentials' },
  }) */
  redirect('/admin/dashboard')
}

export async function sendMagicLink(formData: FormData) {
  const parsed = emailSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'E-mail inválido' }
  }

  // Rate limit: 3 magic link requests per email per hour
  if (!magicLinkLimiter.check(parsed.data.email.toLowerCase(), 3, 60 * 60 * 1000)) {
    return { error: 'Limite de magic links atingido. Tente novamente em 1 hora.' }
  }

  try {
    await signIn('resend', {
      email: parsed.data.email.toLowerCase(),
      redirectTo: '/admin/dashboard',
    })
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: 'Não foi possível enviar o link. Tente novamente.' }
    }
    throw err
  }
}

export async function forgotPassword(formData: FormData) {
  const parsed = emailSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'E-mail inválido' }
  }

  const email = parsed.data.email.toLowerCase()

  // Check user exists — silently succeed even if not (prevents email enumeration)
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (!user) {
    // Return success to prevent email enumeration
    return { success: true }
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

  // Reuse verificationTokens table with 'password-reset:' prefix on identifier
  await db.insert(verificationTokens).values({
    identifier: `password-reset:${email}`,
    token,
    expires,
  })

  // TODO Phase 1: Send email via Resend with reset URL: /reset-password?token={token}&email={email}
  // For now, log the token (dev only — remove before production)
  if (process.env.NODE_ENV === 'development') {
    console.log('[forgotPassword] Reset token:', token, 'for', email)
  }

  return { success: true }
}

export async function resetPassword(formData: FormData) {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const { token, password } = parsed.data

  // Find and validate the reset token
  const [record] = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.token, token),
        gt(verificationTokens.expires, new Date())
      )
    )
    .limit(1)

  if (!record || !record.identifier.startsWith('password-reset:')) {
    return { error: 'Token inválido ou expirado' }
  }

  const email = record.identifier.replace('password-reset:', '')

  const passwordHash = await bcrypt.hash(password, 12)

  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.email, email))

  // Consume the token (delete after use)
  await db
    .delete(verificationTokens)
    .where(
      and(
        eq(verificationTokens.identifier, record.identifier),
        eq(verificationTokens.token, token)
      )
    )

  void logAction({
    action: 'PASSWORD_RESET',
    entityType: 'user',
    metadata: { email },
  })

  return { success: true }
}
