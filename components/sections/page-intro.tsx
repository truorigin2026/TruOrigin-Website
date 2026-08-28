import { FadeIn } from "@/components/motion";

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="page-intro-section">
      <div className="container-shell page-intro-inner">
        {eyebrow ? (
          <FadeIn>
            <p className="page-intro-eyebrow">{eyebrow}</p>
          </FadeIn>
        ) : null}
        <FadeIn delay={0.06}>
          <h1 className="page-intro-title">{title}</h1>
        </FadeIn>
        {description ? (
          <FadeIn delay={0.12}>
            <p className="page-intro-description">{description}</p>
          </FadeIn>
        ) : null}
      </div>
    </section>
  );
}
