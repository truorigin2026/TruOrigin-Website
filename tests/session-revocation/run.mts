// Orchestrates the Phase D.5 session-revocation regression suite.
//
// No server is started. The auth API routes (login, logout, reset-
// password, brand password change, admin reset-password-send) are
// plain NextRequest -> NextResponse handlers called directly with
// hand-built requests. requireBrandUser/requireAdminUser (lib/session.ts)
// depend on next/headers' cookies() and next/navigation's redirect(),
// which only work inside a real Next.js request -- mocked here via
// node:test's module mocking (--experimental-test-module-mocks),
// confirmed in Phase D.3 to correctly intercept these two genuinely-ESM
// Next.js packages (unlike bcryptjs in Phase D.4, which needed a
// different technique because esbuild compiles its CJS default import
// down to a require() call mock.module can't see).
//
// Same disposable-Postgres approach as every other Phase D test suite
// (embedded-postgres + a real `prisma migrate deploy`, including the new
// sessionVersion migration from this phase) -- never the shared dev/
// production database.
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

const PORT = 54334;
const DATA_DIR = path.join(os.tmpdir(), "truorigin-session-revocation-test-pg");
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
  const testFile = path.resolve(__dirname, "session-revocation.test.ts");
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      ["--experimental-test-module-mocks", "--import", "tsx", "--test", testFile],
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
  console.log(`[session-revocation tests] Disposable local Postgres ready at ${DATABASE_URL}`);

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
