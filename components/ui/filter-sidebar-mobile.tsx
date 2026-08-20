"use client";

import { useState } from "react";
import { FilterSidebar } from "./filter-sidebar";

type FilterSidebarMobileProps = {
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

export function FilterSidebarMobile(props: FilterSidebarMobileProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="filter-mobile-button-container">
        <button
          className="filter-mobile-button"
          onClick={() => setIsOpen(true)}
          aria-label="Open filters"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 4H18M2 10H18M2 16H18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Filters
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="filter-sidebar-desktop">
        <FilterSidebar {...props} />
      </div>

      {/* Mobile Modal */}
      {isOpen && (
        <div className="filter-modal-overlay" onClick={handleClose}>
          <div className="filter-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="filter-modal-header">
              <h2>Filters</h2>
              <button
                className="filter-modal-close"
                onClick={handleClose}
                aria-label="Close filters"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div className="filter-modal-body">
              <FilterSidebar {...props} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
