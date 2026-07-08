# Gamio — Audit & Test Suite Report (v2)

Date: 2026-07-08. Scope: full read-only audit, test catalog, and remediation blueprints for production deploy readiness. No files were modified during discovery. Supersedes `AUDIT_REPORT.md` (which covered a narrower a11y/design pass and whose findings are now largely resolved — cross-referenced below).

---

## 1. Architecture Map & Flow Inventory

### Stack

- **Framework:** TanStack Start v1.168 on React 19, Vite 7, Tailwind v4 (via `@tailwindcss/vite`), TypeScript strict.
- **Deploy target:** Cloudflare Workers (nitro `cloudflare` preset, wired by `@lovable.dev/vite-tanstack-config`). **Not Netlify** — the audit brief mentioned Netlify redirects/edge functions; those don't apply here. Any Netlify-shaped concern (`_redirects`, `netlify.toml`, edge functions) is `N/A — Cloudflare Workers target`.
- **Backend:** Lovable Cloud (Supabase). 13 migrations. Tables inferred: `bookings`, `user_roles`, `contact_messages`, plus blog and catalog tables (see `_authenticated/blog-admin.tsx`, `catalog.tsx`).
- **Auth:** Supabase email/password + Google OAuth at `/auth`. Role gating via `user_roles` + `has_role` (SECURITY DEFINER) on `/_authenticated/*` subtree.
- **Package manager:** bun.
- **Tests present:** `tests/a11y/smoke.spec.ts` (axe-core, 7 public routes). No unit or integration tests. No CI config in repo.

### Route inventory

Public: `/` (index → LandingPage), `/pricing`, `/consoles`, `/how-it-works`, `/faq`, `/contact`, `/blog`, `/blog/$slug`, `/auth`, `/sitemap.xml`.
Authenticated (gated by `_authenticated/route.tsx` — `supabase.auth.getUser()` redirect): `/admin`, `/blog-admin`, `/catalog`, `/my-bookings`.
Server route: `/api/public/booking-ical/$id` (public iCal export).

### Two-codebase seam (critical context)

The landing page mounts a ~1,600-line static HTML blob (`src/gamio-body.html`) via `dangerouslySetInnerHTML` inside `LandingPage.tsx`. That blob has its own CSS (`public/css/index.css`, 1,932 lines; `public/css/tailwind-build.css`) and its own JS (`public/gamio.js`, 558 lines, appended in a `useEffect`). Every React-shell concern (theming, icons, a11y linting, RTL utilities, design tokens) forks at this seam.

### User flows

1. **Browse** — landing (`/`), consoles catalog (`/consoles`), pricing (`/pricing`), FAQ, blog.
2. **Book** — `BookingDialog` opens from CTAs, submits into `bookings` table, exposes iCal at `/api/public/booking-ical/$id`.
3. **Sign up / Sign in** — `/auth`, email+password and Google. Session persisted by Supabase JS.
4. **My bookings** — `/_authenticated/my-bookings`, list + cancel with shadcn `AlertDialog`.
5. **Admin** — `/_authenticated/admin` (moderation, delete bookings/messages), `/_authenticated/blog-admin` (CRUD posts), `/_authenticated/catalog` (consoles/pricing CRUD).
6. **Contact** — `/contact` form, writes to `contact_messages`.
7. **Newsletter** — email capture in blob footer, currently no backend write (toast only).

### Existing tooling

- ESLint (`eslint.config.js`) with default TS rules.
- Prettier configured.
- No CI workflow file (`.github/workflows/*` absent).
- No unit test runner (no vitest/jest in `package.json` scripts).
- No dependabot / renovate config.

---

## 2. Executive Summary — Deployment Readiness Verdict

**Verdict: No-Go for production without fixes.** 3 Critical and 6 High findings must be addressed or explicitly risk-accepted. The app functions and the a11y baseline is respectable, but there are unresolved server-side security warnings (SECURITY DEFINER function exposure), unverified backend hardening on newer tables, an unwritten payment path (still on the plan), and no CI gate — deploying today ships without a safety net.

Headline blockers:

1. **9 Supabase linter warnings** for `SECURITY DEFINER` functions callable by anon/authenticated roles — must be reviewed and either scoped or revoked before opening the DB to the internet.
2. **No RLS/GRANT audit checkpoint** in this session for the newest tables (`contact_messages`, blog posts, catalog). Migrations exist but per-table policies aren't verified end-to-end in the report; treat as `UNKNOWN — needs owner input` until a scan pass is run.
3. **Newsletter form silently drops data** — no backend, only a fake toast. Either wire it up or remove the CTA before launch (misleading UX + potential trust issue).

