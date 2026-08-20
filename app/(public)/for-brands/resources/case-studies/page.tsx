import { PageHero } from "@/components/sections/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { useCaseArticles } from "@/lib/data/site-data";
import { blogArticles } from "@/lib/data/brands-landing-data";

const caseStudyArticles = blogArticles.filter((article) => article.category === "Case Study");

export default function ForBrandsCaseStudiesPage() {
  return (
    <div className="saas-page">
      <PageHero
        eyebrow="Resources"
        title="Case Studies"
        description="How different categories present claims clearly, with real examples from brands on TruOrigin."
        centered
      />

      <section className="saas-section">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Use-Case Guides"
            title="How different categories present claims clearly"
            centered
          />
          <div className="grid gap-6 lg:grid-cols-2">
            {caseStudyArticles.map((article) => (
              <article key={article.title} className="blog-card">
                <div
                  className="blog-card-image"
                  style={{
                    backgroundImage: `url(${article.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="blog-card-copy">
                  <div className="blog-card-meta">
                    <span>{article.category}</span>
                  </div>
                  <h2>{article.title}</h2>
                  <p>
                    {article.date} · {article.readTime}
                  </p>
                </div>
              </article>
            ))}
            {useCaseArticles.map((article) => (
              <article key={article.slug} id={article.slug} className="blog-card">
                <div
                  className="blog-card-image"
                  style={{
                    background: `linear-gradient(180deg, ${article.accent} 0%, ${article.accentStrong} 100%)`,
                  }}
                >
                  <div className="blog-card-alt">{article.alt}</div>
                </div>
                <div className="blog-card-copy">
                  <div className="blog-card-meta">
                    <span>{article.category}</span>
                  </div>
                  <h2>{article.title}</h2>
                  <p>{article.summary}</p>
                  <div className="blog-tag-row">
                    {article.bullets.map((bullet) => (
                      <span key={bullet} className="blog-tag">
                        {bullet}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
