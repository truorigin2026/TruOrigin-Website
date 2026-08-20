import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/motion";

type ProductCardProps = {
  slug: string;
  name: string;
  brand: string;
  brandLogoUrl?: string | null;
  category: string;
  image: string;
  delay?: number;
};

export function ProductCard({ slug, name, brand, brandLogoUrl, category, image, delay = 0 }: ProductCardProps) {
  return (
    <FadeIn delay={delay}>
      <Link href={`/p/${slug}`} className="product-card">
        <div className="product-card-image-wrap">
          <Image src={image} alt={name} fill className="product-card-image" sizes="(max-width:768px) 100vw, 25vw" />
          {brandLogoUrl ? (
            <div className="product-card-mark">
              <span className="product-card-brand-logo">
                <Image src={brandLogoUrl} alt={`${brand} logo`} fill sizes="36px" />
              </span>
            </div>
          ) : null}
        </div>
        <div className="product-card-body">
          <h3 className="product-card-name">{name}</h3>
          <p className="product-card-brand">{brand}</p>
          <p className="product-card-category">{category}</p>
          <div className="product-card-footer">
            <span className="product-card-action">
              View Details
              <span aria-hidden="true">↗</span>
            </span>
          </div>
        </div>
      </Link>
    </FadeIn>
  );
}
