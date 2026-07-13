# Gamio — Refactoring & System Optimization Plan

Goal: turn the current mix of legacy static HTML + React shell into a clean, fast, type-safe TanStack Start app, and tighten the backend (RLS, RPCs, indexes) for correctness and performance. Each phase is independently shippable.

---

## Phase 1 — Kill the HTML blob (biggest win)

Today `src/gamio-body.html` is injected via `dangerouslySetInnerHTML` and driven by `public/gamio.js` + `public/css/tailwind-build.css`. This bypasses React, Tailwind v4, SSR, i18n, dark mode, and code-splitting.

Steps:
1. Split `LandingPage` into real components: `Hero`, `Consoles`, `WhyUs`, `HowItWorks`, `Pricing`, `Testimonials`, `FAQ`, `CTA` (Header/Footer already exist).
2. Move all styles into `src/styles.css` using Tailwind v4 tokens (no more `public/css/tailwind-build.css`, no `tw-` prefix).
3. Delete `public/gamio.js` and `src/gamio-body.html` after each section is ported; replace scroll/nav behavior with Framer Motion + `IntersectionObserver` hooks.
4. Replace hand-rolled mobile drawer with shadcn `Sheet`, desktop nav with `NavigationMenu`.

Outcome: one source of truth, real HMR, working dark mode, no `dangerouslySetInnerHTML`, ~200 KB less shipped JS/CSS.

## Phase 2 — Data layer (TanStack Query + server fns)

1. Introduce `src/lib/consoles.functions.ts`, `bookings.functions.ts`, `availability.functions.ts` using `createServerFn` — replace direct `supabase` calls from components.
2. Define `queryOptions` factories in `src/lib/queries.ts`; loaders call `ensureQueryData`, components call `useSuspenseQuery` (per `tanstack-query-integration`).
3. Public read fns use the server publishable client; authed fns use `requireSupabaseAuth`.
4. Remove ad-hoc `useEffect` + `supabase.from(...)` fetches.

## Phase 3 — Routing & SEO

1. Confirm each public section route (`/consoles`, `/pricing`, `/how-it-works`, `/faq`, `/contact`, `/blog`) has unique `head()`, canonical, and og:image derived from its hero.
2. Add JSON-LD: `Organization`, `Product` per console, `FAQPage`, `LocalBusiness`.
3. Verify `sitemap.xml` and `robots.txt` include all routes.
4. Ensure `errorComponent` + `notFoundComponent` on every route with a loader.

## Phase 4 — Backend hardening

1. Audit RLS on `bookings`, `consoles`, `packages`, `posts`, `contact_messages`, `newsletter_subscribers`, `user_roles`; confirm `GRANT`s per policy.
2. Add indexes: ✅ DONE (bookings composite, bookings user_id, posts published).
3. Review RPCs — ✅ DONE (extracted overlap CTE into `public.booking_peak_overlap`; `create_booking` + `reschedule_booking` now share it).
4. Rate limits: ✅ DONE (contact_messages 5/hr, newsletter 3/hr via BEFORE INSERT triggers).
5. Run `supabase--linter` and fix findings.

## Phase 5 — Performance

1. Convert bundled hero/console images through `vite-imagetools` (AVIF + WebP), preload the LCP image in the home route `head().links`.
2. Split heavy client-only pieces (charts in `AnalyticsCharts`, booking dialog) behind dynamic import / lazy route files.
3. Set explicit `staleTime` on query options to cut refetches.
4. Add `Cache-Control` headers on public GET server routes (`sitemap.xml`, `booking-ical`).
5. Lighthouse budget in CI (fail on CLS > 0.1, LCP > 2.5s on mobile).

## Phase 6 — Quality & DX

1. Vitest for pricing calc, date-range validation, `has_role` behavior (via pgTAP or JS integration).
2. Playwright smoke: booking happy path, sign-in, admin status change, dark mode toggle.
3. ESLint: enable `no-restricted-imports` to forbid `react-router-dom`, `@/integrations/supabase/client.server` from client code.
4. Prettier + import-sort in pre-commit.
5. Remove dead files: `public/gamio.js`, `public/css/tailwind-build.css`, `src/gamio-body.html`, `AUDIT_REPORT.md`, `AUDIT_REPORT_V2.md` (after phases 1 & 4).

## Phase 7 — Security pass

1. Run `security--run_security_scan`, resolve findings, update `@security-memory`.
2. Verify CSP in `src/server.ts` — tighten `script-src` once inline gamio.js is gone (drop `'unsafe-inline'`/`'unsafe-eval'`).
3. Confirm no service-role usage in client-reachable modules (`tanstack-supabase-import-graph`).

---

## Technical notes

- Order matters: **Phase 1 unlocks everything else** — dark mode, i18n, real SEO, Tailwind v4 tokens, CSP tightening.
- Phase 2 must land before Phase 5's query tuning is meaningful.
- Migrations use plain `CREATE INDEX` (not CONCURRENTLY) per project rule.
- No new external services; Lovable Cloud + Lovable AI Gateway only.

## Suggested first PR

Phase 1 steps 1–2 for `Hero` + `Consoles` sections + Phase 4 step 2 (indexes). High visible impact, no behavior change for users, sets up everything after.

Reply with the phases you want me to execute (e.g. "Phase 1", "Phase 1 + 4", or "all").
