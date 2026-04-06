# Phase 1: Foundation & Infraestrutura — Research

**Researched:** 2026-04-04
**Domain:** Next.js 15 App Router scaffolding, Drizzle ORM + PostgreSQL schema, NextAuth v5 + Drizzle adapter, Tailwind v4 + shadcn/ui, admin layout shell, EasyPanel/Nixpacks deployment, rate limiting, audit log, security headers
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | Admin pode fazer login com e-mail + senha (bcrypt hash) | Credentials provider + bcryptjs pattern documented; custom `password_hash` column on users table (nullable — adapter requirement) |
| AUTH-02 | Admin pode fazer login via magic link enviado por e-mail (Resend) | NextAuth v5 Resend provider documented; `verification_tokens` table required by adapter |
| AUTH-03 | Admin pode recuperar senha via token temporário com expiração | Separate password-reset token flow (custom table or verification_tokens reuse); not built into NextAuth credentials — needs custom implementation |
| AUTH-04 | Sessão persiste entre refreshes de browser (NextAuth v5, database session strategy) | `session: { strategy: 'database' }` in auth.ts; sessions table required; cookie is session-token based |
| AUTH-05 | Todas as rotas `/admin/*` são protegidas por middleware — redirect para login se não autenticado | `middleware.ts` with `matcher: ['/admin/:path*']`; NextAuth v5 `auth` exported as middleware |
| AUTH-06 | Webhook do Stripe em `/api/webhooks/stripe` é excluído do middleware de auth | Explicit matcher scoping; `/api/webhooks` never matches `/admin/:path*`; verified pattern |
| ADMIN-01 | Painel admin tem sidebar colapsável com navegação por módulo | shadcn Sheet + custom Sidebar component; `(admin)` route group with dedicated layout.tsx |
| ADMIN-02 | Dark mode é o padrão do admin com alternância para light mode | `next-themes` ThemeProvider; `defaultTheme="dark"` scoped to admin layout; CSS custom properties via `@theme` |
| ADMIN-03 | Em mobile, sidebar se transforma em navegação inferior | Tailwind `md:hidden` / `hidden md:flex` responsive breakpoints; Sheet for mobile overlay sidebar |
| ADMIN-04 | Header inclui perfil do usuário e central de notificações in-app | Shell component only in Phase 1; notification data wired in Phase 5 |
| DASH-01 | Dashboard exibe KPIs em tempo real: reservas ativas, faturamento do mês, taxa de ocupação, próximos check-ins | Shell with placeholder cards in Phase 1; real queries in Phase 3+ |
| DASH-02 | Gráfico de receita mensal dos últimos 12 meses | Recharts or shadcn chart primitives; shell only in Phase 1 |
| DASH-03 | Gráfico de taxa de ocupação por imóvel | Shell only in Phase 1 |
| DASH-04 | Lista das próximas reservas com ações rápidas | Shell only in Phase 1 |
| DASH-05 | Alertas críticos: reservas aguardando pagamento e check-outs do dia | Shell only in Phase 1 |
| OPS-01 | Projeto configurado com `output: 'standalone'` no next.config.ts | Verified required for Nixpacks; `.next/static` and `public/` must be copied into standalone dir |
| OPS-02 | Migrations do Drizzle são executadas automaticamente no startup | `migrate()` from `drizzle-orm/node-postgres/migrator` in startup script; retry loop pattern documented |
| OPS-03 | `NEXT_PUBLIC_*` variáveis de ambiente documentadas para configuração no EasyPanel antes do primeiro build | Baked at build time; complete list documented in this research |
| OPS-04 | Prisma Studio disponível para inspeção visual do banco via túnel SSH | `prisma db pull` after each Drizzle migration; never expose Studio publicly |
| OPS-05 | Prisma é dependência de desenvolvimento apenas (`devDependencies`) | Confirmed; `PRISMA_GENERATE_SKIP_AUTOINSTALL=true` required in EasyPanel build env |
| SEC-04 | Toda Server Action do admin verifica sessão e permissão antes de qualquer lógica | `await auth()` at the top of every Server Action; CVE-2025-29927 defense |
| SEC-05 | Queries sempre incluem condição de ID do usuário autenticado (tenant isolation) | Pattern established in all admin actions from Phase 1 |
| SEC-06 | Headers de segurança aplicados em todas as respostas (CSP, X-Frame-Options, HSTS, etc.) | `middleware.ts` response headers pattern; Next.js 15 headers() API |
| SEC-07 | CSP restringe scripts a própria origem + Stripe; imagens a própria origem + Cloudinary; frames a Stripe | Exact CSP header string documented in this research |
| SEC-10 | Audit log registra: login/tentativas, criação/cancelamento de reservas, CRUD de imóveis, mudanças de preço, exclusões, permissões de staff | `audit_log` table with BIGSERIAL PK; `logAction()` fire-and-forget helper |
| SEC-11 | Audit log inclui: ID usuário, tipo ação, recurso afetado, metadados, IP, user agent | Schema columns: `user_id`, `action`, `entity_type`, `entity_id`, `old_value JSONB`, `new_value JSONB`, `ip_address INET`, `user_agent TEXT`, `created_at` |
</phase_requirements>

---

## Summary

Phase 1 establishes the irreversible foundation that all subsequent phases depend on. Three categories of mistakes made here propagate in cascade: incorrect schema (schema drift requires migrations to fix, which means rewriting dependent features), wrong auth strategy (JWT cannot be revoked for staff — requires a full auth layer rewrite), and missed deployment configuration (NEXT_PUBLIC_* baked at build time means rebuilding from scratch after each fix).

The most critical decision is the middleware matcher: the `/admin/:path*` pattern must be the explicit and only matcher from the very first commit. This is not a "refine later" item. If the matcher is ever broad (e.g., `/((?!_next).*)`) even temporarily, and the Stripe webhook route gets tested, it returns 302 to the login page — and any developer who sees that response may conclude the webhook works "in production" when it actually doesn't. Specific matcher from commit 1.

