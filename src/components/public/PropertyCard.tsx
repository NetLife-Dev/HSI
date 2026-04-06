import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Users, BedDouble, Bath, Star, Heart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface PropertyCardProps {
  property: any // To be typed properly with Drizzle inferred type
}

export function PropertyCard({ property }: PropertyCardProps) {
  const coverImage = property.images?.[0]?.url || '/images/placeholder.jpg'

  return (
    <div className="group relative bg-white rounded-[2.5rem] p-3 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden">
        <Image
          src={coverImage}
          alt={property.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {property.featured && (
            <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-0 px-3 py-1 text-[10px] uppercase font-black tracking-widest shadow-lg">
              Destaque
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-destructive transition-all">
          <Heart size={18} />
        </button>

        {/* Price Tag Overlay (Bottom) */}
        <div className="absolute bottom-4 left-4 right-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
           <Link href={`/imovel/${property.slug}`}>
            <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-xl">
               <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">A partir de</span>
                  <p className="text-xl font-bold text-slate-900 leading-none">
                    R$ 850<span className="text-xs font-medium text-slate-400">/noite</span>
                  </p>
               </div>
               <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground">
                  <Star size={16} fill="white" />
               </div>
            </div>
           </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
            <MapPin size={12} className="text-primary" />
            {property.locationAddress || 'Localização a definir'}
          </div>
          <Link href={`/imovel/${property.slug}`}>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-primary">
              {property.name}
            </h3>
          </Link>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
           <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-1.5 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                <Users size={14} />
                {property.maxGuests}
              </div>
              <div className="flex items-center gap-1.5 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                <BedDouble size={14} />
                {property.bedrooms}
              </div>
              <div className="flex items-center gap-1.5 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                <Bath size={14} />
                {property.bathrooms}
              </div>
           </div>
           
           {/* Stars */}
           <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
             <Star size={14} fill="currentColor" />
             4.9
           </div>
        </div>
      </div>
    </div>
  )
}
