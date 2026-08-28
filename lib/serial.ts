/**
 * Serial Number Generation
 * ----------------------------------------------------------------------
 * Format: TRU + a running number, e.g. TRU101, TRU10101. Not zero-padded —
 * the number just grows with each product, no fixed width.
 */

import { prisma } from "./prisma";

const PREFIX = "TRU";

export function previewSerialNumber(runningNumber: number) {
  return `${PREFIX}${runningNumber}`;
}

export async function nextSerialNumber(): Promise<string> {
  return prisma.$transaction(async (tx) => {
    const count = await tx.product.count({
      where: {
        serialNumber: { startsWith: PREFIX },
      },
    });

    return previewSerialNumber(count + 1);
  });
}
