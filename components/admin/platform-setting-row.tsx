"use client";

import { useState } from "react";
import { Loader2, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { useApiAction } from "@/components/dashboard/use-api-action";

export function PlatformSettingRow({ id, settingKey, value }: { id: string; settingKey: string; value: unknown }) {
  const { run, busy, isBusy } = useApiAction();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(typeof value === "string" ? value : JSON.stringify(value));
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function save() {
    const ok = await run("save", "/api/admin/settings", { key: settingKey, value: draft }, { method: "PATCH", successMessage: "Setting updated." });
    if (ok) setEditing(false);
  }

  async function confirmDeleteSetting() {
    const ok = await run("delete", `/api/admin/settings/${id}`, {}, { method: "DELETE", successMessage: "Setting deleted." });
    if (ok) setConfirmDelete(false);
  }

  return (
    <div className="rounded-lg border border-border bg-muted/50 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">{settingKey}</p>
        <div className="flex gap-2">
          {editing ? (
            <Button size="sm" onClick={save} disabled={busy !== null}>
              {isBusy("save") ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} disabled={busy !== null}>
              Edit
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)} disabled={busy !== null}>
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
      {editing ? (
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
        />
      ) : (
        <p className="mt-1 break-all text-sm text-muted-foreground">{JSON.stringify(value)}</p>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this setting?"
        description={`"${settingKey}" will be removed.`}
        confirmLabel="Delete Setting"
        danger
        busy={isBusy("delete")}
        onConfirm={confirmDeleteSetting}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
