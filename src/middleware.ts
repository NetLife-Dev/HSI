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

// Edge-compatible middleware: checks session cookie presence only.
// Full session validation (DB lookup) happens in (admin)/layout.tsx via await auth(),
// which runs in Node.js runtime and has full database access.
// This two-layer approach is required because Edge runtime cannot connect to PostgreSQL.
export default function middleware(req: NextRequest) {
  const response = NextResponse.next()

  // Extract client IP for rate limiters downstream
  const forwardedFor = req.headers.get('x-forwarded-for')
  const clientIp = forwardedFor?.split(',')[0]?.trim() ?? 'unknown'
  response.headers.set('x-client-ip', clientIp)

  // First-pass auth: redirect to /login if no session cookie present.
  // The (admin)/layout.tsx performs the definitive DB-backed session validation.
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  if (isAdminRoute) {
    const sessionCookie =
      req.cookies.get('authjs.session-token') ??
      req.cookies.get('__Secure-authjs.session-token')

    if (!sessionCookie) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return applySecurityHeaders(response)
}

export const config = {
  // CRITICAL: This exact matcher is intentional and must not be changed.
  // '/admin/:path*' = all admin routes require authentication
  // Stripe webhook handler is NOT matched — Stripe retries must reach handler unredirected
  // iCal feed routes are NOT matched — public iCal feeds must be accessible
  matcher: ['/admin/:path*'],
}
