import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { requireBrandUser } from "@/lib/session";
import type { Prisma } from "../../../../generated/prisma/client";

const CLAIM_STATUS_VARIANT: Record<string, BadgeVariant> = {
  VERIFIED: "success",
  PARTIALLY_VERIFIED: "info",
  UNVERIFIED: "warning",
  REJECTED: "destructive",
};

const TABLE_HEADERS = ["Claim", "Product", "Evidence", "Status", "Added"];

export default async function BrandClaimsPage() {
  const user = await requireBrandUser();

  const where: Prisma.ClaimWhereInput = { product: { brandId: user.brandId as string } };

  const claims = await prisma.claim.findMany({
    where,
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  const rows = claims.map((claim) => ({
    key: claim.id,
    href: `/brand/products/${claim.productId}`,
    cells: [
      <span key="label" className="font-medium">{claim.label}</span>,
      claim.product.name,
      <span key="evidence" className="text-muted-foreground">{claim.evidence || "No evidence added"}</span>,
      <Badge key="status" variant={CLAIM_STATUS_VARIANT[claim.status] ?? "outline"}>{claim.status.replaceAll("_", " ").toLowerCase()}</Badge>,
      claim.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    ],
  }));

  return (
    <>
      <PageHeader
        eyebrow="Claims"
        title="Track every claim you've made and its verification status."
        description="Verification status is set by TruOrigin during review. Edit a claim's evidence from its product while the product is a draft or after it's rejected."
      />
      <DataTable
        headers={TABLE_HEADERS}
        rows={rows}
        emptyMessage="No claims yet — add claims when you create or edit a product."
      />
    </>
  );
}
