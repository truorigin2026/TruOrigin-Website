import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordScanEvent } from "@/lib/analytics";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

const TRACKABLE_EVENT_TYPES = ["VIEW", "CLAIM_VIEW", "CERTIFICATE_VIEW"] as const;
type TrackableEventType = (typeof TRACKABLE_EVENT_TYPES)[number];

function isTrackableEventType(value: unknown): value is TrackableEventType {
  return typeof value === "string" && (TRACKABLE_EVENT_TYPES as readonly string[]).includes(value);
}

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(`scan:${getClientIp(request)}`, 60, 60 * 1000);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

  const body = (await request.json().catch(() => null)) as
    | {
        productId?: string;
        eventType?: string;
        claimId?: string;
        certificateId?: string;
        sessionId?: string;
      }
    | null;

  if (!body?.productId || !isTrackableEventType(body.eventType)) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  try {
    const product = await prisma.product.findUnique({ where: { id: body.productId }, select: { id: true } });
    if (!product) {
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    if (body.claimId) {
      const claim = await prisma.claim.findUnique({ where: { id: body.claimId }, select: { productId: true } });
      if (!claim || claim.productId !== product.id) {
        return NextResponse.json({ ok: false }, { status: 200 });
      }
    }

    if (body.certificateId) {
      const certificate = await prisma.certificate.findUnique({
        where: { id: body.certificateId },
        select: { productId: true },
      });
      if (!certificate || certificate.productId !== product.id) {
        return NextResponse.json({ ok: false }, { status: 200 });
      }
    }

    await recordScanEvent({
      productId: product.id,
      eventType: body.eventType,
      claimId: body.claimId,
      certificateId: body.certificateId,
      sessionId: body.sessionId,
      request,
    });
  } catch {
    // Fire-and-forget shopper telemetry — never surface a failure to the client.
  }

  return NextResponse.json({ ok: true });
}
