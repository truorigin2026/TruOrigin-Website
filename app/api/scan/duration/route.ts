import { NextRequest, NextResponse } from "next/server";
import { recordViewDuration } from "@/lib/analytics";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(`scan-duration:${getClientIp(request)}`, 60, 60 * 1000);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

  const body = (await request.json().catch(() => null)) as
    | { sessionId?: string; productId?: string; viewDurationMs?: number }
    | null;

  if (!body?.sessionId || !body?.productId || typeof body.viewDurationMs !== "number") {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  try {
    await recordViewDuration({
      sessionId: body.sessionId,
      productId: body.productId,
      viewDurationMs: Math.max(0, Math.round(body.viewDurationMs)),
    });
  } catch {
    // Fire-and-forget shopper telemetry — never surface a failure to the client.
  }

  return NextResponse.json({ ok: true });
}
