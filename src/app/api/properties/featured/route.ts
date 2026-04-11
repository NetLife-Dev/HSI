import { db } from '@/db'
import { properties } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const featuredProperties = await db.query.properties.findMany({
      where: and(eq(properties.status, 'active'), eq(properties.featured, true)),
      with: {
        images: {
          orderBy: (images: any, { asc }: any) => [asc(images.order)],
          limit: 1,
        },
      },
      limit: 6,
    })

    return NextResponse.json({ success: true, properties: featuredProperties })
  } catch (error) {
    console.error('API Error fetching featured properties:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch properties' }, { status: 500 })
  }
}
