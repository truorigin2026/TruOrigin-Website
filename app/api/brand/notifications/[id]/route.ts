import { NextRequest, NextResponse } from "next/server";
import { requireBrandSession } from "@/lib/api-auth";
import { markNotificationRead } from "@/lib/notifications";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireBrandSession(request);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await markNotificationRead(id, session.brandId);

  return NextResponse.json({ ok: true });
}
