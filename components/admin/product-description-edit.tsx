"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApiAction } from "@/components/dashboard/use-api-action";

type Product = {
  id: string;
  description: string | null;
};

export function ProductDescriptionEdit({ product }: { product: Product }) {
  const { run, isBusy } = useApiAction();
  const [description, setDescription] = useState(product.description ?? "");

  function save() {
    run(
      "description-save",
      `/api/admin/products/${product.id}/description`,
      { description },
      { method: "PATCH", successMessage: "Description updated." },
    );
  }

  return (
    <div className="mt-5 grid gap-2.5">
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={4}
        placeholder="No description yet."
        className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm leading-relaxed outline-none focus-visible:border-ring"
      />
      <Button size="sm" className="justify-self-start" onClick={save} disabled={isBusy("description-save")}>
        {isBusy("description-save") ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        Save Description
      </Button>
    </div>
  );
}
