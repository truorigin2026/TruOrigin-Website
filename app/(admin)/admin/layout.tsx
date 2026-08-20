import { requireAdminUser } from "@/lib/session";
import { DashboardChrome } from "@/components/dashboard/dashboard-chrome";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminUser();

  return (
    <DashboardChrome area="admin" email={user.email}>
      {children}
    </DashboardChrome>
  );
}
