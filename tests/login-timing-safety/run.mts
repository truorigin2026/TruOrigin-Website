// Orchestrates the Phase D.4 login-timing-safety regression suite.
//
// No server is started: the login route's exported POST function is a
// plain NextRequest -> NextResponse handler with no dependency on an
// actual running server or on next/headers/next/navigation, so it's
// called directly with hand-built requests. Proving the dummy bcrypt
// comparison actually executes uses a Module.prototype.require patch
// (not node:test's ESM-only mock.module -- confirmed directly that
// esbuild/tsx compiles the route's default import of the CJS-only
// bcryptjs package down to a require() call that mock.module can't see
// at all) to wrap bcryptjs's `compare` with a call-recording spy that
// still delegates to the real implementation.
//
// Same disposable-Postgres approach as the other Phase D test suites
// (embedded-postgres + a real `prisma migrate deploy`) -- never the
// shared dev/production database.
//
// Phase D.7: environment construction and database-target validation
// now go through lib/test-env-guard.ts instead of this file's own inline
// clearing.
import EmbeddedPostgres from "embedded-postgres";
import { existsSync, mkdirSync } from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import { assertDisposablePostgresTarget, buildDisposableTestEnv } from "../../lib/test-env-guard";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");

const PORT = 54333;
const DATA_DIR = path.join(os.tmpdir(), "truorigin-login-timing-test-pg");
const DATABASE_URL = `postgres://postgres:postgres@127.0.0.1:${PORT}/postgres?sslmode=disable`;
assertDisposablePostgresTarget(DATABASE_URL, DATABASE_URL);

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: "postgres",
  password: "postgres",
  port: PORT,
  persistent: true,
});

function runToCompletion(command: string, args: string[]): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: PROJECT_ROOT,
      env: buildDisposableTestEnv(DATABASE_URL),
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.on("close", (code) => resolve(code ?? 1));
  });
}

function runTests(): Promise<number> {
  const testFile = path.resolve(__dirname, "login-timing-safety.test.ts");
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      ["--import", "tsx", "--test", testFile],
      {
        cwd: PROJECT_ROOT,
        env: buildDisposableTestEnv(DATABASE_URL),
        stdio: "inherit",
      },
    );
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
  console.log(`[login-timing tests] Disposable local Postgres ready at ${DATABASE_URL}`);

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
