import { PageHero } from "@/components/sections/page-hero";
import { useCaseArticles } from "@/lib/data/site-data";
import blogHeroImage from "../../../public/images/for-brands/why-it-works.png";

export default function BlogPage() {
  return (
    <div className="section-spacing">
      <PageHero
        eyebrow="Blog"
        title="Use-case stories, product clarity notes, and rollout thinking."
        description="These editorial cards show how TruOrigin can explain different categories without making the website feel generic or over-designed."
        imageSrc={blogHeroImage.src}
      />

      <section className="container-shell mt-12 grid gap-6 lg:grid-cols-2">
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
                <span>Learn More</span>
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
              <div className="blog-paragraphs">
                <p>
                  TruOrigin is strongest when it turns complicated label language into a reading
                  experience that feels clear, deliberate, and calm.
                </p>
                <p>
                  That means showing claim wording, evidence context, update dates, and review
                  status in a way customers can understand without hunting through tabs or legal
                  footnotes.
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
