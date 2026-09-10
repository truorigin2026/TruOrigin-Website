import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { ORGANIZATION_EMAIL } from "@/lib/seo";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clamp(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(`contact:${getClientIp(request)}`, 5, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

  const body = (await request.json().catch(() => null)) as
    | {
        name?: string;
        company?: string;
        email?: string;
        phone?: string;
        subject?: string;
        message?: string;
        website?: string; // honeypot — real visitors never fill this in
      }
    | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: a filled-in hidden field means a bot. Report success without
  // writing anything, so the bot gets no signal that it was caught.
  if (body.website?.trim()) {
    return NextResponse.json({ ok: true });
  }

  const email = body.email?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!email || !message) {
    return NextResponse.json({ error: "Email and message are required." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
  }

  const name = body.name ? clamp(body.name, 200) : null;
  const company = body.company ? clamp(body.company, 200) : null;
  const phone = body.phone ? clamp(body.phone, 30) : null;
  const subject = body.subject ? clamp(body.subject, 200) : `Website contact form — ${name || email}`;

  const ticketData = {
    source: "CONTACT_MESSAGE" as const,
    subject,
    message: company ? `Company: ${company}\n\n${message}` : message,
    name,
    email,
    phone,
  };

  let ticket;
  try {
    ticket = await prisma.supportTicket.create({ data: ticketData });
  } catch (err) {
    console.error("[/api/contact] first attempt failed, retrying once:", err);
    // A brief pooler/connection hiccup is the most likely transient cause here —
    // one short-delayed retry before giving up and surfacing an error to the user.
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      ticket = await prisma.supportTicket.create({ data: ticketData });
    } catch (retryErr) {
      console.error("[/api/contact] retry also failed:", retryErr);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  }

  // Notification is a nice-to-have, not the source of truth — the ticket is
  // already safely stored, so a Resend outage must never fail this response.
  try {
    await sendEmail({
      to: process.env.CONTACT_NOTIFICATION_EMAIL || ORGANIZATION_EMAIL,
      subject: `New contact message: ${subject}`,
      body: `${ticket.message}\n\n— From: ${name || "Unknown"} (${email})${phone ? ` • ${phone}` : ""}\nView in admin: /admin/support/${ticket.id}`,
    });
  } catch (err) {
    console.error("[/api/contact] notification email failed:", err);
  }

  return NextResponse.json({ ok: true, message: "Your message has been submitted successfully." });
}
