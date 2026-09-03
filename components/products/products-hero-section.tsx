"use client";

import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { MoltenMetal } from "@/components/brands/molten-metal";

const scatterTags = [
  { text: "Backed by documentation", className: "products-hero-tag products-hero-tag-1" },
  { text: "Look beyond the label", className: "products-hero-tag products-hero-tag-2" },
  { text: "Evidence, not guesswork", className: "products-hero-tag products-hero-tag-3" },
  { text: "Reviewed before it ships", className: "products-hero-tag products-hero-tag-4" },
  { text: "Claims you can check", className: "products-hero-tag products-hero-tag-5" },
  { text: "Information over promises", className: "products-hero-tag products-hero-tag-6" },
  { text: "Nothing hidden", className: "products-hero-tag products-hero-tag-7" },
];

export function ProductsHeroSection() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const createHref = (search: string) => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    const query = params.toString();
    return query ? `/for-products/products?${query}` : "/for-products/products";
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(createHref(searchValue));
  };

  return (
    <section className="products-hero-shell">
      <MoltenMetal
        className="products-hero-bg"
        color1="#081b12"
        color2="#164a2e"
        color3="#c8f542"
        speed={0.3}
        scale={4.5}
        glow={1.5}
        grain
        grainIntensity={0.06}
        mouseInteraction
        mouseStrength={0.25}
      />
      <div className="products-hero-overlay" />

      <div className="products-hero-inner">
        {scatterTags.map((tag) => (
          <span key={tag.text} className={tag.className}>
            {tag.text}
          </span>
        ))}

        <h1 className="products-hero-title">
          Product Claims, <span className="products-hero-title-accent">Made Clear</span>
        </h1>

        <form onSubmit={handleSubmit} className="products-hero-search">
          <label htmlFor="products-hero-search-input" className="sr-only">
            Search product claims
          </label>
          <div className="products-hero-search-box">
            <Search size={20} aria-hidden="true" />
            <input
              id="products-hero-search-input"
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search product claims, brands, categories"
              className="products-hero-search-input"
            />
            <button type="submit" className="products-hero-search-button">
              Explore claims
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
