import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TicketActions } from "@/components/admin/ticket-actions";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/50 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export default async function AdminSupportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminUser();
  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({ where: { id }, include: { brand: true } });
  if (!ticket) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin Support"
        title={ticket.subject}
        description={`${ticket.source.replaceAll("_", " ")}${ticket.brand ? ` • ${ticket.brand.name}` : ""}`}
      />

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Message</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              <InfoTile label="From" value={`${ticket.name ?? "Unknown"}${ticket.email ? ` • ${ticket.email}` : ""}`} />
              <InfoTile label="Received" value={ticket.createdAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} />
            </div>
            <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{ticket.message}</p>
            {ticket.resolutionNote ? (
              <div className="mt-5 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm">
                <p className="font-semibold text-foreground">Resolution note</p>
                <p className="mt-1 text-muted-foreground">{ticket.resolutionNote}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update this ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <TicketActions ticket={{ id: ticket.id, status: ticket.status, priority: ticket.priority }} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
