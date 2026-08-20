import { ReactNode } from "react";
import { FadeIn } from "@/components/motion";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
  children?: ReactNode;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
  children,
}: SectionHeadingProps) {
  return (
    <FadeIn>
      <div className={`section-heading ${centered ? "section-heading-centered" : ""}`}>
        {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
        <h2 className="section-title">{title}</h2>
        {description ? <p className="section-description">{description}</p> : null}
        {children}
      </div>
    </FadeIn>
  );
}
