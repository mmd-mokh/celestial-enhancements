SET search_path = tests, public;

-- Deterministic user ids so tests are stable and repeatable.
CREATE OR REPLACE FUNCTION tests._admin_uid() RETURNS uuid LANGUAGE sql IMMUTABLE AS $$
  SELECT '00000000-0000-0000-0000-00000000a001'::uuid
$$;
CREATE OR REPLACE FUNCTION tests._plain_uid() RETURNS uuid LANGUAGE sql IMMUTABLE AS $$
  SELECT '00000000-0000-0000-0000-00000000a002'::uuid
$$;
CREATE OR REPLACE FUNCTION tests._unknown_uid() RETURNS uuid LANGUAGE sql IMMUTABLE AS $$
  SELECT '00000000-0000-0000-0000-00000000dead'::uuid
$$;

-- Set up / tear down fixture users in auth.users + user_roles.
CREATE OR REPLACE FUNCTION tests._seed_has_role_fixture() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO auth.users (id, email, instance_id, aud, role)
    VALUES (tests._admin_uid(), 'admin@test.local', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
    ON CONFLICT (id) DO NOTHING;
  INSERT INTO auth.users (id, email, instance_id, aud, role)
    VALUES (tests._plain_uid(), 'plain@test.local', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
    ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
    VALUES (tests._admin_uid(), 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
END $$;

CREATE OR REPLACE FUNCTION tests._teardown_has_role_fixture() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.user_roles WHERE user_id IN (tests._admin_uid(), tests._plain_uid());
  DELETE FROM auth.users WHERE id IN (tests._admin_uid(), tests._plain_uid());
END $$;

-- Individual pgTAP tests. Each function returns SETOF text (a TAP line stream).
CREATE OR REPLACE FUNCTION tests.test_admin_has_admin_role() RETURNS SETOF text
LANGUAGE plpgsql AS $$
BEGIN
  RETURN NEXT tests.ok(public.has_role(tests._admin_uid(), 'admin'::public.app_role),
                       'admin user is recognized as admin');
END $$;

CREATE OR REPLACE FUNCTION tests.test_admin_lacks_moderator_role() RETURNS SETOF text
LANGUAGE plpgsql AS $$
BEGIN
  RETURN NEXT tests.ok(NOT public.has_role(tests._admin_uid(), 'moderator'::public.app_role),
                       'admin user is not moderator (unassigned)');
END $$;

CREATE OR REPLACE FUNCTION tests.test_plain_user_is_not_admin() RETURNS SETOF text
LANGUAGE plpgsql AS $$
BEGIN
  RETURN NEXT tests.ok(NOT public.has_role(tests._plain_uid(), 'admin'::public.app_role),
                       'user without an admin assignment is not admin');
END $$;

CREATE OR REPLACE FUNCTION tests.test_unknown_uid_is_not_admin() RETURNS SETOF text
LANGUAGE plpgsql AS $$
BEGIN
  RETURN NEXT tests.ok(NOT public.has_role(tests._unknown_uid(), 'admin'::public.app_role),
                       'unknown user id is not admin');
END $$;

CREATE OR REPLACE FUNCTION tests.test_null_uid_returns_false() RETURNS SETOF text
LANGUAGE plpgsql AS $$
BEGIN
  RETURN NEXT tests.ok(NOT public.has_role(NULL, 'admin'::public.app_role),
                       'has_role(null, ...) returns false');
END $$;

-- Runner: seeds fixtures, runs every `tests.test_*` function via pgTAP's
-- runtests(), tears down, and returns the TAP stream. Any failing assertion
-- shows up as a `not ok` line and a non-zero failure count in the summary.
CREATE OR REPLACE FUNCTION tests.run_has_role_tests() RETURNS SETOF text
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM tests._seed_has_role_fixture();
  RETURN QUERY SELECT * FROM tests.runtests('tests'::name, '^test_'::text);
  PERFORM tests._teardown_has_role_fixture();
END $$;

REVOKE ALL ON FUNCTION tests.run_has_role_tests() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION tests.run_has_role_tests() TO service_role;