# Research Summary — HSI (HostSemImposto)

**Project:** HSI — Self-hosted direct booking system for Brazilian vacation rental hosts
**Domain:** Single-instance per-client booking platform with OTA calendar sync
**Researched:** 2026-04-04
**Confidence:** HIGH

---

## Critical Decisions (non-negotiable findings)

These are findings where the research converges on a single correct approach. Deviation is high-risk.

1. **All monetary values must be stored as integer centavos.** Never `DECIMAL` or `FLOAT`. JavaScript float multiplication produces silent rounding errors that break Stripe's integer-only API. Establish the centavo convention before writing a single query.

2. **Stripe webhook handler must call `request.text()` as the absolute first operation.** Calling `.json()` first permanently corrupts the raw bytes needed for signature verification. This is the single most-reported webhook bug in the Next.js ecosystem.

3. **NextAuth middleware must explicitly exclude `/api/webhooks/*` from its matcher.** Without this, Stripe webhook delivery silently returns 302 to the login page; Stripe retries for 3 days and never confirms any booking.

4. **Use database session strategy (not JWT) for admin auth.** JWT sessions cannot be immediately invalidated when a staff member is removed. Database sessions enable instant role revocation. The extra DB query per admin request is acceptable.

5. **`NEXT_PUBLIC_*` environment variables must be set in EasyPanel before the first build.** They are baked into the bundle at build time. Setting them after build has zero effect until a full rebuild. This will break Stripe success/cancel URLs and all canonical URLs.

6. **Every Server Action and Route Handler must re-validate the session independently.** Middleware auth alone is insufficient — CVE-2025-29927 demonstrated that middleware can be bypassed. Defense-in-depth requires `await auth()` inside every handler that touches sensitive data.

7. **Never run `drizzle-kit push` against a production database.** It bypasses migration history entirely. Production must always use `drizzle-kit generate` + `migrate()` at startup with retry logic.

8. **Use signed Cloudinary uploads exclusively.** Unsigned upload presets are public; any person can exhaust storage and bandwidth quota. The signature endpoint must be authenticated (admin only) and rate-limited.

9. **Pricing must be recalculated server-side on every checkout session creation.** Never accept a client-submitted total. The server receives `(propertyId, checkIn, checkOut, numGuests)` and computes the total independently.

10. **`output: 'standalone'` is mandatory in `next.config.ts`.** Without it, Nixpacks either produces a multi-GB image or fails to serve static assets. After enabling standalone, `.next/static` and `public/` must be copied into `.next/standalone/` during the build.

---

## Stack Versions (pinned)

| Package | Version | Notes |
|---------|---------|-------|
| `next` | `^15.5.14` | Pin to 15.x; npm `latest` now points to 16.x |
| `react` / `react-dom` | `19.x` | Bundled with Next.js 15 App Router |
| `typescript` | `5.6+` | Enable `"strict": true`, no exceptions |
| `drizzle-orm` | `0.45.2` | |
| `drizzle-kit` | `0.31.10` | Dev only; never run `push` in production |
| `postgres` | latest | Use `postgres` npm package, not `pg` |
| `next-auth` | `5.0.0-beta.28+` | Install with `next-auth@beta` |
| `@auth/drizzle-adapter` | `1.11.1` | |
| `tailwindcss` | `4.1.x` (4.2.2) | Config is CSS-only via `@theme`; no `tailwind.config.js` |
| `@tailwindcss/postcss` | latest | Required PostCSS plugin for Tailwind v4 |
| `tw-animate-css` | latest | Replaces `tailwindcss-animate` in Tailwind v4 |
| `motion` | `12.38.0` | Import from `motion/react` (not `framer-motion`) |
| `stripe` | latest | Rapid major increments; always use latest |
| `resend` | `4.x` | |
| `@react-email/components` | `0.0.x` | |
| `cloudinary` | `2.x` | Node.js SDK |
| `zod` | `4.3.6` | v4 stable (Aug 2025); use `z.infer`, `safeParse`, `prettifyError` |
| `isomorphic-dompurify` | `2.x` | Prefer v2.x; v3.x has jsdom@28 ESM breakage |
| `node-ical` | latest | iCal parsing |
| `node-cron` | latest | In-process cron scheduler |
| `@react-pdf/renderer` | latest | PDF generation; no Puppeteer/Chromium |
| `prisma` + `@prisma/client` | `7.6.0` | **devDependency only** — Prisma Studio inspection, never runtime |
| PostgreSQL | `16.x` or `17.x` | |

