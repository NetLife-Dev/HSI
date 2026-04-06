// Middleware — full implementation in Plan 03 (01-03)
// This stub satisfies the test contract established in Plan 01.
// Matcher is scoped to /admin/:path* only.
// Stripe and other public API routes are NOT covered.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
