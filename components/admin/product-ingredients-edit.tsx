"use client";

import { useState } from "react";
import { Loader2, Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApiAction } from "@/components/dashboard/use-api-action";

type IngredientItem = { key: string; name: string; note: string };

type Product = {
  id: string;
  ingredients: { id: string; name: string; note: string | null }[];
};

function newKey() {
  return Math.random().toString(36).slice(2);
}

export function ProductIngredientsEdit({ product }: { product: Product }) {
  const { run, isBusy } = useApiAction();
  const [ingredients, setIngredients] = useState<IngredientItem[]>(
    product.ingredients.map((i) => ({ key: i.id, name: i.name, note: i.note ?? "" })),
  );

  function updateRow(key: string, field: "name" | "note", value: string) {
    setIngredients((prev) => prev.map((row) => (row.key === key ? { ...row, [field]: value } : row)));
  }

  function removeRow(key: string) {
    setIngredients((prev) => prev.filter((row) => row.key !== key));
  }

  function addRow() {
    setIngredients((prev) => [...prev, { key: newKey(), name: "", note: "" }]);
  }

  function save() {
    run(
      "ingredients-save",
      `/api/admin/products/${product.id}/ingredients`,
      { ingredients: ingredients.filter((i) => i.name.trim()).map((i) => ({ name: i.name, note: i.note })) },
      { method: "PATCH", successMessage: "Ingredients updated." },
    );
  }

  return (
    <div className="grid gap-3">
      {ingredients.map((row) => (
        <div key={row.key} className="grid gap-2 rounded-lg border border-border bg-muted/30 p-3 md:grid-cols-[1fr_1.4fr_auto]">
          <input
            value={row.name}
            onChange={(event) => updateRow(row.key, "name", event.target.value)}
            placeholder="Ingredient name"
            className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
          />
          <input
            value={row.note}
            onChange={(event) => updateRow(row.key, "note", event.target.value)}
            placeholder="Note (optional)"
            className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
          />
          <Button type="button" variant="outline" size="sm" onClick={() => removeRow(row.key)}>
            <X size={14} />
          </Button>
        </div>
      ))}
      {ingredients.length === 0 ? <p className="text-sm text-muted-foreground">No ingredients listed yet.</p> : null}

      <div className="flex flex-wrap gap-2.5">
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus size={14} />
          Add Ingredient
        </Button>
        <Button size="sm" onClick={save} disabled={isBusy("ingredients-save")}>
          {isBusy("ingredients-save") ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Ingredients
        </Button>
      </div>
    </div>
  );
}
