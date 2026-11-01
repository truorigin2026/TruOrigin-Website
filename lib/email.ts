/**
 * Email Sending
 * ----------------------------------------------------------------------
 * No email SDK is installed yet (RESEND_API_KEY in .env.example is an
 * unused placeholder). When it's set, this sends through the Resend REST
 * API directly (no extra dependency); otherwise it's a safe no-op so admin
 * actions like "Contact Brand" still work end-to-end, just without an
 * actual email going out.
 */

import { isDisposableTestModeActive } from "./test-env-guard";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "no-reply@truorigin.in";

export type SendEmailResult = { sent: boolean; reason?: string };

export async function sendEmail(params: {
  to: string;
  subject: string;
  body: string;
}): Promise<SendEmailResult> {
  // Second, independent layer (see lib/test-env-guard.ts): the
  // orchestrator already clears RESEND_API_KEY before spawning a
  // disposable test, but this runs inside that same process regardless
  // of whether that clearing was somehow bypassed. Checked before the
  // key presence check below, so a real key reaching this process
  // during a disposable test still can't result in a real send -- this
  // mirrors sendEmail()'s own existing no-op convention (a documented
  // test mock: return a result object, never throw) rather than
  // introducing new failure behaviour for an already-graceful function.
  // Inert whenever TRUORIGIN_TEST_MODE isn't set to "disposable-test".
  if (isDisposableTestModeActive()) {
    return { sent: false, reason: "Blocked: disposable-test mode is active (lib/test-env-guard.ts)" };
  }

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
