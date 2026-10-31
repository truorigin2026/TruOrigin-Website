// Orchestrates the Phase D.3 authorization-guard regression suite.
//
// No server is started here. /api/upload's guard (requireBrandSession,
// lib/api-auth.ts) takes a plain NextRequest and has no dependency on an
// actual running server, so its route handler (the exported POST
// function) is called directly with a hand-built NextRequest -- the same
// thing an HTTP request to it would produce, without needing one.
// /account's guard (requireBrandUser, lib/session.ts) does depend on
// next/headers' cookies(), which only works inside a real Next.js
// request -- next/headers and next/navigation are mocked via node:test's
// built-in module mocking (--experimental-test-module-mocks) instead, so
// the page's own default-exported component can be called directly too.
//
// Same disposable-Postgres approach as tests/rate-limit/ and
// tests/claims-visibility/ (embedded-postgres + `prisma migrate deploy`
// against the real migration history) -- never the shared dev/production
// database.
import EmbeddedPostgres from "embedded-postgres";
import { existsSync, mkdirSync } from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");

const PORT = 54332;
const DATA_DIR = path.join(os.tmpdir(), "truorigin-auth-guard-test-pg");
const DATABASE_URL = `postgres://postgres:postgres@127.0.0.1:${PORT}/postgres?sslmode=disable`;

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
      env: { ...process.env, DATABASE_URL, DIRECT_URL: DATABASE_URL },
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.on("close", (code) => resolve(code ?? 1));
  });
}

function runTests(): Promise<number> {
  const testFile = path.resolve(__dirname, "auth-guard-consistency.test.ts");
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      ["--experimental-test-module-mocks", "--import", "tsx", "--test", testFile],
      {
        cwd: PROJECT_ROOT,
        // BLOB_READ_WRITE_TOKEN must NEVER be inherited here: the "valid
        // upload" scenario deliberately submits a real file far enough
        // to prove authorization passed, and relies on the Blob call
        // itself failing cleanly (uploadFile() throws "storage is not
        // configured") specifically BECAUSE no token is present. With
        // .env's real token inherited, that scenario instead performs a
        // genuine upload to the real production Blob store -- confirmed
        // this directly happened once before this line was added.
        env: { ...process.env, DATABASE_URL, DIRECT_URL: DATABASE_URL, BLOB_READ_WRITE_TOKEN: "" },
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
  console.log(`[auth-guard tests] Disposable local Postgres ready at ${DATABASE_URL}`);

  try {
    const migrateCode = await runToCompletion("npx", ["prisma", "migrate", "deploy"]);
    if (migrateCode !== 0) {
      throw new Error(`prisma migrate deploy exited with code ${migrateCode}`);
    }
    process.exitCode = await runTests();
  } finally {
    await pg.stop();
  }
}

main();
