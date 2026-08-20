"use client";

import { FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApiAction } from "@/components/dashboard/use-api-action";

export function EmailTemplateForm({
  initial,
}: {
  initial?: { key: string; subject: string; body: string };
}) {
  const { run, busy } = useApiAction();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ok = await run(
      "save",
      "/api/admin/settings/email-templates",
      { key: form.get("key"), subject: form.get("subject"), body: form.get("body") },
      { successMessage: initial ? "Template updated." : "Template created." },
    );
    if (ok && !initial) event.currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="key" required readOnly={Boolean(initial)} defaultValue={initial?.key} placeholder="Template key (e.g. brand.approved)" className="read-only:opacity-70" />
        <Input name="subject" required defaultValue={initial?.subject} placeholder="Subject line ({{brandName}} supported)" />
      </div>
      <textarea
        name="body"
        required
        rows={5}
        defaultValue={initial?.body}
        placeholder="Email body — use {{variable}} tokens"
        className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
      />
      <Button type="submit" variant="outline" className="w-fit" disabled={busy !== null}>
        {busy !== null ? <Loader2 size={15} className="animate-spin" /> : null}
        {initial ? "Save Template" : "Create Template"}
      </Button>
    </form>
  );
}
