import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RateLimiter, loginLimiter, magicLinkLimiter, bookingLimiter, proposalLimiter } from '@/lib/rate-limit'

describe('Rate limiter — token bucket', () => {
  let limiter: RateLimiter

  beforeEach(() => {
    limiter = new RateLimiter()
  })

  it('allows requests up to the limit', () => {
    for (let i = 0; i < 5; i++) {
      expect(limiter.check('test-key', 5, 60000)).toBe(true)
    }
  })

  it('blocks the request that exceeds the limit', () => {
    for (let i = 0; i < 5; i++) {
      limiter.check('test-key', 5, 60000)
    }
    expect(limiter.check('test-key', 5, 60000)).toBe(false)
  })

  it('different keys have independent limits', () => {
    for (let i = 0; i < 5; i++) {
      limiter.check('key-a', 5, 60000)
    }
    // key-a is exhausted; key-b should still work
    expect(limiter.check('key-b', 5, 60000)).toBe(true)
  })

  it('resets after window expires', () => {
    // Mock Date.now to control time
    const originalNow = Date.now
    let now = 1000000
    vi.spyOn(Date, 'now').mockImplementation(() => now)

    for (let i = 0; i < 5; i++) {
      limiter.check('test-key', 5, 60000)
    }
    expect(limiter.check('test-key', 5, 60000)).toBe(false)

    // Advance time past the window
    now += 61000
    expect(limiter.check('test-key', 5, 60000)).toBe(true)

    vi.spyOn(Date, 'now').mockImplementation(originalNow)
  })
})

describe('Rate limiter — exported singletons', () => {
  it('loginLimiter is a RateLimiter instance', () => {
    expect(loginLimiter).toBeInstanceOf(RateLimiter)
  })

  it('magicLinkLimiter is a RateLimiter instance', () => {
    expect(magicLinkLimiter).toBeInstanceOf(RateLimiter)
  })

  it('bookingLimiter is a RateLimiter instance', () => {
    expect(bookingLimiter).toBeInstanceOf(RateLimiter)
  })

  it('proposalLimiter is a RateLimiter instance', () => {
    expect(proposalLimiter).toBeInstanceOf(RateLimiter)
  })
})
