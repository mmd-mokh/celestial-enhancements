-- Lock down SECURITY DEFINER function execution to intended roles.
-- Revoke PUBLIC EXECUTE and re-grant narrowly.

-- has_role: only signed-in users need to call it (RLS policies invoke it as auth.uid())
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- update_updated_at_column: trigger helper only; nobody should call it directly
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;

-- get_console_availability: public availability check, keep readable
REVOKE ALL ON FUNCTION public.get_console_availability(text, date, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_console_availability(text, date, date) TO anon, authenticated, service_role;

-- create_booking: allow anon + authenticated (phone-based bookings are supported)
REVOKE ALL ON FUNCTION public.create_booking(text, text, text, text, date, date, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_booking(text, text, text, text, date, date, text) TO anon, authenticated, service_role;

-- cancel_booking / reschedule_booking: authenticated only (they enforce auth.uid())
REVOKE ALL ON FUNCTION public.cancel_booking(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_booking(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.reschedule_booking(uuid, date, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reschedule_booking(uuid, date, date) TO authenticated, service_role;