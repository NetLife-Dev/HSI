import React from 'react'
import { Ticket, AlertTriangle } from 'lucide-react'
import { getCoupons } from '@/actions/coupons'
import { CouponsClient } from './CouponsClient'

export default async function CouponsPage() {
  let coupons: any[] = []
  let dbError: string | null = null

  try {
    const couponsData = await getCoupons()
    // Serialize to avoid transport errors with complex objects (Date, uuid)
    coupons = couponsData.map(c => ({
      ...c,
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
      validUntil: (c.validUntil as unknown) instanceof Date ? (c.validUntil as any).toISOString().split('T')[0] : c.validUntil,
    }))
  } catch (err: any) {
    console.error('[CouponsPage] DB error:', err?.message)
    // Detect migration-not-run errors
    if (err?.message?.includes('relation "coupons" does not exist') || err?.message?.includes('column') || err?.code === '42P01') {
      dbError = 'A tabela de cupons não existe no banco de dados. Execute a migração: pnpm db:migrate'
    } else {
      dbError = 'Erro ao carregar cupons. Verifique a conexão com o banco de dados.'
    }
  }

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

        <CouponsClient initialCoupons={coupons} />
      </div>

      {dbError && (
        <div className="flex items-start gap-4 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">{dbError}</p>
            <p className="text-xs mt-1 text-amber-400/70">
              Rode <code className="bg-black/30 px-1 py-0.5 rounded">pnpm db:migrate</code> no servidor para aplicar as migrações pendentes.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
