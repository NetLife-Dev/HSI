'use client'

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
import { PropertyBookingEngine } from '@/components/public/PropertyBookingEngine'
import { Badge } from '@/components/ui/badge'

export function PropertyContent({ property }: { property: any }) {
  const images = property.images || []
  const heroImage = images[0]?.url || '/images/mock/exterior.png'
  
  return (
    <div className="bg-black mix-blend-normal overflow-hidden select-none text-white">
      {/* 1. HERO SECTION (100vh) */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {heroImage && (
             <img 
               src={heroImage} 
               alt={property.name} 
               className="w-full h-full object-cover opacity-80" 
             />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-end h-full pb-24 text-center">
           <div className="flex items-center gap-1 text-accent font-bold text-sm tracking-[0.3em] uppercase mb-6 animate-slide-up">
              <Star size={16} fill="currentColor" />
              <span>Exclusivo</span>
           </div>
           <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white uppercase leading-[0.85] drop-shadow-2xl animate-cinematic-zoom">
             {property.name}
           </h1>
           <p className="mt-8 text-xl md:text-2xl text-white/80 font-medium max-w-3xl animate-slide-up" style={{ animationDelay: '0.4s' }}>
             {property.locationAddress}
           </p>

           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
              <ChevronDown size={32} className="text-white/50" />
           </div>
        </div>
      </section>

      {/* 2. THE STORY / OVERVIEW BLOCK */}
      <section className="py-32 bg-black relative">
        <div className="container mx-auto px-4 max-w-6xl">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                 <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white leading-none">
                    O Refúgio<br/><span className="text-accent">Perfeito.</span>
                 </h2>
                 <p className="text-lg text-white/60 leading-relaxed font-medium">
                    {property.description || "Você sempre soube que o convés estava armado contra você. Mas quando a oportunidade perfeita surge, você se encontra no lugar mais ensolarado do paraíso, no meio de um refúgio de luxo feito para quem não aceita menos que o topo."}
                 </p>
                 <div className="flex flex-col gap-6 pt-8 border-t border-white/10">
                    <div className="flex items-center gap-4">
                       <MapPin size={24} className="text-accent" />
                       <span className="text-xl font-bold uppercase tracking-widest">{property.locationAddress}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-8">
                      <div>
                        <div className="text-3xl font-black">{property.maxGuests}</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Hóspedes</div>
                      </div>
                      <div>
                        <div className="text-3xl font-black">{property.bedrooms}</div>
                         <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Quartos</div>
                      </div>
                      <div>
                        <div className="text-3xl font-black">{property.bathrooms}</div>
                         <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Banhos</div>
                      </div>
                    </div>
                 </div>
              </div>
              
              {/* Feature Image */}
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm group">
                 <img src={images[1]?.url || '/images/mock/bedroom.png'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 grayscale hover:grayscale-0" alt="Interior" />
              </div>
           </div>
        </div>
      </section>

      {/* 3. CINEMATIC FULL BLEED IMAGES WITH OVERLAYS */}
      {[
        images[2]?.url || '/images/mock/living.png',
        images[3]?.url || '/images/mock/outdoor.png'
      ].map((imgUrl: string, i: number) => (
         <section key={i} className="relative h-[80vh] w-full border-t-[20px] border-black">
            <img src={imgUrl} className="w-full h-full object-cover opacity-70" alt={`Highlight ${i+1}`} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent flex items-center">
               <div className="container mx-auto px-4 max-w-6xl">
                  <h3 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white max-w-2xl leading-[0.85]">
                     {i === 0 ? "Viva o " : "Sinta a "}
                     <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30">
                       {i === 0 ? "Momento." : "Exclusividade."}
                     </span>
                  </h3>
               </div>
            </div>
         </section>
      ))}

      {/* 4. BOOKING ENGINE INTEGRATION */}
      <section className="py-32 bg-[#0a0a0a] border-t-[20px] border-black" id="booking">
         <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-16 space-y-4">
               <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Garanta sua <span className="text-accent">Data</span>.</h2>
               <p className="text-white/40 uppercase tracking-[0.2em] font-bold text-xs">O mundo pertence a quem agenda primeiro.</p>
            </div>
            
            <div className="p-1 max-w-4xl mx-auto rounded-[3rem] bg-gradient-to-b from-white/10 to-transparent">
              <div className="bg-[#111] rounded-[3rem] p-4 md:p-8">
                 <PropertyBookingEngine property={property} />
              </div>
            </div>
         </div>
      </section>
    </div>
  )
}

