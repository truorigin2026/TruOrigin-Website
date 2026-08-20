import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

/** GET only — Documents/Certificates are view/download only from the admin panel, never edited. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const document = await prisma.certificate.findUnique({ where: { id }, include: { product: true } });
  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.DOCUMENT_DOWNLOAD,
    targetType: "Certificate",
    targetId: id,
    targetLabel: `${document.title} (${document.product.name})`,
    request,
  });

  return NextResponse.redirect(new URL(document.fileUrl, request.url));
}