The second critical decision is the edge runtime split for NextAuth v5. The Drizzle adapter uses Node.js `net`/`tls` modules that are incompatible with the Edge runtime. Middleware must use a JWT-only check (via `auth()` from NextAuth, which uses a lightweight JWT check when it detects it's running in middleware), while Server Components and Server Actions use the full `auth()` with database session validation. This split is configured automatically by NextAuth v5 when you export `auth as middleware` — but custom middleware functions that call `db` directly will fail.

**Primary recommendation:** Build in this exact order within Phase 1: (1) schema + migrations, (2) auth config + middleware, (3) next.config.ts + EasyPanel env, (4) admin shell layout, (5) dashboard shells, (6) audit log + rate limit infra, (7) security headers. Do not skip ahead to the shell before the schema is confirmed deployed.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `^15.5.14` | Framework (App Router, Server Actions, middleware) | Locked by project; npm `latest` now points to 16.x — must pin to 15.x |
| `react` / `react-dom` | `19.x` | UI runtime | Bundled with Next.js 15; App Router requires React 19 |
| `typescript` | `5.6+` | Type safety | `"strict": true` mandatory; bundled with Next.js |
| `drizzle-orm` | `0.45.2` | ORM — all runtime queries | Verified April 2026 via npm |
| `drizzle-kit` | `0.31.10` | Schema migrations (dev only) | Verified April 2026 via npm; never `push` in production |
| `postgres` | `3.4.8` | PostgreSQL driver | Use `postgres` package (not `pg`); required by Drizzle |
| `next-auth` | `5.0.0-beta.30` | Auth (sessions, credentials, magic link) | Beta tag is deliberate; widely deployed; install as `next-auth@beta` |
| `@auth/drizzle-adapter` | `1.11.1` | NextAuth ↔ Drizzle bridge | Official adapter; pass explicit table references |
| `tailwindcss` | `4.2.2` | Utility CSS | Config is CSS-only via `@theme`; no `tailwind.config.js` |
| `@tailwindcss/postcss` | `4.2.2` | Tailwind v4 PostCSS plugin | Required for Next.js PostCSS pipeline integration |
| `tw-animate-css` | `1.4.0` | Tailwind v4 animation utilities | Replaces `tailwindcss-animate` in v4 ecosystem |
| `zod` | `4.3.6` | Input validation (v4 stable Aug 2025) | Every Server Action validates with Zod before any logic |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `bcryptjs` | `3.0.3` | Password hashing | Credentials provider; pure JS (no native binding issues) |
| `@types/bcryptjs` | `3.0.0` | Types for bcryptjs | Dev dependency |
| `next-themes` | `0.4.6` | Dark/light mode provider | Admin layout ThemeProvider; `defaultTheme="dark"` |
| `lucide-react` | `1.7.0` | Icon set | Used by shadcn/ui components |
| `date-fns` | `4.1.0` | Date arithmetic | Availability calculations, formatting |
| `motion` | `12.38.0` | Animations (formerly framer-motion) | Import from `motion/react`; Phase 1 uses only for sidebar transitions |
| `sonner` | `2.0.7` | Toast notifications | shadcn/ui v4 replaced `toast` with `sonner` |
| `isomorphic-dompurify` | `2.x` (use v2, not v3) | HTML sanitization | Server-side; use v2 to avoid jsdom@28 ESM breakage |
| `prisma` | `7.6.0` | Prisma Studio (dev only) | Visual DB inspection; never import in app code |
| `@prisma/client` | `7.6.0` | Required by `prisma studio` | Dev dependency only |

### shadcn/ui
shadcn/ui is not a versioned npm package — components are source-copied into your repo via CLI. The CLI itself (`npx shadcn@latest`) is version `4.1.2` as of April 2026. Components needed for Phase 1:
- `button`, `input`, `label`, `form` — auth forms
- `sheet` — mobile sidebar overlay
- `avatar`, `dropdown-menu` — user profile in header
- `badge` — notification count
- `separator`, `tooltip` — sidebar navigation
- `card`, `skeleton` — dashboard KPI shells

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `bcryptjs` | `argon2` | `argon2` is more secure but requires native bindings that may fail in Nixpacks; `bcryptjs` is pure JS, always works |
| `next-themes` | Custom CSS class toggle | `next-themes` handles flash-of-wrong-theme (FOUC) via blocking script; custom solutions get this wrong |
| `postgres` (npm package) | `pg` | `postgres` has better TypeScript support and is the canonical Drizzle pair; `pg` still works but adds no benefit |
| In-memory Map rate limiter | Upstash Redis | Redis adds external dependency and cost; single-process HSI doesn't need distributed rate limiting |

**Installation:**
```bash
# 1. Create Next.js 15 project
npx create-next-app@"^15.5.14" hsi \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --turbopack \
  --src-dir \
  --import-alias "@/*"

cd hsi

# 2. Install runtime dependencies
npm install next-auth@beta @auth/drizzle-adapter
npm install drizzle-orm postgres
npm install bcryptjs zod
npm install next-themes lucide-react date-fns motion sonner
npm install isomorphic-dompurify@"^2.21.1"

# 3. Install dev dependencies
npm install -D drizzle-kit @types/bcryptjs
npm install -D prisma @prisma/client

# 4. shadcn/ui init (Tailwind v4 mode)
npx shadcn@latest init
# Select: TypeScript: yes, style: default, base color: neutral, CSS variables: yes
# Add components as needed:
npx shadcn@latest add button input label form sheet avatar dropdown-menu badge separator tooltip card skeleton

# 5. Apply jsdom version override (prevents isomorphic-dompurify ESM breakage in v3)
# In package.json, add:
# "overrides": { "jsdom": "25.0.1" }
```

**Version verification (run before locking):**
```bash
npm view next@"^15.5.14" version        # Should NOT resolve to 16.x
npm view next-auth dist-tags            # beta tag = 5.0.0-beta.30
npm view @auth/drizzle-adapter version  # 1.11.1
npm view drizzle-orm version            # 0.45.2
npm view tailwindcss version            # 4.2.2
```

---

## Architecture Patterns

### Recommended Project Structure
```
hsi/
├── src/
│   ├── app/
│   │   ├── (public)/                  # Guest-facing routes (no auth)
│   │   │   └── layout.tsx             # Public layout: Geist + Instrument Serif, light mode
│   │   ├── (admin)/                   # All /admin/* routes — requires session
│   │   │   ├── layout.tsx             # Admin shell: sidebar, dark mode, ThemeProvider
│   │   │   └── admin/
│   │   │       └── dashboard/
│   │   │           └── page.tsx       # KPI shell (Phase 1: placeholder cards)
│   │   ├── (auth)/                    # Login / magic-link verify — minimal layout
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── verify/page.tsx
│   │   └── api/
│   │       └── webhooks/
│   │           └── stripe/route.ts    # Raw body; excluded from middleware
│   ├── lib/
│   │   ├── auth.ts                    # NextAuth config (providers, adapter, callbacks)
│   │   ├── db/
│   │   │   ├── index.ts               # Drizzle client singleton
│   │   │   └── schema/
│   │   │       ├── auth.ts            # users, accounts, sessions, verification_tokens
│   │   │       ├── properties.ts
│   │   │       ├── bookings.ts
│   │   │       ├── availability.ts
│   │   │       ├── guests.ts
│   │   │       ├── financial.ts
│   │   │       ├── audit.ts
│   │   │       └── index.ts           # Re-exports all schemas (drizzle-kit reads this)
│   │   ├── rate-limit.ts              # In-memory token bucket (Map-based)
│   │   ├── audit.ts                   # logAction() fire-and-forget helper
│   │   └── validations/               # Zod schemas (reused by actions + route handlers)
│   ├── components/
│   │   ├── admin/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── AdminHeader.tsx
│   │   │   └── DashboardKPICard.tsx
│   │   └── ui/                        # shadcn/ui components (source-copied)
│   └── middleware.ts                  # Auth guard (at /src level for App Router)
├── drizzle/                           # Generated migration SQL files (committed to git)
├── scripts/
│   └── migrate.ts                     # Startup migration runner with retry logic
├── drizzle.config.ts
├── next.config.ts
├── postcss.config.mjs
└── prisma/
    └── schema.prisma                  # Kept in sync via `prisma db pull`
```

### Pattern 1: NextAuth v5 Configuration (Edge/Node Split)

**What:** `auth.ts` exports both the NextAuth config and the `auth()` helper. The middleware uses NextAuth's `auth` export directly — this works on Edge because NextAuth v5 detects the edge environment and performs only a JWT signature check (no DB call). Server Components and Server Actions use the same `auth()` which, in a Node.js context, validates against the database session.

**When to use:** Always. This is the only pattern that gives real session invalidation (database sessions) without breaking the edge middleware.

```typescript
// src/lib/auth.ts
import NextAuth from 'next-auth'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import Credentials from 'next-auth/providers/credentials'
import Resend from 'next-auth/providers/resend'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }),
  session: { strategy: 'database' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = z.object({
          email: z.string().email(),
          password: z.string().min(8),
        }).safeParse(credentials)
        if (!parsed.success) return null

        const user = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, parsed.data.email),
        })
        if (!user?.passwordHash) return null

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
    Resend({
      from: process.env.EMAIL_FROM!,
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        // Custom email template via Resend SDK
        // For Phase 1: use default NextAuth email
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Extend session with custom user fields from DB
      if (session.user && user) {
        session.user.id = user.id
        // session.user.role = user.role  -- extend type in next-auth.d.ts
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    verifyRequest: '/verify',
    error: '/login',
  },
})
```

### Pattern 2: Middleware (Edge-Safe, Explicit Matcher)

**What:** Export `auth` from NextAuth as middleware directly. The matcher uses explicit path scoping — `/admin/:path*` only. This means `/api/webhooks/stripe`, `/api/ical/*`, and all public routes are NEVER touched by auth middleware.

**Critical:** The matcher `'/admin/:path*'` does not match `/api/webhooks/stripe` — they are different path prefixes. There is no need for negative lookaheads or exclusion patterns when the matcher is positive-only.

```typescript
// src/middleware.ts
export { auth as middleware } from '@/lib/auth'

export const config = {
  matcher: ['/admin/:path*'],
}
```

**Why this is the safe pattern:** By using an allowlist matcher (`/admin/:path*`) rather than a denylist (exclude everything except X), the middleware never accidentally intercepts new API routes added later. Every new `/api/*` route is automatically excluded.

### Pattern 3: Drizzle Schema with Auth.js Required Tables

**What:** The `@auth/drizzle-adapter` expects specific column names and types. Any deviation causes silent failures or runtime errors. Custom columns on `users` must be nullable or have defaults.

```typescript
// src/lib/db/schema/auth.ts
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  email: text('email').unique().notNull(),
  emailVerified: timestamp('email_verified', { withTimezone: true, mode: 'date' }),
  image: text('image'),
  // Custom columns — MUST be nullable or have defaults (adapter doesn't know about them)
  passwordHash: text('password_hash'),    // nullable: credentials provider populates this
  role: text('role').default('staff'),    // default: adapter inserts work even without role
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const accounts = pgTable('accounts', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refreshToken: text('refresh_token'),
  accessToken: text('access_token'),
  expiresAt: text('expires_at'),         // text not int — adapter compatibility
  tokenType: text('token_type'),
  scope: text('scope'),
  idToken: text('id_token'),
  sessionState: text('session_state'),
}, (t) => ({
  pk: primaryKey({ columns: [t.provider, t.providerAccountId] }),
}))

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { withTimezone: true, mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { withTimezone: true, mode: 'date' }).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.identifier, t.token] }),
}))
```

### Pattern 4: Session Validation in Server Actions

**What:** Every Server Action that touches admin data starts with an auth check. Middleware is the first filter, not the only filter.

```typescript
// Pattern for all admin Server Actions
'use server'
import { auth } from '@/lib/auth'

export async function someAdminAction(formData: FormData) {
  // Step 1: Always validate session FIRST
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Unauthorized' }  // Never throw — return discriminated union
  }

  // Step 2: Validate input with Zod
  const result = SomeSchema.safeParse(Object.fromEntries(formData))
  if (!result.success) {
    return { error: result.error.flatten() }
  }

  // Step 3: Business logic (queries always scoped to authenticated user's data)
  // ...
}
```

### Pattern 5: Startup Migration with Retry

**What:** Migration runs at container start, not at build time. Wrapped in retry loop because PostgreSQL may not be ready when Next.js starts.

```typescript
// scripts/migrate.ts
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { drizzle } from 'drizzle-orm/node-postgres'
import postgres from 'postgres'

async function runMigrations(retries = 5, delayMs = 2000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const sql = postgres(process.env.DATABASE_URL!)
      const db = drizzle(sql)
      await migrate(db, { migrationsFolder: './drizzle' })
      console.log('[migrate] All migrations applied successfully')
      await sql.end()
      return
    } catch (err) {
      console.error(`[migrate] Attempt ${attempt}/${retries} failed:`, err)
      if (attempt === retries) throw err
      await new Promise(r => setTimeout(r, delayMs * attempt))  // Linear backoff
    }
  }
}

runMigrations().catch((err) => {
  console.error('[migrate] Fatal: could not apply migrations', err)
  process.exit(1)
})
```

For EasyPanel/Nixpacks, the custom start command is:
```
node -r ts-node/register scripts/migrate.ts && node .next/standalone/server.js
```
Or use `tsx` for TypeScript execution:
```
npx tsx scripts/migrate.ts && node .next/standalone/server.js
```

### Pattern 6: Drizzle Config

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/lib/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
})
```

### Pattern 7: next.config.ts for EasyPanel/Nixpacks

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',  // MANDATORY for Nixpacks — produces self-contained .next/standalone
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  // Experimental features needed for Phase 1
  experimental: {
    // typedRoutes: true,  // Enable if all routes are typed
  },
}

export default nextConfig
```

