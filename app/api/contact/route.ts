import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(`contact:${getClientIp(request)}`, 5, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

  const body = (await request.json().catch(() => null)) as
    | { name?: string; company?: string; email?: string; phone?: string; message?: string }
    | null;

  if (!body?.email?.trim() || !body?.message?.trim()) {
    return NextResponse.json({ error: "Email and message are required." }, { status: 400 });
  }

  const details = [body.company ? `Company: ${body.company}` : null, body.phone ? `Phone: ${body.phone}` : null]
    .filter(Boolean)
    .join("\n");

  const ticketData = {
    source: "CONTACT_MESSAGE" as const,
    subject: `Website contact form — ${body.name?.trim() || body.email.trim()}`,
    message: details ? `${details}\n\n${body.message.trim()}` : body.message.trim(),
    name: body.name?.trim() || null,
    email: body.email.trim(),
  };

  try {
    await prisma.supportTicket.create({ data: ticketData });
  } catch (err) {
    console.error("[/api/contact] first attempt failed, retrying once:", err);
    // A brief pooler/connection hiccup is the most likely transient cause here —
    // one short-delayed retry before giving up and surfacing an error to the user.
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      await prisma.supportTicket.create({ data: ticketData });
    } catch (retryErr) {
      console.error("[/api/contact] retry also failed:", retryErr);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
