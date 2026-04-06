'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/db/index'
import { properties, propertyImages } from '@/db/schema'
import { eq, and, sql, inArray } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { logAction } from '@/lib/audit'
import { propertySchema, type PropertySchema } from '@/lib/validations/property'
import DOMPurify from 'isomorphic-dompurify'
import { headers } from 'next/headers'
import { cloudinary } from '@/lib/cloudinary'

async function getClientContext() {
  const headersList = await headers()
  const ip = headersList.get('x-client-ip') ?? headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  const ua = headersList.get('user-agent') ?? undefined
  return { ip, ua }
}

async function requireManagement() {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'owner' && session.user.role !== 'staff')) {
    throw new Error('Unauthorized')
  }
  return session.user
}

export async function createProperty(data: PropertySchema) {
  const user = await requireManagement()
  const { ip, ua } = await getClientContext()

  const parsed = propertySchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  // Sanitize description rich text
  const sanitizedDescription = parsed.data.description 
    ? DOMPurify.sanitize(parsed.data.description, {
        ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br', 'h1', 'h2', 'h3'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
      })
    : null

  try {
    const [property] = await db.insert(properties).values({
      ...parsed.data,
      description: sanitizedDescription,
      ownerId: user.id,
      updatedAt: new Date(),
    }).returning()

    void logAction({
      userId: user.id,
      action: 'PROPERTY_CREATED',
      entityType: 'property',
      entityId: property.id,
      ipAddress: ip,
      userAgent: ua,
      metadata: { name: property.name, slug: property.slug },
    })

    revalidatePath('/admin/imoveis')
    return { success: true, data: property }
  } catch (err: any) {
    if (err.code === '23505') { // Postgres unique violation
      return { error: 'Um imóvel com este slug já existe.' }
    }
    console.error('[createProperty] Failed:', err)
    return { error: 'Falha ao criar imóvel. Tente novamente.' }
  }
}

export async function updateProperty(id: string, data: PropertySchema) {
  const user = await requireManagement()
  const { ip, ua } = await getClientContext()

  const parsed = propertySchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const sanitizedDescription = parsed.data.description 
    ? DOMPurify.sanitize(parsed.data.description, {
        ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br', 'h1', 'h2', 'h3'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
      })
    : null

  try {
    const [property] = await db
      .update(properties)
      .set({
        ...parsed.data,
        description: sanitizedDescription,
        updatedAt: new Date(),
      })
      .where(eq(properties.id, id))
      .returning()

    if (!property) return { error: 'Imóvel não encontrado.' }

    void logAction({
      userId: user.id,
      action: 'PROPERTY_UPDATED',
      entityType: 'property',
      entityId: property.id,
      ipAddress: ip,
      userAgent: ua,
      metadata: { name: property.name, slug: property.slug },
    })

    revalidatePath('/admin/imoveis')
    revalidatePath(`/admin/imoveis/${id}`)
    return { success: true, data: property }
  } catch (err: any) {
    if (err.code === '23505') {
      return { error: 'Um imóvel com este slug já existe.' }
    }
    return { error: 'Falha ao atualizar imóvel.' }
  }
}

export async function deleteProperty(id: string) {
  const user = await requireManagement()
  const { ip, ua } = await getClientContext()

  try {
    const [property] = await db
      .delete(properties)
      .where(eq(properties.id, id))
      .returning()

    if (!property) return { error: 'Imóvel não encontrado.' }

    void logAction({
      userId: user.id,
      action: 'PROPERTY_DELETED',
      entityType: 'property',
      entityId: id,
      ipAddress: ip,
      userAgent: ua,
      metadata: { name: property.name, slug: property.slug },
    })

    revalidatePath('/admin/imoveis')
    return { success: true }
  } catch (err) {
    return { error: 'Falha ao excluir imóvel.' }
  }
}

