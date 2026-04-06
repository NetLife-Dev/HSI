---
phase: 01-foundation-infraestrutura
plan: "01"
subsystem: infra
tags: [nextjs, typescript, tailwind, shadcn, vitest, drizzle, nextauth, prisma, easypanel, nixpacks]

# Dependency graph
requires: []
provides:
  - Next.js 15 project with App Router and TypeScript strict mode
  - All Phase 1 runtime and dev dependencies installed
  - Tailwind v4 CSS-first design token theme
  - shadcn/ui components (button, input, label, form, sheet, avatar, dropdown-menu, badge, separator, tooltip, card, skeleton)
  - Geist Sans, Geist Mono, Instrument Serif fonts configured
  - next.config.ts with standalone output, Cloudinary remote pattern, 10mb server actions
  - .env.example with all 14 required environment variables
  - nixpacks.toml for EasyPanel deploy
  - prisma/schema.prisma stub for Prisma Studio
  - vitest test harness with 11 Wave 0 test stub files
  - src/middleware.ts stub (full auth impl in Plan 03)
affects: [01-02, 01-03, 01-04, 01-05, all-downstream-plans]

# Tech tracking
tech-stack:
  added:
    - next@15.5.14
    - next-auth@5.0.0-beta.30
    - "@auth/drizzle-adapter@^1.11.1"
    - drizzle-orm@^0.45.2
    - drizzle-kit@^0.31.10
    - postgres@^3.4.8
    - bcryptjs@^3.0.3
    - zod@^4.3.6
    - motion@^12.38.0
    - next-themes@^0.4.6
    - isomorphic-dompurify@^2.36.0
    - sonner@^2.0.7
    - lucide-react@^1.7.0
    - "@react-pdf/renderer@^4.3.3"
    - node-ical@^0.21.0
    - node-cron@^3.0.3
    - date-fns@^4.1.0
    - react-hook-form + "@hookform/resolvers"
    - vitest@^4.1.2
    - "@vitejs/plugin-react@^6.0.1"
    - "@testing-library/react + jest-dom"
    - prisma@^7.6.0 (dev only)
    - shadcn/ui CLI v4.1.2
  patterns:
    - Tailwind v4 CSS-first config via @theme block in globals.css (no tailwind.config.js)
    - TypeScript strict mode with noUncheckedIndexedAccess + exactOptionalPropertyTypes
    - Test files excluded from Next.js tsconfig; separate tests/tsconfig.json for vitest globals
    - Middleware matcher scoped to /admin/:path* only (never broad matcher)
    - vitest uses vmThreads pool for better performance on Windows filesystem

key-files:
  created:
    - package.json - all runtime and dev dependencies
    - tsconfig.json - strict TypeScript configuration
    - next.config.ts - standalone output, Cloudinary, server actions
    - src/app/globals.css - Tailwind v4 theme with HSI design tokens
    - src/app/layout.tsx - Geist + Instrument Serif font setup
    - .env.example - all 14 required env vars documented
    - nixpacks.toml - EasyPanel deploy config with static file copy steps
    - prisma/schema.prisma - stub for Prisma Studio
    - vitest.config.ts - test runner with jsdom environment
    - tests/setup.ts - shared mockSession and mockDb fixtures
    - tests/middleware/matcher.test.ts - real middleware contract assertions
    - tests/config/next-config.test.ts - real next.config.ts assertions
    - src/middleware.ts - stub (full implementation in Plan 03)
    - src/components/ui/ - 12 shadcn/ui components
  modified:
    - .gitignore - added !.env.example exception

key-decisions:
  - "vmThreads pool for vitest: forks pool caused worker timeouts on Windows/OneDrive filesystem; vmThreads resolves this"
  - "tests/ excluded from Next.js tsconfig: vitest globals (vi) unknown to tsc; separate tests/tsconfig.json with vitest/globals types"
  - "src/middleware.ts stub created: matcher.test.ts has real assertions that require the file to exist; stub satisfies contract, full auth impl deferred to Plan 03"
  - "form.tsx created manually: shadcn form component install hung on Windows filesystem; manually created using react-hook-form already installed"
  - "jsdom override set to 25.0.1 not as direct dep: direct dep conflicts with npm overrides; jsdom used transitively via vitest"

