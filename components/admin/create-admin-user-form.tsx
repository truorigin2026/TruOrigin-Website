"use client";

import { FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { useApiAction } from "@/components/dashboard/use-api-action";

export function CreateAdminUserForm() {
  const { run, busy } = useApiAction();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const currentTarget = event.currentTarget;
    const ok = await run(
      "create",
      "/api/admin/users",
      { email: form.get("email"), password: form.get("password") },
      { successMessage: "Admin user created." },
    );
    if (ok) currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
      <input
        name="email"
        type="email"
        required
        placeholder="new-admin@truorigin.com"
        className="min-w-[220px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
      />
      <PasswordInput
        name="password"
        required
        minLength={8}
        placeholder="Temporary password"
        className="min-w-[200px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none"
      />
      <Button type="submit" variant="outline" disabled={busy !== null}>
        {busy !== null ? <Loader2 size={15} className="animate-spin" /> : null}
        Create Admin User
      </Button>
    </form>
  );
}
