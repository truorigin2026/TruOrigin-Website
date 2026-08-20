"use client";

import { Loader2, QrCode, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApiAction } from "@/components/dashboard/use-api-action";

type QrActionsProps = {
  productId: string;
  hasQr: boolean;
};

export function QrActions({ productId, hasQr }: QrActionsProps) {
  const { run, busy, isBusy } = useApiAction();

  function generate() {
    run("generate", `/api/admin/qr/${productId}/generate`, {}, { successMessage: "QR generated." });
  }
  function regenerate() {
    run("regenerate", `/api/admin/qr/${productId}/regenerate`, {}, { successMessage: "QR regenerated." });
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      {!hasQr ? (
        <Button onClick={generate} disabled={busy !== null}>
          {isBusy("generate") ? <Loader2 size={15} className="animate-spin" /> : <QrCode size={15} />}
          Generate QR
        </Button>
      ) : (
        <Button variant="outline" onClick={regenerate} disabled={busy !== null}>
          {isBusy("regenerate") ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
          Regenerate QR
        </Button>
      )}
      <Button variant="outline" render={<a href={`/api/admin/qr/${productId}/download`} />} nativeButton={false}>
        <Download size={15} />
        Download PNG
      </Button>
    </div>
  );
}
