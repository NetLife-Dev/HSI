# Domain Pitfalls — HSI (HostSemImposto)

**Stack:** Next.js 15 App Router · NextAuth v5 · Drizzle ORM · Stripe · Cloudinary · iCal · EasyPanel/Nixpacks
**Researched:** 2026-04-04
**Overall confidence:** HIGH (all claims verified against official docs or multiple credible sources)

---

## Table of Contents

1. [Next.js 15 App Router](#nextjs-15-app-router)
2. [Stripe Integration](#stripe-integration)
3. [NextAuth v5](#nextauth-v5)
4. [Drizzle ORM](#drizzle-orm)
5. [Cloudinary](#cloudinary)
6. [iCal Sync](#ical-sync)
7. [EasyPanel + Nixpacks](#easypanel--nixpacks)
8. [Security — Cross-Cutting](#security--cross-cutting)
9. [Phase-Specific Warnings](#phase-specific-warnings)

---

## Next.js 15 App Router

### Next.js — Server Action Called Without Error Boundary or `useActionState`

**Risk:** High
**Symptom:** Unhandled Server Action rejections crash the entire React tree silently, or throw unhelpful "An error occurred in the Server Components render" messages in production with zero user feedback.
**Root cause:** Server Actions throw exceptions like any async function. Client code that calls them with `startTransition` or `form action` will not surface the error unless the caller explicitly catches it. There is no automatic error boundary wrapping around action calls.
**Prevention:** Every Server Action must return a typed result object (`{ success, error }`) rather than throwing. Wrap the call site in `useActionState` (React 19 / Next.js 15) which surfaces the last action state back to the component. Never `throw` from a Server Action that is invoked directly from a Client Component button — return discriminated union results instead.

---

### Next.js — Missing `revalidatePath` / `revalidateTag` After Mutation

**Risk:** High
**Symptom:** User creates or edits a booking in the admin, the redirect succeeds, but the list still shows the old data. Refreshing fixes it. The bug disappears in development (where caching is looser) and only bites in production.
**Root cause:** In Next.js 15, `fetch` and GET Route Handlers are no longer cached by default, but Server Component page data coming from direct database queries still participates in the full-route cache. If a Server Action mutates data without calling `revalidatePath('/admin/reservations')` or the relevant tag, the cached page HTML is served for the next navigation.
**Prevention:** Every mutating Server Action must end with `revalidatePath` for the affected routes, or better, tag all queries with `unstable_cache` tags and call `revalidateTag`. Add an explicit checklist item to code review: "Does this action revalidate?" Next.js 15 changed caching defaults from Next.js 14 — do not rely on old documentation.

---

### Next.js — Client Component Receives Non-Serializable Prop Across Boundary

**Risk:** High
**Symptom:** Runtime error: "Only plain objects, and a few built-ins, can be passed to Client Components from Server Components. Classes or null prototypes are not supported." Can also manifest as props silently arriving as `undefined` on the client.
**Root cause:** Props crossing the Server→Client boundary are serialized via React's wire format (structured clone). Class instances, `Date` objects, `Map`, `Set`, functions, `undefined` values in objects, and Drizzle query result types with prototype methods all fail serialization. This is particularly tricky because TypeScript types look correct but the runtime explodes.
**Prevention:** Define explicit Data Transfer Object (DTO) types that contain only JSON-serializable primitives and plain objects. Map Drizzle query results to DTOs before passing them to Client Components. Never pass a `Date` object — serialize it to an ISO string on the server and parse it on the client. Test every Server→Client prop boundary explicitly.

---

### Next.js — `use client` Placed Too High, Polluting Server-Renderable Subtree

**Risk:** Medium
**Symptom:** Entire page or large component tree becomes a Client Component bundle. JavaScript bundle grows 2–5x. Server-side data fetching advantages are lost. SEO impact on public-facing pages.
**Root cause:** Developers add `"use client"` to a layout or container component to enable a single piece of interactivity (e.g., a dropdown or animation), which forces the entire subtree to be client-rendered.
**Prevention:** Push `"use client"` as deep as possible into the tree — only on the leaf component that needs interaction. Use the "Server Component passes JSX as `children` prop to a Client Component" pattern to keep surrounding context server-rendered. On the public immersive pages, this is critical for Core Web Vitals.

---

### Next.js — Router Cache Keeps Showing Stale Data After `revalidatePath`

**Risk:** Medium
**Symptom:** Server cache is correctly invalidated. The new data is fetchable. But navigating back to the page in the same browser tab shows old data for 30 seconds. Hard reload fixes it. Users report "the admin is broken."
**Root cause:** Next.js maintains a client-side Router Cache (in-memory) separate from the server-side Full Route Cache. Even after `revalidatePath`, the Router Cache may serve the previous page payload. In Next.js 15, dynamic pages are no longer cached by the Router Cache by default, but static or partially-static pages still are. The two caches interact in subtle ways.
**Prevention:** For admin pages with real-time data (KPI dashboard, booking list), ensure pages are explicitly dynamic: `export const dynamic = 'force-dynamic'` or use `noStore()` from `next/cache`. After critical mutations, call `router.refresh()` from the client alongside the server-side `revalidatePath` to bust both layers.

---

### Next.js — Turbopack Dev: Memory Exhaustion on Large Projects

**Risk:** Low (dev only, not a production issue)
**Symptom:** `next dev --turbopack` runs fine for small projects but eventually consumes 4–8 GB RAM and either slows to 25-second compile times or crashes with OOM on complex Next.js 15.2.x projects.
**Root cause:** Turbopack's module graph tracking has known memory leaks in versions 15.2.x, especially in projects with many dynamic imports, Framer Motion, and complex Tailwind configurations. Reported extensively on the Next.js GitHub discussions (Discussion #77102, #85744).
**Prevention:** If OOM crashes occur in dev, temporarily fall back to Webpack: `next dev` without `--turbopack`. Pin to the latest stable Next.js patch which contains Turbopack HMR fixes. Monitor GitHub releases. Do not use `next build --turbopack` in CI until the build flag is marked stable.

---

## Stripe Integration

### Stripe — Calling `.json()` Before Signature Verification Breaks Webhooks

**Risk:** Critical
**Symptom:** `stripe.webhooks.constructEvent()` throws: "No signatures found matching the expected signature for payload. Are you passing the raw request body?" The webhook always fails signature verification in production even though the secret is correct.
**Root cause:** Stripe's webhook signature verification hashes the **exact raw bytes** of the request body. In the App Router, the `Request` object exposes `.json()`, `.text()`, and `.arrayBuffer()`. These methods consume the body stream once. If `.json()` is called first, the body is parsed and re-serialized — the resulting string will differ from the original in whitespace, Unicode escaping, and key ordering. Subsequent `.text()` calls return the re-serialized version, not the original bytes. The hash no longer matches. This is the single most-reported webhook issue in the Next.js repository (GitHub issue #60002, #49739, #1294 in stripe-node).
**Prevention:** In the webhook Route Handler: call `await request.text()` first, pass that string to `stripe.webhooks.constructEvent(rawBody, signature, secret)`, then parse JSON manually with `JSON.parse(rawBody)`. Never call `request.json()` anywhere in the webhook handler. Set `export const runtime = 'nodejs'` in the route file to eliminate encoding edge cases that only appear with the Edge runtime.

---

### Stripe — Auth Middleware Intercepting the Webhook Route

**Risk:** High
**Symptom:** Webhook route returns 302 redirect to the login page, or 401 Unauthorized. Stripe marks the webhook delivery as failed after 20 seconds and retries. The booking never gets confirmed. No error in the app logs — just a redirect that Stripe's infrastructure doesn't follow.
**Root cause:** NextAuth v5 middleware configured with a broad matcher (e.g., `matcher: ['/((?!_next).*)']`) intercepts every route including `/api/webhooks/stripe`. Stripe sends unsigned POST requests from its servers, so the auth check fails and the middleware redirects.
**Prevention:** Explicitly exclude the webhook route from the middleware matcher:
```ts
// middleware.ts
export const config = {
  matcher: ['/((?!api/webhooks|_next/static|_next/image|favicon.ico).*)'],
};
```
Add an integration test that POSTs a mock webhook payload to the endpoint from outside the auth layer and asserts a 200 response.

---

### Stripe — Webhook Delivered Twice: Duplicate Booking Confirmation

**Risk:** High
**Symptom:** Two confirmation emails sent to the guest. Booking status toggled to `confirmed` twice, triggering double audit log entries. In worst case, if the handler has side effects like sending to Resend or creating iCal blocks, those execute twice.
**Root cause:** Stripe guarantees at-least-once delivery. Network timeouts, slow handlers (>20 seconds), or handler crashes after processing but before returning 200 all cause Stripe to retry the event. Retries happen for up to 3 days.
**Prevention:** Implement idempotency via event ID deduplication. Before processing, check if `event.id` exists in a `processed_stripe_events` database table. If it exists, return 200 immediately. If not, insert it and process. Return 200 within 20 seconds of receiving the webhook — offload heavy work (sending emails, PDF generation) to a background process or simply do the DB update synchronously and schedule email delivery separately. TTL for stored event IDs: at least 7 days to cover Stripe's retry window.

---

### Stripe — BRL Amount Stored as Float Causes Centavo Rounding Errors

**Risk:** High
**Symptom:** Booking for R$1.350,00 is charged as R$1.349,99 or R$1.350,01. Stripe rejects amounts that are not integers. Floating-point arithmetic like `1350.00 * 100 = 134999.99999...` silently truncates.
**Root cause:** BRL is a two-decimal currency. Stripe's API requires amounts in the smallest currency unit (centavos) as integers. JavaScript `number` type uses IEEE 754 floating point — multiplying a float by 100 does not always produce a clean integer. Storing monetary values as `DECIMAL` or `FLOAT` in PostgreSQL and then multiplying in JavaScript is the classic path to this bug.
**Prevention:** Store all monetary values in the database as integers in centavos (e.g., `integer` column, not `numeric`). Never perform `price * 100` in JavaScript. Calculate the centavo amount once, at the server, using integer arithmetic. When displaying to users, format by dividing and using `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`. For multi-night calculations: `nightly_rate_centavos * nights + fees_centavos`, all integer.

---

### Stripe — Dynamic Product/Price Objects Accumulate as Orphans

**Risk:** Medium
**Symptom:** After 6 months of operation, the Stripe Dashboard has thousands of one-off Product objects (one per booking). Searching for specific transactions becomes difficult. Stripe's object listing APIs paginate through all of them. If products are never archived, the Stripe account becomes cluttered and API calls slow.
**Root cause:** The HSI architecture creates a new Stripe Product + Price per booking. This is correct for unique transaction values, but without a cleanup strategy, the objects persist indefinitely in Stripe's system. Stripe does not automatically delete them.
**Prevention:** After a Checkout Session completes (webhook `checkout.session.completed`), archive the associated Price and Product via `stripe.products.update(id, { active: false })`. This does not delete them (audit trail preserved) but removes them from active listings. Include the booking ID in the product metadata so the audit trail is queryable. Rate limit: Stripe allows 100 write requests/second in production — bulk archiving thousands of objects must be done with exponential backoff.

---

### Stripe — Checkout Session Expires Without Releasing Availability Hold

**Risk:** Medium
**Symptom:** A guest starts checkout, abandons it, and the dates remain "pending" in the booking system. The host cannot take other bookings for those dates. If the system considers a `pending` booking as a hold, availability is incorrectly blocked for up to 24 hours.
**Root cause:** Stripe Checkout Sessions expire after a configurable period (default 24 hours, minimum 30 minutes). When they expire, Stripe fires `checkout.session.expired`. If the application treats the session creation as a "provisional hold" on availability without also handling the expiry webhook, the hold is never released.
**Prevention:** Listen for `checkout.session.expired` in the webhook handler and set the associated booking record to `cancelled` or `expired` status, releasing the dates. Set `expires_at` to a shorter value (e.g., 30 minutes) when creating the session to minimize the lock window. Never block availability based solely on session creation — only on `checkout.session.completed`.

---

## NextAuth v5

### NextAuth — Middleware Without Webhook Exclusion Blocks Stripe (Repeated for Emphasis)

See Stripe section: "Auth Middleware Intercepting the Webhook Route." This deserves mention in both sections because it is the most common auth+payments integration mistake.

---

### NextAuth — Magic Link Not Bound to the Requesting Browser

**Risk:** High
**Symptom:** A phishing attack sends a guest a fake "click here to confirm" email that contains a valid magic link (intercepted from a real request). The attacker can click the link in their own browser and authenticate as the guest. The magic link is not browser-bound.
**Root cause:** NextAuth's Email provider sends a token in a URL. The token is valid for any browser that clicks it. NextAuth does not validate that the browser clicking the link is the same browser that initiated the sign-in request (the `csrf-token` cookie is present in the requesting browser but not verified against the link). This is a documented limitation reported in NextAuth issue #2460 (open since 2021, persists in v5).
**Prevention:** For the admin panel (owner/staff only), use credentials (email+password) as the primary auth method, not magic link. If magic link is offered, set a short token expiry (15 minutes). Implement IP logging for magic link usage for audit purposes. Make magic links single-use (NextAuth does this by default with the database adapter — verify the adapter actually deletes the token on first use). For guest-facing flows, magic links are acceptable given the lower privilege level.

---

### NextAuth — JWT Sessions Cannot Be Invalidated on Role Change

**Risk:** High
**Symptom:** An admin revokes a staff member's access by changing their role to `inactive` in the database. The staff member continues to have full admin access for up to 30 days (the JWT expiry). The change has no immediate effect.
**Root cause:** JWT sessions store claims (including role) inside the token, which is signed but not server-validated on every request. The session cookie is valid until it expires, regardless of database changes. This is a fundamental property of JWTs.
**Prevention:** Use the **database session strategy** for the admin panel (owner/staff), not JWT. Database sessions store only a session ID in the cookie — on every request, NextAuth queries the database for the session record and the user's current role. Role changes take effect immediately on the next request. The tradeoff is one extra DB query per request, which is acceptable for an admin panel. JWT strategy is only appropriate for purely stateless scenarios; it is wrong for any system where role/permission changes must take immediate effect.

---

### NextAuth — Drizzle Adapter: Custom Columns on `users` Table Break the Adapter

**Risk:** Medium
**Symptom:** Adding columns to the `users` table (e.g., `role`, `phone`, `preferences`) causes the Drizzle adapter's `createUser` and `getUser` calls to silently ignore those columns or throw type errors, because the adapter expects exactly the Auth.js schema.
**Root cause:** The Drizzle adapter for Auth.js expects the `users` table to match its own schema definition. It generates its own insert/select queries. Extra columns with `NOT NULL` constraints that the adapter doesn't know about will cause inserts to fail with a `null value violates not-null constraint` database error.
**Prevention:** Any custom columns on `users` must have default values OR be nullable. The canonical pattern is to extend the session via the `session` callback in `auth.config.ts` — query the extra user fields from the database there and attach them to the session object. Do not rely on the adapter to handle custom columns during the sign-in flow.

---

### NextAuth — `NEXTAUTH_SECRET` Rotation Logs Out All Users

**Risk:** Medium
**Symptom:** After rotating the `NEXTAUTH_SECRET` environment variable (e.g., after a suspected leak), all users are instantly logged out. Guests mid-booking lose their session.
**Root cause:** `NEXTAUTH_SECRET` is used to sign session cookies and JWT tokens. Changing it invalidates all existing signed values. This is intentional security behavior, but catastrophic if done without warning.
**Prevention:** Plan secret rotations for maintenance windows. Communicate to users before rotating. With database sessions (recommended for admin), the `NEXTAUTH_SECRET` rotation also invalidates sessions (the session cookie verification fails). Consider implementing a secret rotation strategy with `NEXTAUTH_SECRET_OLD` if the framework supports it, or accept a forced logout as the cost of rotation.

---

## Drizzle ORM

### Drizzle — `drizzle-kit push` Used in Production

**Risk:** Critical
**Symptom:** A developer runs `drizzle-kit push` against the production database during debugging. It immediately applies schema changes without a migration history entry, creating a divergence between the migration journal and the actual schema. Future migrations may fail with "migration already applied" or skip required changes.
**Root cause:** `drizzle-kit push` is a development tool that syncs the schema directly to the database without generating or recording migration files. It is explicitly documented as unsafe for production.
**Prevention:** Production deployments must always use `drizzle-kit migrate` (applies recorded `.sql` migration files). Add a CI check: if `drizzle-kit push` is detected in any deployment script, fail the build. Environment-guard the push command in `package.json`: `"db:push": "NODE_ENV !== 'production' && drizzle-kit push"`.

---

### Drizzle — Migration Run at Startup with Database Not Ready

**Risk:** High
**Symptom:** The Next.js container starts, runs `drizzle migrate` before PostgreSQL is accepting connections, the migration fails, and the application starts anyway with an inconsistent schema. Queries fail at runtime with "relation does not exist" errors. The container keeps running but is broken.
**Root cause:** Container orchestration (EasyPanel/Docker) does not guarantee service startup order. PostgreSQL may still be initializing when the application's startup migration command runs.
**Prevention:** Wrap the startup migration in a retry loop with backoff:
```ts
async function runMigrations(retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await migrate(db, { migrationsFolder: './drizzle' });
      return;
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, delay * (i + 1)));
    }
  }
}
```
Alternatively, run migrations as a separate EasyPanel "deploy hook" step that must succeed before the app container starts, keeping migration logic out of the application process entirely.

---

### Drizzle — Transaction Not Used in Multi-Step Server Actions

**Risk:** High
**Symptom:** A booking creation Server Action creates a `booking` record, then creates the Stripe Checkout Session, then updates the property's availability. If the Stripe call fails after the `booking` insert, the database has a dangling `booking` record with no corresponding Stripe session. Availability is not updated. The property calendar is wrong.
**Root cause:** Server Actions execute multiple database operations sequentially without a transaction wrapper. Any failure in the middle leaves the database in a partial state.
**Prevention:** Wrap all multi-step database operations in a Drizzle transaction:
```ts
await db.transaction(async (tx) => {
  const booking = await tx.insert(bookings).values(...).returning();
  await tx.insert(availabilityBlocks).values(...);
  // Stripe call happens OUTSIDE the transaction (external side effect)
  // Store the Stripe session ID in a second transaction if needed
});
```
Note: External API calls (Stripe, Resend) cannot be rolled back. The pattern is: validate → DB transaction (insert booking as `pending`) → call Stripe → on Stripe success, update booking to `awaiting_payment`. The transaction ensures that the DB write is atomic; Stripe failure leaves a `pending` record that can be cleaned up by a cron job.

---

### Drizzle — JSON Column Runtime Type Is `unknown`, Not the Declared Type

**Risk:** Medium
**Symptom:** A column declared as `json().$type<PolicyConfig>()` returns data that TypeScript says is `PolicyConfig`, but at runtime it is actually a plain `string` (because old data was stored incorrectly), or it has extra fields, or it has `null` values for required fields. TypeScript gives false confidence.
**Root cause:** Drizzle's `.$type<T>()` annotation is compile-time only. It does not add any runtime parsing, coercion, or validation. The data in the column can be anything — whatever was inserted.
**Prevention:** Always parse JSON column data through a Zod schema after reading it from the database. Never trust `.$type<T>()` for runtime safety. Pattern:
```ts
const raw = result.policyConfig; // typed as PolicyConfig but not validated
const parsed = PolicyConfigSchema.parse(raw); // throws if data is wrong
```
This is especially important for booking policy and pricing config columns that drive financial calculations.

---

### Drizzle — Connection Pool Exhaustion in High-Concurrency Server Actions

**Risk:** Medium
**Symptom:** Under moderate load (e.g., several admin users and a public booking flow active simultaneously), database queries start timing out with "remaining connection slots are reserved for non-replication superuser connections." The PostgreSQL server rejects new connections.
**Root cause:** The default `pg` Pool `max` is 10 connections. Each Server Action invocation can acquire a connection from the pool. In Next.js (especially with Turbopack HMR or hot paths), many concurrent requests can saturate the pool. On EasyPanel with a single PostgreSQL instance that also runs other apps, the total connection limit is shared.
**Prevention:** Set an explicit, conservative pool max: `new Pool({ max: 5 })` for a single-instance deployment. Use `pgBouncer` or configure `connection_limit` in the PostgreSQL config. Monitor active connections with `SELECT count(*) FROM pg_stat_activity`. If deploying multiple EasyPanel services sharing one PostgreSQL instance, account for total connections across all apps.

---

## Cloudinary

### Cloudinary — Unsigned Uploads Used in Production

**Risk:** Critical
**Symptom:** Anyone who inspects the network requests from the browser can find the Cloudinary `upload_preset` and use it to upload arbitrary files to the account. The Cloudinary storage fills with junk content. Bandwidth quota is exhausted. Account is suspended.
**Root cause:** Unsigned upload presets allow uploads without server-side signature generation. They are intended for development/prototyping only. The `upload_preset` is necessarily exposed to the browser since it must be included in the upload request.
**Prevention:** Use signed uploads exclusively. The flow is: client requests a signature from a Server Action → server uses `CLOUDINARY_API_SECRET` (never exposed to client) to generate a signature with a short TTL → client uploads directly to Cloudinary using the signature. The server-side signature endpoint must be authenticated (only logged-in admins) and rate-limited.

---

### Cloudinary — Signature Endpoint Generates Signatures for Any Parameters

**Risk:** High
**Symptom:** A malicious actor calls the signature endpoint with parameters that allow uploading to root-level folders, or with `type: 'authenticated'`, or overriding `folder` to bypass organizational structure. Valid signatures are returned because the server doesn't validate what parameters it signs.
**Root cause:** The signature endpoint accepts arbitrary parameters and signs them. The generated signature is valid for those exact parameters, which may include ones the application didn't intend to support.
**Prevention:** The signature endpoint must allowlist permitted parameters. Hardcode the `folder` (e.g., `properties/{propertyId}/`), `allowed_formats`, and `max_file_size` on the server — never accept these from the client request. The client only provides the file; the server decides where it goes and what constraints apply.

---

### Cloudinary — Free Tier Account Suspended Mid-Client-Demo

**Risk:** Medium
**Symptom:** A client's instance (running on Cloudinary free tier) stops serving images mid-session. All property photos return 404 or default placeholder. The public-facing website is broken.
**Root cause:** Cloudinary free tier provides 25 credits/month (25 GB storage + 25 GB bandwidth + 25,000 transformations combined). A single client with 20 properties and active bookings can exhaust this in a few weeks. When quotas are exceeded on fixed-tier plans, **Cloudinary suspends the account** rather than charging overages — assets become inaccessible immediately.
**Prevention:** Include the Cloudinary paid plan (minimum Plus tier) in the client onboarding budget. Document this dependency explicitly. Implement a monitoring webhook (Cloudinary provides usage webhooks) to alert when usage reaches 70% of quota. For transformation efficiency, use responsive image transformations that cache well: specify `w_auto,c_scale,q_auto,f_auto` at the CDN level so transformations are cached and not re-applied per request.

---

### Cloudinary — Magic Bytes Validation Bypassed by Polyglot Files

**Risk:** High
**Symptom:** Security audit finds that a file with valid JPEG magic bytes (`FF D8 FF`) but malicious payload in the body was uploaded. Magic bytes check passes. The file is stored in Cloudinary. If rendered via `dangerouslySetInnerHTML` or an `<object>` tag, it could execute.
**Root cause:** Checking only the first few bytes of a file is necessary but insufficient. Polyglot files are valid in multiple formats simultaneously (e.g., a file that is both a valid JPEG and a valid ZIP/HTML/JavaScript). The magic bytes are real, but the file contains malicious content deeper in the buffer.
**Prevention:** Use the `file-type` npm package (v22+) to check magic bytes from a `Buffer` — it checks more than the first 4 bytes. Additionally: (1) validate that the declared MIME type matches the detected file type; (2) enforce a strict allowlist (`image/jpeg`, `image/png`, `image/webp`); (3) rely on Cloudinary's own server-side analysis as a second layer (it will reject files it cannot process as images); (4) for extra security, re-fetch the uploaded asset from Cloudinary and confirm it returns as an image Content-Type. Never trust client-provided MIME types (`file.type` in JavaScript is trivially spoofed).

---

## iCal Sync

### iCal — 3–4 Hour Sync Delay Creates Double-Booking Window

**Risk:** High
**Symptom:** A guest books on Airbnb. Three hours later, another guest books the same dates directly through HSI. Both bookings are confirmed. The host has a double booking.
**Root cause:** Airbnb and Booking.com pull iCal feeds approximately every 3–4 hours. HSI's exported iCal feed is only consumed at those intervals. In the window between a new external booking and the next iCal pull, HSI's availability calendar is stale. The HSI booking flow sees the dates as available.
**Prevention:** This is an architectural limitation of iCal sync — it cannot be fully solved without API-level integration (which Airbnb and Booking.com do not offer to third parties without marketplace partnership). Mitigations: (1) Show a warning in the booking UI: "Prices and availability are synchronized every few hours. Confirm your booking to lock the dates."; (2) Implement a short polling interval on the HSI side (fetch external iCal feeds every 30 minutes) to reduce the window; (3) For the host, document that the iCal method carries inherent double-booking risk and recommend manual blocking after external bookings. The real solution is directing all traffic to HSI (the product's core value proposition) and using iCal only as a one-way export.

---

### iCal — Airbnb Off-by-One Checkout Date Bug

**Risk:** Medium
**Symptom:** Airbnb's exported iCal shows checkout dates that are one day earlier than the actual checkout. A 3-night stay (check-in Oct 14, checkout Oct 17) appears as a 2-night block in the imported calendar. If HSI imports this feed naively, it under-blocks availability and allows bookings on the actual checkout day.
**Root cause:** Airbnb formats `DTEND` using the `DATE` type (all-day event, no time component) rather than `DATE-TIME`. The iCalendar RFC specifies that all-day `DTEND` is exclusive (i.e., `DTEND: 20231017` means the event ends at the start of Oct 17, not the end). However, Airbnb's implementation has a known bug since Summer 2023 where the date is off by one. Calendar applications interpret this differently, resulting in the checkout date appearing as Oct 16.
**Prevention:** When importing Airbnb iCal feeds, add one day to `DTEND` values that use the `DATE` type (all-day format without time component). Document this Airbnb-specific workaround in the sync code. Use the `node-ical` package which surfaces the `datetype` property to distinguish `DATE` from `DATE-TIME`. Test the import with a real Airbnb iCal export, not a synthetic one.

---

### iCal — Polling in a Serverless/Edge Environment

**Risk:** Medium
**Symptom:** iCal sync was designed as a background cron job, but Next.js has no built-in background scheduler. The developer implements a Route Handler that is called by `setInterval` in `layout.tsx`, which only runs when a browser tab is open. Production sync stops whenever no one is using the admin panel.
**Root cause:** Next.js App Router runs in a request/response model. There is no persistent background process. Long-running tasks or scheduled jobs must be external to the Next.js process.
**Prevention:** In the EasyPanel deployment, add a separate cron service (a simple Node.js script in a separate EasyPanel service, or a system cron on the VPS) that calls a protected Route Handler (`POST /api/internal/sync-icals`) every 30 minutes with a shared secret in the header. The Route Handler validates the secret and runs the sync. This keeps the scheduler external and the sync logic inside the Next.js app. Never implement polling via browser-side timers.

---

### iCal — Imported Event Conflicts with a Confirmed HSI Booking

**Risk:** High
**Symptom:** A sync job imports an Airbnb block that overlaps with an already-confirmed HSI booking. The system must decide which one wins. Without clear conflict resolution, both records exist simultaneously, the calendar shows a conflict, and the host is confused.
**Root cause:** No conflict resolution strategy defined at the data model level. External iCal events and internal bookings compete for the same date ranges without a defined precedence rule.
**Prevention:** Implement a clear precedence rule: confirmed HSI bookings always win over imported iCal blocks. When the import detects an overlap, skip the import and log a conflict warning to the admin dashboard (not a silent failure). The admin sees: "Airbnb block [dates] conflicts with confirmed booking #XYZ — import skipped. Please manually resolve in Airbnb." Never silently overwrite confirmed bookings.

---

## EasyPanel + Nixpacks

### EasyPanel — `NEXT_PUBLIC_*` Variables Not Available at Build Time

**Risk:** Critical
**Symptom:** `NEXT_PUBLIC_APP_URL` (and similar) is `undefined` in the browser. The public-facing pages generate wrong URLs for canonical tags, og:image, and Stripe return URLs. The Stripe Checkout `success_url` and `cancel_url` are wrong, causing post-payment redirects to fail.
**Root cause:** In Next.js, `NEXT_PUBLIC_*` variables are inlined at **build time**, not runtime. They are replaced with literal string values during `next build`. If the variable is not set when Nixpacks runs `npm run build`, it is replaced with `undefined` — permanently, until the next build. Setting the variable in EasyPanel's "Environment" tab after build does not fix already-built bundles.
**Prevention:** All `NEXT_PUBLIC_*` variables must be set in EasyPanel **before** the first build. Document this in the deployment checklist. For each new client deployment: (1) configure all environment variables, (2) then trigger the first build. For server-only variables (Stripe secret, database URL, NextAuth secret), runtime injection works correctly — these are read at request time, not build time.

---

### EasyPanel — Nixpacks Fails to Detect Next.js Without Correct `package.json` Scripts

**Risk:** High
**Symptom:** Nixpacks builds the app as a generic Node.js project, not as a Next.js project. It runs `npm start` instead of the `next start` command. Static assets are not served. The build is missing the `.next` directory. The app crashes on start.
**Root cause:** Nixpacks detects Next.js by looking for `"next"` in `dependencies` AND a `"build"` script in `package.json` that contains `next build`. If the build script is customized (e.g., `"build": "prisma generate && next build"`) in a way that Nixpacks's detection regex doesn't match, it may fall back to a generic Node.js provider.
**Prevention:** Ensure `package.json` contains:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```
If pre-build steps are needed (Drizzle generate, etc.), add a separate `"prebuild"` script. The `"build"` script itself must call `next build` directly. Verify the Nixpacks build logs show "Detected Next.js" during the provider detection phase.

---

### EasyPanel — Missing `output: 'standalone'` Causes Bloated Deployment or Broken Static Assets

**Risk:** High
**Symptom:** Option A: The Docker image is 2+ GB because it includes the full `node_modules`. Deployment takes 15+ minutes. Option B: The app builds correctly but static assets (`/_next/static/`) return 404 because the `.next/static` directory is not included in the runtime container.
**Root cause:** Without `output: 'standalone'`, Next.js requires the full `node_modules` directory at runtime. Nixpacks handles this, but the resulting image is enormous. Additionally, when Nixpacks uses standalone mode, it expects the app to serve static files itself — but standalone output does not automatically copy the `public/` and `.next/static/` directories into the standalone folder.
**Prevention:** Add to `next.config.ts`:
```ts
const nextConfig = {
  output: 'standalone',
};
```
Then in the Nixpacks build configuration or a `nixpacks.toml`, ensure the `.next/static` and `public` directories are copied into `.next/standalone/.next/static` and `.next/standalone/public` respectively. Verify static assets load correctly after first deployment. This reduces image size by 85–90%.

---

### EasyPanel — Runtime Environment Variables Read Before DB Is Available

**Risk:** Medium
**Symptom:** The application starts, reads `DATABASE_URL` from the environment, creates the Drizzle connection pool, and immediately attempts `drizzle migrate`. If PostgreSQL is still starting (cold start, restart after update), the migration fails and the Node process exits. EasyPanel restarts it, triggering an exponential backoff restart loop.
**Root cause:** Container startup order is not guaranteed. EasyPanel starts services based on dependency declarations, but the declared "depends_on" relationship only checks that the container has started — not that PostgreSQL is actually accepting connections (which takes additional seconds after the process starts).
**Prevention:** See Drizzle section: implement retry logic in the startup migration. Additionally, configure EasyPanel's health check for the PostgreSQL service to verify it accepts connections before marking it as "healthy". Use a `pg_isready` health check. Set the app service to restart only after the DB service is healthy, not just started.

---

## Security — Cross-Cutting

### Security — DOMPurify Imported in Server Component Throws, Wrong Package Used

**Risk:** High
**Symptom:** `import DOMPurify from 'dompurify'` in a Server Component or Server Action throws: "ReferenceError: window is not defined" or a Webpack build error because DOMPurify requires a DOM environment that does not exist in Node.js.
**Root cause:** The standard `dompurify` package is browser-only. It requires `window.document`. Server Components and Server Actions run in Node.js, where no DOM exists. Developers copy-paste sanitization code that works in client components into server-side code without noticing the environment change.
**Prevention:** Use `isomorphic-dompurify` for any server-side sanitization. It uses `jsdom` to provide a DOM environment in Node.js. Pin `jsdom` to a version that is known-good: jsdom@28 pulls in an ESM-only dependency that breaks `require()` in Next.js — pin to jsdom@25.x via `overrides` in `package.json`. The sanitization call site is identical to client-side DOMPurify, so the same code can run in both environments via the isomorphic wrapper.

Additionally: be aware of a memory growth issue in long-running server processes — jsdom's internal window accumulates DOM state. Periodically call `clearWindow()` from `isomorphic-dompurify` in routes that sanitize large volumes of HTML.

---

### Security — Server Action CSRF Protection Breaks With Uppercase Proxy Hostnames

**Risk:** Medium
**Symptom:** Server Actions return 403 Forbidden for legitimate requests from the same origin. This only manifests in production, behind a reverse proxy. Locally it works fine. Affected users cannot submit any form.
**Root cause:** Next.js Server Actions CSRF protection compares the `Origin` header to the `Host`/`X-Forwarded-Host` header. JavaScript's URL API normalizes the `Origin` to lowercase. Reverse proxies (nginx, Traefik, EasyPanel's internal proxy) may preserve the original case of the hostname in `Host`, while `Origin` is lowercased. If the production hostname contains uppercase letters (e.g., `MyClient.example.com`), the case mismatch causes `Origin !== Host` and the CSRF check fails. Documented in GitHub (geeknik/nextjs-csrf-case-sensitivity-repro, 2026).
**Prevention:** Use lowercase hostnames exclusively. If the hostname is already lowercase, this is not a risk. In `next.config.ts`, add the explicit allowed origins as a safety net:
```ts
experimental: {
  serverActions: {
    allowedOrigins: ['myclient.example.com'],
  },
},
```
Always use lowercase hostnames when configuring EasyPanel domains.

---

### Security — In-Memory Rate Limiting Resets on Every Container Restart

**Risk:** Medium
**Symptom:** Rate limiting appears to work in development but in production, restarting the EasyPanel service (after deploy, update, or crash) resets all rate limit counters. Attackers can exhaust retries, wait for a deploy, then try again from a clean slate.
**Root cause:** In-memory rate limiting stores counters in the Node.js process heap. Each process restart starts with zero counters. On EasyPanel with Nixpacks, every deployment causes a container restart, resetting all counters. There is no shared state across restarts.
**Prevention:** For a single-instance deployment (which HSI is — one EasyPanel service per client), in-memory rate limiting is acceptable for DDoS protection but not for security-sensitive rate limiting (login attempts, magic link requests, booking creation). For security-sensitive endpoints, persist rate limit state to PostgreSQL: a `rate_limits` table with `(key, count, window_start, expires_at)`. The overhead of a DB query on these specific endpoints is acceptable. Do not use Redis if it adds infrastructure complexity for a single-tenant deployment — PostgreSQL-backed rate limiting is sufficient.

---

### Security — Audit Log Omitted From Sensitive Operations

**Risk:** Medium
**Symptom:** The host reports that "someone changed the pricing" but there is no record of who, when, or what changed. If owner/staff accounts are shared (common in small hospitality businesses), there is no accountability.
**Root cause:** Audit logging is typically added "later" and then never added. By the time the feature is complete, adding audit logs to every mutation requires touching every Server Action.
**Prevention:** Implement the audit log infrastructure in Phase 1 (authentication phase), not as a separate module later. Create a `createAuditEntry(userId, action, entityType, entityId, changes)` helper function that writes to an `audit_logs` table. Call it from every mutating Server Action from day one. The cost is two lines per action; the cost of retrofitting it is days of work.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|----------------|------------|
| Auth setup (NextAuth) | Middleware blocking Stripe webhook route | Configure matcher exclusion before writing any other routes |
| Auth setup (NextAuth) | JWT strategy selected by default for admin | Explicitly configure database session strategy for admin |
| Drizzle schema + migrations | `drizzle-kit push` muscle memory from dev | Add CI guard; document production migration process |
| Booking flow + Stripe | Raw body consumed before signature verification | Implement webhook handler as first integration, with test |
| Booking flow + Stripe | Missing `checkout.session.expired` handler | Add to webhook switch statement at the same time as `completed` |
| Cloudinary upload | Unsigned upload preset copied from tutorial | Use signed uploads from day one; add to security checklist |
| iCal sync | Sync job implemented as browser-side timer | Implement as EasyPanel cron service from the start |
| EasyPanel deploy | `NEXT_PUBLIC_*` vars not set before build | Add deployment checklist item; document variable requirements |
| Admin + public pages | `"use client"` on layout/container components | Review SC/CC boundary at each PR; enforce in code review |
| Financial module | Float arithmetic for monetary values | Establish centavo-integer convention in the data model spec |

---

## Sources

- Next.js App Router caching changes: https://nextjs.org/docs/app/building-your-application/caching
- Next.js caching gotchas (2026): https://pockit.tools/blog/nextjs-app-router-caching-deep-dive/
- App Router pitfalls guide (Feb 2026): https://imidef.com/en/2026-02-11-app-router-pitfalls
- Turbopack memory issues: https://github.com/vercel/next.js/discussions/77102
- Stripe webhook raw body — Next.js App Router: https://github.com/vercel/next.js/issues/60002
- Stripe webhook raw body — stripe-node: https://github.com/stripe/stripe-node/issues/1294
- Stripe webhook handler testing guide: https://webhooks.cc/blog/nextjs-app-router-webhook-handler
- Stripe idempotency keys: https://docs.stripe.com/api/idempotent_requests
- Stripe rate limits: https://docs.stripe.com/rate-limits
- Stripe Checkout Session expiry: https://docs.stripe.com/api/checkout/sessions/expire
- Stripe supported currencies (BRL): https://docs.stripe.com/currencies
- NextAuth magic link CSRF vulnerability: https://github.com/nextauthjs/next-auth/issues/2460
- NextAuth v5 session persistence: https://clerk.com/articles/nextjs-session-management-solving-nextauth-persistence-issues
- NextAuth Drizzle adapter: https://authjs.dev/getting-started/adapters/drizzle
- Drizzle ORM migration best practices: https://medium.com/@lior_amsalem/3-biggest-mistakes-with-drizzle-orm-1327e2531aff
- Drizzle connection pool issue: https://github.com/drizzle-team/drizzle-orm/discussions/947
- Cloudinary signed uploads: https://cloudinary.com/blog/guest_post/signed-uploads-in-cloudinary-with-next-js
- Cloudinary free tier limits: https://cloudinary.com/pricing
- isomorphic-dompurify: https://github.com/kkomelin/isomorphic-dompurify
- DOMPurify + Next.js issue: https://github.com/vercel/next.js/issues/46893
- Next.js CSRF case sensitivity bug: https://github.com/geeknik/nextjs-csrf-case-sensitivity-repro
- Next.js Server Actions security: https://nextjs.org/blog/security-nextjs-server-components-actions
- iCal Airbnb off-by-one: https://community.withairbnb.com/t5/Ask-about-your-listing/Airbnb-iCal-link-shows-incorrect-dates/td-p/2001292
- iCal sync delays and double booking: https://blog.tokeet.com/prevent-double-bookings/
- Next.js standalone output: https://nextjs.org/docs/app/api-reference/config/next-config-js/output
- Nixpacks Node.js provider: https://nixpacks.com/docs/providers/node
- Magic bytes validation: https://transloadit.com/devtips/secure-api-file-uploads-with-magic-numbers/
- file-type npm package: https://www.npmjs.com/search?q=keywords:magic-bytes
- Next.js middleware auth bypass CVE-2025-29927: https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass
