"use client";

import { useState } from "react";
import { EyeOff, Eye, Archive, ArchiveRestore, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { useApiAction } from "@/components/dashboard/use-api-action";

type ProductActionsProps = {
  product: {
    id: string;
    hidden: boolean;
    archived: boolean;
  };
};

export function ProductActions({ product }: ProductActionsProps) {
  const { run, busy, isBusy } = useApiAction();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function toggleHide() {
    run(
      "hide",
      `/api/admin/products/${product.id}/visibility`,
      { action: product.hidden ? "UNHIDE" : "HIDE" },
      { successMessage: product.hidden ? "Product unhidden." : "Product hidden." },
    );
  }

  function toggleArchive() {
    run(
      "archive",
      `/api/admin/products/${product.id}/visibility`,
      { action: product.archived ? "UNARCHIVE" : "ARCHIVE" },
      { successMessage: product.archived ? "Product unarchived." : "Product archived." },
    );
  }

  async function confirmDeleteProduct() {
    const ok = await run("delete", `/api/admin/products/${product.id}/delete`, {}, { successMessage: "Product deleted." });
    if (ok) setConfirmDelete(false);
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      <Button variant="outline" onClick={toggleHide} disabled={busy !== null}>
        {isBusy("hide") ? <Loader2 size={15} className="animate-spin" /> : product.hidden ? <Eye size={15} /> : <EyeOff size={15} />}
        {product.hidden ? "Unhide Product" : "Hide Product"}
      </Button>
      <Button variant="outline" onClick={toggleArchive} disabled={busy !== null}>
        {isBusy("archive") ? <Loader2 size={15} className="animate-spin" /> : product.archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
        {product.archived ? "Unarchive Product" : "Archive Product"}
      </Button>
      <Button variant="destructive" onClick={() => setConfirmDelete(true)} disabled={busy !== null}>
        <Trash2 size={15} />
        Delete Product
      </Button>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this product?"
        description="It will no longer appear on the public site. This action cannot be undone from here."
        confirmLabel="Delete Product"
        danger
        busy={isBusy("delete")}
        onConfirm={confirmDeleteProduct}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
