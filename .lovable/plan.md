# Gamio — Refactoring & System Optimization Plan

Goal: turn the current mix of legacy static HTML + React shell into a clean, fast, type-safe TanStack Start app, and tighten the backend (RLS, RPCs, indexes) for correctness and performance. Each phase is independently shippable.

---

## Phase 1 — Kill the HTML blob (biggest win)

Today `src/gamio-body.html` is injected via `dangerouslySetInnerHTML` and driven by `public/gamio.js` + `public/css/tailwind-build.css`. This bypasses React, Tailwind v4, SSR, i18n, dark mode, and code-splitting.

Steps:
1. Split `LandingPage` into real components — ✅ DONE (`HeroSection`, `LandingSections` cover all 8 sections; portals removed).
2. Move all styles into `src/styles.css` using Tailwind v4 tokens (no more `tw-` prefix, retire `public/css/index.css`). **⏸️ SKIPPED — REMIND USER LATER.** Progress so far: empty `tailwind-build.css` + link removed; dead `tw-*` dark-mode selectors purged from `styles.css`. Remaining: `public/css/index.css` (1.9 KLoC) still shipped and defines ~60 custom classes used by components (`btn-enhanced`, `console-card`, `pricing-card-enhanced`, `site-header`, `primary-nav__link`, …). Full migration = rewrite each rule as Tailwind v4 utilities in JSX or `@utility`/scoped rules in `styles.css`, then drop the `<link>` in `__root.tsx`. Best done section-by-section (header → pricing → consoles → footer).
3. Delete `public/gamio.js` and `src/gamio-body.html` — ✅ DONE.
4. Replace hand-rolled mobile drawer with shadcn `Sheet`, desktop nav with `NavigationMenu` — pending (Header still uses custom drawer).

Outcome: one source of truth, real HMR, working dark mode, no `dangerouslySetInnerHTML`, ~200 KB less shipped JS/CSS.

## Phase 2 — Data layer (TanStack Query + server fns)

1. Introduce `src/lib/consoles.functions.ts`, `bookings.functions.ts`, `availability.functions.ts`, `posts.functions.ts` using `createServerFn` — ✅ DONE (`BookingDialog` migrated; blog reads migrated).
2. Define `queryOptions` factories in `src/lib/queries.ts`; loaders call `ensureQueryData`, components call `useSuspenseQuery` — ✅ DONE for consoles + blog index + blog detail; booking flow uses imperative server-fn calls (appropriate for a form wizard).
3. Public read fns currently use `supabaseAdmin` inside handlers (safe: read-only, projected columns). Swap to a server publishable client if/when we tighten RLS/tenant scoping.
4. Remove ad-hoc `useEffect` + `supabase.from(...)` fetches — ✅ DONE for consoles, blog, bookings. Remaining direct-client callers are `contact.tsx` (form insert), `NewsletterForm.tsx` (form insert), and `auth.tsx` (browser-only auth flow, correct as-is).

## Phase 3 — Routing & SEO

1. Confirm each public section route has unique `head()`, canonical, og:image, twitter:image — ✅ DONE for `/`, `/consoles`, `/pricing`, `/how-it-works`, `/faq`, `/blog`. `/contact` head still to add og:image.
2. JSON-LD coverage — ✅ DONE: `Organization` + `LocalBusiness` (root), `Product` per console derived from loader data (`/consoles`), `FAQPage` (`/faq`), `HowTo` (`/how-it-works`), `Service` + `Offer[]` (`/pricing`), `BlogPosting` per post, `BreadcrumbList` on section routes.
3. `sitemap.xml` includes `/`, `/consoles`, `/pricing`, `/how-it-works`, `/faq`, `/contact`, `/blog`. Blog posts still to enumerate dynamically.
4. Ensure `errorComponent` + `notFoundComponent` on every route with a loader — ✅ DONE (`/consoles`, `/blog`, `/blog/$slug`).

## Phase 4 — Backend hardening

1. Audit RLS on `bookings`, `consoles`, `packages`, `posts`, `contact_messages`, `newsletter_subscribers`, `user_roles`; confirm `GRANT`s per policy.
2. Add indexes: ✅ DONE (bookings composite, bookings user_id, posts published).
3. Review RPCs — ✅ DONE (extracted overlap CTE into `public.booking_peak_overlap`; `create_booking` + `reschedule_booking` now share it).
4. Rate limits: ✅ DONE (contact_messages 5/hr, newsletter 3/hr via BEFORE INSERT triggers).
5. Run `supabase--linter` — ✅ DONE. All 14 findings are `SECURITY DEFINER` warnings on RPCs that need elevated context (auth.uid checks, capacity/rate-limit enforcement, `has_role`). Left as-is by design.

## Phase 5 — Performance

1. Convert bundled hero/console images through `vite-imagetools` (AVIF + WebP), preload the LCP image in the home route `head().links` — deferred until Phase 1 ports images into React components.
2. Split heavy client-only pieces — ✅ DONE: `BookingDialog` is now lazy-loaded in `LandingPage` and `pricing.tsx`, rendered only when opened. `AnalyticsCharts` has no consumer yet.
3. Set explicit `staleTime` on query options — deferred to Phase 2 (no TanStack Query call sites yet).
4. Cache-Control on public GET routes — ✅ DONE: `sitemap.xml` (`public, max-age=3600`) and `booking-ical.$id` (`private, max-age=300`).
5. Lighthouse budget in CI (fail on CLS > 0.1, LCP > 2.5s on mobile).

## Phase 6 — Quality & DX

1. Vitest for pricing calc, date-range validation, `has_role` behavior (via pgTAP or JS integration).
2. Playwright smoke: booking happy path, sign-in, admin status change, dark mode toggle (Playwright already wired via `tests/a11y/smoke.spec.ts`).
3. ESLint restricted imports — ✅ DONE (`react-router-dom` and static `@/integrations/supabase/client.server` now error at lint time).
4. Prettier + import-sort in pre-commit.
5. Remove dead files — audit reports ✅ DONE (`AUDIT_REPORT.md`, `AUDIT_REPORT_V2.md`); `public/gamio.js`, `public/css/tailwind-build.css`, `src/gamio-body.html` deferred until Phase 1 replaces them.

## Phase 7 — Security pass

1. Security scan — ✅ DONE. Only the 14 pre-accepted `SECURITY DEFINER` warnings; `@security-memory` refreshed with access model + accepted risks.
2. CSP `script-src` tightening — deferred until Phase 1 removes `public/gamio.js`.
3. Service-role audit — ✅ DONE. `supabaseAdmin` is only dynamic-imported inside `src/routes/api/public/booking-ical.$id.ts`; no static import from any client-reachable module.

---

## Technical notes

- Order matters: **Phase 1 unlocks everything else** — dark mode, i18n, real SEO, Tailwind v4 tokens, CSP tightening.
- Phase 2 must land before Phase 5's query tuning is meaningful.
- Migrations use plain `CREATE INDEX` (not CONCURRENTLY) per project rule.
- No new external services; Lovable Cloud + Lovable AI Gateway only.

## Suggested first PR

Phase 1 steps 1–2 for `Hero` + `Consoles` sections + Phase 4 step 2 (indexes). High visible impact, no behavior change for users, sets up everything after.

Reply with the phases you want me to execute (e.g. "Phase 1", "Phase 1 + 4", or "all").
