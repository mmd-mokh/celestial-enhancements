
-- Phase 1: stable SQLSTATE codes for booking flow
-- Custom class 'GM' (Gamio). Codes:
--   GM001 invalid_name
--   GM002 invalid_phone
--   GM003 invalid_dates
--   GM004 past_date
--   GM005 rate_limited
--   GM006 console_unavailable
--   GM007 no_availability
--   GM008 not_authenticated
--   GM009 forbidden
--   GM010 already_cancelled_or_completed
--   GM011 past_booking

CREATE OR REPLACE FUNCTION public.create_booking(_name text, _phone text, _console_type text, _package_type text, _start_date date, _end_date date, _notes text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _capacity int;
  _max_overlap int;
  _new_id uuid;
  _uid uuid;
  _recent int;
BEGIN
  IF _name IS NULL OR length(trim(_name)) < 2 THEN
    RAISE EXCEPTION 'invalid_name' USING ERRCODE = 'GM001';
  END IF;
  IF _phone IS NULL OR length(trim(_phone)) < 6 THEN
    RAISE EXCEPTION 'invalid_phone' USING ERRCODE = 'GM002';
  END IF;
  IF _start_date IS NULL OR _end_date IS NULL OR _end_date < _start_date THEN
    RAISE EXCEPTION 'invalid_dates' USING ERRCODE = 'GM003';
  END IF;
  IF _start_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'past_date' USING ERRCODE = 'GM004';
  END IF;

  _uid := auth.uid();

  IF _uid IS NOT NULL THEN
    SELECT count(*) INTO _recent FROM public.bookings
      WHERE created_at > now() - interval '1 hour' AND user_id = _uid;
  ELSE
    SELECT count(*) INTO _recent FROM public.bookings
      WHERE created_at > now() - interval '1 hour' AND user_id IS NULL AND phone = trim(_phone);
  END IF;
  IF _recent >= 5 THEN
    RAISE EXCEPTION 'rate_limited' USING ERRCODE = 'GM005';
  END IF;

  SELECT quantity INTO _capacity FROM public.consoles WHERE slug = _console_type AND active;
  IF _capacity IS NULL OR _capacity <= 0 THEN
    RAISE EXCEPTION 'console_unavailable' USING ERRCODE = 'GM006';
  END IF;

  _max_overlap := public.booking_peak_overlap(_console_type, _start_date, _end_date, NULL);

  IF _max_overlap >= _capacity THEN
    RAISE EXCEPTION 'no_availability' USING ERRCODE = 'GM007';
  END IF;

  INSERT INTO public.bookings (name, phone, console_type, package_type, start_date, end_date, notes, user_id)
  VALUES (trim(_name), trim(_phone), _console_type, _package_type, _start_date, _end_date, NULLIF(trim(_notes), ''), _uid)
  RETURNING id INTO _new_id;

  RETURN _new_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cancel_booking(_booking_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid;
  _owner uuid;
  _status text;
  _start date;
BEGIN
  _uid := auth.uid();
  IF _uid IS NULL THEN RAISE EXCEPTION 'not_authenticated' USING ERRCODE = 'GM008'; END IF;
  SELECT user_id, status, start_date INTO _owner, _status, _start
    FROM public.bookings WHERE id = _booking_id;
  IF _owner IS NULL OR _owner <> _uid THEN RAISE EXCEPTION 'forbidden' USING ERRCODE = 'GM009'; END IF;
  IF _status IN ('cancelled','completed') THEN RAISE EXCEPTION 'already_%', _status USING ERRCODE = 'GM010'; END IF;
  IF _start IS NOT NULL AND _start < CURRENT_DATE THEN RAISE EXCEPTION 'past_booking' USING ERRCODE = 'GM011'; END IF;
  UPDATE public.bookings SET status = 'cancelled', updated_at = now() WHERE id = _booking_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.reschedule_booking(_booking_id uuid, _start_date date, _end_date date)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid;
  _owner uuid;
  _status text;
  _console text;
  _capacity int;
  _max_overlap int;
BEGIN
  _uid := auth.uid();
  IF _uid IS NULL THEN RAISE EXCEPTION 'not_authenticated' USING ERRCODE = 'GM008'; END IF;
  IF _start_date IS NULL OR _end_date IS NULL OR _end_date < _start_date THEN
    RAISE EXCEPTION 'invalid_dates' USING ERRCODE = 'GM003';
  END IF;
  IF _start_date < CURRENT_DATE THEN RAISE EXCEPTION 'past_date' USING ERRCODE = 'GM004'; END IF;

  SELECT user_id, status, console_type INTO _owner, _status, _console
    FROM public.bookings WHERE id = _booking_id;
  IF _owner IS NULL OR _owner <> _uid THEN RAISE EXCEPTION 'forbidden' USING ERRCODE = 'GM009'; END IF;
  IF _status IN ('cancelled','completed') THEN RAISE EXCEPTION 'already_%', _status USING ERRCODE = 'GM010'; END IF;

  SELECT quantity INTO _capacity FROM public.consoles WHERE slug = _console AND active;
  IF _capacity IS NULL OR _capacity <= 0 THEN RAISE EXCEPTION 'console_unavailable' USING ERRCODE = 'GM006'; END IF;

  _max_overlap := public.booking_peak_overlap(_console, _start_date, _end_date, _booking_id);

  IF _max_overlap >= _capacity THEN RAISE EXCEPTION 'no_availability' USING ERRCODE = 'GM007'; END IF;

  UPDATE public.bookings
    SET start_date = _start_date, end_date = _end_date, updated_at = now()
    WHERE id = _booking_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.rate_limit_contact_messages()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _recent int;
BEGIN
  IF NEW.email IS NULL AND NEW.phone IS NULL THEN RETURN NEW; END IF;
  SELECT count(*) INTO _recent FROM public.contact_messages
   WHERE created_at > now() - interval '1 hour'
     AND ((NEW.email IS NOT NULL AND email = NEW.email)
       OR (NEW.phone IS NOT NULL AND phone = NEW.phone));
  IF _recent >= 5 THEN RAISE EXCEPTION 'rate_limited' USING ERRCODE = 'GM005'; END IF;
  RETURN NEW;
END; $function$;

CREATE OR REPLACE FUNCTION public.rate_limit_newsletter_subscribers()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _recent int;
BEGIN
  SELECT count(*) INTO _recent FROM public.newsletter_subscribers
   WHERE created_at > now() - interval '1 hour' AND email = NEW.email;
  IF _recent >= 3 THEN RAISE EXCEPTION 'rate_limited' USING ERRCODE = 'GM005'; END IF;
  RETURN NEW;
END; $function$;

-- Server-side helper: fetch a booking summary by id, RLS-scoped.
-- Used by the booking status page after we HMAC-verify the token server-side.
CREATE OR REPLACE FUNCTION public.get_booking_summary(_booking_id uuid)
 RETURNS TABLE(id uuid, name text, phone text, console_type text, package_type text, start_date date, end_date date, status text, notes text, created_at timestamptz)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT id, name, phone, console_type, package_type, start_date, end_date, status, notes, created_at
  FROM public.bookings WHERE id = _booking_id;
$function$;

REVOKE ALL ON FUNCTION public.get_booking_summary(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_booking_summary(uuid) TO service_role;
