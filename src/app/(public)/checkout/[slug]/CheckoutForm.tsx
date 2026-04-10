'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createCheckoutSession } from '@/actions/stripe'
import { toast } from 'sonner'
import { ShieldCheck, Users } from 'lucide-react'

interface CheckoutFormProps {
  property: any
  checkin: string
  checkout: string
  guests: number
  selectedServiceIds: string[]
}

export function CheckoutForm({ 
  property, 
  checkin, 
  checkout, 
  guests, 
  selectedServiceIds 
}: CheckoutFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
  })
  const [couponCode, setCouponCode] = useState('')

  const handleCheckout = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.cpf) {
      toast.error('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    setLoading(true)
    try {
      const result = await createCheckoutSession({
        propertyId: property.id,
        checkin,
        checkout,
        guests,
        guestName: formData.name,
        guestEmail: formData.email,
        guestWhatsapp: formData.phone,
        selectedServiceIds,
        couponCode: couponCode || undefined as string | undefined,
      })

      if (result.url) {
        window.location.href = result.url
      }
    } catch (error: any) {
      toast.error('Erro ao iniciar checkout: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-12">
      {/* Guest Summary */}
      <section className="bg-[#111] rounded-[2.5rem] p-8 md:p-10 border border-white/5 shadow-2xl space-y-8">
        <h2 className="text-2xl font-display font-medium text-white flex items-center gap-3">
           <Users size={24} className="text-accent" />
           Seus Dados
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Nome Completo</label>
            <Input
              placeholder="Como está no documento"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl focus-visible:ring-accent/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">E-mail</label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl focus-visible:ring-accent/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">WhatsApp</label>
            <Input
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl focus-visible:ring-accent/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">CPF</label>
            <Input
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChange={e => setFormData({ ...formData, cpf: e.target.value })}
              className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl focus-visible:ring-accent/20"
            />
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Mensagem para o Proprietário (Opcional)</label>
          <textarea
            placeholder="Diga olá e fale um pouco sobre o motivo da viagem..."
            className="w-full min-h-[120px] p-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
          />
        </div>
      </section>

      {/* Rules */}
      <section className="bg-[#111] rounded-[2.5rem] p-8 md:p-10 border border-white/5 shadow-2xl space-y-6">
        <h2 className="text-xl font-display font-medium text-white">Lembretes Importantes</h2>
        <div className="space-y-4">
          <div className="flex gap-4 p-4 rounded-2xl bg-accent/5 border border-accent/10 items-start">
            <ShieldCheck size={24} className="text-accent shrink-0" />
            <p className="text-sm text-white/50 leading-relaxed">
              Requeremos documento de identidade oficial válido para todos os hóspedes antes do check-in por medidas de segurança.
            </p>
          </div>
          <p className="text-sm text-white/30 leading-relaxed">
            Ao prosseguir, você concorda em cumprir as regras da casa: <span className="italic font-medium text-white/50">{property.rules || 'Tratar o espaço com respeito.'}</span>
          </p>
        </div>
      </section>

      {/* Action Area */}
      <div className="pt-4 flex flex-col gap-4">
        <Button
          onClick={handleCheckout}
          disabled={loading}
          className={cn("w-full h-20 rounded-2xl text-xl font-bold tracking-tight shadow-xl shadow-accent/20 hover:scale-[1.01] transition-all bg-accent hover:bg-white text-black", loading && "opacity-50")}
        >
          {loading ? 'Preparando Checkout...' : 'Garantir Reserva'}
        </Button>
        <div className="flex items-center justify-center gap-2 text-xs text-white/30 font-medium">
          <Lock size={12} className="text-emerald-500" />
          Pagamento 100% seguro via Stripe
        </div>
      </div>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

function Lock(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
