"use client";

import { FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApiAction } from "@/components/dashboard/use-api-action";

export function PlanForm() {
  const { run, busy } = useApiAction();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const currentTarget = event.currentTarget;
    const ok = await run(
      "create",
      "/api/admin/plans",
      {
        name: form.get("name"),
        slug: form.get("slug"),
        priceMonthly: form.get("priceMonthly") ? Number(form.get("priceMonthly")) * 100 : null,
        maxProducts: form.get("maxProducts") ? Number(form.get("maxProducts")) : null,
      },
      { successMessage: "Plan created." },
    );
    if (ok) currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-4">
      <Input name="name" required placeholder="Plan name (e.g. Growth)" />
      <Input name="slug" required placeholder="Slug (e.g. growth)" />
      <Input name="priceMonthly" type="number" min="0" step="1" placeholder="Monthly price (₹)" />
      <Input name="maxProducts" type="number" min="0" step="1" placeholder="Max products" />
      <Button type="submit" className="md:col-span-4 w-fit" disabled={busy !== null}>
        {busy !== null ? <Loader2 size={15} className="animate-spin" /> : null}
        Create Plan
      </Button>
    </form>
  );
}