**Post-build step required for standalone mode:** The standalone output does NOT automatically copy static assets. The Nixpacks start command must copy them, or add to the build step:
```bash
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
node .next/standalone/server.js
```

### Pattern 8: Tailwind v4 Configuration

```css
/* src/app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* Typography */
  --font-sans: "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-serif: "Instrument Serif", ui-serif, Georgia, serif;

  /* Brand colors — OKLCH format preferred in Tailwind v4 */
  --color-accent: oklch(0.46 0.17 250);   /* #0071e3 equivalent */
  --color-accent-foreground: oklch(1 0 0);

  /* Admin color tokens (dark mode default) */
  --color-background: oklch(0.12 0.005 250);
  --color-foreground: oklch(0.95 0 0);
  --color-muted: oklch(0.2 0.01 250);
  --color-muted-foreground: oklch(0.65 0 0);
  --color-border: oklch(0.25 0.01 250);
  --color-card: oklch(0.15 0.005 250);

  /* Radius */
  --radius: 0.5rem;
}
```

**Key Tailwind v4 rule:** No `tailwind.config.js`. All configuration lives in CSS via `@theme`. The `@custom-variant dark` declaration enables `.dark` class-based dark mode (used by `next-themes`).

### Pattern 9: Admin Layout with Dark Mode

