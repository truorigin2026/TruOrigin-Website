import { FadeIn } from "@/components/motion";
import bannerImage from "../../public/images/banner.webp";

export function PageHero({
  eyebrow,
  title,
  description,
  videoSrc,
  imageSrc,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  videoSrc?: string;
  imageSrc?: string;
  centered?: boolean;
}) {
  return (
    <section
      className={`page-hero-shell ${videoSrc || imageSrc ? "page-hero-shell-media" : ""}`}
    >
      <>
        <div
          className="page-hero-image"
          style={{ backgroundImage: `url(${bannerImage.src})` }}
        />
        <div className="page-hero-video-overlay" />
      </>
      <FadeIn className="page-hero-fade">
        <div className={`container-shell page-hero-content ${centered ? "page-hero-content-centered" : ""}`}>
          <div className={centered ? "max-w-5xl mx-auto" : "max-w-5xl"}>
            <h1 className="page-hero-title mt-6 text-5xl leading-tight md:text-7xl">
              {title}
            </h1>
            <p className="page-hero-description mt-8 max-w-4xl text-lg leading-9 md:text-[1.45rem]">
              {description}
            </p>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
