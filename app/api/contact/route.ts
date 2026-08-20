import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { name?: string; company?: string; email?: string; phone?: string; message?: string }
    | null;

  if (!body?.email?.trim() || !body?.message?.trim()) {
    return NextResponse.json({ error: "Email and message are required." }, { status: 400 });
  }

  const details = [body.company ? `Company: ${body.company}` : null, body.phone ? `Phone: ${body.phone}` : null]
    .filter(Boolean)
    .join("\n");

  await prisma.supportTicket.create({
    data: {
      source: "CONTACT_MESSAGE",
      subject: `Website contact form — ${body.name?.trim() || body.email.trim()}`,
      message: details ? `${details}\n\n${body.message.trim()}` : body.message.trim(),
      name: body.name?.trim() || null,
      email: body.email.trim(),
    },
  });

  return NextResponse.json({ ok: true });
}
