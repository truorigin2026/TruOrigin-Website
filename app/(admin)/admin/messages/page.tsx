import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { DataTable, type TableRowData } from "@/components/dashboard/data-table";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

const HEADERS = ["Brand", "Last message", "Unread"];

export default async function AdminMessagesPage() {
  await requireAdminUser();

  const [conversations, unread] = await Promise.all([
    prisma.conversation.findMany({
      where: { lastMessageAt: { not: null } },
      orderBy: { lastMessageAt: "desc" },
      include: { brand: { select: { id: true, name: true } } },
    }),
    prisma.message.groupBy({
      by: ["conversationId"],
      where: { senderType: "BRAND", readAt: null },
      _count: { _all: true },
    }),
  ]);

  const unreadByConversation = new Map(unread.map((row) => [row.conversationId, row._count._all]));

  const rows: TableRowData[] = conversations.map((conversation) => {
    const unreadCount = unreadByConversation.get(conversation.id) ?? 0;
    return {
      key: conversation.id,
      href: `/admin/messages/${conversation.brandId}`,
      cells: [
        <span key="brand" className="font-medium text-foreground">{conversation.brand.name}</span>,
        conversation.lastMessageAt
          ? conversation.lastMessageAt.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
          : "—",
        unreadCount > 0 ? <Badge variant="destructive">{unreadCount}</Badge> : <span className="text-muted-foreground">—</span>,
      ],
    };
  });

  return (
    <>
      <PageHeader eyebrow="Messages" title="Brand conversations." description="Every brand's chat with the admin team, most recent first." />
      <DataTable headers={HEADERS} rows={rows} emptyMessage="No conversations yet." />
    </>
  );
}
