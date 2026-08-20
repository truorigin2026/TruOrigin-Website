import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

type PatchBody = {
  status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  resolutionNote?: string;
};

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as PatchBody | null;

  const ticket = await prisma.supportTicket.findUnique({ where: { id } });
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const updated = await prisma.supportTicket.update({
    where: { id },
    data: {
      status: body?.status ?? ticket.status,
      priority: body?.priority ?? ticket.priority,
      resolutionNote: body?.resolutionNote ?? ticket.resolutionNote,
      resolvedAt: body?.status === "RESOLVED" ? new Date() : ticket.resolvedAt,
      assignedToId: ticket.assignedToId ?? session.sub,
    },
  });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.TICKET_UPDATE,
    targetType: "SupportTicket",
    targetId: id,
    targetLabel: ticket.subject,
    metadata: { status: updated.status, priority: updated.priority },
    request,
  });

  return NextResponse.json({ ok: true, ticket: updated });
}
