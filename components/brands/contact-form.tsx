"use client";

import { FormEvent, useState } from "react";
import { FadeIn } from "@/components/motion";

type ContactFormProps = {
  title?: string;
  description?: string;
  submitLabel?: string;
  className?: string;
};

export function ContactForm({
  title = "Get in touch",
  description = "Tell us about your brand and we'll schedule a personalized demo.",
  submitLabel = "Submit",
  className,
}: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
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
          message: form.get("message"),
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      event.currentTarget.reset();
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
        </div>

        <label className="contact-form-field contact-form-field-full">
          <span>Message</span>
          <textarea name="message" required rows={5} placeholder="Tell us about your products and goals..." />
        </label>

        <button type="submit" disabled={status === "sending"} className="saas-btn-primary contact-form-submit disabled:opacity-70">
          {status === "sending" ? "Sending..." : submitLabel}
        </button>
        {status === "sent" ? (
          <p className="contact-form-status contact-form-status-success">Thanks — we&apos;ll be in touch soon.</p>
        ) : null}
        {status === "error" ? (
          <p className="contact-form-status contact-form-status-error">Something went wrong. Please try again.</p>
        ) : null}
      </form>
    </FadeIn>
  );
}
