"use client";

import { useState } from "react";
import { User, Users, Bell, Lock, CreditCard, CheckCircle2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type TableRowData } from "@/components/dashboard/data-table";
import { ActivityList, ActivityRow } from "@/components/dashboard/activity-list";
import { BrandProfileForm } from "@/components/brand/brand-profile-form";
import { PasswordChangeForm } from "@/components/brand/password-change-form";
import { TeamInviteForm } from "@/components/brand/team-invite-form";
import { formatMoney } from "@/lib/utils/money";

export type NotificationRow = {
  id: string;
  message: string;
  detail: string | null;
  href: string | null;
  read: boolean;
  createdAt: Date;
};

export type SubscriptionSummary = {
  planName: string;
  status: string;
  currentPeriodEnd: Date | null;
  priceMonthly: number | null;
  priceYearly: number | null;
  currency: string;
  features: string[];
};

type SettingsTabsProps = {
  brand: { name: string; logoUrl: string; summary: string };
  canEditProfile: boolean;
  canManageTeam: boolean;
  teamRows: TableRowData[];
  subscription: SubscriptionSummary | null;
  invoiceRows: TableRowData[];
  notifications: NotificationRow[];
};

const TEAM_HEADERS = ["Email", "Role", "Status", "Last Active", "Actions"];
const INVOICE_HEADERS = ["Invoice", "Amount", "Status", "Issued"];

const SUBSCRIPTION_STATUS_VARIANT: Record<string, BadgeVariant> = {
  ACTIVE: "success",
  TRIALING: "info",
  PAST_DUE: "warning",
  CANCELED: "destructive",
  EXPIRED: "destructive",
};

export function SettingsTabs({
  brand,
  canEditProfile,
  canManageTeam,
  teamRows,
  subscription,
  invoiceRows,
  notifications: initialNotifications,
}: SettingsTabsProps) {
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
      <TabsList variant="line">
        <TabsTrigger value="profile">
          <User size={15} />
          Brand Profile
        </TabsTrigger>
        <TabsTrigger value="team">
          <Users size={15} />
          Team
        </TabsTrigger>
        <TabsTrigger value="notifications">
          <Bell size={15} />
          Notifications
          {unreadCount > 0 ? <Badge className="ml-auto">{unreadCount}</Badge> : null}
        </TabsTrigger>
        <TabsTrigger value="security">
          <Lock size={15} />
          Security
        </TabsTrigger>
        <TabsTrigger value="billing">
          <CreditCard size={15} />
          Billing
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Brand Profile</CardTitle>
            <CardDescription>How your brand appears across TruOrigin — name, logo, and summary.</CardDescription>
          </CardHeader>
          <CardContent>
            <BrandProfileForm initialName={brand.name} initialLogoUrl={brand.logoUrl} initialSummary={brand.summary} canEdit={canEditProfile} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="team">
        <div className="grid gap-5">
          {canManageTeam ? (
            <Card>
              <CardHeader>
                <CardTitle>Invite a teammate</CardTitle>
                <CardDescription>They&apos;ll receive access scoped to the role you choose.</CardDescription>
              </CardHeader>
              <CardContent>
                <TeamInviteForm />
              </CardContent>
            </Card>
          ) : null}
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
              <CardDescription>Everyone with access to this brand&apos;s workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable headers={TEAM_HEADERS} rows={teamRows} emptyMessage="No team members yet." />
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Admin decisions and messages about your products.</CardDescription>
            {unreadCount > 0 ? (
              <CardAction>
                <Button variant="outline" size="sm" onClick={markAllRead}>
                  Mark all as read
                </Button>
              </CardAction>
            ) : null}
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notifications yet.</p>
            ) : (
              <ActivityList>
                {notifications.map((item) => (
                  <ActivityRow
                    key={item.id}
                    title={item.message}
                    detail={item.detail ?? undefined}
                    meta={item.createdAt.toLocaleDateString()}
                    href={item.href ?? undefined}
                    unread={!item.read}
                    onClick={item.read ? undefined : () => markRead(item.id)}
                  />
                ))}
              </ActivityList>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Change the password used to sign in to this account.</CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordChangeForm />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="billing">
        <div className="grid gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Plan</CardTitle>
              <CardDescription>Your current subscription and what it includes.</CardDescription>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="rounded-xl border border-border bg-muted/40 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-foreground">{subscription.planName}</p>
                      {subscription.priceMonthly != null ? (
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {formatMoney(subscription.priceMonthly, subscription.currency)} / month
                        </p>
                      ) : null}
                    </div>
                    <Badge variant={SUBSCRIPTION_STATUS_VARIANT[subscription.status] ?? "outline"}>
                      {subscription.status.replaceAll("_", " ")}
                    </Badge>
                  </div>

                  {subscription.currentPeriodEnd ? (
                    <p className="mt-4 text-sm text-muted-foreground">
                      {subscription.status === "CANCELED" ? "Access ends" : "Renews"}{" "}
                      <span className="font-medium text-foreground">
                        {subscription.currentPeriodEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </span>
                    </p>
                  ) : null}

                  {subscription.features.length > 0 ? (
                    <ul className="mt-4 grid gap-2 border-t border-border pt-4 sm:grid-cols-2">
                      {subscription.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                          <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-success" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active subscription.</p>
              )}
              <p className="mt-3 text-sm text-muted-foreground">Contact TruOrigin to make billing changes.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable headers={INVOICE_HEADERS} rows={invoiceRows} emptyMessage="No invoices yet." />
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
