import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { key?: string; subject?: string; body?: string } | null;
  if (!body?.key?.trim() || !body.subject?.trim() || !body.body?.trim()) {
    return NextResponse.json({ error: "key, subject, and body are required" }, { status: 400 });
  }

  const template = await prisma.emailTemplate.upsert({
    where: { key: body.key.trim() },
    update: { subject: body.subject.trim(), body: body.body.trim() },
    create: { key: body.key.trim(), subject: body.subject.trim(), body: body.body.trim() },
  });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.EMAIL_TEMPLATE_UPDATE,
    targetType: "EmailTemplate",
    targetId: template.id,
    targetLabel: template.key,
    request,
  });

  return NextResponse.json({ ok: true, template });
}
