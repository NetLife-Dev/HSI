import { Metadata } from 'next'
import { PropertyForm } from '@/components/admin/properties/PropertyForm'

export const metadata: Metadata = {
  title: 'Novo Imóvel — Admin',
}

export default function NewPropertyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
          Novo Imóvel
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Preencha os dados básicos para cadastrar uma nova propriedade.
        </p>
      </div>

      <PropertyForm />
    </div>
  )
}
