GRANT USAGE ON SCHEMA tests TO postgres;
GRANT EXECUTE ON FUNCTION tests.run_has_role_tests() TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA tests TO postgres;