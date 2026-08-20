"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { HeroReveal } from "@/components/motion";
import { PasswordInput } from "@/components/ui/password-input";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as { error?: string; redirectTo?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to sign in.");
      }

      router.replace(data.redirectTo ?? "/admin");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell overflow-hidden">
      <section className="container-shell page-section">
        <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.96fr_1.04fr]">
          <HeroReveal>
            <div className="glass-panel relative overflow-hidden rounded-[34px] p-8 md:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(39,120,74,0.18),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.6),transparent_32%)]" />
              <div className="relative">
                <p className="eyebrow">Secure Access</p>
                <h1 className="display-font mt-6 text-4xl md:text-6xl">Owner console</h1>
                <p className="mt-4 max-w-xl text-base leading-8 text-[color:var(--muted)]">
                  Owner access for review, approvals, QR issuance, and brand oversight.
                </p>

                <div className="mt-10 space-y-4">
                  {[
                    ["Protected sessions", "JWT cookie + route guard"],
                    ["Owner only", "Reserved for the configured owner account"],
                    ["Ready for mobile", "Works on phones and desktops"],
                  ].map(([label, detail]) => (
                    <div
                      key={label}
                      className="flex items-start gap-3 rounded-[22px] border border-[color:var(--line)] bg-white/75 px-4 py-4"
                    >
                      <ShieldCheck className="mt-0.5 h-5 w-5 text-[color:var(--brand)]" />
                      <div>
                        <p className="text-sm font-semibold text-[color:var(--foreground)]">{label}</p>
                        <p className="mt-1 text-sm text-[color:var(--muted)]">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </HeroReveal>

          <HeroReveal delay={0.08}>
            <form onSubmit={onSubmit} className="glass-panel rounded-[34px] p-8 md:p-10">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--brand-dark)] text-white">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <p className="eyebrow">Sign In</p>
                  <h2 className="mt-1 text-3xl font-semibold text-[color:var(--foreground)]">
                    Owner sign in
                  </h2>
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
                Use the email and password tied to your TruOrigin owner account.
              </p>

              <label className="mt-8 block space-y-2 text-sm font-medium">
                <span>Email Address</span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[color:var(--brand)]"
                />
              </label>

              <label className="mt-5 block space-y-2 text-sm font-medium">
                <span>Password</span>
                <PasswordInput
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[color:var(--brand)]"
                />
              </label>

              {error ? (
                <p className="mt-4 rounded-2xl border border-[#f0b8b8] bg-[#fff3f3] px-4 py-3 text-sm text-[#9a2323]">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary mt-7 inline-flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? "Signing in..." : "Log In"}
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="mt-5 text-sm text-[color:var(--muted)]">
                Owner access is reserved for the configured admin email.
              </p>

              <p className="mt-3 text-sm text-[color:var(--muted)]">
                Looking for brand login?{" "}
                <Link href="/login" className="font-semibold text-[color:var(--brand)]">
                  Go here
                </Link>
              </p>
            </form>
          </HeroReveal>
        </div>
      </section>
    </div>
  );
}
