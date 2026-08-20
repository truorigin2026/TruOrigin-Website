"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Loader2, Upload, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { useApiAction } from "@/components/dashboard/use-api-action";

type CmsFormProps = {
  mode: "create" | "edit";
  initial?: {
    id: string;
    type: string;
    slug: string;
    title: string;
    subtitle: string | null;
    excerpt: string | null;
    body: string | null;
    category: string | null;
    status: string;
  };
};

const TYPE_OPTIONS = ["INDUSTRY", "RESOURCE", "FAQ", "BLOG_POST", "CONTENT_BLOCK"] as const;

export function CmsForm({ mode, initial }: CmsFormProps) {
  const router = useRouter();
  const { run, busy, isBusy } = useApiAction();
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const payload = {
      type: form.get("type"),
      slug: form.get("slug"),
      title: form.get("title"),
      subtitle: form.get("subtitle") || undefined,
      excerpt: form.get("excerpt") || undefined,
      body: form.get("body") || undefined,
      category: form.get("category") || undefined,
    };

    const ok = await run(
      "save",
      mode === "create" ? "/api/admin/cms" : `/api/admin/cms/${initial!.id}`,
      payload,
      { method: mode === "create" ? "POST" : "PATCH", successMessage: mode === "create" ? undefined : "Content updated.", skipRefresh: mode === "create" },
    );

    if (ok && mode === "create") {
      router.push("/admin/cms");
      router.refresh();
    }
  }

  function publish() {
    run("publish", `/api/admin/cms/${initial!.id}/publish`, {}, { successMessage: "Content published." });
  }
  function archive() {
    run("archive", `/api/admin/cms/${initial!.id}/archive`, {}, { successMessage: "Content archived." });
  }
  async function confirmDeleteContent() {
    const ok = await run("delete", `/api/admin/cms/${initial!.id}/delete`, {}, { skipRefresh: true });
    if (ok) {
      router.push("/admin/cms");
      router.refresh();
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium">
            <span>Type</span>
            <select
              name="type"
              defaultValue={initial?.type ?? "CONTENT_BLOCK"}
              disabled={mode === "edit"}
              className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring disabled:opacity-60"
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            <span>Slug</span>
            <input
              name="slug"
              required
              defaultValue={initial?.slug}
              className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
            />
          </label>
        </div>
        <label className="grid gap-1.5 text-sm font-medium">
          <span>Title</span>
          <input
            name="title"
            required
            defaultValue={initial?.title}
            className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium">
            <span>Subtitle</span>
            <input
              name="subtitle"
              defaultValue={initial?.subtitle ?? ""}
              className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            <span>Category</span>
            <input
              name="category"
              defaultValue={initial?.category ?? ""}
              className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
            />
          </label>
        </div>
        <label className="grid gap-1.5 text-sm font-medium">
          <span>Excerpt</span>
          <textarea
            name="excerpt"
            rows={2}
            defaultValue={initial?.excerpt ?? ""}
            className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          <span>Body</span>
          <textarea
            name="body"
            rows={8}
            defaultValue={initial?.body ?? ""}
            className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
          />
        </label>
        <Button type="submit" className="w-fit" disabled={busy !== null}>
          {isBusy("save") ? <Loader2 size={15} className="animate-spin" /> : null}
          {mode === "create" ? "Create Content" : "Save Changes"}
        </Button>
      </form>

      {mode === "edit" && initial ? (
        <div className="flex flex-wrap gap-2.5 border-t border-border pt-6">
          {initial.status !== "PUBLISHED" ? (
            <Button variant="outline" onClick={publish} disabled={busy !== null}>
              {isBusy("publish") ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              Publish
            </Button>
          ) : null}
          {initial.status !== "ARCHIVED" ? (
            <Button variant="outline" onClick={archive} disabled={busy !== null}>
              {isBusy("archive") ? <Loader2 size={15} className="animate-spin" /> : <Archive size={15} />}
              Archive
            </Button>
          ) : null}
          <Button variant="destructive" onClick={() => setConfirmDelete(true)} disabled={busy !== null}>
            <Trash2 size={15} />
            Delete
          </Button>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this content permanently?"
        confirmLabel="Delete"
        danger
        busy={isBusy("delete")}
        onConfirm={confirmDeleteContent}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
