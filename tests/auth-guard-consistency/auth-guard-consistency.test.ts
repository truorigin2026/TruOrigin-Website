// Regression coverage for the Phase D.3 fix: /api/upload and /account now
// use the same shared, DB-backed guards (requireBrandSession,
// requireBrandUser) every other brand-protected route/page already uses,
// instead of a bespoke check that never looked at `active` or the
// brand's suspended status.
//
// /api/upload's route handler (POST) is called directly with a hand-
// built NextRequest -- NextRequest/NextResponse are plain Fetch-API-
// compatible classes with no dependency on an actual running server.
// /account's guard (requireBrandUser) depends on next/headers' cookies(),
// which only works inside a real Next.js request.
//
// next/headers and next/navigation are mocked via node:test's built-in
// module mocking for BOTH suites below, even though the current
// requireBrandSession-based /api/upload no longer needs next/headers at
// all (it reads the cookie straight off the NextRequest it's given).
// Confirmed directly: the PRIOR implementation (getCurrentUser(), which
// does depend on next/headers) cannot even execute in this harness
// without it -- mocking it here too means a revert-and-recheck against
// the old code exercises the actual authorization logic instead of
// failing outright on an unrelated context dependency, giving a clean,
// isolated before/after comparison. Every import that could transitively
// reach next/headers/next/navigation is done dynamically, after the
// mocks are registered -- static imports are hoisted and would resolve
// the real modules first.
import { test, describe, before, after, mock } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import path from "path";
import sharp from "sharp";
import { NextRequest } from "next/server";

let mockCookieValue: string | null = null;

mock.module("next/headers", {
  namedExports: {
    cookies: async () => ({
      get: () => (mockCookieValue ? { value: mockCookieValue } : undefined),
    }),
  },
});
mock.module("next/navigation", {
  namedExports: {
    redirect: (destination: string) => {
      throw new Error(`REDIRECT:${destination}`);
    },
  },
});

let prisma: typeof import("../../lib/prisma").prisma;
let signSession: typeof import("../../lib/auth").signSession;
let SESSION_COOKIE_NAME: typeof import("../../lib/auth").SESSION_COOKIE_NAME;
let uploadPOST: typeof import("../../app/api/upload/route").POST;
let requireBrandUser: typeof import("../../lib/session").requireBrandUser;

let categoryId: string;
let activeBrandId: string;
let suspendedBrandId: string;

let adminToken: string;
let inactiveBrandToken: string;
let suspendedBrandToken: string;
let validBrandToken: string;

before(async () => {
  ({ prisma } = await import("../../lib/prisma"));
  ({ signSession, SESSION_COOKIE_NAME } = await import("../../lib/auth"));
  ({ POST: uploadPOST } = await import("../../app/api/upload/route"));
  ({ requireBrandUser } = await import("../../lib/session"));

  const category = await prisma.category.create({ data: { name: `ZZZ Auth Guard Category ${randomUUID()}` } });
  categoryId = category.id;

  const activeBrand = await prisma.brand.create({
    data: { slug: `zzz-auth-guard-active-${randomUUID()}`, name: "ZZZ Active Brand", status: "ACTIVE" },
  });
  activeBrandId = activeBrand.id;

  const suspendedBrand = await prisma.brand.create({
    data: { slug: `zzz-auth-guard-suspended-${randomUUID()}`, name: "ZZZ Suspended Brand", status: "SUSPENDED" },
  });
  suspendedBrandId = suspendedBrand.id;

  const admin = await prisma.user.create({
    data: { email: `zzz-admin-${randomUUID()}@example.com`, passwordHash: "x", role: "ADMIN", active: true },
  });

  const inactiveBrandUser = await prisma.user.create({
    data: {
      email: `zzz-inactive-${randomUUID()}@example.com`,
      passwordHash: "x",
      role: "BRAND",
      active: false,
      brandId: activeBrandId,
      brandRole: "OWNER",
    },
  });

  const suspendedBrandUser = await prisma.user.create({
    data: {
      email: `zzz-suspended-brand-user-${randomUUID()}@example.com`,
      passwordHash: "x",
      role: "BRAND",
      active: true,
      brandId: suspendedBrandId,
      brandRole: "OWNER",
    },
  });

  const validBrandUser = await prisma.user.create({
    data: {
      email: `zzz-valid-${randomUUID()}@example.com`,
      passwordHash: "x",
      role: "BRAND",
      active: true,
      brandId: activeBrandId,
      brandRole: "OWNER",
    },
  });

  adminToken = await signSession({ sub: admin.id, email: admin.email, role: "ADMIN" });
  inactiveBrandToken = await signSession({
    sub: inactiveBrandUser.id,
    email: inactiveBrandUser.email,
    role: "BRAND",
    brandId: activeBrandId,
  });
  suspendedBrandToken = await signSession({
    sub: suspendedBrandUser.id,
    email: suspendedBrandUser.email,
    role: "BRAND",
    brandId: suspendedBrandId,
  });
  validBrandToken = await signSession({
    sub: validBrandUser.id,
    email: validBrandUser.email,
    role: "BRAND",
    brandId: activeBrandId,
  });
});

