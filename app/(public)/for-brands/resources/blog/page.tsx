import type { Metadata } from "next";
import { PageIntro } from "@/components/sections/page-intro";
import { BlogCard } from "@/components/ui/blog-card";
import { getBlogPosts } from "@/lib/data/blog-data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description:
    "Straight answers on product claims, label transparency, and how OriginCard turns brand documentation into information customers can actually find.",
  path: "/for-brands/resources/blog",
});

export default function ForBrandsBlogPage() {
  const posts = getBlogPosts();

  return (
    <div className="saas-page">
      <PageIntro
        eyebrow="Resources"
        title="Blogs"
        description="Straight answers on product claims, label transparency, and how OriginCard turns brand documentation into information customers can actually find."
      />

      <section className="saas-section">
        <div className="container-shell">
          <div className="blog-tile-grid">
            {posts.map((post, index) => (
              <BlogCard key={post.slug} post={post} delay={(index % 3) * 0.06} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
