"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApiAction } from "@/components/dashboard/use-api-action";

export function InvoiceActions({ invoiceId, status }: { invoiceId: string; status: string }) {
  const { run, busy, isBusy } = useApiAction();

  if (status === "PAID" || status === "REFUNDED" || status === "VOID") {
    return null;
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => run("paid", `/api/admin/invoices/${invoiceId}/mark-paid`, {}, { successMessage: "Invoice marked paid." })} disabled={busy !== null}>
        {isBusy("paid") ? <Loader2 size={13} className="animate-spin" /> : null}
        Mark Paid
      </Button>
      <Button variant="outline" size="sm" onClick={() => run("failed", `/api/admin/invoices/${invoiceId}/mark-failed`, {}, { successMessage: "Invoice marked failed." })} disabled={busy !== null}>
        {isBusy("failed") ? <Loader2 size={13} className="animate-spin" /> : null}
        Mark Failed
      </Button>
    </div>
  );
}
