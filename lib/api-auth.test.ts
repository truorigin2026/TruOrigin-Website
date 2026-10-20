import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

process.env.JWT_SECRET ??= "test-only-secret-not-for-real-use-0123456789";

const findUniqueMock = vi.fn();

// Mocked so these tests exercise the real tokenVersion-comparison logic in
// requireAdminSession/requireBrandSession without touching any database —
// consistent with this audit phase's DB-safety restriction (local dev and
// production share one database; no live writes or reads happen here).
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: (...args: unknown[]) => findUniqueMock(...args) } },
}));

let signSession: typeof import("./auth").signSession;
let requireAdminSession: typeof import("./api-auth").requireAdminSession;
let requireBrandSession: typeof import("./api-auth").requireBrandSession;

beforeAll(async () => {
  ({ signSession } = await import("./auth"));
  ({ requireAdminSession, requireBrandSession } = await import("./api-auth"));
});

beforeEach(() => {
  findUniqueMock.mockReset();
});

const BASE = "https://example.test";

// A mutating method with a matching Origin — isSameOriginRequest() only
// applies to mutating methods, so this is what actually reaches the
// tokenVersion logic under test (a GET would skip that check entirely).
function postReq(cookieValue?: string) {
  const headers: Record<string, string> = { origin: BASE };
  if (cookieValue) headers.cookie = `truorigin_session=${cookieValue}`;
  return new NextRequest(new URL("/api/admin/whatever", BASE), { method: "POST", headers });
}

describe("requireAdminSession — tokenVersion enforcement", () => {
  it("accepts a token whose tokenVersion matches the current DB value", async () => {
    const token = await signSession({ sub: "admin-1", email: "a@example.test", role: "ADMIN", tokenVersion: 3 });
    findUniqueMock.mockResolvedValue({ active: true, tokenVersion: 3 });

    const session = await requireAdminSession(postReq(token));
    expect(session).not.toBeNull();
    expect(session?.sub).toBe("admin-1");
  });

  it("rejects a token whose tokenVersion is behind the current DB value (password changed since issue)", async () => {
    const token = await signSession({ sub: "admin-1", email: "a@example.test", role: "ADMIN", tokenVersion: 1 });
    // DB has since moved to version 2 (e.g. a password change bumped it).
    findUniqueMock.mockResolvedValue({ active: true, tokenVersion: 2 });

    const session = await requireAdminSession(postReq(token));
    expect(session).toBeNull();
  });

  it("still rejects an inactive admin even with a matching tokenVersion (existing behavior preserved)", async () => {
    const token = await signSession({ sub: "admin-1", email: "a@example.test", role: "ADMIN", tokenVersion: 0 });
    findUniqueMock.mockResolvedValue({ active: false, tokenVersion: 0 });

    const session = await requireAdminSession(postReq(token));
    expect(session).toBeNull();
  });

  it("rejects when there's no session at all", async () => {
    const session = await requireAdminSession(postReq());
    expect(session).toBeNull();
    expect(findUniqueMock).not.toHaveBeenCalled();
  });
});

describe("requireBrandSession — tokenVersion enforcement", () => {
  it("accepts a token whose tokenVersion matches the current DB value", async () => {
    const token = await signSession({
      sub: "brand-user-1",
      email: "b@example.test",
      role: "BRAND",
      brandId: "brand-1",
      tokenVersion: 5,
    });
    findUniqueMock.mockResolvedValue({ active: true, tokenVersion: 5, brand: { status: "ACTIVE" } });

    const session = await requireBrandSession(postReq(token));
    expect(session).not.toBeNull();
  });

  it("rejects a stale (old) tokenVersion — the core password-change revocation case", async () => {
    const token = await signSession({
      sub: "brand-user-1",
      email: "b@example.test",
      role: "BRAND",
      brandId: "brand-1",
      tokenVersion: 0,
    });
    // This token was issued before the user changed their password, which
    // bumped tokenVersion to 1 — this exact scenario is what Priority 2
    // asked to be regression-tested.
    findUniqueMock.mockResolvedValue({ active: true, tokenVersion: 1, brand: { status: "ACTIVE" } });

    const session = await requireBrandSession(postReq(token));
    expect(session).toBeNull();
  });

  it("still rejects a suspended brand even with a matching tokenVersion (existing behavior preserved)", async () => {
    const token = await signSession({
      sub: "brand-user-1",
      email: "b@example.test",
      role: "BRAND",
      brandId: "brand-1",
      tokenVersion: 0,
    });
    findUniqueMock.mockResolvedValue({ active: true, tokenVersion: 0, brand: { status: "SUSPENDED" } });

    const session = await requireBrandSession(postReq(token));
    expect(session).toBeNull();
  });
});
