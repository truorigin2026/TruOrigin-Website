import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

type Body = { verified?: boolean; reviewNote?: string };

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const certificate = await prisma.certificate.findUnique({ where: { id }, include: { product: true } });
  if (!certificate) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  const updated = await prisma.certificate.update({
    where: { id },
    data: {
      verified: Boolean(body?.verified),
      reviewNote: body?.reviewNote?.trim() || null,
    },
  });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.CERTIFICATE_REVIEW_UPDATE,
    targetType: "Certificate",
    targetId: id,
    targetLabel: `${certificate.title} (${certificate.product.name})`,
    metadata: { verified: updated.verified },
    note: updated.reviewNote ?? undefined,
    request,
  });

  return NextResponse.json({ ok: true, certificate: updated });
}
