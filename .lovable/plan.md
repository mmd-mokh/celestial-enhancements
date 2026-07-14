# Enhancement plan — round 2

Focused on the high-impact items still open. Grouped so each phase is independently reviewable.

## Phase 1 — Robust error signaling (backend + client)
- Migration: rewrite `create_booking`, `cancel_booking`, `reschedule_booking`, and the two rate-limit triggers to `RAISE EXCEPTION ... USING ERRCODE = '<sqlstate>', MESSAGE = '<code>'`. Use distinct SQLSTATEs (e.g. `P0001` with stable `MESSAGE` tokens) so client parsing is locale-independent.
- Update `src/lib/bookings.functions.ts` to read `error.code` / `error.message` token instead of substring-matching a concatenated string.
- Add unit test covering the mapping.

## Phase 2 — Booking status page
- New public route `src/routes/booking.$id.tsx` — accepts the signed iCal token as `?t=` query so an anonymous booker can view their own booking without auth.
- Server fn `getBookingByToken` in `src/lib/bookings.functions.ts`: verifies HMAC via `booking-token.server`, returns booking summary (status, dates, console, package).
- Success view (`SuccessView.tsx`) links to this page and the iCal file.
- Owner-authenticated users see the same page via `/booking/$id` without token (RLS enforces).

## Phase 3 — CAPTCHA on anonymous forms
- Integrate Cloudflare Turnstile (free, no PII):
  - Request `TURNSTILE_SITE_KEY` (publishable, in code) + `TURNSTILE_SECRET_KEY` (via add_secret).
  - Wrap `BookingDialog` submit + `NewsletterForm` submit with a Turnstile widget.
  - New server fn `verifyTurnstile` called at top of `createBooking` and newsletter insert paths for anonymous users only (skip when `auth.uid()` is present).
- Fail closed: no token → reject with `captcha_required`.

## Phase 4 — pgTAP coverage
- Extend `tests/db/` (create if missing) with suites for:
  - `create_booking`: capacity enforcement, rate limit (>=5/hour), past date rejection, invalid dates.
  - `cancel_booking`: owner-only, no-op after past start.
  - `has_role`: already scaffolded — verify runner still passes.
- Register new runners in `scripts/run-pgtap.mjs`.

## Phase 5 — CSP (report-only)
- Extend `securityHeadersMiddleware` in `src/start.ts` with `Content-Security-Policy-Report-Only` covering: `default-src 'self'`, allow Supabase (`*.supabase.co`), Google Fonts, Turnstile (`challenges.cloudflare.com`), inline styles (`'unsafe-inline'` for Tailwind runtime — evaluate `'unsafe-hashes'` later), `img-src` with `data:` and Supabase storage.
- Add `report-uri` pointing to a new `/api/public/csp-report` route that logs violations (rate-limited).
- Keep report-only until we've observed one full deploy cycle without violations, then flip to enforcing in a follow-up.

## Technical notes
- All migrations wrap in a transaction; keep existing RLS/GRANTs intact.
- Turnstile widget is client-only; render inside `<ClientOnly>` in dialog to avoid SSR mismatch.
- Booking token route is public but data is scoped by HMAC — no new RLS policy needed (server-fn uses `supabaseAdmin` after verifying token).
- CSP violation endpoint validates `application/csp-report` MIME and truncates payloads before logging.

## Out of scope (deferred)
- Admin dashboard UI.
- Transactional email (Resend) — needs domain + template design first.
- Enforcing CSP (only report-only in this round).

## Order of execution
1. Phase 1 (migration + client) — smallest surface, unblocks better error UX everywhere.
2. Phase 4 (pgTAP) — validates Phase 1 changes.
3. Phase 2 (status page).
4. Phase 3 (CAPTCHA) — needs Turnstile secret from user.
5. Phase 5 (CSP report-only) — last, after all new origins are known.
