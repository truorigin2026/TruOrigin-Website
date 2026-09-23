import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProductWizard } from "@/components/brand/product-wizard";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

export default async function AdminAddProductForBrandPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminUser();
  const { id } = await params;

  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand || brand.deletedAt) {
    notFound();
  }

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, select: { name: true } });

  return (
    <>
      <PageHeader
        eyebrow={`Upload for ${brand.name}`}
        title="Create a product entry on this brand's behalf."
        description="Same product wizard a brand would use. The product is created under this brand and enters the normal review queue."
      />
      <ProductWizard
        categoryOptions={categories.map((category) => category.name)}
        mode="create"
        apiBasePath={`/api/admin/brands/${id}/products`}
        redirectBasePath="/admin/products"
      />
    </>
  );
}
