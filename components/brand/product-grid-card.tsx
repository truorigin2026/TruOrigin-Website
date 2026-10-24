import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { AssetImage } from "@/components/brands/asset-image";

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  APPROVED: "success",
  REJECTED: "destructive",
  IN_REVIEW: "info",
  SUBMITTED: "warning",
  DRAFT: "outline",
};

export function ProductGridCard({
  id,
  name,
  category,
  status,
  serialNumber,
  imageUrl,
  focalPoint,
}: {
  id: string;
  name: string;
  category: string;
  status: string;
  serialNumber: string | null;
  imageUrl: string | null;
  focalPoint?: { x: number; y: number; zoom: number };
}) {
  return (
    <Link href={`/brand/products/${id}`} className="block">
      <Card className="h-full gap-0 overflow-hidden p-0 transition-shadow hover:shadow-md">
        {/* Square, matching the crop tool's fixed 1:1 target and the rest of the site (public catalog card, product hero) -- was 4:3, which didn't match what a brand actually crops. */}
        <div className="relative aspect-square w-full bg-muted">
          {imageUrl ? (
            <AssetImage
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              focalX={focalPoint?.x}
              focalY={focalPoint?.y}
              zoom={focalPoint?.zoom}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No photo</div>
          )}
          <div className="absolute left-2 top-2">
            <Badge variant={STATUS_VARIANT[status] ?? "outline"}>{status.replaceAll("_", " ")}</Badge>
          </div>
        </div>
        <div className="p-4">
          <h3 className="truncate font-heading text-sm font-bold text-foreground">{name}</h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{category}</p>
          <p className="mt-2 text-xs text-muted-foreground">{serialNumber ?? "Serial pending"}</p>
        </div>
      </Card>
    </Link>
  );
}
