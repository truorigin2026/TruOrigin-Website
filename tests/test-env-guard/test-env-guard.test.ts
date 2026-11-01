// Regression coverage for the Phase D.7 centralized test-environment
// guard itself (lib/test-env-guard.ts) and its two runtime-layer
// integrations (lib/blob.ts, lib/email.ts). Pure unit-level: none of
// these functions ever perform a real database query, Blob upload, or
// email send -- every guard either throws/short-circuits before
// touching the network, or is a plain string/object transformation --
// so this suite needs no embedded-postgres instance at all, unlike the
// other five.
//
// Every "production-looking" value used below is synthetic (fabricated
// hostnames/tokens that were never valid credentials for anything) --
// this suite never attempts a real connection of any kind, consistent
// with the restriction that guardrails are tested with synthetic
// credentials and disposable resources only.
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "child_process";
import path from "path";
import { pathToFileURL } from "url";
import {
  TEST_MODE_ENV_VAR,
  assertDisposablePostgresTarget,
  buildDisposableTestEnv,
  assertLoopbackDatabaseUrl,
  isDisposableTestModeActive,
} from "../../lib/test-env-guard";

const DISPOSABLE_URL = "postgres://postgres:postgres@127.0.0.1:54399/postgres?sslmode=disable";
const SYNTHETIC_REMOTE_URL = "postgres://postgres:fake-not-a-real-password@db.synthetic-example-host.invalid:5432/postgres";

describe("assertDisposablePostgresTarget — positive target validation", () => {
  test("the exact disposable URL an orchestrator generated is accepted", () => {
    assert.doesNotThrow(() => assertDisposablePostgresTarget(DISPOSABLE_URL, DISPOSABLE_URL));
  });

  test("a synthetic remote host is rejected, even though it isn't on any denylist", () => {
    assert.throws(() => assertDisposablePostgresTarget(DISPOSABLE_URL, SYNTHETIC_REMOTE_URL), /loopback host/i);
  });

  test("the right host but an unexpected port is rejected", () => {
    const wrongPort = "postgres://postgres:postgres@127.0.0.1:9999/postgres?sslmode=disable";
    assert.throws(() => assertDisposablePostgresTarget(DISPOSABLE_URL, wrongPort), /does not match the exact disposable instance/i);
  });

  test("a missing database URL is rejected", () => {
    assert.throws(() => assertDisposablePostgresTarget(DISPOSABLE_URL, undefined), /no database url was provided/i);
  });

  test("a malformed URL is rejected rather than crashing with an unrelated error", () => {
    assert.throws(() => assertDisposablePostgresTarget(DISPOSABLE_URL, "not-a-url-at-all"), /not a valid connection url/i);
  });
});

describe("assertLoopbackDatabaseUrl — the second, independent runtime layer lib/prisma.ts uses", () => {
  test("a loopback URL passes", () => {
    assert.doesNotThrow(() => assertLoopbackDatabaseUrl(DISPOSABLE_URL));
  });

  test("a synthetic remote URL is rejected", () => {
    assert.throws(() => assertLoopbackDatabaseUrl(SYNTHETIC_REMOTE_URL), /not a loopback host/i);
  });
});

