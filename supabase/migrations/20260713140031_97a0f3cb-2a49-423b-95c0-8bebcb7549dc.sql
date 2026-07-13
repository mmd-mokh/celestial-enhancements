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
  IF _name IS NULL OR length(trim(_name)) < 2 THEN RAISE EXCEPTION 'invalid_name'; END IF;
  IF _phone IS NULL OR length(trim(_phone)) < 6 THEN RAISE EXCEPTION 'invalid_phone'; END IF;
  IF _start_date IS NULL OR _end_date IS NULL OR _end_date < _start_date THEN
    RAISE EXCEPTION 'invalid_dates';
  END IF;
  IF _start_date < CURRENT_DATE THEN RAISE EXCEPTION 'past_date'; END IF;

  _uid := auth.uid();

  SELECT count(*) INTO _recent FROM public.bookings
    WHERE created_at > now() - interval '1 hour'
      AND ((_uid IS NOT NULL AND user_id = _uid) OR phone = trim(_phone));
  IF _recent >= 5 THEN RAISE EXCEPTION 'rate_limited'; END IF;

  SELECT quantity INTO _capacity FROM public.consoles WHERE slug = _console_type AND active;
  IF _capacity IS NULL OR _capacity <= 0 THEN RAISE EXCEPTION 'console_unavailable'; END IF;

  SELECT COALESCE(MAX(cnt), 0) INTO _max_overlap FROM (
    SELECT count(b.id)::int AS cnt
    FROM generate_series(_start_date, _end_date, interval '1 day') AS d(day)
    LEFT JOIN public.bookings b
      ON b.console_type = _console_type
     AND b.status IN ('pending','confirmed')
     AND b.start_date IS NOT NULL
     AND d.day::date BETWEEN b.start_date AND b.end_date
    GROUP BY d.day
  ) s;

  IF _max_overlap >= _capacity THEN
    RAISE EXCEPTION 'no_availability';
  END IF;

  INSERT INTO public.bookings (name, phone, console_type, package_type, start_date, end_date, notes, user_id)
  VALUES (trim(_name), trim(_phone), _console_type, _package_type, _start_date, _end_date, NULLIF(trim(_notes), ''), _uid)
  RETURNING id INTO _new_id;

  RETURN _new_id;
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
  IF _uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF _start_date IS NULL OR _end_date IS NULL OR _end_date < _start_date THEN RAISE EXCEPTION 'invalid_dates'; END IF;
  IF _start_date < CURRENT_DATE THEN RAISE EXCEPTION 'past_date'; END IF;

  SELECT user_id, status, console_type INTO _owner, _status, _console
    FROM public.bookings WHERE id = _booking_id;
  IF _owner IS NULL OR _owner <> _uid THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _status IN ('cancelled','completed') THEN RAISE EXCEPTION 'already_%', _status; END IF;

  SELECT quantity INTO _capacity FROM public.consoles WHERE slug = _console AND active;
  IF _capacity IS NULL OR _capacity <= 0 THEN RAISE EXCEPTION 'console_unavailable'; END IF;

  SELECT COALESCE(MAX(cnt), 0) INTO _max_overlap FROM (
    SELECT count(b.id)::int AS cnt
    FROM generate_series(_start_date, _end_date, interval '1 day') AS d(day)
    LEFT JOIN public.bookings b
      ON b.console_type = _console
     AND b.status IN ('pending','confirmed')
     AND b.id <> _booking_id
     AND b.start_date IS NOT NULL
     AND d.day::date BETWEEN b.start_date AND b.end_date
    GROUP BY d.day
  ) s;

  IF _max_overlap >= _capacity THEN RAISE EXCEPTION 'no_availability'; END IF;

  UPDATE public.bookings
    SET start_date = _start_date, end_date = _end_date, updated_at = now()
    WHERE id = _booking_id;
END;
$function$;