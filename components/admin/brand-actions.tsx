"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Ban, RotateCcw, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { useApiAction } from "@/components/dashboard/use-api-action";

type BrandActionsProps = {
  brand: {
    id: string;
    status: "PENDING" | "ACTIVE" | "SUSPENDED";
  };
};

export function BrandActions({ brand }: BrandActionsProps) {
  const { run, busy, isBusy } = useApiAction();
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  function approve() {
    run("approve", `/api/admin/brands/${brand.id}/status`, { action: "APPROVE" }, { successMessage: "Brand approved." });
  }

  function suspend() {
    run(
      "suspend",
      `/api/admin/brands/${brand.id}/status`,
      { action: "SUSPEND", reason },
      { successMessage: "Brand suspended.", onSuccess: () => setReason("") },
    );
  }

  function reactivate() {
    run("reactivate", `/api/admin/brands/${brand.id}/status`, { action: "REACTIVATE" }, { successMessage: "Brand reactivated." });
  }

  async function confirmDeleteBrand() {
    const ok = await run("delete", `/api/admin/brands/${brand.id}/delete`, {}, { successMessage: "Brand deleted." });
    if (ok) setConfirmDelete(false);
  }

  function sendMessage() {
    run(
      "contact",
      `/api/admin/brands/${brand.id}/contact`,
      { message },
      { successMessage: "Message sent.", skipRefresh: true, onSuccess: () => setMessage("") },
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <p className="text-sm font-semibold text-foreground">Workspace status</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Approving makes the brand and its approved products publicly visible. Suspending hides them immediately.
        </p>
        <label className="grid gap-1.5 text-sm font-medium">
          <span>Suspension reason (required to suspend)</span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={2}
            className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
          />
        </label>
        <div className="flex flex-wrap gap-2.5">
          {brand.status !== "ACTIVE" ? (
            <Button variant="outline" onClick={approve} disabled={busy !== null}>
              {isBusy("approve") ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
              Approve Brand
            </Button>
          ) : null}
          {brand.status !== "SUSPENDED" ? (
            <Button variant="outline" onClick={suspend} disabled={busy !== null || !reason.trim()}>
              {isBusy("suspend") ? <Loader2 size={15} className="animate-spin" /> : <Ban size={15} />}
              Suspend Brand
            </Button>
          ) : null}
          {brand.status === "SUSPENDED" ? (
            <Button variant="outline" onClick={reactivate} disabled={busy !== null}>
              {isBusy("reactivate") ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />}
              Reactivate Brand
            </Button>
          ) : null}
          <Button variant="destructive" onClick={() => setConfirmDelete(true)} disabled={busy !== null}>
            <Trash2 size={15} />
            Delete Brand
          </Button>
        </div>
      </div>

      <div className="grid gap-3 border-t border-border pt-6">
        <p className="text-sm font-semibold text-foreground">Contact brand</p>
        <label className="grid gap-1.5 text-sm font-medium">
          <span>Message</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={3}
            className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
          />
        </label>
        <Button variant="outline" className="w-fit" onClick={sendMessage} disabled={busy !== null || !message.trim()}>
          {isBusy("contact") ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          Send Message
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this brand?"
        description="This hides the brand and all its products from the public site."
        confirmLabel="Delete Brand"
        danger
        busy={isBusy("delete")}
        onConfirm={confirmDeleteBrand}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
