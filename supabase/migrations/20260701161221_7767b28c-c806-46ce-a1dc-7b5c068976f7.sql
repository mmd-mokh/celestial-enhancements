
-- Schema additions
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS end_date date;

ALTER TABLE public.consoles
  ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS bookings_console_dates_idx
  ON public.bookings (console_type, start_date, end_date)
  WHERE start_date IS NOT NULL;

-- Availability query: booked units per day within a date range for a console.
CREATE OR REPLACE FUNCTION public.get_console_availability(
  _console_slug text,
  _from date,
  _to date
)
RETURNS TABLE(day date, booked int, capacity int)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH cap AS (
    SELECT COALESCE((SELECT quantity FROM public.consoles WHERE slug = _console_slug AND active), 0) AS q
  ),
  days AS (
    SELECT generate_series(_from, _to, interval '1 day')::date AS day
  )
  SELECT
    d.day,
    COALESCE((
      SELECT count(*)::int
      FROM public.bookings b
      WHERE b.console_type = _console_slug
        AND b.status IN ('pending','confirmed')
        AND b.start_date IS NOT NULL
        AND b.end_date IS NOT NULL
        AND d.day BETWEEN b.start_date AND b.end_date
    ), 0) AS booked,
    (SELECT q FROM cap) AS capacity
  FROM days d
  ORDER BY d.day;
$$;

GRANT EXECUTE ON FUNCTION public.get_console_availability(text, date, date) TO anon, authenticated;

-- Atomic create-booking with capacity check
CREATE OR REPLACE FUNCTION public.create_booking(
  _name text,
  _phone text,
  _console_type text,
  _package_type text,
  _start_date date,
  _end_date date,
  _notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _capacity int;
  _max_overlap int;
  _new_id uuid;
BEGIN
  -- basic validation
  IF _name IS NULL OR length(trim(_name)) < 2 THEN RAISE EXCEPTION 'invalid_name'; END IF;
  IF _phone IS NULL OR length(trim(_phone)) < 6 THEN RAISE EXCEPTION 'invalid_phone'; END IF;
  IF _start_date IS NULL OR _end_date IS NULL OR _end_date < _start_date THEN
    RAISE EXCEPTION 'invalid_dates';
  END IF;
  IF _start_date < CURRENT_DATE THEN RAISE EXCEPTION 'past_date'; END IF;

  SELECT quantity INTO _capacity FROM public.consoles WHERE slug = _console_type AND active;
  IF _capacity IS NULL OR _capacity <= 0 THEN RAISE EXCEPTION 'console_unavailable'; END IF;

  -- Find max concurrent bookings on any day in requested range
  SELECT COALESCE(MAX(cnt), 0) INTO _max_overlap FROM (
    SELECT count(*)::int AS cnt
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

  INSERT INTO public.bookings (name, phone, console_type, package_type, start_date, end_date, notes)
  VALUES (trim(_name), trim(_phone), _console_type, _package_type, _start_date, _end_date, NULLIF(trim(_notes), ''))
  RETURNING id INTO _new_id;

  RETURN _new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_booking(text, text, text, text, date, date, text) TO anon, authenticated;
