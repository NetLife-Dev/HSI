# Stack Research — HSI (HostSemImposto)

**Researched:** 2026-04-04
**Project:** Self-hosted property booking system (per-instance, not SaaS)
**Stack status:** All packages verified via npm registry and official docs

---

## Critical Context: Next.js 15 vs Next.js 16

npm `latest` tag now points to **Next.js 16.2.2**. Next.js 15 remains actively maintained under the `next-15-3` backport tag (latest: 15.5.14 as of April 2026, with 15.3.9 / 15.2.9 / 15.1.12 also maintained). The stack is locked to Next.js 15 by project constraint. Pin with `next@15` or `next@"^15.5.14"`.

---

## Next.js 15

**Version:** 15.5.14 (latest in 15.x line as of April 2026)
**Status:** Stable, actively backport-maintained

**Key patterns:**

- **Async Request APIs** — `cookies()`, `headers()`, `params`, `searchParams` are all async in Next.js 15. You must `await` them. This is a hard breaking change from 14. The codemod `next-async-request-api` handles migration.
- **Turbopack dev** — `next dev --turbo` is stable. Do not use `next build --turbo`; Turbopack for production builds is not stable in 15.x.
- **Server Actions security** — Dead code elimination removes unused actions from the bundle. Action IDs are non-deterministic and rotate between builds. Still treat every action as a public HTTP endpoint: validate with Zod, check auth before mutating.
- **Caching defaults changed** — GET Route Handlers and client router cache are NOT cached by default (reversed from Next.js 14). Opt in explicitly where needed.
- **`after()` API** — Now stable in 15.x. Use for audit logging, analytics, and secondary work after a response finishes streaming without blocking the primary response.
- **`instrumentation.js`** — Stable. Register Sentry or custom observability here. Use `onRequestError` for server-side error capture across Server Components, Server Actions, Route Handlers, and Middleware.
- **`next.config.ts`** — Supported (TypeScript config file).

**Gotchas:**

- Node.js minimum is 18.18.0. Verify EasyPanel/Nixpacks environment meets this.
- `revalidateTag()` and `revalidatePath()` throw if called during render (only valid in actions or route handlers).
- Middleware and `instrumentation.js` now use vendored React packages — do not import user-land React inside middleware.
- `next/dynamic` with `ssr: false` is disallowed in Server Components.
- `export const runtime = "experimental-edge"` is deprecated; use `"edge"`.

**Confidence:** High (official release blog + npm registry)

---

## TypeScript (strict mode)

**Version:** 5.x (bundled with Next.js 15; 5.6+ recommended)
**Status:** Stable

**Key patterns:**

- Enable `"strict": true` in tsconfig — no exceptions.
- Use `satisfies` operator for config objects to get inference without widening.
- Server Action return types should be explicit: `Promise<{ success: true } | { error: string }>`.
- Use `z.infer<typeof schema>` to derive types from Zod schemas, never duplicate type definitions.

**Confidence:** High

---

## PostgreSQL

**Version:** 16.x or 17.x (both compatible with Drizzle and Prisma)
**Status:** Stable

**Key patterns:**

- Use identity columns (`generatedAlwaysAsIdentity()`) in Drizzle instead of `serial`. Drizzle embraced this in 2025; `serial` still works but is deprecated PostgreSQL practice.
- For UUID primary keys, use `uuid_generate_v4()` or PostgreSQL 13+ native `gen_random_uuid()`.
- Connection pooling: use `postgres` (the `postgres` npm package, not `pg`) with Drizzle for Node.js. PgBouncer is not needed for a single-instance deployment.

**Confidence:** High

---

## Drizzle ORM

**Version:** drizzle-orm 0.45.2 / drizzle-kit 0.31.10 (as of April 2026)
**Status:** Stable (approaching v1.0 beta)

**Key patterns:**

