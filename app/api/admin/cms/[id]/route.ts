import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as
    | { title?: string; slug?: string; subtitle?: string; excerpt?: string; body?: string; category?: string }
    | null;

  const item = await prisma.cmsContent.findUnique({ where: { id } });
  if (!item) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  const updated = await prisma.cmsContent.update({
    where: { id },
    data: {
      title: body?.title?.trim() || item.title,
      slug: body?.slug?.trim() || item.slug,
      subtitle: body?.subtitle,
      excerpt: body?.excerpt,
      body: body?.body,
      category: body?.category,
    },
  });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.CMS_UPDATE,
    targetType: "CmsContent",
    targetId: id,
    targetLabel: updated.title,
    request,
  });

  return NextResponse.json({ ok: true, content: updated });
}