Once Criticals + Highs are cleared, the app is in Go-with-fixes territory.

---

## 3. Findings by Domain

Prior audit (`AUDIT_REPORT.md`) findings #1–#16 are largely resolved (dark mode override, unified theme key, duplicate `<main>`, `bi-*` swaps, `ml-*` → `ms-*`, `window.confirm` → `AlertDialog`, Persian digits, axe-core suite, ChevronLeft). This section catalogs **new or still-open** findings.

### 3.1 UI / UX

| ID | Sev | Area | File(s) | Finding | Rec. fix |
|----|-----|------|---------|---------|----------|
| U-01 | High | Blob vs React drift | `src/gamio-body.html`, all `src/routes/*.tsx` | Section pages (`/pricing`, `/consoles`, `/how-it-works`, `/faq`) reuse `LandingPage` with `scrollTo` — every "page" is the same 1,600-line blob. LCP and duplicate-content cost paid on every nav. | Split section pages into standalone routes with only their own content (see `tanstack-route-architecture` skill). |
| U-02 | Medium | Loading states | `_authenticated/admin.tsx`, `my-bookings.tsx`, `catalog.tsx`, `blog-admin.tsx` | No skeleton/spinner uniformity — verify each list has a loading + empty state. | Add `<Skeleton>` rows + empty-state cards. |
| U-03 | Medium | Newsletter deception | `src/components/NewsletterForm.tsx` | Form shows success toast but no backend write; users think they subscribed. | Wire to a `newsletter_subscribers` table via server fn, or hide the form. |
| U-04 | Low | Responsive check | `src/gamio-body.html` (hero, consoles grid, pricing) | Blob was ported statically; needs re-check at 360, 414, 768, 1280 for hero overflow and pricing card stacking. | Manual QA + Playwright viewport screenshots. |

### 3.2 Accessibility

Prior pass closed most items. Residual:

| ID | Sev | Area | File(s) | Finding | Rec. fix |
|----|-----|------|---------|---------|----------|
| A-01 | High | Blob a11y blind spot | `src/gamio-body.html` | ESLint jsx-a11y cannot see the blob; axe smoke covers the rendered DOM but only for `wcag2a/aa/21a/21aa`. No `best-practice` tag, no focus-order assertions. | Extend axe run with `.withTags([..., "best-practice"])` and add keyboard-nav Playwright tests. |
| A-02 | Medium | Focus trap | `BookingDialog.tsx`, all shadcn `AlertDialog` uses | Radix handles it, but Firefox on RTL has historical bugs — verify manually. | Manual QA on FF ESR. |
| A-03 | Medium | Reduced motion (JS) | `public/gamio.js` mesh-orb loop | Prior audit noted; verify remediation was applied. | Wrap animation loop in `matchMedia('(prefers-reduced-motion: reduce)')` check. |

### 3.3 Security