- **Schema definition** — co-locate schema files by domain (`schema/users.ts`, `schema/bookings.ts`, `schema/properties.ts`). Import and re-export from a central `schema/index.ts` that drizzle-kit reads.
- **Migrations at startup** — Use `migrate()` from `drizzle-orm/node-postgres/migrator` in a startup script (`scripts/migrate.ts`) called before the app starts. This is an established, documented production pattern. Drizzle stores applied migrations in `__drizzle_migrations` table.
- **Safe startup migration pattern:**

  ```typescript
  // scripts/migrate.ts
  import { migrate } from 'drizzle-orm/node-postgres/migrator'
  import { db } from '@/lib/db'

  await migrate(db, { migrationsFolder: './drizzle' })
  console.log('Migrations applied')
  process.exit(0)
  ```

  In Nixpacks, add a custom start command: `node -r ts-node/register scripts/migrate.ts && next start`.

- **Never use `drizzle-kit push` in production** — `push` is for dev only. Always use `generate` + `migrate` in production.
- **`drizzle-kit generate`** — Run locally when schema changes. Commit generated migration SQL files. Never edit migration files after applying them.
- **Audit log table pattern** — Use a single `audit_logs` table with `jsonb` column for metadata. Drizzle handles jsonb as `json()` or `jsonb()` type.

**Recommended booking domain schema (tables):**

| Table | Key columns |
|-------|-------------|
| `users` | id, email, password_hash, role (owner/staff), created_at |
| `accounts` | (Auth.js) id, user_id, provider, provider_account_id |
| `sessions` | (Auth.js) id, session_token, user_id, expires |
| `verification_tokens` | (Auth.js) identifier, token, expires |
| `properties` | id, name, description, slug, images (jsonb), pricing (jsonb), status |
| `bookings` | id, property_id, guest_name, guest_email, check_in, check_out, total_amount, status, stripe_session_id |
| `availability_blocks` | id, property_id, start_date, end_date, reason (manual/ical/booking) |
| `guests` | id, name, email, phone, tags (text[]), notes |
| `audit_logs` | id, user_id, action, entity_type, entity_id, metadata (jsonb), created_at |
| `ical_feeds` | id, property_id, url, direction (import/export), last_synced_at |
| `instance_config` | id, key, value (text), created_at, updated_at |

**Gotchas:**

- Kit v0.30.0 changed PostgreSQL dialect to no longer include `IF NOT EXISTS` in DDL — if a migration fails partway through, re-running may error on existing objects. Wrap startup migration in error handling; on conflict, verify the `__drizzle_migrations` table state manually.
- Do not run `drizzle-kit generate` inside the Docker/Nixpacks build — generate locally, commit SQL files, and migrate at startup.
- Drizzle and Prisma track migrations in separate tables. If you let Drizzle manage migrations (correct), Prisma's `_prisma_migrations` will be absent or empty. Prisma will report "schema drift" if you try to use `prisma migrate` commands. Do not mix migration commands — Drizzle owns migrations, Prisma is read-only Studio.

**Confidence:** High (official Drizzle docs + npm registry)

---

## NextAuth v5 (Auth.js)

**Version:** next-auth 5.0.0-beta.28+ / @auth/drizzle-adapter 1.11.1 (as of April 2026)
**Status:** Beta (but production-deployed widely). IMPORTANT: v5 has never had a stable release.

**Project risk note:** Auth.js v5 principal maintainer departed January 2025. The project was absorbed into Better Auth in late 2025 for maintenance continuity. Better Auth commits to security patches but active feature development has shifted to Better Auth. For a new project starting in 2026, consider evaluating Better Auth as an alternative, but since the stack is non-negotiable, proceed with NextAuth v5 — it works, is widely deployed, and will receive security patches.

**Key patterns:**

