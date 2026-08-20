import { randomBytes, createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { label?: string } | null;
  if (!body?.label?.trim()) {
    return NextResponse.json({ error: "A label is required" }, { status: 400 });
  }

  const secret = randomBytes(24).toString("base64url");
  const key = `to_live_${secret}`;
  const keyHash = createHash("sha256").update(key).digest("hex");
  const keyPrefix = key.slice(0, 12);

  const apiKey = await prisma.apiKey.create({
    data: {
      label: body.label.trim(),
      keyHash,
      keyPrefix,
      createdById: session.sub,
    },
  });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.API_KEY_CREATE,
    targetType: "ApiKey",
    targetId: apiKey.id,
    targetLabel: apiKey.label,
    request,
  });

  return NextResponse.json({ ok: true, key });
}
