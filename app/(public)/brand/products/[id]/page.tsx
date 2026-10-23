import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { ProductEditActions } from "@/components/brand/product-edit-actions";
import { ProductDetailTabs } from "@/components/products/product-detail-tabs";
import { requireBrandUser } from "@/lib/session";
import { getProductForBrandPreview } from "@/lib/data/repository";

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  APPROVED: "success",
  REJECTED: "destructive",
  IN_REVIEW: "info",
  SUBMITTED: "warning",
  DRAFT: "outline",
};

export default async function BrandProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireBrandUser();
  const { id } = await params;

  const preview = await getProductForBrandPreview(id, user.brandId as string);
  if (!preview) {
    notFound();
  }

  const { product, status, submittedAt, reviewedAt, approvedAt, rejectionNote } = preview;

  return (
    <>
      <PageHeader
        eyebrow="Products"
        title={product.name}
        description="This is how your product information is presented to shoppers once it's live."
        actions={<ProductEditActions productId={id} />}
      />

      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-border bg-card px-4 py-3 text-sm">
        <span className="flex items-center gap-2">
          <span className="text-muted-foreground">Status</span>
          <Badge variant={STATUS_VARIANT[status] ?? "outline"}>{status.replaceAll("_", " ")}</Badge>
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          Submitted <span className="font-medium text-foreground">{submittedAt ?? "—"}</span>
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          Reviewed <span className="font-medium text-foreground">{reviewedAt ?? "—"}</span>
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          Approved <span className="font-medium text-foreground">{approvedAt ?? "—"}</span>
        </span>
      </div>

      {status === "REJECTED" && rejectionNote ? (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p className="font-semibold">Rejection note</p>
          <p className="mt-1">{rejectionNote}</p>
        </div>
      ) : null}

      <div className="product-detail-page">
        <ProductDetailTabs product={product} />
      </div>
    </>
  );
}
