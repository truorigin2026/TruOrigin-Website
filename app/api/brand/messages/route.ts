import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBrandSession } from "@/lib/api-auth";
import { createAdminNotification } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  const session = await requireBrandSession(request);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { brandId: session.brandId },
    include: { messages: { orderBy: { createdAt: "asc" }, take: 200 } },
  });

  if (conversation) {
    // Viewing the thread marks the admin's messages as read, as a side
    // effect of every GET -- there's no separate "mark read" endpoint here.
    await prisma.message.updateMany({
      where: { conversationId: conversation.id, senderType: "ADMIN", readAt: null },
      data: { readAt: new Date() },
    });
  }

  return NextResponse.json({ messages: conversation?.messages ?? [] });
}

export async function POST(request: NextRequest) {
  const session = await requireBrandSession(request);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { body?: string } | null;
  const text = body?.body?.trim();
  if (!text) {
    return NextResponse.json({ error: "Message can't be empty" }, { status: 400 });
  }

  const conversation = await prisma.conversation.upsert({
    where: { brandId: session.brandId },
    create: { brandId: session.brandId, lastMessageAt: new Date() },
    update: { lastMessageAt: new Date() },
  });

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderType: "BRAND",
      senderUserId: session.sub,
      body: text,
    },
  });

  await createAdminNotification({
    type: "NEW_MESSAGE",
    message: `New message from ${session.brandName ?? "a brand"}`,
    detail: text.length > 140 ? `${text.slice(0, 140)}…` : text,
    href: `/admin/messages/${session.brandId}`,
  });

  return NextResponse.json({ message });
}
