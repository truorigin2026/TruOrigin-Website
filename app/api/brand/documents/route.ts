import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBrandSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

const DOC_TYPES = new Set(["CERTIFICATE", "LAB_REPORT", "INGREDIENT_LIST", "SOURCING_PROOF", "OTHER"]);

export async function POST(request: NextRequest) {
  const session = await requireBrandSession(request);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { productId?: string; title?: string; docType?: string; fileUrl?: string; mimeType?: string }
    | null;

  if (!body?.productId || !body.title?.trim() || !body.fileUrl?.trim() || !body.docType || !DOC_TYPES.has(body.docType)) {
    return NextResponse.json({ error: "productId, title, docType, and an uploaded file are required" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: body.productId } });
  if (!product || product.brandId !== session.brandId) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const certificate = await prisma.certificate.create({
    data: {
      product: { connect: { id: product.id } },
      title: body.title.trim(),
      fileUrl: body.fileUrl,
      docType: body.docType as never,
      mimeType: body.mimeType,
    },
  });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.DOCUMENT_UPLOAD,
    targetType: "Certificate",
    targetId: certificate.id,
    targetLabel: certificate.title,
    metadata: { productId: product.id },
    request,
  });

  return NextResponse.json({ ok: true, certificate });
}
