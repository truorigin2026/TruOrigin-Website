import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReviewActions } from "@/components/admin/review-actions";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/50 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export default async function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminUser();
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      claims: true,
      images: { orderBy: { position: "asc" } },
      certificates: true,
      ingredients: true,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin Review"
        title={product.name}
        description={`Reviewing ${product.brand.name} • ${product.category.name}`}
        actions={<Badge variant="info">{product.status.replaceAll("_", " ").toLowerCase()}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <div className="grid min-w-0 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <InfoTile label="Serial" value={product.serialNumber ?? "Not assigned yet"} />
                <InfoTile
                  label="Submitted"
                  value={product.submittedAt?.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) ?? "Not submitted yet"}
                />
              </div>
              {product.description ? <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{product.description}</p> : null}
              {product.rejectionNote ? (
                <div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <p className="font-semibold">Rejection note</p>
                  <p className="mt-1">{product.rejectionNote}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supporting claims and files</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2.5">
              {product.claims.map((claim) => (
                <div key={claim.id} className="rounded-lg border border-border bg-muted/50 px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">{claim.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{claim.evidence || "No evidence note linked yet."}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid min-w-0 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Approve or deny this product</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewActions
                product={{
                  id: product.id,
                  name: product.name,
                  status: product.status,
                  brandName: product.brand.name,
                  categoryName: product.category.name,
                  serialNumber: product.serialNumber,
                  rejectionNote: product.rejectionNote,
                  claims: product.claims,
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Photos ({product.images.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {product.images.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {product.images.map((image) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={image.id}
                      src={image.url}
                      alt={image.altText ?? product.name}
                      className="aspect-square w-full rounded-lg border border-border object-cover"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No photos uploaded yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documents ({product.certificates.length})</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2.5">
              {product.certificates.map((doc) => (
                <div key={doc.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{doc.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{doc.docType.replaceAll("_", " ")}</p>
                  </div>
                  <a href={`/api/admin/documents/${doc.id}/download`} className="text-sm font-medium text-primary hover:underline">
                    Download
                  </a>
                </div>
              ))}
              {product.certificates.length === 0 ? <p className="text-sm text-muted-foreground">No documents uploaded yet.</p> : null}
              <p className="text-sm text-muted-foreground">Ingredients listed: {product.ingredients.length}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
