import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { uploadFile } from "@/lib/blob";
import { isSameOriginRequest } from "@/lib/csrf";

// PDF uploads render every page to an image and rebuild the PDF (see
// lib/pdf-compress.ts) — give that real headroom beyond the platform
// default. Harmless on plans/runtimes that cap lower than this.
export const maxDuration = 60;

/** Brand-only file upload — used by the Add Product and Documents forms. */
export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getCurrentUser();
  if (!user || user.role !== "BRAND" || !user.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  try {
    const result = await uploadFile(file, `brands/${user.brand?.slug ?? user.brandId}`);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 400 });
  }
}
