/**
 * Invoice Number Generation
 * ----------------------------------------------------------------------
 * Format: INV-2026-000001
 */

import { prisma } from "./prisma";

const PREFIX = "INV";

export function previewInvoiceNumber(runningNumber: number, year = new Date().getFullYear()) {
  return `${PREFIX}-${year}-${String(runningNumber).padStart(6, "0")}`;
}

export async function nextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();

  return prisma.$transaction(async (tx) => {
    const countThisYear = await tx.invoice.count({
      where: {
        invoiceNumber: { startsWith: `${PREFIX}-${year}-` },
      },
    });

    return previewInvoiceNumber(countThisYear + 1, year);
  });
}
