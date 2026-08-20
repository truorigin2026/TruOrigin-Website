import { AssetImage } from "@/components/brands/asset-image";

export function LandingHeroVisual({
  image,
  alt,
  className = "",
}: {
  image: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`landing-hero-visual ${className}`.trim()}>
      <div className="landing-hero-ambient-glow landing-hero-ambient-glow-one" aria-hidden="true" />
      <div className="landing-hero-ambient-glow landing-hero-ambient-glow-two" aria-hidden="true" />
      <div className="landing-hero-orbit landing-hero-orbit-one" aria-hidden="true" />
      <div className="landing-hero-orbit landing-hero-orbit-two" aria-hidden="true" />
      <div className="landing-hero-spotlight" aria-hidden="true" />
      <div className="landing-hero-device-shadow" aria-hidden="true" />
      <div className="landing-hero-device-stack">
        <div className="landing-hero-device-frame">
          <AssetImage src={image} alt={alt} className="landing-hero-device-image" priority />
        </div>
      </div>
    </div>
  );
}
