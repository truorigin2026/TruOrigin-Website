"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFileUpload } from "@/components/dashboard/use-file-upload";
import { useToast } from "@/components/dashboard/toast";
import { cn } from "@/lib/utils/cn";

type ImageItem = { id: string; url: string; altText: string; uploading: boolean };
type ClaimItem = { id: string; label: string; evidence: string };
type IngredientItem = { id: string; name: string; note: string };
type DocType = "CERTIFICATE" | "LAB_REPORT" | "INGREDIENT_LIST" | "SOURCING_PROOF" | "OTHER";
type DocumentItem = {
  id: string;
  title: string;
  docType: DocType;
  fileUrl: string;
  mimeType: string;
  uploading: boolean;
  issuer: string;
  testDate: string;
  testType: string;
  testScope: string;
  summary: string;
  isPublic: boolean;
};

const DOC_TYPE_OPTIONS: { value: DocType; label: string }[] = [
  { value: "CERTIFICATE", label: "Certification" },
  { value: "LAB_REPORT", label: "Lab Report" },
  { value: "INGREDIENT_LIST", label: "Ingredient List" },
  { value: "SOURCING_PROOF", label: "Invoice / Sourcing Documentation" },
  { value: "OTHER", label: "Other" },
];

const STEPS = ["Product Information", "Claims", "Ingredients", "Documents", "Link Evidence", "Review"] as const;

function newId() {
  return Math.random().toString(36).slice(2);
}

export type ProductWizardInitialValues = {
  name: string;
  category: string;
  subcategory: string;
  description: string;
  images: { id: string; url: string; altText: string }[];
  claims: { id: string; label: string; evidence: string }[];
  ingredients: { id: string; name: string; note: string }[];
  documents: {
    id: string;
    title: string;
    docType: DocType;
    fileUrl: string;
    mimeType: string;
    issuer?: string;
    testDate?: string;
    testType?: string;
    testScope?: string;
    summary?: string;
    isPublic?: boolean;
  }[];
  claimCertificateLinks?: Record<string, string[]>;
};

type ProductWizardProps = {
  categoryOptions: string[];
  mode?: "create" | "edit";
  productId?: string;
  initialValues?: ProductWizardInitialValues;
  /** Defaults to "/api/brand/products" — override for e.g. the admin "upload for a brand" tool. */
  apiBasePath?: string;
  /** Defaults to "/brand/products" — where the wizard sends the browser after a successful submit. */
  redirectBasePath?: string;
};

