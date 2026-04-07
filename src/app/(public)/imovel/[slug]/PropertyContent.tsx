'use client'

import Link from 'next/link'
import { 
  Users, 
  BedDouble, 
  Bath, 
  MapPin,
  ChevronRight, 
  ShieldCheck, 
  Star 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PropertyGallery } from '@/components/public/PropertyGallery'
import { PropertyBookingEngine } from '@/components/public/PropertyBookingEngine'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export function PropertyContent({ property }: { property: any }) {
  return (
    <div className="relative min-h-screen pt-24 pb-32 overflow-hidden bg-slate-50">
      {/* Immersive Background Effect */}
      {property.images?.[0]?.url && (
        <>
          <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden h-[60vh]">
            <img 
              src={property.images[0].url} 
              alt="" 
              className="w-full h-full object-cover blur-[60px] opacity-20 scale-110 animate-ken-burns" 
            />
          </div>
          <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-white/50 to-white/95 h-[60vh]" />
          <div className="fixed top-[60vh] bottom-0 left-0 right-0 z-0 bg-slate-50 pointer-events-none" />
        </>
      )}

      <div className="container mx-auto px-4 space-y-12 relative z-10">
        
        {/* Navigation Breadcrumb with Native CSS Animation */}
        <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} className="text-slate-300" />
          <Link href="/imoveis" className="hover:text-primary transition-colors">Imóveis</Link>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="text-slate-900 border-b border-primary pb-0.5">{property.name}</span>
        </div>

        {/* Gallery Section */}
        <PropertyGallery images={property.images} />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 rounded-full px-4 py-1.5 text-[10px] uppercase font-black tracking-widest shadow-sm">
                Vila de Luxo
              </Badge>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star size={16} fill="currentColor" />
                4.9 <span className="text-slate-400 font-medium ml-1">(128 avaliações)</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[0.95] animate-slide-up" style={{ animationDelay: '0.5s' }}>
              {property.name}
            </h1>
            
            <div className="flex items-center gap-2 text-slate-500 font-semibold group cursor-pointer animate-slide-up" style={{ animationDelay: '0.7s' }}>
              <MapPin size={18} className="text-primary group-hover:scale-110 transition-transform" />
              <span className="hover:underline transition-all underline-offset-4">{property.locationAddress} — Ver no Mapa</span>
            </div>

            <div className="flex flex-wrap items-center gap-8 pt-6">
              {[
                { icon: Users, value: property.maxGuests, label: 'Hóspedes' },
                { icon: BedDouble, value: property.bedrooms, label: 'Quartos' },
                { icon: Bath, value: property.bathrooms, label: 'Banheiros' }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "flex flex-col gap-1 animate-slide-up",
                    idx > 0 && "pl-8 border-l border-slate-100"
                  )}
                  style={{ animationDelay: `${0.8 + (idx * 0.1)}s` }}
                >
                   <div className="flex items-center gap-3 text-slate-400">
                      <item.icon size={20} className="text-slate-900" />
                      <span className="text-2xl font-bold text-slate-900 leading-none">{item.value}</span>
                   </div>
                   <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center gap-4 bg-slate-50 p-10 rounded-[4rem] border border-slate-100 shadow-sm relative group overflow-hidden animate-reveal-card" style={{ animationDelay: '1s' }}>
             <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 blur-[60px] rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform opacity-30" />
             <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-primary shadow-2xl mb-2">
                <ShieldCheck size={40} />
             </div>
             <p className="text-center text-xs font-black uppercase tracking-widest leading-relaxed max-w-[180px]">
                Hospedagem <span className="text-primary italic">100% Auditada</span> pela NetLife
             </p>
          </div>
        </div>

        <Separator className="bg-slate-100" />

        {/* Booking Engine & Content */}
        <div className="animate-slide-up" style={{ animationDelay: '1.2s' }}>
           <PropertyBookingEngine property={property} />
        </div>
      </div>
    </div>
  )
}
