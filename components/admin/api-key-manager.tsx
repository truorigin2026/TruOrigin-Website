"use client";

import { FormEvent, useState } from "react";
import { Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useApiAction } from "@/components/dashboard/use-api-action";

type ApiKeyRow = {
  id: string;
  label: string;
  keyPrefix: string;
  revokedAt: string | null;
  createdAt: string;
};

export function ApiKeyManager({ apiKeys }: { apiKeys: ApiKeyRow[] }) {
  const { run, busy, isBusy } = useApiAction();
  const [newKey, setNewKey] = useState<string | null>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const currentTarget = event.currentTarget;
    const ok = await run(
      "create",
      "/api/admin/settings/api-keys",
      { label: form.get("label") },
      {
        successMessage: "API key created.",
        onSuccess: (data) => setNewKey((data as { key: string }).key),
      },
    );
    if (ok) {
      currentTarget.reset();
    }
  }

  function revoke(id: string) {
    run(id, `/api/admin/settings/api-keys/${id}/revoke`, {}, { successMessage: "API key revoked." });
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleCreate} className="flex flex-wrap items-center gap-3">
        <Input name="label" required placeholder="Key label (e.g. Integration partner)" className="min-w-[240px] flex-1" />
        <Button type="submit" disabled={busy !== null}>
          {isBusy("create") ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}
          Generate Key
        </Button>
      </form>

      {newKey ? (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Copy this key now — it won&apos;t be shown again.</p>
          <p className="mt-2 break-all rounded-lg bg-muted px-3 py-2 font-mono text-sm text-foreground">{newKey}</p>
        </div>
      ) : null}

      <div className="grid gap-2.5">
        {apiKeys.map((key) => (
          <div key={key.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{key.label}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{key.keyPrefix}••••••••</p>
            </div>
            {key.revokedAt ? (
              <Badge variant="destructive">Revoked</Badge>
            ) : (
              <Button variant="destructive" size="sm" onClick={() => revoke(key.id)} disabled={busy !== null}>
                {isBusy(key.id) ? <Loader2 size={14} className="animate-spin" /> : null}
                Revoke
              </Button>
            )}
          </div>
        ))}
        {apiKeys.length === 0 ? <p className="text-sm text-muted-foreground">No API keys yet.</p> : null}
      </div>
    </div>
  );
}
