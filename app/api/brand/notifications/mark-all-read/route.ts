import { NextRequest, NextResponse } from "next/server";
import { requireBrandSession } from "@/lib/api-auth";
import { markAllNotificationsRead } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  const session = await requireBrandSession(request);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await markAllNotificationsRead(session.brandId);

  return NextResponse.json({ ok: true });
}