```typescript
// src/app/(admin)/layout.tsx
import { ThemeProvider } from 'next-themes'
import { Sidebar } from '@/components/admin/Sidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')  // Defense-in-depth: middleware + layout both check

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="flex h-screen bg-background">
        {/* Desktop sidebar */}
        <Sidebar className="hidden md:flex" />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminHeader user={session.user} />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t bg-card">
          {/* Bottom navigation items */}
        </nav>
      </div>
    </ThemeProvider>
  )
}
```

### Pattern 10: Security Headers via Middleware

**What:** Apply security headers on all responses via the middleware return value. This covers all routes including static assets.

```typescript
// src/middleware.ts — enhanced version if custom logic needed
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const CSP = [
  "default-src 'self'",
  "script-src 'self' https://js.stripe.com 'unsafe-inline'",  // unsafe-inline needed for Next.js inline scripts
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https://res.cloudinary.com data: blob:",
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  "connect-src 'self' https://api.stripe.com https://res.cloudinary.com",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

export default auth((req: NextRequest & { auth: any }) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isLoggedIn = !!req.auth

  const response = isAdminRoute && !isLoggedIn
    ? NextResponse.redirect(new URL('/login', req.url))
    : NextResponse.next()

  // Apply security headers to all responses
  response.headers.set('Content-Security-Policy', CSP)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
})

export const config = {
  matcher: ['/admin/:path*'],
}
```

**Note on CSP `unsafe-inline` for scripts:** Next.js 15 injects inline scripts for hydration that cannot be eliminated without nonce-based CSP. For Phase 1, `unsafe-inline` is acceptable. Phase 5 security audit should evaluate nonce implementation.

### Pattern 11: In-Memory Rate Limiter

```typescript
// src/lib/rate-limit.ts
type RateLimitRecord = { count: number; resetAt: number }
const store = new Map<string, RateLimitRecord>()

// Cleanup stale entries every 10 minutes (prevents memory leak in long-running process)
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of store.entries()) {
    if (now > record.resetAt) store.delete(key)
  }
}, 10 * 60 * 1000)

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const record = store.get(key)

  if (!record || now > record.resetAt) {
    const newRecord = { count: 1, resetAt: now + windowMs }
    store.set(key, newRecord)
    return { allowed: true, remaining: limit - 1, resetAt: newRecord.resetAt }
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt }
  }

  record.count++
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt }
}

// Pre-configured rate limiters for Phase 1 use:
export const loginRateLimit = (ip: string) =>
  rateLimit(`login:${ip}`, 10, 15 * 60 * 1000)          // 10 per 15 min

export const magicLinkRateLimit = (email: string) =>
  rateLimit(`magic:${email}`, 3, 60 * 60 * 1000)         // 3 per hour
```

### Pattern 12: Audit Log Helper

```typescript
// src/lib/audit.ts
import { db } from '@/lib/db'
import { auditLog } from '@/lib/db/schema'

type AuditParams = {
  userId: string | null
  action: string          // 'auth.login' | 'auth.login_failed' | 'booking.confirmed' | etc.
  entityType: string      // 'user' | 'booking' | 'property' | 'session'
  entityId?: string
  oldValue?: unknown
  newValue?: unknown
  ipAddress?: string
  userAgent?: string
}

export function logAction(params: AuditParams): void {
  // Fire-and-forget: never awaited, never throws
  db.insert(auditLog).values({
    userId: params.userId,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    oldValue: params.oldValue ? JSON.stringify(params.oldValue) : null,
    newValue: params.newValue ? JSON.stringify(params.newValue) : null,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  }).catch((err) => {
    console.error('[audit] Failed to log action:', params.action, err)
    // Do NOT re-throw — audit failures must never break the main flow
  })
}

// Usage example in auth callback:
// logAction({ userId: user.id, action: 'auth.login', entityType: 'user', entityId: user.id, ipAddress: req.ip })
```

### Anti-Patterns to Avoid

- **Broad middleware matcher** — `/((?!_next).*)` or `['/(.*?)']`: intercepts `/api/webhooks/stripe`, causing Stripe 302 redirects. Use `/admin/:path*` exclusively.
- **`NOT NULL` custom columns on `users` without defaults**: The Drizzle adapter's `createUser` inserts only Auth.js fields; `NOT NULL` columns the adapter doesn't know about cause the insert to fail. Always nullable or default.
- **`drizzle-kit push` in production**: Bypasses migration history. CI should guard against this.
- **Awaiting `logAction()`**: The audit helper is intentionally fire-and-forget. Awaiting it makes audit failures block the main request flow.
- **`CLOUDINARY_API_SECRET` with `NEXT_PUBLIC_` prefix**: Although Cloudinary is Phase 2, never prefix any secret env var this way — set the convention in Phase 1.
- **Edge runtime + Drizzle in middleware**: The Drizzle `postgres` driver uses `net`/`tls` — incompatible with Edge. Never import `db` in `middleware.ts`.
- **`throw` inside a Server Action called from a Client Component**: Return `{ error: string }` instead; uncaught throws crash the React tree silently.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Password hashing | Custom hash function | `bcryptjs` | Bcrypt cost factor, salt generation, timing-safe comparison — all handled |
| Session management | Custom JWT or cookie | `next-auth@beta` with database strategy | CSRF, rotation, invalidation, adapter all handled |
| Dark mode toggle | CSS class toggle + localStorage | `next-themes` | Handles FOUC (blocking script), SSR, system preference detection |
| Form validation | Manual field checks | `zod` + `useActionState` | Type derivation, nested errors, coercion, `safeParse` error normalization |
| UI primitives | Custom Button/Input/Dialog | shadcn/ui | Accessible by default (Radix UI primitives), Tailwind-compatible, you own the source |
| Rate limiting (no Redis) | Counter in DB per request | In-memory Map token bucket | DB round-trip per request is expensive; Map is O(1) and zero-latency for single-process |
| Migration tracking | Manual SQL version table | `drizzle-kit` + `migrate()` | Drizzle tracks applied migrations in `__drizzle_migrations`; provides rollback capability |

**Key insight:** The auth layer in particular has dozens of subtle edge cases (CSRF, token rotation, session fixation, magic link replay) that Next.js developers consistently get wrong when building custom. NextAuth v5 with the database adapter handles all of them.

