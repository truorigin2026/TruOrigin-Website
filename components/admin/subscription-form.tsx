"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApiAction } from "@/components/dashboard/use-api-action";

export function SubscriptionForm({
  brands,
  plans,
}: {
  brands: { id: string; name: string }[];
  plans: { id: string; name: string }[];
}) {
  const { run, busy } = useApiAction();
  const [brandId, setBrandId] = useState("");
  const [planId, setPlanId] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ok = await run("create", "/api/admin/subscriptions", { brandId, planId }, { successMessage: "Subscription created." });
    if (ok) {
      setBrandId("");
      setPlanId("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-3">
      <Select value={brandId} onValueChange={(value) => setBrandId(value ?? "")}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select brand" />
        </SelectTrigger>
        <SelectContent>
          {brands.map((brand) => (
            <SelectItem key={brand.id} value={brand.id}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={planId} onValueChange={(value) => setPlanId(value ?? "")}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select plan" />
        </SelectTrigger>
        <SelectContent>
          {plans.map((plan) => (
            <SelectItem key={plan.id} value={plan.id}>
              {plan.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" disabled={busy !== null || !brandId || !planId}>
        {busy !== null ? <Loader2 size={15} className="animate-spin" /> : null}
        Create Subscription
      </Button>
    </form>
  );
}
