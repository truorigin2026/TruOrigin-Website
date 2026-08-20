import { Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterTabs } from "@/components/dashboard/filter-tabs";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";
import type { Prisma } from "../../../../generated/prisma/client";

type SupportPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const SOURCE_TABS = [
  ["ALL", "All"],
  ["BRAND_TICKET", "Brand Tickets"],
  ["CUSTOMER_REPORT", "Customer Reports"],
  ["CONTACT_MESSAGE", "Contact Messages"],
] as const;

const STATUS_TABS = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
const TABLE_HEADERS = ["Source", "Subject", "Contact", "Status", "Priority"];

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  OPEN: "warning",
  IN_PROGRESS: "info",
  RESOLVED: "success",
  CLOSED: "outline",
};

const PRIORITY_VARIANT: Record<string, BadgeVariant> = {
  URGENT: "destructive",
  HIGH: "warning",
  MEDIUM: "outline",
  LOW: "outline",
};

export default async function AdminSupportPage({ searchParams }: SupportPageProps) {
  await requireAdminUser();

  const resolved = (await searchParams) ?? {};
  const source = typeof resolved.source === "string" ? resolved.source.toUpperCase() : "ALL";
  const status = typeof resolved.status === "string" ? resolved.status.toUpperCase() : "ALL";
  const search = typeof resolved.search === "string" ? resolved.search : "";

  const where: Prisma.SupportTicketWhereInput = {
    ...(source !== "ALL" ? { source: source as never } : {}),
    ...(status !== "ALL" ? { status: status as never } : {}),
    ...(search
      ? {
          OR: [
            { subject: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const tickets = await prisma.supportTicket.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { brand: true },
    take: 100,
  });

  const rows = tickets.map((ticket) => ({
    key: ticket.id,
    href: `/admin/support/${ticket.id}`,
    cells: [
      <span key="source" className="text-muted-foreground">
        {ticket.source.replaceAll("_", " ")}
        {ticket.brand ? ` • ${ticket.brand.name}` : ""}
      </span>,
      <span key="subject" className="font-medium">{ticket.subject}</span>,
      ticket.email ?? "No email on file",
      <Badge key="status" variant={STATUS_VARIANT[ticket.status] ?? "outline"}>{ticket.status.replaceAll("_", " ")}</Badge>,
      <Badge key="priority" variant={PRIORITY_VARIANT[ticket.priority] ?? "outline"}>{ticket.priority}</Badge>,
    ],
  }));

  return (
    <>
      <PageHeader
        eyebrow="Admin Support"
        title="Brand tickets, customer reports, and contact messages in one queue."
        description="Every inbound request lands here regardless of source, so nothing falls through the cracks."
      />

      <Card className="mb-5 p-4">
        <form method="GET" className="flex flex-wrap gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input type="text" name="search" defaultValue={search} placeholder="Search by subject, name, or email..." className="h-9 pl-8" />
          </div>
          <input type="hidden" name="source" value={source} />
          <input type="hidden" name="status" value={status} />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <div className="mt-4 grid gap-2">
          <FilterTabs items={SOURCE_TABS.map(([value, label]) => ({ label, href: `/admin/support?source=${value}&status=${status}${search ? `&search=${encodeURIComponent(search)}` : ""}`, active: source === value }))} />
          <FilterTabs items={STATUS_TABS.map((tab) => ({ label: tab, href: `/admin/support?source=${source}&status=${tab}${search ? `&search=${encodeURIComponent(search)}` : ""}`, active: status === tab }))} />
        </div>
      </Card>

      <DataTable headers={TABLE_HEADERS} rows={rows} emptyMessage="No tickets match this filter." />
    </>
  );
}
