
ALTER FUNCTION tests._seed_create_booking_fixture() SET search_path = tests, public;
ALTER FUNCTION tests._teardown_create_booking_fixture() SET search_path = tests, public;
ALTER FUNCTION tests.test_create_booking_rejects_past_date() SET search_path = tests, public;
ALTER FUNCTION tests.test_create_booking_rejects_invalid_dates() SET search_path = tests, public;
ALTER FUNCTION tests.test_create_booking_rejects_short_name() SET search_path = tests, public;
ALTER FUNCTION tests.test_create_booking_rejects_short_phone() SET search_path = tests, public;
ALTER FUNCTION tests.test_create_booking_rate_limited() SET search_path = tests, public;
