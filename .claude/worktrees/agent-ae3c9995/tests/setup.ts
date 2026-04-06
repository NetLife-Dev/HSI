import '@testing-library/jest-dom'

// Shared test utilities
export const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'admin@test.com',
    name: 'Test Admin',
    role: 'owner' as const,
  },
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
}

export const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  query: { users: { findFirst: vi.fn() } },
}
