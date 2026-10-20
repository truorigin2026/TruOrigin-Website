import { describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (path: string) => revalidatePath(path) }));

const { revalidatePublicProduct } = await import("./revalidate");

// Unit-level coverage for *which paths get targeted* — this is not a
// regression test for the actual Next.js caching bug documented in
// app/(public)/p/[slug]/page.tsx (whether revalidatePath() actually
// busts the cache for a notFound()-transitioning page). That behavior
// is a real Next.js server/runtime characteristic, not something these
// pure path-construction calls exercise, and verifying it requires an
// integration/E2E test against a running built server (this project
// doesn't have that kind of test infrastructure yet — see the CI/test
// follow-up in the audit report). What this guards against is a
// regression in which public paths get targeted, e.g. someone "simplifying"
// this function and silently dropping the serialNumber variant again,
// which is the exact mistake the very first version of this fix made.
describe("revalidatePublicProduct", () => {
  it("always revalidates both public listing pages", () => {
    revalidatePath.mockClear();
    revalidatePublicProduct({});
    expect(revalidatePath).toHaveBeenCalledWith("/for-products/home");
    expect(revalidatePath).toHaveBeenCalledWith("/for-products/products");
  });

  it("revalidates both the slug and its uppercased form when a slug is given", () => {
    revalidatePath.mockClear();
    revalidatePublicProduct({ slug: "organic-rose-cream" });
    expect(revalidatePath).toHaveBeenCalledWith("/p/organic-rose-cream");
    expect(revalidatePath).toHaveBeenCalledWith("/p/ORGANIC-ROSE-CREAM");
  });

  it("revalidates the serial number path — the identifier every product card actually links to", () => {
    revalidatePath.mockClear();
    revalidatePublicProduct({ serialNumber: "TRU42" });
    expect(revalidatePath).toHaveBeenCalledWith("/p/TRU42");
  });

  it("revalidates both identifiers when both are known", () => {
    revalidatePath.mockClear();
    revalidatePublicProduct({ slug: "organic-rose-cream", serialNumber: "TRU42" });
    const calledPaths = revalidatePath.mock.calls.map((call) => call[0]);
    expect(calledPaths).toEqual(
      expect.arrayContaining(["/p/organic-rose-cream", "/p/ORGANIC-ROSE-CREAM", "/p/TRU42"]),
    );
  });

  it("does not call a /p/ path when neither identifier is known", () => {
    revalidatePath.mockClear();
    revalidatePublicProduct({});
    const calledPaths = revalidatePath.mock.calls.map((call) => call[0]);
    expect(calledPaths.some((p) => p.startsWith("/p/"))).toBe(false);
  });
});
