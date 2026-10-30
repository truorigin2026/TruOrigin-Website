// Orchestrates the whole rate-limit test run: starts a real, disposable
// local Postgres instance (via `embedded-postgres` -- a genuine Postgres
// binary, not an in-memory fake), bootstraps the one table these tests
// need, runs every *.test.ts file as a single `node --test` child process
// against it, then always stops the server again. This is the entry point
// `npm run test:rate-limit` actually calls.
//
// Why a *real* Postgres and not Prisma's own built-in `prisma dev` (which
// is PGlite/WASM-backed): verified directly that PGlite in this setup
// cannot sustain even two truly concurrent raw queries over the same
// connection (every concurrent $queryRaw call failed with
// "ConnectionClosed") -- useless for testing the one property this whole
// feature exists to prove (atomic behavior *under concurrency*). A real
// Postgres binary handles real concurrent connections, which is the whole
// point.
//
// Why not the shared production database: this suite fires genuinely
// concurrent and deliberately-failing requests at the rate limiter, which
// is exactly the kind of load this project's "no separate test database"
// rule (see tests/e2e/README.md) exists to keep away from production.
// This database is 100% disposable and never touches it.
import EmbeddedPostgres from "embedded-postgres";
import { existsSync, mkdirSync, readFileSync, readdirSync } from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = 54329;
const DATA_DIR = path.join(os.tmpdir(), "truorigin-rate-limit-test-pg");
const DATABASE_URL = `postgres://postgres:postgres@127.0.0.1:${PORT}/postgres?sslmode=disable`;

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: "postgres",
  password: "postgres",
  port: PORT,
  // Deliberately not deleted on stop (see the `finally` below): on
  // Windows, embedded-postgres's own delete-on-stop path can hit EBUSY
  // ("resource busy") because the OS hasn't released the server process's
  // file handles yet at the instant `stop()` returns -- confirmed directly
  // while building this suite. Reusing the same on-disk cluster across
  // runs also means only the first run ever pays Postgres's ~2s initdb
  // cost; every run after that just starts/stops an existing cluster.
  persistent: true,
});

async function ensureSchema() {
  const migrationPath = path.resolve(
    __dirname,
    "../../prisma/migrations/20261030000000_add_rate_limit_bucket/migration.sql",
  );
  const migrationSql = readFileSync(migrationPath, "utf8");

  const client = pg.getPgClient();
  await client.connect();
  try {
    for (const statement of migrationSql
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean)) {
      // Not anchored to the start of the string: each chunk still carries
      // its leading "-- CreateTable"/"-- CreateIndex" comment line from
      // the migration file.
      const idempotent = statement
        .replace(/CREATE TABLE(?! IF NOT EXISTS)/i, "CREATE TABLE IF NOT EXISTS")
        .replace(/CREATE INDEX(?! IF NOT EXISTS)/i, "CREATE INDEX IF NOT EXISTS");
      await client.query(idempotent);
    }
  } finally {
    await client.end();
  }
}

function runTests(): Promise<number> {
  const testFiles = readdirSync(__dirname)
    .filter((f) => f.endsWith(".test.ts"))
    .map((f) => path.resolve(__dirname, f));

  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["--import", "tsx", "--test", ...testFiles], {
      env: { ...process.env, DATABASE_URL },
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
  console.log(`[rate-limit tests] Disposable local Postgres ready at ${DATABASE_URL}`);

  try {
    await ensureSchema();
    process.exitCode = await runTests();
  } finally {
    await pg.stop();
  }
}

main();
