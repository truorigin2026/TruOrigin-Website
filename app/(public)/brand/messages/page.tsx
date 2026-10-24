import { PageHeader } from "@/components/dashboard/page-header";
import { MessageThread } from "@/components/messages/message-thread";
import { requireBrandUser } from "@/lib/session";

export default async function BrandMessagesPage() {
  await requireBrandUser();

  return (
    <>
      <PageHeader eyebrow="Messages" title="Chat with the TruOrigin team." description="Ask about a claim, a document, or anything else — only visible to your brand and our admin team." />
      <MessageThread endpoint="/api/brand/messages" viewerType="BRAND" />
    </>
  );
}
