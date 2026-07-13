# Gamio — Refactoring & System Optimization Plan

Goal: turn the current mix of legacy static HTML + React shell into a clean, fast, type-safe TanStack Start app, and tighten the backend (RLS, RPCs, indexes) for correctness and performance. Each phase is independently shippable.

---

## Phase 1 — Kill the HTML blob (biggest win)

Today `src/gamio-body.html` is injected via `dangerouslySetInnerHTML` and driven by `public/gamio.js` + `public/css/tailwind-build.css`. This bypasses React, Tailwind v4, SSR, i18n, dark mode, and code-splitting.

Steps:
1. Split `LandingPage` into real components — ✅ DONE (`HeroSection`, `LandingSections` cover all 8 sections; portals removed).
2. Move all styles into `src/styles.css` using Tailwind v4 tokens (no more `tw-` prefix, retire `public/css/index.css`). **⏸️ SKIPPED — REMIND USER LATER.** Progress so far: empty `tailwind-build.css` + link removed; dead `tw-*` dark-mode selectors purged from `styles.css`. Remaining: `public/css/index.css` (1.9 KLoC) still shipped and defines ~60 custom classes used by components (`btn-enhanced`, `console-card`, `pricing-card-enhanced`, `site-header`, `primary-nav__link`, …). Full migration = rewrite each rule as Tailwind v4 utilities in JSX or `@utility`/scoped rules in `styles.css`, then drop the `<link>` in `__root.tsx`. Best done section-by-section (header → pricing → consoles → footer).
3. Delete `public/gamio.js` and `src/gamio-body.html` — ✅ DONE.
4. Replace hand-rolled mobile drawer with shadcn `Sheet` — ✅ DONE. Desktop nav stays a flat anchor `<ul>` (no submenus, so `NavigationMenu` would be over-engineered).

Outcome: one source of truth, real HMR, working dark mode, no `dangerouslySetInnerHTML`, ~200 KB less shipped JS/CSS.

## Phase 2 — Data layer (TanStack Query + server fns)

1. Introduce `src/lib/consoles.functions.ts`, `bookings.functions.ts`, `availability.functions.ts`, `posts.functions.ts` using `createServerFn` — ✅ DONE (`BookingDialog` migrated; blog reads migrated).
2. Define `queryOptions` factories in `src/lib/queries.ts`; loaders call `ensureQueryData`, components call `useSuspenseQuery` — ✅ DONE for consoles + blog index + blog detail; booking flow uses imperative server-fn calls (appropriate for a form wizard).
3. Public read fns currently use `supabaseAdmin` inside handlers (safe: read-only, projected columns). Swap to a server publishable client if/when we tighten RLS/tenant scoping.
4. Remove ad-hoc `useEffect` + `supabase.from(...)` fetches — ✅ DONE for consoles, blog, bookings. Remaining direct-client callers are `contact.tsx` (form insert), `NewsletterForm.tsx` (form insert), and `auth.tsx` (browser-only auth flow, correct as-is).

## Phase 3 — Routing & SEO

1. Confirm each public section route has unique `head()`, canonical, og:image, twitter:image — ✅ DONE (`/`, `/consoles`, `/pricing`, `/how-it-works`, `/faq`, `/blog`, `/contact`).
2. JSON-LD coverage — ✅ DONE: `Organization` + `LocalBusiness` (root), `Product` per console derived from loader data (`/consoles`), `FAQPage` (`/faq`), `HowTo` (`/how-it-works`), `Service` + `Offer[]` (`/pricing`), `BlogPosting` per post, `BreadcrumbList` on section routes.
3. `sitemap.xml` includes `/`, `/consoles`, `/pricing`, `/how-it-works`, `/faq`, `/contact`, `/blog` + every published `/blog/$slug` (fetched at request time from `posts`, `lastmod` derived from `updated_at`/`published_at`) — ✅ DONE.
4. Ensure `errorComponent` + `notFoundComponent` on every route with a loader — ✅ DONE (`/consoles`, `/blog`, `/blog/$slug`).

## Phase 4 — Backend hardening

