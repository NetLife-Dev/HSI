import { Search, MapPin, SlidersHorizontal, ArrowDownWideNarrow } from 'lucide-react'
import { db } from '@/db/index'
import { properties, propertyImages } from '@/db/schema'

import { eq, and } from 'drizzle-orm'
import { PropertyCard } from '@/components/public/PropertyCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MOCK_PROPERTIES } from '@/lib/mock-data'

export const dynamic = 'force-dynamic'

export default async function CatalogPage() {
  let allProperties: any[] = []
  try {
    // Robust direct select to bypass relation inference issues in production
    allProperties = await db.select().from(properties).where(eq(properties.status, 'active'))
    
    // Enrich with images manually to ensure reliability
    const propertiesWithImages = await Promise.all(allProperties.map(async (p) => {
       const images = await db.select().from(propertyImages).where(eq(propertyImages.propertyId, p.id)).limit(1)
       return { ...p, images }
    }))
    
    allProperties = propertiesWithImages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } catch (error) {
    console.error("Database Fetch Error for Catalog:", error)
  }

  const displayProperties = allProperties || []

  return (
    <div className="bg-[#050505] min-h-screen pt-32 pb-24 text-white selection:bg-accent selection:text-black">
      <div className="container mx-auto px-4 max-w-7xl space-y-12">
        {/* Header & Filter Bar */}
        <div className="space-y-12">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="space-y-4">
                 <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-[0.85]">O seu<br/><span className="text-accent">Retiro.</span></h1>
                 <p className="text-white/60 font-medium tracking-wide">Explore nossa seleção exclusiva com {displayProperties.length} santuários isolados.</p>
              </div>
              <div className="flex items-center gap-2">
                 <Badge variant="outline" className="bg-accent/10 border-accent/20 text-accent px-6 py-2 rounded-full font-black uppercase tracking-[0.2em] text-[10px]">
                    Litoral Norte
                 </Badge>
                 <Badge variant="outline" className="bg-white/5 border-white/10 text-white/40 px-6 py-2 rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:text-white transition-colors">
                    Interior
                 </Badge>
              </div>
           </div>

           <div className="bg-[#111] p-2 sm:p-3 rounded-3xl sm:rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col lg:flex-row items-center gap-2 sm:gap-4 overflow-hidden">
              <div className="flex-grow w-full flex items-center px-4 sm:px-6 gap-3 sm:gap-4 border-b lg:border-b-0 lg:border-r border-white/10 py-1 lg:py-0">
                 <Search size={22} className="text-accent shrink-0" />
                 <Input 
                   placeholder="Buscar santuário..." 
                   className="border-0 bg-transparent focus-visible:ring-0 text-base sm:text-lg font-bold text-white placeholder:text-white/30 h-12 sm:h-14 px-0 w-full"
                 />
              </div>
               <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 w-full lg:w-auto py-2 lg:py-0 overflow-x-auto no-scrollbar">
                  <Button variant="ghost" className="rounded-xl sm:rounded-2xl gap-2 font-bold text-white/50 hover:text-white hover:bg-white/5 py-3 sm:py-4 px-3 sm:px-4 uppercase tracking-[0.1em] text-[10px] shrink-0">
                     <SlidersHorizontal size={14} />
                     Filtros
                  </Button>
                  <Button variant="ghost" className="rounded-xl sm:rounded-2xl gap-2 font-bold text-white/50 hover:text-white hover:bg-white/5 py-3 sm:py-4 px-3 sm:px-4 uppercase tracking-[0.1em] text-[10px] shrink-0">
                     <ArrowDownWideNarrow size={14} />
                     Ordenar
                  </Button>
                  <Button className="ml-auto sm:ml-0 rounded-xl sm:rounded-2xl px-5 sm:px-6 h-9 sm:h-10 shadow-lg shadow-accent/10 hover:scale-[1.02] transition-transform text-[10px] uppercase font-black tracking-widest bg-accent text-black shrink-0">
                     Pesquisar
                  </Button>
               </div>
           </div>
        </div>

        {/* Property Grid */}
        {displayProperties.length === 0 ? (
          <div className="bg-white/5 rounded-[3rem] p-12 md:p-24 text-center border border-white/10 backdrop-blur-sm">
            <p className="text-accent uppercase tracking-[0.3em] font-black text-xs mb-4">Em Breve</p>
            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-6">Novos Santuários<br />Sendo Curados.</h3>
            <p className="text-white/40 font-medium italic">Estamos preparando novas surpresas para você. Volte em breve!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {displayProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
