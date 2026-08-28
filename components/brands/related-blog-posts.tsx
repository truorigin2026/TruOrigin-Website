"use client";

import { useRef } from "react";
import { BlogCard } from "@/components/ui/blog-card";
import type { BlogPost } from "@/lib/data/blog-data";

type RelatedBlogPostsProps = {
  posts: BlogPost[];
};

export function RelatedBlogPosts({ posts }: RelatedBlogPostsProps) {
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

  if (posts.length === 0) return null;

  return (
    <section className="blog-related-section" aria-labelledby="blog-related-title">
      <div className="blog-related-header">
        <div>
          <p className="blog-related-eyebrow">Keep Exploring</p>
          <h2 id="blog-related-title">You Might Also Like</h2>
        </div>

        <div className="blog-related-controls" aria-label="Related articles navigation">
          <button
            type="button"
            className="blog-related-control"
            onClick={() => scrollByCards("left")}
            aria-label="Show previous articles"
          >
            <span aria-hidden="true">&larr;</span>
          </button>
          <button
            type="button"
            className="blog-related-control"
            onClick={() => scrollByCards("right")}
            aria-label="Show next articles"
          >
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>

      <div ref={railRef} className="blog-related-rail">
        {posts.map((post, index) => (
          <div key={post.slug} className="blog-related-card">
            <BlogCard post={post} delay={index * 0.05} />
          </div>
        ))}
      </div>
    </section>
  );
}
