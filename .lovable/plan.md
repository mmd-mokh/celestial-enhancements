# Performance Optimization Plan

Focus: eliminate the "cards appear late / blink in" behavior on the landing page, then apply broader wins for LCP, TBT and bundle size.

## Findings

### 1. Cards fetch is client-only (biggest offender)
`ConsolesSection` calls `useQuery(consolesQueryOptions())` with no route loader priming it. On first paint the grid is empty; the request only starts after hydration + JS execution. Same pattern on `/consoles` and `/rent/$slug`.

### 2. No skeleton / reserved space for cards
`items && <ConsoleList />` renders nothing until data arrives, causing layout shift (CLS) and a visible "pop-in".

### 3. LCP preload likely wrong
`src/routes/index.tsx` preloads `/assets/images/home/dashboard.png` with `fetchpriority=high`. The actual LCP element on mobile is the hero headline/image in `HeroSection`. Preloading the wrong asset wastes bandwidth and delays the real LCP.

### 4. Everything below the fold ships in the initial bundle
`LandingPage` eagerly imports 8 sections + `Toaster`. Below-fold (`Testimonials`, `Faq`, `FinalCta`, `Newsletter`, `SiteFooter`) can be lazy / deferred.

### 5. No HTTP cache on public server functions
`getConsoles`, `listPublishedPosts` etc. return no `Cache-Control`. Every SSR/refresh re-hits Postgres.

### 6. Icons + images
- `BsIcon` likely pulls the full Bootstrap Icons font/sprite. Verify and switch to per-icon SVG or subset.
- Hero / dashboard images are PNG. Convert to AVIF/WebP via `vite-imagetools` and serve with `<picture>`.

### 7. Query defaults
`consolesQueryOptions` staleTime 30m is fine, but router's `defaultPreloadStaleTime` should be `0` so Query owns freshness (per tanstack-query-integration).

### 8. Third-party / analytics on critical path
Confirm Turnstile, analytics, sonner Toaster don't block first paint; defer to idle.

## Changes

1. **Prime cards in the route loader** (`src/routes/index.tsx`, `consoles.tsx`, `rent.$slug.tsx`):
   ```ts
   loader: ({ context }) =>
     context.queryClient.ensureQueryData(consolesQueryOptions())
   ```
   Convert `ConsolesSection` to `useSuspenseQuery` so SSR HTML already contains cards.

2. **Add a skeleton grid** rendered whenever cards data isn't ready (pendingComponent + Suspense fallback). Fixed heights → zero CLS.

3. **Fix LCP preload**: measure current LCP with Playwright + `PerformanceObserver`; either remove the dashboard preload or repoint it to the actual hero asset. Set `fetchpriority="high"` on the hero `<img>` and add `loading="eager"`, `decoding="async"`.

4. **Lazy below-fold sections**: `React.lazy` for `Testimonials`, `Faq`, `FinalCta`, `Newsletter`. Wrap in `Suspense` with a min-height placeholder. Keep above-fold (Hero, Consoles, Why, HowItWorks, Pricing) eager.

5. **HTTP caching on public server fns**: return a `Response` with `Cache-Control: public, s-maxage=300, stale-while-revalidate=86400` from `getConsoles`, `listPublishedPosts`, `getPublishedPost`, `getConsoleBySlug`.

6. **Image pipeline**: add `vite-imagetools`, generate AVIF+WebP for hero/dashboard/testimonial images, render via `<picture>` with `width`/`height` attributes.

7. **Icons audit**: inspect `BsIcon` and `public/css/index.css`. If a full icon font ships, replace the icons actually used (≈8) with inline SVGs and drop the font.

8. **Router config**: set `defaultPreloadStaleTime: 0` in `src/router.tsx` if not already.

9. **Defer non-critical**: mount `Toaster` after first idle (`requestIdleCallback`). Load Turnstile only when the booking dialog opens (already lazy — verify).

10. **Verification**:
    - `bun run build` → inspect chunk sizes before/after.
    - Playwright: navigate `/`, capture `PerformanceObserver` LCP/CLS/TBT, screenshot to confirm cards render in initial HTML (view-source check).
    - Run existing Lighthouse CI (`lighthouserc.json`) and compare scores.

## Out of scope
- Backend query optimization (no slow-query reports yet; will run `slow_queries` only if LCP work doesn't hit targets).
- Redesign of card visuals.
