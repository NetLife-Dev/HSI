import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Users, BedDouble, Bath, Star, Heart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PropertyCardProps {
  property: any // To be typed properly with Drizzle inferred type
}

export function PropertyCard({ property }: PropertyCardProps) {
  const coverImage = property.images?.[0]?.url || '/images/placeholder.jpg'

  return (
    <div className="group relative bg-[#111] rounded-[2.5rem] p-3 border border-white/5 shadow-2xl hover:shadow-accent/10 transition-all duration-500 overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden">
        <Image
          src={coverImage}
          alt={property.name}
          fill
          className="object-cover transition-transform duration-[1.5s] group-hover:scale-110 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {property.featured && (
            <Badge className="bg-accent text-black border-0 px-4 py-1 flex items-center justify-center text-[10px] uppercase font-black tracking-[0.2em] shadow-lg">
              Coleção Especial
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:bg-black hover:text-accent transition-all">
          <Heart size={18} />
        </button>

        <div className="absolute bottom-4 left-4 right-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
           <Link href={`/imovel/${property.slug}`}>
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-2xl">
               <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-black text-accent tracking-[0.2em]">Por Noite</span>
                  <p className="text-2xl font-black text-white leading-none tracking-tight">
                    R$ {property.basePrice ? property.basePrice / 100 : '850'}
                  </p>
               </div>
               <div className="w-12 h-12 bg-white text-black hover:bg-accent hover:text-black transition-colors rounded-xl flex items-center justify-center shadow-2xl">
                  <span className="text-[10px] uppercase font-black tracking-widest">Reserva</span>
               </div>
            </div>
           </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-accent text-[10px] uppercase font-black tracking-[0.2em]">
            <MapPin size={12} className="text-accent" />
            {property.locationAddress || 'Localização Privada'}
          </div>
          <Link href={`/imovel/${property.slug}`}>
            <h3 className="text-3xl font-black tracking-tighter uppercase text-white transition-colors group-hover:text-accent leading-none">
              {property.name}
            </h3>
          </Link>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
           <div className="flex items-center gap-4 text-xs font-black text-white/50">
              <div className="flex items-center gap-1.5 opacity-60 group-hover:text-white group-hover:opacity-100 transition-all">
                <Users size={14} />
                {property.maxGuests}
              </div>
              <div className="flex items-center gap-1.5 opacity-60 group-hover:text-white group-hover:opacity-100 transition-all">
                <BedDouble size={14} />
                {property.bedrooms}
              </div>
              <div className="flex items-center gap-1.5 opacity-60 group-hover:text-white group-hover:opacity-100 transition-all">
                <Bath size={14} />
                {property.bathrooms}
              </div>
           </div>
           
           {/* Stars */}
           <div className="flex items-center gap-1 text-accent font-black text-sm tracking-widest">
             <Star size={14} fill="currentColor" />
             4.9
           </div>
        </div>
      </div>
    </div>
  )
}
