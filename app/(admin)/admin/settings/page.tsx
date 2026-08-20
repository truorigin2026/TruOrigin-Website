import { PageHeader } from "@/components/dashboard/page-header";
import { FilterTabs } from "@/components/dashboard/filter-tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlatformSettingForm } from "@/components/admin/platform-setting-form";
import { PlatformSettingRow } from "@/components/admin/platform-setting-row";
import { EmailTemplateForm } from "@/components/admin/email-template-form";
import { ApiKeyManager } from "@/components/admin/api-key-manager";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

type SettingsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const TABS = [
  ["platform", "Platform Settings"],
  ["notifications", "Notification Settings"],
  ["email", "Email Templates"],
  ["apikeys", "API Keys"],
] as const;

export default async function AdminSettingsPage({ searchParams }: SettingsPageProps) {
  await requireAdminUser();

  const resolved = (await searchParams) ?? {};
  const tab = typeof resolved.tab === "string" && TABS.some(([value]) => value === resolved.tab) ? resolved.tab : "platform";

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

      <div className="mb-5">
        <FilterTabs items={TABS.map(([value, label]) => ({ label, href: `/admin/settings?tab=${value}`, active: tab === value }))} />
      </div>

      {tab === "platform" ? (
        <Card>
          <CardHeader>
            <CardTitle>Platform Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <PlatformSettingForm keyPrefix="platform." placeholder="Key (e.g. siteName)" />
            <div className="grid gap-2.5">
              {platformSettings.map((setting) => (
                <PlatformSettingRow key={setting.id} id={setting.id} settingKey={setting.key} value={setting.value} />
              ))}
              {platformSettings.length === 0 ? <p className="text-sm text-muted-foreground">No platform settings configured yet.</p> : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === "notifications" ? (
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <PlatformSettingForm keyPrefix="notifications." placeholder="Key (e.g. brandSignupAlert)" />
            <div className="grid gap-2.5">
              {notificationSettings.map((setting) => (
                <PlatformSettingRow key={setting.id} id={setting.id} settingKey={setting.key} value={setting.value} />
              ))}
              {notificationSettings.length === 0 ? <p className="text-sm text-muted-foreground">No notification settings configured yet.</p> : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === "email" ? (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>New Template</CardTitle>
            </CardHeader>
            <CardContent>
              <EmailTemplateForm />
            </CardContent>
          </Card>
          {emailTemplates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle>{template.key}</CardTitle>
              </CardHeader>
              <CardContent>
                <EmailTemplateForm initial={{ key: template.key, subject: template.subject, body: template.body }} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {tab === "apikeys" ? (
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <ApiKeyManager
              apiKeys={apiKeys.map((key) => ({
                id: key.id,
                label: key.label,
                keyPrefix: key.keyPrefix,
                revokedAt: key.revokedAt?.toISOString() ?? null,
                createdAt: key.createdAt.toISOString(),
              }))}
            />
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
