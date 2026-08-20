"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { useApiAction } from "@/components/dashboard/use-api-action";

export function DocumentDeleteButton({ id, title }: { id: string; title: string }) {
  const { run, isBusy } = useApiAction();
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function confirmDelete() {
    const ok = await run("delete", `/api/brand/documents/${id}`, {}, { method: "DELETE", successMessage: "Document deleted." });
    if (ok) setConfirmOpen(false);
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={(event) => {
          event.stopPropagation();
          setConfirmOpen(true);
        }}
      >
        {isBusy("delete") ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        Delete
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete this document?"
        description={`"${title}" will no longer be attached to its product. This can't be undone.`}
        confirmLabel="Delete Document"
        danger
        busy={isBusy("delete")}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
