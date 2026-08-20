import Image from "next/image";
import { PageHero } from "@/components/sections/page-hero";
import { FadeIn } from "@/components/motion";
import { blogArticles } from "@/lib/data/brands-landing-data";

const blogPosts = blogArticles.filter((article) => article.category !== "Case Study");

export default function ForBrandsBlogPage() {
  return (
    <div className="saas-page">
      <PageHero
        eyebrow="Resources"
        title="Blogs"
        description="Use-case stories, product clarity notes, and rollout thinking from the TruOrigin team."
        centered
      />

      <section className="saas-section">
        <div className="container-shell">
          <div className="blog-tile-grid">
            {blogPosts.map((post, index) => (
              <FadeIn key={post.title} delay={(index % 3) * 0.06}>
                <article className="blog-tile">
                  <div className="blog-tile-image">
                    <Image src={post.image} alt={post.title} fill className="object-cover" />
                  </div>
                  <div className="blog-tile-body">
                    <p className="blog-tile-meta">
                      <span>{post.category}</span>
                      <span>{post.readTime}</span>
                    </p>
                    <h3 className="blog-tile-title">{post.title}</h3>
                    <p className="blog-tile-date">{post.date}</p>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
