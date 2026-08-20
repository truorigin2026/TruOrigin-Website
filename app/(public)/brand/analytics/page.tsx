import { QrCode, Users, Eye, Clock } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatGrid, StatCard } from "@/components/dashboard/stat-card";
import { DataTable } from "@/components/dashboard/data-table";
import { ScanActivityChart } from "@/components/dashboard/scan-activity-chart";
import { CustomerInterestBars } from "@/components/brand/customer-interest-bars";
import { prisma } from "@/lib/prisma";
import { requireBrandUser } from "@/lib/session";
import { getAnalyticsSummary, getDailyScanCounts } from "@/lib/analytics";

const TABLE_HEADERS = ["Product", "QR Scans", "Views", "Avg. Time"];

function formatDuration(ms: number | null) {
  if (!ms) return "—";
  const seconds = Math.round(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remainder}s` : `${remainder}s`;
}

export default async function BrandAnalyticsPage() {
  const user = await requireBrandUser();
  const brandId = user.brandId as string;

  const products = await prisma.product.findMany({ where: { brandId }, select: { id: true, name: true } });
  const productIds = products.map((p) => p.id);
  const productNameById = new Map(products.map((p) => [p.id, p.name]));

  const [dailyScans, summary, uniqueSessions] = await Promise.all([
    getDailyScanCounts(30, productIds),
    getAnalyticsSummary(productIds),
    prisma.scanEvent.findMany({
      where: { productId: { in: productIds } },
      distinct: ["sessionId"],
      select: { sessionId: true },
    }),
  ]);

  const [viewEventCounts, scansByProduct, viewsByProduct] = await Promise.all([
    prisma.scanEvent.groupBy({
      by: ["eventType"],
      where: { productId: { in: productIds } },
      _count: { _all: true },
    }),
    prisma.scanEvent.groupBy({
      by: ["productId"],
      where: { productId: { in: productIds }, eventType: "SCAN" },
      _count: { _all: true },
    }),
    prisma.scanEvent.groupBy({
      by: ["productId"],
      where: { productId: { in: productIds }, eventType: "VIEW" },
      _count: { _all: true },
    }),
  ]);
  const countByType = new Map(viewEventCounts.map((e) => [e.eventType, e._count._all]));
  const scansByProductId = new Map(scansByProduct.map((r) => [r.productId, r._count._all]));
  const viewsByProductId = new Map(viewsByProduct.map((r) => [r.productId, r._count._all]));

  const productRows = productIds
    .filter((id) => (scansByProductId.get(id) ?? 0) > 0 || (viewsByProductId.get(id) ?? 0) > 0)
    .map((id) => ({
      key: id,
      cells: [
        productNameById.get(id) ?? "Unknown product",
        scansByProductId.get(id) ?? 0,
        viewsByProductId.get(id) ?? 0,
        formatDuration(summary.averageViewTimeMs),
      ],
    }));

  return (
    <>
      <PageHeader
        eyebrow="Analytics"
        title="See how customers interact with your verified products."
        description="QR scans, verification page views, and which parts of your product information customers actually explore."
      />

      <StatGrid>
        <StatCard icon={QrCode} label="Total QR Scans" value={summary.totalScans} />
        <StatCard icon={Users} label="Unique Visitors" value={uniqueSessions.filter((s) => s.sessionId).length} />
        <StatCard icon={Eye} label="OriginCard Views" value={countByType.get("VIEW") ?? 0} />
        <StatCard icon={Clock} label="Avg. View Time" value={formatDuration(summary.averageViewTimeMs)} />
      </StatGrid>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <ScanActivityChart data={dailyScans} />
        <CustomerInterestBars
          rows={[
            { label: "Origin & Overview", count: countByType.get("VIEW") ?? 0 },
            { label: "Claims", count: countByType.get("CLAIM_VIEW") ?? 0 },
            { label: "Certifications & Documents", count: countByType.get("CERTIFICATE_VIEW") ?? 0 },
          ]}
        />
      </div>

      <div className="mt-6">
        <h2 className="mb-3 font-heading text-base font-bold">Product Performance</h2>
        <DataTable headers={TABLE_HEADERS} rows={productRows} emptyMessage="No scan activity yet." />
      </div>
    </>
  );
}