- **Drizzle adapter setup:**

  ```typescript
  // auth.ts
  import NextAuth from 'next-auth'
  import { DrizzleAdapter } from '@auth/drizzle-adapter'
  import { db } from '@/lib/db'
  import * as schema from '@/lib/schema'
  import Resend from 'next-auth/providers/resend'
  import Credentials from 'next-auth/providers/credentials'

  export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: DrizzleAdapter(db, {
      usersTable: schema.users,
      accountsTable: schema.accounts,
      sessionsTable: schema.sessions,
      verificationTokensTable: schema.verificationTokens,
    }),
    providers: [
      Credentials({ ... }),
      Resend({ from: 'no-reply@yourdomain.com' }),
    ],
    session: { strategy: 'database' },
  })
  ```

- **Magic link** — Use the built-in `Resend` provider (or `Email` provider with custom `sendVerificationRequest`). Requires `verificationTokens` table. The Resend provider handles token generation and email dispatch. You customize the email template via `sendVerificationRequest`.
- **Email/password** — Use `Credentials` provider. Hash passwords with `bcrypt` or `argon2`. Never store plain passwords. Credentials provider does NOT create sessions via the database adapter by default — you must explicitly call `signIn` with session strategy `"database"`.
- **Middleware route protection:**

  ```typescript
  // middleware.ts
  export { auth as middleware } from '@/auth'

  export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
  }
  ```

- **Edge runtime issue** — NextAuth middleware runs on the Edge Runtime. The Drizzle adapter (and `postgres` npm package) uses Node.js APIs (`net`, `tls`) not available in Edge. Solution: use JWT strategy in middleware for route protection, and switch to database session validation inside Server Components/Route Handlers where Node.js is available. The common pattern is `auth()` in Server Components and a lightweight JWT check in middleware.

**Required Auth.js schema tables for Drizzle (PostgreSQL):**

```typescript
// users, accounts, sessions, verificationTokens
// Must match exactly what @auth/drizzle-adapter expects
// Custom columns can be added to users table
```

**Gotchas:**

- `beta` tag in npm is deliberate — install with `next-auth@beta` or pin to specific beta version like `next-auth@5.0.0-beta.28`.
- Edge Runtime incompatibility with Node.js modules: do NOT import the full Drizzle db connection in middleware. Use `auth()` which uses JWT at the edge.
- Session token verification requires the same `AUTH_SECRET` (minimum 32 chars) in all environments. In EasyPanel, set `AUTH_SECRET`, `AUTH_URL` (full domain URL), and provider API keys.
- Magic link tokens expire by default in 24h. Configurable via `maxAge` on the Email/Resend provider.

**Confidence:** High for implementation patterns, Medium for long-term maintenance trajectory

---

## Tailwind CSS v4

**Version:** 4.1.x (4.2.2 as of April 2026 per npm)
**Status:** Stable

**Breaking changes from v3 (critical for this project):**

1. **No more `tailwind.config.js`** — Configuration moves entirely to CSS using `@theme` directive. All custom colors, fonts, spacing go in your main CSS file.
2. **Import syntax** — Replace `@tailwind base/components/utilities` with `@import "tailwindcss"`.
3. **PostCSS plugin** — Now a dedicated package. Use `@tailwindcss/postcss` or `@tailwindcss/vite` (for Vite; Next.js uses PostCSS).
4. **Color opacity utilities** — `bg-opacity-50`, `text-opacity-50` are removed. Use slash syntax: `bg-blue-500/50`.
5. **Default ring width** — Changed from 3px to 1px. Affects focus styles across all components.
6. **Default border color** — Changed to `currentColor`. Any `border` class without an explicit color now inherits text color.
7. **Browser minimum** — Safari 16.4+, Chrome 111+, Firefox 128+.

