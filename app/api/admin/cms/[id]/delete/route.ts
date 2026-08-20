import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const item = await prisma.cmsContent.findUnique({ where: { id } });
  if (!item) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  await prisma.cmsContent.delete({ where: { id } });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.CMS_DELETE,
    targetType: "CmsContent",
    targetId: id,
    targetLabel: item.title,
    request,
  });

  return NextResponse.json({ ok: true });
}
