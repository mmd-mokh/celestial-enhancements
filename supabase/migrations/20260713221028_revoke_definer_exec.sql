-- Tighten SECURITY DEFINER function surface: revoke EXECUTE from anon /
-- authenticated where those roles have no legitimate need to call the
-- function directly. Trigger functions and admin/booking mutations are
-- invoked via triggers or the server (service_role), which bypasses these
-- grants, so revoking is safe.

-- Trigger functions (invoked by Postgres, not by API clients)
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rate_limit_contact_messages() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rate_limit_newsletter_subscribers() FROM PUBLIC, anon, authenticated;

-- Role check helper — only server code (service_role) and policies (SQL) need it.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;

-- Booking helpers — the client calls them via server fns using service_role,
-- and cancel/reschedule require auth.uid() so anon can't do anything with them.
REVOKE EXECUTE ON FUNCTION public.booking_peak_overlap(text, date, date, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_booking(text, text, text, text, date, date, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.cancel_booking(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reschedule_booking(uuid, date, date) FROM PUBLIC, anon;

-- Public read helpers stay callable by anon (get_consoles_remaining,
-- get_console_availability) — they only return aggregate availability.