**Critical overrides to add to `package.json`:**
```json
{
  "overrides": {
    "jsdom": "25.0.1"
  }
}
```

**Critical environment variable in EasyPanel build:**
- `PRISMA_GENERATE_SKIP_AUTOINSTALL=true` — prevents Prisma from running `prisma generate` during Nixpacks build

---

## Architecture Decisions

### System topology
One Next.js 15 App Router process per client instance on EasyPanel/Nixpacks. One PostgreSQL database. No external queues, no Redis, no worker processes. Simplicity is the primary constraint. Every architecture decision must prefer the simpler option that works at single-instance scale.

### Route group structure
Three groups: `(public)` (guest-facing, cinematic, no auth), `(admin)` (protected, dark shell, all `/admin/*` routes), and `(auth)` (login/verify, minimal layout). URL prefix `/admin/` is explicit in the filesystem even inside the route group so paths are bookmarkable.

### Four Route Handlers (not Server Actions) are mandatory
- `POST /api/webhooks/stripe` — raw body processing; cannot be a Server Action
- `GET /api/ical/[propertyId]` — public `.ics` export; must be unauthenticated
- `POST /api/upload/signature` — Cloudinary signature generation; auth required
- `GET /api/pdf/[type]/[id]` — streaming PDF response; auth required

### Availability model
Date-range rows in `blocked_dates` (property_id, start_date, end_date, source). Never day-by-day rows. Conflict detection uses PostgreSQL `OVERLAPS` with a `SELECT ... FOR UPDATE` lock on the property row inside a transaction to prevent race conditions at checkout.

### Cron
`node-cron` initialized inside `instrumentation.ts` (gated to `NEXT_RUNTIME === 'nodejs'`). Runs iCal sync every 30 minutes. This keeps iCal sync logic inside the Next.js app while scheduling is handled by a persistent in-process timer — appropriate for a single always-on EasyPanel container.

### Server Actions co-location
Actions live in `actions.ts` within each feature directory, not in a global `/actions` root folder. Shared validation schemas in `lib/validations/` are imported by both actions and route handlers.

### PDF generation
`@react-pdf/renderer` (pure JS, ~5MB, no Chromium). Generates booking vouchers and commercial proposals. Streamed from Route Handlers. Puppeteer is explicitly rejected — 300MB binary + cold-start memory spikes are incompatible with a shared EasyPanel VPS.

### Drizzle / Prisma coexistence
Drizzle owns all migrations and all runtime queries. Prisma is a `devDependency` only, used exclusively for `prisma studio` visual inspection. Never import `@prisma/client` in application code. Run `prisma db pull` (not `prisma migrate`) after every Drizzle migration to keep Studio in sync.

### Schema highlights
- `properties.amenities` — JSONB column, not a join table (always read together with property; GIN index if filter-by-amenity is later needed)
- `properties.base_price_cents` — integer, BRL centavos
- `bookings.stripe_event_id` — last processed webhook event ID for idempotency
- `processed_webhook_events` table — primary idempotency store for Stripe events
- `audit_log` uses `BIGSERIAL` primary key (high write volume); entity indexes on `(entity_type, entity_id)` and `(user_id, created_at DESC)`
- All monetary columns are `INT` (centavos), no `DECIMAL` or `FLOAT` anywhere

---

## Feature Priorities

### v1 — Must ship for any host to use HSI in production

