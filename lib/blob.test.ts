import { describe, expect, it } from "vitest";
import { assertUploadableFile, isTrustedBlobUrl, matchesMagicBytes } from "./blob";

const SIGNATURES = {
  "image/jpeg": [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01],
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d],
  "image/webp": [0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50],
  "image/gif": [0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
  "application/pdf": [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x00, 0x00, 0x00, 0x00],
} as const;

describe("matchesMagicBytes", () => {
  for (const [mimeType, bytes] of Object.entries(SIGNATURES)) {
    it(`accepts real ${mimeType} file-signature bytes`, () => {
      expect(matchesMagicBytes(new Uint8Array(bytes), mimeType)).toBe(true);
    });
  }

  it("rejects a spoofed MIME type: real PNG bytes declared as image/jpeg", () => {
    expect(matchesMagicBytes(new Uint8Array(SIGNATURES["image/png"]), "image/jpeg")).toBe(false);
  });

  it("rejects a spoofed MIME type: real PDF bytes declared as an image type", () => {
    expect(matchesMagicBytes(new Uint8Array(SIGNATURES["application/pdf"]), "image/png")).toBe(false);
    expect(matchesMagicBytes(new Uint8Array(SIGNATURES["application/pdf"]), "image/jpeg")).toBe(false);
  });

  it("rejects an executable's bytes declared as any allowed type (not just images)", () => {
    // MZ header — a Windows PE executable, the classic "renamed .exe to
    // .jpg" upload-bypass attempt.
    const exeBytes = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00]);
    for (const mimeType of Object.keys(SIGNATURES)) {
      expect(matchesMagicBytes(exeBytes, mimeType)).toBe(false);
    }
  });

  it("rejects an unrecognized declared MIME type outright, regardless of bytes", () => {
    expect(matchesMagicBytes(new Uint8Array(SIGNATURES["image/png"]), "application/x-sh")).toBe(false);
  });

  it("does not throw on a too-short byte array", () => {
    expect(() => matchesMagicBytes(new Uint8Array([0xff]), "image/jpeg")).not.toThrow();
    expect(matchesMagicBytes(new Uint8Array([0xff]), "image/jpeg")).toBe(false);
  });
});

function fakeFile(type: string, sizeBytes: number): File {
  return { type, size: sizeBytes } as File;
}

describe("assertUploadableFile", () => {
  it("accepts an allowed type under the size limit", () => {
    expect(() => assertUploadableFile(fakeFile("image/png", 1024))).not.toThrow();
  });

  it("rejects a disallowed declared type (e.g. a script or executable MIME type)", () => {
    expect(() => assertUploadableFile(fakeFile("application/x-sh", 1024))).toThrow(/Unsupported file type/);
    expect(() => assertUploadableFile(fakeFile("application/x-msdownload", 1024))).toThrow(/Unsupported file type/);
  });

  it("rejects a file over the 10MB limit even with an allowed type", () => {
    expect(() => assertUploadableFile(fakeFile("image/png", 10 * 1024 * 1024 + 1))).toThrow(/too large/);
  });

  it("accepts a file exactly at the 10MB boundary", () => {
    expect(() => assertUploadableFile(fakeFile("image/png", 10 * 1024 * 1024))).not.toThrow();
  });
});

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
