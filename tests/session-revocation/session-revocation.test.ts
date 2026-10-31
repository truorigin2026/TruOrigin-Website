// Regression coverage for the Phase D.5 session-revocation architecture:
// a User.sessionVersion counter, embedded in every JWT at sign time and
// compared against the account's current value by every DB-backed
// guard. Bumping it (password change, password reset, an admin-
// triggered reset) invalidates every OTHERWISE-still-valid token for
// that user immediately, without a per-session record.
//
// next/headers and next/navigation are mocked (node:test's module
// mocking, confirmed in Phase D.3 to correctly intercept these two
// genuinely-ESM Next.js packages) so requireBrandUser/requireAdminUser
// (lib/session.ts), which depend on an actual Next.js request context,
// can be called directly. The API route handlers (login, logout,
// reset-password, brand password change, admin reset-password-send)
// take a plain NextRequest and are called directly with no mocking and
// no server.
let mockCookieValue: string | null = null;
import { test, describe, before, after, mock } from "node:test";
mock.module("next/headers", {
  namedExports: {
    cookies: async () => ({ get: () => (mockCookieValue ? { value: mockCookieValue } : undefined) }),
  },
});
mock.module("next/navigation", {
  namedExports: {
    redirect: (destination: string) => {
      throw new Error(`REDIRECT:${destination}`);
    },
  },
});

import assert from "node:assert/strict";
import { randomUUID } from "crypto";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";

const KNOWN_PASSWORD = "CorrectHorseBattery12";
const BASE_URL = "http://localhost:3000";

let prisma: typeof import("../../lib/prisma").prisma;
let bcryptHashSync: typeof import("bcryptjs").hashSync;
let signSession: typeof import("../../lib/auth").signSession;
let verifySessionToken: typeof import("../../lib/auth").verifySessionToken;
let SESSION_COOKIE_NAME: typeof import("../../lib/auth").SESSION_COOKIE_NAME;
let loginPOST: typeof import("../../app/api/auth/login/route").POST;
let logoutPOST: typeof import("../../app/api/auth/logout/route").POST;
let resetPasswordPOST: typeof import("../../app/api/auth/reset-password/route").POST;
let brandPasswordPATCH: typeof import("../../app/api/brand/account/password/route").PATCH;
let adminResetPasswordPOST: typeof import("../../app/api/admin/users/[id]/reset-password/route").POST;
let requireBrandSession: typeof import("../../lib/api-auth").requireBrandSession;
let requireAdminSession: typeof import("../../lib/api-auth").requireAdminSession;
let requireBrandUser: typeof import("../../lib/session").requireBrandUser;
let requireAdminUser: typeof import("../../lib/session").requireAdminUser;

let activeBrandId: string;
let suspendedBrandId: string;
const createdUserIds: string[] = [];
const createdBrandIds: string[] = [];

before(async () => {
  ({ prisma } = await import("../../lib/prisma"));
  ({ hashSync: bcryptHashSync } = await import("bcryptjs"));
  ({ signSession, verifySessionToken, SESSION_COOKIE_NAME } = await import("../../lib/auth"));
  ({ POST: loginPOST } = await import("../../app/api/auth/login/route"));
  ({ POST: logoutPOST } = await import("../../app/api/auth/logout/route"));
  ({ POST: resetPasswordPOST } = await import("../../app/api/auth/reset-password/route"));
  ({ PATCH: brandPasswordPATCH } = await import("../../app/api/brand/account/password/route"));
  ({ POST: adminResetPasswordPOST } = await import("../../app/api/admin/users/[id]/reset-password/route"));
  ({ requireBrandSession, requireAdminSession } = await import("../../lib/api-auth"));
  ({ requireBrandUser, requireAdminUser } = await import("../../lib/session"));

  const activeBrand = await prisma.brand.create({
    data: { slug: `zzz-sr-active-${randomUUID()}`, name: "ZZZ SR Active Brand", status: "ACTIVE" },
  });
  activeBrandId = activeBrand.id;
  createdBrandIds.push(activeBrandId);

  const suspendedBrand = await prisma.brand.create({
    data: { slug: `zzz-sr-suspended-${randomUUID()}`, name: "ZZZ SR Suspended Brand", status: "SUSPENDED" },
  });
  suspendedBrandId = suspendedBrand.id;
  createdBrandIds.push(suspendedBrandId);
});

