"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { HeroReveal } from "@/components/motion";
import { PasswordInput } from "@/components/ui/password-input";
import { FlowingWaves } from "@/components/ui/flowing-waves";

export function BrandLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
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

      router.replace(data.redirectTo ?? "/account");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell overflow-hidden">
      <section className="container-shell page-section">
        <HeroReveal>
          <div className="login-card">
            <div className="login-panel-art">
              <FlowingWaves className="login-panel-waves" />
              <Link href="/" className="login-back-link">
                ← Back
              </Link>
              <p className="login-welcome-text">Welcome Back!</p>
            </div>

            <form onSubmit={onSubmit} className="login-panel-form">
              <h1 className="login-title">Log in</h1>

              <label className="login-field">
                <span className="login-field-icon">
                  <Mail size={16} />
                </span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="Email"
                  required
                  className="login-input"
                />
              </label>

              <div className="login-field">
                <span className="login-field-icon">
                  <Lock size={16} />
                </span>
                <PasswordInput
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="Password"
                  required
                  className="login-input"
                />
              </div>

              <div className="login-row">
                <label className="login-remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-[color:var(--line)] accent-[color:var(--brand)]"
                  />
                  Remember Me
                </label>
                <Link href="/forgot-password" className="login-forgot">
                  Forgot Password?
                </Link>
              </div>

              {error ? (
                <p className="login-error">{error}</p>
              ) : null}

              <button type="submit" disabled={loading} className="btn-primary login-submit-btn">
                {loading ? "Signing in..." : "Log in"}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="login-divider">
                <span>Or</span>
              </div>

              <Link href="/for-brands/contact" className="login-signup-btn">
                Sign up
              </Link>
            </form>
          </div>
        </HeroReveal>
      </section>
    </div>
  );
}
