import { describe, expect, it } from "vitest";
import { isTrustedBlobUrl } from "./blob";

describe("isTrustedBlobUrl", () => {
  it("accepts an https URL on the Vercel Blob storage host", () => {
    expect(isTrustedBlobUrl("https://abc123.public.blob.vercel-storage.com/brands/foo.webp")).toBe(true);
  });

  it("rejects http (non-https) even on the right host", () => {
    expect(isTrustedBlobUrl("http://abc123.public.blob.vercel-storage.com/brands/foo.webp")).toBe(false);
  });

  it("rejects a different, off-platform host", () => {
    expect(isTrustedBlobUrl("https://evil.example.com/brands/foo.webp")).toBe(false);
  });

  it("rejects a host that merely contains the trusted domain as a substring", () => {
    expect(isTrustedBlobUrl("https://public.blob.vercel-storage.com.evil.com/foo.webp")).toBe(false);
  });

  it("rejects malformed URLs instead of throwing", () => {
    expect(isTrustedBlobUrl("not a url")).toBe(false);
  });
});
