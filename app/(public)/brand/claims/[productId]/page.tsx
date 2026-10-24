import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { DocumentUploadForm } from "@/components/brand/document-upload-form";
import { DocumentDeleteButton } from "@/components/brand/document-delete-button";
import { prisma } from "@/lib/prisma";
import { requireBrandUser } from "@/lib/session";
import { claimStatusMap } from "@/lib/data/site-data";

const CLAIM_STATUS_VARIANT: Record<string, BadgeVariant> = {
  VERIFIED: "success",
  PARTIALLY_VERIFIED: "info",
  UNVERIFIED: "warning",
  REJECTED: "destructive",
};

export default async function BrandProductClaimsPage({ params }: { params: Promise<{ productId: string }> }) {
  const user = await requireBrandUser();
  const brandId = user.brandId as string;
  const { productId } = await params;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      claims: { include: { certificates: true }, orderBy: { createdAt: "desc" } },
      certificates: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!product || product.brandId !== brandId || product.deletedAt) {
    notFound();
  }

  const linkedCertIds = new Set(product.claims.flatMap((claim) => claim.certificates.map((c) => c.id)));
  const unlinkedCerts = product.certificates.filter((cert) => !linkedCertIds.has(cert.id));

  return (
    <>
      <Link href="/brand/claims" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} />
        All products
      </Link>
      <PageHeader
        eyebrow="Claims & Evidence"
        title={product.name}
        description="Edit a claim's label or evidence from this product's own Edit page while it's a draft or after it's rejected; link new evidence below."
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload a document</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUploadForm products={[{ id: product.id, name: product.name }]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Claims</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {product.claims.length === 0 ? (
            <p className="text-sm text-muted-foreground">No claims added yet.</p>
          ) : (
            product.claims.map((claim) => (
              <div key={claim.id} className="rounded-lg border border-border bg-muted/40 p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">{claim.label}</span>
                  <Badge variant={CLAIM_STATUS_VARIANT[claim.status] ?? "outline"}>{claimStatusMap[claim.status]}</Badge>
                </div>

                {claim.status === "REJECTED" && claim.reviewNote ? (
                  <div className="mt-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                    <p className="font-semibold">Admin feedback</p>
                    <p className="mt-0.5">{claim.reviewNote}</p>
                  </div>
                ) : null}

                {claim.certificates.length > 0 ? (
                  <div className="mt-2.5 grid gap-1.5 border-t border-border pt-2.5">
                    {claim.certificates.map((cert) => (
                      <div key={cert.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-muted-foreground">
                          {cert.title} <span className="text-xs">· {cert.docType.replaceAll("_", " ")}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <a href={cert.fileUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline">
                            View
                          </a>
                          <DocumentDeleteButton id={cert.id} title={cert.title} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {claim.evidence?.trim() ? claim.evidence : "No supporting document linked yet."}
                  </p>
                )}
              </div>
            ))
          )}

          {unlinkedCerts.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Other documents</p>
              <div className="grid gap-1.5">
                {unlinkedCerts.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3.5 py-2.5 text-sm">
                    <span className="text-muted-foreground">
                      {cert.title} <span className="text-xs">· {cert.docType.replaceAll("_", " ")}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <a href={cert.fileUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline">
                        View
                      </a>
                      <DocumentDeleteButton id={cert.id} title={cert.title} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </>
  );
}
