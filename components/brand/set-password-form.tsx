"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { useApiAction } from "@/components/dashboard/use-api-action";

export function SetPasswordForm() {
  const { run, busy } = useApiAction();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!newPassword || !confirmPassword) {
      setError("Fill in both fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    await run(
      "set-password",
      "/api/brand/account/password",
      { newPassword },
      { method: "PATCH", successMessage: "Password set. Taking you to your dashboard..." },
    );
  }

  return (
    <div className="grid gap-4">
      <label className="grid gap-1.5 text-sm font-medium">
        <span>New Password</span>
        <PasswordInput
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
        />
        <span className="text-xs text-muted-foreground">At least 12 characters, with a letter and a number.</span>
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        <span>Confirm New Password</span>
        <PasswordInput
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
        />
      </label>
      {error ? <p className="text-sm font-semibold text-destructive">{error}</p> : null}
      <Button type="button" className="w-fit" disabled={busy !== null} onClick={handleSubmit}>
        {busy !== null ? <Loader2 size={15} className="animate-spin" /> : null}
        Set Password &amp; Continue
      </Button>
    </div>
  );
}
