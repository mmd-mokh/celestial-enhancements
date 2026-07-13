CREATE SCHEMA IF NOT EXISTS tests;
CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA tests;

-- Only the service_role should be able to invoke pgTAP helpers in prod.
REVOKE ALL ON SCHEMA tests FROM anon, authenticated;
GRANT USAGE ON SCHEMA tests TO service_role;