describe("buildDisposableTestEnv — sensitive credentials never reach the constructed child environment", () => {
  const SENSITIVE_KEYS = ["BLOB_READ_WRITE_TOKEN", "RESEND_API_KEY", "EMAIL_FROM", "CONTACT_NOTIFICATION_EMAIL", "ADMIN_EMAIL", "ADMIN_PASSWORD"];
  const savedEnv: Record<string, string | undefined> = {};

  before(() => {
    for (const key of SENSITIVE_KEYS) {
      savedEnv[key] = process.env[key];
      // Synthetic, fabricated values standing in for whatever a real
      // .env might contain -- never real credentials for anything.
      process.env[key] = `synthetic-fake-${key.toLowerCase()}-value-never-real`;
    }
  });

  after(() => {
    for (const key of SENSITIVE_KEYS) {
      if (savedEnv[key] === undefined) delete process.env[key];
      else process.env[key] = savedEnv[key];
    }
  });

  test("a production-looking Blob token in the parent process does not reach the constructed child env", () => {
    const built = buildDisposableTestEnv(DISPOSABLE_URL);
    assert.equal(built.BLOB_READ_WRITE_TOKEN, "", "BLOB_READ_WRITE_TOKEN must be cleared, not inherited");
  });

  test("a production-looking Resend key/sender/notification address does not reach the constructed child env", () => {
    const built = buildDisposableTestEnv(DISPOSABLE_URL);
    assert.equal(built.RESEND_API_KEY, "");
    assert.equal(built.EMAIL_FROM, "");
    assert.equal(built.CONTACT_NOTIFICATION_EMAIL, "");
  });

  test("admin bootstrap credentials do not reach the constructed child env", () => {
    const built = buildDisposableTestEnv(DISPOSABLE_URL);
    assert.equal(built.ADMIN_EMAIL, "");
    assert.equal(built.ADMIN_PASSWORD, "");
  });

  test("the constructed env points DATABASE_URL/DIRECT_URL at the validated disposable instance and sets the test-mode marker", () => {
    const built = buildDisposableTestEnv(DISPOSABLE_URL);
    assert.equal(built.DATABASE_URL, DISPOSABLE_URL);
    assert.equal(built.DIRECT_URL, DISPOSABLE_URL);
    assert.equal(built[TEST_MODE_ENV_VAR], "disposable-test");
  });

  test("buildDisposableTestEnv itself refuses a non-loopback URL, independent of any prior validation by the caller", () => {
    assert.throws(() => buildDisposableTestEnv(SYNTHETIC_REMOTE_URL), /refuses a non-loopback database url/i);
  });

  test("an actually-spawned child process never sees the sensitive values either -- not just the constructed object", () => {
    const built = buildDisposableTestEnv(DISPOSABLE_URL);
    const result = spawnSync(
      process.execPath,
      ["-e", "console.log(JSON.stringify({ blob: process.env.BLOB_READ_WRITE_TOKEN, resend: process.env.RESEND_API_KEY, admin: process.env.ADMIN_EMAIL }))"],
      { env: built, encoding: "utf8" },
    );
    const seen = JSON.parse(result.stdout.trim());
    assert.equal(seen.blob, "");
    assert.equal(seen.resend, "");
    assert.equal(seen.admin, "");
  });
});

describe("runtime layer — lib/blob.ts and lib/email.ts refuse real action while disposable-test mode is active", () => {
  before(() => {
    process.env[TEST_MODE_ENV_VAR] = "disposable-test";
  });
  after(() => {
    delete process.env[TEST_MODE_ENV_VAR];
  });

  test("uploadFile() refuses unconditionally, before ever touching the file or the network", async () => {
    const { uploadFile } = await import("../../lib/blob");
    // A bare stub, not a real File -- uploadFile() must throw before
    // ever calling any File/Blob method on it.
    const fakeFile = {} as unknown as File;
    await assert.rejects(uploadFile(fakeFile, "zzz-test-folder"), /disposable-test.*is active/i);
  });

  test("sendEmail() returns a blocked result without ever calling fetch", async () => {
    const originalFetch = global.fetch;
    let fetchCalled = false;
    global.fetch = (async (...args: Parameters<typeof fetch>) => {
      fetchCalled = true;
      return originalFetch(...args);
    }) as typeof fetch;

    try {
      const { sendEmail } = await import("../../lib/email");
      const result = await sendEmail({ to: "zzz-synthetic@example.com", subject: "test", body: "test" });
      assert.equal(result.sent, false);
      assert.match(result.reason ?? "", /disposable-test.*is active/i);
      assert.equal(fetchCalled, false, "sendEmail() must never call fetch while disposable-test mode is active");
    } finally {
      global.fetch = originalFetch;
    }
  });
});

