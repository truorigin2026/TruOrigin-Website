import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

type Body = { ingredients?: { name?: string; note?: string }[] };

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  const ingredients = (body?.ingredients ?? []).filter((i) => i.name?.trim());

  const result = await prisma.$transaction(async (tx) => {
    await tx.ingredient.deleteMany({ where: { productId: id } });
    await tx.product.update({
      where: { id },
      data: {
        ingredients: {
          create: ingredients.map((i) => ({ name: i.name!.trim(), note: i.note?.trim() || null })),
        },
      },
    });
    return tx.ingredient.findMany({ where: { productId: id }, orderBy: { name: "asc" } });
  });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.PRODUCT_INGREDIENTS_UPDATE,
    targetType: "Product",
    targetId: id,
    targetLabel: product.name,
    metadata: { ingredientCount: result.length },
    request,
  });

  return NextResponse.json({ ok: true, ingredients: result });
}
