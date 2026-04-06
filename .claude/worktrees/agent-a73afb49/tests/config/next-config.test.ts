import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

describe('OPS-01: next.config.ts', () => {
  const configPath = path.resolve('./next.config.ts')

  it('next.config.ts exists', () => {
    expect(() => readFileSync(configPath, 'utf-8')).not.toThrow()
  })

  it("contains output: 'standalone'", () => {
    const content = readFileSync(configPath, 'utf-8')
    expect(content).toContain("output: 'standalone'")
  })

  it('remotePatterns only allows res.cloudinary.com (no wildcard)', () => {
    const content = readFileSync(configPath, 'utf-8')
    expect(content).toContain('res.cloudinary.com')
    expect(content).not.toContain('hostname: "*"')
    expect(content).not.toContain("hostname: '**'")
  })
})
