# Gamio — Refactoring Plan (completed roll-up)

## Phase 1 — Kill the HTML blob — ✅ DONE

- `dangerouslySetInnerHTML` + `src/gamio-body.html` replaced by real React
  sections under `src/components/landing/`: `HeroSection`, `ConsolesSection`,
  `WhyUsSection`, `HowItWorksSection`, `TestimonialsSection`, `PricingSection`,
  `FaqSection`, `CtaSection`, `NewsletterSection`.
- `LandingPage.tsx` is now a plain composition of `SiteHeader` + those
  sections + `SiteFooter` + lazy `BookingDialog` + `Toaster`. No script
  injection, no click-delegation on Persian labels.
- `src/gamio-body.html` and `public/gamio.js` deleted.
- `NewsletterForm` gained an inline fallback (renders directly when no
  legacy mount is found), so `NewsletterSection` uses it without portal.
- CSP in `src/server.ts` tightened: dropped `'unsafe-eval'`. `'unsafe-inline'`
  stays because the root theme-init script and TanStack's `<Scripts />`
  hydration payload are inline; moving them behind a nonce is a follow-up.

### Deferred inside Phase 1

- Dropping the `tw-` class prefix and deleting `public/css/tailwind-build.css`
  is a wider refactor — every existing component (Header, Footer, Booking
  dialog, cards, etc.) uses `tw-*` classes served from that pre-built
  stylesheet. Doing it correctly means stripping the prefix across the whole
  repo and moving custom styles into `@utility` blocks. Left as a separate
  task; the compiled CSS file was restored and its `<link>` remains in
  `__root.tsx`.
- The old portal wrappers (`PricingCards`, `ConsoleCards`, `FaqAccordion`)
  are now unused but kept as thin fallbacks; they can be deleted once we're
  confident nothing else references them.

## Phases 2–7

Previous status preserved:

- Phase 2 (data layer) — deferred.
- Phase 3 (routing/SEO) — largely done in earlier work.
- Phase 4 (backend hardening) — ✅ DONE.
- Phase 5 (perf) — partial ✅.
- Phase 6 (quality/DX) — ✅ DONE for ESLint + dead files.
- Phase 7 (security pass) — ✅ DONE.

Next natural target: Phase 2 (server functions + TanStack Query for
consoles/bookings) or the deferred `tw-` prefix strip.
