#!/usr/bin/env node
/**
 * Runs pgTAP suites defined in the `tests` schema against the project's
 * Postgres instance. Requires SUPABASE_DB_URL (direct connection with
 * privileges to invoke tests.run_*_tests()).
 *
 * Exits 0 if every assertion passes, non-zero on any `not ok` line.
 */
import pg from "pg";

const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error("SUPABASE_DB_URL is not set — skipping pgTAP suite.");
  process.exit(0);
}

const RUNNERS = ["tests.run_has_role_tests"];

const client = new pg.Client({ connectionString: url });
await client.connect();
let failed = 0;
try {
  for (const fn of RUNNERS) {
    console.log(`# ${fn}`);
    const { rows } = await client.query(`SELECT * FROM ${fn}() AS line`);
    for (const r of rows) {
      const line = r.line;
      console.log(line);
      if (/^not ok\b/.test(line)) failed += 1;
    }
  }
} finally {
  await client.end();
}
if (failed > 0) {
  console.error(`\npgTAP FAILED: ${failed} assertion(s) failed.`);
  process.exit(1);
}
console.log("\npgTAP OK");
