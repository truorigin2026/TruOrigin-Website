"use client";

import { FormEvent, useState } from "react";
import { FadeIn } from "@/components/motion";

type ContactFormProps = {
  formSource: "brand" | "product";
  title?: string;
  description?: string;
  submitLabel?: string;
  className?: string;
};

export function ContactForm({
  formSource,
  title = "Get in touch",
  description = "Tell us about your brand and we'll schedule a personalized demo.",
  submitLabel = "Submit",
  className,
}: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Capture the form element before the first `await` — React nulls out
    // `event.currentTarget` once the synchronous part of the handler
    // returns, so reading it after an await throws (and was silently
    // swallowed by the catch below, showing "error" even on success).
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          company: form.get("company"),
          email: form.get("email"),
          phone: form.get("phone"),
          subject: form.get("subject"),
          message: form.get("message"),
          website: form.get("website"),
          formSource,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      formEl.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <FadeIn className={className}>
      <form className="contact-form-card" onSubmit={handleSubmit}>
        <h2 className="contact-form-title">{title}</h2>
        {description ? <p className="contact-form-description">{description}</p> : null}

        <div className="contact-form-grid">
          <label className="contact-form-field">
            <span>Name</span>
            <input type="text" name="name" placeholder="Your full name" />
          </label>
          <label className="contact-form-field">
            <span>Company Name</span>
            <input type="text" name="company" placeholder="Your company" />
          </label>
          <label className="contact-form-field">
            <span>Email</span>
            <input type="email" name="email" required placeholder="you@company.com" />
          </label>
          <label className="contact-form-field">
            <span>Phone</span>
            <input type="tel" name="phone" placeholder="+1 (555) 000-0000" />
          </label>
          <label className="contact-form-field contact-form-field-full">
            <span>Subject</span>
            <input type="text" name="subject" placeholder="What's this about?" />
          </label>
        </div>

        <label className="contact-form-field contact-form-field-full">
          <span>Message</span>
          <textarea name="message" required rows={5} placeholder="Tell us about your products and goals..." />
        </label>

        {/* Honeypot: hidden from real visitors, off-screen (not display:none) so simple bots that skip hidden fields still fill it in */}
        <label className="contact-form-honeypot" aria-hidden="true">
          <span>Website</span>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>

        <button type="submit" disabled={status === "sending"} className="saas-btn-primary contact-form-submit disabled:opacity-70">
          {status === "sending" ? "Sending..." : submitLabel}
        </button>
        {status === "sent" ? (
          <p className="contact-form-status contact-form-status-success">Thank you! Your message has been received. Our team will get back to you shortly.</p>
        ) : null}
        {status === "error" ? (
          <p className="contact-form-status contact-form-status-error">Something went wrong. Please try again.</p>
        ) : null}
      </form>
    </FadeIn>
  );
}
