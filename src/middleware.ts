export { auth as middleware } from '@/lib/auth'

export const config = {
  // CRITICAL: This exact matcher is intentional and must not be changed.
  // - '/admin/:path*' protects all admin routes
  // - '/api/webhooks/stripe' is NOT matched — Stripe retries must reach the handler directly
  // - '/api/ical/*' is NOT matched — public iCal feeds must be accessible
  // - All other public routes are NOT matched
  matcher: ['/admin/:path*'],
}
