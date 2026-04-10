'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword } from '@/actions/auth'
import { ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''

  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!token || !email) {
    return (
      <div className="space-y-4 text-center">
        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto">
          <ShieldCheck size={24} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Link inválido</h1>
        <p className="text-text-secondary text-sm">
          Este link de redefinição é inválido ou expirou. Solicite um novo link na página de login.
        </p>
        <Button
          variant="ghost"
          className="w-full h-11 rounded-xl text-xs font-bold"
          onClick={() => router.push('/login')}
        >
          Voltar ao login
        </Button>
      </div>
    )
  }

  if (success) {
    return (
      <div className="space-y-6 text-center animate-slide-up">
        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text-primary">Senha redefinida!</h1>
          <p className="text-text-secondary text-sm">
            Sua senha foi alterada com sucesso. Você já pode acessar o painel.
          </p>
        </div>
        <Button
          className="w-full h-12 rounded-xl text-sm font-bold shadow-lg shadow-primary/25"
          onClick={() => router.push('/login')}
        >
          Ir para o login
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('token', token)

    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      setPending(false)
      return
    }

    const result = await resetPassword(formData)
    if (result?.error) {
      setError(result.error)
      setPending(false)
    } else {
      setSuccess(true)
    }
  }

  return (
    <div className="space-y-8 w-full animate-slide-up">
      <div className="space-y-2">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 mb-6">
          <ShieldCheck size={24} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Nova senha
        </h1>
        <p className="text-text-secondary font-medium">
          Crie uma senha segura para sua conta.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium flex gap-3 animate-slide-up">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-text-tertiary">
            Nova Senha
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            className="h-12 bg-surface-elevated border-border focus:border-primary focus:ring-primary/20 rounded-xl transition-all"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-widest text-text-tertiary">
            Confirmar Senha
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Repita a nova senha"
            className="h-12 bg-surface-elevated border-border focus:border-primary focus:ring-primary/20 rounded-xl transition-all"
          />
        </div>
        <Button
          type="submit"
          className="w-full h-12 rounded-xl text-sm font-bold shadow-lg shadow-primary/25 group overflow-hidden relative"
          disabled={pending}
        >
          <span className="relative z-10 flex items-center gap-2">
            {pending ? 'Salvando...' : 'Salvar nova senha'}
            {!pending && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </span>
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </Button>
      </form>

      <div className="pt-4 text-center text-[10px] text-text-tertiary uppercase font-bold tracking-widest">
        HostSemImposto &copy; 2026 &bull; Premium Hosting Platform
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="space-y-6 animate-pulse" />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
