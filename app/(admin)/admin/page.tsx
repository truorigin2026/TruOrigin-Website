import Link from "next/link";
import {
  ClipboardCheck,
  Building2,
  Package,
  IdCard,
  CreditCard,
  QrCode,
  DollarSign,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatGrid, StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { ScanActivityChart } from "@/components/dashboard/scan-activity-chart";
import { prisma } from "@/lib/prisma";
import { getDailyScanCounts } from "@/lib/analytics";
import { formatMoney } from "@/lib/utils/money";

const TABLE_HEADERS = ["Brand", "Product", "Category", "Status", "Updated"];

export default async function AdminDashboardPage() {
  const [
    pending,
    approved,
    rejected,
    brands,
    originCards,
    activeSubscriptions,
    qrScans,
    revenueAgg,
    latestSubmissions,
    dailyScans,
  ] = await Promise.all([
    prisma.product.count({ where: { status: "SUBMITTED" } }),
    prisma.product.count({ where: { status: "APPROVED" } }),
    prisma.product.count({ where: { status: "REJECTED" } }),
    prisma.brand.count({ where: { deletedAt: null } }),
    prisma.originCard.count(),
    prisma.subscription.count({ where: { status: { in: ["ACTIVE", "TRIALING"] } } }),
    prisma.scanEvent.count(),
    prisma.invoice.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
    prisma.product.findMany({
      where: { status: { in: ["SUBMITTED", "IN_REVIEW"] } },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { brand: true, category: true },
    }),
    getDailyScanCounts(30),
  ]);

  const revenue = formatMoney(revenueAgg._sum.amount ?? 0);

  return (
    <>
      <PageHeader
        eyebrow="Admin Dashboard"
        title="Review products, approve evidence, and issue QR-ready records."
        description="A live view of submissions, approvals, and what's ready to publish."
      />

      <StatGrid>
        <StatCard icon={ClipboardCheck} label="Pending Reviews" value={pending} detail="Waiting for admin action" />
        <StatCard icon={Building2} label="Total Brands" value={brands} detail="Workspace accounts" />
        <StatCard icon={Package} label="Total Products" value={approved + rejected + pending} detail={`${approved} live, ${rejected} rejected`} />
        <StatCard icon={IdCard} label="OriginCards" value={originCards} detail="Across all products" />
        <StatCard icon={CreditCard} label="Active Subscriptions" value={activeSubscriptions} detail="Active or trialing" />
        <StatCard icon={QrCode} label="QR Scans" value={qrScans} detail="All-time scan events" />
        <StatCard icon={DollarSign} label="Revenue" value={revenue} detail="Paid invoices" />
        <StatCard icon={XCircle} label="Rejected" value={rejected} detail="Needs brand resubmission" />
      </StatGrid>

      <div className="mt-6">
        <ScanActivityChart data={dailyScans} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-heading text-base font-bold">Recent submissions</h2>
            <Button variant="outline" size="sm" render={<Link href="/admin/review" />} nativeButton={false}>
              Open Review Queue
            </Button>
          </div>
          <DataTable
            headers={TABLE_HEADERS}
            rows={latestSubmissions.map((p) => ({
              key: p.id,
              href: `/admin/review/${p.id}`,
              cells: [
                <span key="brand" className="text-muted-foreground">{p.brand.name}</span>,
                <span key="product" className="font-medium">{p.name}</span>,
                p.category.name,
                <Badge key="status" variant={p.status === "IN_REVIEW" ? "info" : "warning"}>
                  {p.status.replaceAll("_", " ")}
                </Badge>,
                p.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              ],
            }))}
            emptyMessage="No products are in review yet. When brands submit products, they'll appear here for approval."
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Owner Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2.5">
            {[
              "Open a product submission and approve or reject it.",
              "Generate the serial number and QR once the product is approved.",
              "Check which brands are active and which are still pending review.",
            ].map((item) => (
              <div key={item} className="rounded-lg bg-muted px-3.5 py-3 text-sm leading-relaxed text-foreground">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
