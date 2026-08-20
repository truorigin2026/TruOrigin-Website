import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterTabs } from "@/components/dashboard/filter-tabs";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";
import type { Prisma } from "../../../../generated/prisma/client";

type CmsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const TYPE_TABS = [
  ["ALL", "All"],
  ["INDUSTRY", "Industries"],
  ["RESOURCE", "Resources"],
  ["FAQ", "FAQs"],
  ["BLOG_POST", "Blogs"],
  ["CONTENT_BLOCK", "Website Content"],
] as const;

const TABLE_HEADERS = ["Type", "Title", "Slug", "Status"];

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  PUBLISHED: "success",
  DRAFT: "warning",
  ARCHIVED: "outline",
};

export default async function AdminCmsPage({ searchParams }: CmsPageProps) {
  await requireAdminUser();

  const resolved = (await searchParams) ?? {};
  const type = typeof resolved.type === "string" ? resolved.type.toUpperCase() : "ALL";

  const where: Prisma.CmsContentWhereInput = type !== "ALL" ? { type: type as never } : {};

  const items = await prisma.cmsContent.findMany({
    where,
    orderBy: [{ order: "asc" }, { updatedAt: "desc" }],
    take: 100,
  });

  const rows = items.map((item) => ({
    key: item.id,
    href: `/admin/cms/${item.id}`,
    cells: [
      <span key="type" className="text-muted-foreground">{item.type.replaceAll("_", " ")}</span>,
      <span key="title" className="font-medium">{item.title}</span>,
      item.slug,
      <Badge key="status" variant={STATUS_VARIANT[item.status] ?? "outline"}>{item.status}</Badge>,
    ],
  }));

  return (
    <>
      <PageHeader
        eyebrow="Admin CMS"
        title="Manage industries, resources, FAQs, blog posts, and website content."
        description="Create and publish content here. Wiring the public marketing pages to read from this content is a separate follow-up — this pass covers admin authoring and publish control."
        actions={
          <Button render={<Link href="/admin/cms/new" />} nativeButton={false}>
            New Content
          </Button>
        }
      />

      <div className="mb-5">
        <FilterTabs items={TYPE_TABS.map(([value, label]) => ({ label, href: `/admin/cms?type=${value}`, active: type === value }))} />
      </div>

      <DataTable headers={TABLE_HEADERS} rows={rows} emptyMessage="No content yet. Create one above." />
    </>
  );
}
