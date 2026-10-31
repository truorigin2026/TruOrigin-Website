// Regression coverage for the Phase D.4 fix: the "no such user" branch
// in app/api/auth/login/route.ts now runs a dummy bcrypt comparison
// before returning, instead of returning instantly -- closing the
// timing side-channel Phase D.1 found (an existing email always paid
// bcrypt.compare's real cost; a nonexistent one never did, making
// response time alone a signal for which emails are registered).
//
// POST is called directly with hand-built NextRequests -- it has no
// dependency on an actual running server, next/headers, or
// next/navigation.
//
// Proving the dummy comparison actually executes needs a spy on
// bcryptjs's `compare`. node:test's ESM-only module mocking
// (mock.module) cannot see it: confirmed directly that esbuild/tsx
// compiles login/route.ts's `import bcrypt from "bcryptjs"` (a default
// import of a CJS-only package) down to a synthesized
// `createRequire(...)("bcryptjs")` call, which goes through Node's CJS
// module loader entirely -- a separate mechanism from the ESM loader
// mock.module patches, so it never sees the substitution. Patching
// Module.prototype.require directly (the standard technique for
// intercepting CJS require() calls, same idea as libraries like
// proxyquire) does reach it, confirmed directly the same way.
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "crypto";
import Module from "node:module";
import { NextRequest } from "next/server";

let compareCalls: { password: string; hash: string }[] = [];

let prisma: typeof import("../../lib/prisma").prisma;
let bcryptHashSync: typeof import("bcryptjs").hashSync;
let loginPOST: typeof import("../../app/api/auth/login/route").POST;

const KNOWN_PASSWORD = "CorrectHorseBattery12";
const WRONG_PASSWORD = "definitely-the-wrong-password-99";

let activeUserEmail: string;
let inactiveUserEmail: string;

type NodeRequire = (id: string, ...rest: unknown[]) => unknown;
let originalRequire: NodeRequire;

before(async () => {
  const bcryptReal = await import("bcryptjs");
  const realCompare = bcryptReal.compare;
  bcryptHashSync = bcryptReal.hashSync;

  const spiedCompare = async (password: string, hash: string) => {
    compareCalls.push({ password, hash });
    return realCompare(password, hash);
  };

  originalRequire = (Module.prototype as unknown as { require: NodeRequire }).require;
  (Module.prototype as unknown as { require: NodeRequire }).require = function (
    this: unknown,
    id: string,
    ...rest: unknown[]
  ) {
    const real = originalRequire.call(this, id, ...rest) as Record<string, unknown>;
    return id === "bcryptjs" ? { ...real, compare: spiedCompare } : real;
  };

  ({ prisma } = await import("../../lib/prisma"));
  ({ POST: loginPOST } = await import("../../app/api/auth/login/route"));

  const brand = await prisma.brand.create({
    data: { slug: `zzz-login-timing-${randomUUID()}`, name: "ZZZ Login Timing Brand", status: "ACTIVE" },
  });

  activeUserEmail = `zzz-active-${randomUUID()}@example.com`;
  await prisma.user.create({
    data: {
      email: activeUserEmail,
      passwordHash: bcryptHashSync(KNOWN_PASSWORD, 12),
      role: "BRAND",
      active: true,
      brandId: brand.id,
      brandRole: "OWNER",
    },
  });

  inactiveUserEmail = `zzz-inactive-${randomUUID()}@example.com`;
  await prisma.user.create({
    data: {
      email: inactiveUserEmail,
      passwordHash: bcryptHashSync(KNOWN_PASSWORD, 12),
      role: "BRAND",
      active: false,
      brandId: brand.id,
      brandRole: "OWNER",
    },
  });
});

after(async () => {
  (Module.prototype as unknown as { require: NodeRequire }).require = originalRequire;
  await prisma.user.deleteMany({ where: { email: { contains: "zzz-" } } }).catch(() => {});
  await prisma.brand.deleteMany({ where: { slug: { contains: "zzz-login-timing-" } } }).catch(() => {});
  await prisma.$disconnect();
});

