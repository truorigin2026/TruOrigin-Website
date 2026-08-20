import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { nextInvoiceNumber } from "@/lib/invoice";

export async function POST(request: NextRequest) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { subscriptionId?: string; amount?: number; notes?: string }
    | null;

  if (!body?.subscriptionId || !body.amount || body.amount <= 0) {
    return NextResponse.json({ error: "subscriptionId and a positive amount are required" }, { status: 400 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { id: body.subscriptionId },
    include: { brand: true },
  });
  if (!subscription) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  }

  const invoiceNumber = await nextInvoiceNumber();
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      subscriptionId: subscription.id,
      brandId: subscription.brandId,
      amount: body.amount,
      notes: body.notes,
    },
  });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.INVOICE_CREATE,
    targetType: "Invoice",
    targetId: invoice.id,
    targetLabel: `${invoiceNumber} (${subscription.brand.name})`,
    request,
  });

  return NextResponse.json({ ok: true, invoice });
}
