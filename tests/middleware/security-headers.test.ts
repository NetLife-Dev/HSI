import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

describe('SEC-06 + SEC-07: Security headers in middleware', () => {
  const middlewarePath = path.resolve('./src/middleware.ts')

  let content: string
  try {
    content = readFileSync(middlewarePath, 'utf-8')
  } catch {
    content = ''
  }

  it('middleware.ts contains Content-Security-Policy header', () => {
    expect(content).toContain('Content-Security-Policy')
  })

  it('CSP script-src allows self and Stripe', () => {
    expect(content).toContain('https://js.stripe.com')
    expect(content).toMatch(/script-src.*'self'/)
  })

  it('CSP img-src allows self and Cloudinary', () => {
    expect(content).toContain('https://res.cloudinary.com')
    expect(content).toMatch(/img-src.*'self'/)
  })

  it('CSP frame-src allows Stripe checkout and hooks', () => {
    expect(content).toContain('https://hooks.stripe.com')
    expect(content).toMatch(/frame-src/)
  })

  it('middleware sets X-Frame-Options header', () => {
    expect(content).toContain('X-Frame-Options')
    expect(content).toContain('SAMEORIGIN')
  })

  it('middleware sets Strict-Transport-Security header', () => {
    expect(content).toContain('Strict-Transport-Security')
    expect(content).toContain('max-age=63072000')
  })

  it('middleware sets X-Content-Type-Options header', () => {
    expect(content).toContain('X-Content-Type-Options')
    expect(content).toContain('nosniff')
  })

  it('matcher still only contains /admin/:path*', () => {
    expect(content).toContain("'/admin/:path*'")
    expect(content).not.toContain("'/(.*)'")
    expect(content).not.toContain('/api/webhooks')
  })
})
