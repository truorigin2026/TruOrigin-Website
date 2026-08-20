import Link from "next/link";
import { Button } from "@/components/ui/button";

type ProductEditActionsProps = {
  productId: string;
  canEdit: boolean;
  status: string;
};

export function ProductEditActions({ productId, canEdit, status }: ProductEditActionsProps) {
  if (!canEdit) {
    return (
      <span className="text-xs font-medium text-muted-foreground">
        {status === "APPROVED" ? "Live — contact support to change" : "Editing locked while under review"}
      </span>
    );
  }

  return (
    <Button variant="outline" size="sm" render={<Link href={`/brand/products/${productId}/edit`} />} nativeButton={false}>
      Edit Product
    </Button>
  );
}
