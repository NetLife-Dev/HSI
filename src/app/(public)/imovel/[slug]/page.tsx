import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/db/index'
import { properties } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { PropertyContent } from './PropertyContent'
import { MOCK_PROPERTIES } from '@/lib/mock-data'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
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

export default async function PropertyDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let property: any = null

  const mockProperty = MOCK_PROPERTIES.find(p => p.slug === slug) || MOCK_PROPERTIES[0]

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
      property = mockProperty
    }
  } catch(e) {
    property = mockProperty
  }

  if (!property) {
    notFound()
  }

  return <PropertyContent property={property} />
}
