/**
 * Serial Number Generation
 * ----------------------------------------------------------------------
 * Format: TO-2026-000001
 */

import { prisma } from "./prisma";

const PREFIX = "TO";

export function previewSerialNumber(runningNumber: number, year = new Date().getFullYear()) {
  return `${PREFIX}-${year}-${String(runningNumber).padStart(6, "0")}`;
}

export async function nextSerialNumber(): Promise<string> {
  const year = new Date().getFullYear();

  return prisma.$transaction(async (tx) => {
    const countThisYear = await tx.product.count({
      where: {
        serialNumber: { startsWith: `${PREFIX}-${year}-` },
      },
    });

    return previewSerialNumber(countThisYear + 1, year);
  });
}
