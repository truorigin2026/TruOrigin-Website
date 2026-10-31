import { NextRequest, NextResponse } from "next/server";
import { requireBrandSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/blob";

// PDF uploads render every page to an image and rebuild the PDF (see
// lib/pdf-compress.ts) — give that real headroom beyond the platform
// default. Harmless on plans/runtimes that cap lower than this.
export const maxDuration = 60;

/**
 * Brand-only file upload — used by the Add Product and Documents forms.
 *
 * requireBrandSession (shared with every other app/api/brand/** route)
 * replaces the bespoke getCurrentUser() + manual role check this route used
 * to have: that check only confirmed a BRAND session existed, never that
 * the account was still active or the brand hadn't been suspended since
 * the token was issued -- a deactivated user or a user on a suspended
 * brand could still upload files here even though every other brand route
 * would already reject them. requireBrandSession also covers the
 * same-origin (CSRF) check this route previously did by hand.
 */
export async function POST(request: NextRequest) {
  const session = await requireBrandSession(request);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  // requireBrandSession only confirms the brand exists and isn't
  // suspended -- it doesn't return the brand's slug, which the storage
  // path below uses for a human-readable folder (same as the original
  // getCurrentUser()-based version). One narrow, non-authorization read.
  const brand = await prisma.brand.findUnique({ where: { id: session.brandId }, select: { slug: true } });

  try {
    const result = await uploadFile(file, `brands/${brand?.slug ?? session.brandId}`);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 400 });
  }
}
