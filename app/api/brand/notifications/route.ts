import { NextRequest, NextResponse } from "next/server";
import { requireBrandSession } from "@/lib/api-auth";
import { getNotifications } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  const session = await requireBrandSession(request);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await getNotifications(session.brandId, 8);
  return NextResponse.json({ notifications });
}
