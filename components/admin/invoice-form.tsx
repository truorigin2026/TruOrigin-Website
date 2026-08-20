"use client";

import { FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApiAction } from "@/components/dashboard/use-api-action";

export function InvoiceForm({ subscriptionId }: { subscriptionId: string }) {
  const { run, busy } = useApiAction();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const currentTarget = event.currentTarget;
    const ok = await run(
      "create",
      "/api/admin/invoices",
      { subscriptionId, amount: Number(form.get("amount")) * 100, notes: form.get("notes") || undefined },
      { successMessage: "Invoice created." },
    );
    if (ok) currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
      <Input name="amount" type="number" min="0" step="0.01" required placeholder="Amount (₹)" className="w-40" />
      <Input name="notes" placeholder="Notes (optional)" className="min-w-[200px] flex-1" />
      <Button type="submit" variant="outline" disabled={busy !== null}>
        {busy !== null ? <Loader2 size={15} className="animate-spin" /> : null}
        Create Invoice
      </Button>
    </form>
  );
}
