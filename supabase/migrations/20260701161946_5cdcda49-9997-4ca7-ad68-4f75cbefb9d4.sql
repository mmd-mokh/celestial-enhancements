
CREATE OR REPLACE FUNCTION public.cancel_booking(_booking_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid;
  _owner uuid;
  _status text;
  _start date;
BEGIN
  _uid := auth.uid();
  IF _uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  SELECT user_id, status, start_date INTO _owner, _status, _start
    FROM public.bookings WHERE id = _booking_id;
  IF _owner IS NULL OR _owner <> _uid THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _status IN ('cancelled','completed') THEN RAISE EXCEPTION 'already_%', _status; END IF;
  IF _start IS NOT NULL AND _start < CURRENT_DATE THEN RAISE EXCEPTION 'past_booking'; END IF;
  UPDATE public.bookings SET status = 'cancelled', updated_at = now() WHERE id = _booking_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.reschedule_booking(_booking_id uuid, _start_date date, _end_date date)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    SELECT count(*)::int AS cnt
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
$$;

GRANT EXECUTE ON FUNCTION public.cancel_booking(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reschedule_booking(uuid, date, date) TO authenticated;