---

## Complete Drizzle Schema

All tables needed across all phases — create the full schema in Phase 1 so migrations run cleanly. Tables used only in later phases (e.g., `transactions`, `ical_feeds`) are created now but left empty.

```typescript
// src/lib/db/schema/auth.ts — (see Pattern 3 above for full code)

// src/lib/db/schema/properties.ts
import {
  pgTable, uuid, text, integer, boolean, timestamp, time, jsonb
} from 'drizzle-orm/pg-core'

export const properties = pgTable('properties', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').unique().notNull(),
  name: text('name').notNull(),
  description: text('description'),          // Sanitized HTML (DOMPurify before INSERT)
  location: text('location'),
  address: text('address'),
  latitude: text('latitude'),                // Store as text to avoid float precision issues
  longitude: text('longitude'),
  maxGuests: integer('max_guests').notNull().default(2),
  bedrooms: integer('bedrooms').notNull().default(1),
  bathrooms: integer('bathrooms').notNull().default(1),
  basePriceCents: integer('base_price_cents').notNull(),  // BRL centavos
  cleaningFeeCents: integer('cleaning_fee_cents').notNull().default(0),
  amenities: jsonb('amenities').default('[]'),            // string[] as JSONB
  checkInTime: time('check_in_time').default('15:00'),
  checkOutTime: time('check_out_time').default('11:00'),
  minNights: integer('min_nights').default(2),
  status: text('status').notNull().default('active'),    // 'active'|'inactive'|'maintenance'
  isFeatured: boolean('is_featured').default(false),
  coverImageUrl: text('cover_image_url'),
  cloudinaryFolder: text('cloudinary_folder'),           // e.g. "hsi/prop-abc123"
  youtubeUrl: text('youtube_url'),
  rules: text('rules'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

export const propertyImages = pgTable('property_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  cloudinaryId: text('cloudinary_id').notNull(),
  url: text('url').notNull(),
  altText: text('alt_text'),
  position: integer('position').default(0),
  room: text('room'),                       // 'sala'|'quarto'|'cozinha'|'area_externa'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const seasonalPrices = pgTable('seasonal_prices', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  label: text('label'),                     // "Carnaval 2026", "Alta Temporada"
  startDate: text('start_date').notNull(),  // DATE as text 'YYYY-MM-DD'
  endDate: text('end_date').notNull(),
  priceCents: integer('price_cents').notNull(),
  priority: integer('priority').default(0), // Higher priority wins on overlap
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// src/lib/db/schema/bookings.ts
import { pgTable, uuid, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core'
import { properties } from './properties'
import { users } from './auth'

export const guests = pgTable('guests', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  document: text('document'),              // CPF or passport
  notes: text('notes'),
  tags: text('tags').array().default([]),
  pipelineStage: text('pipeline_stage').default('lead'), // 'lead'|'contacted'|'proposal'|'confirmed'|'done'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id').notNull().references(() => properties.id),
  guestId: uuid('guest_id').references(() => guests.id),
  checkIn: text('check_in').notNull(),     // DATE as 'YYYY-MM-DD'
  checkOut: text('check_out').notNull(),
  numGuests: integer('num_guests').notNull().default(1),
  status: text('status').notNull().default('pending'),
  // pending | awaiting_payment | confirmed | checked_in | checked_out | cancelled | no_show
  subtotalCents: integer('subtotal_cents').notNull(),
  cleaningFeeCents: integer('cleaning_fee_cents').notNull().default(0),
  discountCents: integer('discount_cents').default(0),
  totalCents: integer('total_cents').notNull(),
  paymentMethod: text('payment_method'),   // 'stripe'|'pix'|'transfer'|'cash'
  stripeSessionId: text('stripe_session_id').unique(),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  stripeEventId: text('stripe_event_id'), // Last processed webhook event (idempotency)
  source: text('source').default('direct'), // 'direct'|'airbnb'|'booking'|'vrbo'|'manual'
  notes: text('notes'),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  cancellationReason: text('cancellation_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

export const processedWebhookEvents = pgTable('processed_webhook_events', {
  stripeEventId: text('stripe_event_id').primaryKey(),
  processedAt: timestamp('processed_at', { withTimezone: true }).defaultNow(),
})

// src/lib/db/schema/availability.ts
import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core'
import { properties } from './properties'
import { bookings } from './bookings'

export const blockedDates = pgTable('blocked_dates', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  startDate: text('start_date').notNull(),  // DATE as 'YYYY-MM-DD'
  endDate: text('end_date').notNull(),
  source: text('source').notNull().default('manual'), // 'manual'|'booking'|'ical:{feed_id}'
  bookingId: uuid('booking_id').references(() => bookings.id, { onDelete: 'set null' }),
  icalUid: text('ical_uid'),               // VEVENT UID for dedup
  label: text('label'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const icalFeeds = pgTable('ical_feeds', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),            // "Airbnb", "VRBO"
  url: text('url').notNull(),
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
  lastError: text('last_error'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// src/lib/db/schema/financial.ts
import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { bookings } from './bookings'
import { users } from './auth'

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookingId: uuid('booking_id').references(() => bookings.id),
  type: text('type').notNull(),            // 'income'|'expense'|'refund'
  category: text('category'),             // 'limpeza'|'manutencao'|'comissao'|'outros'
  amountCents: integer('amount_cents').notNull(),
  description: text('description'),
  date: text('date').notNull(),            // DATE as 'YYYY-MM-DD'
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const proposals = pgTable('proposals', {
  id: uuid('id').defaultRandom().primaryKey(),
  guestId: uuid('guest_id').references(() => guests.id),
  propertyId: uuid('property_id').references(() => properties.id),
  checkIn: text('check_in'),
  checkOut: text('check_out'),
  totalCents: integer('total_cents'),
  validUntil: text('valid_until'),         // DATE as 'YYYY-MM-DD'
  status: text('status').default('draft'), // 'draft'|'sent'|'accepted'|'rejected'
  pdfUrl: text('pdf_url'),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Import guests for proposals (from bookings.ts)
import { guests } from './bookings'

// src/lib/db/schema/audit.ts
import { pgTable, bigserial, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { users } from './auth'

export const auditLog = pgTable('audit_log', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),  // BIGSERIAL, not UUID — high write volume
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(),        // 'auth.login' | 'booking.confirmed' | etc.
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id'),
  oldValue: jsonb('old_value'),
  newValue: jsonb('new_value'),
  ipAddress: text('ip_address'),           // INET as text (Drizzle doesn't have native inet type)
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// src/lib/db/schema/index.ts — re-export everything (drizzle-kit reads this file)
export * from './auth'
export * from './properties'
export * from './bookings'
export * from './availability'
export * from './financial'
export * from './audit'
```

