import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const CSP = [
  "default-src 'self'",
  "script-src 'self' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https://res.cloudinary.com",
  "font-src 'self' https://fonts.gstatic.com",
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  "connect-src 'self' https://api.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
].join('; ')

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('Content-Security-Policy', CSP)
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )
  return response
}

// Wrap NextAuth's auth middleware to add security headers to every response.
// The matcher below is the ONLY path scoped for auth — all other routes pass through
// with only security headers applied.
export default auth(function middleware(req: NextRequest) {
  const response = NextResponse.next()

  // Extract client IP for rate limiters downstream
  const forwardedFor = req.headers.get('x-forwarded-for')
  const clientIp = forwardedFor?.split(',')[0]?.trim() ?? 'unknown'
  response.headers.set('x-client-ip', clientIp)

  return applySecurityHeaders(response)
})

export const config = {
  // CRITICAL: This exact matcher is intentional and must not be changed.
  // '/admin/:path*' = all admin routes require authentication
  // Stripe webhook handler is NOT matched — Stripe retries must reach handler unredirected
  // iCal feed routes are NOT matched — public iCal feeds must be accessible
  matcher: ['/admin/:path*'],
}
