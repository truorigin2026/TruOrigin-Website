export function LogoFillLoader({ size = 72, label = "Loading" }: { size?: number; label?: string }) {
  return (
    <div className="logo-fill-loader" style={{ width: size, height: size }} role="status" aria-label={label}>
      <span className="logo-fill-loader-base" aria-hidden="true" />
      <span className="logo-fill-loader-fill" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
