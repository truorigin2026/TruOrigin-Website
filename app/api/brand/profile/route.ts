import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBrandSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

export async function PATCH(request: NextRequest) {
  const session = await requireBrandSession(request);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const actor = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!actor || (actor.brandRole !== "OWNER" && actor.brandRole !== "ADMIN")) {
    return NextResponse.json({ error: "Only a team owner or admin can edit the brand profile." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { name?: string; logoUrl?: string; summary?: string } | null;

  if (!body?.name?.trim()) {
    return NextResponse.json({ error: "Brand name is required." }, { status: 400 });
  }

  const updated = await prisma.brand.update({
    where: { id: session.brandId },
    data: {
      name: body.name.trim(),
      logoUrl: body.logoUrl?.trim() || null,
      summary: body.summary?.trim() || null,
    },
  });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.BRAND_PROFILE_UPDATE,
    targetType: "Brand",
    targetId: updated.id,
    targetLabel: updated.name,
    request,
  });

  return NextResponse.json({ ok: true, brand: updated });
}
