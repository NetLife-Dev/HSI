'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, ChevronRight, MapPin, Users, Star, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const BookingCalendarSection = () => {
  const router = useRouter()
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })

  useEffect(() => {
    const fetchProps = async () => {
      try {
        const res = await fetch('/api/properties/featured')
        const data = await res.json()
        if (data.success && data.properties.length > 0) {
          setProperties(data.properties)
          setActiveTab(data.properties[0].id)
        }
      } catch (err) {
        console.error('Error fetching calendar properties:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProps()
  }, [])

  const activeProp = properties.find(p => p.id === activeTab)

  const handleBooking = () => {
    if (!activeProp || !date?.from || !date?.to) return
    
    const fromStr = format(date.from, 'yyyy-MM-dd')
    const toStr = format(date.to, 'yyyy-MM-dd')
    
    router.push(`/imovel/${activeProp.slug}?from=${fromStr}&to=${toStr}`)
  }

  if (loading || !activeTab) return null

  return (
    <section className="relative py-24 bg-black overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Side: Text & Tabs */}
          <div className="lg:sticky lg:top-32 space-y-10">
            <div className="space-y-4">
              <span className="text-accent uppercase tracking-[0.4em] font-black text-[10px] block mb-2">Disponibilidade Instantânea</span>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight text-white font-display">
                Garanta Seu <span className="text-accent italic">Lugar</span> <br /> no Paraíso.
              </h2>
              <p className="text-white/40 font-medium max-w-md">
                Escolha seu santuário e verifique as datas disponíveis em tempo real. Reservas diretas com transparência absoluta.
              </p>
            </div>

            {/* Property Tabs */}
            <div className="flex flex-col gap-3">
              {properties.map((prop) => (
                <button
                  key={prop.id}
                  onClick={() => setActiveTab(prop.id)}
                  className={cn(
                    "flex items-center justify-between p-6 rounded-3xl border transition-all duration-500 text-left group overflow-hidden relative",
                    activeTab === prop.id 
                      ? "bg-white/5 border-accent/40 shadow-xl shadow-accent/5 translate-x-4" 
                      : "bg-transparent border-white/5 hover:border-white/20"
                  )}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      activeTab === prop.id ? "bg-accent" : "bg-white/20"
                    )} />
                    <div>
                      <h4 className={cn(
                        "font-black uppercase tracking-tight text-lg",
                        activeTab === prop.id ? "text-white" : "text-white/40"
                      )}>{prop.name}</h4>
                      <p className="text-white/20 text-xs font-bold uppercase tracking-widest">{prop.locationAddress?.split(',')[0]}</p>
                    </div>
                  </div>
                  <ChevronRight className={cn(
                    "w-5 h-5 transition-all relative z-10",
                    activeTab === prop.id ? "text-accent translate-x-0 opacity-100" : "text-white/0 -translate-x-4 opacity-0"
                  )} />

                  {activeTab === prop.id && (
                    <motion.div 
                      layoutId="tabBackground"
                      className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent pointer-events-none"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: Visual Calendar Selection */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.4 }}
                className="relative bg-[#080808] rounded-[3.5rem] p-4 lg:p-10 border border-white/5 overflow-hidden"
              >
                {/* Header Info */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6 px-4">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black uppercase tracking-tight text-white">{activeProp?.name}</h3>
                    <div className="flex items-center gap-4 text-white/40 text-[10px] font-black uppercase tracking-widest">
                       <span className="flex items-center gap-1.5"><MapPin size={12} className="text-accent" /> {activeProp?.locationAddress?.split(',')[0]}</span>
                       <span className="flex items-center gap-1.5"><Users size={12} className="text-accent" /> {activeProp?.maxGuests} Hóspedes</span>
                    </div>
                  </div>
                  <div className="bg-accent/10 border border-accent/20 rounded-2xl px-6 py-4 flex flex-col items-end">
                     <span className="text-accent text-2xl font-black tracking-tighter leading-none">
                        {activeProp ? (activeProp.basePrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '---'}
                     </span>
                     <span className="text-[8rem] opacity-0 absolute">...</span> {/* Spacer */}
                     <span className="text-[8px] uppercase tracking-widest font-black text-white/30 mt-1">por noite</span>
                  </div>
                </div>

                {/* The Interactive Calendar */}
                <div className="relative z-10 w-full overflow-hidden mb-10">
                  <Calendar
                    mode="range"
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={1}
                    disabled={{ before: new Date() }}
                    locale={ptBR}
                    className="w-full h-full"
                  />
                </div>

                {/* Footer Info & Action */}
                <div className="space-y-6 px-4">
                  <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-black tracking-widest text-white/30">Data Selecionada</p>
                      <p className="text-sm font-bold text-white uppercase italic">
                        {date?.from ? (
                          <>
                            {format(date.from, "dd MMM", { locale: ptBR })}
                            {date.to && ` — ${format(date.to, "dd MMM", { locale: ptBR })}`}
                          </>
                        ) : (
                          "Selecione um período"
                        )}
                      </p>
                    </div>
                    <AnimatePresence>
                      {date?.from && date?.to && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-black"
                        >
                          <Star className="w-6 h-6 fill-black" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Button 
                    disabled={!date?.from || !date?.to}
                    onClick={handleBooking}
                    className="w-full rounded-[2rem] py-8 bg-white text-black hover:bg-accent text-sm font-black uppercase tracking-[0.3em] transition-all disabled:opacity-20 disabled:grayscale group shadow-2xl shadow-accent/10"
                  >
                    Confirmar Estadia Exclusive
                    <ArrowRight className="ml-4 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </Button>
                  
                  <p className="text-center text-white/20 text-[9px] uppercase font-black tracking-widest pt-2">
                    Reserva Direta — Menor Valor Garantido
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  )
}
