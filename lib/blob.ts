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

export function assertUploadableFile(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type || "unknown"}. Allowed: JPG, PNG, WEBP, GIF, PDF.`);
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`File is too large (max ${MAX_FILE_BYTES / (1024 * 1024)}MB).`);
  }
}

export async function uploadFile(file: File, folder: string) {
  assertUploadableFile(file);

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
