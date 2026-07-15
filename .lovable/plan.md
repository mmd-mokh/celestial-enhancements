# UI Modernization Plan — branch `new_ui`

## Branching note
I can't run git commands directly. Create the `new_ui` branch from the Lovable **GitHub / Git sync** panel (or your local clone) before I start committing, so every change below lands on that branch instead of `main`.

## Goals
1. Modern, cohesive visual language (not generic AI purple-on-white).
2. Fully responsive from 360px → 1440px+ with no clipped/overflowing rows.
3. WCAG AA: contrast, focus, landmarks, labels, tap targets.

---

## 1. Design system refresh (`src/styles.css`)
- Replace the current flat `#6C5CE7` primary with a richer OKLCH palette + `--primary-glow`, `--gradient-primary`, `--gradient-hero`, `--shadow-elegant`, `--shadow-glow` semantic tokens.
- Introduce surface tokens (`--surface-1/2/3`) so cards, header, and hero share a layered depth system in light & dark.
- Type scale: keep `Vazirmatn` for FA body, pair with a distinctive display weight for headings (variable weight already loaded — add `--font-display` and use `font-feature-settings` for tabular numerals in pricing).
- Motion tokens: `--ease-out-emphasized`, `--dur-fast/med/slow` used by reveals, hovers, header shrink.
- Remove the `html.dark .bg-white / .text-gray-*` override hacks and migrate the offending components to semantic tokens (`bg-card`, `text-muted-foreground`) so dark mode is real, not patched.

## 2. Component modernization
- **SiteHeader**: replace the hand-rolled mobile panel with shadcn `Sheet` (accessible focus trap, ESC handling). Add active-link underline animation. Ensure 44×44 tap target on hamburger.
- **HeroSection**: apply the new gradient + subtle grain, restructure to `grid-cols-[minmax(0,1fr)_auto]` on mobile per responsive-layout rules; add a secondary "چطور کار می‌کنه" ghost CTA next to primary.
- **ConsoleCards / PricingCards / FaqAccordion**: unify radius (`rounded-2xl`), elevation (`shadow-elegant`), hover lift, and use `aspect-video` wrappers for images. Featured pricing card gets `--gradient-primary` border via `bg-clip`.
- **SectionHeading**: allow an optional icon eyebrow; tighten spacing scale (`gap-2 md:gap-3`).
- **Buttons**: add `variant="premium"` (gradient + glow) and `variant="ghost-outline"` via `cva`; retire ad-hoc `btn-enhanced` CSS.
- **FaqSection / NewsletterSection / FinalCtaSection**: swap raw `<a>` styled buttons for shadcn `<Button asChild>` so focus rings and disabled states are consistent.

## 3. Responsive audit
- Apply the `grid-cols-[minmax(0,1fr)_auto]` + `min-w-0` + `shrink-0` + `truncate` recipe to every header-style row (SiteHeader inner, booking dialog headers, console card headers).
- Convert any `h-screen` → `h-dvh`.
- Verify with Playwright at 360, 414, 768, 1024, 1440; screenshot each landing section.

## 4. Accessibility pass
- Run the accessibility skill checklist across `/`, `/pricing`, `/consoles`, `/how-it-works`, `/faq`, `/contact`, `/blog`.
- Fixes expected: icon-only buttons missing `aria-label` (theme toggle, hamburger already OK — verify others), single `<main>` per route (move into `__root.tsx` layout if duplicated), skipped heading levels in sections, focus-visible rings on all interactive tokens, ensure form inputs in booking dialog have associated `<Label>`.
- Re-run `tests/a11y/smoke.spec.ts` — target zero critical/serious axe violations (currently the CI gate).

## 5. Verification
- `tsgo` typecheck.
- `bunx vitest run` for unit tests.
- Playwright: capture before/after screenshots for hero, consoles, pricing at mobile + desktop; run the a11y smoke suite.

## Out of scope
- No backend, data-model, routing, or business-logic changes.
- No new dependencies beyond what shadcn already provides.
- Copy/content stays the same (Persian text untouched).

## Deliverable
A single PR on `new_ui` with the design-system diff, refactored components, and green a11y + type + unit checks.
