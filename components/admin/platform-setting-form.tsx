"use client";

import { FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApiAction } from "@/components/dashboard/use-api-action";

export function PlatformSettingForm({ keyPrefix, placeholder }: { keyPrefix: string; placeholder: string }) {
  const { run, busy } = useApiAction();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const key = String(form.get("key") ?? "").trim();
    const ok = await run(
      "save",
      "/api/admin/settings",
      { key: `${keyPrefix}${key}`, value: form.get("value") },
      { method: "PATCH", successMessage: "Setting saved." },
    );
    if (ok) event.currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
      <Input name="key" required placeholder={placeholder} className="min-w-[180px]" />
      <Input name="value" required placeholder="Value" className="min-w-[200px] flex-1" />
      <Button type="submit" variant="outline" disabled={busy !== null}>
        {busy !== null ? <Loader2 size={15} className="animate-spin" /> : null}
        Save Setting
      </Button>
    </form>
  );
}
