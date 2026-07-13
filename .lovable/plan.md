# Phase 1 — Kill the HTML blob

Replace the `dangerouslySetInnerHTML` landing page (fed by `src/gamio-body.html` + `public/gamio.js` + `public/css/tailwind-build.css`) with real React components using Tailwind v4 tokens. This unlocks dark mode, i18n, SSR, real HMR, and lets us tighten CSP (drop `unsafe-inline`/`unsafe-eval`).

## Deliverables

New components under `src/components/landing/`:

1. `Hero.tsx` — headline, subheadline, CTA buttons, hero image.
2. `Consoles.tsx` — replaces the current `ConsoleCards` inline anchor; keeps section wrapper + heading.
3. `WhyUs.tsx` — feature grid (icons + copy).
4. `HowItWorks.tsx` — 3–4 numbered steps.
5. `Pricing.tsx` — section wrapper around existing `PricingList` (drops portal hack).
6. `Testimonials.tsx` — quote cards.
7. `FaqSection.tsx` — wraps existing `FaqAccordion`.
8. `CtaBand.tsx` — final call-to-action.

`LandingPage.tsx` becomes a straight composition of these sections + `SiteHeader`/`SiteFooter` + lazy `BookingDialog`. No more `dangerouslySetInnerHTML`, no `useEffect` script injection, no click-delegation to parse Persian labels.

## Styling

- Move all custom styles from `public/css/tailwind-build.css` and inline classes (`tw-*` prefix) into Tailwind v4 utilities in JSX; a small residue (pricing-card-featured glow, accent stripe) moves into `src/styles.css` via `@utility` blocks.
- Drop the `tw-` prefix — Tailwind v4 in `src/styles.css` has no prefix configured, so classes should be plain (`flex`, `bg-white`, etc.).
- Keep RTL direction (`dir="rtl"`) at the section level as needed.

## Cleanup (same PR)

- Delete `src/gamio-body.html`.
- Delete `public/gamio.js`.
- Delete `public/css/tailwind-build.css`.
- Remove the `<link>` / `<script>` references for those files from `__root.tsx` if present.
- Remove the `PricingCards` portal component (keep `PricingList` for `/pricing` route + landing).
- Tighten CSP in `src/server.ts`: drop `'unsafe-inline'` and `'unsafe-eval'` from `script-src`.

## Verification

- `bun run build` succeeds.
- Playwright smoke (`tests/a11y/smoke.spec.ts`) still passes.
- Manual: home page renders all sections in RTL, dark mode toggle works across the whole page, "رزرو کن" buttons open `BookingDialog` with the correct package, `/pricing` still works.
- Check that no request to `/gamio.js` or `/css/tailwind-build.css` is issued.

## Scope guardrails

- Content stays identical (same Persian copy, same package data, same order of sections). This is a port, not a redesign.
- No backend or data-layer changes (Phase 2 territory).
- Keep existing routes (`/consoles`, `/pricing`, `/faq`, etc.) untouched.

## Rough size

~8 new component files (~40–120 lines each), 1 CSS utility block, ~4 file deletions, minor edits to `LandingPage.tsx`, `__root.tsx`, `server.ts`, `.lovable/plan.md`. Estimated 1 turn of focused work.

Reply "go" to execute, or tell me which sections to reshape/skip.
