import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

process.env.JWT_SECRET ??= "test-only-secret-not-for-real-use-0123456789";

const findUniqueMock = vi.fn();
const updateMock = vi.fn();

// Mocked — no database involved, consistent with this audit phase's
// DB-safety restriction (local dev and production share one database).
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
      update: (...args: unknown[]) => updateMock(...args),
    },
  },
}));

let POST: typeof import("./route").POST;

beforeAll(async () => {
  ({ POST } = await import("./route"));
});

let ipCounter = 0;
beforeEach(() => {
  findUniqueMock.mockReset();
  updateMock.mockReset();
  ipCounter += 1; // distinct IP per test so the real rate limiter (shared in-memory state) never interferes
});

function req(body: Record<string, unknown>) {
  return new NextRequest("https://example.test/api/auth/reset-password", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": `10.0.0.${ipCounter}` },
    body: JSON.stringify(body),
  });
}

const STRONG_PASSWORD = "a-valid-new-password-123";
const BASE_USER = {
  id: "user-1",
  role: "BRAND" as const,
  active: true,
  tokenVersion: 0,
  resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
};

describe("POST /api/auth/reset-password", () => {
  it("rejects an invalid token (no matching user) with a generic message", async () => {
    findUniqueMock.mockResolvedValue(null);
    const res = await POST(req({ token: "nonexistent-token", password: STRONG_PASSWORD }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/invalid or has expired/i);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("rejects an expired token with the same generic message", async () => {
    findUniqueMock.mockResolvedValue({ ...BASE_USER, resetTokenExpires: new Date(Date.now() - 1000) });
    const res = await POST(req({ token: "expired-token", password: STRONG_PASSWORD }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/invalid or has expired/i);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("rejects a reused token — consumed once, a second attempt with the same raw token finds no user", async () => {
    // First use: succeeds and (in the real route) clears resetTokenHash.
    findUniqueMock.mockResolvedValueOnce(BASE_USER);
    const first = await POST(req({ token: "one-time-token", password: STRONG_PASSWORD }));
    expect(first.status).toBe(200);
    expect(updateMock).toHaveBeenCalledTimes(1);

    // Second use of the same raw token: findUnique now returns null,
    // since the real DB's resetTokenHash was already cleared by the
    // first request's update — this is what actually prevents reuse.
    findUniqueMock.mockResolvedValueOnce(null);
    const second = await POST(req({ token: "one-time-token", password: STRONG_PASSWORD }));
    expect(second.status).toBe(400);
    expect(updateMock).toHaveBeenCalledTimes(1); // not called again
  });

  it("rejects a token belonging to a non-BRAND user (defense in depth)", async () => {
    findUniqueMock.mockResolvedValue({ ...BASE_USER, role: "ADMIN" });
    const res = await POST(req({ token: "some-token", password: STRONG_PASSWORD }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/invalid or has expired/i);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("rejects a token belonging to a suspended/inactive account", async () => {
    findUniqueMock.mockResolvedValue({ ...BASE_USER, active: false });
    const res = await POST(req({ token: "some-token", password: STRONG_PASSWORD }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/invalid or has expired/i);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("uses the identical error message for every rejection reason (no enumeration via message content)", async () => {
    findUniqueMock.mockResolvedValueOnce(null); // no such token
    const noToken = await POST(req({ token: "a", password: STRONG_PASSWORD }));
    findUniqueMock.mockResolvedValueOnce({ ...BASE_USER, active: false }); // inactive
    const inactive = await POST(req({ token: "b", password: STRONG_PASSWORD }));
    findUniqueMock.mockResolvedValueOnce({ ...BASE_USER, role: "ADMIN" }); // wrong role
    const wrongRole = await POST(req({ token: "c", password: STRONG_PASSWORD }));

    const [m1, m2, m3] = await Promise.all([noToken.json(), inactive.json(), wrongRole.json()]);
    expect(m1.error).toBe(m2.error);
    expect(m2.error).toBe(m3.error);
  });

  it("accepts a valid token, increments tokenVersion, and clears the reset token fields", async () => {
    findUniqueMock.mockResolvedValue(BASE_USER);
    const res = await POST(req({ token: "valid-token", password: STRONG_PASSWORD }));
    expect(res.status).toBe(200);

    expect(updateMock).toHaveBeenCalledTimes(1);
    const [[updateArgs]] = updateMock.mock.calls;
    expect(updateArgs.where).toEqual({ id: BASE_USER.id });
    expect(updateArgs.data.tokenVersion).toEqual({ increment: 1 });
    expect(updateArgs.data.resetTokenHash).toBeNull();
    expect(updateArgs.data.resetTokenExpires).toBeNull();
    expect(updateArgs.data.mustChangePassword).toBe(false);
  });

  it("rejects a weak new password before ever looking up the token", async () => {
    const res = await POST(req({ token: "whatever", password: "short" }));
    expect(res.status).toBe(400);
    expect(findUniqueMock).not.toHaveBeenCalled();
  });
});
