---
phase: 01-foundation-infraestrutura
plan: "04"
subsystem: admin-shell
tags: [next-themes, dark-mode, sidebar, mobile-nav, shadcn, admin-layout, dashboard]

# Dependency graph
requires:
  - phase: 01-02
    provides: Drizzle schema and db singleton
  - phase: 01-03
    provides: NextAuth v5 auth() function (auth.ts stub used until Plan 01-03 merges)
provides:
  - Admin (admin) route group with ThemeProvider defaultTheme=dark scoped to all /admin/* routes
  - Collapsible sidebar component (240px expanded / 64px collapsed) with localStorage persistence
  - Mobile bottom navigation bar (md:hidden, fixed bottom-0, 5 nav items)
  - Sticky header with notification bell shell and user dropdown (signOut)
  - ThemeToggle component switching dark/light with Sun/Moon icons
  - KpiCard component with loading skeleton state and LucideIcon support
  - Dashboard page with 4 KPI card shells, 2 chart placeholders, bookings list, alerts section
  - Shared NAV_ITEMS definition consumed by both Sidebar and MobileNav
affects: [all-admin-routes, Phase 2 imóveis management, Phase 3 booking management]

# Tech tracking
tech-stack:
  added: [next-themes]
  patterns:
    - ThemeProvider scoped to (admin) route group only — not added to root layout
    - Sidebar collapsed state hydrated from localStorage after mount to avoid SSR hydration mismatch
    - KpiCard loading prop renders Skeleton — real data wired in Phase 3 (bookings) and Phase 4 (financial)
    - NAV_ITEMS defined once in nav-items.ts imported by both Sidebar and MobileNav (DRY)
    - admin-sidebar-collapsed localStorage key for persistence across page navigations

key-files:
  created:
    - src/app/(admin)/layout.tsx - Root layout for all /admin/* routes with ThemeProvider defaultTheme=dark and auth guard
    - src/components/admin/AdminLayout.tsx - Client shell composing Sidebar + Header + MobileNav
    - src/components/admin/Sidebar.tsx - Collapsible sidebar with localStorage persistence (desktop: hidden md:flex)
    - src/components/admin/MobileNav.tsx - Bottom navigation for mobile (md:hidden, fixed bottom-0)
    - src/components/admin/Header.tsx - Sticky header with notification bell and user dropdown
    - src/components/admin/ThemeToggle.tsx - Light/dark toggle via next-themes useTheme
    - src/components/admin/KpiCard.tsx - KPI card with loading skeleton and trend support
    - src/components/admin/nav-items.ts - Shared NAV_ITEMS (6 items) for Sidebar and MobileNav
    - src/app/(admin)/admin/dashboard/page.tsx - Dashboard with 4 KPI shells, 2 chart placeholders, bookings list, alerts
    - src/lib/auth.ts - Stub for auth() function (Plan 01-03 replaces with real NextAuth v5 config)

key-decisions:
  - "auth.ts stub for parallel execution: Plan 01-04 runs in wave 3 alongside Plan 01-03; stub prevents module-not-found during parallel build"
  - "ThemeProvider scoped to (admin) route group: public-facing pages use light mode; admin always starts in dark mode"
  - "localStorage hydration after mount: useEffect reads sidebar collapsed state post-SSR to avoid React hydration mismatch"
  - "KpiCard loading=true in Phase 1: all KPI values are skeleton state; real queries arrive in Phase 3 and Phase 4"

# Metrics
duration: 6min
completed: 2026-04-05
---

# Phase 1 Plan 04: Admin Layout & Shell Summary

**Admin panel shell with collapsible sidebar, mobile bottom nav, sticky header with dark mode default, KpiCard component, and dashboard skeleton page visible at /admin/dashboard**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-05T18:29:38Z
- **Completed:** 2026-04-05T18:36:00Z
- **Tasks:** 2 of 2
- **Files created:** 10

## Accomplishments

- Created `(admin)` route group layout with `ThemeProvider defaultTheme="dark"` scoped exclusively to admin routes — public pages unaffected
- Admin layout wraps `await auth()` redirect guard — unauthenticated users are sent to `/login`
- Collapsible sidebar transitions between `w-60` (expanded) and `w-16` (collapsed) with smooth 200ms transition; state persisted in `localStorage` under key `admin-sidebar-collapsed`; SSR hydration mismatch avoided by reading localStorage only in `useEffect`
- Desktop sidebar hidden with `hidden md:flex` — mobile devices see bottom navigation instead
- MobileNav fixed to bottom with `md:hidden`, shows first 5 nav items (Settings omitted for space)
- Header includes notification Bell icon (badge hidden when count is 0, ready for Phase 5 wiring), ThemeToggle, and user dropdown with profile info + `signOut` action
- ThemeToggle switches dark/light via `useTheme()` with contextually appropriate Sun/Moon icons
- KpiCard component accepts `loading` prop rendering `<Skeleton>` for skeleton state; supports `trend` and `description` optional props for future wiring
- Dashboard page has exactly 4 KpiCard instances (all `loading`), 2 chart skeleton placeholders (h-48 Skeleton), upcoming bookings list with 3 skeleton rows, and alerts section with 2 shells
- Shared `NAV_ITEMS` in `nav-items.ts` prevents duplication between Sidebar and MobileNav

## Task Commits

1. **Task 1: Admin layout shell, Sidebar, MobileNav, Header, ThemeToggle** — `c5a8ebd` (feat)
2. **Task 2: KpiCard component and dashboard page** — `87eff11` (feat)

## Files Created

- `src/app/(admin)/layout.tsx` — ThemeProvider + auth guard + AdminLayout
- `src/components/admin/AdminLayout.tsx` — client shell with Sidebar + Header + MobileNav
- `src/components/admin/Sidebar.tsx` — collapsible sidebar with localStorage, desktop only
- `src/components/admin/MobileNav.tsx` — mobile bottom nav, md:hidden, 5 items
- `src/components/admin/Header.tsx` — sticky header with notification bell and user dropdown
- `src/components/admin/ThemeToggle.tsx` — dark/light toggle with Sun/Moon icons
- `src/components/admin/KpiCard.tsx` — KPI card with loading skeleton state
- `src/components/admin/nav-items.ts` — shared NAV_ITEMS (6 nav entries)
- `src/app/(admin)/admin/dashboard/page.tsx` — dashboard with 4 KPI + 2 charts + bookings + alerts shells
- `src/lib/auth.ts` — stub (parallel execution; Plan 01-03 replaces with real NextAuth v5)

## Decisions Made

1. **auth.ts stub for parallel execution** — Plan 01-03 and 01-04 run in the same wave. The admin layout imports `auth` from `@/lib/auth`. A minimal stub (`async function auth() { return null }`) allows the shell to build while Plan 01-03's real implementation is merged by the orchestrator.

2. **ThemeProvider scoped to (admin) route group** — adding ThemeProvider to the root layout would affect all routes including the public booking site. Scoping it to `(admin)` ensures dark mode is the default only for the admin panel.

3. **localStorage hydration after mount** — reading `localStorage.getItem()` inside `useEffect` (not during SSR) prevents a React hydration mismatch where server-rendered HTML would have `collapsed=false` but the browser state says `collapsed=true`.

4. **All KPI values loading=true in Phase 1** — the dashboard shell shows skeleton state for all KPIs; real data queries are wired in Phase 3 (bookings: Reservas Ativas, Próximos Check-ins) and Phase 4 (financial: Faturamento do Mês, Taxa de Ocupação).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Created auth.ts stub for parallel wave execution**
- **Found during:** Task 1 (creating src/app/(admin)/layout.tsx)
- **Issue:** The admin layout imports `{ auth }` from `@/lib/auth` which is created by Plan 01-03 running in the same parallel wave. Without the file, the build would fail with module-not-found.
- **Fix:** Created minimal stub `async function auth(): Promise<Session | null> { return null }` — same pattern used by Plan 01-02 for `src/lib/audit.ts`
- **Files modified:** `src/lib/auth.ts`
- **Commit:** `c5a8ebd`

**2. [Rule 1 - Bug] Added null-safe access on session.user properties**
- **Found during:** Task 1 code review
- **Issue:** The plan's code samples accessed `session.user.image`, `session.user.name`, `session.user.email` directly without optional chaining. The NextAuth Session type has `user` as optional in some versions.
- **Fix:** Changed to `session.user?.image`, `session.user?.name`, `session.user?.email` throughout Sidebar.tsx and Header.tsx
- **Files modified:** `src/components/admin/Sidebar.tsx`, `src/components/admin/Header.tsx`
- **Commit:** `c5a8ebd`

## Known Stubs

| File | Stub | Reason |
|------|------|--------|
| `src/lib/auth.ts` | `auth()` returns `null` always | Intentional — Plan 01-03 implements real NextAuth v5 auth() function |
| `src/components/admin/Header.tsx` | `unreadCount = 0` hardcoded | Intentional — notification system wired in Phase 5 |
| `src/app/(admin)/admin/dashboard/page.tsx` | All KpiCard instances have `loading` prop | Intentional — real data queries in Phase 3 and Phase 4 |

## Next Phase Readiness

- Admin route group `(admin)` established — all future admin pages go under `src/app/(admin)/admin/`
- `KpiCard` component is data-agnostic — Phase 3 and Phase 4 plans will remove the `loading` prop and pass real values
- `NAV_ITEMS` can be extended when new admin sections are added in later phases
- `Header.tsx` notification bell is pre-wired for Phase 5 (`unreadCount` variable ready to receive real data)
- Sidebar tooltip pattern supports keyboard navigation for collapsed state

---
*Phase: 01-foundation-infraestrutura*
*Completed: 2026-04-05*

## Self-Check: PASSED

All 10 key files exist. Both commits (c5a8ebd, 87eff11) verified in git log.
