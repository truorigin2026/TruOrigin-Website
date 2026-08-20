import { Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterTabs } from "@/components/dashboard/filter-tabs";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";
import type { Prisma } from "../../../../generated/prisma/client";

type BrandsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const STATUS_TABS = ["ALL", "PENDING", "ACTIVE", "SUSPENDED"] as const;
const TABLE_HEADERS = ["Brand", "Products", "Subscription", "Status"];

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  ACTIVE: "success",
  SUSPENDED: "destructive",
  PENDING: "warning",
};

export default async function AdminBrandsPage({ searchParams }: BrandsPageProps) {
  await requireAdminUser();

  const resolved = (await searchParams) ?? {};
  const search = typeof resolved.search === "string" ? resolved.search : "";
  const status = typeof resolved.status === "string" ? resolved.status.toUpperCase() : "ALL";

  const where: Prisma.BrandWhereInput = {
    deletedAt: null,
    ...(status !== "ALL" ? { status: status as "PENDING" | "ACTIVE" | "SUSPENDED" } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const brands = await prisma.brand.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { products: true } },
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1, include: { plan: true } },
    },
    take: 100,
  });

  const rows = brands.map((brand) => {
    const sub = brand.subscriptions[0];
    return {
      key: brand.id,
      href: `/admin/brands/${brand.id}`,
      cells: [
        <div key="brand">
          <span className="font-medium">{brand.name}</span>
          <p className="text-xs text-muted-foreground">{brand.slug}</p>
        </div>,
        `${brand._count.products} product${brand._count.products === 1 ? "" : "s"}`,
        <span key="sub" className="text-muted-foreground">{sub ? `${sub.plan.name} • ${sub.status}` : "No subscription"}</span>,
        <Badge key="status" variant={STATUS_VARIANT[brand.status] ?? "outline"}>{brand.status}</Badge>,
      ],
    };
  });

  return (
    <>
      <PageHeader
        eyebrow="Admin Brands"
        title="Manage every brand workspace on the platform."
        description="Approve new brands, suspend accounts that violate policy, and check subscription/payment status at a glance."
      />

      <Card className="mb-5 p-4">
        <form method="GET" className="flex flex-wrap gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input type="text" name="search" defaultValue={search} placeholder="Search by brand name or slug..." className="h-9 pl-8" />
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
              href: `/admin/brands?status=${tab}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
              active: status === tab,
            }))}
          />
        </div>
      </Card>

      <DataTable headers={TABLE_HEADERS} rows={rows} emptyMessage="No brands match this filter." />
    </>
  );
}
