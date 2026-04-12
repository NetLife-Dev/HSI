'use client'

import React, { useState } from 'react'
import { DateRange } from 'react-day-picker'
import { Calendar as CalendarIcon, ShieldCheck, Info, Sparkles, Smartphone, Send, Zap, Users } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter, useSearchParams } from 'next/navigation'
import { calculateBookingPrice, type BookingPriceBreakdown } from '@/actions/bookings'

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
  const searchParams = useSearchParams()
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [guests, setGuests] = useState(1)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [priceBreakdown, setPriceBreakdown] = useState<BookingPriceBreakdown | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Sync dates from URL query params
  React.useEffect(() => {
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    
    if (from && to) {
      try {
        const fromDate = parseISO(from)
        const toDate = parseISO(to)
        if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
          setDateRange({ from: fromDate, to: toDate })
          // Smooth scroll to booking section
          setTimeout(() => {
            const el = document.getElementById('booking')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
          }, 800)
        }
      } catch (e) {
        console.error("Invalid dates in URL", e)
      }
    }
  }, [searchParams])

  React.useEffect(() => {
    const updatePrice = async () => {
      if (dateRange?.from && dateRange?.to && property.id) {
        setIsCalculating(true)
        try {
          const breakdown = await calculateBookingPrice(
            property.id,
            dateRange.from,
            dateRange.to
          )
          setPriceBreakdown(breakdown)
        } catch (err) {
          console.error("Failed to calculate price:", err)
        } finally {
          setIsCalculating(false)
        }
      } else {
        setPriceBreakdown(null)
      }
    }
    updatePrice()
  }, [dateRange, property.id])

  const nights = dateRange?.from && dateRange?.to 
    ? Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const basePrice = priceBreakdown ? priceBreakdown.pricePerNight : (property.basePrice || 0)
  const cleaningFee = priceBreakdown ? priceBreakdown.cleaningFee : (property.cleaningFee || 15000)
  
  const selectedServices = (property.services || []).filter((s: any) => selectedServiceIds.includes(s.id))
  const servicesTotal = selectedServices.reduce((acc: number, s: any) => {
    if (s.unit === 'per_day' || s.unit === 'per_night') return acc + (s.price * nights)
    if (s.unit === 'per_guest') return acc + (s.price * guests)
    return acc + s.price
  }, 0)

  const totalNightsPrice = priceBreakdown ? priceBreakdown.totalNightsPrice : nights * basePrice
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
                <DialogContent className="bg-[#111] border-white/10 text-white rounded-t-[2.5rem] sm:rounded-[3.5rem] p-0 overflow-hidden sm:max-w-md border shadow-[0_0_100px_rgba(224,176,80,0.15)] bottom-0 sm:bottom-auto translate-y-0 sm:-translate-y-1/2">
                   <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">
                      <DialogHeader>
                        <DialogTitle className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-center">Datas da Estadia</DialogTitle>
                      </DialogHeader>
                      <AvailabilityCalendar initialRange={dateRange} onRangeSelect={(r) => {
                        setDateRange(r)
                        if (r?.from && r?.to && r.from.getTime() !== r.to.getTime()) {
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
              {nights === 0 ? 'Selecionar Datas' : 'Garantir Estadia'}
            </Button>

            {nights > 0 && (
              <div className={cn("pt-8 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-4", isCalculating && "opacity-50 pointer-events-none")}>
                 <div className="flex justify-between items-center text-[13px] font-medium">
                    <span className="text-white/40">{nights} {nights === 1 ? 'noite' : 'noites'} {priceBreakdown && <span className="text-[10px] ml-1">(valor dinâmico)</span>}</span>
                    <span className="text-white">{(totalNightsPrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                 </div>
                 {priceBreakdown?.discounts.map((discount, i) => (
                    <div key={i} className="flex justify-between items-center text-[13px] font-medium text-emerald-400">
                      <span className="opacity-80">{discount.name}</span>
                      <span>-{(discount.amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                 ))}
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
                    <div className="flex flex-col">
                       <span className="text-[10px] uppercase font-black tracking-widest text-white/60">Total Final</span>
                       {isCalculating && <span className="text-[8px] text-accent animate-pulse uppercase font-bold">Calculando melhor tarifa...</span>}
                    </div>
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

      {/* Mobile Floating Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] p-4 bg-black/60 backdrop-blur-xl border-t border-white/10 animate-in slide-in-from-bottom-full duration-500">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black text-white/40 tracking-widest">Total</span>
            <p className="text-xl font-black text-accent tracking-tighter">
              {totalPrice > 0 
                ? (totalPrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : (basePrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + '/noite'
              }
            </p>
          </div>
          <Button 
            onClick={() => {
              if (nights === 0) {
                setIsCalendarOpen(true)
              } else if (dateRange?.from && dateRange?.to) {
                const servicesQuery = selectedServiceIds.length > 0 ? `&services=${selectedServiceIds.join(',')}` : ''
                router.push(`/checkout/${property.slug}?checkin=${format(dateRange.from, 'yyyy-MM-dd')}&checkout=${format(dateRange.to, 'yyyy-MM-dd')}&guests=${guests}${servicesQuery}`)
              }
            }}
            className="flex-1 rounded-2xl py-6 bg-accent text-black font-black uppercase tracking-widest shadow-lg shadow-accent/20"
          >
            {nights === 0 ? 'Datas' : 'Reservar'}
          </Button>
        </div>
      </div>
    </div>
  )
}

