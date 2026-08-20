import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SubscriptionForm } from "@/components/admin/subscription-form";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

const TABLE_HEADERS = ["Brand", "Plan", "Status", "Renews"];

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  ACTIVE: "success",
  TRIALING: "info",
  PAST_DUE: "warning",
  CANCELED: "outline",
  EXPIRED: "destructive",
};

export default async function AdminSubscriptionsPage() {
  await requireAdminUser();

  const [subscriptions, brands, plans] = await Promise.all([
    prisma.subscription.findMany({
      orderBy: { createdAt: "desc" },
      include: { brand: true, plan: true },
      take: 100,
    }),
    prisma.brand.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.plan.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const rows = subscriptions.map((sub) => ({
    key: sub.id,
    href: `/admin/subscriptions/${sub.id}`,
    cells: [
      <span key="brand" className="font-medium">{sub.brand.name}</span>,
      sub.plan.name,
      <Badge key="status" variant={STATUS_VARIANT[sub.status] ?? "outline"}>{sub.status}</Badge>,
      sub.currentPeriodEnd ? sub.currentPeriodEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
    ],
  }));

  return (
    <>
      <PageHeader
        eyebrow="Admin Billing"
        title="Subscriptions across every brand."
        description="Manage plan status, renewals, and cancellations. Payments are recorded manually — no payment gateway is wired up yet."
      />

      <Card className="mb-5">
        <CardHeader>
          <CardTitle>New Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionForm brands={brands} plans={plans} />
        </CardContent>
      </Card>

      <DataTable headers={TABLE_HEADERS} rows={rows} emptyMessage="No subscriptions yet." />
    </>
  );
}