export function ProductWizard({
  categoryOptions,
  mode = "create",
  productId,
  initialValues,
  apiBasePath = "/api/brand/products",
  redirectBasePath = "/brand/products",
}: ProductWizardProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { uploadFile } = useFileUpload();
  const listId = useId();

  const [step, setStep] = useState(0);
  const [name, setName] = useState(initialValues?.name ?? "");
  const [category, setCategory] = useState(initialValues?.category ?? "");
  const [subcategory, setSubcategory] = useState(initialValues?.subcategory ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [images, setImages] = useState<ImageItem[]>(
    (initialValues?.images ?? []).map((img) => ({ ...img, uploading: false })),
  );
  const [claims, setClaims] = useState<ClaimItem[]>(
    initialValues?.claims && initialValues.claims.length > 0 ? initialValues.claims : [{ id: newId(), label: "", evidence: "" }],
  );
  const [ingredients, setIngredients] = useState<IngredientItem[]>(initialValues?.ingredients ?? []);
  const [documents, setDocuments] = useState<DocumentItem[]>(
    (initialValues?.documents ?? []).map((doc) => ({
      ...doc,
      uploading: false,
      issuer: doc.issuer ?? "",
      testDate: doc.testDate ?? "",
      testType: doc.testType ?? "",
      testScope: doc.testScope ?? "",
      summary: doc.summary ?? "",
      isPublic: doc.isPublic ?? true,
    })),
  );
  const [claimCertificateLinks, setClaimCertificateLinks] = useState<Record<string, string[]>>(
    initialValues?.claimCertificateLinks ?? {},
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImageSelect(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList).slice(0, 10 - images.length);
    for (const file of files) {
      const id = newId();
      setImages((prev) => [...prev, { id, url: "", altText: file.name, uploading: true }]);
      try {
        const { url } = await uploadFile(file);
        setImages((prev) => prev.map((img) => (img.id === id ? { ...img, url, uploading: false } : img)));
      } catch (err) {
        setImages((prev) => prev.filter((img) => img.id !== id));
        setError(err instanceof Error ? err.message : "Image upload failed");
      }
    }
  }

  async function handleDocumentFileSelect(docId: string, file: File | null) {
    if (!file) return;
    setDocuments((prev) => prev.map((doc) => (doc.id === docId ? { ...doc, uploading: true } : doc)));
    try {
      const { url, contentType } = await uploadFile(file);
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === docId ? { ...doc, fileUrl: url, mimeType: contentType, uploading: false } : doc)),
      );
    } catch (err) {
      setDocuments((prev) => prev.map((doc) => (doc.id === docId ? { ...doc, uploading: false } : doc)));
      setError(err instanceof Error ? err.message : "Document upload failed");
    }
  }

  function validateStep(index: number): string | null {
    if (index === 0) {
      if (!name.trim()) return "Product name is required.";
      if (!category.trim()) return "Category is required.";
      if (images.some((img) => img.uploading)) return "Please wait for photo uploads to finish.";
      if (images.filter((img) => img.url).length === 0) return "At least one product photo is required.";
    }
    if (index === 3) {
      if (documents.some((doc) => doc.uploading)) return "Please wait for document uploads to finish.";
    }
    return null;
  }

  function goToStep(index: number) {
    for (let i = 0; i < index; i += 1) {
      const err = validateStep(i);
      if (err) {
        setError(err);
        setStep(i);
        return;
      }
    }
    setError(null);
    setStep(index);
  }

  async function handleSubmit() {
    setError(null);
    for (let i = 0; i < STEPS.length - 1; i += 1) {
      const err = validateStep(i);
      if (err) {
        setError(err);
        setStep(i);
        return;
      }
    }

    const readyImages = images.filter((img) => img.url);
    const attachedDocuments = documents.filter((doc) => doc.fileUrl);
    const payload = {
      name,
      category,
      subcategory,
      description,
      images: readyImages.map((img) => ({ url: img.url, altText: img.altText })),
      claims: claims
        .filter((claim) => claim.label.trim())
        .map((claim) => ({
          label: claim.label,
          evidence: claim.evidence,
          linkedDocumentIds: (claimCertificateLinks[claim.id] ?? []).filter((docId) =>
            attachedDocuments.some((doc) => doc.id === docId),
          ),
        })),
      ingredients: ingredients.filter((i) => i.name.trim()).map((i) => ({ name: i.name, note: i.note })),
      certificates: attachedDocuments.map((doc) => ({
        localId: doc.id,
        title: doc.title || doc.docType,
        docType: doc.docType,
        fileUrl: doc.fileUrl,
        mimeType: doc.mimeType,
        issuer: doc.issuer,
        testDate: doc.testDate,
        testType: doc.testType,
        testScope: doc.testScope,
        reviewNote: doc.summary,
        isPublic: doc.isPublic,
      })),
    };

    setSubmitting(true);
    try {
      const endpoint = mode === "edit" ? `${apiBasePath}/${productId}` : apiBasePath;
      const response = await fetch(endpoint, {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Could not save product.");
      }

      const data = (await response.json()) as { product?: { id: string } };
      showToast("success", mode === "edit" ? "Product updated and resubmitted for review." : "Product submitted for review.");
      router.push(mode === "edit" ? `${redirectBasePath}/${productId}` : `${redirectBasePath}/${data.product?.id ?? ""}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save product.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
        {STEPS.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => goToStep(index)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              index === step
                ? "border-primary bg-primary text-primary-foreground"
                : index < step
                  ? "border-border bg-muted text-foreground"
                  : "border-border bg-background text-muted-foreground",
            )}
          >
            <span className={cn("flex size-4 items-center justify-center rounded-full text-[10px]", index === step ? "bg-primary-foreground/20" : "")}>
              {index < step ? <Check size={12} /> : index + 1}
            </span>
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      ) : null}

      {step === 0 ? (
        <Card className="p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              <span>Product Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Category</span>
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                list={listId}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
              />
              <datalist id={listId}>
                {categoryOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </label>
          </div>

          <label className="mt-5 block space-y-2 text-sm font-medium">
            <span>Subcategory (optional)</span>
            <input
              value={subcategory}
              onChange={(event) => setSubcategory(event.target.value)}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
            />
          </label>

          <label className="mt-5 block space-y-2 text-sm font-medium">
            <span>Description (optional)</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
            />
          </label>

          <div className="mt-5 space-y-2 text-sm font-medium">
            <span>Product Photos</span>
            <div className="rounded-lg border border-dashed border-input bg-muted/40 px-4 py-6 text-sm text-muted-foreground">
              <p>Upload up to 10 product photos. The first uploaded photo becomes the main image on the public product page.</p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={(event) => handleImageSelect(event.target.files)}
                className="mt-3 text-sm"
              />
            </div>
            {images.length > 0 ? (
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {images.map((image, index) => (
                  <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted/40">
                    {image.uploading ? (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Uploading...</div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image.url} alt={image.altText} className="h-full w-full object-cover" />
                    )}
                    {index === 0 && !image.uploading ? (
                      <span className="absolute left-1 top-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        Main
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((img) => img.id !== image.id))}
                      className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs font-semibold text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card className="p-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            List the claims you want to make about this product (e.g. &quot;Organic&quot;, &quot;Cruelty Free&quot;). Add a
            short evidence note for each — TruOrigin reviews each claim against your supporting documents during review.
          </p>
          <div className="mt-5 grid gap-3">
            {claims.map((claim) => (
              <div key={claim.id} className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4 md:grid-cols-[1fr_1.4fr_auto]">
                <input
                  value={claim.label}
                  onChange={(event) => setClaims((prev) => prev.map((c) => (c.id === claim.id ? { ...c, label: event.target.value } : c)))}
                  placeholder="Claim (e.g. Organic)"
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
                />
                <input
                  value={claim.evidence}
                  onChange={(event) => setClaims((prev) => prev.map((c) => (c.id === claim.id ? { ...c, evidence: event.target.value } : c)))}
                  placeholder="Evidence note (e.g. see attached lab report)"
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
                />
                <Button type="button" variant="outline" onClick={() => setClaims((prev) => prev.filter((c) => c.id !== claim.id))}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" className="mt-3" onClick={() => setClaims((prev) => [...prev, { id: newId(), label: "", evidence: "" }])}>
            Add Claim
          </Button>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card className="p-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            List the ingredients in this product. Add an optional note for context (e.g. sourcing, function, allergen
            info) — an admin can review and refine this list before the product goes live.
          </p>
          <div className="mt-5 grid gap-3">
            {ingredients.map((ingredient) => (
              <div key={ingredient.id} className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4 md:grid-cols-[1fr_1.4fr_auto]">
                <input
                  value={ingredient.name}
                  onChange={(event) =>
                    setIngredients((prev) => prev.map((i) => (i.id === ingredient.id ? { ...i, name: event.target.value } : i)))
                  }
                  placeholder="Ingredient name"
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
                />
                <input
                  value={ingredient.note}
                  onChange={(event) =>
                    setIngredients((prev) => prev.map((i) => (i.id === ingredient.id ? { ...i, note: event.target.value } : i)))
                  }
                  placeholder="Note (optional)"
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIngredients((prev) => prev.filter((i) => i.id !== ingredient.id))}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => setIngredients((prev) => [...prev, { id: newId(), name: "", note: "" }])}
          >
            Add Ingredient
          </Button>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card className="p-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Attach certificates, lab reports, or sourcing documentation supporting your claims. Optional here — you can also
            upload documents later from the Documents page. The details below appear on the public product page, so
            customers can see what backs up your claims — an admin can refine any of it before your product goes live.
          </p>
          <div className="mt-5 grid gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4">
                <div className="grid gap-3 md:grid-cols-[1fr_1fr_1.2fr_auto]">
                  <input
                    value={doc.title}
                    onChange={(event) => setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, title: event.target.value } : d)))}
                    placeholder="Document title"
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
                  />
                  <select
                    value={doc.docType}
                    onChange={(event) => setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, docType: event.target.value as DocType } : d)))}
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
                  >
                    {DOC_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    onChange={(event) => handleDocumentFileSelect(doc.id, event.target.files?.[0] ?? null)}
                    className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none"
                  />
                  <Button type="button" variant="outline" onClick={() => setDocuments((prev) => prev.filter((d) => d.id !== doc.id))}>
                    Remove
                  </Button>
                </div>
                {doc.uploading ? <p className="text-xs text-muted-foreground">Uploading...</p> : null}
                {doc.fileUrl && !doc.uploading ? <p className="text-xs font-semibold text-primary">File attached</p> : null}

                <div className="grid gap-3 border-t border-border pt-3 md:grid-cols-2">
                  <input
                    value={doc.issuer}
                    onChange={(event) => setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, issuer: event.target.value } : d)))}
                    placeholder="Testing organization (e.g. SGS India)"
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
                  />
                  <input
                    type="date"
                    value={doc.testDate}
                    onChange={(event) => setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, testDate: event.target.value } : d)))}
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
                  />
                  <input
                    value={doc.testType}
                    onChange={(event) => setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, testType: event.target.value } : d)))}
                    placeholder="Test type (e.g. In-vitro Study)"
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
                  />
                  <input
                    value={doc.testScope}
                    onChange={(event) => setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, testScope: event.target.value } : d)))}
                    placeholder="Test scope (e.g. Skin brightness evaluation)"
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
                  />
                  <textarea
                    value={doc.summary}
                    onChange={(event) => setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, summary: event.target.value } : d)))}
                    placeholder="Plain-language summary of the findings, shown on the public product page"
                    rows={2}
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring md:col-span-2"
                  />
                  <label className="flex items-center gap-2 text-sm font-medium md:col-span-2">
                    <input
                      type="checkbox"
                      checked={doc.isPublic}
                      onChange={(event) => setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, isPublic: event.target.checked } : d)))}
                      className="size-4 rounded border-input"
                    />
                    <span>Public — let customers view/download the original file</span>
                  </label>
                  {!doc.isPublic ? (
                    <p className="text-xs text-muted-foreground md:col-span-2">
                      Private: customers only see the summary above, never the original file.
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() =>
              setDocuments((prev) => [
                ...prev,
                {
                  id: newId(),
                  title: "",
                  docType: "CERTIFICATE",
                  fileUrl: "",
                  mimeType: "",
                  uploading: false,
                  issuer: "",
                  testDate: "",
                  testType: "",
                  testScope: "",
                  summary: "",
                  isPublic: true,
                },
              ])
            }
          >
            Add Document
          </Button>
        </Card>
      ) : null}

      {step === 4 ? (
        <Card className="p-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            For each claim, pick which of the documents you just uploaded support it. Customers will see this link on
            the product page — optional, but claims backed by a document are clearer to customers than a claim alone.
          </p>
          <div className="mt-5 grid gap-4">
            {claims.filter((claim) => claim.label.trim()).length === 0 ? (
              <p className="text-sm text-muted-foreground">Add a claim in the Claims step to link evidence to it.</p>
            ) : null}
            {claims
              .filter((claim) => claim.label.trim())
              .map((claim) => {
                const attachedDocs = documents.filter((doc) => doc.fileUrl);
                const linked = claimCertificateLinks[claim.id] ?? [];
                return (
                  <div key={claim.id} className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-sm font-semibold text-foreground">{claim.label}</p>
                    {attachedDocs.length === 0 ? (
                      <p className="mt-2 text-xs text-muted-foreground">No documents uploaded yet — add one in the Documents step.</p>
                    ) : (
                      <div className="mt-2 grid gap-1.5">
                        {attachedDocs.map((doc) => (
                          <label key={doc.id} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={linked.includes(doc.id)}
                              onChange={(event) =>
                                setClaimCertificateLinks((prev) => {
                                  const current = prev[claim.id] ?? [];
                                  const next = event.target.checked
                                    ? [...current, doc.id]
                                    : current.filter((id) => id !== doc.id);
                                  return { ...prev, [claim.id]: next };
                                })
                              }
                              className="size-4 rounded border-input"
                            />
                            <span>{doc.title || doc.docType}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </Card>
      ) : null}

      {step === 5 ? (
        <Card className="p-6">
          <p className="text-sm font-semibold text-foreground">Review before submitting</p>
          <div className="mt-4 grid gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Product</p>
              <p className="mt-1 text-sm">{name || "—"} • {category || "—"} {subcategory ? `• ${subcategory}` : ""}</p>
              {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
              <p className="mt-1 text-sm text-muted-foreground">{images.filter((i) => i.url).length} photo(s) attached</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Claims</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {claims.filter((c) => c.label.trim()).map((c) => {
                  const linkedCount = (claimCertificateLinks[c.id] ?? []).length;
                  return (
                    <Badge key={c.id} variant="outline">
                      {c.label}
                      {linkedCount > 0 ? ` · ${linkedCount} document${linkedCount === 1 ? "" : "s"}` : ""}
                    </Badge>
                  );
                })}
                {claims.filter((c) => c.label.trim()).length === 0 ? <p className="text-sm text-muted-foreground">No claims added.</p> : null}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Ingredients</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {ingredients.filter((i) => i.name.trim()).length} ingredient(s) listed
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Documents</p>
              <p className="mt-1 text-sm text-muted-foreground">{documents.filter((d) => d.fileUrl).length} document(s) attached</p>
            </div>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            Once submitted, this product enters the TruOrigin review queue. An admin reviews your claims against the
            attached evidence before it goes live with a serial number and QR-linked OriginCard.
          </p>
        </Card>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="outline" disabled={step === 0} onClick={() => goToStep(step - 1)}>
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={() => goToStep(step + 1)}>
            Continue
          </Button>
        ) : (
          <Button type="button" disabled={submitting} onClick={handleSubmit}>
            {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
            {mode === "edit" ? "Save & Resubmit for Review" : "Submit for Review"}
          </Button>
        )}
      </div>
    </div>
  );
}