after(async () => {
  await prisma.user.deleteMany({ where: { email: { contains: "zzz-" } } }).catch(() => {});
  await prisma.brand.deleteMany({ where: { id: { in: [activeBrandId, suspendedBrandId] } } }).catch(() => {});
  await prisma.category.delete({ where: { id: categoryId } }).catch(() => {});
  await prisma.$disconnect();
});

function fakeUploadRequest(token: string | null, file?: { bytes: Uint8Array; type: string; name: string }) {
  // Set for the mocked next/headers too (see the file header comment) --
  // a PRIOR implementation reading the ambient cookie jar instead of the
  // request's own headers would otherwise always see no cookie at all.
  mockCookieValue = token;

  const headers = new Headers({ origin: "http://localhost:3000" });
  if (token) headers.set("cookie", `${SESSION_COOKIE_NAME}=${token}`);

  let body: FormData | undefined;
  if (file) {
    body = new FormData();
    body.set("file", new Blob([file.bytes as unknown as BlobPart], { type: file.type }), file.name);
  }

  return new NextRequest("http://localhost:3000/api/upload", {
    method: "POST",
    headers,
    body: body as unknown as BodyInit,
  });
}

describe("/api/upload authorization — requireBrandSession", () => {
  test("unauthenticated request is rejected", async () => {
    const response = await uploadPOST(fakeUploadRequest(null));
    assert.equal(response.status, 401);
  });

  test("an admin session is rejected (not a BRAND role)", async () => {
    const response = await uploadPOST(fakeUploadRequest(adminToken));
    assert.equal(response.status, 401);
  });

  test("an inactive brand user's session is rejected, even though the token itself is still valid", async () => {
    const response = await uploadPOST(fakeUploadRequest(inactiveBrandToken));
    assert.equal(response.status, 401);
  });

  test("a brand user on a SUSPENDED brand is rejected", async () => {
    const response = await uploadPOST(fakeUploadRequest(suspendedBrandToken));
    assert.equal(response.status, 401);
  });

  test("a valid, active brand user passes authorization (never blocked by the 401 gate)", async () => {
    const png = await sharp({ create: { width: 1, height: 1, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .png()
      .toBuffer();
    const response = await uploadPOST(
      fakeUploadRequest(validBrandToken, { bytes: new Uint8Array(png), type: "image/png", name: "pixel.png" }),
    );

    // No BLOB_READ_WRITE_TOKEN is set in this test environment (see
    // run.mts), so a request that gets PAST authorization fails
    // specifically here -- proof it was never rejected by the guard,
    // without ever making a real Vercel Blob call.
    assert.notEqual(response.status, 401, "a valid active brand user must not be rejected by the auth guard");
    const body = await response.json();
    assert.match(body.error ?? "", /storage is not configured/i, "must fail specifically at the (unconfigured) Blob step, not earlier");
  });
});

describe("/account authorization — requireBrandUser", () => {
  test("the account page itself calls requireBrandUser(), not an inline check", () => {
    const source = readFileSync(
      path.resolve(__dirname, "../../app/(auth)/account/page.tsx"),
      "utf8",
    );
    assert.match(source, /requireBrandUser\(\)/, "app/(auth)/account/page.tsx must call the shared guard");
  });

  test("unauthenticated access redirects to /login", async () => {
    mockCookieValue = null;
    await assert.rejects(requireBrandUser(), /REDIRECT:\/login/);
  });

  test("an admin session is rejected and redirected to /login (requireBrandUser requires role === BRAND)", async () => {
    mockCookieValue = adminToken;
    await assert.rejects(requireBrandUser(), /REDIRECT:\/login/);
  });

  test("an inactive brand user's session is rejected and redirected to /login", async () => {
    mockCookieValue = inactiveBrandToken;
    await assert.rejects(requireBrandUser(), /REDIRECT:\/login/);
  });

  test("a brand user on a SUSPENDED brand is rejected and redirected to /login", async () => {
    mockCookieValue = suspendedBrandToken;
    await assert.rejects(requireBrandUser(), /REDIRECT:\/login/);
  });

  test("a valid, active brand user is allowed through -- and this isn't a stale cached result from an earlier (rejected) call", async () => {
    mockCookieValue = validBrandToken;
    const user = (await requireBrandUser()) as { id: string; brandId: string | null };
    assert.equal(user.brandId, activeBrandId);
  });
});
