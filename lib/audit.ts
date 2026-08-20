/**
 * Audit Logging
 * ----------------------------------------------------------------------
 * Every admin mutation calls logAudit() so there is a durable, queryable
 * record of who changed what and when. This is the accountability
 * mechanism in place of a granular permissions system.
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "../generated/prisma/client";

export const AUDIT_ACTIONS = {
  BRAND_CREATE: "brand.create",
  BRAND_APPROVE: "brand.approve",
  BRAND_SUSPEND: "brand.suspend",
  BRAND_REACTIVATE: "brand.reactivate",
  BRAND_DELETE: "brand.delete",
  BRAND_CONTACT: "brand.contact",

  PRODUCT_APPROVE: "product.approve",
  PRODUCT_REJECT: "product.reject",
  PRODUCT_HIDE: "product.hide",
  PRODUCT_UNHIDE: "product.unhide",
  PRODUCT_ARCHIVE: "product.archive",
  PRODUCT_UNARCHIVE: "product.unarchive",
  PRODUCT_DELETE: "product.delete",
  PRODUCT_SUBMIT: "product.submit",
  PRODUCT_EDIT: "product.edit",
  PRODUCT_RESUBMIT: "product.resubmit",

  CLAIM_APPROVE: "claim.approve",
  CLAIM_DENY: "claim.deny",

  DOCUMENT_UPLOAD: "document.upload",
  DOCUMENT_DELETE: "document.delete",

  ORIGINCARD_PUBLISH: "origincard.publish",
  ORIGINCARD_UNPUBLISH: "origincard.unpublish",
  ORIGINCARD_DUPLICATE: "origincard.duplicate",
  ORIGINCARD_ARCHIVE: "origincard.archive",
  ORIGINCARD_DELETE: "origincard.delete",
  ORIGINCARD_DEACTIVATE: "origincard.deactivate",
  ORIGINCARD_SELF_HEAL_GENERATE: "origincard.self_heal_generate",

  TEAM_INVITE: "team.invite",
  TEAM_STATUS_UPDATE: "team.status_update",
  TEAM_REMOVE: "team.remove",

  BRAND_PROFILE_UPDATE: "brand.profile_update",
  PASSWORD_CHANGE: "password.change",

  QR_GENERATE: "qr.generate",
  QR_REGENERATE: "qr.regenerate",
  QR_DOWNLOAD: "qr.download",

  DOCUMENT_DOWNLOAD: "document.download",

  PLAN_CREATE: "plan.create",
  PLAN_UPDATE: "plan.update",
  SUBSCRIPTION_UPDATE: "subscription.update",
  INVOICE_CREATE: "invoice.create",
  INVOICE_MARK_PAID: "invoice.mark_paid",
  INVOICE_MARK_FAILED: "invoice.mark_failed",

  TICKET_UPDATE: "ticket.update",

  CMS_CREATE: "cms.create",
  CMS_UPDATE: "cms.update",
  CMS_PUBLISH: "cms.publish",
  CMS_ARCHIVE: "cms.archive",
  CMS_DELETE: "cms.delete",

  ADMIN_USER_CREATE: "admin_user.create",
  ADMIN_USER_SUSPEND: "admin_user.suspend",
  ADMIN_USER_REACTIVATE: "admin_user.reactivate",
  USER_PASSWORD_RESET_SENT: "user.password_reset_sent",

  SETTINGS_UPDATE: "settings.update",
  SETTINGS_DELETE: "settings.delete",
  EMAIL_TEMPLATE_UPDATE: "email_template.update",
  API_KEY_CREATE: "api_key.create",
  API_KEY_REVOKE: "api_key.revoke",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export type AuditActor = {
  sub: string;
  email: string;
  role: string;
};

function ipFromRequest(request?: NextRequest): string | undefined {
  if (!request) return undefined;
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    undefined
  );
}

export async function logAudit(params: {
  actor: AuditActor;
  action: AuditAction;
  targetType: string;
  targetId: string;
  targetLabel?: string;
  metadata?: Record<string, unknown>;
  note?: string;
  request?: NextRequest;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId: params.actor.sub,
      actorEmail: params.actor.email,
      actorRole: params.actor.role,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      targetLabel: params.targetLabel,
      metadata: params.metadata as Prisma.InputJsonValue | undefined,
      note: params.note,
      ipAddress: ipFromRequest(params.request),
    },
  });
}
