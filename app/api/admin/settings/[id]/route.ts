import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const setting = await prisma.platformSetting.findUnique({ where: { id } });
  if (!setting) {
    return NextResponse.json({ error: "Setting not found" }, { status: 404 });
  }

  await prisma.platformSetting.delete({ where: { id } });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.SETTINGS_DELETE,
    targetType: "PlatformSetting",
    targetId: id,
    targetLabel: setting.key,
    request,
  });

  return NextResponse.json({ ok: true });
}
