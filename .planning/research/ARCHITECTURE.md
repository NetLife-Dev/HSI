# Architecture Patterns

**Project:** HSI — HostSemImposto
**Domain:** Self-hosted vacation rental booking system (single-instance per client)
**Researched:** 2026-04-04
**Overall confidence:** HIGH (Next.js/Stripe/Cloudinary patterns) | MEDIUM (iCal, rate limiting, PDF)

---

## System Overview

HSI runs as a single Next.js 15 App Router process per client deployment on EasyPanel/Nixpacks.
One process, one PostgreSQL database, zero external queues in v1. Simplicity is an asset.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EasyPanel (VPS)                             │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   Next.js 15 App Router                      │   │
│  │                                                              │   │
│  │  ┌─────────────────┐      ┌──────────────────────────────┐  │   │
│  │  │  (public) group │      │       (admin) group          │  │   │
│  │  │                 │      │                              │  │   │
│  │  │  / (home)       │      │  /admin/dashboard            │  │   │
│  │  │  /imoveis       │      │  /admin/imoveis              │  │   │
│  │  │  /imoveis/[slug]│      │  /admin/reservas             │  │   │
│  │  │  /reservar      │      │  /admin/hospedes             │  │   │
│  │  │  /confirmacao   │      │  /admin/financeiro           │  │   │
│  │  └─────────────────┘      │  /admin/configuracoes        │  │   │
│  │                           └──────────────────────────────┘  │   │
│  │  ┌───────────────────────────────────────────────────────┐  │   │
│  │  │                  Route Handlers (API)                  │  │   │
│  │  │  /api/webhooks/stripe   (raw body, no auth)           │  │   │
│  │  │  /api/ical/[propertyId] (public .ics export)          │  │   │
│  │  │  /api/upload/signature  (auth required)               │  │   │
│  │  │  /api/pdf/[type]/[id]   (auth required)               │  │   │
│  │  └───────────────────────────────────────────────────────┘  │   │
│  │                                                              │   │
│  │  middleware.ts  ──  auth guard on /admin/**                  │   │
│  └──────────────────────────────────────────────────────────┘   │   │
│                           │                                     │   │
│                    ┌──────▼──────┐                              │   │
│                    │ PostgreSQL   │                              │   │
│                    └─────────────┘                              │   │
└─────────────────────────────────────────────────────────────────────┘

External Services (env vars per instance):
  Stripe ──────► /api/webhooks/stripe
  Cloudinary ──► upload widget (client) + server signature
  Resend ──────► triggered from Server Actions / webhook handler
  Airbnb/VRBO ─► iCal pull (node-cron inside process) + export endpoint
```

---

## Route Architecture

### Route Group Structure

```
app/
├── (public)/                        ← No auth required, public-facing
│   ├── layout.tsx                   ← Cinematic layout: Geist + Instrument Serif, light
│   ├── page.tsx                     ← Home: hero, date search, property grid
│   ├── imoveis/
│   │   └── [slug]/
│   │       └── page.tsx             ← Property detail: hero, gallery, quote widget
│   ├── reservar/
│   │   └── page.tsx                 ← Booking flow: dates → guest info → Stripe checkout
│   └── confirmacao/
│       └── page.tsx                 ← Post-payment success page
│
├── (admin)/                         ← Protected. All routes require auth session.
│   ├── layout.tsx                   ← Admin shell: collapsible sidebar, dark mode
│   ├── admin/
│   │   ├── dashboard/page.tsx
│   │   ├── imoveis/
│   │   │   ├── page.tsx             ← Property list
│   │   │   ├── novo/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── disponibilidade/page.tsx
│   │   ├── reservas/
│   │   │   ├── page.tsx             ← Reservations list
│   │   │   └── [id]/page.tsx
│   │   ├── hospedes/page.tsx        ← Guest CRM + kanban pipeline
│   │   ├── financeiro/page.tsx      ← Cash flow + proposals
│   │   ├── usuarios/page.tsx        ← Staff management
│   │   └── configuracoes/page.tsx   ← Instance settings (branding, keys)
│
├── (auth)/                          ← Login/magic-link pages (no admin shell)
│   ├── layout.tsx                   ← Minimal centered layout
│   ├── login/page.tsx
│   └── verify/page.tsx              ← Magic link verification
│
└── api/
    ├── webhooks/
    │   └── stripe/route.ts          ← Raw body; NO Server Action
    ├── ical/
    │   └── [propertyId]/route.ts    ← Returns .ics export
    ├── upload/
    │   └── signature/route.ts       ← Cloudinary signature generation
    └── pdf/
        └── [type]/[id]/route.ts     ← PDF streaming response
```

**Key rule:** URL for admin pages uses `/admin/` prefix even inside the `(admin)` route group,
so `/admin/dashboard` is explicit and bookmarkable. The route group merely applies the admin layout
without adding another URL segment.

### Middleware Auth Pattern

```typescript
// middleware.ts — at project root
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
  const isLoggedIn = !!req.auth

  if (isAdminRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*"],
}
```

**CRITICAL — CVE-2025-29927:** Middleware auth is the entry-point guard, not the only guard.
Every Server Action and Route Handler that touches sensitive data MUST re-validate the session
independently with `auth()` or `getServerSession()`. Never trust middleware as the sole check.

---

## Component Map

```
lib/
├── auth.ts                    ← NextAuth v5 config (Drizzle adapter, magic link, credentials)
├── db/
│   ├── index.ts               ← Drizzle client (singleton, lazy-connect)
│   └── schema/
│       ├── auth.ts            ← NextAuth required tables
│       ├── properties.ts      ← properties, amenities, property_images
│       ├── bookings.ts        ← bookings, booking_guests
│       ├── availability.ts    ← blocked_dates, ical_feeds, ical_blocks
│       ├── guests.ts          ← guests, guest_tags, guest_pipeline_stage
│       ├── financial.ts       ← transactions, proposals
│       ├── users.ts           ← admin_users, roles, permissions
│       ├── audit.ts           ← audit_log
│       └── index.ts           ← re-exports all schemas
├── stripe.ts                  ← Stripe SDK singleton
├── cloudinary.ts              ← Cloudinary SDK + signature helper
├── resend.ts                  ← Resend SDK singleton
├── ical/
│   ├── parser.ts              ← node-ical wrapper: fetch URL → blocked date ranges
│   ├── exporter.ts            ← Build .ics string from confirmed bookings
│   └── sync.ts                ← Orchestrator: fetch all feeds → upsert blocks → detect conflicts
├── pdf/
│   └── generator.ts           ← @react-pdf/renderer render-to-stream wrapper
├── rate-limit.ts              ← In-memory token bucket (Map + timestamp, no Redis)
└── validations/               ← Shared Zod schemas (reused in SA + API routes)

components/
├── public/                    ← Face pública (Framer Motion, Instrument Serif)
│   ├── PropertyHero.tsx
│   ├── PropertyGallery.tsx
│   ├── QuoteWidget.tsx        ← Date picker + pricing preview (Client Component)
│   └── BookingForm.tsx
└── admin/                     ← Admin UI (Shadcn primitives, dark mode)
    ├── Sidebar.tsx
    ├── PropertyForm.tsx
    ├── AvailabilityCalendar.tsx
    ├── BookingKanban.tsx
    └── GuestCRM.tsx
```

---

## Database Schema

### Design Decisions

**Availability model:** Hybrid approach.
- Use a `blocked_dates` table with `(property_id, start_date, end_date, source)` — date-range rows.
- Do NOT use a day-by-day calendar table — it creates 365+ rows/year/property for no benefit at this scale.
- Conflict detection runs with a simple OVERLAPS query: `(start_date, end_date) OVERLAPS (req_start, req_end)`.
- Booking confirmation atomically inserts a `blocked_dates` row and updates booking status in one transaction.

**Amenities:** JSONB column on `properties` table, not a separate join table.
Rationale: amenities are always read together with the property, never queried independently. JSONB avoids the join and keeps migrations simple. If filtering by amenity becomes a requirement, add a GIN index.

**Pricing:** `base_price_cents` on properties + a `seasonal_prices` table for date ranges.
The pricing engine runs exclusively server-side — never trust client-submitted prices.

**Soft deletes:** `deleted_at TIMESTAMPTZ` on properties, bookings, and guests. Hard delete for PII only on explicit guest removal request.

### Schema Outline

```sql
-- Auth (NextAuth v5 Drizzle Adapter required tables)
users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT,
  email       TEXT UNIQUE NOT NULL,
  email_verified TIMESTAMPTZ,
  image       TEXT,
  password_hash TEXT,          -- for credentials provider
  role        TEXT DEFAULT 'staff', -- 'owner' | 'staff'
  created_at  TIMESTAMPTZ DEFAULT now()
)

accounts (
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type              TEXT NOT NULL,
  provider          TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token     TEXT,
  access_token      TEXT,
  expires_at        INT,
  token_type        TEXT,
  scope             TEXT,
  id_token          TEXT,
  session_state     TEXT,
  PRIMARY KEY (provider, provider_account_id)
)

sessions (
  session_token TEXT PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires       TIMESTAMPTZ NOT NULL
)

verification_tokens (
  identifier TEXT NOT NULL,
  token      TEXT NOT NULL,
  expires    TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
)

-- Properties
properties (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT UNIQUE NOT NULL,
  name             TEXT NOT NULL,
  description      TEXT,                    -- sanitized HTML (DOMPurify before insert)
  location         TEXT,
  address          TEXT,
  max_guests       INT NOT NULL DEFAULT 2,
  bedrooms         INT NOT NULL DEFAULT 1,
  bathrooms        INT NOT NULL DEFAULT 1,
  base_price_cents INT NOT NULL,            -- BRL cents, e.g. 45000 = R$ 450,00
  cleaning_fee_cents INT NOT NULL DEFAULT 0,
  amenities        JSONB DEFAULT '[]',      -- ["wifi","pool","ac",...]
  check_in_time    TIME DEFAULT '15:00',
  check_out_time   TIME DEFAULT '11:00',
  min_nights       INT DEFAULT 2,
  active           BOOLEAN DEFAULT true,
  cover_image_url  TEXT,
  cloudinary_folder TEXT,                  -- e.g. "hsi/property-abc123"
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now(),
  deleted_at       TIMESTAMPTZ
)

property_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  cloudinary_id TEXT NOT NULL,
  url           TEXT NOT NULL,
  alt_text      TEXT,
  position      INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
)

seasonal_prices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id    UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  label          TEXT,                   -- "Carnaval 2025", "Alta temporada"
  start_date     DATE NOT NULL,
  end_date       DATE NOT NULL,
  price_cents    INT NOT NULL,
  priority       INT DEFAULT 0,          -- higher wins on overlap
  created_at     TIMESTAMPTZ DEFAULT now()
)

-- Guests / CRM
guests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  email          TEXT,
  phone          TEXT,
  document       TEXT,                   -- CPF/Passaporte
  notes          TEXT,
  tags           TEXT[] DEFAULT '{}',
  pipeline_stage TEXT DEFAULT 'lead',    -- 'lead'|'prospect'|'cliente'|'vip'
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now(),
  deleted_at     TIMESTAMPTZ
)

-- Bookings
bookings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id         UUID NOT NULL REFERENCES properties(id),
  guest_id            UUID REFERENCES guests(id),
  check_in            DATE NOT NULL,
  check_out           DATE NOT NULL,
  num_guests          INT NOT NULL DEFAULT 1,
  status              TEXT NOT NULL DEFAULT 'pending',
  -- status values: pending | awaiting_payment | confirmed | checked_in
  --                checked_out | cancelled | no_show
  subtotal_cents      INT NOT NULL,
  cleaning_fee_cents  INT NOT NULL DEFAULT 0,
  discount_cents      INT DEFAULT 0,
  total_cents         INT NOT NULL,
  payment_method      TEXT,              -- 'stripe' | 'pix' | 'transfer' | 'cash'
  stripe_session_id   TEXT UNIQUE,       -- links webhook → booking
  stripe_payment_intent_id TEXT,
  stripe_event_id     TEXT,              -- idempotency: last processed webhook event id
  notes               TEXT,
  source              TEXT DEFAULT 'direct', -- 'direct'|'airbnb'|'booking'|'vrbo'|'manual'
  cancelled_at        TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  deleted_at          TIMESTAMPTZ
)

-- Availability & iCal
blocked_dates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  source      TEXT NOT NULL DEFAULT 'manual',
  -- source values: 'manual' | 'booking' | 'ical:{feed_id}'
  booking_id  UUID REFERENCES bookings(id) ON DELETE SET NULL,
  ical_uid    TEXT,                      -- VEVENT UID from iCal feed
  label       TEXT,                      -- "Manutenção", "Airbnb booking", etc.
  created_at  TIMESTAMPTZ DEFAULT now()
)

ical_feeds (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id  UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,            -- "Airbnb", "VRBO"
  url          TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ,
  last_error   TEXT,
  active       BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
)

-- Financial
transactions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id     UUID REFERENCES bookings(id),
  type           TEXT NOT NULL,          -- 'income' | 'expense' | 'refund'
  category       TEXT,
  amount_cents   INT NOT NULL,
  description    TEXT,
  date           DATE NOT NULL,
  created_by     UUID REFERENCES users(id),
  created_at     TIMESTAMPTZ DEFAULT now()
)

-- Audit Log
audit_log (
  id          BIGSERIAL PRIMARY KEY,      -- high-volume: bigserial, not UUID
  user_id     UUID REFERENCES users(id),
  action      TEXT NOT NULL,             -- 'booking.confirmed', 'property.updated', etc.
  entity_type TEXT NOT NULL,
  entity_id   UUID,
  old_value   JSONB,
  new_value   JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
)
-- Index: CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
-- Index: CREATE INDEX idx_audit_user ON audit_log(user_id, created_at DESC);

-- Stripe webhook event idempotency (alternative: use stripe_event_id on bookings)
processed_webhook_events (
  stripe_event_id TEXT PRIMARY KEY,
  processed_at    TIMESTAMPTZ DEFAULT now()
)
```

### Critical Indexes

```sql
-- Availability conflict detection (hot path)
CREATE INDEX idx_blocked_dates_property ON blocked_dates(property_id, start_date, end_date);

-- Booking lookup by Stripe session
CREATE INDEX idx_bookings_stripe_session ON bookings(stripe_session_id);

-- Property public listing (only active)
CREATE INDEX idx_properties_active ON properties(active, created_at DESC) WHERE active = true;

-- iCal dedup by UID per feed
CREATE UNIQUE INDEX idx_ical_blocks_uid ON blocked_dates(ical_uid, property_id)
  WHERE ical_uid IS NOT NULL;
```

---

## Data Flow Diagrams

### Booking Flow (Public → Stripe → Confirmation)

```
Guest selects dates          Property page (Server Component)
        │                    Pricing calculated server-side
        ▼
QuoteWidget (Client)         Shows breakdown: nights × rate + cleaning fee
        │                    Submits to Server Action
        ▼
createCheckoutSession()      Server Action:
  (Server Action)            1. Re-validate dates → OVERLAPS query on blocked_dates
                             2. Calculate total_cents server-side (ignore client price)
                             3. INSERT booking (status='awaiting_payment')
                             4. INSERT blocked_dates (source='booking', optimistic hold)
                             5. stripe.checkout.sessions.create({
                                  mode: 'payment',
                                  line_items: [dynamically created price],
                                  metadata: { booking_id }
                                })
                             6. Return session URL → redirect client
        │
        ▼
Stripe Hosted Checkout        Guest pays
        │
        ▼
/api/webhooks/stripe          Route Handler:
  checkout.session.completed  1. await request.text() → raw body string
                             2. stripe.webhooks.constructEvent(body, sig, secret)
                             3. Check processed_webhook_events for dedup
                             4. UPDATE booking SET status='confirmed'
                             5. Resend: send confirmation email + voucher
                             6. INSERT processed_webhook_events
                             7. Return 200
        │
        ▼
Guest receives email          React Email template with booking details + PDF voucher
```

### iCal Sync Flow

```
node-cron (in-process)        Runs every 30 minutes via node-cron scheduled task
        │                     (EasyPanel: no Dockerfile → in-process cron is simplest)
        ▼
ical/sync.ts                  For each active ical_feed:
                              1. Fetch URL → raw ICS string (node-ical)
                              2. Parse VEVENT blocks → { uid, dtstart, dtend, summary }
                              3. For each event:
                                 - Check blocked_dates for existing ical_uid (dedup)
                                 - If new: INSERT blocked_dates (source='ical:{feed_id}')
                                 - If changed dates: UPDATE
                                 - If removed from feed: DELETE
                              4. UPDATE ical_feeds SET last_synced_at = now()
                              5. Detect conflicts with confirmed bookings → create admin notification

/api/ical/[propertyId]        Export endpoint:
  route.ts                    1. Fetch confirmed bookings for property
                              2. Build VCALENDAR/VEVENT string (ical/exporter.ts)
                              3. Return with Content-Type: text/calendar
                              (Airbnb/VRBO subscribe to this URL)
```

### Cloudinary Upload Flow

```
Admin uploads image           PropertyForm (Client Component)
        │
        ▼
CldUploadWidget               next-cloudinary component
  onUpload callback →         Before upload fires:
                              1. POST /api/upload/signature
                              2. Server validates session (auth() check)
                              3. Server generates signature:
                                 cloudinary.api_sign_request({
                                   folder: `hsi/${propertyId}`,
                                   timestamp,
                                 }, process.env.CLOUDINARY_API_SECRET)
                              4. Returns { signature, timestamp, api_key }
        │
        ▼
CldUploadWidget               Uploads directly to Cloudinary with signature
  uploads to Cloudinary       Returns { secure_url, public_id }
        │
        ▼
Server Action                 savePropertyImage(propertyId, cloudinaryId, url)
  saves to DB                 INSERT INTO property_images (...)
```

---

## Architecture Patterns

### Pattern 1: Pricing is Always Server-Side

**What:** Booking total is never sent from client to server. Client sends `(propertyId, checkIn, checkOut, numGuests)`. Server recalculates price, checking seasonal rates.

**Why:** Prevents price tampering. Required for Stripe dynamic pricing model.

```typescript
// lib/pricing.ts
export async function calculateBookingPrice(
  propertyId: string,
  checkIn: Date,
  checkOut: Date,
): Promise<PriceBreakdown> {
  const nights = differenceInCalendarDays(checkOut, checkIn)
  // Query seasonal_prices for overlapping ranges, fallback to base_price_cents
  // Return { subtotalCents, cleaningFeeCents, totalCents, breakdown }
}
```

### Pattern 2: Stripe Webhook Raw Body

**What:** The Stripe webhook route handler must call `request.text()` before any other body access. Never call `request.json()`.

```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(req: Request) {
  const body = await req.text()                  // RAW — must be first
  const sig = req.headers.get("stripe-signature")!
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new Response("Webhook signature verification failed", { status: 400 })
  }
  // Idempotency check
  const alreadyProcessed = await db.query.processedWebhookEvents.findFirst({
    where: eq(processedWebhookEvents.stripeEventId, event.id),
  })
  if (alreadyProcessed) return new Response("OK", { status: 200 })
  // ... process event
}
```

### Pattern 3: Server Action Co-location

**What:** Server Actions live in `actions.ts` files within the feature directory, not in a global `/actions` folder.

```
app/(admin)/admin/reservas/
├── page.tsx
├── actions.ts        ← "use server" — only reservation mutations
└── [id]/
    ├── page.tsx
    └── actions.ts    ← "use server" — single booking mutations
```

Shared validation schemas (`lib/validations/booking.ts`) are imported by both Server Actions and Route Handlers.

### Pattern 4: Availability Conflict Detection

**What:** Use PostgreSQL OVERLAPS operator in a transaction with FOR UPDATE lock to prevent race conditions on availability.

```typescript
// lib/availability.ts
export async function checkAndBlockDates(
  db: DrizzleDb,
  propertyId: string,
  checkIn: Date,
  checkOut: Date,
  bookingId: string,
): Promise<void> {
  await db.transaction(async (tx) => {
    // Lock property row to prevent concurrent bookings
    await tx.execute(sql`SELECT id FROM properties WHERE id = ${propertyId} FOR UPDATE`)
    
    const conflict = await tx.query.blockedDates.findFirst({
      where: and(
        eq(blockedDates.propertyId, propertyId),
        sql`(${blockedDates.startDate}, ${blockedDates.endDate}) OVERLAPS (${checkIn}::date, ${checkOut}::date)`
      ),
    })
    if (conflict) throw new Error("DATES_UNAVAILABLE")
    
    await tx.insert(blockedDates).values({
      propertyId,
      startDate: checkIn,
      endDate: checkOut,
      source: "booking",
      bookingId,
    })
  })
}
```

### Pattern 5: Audit Log Helper

**What:** A thin wrapper that fires-and-forgets into `audit_log`. Never throws.

```typescript
// lib/audit.ts
export async function logAction(params: {
  userId: string | null
  action: string        // e.g. 'booking.confirmed', 'property.deleted'
  entityType: string
  entityId: string
  oldValue?: unknown
  newValue?: unknown
  ipAddress?: string
}) {
  // Intentional: no await — non-blocking. Audit failure never breaks the main flow.
  db.insert(auditLog).values({ ...params }).catch((err) => {
    console.error("[audit]", err)
  })
}
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Day-by-Day Calendar Table
**What:** Creating one row per day per property to track availability.
**Why bad:** 365 rows/year/property, expensive range scans, complex cleanup. No benefit at this scale.
**Instead:** Date-range rows in `blocked_dates` with OVERLAPS query.

### Anti-Pattern 2: Trusting Client-Submitted Prices
**What:** Accepting `totalCents` from the booking form body.
**Why bad:** Trivial to manipulate. Any guest can pay R$ 1,00 for a week.
**Instead:** Always recalculate price on the server from `(propertyId, checkIn, checkOut)`.

### Anti-Pattern 3: Calling `request.json()` Before Stripe Signature Verification
**What:** Using Next.js body parsing helpers before `stripe.webhooks.constructEvent`.
**Why bad:** Serialization changes the byte representation; signature fails; all webhooks rejected.
**Instead:** `const body = await request.text()` as the first line in the webhook handler.

### Anti-Pattern 4: Middleware as Sole Auth Guard
**What:** Relying only on `middleware.ts` to block unauthenticated access to admin actions.
**Why bad:** CVE-2025-29927 (middleware bypass) demonstrated this is insufficient.
**Instead:** Re-validate session in every Server Action with `const session = await auth(); if (!session) throw new Error("Unauthorized")`.

### Anti-Pattern 5: Puppeteer for PDF in Self-Hosted Setup
**What:** Using Puppeteer/Playwright for PDF generation in the Next.js process.
**Why bad:** Ships ~300MB Chromium binary; first cold render is slow; memory spikes affect the booking flow.
**Instead:** Use `@react-pdf/renderer` (pure JS, no binary dependency, works in Node). Accept its limited CSS subset — design vouchers and proposals within its constraints.

### Anti-Pattern 6: Global Server Actions Directory
**What:** Putting all Server Actions in `/actions` at the root.
**Why bad:** Couples unrelated mutations, breaks colocation, makes code navigation harder.
**Instead:** `actions.ts` within each feature directory.

---

## Technology-Specific Architecture

### iCal Implementation

**Library:** `node-ical` (npm: `node-ical`) — RFC 5545 compliant, async API, handles VTIMEZONE.

**Cron approach:** `node-cron` running inside the Next.js process. EasyPanel without Dockerfile cannot run a separate cron container without `cron-job.org` (external). Since HSI is a single persistent process (not serverless/Vercel), `node-cron` initialized at startup is reliable and zero-infrastructure.

```typescript
// lib/ical/cron.ts — imported once in instrumentation.ts
import cron from "node-cron"
import { syncAllFeeds } from "./sync"

export function startIcalCron() {
  cron.schedule("*/30 * * * *", async () => {
    await syncAllFeeds().catch(console.error)
  })
}
```

```typescript
// instrumentation.ts (Next.js 15 instrumentation hook)
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startIcalCron } = await import("./lib/ical/cron")
    startIcalCron()
  }
}
```

**iCal export format:**
```
Content-Type: text/calendar; charset=utf-8
Content-Disposition: attachment; filename="property-{slug}.ics"
```

### Rate Limiting (No Redis)

Since each HSI instance is a single Node.js process (not distributed, not serverless), an in-memory Map-based token bucket is sufficient and zero-infrastructure.

```typescript
// lib/rate-limit.ts
const store = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = store.get(key)
  
  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true // allowed
  }
  
  if (record.count >= limit) return false // blocked
  
  record.count++
  return true // allowed
}
```

**Limits per route:**

| Route | Limit | Window | Key |
|-------|-------|--------|-----|
| `POST /reservar` (booking creation) | 5 req | 10 min | IP |
| `POST /login` | 10 req | 15 min | IP |
| `GET /api/ical/*` | 60 req | 1 hour | IP |
| Cloudinary signature | 20 req | 1 min | userId |

### PDF Generation

**Library:** `@react-pdf/renderer` — pure JS, no binary, ships well under 5MB, works in Node and on EasyPanel with no special configuration.

**Documents to generate:**
- Booking voucher (guest-facing, sent as email attachment via Resend)
- Commercial proposal (property summary + pricing for potential clients)

**Pattern:** Generate PDF in a Route Handler, stream response.

```typescript
// app/api/pdf/voucher/[bookingId]/route.ts
import { renderToStream } from "@react-pdf/renderer"
import { VoucherDocument } from "@/components/pdf/VoucherDocument"

export async function GET(req: Request, { params }: { params: { bookingId: string } }) {
  const session = await auth()
  if (!session) return new Response("Unauthorized", { status: 401 })
  
  const booking = await getBookingById(params.bookingId)
  const stream = await renderToStream(<VoucherDocument booking={booking} />)
  
  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="voucher-${booking.id}.pdf"`,
    },
  })
}
```

**Constraint:** `@react-pdf/renderer` uses its own layout engine (Yoga). You cannot use Tailwind, standard HTML, or browser CSS inside PDF components. Design PDF templates using its primitives (`<View>`, `<Text>`, `<Image>`). Keep voucher design simple — two columns, property photo, booking table, QR code.

---

## Scalability Considerations

| Concern | At 1 instance (now) | If multi-property grows |
|---------|---------------------|------------------------|
| Availability conflicts | Single PG transaction + FOR UPDATE sufficient | Same — single DB per instance |
| iCal sync | In-process node-cron | Same — single instance |
| PDF generation | Synchronous renderToStream | Queue if >10/min becomes problem |
| Webhook processing | Sequential, idempotency table | Same — Stripe retries handle it |
| Rate limiting | In-memory Map | Fine for single process |
| Image storage | Cloudinary (external) | Already infinite scale |

HSI is explicitly a **single-instance product**. No distributed systems complexity needed. Every architecture decision should optimize for simplicity, not horizontal scalability.

---

## Build Order Recommendations

The schema and core infrastructure must be built before features. Order:

### Phase 1 — Foundation
1. Drizzle schema (all tables, migrations)
2. NextAuth v5 + Drizzle adapter (auth tables, magic link, credentials)
3. Middleware auth guard
4. EasyPanel/Nixpacks environment variable setup
5. Admin shell layout (sidebar, dark mode, route groups)

### Phase 2 — Property Core
1. Property CRUD (create, edit, delete soft)
2. Cloudinary upload integration (signature endpoint + CldUploadWidget)
3. Property image gallery management
4. Seasonal pricing CRUD
5. Public property listing page + detail page

### Phase 3 — Booking Engine
1. Availability/blocked_dates logic + conflict detection
2. Manual date blocking in admin calendar
3. Pricing calculation server function
4. QuoteWidget (public, client component)
5. Stripe checkout session creation (Server Action)
6. Stripe webhook handler (raw body, idempotency)
7. Booking confirmation email (Resend + React Email)
8. PDF voucher generation (@react-pdf/renderer)

### Phase 4 — Operations
1. iCal export endpoint
2. iCal import (node-ical parser + blocked_dates upsert)
3. node-cron in-process scheduler (instrumentation.ts)
4. Guest CRM (CRUD, tags, pipeline stage)
5. Admin booking management (status transitions, audit log)

### Phase 5 — Finance & Admin Polish
1. Transaction ledger + financial dashboard
2. Commercial proposal generator (PDF)
3. Rate limiting on public endpoints
4. Staff user management + permissions
5. Instance settings page (branding, API keys)
6. Admin KPI dashboard

**Critical path:** Phase 1 → Phase 2 → Phase 3 must be sequential. Phases 4 and 5 can parallelize
after Phase 3 is complete.

---

## Sources

- Next.js Route Groups official docs: https://nextjs.org/docs/app/api-reference/file-conventions/route-groups
- Auth.js Drizzle Adapter: https://authjs.dev/getting-started/adapters/drizzle
- CVE-2025-29927 Middleware Bypass: https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass
- Stripe webhook raw body Next.js 15: https://medium.com/@gragson.john/stripe-checkout-and-webhook-in-a-next-js-15-2025-925d7529855e
- Stripe idempotency: https://docs.stripe.com/api/idempotent_requests
- Cloudinary signed uploads Next.js: https://cloudinary.com/blog/guest_post/signed-uploads-in-cloudinary-with-next-js
- next-cloudinary CldUploadWidget signed: https://next.cloudinary.dev/clduploadwidget/signed-uploads
- node-ical library: https://github.com/jens-maus/node-ical
- EasyPanel cron job docs: https://easypanel.io/docs/guides/cron-job
- @react-pdf/renderer vs Puppeteer: https://npmtrends.com/@react-pdf/renderer-vs-puppeteer
- PostgreSQL hotel reservation schema: https://dev.to/chandra179/hotel-reservation-schema-design-postgresql-3i9j
- Property rental DB design: https://www.geeksforgeeks.org/sql/how-to-design-a-relational-database-for-property-rental-and-vacation-booking-platforms/
- Server Actions organization: https://medium.com/@lior_amsalem/nextjs-15-actions-best-practice-bf5cc023301e
- Next.js instrumentation hook: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
