"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandProfileForm } from "@/components/brand/brand-profile-form";
import { PasswordChangeForm } from "@/components/brand/password-change-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const NOTIFICATION_PREFS = [
  { key: "certExpiry", label: "Certificate expiring soon" },
  { key: "claimEvidence", label: "Claim missing supporting evidence" },
  { key: "cardGenerated", label: "OriginCard generated" },
  { key: "verificationComplete", label: "Product verification completed" },
];

type SettingsTabsProps = {
  brand: { name: string; logoUrl: string; summary: string };
  canEditProfile: boolean;
  subscription: { planName: string; status: string } | null;
  invoiceCount: number;
};

export function SettingsTabs({ brand, canEditProfile, subscription, invoiceCount }: SettingsTabsProps) {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    certExpiry: true,
    claimEvidence: true,
    cardGenerated: true,
    verificationComplete: true,
  });

  return (
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">Brand Profile</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
        <TabsTrigger value="api">API</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-5">
        <Card>
          <CardHeader>
            <CardTitle>Brand Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <BrandProfileForm initialName={brand.name} initialLogoUrl={brand.logoUrl} initialSummary={brand.summary} canEdit={canEditProfile} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="team" className="mt-5">
        <Card>
          <CardHeader>
            <CardTitle>Team & Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">Invite teammates and manage their access from the Team page.</p>
            <Button variant="outline" render={<Link href="/brand/team" />} nativeButton={false}>
              Open Team
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="mt-5">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {NOTIFICATION_PREFS.map((pref) => (
              <label key={pref.key} className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={prefs[pref.key] ?? true}
                  onChange={(event) => setPrefs((prev) => ({ ...prev, [pref.key]: event.target.checked }))}
                  className="size-4 rounded border-input"
                />
                {pref.label}
              </label>
            ))}
            <p className="text-xs text-muted-foreground">Preferences shown here aren&apos;t saved yet — this is a preview of upcoming controls.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security" className="mt-5">
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent>
            <PasswordChangeForm />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="billing" className="mt-5">
        <Card>
          <CardHeader>
            <CardTitle>Billing</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2.5">
            {subscription ? (
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm">
                <span>{subscription.planName}</span>
                <Badge variant="outline">{subscription.status}</Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active subscription.</p>
            )}
            <p className="text-sm text-muted-foreground">{invoiceCount} invoice(s) on file. Contact TruOrigin to make billing changes.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="api" className="mt-5">
        <Card>
          <CardHeader>
            <CardTitle>API</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">API access isn&apos;t available for brand accounts yet.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
