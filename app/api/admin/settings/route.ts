import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

export async function PATCH(request: NextRequest) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { key?: string; value?: unknown } | null;
  if (!body?.key?.trim() || body.value === undefined) {
    return NextResponse.json({ error: "key and value are required" }, { status: 400 });
  }

  const setting = await prisma.platformSetting.upsert({
    where: { key: body.key.trim() },
    update: { value: body.value as never, updatedById: session.sub },
    create: { key: body.key.trim(), value: body.value as never, updatedById: session.sub },
  });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.SETTINGS_UPDATE,
    targetType: "PlatformSetting",
    targetId: setting.id,
    targetLabel: setting.key,
    metadata: { value: body.value },
    request,
  });

  return NextResponse.json({ ok: true, setting });
}
