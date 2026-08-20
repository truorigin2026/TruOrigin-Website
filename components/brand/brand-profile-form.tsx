"use client";

import { useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApiAction } from "@/components/dashboard/use-api-action";
import { useFileUpload } from "@/components/dashboard/use-file-upload";

type BrandProfileFormProps = {
  initialName: string;
  initialLogoUrl: string;
  initialSummary: string;
  canEdit: boolean;
};

export function BrandProfileForm({ initialName, initialLogoUrl, initialSummary, canEdit }: BrandProfileFormProps) {
  const { run, busy } = useApiAction();
  const { uploadFile } = useFileUpload();
  const [name, setName] = useState(initialName);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [summary, setSummary] = useState(initialSummary);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  async function handleLogoSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setLogoError(null);
    setUploadingLogo(true);
    try {
      const { url } = await uploadFile(file);
      setLogoUrl(url);
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : "Could not upload logo.");
    } finally {
      setUploadingLogo(false);
    }
  }

  function handleSubmit() {
    run(
      "save",
      "/api/brand/profile",
      { name, logoUrl, summary },
      { method: "PATCH", successMessage: "Brand profile updated.", skipRefresh: true },
    );
  }

  return (
    <div className="grid gap-4 md:max-w-lg">
      <label className="grid gap-1.5 text-sm font-medium">
        <span>Brand Name</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={!canEdit}
          className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring disabled:opacity-60"
        />
      </label>
      <div className="grid gap-1.5 text-sm font-medium">
        <span>Brand Logo</span>
        <div className="flex items-center gap-4">
          <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary Blob URL, next/image is unoptimized anyway
              <img src={logoUrl} alt="" className="size-full object-cover" />
            ) : (
              <span className="text-[10px] font-semibold text-muted-foreground">No logo</span>
            )}
          </span>
          {canEdit ? (
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-input px-3 py-2 text-sm font-medium hover:bg-muted">
                {uploadingLogo ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {logoUrl ? "Replace Logo" : "Upload Logo"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleLogoSelect}
                  disabled={uploadingLogo}
                  className="hidden"
                />
              </label>
              {logoUrl ? (
                <Button type="button" variant="outline" size="sm" onClick={() => setLogoUrl("")}>
                  <X size={14} />
                  Remove
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
        {logoError ? <p className="text-xs font-semibold text-destructive">{logoError}</p> : null}
        <p className="text-xs font-normal text-muted-foreground">
          Shown as a circular badge on this brand&apos;s product cards. Square images work best.
        </p>
      </div>
      <label className="grid gap-1.5 text-sm font-medium">
        <span>Summary</span>
        <textarea
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          disabled={!canEdit}
          rows={3}
          className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring disabled:opacity-60"
        />
      </label>
      {canEdit ? (
        <Button type="button" className="w-fit" disabled={busy !== null} onClick={handleSubmit}>
          {busy !== null ? <Loader2 size={15} className="animate-spin" /> : null}
          Save Changes
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">Only a team owner or admin can edit the brand profile.</p>
      )}
    </div>
  );
}
