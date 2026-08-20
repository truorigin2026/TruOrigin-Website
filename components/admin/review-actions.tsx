"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApiAction } from "@/components/dashboard/use-api-action";

type ClaimStatus = "VERIFIED" | "PARTIALLY_VERIFIED" | "UNVERIFIED" | "REJECTED";

type ReviewClaim = {
  id: string;
  label: string;
  status: ClaimStatus;
  evidence: string | null;
};

type ReviewProduct = {
  id: string;
  name: string;
  status: string;
  brandName: string;
  categoryName: string;
  serialNumber: string | null;
  rejectionNote: string | null;
  claims: ReviewClaim[];
};

export function ReviewActions({ product }: { product: ReviewProduct }) {
  const { run, busy, isBusy } = useApiAction();
  const [note, setNote] = useState(product.rejectionNote ?? "");

  function approveProduct() {
    run("product-approve", `/api/admin/products/${product.id}/decision`, { decision: "APPROVE" }, { successMessage: "Product approved." });
  }
  function denyProduct() {
    run("product-deny", `/api/admin/products/${product.id}/decision`, { decision: "REJECT", note }, { successMessage: "Product rejected." });
  }
  function approveClaim(claimId: string) {
    run(`claim-approve-${claimId}`, `/api/admin/claims/${claimId}/decision`, { decision: "APPROVE" }, { successMessage: "Claim approved." });
  }
  function denyClaim(claimId: string) {
    run(`claim-deny-${claimId}`, `/api/admin/claims/${claimId}/decision`, { decision: "DENY", note }, { successMessage: "Claim denied." });
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <p className="text-sm font-semibold text-foreground">Product decision</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Approve when the product record is ready to publish. Reject if the submission needs brand changes.
        </p>
        <label className="grid gap-1.5 text-sm font-medium">
          <span>Rejection note</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
          />
        </label>
        <div className="flex flex-wrap gap-2.5">
          <Button onClick={approveProduct} disabled={busy !== null}>
            {isBusy("product-approve") ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            Approve Product
          </Button>
          <Button variant="outline" onClick={denyProduct} disabled={busy !== null}>
            {isBusy("product-deny") ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
            Deny Product
          </Button>
        </div>
      </div>

      <div className="grid gap-3 border-t border-border pt-6">
        <p className="text-sm font-semibold text-foreground">Claim Review</p>
        {product.claims.map((claim) => (
          <div key={claim.id} className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{claim.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{claim.evidence || "No evidence note added yet."}</p>
              </div>
              <Badge variant="outline">{claim.status.replaceAll("_", " ").toLowerCase()}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2.5">
              <Button size="sm" onClick={() => approveClaim(claim.id)} disabled={busy !== null}>
                {isBusy(`claim-approve-${claim.id}`) ? <Loader2 size={14} className="animate-spin" /> : null}
                Approve Claim
              </Button>
              <Button variant="outline" size="sm" onClick={() => denyClaim(claim.id)} disabled={busy !== null}>
                {isBusy(`claim-deny-${claim.id}`) ? <Loader2 size={14} className="animate-spin" /> : null}
                Deny Claim
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
