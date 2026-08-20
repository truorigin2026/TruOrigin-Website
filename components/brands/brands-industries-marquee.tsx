import type { ReactNode } from "react";
import { servedIndustries } from "@/lib/data/brands-landing-data";

const industriesTagline = "Built For Every Industry That Demands Proof";
const taglineRepeats = Array.from({ length: 4 }, (_, index) => index);

function MarqueeGroup({ children, hidden }: { children: ReactNode; hidden?: boolean }) {
  return (
    <span className="brands-industries-marquee-group" aria-hidden={hidden || undefined}>
      {children}
    </span>
  );
}

export function BrandsIndustriesMarquee() {
  return (
    <section className="brands-industries-marquee-shell" aria-label="Industries TruOrigin serves">
      <div className="brands-industries-marquee-row">
        <div className="brands-industries-marquee-track">
          <MarqueeGroup>
            {taglineRepeats.map((index) => (
              <span key={index} className="brands-industries-marquee-item brands-industries-marquee-item-primary">
                {industriesTagline}
              </span>
            ))}
          </MarqueeGroup>
          <MarqueeGroup hidden>
            {taglineRepeats.map((index) => (
              <span key={index} className="brands-industries-marquee-item brands-industries-marquee-item-primary">
                {industriesTagline}
              </span>
            ))}
          </MarqueeGroup>
        </div>
      </div>

      <div className="brands-industries-marquee-row">
        <div className="brands-industries-marquee-track brands-industries-marquee-track-reverse">
          <MarqueeGroup>
            {servedIndustries.map((industry) => (
              <span key={industry.name} className="brands-industries-marquee-item brands-industries-marquee-item-secondary">
                {industry.name}
              </span>
            ))}
          </MarqueeGroup>
          <MarqueeGroup hidden>
            {servedIndustries.map((industry) => (
              <span key={industry.name} className="brands-industries-marquee-item brands-industries-marquee-item-secondary">
                {industry.name}
              </span>
            ))}
          </MarqueeGroup>
        </div>
      </div>
    </section>
  );
}
