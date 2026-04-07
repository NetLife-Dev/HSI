import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/db/index'
import { properties } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { PropertyContent } from './PropertyContent'

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { slug } = await params
  let property: any = null
  try {
    property = await db.query.properties.findFirst({
      where: eq(properties.slug, slug),
    })
  } catch(e) {
    property = { name: "Vila Ocean View UX Demo", description: "Aproveite esta demo maravilhosa" }
  }

  if (!property) return { title: 'Imóvel não encontrado' }

  return {
    title: `${property.name} — Reserva Direta`,
    description: property.description?.substring(0, 160).replace(/<[^>]*>/g, ''),
  }
}

export default async function PropertyDetailsPage({ params }: any) {
  const { slug } = await params
  let property: any = null

  const MOCK_PROPERTIES: Record<string, any> = {
    'villa-ocean-view': {
      id: "mock1", name: "Villa Ocean View", slug: "villa-ocean-view",
      locationAddress: "Praia do Forte, Bahia",
      maxGuests: 8, bedrooms: 4, bathrooms: 5,
      description: "<p>Uma joia arquitetônica debruçada sobre o mar. Esta villa oferece total privacidade com serviço de concierge 24h, piscina de borda infinita e acesso direto à praia privativa. Perfeita para famílias que buscam o ápice do conforto no Litoral Norte.</p>",
      images: [
        { id: "v1", url: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" },
        { id: "v2", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" },
        { id: "v3", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" },
        { id: "v4", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" }
      ],
      basePrice: 150000, cleaningFee: 25000
    },
    'refugio-da-mata': {
      id: "mock2", name: "Refúgio da Mata", slug: "refugio-da-mata",
      locationAddress: "Trancoso, Bahia",
      maxGuests: 6, bedrooms: 3, bathrooms: 3,
      description: "<p>Experimente o Quadrado de Trancoso de uma forma rústica e sofisticada. Imersa na mata atlântica, esta casa de autor combina madeira de demolição com design contemporâneo e uma ventilação natural indescritível.</p>",
      images: [
        { id: "r1", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" },
        { id: "r2", url: "https://images.unsplash.com/photo-1600607687931-cebf004f5605?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" },
        { id: "r3", url: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" }
      ],
      basePrice: 220000, cleaningFee: 30000
    },
    'cobertura-skyline': {
      id: "mock3", name: "Cobertura Skyline", slug: "cobertura-skyline",
      locationAddress: "Jurerê Internacional, SC",
      maxGuests: 4, bedrooms: 2, bathrooms: 3,
      description: "<p>O ponto mais alto do luxo urbano em Florianópolis. Vista panorâmica completa da orla de Jurerê, jacuzzi privativa no terraço e automação residencial completa via iPad. Luxo técnico e visual para hóspedes exigentes.</p>",
      images: [
        { id: "s1", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" },
        { id: "s2", url: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" },
        { id: "s3", url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" }
      ],
      basePrice: 350000, cleaningFee: 45000
    }
  }

  try {
    property = await db.query.properties.findFirst({
      where: eq(properties.slug, slug),
      with: {
        images: {
          orderBy: (images: any, { asc }: any) => [asc(images.order)],
        },
      },
    })
    
    if (!property) {
      property = MOCK_PROPERTIES[slug] || MOCK_PROPERTIES['villa-ocean-view']
    }
  } catch(e) {
    property = MOCK_PROPERTIES[slug] || MOCK_PROPERTIES['villa-ocean-view']
  }

  if (!property) {
    notFound()
  }

  return <PropertyContent property={property} />
}
