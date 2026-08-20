"use client";

import { Loader2, PlayCircle, CalendarPlus, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApiAction } from "@/components/dashboard/use-api-action";

export function SubscriptionActions({ subscriptionId }: { subscriptionId: string }) {
  const { run, busy, isBusy } = useApiAction();

  function submit(action: string, successMessage: string) {
    run(action, `/api/admin/subscriptions/${subscriptionId}/status`, { action }, { successMessage });
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      <Button onClick={() => submit("ACTIVATE", "Subscription activated.")} disabled={busy !== null}>
        {isBusy("ACTIVATE") ? <Loader2 size={15} className="animate-spin" /> : <PlayCircle size={15} />}
        Activate
      </Button>
      <Button variant="outline" onClick={() => submit("EXTEND", "Subscription extended.")} disabled={busy !== null}>
        {isBusy("EXTEND") ? <Loader2 size={15} className="animate-spin" /> : <CalendarPlus size={15} />}
        Extend 1 Month
      </Button>
      <Button variant="destructive" onClick={() => submit("CANCEL", "Subscription canceled.")} disabled={busy !== null}>
        {isBusy("CANCEL") ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
        Cancel
      </Button>
    </div>
  );
}
