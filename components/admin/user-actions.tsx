"use client";

import { Loader2, Ban, RotateCcw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApiAction } from "@/components/dashboard/use-api-action";

export function UserActions({ userId, active }: { userId: string; active: boolean }) {
  const { run, busy, isBusy } = useApiAction();

  function toggleStatus() {
    run(
      "status",
      `/api/admin/users/${userId}/status`,
      { action: active ? "SUSPEND" : "REACTIVATE" },
      { successMessage: active ? "User suspended." : "User reactivated." },
    );
  }

  function sendReset() {
    run("reset", `/api/admin/users/${userId}/reset-password`, {}, { successMessage: "Password reset email sent.", skipRefresh: true });
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      {active ? (
        <Button variant="destructive" onClick={toggleStatus} disabled={busy !== null}>
          {isBusy("status") ? <Loader2 size={15} className="animate-spin" /> : <Ban size={15} />}
          Suspend User
        </Button>
      ) : (
        <Button onClick={toggleStatus} disabled={busy !== null}>
          {isBusy("status") ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />}
          Reactivate User
        </Button>
      )}
      <Button variant="outline" onClick={sendReset} disabled={busy !== null}>
        {isBusy("reset") ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
        Send Password Reset
      </Button>
    </div>
  );
}
