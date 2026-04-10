import { Search, MapPin, SlidersHorizontal, ArrowDownWideNarrow } from 'lucide-react'
import { db } from '@/db/index'
import { properties } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { PropertyCard } from '@/components/public/PropertyCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MOCK_PROPERTIES } from '@/lib/mock-data'

export default async function CatalogPage() {
  let allProperties: any[] = []
  try {
    allProperties = await db.query.properties.findMany({
      where: eq(properties.status, 'active'),
      with: {
        images: {
          limit: 1,
        },
      },
      orderBy: (properties, { desc }) => [desc(properties.createdAt)],
    })
  } catch (error) {
    console.log("Mock Mode Active for Catalog (Database Error)")
  }

  // UAT Fallback: Se o banco estiver vazio, mostramos os mocks luxuosos
  const displayProperties = (allProperties && allProperties.length > 0) ? allProperties : MOCK_PROPERTIES

  return (
    <div className="bg-[#050505] min-h-screen pt-32 pb-24 text-white selection:bg-accent selection:text-black">
      <div className="container mx-auto px-4 max-w-7xl space-y-12">
        {/* Header & Filter Bar */}
        <div className="space-y-12">
           <div className="flex flex-col md:flex-row justify-between items-end gap-6">
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

           <div className="bg-[#111] p-3 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col lg:flex-row items-center gap-4">
              <div className="flex-grow w-full flex items-center px-6 gap-4 border-b lg:border-b-0 lg:border-r border-white/10">
                 <Search size={24} className="text-accent" />
                 <Input 
                   placeholder="Buscar por santuário ou região..." 
                   className="border-0 bg-transparent focus-visible:ring-0 text-lg font-bold text-white placeholder:text-white/30 h-14 px-0"
                 />
              </div>
              <div className="flex items-center gap-3 px-6 w-full lg:w-auto">
                 <Button variant="ghost" className="rounded-2xl gap-3 font-bold text-white/50 hover:text-white hover:bg-white/5 py-6 px-6 uppercase tracking-widest text-xs">
                    <SlidersHorizontal size={18} />
                    Filtros
                 </Button>
                 <Button variant="ghost" className="rounded-2xl gap-2 font-bold text-slate-500 hover:text-primary">
                    <ArrowDownWideNarrow size={16} />
                    Ordenar
                 </Button>
                 <Button className="rounded-2xl px-8 h-12 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                    Pesquisar
                 </Button>
              </div>
           </div>
        </div>

        {/* Property Grid */}
        {displayProperties.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-slate-100 italic text-slate-300">
            Estamos preparando novas surpresas para você. Volte em breve!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {displayProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