| Feature | Dependency |
|---------|-----------|
| Property CRUD (images, base pricing) | — |
| Availability calendar with manual blocking | Property CRUD |
| iCal export (HSI → OTAs) | Availability + Bookings |
| iCal import (OTAs → HSI, 30-min cron) | Availability |
| Server-side pricing engine (seasonal rules) | Property CRUD |
| Booking widget (date picker + price quote) | Pricing engine + Availability |
| Stripe checkout — card + Pix | Booking widget |
| Stripe webhook handler (confirm + expire events) | Stripe checkout |
| Booking confirmation email + PDF voucher | Stripe webhook |
| Admin dashboard — booking list + basic KPIs | Bookings |
| Guest CRM — name, email, stay history | Bookings |
| Audit log | Auth + every mutation |

### v2 — Defer post-launch

- Post-stay nurture email sequences (automated, 30/90/180 days)
- Abandonment recovery email (requires email capture before Stripe redirect)
- Financial export — CSV for Carnê-Leão / accountant (useful but hosts can calculate manually initially)
- Staff permission system beyond owner/staff binary (multi-employee operations)
- Commercial proposal generator (PDF)
- Pix installments / parcelamento (Stripe Brazil feature — validate availability per-instance)

### Anti-features (do not build)

- Forced guest account creation at booking (kills conversion by ~35%)
- In-app guest messaging (WhatsApp deep-link is sufficient for Brazilian market)
- Algorithmic / market-aware dynamic pricing (PriceLabs territory; rule-based pricing covers 90% of small-host needs)
- Multiple currency support (BRL only; Brazil-only product)
- Boleto bancário payment (slow 1–3 day confirmation, being displaced by Pix)
- Review and moderation system (manual testimonial insertion is sufficient for v1)
- Native mobile app (PWA-quality responsive web covers 95% of use case)

### Brazilian market non-negotiables

- Pix payment via Stripe/EBANX (93% adult adoption; 60M Brazilians without cards) — build v1 with both card and Pix
- All guest-facing UI in pt-BR
- Currency formatted as `R$ 1.450,00` (dot as thousands, comma as decimal)
- Dates as DD/MM/YYYY
- "Book direct and save" callout — multiply total by 1.15 to show estimated OTA price, display savings

---

## Build Order

The ARCHITECTURE.md phase recommendations and FEATURES.md dependency chain converge on this order. Phases 1–3 are strictly sequential. Phases 4 and 5 can partially parallelize after Phase 3 is complete.

### Phase 1 — Foundation (blocks everything)
1. Drizzle schema — all tables, all migrations, startup `migrate()` with retry logic
2. NextAuth v5 + Drizzle adapter — database session strategy, credentials + magic link
3. Middleware auth guard — matcher excludes `/api/webhooks/*` and `/api/ical/*` from day one
4. Audit log infrastructure — `logAction()` helper wired before any mutations exist
5. EasyPanel/Nixpacks config — `output: 'standalone'`, all env vars set, `PRISMA_GENERATE_SKIP_AUTOINSTALL=true`
6. Admin shell layout — sidebar, dark mode, route groups, basic navigation

**Why first:** Auth, schema, and deployment config are hard dependencies for every subsequent phase. The middleware exclusion bug and auth strategy must be decided here, not retrofitted.

### Phase 2 — Property Core
1. Property CRUD (create, edit, soft-delete) — admin forms with Zod validation
2. Cloudinary signed upload integration — signature endpoint (auth-gated, rate-limited) + `CldUploadWidget`
3. Property image gallery management — `property_images` table, position sorting
4. Seasonal pricing CRUD — `seasonal_prices` table, admin UI
5. Public property listing page — Server Component, SEO-optimized
6. Public property detail page — hero, gallery, quote widget placement (Server Component shell + Client Component widget)

**Why second:** Properties are the data foundation for availability, pricing, and booking. Nothing else is functional without at least one property.