describe("runtime layer — normal (non-test) behavior is unaffected when the marker is absent", () => {
  test("isDisposableTestModeActive() is false with no marker set", () => {
    delete process.env[TEST_MODE_ENV_VAR];
    assert.equal(isDisposableTestModeActive(), false);
  });

  test("uploadFile() falls through to its normal (pre-existing) checks, not the test-mode refusal, when the marker is absent", async () => {
    delete process.env[TEST_MODE_ENV_VAR];
    const originalToken = process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.BLOB_READ_WRITE_TOKEN;
    try {
      const { uploadFile } = await import("../../lib/blob");
      const fakePngFile = {
        type: "image/png",
        size: 10,
        slice: () => ({ arrayBuffer: async () => new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).buffer }),
      } as unknown as File;
      await assert.rejects(uploadFile(fakePngFile, "zzz-test-folder"), /storage is not configured/i);
    } finally {
      if (originalToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
      else process.env.BLOB_READ_WRITE_TOKEN = originalToken;
    }
  });

  test("sendEmail() falls through to its normal (pre-existing) no-op, not the test-mode message, when the marker is absent", () => {
    // lib/email.ts captures RESEND_API_KEY as a module-level const at
    // import time, not re-read per call -- a fresh child process (rather
    // than a dynamic re-import in this already-running one, which could
    // reuse an earlier test's cached module instance and its
    // already-captured value) is the only way to prove this
    // deterministically, independent of this file's own import order.
    // Needs --import tsx (lib/email.ts is TypeScript) and a file:// URL
    // for the dynamic import so it resolves correctly on Windows.
    const emailModuleUrl = pathToFileURL(path.resolve(process.cwd(), "lib/email.ts")).href;
    const script = `
      const mod = await import(${JSON.stringify(emailModuleUrl)});
      // This exact inline (--input-type=module -e) invocation style,
      // confirmed directly, nests named exports under .default instead
      // of exposing them directly -- unlike importing a real .ts file
      // from elsewhere in the project, which doesn't. Handling both
      // shapes keeps this robust to that quirk either way.
      const sendEmail = mod.sendEmail ?? mod.default.sendEmail;
      const result = await sendEmail({ to: "zzz-synthetic@example.com", subject: "test", body: "test" });
      console.log(JSON.stringify(result));
    `;
    const result = spawnSync(process.execPath, ["--import", "tsx", "--input-type=module", "-e", script], {
      cwd: process.cwd(),
      env: { ...process.env, RESEND_API_KEY: "" },
      encoding: "utf8",
    });
    assert.equal(result.status, 0, `child process failed: ${result.stderr}`);
    const parsed = JSON.parse(result.stdout.trim());
    assert.equal(parsed.sent, false);
    assert.equal(parsed.reason, "RESEND_API_KEY is not configured");
  });
});

describe("cleanup-time re-validation (the pattern every orchestrator's run.mts now applies before pg.stop())", () => {
  test("a target that was valid at setup but mutated before cleanup is rejected, not silently cleaned up anyway", () => {
    // Simulates exactly what each run.mts does: validate once at setup,
    // then validate AGAIN right before cleanup. If something between
    // those two points changed what DATABASE_URL resolves to, the
    // second check must catch it even though the first one passed.
    const expected = DISPOSABLE_URL;
    assert.doesNotThrow(() => assertDisposablePostgresTarget(expected, expected), "setup-time check passes");

    const mutatedBeforeCleanup = SYNTHETIC_REMOTE_URL;
    assert.throws(
      () => assertDisposablePostgresTarget(expected, mutatedBeforeCleanup),
      /loopback host/i,
      "cleanup-time re-check must still catch a target that changed after setup",
    );
  });
});
