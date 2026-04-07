'use client'

import React, { useState } from 'react'
import { DateRange } from 'react-day-picker'
import { Calendar, ShieldCheck, Info, Sparkles, Smartphone, Send, Zap, Users } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'
import { AvailabilityCalendar } from './AvailabilityCalendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export function PropertyBookingEngine({ property }: { property: any }) {
  const router = useRouter()
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [guests, setGuests] = useState(1)

  const nights = dateRange?.from && dateRange?.to 
    ? Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const basePrice = property.basePrice || 85000 // fallback mock
  const cleaningFee = property.cleaningFee || 15000
  
  // Basic Pricing Logic
  const totalNightsPrice = nights * basePrice
  const totalPrice = nights > 0 ? totalNightsPrice + cleaningFee : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 relative items-start">
      {/* Left: Description & Services */}
      <div className="lg:col-span-2 space-y-16">
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-primary rounded-full" />
            <h2 className="text-2xl font-bold tracking-tight">Experiência Única</h2>
          </div>
          <div 
            className="prose prose-slate prose-lg max-w-none text-slate-600 leading-loose"
            dangerouslySetInnerHTML={{ __html: property.description || '' }}
          />
        </section>

        {/* Calendário de Disponibilidade */}
        <section className="space-y-6 flex flex-col">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-primary rounded-full" />
            <h2 className="text-2xl font-bold tracking-tight">Datas Disponíveis</h2>
          </div>
          <AvailabilityCalendar onRangeSelect={setDateRange} />
        </section>

        <section className="space-y-8 p-12 bg-slate-50 rounded-[3rem] border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <Sparkles size={120} className="text-primary" />
          </div>
          <h3 className="text-xl font-bold flex items-center gap-3">
            <Info size={20} className="text-primary" />
            Comodidades & Amenidades
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-6">
            {['Ar Condicionado', 'Piscina Privada', 'Wi-Fi 500mbps', 'Estacionamento', 'Churrasqueira', 'Cozinha Gourmet'].map((item) => (
              <div key={item} className="flex items-center gap-3 group/item">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover/item:bg-primary group-hover/item:text-white transition-all shadow-sm">
                  <ShieldCheck size={14} />
                </div>
                <span className="font-bold text-sm text-slate-700 tracking-tight">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-xl font-bold">Regras da Hospedagem</h3>
          <p className="text-slate-500 leading-relaxed italic border-l-4 border-slate-200 pl-6 py-2">
            {property.rules || 'O proprietário ainda não definiu regras específicas. Por favor, trate este patrimônio como se fosse seu.'}
          </p>
        </section>
      </div>

      {/* Right: Booking Sidebar Sticky */}
      <aside className="sticky top-32 space-y-6">
        <Card className="rounded-[2.5rem] p-4 border-slate-100 shadow-2xl shadow-slate-200 transition-all hover:shadow-primary/5 border-2 border-transparent hover:border-primary/5">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Base por noite</span>
                <p className="text-3xl font-black text-slate-900 leading-none">
                  {(basePrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                  <span className="text-sm font-medium text-slate-400">/noite</span>
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] border-emerald-500/20 text-emerald-600 bg-emerald-50 py-1">Sem taxas OTA</Badge>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className={cn("rounded-2xl p-4 bg-slate-50 border flex flex-col gap-1 transition-colors relative overflow-hidden", dateRange?.from ? 'border-primary/30' : 'border-slate-100 cursor-pointer')}>
                  {dateRange?.from && <div className="absolute inset-0 bg-primary/5" />}
                  <span className="text-[9px] uppercase font-bold text-slate-500 relative z-10">Check-In</span>
                  <span className={cn("text-xs font-bold flex items-center gap-2 relative z-10", dateRange?.from ? 'text-primary' : 'text-slate-900')}>
                    <Calendar size={12} className={dateRange?.from ? 'text-primary' : 'text-slate-400'} />
                    {dateRange?.from ? format(dateRange.from, 'dd/MM/yyyy') : 'Adicionar'}
                  </span>
                </div>
                <div className={cn("rounded-2xl p-4 bg-slate-50 border flex flex-col gap-1 transition-colors relative overflow-hidden", dateRange?.to ? 'border-primary/30' : 'border-slate-100 cursor-pointer')}>
                  {dateRange?.to && <div className="absolute inset-0 bg-primary/5" />}
                  <span className="text-[9px] uppercase font-bold text-slate-500 relative z-10">Check-Out</span>
                  <span className={cn("text-xs font-bold flex items-center gap-2 relative z-10", dateRange?.to ? 'text-primary' : 'text-slate-900')}>
                    <Calendar size={12} className={dateRange?.to ? 'text-primary' : 'text-slate-400'} />
                    {dateRange?.to ? format(dateRange.to, 'dd/MM/yyyy') : 'Adicionar'}
                  </span>
                </div>
              </div>
              <div className="rounded-2xl p-4 bg-slate-50 border border-slate-100 flex items-center justify-between relative focus-within:ring-2 ring-primary/20">
                <div className="flex flex-col gap-1 w-full">
                  <span className="text-[9px] uppercase font-bold text-slate-500">Hóspedes</span>
                  <select 
                    value={guests} 
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="bg-transparent text-xs font-bold text-slate-900 w-full appearance-none outline-none cursor-pointer"
                  >
                    {Array.from({ length: property.maxGuests || 1 }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} Hóspede{i > 0 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <Users size={16} className="text-slate-400 pointer-events-none" />
              </div>
            </div>

            <Button 
              disabled={nights === 0}
              onClick={() => {
                 if (dateRange?.from && dateRange?.to) {
                    router.push(`/checkout/${property.slug}?checkin=${format(dateRange.from, 'yyyy-MM-dd')}&checkout=${format(dateRange.to, 'yyyy-MM-dd')}&guests=${guests}`)
                 }
              }}
              className="w-full py-8 rounded-3xl text-xl font-black tracking-tight shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {nights === 0 ? 'Selecione as Datas' : 'Reservar Agora'}
            </Button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 uppercase font-black tracking-[0.1em]">
              <Zap size={10} className="fill-slate-400" />
              Reserva Direta Garantida
            </div>

            {nights > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Separator className="bg-slate-100 my-6" />
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>{nights} {nights === 1 ? 'noite' : 'noites'} x {(basePrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    <span className="font-bold">{(totalNightsPrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600 pb-4 border-b border-dashed border-slate-200">
                    <span>Taxa de limpeza (Única)</span>
                    <span className="font-bold">{(cleaningFee / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  <div className="flex justify-between text-xl font-black text-slate-900 pt-2 items-center">
                    <span>Total</span>
                    <span className="text-primary decoration-primary/20">{(totalPrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Direct Support Card */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/20 scale-150 blur-3xl opacity-20 pointer-events-none" />
          <div className="flex items-center gap-3">
            <Smartphone size={20} className="text-primary group-hover:rotate-12 transition-transform" />
            <h4 className="font-bold">Dúvidas?</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">Fale com o proprietário antes de alugar.</p>
          <Button variant="outline" className="w-full rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white border-0 py-6 font-bold flex items-center gap-2 group/btn">
            <Send size={16} />
            Falar pelo WhatsApp
          </Button>
        </div>
      </aside>
    </div>
  )
}
