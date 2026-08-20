import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "@/components/admin/user-actions";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/50 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminUser();
  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id }, include: { brand: true } });
  if (!user) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin Users"
        title={user.email}
        description={user.role}
        actions={<Badge variant={user.active ? "success" : "destructive"}>{user.active ? "Active" : "Suspended"}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <div className="grid min-w-0 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <InfoTile label="Role" value={user.role} />
                <InfoTile
                  label="Last Login"
                  value={
                    user.lastLoginAt
                      ? user.lastLoginAt.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })
                      : "Never logged in"
                  }
                />
                {user.brand ? <InfoTile label="Brand" value={user.brand.name} /> : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Roles &amp; Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                TruOrigin currently uses a single flat ADMIN role — every admin account can take every admin action.
                There is no granular per-action permission system yet. Instead, every admin mutation is written to the
                Audit Log with the acting user, action, and timestamp, so misuse is always traceable even without a
                permission gate. If the platform grows a second admin tier, granular permissions can be layered on top
                of this same audit trail.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Manage this account</CardTitle>
          </CardHeader>
          <CardContent>
            <UserActions userId={user.id} active={user.active} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
