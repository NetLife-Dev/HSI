import { describe, it } from 'vitest'

describe('Rate limiter', () => {
  it.todo('allows requests up to the limit')
  it.todo('blocks the request that exceeds the limit')
  it.todo('resets after window expires')
  it.todo('loginLimiter: 10 per 15 minutes by IP')
  it.todo('magicLinkLimiter: 3 per hour by email')
})
