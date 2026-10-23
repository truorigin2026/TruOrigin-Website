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
}: {
  id: string;
  name: string;
  category: string;
  status: string;
  serialNumber: string | null;
  imageUrl: string | null;
}) {
  return (
    <Link href={`/brand/products/${id}`} className="block">
      <Card className="h-full gap-0 overflow-hidden p-0 transition-shadow hover:shadow-md">
        <div className="relative aspect-[4/3] w-full bg-muted">
          {imageUrl ? (
            <AssetImage src={imageUrl} alt={name} fill sizes="(max-width: 768px) 100vw, 25vw" />
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
