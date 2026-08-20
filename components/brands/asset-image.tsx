"use client";

import { useState } from "react";

type AssetImageProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function AssetImage({
  src,
  alt,
  className = "",
  fill,
  width,
  height,
  priority,
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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={priority ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" } : undefined}
    />
  );
}
