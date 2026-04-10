'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { loginWithCredentials, sendMagicLink, forgotPassword } from '@/actions/auth'
import { LogIn, Mail, ArrowRight, KeyRound } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const [credentialsPending, setCredentialsPending] = useState(false)
  const [magicPending, setMagicPending] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotPending, setForgotPending] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

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

  async function handleForgotPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setForgotPending(true)
    const formData = new FormData(e.currentTarget)
    await forgotPassword(formData)
    // Always show success to prevent email enumeration
    setForgotSent(true)
    setForgotPending(false)
  }

  if (showForgot) {
    return (
      <div className="space-y-8 w-full animate-slide-up">
        <div className="space-y-2">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 mb-6">
            <KeyRound size={24} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Recuperar acesso
          </h1>
          <p className="text-text-secondary font-medium">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </p>
        </div>

        {forgotSent ? (
          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-primary text-sm text-center space-y-3 animate-reveal-card">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Mail size={24} />
            </div>
            <p className="font-bold">Verifique sua caixa de entrada!</p>
            <p className="text-xs opacity-70 leading-relaxed">
              Se esse e-mail estiver cadastrado, você receberá um link de redefinição em instantes.
            </p>
            <button
              type="button"
              className="text-[10px] uppercase font-black text-text-tertiary hover:text-primary underline-offset-4 hover:underline mt-2"
              onClick={() => { setShowForgot(false); setForgotSent(false) }}
            >
              Voltar ao login
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="forgot-email" className="text-xs font-bold uppercase tracking-widest text-text-tertiary">E-mail</Label>
              <Input
                id="forgot-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="anfitrio@hostsemimposto.com"
                className="h-12 bg-surface-elevated border-border focus:border-primary focus:ring-primary/20 rounded-xl transition-all"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-sm font-bold shadow-lg shadow-primary/25 group overflow-hidden relative"
              disabled={forgotPending}
            >
              <span className="relative z-10 flex items-center gap-2">
                {forgotPending ? 'Enviando...' : 'Enviar link de recuperação'}
                {!forgotPending && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Button>
            <button
              type="button"
              className="w-full text-[10px] uppercase font-black text-text-tertiary hover:text-primary underline-offset-4 hover:underline"
              onClick={() => setShowForgot(false)}
            >
              Voltar ao login
            </button>
          </form>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8 w-full animate-slide-up">
      <div className="space-y-2">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 mb-6">
          <LogIn size={24} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Bem-vindo de volta
        </h1>
        <p className="text-text-secondary font-medium">
          Acesse sua conta para gerenciar seus imóveis.
        </p>
      </div>

      {(error ?? formError) && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium flex gap-3 animate-slide-up">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0" />
          {error === 'CredentialsSignin' ? 'As credenciais fornecidas são inválidas.' : (formError ?? 'Houve um problema ao processar seu acesso.')}
        </div>
      )}

      <form onSubmit={handleCredentials} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-text-tertiary">E-mail Corporativo</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="anfitrio@hostsemimposto.com"
            className="h-12 bg-surface-elevated border-border focus:border-primary focus:ring-primary/20 rounded-xl transition-all"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-text-tertiary">Senha</Label>
            <button type="button" onClick={() => setShowForgot(true)} className="text-[10px] uppercase font-black text-primary hover:underline underline-offset-4">Esqueceu?</button>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••••••"
            className="h-12 bg-surface-elevated border-border focus:border-primary focus:ring-primary/20 rounded-xl transition-all"
          />
        </div>
        <Button
          type="submit"
          className="w-full h-12 rounded-xl text-sm font-bold shadow-lg shadow-primary/25 group overflow-hidden relative"
          disabled={credentialsPending}
        >
          <span className="relative z-10 flex items-center gap-2">
            {credentialsPending ? 'Autenticando...' : 'Acessar Painel'}
            {!credentialsPending && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </span>
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="bg-border" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em] text-text-tertiary">
          <span className="bg-[var(--color-surface)] px-4">Acesso via Link</span>
        </div>
      </div>

      {magicSent ? (
        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-primary text-sm text-center space-y-3 animate-reveal-card">
           <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Mail size={24} />
           </div>
           <p className="font-bold">Verifique sua caixa de entrada!</p>
           <p className="text-xs opacity-70 leading-relaxed">Enviamos um link de acesso seguro para o seu e-mail.</p>
        </div>
      ) : (
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="magic-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Digite seu e-mail para receber o link..."
              className="h-11 bg-surface-elevated border-border rounded-xl text-xs"
            />
          </div>
          <Button type="submit" variant="ghost" className="w-full h-11 text-text-tertiary hover:text-primary hover:bg-primary/5 rounded-xl text-xs font-bold" disabled={magicPending}>
            {magicPending ? 'Processando...' : 'Entrar com Link Mágico'}
          </Button>
        </form>
      )}

      <div className="pt-8 text-center text-[10px] text-text-tertiary uppercase font-bold tracking-widest">
        HostSemImposto &copy; 2026 &bull; Premium Hosting Platform
      </div>
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
