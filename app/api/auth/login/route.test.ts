import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

process.env.JWT_SECRET ??= "test-only-secret-not-for-real-use-0123456789";
process.env.ADMIN_EMAIL ??= "admin-fixture@example.test";
process.env.ADMIN_PASSWORD ??= "admin-fixture-password-123";

const findUniqueMock = vi.fn();
const updateMock = vi.fn();
const upsertMock = vi.fn();
const padMock = vi.fn().mockResolvedValue(undefined);

// Mocked — no database involved, consistent with this audit phase's
// DB-safety restriction. padToMinimumDuration is mocked too so these
// tests assert *that every relevant branch calls it* (the actual
// integration point Priority 4 asked to be covered) rather than
// measuring real wall-clock time, which would make this suite slow and
// occasionally flaky under CI load for no extra confidence — the
// padding function's own timing behavior already has dedicated,
// deterministic fake-timer tests in lib/timing.test.ts.
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
      update: (...args: unknown[]) => updateMock(...args),
      upsert: (...args: unknown[]) => upsertMock(...args),
    },
  },
}));
vi.mock("@/lib/timing", () => ({ padToMinimumDuration: (...args: unknown[]) => padMock(...args) }));

let POST: typeof import("./route").POST;
let realPasswordHash: string;

beforeAll(async () => {
  ({ POST } = await import("./route"));
  const bcrypt = await import("bcryptjs");
  realPasswordHash = await bcrypt.hash("correct-password-123", 10);
});

let ipCounter = 0;
beforeEach(() => {
  findUniqueMock.mockReset();
  updateMock.mockReset();
  upsertMock.mockReset();
  padMock.mockClear();
  ipCounter += 1; // distinct IP per test — the real rate limiter is real, shared in-memory state
});

function req(body: Record<string, unknown>) {
  return new NextRequest("https://example.test/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": `10.1.0.${ipCounter}` },
    body: JSON.stringify(body),
  });
}

function realUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "brand-1",
    email: "brand@example.test",
    role: "BRAND" as const,
    active: true,
    tokenVersion: 0,
    brandId: "b1",
    brand: { slug: "acme", name: "Acme" },
    mustChangePassword: false,
    passwordHash: realPasswordHash, // real bcrypt hash of "correct-password-123", from beforeAll
    ...overrides,
  };
}

describe("POST /api/auth/login — timing-padding coverage", () => {
  it("pads the response when the email doesn't match any user", async () => {
    findUniqueMock.mockResolvedValue(null);
    const res = await POST(req({ email: "nobody@example.test", password: "whatever-123" }));
    expect(res.status).toBe(401);
    expect(padMock).toHaveBeenCalled();
  });

  it("pads the response when the password is wrong for a real user", async () => {
    const user = realUser();
    findUniqueMock.mockResolvedValue(user);
    const res = await POST(req({ email: user.email, password: "definitely-wrong-password" }));
    expect(res.status).toBe(401);
    expect(padMock).toHaveBeenCalled();
  });

  it("pads the response for a suspended account reached via a wrong-password attempt", async () => {
    const user = realUser({ active: false });
    findUniqueMock.mockResolvedValue(user);
    const res = await POST(req({ email: user.email, password: "still-wrong" }));
    expect(res.status).toBe(401); // wrong password is checked before active, same as before
    expect(padMock).toHaveBeenCalled();
  });

  it("pads the response for a suspended account on a correct password too", async () => {
    const user = realUser({ active: false });
    findUniqueMock.mockResolvedValue(user);
    const res = await POST(req({ email: user.email, password: "correct-password-123" }));
    expect(res.status).toBe(403);
    expect(padMock).toHaveBeenCalled();
  });

  it("does not pad before basic input validation (missing fields short-circuit first)", async () => {
    const res = await POST(req({ email: "", password: "" }));
    expect(res.status).toBe(400);
    expect(padMock).not.toHaveBeenCalled();
    expect(findUniqueMock).not.toHaveBeenCalled();
  });
});

describe("POST /api/auth/login — tokenVersion is embedded in the issued session", () => {
  it("includes the user's current tokenVersion when issuing a token on successful login", async () => {
    const user = realUser({ tokenVersion: 7 });
    findUniqueMock.mockResolvedValue(user);
    updateMock.mockResolvedValue({});

    const res = await POST(req({ email: user.email, password: "correct-password-123" }));
    expect(res.status).toBe(200);

    const setCookie = res.headers.get("set-cookie") ?? "";
    const match = setCookie.match(/truorigin_session=([^;]+)/);
    expect(match).not.toBeNull();

    const { jwtVerify } = await import("jose");
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(match![1], secret);
    expect(payload.tokenVersion).toBe(7);
  });
});

describe("POST /api/auth/login — ordinary admin login never touches tokenVersion", () => {
  // The ADMIN_EMAIL branch re-hashes and upserts the admin's password on
  // EVERY login with that email (syncing the DB to whatever
  // ADMIN_PASSWORD currently is) — this is not a deliberate password
  // change, so it must never bump tokenVersion, or every normal admin
  // login would log out every other admin session.
  it("the upsert for an ordinary admin login does not set tokenVersion in its update or create data", async () => {
    upsertMock.mockResolvedValue({ id: "admin-1", email: process.env.ADMIN_EMAIL, active: true, tokenVersion: 3 });
    updateMock.mockResolvedValue({});

    const res = await POST(req({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }));
    expect(res.status).toBe(200);

    expect(upsertMock).toHaveBeenCalledTimes(1);
    const [[upsertArgs]] = upsertMock.mock.calls;
    expect(upsertArgs.update).not.toHaveProperty("tokenVersion");
    expect(upsertArgs.create).not.toHaveProperty("tokenVersion");
    // The plain lastLoginAt update afterward must not touch it either.
    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock.mock.calls[0][0].data).not.toHaveProperty("tokenVersion");
  });

  it("carries forward the admin's current tokenVersion into the issued token without changing it", async () => {
    // tokenVersion is already at 3 here (e.g. from an earlier deliberate
    // reset) — an ordinary login must preserve that value, not reset it.
    upsertMock.mockResolvedValue({ id: "admin-1", email: process.env.ADMIN_EMAIL, active: true, tokenVersion: 3 });
    updateMock.mockResolvedValue({});

    const res = await POST(req({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }));
    const setCookie = res.headers.get("set-cookie") ?? "";
    const match = setCookie.match(/truorigin_session=([^;]+)/);

    const { jwtVerify } = await import("jose");
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(match![1], secret);
    expect(payload.tokenVersion).toBe(3);
  });
});
