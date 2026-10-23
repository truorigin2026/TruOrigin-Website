"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { useApiAction } from "@/components/dashboard/use-api-action";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TicketActionsProps = {
  ticket: {
    id: string;
    status: "NEW" | "READ" | "IN_PROGRESS" | "REPLIED" | "CLOSED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  };
};

const STATUS_OPTIONS = ["NEW", "READ", "IN_PROGRESS", "REPLIED", "CLOSED"] as const;
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export function TicketActions({ ticket }: TicketActionsProps) {
  const router = useRouter();
  const { run, busy, isBusy } = useApiAction();
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);
  const [note, setNote] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  function submit() {
    run("save", `/api/admin/support/${ticket.id}`, { status, priority, resolutionNote: note || undefined }, { method: "PATCH", successMessage: "Ticket updated." });
  }

  async function confirmDeleteTicket() {
    const ok = await run(
      "delete",
      `/api/admin/support/${ticket.id}`,
      {},
      { method: "DELETE", successMessage: "Message deleted.", skipRefresh: true, onSuccess: () => router.push("/admin/support") },
    );
    if (ok) setConfirmDelete(false);
  }

  return (
    <div className="grid gap-4">
      <label className="grid gap-1.5 text-sm font-medium">
        <span>Status</span>
        <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option.replaceAll("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        <span>Priority</span>
        <Select value={priority} onValueChange={(value) => setPriority(value as typeof priority)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        <span>Resolution note</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <Button type="button" className="w-fit" disabled={busy !== null} onClick={submit}>
          {busy !== null ? <Loader2 size={15} className="animate-spin" /> : null}
          Save Changes
        </Button>
        <Button type="button" variant="destructive" className="w-fit" disabled={busy !== null} onClick={() => setConfirmDelete(true)}>
          <Trash2 size={15} />
          Delete
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this message?"
        description="It will be permanently removed from the support queue. This action cannot be undone."
        confirmLabel="Delete"
        danger
        busy={isBusy("delete")}
        onConfirm={confirmDeleteTicket}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
