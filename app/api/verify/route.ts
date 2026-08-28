/**
 * GET /api/verify?serial=TRU10101
 * ----------------------------------------------------------------------
 * This is what a scanned QR code, or a manually-entered serial number,
 * resolves to. It's already wired to the repository layer today (static
 * data) — when Phase 2 lands, only lib/data/repository.ts changes, this
 * route does not.
 */

import { NextRequest, NextResponse } from "next/server";
import { getProductBySerial } from "@/lib/data/repository";
import { prisma } from "@/lib/prisma";
import { recordScanEvent } from "@/lib/analytics";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const rateLimit = checkRateLimit(`verify:${getClientIp(request)}`, 30, 60 * 1000);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

  const serial = request.nextUrl.searchParams.get("serial");

  if (!serial) {
    return NextResponse.json({ error: "Missing ?serial= query param" }, { status: 400 });
  }

  const product = await getProductBySerial(serial);

  if (!product) {
    return NextResponse.json(
      { error: "No product found for this serial number", verified: false },
      { status: 404 },
    );
  }

  const dbProduct = await prisma.product.findUnique({ where: { slug: product.slug }, select: { id: true } });
  if (dbProduct) {
    await recordScanEvent({
      productId: dbProduct.id,
      source: request.nextUrl.searchParams.get("source") ?? "serial-search",
      request,
    });
  }

  return NextResponse.json({
    verified: true,
    product: {
      name: product.name,
      brand: product.brand,
      slug: product.slug,
      category: product.category,
      claims: product.claims,
    },
  });
}
