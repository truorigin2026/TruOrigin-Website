"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/toast";

/**
 * De-duplicates the fetch/busy/error boilerplate copy-pasted across the
 * admin action components (product-actions.tsx, brand-actions.tsx, etc.):
 * POST/PATCH a JSON body, surface errors as a toast instead of
 * window.alert, refresh the route on success.
 */
export function useApiAction() {
  const router = useRouter();
  const { showToast } = useToast();
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const run = useCallback(
    async (
      key: string,
      endpoint: string,
      payload: Record<string, unknown> = {},
      options?: { method?: string; successMessage?: string; onSuccess?: (data: unknown) => void; skipRefresh?: boolean },
    ) => {
      setBusyKey(key);
      try {
        const response = await fetch(endpoint, {
          method: options?.method ?? "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error((data as { error?: string } | null)?.error ?? "Action failed.");
        }

        if (options?.successMessage) showToast("success", options.successMessage);
        options?.onSuccess?.(data);
        if (!options?.skipRefresh) router.refresh();
        return true;
      } catch (error) {
        showToast("error", error instanceof Error ? error.message : "Action failed.");
        return false;
      } finally {
        setBusyKey(null);
      }
    },
    [router, showToast],
  );

  return { run, busy: busyKey, isBusy: (key: string) => busyKey === key };
}
