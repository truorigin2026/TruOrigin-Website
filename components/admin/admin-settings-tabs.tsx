"use client";

import { SlidersHorizontal, Bell, Mail, KeyRound } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PlatformSettingForm } from "@/components/admin/platform-setting-form";
import { PlatformSettingRow } from "@/components/admin/platform-setting-row";
import { EmailTemplateForm } from "@/components/admin/email-template-form";
import { ApiKeyManager } from "@/components/admin/api-key-manager";

type PlatformSetting = { id: string; key: string; value: unknown };
type EmailTemplate = { id: string; key: string; subject: string; body: string };
type ApiKey = { id: string; label: string; keyPrefix: string; revokedAt: string | null; createdAt: string };

export function AdminSettingsTabs({
  platformSettings,
  notificationSettings,
  emailTemplates,
  apiKeys,
}: {
  platformSettings: PlatformSetting[];
  notificationSettings: PlatformSetting[];
  emailTemplates: EmailTemplate[];
  apiKeys: ApiKey[];
}) {
  return (
    <Tabs defaultValue="platform" orientation="vertical">
      <TabsList variant="line" className="w-52 shrink-0">
        <TabsTrigger value="platform">
          <SlidersHorizontal size={15} />
          Platform Settings
        </TabsTrigger>
        <TabsTrigger value="notifications">
          <Bell size={15} />
          Notification Settings
        </TabsTrigger>
        <TabsTrigger value="email">
          <Mail size={15} />
          Email Templates
        </TabsTrigger>
        <TabsTrigger value="apikeys">
          <KeyRound size={15} />
          API Keys
        </TabsTrigger>
      </TabsList>

      <TabsContent value="platform">
        <Card>
          <CardHeader>
            <CardTitle>Platform Settings</CardTitle>
            <CardDescription>General configuration for the whole platform.</CardDescription>
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
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Keys that control when and how the platform notifies people.</CardDescription>
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
      </TabsContent>

      <TabsContent value="email">
        <div className="grid gap-5">
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
      </TabsContent>

      <TabsContent value="apikeys">
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <ApiKeyManager apiKeys={apiKeys} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
