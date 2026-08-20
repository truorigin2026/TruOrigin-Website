import productsHero from "../../../public/images/for-products/products-banner.webp";
import { BrandHero } from "@/components/brands/brand-hero";
import { ProductsContent } from "@/components/products/products-content";
import { getProducts } from "@/lib/data/repository";

type ProductsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
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
      <BrandHero
        image={productsHero}
        headline="Discover Verified Products"
        subheadline="Browse authentic products with full transparency — origin, certifications, and evidence at your fingertips."
      />

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
