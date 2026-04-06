import { db } from '@/db/index'
import { auditLog } from '@/db/schema'

interface LogActionParams {
  userId?: string
  action: string
  entityType?: string
  entityId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string | null
}

/**
 * Fire-and-forget audit log insert.
 * NEVER throws — errors are caught and logged to console.
 * Use `void logAction(...)` to make the fire-and-forget intent explicit.
 */
export async function logAction(params: LogActionParams): Promise<void> {
  try {
    await db.insert(auditLog).values({
      userId: params.userId ?? null,
      action: params.action,
      entityType: params.entityType ?? null,
      entityId: params.entityId ?? null,
      metadata: params.metadata ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    })
  } catch (err) {
    // Audit log failures must NEVER crash the application
    console.error('[audit] Failed to write audit log entry:', err, { params })
  }
}
