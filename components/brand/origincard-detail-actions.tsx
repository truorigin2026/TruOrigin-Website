"use client";

import { useState } from "react";
import { Loader2, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { useApiAction } from "@/components/dashboard/use-api-action";

export function OriginCardDetailActions({ cardId, status }: { cardId: string; status: string }) {
  const { run, isBusy } = useApiAction();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (status !== "PUBLISHED") {
    return null;
  }

  async function confirmDeactivate() {
    const ok = await run("deactivate", `/api/brand/origincards/${cardId}/deactivate`, {}, { successMessage: "OriginCard deactivated." });
    if (ok) setConfirmOpen(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deactivate this OriginCard</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
          Deactivating removes this product&apos;s verification page from customer access. You can&apos;t undo this from
          here — contact TruOrigin support to republish.
        </p>
        <Button variant="destructive" onClick={() => setConfirmOpen(true)} disabled={isBusy("deactivate")}>
          {isBusy("deactivate") ? <Loader2 size={15} className="animate-spin" /> : <PowerOff size={15} />}
          Deactivate OriginCard
        </Button>
      </CardContent>
      <ConfirmDialog
        open={confirmOpen}
        title="Deactivate this OriginCard?"
        description="Customers who scan this product's QR code will no longer see its verification page."
        confirmLabel="Deactivate"
        danger
        busy={isBusy("deactivate")}
        onConfirm={confirmDeactivate}
        onCancel={() => setConfirmOpen(false)}
      />
    </Card>
  );
}
