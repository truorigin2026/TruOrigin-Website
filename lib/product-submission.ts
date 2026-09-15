/**
 * Shared write logic for brand product submission (create + edit).
 * ----------------------------------------------------------------------
 * Certificates and claims arrive from the wizard as two arrays that may
 * reference each other via wizard-local ids (claim.linkedDocumentIds
 * pointing at a certificate's localId) — neither side has a real
 * database id yet. Certificates are created first so their real ids can
 * be resolved, then claims are created with `connect` to those ids.
 */
import type { Prisma } from "../generated/prisma/client";

export type CertificateInput = {
  localId?: string;
  title: string;
  fileUrl: string;
  docType: string;
  mimeType?: string;
  issuer?: string;
  testDate?: string;
  testType?: string;
  testScope?: string;
  reviewNote?: string;
  isPublic?: boolean;
};

export type ClaimInput = {
  label: string;
  evidence?: string;
  linkedDocumentIds?: string[];
};

function clamp(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

export async function createCertificatesAndClaims(
  tx: Prisma.TransactionClient,
  productId: string,
  certificates: CertificateInput[],
  claims: ClaimInput[],
) {
  const createdCertificates = await Promise.all(
    certificates.map((cert) =>
      tx.certificate.create({
        data: {
          productId,
          title: clamp(cert.title, 300),
          fileUrl: cert.fileUrl,
          docType: cert.docType as never,
          mimeType: cert.mimeType || null,
          issuer: cert.issuer?.trim() ? clamp(cert.issuer, 200) : null,
          testDate: cert.testDate ? new Date(cert.testDate) : null,
          testType: cert.testType?.trim() ? clamp(cert.testType, 200) : null,
          testScope: cert.testScope?.trim() ? clamp(cert.testScope, 300) : null,
          reviewNote: cert.reviewNote?.trim() ? clamp(cert.reviewNote, 2000) : null,
          isPublic: cert.isPublic ?? true,
        },
      }),
    ),
  );

  const localIdToRealId = new Map<string, string>();
  certificates.forEach((cert, index) => {
    if (cert.localId) localIdToRealId.set(cert.localId, createdCertificates[index].id);
  });

  await Promise.all(
    claims.map((claim) => {
      const linkedIds = (claim.linkedDocumentIds ?? [])
        .map((localId) => localIdToRealId.get(localId))
        .filter((id): id is string => Boolean(id));

      return tx.claim.create({
        data: {
          productId,
          label: clamp(claim.label, 300),
          evidence: claim.evidence?.trim() ? clamp(claim.evidence, 2000) : null,
          ...(linkedIds.length > 0 ? { certificates: { connect: linkedIds.map((id) => ({ id })) } } : {}),
        },
      });
    }),
  );
}