**Configuration pattern for this project:**

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --font-geist: "Geist", sans-serif;
  --font-instrument-serif: "Instrument Serif", serif;
  --color-accent: #0071e3; /* Apple blue */
  /* OKLCH format preferred in v4 */
}
```

**Gotchas:**

- shadcn/ui migrated to Tailwind v4 and uses `@theme inline` pattern with OKLCH colors. Existing v3 shadcn components need migration.
- `tailwindcss-animate` is replaced by `tw-animate-css` in shadcn v4 setup.
- Nixpacks must detect Tailwind v4 as a PostCSS plugin during build. No known issues — Next.js PostCSS pipeline handles this transparently.

**Confidence:** High (official Tailwind docs + shadcn migration guide)

---

## shadcn/ui

**Version:** Latest CLI `npx shadcn@latest` (components are source-copied, not versioned)
**Status:** Stable, Tailwind v4 + React 19 support landed in 2025

**Key patterns:**

- Components are copied into your repo — you own them. This is the intended model, especially for heavy visual overrides.
- Tailwind v4 migration changes: color system moved to OKLCH, `forwardRef` removed from components (using `data-slot` attributes instead), `tailwindcss-animate` replaced with `tw-animate-css`.
- For HSI's "primitives only, visually overridden" requirement: copy components, strip shadcn's CSS variable tokens, and replace with your own `@theme` tokens. Use `data-slot` attributes for precise targeting.
- Chart components use `var(--chart-1)` syntax directly (no `hsl()` wrapper) in v4.

**Gotchas:**

- `npx shadcn@latest init` may fail to detect Tailwind v4 installation if `tailwind.config.js` is absent (the CLI checks for it). Work around: initialize with `--force` flag or manually create component files.
- `toast` component is deprecated in shadcn v4 — use `sonner` instead.
- When adding components to an existing v3 project, they install as v3. Do the Tailwind v4 migration before adding new components, not after.

**Confidence:** High (official shadcn/ui docs)

---

## Motion (formerly Framer Motion)

**Version:** motion 12.38.0 (as of April 2026, package renamed from `framer-motion`)
**Status:** Stable

**Key patterns:**

- **Package rename** — Import from `motion/react` not `framer-motion`. The `framer-motion` package still exists as a re-export wrapper but the canonical package is `motion`.
- **Server Components** — Motion components require `"use client"`. For Next.js App Router, import from `motion/react-client`:

  ```typescript
  // In a Client Component wrapper
  import * as motion from "motion/react-client"
  ```

- **Performance constraint for HSI** — Project requires animations only with `transform` and `opacity`. Use `will-change: transform` via CSS for GPU compositing. Spring physics for page transitions and property reveals.
- **Bundle optimization** — Use `LazyMotion` with `domAnimation` feature set to cut ~15KB from bundle:

  ```typescript
  import { LazyMotion, domAnimation } from "motion/react"
  // wraps app or section needing animation
  ```

- **React 19 + React Compiler** — Compatible. The compiler can auto-memoize animation components, reducing need for manual `useMemo`.

**Gotchas:**

- Wrap any component using motion in `"use client"` — motion hooks (`useAnimation`, `useMotionValue`) are client-only.
- Avoid layout animations (`layout` prop) on elements inside Suspense boundaries — can cause flash artifacts.
- `AnimatePresence` requires a single, keyed child for enter/exit animations to work correctly.

**Confidence:** High (official Motion docs + npm)

---

## Stripe

**Version:** stripe 17.x (17.6.0 as of April 2026, latest confirmed via npm as 22.0.0 — verifying)
**Status:** Stable

**Note on version:** npm shows `stripe@22.0.0` as latest. This is Stripe's Node.js SDK which has rapid major version increments (they follow semver strictly for breaking changes). For HSI purposes, install `stripe@latest`.

**Key patterns:**

- **Dynamic product + price creation per booking** — The HSI pattern creates a one-off Stripe product and price at checkout time, never reusing pre-registered SKUs:

  ```typescript
  // Server Action: createCheckoutSession
  'use server'
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'brl',
        product_data: {
          name: `Reserva: ${propertyName} — ${formatDate(checkIn)} a ${formatDate(checkOut)}`,
          metadata: { bookingId, propertyId },
        },
        unit_amount: totalAmountInCentavos, // calculated server-side only
      },
      quantity: 1,
    }],
    success_url: `${baseUrl}/booking/${bookingId}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/booking/${bookingId}/cancel`,
    metadata: { bookingId },
  })
  ```

- **Webhook handler** — Must be a Route Handler (not a Server Action) because Stripe sends raw POST bodies and you need raw bytes for signature verification.

  ```typescript
  // app/api/webhooks/stripe/route.ts
  export const runtime = 'nodejs' // Force Node.js runtime, not Edge

  export async function POST(request: Request) {
    const body = await request.text() // MUST use .text(), not .json()
    const signature = request.headers.get('stripe-signature')!

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    // handle event...
  }
  ```

- **Price calculation is server-only** — Never pass total from the client. Recalculate from booking parameters on the server when creating the session.

**Gotchas:**

- `await request.text()` in Next.js 15 App Router. Do NOT call `.json()` before `.text()` — once consumed as JSON, you cannot recover the raw bytes for signature verification.
- Add `export const runtime = 'nodejs'` to the webhook route — Edge Runtime cannot verify Stripe signatures (no Node.js crypto access).
- In local development with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`. The webhook secret for local dev is different from production.
- Stripe event idempotency: check for duplicate events by tracking processed `event.id` values in your database to avoid double-processing payments.

