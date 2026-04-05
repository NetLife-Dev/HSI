interface Bucket {
  tokens: number
  windowStart: number
}

export class RateLimiter {
  private buckets = new Map<string, Bucket>()

  /**
   * Check if a request is within rate limit.
   * @param key - Unique identifier (e.g., IP address, email, userId)
   * @param limit - Maximum number of requests allowed in the window
   * @param windowMs - Window duration in milliseconds
   * @returns true if request is allowed, false if rate limit exceeded
   */
  check(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now()
    const bucket = this.buckets.get(key)

    if (!bucket || now - bucket.windowStart >= windowMs) {
      // New window — reset bucket
      this.buckets.set(key, { tokens: 1, windowStart: now })
      return true
    }

    if (bucket.tokens < limit) {
      bucket.tokens++
      return true
    }

    return false
  }

  /**
   * Reset the bucket for a key (useful after successful auth to clear failed attempt count)
   */
  reset(key: string): void {
    this.buckets.delete(key)
  }

  /**
   * Get current token count for a key (for debugging/monitoring)
   */
  getCount(key: string): number {
    return this.buckets.get(key)?.tokens ?? 0
  }
}

// ─── Singleton instances (use these in Server Actions and Route Handlers) ───

/**
 * Login rate limiter: 10 attempts per 15 minutes per IP address
 * Usage: loginLimiter.check(ipAddress, 10, 15 * 60 * 1000)
 */
export const loginLimiter = new RateLimiter()

/**
 * Magic link rate limiter: 3 requests per hour per email address
 * Usage: magicLinkLimiter.check(email, 3, 60 * 60 * 1000)
 */
export const magicLinkLimiter = new RateLimiter()

/**
 * Booking creation rate limiter: 5 attempts per hour per IP address
 * Usage: bookingLimiter.check(ipAddress, 5, 60 * 60 * 1000)
 */
export const bookingLimiter = new RateLimiter()

/**
 * Proposal sending rate limiter: 20 per hour per authenticated userId
 * Usage: proposalLimiter.check(userId, 20, 60 * 60 * 1000)
 */
export const proposalLimiter = new RateLimiter()
