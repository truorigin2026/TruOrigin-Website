import Link from "next/link";
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

export default async function BrandClaimsPage() {
  const user = await requireBrandUser();
  const brandId = user.brandId as string;

  const products = await prisma.product.findMany({
    where: { brandId, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    include: {
      claims: { include: { certificates: true }, orderBy: { createdAt: "desc" } },
      certificates: { orderBy: { createdAt: "desc" } },
    },
    take: 50,
  });

  const uploadTargets = products.map((p) => ({ id: p.id, name: p.name }));

  return (
    <>
      <PageHeader
        eyebrow="Claims & Evidence"
        title="What you claim about each product, and what backs it up."
        description="Claims and their supporting documents, grouped by product — edit a claim's label or evidence from its product while it's a draft or after it's rejected; link new evidence from the product's own Edit page."
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload a document</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUploadForm products={uploadTargets} />
        </CardContent>
      </Card>

      {products.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No products yet. Add your first product to start building claims and evidence.
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => {
            const linkedCertIds = new Set(product.claims.flatMap((claim) => claim.certificates.map((c) => c.id)));
            const unlinkedCerts = product.certificates.filter((cert) => !linkedCertIds.has(cert.id));

            if (product.claims.length === 0 && product.certificates.length === 0) return null;

            return (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle>
                    <Link href={`/brand/products/${product.id}`} className="hover:underline">
                      {product.name}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {product.claims.map((claim) => (
                    <div key={claim.id} className="rounded-lg border border-border bg-muted/40 p-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-foreground">{claim.label}</span>
                        <Badge variant={CLAIM_STATUS_VARIANT[claim.status] ?? "outline"}>{claimStatusMap[claim.status]}</Badge>
                      </div>
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
                  ))}

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
            );
          })}
        </div>
      )}
    </>
  );
}
