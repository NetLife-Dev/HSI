import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/db/index'
import { properties } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { PropertyForm } from '@/components/admin/properties/PropertyForm'
import { MOCK_PROPERTIES } from '@/lib/mock-data'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { SeasonalPricingManager } from '@/components/admin/properties/SeasonalPricingManager'
import { PropertyServiceManager } from '@/components/admin/properties/PropertyServiceManager'

export const metadata: Metadata = {
  title: 'Editar Imóvel — Admin',
}

interface EditPropertyPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params

  let property: any = null

  // UAT Fallback: Se for um ID de mock, pegamos dos mocks
  if (id.startsWith('mock')) {
    property = MOCK_PROPERTIES.find(p => p.id === id)
  } else {
    try {
      property = await db.query.properties.findFirst({
        where: eq(properties.id, id),
        with: {
          images: {
            orderBy: (images, { asc }) => [asc(images.order)],
          },
          seasonalPricing: true,
          services: true,
        },
      })
    } catch (e) {
      console.warn('⚠️ [Admin/Edit] Erro ao buscar imóvel. Possível UUID inválido em modo UAT.')
    }
  }

  if (!property) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
          Editar Imóvel
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Atualize os dados e configurações do imóvel <strong>{property.name}</strong>.
        </p>
      </div>

      <Tabs defaultValue="geral" className="space-y-8">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-14 w-full justify-start gap-4 px-4 overflow-x-auto">
          <TabsTrigger value="geral" className="data-[state=active]:bg-accent data-[state=active]:text-black rounded-xl px-6 h-10 font-bold uppercase tracking-widest text-[10px] transition-all">Geral</TabsTrigger>
          <TabsTrigger value="tarifas" className="data-[state=active]:bg-accent data-[state=active]:text-black rounded-xl px-6 h-10 font-bold uppercase tracking-widest text-[10px] transition-all">Tarifas e Épocas</TabsTrigger>
          <TabsTrigger value="servicos" className="data-[state=active]:bg-accent data-[state=active]:text-black rounded-xl px-6 h-10 font-bold uppercase tracking-widest text-[10px] transition-all">Serviços On-Demand</TabsTrigger>
        </TabsList>
        
        <TabsContent value="geral">
          <PropertyForm initialData={property} />
        </TabsContent>
        
        <TabsContent value="tarifas">
          <Card className="bg-[#151515] border-white/10 rounded-[2.5rem] p-8">
            <SeasonalPricingManager propertyId={property.id} initialPricing={property.seasonalPricing || []} />
          </Card>
        </TabsContent>
        
        <TabsContent value="servicos">
          <Card className="bg-[#151515] border-white/10 rounded-[2.5rem] p-8">
            <PropertyServiceManager propertyId={property.id} initialServices={property.services || []} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
