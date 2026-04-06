---
phase: 1
slug: foundation-infraestrutura
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-05
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + @testing-library/react |
| **Config file** | `vitest.config.ts` — Wave 0 installs |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/[changed-domain]`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| setup-vitest | infra | 0 | — | setup | install + `npx vitest run` exits 0 | Wave 0 | ⬜ |
| auth-credentials | auth | 1 | AUTH-01 | unit | `npx vitest run tests/auth/credentials.test.ts` | Wave 0 | ⬜ |
| auth-magic-link | auth | 1 | AUTH-02 | integration | `npx vitest run tests/auth/magic-link.test.ts` | Wave 0 | ⬜ |
| auth-session | auth | 1 | AUTH-04 | integration | `npx vitest run tests/auth/session.test.ts` | Wave 0 | ⬜ |
| middleware-matcher | auth | 1 | AUTH-05, AUTH-06 | unit | `npx vitest run tests/middleware/matcher.test.ts` | Wave 0 | ⬜ |
| security-headers | security | 1 | SEC-06, SEC-07 | unit | `npx vitest run tests/middleware/security-headers.test.ts` | Wave 0 | ⬜ |
| migrations | db | 1 | OPS-02 | integration | `npx vitest run tests/db/migrations.test.ts` | Wave 0 | ⬜ |
| audit-log | security | 1 | SEC-10, SEC-11 | unit | `npx vitest run tests/lib/audit.test.ts` | Wave 0 | ⬜ |
| rate-limit | security | 1 | SEC-04 | unit | `npx vitest run tests/lib/rate-limit.test.ts` | Wave 0 | ⬜ |
| next-config | deploy | 1 | OPS-01 | unit | `npx vitest run tests/config/next-config.test.ts` | Wave 0 | ⬜ |
| sidebar | admin-ui | 2 | ADMIN-01 | unit | `npx vitest run tests/components/admin/Sidebar.test.tsx` | Wave 0 | ⬜ |

---

## Wave 0 Test Files to Create

All test files must be created in Wave 0 (setup plan) before feature plans execute:

- [ ] `vitest.config.ts` — framework configuration with jsdom + React plugin
- [ ] `tests/setup.ts` — shared fixtures (Drizzle test DB, mock auth session)
- [ ] `tests/auth/credentials.test.ts` — AUTH-01: correct password → session, wrong password → null
- [ ] `tests/auth/magic-link.test.ts` — AUTH-02: token created in verification_tokens table
- [ ] `tests/auth/session.test.ts` — AUTH-04: session persists, `auth()` returns user
- [ ] `tests/middleware/matcher.test.ts` — AUTH-05: `/admin/*` matched; AUTH-06: `/api/webhooks/stripe` NOT matched
- [ ] `tests/middleware/security-headers.test.ts` — SEC-06/07: CSP header present with correct directives
- [ ] `tests/db/migrations.test.ts` — OPS-02: migrate() runs without error against test DB
- [ ] `tests/lib/audit.test.ts` — SEC-10/11: logAction() inserts correct columns
- [ ] `tests/lib/rate-limit.test.ts` — rate limiter allows N requests, blocks N+1
- [ ] `tests/config/next-config.test.ts` — OPS-01: output: 'standalone' in next.config.ts
- [ ] `tests/components/admin/Sidebar.test.tsx` — ADMIN-01: sidebar renders without error

---

## Manual Verification Checklist (Success Criteria)

| Success Criterion | How to Verify |
|-------------------|---------------|
| SC-1: Admin can log in with email+password | Browser: open `/login`, enter credentials, confirm redirect to `/admin/dashboard` |
| SC-2: Magic link works end-to-end | Admin: request magic link, check email (Resend dashboard), click link, confirm session |
| SC-3: Unauthenticated access redirects | Browser: open `/admin/dashboard` without session, confirm redirect to `/login` |
| SC-4: EasyPanel deploy succeeds | EasyPanel: trigger build, confirm no build errors, `curl` the deployed URL returns 200 |
| SC-5: Webhook route bypasses auth | `curl -X POST https://[domain]/api/webhooks/stripe` — must NOT return 302 redirect |
| SC-6: Audit log records login | Prisma Studio: query `audit_log` after login, confirm entry with IP + user_agent |

---

## Install Command (Wave 0)

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event jsdom
```
