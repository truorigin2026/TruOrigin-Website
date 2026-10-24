import { Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterTabs } from "@/components/dashboard/filter-tabs";
import { ProductGridCard } from "@/components/brand/product-grid-card";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireBrandUser } from "@/lib/session";
import type { ApprovalStatus, Prisma } from "../../../../generated/prisma/client";

type ProductsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const STATUS_TABS = ["ALL", "DRAFT", "SUBMITTED", "IN_REVIEW", "APPROVED", "REJECTED"] as const;

export default async function BrandProductsPage({ searchParams }: ProductsPageProps) {
  const user = await requireBrandUser();
  const resolved = (await searchParams) ?? {};
  const search = typeof resolved.search === "string" ? resolved.search : "";
  const status = typeof resolved.status === "string" ? resolved.status.toUpperCase() : "ALL";

  const where: Prisma.ProductWhereInput = {
    brandId: user.brandId as string,
    deletedAt: null,
    ...(status !== "ALL" && STATUS_TABS.includes(status as (typeof STATUS_TABS)[number])
      ? { status: status as ApprovalStatus }
      : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { serialNumber: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const products = await prisma.product.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: { category: true, images: { orderBy: { position: "asc" }, take: 1 } },
    take: 100,
  });

  return (
    <>
      <PageHeader
        eyebrow="Products"
        title="Manage the products and information reviewed through TruOrigin."
        description="Search your catalog, track review status, and open a product to preview and edit its details, claims, and documents."
        actions={
          <Button render={<Link href="/brand/products/new" />} nativeButton={false}>
            Add Product
          </Button>
        }
      />

      <Card className="mb-5 p-4">
        <form method="GET" className="flex flex-wrap gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input type="text" name="search" defaultValue={search} placeholder="Search products..." className="h-9 pl-8" />
          </div>
          <input type="hidden" name="status" value={status} />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <div className="mt-4">
          <FilterTabs
            items={STATUS_TABS.map((tab) => ({
              label: tab,
              href: `/brand/products?status=${tab}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
              active: status === tab,
            }))}
          />
        </div>
      </Card>

      {products.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No products match this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductGridCard
              key={product.id}
              id={product.id}
              name={product.name}
              category={product.category.name}
              status={product.status}
              serialNumber={product.serialNumber}
              imageUrl={product.images[0]?.url ?? null}
              focalPoint={product.images[0] ? { x: product.images[0].focalX, y: product.images[0].focalY, zoom: product.images[0].zoom } : undefined}
            />
          ))}
        </div>
      )}
    </>
  );
}