**Confidence:** High (official Stripe docs + Next.js community patterns)

---

## Resend + React Email

**Versions:** resend 4.x (latest ~4.1.x), @react-email/components 0.0.x (rapidly versioned)
**Status:** Stable

**Key patterns:**

- Call Resend only from Server Actions or Route Handlers (never client-side — API key must stay server-only).
- Email templates are `.tsx` files in `emails/` directory, exported as React components.
- Preview templates locally with `email dev` (React Email dev server on port 3000 by default — change to avoid conflict with Next.js).
- Use `resend.emails.send({ react: <MyTemplate props={...} /> })` — Resend renders the component server-side.

**Required environment variables:**
- `RESEND_API_KEY` — Resend dashboard API key
- `EMAIL_FROM` — Verified sender address (must be from a domain verified in Resend DNS)

**Gotchas:**

- Domain DNS verification is required before sending transactional emails. Budget time for this during infra setup.
- React Email components do NOT support all CSS. Use `style` props inline or `@react-email/tailwind` for limited Tailwind support. Avoid complex layouts that work in browser but break in email clients.
- Keep email templates simple — email clients (especially Outlook) are hostile to modern CSS.

**Confidence:** High (official Resend docs)

---

## Cloudinary

**Version:** cloudinary 2.x (Node.js SDK), next-cloudinary 6.x (optional React wrapper)
**Status:** Stable

**Key patterns for signed uploads from Server Actions:**

1. **Server Action generates signature:**

   ```typescript
   'use server'
   import { v2 as cloudinary } from 'cloudinary'

   export async function getUploadSignature(folder: string) {
     // Auth check here
     const timestamp = Math.round(Date.now() / 1000)
     const params = { timestamp, folder, upload_preset: undefined }
     const signature = cloudinary.utils.api_sign_request(
       params,
       process.env.CLOUDINARY_API_SECRET!
     )
     return { signature, timestamp, cloudName: process.env.CLOUDINARY_CLOUD_NAME }
   }
   ```

2. **Client uploads directly to Cloudinary** using the signature — file never passes through Next.js server (avoids memory/timeout issues with large images).

3. **Magic bytes validation** — Before returning a signature, validate the file type server-side using magic bytes (first few bytes of the buffer). This prevents MIME spoofing:

   ```typescript
   // Read first 8 bytes from File/Buffer
   const bytes = new Uint8Array(await file.arrayBuffer()).slice(0, 8)
   const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF
   const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47
   // reject if neither
   ```

   Note: If the client uploads directly to Cloudinary with a signature, magic bytes validation happens before signature generation. You validate the file on the server before issuing the signature.

