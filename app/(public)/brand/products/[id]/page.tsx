import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductEditActions } from "@/components/brand/product-edit-actions";
import { prisma } from "@/lib/prisma";
import { requireBrandUser } from "@/lib/session";

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  APPROVED: "success",
  REJECTED: "destructive",
  IN_REVIEW: "info",
  SUBMITTED: "warning",
  DRAFT: "outline",
};

const CLAIM_STATUS_VARIANT: Record<string, BadgeVariant> = {
  VERIFIED: "success",
  PARTIALLY_VERIFIED: "info",
  UNVERIFIED: "warning",
  REJECTED: "destructive",
};

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/50 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm">
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default async function BrandProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireBrandUser();
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      claims: true,
      certificates: true,
      originCards: true,
    },
  });

  if (!product || product.brandId !== user.brandId) {
    notFound();
  }

  const canEdit = product.status === "DRAFT" || product.status === "REJECTED";

  return (
    <>
      <PageHeader
        eyebrow="Products"
        title={product.name}
        description={`${product.category.name} • ${product.status.replaceAll("_", " ")}`}
        actions={<Badge variant={STATUS_VARIANT[product.status] ?? "outline"}>{product.status.replaceAll("_", " ")}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid min-w-0 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardAction>
                <ProductEditActions productId={product.id} canEdit={canEdit} status={product.status} />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <InfoTile label="Serial" value={product.serialNumber ?? "Not assigned yet"} />
                <InfoTile label="Subcategory" value={product.subcategory ?? "—"} />
              </div>
              {product.description ? <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{product.description}</p> : null}
              {product.status === "REJECTED" && product.rejectionNote ? (
                <div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <p className="font-semibold">Rejection note</p>
                  <p className="mt-1">{product.rejectionNote}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Claims</CardTitle>
              <CardAction>
                <Button variant="outline" size="sm" render={<Link href="/brand/claims" />} nativeButton={false}>
                  Open Claims
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="grid gap-3">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Claim verification status is set by TruOrigin during review. You can edit a claim&apos;s label or
                evidence while this product is a draft or after it&apos;s rejected.
              </p>
              <div className="grid gap-2.5">
                {product.claims.map((claim) => (
                  <InfoRow
                    key={claim.id}
                    label={claim.label}
                    value={<Badge variant={CLAIM_STATUS_VARIANT[claim.status] ?? "outline"}>{claim.status.replaceAll("_", " ").toLowerCase()}</Badge>}
                  />
                ))}
                {product.claims.length === 0 ? <p className="text-sm text-muted-foreground">No claims added yet.</p> : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documents ({product.certificates.length})</CardTitle>
              <CardAction>
                <Button variant="outline" size="sm" render={<Link href="/brand/documents" />} nativeButton={false}>
                  Manage Documents
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="grid gap-2.5">
              {product.certificates.map((doc) => (
                <InfoRow
                  key={doc.id}
                  label={doc.title}
                  value={<Badge variant="outline">{doc.docType.replaceAll("_", " ")}</Badge>}
                />
              ))}
              {product.certificates.length === 0 ? (
                <p className="text-sm text-muted-foreground">No supporting documents attached yet.</p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="grid min-w-0 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>OriginCard</CardTitle>
              <CardAction>
                <Button variant="outline" size="sm" render={<Link href="/brand/origincards" />} nativeButton={false}>
                  Manage OriginCards
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="grid gap-2.5">
              {product.originCards.map((card) => (
                <InfoRow key={card.id} label={card.title ?? "Untitled card"} value={<Badge variant="outline">{card.status}</Badge>} />
              ))}
              {product.originCards.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {product.status === "APPROVED"
                    ? "No OriginCard yet — this should generate automatically. Open OriginCards to self-heal it."
                    : "An OriginCard is generated automatically once TruOrigin approves this product."}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2.5">
              <InfoRow label="Submitted" value={product.submittedAt ? product.submittedAt.toLocaleDateString() : "—"} />
              <InfoRow label="Reviewed" value={product.reviewedAt ? product.reviewedAt.toLocaleDateString() : "—"} />
              <InfoRow label="Approved" value={product.approvedAt ? product.approvedAt.toLocaleDateString() : "—"} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
