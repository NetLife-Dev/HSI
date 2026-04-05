import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

describe('AUTH-05 + AUTH-06: Middleware matcher', () => {
  const middlewarePath = path.resolve('./src/middleware.ts')

  it('middleware.ts exists at src/middleware.ts', () => {
    // File will be created in Plan 03; this test documents the contract
    // until then it will fail — that is intentional (RED state)
    expect(() => readFileSync(middlewarePath, 'utf-8')).not.toThrow()
  })

  it('matcher contains only /admin/:path* — no wildcard or negative lookahead', () => {
    const content = readFileSync(middlewarePath, 'utf-8')
    expect(content).toContain("'/admin/:path*'")
    // Must NOT contain a broad matcher
    expect(content).not.toContain('/((?!_next)')
    expect(content).not.toContain("'/(.*)'")
  })

  it('matcher does NOT include /api/webhooks/stripe', () => {
    const content = readFileSync(middlewarePath, 'utf-8')
    expect(content).not.toContain('/api/webhooks')
  })
})
