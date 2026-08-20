import { requireBrandUser } from "@/lib/session";
import { DashboardChrome } from "@/components/dashboard/dashboard-chrome";

export default async function BrandLayout({ children }: { children: React.ReactNode }) {
  const user = await requireBrandUser();

  return (
    <DashboardChrome area="brand" email={user.email}>
      {children}
    </DashboardChrome>
  );
}