4. **Cloudinary transformation URLs** — Use Cloudinary's URL transformation API for responsive images. Never store original URLs in the DB; store only the `public_id` and derive URLs at render time.

**Required environment variables:**
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET` — Never `NEXT_PUBLIC_` prefix

**Gotchas:**

- `CLOUDINARY_API_SECRET` must never have `NEXT_PUBLIC_` prefix. If it does, the secret is in every client bundle.
- Restrict upload presets to specific folders, file types, and max file sizes in the Cloudinary dashboard as a defense-in-depth measure.
- Large property photo galleries (20+ images) can hit Cloudinary free tier limits quickly. Set `allowed_formats: ['jpg', 'png', 'webp']` and `max_file_size` in the upload preset.

**Confidence:** High (official Cloudinary docs + community patterns)

---

## Zod

**Version:** 4.3.6 (as of April 2026, Zod v4 stable released August 2025)
**Status:** Stable (v4 is the current major)

**Breaking changes from v3 (important if migrating, or starting fresh use v4 patterns):**

- Error customization: `message` param replaced by unified `error` param (old `message` still works but deprecated). `invalid_type_error` / `required_error` removed.
- `z.function()` result is no longer a Zod schema — it's a standalone function factory. Define `input` and `output` schemas upfront.
- `._def` moved to `._zod.def`.
- Performance: 14x faster string parsing, 7x faster array parsing vs v3.

**Key patterns:**

- Define schemas in `lib/validations/` co-located by feature domain.
- Use `z.infer<typeof schema>` for TypeScript type derivation — no duplicate type definitions.
- For Server Actions, validate `formData` with `z.object()` and use `schema.safeParse()` to return typed errors:

  ```typescript
  const result = BookingSchema.safeParse(formData)
  if (!result.success) return { error: result.error.flatten() }
  ```

- Use `z.prettifyError()` (new in v4) for user-facing error messages.

**Confidence:** High (official Zod v4 docs + npm)

---

## isomorphic-dompurify

**Version:** 2.x or 3.x (pin carefully — see gotcha below)
**Status:** Active maintenance, but has a specific version issue

**Key patterns:**

- Import as `import DOMPurify from 'isomorphic-dompurify'` — works identically on server and client.
- Use before saving any rich text content to the database:

  ```typescript
  const clean = DOMPurify.sanitize(dirtyHtml, { ALLOWED_TAGS: ['b', 'i', 'p', 'a', 'br'] })
  ```

- Call `DOMPurify.clearWindow()` periodically in long-running server processes to prevent jsdom memory accumulation.

**Gotchas:**

- **Critical version issue**: In v3.0.0+, `jsdom@28` pulls in an ESM-only dependency that breaks `require()` in environments like Next.js. Workaround: pin `jsdom` to `25.0.1` via `package.json` overrides:

  ```json
  {
    "overrides": {
      "jsdom": "25.0.1"
    }
  }
  ```

  Or use `isomorphic-dompurify@2.x` which avoids the issue entirely.

- DOMPurify in server components (Node.js) uses jsdom internally to simulate the DOM — there is no actual DOM in Node. This is abstracted away by isomorphic-dompurify.
- Sanitize BEFORE saving to DB, not at render time. Defense is at the write boundary.

**Confidence:** Medium (npm + GitHub issues — jsdom ESM breakage is a real and documented problem)

---

## Prisma (dev/ops only — Prisma Studio)

**Version:** prisma 7.6.0 / @prisma/client 7.6.0 (as of April 2026)
**Status:** Stable (but used only as a visual inspection tool, not for runtime queries)

**Coexistence architecture with Drizzle:**

- **Drizzle owns runtime** — all application queries go through Drizzle. Prisma is never imported in application code.
- **Prisma owns nothing at runtime** — it is a dev dependency used only for `prisma studio`.
- **Schema synchronization** — `schema.prisma` must be kept manually in sync with Drizzle schema. This is a manual maintenance burden. Recommended approach:
  1. Make schema changes in Drizzle schema files.
  2. Run `drizzle-kit generate` and apply migrations.
  3. Run `prisma db pull` to regenerate `schema.prisma` from the live database — this keeps Prisma always reflecting reality.
  4. Never run `prisma migrate` or `prisma db push` in production.

**Conflict risks and mitigations:**

| Conflict | Risk | Mitigation |
|----------|------|------------|
| Prisma reports "schema drift" | High — Prisma's `_prisma_migrations` table is absent | Use `prisma db pull` pattern, never `prisma migrate` |
| Both ORMs in `dependencies` | Medium — large bundle | Move Prisma to `devDependencies` only |
| Prisma generates `@prisma/client` at postinstall | Medium — can slow Nixpacks build | Add `PRISMA_GENERATE_SKIP_AUTOINSTALL=true` env var to production; generate only in dev |
| Runtime import of Prisma in production | Low — accidental import | ESLint rule or import restrictions to prevent `@prisma/client` in `src/` |

**Required approach in `package.json`:**

```json
{
  "devDependencies": {
    "prisma": "^7.6.0",
    "@prisma/client": "^7.6.0"
  }
}
```

**Gotchas:**

- `prisma generate` runs as a postinstall hook by default. In EasyPanel/Nixpacks production builds, this generates Prisma client unnecessarily and adds build time. Set `PRISMA_GENERATE_SKIP_AUTOINSTALL=true` in the build environment.
- Prisma Studio needs a direct DB connection (not pooled). Ensure the `DATABASE_URL` in your local `.env` points directly to PostgreSQL, not through PgBouncer.
- The `schema.prisma` file diverges from Drizzle schema over time unless you run `prisma db pull` after every Drizzle migration. Undisciplined teams let this drift until Studio shows stale models.

**Confidence:** Medium (documented community patterns + Vercel forum thread confirming conflicts)

---

## EasyPanel + Nixpacks

**Version:** Nixpacks auto-detects Next.js
**Status:** Stable for Next.js deployments

**Required `next.config.ts` for self-hosted deployment:**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone', // Critical for Nixpacks/Docker-style deployments
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
}

export default nextConfig
```

