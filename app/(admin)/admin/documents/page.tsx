import { Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterTabs } from "@/components/dashboard/filter-tabs";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";
import type { Prisma } from "../../../../generated/prisma/client";

type DocumentsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const TYPE_TABS = [
  ["ALL", "All"],
  ["CERTIFICATE", "Certificates"],
  ["LAB_REPORT", "Lab Reports"],
  ["INGREDIENT_LIST", "Ingredient Lists"],
  ["SOURCING_PROOF", "Sourcing Proof"],
  ["OTHER", "Other"],
] as const;

const TABLE_HEADERS = ["Brand", "Document", "Product", "Type", "Actions"];

export default async function AdminDocumentsPage({ searchParams }: DocumentsPageProps) {
  await requireAdminUser();

  const resolved = (await searchParams) ?? {};
  const docType = typeof resolved.docType === "string" ? resolved.docType.toUpperCase() : "ALL";
  const search = typeof resolved.search === "string" ? resolved.search : "";
  const productId = typeof resolved.productId === "string" ? resolved.productId : "";

  const where: Prisma.CertificateWhereInput = {
    ...(docType !== "ALL" ? { docType: docType as never } : {}),
    ...(productId ? { productId } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { issuer: { contains: search, mode: "insensitive" } },
            { product: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const documents = await prisma.certificate.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { product: { include: { brand: true } } },
    take: 100,
  });

  const rows = documents.map((doc) => ({
    key: doc.id,
    cells: [
      <span key="brand" className="text-muted-foreground">{doc.product.brand.name}</span>,
      <div key="doc">
        <span className="font-medium">{doc.title}</span>
        {doc.issuer ? <p className="text-xs text-muted-foreground">Issued by {doc.issuer}</p> : null}
      </div>,
      doc.product.name,
      <Badge key="type" variant="outline">{doc.docType.replaceAll("_", " ")}</Badge>,
      <a key="download" href={`/api/admin/documents/${doc.id}/download`} className="text-sm font-medium text-primary hover:underline">
        Download
      </a>,
    ],
  }));

  return (
    <>
      <PageHeader
        eyebrow="Admin Documents"
        title="View and download every uploaded document, certificate, and lab report."
        description="Documents are view/download only from the admin panel — nothing here can be edited or replaced. Every download is recorded on the audit trail."
      />

      <Card className="mb-5 p-4">
        <form method="GET" className="flex flex-wrap gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input type="text" name="search" defaultValue={search} placeholder="Search by title, issuer, or product..." className="h-9 pl-8" />
          </div>
          <input type="hidden" name="docType" value={docType} />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <div className="mt-4">
          <FilterTabs
            items={TYPE_TABS.map(([value, label]) => ({
              label,
              href: `/admin/documents?docType=${value}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
              active: docType === value,
            }))}
          />
        </div>
      </Card>

      <DataTable headers={TABLE_HEADERS} rows={rows} emptyMessage="No documents match this filter." />
    </>
  );
}
