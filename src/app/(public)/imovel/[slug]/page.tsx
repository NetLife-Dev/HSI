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
    const results = await db.select().from(properties).where(eq(properties.slug, slug))
    property = results[0]
  } catch(e) {
    property = null
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

  try {
    const results = await db.select().from(properties).where(eq(properties.slug, slug))
    property = results[0]
    
    if (!property) {
      notFound()
    }

    // Manual enrichment for images and relations to ensure stability
    const images = await db.select().from(propertyImages)
      .where(eq(propertyImages.propertyId, property.id))
      .orderBy(propertyImages.order)
    
    property = { ...property, images }
  } catch(e) {
    console.error("Property Detail Fetch Error:", e)
    notFound()
  }

  return <PropertyContent property={property} />
}