// Random, not a simple incrementing counter: the embedded Postgres data
// directory is persistent across separate runs of this suite (see
// run.mts), so a counter restarting from 0 every process risks reusing
// an IP whose rate-limit bucket a PREVIOUS run already exhausted,
// confirmed directly to make the rate-limit test pass for the wrong
// reason (1 request instead of 11 before the first 429).
function freshIp() {
  return `10.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

function loginRequest(email: string | undefined, password: string | undefined, ip = freshIp()) {
  return new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify({ email, password }),
  });
}

describe("login timing safety — no early return without a bcrypt comparison", () => {
  test("nonexistent email returns 401 with the generic invalid-credentials body", async () => {
    const response = await loginPOST(loginRequest(`zzz-nonexistent-${randomUUID()}@example.com`, WRONG_PASSWORD));
    assert.equal(response.status, 401);
    const body = await response.json();
    assert.deepEqual(body, { error: "Invalid email or password." });
  });

  test("existing email with an incorrect password returns 401 with the generic invalid-credentials body", async () => {
    const response = await loginPOST(loginRequest(activeUserEmail, WRONG_PASSWORD));
    assert.equal(response.status, 401);
    const body = await response.json();
    assert.deepEqual(body, { error: "Invalid email or password." });
  });

  test("the nonexistent-email response is byte-for-byte identical in status and body to the wrong-password response", async () => {
    const nonexistent = await loginPOST(loginRequest(`zzz-nonexistent-${randomUUID()}@example.com`, WRONG_PASSWORD));
    const wrongPassword = await loginPOST(loginRequest(activeUserEmail, WRONG_PASSWORD));

    assert.equal(nonexistent.status, wrongPassword.status);
    assert.deepEqual(await nonexistent.json(), await wrongPassword.json());
  });

  test("the dummy bcrypt comparison actually executes for a nonexistent email (not just a fast path)", async () => {
    compareCalls = [];
    const password = `probe-password-${randomUUID()}`;
    await loginPOST(loginRequest(`zzz-nonexistent-${randomUUID()}@example.com`, password));

    assert.equal(compareCalls.length, 1, "bcrypt.compare must be called exactly once for a nonexistent email");
    assert.equal(compareCalls[0].password, password);
    // Never the real passwordHash of any seeded user -- a fixed, constant
    // dummy hash, confirmed by it never matching a real user's hash.
    const realHashes = await prisma.user.findMany({
      where: { email: { in: [activeUserEmail, inactiveUserEmail] } },
      select: { passwordHash: true },
    });
    assert.ok(!realHashes.some((u) => u.passwordHash === compareCalls[0].hash), "the dummy hash must never equal a real user's passwordHash");
  });

  test("existing email with the correct password logs in successfully", async () => {
    const response = await loginPOST(loginRequest(activeUserEmail, KNOWN_PASSWORD));
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.ok, true);
    assert.ok(response.headers.get("set-cookie")?.includes("truorigin_session="));
  });

  test("an inactive user with the correct password is rejected as suspended, not treated as invalid credentials", async () => {
    const response = await loginPOST(loginRequest(inactiveUserEmail, KNOWN_PASSWORD));
    assert.equal(response.status, 403);
    const body = await response.json();
    assert.equal(body.error, "This account has been suspended.");
  });

  test("repeated failed attempts from the same IP are eventually rate-limited", async () => {
    const ip = freshIp();
    const email = `zzz-nonexistent-${randomUUID()}@example.com`;
    let lastStatus = 0;
    for (let i = 0; i < 11; i += 1) {
      const response = await loginPOST(loginRequest(email, WRONG_PASSWORD, ip));
      lastStatus = response.status;
      if (lastStatus === 429) break;
    }
    assert.equal(lastStatus, 429, "the 11th attempt from the same IP within the login limit (10/10min) must be rate-limited");
  });

  test("rate limiting is unaffected by this fix: a fresh IP is not rate-limited after another IP was", async () => {
    const response = await loginPOST(loginRequest(`zzz-nonexistent-${randomUUID()}@example.com`, WRONG_PASSWORD, freshIp()));
    assert.notEqual(response.status, 429);
  });
});
