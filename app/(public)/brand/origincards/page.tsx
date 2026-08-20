import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { OriginCardGenerateButton } from "@/components/brand/origincard-generate-button";
import { prisma } from "@/lib/prisma";
import { requireBrandUser } from "@/lib/session";
import type { Prisma } from "../../../../generated/prisma/client";

const CARD_STATUS_VARIANT: Record<string, BadgeVariant> = {
  PUBLISHED: "success",
  DRAFT: "warning",
  UNPUBLISHED: "outline",
  ARCHIVED: "destructive",
};

const TABLE_HEADERS = ["Product", "OriginCard Status", "Serial Number", "QR Status", "Generated", "Scans"];

export default async function BrandOriginCardsPage() {
  const user = await requireBrandUser();

  const cardWhere: Prisma.OriginCardWhereInput = { product: { brandId: user.brandId as string } };
  const pendingWhere: Prisma.ProductWhereInput = {
    brandId: user.brandId as string,
    status: "APPROVED",
    originCards: { none: {} },
  };

  const [cards, approvedWithoutCard] = await Promise.all([
    prisma.originCard.findMany({
      where: cardWhere,
      include: { product: true },
      orderBy: { generatedAt: "desc" },
    }),
    prisma.product.findMany({
      where: pendingWhere,
      select: { id: true, name: true },
    }),
  ]);

  const scanCounts = await prisma.scanEvent.groupBy({
    by: ["productId"],
    where: { productId: { in: cards.map((c) => c.productId) } },
    _count: { _all: true },
  });
  const scanCountByProduct = new Map(scanCounts.map((s) => [s.productId, s._count._all]));

  const rows = [
    ...cards.map((card) => ({
      key: card.id,
      href: `/brand/origincards/${card.id}`,
      cells: [
        <span key="product" className="font-medium">{card.product.name}</span>,
        <Badge key="status" variant={CARD_STATUS_VARIANT[card.status] ?? "outline"}>{card.status}</Badge>,
        <span key="serial" className="text-muted-foreground">{card.product.serialNumber ?? "—"}</span>,
        <Badge key="qr" variant={card.product.qrCodeUrl ? "success" : "outline"}>{card.product.qrCodeUrl ? "Active" : "Not generated"}</Badge>,
        card.generatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        scanCountByProduct.get(card.productId) ?? 0,
      ],
    })),
    ...approvedWithoutCard.map((product) => ({
      key: `pending-${product.id}`,
      cells: [
        <span key="product" className="font-medium">{product.name}</span>,
        <Badge key="status" variant="outline">Not Generated</Badge>,
        <span key="serial" className="text-muted-foreground">—</span>,
        <Badge key="qr" variant="outline">—</Badge>,
        <OriginCardGenerateButton key="generate" productId={product.id} />,
        0,
      ],
    })),
  ];

  return (
    <>
      <PageHeader
        eyebrow="OriginCards"
        title="Manage the OriginCards generated for your verified products."
        description="OriginCards use TruOrigin's standard template — a serial number and QR code are generated automatically once a product is approved."
      />
      <DataTable
        headers={TABLE_HEADERS}
        rows={rows}
        emptyMessage="No OriginCards yet — they're generated automatically once a product is approved by TruOrigin."
      />
    </>
  );
}
