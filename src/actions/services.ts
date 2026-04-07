'use server'

import { db } from '@/db/index'
import { propertyServices } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

interface ServiceInput {
  name: string
  description?: string
  price: number
  unit: 'total' | 'per_day' | 'per_guest'
  propertyId?: string // If null, it's a global template or for all proprs (logic choice)
}

export async function createService(data: ServiceInput) {
  try {
    const { name, description, price, unit, propertyId } = data
    
    // In our model, services are linked to properties. 
    // If no propertyId, we might handle as a global available service to be picked.
    // For now, let's assume it requires a propertyId or we handle global separately.
    
    const newService = await db.insert(propertyServices).values({
      name,
      description,
      price,
      unit,
      propertyId: propertyId as string, // Should be valid UUID
    }).returning()

    revalidatePath('/admin/servicos')
    revalidatePath(`/admin/imoveis/${propertyId}/editar`)
    return { success: true, service: newService[0] }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getGlobalServices() {
  // Logic: services with a specific flag or just all for now
  return db.query.propertyServices.findMany()
}

export async function deleteService(id: string) {
  try {
    await db.delete(propertyServices).where(eq(propertyServices.id, id))
    revalidatePath('/admin/servicos')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
