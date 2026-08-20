"use client";

import { FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApiAction } from "@/components/dashboard/use-api-action";

export function SubscriptionForm({
  brands,
  plans,
}: {
  brands: { id: string; name: string }[];
  plans: { id: string; name: string }[];
}) {
  const { run, busy } = useApiAction();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const currentTarget = event.currentTarget;
    const ok = await run(
      "create",
      "/api/admin/subscriptions",
      { brandId: form.get("brandId"), planId: form.get("planId") },
      { successMessage: "Subscription created." },
    );
    if (ok) currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-3">
      <select
        name="brandId"
        required
        defaultValue=""
        className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
      >
        <option value="" disabled>
          Select brand
        </option>
        {brands.map((brand) => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        ))}
      </select>
      <select
        name="planId"
        required
        defaultValue=""
        className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
      >
        <option value="" disabled>
          Select plan
        </option>
        {plans.map((plan) => (
          <option key={plan.id} value={plan.id}>
            {plan.name}
          </option>
        ))}
      </select>
      <Button type="submit" disabled={busy !== null}>
        {busy !== null ? <Loader2 size={15} className="animate-spin" /> : null}
        Create Subscription
      </Button>
    </form>
  );
}
