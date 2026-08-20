import { Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterTabs } from "@/components/dashboard/filter-tabs";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateAdminUserForm } from "@/components/admin/create-admin-user-form";
import { CreateBrandForm } from "@/components/admin/create-brand-form";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";
import type { Prisma } from "../../../../generated/prisma/client";

type UsersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const TABLE_HEADERS = ["Email", "Brand", "Last Login", "Status"];

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  await requireAdminUser();

  const resolved = (await searchParams) ?? {};
  const tab = typeof resolved.role === "string" && resolved.role.toUpperCase() === "BRAND" ? "BRAND" : "ADMIN";
  const search = typeof resolved.search === "string" ? resolved.search : "";

  const where: Prisma.UserWhereInput = {
    role: tab,
    ...(search ? { email: { contains: search, mode: "insensitive" } } : {}),
  };

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { brand: true },
    take: 100,
  });

  const rows = users.map((user) => ({
    key: user.id,
    href: `/admin/users/${user.id}`,
    cells: [
      <span key="email" className="font-medium">{user.email}</span>,
      user.brand?.name ?? "No brand",
      user.lastLoginAt ? user.lastLoginAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Never logged in",
      <Badge key="status" variant={user.active ? "success" : "destructive"}>{user.active ? "Active" : "Suspended"}</Badge>,
    ],
  }));

  return (
    <>
      <PageHeader
        eyebrow="Admin Users"
        title="Admin and brand user accounts."
        description="Create additional admin accounts, and suspend accounts that should no longer be able to log in."
      />

      <div className="mb-5">
        <FilterTabs
          items={(["ADMIN", "BRAND"] as const).map((role) => ({
            label: role === "ADMIN" ? "Admin Users" : "Brand Users",
            href: `/admin/users?role=${role}`,
            active: tab === role,
          }))}
        />
      </div>

      <Card className="mb-5">
        <CardHeader>
          <CardTitle>{tab === "ADMIN" ? "Create Admin User" : "Create Brand Account"}</CardTitle>
        </CardHeader>
        <CardContent>{tab === "ADMIN" ? <CreateAdminUserForm /> : <CreateBrandForm />}</CardContent>
      </Card>

      <Card className="mb-5 p-4">
        <form method="GET" className="flex flex-wrap gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input type="text" name="search" defaultValue={search} placeholder="Search by email..." className="h-9 pl-8" />
          </div>
          <input type="hidden" name="role" value={tab} />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
      </Card>

      <DataTable headers={TABLE_HEADERS} rows={rows} emptyMessage="No users found." />
    </>
  );
}
