import { db } from '@/db'
import { properties } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Robust direct select to bypass relation inference issues
    const allActive = await db.select().from(properties)
      .where(and(eq(properties.status, 'active'), eq(properties.featured, true)))
      .limit(6)
    
    // Enrich with images manually for stability
    const featuredProperties = await Promise.all(allActive.map(async (p) => {
       const images = await db.select().from(propertyImages).where(eq(propertyImages.propertyId, p.id)).limit(1)
       return { ...p, images }
    }))

    return NextResponse.json({ success: true, properties: featuredProperties })
  } catch (error) {
    console.error('API Error fetching featured properties:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch properties' }, { status: 500 })
  }
}
