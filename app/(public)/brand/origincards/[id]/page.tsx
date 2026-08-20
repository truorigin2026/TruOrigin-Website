import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OriginCardDetailActions } from "@/components/brand/origincard-detail-actions";
import { prisma } from "@/lib/prisma";
import { requireBrandUser } from "@/lib/session";
import { productVerificationUrl } from "@/lib/qr";

const CARD_STATUS_VARIANT: Record<string, BadgeVariant> = {
  PUBLISHED: "success",
  DRAFT: "warning",
  UNPUBLISHED: "outline",
  ARCHIVED: "destructive",
};

function InfoRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm">
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default async function BrandOriginCardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireBrandUser();
  const { id } = await params;

  const card = await prisma.originCard.findUnique({ where: { id }, include: { product: true } });

  if (!card || card.product.brandId !== user.brandId) {
    notFound();
  }

  const scanCount = await prisma.scanEvent.count({ where: { productId: card.productId } });
  const lastScan = await prisma.scanEvent.findFirst({
    where: { productId: card.productId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  return (
    <>
      <PageHeader
        eyebrow="OriginCards"
        title={card.title ?? card.product.name}
        description={card.product.name}
        actions={<Badge variant={CARD_STATUS_VARIANT[card.status] ?? "outline"}>{card.status}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2.5">
            <InfoRow label="Product" value={card.product.name} />
            <InfoRow label="Serial Number" value={card.product.serialNumber ?? "Not assigned yet"} />
            <InfoRow label="Generated" value={card.generatedAt.toLocaleDateString()} />
            <InfoRow label="Last Scanned" value={lastScan ? lastScan.createdAt.toLocaleDateString() : "Never"} />
            <InfoRow label="Total Scans" value={scanCount} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>QR Code</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {card.product.qrCodeUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={card.product.qrCodeUrl} alt="OriginCard QR code" className="mx-auto h-40 w-40 rounded-lg border border-border" />
            ) : (
              <p className="text-sm text-muted-foreground">QR code not generated yet.</p>
            )}
            <div className="grid gap-2">
              <Button variant="outline" disabled={!card.product.qrCodeUrl} render={<a href={card.product.qrCodeUrl ?? "#"} download={`${card.product.serialNumber ?? "qr"}.png`} />} nativeButton={false}>
                Download QR
              </Button>
              <Button variant="outline" disabled>
                Download OriginCard (Coming soon)
              </Button>
              <Button
                variant="outline"
                disabled={!card.product.serialNumber}
                render={<a href={card.product.serialNumber ? productVerificationUrl(card.product.serialNumber) : "#"} target="_blank" rel="noreferrer" />}
                nativeButton={false}
              >
                View Customer Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <OriginCardDetailActions cardId={card.id} status={card.status} />
      </div>

      <div className="mt-6">
        <Button variant="outline" size="sm" render={<Link href={`/brand/products/${card.productId}`} />} nativeButton={false}>
          Back to Product
        </Button>
      </div>
    </>
  );
}
