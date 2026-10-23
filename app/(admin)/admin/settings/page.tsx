import { PageHeader } from "@/components/dashboard/page-header";
import { AdminSettingsTabs } from "@/components/admin/admin-settings-tabs";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

export default async function AdminSettingsPage() {
  await requireAdminUser();

  const [platformSettings, notificationSettings, emailTemplates, apiKeys] = await Promise.all([
    prisma.platformSetting.findMany({ where: { key: { startsWith: "platform." } }, orderBy: { key: "asc" } }),
    prisma.platformSetting.findMany({ where: { key: { startsWith: "notifications." } }, orderBy: { key: "asc" } }),
    prisma.emailTemplate.findMany({ orderBy: { key: "asc" } }),
    prisma.apiKey.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Admin Settings"
        title="Platform configuration, notifications, email templates, and API keys."
        description="Changes here affect the whole platform. Every save is written to the audit trail."
      />

      <AdminSettingsTabs
        platformSettings={platformSettings}
        notificationSettings={notificationSettings}
        emailTemplates={emailTemplates}
        apiKeys={apiKeys.map((key) => ({
          id: key.id,
          label: key.label,
          keyPrefix: key.keyPrefix,
          revokedAt: key.revokedAt?.toISOString() ?? null,
          createdAt: key.createdAt.toISOString(),
        }))}
      />
    </>
  );
}
