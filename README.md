# Gamio — اجاره کنسول بازی

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
  gamio-body.html            ported static sections (portaled into by React)
public/
  gamio.js                   legacy scroll animations
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
