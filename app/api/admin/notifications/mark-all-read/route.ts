import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import { markAllAdminNotificationsRead } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await markAllAdminNotificationsRead();

  return NextResponse.json({ ok: true });
}
