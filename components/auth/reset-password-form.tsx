"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { HeroReveal } from "@/components/motion";
import { PasswordInput } from "@/components/ui/password-input";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to reset your password.");
      }

      router.replace("/login");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to reset your password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell overflow-hidden">
      <section className="container-shell page-section">
        <div className="mx-auto max-w-md">
          <HeroReveal>
            <form onSubmit={onSubmit} className="glass-panel rounded-[34px] p-8 md:p-10">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--brand-dark)] text-white">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <p className="eyebrow">Reset Password</p>
                  <h1 className="mt-1 text-3xl font-semibold text-[color:var(--foreground)]">
                    Set a new password
                  </h1>
                </div>
              </div>

              {!token ? (
                <p className="mt-6 rounded-2xl border border-[#f0b8b8] bg-[#fff3f3] px-4 py-4 text-sm leading-7 text-[#9a2323]">
                  This reset link is missing its token. Request a new one from the{" "}
                  <Link href="/forgot-password" className="font-semibold">
                    forgot password
                  </Link>{" "}
                  page.
                </p>
              ) : (
                <>
                  <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
                    Choose a new password for your brand account.
                  </p>

                  <label className="mt-8 block space-y-2 text-sm font-medium">
                    <span>New Password</span>
                    <PasswordInput
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                      className="w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[color:var(--brand)]"
                    />
                  </label>

                  <label className="mt-5 block space-y-2 text-sm font-medium">
                    <span>Confirm Password</span>
                    <PasswordInput
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
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
                    {loading ? "Saving..." : "Reset password"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              )}

              <p className="mt-5 text-sm text-[color:var(--muted)]">
                <Link href="/login" className="font-semibold text-[color:var(--brand)]">
                  Back to log in
                </Link>
              </p>
            </form>
          </HeroReveal>
        </div>
      </section>
    </div>
  );
}
