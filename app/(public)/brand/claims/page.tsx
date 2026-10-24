import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { DataTable, type TableRowData } from "@/components/dashboard/data-table";
import { AssetImage } from "@/components/brands/asset-image";
import { prisma } from "@/lib/prisma";
import { requireBrandUser } from "@/lib/session";

const HEADERS = ["Product", "Approved", "Pending", "Rejected"];

export default async function BrandClaimsPage() {
  const user = await requireBrandUser();
  const brandId = user.brandId as string;

  const products = await prisma.product.findMany({
    where: { brandId, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      images: { take: 1, orderBy: { position: "asc" }, select: { url: true, focalX: true, focalY: true, zoom: true } },
      claims: { select: { status: true } },
    },
    take: 50,
  });

  const rows: TableRowData[] = products.map((product) => {
    const approved = product.claims.filter((c) => c.status === "VERIFIED").length;
    const rejected = product.claims.filter((c) => c.status === "REJECTED").length;
    const pending = product.claims.length - approved - rejected;
    const hero = product.images[0];

    return {
      key: product.id,
      href: `/brand/claims/${product.id}`,
      cells: [
        <div key="product" className="flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
            {hero ? (
              <AssetImage src={hero.url} alt="" fill sizes="40px" focalX={hero.focalX} focalY={hero.focalY} zoom={hero.zoom} />
            ) : null}
          </div>
          <span className="font-medium text-foreground">{product.name}</span>
        </div>,
        product.claims.length > 0 ? <Badge variant="success">{approved}</Badge> : <span className="text-muted-foreground">—</span>,
        product.claims.length > 0 ? <Badge variant="warning">{pending}</Badge> : <span className="text-muted-foreground">—</span>,
        product.claims.length > 0 ? <Badge variant="destructive">{rejected}</Badge> : <span className="text-muted-foreground">—</span>,
      ],
    };
  });

  return (
    <>
      <PageHeader
        eyebrow="Claims & Evidence"
        title="What you claim about each product, and what backs it up."
        description="Pick a product to see its claims, their review status, and any documents that support them."
      />
      <DataTable headers={HEADERS} rows={rows} emptyMessage="No products yet. Add your first product to start building claims and evidence." />
    </>
  );
}