1. Audit RLS on `bookings`, `consoles`, `packages`, `posts`, `contact_messages`, `newsletter_subscribers`, `user_roles`; confirm `GRANT`s per policy — ✅ DONE. Revoked broad default grants (TRUNCATE/TRIGGER/REFERENCES/MAINTAIN from anon+authenticated on every public table — TRUNCATE bypasses RLS, so this closed a real hole). Anon now has only the minimum grants matching its policies (INSERT on bookings/contact_messages/newsletter, SELECT on consoles/packages/posts, none on user_roles). Added missing admin policies: `newsletter_subscribers` (SELECT+DELETE), `user_roles` (SELECT+INSERT+UPDATE+DELETE).
2. Add indexes: ✅ DONE (bookings composite, bookings user_id, posts published).
3. Review RPCs — ✅ DONE (extracted overlap CTE into `public.booking_peak_overlap`; `create_booking` + `reschedule_booking` now share it).
4. Rate limits: ✅ DONE (contact_messages 5/hr, newsletter 3/hr via BEFORE INSERT triggers).
5. Run `supabase--linter` — ✅ DONE. All 14 findings are `SECURITY DEFINER` warnings on RPCs that need elevated context (auth.uid checks, capacity/rate-limit enforcement, `has_role`). Left as-is by design.

## Phase 5 — Performance

1. Convert bundled hero/console images through `vite-imagetools` (AVIF + WebP), preload the LCP image in the home route `head().links` — deferred until Phase 1 ports images into React components.
2. Split heavy client-only pieces — ✅ DONE: `BookingDialog` is now lazy-loaded in `LandingPage` and `pricing.tsx`, rendered only when opened. `AnalyticsCharts` has no consumer yet.
3. Set explicit `staleTime` on query options — ✅ DONE (5 min on consoles, blog list, blog detail).
4. Cache-Control on public GET routes — ✅ DONE: `sitemap.xml` (`public, max-age=3600`) and `booking-ical.$id` (`private, max-age=300`).
5. Lighthouse budget in CI — ✅ WIRED. `lighthouserc.json` asserts CLS ≤ 0.1 (error), LCP ≤ 2.5 s (error), a11y ≥ 0.9 (error), SEO ≥ 0.9 (error), perf ≥ 0.8 / best-practices ≥ 0.85 (warn), on mobile emulation for `/`, `/consoles`, `/pricing`. New `lighthouse` job in `.github/workflows/ci.yml` runs `@lhci/cli autorun` on every push/PR.

## Phase 6 — Quality & DX

1. Vitest wired (`bun run test`). Initial suite covers `BookingSchema` + `validateBookingDateRange` (9 tests). `has_role` covered by pgTAP suite (see below). Pricing calc still deferred (no pure-JS pricing calc exists yet — prices are static strings in `PricingCards.tsx`).
   - **pgTAP** — ✅ WIRED. `pgtap` extension installed into a dedicated `tests` schema (kept out of `public` per Supabase best practice); 5 assertions cover `has_role` (admin recognized, admin not moderator, plain user not admin, unknown uid not admin, `has_role(null,...)` returns false). Runner: `bun run test:pgtap` executes `tests.run_has_role_tests()` via `pg` against `SUPABASE_DB_URL` and fails on any `not ok` line. New `pgtap` CI job runs it when the `SUPABASE_DB_URL` GitHub secret is set.
2. Playwright smoke — ✅ WIRED. `tests/a11y/smoke.spec.ts` (axe on 7 public routes) + new `tests/smoke/smoke.spec.ts` (route loads with no console errors, dark-mode toggle, `sitemap.xml`, `robots.txt`). Scripts: `bun run test:smoke`, `bun run test:e2e`. Deeper flows (booking happy path, sign-in, admin role change) still to add.
3. ESLint restricted imports — ✅ DONE (`react-router-dom` and static `@/integrations/supabase/client.server` now error at lint time).
4. Prettier + `eslint --fix` on staged files via `simple-git-hooks` + `lint-staged` — ✅ WIRED. Runs on `pre-commit` after `bun install` triggers the `prepare` script (`simple-git-hooks`). Import-sort deferred (would require adding `@trivago/prettier-plugin-sort-imports` or an ESLint sort rule).
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
