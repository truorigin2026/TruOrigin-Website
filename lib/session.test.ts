import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

process.env.JWT_SECRET ??= "test-only-secret-not-for-real-use-0123456789";

const findUniqueMock = vi.fn();
const cookieGetMock = vi.fn();
const redirectMock = vi.fn((path: string) => {
  throw new Error(`REDIRECT:${path}`);
});

// Mocked — no database involved, consistent with this audit phase's
// DB-safety restriction.
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: (...args: unknown[]) => findUniqueMock(...args) } },
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: (name: string) => cookieGetMock(name) }),
}));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => redirectMock(path),
}));

let signSession: typeof import("./auth").signSession;
let getCurrentUser: typeof import("./session").getCurrentUser;
let requireAdminUser: typeof import("./session").requireAdminUser;
let requireBrandUser: typeof import("./session").requireBrandUser;

beforeAll(async () => {
  ({ signSession } = await import("./auth"));
  ({ getCurrentUser, requireAdminUser, requireBrandUser } = await import("./session"));
});

beforeEach(() => {
  findUniqueMock.mockReset();
  cookieGetMock.mockReset();
  redirectMock.mockClear();
});

function setCookie(value?: string) {
  cookieGetMock.mockImplementation((name: string) =>
    name === "truorigin_session" && value ? { value } : undefined,
  );
}

describe("getCurrentUser — the exact deployment-sequence risk", () => {
  it("rejects a LEGACY token with no tokenVersion claim at all (signed by pre-rollout code)", async () => {
    // Built directly via jose, bypassing signSession() — its TypeScript
    // type now requires tokenVersion, which is exactly the point: this
    // reconstructs what a token issued by the OLD code actually looked
    // like before this rollout, when no such field existed yet. This is
    // the token shape every currently-logged-in user holds the moment
    // this code deploys.
    const { SignJWT } = await import("jose");
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const legacyToken = await new SignJWT({ sub: "user-1", email: "u@example.test", role: "ADMIN" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    setCookie(legacyToken);
    findUniqueMock.mockResolvedValue({ id: "user-1", active: true, tokenVersion: 0, brand: null });

    const user = await getCurrentUser();
    expect(user).toBeNull(); // undefined (missing claim) !== 0 (DB default)
  });

  it("accepts a current-format token whose tokenVersion matches the DB", async () => {
    const token = await signSession({ sub: "user-1", email: "u@example.test", role: "ADMIN", tokenVersion: 2 });
    setCookie(token);
    findUniqueMock.mockResolvedValue({ id: "user-1", active: true, tokenVersion: 2, brand: null });

    const user = await getCurrentUser();
    expect(user).not.toBeNull();
  });

  it("rejects a current-format token with a stale (pre-password-change) tokenVersion", async () => {
    const token = await signSession({ sub: "user-1", email: "u@example.test", role: "ADMIN", tokenVersion: 1 });
    setCookie(token);
    findUniqueMock.mockResolvedValue({ id: "user-1", active: true, tokenVersion: 2, brand: null });

    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  it("returns null with no cookie at all", async () => {
    setCookie(undefined);
    const user = await getCurrentUser();
    expect(user).toBeNull();
    expect(findUniqueMock).not.toHaveBeenCalled();
  });
});

describe("Deployment sequence, end to end: password change invalidates the old token but not a freshly re-issued one", () => {
  it("old (pre-change) token rejected; new token issued at change time still works", async () => {
    // Token issued before any password change — DB currently at version 0.
    const oldToken = await signSession({ sub: "user-1", email: "u@example.test", role: "ADMIN", tokenVersion: 0 });

    // A password change happens: DB tokenVersion bumps to 1 (what
    // app/api/brand/account/password/route.ts and
    // app/api/auth/reset-password/route.ts both do via
    // `tokenVersion: { increment: 1 }`), and a fresh token is issued
    // carrying the new version (what both routes re-sign with).
    const newToken = await signSession({ sub: "user-1", email: "u@example.test", role: "ADMIN", tokenVersion: 1 });

    findUniqueMock.mockResolvedValue({ id: "user-1", active: true, tokenVersion: 1, brand: null });

    setCookie(oldToken);
    expect(await getCurrentUser()).toBeNull();

    setCookie(newToken);
    expect(await getCurrentUser()).not.toBeNull();
  });
});

describe("requireAdminUser / requireBrandUser — redirect on rejected session", () => {
  it("redirects to /admin/login when the session is rejected (e.g. stale tokenVersion)", async () => {
    const token = await signSession({ sub: "user-1", email: "a@example.test", role: "ADMIN", tokenVersion: 0 });
    setCookie(token);
    findUniqueMock.mockResolvedValue({ id: "user-1", role: "ADMIN", active: true, tokenVersion: 99, brand: null });

    await expect(requireAdminUser()).rejects.toThrow("REDIRECT:/admin/login");
  });

  it("does not redirect when the session is valid and the role matches", async () => {
    const token = await signSession({ sub: "user-1", email: "a@example.test", role: "ADMIN", tokenVersion: 0 });
    setCookie(token);
    findUniqueMock.mockResolvedValue({ id: "user-1", role: "ADMIN", active: true, tokenVersion: 0, brand: null });

    await expect(requireAdminUser()).resolves.toMatchObject({ id: "user-1" });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("redirects a BRAND session away from requireAdminUser (role mismatch, not a tokenVersion issue)", async () => {
    const token = await signSession({
      sub: "user-1",
      email: "b@example.test",
      role: "BRAND",
      brandId: "brand-1",
      tokenVersion: 0,
    });
    setCookie(token);
    findUniqueMock.mockResolvedValue({
      id: "user-1",
      role: "BRAND",
      active: true,
      tokenVersion: 0,
      brandId: "brand-1",
      brand: { status: "ACTIVE" },
    });

    await expect(requireAdminUser()).rejects.toThrow("REDIRECT:/admin/login");
  });

  it("redirects to /login when a brand session's tokenVersion is stale", async () => {
    const token = await signSession({
      sub: "user-1",
      email: "b@example.test",
      role: "BRAND",
      brandId: "brand-1",
      tokenVersion: 0,
    });
    setCookie(token);
    findUniqueMock.mockResolvedValue({
      id: "user-1",
      role: "BRAND",
      active: true,
      tokenVersion: 5,
      brandId: "brand-1",
      brand: { status: "ACTIVE" },
    });

    await expect(requireBrandUser()).rejects.toThrow("REDIRECT:/login");
  });
});
