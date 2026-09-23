"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandProfileForm } from "@/components/brand/brand-profile-form";
import { PasswordChangeForm } from "@/components/brand/password-change-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export type NotificationRow = {
  id: string;
  message: string;
  detail: string | null;
  href: string | null;
  read: boolean;
  createdAt: Date;
};

type SettingsTabsProps = {
  brand: { name: string; logoUrl: string; summary: string };
  canEditProfile: boolean;
  subscription: { planName: string; status: string } | null;
  invoiceCount: number;
  notifications: NotificationRow[];
};

export function SettingsTabs({ brand, canEditProfile, subscription, invoiceCount, notifications: initialNotifications }: SettingsTabsProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    fetch(`/api/brand/notifications/${id}`, { method: "PATCH" }).catch(() => {});
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    fetch("/api/brand/notifications/mark-all-read", { method: "POST" }).catch(() => {});
  }

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
            <CardTitle>Notifications</CardTitle>
            {unreadCount > 0 ? (
              <CardAction>
                <Button variant="outline" size="sm" onClick={markAllRead}>
                  Mark all as read
                </Button>
              </CardAction>
            ) : null}
          </CardHeader>
          <CardContent className="grid gap-2.5">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notifications yet.</p>
            ) : (
              notifications.map((item) => {
                const row = (
                  <>
                    <span className="flex items-center gap-2">
                      {!item.read ? <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" /> : null}
                      <span className={item.read ? "font-medium text-muted-foreground" : "font-semibold text-foreground"}>
                        {item.message}
                      </span>
                    </span>
                    {item.detail ? <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p> : null}
                    <p className="mt-1 text-xs text-muted-foreground">{item.createdAt.toLocaleDateString()}</p>
                  </>
                );

                return item.href ? (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => !item.read && markRead(item.id)}
                    className="block rounded-lg bg-muted px-3.5 py-3 text-sm leading-relaxed transition-colors hover:bg-muted/70"
                  >
                    {row}
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => !item.read && markRead(item.id)}
                    className="rounded-lg bg-muted px-3.5 py-3 text-left text-sm leading-relaxed transition-colors hover:bg-muted/70"
                  >
                    {row}
                  </button>
                );
              })
            )}
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
