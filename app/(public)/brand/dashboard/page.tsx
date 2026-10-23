import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, CheckCircle2, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatGrid, StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/dashboard/data-table";
import { ActivityList, ActivityRow } from "@/components/dashboard/activity-list";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { requireBrandUser } from "@/lib/session";
import { getNeedsAttention, getRecentActivity } from "@/lib/notifications";

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  APPROVED: "success",
  REJECTED: "destructive",
  IN_REVIEW: "info",
  SUBMITTED: "warning",
  DRAFT: "outline",
};

const TABLE_HEADERS = ["Product", "Category", "Serial", "Status", "Updated"];

export default async function BrandDashboardPage() {
  const user = await requireBrandUser();
  const brandId = user.brandId as string;

  const [brand, totalProducts, approvedProducts, pendingProducts, recentProducts, needsAttention, recentActivity] = await Promise.all([
    prisma.brand.findUnique({ where: { id: brandId } }),
    prisma.product.count({ where: { brandId } }),
    prisma.product.count({ where: { brandId, status: "APPROVED" } }),
    prisma.product.count({
      where: { brandId, status: { in: ["DRAFT", "SUBMITTED", "IN_REVIEW"] } },
    }),
    prisma.product.findMany({
      where: { brandId },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { category: true },
    }),
    getNeedsAttention(brandId),
    getRecentActivity(brandId, 6),
  ]);

  if (!brand) {
    redirect("/login");
  }

  const completionRate = totalProducts > 0 ? Math.round((approvedProducts / totalProducts) * 100) : 0;

  const rows = recentProducts.map((p) => ({
    key: p.id,
    href: `/brand/products/${p.id}`,
    cells: [
      <span key="product" className="font-medium">{p.name}</span>,
      p.category.name,
      <span key="serial" className="text-muted-foreground">{p.serialNumber ?? "Pending"}</span>,
      <Badge key="status" variant={STATUS_VARIANT[p.status] ?? "outline"}>{p.status.replaceAll("_", " ")}</Badge>,
      p.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    ],
  }));

  return (
    <>
      <PageHeader
        eyebrow="Brand Dashboard"
        title={`${brand.name} workspace`}
        description="Track product readiness, approval status, and how much of your catalog is already live."
        actions={
          <Button render={<Link href="/brand/products/new" />} nativeButton={false}>
            Add Product
          </Button>
        }
      />

      <StatGrid>
        <StatCard icon={Package} label="Products Total" value={totalProducts} detail="Workspace records" />
        <StatCard icon={CheckCircle2} label="Approved Live" value={approvedProducts} detail="Ready for public access" />
        <StatCard icon={Clock} label="Pending Review" value={pendingProducts} detail="Needs admin action" />
        <StatCard icon={TrendingUp} label="Completion" value={`${completionRate}%`} detail="Approved vs total" />
      </StatGrid>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-heading text-base font-bold">Recent product records</h2>
            <Button variant="outline" size="sm" render={<Link href="/brand/products" />} nativeButton={false}>
              View All Products
            </Button>
          </div>
          <DataTable
            headers={TABLE_HEADERS}
            rows={rows}
            emptyMessage="You have no products yet. Start with your first upload and the admin workflow will pick it up from there."
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {needsAttention.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing needs your attention right now.</p>
            ) : (
              <ActivityList>
                {needsAttention.slice(0, 6).map((item) => (
                  <ActivityRow key={item.id} title={item.message} detail={item.detail} href={item.href} />
                ))}
              </ActivityList>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <ActivityList>
                {recentActivity.map((item) => (
                  <ActivityRow
                    key={item.id}
                    title={item.message}
                    detail={item.detail}
                    meta={item.createdAt.toLocaleDateString()}
                  />
                ))}
              </ActivityList>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
