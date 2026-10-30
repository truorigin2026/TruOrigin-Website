import { randomUUID } from "crypto";
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { runWorker } from "./spawn-worker";

// register-env.ts (loaded via --import before this file) has already
// validated and resolved DATABASE_URL to the isolated test database --
// reuse that same value here rather than re-deriving/re-validating it.
const TEST_DATABASE_URL = process.env.DATABASE_URL!;

describe("checkRateLimit — shared across independent processes", () => {
  test("two independently started processes hitting the same key share one counter, not one each", async () => {
    const key = `multi-process:${randomUUID()}`;
    const limit = 10;
    const windowMs = 60_000;
    const requestsPerProcess = 15; // > limit on its own, and 2x that combined

    // Launched together, not sequentially -- this is the scenario the old
    // in-memory Map implementation could never pass: each process would
    // have had its own private Map, so each would independently allow up
    // to `limit` requests through, for 2x`limit` allowed overall instead
    // of `limit`.
    const [resultsA, resultsB] = await Promise.all([
      runWorker({ databaseUrl: TEST_DATABASE_URL, key, limit, windowMs, failMode: "fail-open", requestCount: requestsPerProcess }),
      runWorker({ databaseUrl: TEST_DATABASE_URL, key, limit, windowMs, failMode: "fail-open", requestCount: requestsPerProcess }),
    ]);

    const totalAllowed = [...resultsA, ...resultsB].filter((r) => r.allowed).length;
    assert.equal(
      totalAllowed,
      limit,
      `expected exactly ${limit} allowed across BOTH processes combined (${requestsPerProcess} requests each, ` +
        `${requestsPerProcess * 2} total), got ${totalAllowed} -- a per-process counter would show up to ${limit * 2} here`,
    );
  });

  test("two independent processes using different keys remain fully isolated from each other", async () => {
    const suffix = randomUUID();
    const limit = 3;
    const windowMs = 60_000;

    const [resultsA, resultsB] = await Promise.all([
      runWorker({
        databaseUrl: TEST_DATABASE_URL,
        key: `proc-isolation:${suffix}-A`,
        limit,
        windowMs,
        failMode: "fail-open",
        requestCount: 5,
      }),
      runWorker({
        databaseUrl: TEST_DATABASE_URL,
        key: `proc-isolation:${suffix}-B`,
        limit,
        windowMs,
        failMode: "fail-open",
        requestCount: 5,
      }),
    ]);

    assert.equal(resultsA.filter((r) => r.allowed).length, limit, "process A's own key should hit its own limit");
    assert.equal(resultsB.filter((r) => r.allowed).length, limit, "process B's own key should hit its own limit");
  });
});
