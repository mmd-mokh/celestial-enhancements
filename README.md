# Consoleto — اجاره کنسول بازی

A Persian/RTL landing page and booking platform for console rentals (PlayStation 5, Xbox Series X, Nintendo Switch). Built on TanStack Start with Lovable Cloud (Supabase) as the backend.

> Original static landing ported and extended into a full-stack app: bookings with availability, customer accounts, admin dashboard, blog, analytics, and PWA support.

---

## Stack

- **Framework:** TanStack Start v1 (React 19 + Vite 7, SSR on Cloudflare Workers)
- **Styling:** Tailwind CSS v4 (semantic tokens in `src/styles.css`) + shadcn/ui
- **Backend:** Lovable Cloud (Supabase) — Postgres, Auth, RLS, RPCs
- **Forms:** react-hook-form + zod
- **Animation:** Framer Motion
- **Charts:** Recharts
- **Font:** Vazirmatn (Persian)

---

## Features

### Public site
- RTL Persian landing page (hero, consoles, pricing, how-it-works, testimonials, FAQ, CTA, footer)
- Sticky shadcn navigation with scroll-spy + mobile drawer (`Sheet`)
- Dark mode toggle with system-preference detection and no-flash init
- Per-section SEO routes: `/consoles`, `/pricing`, `/how-it-works`, `/faq`, `/contact`, `/blog`
- JSON-LD: `Organization`, `ItemList`, `FAQPage`, `BreadcrumbList`, `BlogPosting`
- Dynamic `sitemap.xml` + `robots.txt`
- PWA manifest for home-screen install
- Newsletter form and contact form (validated, persisted)

### Booking flow
- Multi-step dialog: console → package → date range → contact
- Real-time availability check against `consoles.quantity`
- Server-side atomic booking creation via `create_booking` RPC
- Rate limiting (max 5 bookings/hour per user or phone)
- Auto-fills name/phone for signed-in users
- iCal (.ics) download on success

### Customer accounts (`/my-bookings`)
- Email/password + Google OAuth (`/auth`)
- View, cancel, and reschedule bookings (availability re-validated on reschedule)
- iCal download per booking

### Admin (`/admin`, role-gated)
- Bookings table with inline status updates, bulk actions, and delete
- Detail drawer with editable notes, call button, iCal download
- Analytics: 30-day trends, status distribution (Recharts)
- CSV export (UTF-8 BOM for Persian)
- Catalog management (`/catalog`) — consoles + packages CRUD, quantity, visual accents
- Blog editor (`/blog-admin`) — DB-backed posts
- Contact messages moderation

### Security
- Row-Level Security on every public table
- `has_role()` security-definer helper, `user_roles` table (never on profiles)
- Server functions gated by `requireSupabaseAuth` middleware
- Webhook-style public routes under `/api/public/*`

---

## Local development

```bash
bun install
bun dev          # http://localhost:8080
bun run build    # production build
bun run lint
```

