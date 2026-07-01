
# Gamio — Full Enhancements Plan

Already shipped (Phase 1 + first pass of Phase 2):
- ✅ Landing page port (RTL, Vazirmatn, all sections)
- ✅ Booking flow with `bookings` table + RLS
- ✅ Auth (email/password + Google) at `/auth`
- ✅ Admin dashboard at `/admin` with role gating via `user_roles` + `has_role`

Below is everything else, grouped by area. Each item is independently shippable — pick any subset.

---

## A. Backend & product features

**A1. Dynamic consoles & pricing from DB**
Replace hardcoded PS5/Xbox/Switch cards and the 4 pricing tiers with `consoles` and `pricing_plans` tables. Admin CRUD in `/admin`. Landing reads at build/request time.

**A2. Real availability & calendar**
`availability` table (console_id, date, slots). Booking dialog shows a date picker with only free slots. Prevents double-booking.

**A3. Payments (Stripe)**
Deposit or full payment per package. `payments` table linked to `bookings`. Webhook at `/api/public/stripe-webhook`. Status auto-advances to `confirmed` on paid.

**A4. Customer account area** (`/account`)
Signed-in users see their own bookings, status, payment receipts, can cancel within a window.

**A5. Contact form → DB + email**
`contact_messages` table. Auto-reply + admin notification via Resend (or Lovable AI Gateway if we go that route).

**A6. Reviews / testimonials**
`reviews` table, submit form for signed-in users who completed a booking, moderation queue in admin, display approved ones in the testimonials section.

**A7. Notifications**
SMS confirmation to the phone number on booking (Kavenegar/Twilio) + email to admin on every new booking.

**A8. Coupons / promo codes**
`coupons` table (code, discount, expiry, usage cap). Applied in booking dialog and validated server-side.

---

## B. Frontend & UX

**B1. i18n (fa/en)** with language switcher, auto `dir` swap, translated meta tags.

**B2. Dark mode** toggle wired to the existing `.dark` tokens, persisted in localStorage, respects `prefers-color-scheme`.

**B3. Framer Motion** replacement for the hand-rolled scroll animations in `gamio.js`, with `prefers-reduced-motion` support.

**B4. shadcn nav + drawer** — replace hand-rolled mobile drawer with `Sheet`, desktop nav with `NavigationMenu`. Deletes a chunk of `gamio.js`.

**B5. Accessibility pass** — focus rings, skip-link, aria-labels on icon buttons, color-contrast audit, keyboard nav for the pricing/console cards.

**B6. Image optimization** — responsive `srcset`, lazy loading, AVIF/WebP variants, hero preload.

**B7. Componentize the HTML blob** — progressively replace `dangerouslySetInnerHTML` with real React components (Header, Hero, Consoles, WhyUs, HowItWorks, Pricing, FAQ, Testimonials, CTA, Footer) so the whole page is type-safe and editable.

**B8. Booking dialog polish** — multi-step (console → package → date → contact), inline validation with react-hook-form + zod, success screen with reservation ID.

---

## C. SEO & growth

**C1. Per-section routes** — `/consoles`, `/consoles/[slug]`, `/pricing`, `/how-it-works`, `/faq`, each with unique `head()` metadata, canonical, og:image derived from the section's hero.

**C2. Structured data (JSON-LD)** — `Organization`, `Product` per console, `FAQPage`, `AggregateRating` once reviews exist, `LocalBusiness` if there's a physical location.

**C3. `sitemap.xml` + `robots.txt`** generated from the route tree via a server route at `/api/public/sitemap.xml`.

**C4. Blog** at `/blog` — MDX or DB-backed, tag pages, RSS feed. Content SEO for "اجاره پلی استیشن" and long-tail queries.

**C5. Analytics + conversion events** — Plausible or PostHog, events on CTA clicks, dialog open, booking submit, payment success.

**C6. Open Graph images** generated per route from a template (og-image server route).

---

## D. Admin & ops

**D1. Admin: consoles/pricing/coupons CRUD** (depends on A1, A8).

**D2. Admin: analytics tab** — bookings per day/week, revenue, conversion funnel from visits → dialog opens → submissions → paid.

**D3. Admin: export CSV** for bookings and payments.

**D4. Audit log** — `admin_actions` table capturing status changes and deletes.

**D5. Rate limiting on public endpoints** (booking submit, contact form) via IP + phone dedup to block spam.

---

## E. Quality & DX

**E1. Vitest** tests for booking validation, pricing calc, `has_role` behavior.

**E2. Playwright** smoke tests for the main flows (booking, sign-in, admin status change).

**E3. Error/404 polish** — friendly Persian copy on the existing boundaries.

**E4. Lighthouse budget in CI** — enforce Core Web Vitals targets, warn on regressions.

**E5. Security scan pass** — run the built-in security scanner and resolve findings.

---

## Suggested next slice

If you want a single opinionated "next PR", I'd pick:
**B2 (dark mode)** + **C1 (per-section routes with SEO)** + **B8 (booking dialog polish with zod/rhf)** + **D3 (CSV export)**.

That's high user-visible value, no new external services, and sets the stage for payments (A3) after.

## Which do you want?

Reply with the letter/number codes you want (e.g. "A1, A3, B2, C1, C2") or say "next slice" for my recommendation above.
