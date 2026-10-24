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
  /** Non-destructive crop, 0-1 — where the important part of the photo is, and how zoomed in. Defaults (0.5, 0.5, 1) match plain object-fit: cover with no change in behavior. Only used when fill is set. */
  focalX?: number;
  focalY?: number;
  zoom?: number;
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
  focalX,
  focalY,
  zoom,
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
      style={
        fill
          ? {
              objectFit: "cover",
              objectPosition: `${(focalX ?? 0.5) * 100}% ${(focalY ?? 0.5) * 100}%`,
              transform: zoom && zoom !== 1 ? `scale(${zoom})` : undefined,
              transformOrigin: `${(focalX ?? 0.5) * 100}% ${(focalY ?? 0.5) * 100}%`,
            }
          : undefined
      }
    />
  );
}
