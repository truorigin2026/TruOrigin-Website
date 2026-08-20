"use client";

import { useState } from "react";
import { Loader2, Upload, Download, Copy, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { useApiAction } from "@/components/dashboard/use-api-action";

type OriginCardActionsProps = {
  card: {
    id: string;
    status: "DRAFT" | "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED";
  };
};

export function OriginCardActions({ card }: OriginCardActionsProps) {
  const { run, busy, isBusy } = useApiAction();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function publish() {
    run("publish", `/api/admin/origincards/${card.id}/publish`, {}, { successMessage: "OriginCard published." });
  }
  function unpublish() {
    run("unpublish", `/api/admin/origincards/${card.id}/unpublish`, {}, { successMessage: "OriginCard unpublished." });
  }
  function duplicate() {
    run("duplicate", `/api/admin/origincards/${card.id}/duplicate`, {}, { successMessage: "OriginCard duplicated." });
  }
  function archive() {
    run("archive", `/api/admin/origincards/${card.id}/archive`, {}, { successMessage: "OriginCard archived." });
  }
  async function confirmDeleteCard() {
    const ok = await run("delete", `/api/admin/origincards/${card.id}`, {}, { method: "DELETE", successMessage: "OriginCard deleted." });
    if (ok) setConfirmDelete(false);
  }

  return (
    <div className="flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
      {card.status !== "PUBLISHED" && card.status !== "ARCHIVED" ? (
        <Button size="sm" onClick={publish} disabled={busy !== null}>
          {isBusy("publish") ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          Publish
        </Button>
      ) : null}
      {card.status === "PUBLISHED" ? (
        <Button variant="outline" size="sm" onClick={unpublish} disabled={busy !== null}>
          {isBusy("unpublish") ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          Unpublish
        </Button>
      ) : null}
      <Button variant="outline" size="sm" onClick={duplicate} disabled={busy !== null}>
        {isBusy("duplicate") ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
        Duplicate
      </Button>
      {card.status !== "ARCHIVED" ? (
        <Button variant="outline" size="sm" onClick={archive} disabled={busy !== null}>
          {isBusy("archive") ? <Loader2 size={14} className="animate-spin" /> : <Archive size={14} />}
          Archive
        </Button>
      ) : null}
      <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)} disabled={busy !== null}>
        <Trash2 size={14} />
        Delete
      </Button>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this OriginCard?"
        description="This permanently removes the card and its serial/QR link cannot be recovered."
        confirmLabel="Delete OriginCard"
        danger
        busy={isBusy("delete")}
        onConfirm={confirmDeleteCard}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
