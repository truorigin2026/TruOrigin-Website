import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { createNotification } from "@/lib/notifications";

export async function GET(request: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { brandId } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { brandId },
    include: { messages: { orderBy: { createdAt: "asc" }, take: 200 } },
  });

  if (conversation) {
    await prisma.message.updateMany({
      where: { conversationId: conversation.id, senderType: "BRAND", readAt: null },
      data: { readAt: new Date() },
    });
  }

  return NextResponse.json({ messages: conversation?.messages ?? [] });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ brandId: string }> }) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { brandId } = await params;

  const body = (await request.json().catch(() => null)) as { body?: string } | null;
  const text = body?.body?.trim();
  if (!text) {
    return NextResponse.json({ error: "Message can't be empty" }, { status: 400 });
  }

  const brand = await prisma.brand.findUnique({ where: { id: brandId }, select: { id: true } });
  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  const conversation = await prisma.conversation.upsert({
    where: { brandId },
    create: { brandId, lastMessageAt: new Date() },
    update: { lastMessageAt: new Date() },
  });

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderType: "ADMIN",
      senderUserId: session.sub,
      body: text,
    },
  });

  await createNotification({
    brandId,
    type: "NEW_MESSAGE",
    message: "New message from TruOrigin",
    detail: text.length > 140 ? `${text.slice(0, 140)}…` : text,
    href: "/brand/messages",
  });

  return NextResponse.json({ message });
}
