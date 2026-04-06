import { db } from '@/db'
import { staffPermissions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { type Session } from 'next-auth'

export type PermissionModule = 'properties' | 'bookings' | 'guests' | 'financial' | 'settings'
export type PermissionLevel = 'view' | 'edit' | 'none'

export async function checkPermission(
  session: Session | null,
  module: PermissionModule,
  requiredLevel: 'view' | 'edit'
): Promise<boolean> {
  if (!session?.user) return false
  
  // Owners have full access to everything
  if (session.user.role === 'owner') return true
  
  if (session.user.role !== 'staff') return false

  // Check staff permissions in DB
  const permissions = await db.query.staffPermissions.findFirst({
    where: eq(staffPermissions.userId, session.user.id)
  })

  if (!permissions) return false

  const level = permissions[module] as PermissionLevel

  if (requiredLevel === 'edit') {
    return level === 'edit'
  }
  
  if (requiredLevel === 'view') {
    return level === 'view' || level === 'edit'
  }

  return false
}

/**
 * Higher-order utility for Server Actions to enforce permissions
 */
export async function requirePermission(
  session: Session | null,
  module: PermissionModule,
  requiredLevel: 'view' | 'edit'
) {
  const hasPermission = await checkPermission(session, module, requiredLevel)
  if (!hasPermission) {
    throw new Error(`Acesso negado: Você não tem permissão de ${requiredLevel} no módulo ${module}.`)
  }
}
