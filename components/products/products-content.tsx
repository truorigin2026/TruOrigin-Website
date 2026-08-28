"use client";

import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/ui/product-card";
import { FilterSidebarMobile } from "@/components/ui/filter-sidebar-mobile";
import { mapCategoryToFilter } from "@/lib/data/frontend-data";
import type { ProductRecord } from "@/lib/data/site-data";
import Link from "next/link";

const PRODUCTS_PER_PAGE = 12;

type ProductsContentProps = {
  allProducts: ProductRecord[];
  selectedCategory: string;
  selectedBrand: string;
  selectedCertification: string;
  selectedOrigin: string;
  selectedSearch: string;
  selectedSort: "latest" | "name";
  currentPage: number;
  basePath: string;
};

function filterProducts(
  products: ProductRecord[],
  category: string,
  brand: string,
  certification: string,
  origin: string,
  search: string,
) {
  const normalizedSearch = search.trim().toLowerCase();

  return products.filter((product) => {
    const mapped = mapCategoryToFilter(product.category, product.subcategory);
    const categoryMatch = category === "All Products" || mapped === category;
    const brandMatch = !brand || product.brand === brand;
    const certMatch = !certification || product.claims.some((c) => c.status === certification);
    const originMatch = !origin;
    const searchMatch =
      !normalizedSearch ||
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.brand.toLowerCase().includes(normalizedSearch) ||
      mapped.toLowerCase().includes(normalizedSearch) ||
      product.subcategory.toLowerCase().includes(normalizedSearch);

    return categoryMatch && brandMatch && certMatch && originMatch && searchMatch;
  });
}

function sortProducts(products: ProductRecord[], sort: "latest" | "name") {
  return [...products].sort((a, b) => {
    if (sort === "name") {
      return a.name.localeCompare(b.name);
    }
    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
  });
}

export function ProductsContent({
  allProducts,
  selectedCategory,
  selectedBrand,
  selectedCertification,
  selectedOrigin,
  selectedSearch,
  selectedSort,
  currentPage,
  basePath,
}: ProductsContentProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(selectedSearch);
  const [isPending, startTransition] = useTransition();
  const searchAnchorRef = useRef<HTMLDivElement | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    searchAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [
    selectedCategory,
    selectedBrand,
    selectedCertification,
    selectedOrigin,
    selectedSearch,
    selectedSort,
    currentPage,
  ]);

  const filtered = sortProducts(
    filterProducts(
      allProducts,
      selectedCategory,
      selectedBrand,
      selectedCertification,
      selectedOrigin,
      searchValue,
    ),
    selectedSort,
  );

  function navigateToProducts(search: string) {
    startTransition(() => {
      router.push(createHref({ search: search.trim(), page: 1 }), { scroll: false });
    });
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigateToProducts(searchValue);
  }

  const brands = [...new Set(allProducts.map((p) => p.brand))].sort();
  const certifications = ["Evidence Available", "Limited Evidence", "No Evidence Submitted"];
  const origins = ["United States", "Canada", "United Kingdom", "Germany", "France"];

  const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  const validCurrentPage =
    Number.isFinite(currentPage) && currentPage > 0
      ? Math.min(currentPage, totalPages)
      : 1;
  const startIndex = (validCurrentPage - 1) * PRODUCTS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  const createHref = (filters: {
    category?: string;
    brand?: string;
    certification?: string;
    origin?: string;
    search?: string;
    sort?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams();
    const cat = filters.category ?? selectedCategory;
    if (cat !== "All Products") params.set("category", cat);
    const br = filters.brand ?? selectedBrand;
    if (br) params.set("brand", br);
    const cert = filters.certification ?? selectedCertification;
    if (cert) params.set("certification", cert);
    const orig = filters.origin ?? selectedOrigin;
    if (orig) params.set("origin", orig);
    const search = filters.search ?? selectedSearch;
    if (search) params.set("search", search);
    const sort = filters.sort ?? selectedSort;
    if (sort !== "latest") params.set("sort", sort);
    const page = filters.page ?? 1;
    if (page > 1) params.set("page", String(page));
    const q = params.toString();
    return q ? `${basePath}?${q}` : basePath;
  };

  return (
    <section className="saas-section products-catalog-section">
      <div className="container-shell products-catalog-layout">
        <FilterSidebarMobile
          selectedCategory={selectedCategory}
          selectedBrand={selectedBrand}
          selectedCertification={selectedCertification}
          selectedOrigin={selectedOrigin}
          selectedSearch={selectedSearch}
          selectedSort={selectedSort}
          brands={brands}
          certifications={certifications}
          origins={origins}
          createHref={createHref}
        />

        <div className="products-catalog-main">
          <div ref={searchAnchorRef} className="products-page-search-wrap">
            <form className="products-page-search-form" onSubmit={handleSearchSubmit}>
              <div className="products-search-bar products-page-search-bar">
                <Search size={18} aria-hidden="true" className="products-search-icon" />
                <input
                  id="product-page-search"
                  name="search"
                  type="search"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search products, brands, or categories"
                  className="products-search-input"
                />
                <button type="submit" className="products-search-button" disabled={isPending}>
                  {isPending ? "Searching..." : "Search"}
                </button>
              </div>
            </form>
          </div>

          <p className="products-results-count">
            Showing {filtered.length === 0 ? 0 : startIndex + 1}–{startIndex + paginated.length} of{" "}
            {filtered.length} products
          </p>

          <div className="products-grid">
            {paginated.map((product, index) => (
              <ProductCard
                key={product.slug}
                code={product.scanCode}
                name={product.name}
                brand={product.brand}
                brandLogoUrl={product.brandLogoUrl}
                category={mapCategoryToFilter(product.category, product.subcategory)}
                image={product.imageGallery[0]}
                delay={index * 0.04}
              />
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="products-empty">
              <p>No products match your filters.</p>
              <Link href={basePath} scroll={false} className="saas-btn-outline">
                Clear Filters
              </Link>
            </div>
          ) : null}

          {totalPages > 1 ? (
            <div className="products-pagination">
              <Link
                href={createHref({ page: Math.max(1, validCurrentPage - 1) })}
                scroll={false}
                className={`products-pagination-btn ${validCurrentPage === 1 ? "is-disabled" : ""}`}
                aria-disabled={validCurrentPage === 1}
              >
                Previous
              </Link>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={createHref({ page })}
                  scroll={false}
                  className={`products-pagination-btn ${page === validCurrentPage ? "is-current" : ""}`}
                >
                  {page}
                </Link>
              ))}
              <Link
                href={createHref({ page: Math.min(totalPages, validCurrentPage + 1) })}
                scroll={false}
                className={`products-pagination-btn ${validCurrentPage === totalPages ? "is-disabled" : ""}`}
                aria-disabled={validCurrentPage === totalPages}
              >
                Next
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
