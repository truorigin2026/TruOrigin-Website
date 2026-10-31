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
  search: string,
) {
  const normalizedSearch = search.trim().toLowerCase();

  return products.filter((product) => {
    const mapped = mapCategoryToFilter(product.category, product.subcategory);
    const categoryMatch = category === "All Products" || mapped === category;
    const brandMatch = !brand || product.brand === brand;
    const certMatch = !certification || product.claims.some((c) => c.status === certification);
    const searchMatch =
      !normalizedSearch ||
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.brand.toLowerCase().includes(normalizedSearch) ||
      mapped.toLowerCase().includes(normalizedSearch) ||
      product.subcategory.toLowerCase().includes(normalizedSearch);

    return categoryMatch && brandMatch && certMatch && searchMatch;
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

  // searchValue starts as a *copy* of the selectedSearch prop (useState's
  // initializer only runs once, on mount) and otherwise only changes via
  // the input's own onChange — so a URL-only change to `search` (e.g. the
  // empty-state's "Clear Filters" link, a plain navigation back to the
  // bare catalog URL) updated the prop but left this stale, and since
  // `filtered` below is computed from searchValue, the catalog stayed
  // stuck showing the old (zero) results even once the URL had no search
  // param left. Re-sync whenever the URL's own search value changes.
  //
  // This alone isn't enough, though — confirmed live that firing another
  // navigation (this effect's own trigger) while the search's router.push
  // is still in flight can leave the component never receiving fresh
  // props at all, so this effect never re-fires and searchValue never
  // resets. That's why "Clear Filters" below ALSO resets searchValue
  // directly, synchronously, independent of this effect ever running
  // again — this effect remains the correct behavior for every case where
  // the round trip does land normally (including browser back/forward and
  // direct URL edits, which have no click handler to hook into).
  useEffect(() => {
    setSearchValue(selectedSearch);
  }, [selectedSearch]);

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
    selectedSearch,
    selectedSort,
    currentPage,
  ]);

  const filtered = sortProducts(
    filterProducts(allProducts, selectedCategory, selectedBrand, selectedCertification, searchValue),
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
          selectedSearch={selectedSearch}
          selectedSort={selectedSort}
          brands={brands}
          certifications={certifications}
          createHref={createHref}
        />

        <div className="products-catalog-main">
          <div ref={searchAnchorRef} className="products-page-search-wrap">
            <form className="products-page-search-form" onSubmit={handleSearchSubmit}>
              <div className="products-search-bar products-page-search-bar">
                <Search size={18} aria-hidden="true" className="products-search-icon" />
                <label htmlFor="product-page-search" className="sr-only">
                  Search products, brands, or categories
                </label>
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

          {/* The desktop filter sidebar's own "Filters" <h2> is hidden by
              CSS below the mobile breakpoint, and the mobile filter sheet's
              matching <h2> only exists in the DOM while that sheet is open
              -- leaving mobile viewports with the page's <h1> followed
              directly by each ProductCard's <h3>, skipping a level. This
              sr-only heading closes that gap unconditionally, on every
              viewport, with no visual change. */}
          <h2 className="sr-only">Product results</h2>

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
                focalPoint={product.heroFocalPoint}
                delay={index * 0.04}
              />
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="products-empty">
              <p>No products match your filters.</p>
              {/* Also resets searchValue synchronously here, not only via
                  the selectedSearch-prop-sync effect above: that effect
                  only fires once this Link's own navigation has actually
                  landed with fresh props, and confirmed live that firing
                  this navigation while a just-submitted search's own
                  navigation is still in flight can leave the component
                  never receiving fresh props at all — Next's router ends
                  up applying this click's URL change without ever
                  re-rendering the page with the new searchParams. Setting
                  the state directly here makes the one thing the user
                  actually sees (the search box, and the filtering it
                  drives) correct immediately and unconditionally,
                  regardless of whether that navigation's data round-trip
                  ever lands. */}
              <Link href={basePath} scroll={false} className="saas-btn-outline" onClick={() => setSearchValue("")}>
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
