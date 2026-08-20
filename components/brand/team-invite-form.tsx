"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApiAction } from "@/components/dashboard/use-api-action";

const ROLE_OPTIONS = ["ADMIN", "EDITOR", "VIEWER"] as const;

export function TeamInviteForm() {
  const { run, busy } = useApiAction();
  const [email, setEmail] = useState("");
  const [brandRole, setBrandRole] = useState<(typeof ROLE_OPTIONS)[number]>("EDITOR");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!email.trim()) {
      setError("Enter an email address.");
      return;
    }
    const ok = await run(
      "invite",
      "/api/brand/team",
      { email: email.trim(), brandRole },
      { successMessage: "Invitation sent." },
    );
    if (ok) setEmail("");
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="grid gap-1.5 text-sm font-medium">
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="teammate@company.com"
          className="w-64 rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
        />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        <span>Role</span>
        <select
          value={brandRole}
          onChange={(event) => setBrandRole(event.target.value as (typeof ROLE_OPTIONS)[number])}
          className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
        >
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {role.charAt(0) + role.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </label>
      <Button type="button" disabled={busy !== null} onClick={handleSubmit}>
        {busy !== null ? <Loader2 size={15} className="animate-spin" /> : null}
        Send Invite
      </Button>
      {error ? <p className="w-full text-sm font-semibold text-destructive">{error}</p> : null}
    </div>
  );
}
