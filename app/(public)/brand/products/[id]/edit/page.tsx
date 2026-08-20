import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProductWizard } from "@/components/brand/product-wizard";
import { prisma } from "@/lib/prisma";
import { requireBrandUser } from "@/lib/session";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireBrandUser();
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      claims: true,
      certificates: true,
    },
  });

  if (!product || product.brandId !== user.brandId) {
    notFound();
  }

  if (product.status !== "DRAFT" && product.status !== "REJECTED") {
    redirect(`/brand/products/${product.id}`);
  }

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, select: { name: true } });

  return (
    <>
      <PageHeader
        eyebrow="Edit Product"
        title={product.name}
        description="Update your product details, claims, and documents, then resubmit for verification."
      />
      <ProductWizard
        categoryOptions={categories.map((c) => c.name)}
        mode="edit"
        productId={product.id}
        initialValues={{
          name: product.name,
          category: product.category.name,
          subcategory: product.subcategory ?? "",
          description: product.description ?? "",
          images: product.images.map((img) => ({ id: img.id, url: img.url, altText: img.altText ?? "" })),
          claims: product.claims.map((c) => ({ id: c.id, label: c.label, evidence: c.evidence ?? "" })),
          documents: product.certificates.map((c) => ({
            id: c.id,
            title: c.title,
            docType: c.docType,
            fileUrl: c.fileUrl,
            mimeType: c.mimeType ?? "",
          })),
        }}
      />
    </>
  );
}
