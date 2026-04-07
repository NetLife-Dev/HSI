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
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])

  const nights = dateRange?.from && dateRange?.to 
    ? Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const basePrice = property.basePrice || 85000 // fallback mock
  const cleaningFee = property.cleaningFee || 15000
  
  const selectedServices = (property.services || []).filter((s: any) => selectedServiceIds.includes(s.id))
  const servicesTotal = selectedServices.reduce((acc: number, s: any) => {
    if (s.unit === 'per_day') return acc + (s.price * nights)
    if (s.unit === 'per_guest') return acc + (s.price * guests)
    return acc + s.price
  }, 0)

  // Basic Pricing Logic
  const totalNightsPrice = nights * basePrice
  const totalPrice = nights > 0 ? totalNightsPrice + cleaningFee + servicesTotal : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative items-start">
      {/* Left: Description & Services */}
      <div className="space-y-16">
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-accent rounded-full" />
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white">A Experiência</h2>
          </div>
          <div 
            className="prose prose-invert prose-lg max-w-none text-white/60 leading-relaxed font-medium"
            dangerouslySetInnerHTML={{ __html: property.description || '' }}
          />
        </section>

        {/* Calendário de Disponibilidade */}
        <section className="space-y-6 flex flex-col">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-accent rounded-full" />
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">Disponibilidade</h2>
          </div>
          <div className="rounded-[2.5rem] border border-white/10 bg-[#151515] p-6 shadow-2xl">
            <AvailabilityCalendar onRangeSelect={setDateRange} />
          </div>
        </section>

        <section className="space-y-8 p-8 md:p-12 bg-[#151515] rounded-[3rem] border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <Sparkles size={120} className="text-accent" />
          </div>
          <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
            <Info size={24} className="text-accent" />
            Comodidades
          </h3>
          <div className="grid grid-cols-2 gap-y-8 gap-x-6">
            {['Ar Condicionado', 'Piscina Privada', 'Wi-Fi Gigante', 'Heliponto', 'Chef Privado', 'Automação'].map((item) => (
              <div key={item} className="flex items-center gap-3 group/item cursor-default">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover/item:bg-accent group-hover/item:text-black group-hover/item:border-accent transition-all shadow-sm">
                  <ShieldCheck size={16} />
                </div>
                <span className="font-bold text-sm text-white/80 tracking-tight">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Regras</h3>
          <p className="text-white/50 leading-relaxed italic border-l-4 border-accent pl-6 py-2">
            {property.rules || 'O proprietário ainda não definiu regras específicas. Por favor, trate este patrimônio como se fosse seu.'}
          </p>
        </section>
      </div>

      {/* Right: Booking Sidebar Sticky */}
      <aside className="sticky top-32">
        <Card className="rounded-[2.5rem] bg-[#1a1a1a] border-white/10 shadow-2xl transition-all hover:shadow-accent/5 border group">
          <CardContent className="p-8 md:p-10 space-y-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-8">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-accent tracking-[0.2em] mb-2">Base por noite</span>
                <p className="text-4xl md:text-5xl font-black text-white leading-none tracking-tighter">
                  {(basePrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                  <span className="text-sm font-medium text-white/40">/noite</span>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className={cn("rounded-2xl p-4 bg-black/40 border border-white/5 flex flex-col gap-2 transition-colors relative overflow-hidden", dateRange?.from ? 'border-accent/50' : 'cursor-pointer')}>
                  {dateRange?.from && <div className="absolute inset-0 bg-accent/5" />}
                  <span className="text-[9px] uppercase font-black tracking-widest text-white/40 relative z-10">Check-In</span>
                  <span className={cn("text-sm font-bold flex items-center gap-2 relative z-10", dateRange?.from ? 'text-accent' : 'text-white')}>
                    <Calendar size={14} className={dateRange?.from ? 'text-accent' : 'text-white/40'} />
                    {dateRange?.from ? format(dateRange.from, 'dd/MM/yyyy') : 'Adicionar'}
                  </span>
                </div>
                <div className={cn("rounded-2xl p-4 bg-black/40 border border-white/5 flex flex-col gap-2 transition-colors relative overflow-hidden", dateRange?.to ? 'border-accent/50' : 'cursor-pointer')}>
                  {dateRange?.to && <div className="absolute inset-0 bg-accent/5" />}
                  <span className="text-[9px] uppercase font-black tracking-widest text-white/40 relative z-10">Check-Out</span>
                  <span className={cn("text-sm font-bold flex items-center gap-2 relative z-10", dateRange?.to ? 'text-accent' : 'text-white')}>
                    <Calendar size={14} className={dateRange?.to ? 'text-accent' : 'text-white/40'} />
                    {dateRange?.to ? format(dateRange.to, 'dd/MM/yyyy') : 'Adicionar'}
                  </span>
                </div>
              </div>
              <div className="rounded-2xl p-4 bg-black/40 border border-white/5 flex items-center justify-between relative focus-within:ring-1 ring-accent">
                <div className="flex flex-col gap-2 w-full">
                  <span className="text-[9px] uppercase font-black tracking-widest text-white/40">Hóspedes</span>
                  <select 
                    value={guests} 
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="bg-transparent text-sm font-bold text-white w-full appearance-none outline-none cursor-pointer"
                  >
                    {Array.from({ length: property.maxGuests || 1 }).map((_, i) => (
                      <option key={i + 1} value={i + 1} className="bg-[#111]">{i + 1} Hóspede{i > 0 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <Users size={16} className="text-white/40 pointer-events-none" />
              </div>

              {/* Serviços Concierge */}
              {property.services && property.services.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <span className="text-[9px] uppercase font-black tracking-[0.2em] text-accent/60">Serviços Exclusivos</span>
                  <div className="grid grid-cols-1 gap-2">
                    {property.services.map((service: any) => (
                      <div 
                        key={service.id}
                        onClick={() => {
                          const isSelected = selectedServiceIds.includes(service.id)
                          if (isSelected) {
                            setSelectedServiceIds(selectedServiceIds.filter(id => id !== service.id))
                          } else {
                            setSelectedServiceIds([...selectedServiceIds, service.id])
                          }
                        }}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
                          selectedServiceIds.includes(service.id) 
                            ? 'bg-accent/10 border-accent/40 shadow-[0_0_10px_rgba(224,176,80,0.1)]' 
                            : 'bg-black/20 border-white/5 hover:border-white/20'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                            selectedServiceIds.includes(service.id) ? 'bg-accent border-accent' : 'border-white/20'
                          )}>
                            {selectedServiceIds.includes(service.id) && <Zap size={10} className="text-black fill-current" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{service.name}</p>
                            <p className="text-[9px] text-white/40">{service.unit === 'per_day' ? '+ R$ ' + (service.price/100) + '/dia' : '+ R$ ' + (service.price/100)}</p>
                          </div>
                        </div>
                        <Sparkles size={12} className={cn(selectedServiceIds.includes(service.id) ? 'text-accent' : 'text-white/10')} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button 
              disabled={nights === 0}
              onClick={() => {
                 if (dateRange?.from && dateRange?.to) {
                    const servicesQuery = selectedServiceIds.length > 0 ? `&services=${selectedServiceIds.join(',')}` : ''
                    router.push(`/checkout/${property.slug}?checkin=${format(dateRange.from, 'yyyy-MM-dd')}&checkout=${format(dateRange.to, 'yyyy-MM-dd')}&guests=${guests}${servicesQuery}`)
                 }
              }}
              className="w-full py-8 rounded-3xl text-xl font-black uppercase tracking-widest shadow-2xl shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none bg-accent hover:bg-white text-black"
            >
              {nights === 0 ? 'Selecione Datas' : 'Comprar Agora'}
            </Button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-white/30 uppercase font-black tracking-[0.2em]">
              <Zap size={10} className="fill-white/30" />
              Reserva Direta Garantida
            </div>

            {nights > 0 && (
              <div className="pt-8 border-t border-white/10 space-y-4 animate-slide-up">
                 <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-white/60">{nights} {nights === 1 ? 'noite' : 'noites'}</span>
                    <span className="text-white">{(totalNightsPrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-white/60">Taxa de Limpeza</span>
                    <span className="text-white">{(cleaningFee / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                 </div>
                 {servicesTotal > 0 && (
                    <div className="flex justify-between items-center text-sm font-medium animate-in fade-in zoom-in-95">
                      <span className="text-white/60">Serviços Concierge</span>
                      <span className="text-white">{(servicesTotal / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  )}
                 <Separator className="bg-white/10 my-4" />
                 <div className="flex justify-between items-center">
                    <span className="text-xs uppercase font-black tracking-[0.2em] text-white">Total</span>
                    <span className="text-3xl font-black text-accent">
                       {(totalPrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                 </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Direct Support Card */}
        <div className="mt-8 bg-[#151515] rounded-[2.5rem] p-8 text-white space-y-4 relative overflow-hidden border border-white/10">
          <div className="absolute inset-0 bg-accent/5 scale-150 blur-3xl opacity-20 pointer-events-none" />
          <div className="flex items-center gap-3">
            <Smartphone size={20} className="text-accent" />
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
