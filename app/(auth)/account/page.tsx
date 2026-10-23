import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, CheckCircle2, Clock, AlertTriangle, LogOut, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getNeedsAttention } from "@/lib/notifications";
import { MountFadeIn } from "@/components/motion";
import { StatGrid, StatCard } from "@/components/dashboard/stat-card";
import { DataTable, type TableRowData } from "@/components/dashboard/data-table";
import { ActivityList, ActivityRow } from "@/components/dashboard/activity-list";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TABLE_HEADERS = ["Product", "Category", "Serial", "Status", "Updated"];

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  APPROVED: "success",
  REJECTED: "destructive",
  IN_REVIEW: "info",
  SUBMITTED: "warning",
  DRAFT: "outline",
};

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "BRAND" || !user.brandId) {
    redirect("/login");
  }

  const [brand, totalProducts, liveProducts, pendingProducts, recentProducts, needsAttention] = await Promise.all([
    prisma.brand.findUnique({ where: { id: user.brandId } }),
    prisma.product.count({ where: { brandId: user.brandId } }),
    prisma.product.count({ where: { brandId: user.brandId, status: "APPROVED" } }),
    prisma.product.count({
      where: { brandId: user.brandId, status: { in: ["DRAFT", "SUBMITTED", "IN_REVIEW"] } },
    }),
    prisma.product.findMany({
      where: { brandId: user.brandId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { category: true },
    }),
    getNeedsAttention(user.brandId),
  ]);

  if (!brand) {
    redirect("/login");
  }

  const statusLabel =
    brand.status === "ACTIVE" ? "Approved" : brand.status === "SUSPENDED" ? "Suspended" : "Pending review";
  const statusVariant: BadgeVariant = brand.status === "ACTIVE" ? "success" : brand.status === "SUSPENDED" ? "destructive" : "warning";

  const rows: TableRowData[] = recentProducts.map((product) => ({
    key: product.id,
    href: `/brand/products/${product.id}`,
    cells: [
      <span key="product" className="font-medium">
        {product.name}
      </span>,
      product.category.name,
      <span key="serial" className="text-muted-foreground">
        {product.serialNumber ?? "Pending"}
      </span>,
      <Badge key="status" variant={STATUS_VARIANT[product.status] ?? "outline"}>
        {product.status.replaceAll("_", " ")}
      </Badge>,
      product.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    ],
  }));

  return (
    <div data-dashboard className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
        <MountFadeIn className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold tracking-tight text-foreground">TruOrigin</p>
          <form action="/api/auth/logout" method="post">
            <Button variant="ghost" size="sm" type="submit">
              <LogOut size={14} />
              Log out
            </Button>
          </form>
        </MountFadeIn>

        <MountFadeIn delay={0.06} className="mt-8 flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">Brand Portal</p>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Welcome back, {brand.name}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Logged in as <span className="font-medium text-foreground">{user.email}</span>. Keep your product
              information organized and ready for admin review.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono text-xs">{brand.slug}</span>
              <span aria-hidden>·</span>
              <Badge variant={statusVariant}>{statusLabel}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button render={<Link href="/brand/products/new" />} nativeButton={false}>
              Add Product
            </Button>
            <Button variant="outline" render={<Link href="/brand/dashboard" />} nativeButton={false}>
              Open Dashboard
              <ArrowRight size={14} />
            </Button>
          </div>
        </MountFadeIn>

        <MountFadeIn delay={0.12} className="mt-8">
          <StatGrid>
            <StatCard icon={Package} label="Total Products" value={totalProducts} detail="All workspace records" />
            <StatCard icon={CheckCircle2} label="Ready Live" value={liveProducts} detail="Approved and public" />
            <StatCard icon={Clock} label="Needs Review" value={pendingProducts} detail="Draft, submitted, or in review" />
          </StatGrid>
        </MountFadeIn>

        {needsAttention.length > 0 && (
          <MountFadeIn delay={0.18} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-500" />
                  Needs Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityList>
                  {needsAttention.slice(0, 3).map((item) => (
                    <ActivityRow key={item.id} title={item.message} detail={item.detail} href={item.href} />
                  ))}
                </ActivityList>
              </CardContent>
            </Card>
          </MountFadeIn>
        )}

        <MountFadeIn delay={needsAttention.length > 0 ? 0.24 : 0.18} className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-heading text-base font-bold">Recent Products</h2>
            <Button variant="outline" size="sm" render={<Link href="/brand/products" />} nativeButton={false}>
              View All
            </Button>
          </div>
          <DataTable
            headers={TABLE_HEADERS}
            rows={rows}
            emptyMessage="No products yet. Add your first product to start building QR-ready tags and public pages."
          />
        </MountFadeIn>
      </div>
    </div>
  );
}
