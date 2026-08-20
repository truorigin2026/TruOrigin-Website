import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CmsForm } from "@/components/admin/cms-form";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

export default async function AdminCmsEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminUser();
  const { id } = await params;

  const item = await prisma.cmsContent.findUnique({ where: { id } });
  if (!item) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin CMS"
        title={item.title}
        description={item.type.replaceAll("_", " ")}
        actions={<Badge variant="outline">{item.status}</Badge>}
      />
      <Card>
        <CardContent className="pt-4">
          <CmsForm
            mode="edit"
            initial={{
              id: item.id,
              type: item.type,
              slug: item.slug,
              title: item.title,
              subtitle: item.subtitle,
              excerpt: item.excerpt,
              body: item.body,
              category: item.category,
              status: item.status,
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}
