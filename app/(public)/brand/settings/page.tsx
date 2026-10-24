import { PageHeader } from "@/components/dashboard/page-header";
import { SettingsTabs } from "@/components/brand/settings-tabs";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { TeamMemberActions } from "@/components/brand/team-member-actions";
import { prisma } from "@/lib/prisma";
import { requireBrandUser } from "@/lib/session";
import { getNotifications } from "@/lib/notifications";
import { formatMoney } from "@/lib/utils/money";
import type { TableRowData } from "@/components/dashboard/data-table";

const ROLE_VARIANT: Record<string, BadgeVariant> = {
  OWNER: "success",
  ADMIN: "info",
  EDITOR: "outline",
  VIEWER: "outline",
};

const INVOICE_STATUS_VARIANT: Record<string, BadgeVariant> = {
  PAID: "success",
  PENDING: "warning",
  FAILED: "destructive",
  REFUNDED: "info",
  VOID: "outline",
};

export default async function BrandSettingsPage() {
  const user = await requireBrandUser();

  const brandId = user.brandId as string;
  const canManageTeam = user.brandRole === "OWNER" || user.brandRole === "ADMIN";

  const [brand, subscription, members, invoices, notifications] = await Promise.all([
    prisma.brand.findUnique({ where: { id: brandId } }),
    prisma.subscription.findFirst({
      where: { brandId },
      orderBy: { createdAt: "desc" },
      include: { plan: true },
    }),
    prisma.user.findMany({ where: { brandId, role: "BRAND" }, orderBy: { createdAt: "asc" } }),
    prisma.invoice.findMany({ where: { brandId }, orderBy: { issuedAt: "desc" }, take: 20 }),
    getNotifications(brandId),
  ]);

  if (!brand) {
    return null;
  }

  const teamRows: TableRowData[] = members.map((member) => ({
    key: member.id,
    cells: [
      <span key="email" className="font-medium">
        {member.email}
      </span>,
      <Badge key="role" variant={ROLE_VARIANT[member.brandRole ?? ""] ?? "outline"}>
        {member.brandRole ?? "Member"}
      </Badge>,
      <Badge key="status" variant={member.active ? "success" : "outline"}>
        {member.active ? "Active" : "Suspended"}
      </Badge>,
      member.lastLoginAt ? member.lastLoginAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Never",
      canManageTeam && member.id !== user.id ? (
        <TeamMemberActions
          key="actions"
          memberId={member.id}
          active={member.active}
          isLastOwner={member.brandRole === "OWNER" && members.filter((m) => m.brandRole === "OWNER").length <= 1}
        />
      ) : (
        <span key="actions" className="text-sm text-muted-foreground">
          —
        </span>
      ),
    ],
  }));

  const invoiceRows: TableRowData[] = invoices.map((invoice) => ({
    key: invoice.id,
    cells: [
      <span key="number" className="font-medium">
        {invoice.invoiceNumber}
      </span>,
      formatMoney(invoice.amount, invoice.currency),
      <Badge key="status" variant={INVOICE_STATUS_VARIANT[invoice.status] ?? "outline"}>
        {invoice.status}
      </Badge>,
      invoice.issuedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    ],
  }));

  return (
    <>
      <PageHeader eyebrow="Settings" title="Manage your brand workspace." description="Profile, team access, notifications, security, and billing — all in one place." />
      <SettingsTabs
        brand={{ name: brand.name, logoUrl: brand.logoUrl ?? "", summary: brand.summary ?? "" }}
        canEditProfile={user.brandRole === "OWNER" || user.brandRole === "ADMIN"}
        canManageTeam={canManageTeam}
        teamRows={teamRows}
        subscription={
          subscription
            ? {
                planName: subscription.plan.name,
                status: subscription.status,
                currentPeriodEnd: subscription.currentPeriodEnd,
                priceMonthly: subscription.plan.priceMonthly,
                priceYearly: subscription.plan.priceYearly,
                currency: subscription.plan.currency,
                features: subscription.plan.features,
              }
            : null
        }
        invoiceRows={invoiceRows}
        notifications={notifications}
      />
    </>
  );
}
