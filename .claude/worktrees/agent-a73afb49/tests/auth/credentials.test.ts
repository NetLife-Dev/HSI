import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('AUTH-01: Credentials authentication', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it.todo('returns user object when email and password are correct')
  it.todo('returns null when password is wrong')
  it.todo('returns null when user does not exist')
  it.todo('returns null when passwordHash is missing (magic-link only user)')
  it.todo('lowercases email before lookup')
})
