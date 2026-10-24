"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X, GripVertical } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFileUpload } from "@/components/dashboard/use-file-upload";
import { useToast } from "@/components/dashboard/toast";
import { AssetImage } from "@/components/brands/asset-image";
import { ImageCropDialog } from "@/components/brand/image-crop-dialog";
import { cn } from "@/lib/utils/cn";

type ImageItem = { id: string; url: string; altText: string; uploading: boolean; focalX: number; focalY: number; zoom: number };
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

const STEPS = ["Product Information", "Claims & Evidence", "Ingredients", "Review"] as const;

function newId() {
  return Math.random().toString(36).slice(2);
}

function blankDocument(): DocumentItem {
  return {
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
  };
}

export type ProductWizardInitialValues = {
  status?: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  images: { id: string; url: string; altText: string; focalX?: number; focalY?: number; zoom?: number }[];
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

/** Full editable field set for one document — reused for a claim's own documents and for unlinked ("Other") ones. */
function DocumentFields({
  doc,
  onChange,
  onFileSelect,
  onRemove,
}: {
  doc: DocumentItem;
  onChange: (patch: Partial<DocumentItem>) => void;
  onFileSelect: (file: File | null) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-border bg-background p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1.2fr_auto]">
        <input
          value={doc.title}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="Document title"
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
        />
        <Select value={doc.docType} onValueChange={(value) => onChange({ docType: (value ?? "OTHER") as DocType })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DOC_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          onChange={(event) => onFileSelect(event.target.files?.[0] ?? null)}
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none"
        />
        <Button type="button" variant="outline" onClick={onRemove}>
          Remove
        </Button>
      </div>
      {doc.uploading ? <p className="text-xs text-muted-foreground">Uploading...</p> : null}
      {doc.fileUrl && !doc.uploading ? <p className="text-xs font-semibold text-primary">File attached</p> : null}

      <div className="grid gap-3 border-t border-border pt-3 md:grid-cols-2">
        <input
          value={doc.issuer}
          onChange={(event) => onChange({ issuer: event.target.value })}
          placeholder="Testing organization (e.g. SGS India)"
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
        />
        <input
          type="date"
          value={doc.testDate}
          onChange={(event) => onChange({ testDate: event.target.value })}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
        />
        <input
          value={doc.testType}
          onChange={(event) => onChange({ testType: event.target.value })}
          placeholder="Test type (e.g. In-vitro Study)"
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
        />
        <input
          value={doc.testScope}
          onChange={(event) => onChange({ testScope: event.target.value })}
          placeholder="Test scope (e.g. Skin brightness evaluation)"
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
        />
        <textarea
          value={doc.summary}
          onChange={(event) => onChange({ summary: event.target.value })}
          placeholder="Plain-language summary of the findings, shown on the public product page"
          rows={2}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring md:col-span-2"
        />
        <label className="flex items-center gap-2 text-sm font-medium md:col-span-2">
          <input
            type="checkbox"
            checked={doc.isPublic}
            onChange={(event) => onChange({ isPublic: event.target.checked })}
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
  );
}

/** One draggable photo thumbnail — keyed by the client-generated ImageItem.id, since no DB id exists yet at this point in the flow. */
function SortableImageThumb({
  image,
  isMain,
  onRemove,
  onEditCrop,
}: {
  image: ImageItem;
  isMain: boolean;
  onRemove: () => void;
  onEditCrop: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 1 : undefined };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative aspect-square overflow-hidden rounded-lg border border-border bg-muted/40",
        isDragging && "opacity-60",
      )}
    >
      {image.uploading ? (
        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Uploading...</div>
      ) : (
        <AssetImage src={image.url} alt={image.altText} fill sizes="200px" focalX={image.focalX} focalY={image.focalY} zoom={image.zoom} />
      )}
      {isMain && !image.uploading ? (
        <span className="absolute left-1 top-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
          Main
        </span>
      ) : null}
      {!image.uploading ? (
        <button
          type="button"
          onClick={onEditCrop}
          aria-label="Position this photo"
          className="absolute bottom-1 left-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold text-white"
        >
          Position
        </button>
      ) : null}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs font-semibold text-white"
      >
        ×
      </button>
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="absolute bottom-1 right-1 flex size-6 cursor-grab touch-none items-center justify-center rounded-full bg-black/60 text-white active:cursor-grabbing"
      >
        <GripVertical size={14} />
      </button>
    </div>
  );
}

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
  const dragSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const [step, setStep] = useState(0);
  const [name, setName] = useState(initialValues?.name ?? "");
  const [category, setCategory] = useState(initialValues?.category ?? "");
  const [subcategory, setSubcategory] = useState(initialValues?.subcategory ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [images, setImages] = useState<ImageItem[]>(
    (initialValues?.images ?? []).map((img) => ({
      ...img,
      uploading: false,
      focalX: img.focalX ?? 0.5,
      focalY: img.focalY ?? 0.5,
      zoom: img.zoom ?? 1,
    })),
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
  const [cropImageId, setCropImageId] = useState<string | null>(null);
  const cropImage = images.find((img) => img.id === cropImageId) ?? null;
  const [error, setError] = useState<string | null>(null);

  async function handleImageSelect(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList).slice(0, 10 - images.length);
    for (const file of files) {
      const id = newId();
      setImages((prev) => [...prev, { id, url: "", altText: file.name, uploading: true, focalX: 0.5, focalY: 0.5, zoom: 1 }]);
      try {
        const { url } = await uploadFile(file);
        setImages((prev) => prev.map((img) => (img.id === id ? { ...img, url, uploading: false } : img)));
      } catch (err) {
        setImages((prev) => prev.filter((img) => img.id !== id));
        setError(err instanceof Error ? err.message : "Image upload failed");
      }
    }
  }

  function handleImageDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setImages((prev) => {
      const oldIndex = prev.findIndex((img) => img.id === active.id);
      const newIndex = prev.findIndex((img) => img.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
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

  function updateDocument(docId: string, patch: Partial<DocumentItem>) {
    setDocuments((prev) => prev.map((d) => (d.id === docId ? { ...d, ...patch } : d)));
  }

  function removeDocument(docId: string) {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    setClaimCertificateLinks((prev) => {
      const next: Record<string, string[]> = {};
      for (const [claimId, docIds] of Object.entries(prev)) {
        next[claimId] = docIds.filter((id) => id !== docId);
      }
      return next;
    });
  }

  function linkDocToClaim(claimId: string, docId: string) {
    setClaimCertificateLinks((prev) => ({ ...prev, [claimId]: [...(prev[claimId] ?? []), docId] }));
  }

  function unlinkDocFromClaim(claimId: string, docId: string) {
    setClaimCertificateLinks((prev) => ({ ...prev, [claimId]: (prev[claimId] ?? []).filter((id) => id !== docId) }));
  }

  function addDocumentToClaim(claimId: string) {
    const doc = blankDocument();
    setDocuments((prev) => [...prev, doc]);
    linkDocToClaim(claimId, doc.id);
  }

  function addUnlinkedDocument() {
    setDocuments((prev) => [...prev, blankDocument()]);
  }

  /** The first claim (in order) a document is linked to — where its full editable form renders. */
  function primaryClaimIndexFor(docId: string): number {
    return claims.findIndex((c) => (claimCertificateLinks[c.id] ?? []).includes(docId));
  }

  function validateStep(index: number): string | null {
    if (index === 0) {
      if (!name.trim()) return "Product name is required.";
      if (!category.trim()) return "Category is required.";
      if (images.some((img) => img.uploading)) return "Please wait for photo uploads to finish.";
      if (images.filter((img) => img.url).length === 0) return "At least one product photo is required.";
    }
    if (index === 1) {
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
      images: readyImages.map((img) => ({ url: img.url, altText: img.altText, focalX: img.focalX, focalY: img.focalY, zoom: img.zoom })),
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
              <>
                <p className="mt-3 text-xs text-muted-foreground">Drag a photo by its handle to reorder — the first one is used as the main image.</p>
                <DndContext sensors={dragSensors} collisionDetection={closestCenter} onDragEnd={handleImageDragEnd}>
                  <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
                    <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-5">
                      {images.map((image, index) => (
                        <SortableImageThumb
                          key={image.id}
                          image={image}
                          isMain={index === 0}
                          onRemove={() => setImages((prev) => prev.filter((img) => img.id !== image.id))}
                          onEditCrop={() => setCropImageId(image.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </>
            ) : null}
          </div>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card className="p-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Add each claim you want to make about this product (e.g. &quot;Organic&quot;, &quot;Cruelty Free&quot;), then
            attach the documents that support it directly below — upload a new one or link something you&apos;ve
            already added elsewhere. TruOrigin reviews each claim against its attached evidence during review.
          </p>
          <div className="mt-5 grid gap-5">
            {claims.map((claim, claimIndex) => {
              const linkedIds = claimCertificateLinks[claim.id] ?? [];
              const ownDocs = documents.filter((d) => linkedIds.includes(d.id) && primaryClaimIndexFor(d.id) === claimIndex);
              const alsoLinkedDocs = documents.filter((d) => linkedIds.includes(d.id) && primaryClaimIndexFor(d.id) !== claimIndex);
              const linkableDocs = documents.filter((d) => !linkedIds.includes(d.id));

              return (
                <div key={claim.id} className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="grid gap-3 md:grid-cols-[1fr_1.4fr_auto]">
                    <input
                      value={claim.label}
                      onChange={(event) => setClaims((prev) => prev.map((c) => (c.id === claim.id ? { ...c, label: event.target.value } : c)))}
                      placeholder="Claim (e.g. Organic)"
                      className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
                    />
                    <input
                      value={claim.evidence}
                      onChange={(event) => setClaims((prev) => prev.map((c) => (c.id === claim.id ? { ...c, evidence: event.target.value } : c)))}
                      placeholder="Evidence note (shown if no documents are linked)"
                      className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
                    />
                    <Button type="button" variant="outline" onClick={() => setClaims((prev) => prev.filter((c) => c.id !== claim.id))}>
                      Remove
                    </Button>
                  </div>

                  <div className="mt-4 grid gap-3 border-t border-border pt-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Supporting documents</p>

                    {ownDocs.map((doc) => (
                      <DocumentFields
                        key={doc.id}
                        doc={doc}
                        onChange={(patch) => updateDocument(doc.id, patch)}
                        onFileSelect={(file) => handleDocumentFileSelect(doc.id, file)}
                        onRemove={() => removeDocument(doc.id)}
                      />
                    ))}

                    {alsoLinkedDocs.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {alsoLinkedDocs.map((doc) => (
                          <Badge key={doc.id} variant="outline" className="gap-1.5 pr-1">
                            {doc.title || doc.docType}
                            <button
                              type="button"
                              onClick={() => unlinkDocFromClaim(claim.id, doc.id)}
                              aria-label={`Unlink ${doc.title || doc.docType} from this claim`}
                              className="rounded-full p-0.5 hover:bg-muted"
                            >
                              <X size={10} />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => addDocumentToClaim(claim.id)}>
                        + Upload New Document
                      </Button>
                    </div>

                    {linkableDocs.length > 0 ? (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-xs font-semibold text-primary">Link an existing document</summary>
                        <div className="mt-2 grid gap-1.5">
                          {linkableDocs.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-1.5 text-sm">
                              <span>{doc.title || doc.docType}</span>
                              <Button type="button" variant="outline" size="sm" onClick={() => linkDocToClaim(claim.id, doc.id)}>
                                Link
                              </Button>
                            </div>
                          ))}
                        </div>
                      </details>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
          <Button type="button" variant="outline" className="mt-3" onClick={() => setClaims((prev) => [...prev, { id: newId(), label: "", evidence: "" }])}>
            Add Claim
          </Button>

          <div className="mt-8 border-t border-border pt-6">
            <p className="text-sm font-semibold text-foreground">Other documents</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Anything not tied to a specific claim yet — a general sourcing certificate, for instance.
            </p>
            <div className="mt-4 grid gap-4">
              {documents
                .filter((doc) => !Object.values(claimCertificateLinks).some((ids) => ids.includes(doc.id)))
                .map((doc) => (
                  <DocumentFields
                    key={doc.id}
                    doc={doc}
                    onChange={(patch) => updateDocument(doc.id, patch)}
                    onFileSelect={(file) => handleDocumentFileSelect(doc.id, file)}
                    onRemove={() => removeDocument(doc.id)}
                  />
                ))}
            </div>
            <Button type="button" variant="outline" className="mt-3" onClick={addUnlinkedDocument}>
              + Add Document
            </Button>
          </div>
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
          {mode === "edit" && initialValues?.status && initialValues.status !== "DRAFT" ? (
            <div className="mt-3 rounded-lg bg-warning-bg px-4 py-3 text-sm leading-relaxed text-warning">
              {initialValues.status === "APPROVED"
                ? "This product is currently live. Saving these changes will take it offline until TruOrigin reviews them again."
                : "This product is currently pending review. Saving these changes restarts that review."}
            </div>
          ) : null}
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

      {cropImage ? (
        <ImageCropDialog
          open
          onOpenChange={(open) => {
            if (!open) setCropImageId(null);
          }}
          imageUrl={cropImage.url}
          initialZoom={cropImage.zoom}
          onSave={({ focalX, focalY, zoom }) =>
            setImages((prev) => prev.map((img) => (img.id === cropImage.id ? { ...img, focalX, focalY, zoom } : img)))
          }
        />
      ) : null}
    </div>
  );
}
