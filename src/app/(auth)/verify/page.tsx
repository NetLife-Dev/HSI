export default function VerifyPage() {
  return (
    <div className="text-center space-y-4">
      <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
        Verifique seu e-mail
      </h1>
      <p className="text-[var(--color-text-secondary)]">
        Enviamos um link de acesso para o seu e-mail. Clique no link para entrar no painel.
      </p>
      <p className="text-sm text-[var(--color-text-tertiary)]">
        O link expira em 24 horas. Verifique também sua caixa de spam.
      </p>
    </div>
  )
}
