import Image from "next/image";

// Percentage-converted from the real compositor's pixel regions
// (lib/origincard-tag.ts, QR_REGION / SERIAL_STRIP, against the template's
// actual 2399x2298 size) so this preview can never silently drift from
// what the downloaded tag actually looks like. The serial block mirrors
// the real compositor's two centered, stacked lines — it previously drew
// an entirely different two-column Serial/Product row that didn't match
// the real output at all; product/brand name are shown elsewhere on this
// page already, so they're not needed inside the tag graphic itself.
const QR_BOX = { left: 33.26, top: 29.11, width: 33.06, height: 34.6 };
const SERIAL_BOX = { left: 12.51, top: 76.85, width: 74.99, height: 13.93 };

export function BrandTagPreview({
  serialNumber,
  qrDataUrl,
}: {
  serialNumber: string;
  qrDataUrl: string;
}) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-[color:var(--line)] bg-white shadow-[0_20px_80px_rgba(13,43,29,0.12)]">
      <div className="relative aspect-[2399/2298] w-full bg-[#eef3ee]">
        <Image
          src="/images/for-brands/tag/truorigin-tag-updated.png"
          alt="TruOrigin tag preview"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 560px"
          className="object-contain"
        />

        <div
          className="absolute rounded-3xl border border-white/70 bg-white/95 p-2 shadow-[0_16px_30px_rgba(0,0,0,0.18)] md:p-3"
          style={{ left: `${QR_BOX.left}%`, top: `${QR_BOX.top}%`, width: `${QR_BOX.width}%`, height: `${QR_BOX.height}%` }}
        >
          <img src={qrDataUrl} alt="Product QR code" className="h-full w-full object-contain" />
        </div>

        <div
          className="absolute flex flex-col items-center justify-center text-center"
          style={{ left: `${SERIAL_BOX.left}%`, top: `${SERIAL_BOX.top}%`, width: `${SERIAL_BOX.width}%`, height: `${SERIAL_BOX.height}%` }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a7a44] md:text-xs">Serial No.</p>
          <p className="mt-1 text-xl font-extrabold tracking-wide text-[#0f1a14] md:text-2xl">{serialNumber}</p>
        </div>
      </div>
    </div>
  );
}