Environment variables are auto-managed by Lovable Cloud (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`). Do not edit `.env` by hand.

---

## Project structure

```text
src/
  routes/                    file-based routing (TanStack)
    __root.tsx               root layout, head metadata, PWA tags
    index.tsx                landing page
    auth.tsx                 sign-in / sign-up
    consoles.tsx             per-section SEO routes
    pricing.tsx
    how-it-works.tsx
    faq.tsx
    contact.tsx
    blog.tsx, blog.$slug.tsx
    sitemap[.]xml.ts
    api/public/              webhooks & public endpoints (iCal export)
    _authenticated/          auth-gated subtree
      admin.tsx              admin dashboard
      catalog.tsx            consoles + packages CRUD
      blog-admin.tsx
      my-bookings.tsx
  components/
    LandingPage.tsx          composes header + HTML blob + React sections
    SiteHeader.tsx, SiteFooter.tsx
    BookingDialog.tsx        multi-step booking flow
    PricingCards.tsx, ConsoleCards.tsx
    FaqAccordion.tsx, NewsletterForm.tsx
    AccountChip.tsx, ThemeToggle.tsx
    AnalyticsCharts.tsx
    ui/                      shadcn primitives
  integrations/supabase/     auto-generated client + auth middleware
  consoleto-body.html            ported static sections (portaled into by React)
public/
  consoleto.js                   legacy scroll animations
  css/, assets/              ported styles + images
  manifest.webmanifest, robots.txt
```

---

## Database schema (high-level)

| Table | Purpose |
| --- | --- |
| `bookings` | Reservations: console, package, date range, contact, status, user_id |
| `consoles` | Console catalog (name, tagline, features, accents, quantity) |
| `packages` | Pricing plans (daily/weekend/weekly/monthly + price + features) |
| `contact_messages` | Contact-form submissions |
| `posts` | Blog articles (slug, title, body, published_at) |
| `user_roles` | `admin` / `user` role assignments (never on profiles) |

RPCs: `create_booking`, `cancel_booking`, `reschedule_booking`, `get_console_availability`, `has_role`.

### Promoting a user to admin

Run in the Cloud SQL editor:

```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'you@example.com';
```

---

## Deployment

Managed by Lovable. Push to `main` (via the Lovable ↔ GitHub sync) and the app deploys to Cloudflare Workers. Stable URLs:

- Preview: `project--<id>-dev.lovable.app`
- Production: `project--<id>.lovable.app`

---

## Credits

- Original static landing: [mmd-mokh/CelestialSaaS](https://github.com/mmd-mokh/CelestialSaaS)
- Rebuilt and extended with [Lovable](https://lovable.dev)

---

## Changelog

A detailed log of every meaningful change made to this project, from the initial
audit through the current reservation-only build.

### 1. Audit & Planning

- **`AUDIT_REPORT_V2.md`** — produced a prioritized audit report cataloguing
  Critical / High / Medium / Low findings across security, data integrity,
  accessibility, SEO, and UX. Each finding was mapped to a Fix ID with a
  recommended remediation, and used as the backlog for every subsequent change.
- Established a go/no-go deployment gate: zero open Critical findings, all High
  findings with explicit sign-off.

### 2. Security & Backend Hardening

- **CI pipeline** (`.github/workflows/ci.yml`) — install, lint, build, and
  Playwright accessibility smoke tests on every push and PR.
- **HTML sanitization** (`src/lib/sanitize.ts`) — `isomorphic-dompurify` wrapper
  used before rendering any admin-authored HTML (blog posts, message bodies)
  via `dangerouslySetInnerHTML`, blocking stored XSS from privileged accounts.
- **iCal endpoint hardening** (`src/routes/api/public/booking-ical.$id.ts`) —
  strict UUID regex on the path param before touching the database, preventing
  enumeration and injection through the public endpoint.
- **Security headers** (`src/server.ts`) — added `Content-Security-Policy`,
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy`, `Permissions-Policy`, and HSTS on all HTML responses,
  with a normalizer that converts h3-swallowed 500s into a branded error page.
- **SSR error boundary** (`src/lib/error-capture.ts`, `src/lib/error-page.ts`,
  `src/start.ts`) — request middleware captures unhandled errors, logs them,
  and returns a styled Persian error page instead of leaking framework internals.
- **Database migrations** — tightened RLS policies and GRANTs on public tables
  (`bookings`, `consoles`, `packages`, `contact_messages`, `posts`,
  `newsletter_subscribers`), added the `has_role()` security-definer helper and
  the `user_roles` table pattern (kept in schema for future re-enable), and
  wired the `create_booking` / `cancel_booking` / `reschedule_booking` /
  `get_console_availability` RPCs with rate limits.

### 3. Accessibility, SEO & Content Routes

- **Per-section SEO routes** — split the landing page into dedicated routes
  (`/consoles`, `/pricing`, `/how-it-works`, `/faq`, `/contact`, `/blog`,
  `/blog/$slug`) with unique `head()` metadata (title, description, canonical,
  og:*, twitter:*) instead of hash anchors.
- **Structured data** — JSON-LD for `WebSite`, `Organization`, `ItemList`,
  `FAQPage`, `BreadcrumbList`, `BlogPosting` on the relevant routes.
- **Dynamic `sitemap.xml`** and static `robots.txt`.
- **PWA manifest** (`public/manifest.webmanifest`) and matching `<link>` tags
  in `__root.tsx` for home-screen install support.
- **Root metadata** (`src/routes/__root.tsx`) — real app-specific title,
  description, OG/Twitter tags, viewport, theme-color, and a no-flash inline
  script that reads the saved theme before hydration.
- **A11y smoke tests** (`tests/a11y/smoke.spec.ts`) — Playwright + axe-core
  scans of the primary routes, wired into CI.

### 4. Landing Page & Design System

- **Newsletter form** (`src/components/NewsletterForm.tsx`) — react-hook-form
  + zod validation portaled into the ported static blob, with dedupe-friendly
  Supabase insert and Persian success/error toasts.
- **Pricing, Consoles, FAQ, Contact** — React components (`PricingCards`,
  `ConsoleCards`, `FaqAccordion`, contact route) replaced static markup for
  the interactive sections while preserving the ported visual design.
- **Semantic tokens** (`src/styles.css`) — moved colors, gradients, and
  shadows to CSS variables and shadcn variants; removed hardcoded `text-white`
  / `bg-black` / hex utilities from components.
- **Site header/footer** (`SiteHeader`, `SiteFooter`) — sticky shadcn nav with
  scroll-spy and mobile `Sheet` drawer.

### 5. Dark Mode

- **Theme toggle** (`src/components/ThemeToggle.tsx`) — Sun/Moon toggle that
  writes `localStorage` and toggles both `html.dark` and `data-theme` in sync.
- **No-flash init** in `__root.tsx` head applies the saved theme before paint.
- **Legacy script sync** (`public/consoleto.js`) — ported scroll animations updated
  to keep `dark` class and `data-theme` attribute consistent.
- **Global dark overrides** (`src/styles.css`) — scoped `html.dark` rules
  remap hardcoded Tailwind utilities inside the ported HTML blob
  (`tw-bg-white`, `tw-text-black`, `tw-text-gray-*`, gray surfaces, footer,
  pricing card gradients) onto semantic tokens so the whole page themes
  correctly instead of showing white patches.

### 6. Authentication Removal (per user request)

- Deleted the entire `_authenticated/` route subtree (`admin`, `blog-admin`,
  `catalog`, `my-bookings`), `auth.tsx`, and `AccountChip.tsx`.
- Removed `attachSupabaseAuth` from `functionMiddleware` in `src/start.ts`.
- Reservation stays fully anonymous: the `create_booking` RPC already accepts
  `anon` inserts under RLS, so no schema changes were needed.
- `user_roles` / `has_role()` and admin RLS policies remain in the database so
  auth can be re-enabled later without another migration cycle.

### 7. Reservation Dialog — Bug Fixes

- Removed `supabase.auth.getUser()` prefill that was clobbering user-typed
  name/phone whenever the dialog reopened.
- **Persian/Arabic-Indic digit normalization** (`toAsciiDigits`) applied on
  phone input change and before submit, so `۰۹...` / `٠٩...` values pass the
  phone regex and the server-side validator.
- Fixed zod `required_error` → `message` for `startDate` (correct v3 API).
- Migrated calendar from removed `fromDate`/`toDate` props to
  `startMonth`/`endMonth` for react-day-picker v9.

### 8. Reservation Dialog — Rebuild

- Recreated `BookingDialog.tsx` from scratch with native `react-hook-form`
  wiring, Persian locale via `react-day-picker/persian`, and Jalali date
  formatting through a shared `PERSIAN_DATE_LIB` helper.
- Overrode conflicting global styles in `src/components/ui/dialog.tsx`
  (backdrop blur, RTL close-button positioning, responsive `DialogContent`
  layout) so the dialog renders correctly in both themes.
- Verified the full flow (console → package → Jalali date range → contact →
  submit) end-to-end with Playwright in light and dark mode.

### 9. Reservation Dialog — UI/UX Polish

- Numbered progress **stepper** with animated progress line and clear
  active/done states.
- Replaced missing Bootstrap icon strings with dynamic **Lucide** icons
  (`Gamepad2`, `MonitorPlay`, `Tv`, etc.).
- Persistent check-mark badges on selected console / package cards.
- **Sticky summary footer** showing the current selections at every step.
- Button hierarchy tightened: filled primary "بعدی", ghost "قبلی".
- Backdrop-blur overlay, corrected RTL close-button placement, and matched
  dialog surfaces to the semantic token palette for consistent dark/light
  rendering.
- Re-verified visually with Playwright screenshots across every step in both
  themes.

### 10. Housekeeping

- Regenerated `src/routeTree.gen.ts` after every route addition/removal.
- Kept `AGENTS.md`, `AUDIT_REPORT.md`, and `AUDIT_REPORT_V2.md` in the repo
  as living context for future audits.
- No manual edits to auto-generated files (`src/integrations/supabase/*`,
  `routeTree.gen.ts`, `.env`, `supabase/config.toml`).
