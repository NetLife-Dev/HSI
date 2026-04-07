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
  const displayProperties = allProperties.length > 0 ? allProperties : MOCK_PROPERTIES

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4 space-y-12">
        {/* Header & Filter Bar */}
        <div className="space-y-8">
           <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div className="space-y-2">
                 <h1 className="text-4xl font-bold tracking-tight text-slate-900">Encontre o seu Retiro</h1>
                 <p className="text-slate-500 font-medium">Explore nossa seleção exclusiva de {displayProperties.length} propriedades.</p>
              </div>
              <div className="flex items-center gap-2">
                 <Badge variant="outline" className="bg-white border-primary/20 text-primary px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px]">
                    Litoral Norte
                 </Badge>
                 <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px]">
                    Interior
                 </Badge>
              </div>
           </div>

           <div className="bg-white p-2 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col lg:flex-row items-center gap-4">
              <div className="flex-grow w-full flex items-center px-6 gap-4 border-b lg:border-b-0 lg:border-r border-slate-50">
                 <Search size={20} className="text-primary" />
                 <Input 
                   placeholder="Buscar por nome ou região..." 
                   className="border-0 focus-visible:ring-0 text-sm font-medium h-12 px-0"
                 />
              </div>
              <div className="flex items-center gap-3 px-4 w-full lg:w-auto">
                 <Button variant="ghost" className="rounded-2xl gap-2 font-bold text-slate-500 hover:text-primary">
                    <SlidersHorizontal size={16} />
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