### Phase 3 — Booking Engine (the core value)
1. Pricing calculation — server-only `calculateBookingPrice()` function from `(propertyId, checkIn, checkOut)`
2. Availability conflict detection — `OVERLAPS` query + `FOR UPDATE` transaction pattern
3. Manual date blocking in admin calendar
4. `QuoteWidget` — Client Component, real-time pricing as dates are selected
5. `createCheckoutSession` Server Action — availability re-check → price calculation → booking insert (pending) → Stripe session create
6. Stripe webhook handler — `request.text()` first, idempotency check, `completed` + `expired` events both handled
7. Booking confirmation email — Resend + React Email template (pt-BR)
8. PDF voucher — `@react-pdf/renderer`, streamed from Route Handler, attached to confirmation email

**Why third:** The booking engine is the entire product. All trust signals (price transparency, confirmation email, PDF voucher) must ship together in this phase — a partial booking flow that takes money without confirming is worse than no booking flow.

### Phase 4 — Operations & Sync
1. iCal export endpoint — `/api/ical/[propertyId]` — public, UUID-based URL, `text/calendar` response
2. iCal import — `node-ical` parser, `blocked_dates` upsert, Airbnb off-by-one date fix applied
3. `node-cron` scheduler — initialized in `instrumentation.ts`, runs sync every 30 minutes
4. Conflict resolution — confirmed HSI bookings win over imported iCal blocks; admin notification on conflict
5. Guest CRM — full profile (name, email, phone, CPF optional), stay history, tags, pipeline stage
6. Admin booking management — status lifecycle transitions, cancellation, manual confirmation

**Why fourth:** iCal is required for hosts actively listing on OTAs, but the core booking loop in Phase 3 can be used and validated before OTA sync is wired up. Guest CRM naturally follows the first real bookings.

### Phase 5 — Finance, Polish, and Security Hardening
1. Financial dashboard — RevPAR, ADR, occupancy rate, monthly revenue charts (12-month trend)
2. CSV financial export — per-property, per-booking, monthly totals — Carnê-Leão compatible format
3. PostgreSQL-backed rate limiting for security-sensitive endpoints (login, booking creation, magic link)
4. Staff user management + owner/staff permissions
5. Instance settings page — branding, WhatsApp number, API keys, cancellation policy text
6. Commercial proposal generator (PDF)
7. "Book direct and save" price comparison callout in booking widget
8. Abandonment recovery email (requires email capture before Stripe redirect in booking form)

**Why fifth:** Financial reporting and security hardening are real requirements, but a host can begin taking bookings before they are complete. Phase 5 completes the professional-grade product.

---

## Known Pitfalls to Avoid

Ranked by risk. All 10 are verified against official sources or widely-reported production bugs.

| # | Pitfall | Risk | Prevention |
|---|---------|------|-----------|
| 1 | `request.json()` called before Stripe signature verification | Critical | `await request.text()` is the first and only body access in webhook handler; never call `.json()` in that file |
| 2 | `drizzle-kit push` run against production database | Critical | CI guard rejecting push in any deploy script; production uses `generate` + `migrate()` at startup |
| 3 | Unsigned Cloudinary upload preset used in production | Critical | Signed uploads from day one; signature endpoint requires active admin session |
| 4 | `NEXT_PUBLIC_*` vars not set before first EasyPanel build | Critical | Deployment checklist; all env vars configured in EasyPanel before triggering initial build |
| 5 | Auth middleware intercepting Stripe webhook route | High | Middleware matcher excludes `/api/webhooks/*` — configured in Phase 1 before any other routes exist |
| 6 | Stripe webhook processed twice (duplicate booking confirmation) | High | `processed_webhook_events` table checked on every webhook before processing; return 200 immediately on duplicate |
| 7 | `checkout.session.expired` webhook not handled | High | Implement the `expired` case in the same pass as `completed` — blocked dates must be released on expiry |
| 8 | JWT session strategy for admin (cannot be invalidated immediately) | High | Database session strategy configured in `auth.ts` for admin; JWT acceptable only at edge/middleware level |
| 9 | Float arithmetic for BRL monetary values | High | All monetary DB columns are `INT` centavos; `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` for display only |
| 10 | Middleware as sole auth guard (CVE-2025-29927) | High | Every Server Action and Route Handler calls `await auth()` independently; middleware is the first filter, not the only filter |

**Additional pitfalls to wire in at specific phases:**

