const ACTIVE_CELLS = [
  0, 1, 2, 3, 5, 7, 8, 10, 12, 13, 14, 17, 18, 20, 22, 24, 25, 27, 28, 30, 31, 34, 35, 36, 39,
  40, 42, 43, 45, 47, 48, 49, 52, 54, 55, 56, 59, 60, 63,
];

export function QrArtwork({
  code,
  className = "",
}: {
  code: string;
  className?: string;
}) {
  return (
    <div className={`rounded-[28px] border border-black/10 bg-white p-4 shadow-[0_18px_50px_rgba(15,32,22,0.08)] ${className}`}>
      <div className="grid grid-cols-8 gap-1.5 rounded-[20px] bg-[#f3f0e8] p-3">
        {Array.from({ length: 64 }).map((_, index) => (
          <div
            key={index}
            className={`aspect-square rounded-[3px] ${
              ACTIVE_CELLS.includes(index) ? "bg-[#173628]" : "bg-white"
            }`}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
        <span>Product QR</span>
        <span>{code}</span>
      </div>
    </div>
  );
}
