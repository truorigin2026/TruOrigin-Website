"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Deliberately renders a plain <input>, not the shadcn Input primitive:
 * this gets reused on public-styled pages (login, reset-password) that
 * don't share the [data-dashboard]-scoped tokens the ported Input relies
 * on, so the caller supplies its own full className either way.
 */
export function PasswordInput({ className = "", ...props }: React.ComponentProps<"input">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input type={visible ? "text" : "password"} className={`${className} pr-11`.trim()} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
