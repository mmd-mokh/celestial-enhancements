# Phase 1 — Kill the HTML blob (section by section)

The current homepage injects a 1600-line static HTML string (`src/gamio-body.html`) styled by a 1931-line prebuilt CSS file (`public/css/index.css`) and driven by 559 lines of imperative JS (`public/gamio.js`). This bypasses React, Tailwind v4 tokens, dark mode, SSR SEO for content, and code-splitting. We'll port it in safe, shippable slices.

## Sections to port (in order)

1. **Hero** — headline, tagline badge, CTAs, trust badges. First slice.
2. **Trust metrics** — 3 stat badges (5000+ rentals, 98% satisfaction, 24/7).
3. **Why us / How it works** — feature grid + steps.
4. **Testimonials** — customer quotes.
5. **CTA band + misc footers** — final call-to-action strip.

`PricingCards`, `ConsoleCards`, `FaqAccordion`, `NewsletterForm` are already real React components — they stay.

## How each slice ships

For each section:
- Build a React component in `src/components/sections/<Name>.tsx` using semantic Tailwind v4 tokens (`bg-primary`, `text-foreground`, `border-border`) — no `tw-` prefix, no custom compiled CSS.
- Framer Motion for reveal animations (replaces `IntersectionObserver` code in `gamio.js`).
- Bootstrap Icons stay (already imported in `styles.css`).
- Cut the ported section out of `src/gamio-body.html`; render the React component in its place inside `LandingPage.tsx`.
- Once every section is ported: delete `src/gamio-body.html`, `public/gamio.js`, `public/css/index.css`, `public/css/tailwind-build.css`; drop the `dangerouslySetInnerHTML` div; remove the click-delegation `useEffect`.

Mobile nav (`Sheet`) and desktop nav (`NavigationMenu`) already live in `SiteHeader` — the drawer JS in `gamio.js` is dead once the blob is gone.

## This turn — Hero only

- Create `src/components/sections/Hero.tsx` (RTL, semantic tokens, Framer Motion fade-in, wired to `#pricing` anchor).
- Remove hero markup (lines ~13–105 of `gamio-body.html`).
- Insert `<Hero onReserve={...} />` at the top of `LandingPage`, before the remaining injected HTML.
- Verify visually with a Playwright screenshot at 1280×1800 and mobile 390×844.

No behavior change for users — just the hero rendered by React with dark-mode-ready tokens. Remaining sections still render from the HTML blob and continue to work.

## Technical notes

- The `tw-` prefix in the blob is currently non-functional in Tailwind v4 (`source(none)` + no prefix registered). The blob renders styled only because `public/css/index.css` is a hand-compiled Tailwind v3 build shipped as a static asset. That's why we can't just re-prefix — we need real components.
- Each ported section reduces static CSS payload; final deletes remove ~2.5k lines of shipped code.
- Playwright smoke test (`tests/a11y/smoke.spec.ts`) already covers `/`, so regressions surface immediately.

Reply "go" to ship the Hero slice, or tell me to adjust scope.
