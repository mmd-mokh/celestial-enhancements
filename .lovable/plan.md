# SEO Plan — گیمیو (console rental, Tehran)

Foundations already in place: per-route `head()` metadata, JSON-LD (Organization, LocalBusiness, FAQPage, ItemList, Service, BreadcrumbList), a dynamic sitemap that includes blog posts, Persian/RTL setup, and semantic sections. This plan closes the current scanner findings, polishes metadata, adds keyword-targeted content, tightens performance, then wires measurement.

---

## Phase 1 — Fix current scanner findings

**1.1 Shorten root title & description** (`src/routes/__root.tsx`)
- Title → ≤60 chars, e.g. `گیمیو | اجاره کنسول PS5، Xbox و Nintendo Switch` (~48).
- Description → ≤160 chars, one sentence covering value + city + delivery.

**1.2 Fix heading hierarchy** (h1 → h2 → h3)
- `ConsoleList`, `PricingList`, `FaqList` render `<h3>` under each page's `<h1>`. Change those to `<h2>` so `/consoles`, `/pricing`, `/faq`, `/contact` never skip a level.

**1.3 Contact form a11y** (`src/routes/contact.tsx`)
- Add unique `id` on every `Input`/`Textarea` and matching `htmlFor` on each `<label>`; add `aria-describedby` pointing at the field's error text.

**1.4 Sitemap absolute URLs** (`src/routes/sitemap[.]xml.ts`)
- Set `BASE_URL = "https://star-crafting-suite.lovable.app"` (or the custom domain once live). `/api/public/booking-ical/$id` is a machine endpoint — leaving it out is correct.

**1.5 Add `/llms.txt`** at `public/llms.txt` listing `/`, `/consoles`, `/pricing`, `/how-it-works`, `/faq`, `/contact`, `/blog`. Exclude `/auth`, `/admin`, `/api/*`, `/.mcp`, `/.well-known/*`.

**1.6 `public/robots.txt`**
- Append `Sitemap: https://star-crafting-suite.lovable.app/sitemap.xml`.
- Add `Disallow: /api/` to keep machine endpoints out of the index.

---

## Phase 2 — Metadata polish

**2.1 Absolute URLs**
- Replace relative `canonical`, `og:url`, `og:image` values with absolute URLs. Use a `getRequestOrigin` server fn so preview and custom domain both resolve — no hardcoded host.

**2.2 Per-route social image**
- Every route currently reuses `/assets/images/home/dashboard.png`. Generate 3 dedicated 1200×630 OG images (home, pricing, consoles) and wire them per leaf route only (never `__root.tsx` — the root concatenates into every match). I'll ask before generating.

**2.3 Metadata coverage audit**
- `/how-it-works`, `/blog`, `/blog/$slug`, `/contact`: confirm each has a unique `title`, `description`, `og:title`, `og:description`, `canonical`. `/blog/$slug` derives all from loader data with `og:type: article` + `Article` JSON-LD.

**2.4 Structured-data upgrades**
- `/pricing`: expose each package as a `Product` + `Offer` with real `price` / `priceCurrency: "IRR"` (already partial — align prices with the visible cards).
- `/blog/$slug`: add `Article` schema (`datePublished`, `dateModified`, `author`, `image`).
- Move the `WebSite` + `SearchAction` JSON-LD from `/` up to `__root.tsx` so it's site-wide.

---

## Phase 3 — Content expansion (Persian search demand)

**3.1 Per-console landing pages**
- `/consoles/ps5`, `/consoles/xbox-series-x`, `/consoles/nintendo-switch` — hero, specs, popular games, price for that console, filtered testimonials, dedicated `Product` + `Offer` JSON-LD. Targets high-intent queries like `اجاره PS5 تهران`.

**3.2 Use-case landing pages**
- `/rent/party` (مهمانی), `/rent/nowruz` (نوروز), `/rent/birthday`. Same shell, different copy + testimonials.

**3.3 Seed blog (4–6 posts)**
- "مقایسه PS5 و Xbox Series X — کدام برای اجاره بهتر است؟"
- "بهترین بازی‌های انحصاری PS5 در ۱۴۰۴"
- "چطور برای مهمانی کنسول اجاره کنیم؟"
- "راهنمای انتخاب پکیج اجاره: روزانه، هفتگی یا ماهانه؟"
- 800–1500 words each; internal links to `/pricing` + the relevant console page.

**3.4 On-page hygiene**
- Ensure exactly one `<h1>` per page (some pages currently rely on hero copy).
- Descriptive `alt` on every image ("کنسول PlayStation 5 گیمیو" beats "PS5").
- One internal link from every page to `/pricing` and one to `/consoles`.

---

## Phase 4 — Performance (Core Web Vitals)

**4.1 Images**
- Convert `public/assets/images/**` `.jpg`/`.png` to WebP + fallback. Set explicit `width`/`height` on every `<img>` (fixes CLS).
- Only the LCP hero should be `fetchPriority="high"` + preloaded (already correct). Everything else `loading="lazy"`.

**4.2 CSS / JS**
- Audit `public/css/index.css` loaded from `__root.tsx` alongside Tailwind — if legacy, remove to drop render-blocking bytes.
- Keep `BookingDialog` lazy-loaded (already is).

**4.3 Fonts**
- Any web font: preconnect to its host and set `font-display: swap`.

---

## Phase 5 — Measurement & submission

**5.1 Search Console**
- Once a custom domain is live, verify the domain via the `google_search_console` connector (`META` flow), then submit `/sitemap.xml` and inspect `/`, `/pricing`, `/consoles`.

**5.2 Analytics**
- Add Plausible or GA4 via a route script (cookieless preferred for the Persian audience) if none is present.

**5.3 Cadence**
- Re-run the built-in SEO scan monthly (SEO tab → Rescan).
- After 4–6 weeks of indexation, review Semrush `domain_analysis` + `top_pages` and iterate copy.

---

## Technical section (for reference)

**Phase 1 files:**
- `src/routes/__root.tsx` (title / description length)
- `src/routes/contact.tsx` (form a11y)
- `src/components/ConsoleCards.tsx`, `PricingCards.tsx`, `FaqAccordion.tsx` (h3 → h2)
- `src/routes/sitemap[.]xml.ts` (`BASE_URL`)
- `public/robots.txt` (Sitemap directive, `/api/` disallow)
- `public/llms.txt` (new)

**Phase 3 new files:**
- `src/routes/consoles.$slug.tsx` (per-console pages, driven by existing `consoles` table)
- `src/routes/rent.$slug.tsx` (use-case pages)
- New `posts` rows via the existing blog pipeline

**Rules honored throughout:**
- `og:image` on leaf routes only, never `__root.tsx`.
- `canonical` on leaf only.
- Absolute URLs once the domain is confirmed.
- No hash-fragment navigation for section pages.

---

## Suggested execution order

1. **Phase 1** — clears every current scanner finding (~30 min of edits).
2. **Phase 2.1 + 2.4** — metadata polish, no new pages.
3. **Phase 4.1** — image conversion, biggest CWV win.
4. **Phase 3** — content, the growth lever (console pages → use-case → blog).
5. **Phase 5** — submit + measure.

Reply "go" to execute Phase 1, or name a specific phase to start there.