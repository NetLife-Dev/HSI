import { describe, it } from 'vitest'

describe('SEC-10 + SEC-11: Audit log', () => {
  it.todo('logAction() inserts row into auditLog table')
  it.todo('logAction() captures userId, action, entityType, entityId')
  it.todo('logAction() captures ipAddress and userAgent')
  it.todo('logAction() does not throw when db insert fails (fire-and-forget)')
})