| ID | Sev | Area | File(s) | Finding | Rec. fix |
|----|-----|------|---------|---------|----------|
| S-01 | **Critical** | DB — SECURITY DEFINER exposure | `supabase/migrations/*.sql` (9 fns flagged by linter) | 9 SECURITY DEFINER functions callable by `anon` (4) or `authenticated` (5). If any function mutates data or bypasses RLS beyond its narrow purpose (`has_role`), this is a privilege escalation. | Audit each fn; `REVOKE EXECUTE ... FROM anon, authenticated` and grant only where called. `has_role(uuid, app_role)` should remain callable by `authenticated`; the rest need review. |
| S-02 | **Critical** | Public iCal enumeration | `src/routes/api/public/booking-ical.$id.ts` | Route is `/api/public/*` (unauthenticated by convention). If `$id` is a sequential integer or predictable UUID, attackers can enumerate other users' bookings. | Ensure `id` is a v4 UUID; add rate limit; consider a signed token param. |
| S-03 | **Critical** | RLS coverage unverified this pass | new tables since first audit | Report brief requires positive verification of RLS+GRANT on every public-schema table. Not verified here. | Run `supabase--linter` + `security--run_security_scan`; ensure each table has RLS enabled and policy matches intent. |
| S-04 | High | Input validation (server) | `BookingDialog.tsx`, `contact.tsx` | Client uses zod, but server-side there's no `.inputValidator()` gate on inserts — RLS covers auth but not shape/length. | Move inserts through `createServerFn` with `.inputValidator()`; enforce max lengths matching DB columns. |
| S-05 | High | XSS via `dangerouslySetInnerHTML` | `src/components/LandingPage.tsx` (blob mount), `src/routes/blog.$slug.tsx` (likely) | Blob is static and trusted, but blog posts are admin-editable — if the post body is rendered with `dangerouslySetInnerHTML` without DOMPurify, an admin XSS becomes a stored XSS. | Sanitize any DB-sourced HTML with DOMPurify, or render as Markdown-only. |
| S-06 | High | Security headers | (none in repo) | No `Content-Security-Policy`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`. | Add a response-header middleware in `src/server.ts` or a Cloudflare Worker `onRequest` hook. |
| S-07 | Medium | CDN dependency | `src/routes/__root.tsx` (Bootstrap Icons cdnjs), `public/css/index.css` (Vazirmatn jsdelivr) | Third-party runtime dependency; SRI absent; blocked CDN = missing icons. | Self-host via `@fontsource-*` + `bootstrap-icons` npm; add SRI if kept remote. |
| S-08 | Medium | Dependency scan | `package.json` | Not run in this pass. | Run `code--dependency_scan` before deploy. |
| S-09 | Medium | Secrets in repo | `.env` | Contains only publishable/URL values (safe). Confirm no service-role key ever added by future edits. | Add `.env` to `.gitignore` check; document. Already in `.gitignore`. |
| S-10 | Low | CSRF | server functions | TanStack `createServerFn` uses same-origin fetch + Supabase JWT; low risk. Confirm no cookie-only auth path. | Document. |

### 3.4 Performance

| ID | Sev | File(s) | Finding | Rec. fix |
|----|-----|---------|---------|----------|
| P-01 High | `public/css/tailwind-build.css`, `public/css/index.css` | 2 legacy stylesheets (~2000+ lines total) loaded on every route via the blob. Overlap with Tailwind v4 build → duplicate rules, unused selectors. | Split legacy CSS to landing-only; audit with PurgeCSS or manual sweep. |
| P-02 Medium | `public/gamio.js` | 558-line script attached on every landing mount; RAF loop for mesh orbs. | Gate on IntersectionObserver + `prefers-reduced-motion`; teardown on unmount. |
| P-03 Medium | images in `public/assets/images/*` | No `<picture>`/AVIF/WebP; no width/height attrs → CLS risk. | Convert to WebP/AVIF; add explicit dimensions. |
| P-04 Medium | `src/gamio-body.html` `<img>` tags | Verify `loading="lazy"` on below-the-fold images. | Add attribute. |
| P-05 Low | bundle | Not measured this pass. | Run `vite build --mode production` and inspect `dist/` sizes; target LCP < 2.5s. |

### 3.5 Functionality / Business Logic

| ID | Sev | File(s) | Finding | Rec. fix |
|----|-----|---------|---------|----------|
| F-01 Critical | plan §A3 (Payments) | Payments never implemented — booking flow ends at "pending" with no deposit. Deploying "book now" without payment invites no-show fraud. | Ship Stripe or Paddle before public launch, OR strip payment language from marketing. |
| F-02 High | `_authenticated/admin.tsx` booking status transitions | No state machine — statuses set as free-text UPDATE. Concurrent admin edits can race. | Add DB check constraint on status enum; use `.eq('updated_at', prev)` optimistic locking. |
| F-03 High | `BookingDialog.tsx` availability | plan §A2 not shipped — no `availability` table; two users can book the same console/slot. | Add `availability` table + unique index on `(console_id, date, slot)`. |
| F-04 Medium | `my-bookings.tsx` cancel window | Any-time cancel with no policy — no fee, no cutoff. | Enforce cancel-window in server fn. |
| F-05 Medium | `contact.tsx` | No rate limit → spam vector. | Add per-IP rate limit or hCaptcha. |
| F-06 Low | `NewsletterForm.tsx` | See U-03. | See U-03. |

### 3.6 Code Quality & Architecture

| ID | Sev | Finding | Rec. fix |
|----|-----|---------|----------|
| Q-01 High | Blob vs React duplication (theme, icons, styling tokens, page structure). | Long-term: port blob sections to JSX incrementally, starting with hero + pricing. |
| Q-02 Medium | No unit tests; a11y smoke only. | Add vitest for `src/lib/i18n.ts` and any validators/formatters. |
| Q-03 Medium | No CI pipeline. | Add GH Actions workflow: lint + build + `test:a11y`. |
| Q-04 Low | `AUDIT_REPORT.md` now stale (findings resolved). | Archive to `docs/audit-2026-07-01.md`. |

### 3.7 RTL / Localization

| ID | Sev | Finding | Rec. fix |
|----|-----|---------|----------|
| L-01 High | Persian coverage in the blob not audited line-by-line — 1,600 lines may contain leftover English. | grep `[a-zA-Z]{6,}` inside `gamio-body.html` and manually classify. |
| L-02 Medium | `toFaDigits` applied to some views but not admin analytics charts, or system-generated IDs shown to users. | Apply site-wide via a formatter helper. |
| L-03 Medium | No pluralization rules (fa has different forms). | Use `Intl.PluralRules('fa-IR')` in copy utilities. |
| L-04 Low | Jalali (Shamsi) calendar — currently Gregorian formatted `fa-IR`. Confirm product intent. | Use `date-fns-jalali` if Shamsi required. |

### 3.8 SEO & Metadata

| ID | Sev | File(s) | Finding | Rec. fix |
|----|-----|---------|---------|----------|
| SEO-01 High | `src/routes/index.tsx` | No route-level `head()` — home relies on `__root` defaults. | Add per-route `head()` with title/description/OG. |
| SEO-02 Medium | Blog `/blog/$slug` | Verify `head()` uses loader data for title/description/og:image. | Confirm; add if missing. |
| SEO-03 Medium | `sitemap[.]xml.ts` | Verify all public routes emitted; blog posts sourced from DB. | Audit output. |
| SEO-04 Low | Structured data | LocalBusiness/Product/BreadcrumbList only on `how-it-works`. | Add to home + consoles + pricing + blog posts. |

### 3.9 Deployment / DevOps

| ID | Sev | Finding | Rec. fix |
|----|-----|---------|----------|
| D-01 High | No CI/CD gate. | Add GitHub Actions: `bun install`, `bun run lint`, `bun run build`, `bun run test:a11y`. |
| D-02 High | No production `SUPABASE_PUBLISHABLE_KEY` verified in deploy env; secrets management for anything payment-related is TBD. | Document env matrix per environment. `UNKNOWN — needs owner input` for prod secret store. |
| D-03 Medium | No rollback plan documented. | Rely on Lovable versioning; document steps. |
| D-04 Medium | No error monitoring beyond `src/lib/lovable-error-reporting.ts`. | Confirm Sentry/equivalent or accept Lovable-only. |

### 3.10 Cross-Browser

| ID | Sev | Finding | Rec. fix |
|----|-----|---------|----------|
| B-01 Medium | Only Chromium exercised (axe suite). | Add WebKit + Firefox projects to `playwright.config.ts`. |
| B-02 Medium | RTL rendering on Safari iOS < 16 has known logical-property bugs. | Manual QA on iOS 15/16/17. |

---

## 4. Test Suite Catalog

### 4.1 Unit tests (vitest — not yet installed)

| ID | Domain | Target | Cases | Priority |
|----|--------|--------|-------|----------|
| UT-01 | i18n | `src/lib/i18n.ts::toFaDigits` | ASCII digits → Persian, mixed strings, empty/null/undefined, numeric input, no-digit strings. | P0 |
| UT-02 | i18n | `formatDateFa` | Valid ISO, Date instance, invalid string returns original, null → "—". | P0 |
| UT-03 | validation | booking zod schema (extract into `src/lib/booking-schema.ts`) | Required fields, phone regex, notes max length, RTL whitespace trim. | P0 |
| UT-04 | validation | contact zod schema | Email, name length, message length. | P1 |
| UT-05 | validation | newsletter schema | Valid, invalid email, empty. | P2 |
| UT-06 | utils | `src/lib/utils.ts::cn` | Merge classes, dedupe. | P2 |

### 4.2 Integration tests (vitest + @testing-library/react)

| ID | Domain | Case | Preconditions | Steps | Expected | Priority |
|----|--------|------|---------------|-------|----------|----------|
| IT-01 | Booking | Submit valid booking | Supabase mocked | Fill form, submit | Insert called with sanitized payload; success toast | P0 |
| IT-02 | Booking | Rejects invalid phone | — | Enter bad phone, submit | Field error shown, no insert | P0 |
| IT-03 | Auth | Sign-in with wrong pw | Supabase mocked | Submit | Error toast, no redirect | P0 |
| IT-04 | Admin | Delete booking | User w/ admin role | Click delete, confirm | AlertDialog appears, delete called, list refetches | P1 |
| IT-05 | My-bookings | Cancel | User w/ own booking | Confirm cancel | Status → cancelled, toast | P1 |
| IT-06 | Newsletter | Success | — | Submit valid email | Insert into `newsletter_subscribers` (after fix U-03) | P1 |
| IT-07 | Blog | Render post | Loader returns post | Mount | Title, body sanitized, meta set | P1 |

### 4.3 End-to-end tests (Playwright)

| ID | Journey | Steps | Expected | Priority |
|----|---------|-------|----------|----------|
| E2E-01 | Signup → book → confirm | /auth signup → /consoles → open dialog → submit → /my-bookings | Booking visible | P0 |
| E2E-02 | Google OAuth happy path | /auth → Google → callback → home | Session cookie set | P0 |
| E2E-03 | RTL rendering | Visit /, /pricing, /faq | `dir="rtl"` on `<html>`, hero copy right-aligned | P0 |
| E2E-04 | Dark mode persistence | Toggle → reload → nav to /admin | Dark class persists across shell + admin | P1 |
| E2E-05 | Admin gate | Non-admin hits /admin | Redirect to /auth | P0 |
| E2E-06 | Cancel booking | /my-bookings → cancel | AlertDialog + status change | P1 |
| E2E-07 | Contact form | /contact submit | Row in `contact_messages`, toast | P1 |
| E2E-08 | iCal export | GET /api/public/booking-ical/$id (own) | 200 + `text/calendar` | P1 |
| E2E-09 | iCal enumeration | GET with random UUID | 404, not 200 | P0 |
| E2E-10 | Sitemap | GET /sitemap.xml | Contains all public routes | P2 |

### 4.4 Manual / exploratory

| ID | Case | Priority |
|----|------|----------|
| M-01 | Full page RTL "feel" on real iOS Safari, Android Chrome. | P0 |
| M-02 | Blob visual polish at 360/414/768/1280/1920. | P1 |
| M-03 | Screen-reader pass (VoiceOver + NVDA) on landing + booking. | P0 |
| M-04 | Keyboard-only nav through booking + admin. | P0 |
| M-05 | Prefers-reduced-motion honored across mesh orbs. | P1 |
| M-06 | Google OAuth against real Google test account. | P0 |
| M-07 | Payment sandbox once F-01 shipped. | P0 |

### 4.5 Security test cases

| ID | Attack | Steps | Expected | Priority |
|----|--------|-------|----------|----------|
| SEC-01 | Stored XSS in booking notes | Submit `<img src=x onerror=alert(1)>` in notes | Admin view escapes it | P0 |
| SEC-02 | Stored XSS in blog post | Admin publishes `<script>...</script>` | Rendered as text or stripped | P0 |
| SEC-03 | iCal enumeration | Iterate UUIDs | All non-owned return 404 | P0 |
| SEC-04 | RLS bypass | Anon PostgREST GET on bookings | Empty array / 401 | P0 |
| SEC-05 | Role escalation | Authed user UPDATE on `user_roles` | RLS denies | P0 |
| SEC-06 | SECURITY DEFINER abuse | Anon calls each flagged fn | Only `has_role`-shaped fns respond safely | P0 |
| SEC-07 | CSRF on server fn | Cross-origin POST | Rejected (same-origin + JWT) | P1 |
| SEC-08 | Header check | curl -I / | CSP + XFO + Referrer-Policy present | P1 |
| SEC-09 | Rate limit | 100 rapid contact POSTs | Throttled after N | P1 |
| SEC-10 | Secret leak | grep bundle for `service_role`, `sk_live` | No matches | P0 |

---

## 5. Step-by-Step Remediation Guide

Ordered by domain, then severity (Critical → Low). Only Critical/High blueprints given full form; Medium/Low get abbreviated blueprints where non-trivial.

### Security

#### Fix SEC-FIX-01: Lock down SECURITY DEFINER functions
- **Finding:** S-01
- **Severity:** Critical
- **Root cause:** DB migrations grant `EXECUTE` on SECURITY DEFINER functions to `anon` and `authenticated` by default, bypassing RLS if the function body touches restricted tables.
- **Affected files:** `supabase/migrations/20260701152910_*.sql`, `20260701161221_*.sql`, `20260701161604_*.sql`, `20260701161946_*.sql`, `20260701180931_*.sql` (all flagged by linter).
- **Fix steps:**
  1. Run `supabase--linter` and copy the function names from the WARN output.
  2. For each function, decide the least-privilege role (`authenticated` only, `service_role` only, or keep public).
  3. Author a new migration `2026XXXXXXXXXX_lockdown_security_definer.sql` that runs, for each function:
     ```sql
     REVOKE EXECUTE ON FUNCTION public.<fn>(<args>) FROM PUBLIC, anon, authenticated;
     GRANT EXECUTE ON FUNCTION public.<fn>(<args>) TO <intended-role>;
     ```
  4. Keep `public.has_role(uuid, app_role)` executable by `authenticated` — needed by RLS policies.
  5. Re-run `supabase--linter`; expect 0 warnings.
- **Verification:** SEC-06 test case; linter clean.
- **Rollback:** Migration is reversible — apply an inverse migration re-granting EXECUTE.
- **Sequencing:** Before SEC-FIX-03.

#### Fix SEC-FIX-02: Harden iCal endpoint against enumeration
- **Finding:** S-02
- **Severity:** Critical
- **Root cause:** `/api/public/booking-ical/$id` is unauthenticated; if `id` is not a hard-to-guess UUID, other users' bookings are readable.
- **Affected files:** `src/routes/api/public/booking-ical.$id.ts`; `bookings` table migration (verify `id` type).
- **Fix steps:**
  1. Confirm `bookings.id` is `uuid default gen_random_uuid()`. If not, migrate.
  2. In the route handler, treat the id as opaque; reject non-UUID with 404 before DB query.
  3. Add a per-IP rate limit (10/min) using a Cloudflare KV counter or in-memory LRU (accept eventual consistency).
  4. Optional hardening: require a signed token param `?t=<hmac(id, SECRET)>`; verify with `crypto.timingSafeEqual`.
  5. Log 404s at info level for anomaly detection.
- **Verification:** E2E-09, SEC-03.
- **Rollback:** Revert route file to previous version; no schema impact if step 1 was a no-op.

#### Fix SEC-FIX-03: Verify full RLS + GRANT coverage
- **Finding:** S-03
- **Severity:** Critical
- **Root cause:** Newer tables added after the initial audit haven't been re-verified for RLS-enabled + GRANT semantics matching intent.
- **Affected files:** all `supabase/migrations/*.sql` touching `public.*`; `security--run_security_scan` output.
- **Fix steps:**
  1. Run `security--run_security_scan`.
  2. For each finding, open the corresponding migration.
  3. Confirm `ALTER TABLE public.<t> ENABLE ROW LEVEL SECURITY;` present.
  4. Confirm `GRANT` statements match the policy set (public read → `GRANT SELECT ... TO anon`; auth-only → drop anon).
  5. Write a corrective migration where mismatch exists.
- **Verification:** SEC-04, SEC-05; scan returns clean.
- **Rollback:** Corrective migrations must be idempotent + reversible.
- **Sequencing:** Before F-01 (payments) — payment tables must launch with correct RLS.

#### Fix SEC-FIX-04: Server-side input validation on writes
- **Finding:** S-04
- **Severity:** High
- **Root cause:** Insert calls happen client-side directly against Supabase; RLS enforces ownership but not shape/length. Malicious clients can send 10MB `notes` strings.
- **Affected files:** `src/components/BookingDialog.tsx`, `src/routes/contact.tsx`, `NewsletterForm.tsx`.
- **Fix steps:**
  1. Create `src/lib/booking.functions.ts` exporting `createBooking` (`createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(bookingSchema.parse).handler(...)`).
  2. Move the zod schema into `src/lib/booking-schema.ts`; import from both client form and server fn.
  3. Replace the client `supabase.from('bookings').insert(...)` with `useServerFn(createBooking)` inside an event handler.
  4. Repeat for `contact_messages` (no auth required — use `createServerFn` without the auth middleware, but keep the validator + rate limit).
  5. Ensure DB columns have length constraints matching zod maxes.
- **Verification:** IT-01, IT-02, SEC-01, UT-03.
- **Rollback:** Revert component to direct-insert path; server fn is additive.
- **Sequencing:** After SEC-FIX-03.

#### Fix SEC-FIX-05: Sanitize admin-authored HTML
- **Finding:** S-05
- **Severity:** High
- **Root cause:** Blog post bodies rendered via `dangerouslySetInnerHTML` allow stored XSS from any admin.
- **Affected files:** `src/routes/blog.$slug.tsx`, any renderer of `contact_messages` or `bookings.notes` that uses `innerHTML`.
- **Fix steps:**
  1. `bun add isomorphic-dompurify`.
  2. Create `src/lib/sanitize.ts` exporting `sanitizeHtml(html: string)`.
  3. Replace every `dangerouslySetInnerHTML={{ __html: post.body }}` with `{{ __html: sanitizeHtml(post.body) }}`.
  4. Alternative: switch blog storage to Markdown, render with `react-markdown` + `rehype-sanitize`.
  5. Do NOT sanitize `src/gamio-body.html` blob mount — it's trusted at build time.
- **Verification:** SEC-02.
- **Rollback:** Remove sanitize call; dependency stays.

#### Fix SEC-FIX-06: Add security response headers
- **Finding:** S-06
- **Severity:** High
- **Root cause:** No CSP/XFO/Referrer/Permissions-Policy → clickjacking + tighter XSS mitigation missing.
- **Affected files:** `src/server.ts`.
- **Fix steps:**
  1. Open `src/server.ts`; wrap the SSR handler so the returned `Response` receives extra headers.
  2. Headers:
     - `Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; font-src 'self' https://cdn.jsdelivr.net; script-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co https://*.lovable.app;`
     - `X-Frame-Options: DENY`
     - `Referrer-Policy: strict-origin-when-cross-origin`
     - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  3. Tune CSP once dependencies are self-hosted (SEC-FIX-07 removes `cdn.jsdelivr.net` from the allowlist).
- **Verification:** SEC-08.
- **Rollback:** Remove wrapper.

#### Fix SEC-FIX-07: Self-host fonts + icons
- **Finding:** S-07
- **Severity:** Medium
- **Fix steps:** `bun add @fontsource/vazirmatn bootstrap-icons` → import in `src/styles.css` (fontsource) and `src/routes/__root.tsx` (`import 'bootstrap-icons/font/bootstrap-icons.css'`) → remove CDN `<link>`s → update CSP.
- **Verification:** offline load test.

#### Fix SEC-FIX-08: Dependency vulnerability sweep
- **Finding:** S-08
- **Severity:** Medium
- **Fix steps:** Run `code--dependency_scan`; for each high/critical, run `bun update <pkg>`; re-scan; commit lockfile.
- **Verification:** clean scan.

### Functionality

#### Fix FUN-FIX-01: Ship payments before public "book now"
- **Finding:** F-01
- **Severity:** Critical
- **Root cause:** Marketing promises a bookable rental; there is no payment gate. Every booking is a promise-only obligation.
- **Affected files:** `BookingDialog.tsx`, new `src/routes/api/public/stripe-webhook.ts`, new `payments` table migration, plan §A3.
- **Fix steps:**
  1. Decide: Stripe (international) or ZarinPal/IDPay (Iranian rials). Ask the owner.
  2. Store secret via `secrets--add_secret` (`STRIPE_SECRET_KEY` or equivalent).
  3. Migration: `payments (id, booking_id fk, provider text, amount int, currency text, status text, external_id text, created_at)`. RLS: user reads own; service_role all.
  4. Server fn `createCheckoutSession`: takes `bookingId`, creates provider session, returns URL.
  5. Client: after booking insert, redirect to session URL.
  6. Webhook route: verify signature, update `payments.status` + `bookings.status`.
  7. Update landing copy to reflect payment step.
- **Verification:** E2E-01 with sandbox, M-07.
- **Rollback:** Feature-flag the payment step; fall back to phone confirmation.
- **Sequencing:** After SEC-FIX-03.

#### Fix FUN-FIX-02: Prevent double booking (availability)
- **Finding:** F-03
- **Severity:** High
- **Fix steps:**
  1. Migration: `availability (id, console_id, date, slot, is_taken bool)` with `unique(console_id, date, slot)`.
  2. Server fn `reserveSlot` inside a transaction: `select for update` the row, insert booking, mark taken.
  3. Booking dialog: fetch free slots; disable taken ones.
- **Verification:** concurrent E2E test firing two reservations.

#### Fix FUN-FIX-03: Booking status state machine
- **Finding:** F-02
- **Severity:** High
- **Fix steps:** Add `bookings.status` CHECK constraint (enum: pending/confirmed/completed/cancelled). Add `updated_at` optimistic-locking column; server fn requires prev `updated_at`.
- **Verification:** IT-04 with two admin clients.

#### Fix FUN-FIX-04: Cancel window
- **Finding:** F-04
- **Severity:** Medium
- **Fix steps:** Add `cancel_before` timestamp on booking (start - 24h). Server fn `cancelBooking` rejects if `now() > cancel_before`.

#### Fix FUN-FIX-05: Rate-limit contact form
- **Finding:** F-05
- **Severity:** Medium
- **Fix steps:** Cloudflare KV counter keyed by IP; 5/hour; return 429 on exceed. Or hCaptcha widget.

### UI / UX

#### Fix UI-FIX-01: Split section pages
- **Finding:** U-01
- **Severity:** High
- **Fix steps:** For each of `/pricing`, `/consoles`, `/how-it-works`, `/faq`, extract the corresponding section from the blob into a dedicated component; replace `LandingPage scrollTo=` with a lean route rendering only that section + shared header/footer.

#### Fix UI-FIX-02: Newsletter honesty
- **Finding:** U-03
- **Severity:** Medium (High if launching before backend)
- **Fix steps:** Either (a) create `newsletter_subscribers` table + server fn insert, or (b) remove the form until ready. No middle ground — silent-drop is unacceptable for consent-implying UX.

### Accessibility

#### Fix A11Y-FIX-01: Extend axe suite + keyboard nav tests
- **Finding:** A-01
- **Severity:** High
- **Fix steps:** Add `best-practice` tag to `AxeBuilder.withTags`; add Playwright test that tabs through landing hero → CTA → dialog and asserts focus visibility via `page.evaluate(() => document.activeElement)`.

### Performance

#### Fix PERF-FIX-01: Trim legacy CSS
- **Finding:** P-01
- **Severity:** High
- **Fix steps:** Run PurgeCSS against `public/css/index.css` + `tailwind-build.css` using the rendered blob as content; commit trimmed files.

### SEO

#### Fix SEO-FIX-01: Home route head()
- **Finding:** SEO-01
- **Severity:** High
- **Fix steps:** Add `head()` to `src/routes/index.tsx` with title, description, og:title, og:description, twitter:card. og:image via hero image absolute URL.

### DevOps

#### Fix DEV-FIX-01: CI pipeline
- **Finding:** D-01
- **Severity:** High
- **Fix steps:** `.github/workflows/ci.yml` — jobs: `install` (bun), `lint` (`bun run lint`), `build` (`bun run build`), `a11y` (`bun run test:a11y`). Fail PR merge on red.

#### Fix DEV-FIX-02: Env matrix + secret store audit
- **Finding:** D-02
- **Severity:** High
- **Fix steps:** Document each `process.env.*` used, environment where set, rotation policy. Confirm secrets in Lovable secrets manager.

---

## 6. Open Questions / Unknowns

1. **Payment provider** — Stripe, ZarinPal, or defer? (Blocks FUN-FIX-01.)
2. **Calendar system** — Gregorian `fa-IR` or Jalali (Shamsi)?
3. **Newsletter** — build it or remove the CTA?
4. **Blog rendering** — HTML or Markdown? (Affects SEC-FIX-05 approach.)
5. **Prod secret store** — Lovable secrets only, or external (Doppler/Vercel/etc.)?
6. **Rate-limit backend** — Cloudflare KV, Durable Objects, or an external service?
7. **Analytics/monitoring** — Lovable-only, or add Sentry/PostHog?
8. **Rollout plan** — soft launch to allowlist or public flip?

All flagged `UNKNOWN — needs owner input`.

---

## 7. Recommended Remediation Order

Effort scale: S = ≤2h, M = 0.5–1d, L = 1–3d, XL = 3d+.

| Order | Fix ID | Sev | Effort | Depends on |
|-------|--------|-----|--------|------------|
| 1 | SEC-FIX-01 (lock SECURITY DEFINER) | Critical | S | — |
| 2 | SEC-FIX-03 (RLS+GRANT sweep) | Critical | M | SEC-FIX-01 |
| 3 | SEC-FIX-02 (iCal hardening) | Critical | S | — |
| 4 | FUN-FIX-01 (payments) | Critical | XL | SEC-FIX-03; product decision |
| 5 | SEC-FIX-04 (server-side validators) | High | M | SEC-FIX-03 |
| 6 | SEC-FIX-05 (sanitize HTML) | High | S | — |
| 7 | SEC-FIX-06 (security headers) | High | S | SEC-FIX-07 for final CSP |
| 8 | FUN-FIX-02 (availability) | High | M | SEC-FIX-03 |
| 9 | FUN-FIX-03 (status state machine) | High | S | — |
| 10 | UI-FIX-01 (split section pages) | High | L | — |
| 11 | A11Y-FIX-01 (extend axe) | High | S | — |
| 12 | PERF-FIX-01 (trim legacy CSS) | High | M | — |
| 13 | SEO-FIX-01 (home head) | High | S | — |
| 14 | DEV-FIX-01 (CI) | High | S | — |
| 15 | DEV-FIX-02 (env matrix) | High | S | — |
| 16 | SEC-FIX-07 (self-host CDN) | Medium | S | — |
| 17 | SEC-FIX-08 (dep scan) | Medium | S | — |
| 18 | UI-FIX-02 (newsletter) | Medium | S–M | product decision |
| 19 | FUN-FIX-04 (cancel window) | Medium | S | — |
| 20 | FUN-FIX-05 (contact rate limit) | Medium | S | — |
| 21 | Remaining Medium/Low (U-02, U-04, A-02/03, P-02..05, L-01..04, SEO-02..04, D-03/04, B-01/02, Q-02..04) | Medium/Low | S each | — |

**Go/No-Go gate:** items 1–15 must be complete (or explicitly risk-accepted in writing) before flipping to production.

---

*End of report. No files changed during this audit.*