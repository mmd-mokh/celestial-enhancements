
-- pgTAP: create_booking behavior tests
CREATE OR REPLACE FUNCTION tests._seed_create_booking_fixture() RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  -- Ensure a console slug 'ps5' with capacity 1 exists (idempotent).
  INSERT INTO public.consoles (slug, name, tagline, quantity, active, sort_order, hourly_rate)
  VALUES ('ps5-test', 'PS5 Test', 'test', 1, true, 999, 0)
  ON CONFLICT (slug) DO UPDATE SET quantity = 1, active = true;
END; $$;

CREATE OR REPLACE FUNCTION tests._teardown_create_booking_fixture() RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM public.bookings WHERE console_type = 'ps5-test';
  DELETE FROM public.consoles WHERE slug = 'ps5-test';
END; $$;

CREATE OR REPLACE FUNCTION tests.test_create_booking_rejects_past_date() RETURNS SETOF text
LANGUAGE plpgsql AS $$
BEGIN
  RETURN NEXT throws_ok(
    $q$ SELECT public.create_booking('Test Name', '09121112233', 'ps5-test', 'daily',
                                     CURRENT_DATE - 1, CURRENT_DATE + 1, NULL) $q$,
    'GM004'
  );
END; $$;

CREATE OR REPLACE FUNCTION tests.test_create_booking_rejects_invalid_dates() RETURNS SETOF text
LANGUAGE plpgsql AS $$
BEGIN
  RETURN NEXT throws_ok(
    $q$ SELECT public.create_booking('Test Name', '09121112233', 'ps5-test', 'daily',
                                     CURRENT_DATE + 5, CURRENT_DATE + 1, NULL) $q$,
    'GM003'
  );
END; $$;

CREATE OR REPLACE FUNCTION tests.test_create_booking_rejects_short_name() RETURNS SETOF text
LANGUAGE plpgsql AS $$
BEGIN
  RETURN NEXT throws_ok(
    $q$ SELECT public.create_booking('A', '09121112233', 'ps5-test', 'daily',
                                     CURRENT_DATE + 1, CURRENT_DATE + 2, NULL) $q$,
    'GM001'
  );
END; $$;

CREATE OR REPLACE FUNCTION tests.test_create_booking_rejects_short_phone() RETURNS SETOF text
LANGUAGE plpgsql AS $$
BEGIN
  RETURN NEXT throws_ok(
    $q$ SELECT public.create_booking('Test Name', '12', 'ps5-test', 'daily',
                                     CURRENT_DATE + 1, CURRENT_DATE + 2, NULL) $q$,
    'GM002'
  );
END; $$;

CREATE OR REPLACE FUNCTION tests.test_create_booking_rate_limited() RETURNS SETOF text
LANGUAGE plpgsql AS $$
DECLARE i int;
BEGIN
  PERFORM tests._seed_create_booking_fixture();
  -- Insert 5 bookings directly (bypassing capacity check on distinct future days)
  FOR i IN 1..5 LOOP
    INSERT INTO public.bookings (name, phone, console_type, package_type, start_date, end_date, user_id)
    VALUES ('Rate User', '09990001111', 'ps5-test', 'daily',
            CURRENT_DATE + i * 30, CURRENT_DATE + i * 30 + 1, NULL);
  END LOOP;
  RETURN NEXT throws_ok(
    $q$ SELECT public.create_booking('Rate User', '09990001111', 'ps5-test', 'daily',
                                     CURRENT_DATE + 200, CURRENT_DATE + 201, NULL) $q$,
    'GM005'
  );
END; $$;

CREATE OR REPLACE FUNCTION tests.run_create_booking_tests() RETURNS SETOF text
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM tests._seed_create_booking_fixture();
  BEGIN
    RETURN NEXT '# create_booking';
    RETURN QUERY SELECT * FROM tests.test_create_booking_rejects_past_date();
    RETURN QUERY SELECT * FROM tests.test_create_booking_rejects_invalid_dates();
    RETURN QUERY SELECT * FROM tests.test_create_booking_rejects_short_name();
    RETURN QUERY SELECT * FROM tests.test_create_booking_rejects_short_phone();
    RETURN QUERY SELECT * FROM tests.test_create_booking_rate_limited();
  EXCEPTION WHEN OTHERS THEN
    PERFORM tests._teardown_create_booking_fixture();
    RAISE;
  END;
  PERFORM tests._teardown_create_booking_fixture();
END; $$;

ALTER FUNCTION tests.run_create_booking_tests() SET search_path = tests, public;
REVOKE ALL ON FUNCTION tests.run_create_booking_tests() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION tests.run_create_booking_tests() TO service_role, postgres;
