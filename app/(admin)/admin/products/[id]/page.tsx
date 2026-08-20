import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductActions } from "@/components/admin/product-actions";
import { prisma } from "@/lib/prisma";

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  APPROVED: "success",
  REJECTED: "destructive",
  IN_REVIEW: "info",
  SUBMITTED: "warning",
  DRAFT: "outline",
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

export default async function AdminProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { position: "asc" } },
      claims: true,
      certificates: true,
      ingredients: true,
      originCards: true,
    },
  });

  if (!product) {
    notFound();
  }

  const visibilityLabel = product.deletedAt ? "Deleted" : product.hidden ? "Hidden" : product.archived ? "Archived" : "Visible";

  return (
    <>
      <PageHeader
        eyebrow="Admin Products"
        title={product.name}
        description={`${product.brand.name} • ${product.category.name} • ${product.status}`}
      />

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid min-w-0 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <InfoTile label="Serial" value={product.serialNumber ?? "Not assigned yet"} />
                <InfoTile label="Visibility" value={visibilityLabel} />
              </div>
              {product.description ? <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{product.description}</p> : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Claims</CardTitle>
              <CardAction>
                <Button variant="outline" size="sm" render={<Link href={`/admin/review/${product.id}`} />} nativeButton={false}>
                  Open Review Page
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="grid gap-3">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Claim evidence and verification status are never edited directly here. Approve or deny claims through
                the review flow so every change stays on the audit trail.
              </p>
              <div className="grid gap-2.5">
                {product.claims.map((claim) => (
                  <InfoRow key={claim.id} label={claim.label} value={<Badge variant="info">{claim.status.replaceAll("_", " ").toLowerCase()}</Badge>} />
                ))}
                {product.claims.length === 0 ? <p className="text-sm text-muted-foreground">No claims submitted.</p> : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>OriginCards ({product.originCards.length})</CardTitle>
              <CardAction>
                <Button variant="outline" size="sm" render={<Link href="/admin/origincards" />} nativeButton={false}>
                  Manage OriginCards
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="grid gap-2.5">
              {product.originCards.map((card) => (
                <InfoRow key={card.id} label={card.title ?? "Untitled card"} value={<Badge variant="outline">{card.status}</Badge>} />
              ))}
              {product.originCards.length === 0 ? (
                <p className="text-sm text-muted-foreground">No OriginCard yet — one is created automatically when the product is approved.</p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="grid min-w-0 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductActions product={{ id: product.id, hidden: product.hidden, archived: product.archived }} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Files</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2.5">
              <InfoRow label="Images attached" value={product.images.length} />
              <InfoRow label="Certificates attached" value={product.certificates.length} />
              <InfoRow label="Ingredients listed" value={product.ingredients.length} />
              <Button variant="outline" className="justify-center" render={<Link href={`/admin/documents?productId=${product.id}`} />} nativeButton={false}>
                View Documents
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
