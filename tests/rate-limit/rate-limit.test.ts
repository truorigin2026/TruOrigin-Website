import { randomUUID } from "crypto";
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit, rateLimitResponse } from "../../lib/rate-limit";

// A fresh, unused key per test case (not per file) -- the shared isolated
// test database persists rows across test cases in the same run, and a
// real route's key is exactly this shape ("routeName:identifier"), so
// reusing that shape here keeps these tests representative.
function freshKey(label: string) {
  return `${label}:${randomUUID()}`;
}

describe("checkRateLimit — fixed-window behavior", () => {
  test("requests below the limit are all allowed", async () => {
    const key = freshKey("below-limit");
    for (let i = 0; i < 3; i += 1) {
      const result = await checkRateLimit(key, 5, 60_000, "fail-open");
      assert.equal(result.allowed, true, `request ${i + 1} of 3 (limit 5) should be allowed`);
      assert.equal(result.retryAfterSeconds, 0);
    }
  });

  test("requests reaching the limit are allowed; the next one is denied", async () => {
    const key = freshKey("at-limit");
    const limit = 3;
    for (let i = 0; i < limit; i += 1) {
      const result = await checkRateLimit(key, limit, 60_000, "fail-open");
      assert.equal(result.allowed, true, `request ${i + 1} of ${limit} should be allowed`);
    }
    const overLimit = await checkRateLimit(key, limit, 60_000, "fail-open");
    assert.equal(overLimit.allowed, false, "the (limit + 1)th request should be denied");
    assert.ok(overLimit.retryAfterSeconds > 0, "a denied request must report a positive retryAfterSeconds");
  });

  test("window expiration resets the count", async () => {
    const key = freshKey("window-reset");
    const limit = 2;
    const windowMs = 300;

    assert.equal((await checkRateLimit(key, limit, windowMs, "fail-open")).allowed, true);
    assert.equal((await checkRateLimit(key, limit, windowMs, "fail-open")).allowed, true);
    assert.equal(
      (await checkRateLimit(key, limit, windowMs, "fail-open")).allowed,
      false,
      "third request within the same 300ms window should be denied",
    );

    await new Promise((resolve) => setTimeout(resolve, windowMs + 100));

    const afterReset = await checkRateLimit(key, limit, windowMs, "fail-open");
    assert.equal(afterReset.allowed, true, "a request after the window has elapsed should start a fresh window");
  });

  test("concurrent requests on the same key never exceed the limit (atomicity)", async () => {
    // The whole point of moving off the in-memory Map: a naive
    // read-then-write under concurrency can let more than `limit` requests
    // through if two requests both read a stale "below limit" count before
    // either writes its increment back. Firing far more requests than the
    // limit, all at once, at the same key is exactly the scenario that
    // would expose that bug.
    const key = freshKey("concurrent");
    const limit = 10;
    const totalRequests = 40;

    const results = await Promise.all(
      Array.from({ length: totalRequests }, () => checkRateLimit(key, limit, 60_000, "fail-open")),
    );

    const allowedCount = results.filter((r) => r.allowed).length;
    assert.equal(
      allowedCount,
      limit,
      `exactly ${limit} of ${totalRequests} concurrent requests should be allowed, got ${allowedCount}`,
    );
  });

  test("different identifiers (users/IPs) and different route prefixes don't interfere", async () => {
    const suffix = randomUUID();
    const userA = `login:${suffix}-A`;
    const userB = `login:${suffix}-B`;
    const limit = 2;

    // Exhaust user A's bucket entirely.
    await checkRateLimit(userA, limit, 60_000, "fail-open");
    await checkRateLimit(userA, limit, 60_000, "fail-open");
    const userADenied = await checkRateLimit(userA, limit, 60_000, "fail-open");
    assert.equal(userADenied.allowed, false, "user A should now be rate-limited");

    // User B, a different identifier, must be completely unaffected.
    const userBResult = await checkRateLimit(userB, limit, 60_000, "fail-open");
    assert.equal(userBResult.allowed, true, "a different identifier must have its own independent bucket");

    // Same identifier, different route prefix ("contact" vs "login") must
    // also be independent -- this is exactly how real call sites compose
    // keys (`login:${ip}`, `contact:${ip}`, etc. all sharing the same ip).
    const sameIpOtherRoute = await checkRateLimit(`contact:${suffix}-A`, limit, 60_000, "fail-open");
    assert.equal(
      sameIpOtherRoute.allowed,
      true,
      "the same identifier under a different route prefix must have its own independent bucket",
    );
  });

  test("Retry-After is a positive integer consistent with the remaining window, and reaches the real 429 response", async () => {
    const key = freshKey("retry-after");
    const limit = 1;
    const windowMs = 10_000;

    await checkRateLimit(key, limit, windowMs, "fail-open"); // consumes the only allowed request
    const denied = await checkRateLimit(key, limit, windowMs, "fail-open");

    assert.equal(denied.allowed, false);
    assert.ok(Number.isInteger(denied.retryAfterSeconds), "retryAfterSeconds must be a whole number of seconds");
    // Called immediately after the window started, so the remaining time
    // should be close to the full 10s window, with generous slack for
    // test-runner scheduling jitter.
    assert.ok(
      denied.retryAfterSeconds > 0 && denied.retryAfterSeconds <= 10,
      `expected retryAfterSeconds in (0, 10], got ${denied.retryAfterSeconds}`,
    );

    const response = rateLimitResponse(denied.retryAfterSeconds);
    assert.equal(response.status, 429);
    assert.equal(response.headers.get("Retry-After"), String(denied.retryAfterSeconds));
    const body = await response.json();
    assert.equal(body.error, "Too many requests. Please try again later.");
  });
});
