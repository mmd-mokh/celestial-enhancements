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

  IF _uid IS NOT NULL THEN
    SELECT count(*) INTO _recent FROM public.bookings
      WHERE created_at > now() - interval '1 hour' AND user_id = _uid;
  ELSE
    SELECT count(*) INTO _recent FROM public.bookings
      WHERE created_at > now() - interval '1 hour' AND user_id IS NULL AND phone = trim(_phone);
  END IF;
  IF _recent >= 5 THEN RAISE EXCEPTION 'rate_limited'; END IF;

  SELECT quantity INTO _capacity FROM public.consoles WHERE slug = _console_type AND active;
  IF _capacity IS NULL OR _capacity <= 0 THEN RAISE EXCEPTION 'console_unavailable'; END IF;

  _max_overlap := public.booking_peak_overlap(_console_type, _start_date, _end_date, NULL);

  IF _max_overlap >= _capacity THEN
    RAISE EXCEPTION 'no_availability';
  END IF;

  INSERT INTO public.bookings (name, phone, console_type, package_type, start_date, end_date, notes, user_id)
  VALUES (trim(_name), trim(_phone), _console_type, _package_type, _start_date, _end_date, NULLIF(trim(_notes), ''), _uid)
  RETURNING id INTO _new_id;

  RETURN _new_id;
END;
$function$;