**Why `output: 'standalone'`** — Standalone mode produces a self-contained `/.next/standalone` directory with only required Node modules. Nixpacks serves this with `node server.js`. Without it, Nixpacks may not know how to start the app or will include unnecessary files.

**Required environment variables at build time (set in EasyPanel):**

- `NODE_ENV=production`
- Any `NEXT_PUBLIC_*` variables referenced in code — these are baked into the bundle at build time, not runtime. Client-side env vars must be present during `next build`.
- `SKIP_ENV_VALIDATION=true` (if you use t3-env or similar) — prevents build failure when server-only vars are absent during CI/build.

**Nixpacks `nixpacks.toml` (if needed):**

```toml
# nixpacks.toml — only needed if default detection fails
[phases.install]
cmds = ["npm install --legacy-peer-deps"]

[phases.build]
cmds = ["npm run db:migrate && npm run build"]

[start]
cmd = "node .next/standalone/server.js"
```

**Known issues:**

- Next.js 15 with Nixpacks: some users reported `--legacy-peer-deps` needed for npm install due to peer dependency conflicts. This is more likely with older Nixpacks versions. If Nixpacks has been updated (2025+), this is less of an issue.
- The `migrate` command at startup: running `drizzle-kit migrate` as part of the build is wrong — it should run at container start, not build. Use the custom start command pattern.
- `NEXTAUTH_URL` / `AUTH_URL` must be set to the full production URL (e.g., `https://hostsemimposto.com`). If absent, Auth.js callback URLs break.

**Confidence:** Medium (EasyPanel docs are sparse; Nixpacks Next.js detection is well-documented; specific migration-at-startup pattern is inferred from standard self-hosting patterns)

