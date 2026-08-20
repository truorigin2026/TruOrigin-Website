"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { useApiAction } from "@/components/dashboard/use-api-action";

export function PasswordChangeForm() {
  const { run, busy } = useApiAction();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!currentPassword || !newPassword) {
      setError("Fill in both fields.");
      return;
    }
    const ok = await run(
      "change-password",
      "/api/brand/account/password",
      { currentPassword, newPassword },
      { method: "PATCH", successMessage: "Password updated.", skipRefresh: true },
    );
    if (ok) {
      setCurrentPassword("");
      setNewPassword("");
    }
  }

  return (
    <div className="grid gap-4 md:max-w-sm">
      <label className="grid gap-1.5 text-sm font-medium">
        <span>Current Password</span>
        <PasswordInput
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
        />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        <span>New Password</span>
        <PasswordInput
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
        />
        <span className="text-xs text-muted-foreground">At least 12 characters, with a letter and a number.</span>
      </label>
      {error ? <p className="text-sm font-semibold text-destructive">{error}</p> : null}
      <Button type="button" className="w-fit" disabled={busy !== null} onClick={handleSubmit}>
        {busy !== null ? <Loader2 size={15} className="animate-spin" /> : null}
        Update Password
      </Button>
    </div>
  );
}
