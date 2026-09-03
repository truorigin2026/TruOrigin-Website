import { LogoFillLoader } from "@/components/ui/logo-fill-loader";

export default function Loading() {
  return (
    <div className="route-loading-shell">
      <LogoFillLoader size={88} />
    </div>
  );
}
