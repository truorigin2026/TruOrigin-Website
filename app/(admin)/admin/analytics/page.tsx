import { QrCode, Clock, Globe2, MapPin } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatGrid, StatCard } from "@/components/dashboard/stat-card";
import { BucketList } from "@/components/dashboard/bucket-list";
import { getAnalyticsSummary } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

export default async function AdminAnalyticsPage() {
  await requireAdminUser();

  const summary = await getAnalyticsSummary();

  const productIds = Array.from(
    new Set([...summary.mostViewedProducts.map((row) => row.productId), ...summary.mostScannedProducts.map((row) => row.productId)]),
  );
  const claimIds = summary.mostViewedClaims.map((row) => row.claimId);
  const certificateIds = summary.mostViewedCertificates.map((row) => row.certificateId);

  const [products, claims, certificates] = await Promise.all([
    prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true } }),
    prisma.claim.findMany({ where: { id: { in: claimIds } }, select: { id: true, label: true } }),
    prisma.certificate.findMany({ where: { id: { in: certificateIds } }, select: { id: true, title: true } }),
  ]);
  const productNames = new Map(products.map((p) => [p.id, p.name]));
  const claimLabels = new Map(claims.map((c) => [c.id, c.label]));
  const certificateTitles = new Map(certificates.map((c) => [c.id, c.title]));

  return (
    <>
      <PageHeader
        eyebrow="Admin Analytics"
        title="How consumers are scanning and exploring products."
        description="Total scans, geography, and device breakdowns are live from product-page lookups and QR scans. Claim/certificate view time requires product-page instrumentation and shows an honest empty state until that ships."
      />

      <StatGrid>
        <StatCard icon={QrCode} label="Total QR Scans" value={summary.totalScans} detail="Serial lookups + QR scans" />
        <StatCard
          icon={Clock}
          label="Average View Time"
          value={summary.averageViewTimeMs ? `${Math.round(summary.averageViewTimeMs / 1000)}s` : "No data yet"}
          detail="Requires product-page instrumentation"
        />
        <StatCard icon={Globe2} label="Countries Reached" value={summary.byCountry.length} detail="Distinct scan origins" />
        <StatCard icon={MapPin} label="Cities Reached" value={summary.byCity.length} detail="Distinct scan origins" />
      </StatGrid>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <BucketList title="By Country" buckets={summary.byCountry} />
        <BucketList title="By City" buckets={summary.byCity} />
        <BucketList title="By Device" buckets={summary.byDevice} />
        <BucketList
          title="Most Viewed Products"
          buckets={summary.mostViewedProducts.map((row) => ({ key: productNames.get(row.productId) ?? row.productId, count: row.count }))}
        />
        <BucketList
          title="Most Scanned Products"
          buckets={summary.mostScannedProducts.map((row) => ({ key: productNames.get(row.productId) ?? row.productId, count: row.count }))}
        />
        <BucketList
          title="Most Viewed Claims"
          buckets={summary.mostViewedClaims.map((row) => ({ key: claimLabels.get(row.claimId) ?? row.claimId, count: row.count }))}
        />
        <BucketList
          title="Most Viewed Certifications"
          buckets={summary.mostViewedCertificates.map((row) => ({ key: certificateTitles.get(row.certificateId) ?? row.certificateId, count: row.count }))}
        />
      </div>
    </>
  );
}
