import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { message?: string } | null;

  if (!body?.message?.trim()) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  const brand = await prisma.brand.findUnique({
    where: { id },
    include: { users: { orderBy: { createdAt: "asc" }, take: 1 } },
  });

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  const recipient = brand.users[0]?.email;
  const result = recipient
    ? await sendEmail({
        to: recipient,
        subject: `A message from the TruOrigin team about ${brand.name}`,
        body: body.message.trim(),
      })
    : { sent: false, reason: "Brand has no user account with an email on file" };

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.BRAND_CONTACT,
    targetType: "Brand",
    targetId: id,
    targetLabel: brand.name,
    note: body.message.trim(),
    metadata: { recipient, sent: result.sent, reason: result.reason },
    request,
  });

  return NextResponse.json({ ok: true, ...result });
}