patterns-established:
  - "Tailwind v4: CSS-only via @theme block, no tailwind.config.js needed"
  - "Test isolation: tests/ excluded from app tsconfig; tests/tsconfig.json extends root with vitest/globals"
  - "Middleware: always use /admin/:path* specific matcher, never broad /(.*) or negative lookahead"
  - "Prisma: dev-only for Studio; Drizzle is source of truth for runtime"

requirements-completed: [OPS-01, OPS-03, OPS-04, OPS-05]

# Metrics
duration: 133min
completed: 2026-04-05
---

# Phase 1 Plan 01: Project Scaffolding & Configuration Summary

**Next.js 15 project bootstrapped with TypeScript strict mode, Tailwind v4 CSS-first theme with HSI design tokens, all Phase 1 dependencies, and vitest test harness with 11 Wave 0 stub files**

## Performance

- **Duration:** 133 min
- **Started:** 2026-04-05T14:32:17Z
- **Completed:** 2026-04-05T16:45:00Z
- **Tasks:** 2 of 2
- **Files modified:** ~35

## Accomplishments

- Bootstrapped full Next.js 15 App Router project with all 14+ runtime dependencies at exact specified versions (next-auth@5.0.0-beta.30, drizzle-orm, postgres, bcryptjs, zod, motion, next-themes, sonner, lucide-react, @react-pdf/renderer, node-ical, node-cron, date-fns)
- Configured TypeScript strict mode: `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`
- Replaced default CSS with Tailwind v4 CSS-first theme using `@theme` block with full HSI design token set including accent colors, admin dark mode palette, and typography variables
- Configured Geist Sans, Geist Mono, and Instrument Serif fonts as CSS variables in root layout
- Created next.config.ts with standalone output (required for Nixpacks), Cloudinary remote pattern, 10mb server actions body limit
- Documented all 14 required environment variables in .env.example with explanatory comments
- Created nixpacks.toml with correct startup command that copies static files before launching standalone server
- Created prisma/schema.prisma stub for Prisma Studio dev tooling
- Added 12 shadcn/ui components: button, input, label, form, sheet, avatar, dropdown-menu, badge, separator, tooltip, card, skeleton
- Configured vitest with jsdom environment and vmThreads pool; created 11 Wave 0 test stub files
- Created src/middleware.ts stub with `/admin/:path*` matcher contract (full auth implementation in Plan 03)
- `npx next build` exits 0 without TypeScript errors
- `npx vitest run` exits 0: 6 assertions pass, 34 todos skipped, 0 failures

## Task Commits

Each task was committed atomically:

1. **Task 1: Bootstrap Next.js 15 project and install all dependencies** - `9467eb3` (feat)
2. **Task 2: Configure vitest and create all Wave 0 test stubs** - `f10cd71` (feat)

**Deviation fix commit:** `80d08d7` (fix: form.tsx + tsconfig tests exclusion)

## Files Created/Modified

- `package.json` - all runtime and dev dependencies with overrides
- `tsconfig.json` - TypeScript strict mode, tests/ excluded
- `next.config.ts` - standalone output, Cloudinary, server actions
- `src/app/globals.css` - Tailwind v4 theme with shadcn base + HSI design tokens
- `src/app/layout.tsx` - Geist + Instrument Serif font configuration
- `.env.example` - 14 env vars documented with explanatory comments
- `nixpacks.toml` - EasyPanel deploy config
- `prisma/schema.prisma` - Prisma Studio stub
- `vitest.config.ts` - test runner configuration (jsdom, vmThreads)
- `tests/setup.ts` - shared mockSession and mockDb fixtures
- `tests/tsconfig.json` - test-specific TypeScript config with vitest globals
- `src/middleware.ts` - middleware stub with /admin/:path* matcher
- `src/components/ui/` - 12 shadcn/ui components (avatar, badge, button, card, dropdown-menu, form, input, label, separator, sheet, skeleton, tooltip)
- `src/lib/utils.ts` - shadcn cn() utility
- `tests/auth/credentials.test.ts` - stub (Plan 03)
- `tests/auth/magic-link.test.ts` - stub (Plan 03)
- `tests/auth/session.test.ts` - stub (Plan 03)
- `tests/middleware/matcher.test.ts` - real assertions for middleware contract
- `tests/middleware/security-headers.test.ts` - stub (Plan 05)
- `tests/db/migrations.test.ts` - stub (Plan 02)
- `tests/lib/audit.test.ts` - stub (Plan 05)
- `tests/lib/rate-limit.test.ts` - stub (Plan 05)
- `tests/config/next-config.test.ts` - real assertions for next.config.ts
- `tests/components/admin/Sidebar.test.tsx` - stub (Plan 04)
- `.gitignore` - added !.env.example exception
- `components.json` - shadcn/ui configuration
- `postcss.config.mjs` - Tailwind PostCSS config

