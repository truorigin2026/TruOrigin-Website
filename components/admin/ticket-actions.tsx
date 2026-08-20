"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApiAction } from "@/components/dashboard/use-api-action";

type TicketActionsProps = {
  ticket: {
    id: string;
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  };
};

const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export function TicketActions({ ticket }: TicketActionsProps) {
  const { run, busy } = useApiAction();
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);
  const [note, setNote] = useState("");

  function submit() {
    run("save", `/api/admin/support/${ticket.id}`, { status, priority, resolutionNote: note || undefined }, { method: "PATCH", successMessage: "Ticket updated." });
  }

  return (
    <div className="grid gap-4">
      <label className="grid gap-1.5 text-sm font-medium">
        <span>Status</span>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as typeof status)}
          className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        <span>Priority</span>
        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value as typeof priority)}
          className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
        >
          {PRIORITY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
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
      <Button type="button" className="w-fit" disabled={busy !== null} onClick={submit}>
        {busy !== null ? <Loader2 size={15} className="animate-spin" /> : null}
        Save Changes
      </Button>
    </div>
  );
}
