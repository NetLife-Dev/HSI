import { describe, it } from 'vitest'

describe('SEC-06 + SEC-07: Security headers', () => {
  it.todo('middleware sets Content-Security-Policy header on every response')
  it.todo('CSP contains script-src with https://js.stripe.com')
  it.todo('CSP contains img-src with https://res.cloudinary.com')
  it.todo('CSP contains frame-src with https://js.stripe.com')
  it.todo('middleware sets X-Frame-Options: SAMEORIGIN')
  it.todo('middleware sets Strict-Transport-Security header')
})
