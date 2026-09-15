"use client";

import { useState } from "react";
import { Download, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApiAction } from "@/components/dashboard/use-api-action";

type Certificate = {
  id: string;
  title: string;
  issuer: string | null;
  docType: string;
  verified: boolean;
  reviewNote: string | null;
  isPublic: boolean;
  testDate: Date | null;
  testType: string | null;
  testScope: string | null;
};

export function CertificateReviewForm({ certificate }: { certificate: Certificate }) {
  const { run, isBusy } = useApiAction();
  const [verified, setVerified] = useState(certificate.verified);
  const [reviewNote, setReviewNote] = useState(certificate.reviewNote ?? "");
  const [isPublic, setIsPublic] = useState(certificate.isPublic);
  const [issuer, setIssuer] = useState(certificate.issuer ?? "");
  const [testDate, setTestDate] = useState(certificate.testDate ? certificate.testDate.toISOString().slice(0, 10) : "");
  const [testType, setTestType] = useState(certificate.testType ?? "");
  const [testScope, setTestScope] = useState(certificate.testScope ?? "");

  function save() {
    run(
      `cert-review-${certificate.id}`,
      `/api/admin/documents/${certificate.id}/review`,
      { verified, reviewNote, isPublic, issuer, testDate, testType, testScope },
      { method: "PATCH", successMessage: "Document review saved." },
    );
  }

  const busyKey = `cert-review-${certificate.id}`;

  return (
    <div className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{certificate.title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {certificate.docType.replaceAll("_", " ")}
            {certificate.issuer ? ` • ${certificate.issuer}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={verified ? "success" : "outline"}>{verified ? "Verified" : "Submitted"}</Badge>
          <Badge variant={isPublic ? "success" : "warning"}>{isPublic ? "Public" : "Private"}</Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            render={<a href={`/api/admin/documents/${certificate.id}/download`} target="_blank" rel="noreferrer" />}
            nativeButton={false}
          >
            <Download size={14} />
            Download
          </Button>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={verified} onChange={(event) => setVerified(event.target.checked)} />
        Mark as verified
      </label>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} />
        Public — customers can view/download the original file
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">
          <span>Testing organization</span>
          <input
            value={issuer}
            onChange={(event) => setIssuer(event.target.value)}
            className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          <span>Test date</span>
          <input
            type="date"
            value={testDate}
            onChange={(event) => setTestDate(event.target.value)}
            className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          <span>Test type</span>
          <input
            value={testType}
            onChange={(event) => setTestType(event.target.value)}
            className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          <span>Test scope</span>
          <input
            value={testScope}
            onChange={(event) => setTestScope(event.target.value)}
            className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
          />
        </label>
      </div>

      <label className="grid gap-1.5 text-sm font-medium">
        <span>Summary (customer-facing)</span>
        <textarea
          value={reviewNote}
          onChange={(event) => setReviewNote(event.target.value)}
          rows={2}
          placeholder="Plain-language summary shown on the public product page."
          className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
        />
      </label>

      <Button size="sm" className="justify-self-start" onClick={save} disabled={isBusy(busyKey)}>
        {isBusy(busyKey) ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        Save Review
      </Button>
    </div>
  );
}
