import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";
import type { Prisma } from "../../../../generated/prisma/client";

type AuditLogPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const TABLE_HEADERS = ["Actor", "Action", "Target", "When"];

export default async function AdminAuditLogPage({ searchParams }: AuditLogPageProps) {
  await requireAdminUser();

  const resolved = (await searchParams) ?? {};
  const actorEmail = typeof resolved.actor === "string" ? resolved.actor : "";
  const targetType = typeof resolved.targetType === "string" ? resolved.targetType : "";
  const action = typeof resolved.action === "string" ? resolved.action : "";

  const where: Prisma.AuditLogWhereInput = {
    ...(actorEmail ? { actorEmail: { contains: actorEmail, mode: "insensitive" } } : {}),
    ...(targetType ? { targetType } : {}),
    ...(action ? { action: { contains: action, mode: "insensitive" } } : {}),
  };

  const [entries, targetTypes] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.auditLog.findMany({ distinct: ["targetType"], select: { targetType: true }, orderBy: { targetType: "asc" } }),
  ]);

  const rows = entries.map((entry) => ({
    key: entry.id,
    cells: [
      entry.actorEmail,
      <span key="action" className="font-medium">{entry.action}</span>,
      <span key="target" className="text-muted-foreground">
        {entry.targetType}
        {entry.targetLabel ? ` • ${entry.targetLabel}` : ""}
        {entry.note ? ` • "${entry.note}"` : ""}
      </span>,
      entry.createdAt.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }),
    ],
  }));

  return (
    <>
      <PageHeader
        eyebrow="Admin Settings"
        title="Audit trail of every admin action."
        description="Who did what, to what, and when — filterable by actor, target type, and action. This is the accountability mechanism behind every admin capability on the platform."
      />

      <Card className="mb-5 p-4">
        <form method="GET" className="grid gap-3 md:grid-cols-4">
          <Input type="text" name="actor" defaultValue={actorEmail} placeholder="Filter by actor email..." />
          <select
            name="targetType"
            defaultValue={targetType}
            className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
          >
            <option value="">All target types</option>
            {targetTypes.map((row) => (
              <option key={row.targetType} value={row.targetType}>
                {row.targetType}
              </option>
            ))}
          </select>
          <Input type="text" name="action" defaultValue={action} placeholder="Filter by action (e.g. brand.suspend)..." />
          <Button type="submit" variant="outline">
            Filter
          </Button>
        </form>
      </Card>

      <DataTable headers={TABLE_HEADERS} rows={rows} emptyMessage="No audit log entries match this filter." />
    </>
  );
}
