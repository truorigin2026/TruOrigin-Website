// Orchestrates the claim-visibility regression suite: starts a real,
// disposable local Postgres instance (via `embedded-postgres` -- same
// approach as tests/rate-limit/run.mts, for the same reason: a genuine
// Postgres binary, not a mock), applies the project's real migration
// history to it with `prisma migrate deploy` (so the schema is byte-for-
// byte what production runs, not a hand-picked subset of tables), seeds a
// fixture product carrying one claim of each ClaimStatus, runs the test
// file against it, then always tears the whole thing down.
//
// Why not the shared dev/production database: tests/e2e/README.md's
// "there is no separate test database" rule explicitly requires every
// test under tests/e2e/ to stay read-only and never create/edit/delete a
// product or brand there. Proving "an UNVERIFIED claim is never publicly
// returned" needs a product that actually HAS an unverified claim sitting
// next to a verified one -- fixture data this suite controls precisely,
// on a database that's 100% disposable and never touches the real one.
// Phase D.7: environment construction and database-target validation
// now go through lib/test-env-guard.ts -- confirmed directly that this
// suite, like tests/rate-limit, was written before the Phase D.3
// incident and cleared none of BLOB_READ_WRITE_TOKEN/RESEND_API_KEY/
// ADMIN_EMAIL/ADMIN_PASSWORD. Its own test files don't call Blob/email
// either, but see tests/rate-limit/run.mts for why that was never the
// point of centralizing this.
import EmbeddedPostgres from "embedded-postgres";
import { existsSync, mkdirSync } from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import { assertDisposablePostgresTarget, buildDisposableTestEnv } from "../../lib/test-env-guard";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");

const PORT = 54330;
const DATA_DIR = path.join(os.tmpdir(), "truorigin-claims-visibility-test-pg");
const DATABASE_URL = `postgres://postgres:postgres@127.0.0.1:${PORT}/postgres?sslmode=disable`;
assertDisposablePostgresTarget(DATABASE_URL, DATABASE_URL);

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: "postgres",
  password: "postgres",
  port: PORT,
  // Same reasoning as tests/rate-limit/run.mts: on Windows, deleting the
  // data dir immediately after stop() can hit EBUSY before the OS
  // releases the server process's file handles. Reusing the cluster
  // across runs also means only the first run pays initdb's cost.
  persistent: true,
});

function runToCompletion(command: string, args: string[]): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: PROJECT_ROOT,
      // prisma.config.ts points the migrate CLI's datasource at
      // DIRECT_URL specifically (Supabase's non-pooled connection, kept
      // separate from DATABASE_URL for app runtime queries) -- confirmed
      // directly that overriding only DATABASE_URL here left DIRECT_URL
      // as whatever was in .env, and `prisma migrate deploy` tried to
      // reach the real production Supabase host as a result. Both must
      // point at the disposable instance so migrate deploy can never
      // reach anything else, regardless of which one a given Prisma CLI
      // version or config path consults.
      env: buildDisposableTestEnv(DATABASE_URL),
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.on("close", (code) => resolve(code ?? 1));
  });
}

function runTests(): Promise<number> {
  const testFile = path.resolve(__dirname, "claims-visibility.test.ts");
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["--import", "tsx", "--test", testFile], {
      cwd: PROJECT_ROOT,
      env: buildDisposableTestEnv(DATABASE_URL),
      stdio: "inherit",
    });
    child.on("close", (code) => resolve(code ?? 1));
  });
}

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });
  const alreadyInitialised = existsSync(path.join(DATA_DIR, "PG_VERSION"));
  if (!alreadyInitialised) {
    await pg.initialise();
  }
  await pg.start();
  console.log(`[claims-visibility tests] Disposable local Postgres ready at ${DATABASE_URL}`);

  try {
    const migrateCode = await runToCompletion("npx", ["prisma", "migrate", "deploy"]);
    if (migrateCode !== 0) {
      throw new Error(`prisma migrate deploy exited with code ${migrateCode}`);
    }
    process.exitCode = await runTests();
  } finally {
    // Re-validated immediately before cleanup (Phase D.7) -- see
    // tests/rate-limit/run.mts's identical comment for why.
    assertDisposablePostgresTarget(DATABASE_URL, DATABASE_URL);
    await pg.stop();
  }
}

main();