- **Phase 1:** Custom columns on `users` table must be nullable or have defaults — the Drizzle adapter does not know about them and will fail `NOT NULL` inserts
- **Phase 2:** `CLOUDINARY_API_SECRET` must never have `NEXT_PUBLIC_` prefix; signature endpoint must hardcode folder and allowed formats server-side
- **Phase 3:** Booking creation must use a Drizzle transaction for DB operations; Stripe call is external to the transaction (cannot be rolled back)
- **Phase 4:** iCal import must add 1 day to Airbnb `DTEND` values in `DATE` format (documented Airbnb off-by-one bug since 2023)
- **Phase 5:** In-memory rate limiting is acceptable for DDoS protection but not for security-sensitive endpoints (login, booking); use PostgreSQL-backed rate limiting for those

---

## Open Questions

These need validation before or during Phase 1/Phase 3 implementation:

| Question | Impact | How to Validate |
|----------|--------|-----------------|
| **Pix via Stripe/EBANX availability** — Does the host's Stripe Brazil account support Pix? EBANX partnership launched Aug 2025 but account-level enablement may require manual activation | High — Pix is a differentiator and Brazilian market need | Check Stripe Dashboard under "Payment methods" for a Brazilian Stripe account; consult Stripe Brazil docs before building the checkout flow |
| **Pix transaction limit** — Stripe/EBANX reportedly caps Pix transactions at ~$3,000 USD per transaction | Medium — affects premium properties | Verify current limit in Stripe docs; add a server-side guard that falls back to card-only if booking total exceeds the limit |
| **Parcelamento (credit card installments)** — Stripe Brazil may support 2x/3x installments | Medium — strong Brazilian cultural expectation | Verify against current Stripe Brazil documentation; if supported, add to Phase 3 checkout options |
| **EasyPanel cron approach for iCal** — Research found a conflict: ARCHITECTURE.md recommends `node-cron` in-process; PITFALLS.md warns that in-process scheduling is unreliable and recommends an external cron service | Medium — affects iCal sync reliability | For EasyPanel single-container deployments, `node-cron` in `instrumentation.ts` is the pragmatic choice; if uptime monitoring shows gaps, add an EasyPanel cron service calling `/api/internal/sync-icals` as a fallback |
| **isomorphic-dompurify version** — v2.x vs v3.x with pinned jsdom@25 | Low — implementation detail | Start with v2.x; test v3.x + jsdom@25 override; use whichever passes `npm run build` cleanly |
| **NextAuth v5 long-term maintenance** — maintainer departed Jan 2025; project absorbed into Better Auth | Low for v1 (security patches committed) — Medium for v2+ | Proceed with NextAuth v5 as specified; evaluate migration to Better Auth when v2 feature work begins |

---

## Executive Summary

HSI is a single-tenant, per-instance direct booking system for Brazilian vacation rental hosts — architecturally closer to a boutique SaaS product deployed per client than to a traditional multi-tenant platform. The research is unanimous on the core approach: Next.js 15 App Router (not Pages Router), server-side pricing calculations only, PostgreSQL with Drizzle for migrations, and Stripe Checkout for payments. The stack choices are individually well-documented, but several integration points between them carry high-risk pitfalls that must be pre-empted from day one rather than discovered in production.

The primary business driver is the 2024 Brazilian tax reform, which creates financial urgency for hosts with more than 3 properties or over R$240k/year in rental income to move toward direct bookings. This sets the feature priority clearly: the booking engine (availability, pricing, Stripe checkout, confirmation email) is the core product; everything else extends it. Pix payment support is non-negotiable for the Brazilian market — 93% adult adoption and 60 million Brazilians without credit cards means card-only checkout is a material conversion problem, not a nice-to-have. The cinematic property page aesthetic is likewise a strategic differentiator, not decoration — most direct booking sites look amateurish, and a boutique-hotel-quality presentation directly supports higher perceived value and conversion.

