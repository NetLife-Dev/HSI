import React from 'react'
import { Ticket } from 'lucide-react'
import { getCoupons } from '@/actions/coupons'
import { CouponsClient } from './CouponsClient'

export default async function CouponsPage() {
  const couponsData = await getCoupons()
  
  // Serialize to avoid transport errors with complex objects (Date, uuid)
  const coupons = couponsData.map(c => ({
    ...c,
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
    validUntil: c.validUntil instanceof Date ? c.validUntil.toISOString().split('T')[0] : c.validUntil,
  }))

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
            <Ticket className="text-accent" />
            Cupons <span className="text-white/40 font-medium">De Desconto</span>
          </h1>
          <p className="text-white/50 font-medium">Gerencie promoções compatíveis com o checkout Stripe.</p>
        </div>
        
        <CouponsClient initialCoupons={coupons as any} />
      </div>
    </div>
  )
}
