import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBrandSession } from "@/lib/api-auth";
import { generateOriginCardTagBuffer } from "@/lib/origincard-tag";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireBrandSession(request);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: cardId } = await params;
  const card = await prisma.originCard.findUnique({ where: { id: cardId }, include: { product: true } });

  if (!card || card.product.brandId !== session.brandId) {
    return NextResponse.json({ error: "OriginCard not found" }, { status: 404 });
  }

  if (!card.product.serialNumber) {
    return NextResponse.json({ error: "This product doesn't have a serial number yet." }, { status: 400 });
  }

  const tagBuffer = await generateOriginCardTagBuffer(card.product.serialNumber);

  return new NextResponse(new Uint8Array(tagBuffer), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${card.product.serialNumber}-origincard-tag.png"`,
      "Cache-Control": "private, no-store",
    },
  });
}
