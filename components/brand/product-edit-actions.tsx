import Link from "next/link";
import { Button } from "@/components/ui/button";

type ProductEditActionsProps = {
  productId: string;
};

export function ProductEditActions({ productId }: ProductEditActionsProps) {
  return (
    <Button variant="outline" size="sm" render={<Link href={`/brand/products/${productId}/edit`} />} nativeButton={false}>
      Edit Product
    </Button>
  );
}
