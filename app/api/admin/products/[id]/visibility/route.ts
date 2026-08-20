import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

type VisibilityAction = "HIDE" | "UNHIDE" | "ARCHIVE" | "UNARCHIVE";

const ACTION_TO_AUDIT = {
  HIDE: AUDIT_ACTIONS.PRODUCT_HIDE,
  UNHIDE: AUDIT_ACTIONS.PRODUCT_UNHIDE,
  ARCHIVE: AUDIT_ACTIONS.PRODUCT_ARCHIVE,
  UNARCHIVE: AUDIT_ACTIONS.PRODUCT_UNARCHIVE,
} as const;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { action?: VisibilityAction } | null;

  if (!body?.action || !(body.action in ACTION_TO_AUDIT)) {
    return NextResponse.json({ error: "Missing or invalid action" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const data =
    body.action === "HIDE"
      ? { hidden: true }
      : body.action === "UNHIDE"
        ? { hidden: false }
        : body.action === "ARCHIVE"
          ? { archived: true, archivedAt: new Date() }
          : { archived: false, archivedAt: null };

  const updated = await prisma.product.update({ where: { id }, data });

  await logAudit({
    actor: session,
    action: ACTION_TO_AUDIT[body.action],
    targetType: "Product",
    targetId: id,
    targetLabel: product.name,
    request,
  });

  return NextResponse.json({ ok: true, product: updated });
}
