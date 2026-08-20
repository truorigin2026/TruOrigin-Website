import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const updated = await prisma.invoice.update({ where: { id }, data: { status: "FAILED" } });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.INVOICE_MARK_FAILED,
    targetType: "Invoice",
    targetId: id,
    targetLabel: invoice.invoiceNumber,
    request,
  });

  return NextResponse.json({ ok: true, invoice: updated });
}