after(async () => {
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } }).catch(() => {});
  await prisma.brand.deleteMany({ where: { id: { in: createdBrandIds } } }).catch(() => {});
  await prisma.$disconnect();
});

async function createBrandUser(opts: { active?: boolean; brandId?: string; password?: string } = {}) {
  const password = opts.password ?? KNOWN_PASSWORD;
  const user = await prisma.user.create({
    data: {
      email: `zzz-sr-${randomUUID()}@example.com`,
      passwordHash: bcryptHashSync(password, 12),
      role: "BRAND",
      active: opts.active ?? true,
      brandId: opts.brandId ?? activeBrandId,
      brandRole: "OWNER",
    },
  });
  createdUserIds.push(user.id);
  return user;
}

async function createAdminUser(opts: { active?: boolean; password?: string } = {}) {
  const password = opts.password ?? KNOWN_PASSWORD;
  const user = await prisma.user.create({
    data: {
      email: `zzz-sr-admin-${randomUUID()}@example.com`,
      passwordHash: bcryptHashSync(password, 12),
      role: "ADMIN",
      active: opts.active ?? true,
    },
  });
  createdUserIds.push(user.id);
  return user;
}

type Role = "BRAND" | "ADMIN";
async function signFor(user: { id: string; email: string; brandId?: string | null; sessionVersion: number }, role: Role, overrides: Record<string, unknown> = {}) {
  return signSession({
    sub: user.id,
    email: user.email,
    role,
    ...(role === "BRAND" ? { brandId: user.brandId ?? undefined } : {}),
    sessionVersion: user.sessionVersion,
    ...overrides,
  });
}

function cookieHeader(token: string) {
  return `${SESSION_COOKIE_NAME}=${token}`;
}

let ipCounter = 0;
function freshIdentifier() {
  ipCounter += 1;
  return `10.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${(ipCounter + Math.floor(Math.random() * 1000)) % 256}`;
}

