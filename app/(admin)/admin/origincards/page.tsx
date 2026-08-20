import { Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterTabs } from "@/components/dashboard/filter-tabs";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OriginCardActions } from "@/components/admin/origincard-actions";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";
import type { Prisma } from "../../../../generated/prisma/client";

type OriginCardsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const STATUS_TABS = ["ALL", "DRAFT", "PUBLISHED", "UNPUBLISHED", "ARCHIVED"] as const;
const TABLE_HEADERS = ["Brand", "Card", "Product", "Status", "Actions"];

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  PUBLISHED: "success",
  DRAFT: "warning",
  UNPUBLISHED: "outline",
  ARCHIVED: "destructive",
};

export default async function AdminOriginCardsPage({ searchParams }: OriginCardsPageProps) {
  await requireAdminUser();

  const resolved = (await searchParams) ?? {};
  const search = typeof resolved.search === "string" ? resolved.search : "";
  const status = typeof resolved.status === "string" ? resolved.status.toUpperCase() : "ALL";

  const where: Prisma.OriginCardWhereInput = {
    ...(status !== "ALL" ? { status: status as never } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { product: { name: { contains: search, mode: "insensitive" } } },
            { product: { brand: { name: { contains: search, mode: "insensitive" } } } },
          ],
        }
      : {}),
  };

  const cards = await prisma.originCard.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: { product: { include: { brand: true } } },
    take: 100,
  });

  const rows = cards.map((card) => ({
    key: card.id,
    cells: [
      <span key="brand" className="text-muted-foreground">{card.product.brand.name}</span>,
      <span key="title" className="font-medium">{card.title ?? card.product.name}</span>,
      `${card.product.name}${card.duplicatedFromId ? " • duplicate" : ""}`,
      <Badge key="status" variant={STATUS_VARIANT[card.status] ?? "outline"}>{card.status}</Badge>,
      <OriginCardActions key="actions" card={{ id: card.id, status: card.status }} />,
    ],
  }));

  return (
    <>
      <PageHeader
        eyebrow="Admin OriginCards"
        title="Publish, unpublish, duplicate, or archive OriginCards."
        description="OriginCards are created automatically as a draft when a product is approved. Publish them once the card is ready for consumers."
      />

      <Card className="mb-5 p-4">
        <form method="GET" className="flex flex-wrap gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input type="text" name="search" defaultValue={search} placeholder="Search by card title, product, or brand..." className="h-9 pl-8" />
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
              href: `/admin/origincards?status=${tab}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
              active: status === tab,
            }))}
          />
        </div>
      </Card>

      <DataTable headers={TABLE_HEADERS} rows={rows} emptyMessage="No OriginCards match this filter." />
    </>
  );
}
