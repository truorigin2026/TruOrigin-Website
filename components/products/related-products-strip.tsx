"use client";

import { useRef } from "react";
import { ProductCard } from "@/components/ui/product-card";
import type { ProductRecord } from "@/lib/data/site-data";

type RelatedProductsStripProps = {
  products: ProductRecord[];
};

export function RelatedProductsStrip({ products }: RelatedProductsStripProps) {
  const railRef = useRef<HTMLDivElement | null>(null);

  function scrollByCards(direction: "left" | "right") {
    const rail = railRef.current;
    if (!rail) return;

    const offset = Math.max(rail.clientWidth * 0.82, 280);
    rail.scrollBy({
      left: direction === "left" ? -offset : offset,
      behavior: "smooth",
    });
  }

  return (
    <section className="product-related-section" aria-labelledby="related-products-title">
      <div className="product-related-header">
        <div>
          <p className="product-related-eyebrow">Explore more</p>
          <h2 id="related-products-title">Products You May Like</h2>
        </div>

        <div className="product-related-controls" aria-label="Related products navigation">
          <button
            type="button"
            className="product-related-control"
            onClick={() => scrollByCards("left")}
            aria-label="Show previous products"
          >
            <span aria-hidden="true">&larr;</span>
          </button>
          <button
            type="button"
            className="product-related-control"
            onClick={() => scrollByCards("right")}
            aria-label="Show next products"
          >
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>

      <div ref={railRef} className="product-related-rail">
        {products.map((product, index) => (
          <div key={product.slug} className="product-related-card">
            <ProductCard
              slug={product.slug}
              name={product.name}
              brand={product.brand}
              brandLogoUrl={product.brandLogoUrl}
              category={product.category}
              image={product.imageGallery[0]}
              delay={index * 0.05}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
