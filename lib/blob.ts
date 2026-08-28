/**
 * File Storage (Vercel Blob)
 * ----------------------------------------------------------------------
 * Requires BLOB_READ_WRITE_TOKEN in the environment — generate one from
 * the Vercel dashboard (Storage → Blob → Create Store) and set it in .env.
 */

import { put } from "@vercel/blob";
import sharp from "sharp";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

// Raster formats sharp can safely re-encode as WebP. GIF is excluded so animated
// GIFs aren't flattened into a static image.
const WEBP_CONVERTIBLE_TYPES = new Set(["image/jpeg", "image/png"]);

// The browser-reported File.type is client-supplied and trivially spoofable, so it's only
// a first-pass filter. matchesMagicBytes() checks the actual file signature (first bytes)
// against what each allowed MIME type looks like on disk before it's trusted for upload.
function matchesMagicBytes(bytes: Uint8Array, mimeType: string): boolean {
  switch (mimeType) {
    case "image/jpeg":
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case "image/png":
      return (
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47 &&
        bytes[4] === 0x0d &&
        bytes[5] === 0x0a &&
        bytes[6] === 0x1a &&
        bytes[7] === 0x0a
      );
    case "image/webp":
      return (
        bytes[0] === 0x52 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x46 &&
        bytes[8] === 0x57 &&
        bytes[9] === 0x45 &&
        bytes[10] === 0x42 &&
        bytes[11] === 0x50
      );
    case "image/gif":
      return (
        bytes[0] === 0x47 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x38 &&
        (bytes[4] === 0x37 || bytes[4] === 0x39) &&
        bytes[5] === 0x61
      );
    case "application/pdf":
      return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
    default:
      return false;
  }
}

export function assertUploadableFile(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type || "unknown"}. Allowed: JPG, PNG, WEBP, GIF, PDF.`);
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`File is too large (max ${MAX_FILE_BYTES / (1024 * 1024)}MB).`);
  }
}

const TRUSTED_BLOB_HOSTNAME_PATTERN = /(^|\.)public\.blob\.vercel-storage\.com$/;

/** True only for an https URL on our own Vercel Blob storage host — used to reject
 *  brand-supplied fileUrl values that point off-platform before they're trusted/stored. */
export function isTrustedBlobUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && TRUSTED_BLOB_HOSTNAME_PATTERN.test(parsed.hostname);
  } catch {
    return false;
  }
}

export async function uploadFile(file: File, folder: string) {
  assertUploadableFile(file);

  const headerBytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (!matchesMagicBytes(headerBytes, file.type)) {
    throw new Error("File content doesn't match its declared type.");
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("File storage is not configured. Set BLOB_READ_WRITE_TOKEN in the environment.");
  }

  let body: File | Buffer = file;
  let contentType = file.type;
  let filename = file.name;

  if (WEBP_CONVERTIBLE_TYPES.has(file.type)) {
    const original = Buffer.from(await file.arrayBuffer());
    body = await sharp(original).webp({ quality: 82 }).toBuffer();
    contentType = "image/webp";
    filename = filename.replace(/\.[^.]+$/, "") + ".webp";
  }

  const safeName = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const pathname = `${folder}/${Date.now()}-${safeName}`;

  const blob = await put(pathname, body, {
    access: "public",
    token,
    addRandomSuffix: true,
    contentType,
  });

  return { url: blob.url, contentType };
}
