'use client'

import React, { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Users,
  BedDouble,
  Bath,
  MapPin,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { PropertyBookingEngine } from '@/components/public/PropertyBookingEngine'
import { Badge } from '@/components/ui/badge'

export function PropertyContent({ property }: { property: any }) {
  if (!property) return null
  const images = property.images || []
  const heroImage = images[0]?.url || '/images/mock/exterior.png'
  
  return (
    <div className="bg-black mix-blend-normal overflow-hidden select-none text-white">
      {/* 1. HERO SECTION (100vh) */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Layer: Property Image */}
        <div className="absolute inset-0 z-0">
          {heroImage && (
            <Image
              src={heroImage}
              alt={property.name}
              fill
              className="object-cover opacity-60 grayscale scale-105"
              sizes="100vw"
              priority
            />
          )}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Immersion Layer: individual.mp4 behind lettering */}
        <div className="absolute inset-0 z-10 overflow-hidden">
           <video 
              autoPlay 
              muted 
              loop 
              playsInline 
              className="w-full h-full object-cover opacity-50 mix-blend-screen scale-110"
           >
              <source src="/images/individual.mp4" type="video/mp4" />
           </video>
           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
        </div>
        
        <div className="relative z-20 container mx-auto px-6 flex flex-col items-center justify-end h-full pb-24 text-center">
           <div className="flex items-center gap-1 text-accent font-bold text-sm tracking-[0.3em] uppercase mb-6 animate-slide-up">
              <Star size={16} fill="currentColor" />
              <span>Exclusivo</span>
           </div>
           
           <div className="relative group max-w-full">
              <h1
                className="text-5xl sm:text-7xl md:text-9xl tracking-tighter text-white uppercase leading-[0.85] drop-shadow-2xl animate-cinematic-zoom relative z-10 break-words"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontStyle: 'italic' }}
              >
                {property.name}
              </h1>
              {/* Subtle neon glow for the lettering */}
              <div className="absolute inset-0 blur-3xl bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
           </div>

           <p className="mt-8 text-lg md:text-2xl text-white/50 font-medium max-w-3xl animate-slide-up" style={{ animationDelay: '0.4s' }}>
              {property.locationAddress}
           </p>

           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center gap-2">
              <span className="text-[8px] uppercase tracking-[0.4em] font-black text-white/20">Deslize</span>
              <ChevronDown size={24} className="text-white/30" />
           </div>
        </div>
      </section>

      {/* 2. THE STORY / OVERVIEW BLOCK */}
      <section className="py-24 md:py-32 bg-black relative">
        <div className="container mx-auto px-6 max-w-6xl">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="space-y-8 order-2 lg:order-1">
                 <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white leading-none">
                    O Refúgio<br/><span className="text-accent">Perfeito.</span>
                 </h2>
                 <p className="text-lg text-white/60 leading-relaxed font-medium">
                    {property.description || "Você sempre soube que o convés estava armado contra você. Mas quando a oportunidade perfeita surge, você se encontra no lugar mais ensolarado do paraíso, no meio de um refúgio de luxo feito para quem não aceita menos que o topo."}
                 </p>
                 <div className="flex flex-col gap-6 pt-8 border-t border-white/10">
                    <div className="flex items-center gap-4">
                       <MapPin size={24} className="text-accent" />
                       <span className="text-lg md:text-xl font-bold uppercase tracking-widest">{property.locationAddress}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 md:gap-8">
                      <div>
                        <div className="text-2xl md:text-3xl font-black">{property.maxGuests}</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Hóspedes</div>
                      </div>
                      <div>
                        <div className="text-2xl md:text-3xl font-black">{property.bedrooms}</div>
                         <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Quartos</div>
                      </div>
                      <div>
                        <div className="text-2xl md:text-3xl font-black">{property.bathrooms}</div>
                         <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Banhos</div>
                      </div>
                    </div>
                 </div>
              </div>
              
              {/* Feature Image */}
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl md:rounded-sm group order-1 lg:order-2">

                 <Image
                   src={images[1]?.url || '/images/mock/bedroom.png'}
                   fill
                   className="object-cover group-hover:scale-105 transition-transform duration-1000 grayscale hover:grayscale-0"
                   alt="Interior"
                   sizes="(max-width: 768px) 100vw, 50vw"
                 />
              </div>
           </div>
        </div>
      </section>

      {/* 4. CINEMATIC FULL BLEED IMAGES WITH OVERLAYS (GTA ROLL EFFECT) */}
      {[
        { url: images[2]?.url || '/images/mock/living.png', text: 'Viva o Momento.' },
        { url: images[3]?.url || '/images/mock/outdoor.png', text: 'Sinta a Exclusividade.' }
      ].map((item, i) => (
         <section key={i} className="relative h-[90vh] w-full overflow-hidden">
            <motion.div 
               initial={{ scale: 1.2, y: 100 }}
               whileInView={{ scale: 1, y: 0 }}
               transition={{ duration: 1.5, ease: [0.33, 1, 0.68, 1] }}
               viewport={{ once: false, amount: 0.2 }}
               className="absolute inset-0 z-0"
            >
               <Image
                 src={item.url}
                 fill
                 className="object-cover opacity-70"
                 alt={`Highlight ${i + 1}`}
                 sizes="100vw"
               />
            </motion.div>
            
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent flex items-center z-10">
               <div className="container mx-auto px-4 max-w-6xl">
                  <motion.div
                     initial={{ x: -100, opacity: 0 }}
                     whileInView={{ x: 0, opacity: 1 }}
                     transition={{ duration: 1, delay: 0.3 }}
                     viewport={{ once: false }}
                  >
                     <h3
                        className="text-4xl sm:text-6xl md:text-8xl uppercase tracking-tighter text-white max-w-2xl leading-[0.85]"
                        style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontStyle: 'italic' }}
                     >
                        {item.text.split('.')[0]}.
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30">
                           {item.text.split('.')[1] || ''}
                        </span>
                     </h3>
                  </motion.div>
               </div>
            </div>
         </section>
      ))}

      {/* 5. BOOKING ENGINE INTEGRATION */}
      <section className="py-32 bg-[#0a0a0a] border-t-[20px] border-black" id="booking">
         <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-16 space-y-4">
               <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Garanta sua <span className="text-accent">Data</span>.</h2>
               <p className="text-white/40 uppercase tracking-[0.2em] font-bold text-xs">O mundo pertence a quem agenda primeiro.</p>
            </div>
            
             <div className="p-1 max-w-4xl mx-auto rounded-[3rem] bg-gradient-to-b from-white/10 to-transparent">
              <div className="bg-[#111] rounded-[3rem] p-4 md:p-8">
                 <React.Suspense fallback={<div className="h-96 animate-pulse bg-white/5 rounded-3xl" />}>
                    <PropertyBookingEngine property={property} />
                 </React.Suspense>
              </div>
            </div>
         </div>
      </section>
    </div>
  )
}

