"use client";

import { useState } from "react";
import { Loader2, Pencil, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { useApiAction } from "@/components/dashboard/use-api-action";

type PlanToggleProps = {
  plan: {
    id: string;
    name: string;
    isActive: boolean;
    priceMonthly: number | null;
    maxProducts: number | null;
    subscriberCount: number;
  };
};

export function PlanToggle({ plan }: PlanToggleProps) {
  const { run, busy, isBusy } = useApiAction();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(plan.name);
  const [priceMonthly, setPriceMonthly] = useState(plan.priceMonthly != null ? String(plan.priceMonthly / 100) : "");
  const [maxProducts, setMaxProducts] = useState(plan.maxProducts != null ? String(plan.maxProducts) : "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  function toggle() {
    run("toggle", `/api/admin/plans/${plan.id}`, { isActive: !plan.isActive }, { method: "PATCH", successMessage: plan.isActive ? "Plan deactivated." : "Plan activated." });
  }

  async function save() {
    const ok = await run(
      "save",
      `/api/admin/plans/${plan.id}`,
      {
        name,
        priceMonthly: priceMonthly ? Number(priceMonthly) * 100 : null,
        maxProducts: maxProducts ? Number(maxProducts) : null,
      },
      { method: "PATCH", successMessage: "Plan updated." },
    );
    if (ok) setEditing(false);
  }

  async function confirmDeletePlan() {
    const ok = await run("delete", `/api/admin/plans/${plan.id}`, {}, { method: "DELETE", successMessage: "Plan deleted." });
    if (ok) setConfirmDelete(false);
  }

  if (editing) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Input value={name} onChange={(event) => setName(event.target.value)} className="w-40" />
        <Input value={priceMonthly} onChange={(event) => setPriceMonthly(event.target.value)} type="number" min="0" placeholder="Price/mo (₹)" className="w-28" />
        <Input value={maxProducts} onChange={(event) => setMaxProducts(event.target.value)} type="number" min="0" placeholder="Max products" className="w-32" />
        <Button size="sm" onClick={save} disabled={busy !== null}>
          {isBusy("save") ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save
        </Button>
        <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={busy !== null}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => setEditing(true)} disabled={busy !== null}>
        <Pencil size={14} />
        Edit
      </Button>
      <Button variant="outline" size="sm" onClick={toggle} disabled={busy !== null}>
        {isBusy("toggle") ? <Loader2 size={14} className="animate-spin" /> : null}
        {plan.isActive ? "Deactivate" : "Activate"}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setConfirmDelete(true)}
        disabled={busy !== null || plan.subscriberCount > 0}
        title={plan.subscriberCount > 0 ? "This plan has active subscribers" : undefined}
      >
        <Trash2 size={14} />
      </Button>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this plan?"
        description={`"${plan.name}" will be permanently removed.`}
        confirmLabel="Delete Plan"
        danger
        busy={isBusy("delete")}
        onConfirm={confirmDeletePlan}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
