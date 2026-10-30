import { randomUUID } from "crypto";
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { runWorker } from "./spawn-worker";

// A port nothing listens on -- a real, immediate connection failure
// (ECONNREFUSED), not a slow timeout. Run in its own spawned process (see
// spawn-worker.ts/child-worker.ts) rather than against the shared `prisma`
// singleton this same test run's other files are actively using, so a
// deliberately-broken connection here can't affect them.
const UNREACHABLE_DATABASE_URL = "postgres://postgres:postgres@127.0.0.1:59999/nonexistent?sslmode=disable";

describe("checkRateLimit — database connection failure behavior", () => {
  test("fail-closed: an unreachable store denies the request rather than silently allowing it", async () => {
    const [result] = await runWorker({
      databaseUrl: UNREACHABLE_DATABASE_URL,
      key: `db-failure:${randomUUID()}`,
      limit: 10,
      windowMs: 10 * 60_000,
      failMode: "fail-closed",
      requestCount: 1,
    });

    assert.equal(result.allowed, false, "login/password-reset style endpoints must not fail open on a DB outage");
    assert.ok(
      Number.isInteger(result.retryAfterSeconds) && result.retryAfterSeconds > 0 && result.retryAfterSeconds <= 60,
      `expected a small bounded Retry-After (1-60s) on a DB failure, got ${result.retryAfterSeconds}`,
    );
  });

  test("fail-open: an unreachable store allows the request through, for non-auth endpoints", async () => {
    const [result] = await runWorker({
      databaseUrl: UNREACHABLE_DATABASE_URL,
      key: `db-failure:${randomUUID()}`,
      limit: 10,
      windowMs: 60_000,
      failMode: "fail-open",
      requestCount: 1,
    });

    assert.equal(result.allowed, true, "contact/scan/verify style endpoints should degrade open on a DB outage");
    assert.equal(result.retryAfterSeconds, 0);
  });
});
