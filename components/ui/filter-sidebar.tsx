import Link from "next/link";
import { productFilterCategories } from "@/lib/data/frontend-data";

type FilterSidebarProps = {
  selectedCategory: string;
  selectedBrand?: string;
  selectedCertification?: string;
  selectedOrigin?: string;
  selectedSearch?: string;
  selectedSort?: string;
  brands: string[];
  certifications: string[];
  origins: string[];
  createHref: (filters: {
    category?: string;
    brand?: string;
    certification?: string;
    origin?: string;
    search?: string;
    sort?: string;
    page?: number;
  }) => string;
};

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="filter-sidebar-group">
      <h3 className="filter-sidebar-subtitle">{title}</h3>
      {children}
    </div>
  );
}

function FilterOption({
  label,
  active,
  href,
}: {
  label: string;
  active: boolean;
  href: string;
}) {
  return (
    <Link href={href} scroll={false} className={`filter-sidebar-option ${active ? "is-active" : ""}`}>
      <span className="filter-sidebar-tick" aria-hidden="true">
        {active ? "✓" : ""}
      </span>
      <span>{label}</span>
    </Link>
  );
}

export function FilterSidebar({
  selectedCategory,
  selectedBrand = "",
  selectedCertification = "",
  selectedOrigin = "",
  selectedSearch = "",
  selectedSort = "latest",
  brands,
  certifications,
  origins,
  createHref,
}: FilterSidebarProps) {
  return (
    <aside className="filter-sidebar">
      <h2 className="filter-sidebar-title">Filters</h2>

      <FilterGroup title="Categories">
        <div className="filter-sidebar-list">
          {productFilterCategories.map((category) => (
            <FilterOption
              key={category}
              label={category}
              active={selectedCategory === category}
              href={createHref({
                category,
                brand: selectedBrand,
                certification: selectedCertification,
                origin: selectedOrigin,
                search: selectedSearch,
                sort: selectedSort,
                page: 1,
              })}
            />
          ))}
        </div>
      </FilterGroup>

      {brands.length > 0 ? (
        <FilterGroup title="Brand">
          <div className="filter-sidebar-list">
            <FilterOption
              label="All Brands"
              active={!selectedBrand}
              href={createHref({
                category: selectedCategory,
                certification: selectedCertification,
                origin: selectedOrigin,
                search: selectedSearch,
                sort: selectedSort,
                page: 1,
              })}
            />
            {brands.map((brand) => (
              <FilterOption
                key={brand}
                label={brand}
                active={selectedBrand === brand}
                href={createHref({
                  category: selectedCategory,
                  brand,
                  certification: selectedCertification,
                  origin: selectedOrigin,
                  search: selectedSearch,
                  sort: selectedSort,
                  page: 1,
                })}
              />
            ))}
          </div>
        </FilterGroup>
      ) : null}

      {certifications.length > 0 ? (
        <FilterGroup title="Certification Type">
          <div className="filter-sidebar-list">
            <FilterOption
              label="All Certifications"
              active={!selectedCertification}
              href={createHref({
                category: selectedCategory,
                brand: selectedBrand,
                origin: selectedOrigin,
                search: selectedSearch,
                sort: selectedSort,
                page: 1,
              })}
            />
            {certifications.map((cert) => (
              <FilterOption
                key={cert}
                label={cert}
                active={selectedCertification === cert}
                href={createHref({
                  category: selectedCategory,
                  brand: selectedBrand,
                  certification: cert,
                  origin: selectedOrigin,
                  search: selectedSearch,
                  sort: selectedSort,
                  page: 1,
                })}
              />
            ))}
          </div>
        </FilterGroup>
      ) : null}

      {origins.length > 0 ? (
        <FilterGroup title="Country of Origin">
          <div className="filter-sidebar-list">
            <FilterOption
              label="All Origins"
              active={!selectedOrigin}
              href={createHref({
                category: selectedCategory,
                brand: selectedBrand,
                certification: selectedCertification,
                search: selectedSearch,
                sort: selectedSort,
                page: 1,
              })}
            />
            {origins.map((origin) => (
              <FilterOption
                key={origin}
                label={origin}
                active={selectedOrigin === origin}
                href={createHref({
                  category: selectedCategory,
                  brand: selectedBrand,
                  certification: selectedCertification,
                  origin,
                  search: selectedSearch,
                  sort: selectedSort,
                  page: 1,
                })}
              />
            ))}
          </div>
        </FilterGroup>
      ) : null}
    </aside>
  );
}
