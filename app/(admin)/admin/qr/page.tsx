import { Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

type QrPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const TABLE_HEADERS = ["Brand", "Product", "Serial", "QR Status", "Scans"];

export default async function AdminQrPage({ searchParams }: QrPageProps) {
  await requireAdminUser();

  const resolved = (await searchParams) ?? {};
  const search = typeof resolved.search === "string" ? resolved.search : "";

  const products = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { serialNumber: { contains: search, mode: "insensitive" } },
              { brand: { name: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    orderBy: { approvedAt: "desc" },
    include: { brand: true },
    take: 100,
  });

  const scanCounts = await prisma.scanEvent.groupBy({
    by: ["productId"],
    _count: { _all: true },
    where: { productId: { in: products.map((product) => product.id) } },
  });
  const scanCountByProduct = new Map(scanCounts.map((row) => [row.productId, row._count._all]));

  const rows = products.map((product) => ({
    key: product.id,
    href: `/admin/qr/${product.id}`,
    cells: [
      <span key="brand" className="text-muted-foreground">{product.brand.name}</span>,
      <span key="product" className="font-medium">{product.name}</span>,
      product.serialNumber ?? "No serial assigned yet",
      <Badge key="status" variant={product.qrCodeUrl ? "success" : "outline"}>{product.qrCodeUrl ? "QR ready" : "No QR yet"}</Badge>,
      scanCountByProduct.get(product.id) ?? 0,
    ],
  }));

  return (
    <>
      <PageHeader
        eyebrow="Admin QR"
        title="Generate, regenerate, and download print-ready tags."
        description="Every approved product gets a serial number and QR code. Regenerating re-renders the tag image from the existing serial — it never reissues the serial, so printed tags stay valid."
      />

      <Card className="mb-5 p-4">
        <form method="GET" className="flex flex-wrap gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input type="text" name="search" defaultValue={search} placeholder="Search by name, serial, or brand..." className="h-9 pl-8" />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
      </Card>

      <DataTable headers={TABLE_HEADERS} rows={rows} emptyMessage="No approved products match this search." />
    </>
  );
}
