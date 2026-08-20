"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFileUpload } from "@/components/dashboard/use-file-upload";
import { useApiAction } from "@/components/dashboard/use-api-action";

const DOC_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "CERTIFICATE", label: "Certification" },
  { value: "LAB_REPORT", label: "Lab Report" },
  { value: "INGREDIENT_LIST", label: "Ingredient List" },
  { value: "SOURCING_PROOF", label: "Invoice / Sourcing Proof" },
  { value: "OTHER", label: "Other" },
];

export function DocumentUploadForm({ products }: { products: { id: string; name: string }[] }) {
  const { uploadFile } = useFileUpload();
  const { run, busy } = useApiAction();

  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState(DOC_TYPE_OPTIONS[0].value);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!productId) return setError("Select a product first.");
    if (!title.trim()) return setError("Give the document a title.");
    if (!file) return setError("Choose a file to upload.");

    try {
      const { url, contentType } = await uploadFile(file);
      const ok = await run(
        "upload",
        "/api/brand/documents",
        { productId, title, docType, fileUrl: url, mimeType: contentType },
        { successMessage: "Document uploaded." },
      );
      if (ok) {
        setTitle("");
        setFile(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload document.");
    }
  }

  if (products.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-muted-foreground">
        Add a product first — documents are attached to a specific product record.
      </p>
    );
  }

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          <span>Product</span>
          <select
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          <span>Document Type</span>
          <select
            value={docType}
            onChange={(event) => setDocType(event.target.value)}
            className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
          >
            {DOC_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="mt-3 block space-y-2 text-sm font-medium">
        <span>Title</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. USDA Organic Certificate"
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
        />
      </label>
      <label className="mt-3 block space-y-2 text-sm font-medium">
        <span>File (PDF, JPG, or PNG)</span>
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none"
        />
      </label>
      {error ? <p className="mt-3 text-sm font-semibold text-destructive">{error}</p> : null}
      <Button type="button" disabled={busy !== null} onClick={handleSubmit} className="mt-4">
        {busy !== null ? <Loader2 size={15} className="animate-spin" /> : null}
        Upload File
      </Button>
    </div>
  );
}
