export { auth as middleware } from '@/lib/auth'

export const config = {
  // CRITICAL: This exact matcher is intentional and must not be changed.
  // - '/admin/:path*' protects all admin routes
  // - Stripe webhook handler is NOT matched — Stripe retries must reach the handler directly
  // - iCal feed routes are NOT matched — public feeds must be accessible without auth
  // - All other public routes are NOT matched
  matcher: ['/admin/:path*'],
}
