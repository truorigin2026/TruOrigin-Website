import Link from "next/link";
import { Search, X } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterTabs } from "@/components/dashboard/filter-tabs";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "../../../../generated/prisma/client";

type ProductsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const VISIBILITY_TABS = ["ALL", "VISIBLE", "HIDDEN", "ARCHIVED"] as const;
const TABLE_HEADERS = ["Brand", "Product", "Category / Serial", "Status"];

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  APPROVED: "success",
  REJECTED: "destructive",
  IN_REVIEW: "info",
  SUBMITTED: "warning",
  DRAFT: "outline",
};

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const resolved = (await searchParams) ?? {};
  const search = typeof resolved.search === "string" ? resolved.search : "";
  const visibility = typeof resolved.visibility === "string" ? resolved.visibility.toUpperCase() : "ALL";
  const brandId = typeof resolved.brandId === "string" ? resolved.brandId : "";

  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
    ...(visibility === "VISIBLE" ? { hidden: false, archived: false } : {}),
    ...(visibility === "HIDDEN" ? { hidden: true } : {}),
    ...(visibility === "ARCHIVED" ? { archived: true } : {}),
    ...(brandId ? { brandId } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { serialNumber: { contains: search, mode: "insensitive" } },
            { brand: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [products, filterBrand] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: { brand: true, category: true, _count: { select: { originCards: true } } },
      take: 100,
    }),
    brandId ? prisma.brand.findUnique({ where: { id: brandId }, select: { name: true } }) : Promise.resolve(null),
  ]);

  const carryParams = `${search ? `&search=${encodeURIComponent(search)}` : ""}${brandId ? `&brandId=${brandId}` : ""}`;

  const rows = products.map((p) => ({
    key: p.id,
    href: `/admin/products/${p.id}`,
    cells: [
      <span key="brand" className="text-muted-foreground">{p.brand.name}</span>,
      <span key="product" className="font-medium">{p.name}</span>,
      `${p.category.name} • ${p.serialNumber ?? "No serial"}`,
      <div key="status" className="flex flex-wrap gap-1.5">
        <Badge variant={STATUS_VARIANT[p.status] ?? "outline"}>{p.status.replaceAll("_", " ")}</Badge>
        {p.hidden ? <Badge variant="destructive">Hidden</Badge> : null}
        {p.archived ? <Badge variant="outline">Archived</Badge> : null}
      </div>,
    ],
  }));

  return (
    <>
      <PageHeader
        eyebrow="Admin Products"
        title="Every product on the platform, in one searchable list."
        description="Search by name, serial, or brand. Hide, archive, or delete a product without losing its history."
      />

      <Card className="mb-5 p-4">
        <form method="GET" className="flex flex-wrap gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input type="text" name="search" defaultValue={search} placeholder="Search by name, serial, or brand..." className="h-9 pl-8" />
          </div>
          <input type="hidden" name="visibility" value={visibility} />
          {brandId ? <input type="hidden" name="brandId" value={brandId} /> : null}
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        {filterBrand ? (
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="info">Brand: {filterBrand.name}</Badge>
            <Link
              href={`/admin/products?visibility=${visibility}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <X size={12} /> Clear brand filter
            </Link>
          </div>
        ) : null}

        <div className="mt-4">
          <FilterTabs
            items={VISIBILITY_TABS.map((tab) => ({
              label: tab,
              href: `/admin/products?visibility=${tab}${carryParams}`,
              active: visibility === tab,
            }))}
          />
        </div>
      </Card>

      <DataTable headers={TABLE_HEADERS} rows={rows} emptyMessage="No products match this filter." />
    </>
  );
}
