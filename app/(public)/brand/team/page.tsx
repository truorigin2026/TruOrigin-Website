import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TeamInviteForm } from "@/components/brand/team-invite-form";
import { TeamMemberActions } from "@/components/brand/team-member-actions";
import { prisma } from "@/lib/prisma";
import { requireBrandUser } from "@/lib/session";

const ROLE_VARIANT: Record<string, BadgeVariant> = {
  OWNER: "success",
  ADMIN: "info",
  EDITOR: "outline",
  VIEWER: "outline",
};

const TABLE_HEADERS = ["Email", "Role", "Status", "Last Active", "Actions"];

export default async function BrandTeamPage() {
  const user = await requireBrandUser();
  const canManage = user.brandRole === "OWNER" || user.brandRole === "ADMIN";

  const members = await prisma.user.findMany({
    where: { brandId: user.brandId, role: "BRAND" },
    orderBy: { createdAt: "asc" },
  });

  const rows = members.map((member) => ({
    key: member.id,
    cells: [
      <span key="email" className="font-medium">{member.email}</span>,
      <Badge key="role" variant={ROLE_VARIANT[member.brandRole ?? ""] ?? "outline"}>{member.brandRole ?? "Member"}</Badge>,
      <Badge key="status" variant={member.active ? "success" : "outline"}>{member.active ? "Active" : "Suspended"}</Badge>,
      member.lastLoginAt ? member.lastLoginAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Never",
      canManage && member.id !== user.id ? (
        <TeamMemberActions key="actions" memberId={member.id} active={member.active} isLastOwner={member.brandRole === "OWNER" && members.filter((m) => m.brandRole === "OWNER").length <= 1} />
      ) : (
        <span key="actions" className="text-sm text-muted-foreground">—</span>
      ),
    ],
  }));

  return (
    <>
      <PageHeader
        eyebrow="Team"
        title="Manage who on your team can access TruOrigin."
        description="Invite teammates and control who can manage products, claims, and documents for your brand."
      />

      {canManage ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Invite a teammate</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamInviteForm />
          </CardContent>
        </Card>
      ) : null}

      <DataTable headers={TABLE_HEADERS} rows={rows} emptyMessage="No team members yet." />
    </>
  );
}
