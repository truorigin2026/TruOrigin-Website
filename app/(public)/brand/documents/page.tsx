import { PageHeader } from "@/components/dashboard/page-header";
import { FilterTabs } from "@/components/dashboard/filter-tabs";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DocumentUploadForm } from "@/components/brand/document-upload-form";
import { DocumentDeleteButton } from "@/components/brand/document-delete-button";
import { prisma } from "@/lib/prisma";
import { requireBrandUser } from "@/lib/session";
import type { CertificateDocType, Prisma } from "../../../../generated/prisma/client";

type DocumentsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const DOC_TYPE_TABS = ["ALL", "CERTIFICATE", "LAB_REPORT", "INGREDIENT_LIST", "SOURCING_PROOF", "OTHER"] as const;
const TABLE_HEADERS = ["Document", "Product", "Type", "Expires", "Uploaded", "Actions"];

export default async function BrandDocumentsPage({ searchParams }: DocumentsPageProps) {
  const user = await requireBrandUser();
  const resolved = (await searchParams) ?? {};
  const docType = typeof resolved.type === "string" ? resolved.type.toUpperCase() : "ALL";

  const certificateWhere: Prisma.CertificateWhereInput = {
    product: { brandId: user.brandId as string },
    ...(docType !== "ALL" && (DOC_TYPE_TABS as readonly string[]).includes(docType)
      ? { docType: docType as CertificateDocType }
      : {}),
  };

  const [products, documents] = await Promise.all([
    prisma.product.findMany({
      where: { brandId: user.brandId as string },
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true },
    }),
    prisma.certificate.findMany({
      where: certificateWhere,
      orderBy: { createdAt: "desc" },
      include: { product: true },
    }),
  ]);

  const rows = documents.map((doc) => ({
    key: doc.id,
    cells: [
      <span key="title" className="font-medium">{doc.title}</span>,
      doc.product.name,
      <Badge key="type" variant="outline">{doc.docType.replaceAll("_", " ")}</Badge>,
      doc.expiresAt ? doc.expiresAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
      doc.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      <div key="actions" className="flex items-center gap-2">
        <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline">
          View
        </a>
        <DocumentDeleteButton id={doc.id} title={doc.title} />
      </div>,
    ],
  }));

  return (
    <>
      <PageHeader
        eyebrow="Documents"
        title="Manage the evidence supporting your product claims."
        description="Certificates, lab reports, and sourcing proof stay private until the admin team reviews and approves the product they support."
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload a document</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUploadForm products={products} />
        </CardContent>
      </Card>

      <div className="mb-4">
        <FilterTabs
          items={DOC_TYPE_TABS.map((tab) => ({
            label: tab.replaceAll("_", " "),
            href: `/brand/documents?type=${tab}`,
            active: docType === tab,
          }))}
        />
      </div>

      <DataTable headers={TABLE_HEADERS} rows={rows} emptyMessage="No documents uploaded yet." />
    </>
  );
}
