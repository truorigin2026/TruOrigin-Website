/**
 * Centralized production-safety guard for the disposable-Postgres test
 * orchestrators (each test suite's own run.mts). Phase D.7.
 * ----------------------------------------------------------------------
 * Built after inspecting all five existing orchestrators directly and
 * confirming they do NOT all behave the same way: tests/rate-limit and
 * tests/claims-visibility (written before the incident below) clear
 * nothing at all; tests/auth-guard-consistency clears only
 * BLOB_READ_WRITE_TOKEN; tests/login-timing-safety and
 * tests/session-revocation clear all four sensitive keys but none of
 * the five ever positively validates that the database URL they're
 * about to use is actually the disposable instance they just started,
 * either before running or before cleanup.
 *
 * The incident this exists to make structurally impossible to repeat:
 * tests/auth-guard-consistency's "valid upload" scenario, before this
 * module existed, inherited a real BLOB_READ_WRITE_TOKEN from the host
 * shell's .env and performed one genuine (small, harmless) upload to
 * production Vercel Blob storage before it was caught.
 *
 * Two deliberately separate modes (do not conflate them):
 *   - "disposable-test": the only mode enforced by this module today.
 *     Every one of the five existing suites runs in this mode -- a
 *     fresh embedded-postgres instance, started and torn down by the
 *     SAME orchestrator process, never reused across runs by a
 *     different identity, never reachable from outside localhost.
 *   - "staging-e2e": a FUTURE mode for a persistent, independently
 *     provisioned staging database that future authenticated Playwright
 *     tests will use. Its own target-validation rules belong in a later
 *     phase -- isStagingE2EModeActive() exists so that phase has a clear
 *     place to add them, but NO enforcement for it exists here yet.
 *     Setting TRUORIGIN_TEST_MODE=staging-e2e today activates no
 *     protection at all; do not mistake that absence for safety.
 */

export const TEST_MODE_ENV_VAR = "TRUORIGIN_TEST_MODE";

export type TestMode = "disposable-test" | "staging-e2e";

export function isDisposableTestModeActive(): boolean {
  return process.env[TEST_MODE_ENV_VAR] === "disposable-test";
}

export function isStagingE2EModeActive(): boolean {
  return process.env[TEST_MODE_ENV_VAR] === "staging-e2e";
}

/** True under either mode -- used by runtime guards that only need to know "is this a test run at all", not which kind. */
export function isAnyTestModeActive(): boolean {
  return isDisposableTestModeActive() || isStagingE2EModeActive();
}

// Every key that must never reach a disposable-test child process,
// regardless of what happens to be set in the parent shell's own .env.
// Centralized here specifically so a sixth future suite can't repeat
// the gap two of the five existing ones had (see the file header).
const SENSITIVE_ENV_KEYS = [
  "BLOB_READ_WRITE_TOKEN",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "CONTACT_NOTIFICATION_EMAIL",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
] as const;

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

function parseDatabaseUrl(url: string, label: string): URL {
  try {
    return new URL(url);
  } catch {
    throw new Error(`[test-env-guard] ${label} is not a valid connection URL: "${url}"`);
  }
}

/**
 * Positive validation, not a denylist: accepts a candidate database URL
 * only if its host is a loopback literal AND it matches the exact
 * host:port of the instance the calling orchestrator says it generated.
 * A URL that merely isn't on some list of known-bad production hosts is
 * not good enough -- it must actively match what was just started.
 * Throws (fail-closed) on any mismatch, missing value, or malformed URL.
 */
export function assertDisposablePostgresTarget(expectedDatabaseUrl: string, candidateDatabaseUrl: string | undefined): void {
  if (!candidateDatabaseUrl) {
    throw new Error("[test-env-guard] No database URL was provided to validate -- refusing to proceed with an unknown target.");
  }

  const candidate = parseDatabaseUrl(candidateDatabaseUrl, "the candidate database URL");
  const expected = parseDatabaseUrl(expectedDatabaseUrl, "the orchestrator's own expected database URL");

  if (!LOOPBACK_HOSTS.has(candidate.hostname)) {
    throw new Error(
      `[test-env-guard] Refusing to treat "${candidate.hostname}" as a disposable test database. ` +
        `Only a loopback host (127.0.0.1/localhost/::1) is ever accepted here -- this looks like a remote, ` +
        `possibly production, database.`,
    );
  }

  if (candidate.hostname !== expected.hostname || candidate.port !== expected.port) {
    throw new Error(
      `[test-env-guard] "${candidateDatabaseUrl}" does not match the exact disposable instance this orchestrator ` +
        `generated (expected ${expected.hostname}:${expected.port}, got ${candidate.hostname}:${candidate.port}). Refusing to proceed.`,
    );
  }
}

/**
 * Builds the environment object a disposable-test child process (the
 * test runner itself, or a `prisma migrate deploy` invocation) should
 * receive. Starts from the orchestrator's own environment -- PATH, TEMP,
 * HOME/USERPROFILE, etc. are genuinely needed for `node`/`npx` to run at
 * all, and hand-picking a safe subset of those is fragile across
 * platforms -- then authoritatively overwrites every key in
 * SENSITIVE_ENV_KEYS to an empty string, points DATABASE_URL/DIRECT_URL
 * at the validated disposable instance, and sets the test-mode marker.
 * This is the single place that clearing happens now, instead of each
 * orchestrator remembering its own (as two of the five never did, and a
 * third only partly did).
 */
export function buildDisposableTestEnv(validatedDatabaseUrl: string, extra: Record<string, string> = {}): NodeJS.ProcessEnv {
  // Re-validates even though every caller already called
  // assertDisposablePostgresTarget separately -- this function is the
  // actual last line of defense before anything is spawned, so it does
  // not trust that callers remembered to check first. The loopback-only
  // half of the check applies even without a prior "expected" value to
  // compare against.
  if (!LOOPBACK_HOSTS.has(parseDatabaseUrl(validatedDatabaseUrl, "the database URL passed to buildDisposableTestEnv").hostname)) {
    throw new Error(`[test-env-guard] buildDisposableTestEnv refuses a non-loopback database URL: "${validatedDatabaseUrl}"`);
  }

  const cleared = Object.fromEntries(SENSITIVE_ENV_KEYS.map((key) => [key, ""]));

  return {
    ...process.env,
    ...cleared,
    DATABASE_URL: validatedDatabaseUrl,
    DIRECT_URL: validatedDatabaseUrl,
    [TEST_MODE_ENV_VAR]: "disposable-test",
    ...extra,
  };
}

/**
 * Runtime-layer check for lib/prisma.ts: when disposable-test mode is
 * active, the actual DATABASE_URL this process ends up using must still
 * be a loopback host, independent of whatever the orchestrator believes
 * it passed down. This is the second, independent layer -- it does not
 * know the "expected" exact port the way assertDisposablePostgresTarget
 * does (lib/prisma.ts has no orchestrator context), only that a
 * disposable-test process must never end up pointed at a remote host.
 */
export function assertLoopbackDatabaseUrl(candidateDatabaseUrl: string): void {
  const candidate = parseDatabaseUrl(candidateDatabaseUrl, "DATABASE_URL");
  if (!LOOPBACK_HOSTS.has(candidate.hostname)) {
    throw new Error(
      `[test-env-guard] ${TEST_MODE_ENV_VAR}=disposable-test is active, but DATABASE_URL points at ` +
        `"${candidate.hostname}", not a loopback host. Refusing to connect -- this would otherwise be a ` +
        `disposable-test process talking to a remote (possibly production) database.`,
    );
  }
}