function apiRequest(
  path: string,
  method: string,
  options: { cookie?: string; body?: unknown; ip?: string } = {},
) {
  const headers = new Headers({ origin: BASE_URL, "x-forwarded-for": options.ip ?? freshIdentifier() });
  if (options.cookie) headers.set("cookie", options.cookie);
  if (options.body !== undefined) headers.set("content-type", "application/json");
  return new NextRequest(`${BASE_URL}${path}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}

function extractSetCookieToken(response: Response): string {
  const raw = response.headers.get("set-cookie") ?? "";
  const match = raw.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
  assert.ok(match, `expected a ${SESSION_COOKIE_NAME} cookie in the response, got: ${raw}`);
  return match[1];
}

describe("1. normal login and authenticated access", () => {
  test("logging in with the correct password issues a session that requireBrandSession accepts", async () => {
    const user = await createBrandUser();
    const response = await loginPOST(apiRequest("/api/auth/login", "POST", { body: { email: user.email, password: KNOWN_PASSWORD } }));
    assert.equal(response.status, 200);
    const token = extractSetCookieToken(response);

    const session = await requireBrandSession(apiRequest("/api/brand/products", "GET", { cookie: cookieHeader(token) }));
    assert.ok(session, "a freshly issued token must be accepted");
    assert.equal(session?.sub, user.id);
  });
});

describe("2. current-device logout", () => {
  test("logout clears the cookie but does not itself revoke the token server-side", async () => {
    const user = await createBrandUser();
    const token = await signFor(user, "BRAND");

    const logoutResponse = await logoutPOST(apiRequest("/api/auth/logout", "POST", { cookie: cookieHeader(token) }));
    const setCookie = logoutResponse.headers.get("set-cookie") ?? "";
    assert.match(setCookie, /truorigin_session=;/, "logout must clear the cookie");
    assert.match(setCookie, /Max-Age=0/i, "logout must expire the cookie immediately");

    // The point Phase D.1 raised directly: clearing a cookie on one
    // device says nothing about a COPY of the same token elsewhere. The
    // original token string, used directly (not through "the browser"),
    // must still be accepted -- this is exactly why password change/
    // reset (not logout) are what bump sessionVersion.
    const stillWorks = await requireBrandSession(apiRequest("/api/brand/products", "GET", { cookie: cookieHeader(token) }));
    assert.ok(stillWorks, "logout on one device must not revoke a separate copy of the same token");
  });
});

describe("3. password change invalidates old sessions (brand)", () => {
  test("the old token is rejected after a self-service password change; the newly issued one still works", async () => {
    const user = await createBrandUser();
    const oldToken = await signFor(user, "BRAND");

    assert.ok(await requireBrandSession(apiRequest("/x", "GET", { cookie: cookieHeader(oldToken) })), "sanity: old token works before the change");

    const changeResponse = await brandPasswordPATCH(
      apiRequest("/api/brand/account/password", "PATCH", {
        cookie: cookieHeader(oldToken),
        body: { currentPassword: KNOWN_PASSWORD, newPassword: "ANewStrongerPassword99" },
      }),
    );
    assert.equal(changeResponse.status, 200);
    const newToken = extractSetCookieToken(changeResponse);

    const oldStillWorks = await requireBrandSession(apiRequest("/x", "GET", { cookie: cookieHeader(oldToken) }));
    assert.equal(oldStillWorks, null, "the pre-change token must be rejected after a password change");

    const newWorks = await requireBrandSession(apiRequest("/x", "GET", { cookie: cookieHeader(newToken) }));
    assert.ok(newWorks, "the newly issued (post-change) token must still work");
  });
});

describe("4. password reset invalidates old sessions", () => {
  test("the old token is rejected once a self-service password reset is completed", async () => {
    const user = await createBrandUser();
    const oldToken = await signFor(user, "BRAND");
    assert.ok(await requireBrandSession(apiRequest("/x", "GET", { cookie: cookieHeader(oldToken) })), "sanity: old token works before the reset");

    const rawToken = randomUUID();
    const { hashResetToken, RESET_TOKEN_TTL_MS } = await import("../../lib/auth");
    await prisma.user.update({
      where: { id: user.id },
      data: { resetTokenHash: hashResetToken(rawToken), resetTokenExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
    });

    const resetResponse = await resetPasswordPOST(
      apiRequest("/api/auth/reset-password", "POST", { body: { token: rawToken, password: "AnotherStrongPassword99" } }),
    );
    assert.equal(resetResponse.status, 200);

    const oldStillWorks = await requireBrandSession(apiRequest("/x", "GET", { cookie: cookieHeader(oldToken) }));
    assert.equal(oldStillWorks, null, "the pre-reset token must be rejected once the reset completes");
  });
});

describe("4b. the page-level guards (requireBrandUser/requireAdminUser) enforce the same revocation", () => {
  test("requireBrandUser redirects once the brand user's session is revoked", async () => {
    const user = await createBrandUser();
    const token = await signFor(user, "BRAND");

    mockCookieValue = token;
    const before = await requireBrandUser();
    assert.equal(before.id, user.id, "sanity: the page guard accepts the token before revocation");

    await prisma.user.update({ where: { id: user.id }, data: { sessionVersion: { increment: 1 } } });

    mockCookieValue = token;
    await assert.rejects(requireBrandUser(), /REDIRECT:\/login/, "requireBrandUser must redirect once the token is revoked");
  });

  test("requireAdminUser redirects once the admin's session is revoked", async () => {
    const admin = await createAdminUser();
    const token = await signFor(admin, "ADMIN");

    mockCookieValue = token;
    const before = await requireAdminUser();
    assert.equal(before.id, admin.id, "sanity: the page guard accepts the token before revocation");

    await prisma.user.update({ where: { id: admin.id }, data: { sessionVersion: { increment: 1 } } });

    mockCookieValue = token;
    await assert.rejects(requireAdminUser(), /REDIRECT:\/admin\/login/, "requireAdminUser must redirect once the token is revoked");
  });
});

describe("5. administrative password reset invalidates affected sessions", () => {
  test("the target user's existing session is rejected as soon as an admin sends the reset -- before it's ever completed", async () => {
    const admin = await createAdminUser();
    const adminToken = await signFor(admin, "ADMIN");
    const targetUser = await createBrandUser();
    const targetOldToken = await signFor(targetUser, "BRAND");

    assert.ok(
      await requireBrandSession(apiRequest("/x", "GET", { cookie: cookieHeader(targetOldToken) })),
      "sanity: target's token works before the admin acts",
    );

    const sendResponse = await adminResetPasswordPOST(
      apiRequest(`/api/admin/users/${targetUser.id}/reset-password`, "POST", { cookie: cookieHeader(adminToken) }),
      { params: Promise.resolve({ id: targetUser.id }) },
    );
    assert.equal(sendResponse.status, 200);

    const targetStillWorks = await requireBrandSession(apiRequest("/x", "GET", { cookie: cookieHeader(targetOldToken) }));
    assert.equal(targetStillWorks, null, "the target's pre-existing session must be rejected immediately, without waiting for the reset email to be completed");
  });
});

describe("6. a second device's old token is rejected after global revocation", () => {
  test("device A's session survives a password change it performed; device B's independent old session does not", async () => {
    const user = await createBrandUser();
    const deviceAToken = await signFor(user, "BRAND");
    const deviceBToken = await signFor(user, "BRAND");

    const changeResponse = await brandPasswordPATCH(
      apiRequest("/api/brand/account/password", "PATCH", {
        cookie: cookieHeader(deviceAToken),
        body: { currentPassword: KNOWN_PASSWORD, newPassword: "YetAnotherStrongPassword99" },
      }),
    );
    assert.equal(changeResponse.status, 200);
    const deviceANewToken = extractSetCookieToken(changeResponse);

    assert.ok(
      await requireBrandSession(apiRequest("/x", "GET", { cookie: cookieHeader(deviceANewToken) })),
      "device A, re-signed by the change it performed, must still work",
    );
    assert.equal(
      await requireBrandSession(apiRequest("/x", "GET", { cookie: cookieHeader(deviceBToken) })),
      null,
      "device B's independent, now-stale session must be rejected",
    );
  });
});

describe("7. new login works after revocation", () => {
  test("logging in again after a password change issues a token with the correct, current sessionVersion", async () => {
    const user = await createBrandUser();
    const oldToken = await signFor(user, "BRAND");

    await brandPasswordPATCH(
      apiRequest("/api/brand/account/password", "PATCH", {
        cookie: cookieHeader(oldToken),
        body: { currentPassword: KNOWN_PASSWORD, newPassword: "FreshStrongPassword99" },
      }),
    );

    const loginResponse = await loginPOST(
      apiRequest("/api/auth/login", "POST", { body: { email: user.email, password: "FreshStrongPassword99" } }),
    );
    assert.equal(loginResponse.status, 200);
    const freshToken = extractSetCookieToken(loginResponse);

    const works = await requireBrandSession(apiRequest("/x", "GET", { cookie: cookieHeader(freshToken) }));
    assert.ok(works, "a fresh login after revocation must issue a token the guard accepts");
  });
});

describe("8. expired JWT rejection", () => {
  test("a token signed with an already-past expiration is rejected", async () => {
    const user = await createBrandUser();
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const expired = await new SignJWT({ sub: user.id, email: user.email, role: "BRAND", brandId: user.brandId, sessionVersion: user.sessionVersion })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 120)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(secret);

    assert.equal(await verifySessionToken(expired), null, "verifySessionToken must reject an expired token");
    assert.equal(
      await requireBrandSession(apiRequest("/x", "GET", { cookie: cookieHeader(expired) })),
      null,
      "requireBrandSession must reject an expired token",
    );
  });
});

describe("9. tampered JWT rejection", () => {
  test("a token with a corrupted signature segment is rejected", async () => {
    const user = await createBrandUser();
    const token = await signFor(user, "BRAND");
    const parts = token.split(".");
    const corruptedSignature = parts[2].slice(0, -4) + (parts[2].slice(-4) === "AAAA" ? "BBBB" : "AAAA");
    const tampered = `${parts[0]}.${parts[1]}.${corruptedSignature}`;

    assert.equal(await verifySessionToken(tampered), null, "verifySessionToken must reject a tampered signature");
    assert.equal(
      await requireBrandSession(apiRequest("/x", "GET", { cookie: cookieHeader(tampered) })),
      null,
      "requireBrandSession must reject a tampered token",
    );
  });
});

describe("10. both ADMIN and BRAND roles are covered", () => {
  test("an admin's session is independently subject to the same revocation mechanism", async () => {
    const admin = await createAdminUser();
    const oldToken = await signFor(admin, "ADMIN");
    assert.ok(await requireAdminSession(apiRequest("/x", "GET", { cookie: cookieHeader(oldToken) })), "sanity: admin token works before revocation");

    // Admins have no self-service password-change route today (Phase
    // D.1's audit confirmed this); bumping sessionVersion directly
    // exercises the exact same guard-side check requireAdminSession
    // applies, independent of which route happens to trigger it.
    await prisma.user.update({ where: { id: admin.id }, data: { sessionVersion: { increment: 1 } } });

    const stillWorks = await requireAdminSession(apiRequest("/x", "GET", { cookie: cookieHeader(oldToken) }));
    assert.equal(stillWorks, null, "an admin's pre-revocation token must be rejected exactly like a brand user's");
  });
});

describe("11. inactive and suspended accounts are still rejected (unaffected by sessionVersion)", () => {
  test("an inactive brand user's otherwise-current-version token is still rejected", async () => {
    const user = await createBrandUser({ active: false });
    const token = await signFor(user, "BRAND");
    assert.equal(await requireBrandSession(apiRequest("/x", "GET", { cookie: cookieHeader(token) })), null);
  });

  test("a brand user on a suspended brand is still rejected", async () => {
    const user = await createBrandUser({ brandId: suspendedBrandId });
    const token = await signFor(user, "BRAND");
    assert.equal(await requireBrandSession(apiRequest("/x", "GET", { cookie: cookieHeader(token) })), null);
  });

  test("an inactive admin is still rejected", async () => {
    const admin = await createAdminUser({ active: false });
    const token = await signFor(admin, "ADMIN");
    assert.equal(await requireAdminSession(apiRequest("/x", "GET", { cookie: cookieHeader(token) })), null);
  });
});

describe("12. legacy-token behavior during rollout", () => {
  test("a token with no sessionVersion claim at all (pre-rollout) is accepted for a never-revoked user", async () => {
    const user = await createBrandUser();
    assert.equal(user.sessionVersion, 0, "sanity: a freshly created user starts at the column default");

    const legacyToken = await signSession({
      sub: user.id,
      email: user.email,
      role: "BRAND",
      brandId: user.brandId,
      // Deliberately omitted: a token signed before this phase shipped
      // never had this claim at all. TypeScript requires it on the
      // SessionPayload type (so no NEW call site can forget it), but a
      // decoded JWT isn't type-checked at runtime -- `as never` lets this
      // test construct exactly that shape.
    } as never);

    assert.ok(
      await requireBrandSession(apiRequest("/x", "GET", { cookie: cookieHeader(legacyToken) })),
      "a legacy token (no sessionVersion claim) must still work for a user who was never revoked",
    );
  });

  test("that same legacy token is rejected once the user's first revocation event happens", async () => {
    const user = await createBrandUser();
    const legacyToken = await signSession({
      sub: user.id,
      email: user.email,
      role: "BRAND",
      brandId: user.brandId,
    } as never);

    assert.ok(await requireBrandSession(apiRequest("/x", "GET", { cookie: cookieHeader(legacyToken) })), "sanity: legacy token works before any revocation");

    await prisma.user.update({ where: { id: user.id }, data: { sessionVersion: { increment: 1 } } });

    assert.equal(
      await requireBrandSession(apiRequest("/x", "GET", { cookie: cookieHeader(legacyToken) })),
      null,
      "a legacy token is not exempt from a revocation event that happens after rollout",
    );
  });
});

describe("rate limiting is unaffected by this phase", () => {
  test("the login route's existing rate limit still applies, independent of sessionVersion", async () => {
    const user = await createBrandUser();
    const ip = freshIdentifier();
    let lastStatus = 0;
    for (let i = 0; i < 11; i += 1) {
      const response = await loginPOST(apiRequest("/api/auth/login", "POST", { body: { email: user.email, password: "wrong" }, ip }));
      lastStatus = response.status;
      if (lastStatus === 429) break;
    }
    assert.equal(lastStatus, 429, "the login route's rate limit must still trip exactly as before");
  });
});
