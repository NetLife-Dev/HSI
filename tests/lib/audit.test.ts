import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the db module before importing audit
const mockInsert = vi.fn().mockReturnValue({
  values: vi.fn().mockResolvedValue(undefined),
})

vi.mock('@/db/index', () => ({
  db: { insert: mockInsert },
}))

vi.mock('@/db/schema', () => ({
  auditLog: 'auditLog',
}))

const { logAction } = await import('@/lib/audit')

describe('SEC-10 + SEC-11: Audit log', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inserts a row with required fields', async () => {
    await logAction({ action: 'LOGIN_SUCCESS', userId: 'user-123' })
    expect(mockInsert).toHaveBeenCalledWith('auditLog')
  })

  it('does not throw when db insert fails (fire-and-forget)', async () => {
    mockInsert.mockReturnValueOnce({
      values: vi.fn().mockRejectedValue(new Error('DB connection lost')),
    })
    await expect(logAction({ action: 'TEST_ACTION' })).resolves.not.toThrow()
  })

  it('accepts all optional fields', async () => {
    await logAction({
      action: 'BOOKING_CREATED',
      userId: 'user-123',
      entityType: 'booking',
      entityId: 'booking-456',
      metadata: { amount: 10000 },
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    })
    expect(mockInsert).toHaveBeenCalledTimes(1)
  })
})
