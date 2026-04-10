'use client'

import React, { useState } from 'react'
import { Plus, X, Calendar, DollarSign, Flame, Snowflake, Star, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface SeasonalPrice {
  id: string
  name: string
  startDate: string
  endDate: string
  pricePerNight: number
}

interface SeasonalPricingManagerProps {
  propertyId: string
  initialPricing?: SeasonalPrice[]
}

const SEASON_ICONS: Record<string, any> = {
  'Réveillon': Flame,
  'Natal': Snowflake,
  'Carnaval': Star,
  'Feriado': Zap,
  'Temporada': Calendar,
}

export function SeasonalPricingManager({ propertyId, initialPricing = [] }: SeasonalPricingManagerProps) {
  const [pricing, setPricing] = useState<SeasonalPrice[]>(initialPricing)
  const [isAdding, setIsAdding] = useState(false)
  const [newSeason, setNewSeason] = useState<Partial<SeasonalPrice>>({
    name: '',
    startDate: '',
    endDate: '',
    pricePerNight: 0
  })

  const handleAdd = () => {
    if (!newSeason.name || !newSeason.startDate || !newSeason.endDate || !newSeason.pricePerNight) {
      toast.error('Preencha todos os campos da temporada.')
      return
    }

    const season: SeasonalPrice = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSeason.name,
      startDate: newSeason.startDate,
      endDate: newSeason.endDate,
      pricePerNight: newSeason.pricePerNight
    }

    setPricing([...pricing, season])
    setIsAdding(false)
    setNewSeason({ name: '', startDate: '', endDate: '', pricePerNight: 0 })
    toast.success('Temporada adicionada!')
  }

  const handleRemove = (id: string) => {
    setPricing(pricing.filter(p => p.id !== id))
    toast.info('Temporada removida.')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-accent rounded-full" />
          <h3 className="text-xl font-black uppercase tracking-tighter text-white">Temporadas Especiais</h3>
        </div>
        {!isAdding && (
          <Button 
            onClick={() => setIsAdding(true)}
            variant="ghost" 
            className="text-accent hover:bg-accent/10 rounded-xl font-black uppercase tracking-widest text-[10px]"
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Adicionar Período
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="p-6 bg-accent/5 border border-accent/20 rounded-[2rem] space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Identificação</label>
               <Input 
                 placeholder="Ex: Réveillon 2025" 
                 value={newSeason.name}
                 onChange={e => setNewSeason({ ...newSeason, name: e.target.value })}
                 className="bg-zinc-950 border-white/5 rounded-xl h-12" 
               />
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Preço p/ Noite (R$)</label>
               <Input 
                 type="number" 
                 placeholder="0,00" 
                 value={newSeason.pricePerNight || ''}
                 onChange={e => setNewSeason({ ...newSeason, pricePerNight: Number(e.target.value) })}
                 className="bg-zinc-950 border-white/5 rounded-xl h-12 font-black text-accent" 
               />
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Início</label>
               <div className="relative">
                 <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                 <Input 
                   type="date" 
                   value={newSeason.startDate}
                   onChange={e => setNewSeason({ ...newSeason, startDate: e.target.value })}
                   className="pl-10 bg-zinc-950 border-white/5 rounded-xl h-12" 
                 />
               </div>
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Término</label>
               <div className="relative">
                 <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                 <Input 
                   type="date" 
                   value={newSeason.endDate}
                   onChange={e => setNewSeason({ ...newSeason, endDate: e.target.value })}
                   className="pl-10 bg-zinc-950 border-white/5 rounded-xl h-12" 
                 />
               </div>
             </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
             <Button variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl text-white/40">Cancelar</Button>
             <Button onClick={handleAdd} className="bg-accent hover:bg-white text-black font-black rounded-xl px-6">Salvar Período</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pricing.length === 0 && !isAdding && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[2rem] text-white/20 space-y-2">
            <Calendar size={48} className="opacity-10" />
            <p className="text-sm font-medium uppercase tracking-widest text-center">Nenhuma temporada configurada<br/><span className="text-[10px] opacity-50">Preços padrão serão aplicados</span></p>
          </div>
        )}
        {pricing.map((item) => {
          const IconComponent = SEASON_ICONS[item.name as string] || Calendar
          return (
            <div key={item.id} className="group relative p-6 bg-[#18181B] border border-white/5 rounded-[2rem] hover:border-accent/20 transition-all hover:bg-[#1A1A1E]">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                     <IconComponent size={20} />
                   </div>
                   <div className="space-y-1">
                     <h4 className="font-black uppercase tracking-tighter text-white group-hover:text-accent transition-colors">{item.name}</h4>
                     <p className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1">
                        {item.startDate} — {item.endDate}
                     </p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-lg font-black text-white leading-none">
                     {(item.pricePerNight / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                   </p>
                   <span className="text-[9px] font-black uppercase tracking-widest text-accent/60">por noite</span>
                </div>
              </div>
              
              <button 
                onClick={() => handleRemove(item.id)}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-white/20 hover:text-red-500 hover:border-red-500/30 opacity-0 group-hover:opacity-100 transition-all shadow-xl"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
