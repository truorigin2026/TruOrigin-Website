import { PageHeader } from "@/components/dashboard/page-header";
import { ProductWizard } from "@/components/brand/product-wizard";
import { prisma } from "@/lib/prisma";
import { requireBrandUser } from "@/lib/session";

export default async function AddProductPage() {
  await requireBrandUser();

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, select: { name: true } });

  return (
    <>
      <PageHeader
        eyebrow="Add Product"
        title="Create a product entry, attach media, and send it for review."
        description="Product basics, photos, claims, and supporting documents — all reviewed by the TruOrigin admin team before anything goes live."
      />
      <ProductWizard categoryOptions={categories.map((category) => category.name)} mode="create" />
    </>
  );
}