**Critical indexes to add in a migration after the schema:**
```sql
-- Availability conflict detection (hot path — runs on every booking attempt)
CREATE INDEX idx_blocked_dates_property ON blocked_dates(property_id, start_date, end_date);

-- Unique iCal dedup (prevents duplicate blocks from re-importing same feed)
CREATE UNIQUE INDEX idx_ical_blocks_uid ON blocked_dates(ical_uid, property_id)
  WHERE ical_uid IS NOT NULL;

-- Booking lookup by Stripe session (webhook handler)
CREATE INDEX idx_bookings_stripe_session ON bookings(stripe_session_id);

-- Property active listing
CREATE INDEX idx_properties_active ON properties(active, created_at DESC)
  WHERE status = 'active';

-- Audit log query patterns
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_log(user_id, created_at DESC);
```

---

## Common Pitfalls

### Pitfall 1: Middleware Intercepting Stripe Webhooks
**What goes wrong:** Any matcher broader than `/admin/:path*` (e.g., `/api/:path*` or negation patterns) will intercept the Stripe webhook route. Stripe sees a 302 redirect response, treats it as a failure, and retries for 3 days. Bookings are never confirmed. No error appears in app logs — just silent 302s.
**Why it happens:** Developers add auth middleware to "protect all API routes" and forget that Stripe webhooks are public endpoints that must not be authenticated.
**How to avoid:** Use a positive-only matcher: `matcher: ['/admin/:path*']`. Never use negative lookaheads unless you explicitly list every excluded path.
**Warning signs:** Stripe webhook dashboard shows delivery failures with 3xx status codes; bookings stuck in "awaiting_payment" indefinitely.

### Pitfall 2: NOT NULL Custom Columns on Users Table
**What goes wrong:** Adding `role text('role').notNull()` to the users table without a default causes the NextAuth Drizzle adapter's `createUser()` insert to fail with `null value violates not-null constraint` when a user first signs in with magic link.
**Why it happens:** The adapter generates its own INSERT statement with only the fields it knows about (`name`, `email`, `emailVerified`, `image`). It doesn't know about `role`.
**How to avoid:** All custom columns on `users` must be nullable (`.notNull()` removed) OR have a `.default()` value. Use `.default('staff')` for role — this is safe because the first admin will be the owner, set manually.
**Warning signs:** Magic link or OAuth sign-in completes but creates no user; PostgreSQL logs show NOT NULL constraint error.

