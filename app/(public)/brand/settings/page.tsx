import { PageHeader } from "@/components/dashboard/page-header";
import { SettingsTabs } from "@/components/brand/settings-tabs";
import { prisma } from "@/lib/prisma";
import { requireBrandUser } from "@/lib/session";

export default async function BrandSettingsPage() {
  const user = await requireBrandUser();

  const brandId = user.brandId as string;

  const [brand, subscription, invoiceCount] = await Promise.all([
    prisma.brand.findUnique({ where: { id: brandId } }),
    prisma.subscription.findFirst({
      where: { brandId },
      orderBy: { createdAt: "desc" },
      include: { plan: true },
    }),
    prisma.invoice.count({ where: { brandId } }),
  ]);

  if (!brand) {
    return null;
  }

  return (
    <>
      <PageHeader eyebrow="Settings" title="Manage your brand workspace." />
      <SettingsTabs
        brand={{ name: brand.name, logoUrl: brand.logoUrl ?? "", summary: brand.summary ?? "" }}
        canEditProfile={user.brandRole === "OWNER" || user.brandRole === "ADMIN"}
        subscription={subscription ? { planName: subscription.plan.name, status: subscription.status } : null}
        invoiceCount={invoiceCount}
      />
    </>
  );
}
