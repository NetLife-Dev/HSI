import { handlers } from '@/lib/auth'

// Force Node.js runtime — this route uses DrizzleAdapter which requires
// TCP connections to PostgreSQL (not available in Edge runtime).
export const runtime = 'nodejs'

export const { GET, POST } = handlers