### Pitfall 3: NEXT_PUBLIC_* Variables Set After First Build
**What goes wrong:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_APP_URL` and other client-side vars are baked into the Next.js bundle at `next build` time. If they're not set in EasyPanel before the build trigger, they compile as `undefined` strings. Setting them in EasyPanel after the build has zero effect until a full rebuild.
**Why it happens:** Developers assume all env vars are runtime-injected like in server code. `NEXT_PUBLIC_` vars are a compile-time substitution.
**How to avoid:** Document all `NEXT_PUBLIC_*` vars (see Environment section below). Configure ALL of them in EasyPanel before triggering the first build. Any change to a `NEXT_PUBLIC_*` var requires a new build.
**Warning signs:** Stripe publishable key appears as `undefined` in browser console; Stripe.js fails to initialize.

### Pitfall 4: standalone Output Missing Static Files
**What goes wrong:** `output: 'standalone'` is set, the build succeeds, but the deployed app serves 404 for all static assets (`/_next/static/*`) and public files. The app "works" but CSS is missing and images don't load.
**Why it happens:** Standalone mode puts the server in `.next/standalone/` but does NOT copy static files. They remain in `.next/static/` and `public/`. The server only serves JS — static assets need to be explicitly moved.
**How to avoid:** The nixpacks start command must copy before starting: `cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public && node .next/standalone/server.js`
**Warning signs:** App serves HTML but shows unstyled page; browser network tab shows 404 for `/_next/static/chunks/*.js`.

### Pitfall 5: Database Session Strategy + Edge Middleware Conflict
**What goes wrong:** When using `session: { strategy: 'database' }` in auth.ts and exporting `auth as middleware`, the middleware attempts to make a database query on Edge runtime, which fails because the `postgres` npm package uses Node.js `net`/`tls` APIs.
**Why it happens:** NextAuth v5 should automatically detect edge context and fall back to JWT-only check. But if the database connection is imported directly in middleware (or middleware imports something that imports the db), the Node.js modules get bundled into the edge worker.
**How to avoid:** Never import `db` (or anything that imports `db`) in `middleware.ts`. The middleware file must only import from `@/lib/auth` (which NextAuth v5 handles edge-safely). Validate with `next build` — edge runtime module errors appear at build time.
**Warning signs:** Middleware throws `The edge runtime does not support Node.js 'net' module`; build fails or middleware returns 500.

### Pitfall 6: Prisma Generating Client at Nixpacks Install Time
**What goes wrong:** Prisma has a `postinstall` hook that runs `prisma generate` automatically. During Nixpacks build, this attempts to generate the Prisma client, which can fail if the schema is absent or the database is unreachable, causing the entire build to fail.
**Why it happens:** `prisma` is listed in `devDependencies` (correct), but npm still runs postinstall hooks for devDependencies during `npm install`. The Nixpacks build environment may not have a DATABASE_URL available at install time.
**How to avoid:** Set `PRISMA_GENERATE_SKIP_AUTOINSTALL=true` as an environment variable in EasyPanel's build configuration. This disables the automatic postinstall hook.
**Warning signs:** Nixpacks build log shows `Error: Cannot find module '.prisma/client'` or Prisma schema parsing error during install phase.

### Pitfall 7: Tailwind v4 with shadcn init Failing to Detect Config
**What goes wrong:** `npx shadcn@latest init` reports "no Tailwind config detected" and either exits with an error or sets up a v3-compatible configuration (creating a `tailwind.config.js`), which conflicts with Tailwind v4's CSS-only approach.
**Why it happens:** Older versions of the shadcn CLI checked for the presence of `tailwind.config.js`. In Tailwind v4, this file doesn't exist.
**How to avoid:** Ensure you're using `npx shadcn@latest` (version 4.1.2 as of April 2026 — this version has Tailwind v4 detection). If the CLI still fails, use `--force` flag or manually inspect/edit the `components.json` it generates.
**Warning signs:** After init, a `tailwind.config.js` file appears in the project root; `@theme` directives stop working.

---

## Environment Variables

### Required Before First Build (EasyPanel — Build Configuration)

These are `NEXT_PUBLIC_*` vars that are baked into the bundle at build time:

| Variable | Example Value | Notes |
|----------|---------------|-------|
| `NEXT_PUBLIC_APP_URL` | `https://hostsemimposto.com.br` | Full domain; used for Stripe success/cancel URLs |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Stripe publishable key (safe to expose) |

### Required at Runtime (EasyPanel — App Environment)

These are server-only vars read at request time:

| Variable | Notes |
|----------|-------|
| `DATABASE_URL` | PostgreSQL connection string: `postgresql://user:pass@host:5432/dbname` |
| `AUTH_SECRET` | Minimum 32 chars random string; generate with `openssl rand -base64 32` |
| `AUTH_URL` | Same as `NEXT_PUBLIC_APP_URL`; required by NextAuth v5 for callback URLs |
| `AUTH_RESEND_KEY` | Resend API key (for magic link emails) |
| `EMAIL_FROM` | Verified sender address, e.g. `noreply@hostsemimposto.com.br` |
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook dashboard; `whsec_...` |
| `CLOUDINARY_CLOUD_NAME` | (Phase 2 — set now to avoid rebuild) |
| `CLOUDINARY_API_KEY` | (Phase 2 — set now to avoid rebuild) |
| `CLOUDINARY_API_SECRET` | NEVER use `NEXT_PUBLIC_` prefix for this |
| `PRISMA_GENERATE_SKIP_AUTOINSTALL` | `true` — required in EasyPanel build env |
| `NODE_ENV` | `production` |

### Phase 1 Minimum Set (bare minimum to pass Phase 1 success criteria)

`DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `AUTH_RESEND_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_APP_URL`, `PRISMA_GENERATE_SKIP_AUTOINSTALL`

---

## Code Examples

### Auth Callback with Audit Logging

```typescript
// In auth.ts callbacks section:
events: {
  async signIn({ user, account, isNewUser }) {
    logAction({
      userId: user.id ?? null,
      action: 'auth.login',
      entityType: 'user',
      entityId: user.id,
      newValue: { provider: account?.provider, isNewUser },
    })
  },
  async signOut({ session }) {
    logAction({
      userId: session?.userId ?? null,
      action: 'auth.logout',
      entityType: 'session',
      entityId: session?.sessionToken,
    })
  },
},
```

### Drizzle Client Singleton

```typescript
// src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres'
import postgres from 'postgres'
import * as schema from './schema'

// Singleton pattern — Next.js HMR can create multiple instances in dev
const globalForDb = globalThis as unknown as { postgres?: ReturnType<typeof postgres> }

const sql = globalForDb.postgres ?? postgres(process.env.DATABASE_URL!)

if (process.env.NODE_ENV !== 'production') {
  globalForDb.postgres = sql
}

export const db = drizzle(sql, { schema })
export type DB = typeof db
```

### package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "tsx scripts/migrate.ts",
    "db:studio": "drizzle-kit studio",
    "prisma:pull": "prisma db pull",
    "prisma:studio": "prisma studio"
  },
  "overrides": {
    "jsdom": "25.0.1"
  }
}
```

### tsconfig.json (strict mode)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### postcss.config.mjs

```javascript
// postcss.config.mjs
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
export default config
```

Note: `create-next-app` with Tailwind creates a `postcss.config.mjs` using the old `tailwindcss` plugin. For Tailwind v4, replace with `@tailwindcss/postcss`.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` with `content` array | CSS `@theme` directive; no config file | Tailwind v4 (2025) | All documentation from 2024 or earlier is wrong |
| `@tailwind base/components/utilities` imports | `@import "tailwindcss"` | Tailwind v4 | Single import replaces three |
| `tailwindcss-animate` | `tw-animate-css` | shadcn v4 migration | Package was renamed; old package still works but deprecated in shadcn context |
| `framer-motion` | `motion` (import from `motion/react`) | Motion 11+ (2024) | `framer-motion` is now a re-export wrapper; canonical package is `motion` |
| NextAuth `NEXTAUTH_SECRET` | `AUTH_SECRET` | NextAuth v5 | Env var name changed; both still work but `AUTH_SECRET` is canonical |
| NextAuth `NEXTAUTH_URL` | `AUTH_URL` | NextAuth v5 | Same rename |
| `getServerSession(authOptions)` | `auth()` | NextAuth v5 | Direct export from auth.ts; no options object needed |
| `pages/api/auth/[...nextauth].ts` | `app/api/auth/[...nextauth]/route.ts` | NextAuth v5 + App Router | Route Handler instead of Pages API |
| Prisma as primary ORM | Drizzle ORM for runtime; Prisma for Studio only | Community shift 2024-2025 | Drizzle has better TypeScript inference, no code generation required |
| `serial` / `SERIAL` in PostgreSQL | `generatedAlwaysAsIdentity()` in Drizzle | PostgreSQL 10+ / Drizzle 2025 | `serial` is deprecated PostgreSQL practice; `bigserial` acceptable for high-volume tables like audit_log |
| Zod v3 `z.object().parse()` | Zod v4 `z.object().safeParse()` + `z.prettifyError()` | Zod v4 (Aug 2025) | `invalid_type_error`/`required_error` removed; unified `error` param |

---

## Open Questions

1. **shadcn init with Tailwind v4 — CLI version detection**
   - What we know: shadcn CLI 4.1.2 claims Tailwind v4 support; there are reported issues with detection when no `tailwind.config.js` is present
   - What's unclear: Does the exact `create-next-app` with Tailwind v4 option produce a config that shadcn init reliably detects?
   - Recommendation: Run `npx shadcn@latest init` immediately after `create-next-app` before modifying any files; if it creates `tailwind.config.js`, delete it and rewrite `globals.css` with `@import "tailwindcss"`.

2. **NextAuth v5 session callback TypeScript augmentation**
   - What we know: NextAuth v5 uses module augmentation (`next-auth.d.ts`) to extend the `Session` type with custom fields like `role`
   - What's unclear: The exact augmentation syntax changed between beta.20 and beta.30
   - Recommendation: Create `src/types/next-auth.d.ts` with the `role` extension; test that `session.user.role` is typed after the credentials `authorize` callback returns it.

3. **Nixpacks static file copy step**
   - What we know: `output: 'standalone'` does not auto-copy `.next/static` and `public/`; this must be done in the start command
   - What's unclear: Whether EasyPanel's Nixpacks integration provides a post-build hook or whether it must be encoded in the start command
   - Recommendation: Use a combined start command: `cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public && node .next/standalone/server.js`; test locally with `NODE_ENV=production node .next/standalone/server.js` before first EasyPanel deploy.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js runtime | Yes (WSL env) | 20.20.1 | — |
| npm | Package management | Yes | 10.8.2 | — |
| PostgreSQL | Database | Yes (WSL) | 16.13 | — |
| Docker | Container testing | No | — | Test standalone mode with `node .next/standalone/server.js` directly |
| EasyPanel | Production deployment | Not tested locally | — | Test build locally; deploy once env vars are ready |

**Node.js 20.x is compatible with Next.js 15** (minimum is 18.18.0).

**Missing dependencies with no fallback:**
- PostgreSQL must be running locally for `db:migrate` and development. It is available.

**Missing dependencies with fallback:**
- Docker unavailable: can still test `standalone` output mode by running `node .next/standalone/server.js` after build.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (recommended) or Jest — neither pre-installed; Wave 0 must install |
| Config file | `vitest.config.ts` — does not exist yet (Wave 0 gap) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

**Why Vitest over Jest for Next.js 15:** Vitest has native ESM support without transform configuration, integrates better with Tailwind v4's PostCSS pipeline, and is faster. Next.js 15 with App Router still requires `@vitejs/plugin-react` for JSX and setting `jsdom` as the test environment.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Credentials login with correct password returns session | unit | `npx vitest run tests/auth/credentials.test.ts` | Wave 0 |
| AUTH-01 | Credentials login with wrong password returns null | unit | `npx vitest run tests/auth/credentials.test.ts` | Wave 0 |
| AUTH-02 | Magic link token is created in verification_tokens table | integration | `npx vitest run tests/auth/magic-link.test.ts` | Wave 0 |
| AUTH-04 | Database session persists across requests | integration | `npx vitest run tests/auth/session.test.ts` | Wave 0 |
| AUTH-05 | Request to /admin without session redirects to /login | smoke | Manual browser test + middleware unit test | Wave 0 |
| AUTH-06 | POST to /api/webhooks/stripe is NOT intercepted by middleware | unit | `npx vitest run tests/middleware/matcher.test.ts` | Wave 0 |
| OPS-01 | `output: 'standalone'` present in next.config.ts | unit | `npx vitest run tests/config/next-config.test.ts` | Wave 0 |
| OPS-02 | `scripts/migrate.ts` runs without error against test DB | integration | `npx vitest run tests/db/migrations.test.ts` | Wave 0 |
| SEC-06/07 | CSP header present and contains correct directives | unit | `npx vitest run tests/middleware/security-headers.test.ts` | Wave 0 |
| SEC-10/11 | `logAction()` inserts into audit_log with correct columns | unit | `npx vitest run tests/lib/audit.test.ts` | Wave 0 |
| ADMIN-01 | Sidebar renders without error | unit | `npx vitest run tests/components/admin/Sidebar.test.tsx` | Wave 0 |

**Success criteria tests (manual verification):**
- SUCCESS-1: Admin opens `/login`, logs in with email+password, redirects to `/admin/dashboard` — manual browser test
- SUCCESS-2: Magic link email received, link clicked, session persists after browser restart — manual test + Resend dashboard confirmation
- SUCCESS-3: Accessing `/admin/*` without session redirects to `/login` — automated middleware test covers this
- SUCCESS-5: Console.log in `/api/webhooks/stripe` receives POST from `curl` without auth redirect — automated test + local curl test

### Sampling Rate
- **Per task commit:** `npx vitest run tests/[changed-domain]`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before marking Phase 1 complete

### Wave 0 Gaps
- [ ] `tests/auth/credentials.test.ts` — covers AUTH-01
- [ ] `tests/auth/magic-link.test.ts` — covers AUTH-02
- [ ] `tests/auth/session.test.ts` — covers AUTH-04
- [ ] `tests/middleware/matcher.test.ts` — covers AUTH-05, AUTH-06 (critical: test that webhook route is NOT matched)
- [ ] `tests/middleware/security-headers.test.ts` — covers SEC-06, SEC-07
- [ ] `tests/db/migrations.test.ts` — covers OPS-02
- [ ] `tests/lib/audit.test.ts` — covers SEC-10, SEC-11
- [ ] `tests/lib/rate-limit.test.ts` — covers rate limiting infrastructure
- [ ] `tests/config/next-config.test.ts` — covers OPS-01
- [ ] `tests/components/admin/Sidebar.test.tsx` — covers ADMIN-01
- [ ] `vitest.config.ts` — framework configuration
- [ ] `tests/setup.ts` — shared test fixtures (Drizzle test DB, mock auth session)
- [ ] Framework install: `npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event jsdom` — if none detected

---

## Sources

### Primary (HIGH confidence)
- [Next.js 15 Stable Release](https://nextjs.org/blog/next-15) — async request APIs, turbopack, standalone output
- [Next.js standalone output docs](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) — static file copy requirement
- [Auth.js Drizzle Adapter](https://authjs.dev/getting-started/adapters/drizzle) — exact table schema, adapter configuration
- [Auth.js v5 Migration Guide](https://authjs.dev/getting-started/migrating-to-v5) — env var renames, API changes
- [Drizzle ORM migrations](https://orm.drizzle.team/docs/migrations) — `generate` + `migrate()` production pattern
- [Tailwind v4 upgrade guide](https://tailwindcss.com/docs/upgrade-guide) — `@theme` directive, removed utilities
- [shadcn/ui Tailwind v4 guide](https://ui.shadcn.com/docs/tailwind-v4) — component migration, `tw-animate-css`
- [CVE-2025-29927](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass) — middleware bypass rationale
- npm registry (verified April 2026): next@15.5.14 (15.x line), next-auth@5.0.0-beta.30, @auth/drizzle-adapter@1.11.1, drizzle-orm@0.45.2, drizzle-kit@0.31.10, tailwindcss@4.2.2, zod@4.3.6, motion@12.38.0, bcryptjs@3.0.3, next-themes@0.4.6, sonner@2.0.7, lucide-react@1.7.0

### Secondary (MEDIUM confidence)
- [EasyPanel Next.js quickstart](https://easypanel.io/docs/quickstarts/nextjs) — nixpacks deployment patterns
- [Stripe webhook raw body — Next.js issue #60002](https://github.com/vercel/next.js/issues/60002) — request.text() pattern
- [isomorphic-dompurify jsdom issue](https://github.com/kkomelin/isomorphic-dompurify) — v3 ESM breakage with jsdom@28
- [Prisma + Drizzle coexistence](https://community.vercel.com/t/conflict-between-prisma-and-drizzle-orm-in-the-project/5917) — devDependency pattern

### Tertiary (LOW confidence — flag for validation)
- EasyPanel nixpacks.toml start command syntax — documentation is sparse; verify against current EasyPanel docs at deploy time
- `AUTH_RESEND_KEY` env var name for NextAuth v5 Resend provider — check official Auth.js provider docs; may be `AUTH_RESEND_API_KEY`

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified via npm registry April 2026; STACK.md from prior research cross-verified
- Architecture: HIGH — patterns from Auth.js official docs + CVE research; middleware pattern confirmed against Next.js source
- Drizzle schema: HIGH — based on ARCHITECTURE.md from prior research (HIGH confidence); cross-checked with Auth.js adapter schema requirements
- Pitfalls: HIGH — all 7 pitfalls verified against official docs, GitHub issues, or CVE references
- EasyPanel/Nixpacks deployment: MEDIUM — EasyPanel docs are sparse; nixpacks.toml start command syntax needs validation at deploy time

**Research date:** 2026-04-04
**Valid until:** 2026-05-04 (30 days — stable ecosystem; NextAuth v5 beta may release new beta; check npm dist-tags.beta before coding)