export async function togglePropertyStatus(id: string, status: 'active' | 'inactive' | 'maintenance') {
  const user = await requireManagement()
  const { ip, ua } = await getClientContext()

  try {
    const [property] = await db
      .update(properties)
      .set({ status, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning()

    if (!property) return { error: 'Imóvel não encontrado.' }

    void logAction({
      userId: user.id,
      action: 'PROPERTY_STATUS_CHANGED',
      entityType: 'property',
      entityId: id,
      ipAddress: ip,
      userAgent: ua,
      metadata: { name: property.name, status },
    })

    revalidatePath('/admin/imoveis')
    return { success: true }
  } catch (err) {
    return { error: 'Falha ao alterar status.' }
  }
}

// ─── Image Management ────────────────────────────────────────────────────────

export async function addPropertyImages(propertyId: string, images: { url: string; publicId: string }[]) {
  const user = await requireManagement()
  const { ip, ua } = await getClientContext()

  try {
    // Get current max order
    const [lastImage] = await db
      .select({ order: propertyImages.order })
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, propertyId))
      .orderBy(sql`${propertyImages.order} desc`)
      .limit(1)

    let startOrder = (lastImage?.order ?? -1) + 1

    const values = images.map((img, i) => ({
      propertyId,
      url: img.url,
      publicId: img.publicId,
      order: startOrder + i,
    }))

    await db.insert(propertyImages).values(values)

    void logAction({
      userId: user.id,
      action: 'IMAGES_ADDED',
      entityType: 'property',
      entityId: propertyId,
      ipAddress: ip,
      userAgent: ua,
      metadata: { count: images.length },
    })

    revalidatePath(`/admin/imoveis/${propertyId}/editar`)
    return { success: true }
  } catch (err) {
    console.error('[addPropertyImages] Failed:', err)
    return { error: 'Falha ao salvar imagens no banco.' }
  }
}

export async function deletePropertyImage(imageId: string) {
  const user = await requireManagement()
  const { ip, ua } = await getClientContext()

  try {
    const [image] = await db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.id, imageId))
      .limit(1)

    if (!image) return { error: 'Imagem não encontrada.' }

    // 1. Delete from Cloudinary (server-side with secret)
    await cloudinary.uploader.destroy(image.publicId)

    // 2. Delete from DB
    await db.delete(propertyImages).where(eq(propertyImages.id, imageId))

    void logAction({
      userId: user.id,
      action: 'IMAGE_DELETED',
      entityType: 'property',
      entityId: image.propertyId,
      ipAddress: ip,
      userAgent: ua,
      metadata: { publicId: image.publicId },
    })

    revalidatePath(`/admin/imoveis/${image.propertyId}/editar`)
    return { success: true }
  } catch (err) {
    console.error('[deletePropertyImage] Failed:', err)
    return { error: 'Falha ao remover imagem.' }
  }
}

export async function reorderPropertyImages(propertyId: string, imageIds: string[]) {
  await requireManagement()

  try {
    // Transactional atomic update
    await db.transaction(async (tx) => {
      for (let i = 0; i < imageIds.length; i++) {
        await tx
          .update(propertyImages)
          .set({ order: i })
          .where(and(eq(propertyImages.id, imageIds[i]), eq(propertyImages.propertyId, propertyId)))
      }
    })

    revalidatePath(`/admin/imoveis/${propertyId}/editar`)
    return { success: true }
  } catch (err) {
    return { error: 'Falha ao reordenar imagens.' }
  }
}

export async function setPropertyCover(propertyId: string, imageId: string) {
  const user = await requireManagement()

  try {
    await db.transaction(async (tx) => {
      // 1. Reset all others
      await tx
        .update(propertyImages)
        .set({ isCover: false })
        .where(eq(propertyImages.propertyId, propertyId))

      // 2. Set new cover
      await tx
        .update(propertyImages)
        .set({ isCover: true })
        .where(and(eq(propertyImages.id, imageId), eq(propertyImages.propertyId, propertyId)))
    })

    void logAction({
      userId: user.id,
      action: 'IMAGE_COVER_SET',
      entityType: 'property',
      entityId: propertyId,
      metadata: { imageId },
    })

    revalidatePath(`/admin/imoveis/${propertyId}/editar`)
    return { success: true }
  } catch (err) {
    return { error: 'Falha ao definir imagem de capa.' }
  }
}