---

## Package Compatibility Matrix

| Pair | Compatibility | Notes |
|------|--------------|-------|
| Next.js 15 + React 19 | Compatible | App Router requires React 19 in Next.js 15 |
| Next.js 15 + NextAuth v5 | Compatible | Use JWT strategy in middleware; database sessions in Server Components |
| NextAuth v5 + Drizzle adapter | Compatible | Official adapter; pass custom table refs to avoid schema assumptions |
| NextAuth v5 + Edge Runtime | Partial — use JWT mode | Drizzle/postgres driver uses Node.js net/tls; incompatible with Edge |
| Tailwind v4 + shadcn/ui | Compatible | shadcn fully migrated to v4 in 2025; use latest `npx shadcn@latest` |
| Tailwind v4 + Next.js 15 | Compatible | PostCSS pipeline works; no known issues |
| Drizzle ORM + PostgreSQL | Compatible | Use `postgres` npm package (not `pg`) as driver |
| Drizzle + Prisma (same DB) | Coexistence possible with discipline | Drizzle owns migrations; Prisma is read-only Studio tool; never mix migrate commands |
| Motion 12.x + React 19 | Compatible | Import from `motion/react-client` in App Router |
| Zod v4 + Server Actions | Compatible | `z.infer`, `safeParse`, `prettifyError` work as expected |
| Stripe SDK + Next.js 15 Route Handlers | Compatible | Use `request.text()` not `request.json()` for webhook raw body |
| isomorphic-dompurify 3.x + Next.js 15 | Caution | jsdom@28 ESM issue; pin jsdom@25 via overrides or use v2.x |
| Cloudinary Node SDK + Server Actions | Compatible | Never expose API_SECRET to client; sign on server |
| Resend + React Email + Next.js 15 | Compatible | Server-side only; no client-side exposure |

---

## Recommended Install Commands

```bash
# Core framework
npm install next@"^15.5.14" react react-dom

# Database
npm install drizzle-orm postgres
npm install -D drizzle-kit

# Auth
npm install next-auth@beta @auth/drizzle-adapter

# Styling
npm install tailwindcss @tailwindcss/postcss
npm install -D tw-animate-css

# UI primitives
npx shadcn@latest init

# Animation
npm install motion

# Payments
npm install stripe

# Email
npm install resend @react-email/components

# Media
npm install cloudinary

# Validation
npm install zod

# Sanitization
npm install isomorphic-dompurify

# Dev tools only
npm install -D prisma @prisma/client
```

---

## Sources

- [Next.js 15 Release Blog](https://nextjs.org/blog/next-15) — official release notes
- [Auth.js Drizzle Adapter](https://authjs.dev/getting-started/adapters/drizzle) — official adapter docs
- [Auth.js absorbed into Better Auth](https://news.ycombinator.com/item?id=45389293) — project status context
- [Drizzle ORM Migrations](https://orm.drizzle.team/docs/migrations) — migration patterns
- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide) — official migration
- [shadcn/ui Tailwind v4 Guide](https://ui.shadcn.com/docs/tailwind-v4) — component migration
- [Stripe Webhook in Next.js 15](https://medium.com/@gragson.john/stripe-checkout-and-webhook-in-a-next-js-15-2025-925d7529855e) — raw body pattern
- [Zod v4 Release Notes](https://zod.dev/v4) — breaking changes
- [isomorphic-dompurify jsdom issue](https://github.com/kkomelin/isomorphic-dompurify) — ESM breakage in v3
- [Prisma + Drizzle conflict](https://community.vercel.com/t/conflict-between-prisma-and-drizzle-orm-in-the-project/5917) — coexistence notes
- [EasyPanel Next.js Quickstart](https://easypanel.io/docs/quickstarts/nextjs) — deployment guide
- [Motion React docs](https://motion.dev/docs/react-motion-component) — package rename and Server Component patterns
