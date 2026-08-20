"use client";

/**
 * Single shared upload primitive for /api/upload (Vercel Blob) — was
 * reimplemented separately in product-form.tsx (twice) and
 * document-upload-form.tsx. Presentation (drag zones, per-item state,
 * grids) still lives in each component; this just de-duplicates the fetch.
 */
export function useFileUpload() {
  async function uploadFile(file: File): Promise<{ url: string; contentType: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/upload", { method: "POST", body: formData });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error ?? "Upload failed");
    }

    return response.json();
  }

  return { uploadFile };
}
