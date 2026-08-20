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
  const apiKey = await prisma.apiKey.findUnique({ where: { id } });
  if (!apiKey) {
    return NextResponse.json({ error: "API key not found" }, { status: 404 });
  }

  const updated = await prisma.apiKey.update({ where: { id }, data: { revokedAt: new Date() } });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.API_KEY_REVOKE,
    targetType: "ApiKey",
    targetId: id,
    targetLabel: apiKey.label,
    request,
  });

  return NextResponse.json({ ok: true, apiKey: updated });
}
