"use client";

import { useState } from "react";
import Image from "next/image";

type AssetImageProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  /** Only used when fill is set. Defaults to full-bleed since every current fill usage is a decorative/background image. */
  sizes?: string;
};

export function AssetImage({
  src,
  alt,
  className = "",
  fill,
  width,
  height,
  priority,
  sizes,
}: AssetImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`asset-image-fallback ${className}`}
        data-asset-path={src}
        aria-label={alt}
      >
        <span className="asset-image-fallback-label">Upload image</span>
        <code className="asset-image-fallback-path">{src}</code>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={fill ? (sizes ?? "100vw") : undefined}
      priority={priority}
      onError={() => setFailed(true)}
      style={fill ? { objectFit: "cover" } : undefined}
    />
  );
}
