# Project Quality Pass

A single execution plan that batches all outstanding fixes across correctness, security, performance, accessibility, SEO, data model, and code quality. Grouped into phases so we can ship it in order and stop after any phase if you want.

## Phase 1 — Correctness & hydration

- Sitemap: guard `new Date(lastmod).toISOString()` against invalid strings.
- `calendar.tsx`: replace locale-dependent `data-day` with `toISOString().slice(0,10)`.
- `BookingSchema`: enforce `YYYY-MM-DD` on `startDate` / `endDate`.
- `bookings.functions.ts`: switch from message substring matching to explicit Postgres `SQLSTATE` codes raised by `create_booking`.
- Normalize phone (trim + strip zero-width / RTL marks) on both write and rate-limit lookup.
- Move blog index into `src/routes/blog.index.tsx`; make `blog.tsx` a pure `<Outlet/>` layout (removes the `useRouterState` hack).
- Verify `consoles.$slug.tsx` and `rent.$slug.tsx` loaders throw `notFound()` for unknown slugs.

## Phase 2 — Security

- Stop using `supabaseAdmin` for public blog reads: switch `listPublishedPosts` / `getPublishedPost` to the anon publishable client + `TO anon` SELECT policy scoped to `published = true`.
- Normalize booking error surface: opaque codes only, never raw `error.message`.
- iCal token: confirm HMAC uses `timingSafeEqual` and per-booking material.
- Add security headers on SSR responses: `Content-Security-Policy`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `X-Content-Type-Options: nosniff`.
- Enable Supabase CAPTCHA for anonymous booking + newsletter forms.

## Phase 3 — Data model / RLS audit

- `consoles`: RLS enabled + public read policy + explicit `GRANT SELECT TO anon`.
- `bookings`: no anon SELECT; owner-only via `auth.uid()`; service_role full.
- `posts`: anon SELECT only where `published = true`.
- `user_roles`: no anon access; `has_role()` is the only entry point.
- Add `updated_at` triggers where the column exists but no trigger is wired.

## Phase 4 — Performance

- Split `useConsoleAvailability` cache per `(slug, monthKey)`; prefetch next month on hover.
- Dynamic-import the calendar step of `BookingDialog` so `react-day-picker/persian` + date-fns locales don't ship in the initial bundle.
- Preload the hero LCP image via `<link rel="preload" as="image">` and serve AVIF/WebP variants.
- Preload Vazirmatn with `<link rel="preload" as="font" crossorigin>` in `__root.tsx`.
- Confirm blog list query never selects `content`.

## Phase 5 — Accessibility

- `OptionButton`: add `sr-only` "انتخاب شد" when selected; explicit `focus-visible` styles even when disabled.
- Calendar wrapper: `aria-label`; disabled days announce "رزرو کامل".
- `BookingDialog`: verify focus trap and focus return to the trigger button in `HeroSection`.

## Phase 6 — SEO

- `blog.tsx` head: add `og:image` from the newest post's cover.
- `blog.$slug.tsx`: add `article:published_time`, `article:tag`, and `Article` JSON-LD.
- Sitemap: add `hreflang="fa-IR"`, `changefreq`, `priority` for the homepage.
- Audit `consoles.tsx`, `pricing.tsx`, `faq.tsx`, `how-it-works.tsx`, `contact.tsx` for missing `<link rel="canonical">`.
- `robots.txt`: ensure absolute sitemap URL.

## Phase 7 — DX & tests

- Centralize `queryOptions` factories in `src/lib/queries.ts`; remove ad-hoc keys.
- Split `useConsoleOptions` into two independent queries so consoles list and remaining counts refresh separately.
- Add unit test for `formatDateFa` (UTC-stable regression for the blog hydration fix).
- Add pgtap tests for `create_booking` rate-limit branches.
- Add tests for MCP tool handlers.
- Refresh `AGENTS.md` / `README.md` for TanStack Start + Lovable Cloud terminology (no Supabase dashboard references).

## Explicitly out of scope

- New features (booking status page, PWA service worker, skeletons) — happy to plan separately later.
- Any visual redesign; presentation only changes where a11y/SEO requires it.

## Technical notes

- `SQLSTATE` codes: raise `P0001` with `USING ERRCODE = '23514'` (or custom) per branch so the client switches on `error.code`.
- CSP: start report-only, then enforce; must allow Supabase project URL, Lovable AI Gateway, GA4, and inline theme bootstrap script (via hash).
- Anon client for posts: use `createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)` inside the server-fn handler with no session persistence, mirroring the pattern in `server-side-modern`.
- Blog route split: `src/routes/blog.tsx` becomes `component: () => <Outlet />` with the layout's head; `blog.index.tsx` owns the list + its own head.

## Execution order

Phases run 1 → 7. Each phase is independent enough to review in isolation. I'll pause after Phase 3 (data model requires a migration approval) and after Phase 6 for a sanity check, then finish Phase 7.
