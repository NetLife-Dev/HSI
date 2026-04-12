'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, ChevronRight, MapPin, Users, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PROPERTIES = [
  {
    id: 'villa-ocean',
    name: 'Villa Ocean View',
    location: 'Litoral Norte, SP',
    price: 3200,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80',
    guests: '12 hóspedes'
  },
  {
    id: 'skylines',
    name: 'Cobertura Skyline',
    location: 'Goiânia, GO',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80',
    guests: '6 hóspedes'
  },
  {
    id: 'casa-lago',
    name: 'Casa do Lago',
    location: 'Interior, SP',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1449156059431-789955427ac1?auto=format&fit=crop&q=80',
    guests: '8 hóspedes'
  }
]

export const BookingCalendarSection = () => {
  const [activeTab, setActiveTab] = useState(PROPERTIES[0].id)
  const activeProp = PROPERTIES.find(p => p.id === activeTab)!

  return (
    <section className="relative py-24 bg-black overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Text & Tabs */}
          <div className="space-y-10">
            <div className="space-y-4">
              <span className="text-accent uppercase tracking-[0.4em] font-black text-[10px] block mb-2">Disponibilidade Instantânea</span>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight text-white">
                Garanta Seu <span className="text-accent italic">Lugar</span> <br /> no Paraíso.
              </h2>
              <p className="text-white/40 font-medium max-w-md">
                Escolha seu santuário e verifique as datas disponíveis em tempo real. Reservas diretas com 0% de taxas de plataforma.
              </p>
            </div>

            {/* Property Tabs */}
            <div className="flex flex-col gap-3">
              {PROPERTIES.map((prop) => (
                <button
                  key={prop.id}
                  onClick={() => setActiveTab(prop.id)}
                  className={cn(
                    "flex items-center justify-between p-6 rounded-3xl border transition-all duration-500 text-left group",
                    activeTab === prop.id 
                      ? "bg-white/5 border-accent/40 shadow-xl shadow-accent/5 translate-x-4" 
                      : "bg-transparent border-white/5 hover:border-white/20"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      activeTab === prop.id ? "bg-accent" : "bg-white/20"
                    )} />
                    <div>
                      <h4 className={cn(
                        "font-black uppercase tracking-tight text-lg",
                        activeTab === prop.id ? "text-white" : "text-white/40"
                      )}>{prop.name}</h4>
                      <p className="text-white/20 text-xs font-bold uppercase tracking-widest">{prop.location}</p>
                    </div>
                  </div>
                  <ChevronRight className={cn(
                    "w-5 h-5 transition-all",
                    activeTab === prop.id ? "text-accent translate-x-0 opacity-100" : "text-white/0 -translate-x-4 opacity-0"
                  )} />
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: Visual Calendar Preview */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, y: -20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative aspect-[4/5] md:aspect-square bg-[#0a0a0a] rounded-[3rem] p-8 border border-white/5 overflow-hidden shadow-2xl"
              >
                {/* Background Image with blur */}
                <div className="absolute inset-0 opacity-20 blur-2xl grayscale">
                   <img src={activeProp.image} className="w-full h-full object-cover" alt="" />
                </div>

                <div className="relative z-10 h-full flex flex-col">
                   <div className="flex items-start justify-between mb-8">
                      <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4">
                         <CalendarIcon className="w-8 h-8 text-accent" />
                      </div>
                      <div className="text-right">
                         <div className="flex items-center gap-1 justify-end mb-1">
                            <Star className="w-3 h-3 text-accent fill-accent" />
                            <Star className="w-3 h-3 text-accent fill-accent" />
                            <Star className="w-3 h-3 text-accent fill-accent" />
                            <Star className="w-3 h-3 text-accent fill-accent" />
                            <Star className="w-3 h-3 text-accent fill-accent" />
                         </div>
                         <p className="text-white font-black uppercase text-[10px] tracking-widest">Disponível em Abril</p>
                      </div>
                   </div>

                   <h3 className="text-4xl font-black uppercase tracking-tight text-white mb-2">{activeProp.name}</h3>
                   <div className="flex items-center gap-4 text-white/40 text-xs font-medium mb-12">
                      <span className="flex items-center gap-1"><MapPin size={12} className="text-accent" /> {activeProp.location}</span>
                      <span className="flex items-center gap-1"><Users size={12} className="text-accent" /> {activeProp.guests}</span>
                   </div>

                   {/* Simplified Calendar Visual */}
                   <div className="grid grid-cols-7 gap-3 py-6 border-y border-white/5">
                      {Array.from({ length: 28 }).map((_, i) => (
                        <div 
                           key={i} 
                           className={cn(
                             "aspect-square rounded-xl flex items-center justify-center text-[10px] font-black transition-all",
                             i === 12 || i === 13 || i === 14 
                               ? "bg-accent text-black scale-110 shadow-lg shadow-accent/20" 
                               : "bg-white/5 text-white/20"
                           )}
                        >
                           {i + 1}
                        </div>
                      ))}
                   </div>

                   <div className="mt-auto pt-8">
                      <p className="text-white/40 text-[10px] uppercase font-black tracking-[0.3em] mb-4 text-center">Iniciando em R$ {(activeProp.price).toLocaleString('pt-BR')} / noite</p>
                      <Button className="w-full rounded-2xl py-8 bg-white text-black hover:bg-accent text-sm font-black uppercase tracking-[0.2em] transition-all">
                        Selecionar Período
                      </Button>
                   </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  )
}
