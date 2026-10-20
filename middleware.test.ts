import { beforeAll, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

process.env.JWT_SECRET ??= "test-only-secret-not-for-real-use-0123456789";

let signSession: typeof import("./lib/auth").signSession;
let middleware: typeof import("./middleware").middleware;

beforeAll(async () => {
  ({ signSession } = await import("./lib/auth"));
  ({ middleware } = await import("./middleware"));
});

const BASE = "https://example.test";

function req(path: string, cookieValue?: string) {
  const headers: Record<string, string> = {};
  if (cookieValue) headers.cookie = `truorigin_session=${cookieValue}`;
  return new NextRequest(new URL(path, BASE), { headers });
}

async function adminToken(overrides: Partial<Parameters<typeof signSession>[0]> = {}) {
  return signSession({ sub: "admin-1", email: "admin@example.test", role: "ADMIN", tokenVersion: 0, ...overrides });
}

async function brandToken(overrides: Partial<Parameters<typeof signSession>[0]> = {}) {
  return signSession({
    sub: "brand-user-1",
    email: "brand@example.test",
    role: "BRAND",
    brandId: "brand-1",
    mustChangePassword: false,
    tokenVersion: 0,
    ...overrides,
  });
}

// These exercise middleware.ts directly with real signed JWTs (via the
// real signSession/verifySessionToken) — no DB, no live server, no
// mocking of the crypto layer, so the coverage is of real behavior, not
// of my assumptions about it. This is read-only/pure-function testing,
// consistent with the DB-safety restriction for this audit pass (no
// database is touched anywhere in this file).
describe("middleware — unauthenticated access to protected routes", () => {
  it("redirects an unauthenticated request for an admin page to /admin/login", async () => {
    const res = await middleware(req("/admin"));
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/admin/login");
  });

  it("redirects an unauthenticated request for a brand page to /login", async () => {
    const res = await middleware(req("/brand/dashboard"));
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/login");
  });

  it("returns 401 JSON (not a redirect) for an unauthenticated admin API request", async () => {
    const res = await middleware(req("/api/admin/products"));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("returns 401 JSON for an unauthenticated brand API request", async () => {
    const res = await middleware(req("/api/brand/products"));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("lets an unauthenticated request through to a public page", async () => {
    const res = await middleware(req("/for-products/home"));
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
    expect(res.headers.get("location")).toBeNull();
  });
});

describe("middleware — role escalation protections", () => {
  it("does not let a BRAND session into an admin page (redirects to brand home, not through)", async () => {
    const token = await brandToken();
    const res = await middleware(req("/admin", token));
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/account");
  });

  it("does not let a BRAND session call an admin API route (403, not through)", async () => {
    const token = await brandToken();
    const res = await middleware(req("/api/admin/brands", token));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "Forbidden" });
  });

  it("does not let an ADMIN session into a brand page (redirects to admin home, not through)", async () => {
    const token = await adminToken();
    const res = await middleware(req("/brand/dashboard", token));
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/admin");
  });

  it("does not let an ADMIN session call a brand API route (403, not through)", async () => {
    const token = await adminToken();
    const res = await middleware(req("/api/brand/products", token));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "Forbidden" });
  });
});

describe("middleware — session token validity", () => {
  it("treats an expired token as unauthenticated", async () => {
    const { SignJWT } = await import("jose");
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const expired = await new SignJWT({ sub: "admin-1", email: "a@example.test", role: "ADMIN" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 3600)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 1800) // expired 30 min ago
      .sign(secret);

    const res = await middleware(req("/admin", expired));
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/admin/login");
  });

  it("treats a token signed with the wrong secret as unauthenticated (tamper/forgery protection)", async () => {
    const { SignJWT } = await import("jose");
    const wrongSecret = new TextEncoder().encode("a-completely-different-secret-0123456789");
    const forged = await new SignJWT({ sub: "admin-1", email: "a@example.test", role: "ADMIN" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(wrongSecret);

    const res = await middleware(req("/admin", forged));
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/admin/login");
  });

  it("treats a garbage/malformed cookie value as unauthenticated rather than erroring", async () => {
    const res = await middleware(req("/admin", "not-a-real-jwt-at-all"));
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/admin/login");
  });

  it("redirects an already-authenticated user away from the login page instead of showing it again", async () => {
    const token = await brandToken();
    const res = await middleware(req("/login", token));
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/account");
  });
});

describe("middleware — forced password change", () => {
  it("redirects a must-change-password brand session to /brand/set-password on other brand pages", async () => {
    const token = await brandToken({ mustChangePassword: true });
    const res = await middleware(req("/brand/dashboard", token));
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/brand/set-password");
  });

  it("does NOT redirect-loop a must-change-password session already on /brand/set-password", async () => {
    const token = await brandToken({ mustChangePassword: true });
    const res = await middleware(req("/brand/set-password", token));
    expect(res.headers.get("location")).toBeNull();
  });

  it("blocks other brand API routes with 403 for a must-change-password session", async () => {
    const token = await brandToken({ mustChangePassword: true });
    const res = await middleware(req("/api/brand/products", token));
    expect(res.status).toBe(403);
  });

  it("allows the password-change API route itself through for a must-change-password session", async () => {
    const token = await brandToken({ mustChangePassword: true });
    const res = await middleware(req("/api/brand/account/password", token));
    expect(res.status).not.toBe(403);
  });
});
