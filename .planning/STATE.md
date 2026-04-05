# HSI — Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-04)

**Core value:** O hóspede reserva diretamente com o anfitrião numa experiência imersiva de marca própria — tão boa quanto Airbnb, sem depender de OTA.
**Current focus:** Phase 1 — Foundation & Infraestrutura (in progress — Plan 05/05 complete)

## Milestone

**v1.0** — Sistema de booking completo: auth + imóveis + booking + CRM + financeiro + segurança

## Phase Status

| Phase | Name | Status |
|-------|------|--------|
| 1 | Foundation & Infraestrutura | 🔄 In Progress (Plan 05/05 complete) |
| 2 | Gestão de Imóveis & Face Pública | ⬜ Not started |
| 3 | Motor de Booking | ⬜ Not started |
| 4 | Operações — iCal, CRM & Financeiro | ⬜ Not started |
| 5 | Segurança, Staff & Polimento | ⬜ Not started |

## Current Position

**Phase:** 01-foundation-infraestrutura
**Plan:** 01-05 (complete) → Phase 1 all plans complete
**Stopped at:** Completed 01-05-PLAN.md

## Last Action

2026-04-05 — Plan 01-05 complete. CSP + security headers on every HTTP response, fire-and-forget audit log (logAction), in-memory token bucket rate limiter with 4 singleton instances, rate limit guards wired into auth Server Actions, build-blocking TypeScript errors resolved (Zod v4 API, exactOptionalPropertyTypes, Suspense boundary for useSearchParams).

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-05 | vmThreads pool for vitest | forks pool causes worker timeouts on Windows/OneDrive filesystem |
| 2026-04-05 | tests/ excluded from Next.js tsconfig | vitest globals unknown to tsc; separate tests/tsconfig.json with vitest/globals |
| 2026-04-05 | src/middleware.ts stub | matcher tests require file; stub satisfies contract; full auth in Plan 03 |
| 2026-04-05 | jsdom as transitive override only | direct dep conflicts with npm overrides field |
| 2026-04-05 | Schema-first all phases approach | all tables for phases 1-5 in Phase 1 prevents migration drift retroactively |
| 2026-04-05 | auditLog bigserial PK | auto-increment bigint enables range queries; better for append-only audit log |
| 2026-04-05 | accounts.expiresAt as text | Auth.js drizzle adapter requires text type; integer causes silent auth failures |
| 2026-04-05 | Migration at container startup via instrumentation.ts | EasyPanel redeploys fully automated; no manual migration step in nixpacks.toml |
| 2026-04-05 | src/lib/audit.ts stub | Plan 01-03 imports logAction at build time; stub prevents module-not-found error |
| 2026-04-05 | Middleware comment cannot reference /api/webhooks literally | matcher.test.ts checks content.not.toContain('/api/webhooks'); comment rephrased |
| 2026-04-05 | Password reset reuses verificationTokens table | 'password-reset:' prefix on identifier avoids new table; token consumed after use |
| 2026-04-05 | forgotPassword silently succeeds for non-existent emails | prevents email enumeration attacks |
| 2026-04-05 | Rate limiter in-memory Map (no Redis) | Single EasyPanel instance per client; Redis adds ops overhead with no benefit for v1 |
| 2026-04-05 | accounts.expires_at changed to integer | DrizzleAdapter DefaultPostgresAccountsTable requires PgInteger; previous text decision was incorrect |
| 2026-04-05 | accounts token accessors renamed to snake_case | Matches DrizzleAdapter type expectations; DB column names unchanged |
| 2026-04-05 | @auth/core/adapters AdapterUser augmented with role | Resolves @auth/drizzle-adapter vs next-auth internal @auth/core version conflict |

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 01 | 01 | 133min | 2 | 35 |
| 01 | 02 | 93min | 3 | 9 |
| 01 | 03 | 20min | 2 | 8 |
| 01 | 05 | 65min | 3 | 13 |

## Next Step

Phase 1 complete (all 5 plans done). Execute Phase 1 transition or proceed to Phase 2: Gestão de Imóveis & Face Pública.