The highest-risk area is the deployment pipeline: `NEXT_PUBLIC_*` variables baked at build time, standalone output requirements, and migration-at-startup timing are all EasyPanel/Nixpacks-specific constraints that differ from Vercel-hosted Next.js and will not be obvious from standard documentation. The second highest-risk area is the Stripe integration, where three independent pitfalls (raw body, middleware interception, missing expiry handler) must all be implemented correctly simultaneously or the booking flow is broken. The recommended mitigation for both risk areas is to build and test the deployment config and Stripe webhook handler completely in Phase 1 and Phase 3 respectively, before any other features are built on top of them.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All package versions verified via npm registry and official docs as of 2026-04-04 |
| Features | HIGH | Table stakes and differentiators verified against multiple industry sources; Brazilian market data (Pix adoption, tax reform) verified via official Receita Federal and Stripe sources |
| Architecture | HIGH (core) / MEDIUM (iCal, PDF) | Next.js + Stripe + Cloudinary patterns are well-documented; iCal sync approach and PDF generation are inferred from best practices with fewer direct references |
| Pitfalls | HIGH | All critical pitfalls verified against official docs, GitHub issues, or CVE references; EasyPanel-specific behavior is MEDIUM (sparse official documentation) |

**Overall confidence:** HIGH for all decisions needed to start Phase 1. Two open questions (Pix availability, parcelamento) require validation before Phase 3 checkout implementation but do not block Phase 1 or Phase 2.

---

## Sources

### Primary (HIGH confidence — official docs or CVE)
- [Next.js 15 Release Blog](https://nextjs.org/blog/next-15) — async request APIs, caching defaults, `after()`, `instrumentation.js`
- [Auth.js Drizzle Adapter](https://authjs.dev/getting-started/adapters/drizzle) — adapter setup, schema requirements
- [Drizzle ORM Migrations](https://orm.drizzle.team/docs/migrations) — `generate` + `migrate()` pattern, production rules
- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide) — `@theme` config, removed utilities
- [shadcn/ui Tailwind v4 Guide](https://ui.shadcn.com/docs/tailwind-v4) — component migration
- [Stripe Pix Documentation](https://docs.stripe.com/payments/pix) — Pix as payment method type
- [Stripe Checkout Abandoned Carts](https://docs.stripe.com/payments/checkout/abandoned-carts) — recovery mechanism
- [Zod v4 Release Notes](https://zod.dev/v4) — breaking changes from v3
- [Next.js Standalone Output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) — standalone mode requirements
- [CVE-2025-29927 Middleware Bypass](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass) — defense-in-depth rationale
- [Receita Federal Tax Reform 2026](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2026/janeiro/) — Brazilian tax context
- [Motion React docs](https://motion.dev/docs/react-motion-component) — package rename, `motion/react-client`

### Secondary (MEDIUM confidence — community consensus, multiple sources)
- [Stripe webhook raw body — Next.js GitHub issue #60002](https://github.com/vercel/next.js/issues/60002) — confirmed pattern
- [Auth.js absorbed into Better Auth](https://news.ycombinator.com/item?id=45389293) — maintenance trajectory
- [node-ical library](https://github.com/jens-maus/node-ical) — iCal parsing, `datetype` property for Airbnb off-by-one fix
- [EasyPanel Next.js Quickstart](https://easypanel.io/docs/quickstarts/nextjs) — deployment patterns
- [Airbnb iCal off-by-one community report](https://community.withairbnb.com/t5/Ask-about-your-listing/Airbnb-iCal-link-shows-incorrect-dates/td-p/2001292) — date bug confirmation
- [isomorphic-dompurify jsdom ESM issue](https://github.com/kkomelin/isomorphic-dompurify) — v3 breakage, jsdom@25 fix
- [Stripe/EBANX Pix Brazil launch (Aug 2025)](https://www.prnewswire.com/news-releases/stripe-users-can-now-accept-pix-in-brazil-via-ebanx-302526007.html)
- Multiple Baymard Institute / hostAI / StayFi sources on vacation rental UX and conversion patterns

---

*Research completed: 2026-04-04*
*All 4 research files synthesized: STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md*
*Ready for roadmap: yes*
