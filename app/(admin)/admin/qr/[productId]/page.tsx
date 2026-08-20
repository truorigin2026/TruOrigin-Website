import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BrandTagPreview } from "@/components/brand-tag-preview";
import { QrActions } from "@/components/admin/qr-actions";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

function InfoRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm">
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default async function AdminQrDetailPage({ params }: { params: Promise<{ productId: string }> }) {
  await requireAdminUser();
  const { productId } = await params;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { brand: true },
  });

  if (!product || !product.serialNumber) {
    notFound();
  }

  const scanRows = await prisma.scanEvent.groupBy({
    by: ["source"],
    _count: { _all: true },
    where: { productId },
  });
  const totalScans = scanRows.reduce((sum, row) => sum + row._count._all, 0);

  return (
    <>
      <PageHeader eyebrow="Admin QR" title={product.name} description={`${product.brand.name} • Serial ${product.serialNumber}`} />

      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="grid min-w-0 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tag Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2.5">
              <InfoRow label="Serial Number" value={product.serialNumber} />
              <InfoRow label="Verification Link" value={`/product/${product.serialNumber}`} />
              <div className="pt-2">
                <QrActions productId={product.id} hasQr={Boolean(product.qrCodeUrl)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scan Activity ({totalScans} total)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2.5">
              {scanRows.length > 0 ? (
                scanRows.map((row) => (
                  <InfoRow key={row.source ?? "unknown"} label={row.source ?? "Unknown source"} value={row._count._all} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No scans recorded yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="p-5 md:p-6">
          {product.qrCodeUrl ? (
            <BrandTagPreview
              serialNumber={product.serialNumber}
              qrDataUrl={product.qrCodeUrl}
              productName={product.name}
              brandName={product.brand.name}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No QR generated yet. Use &quot;Generate QR&quot; to create one for this product.
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
