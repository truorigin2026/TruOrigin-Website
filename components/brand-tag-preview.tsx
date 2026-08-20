import Image from "next/image";

export function BrandTagPreview({
  serialNumber,
  qrDataUrl,
  productName,
  brandName,
}: {
  serialNumber: string;
  qrDataUrl: string;
  productName: string;
  brandName: string;
}) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-[color:var(--line)] bg-white shadow-[0_20px_80px_rgba(13,43,29,0.12)]">
      <div className="relative aspect-[4/5] w-full bg-[#eef3ee]">
        <Image
          src="/images/for-brands/tag/truorigin-tag.png"
          alt="TruOrigin tag preview"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 560px"
          className="object-contain"
        />

        <div className="absolute left-[11%] top-[10%] rounded-3xl border border-white/70 bg-white/95 p-2 shadow-[0_16px_30px_rgba(0,0,0,0.18)] md:left-[10%] md:top-[11%] md:p-3">
          <img
            src={qrDataUrl}
            alt={`${productName} QR code`}
            className="h-24 w-24 object-contain md:h-32 md:w-32"
          />
        </div>

        <div className="absolute left-[9%] right-[9%] bottom-[6%] flex items-end justify-between gap-4 rounded-[20px] bg-white/92 px-4 py-3 backdrop-blur-sm">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5e6d63]">
              Serial No.
            </p>
            <p className="mt-1 text-base font-semibold tracking-[0.12em] text-[color:var(--brand-dark)] md:text-lg">
              {serialNumber}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5e6d63]">
              Product
            </p>
            <p className="mt-1 max-w-[10rem] text-sm font-semibold text-[color:var(--foreground)]">
              {productName}
            </p>
            <p className="text-xs text-[color:var(--muted)]">{brandName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
