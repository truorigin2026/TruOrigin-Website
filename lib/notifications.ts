/**
 * Brand Notifications
 * ----------------------------------------------------------------------
 * No Notification model exists — nothing in the schema tracks read/unread
 * state for anything. This synthesizes a feed on read instead: recent
 * brand-relevant AuditLog rows plus live "needs attention" queries.
 * AuditLog has no brandId column, so brand-relevant rows are found by
 * pre-fetching the brand's own product/claim/originCard IDs and matching
 * on targetId.
 */

import { prisma } from "@/lib/prisma";

export type AttentionItem = {
  id: string;
  message: string;
  detail: string;
  href: string;
};

export type ActivityItem = {
  id: string;
  message: string;
  detail: string;
  createdAt: Date;
};

const EXPIRY_WARNING_DAYS = 14;

export async function getNeedsAttention(brandId: string): Promise<AttentionItem[]> {
  const soon = new Date();
  soon.setDate(soon.getDate() + EXPIRY_WARNING_DAYS);

  const [expiringCertificates, claimsMissingEvidence, unpublishedCards, rejectedProducts] = await Promise.all([
    prisma.certificate.findMany({
      where: { product: { brandId }, expiresAt: { not: null, lte: soon, gte: new Date() } },
      include: { product: true },
      take: 10,
    }),
    prisma.claim.findMany({
      where: {
        product: { brandId, status: { in: ["DRAFT", "SUBMITTED", "IN_REVIEW"] } },
        OR: [{ evidence: null }, { evidence: "" }],
      },
      include: { product: true },
      take: 10,
    }),
    prisma.originCard.findMany({
      where: { product: { brandId }, status: "DRAFT" },
      include: { product: true },
      take: 10,
    }),
    prisma.product.findMany({
      where: { brandId, status: "REJECTED" },
      take: 10,
    }),
  ]);

  const items: AttentionItem[] = [];

  for (const cert of expiringCertificates) {
    const days = Math.ceil((cert.expiresAt!.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    items.push({
      id: `cert-${cert.id}`,
      message: `Certificate expires in ${days} day${days === 1 ? "" : "s"}`,
      detail: `${cert.title} • ${cert.product.name}`,
      href: `/brand/documents`,
    });
  }

  for (const claim of claimsMissingEvidence) {
    items.push({
      id: `claim-${claim.id}`,
      message: "Product claim missing supporting evidence",
      detail: `${claim.label} • ${claim.product.name}`,
      href: `/brand/products/${claim.productId}`,
    });
  }

  for (const card of unpublishedCards) {
    items.push({
      id: `card-${card.id}`,
      message: "OriginCard generated, pending publish",
      detail: card.product.name,
      href: `/brand/origincards/${card.id}`,
    });
  }

  for (const product of rejectedProducts) {
    items.push({
      id: `rejected-${product.id}`,
      message: "Product rejected — needs your attention",
      detail: product.rejectionNote ? `${product.name}: ${product.rejectionNote}` : product.name,
      href: `/brand/products/${product.id}/edit`,
    });
  }

  return items;
}

export async function getRecentActivity(brandId: string, limit = 10): Promise<ActivityItem[]> {
  const products = await prisma.product.findMany({ where: { brandId }, select: { id: true } });
  const productIds = products.map((p) => p.id);

  if (productIds.length === 0) return [];

  const logs = await prisma.auditLog.findMany({
    where: { targetType: "Product", targetId: { in: productIds } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const ACTION_LABELS: Record<string, string> = {
    "product.submit": "Product submitted for verification",
    "product.approve": "Product approved",
    "product.reject": "Product rejected",
    "product.edit": "Product updated",
    "product.resubmit": "Product resubmitted for verification",
  };

  return logs.map((log) => ({
    id: log.id,
    message: ACTION_LABELS[log.action] ?? log.action,
    detail: log.targetLabel ?? "",
    createdAt: log.createdAt,
  }));
}
