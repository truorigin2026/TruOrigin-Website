import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { MessageThread } from "@/components/messages/message-thread";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

export default async function AdminMessageThreadPage({ params }: { params: Promise<{ brandId: string }> }) {
  await requireAdminUser();
  const { brandId } = await params;

  const brand = await prisma.brand.findUnique({ where: { id: brandId }, select: { id: true, name: true } });
  if (!brand) {
    notFound();
  }

  return (
    <>
      <Link href="/admin/messages" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} />
        All conversations
      </Link>
      <PageHeader eyebrow="Messages" title={brand.name} />
      <MessageThread endpoint={`/api/admin/messages/${brand.id}`} viewerType="ADMIN" />
    </>
  );
}
