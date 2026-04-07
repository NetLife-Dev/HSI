'use client'

import React, { useState } from 'react'
import { DateRange } from 'react-day-picker'
import { Calendar as CalendarIcon, ShieldCheck, Info, Sparkles, Smartphone, Send, Zap, Users } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'
import { AvailabilityCalendar } from './AvailabilityCalendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function PropertyBookingEngine({ property }: { property: any }) {
  const router = useRouter()
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [guests, setGuests] = useState(1)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const nights = dateRange?.from && dateRange?.to 
    ? Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const basePrice = property.basePrice || 85000 
  const cleaningFee = property.cleaningFee || 15000
  
  const selectedServices = (property.services || []).filter((s: any) => selectedServiceIds.includes(s.id))
  const servicesTotal = selectedServices.reduce((acc: number, s: any) => {
    if (s.unit === 'per_day') return acc + (s.price * nights)
    if (s.unit === 'per_guest') return acc + (s.price * guests)
    return acc + s.price
  }, 0)

  const totalNightsPrice = nights * basePrice
  const totalPrice = nights > 0 ? totalNightsPrice + cleaningFee + servicesTotal : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative items-start">
      {/* Left: Description & Info */}
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
          <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Regras da Casa</h3>
          <p className="text-white/50 leading-relaxed italic border-l-4 border-accent pl-6 py-2">
            {property.rules || 'Trate este patrimônio com o respeito que ele merece.'}
          </p>
        </section>
      </div>

      {/* Right: Booking Sidebar Sticky */}
      <aside className="sticky top-32">
        <Card className="rounded-[2.5rem] bg-[#1a1a1a] border-white/10 shadow-2xl transition-all hover:shadow-accent/5 border group">
          <CardContent className="p-8 md:p-10 space-y-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-8">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-accent tracking-[0.2em] mb-2">Investimento por noite</span>
                <p className="text-4xl md:text-5xl font-black text-white leading-none tracking-tighter">
                  {(basePrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                  <span className="text-sm font-medium text-white/40">/noite</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Calendário Flutuante Trigger */}
              <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <DialogTrigger asChild>
                  <div className="grid grid-cols-2 gap-3 cursor-pointer group/dates">
                    <div className={cn("rounded-2xl p-4 bg-black/40 border border-white/5 flex flex-col gap-2 transition-all hover:border-accent/40", dateRange?.from ? 'border-accent/30' : '')}>
                      <span className="text-[9px] uppercase font-black tracking-widest text-white/40">Check-In</span>
                      <span className={cn("text-sm font-bold flex items-center gap-2", dateRange?.from ? 'text-accent' : 'text-white/60')}>
                        <CalendarIcon size={14} className={dateRange?.from ? 'text-accent' : 'text-white/20'} />
                        {dateRange?.from ? format(dateRange.from, 'dd/MM/yyyy') : 'Escolher'}
                      </span>
                    </div>
                    <div className={cn("rounded-2xl p-4 bg-black/40 border border-white/5 flex flex-col gap-2 transition-all hover:border-accent/40", dateRange?.to ? 'border-accent/30' : '')}>
                      <span className="text-[9px] uppercase font-black tracking-widest text-white/40">Check-Out</span>
                      <span className={cn("text-sm font-bold flex items-center gap-2", dateRange?.to ? 'text-accent' : 'text-white/60')}>
                        <CalendarIcon size={14} className={dateRange?.to ? 'text-accent' : 'text-white/20'} />
                        {dateRange?.to ? format(dateRange.to, 'dd/MM/yyyy') : 'Escolher'}
                      </span>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="bg-[#111] border-white/10 text-white rounded-[3rem] p-0 overflow-hidden max-w-sm border shadow-[0_0_80px_rgba(224,176,80,0.15)]">
                   <div className="p-8 space-y-6">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-center">Datas da Estadia</DialogTitle>
                      </DialogHeader>
                      <AvailabilityCalendar onRangeSelect={(r) => {
                        setDateRange(r)
                        if (r?.from && r?.to) {
                          setTimeout(() => setIsCalendarOpen(false), 800)
                        }
                      }} />
                   </div>
                </DialogContent>
              </Dialog>

              <div className="rounded-2xl p-4 bg-black/40 border border-white/5 flex items-center justify-between relative">
                <div className="flex flex-col gap-2 w-full">
                  <span className="text-[9px] uppercase font-black tracking-widest text-white/40">Número de Hóspedes</span>
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
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <span className="text-[9px] uppercase font-black tracking-[0.2em] text-accent/60">Serviços Concierge</span>
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
                            ? 'bg-accent/10 border-accent/40 shadow-inner' 
                            : 'bg-black/20 border-white/5 hover:border-white/20'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                            selectedServiceIds.includes(service.id) ? 'bg-accent border-accent text-black' : 'border-white/20'
                          )}>
                            {selectedServiceIds.includes(service.id) && <Zap size={10} className="fill-current" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{service.name}</p>
                            <p className="text-[9px] text-white/40">
                              {service.unit === 'per_day' ? `+ R$ ${(service.price/100)}/dia` : `+ R$ ${(service.price/100)}`}
                            </p>
                          </div>
                        </div>
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
              className="w-full py-8 rounded-3xl text-xl font-black uppercase tracking-widest shadow-2xl shadow-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all bg-accent hover:bg-white text-black disabled:opacity-50"
            >
              {nights === 0 ? 'Datas Indisponíveis' : 'Comprar Agora'}
            </Button>

            {nights > 0 && (
              <div className="pt-8 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-4">
                 <div className="flex justify-between items-center text-[13px] font-medium">
                    <span className="text-white/40">{nights} {nights === 1 ? 'noite' : 'noites'}</span>
                    <span className="text-white">{(totalNightsPrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                 </div>
                 <div className="flex justify-between items-center text-[13px] font-medium">
                    <span className="text-white/40">Taxa de Limpeza</span>
                    <span className="text-white">{(cleaningFee / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                 </div>
                 {servicesTotal > 0 && (
                    <div className="flex justify-between items-center text-[13px] font-medium">
                      <span className="text-white/40">Serviços Adicionais</span>
                      <span className="text-white">{(servicesTotal / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  )}
                 <Separator className="bg-white/5 my-4" />
                 <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] uppercase font-black tracking-widest text-white/60">Total Final</span>
                    <span className="text-3xl font-black text-accent tracking-tighter">
                       {(totalPrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                 </div>
              </div>
            )}
            
            <div className="pt-4 flex items-center justify-center gap-2 text-[10px] text-white/20 uppercase font-black tracking-widest">
               <ShieldCheck size={12} /> Reserva 100% Protegida
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 bg-[#151515] rounded-[2.5rem] p-6 text-white space-y-4 border border-white/5">
          <Button variant="outline" className="w-full rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white border-0 py-6 font-bold flex items-center gap-2">
            <Send size={16} /> Suporte via WhatsApp
          </Button>
        </div>
      </aside>
    </div>
  )
}
