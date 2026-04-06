'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, ShieldCheck, Users } from 'lucide-react'
import { createCheckoutSession } from '@/actions/bookings'
import { toast } from 'sonner'

interface CheckoutFormProps {
  propertyId: string
  checkIn: string
  checkOut: string
  propertyRules?: string
}

export function CheckoutForm({ propertyId, checkIn, checkOut, propertyRules }: CheckoutFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestWhatsapp: '',
    guestCpf: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createCheckoutSession({
        propertyId,
        checkIn,
        checkOut,
        guestCount: 1, // Default to 1 for now or add a selector
        ...formData
      })

      if (result.error) {
        toast.error(result.error)
      } else if (result.url) {
        window.location.href = result.url
      }
    } catch (err) {
      toast.error('Ocorreu um erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-12">
      {/* Guest Summary */}
      <section className="bg-surface-elevated rounded-[2.5rem] p-8 md:p-10 border border-border-subtle shadow-sm space-y-8">
        <h2 className="text-2xl font-display font-medium text-text-primary flex items-center gap-3">
          <Users size={24} className="text-accent" />
          Seus Dados
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary">Nome Completo</label>
            <Input 
              required
              value={formData.guestName}
              onChange={e => setFormData(p => ({ ...p, guestName: e.target.value }))}
              placeholder="Como está no documento" 
              className="h-14 bg-surface border-border-subtle rounded-2xl focus-visible:ring-accent/20" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary">E-mail</label>
            <Input 
              required
              type="email"
              value={formData.guestEmail}
              onChange={e => setFormData(p => ({ ...p, guestEmail: e.target.value }))}
              placeholder="seu@email.com" 
              className="h-14 bg-surface border-border-subtle rounded-2xl focus-visible:ring-accent/20" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary">WhatsApp</label>
            <Input 
              value={formData.guestWhatsapp}
              onChange={e => setFormData(p => ({ ...p, guestWhatsapp: e.target.value }))}
              placeholder="(11) 99999-9999" 
              className="h-14 bg-surface border-border-subtle rounded-2xl focus-visible:ring-accent/20" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary">CPF</label>
            <Input 
              value={formData.guestCpf}
              onChange={e => setFormData(p => ({ ...p, guestCpf: e.target.value }))}
              placeholder="000.000.000-00" 
              className="h-14 bg-surface border-border-subtle rounded-2xl focus-visible:ring-accent/20" 
            />
          </div>
        </div>

        <div className="space-y-2 pt-4">
            <label className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary">Mensagem para o Proprietário (Opcional)</label>
            <textarea 
              placeholder="Diga olá e fale um pouco sobre o motivo da viagem..." 
              className="w-full min-h-[120px] p-4 bg-surface border border-border-subtle rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none" 
            />
        </div>
      </section>

      {/* Rules */}
      <section className="bg-surface-elevated rounded-[2.5rem] p-8 md:p-10 border border-border-subtle shadow-sm space-y-6">
        <h2 className="text-xl font-display font-medium text-text-primary">Lembretes Importantes</h2>
        <div className="space-y-4">
          <div className="flex gap-4 p-4 rounded-2xl bg-accent/5 border border-accent/10 items-start">
            <ShieldCheck size={24} className="text-accent shrink-0" />
            <p className="text-sm text-text-secondary leading-relaxed">
              Requeremos documento de identidade oficial válido para todos os hóspedes antes do check-in por medidas de segurança.
            </p>
          </div>
          <p className="text-sm text-text-tertiary leading-relaxed">
            Ao prosseguir, você concorda em cumprir as regras da casa: <span className="italic font-medium text-text-secondary">{propertyRules || 'Tratar o espaço com respeito.'}</span>
          </p>
        </div>
      </section>

      {/* Submit Button (redundant if inside sidebar, but we move it here or keep in sidebar) */}
      <Button 
        type="submit" 
        disabled={loading}
        className="w-full h-20 rounded-[2rem] text-lg font-black bg-accent text-white hover:scale-[1.01] transition-transform shadow-2xl shadow-accent/20 border-0"
      >
        {loading ? 'Processando Checkout...' : 'Confirmar e Ir para Pagamento'}
      </Button>

      <div className="flex items-center justify-center gap-2 text-[10px] text-text-tertiary uppercase font-bold tracking-widest">
        <Lock size={10} />
        Checkout Seguro via Stripe
      </div>
    </form>
  )
}
