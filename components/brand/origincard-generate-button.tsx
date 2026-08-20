"use client";

import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApiAction } from "@/components/dashboard/use-api-action";

export function OriginCardGenerateButton({ productId }: { productId: string }) {
  const { run, isBusy } = useApiAction();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isBusy("generate")}
      onClick={(event) => {
        event.stopPropagation();
        run("generate", `/api/brand/origincards/${productId}/generate`, {}, { successMessage: "OriginCard generated." });
      }}
    >
      {isBusy("generate") ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
      Generate
    </Button>
  );
}