## Decisions Made

1. **vmThreads pool for vitest** — forks pool caused worker timeouts on Windows/OneDrive filesystem due to slow subprocess spawning; vmThreads uses Node.js worker_threads which is faster in this environment

2. **tests/ excluded from Next.js tsconfig** — vitest globals (`vi`, `describe`, `it`, `expect`) are not declared in the Next.js TypeScript context; excluding `tests/` from the main tsconfig prevents build errors while maintaining type safety via `tests/tsconfig.json` that extends root with `vitest/globals` types

3. **src/middleware.ts stub** — the matcher test in `tests/middleware/matcher.test.ts` has real assertions that require the file to exist (it documents the contract for Plan 03); created a minimal stub to satisfy the contract and keep `vitest run` at exit 0

4. **form.tsx created manually** — the `npx shadcn add form` command hung indefinitely on the Windows/OneDrive filesystem during dependency installation; manually created the form component using the already-installed `react-hook-form` package

5. **jsdom as transitive override** — removing `jsdom` from direct devDependencies and keeping only the `overrides: { jsdom: "25.0.1" }` entry resolves the npm conflict where a direct dep and an override cannot coexist

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed form.tsx importing @radix-ui/react-label which is not installed**
- **Found during:** Task 2 verification (`npx next build`)
- **Issue:** Manually created form.tsx imported `@radix-ui/react-label` but shadcn v4.1.2 uses `@base-ui/react` instead; package not installed
- **Fix:** Rewrote FormLabel to use `React.ComponentProps<typeof Label>` directly without the @radix-ui/react-label import
- **Files modified:** `src/components/ui/form.tsx`
- **Verification:** Build exits 0 after fix
- **Committed in:** `80d08d7`

**2. [Rule 3 - Blocking] Excluded tests/ from Next.js tsconfig to fix vi global error**
- **Found during:** Task 2 verification (`npx next build`)
- **Issue:** `tests/setup.ts` uses `vi.fn()` which is a vitest global unknown to Next.js TypeScript compiler, causing `Cannot find name 'vi'` error
- **Fix:** Added `"tests"` to tsconfig.json exclude array; created `tests/tsconfig.json` that extends root config and adds `vitest/globals` types
- **Files modified:** `tsconfig.json`, `tests/tsconfig.json` (new)
- **Verification:** Build exits 0 after fix; vitest still runs correctly
- **Committed in:** `80d08d7`

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both auto-fixes were necessary for `npx next build` to exit 0. No scope creep.

## Issues Encountered

- **Windows/OneDrive filesystem is extremely slow for npm operations** — each npm install takes 5-10x longer than on Linux filesystem. create-next-app refused to run in a non-empty directory and required bootstrapping in a temp directory first.
- **shadcn form component install hung indefinitely** — resolved by manual component creation using already-installed react-hook-form.
- **vitest forks pool timed out** — pool workers timed out starting on Windows/OneDrive filesystem; resolved by switching to vmThreads pool.

## Next Phase Readiness

- Project builds without TypeScript errors (`npx next build` exits 0)
- All Phase 1 dependencies installed at specified versions
- Test harness configured and running (11 Wave 0 stub files, vitest exits 0)
- Design tokens established in globals.css
- next.config.ts has standalone output for Nixpacks deployment
- Ready for Plan 02: Database schema with Drizzle ORM

---
*Phase: 01-foundation-infraestrutura*
*Completed: 2026-04-05*

## Self-Check: PASSED

All 14 key files exist. All 3 commits (9467eb3, f10cd71, 80d08d7) verified in git log.
