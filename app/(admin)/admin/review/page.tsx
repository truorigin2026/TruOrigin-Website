import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

const TABLE_HEADERS = ["Brand", "Product", "Claims", "Verified", "Needs Work", "Submitted"];

export default async function ReviewPage() {
  await requireAdminUser();

  const products = await prisma.product.findMany({
    where: { status: { in: ["SUBMITTED", "IN_REVIEW"] } },
    orderBy: [{ submittedAt: "asc" }, { updatedAt: "desc" }],
    include: {
      brand: true,
      category: true,
      claims: true,
      images: { orderBy: { position: "asc" }, take: 1 },
    },
  });

  const rows = products.map((product) => {
    const claimCounts = product.claims.reduce(
      (counts, claim) => {
        counts[claim.status] += 1;
        return counts;
      },
      { VERIFIED: 0, PARTIALLY_VERIFIED: 0, UNVERIFIED: 0, REJECTED: 0 },
    );

    return {
      key: product.id,
      href: `/admin/review/${product.id}`,
      cells: [
        <span key="brand" className="text-muted-foreground">{product.brand.name}</span>,
        <div key="product">
          <span className="font-medium">{product.name}</span>
          <p className="text-xs text-muted-foreground">
            {product.category.name}
            {product.subcategory ? ` • ${product.subcategory}` : ""}
          </p>
        </div>,
        product.claims.length,
        <Badge key="verified" variant="success">{claimCounts.VERIFIED}</Badge>,
        <Badge key="needs-work" variant="warning">{claimCounts.UNVERIFIED + claimCounts.PARTIALLY_VERIFIED}</Badge>,
        product.submittedAt ? product.submittedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
      ],
    };
  });

  return (
    <>
      <PageHeader
        eyebrow="Admin Review"
        title="Review submitted products one by one."
        description="This queue shows every product waiting for admin attention. Open a row for the full product review page with claim-by-claim actions."
      />
      <DataTable headers={TABLE_HEADERS} rows={rows} emptyMessage="There are no products waiting for review right now." />
    </>
  );
}
