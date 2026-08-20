"use client";

import { useState } from "react";
import { Loader2, UserMinus, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { useApiAction } from "@/components/dashboard/use-api-action";

type TeamMemberActionsProps = {
  memberId: string;
  active: boolean;
  isLastOwner: boolean;
};

export function TeamMemberActions({ memberId, active, isLastOwner }: TeamMemberActionsProps) {
  const { run, busy, isBusy } = useApiAction();
  const [confirmRemove, setConfirmRemove] = useState(false);

  function toggleStatus() {
    run(
      "status",
      `/api/brand/team/${memberId}`,
      { action: active ? "SUSPEND" : "REACTIVATE" },
      { method: "PATCH", successMessage: active ? "Member suspended." : "Member reactivated." },
    );
  }

  async function confirmRemoveMember() {
    const ok = await run("remove", `/api/brand/team/${memberId}`, {}, { method: "DELETE", successMessage: "Member removed." });
    if (ok) setConfirmRemove(false);
  }

  if (isLastOwner) {
    return <span className="text-xs font-medium text-muted-foreground">Only owner</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={toggleStatus} disabled={busy !== null}>
        {isBusy("status") ? <Loader2 size={14} className="animate-spin" /> : active ? <UserX size={14} /> : <UserCheck size={14} />}
        {active ? "Suspend" : "Reactivate"}
      </Button>
      <Button variant="outline" size="sm" onClick={() => setConfirmRemove(true)} disabled={busy !== null}>
        <UserMinus size={14} />
        Remove
      </Button>
      <ConfirmDialog
        open={confirmRemove}
        title="Remove this team member?"
        description="They'll immediately lose access to your brand's TruOrigin workspace."
        confirmLabel="Remove Member"
        danger
        busy={isBusy("remove")}
        onConfirm={confirmRemoveMember}
        onCancel={() => setConfirmRemove(false)}
      />
    </div>
  );
}
