import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { CmsForm } from "@/components/admin/cms-form";
import { requireAdminUser } from "@/lib/session";

export default async function AdminCmsNewPage() {
  await requireAdminUser();

  return (
    <>
      <PageHeader eyebrow="Admin CMS" title="New content" description="Content is created as a draft. Publish it once it's ready to go live." />
      <Card>
        <CardContent className="pt-4">
          <CmsForm mode="create" />
        </CardContent>
      </Card>
    </>
  );
}
