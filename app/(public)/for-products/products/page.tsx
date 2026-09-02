import type { Metadata } from "next";
import { ProductsContent } from "@/components/products/products-content";
import { getProducts } from "@/lib/data/repository";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Verified Products",
  description:
    "Search verified products by name, brand, or category and review their origin, certifications, and supporting evidence.",
  path: "/for-products/products",
});

type ProductsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ForProductsProductsPage({ searchParams }: ProductsPageProps) {
  const resolved = (await searchParams) ?? {};
  const selectedCategory =
    typeof resolved.category === "string" ? resolved.category : "All Products";
  const selectedBrand = typeof resolved.brand === "string" ? resolved.brand : "";
  const selectedCertification =
    typeof resolved.certification === "string" ? resolved.certification : "";
  const selectedOrigin = typeof resolved.origin === "string" ? resolved.origin : "";
  const selectedSearch = typeof resolved.search === "string" ? resolved.search : "";
  const selectedSort =
    typeof resolved.sort === "string" && resolved.sort === "name" ? "name" : "latest";
  const requestedPage =
    typeof resolved.page === "string" ? Number.parseInt(resolved.page, 10) : 1;

  const allProducts = await getProducts({ search: selectedSearch });

  return (
    <div className="saas-page">
      <header className="container-shell legal-page-header">
        <p className="eyebrow">Products</p>
        <h1 className="legal-page-title">Discover Product Information</h1>
      </header>

      <ProductsContent
        allProducts={allProducts}
        selectedCategory={selectedCategory}
        selectedBrand={selectedBrand}
        selectedCertification={selectedCertification}
        selectedOrigin={selectedOrigin}
        selectedSearch={selectedSearch}
        selectedSort={selectedSort as "latest" | "name"}
        currentPage={requestedPage}
        basePath="/for-products/products"
      />
    </div>
  );
}
