/**
 * Email Sending
 * ----------------------------------------------------------------------
 * No email SDK is installed yet (RESEND_API_KEY in .env.example is an
 * unused placeholder). When it's set, this sends through the Resend REST
 * API directly (no extra dependency); otherwise it's a safe no-op so admin
 * actions like "Contact Brand" still work end-to-end, just without an
 * actual email going out.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "no-reply@truorigin.com";

export type SendEmailResult = { sent: boolean; reason?: string };

export async function sendEmail(params: {
  to: string;
  subject: string;
  body: string;
}): Promise<SendEmailResult> {
  if (!RESEND_API_KEY) {
    return { sent: false, reason: "RESEND_API_KEY is not configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [params.to],
      subject: params.subject,
      text: params.body,
    }),
  });

  if (!response.ok) {
    return { sent: false, reason: `Resend API error: ${response.status}` };
  }

  return { sent: true };
}

export function renderTemplate(template: { subject: string; body: string }, variables: Record<string, string>) {
  const fill = (text: string) =>
    text.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => variables[key] ?? "");

  return { subject: fill(template.subject), body: fill(template.body) };
}
