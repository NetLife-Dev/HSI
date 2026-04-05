'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { loginWithCredentials, sendMagicLink } from '@/actions/auth'

function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const [credentialsPending, setCredentialsPending] = useState(false)
  const [magicPending, setMagicPending] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function handleCredentials(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    setCredentialsPending(true)
    const formData = new FormData(e.currentTarget)
    const result = await loginWithCredentials(formData)
    if (result?.error) {
      setFormError(result.error)
      setCredentialsPending(false)
    }
    // On success, NextAuth redirects via callbackUrl — no manual router.push needed
  }

  async function handleMagicLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    setMagicPending(true)
    const formData = new FormData(e.currentTarget)
    const result = await sendMagicLink(formData)
    if (result?.error) {
      setFormError(result.error)
      setMagicPending(false)
    } else {
      setMagicSent(true)
      setMagicPending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          Entrar
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Acesse o painel de gestão
        </p>
      </div>

      {(error ?? formError) && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error === 'CredentialsSignin' ? 'E-mail ou senha incorretos' : (formError ?? 'Ocorreu um erro')}
        </div>
      )}

      <form onSubmit={handleCredentials} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="admin@exemplo.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </div>
        <Button type="submit" className="w-full" disabled={credentialsPending}>
          {credentialsPending ? 'Entrando...' : 'Entrar com senha'}
        </Button>
      </form>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-surface)] px-2 text-xs text-[var(--color-text-tertiary)]">
          ou
        </span>
      </div>

      {magicSent ? (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm text-center">
          Link enviado! Verifique seu e-mail e clique no link para entrar.
        </div>
      ) : (
        <form onSubmit={handleMagicLink} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="magic-email">E-mail para link mágico</Label>
            <Input
              id="magic-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="admin@exemplo.com"
            />
          </div>
          <Button type="submit" variant="outline" className="w-full" disabled={magicPending}>
            {magicPending ? 'Enviando...' : 'Enviar link de acesso'}
          </Button>
        </form>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="space-y-6 animate-pulse" />}>
      <LoginForm />
    </Suspense>
  )
}
