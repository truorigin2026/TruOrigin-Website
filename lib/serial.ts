/**
 * Serial Number Generation
 * ----------------------------------------------------------------------
 * Format: TRU + 4-digit brandNumber + 3-digit (auto-widening past 999)
 * per-brand product sequence, e.g. TRU1200045. brandNumber is assigned
 * once per brand — at creation (app/api/admin/brands/route.ts) for new
 * brands, or via a one-time backfill migration for brands that existed
 * before this scheme. productSequence increments atomically inside the
 * SAME transaction that writes a product's serialNumber (see
 * nextSerialNumberForBrand below), so two concurrent approvals for the
 * same brand can never compute the same number — unlike the previous
 * scheme, which read a global count in one transaction and wrote the
 * result in a separate, later one, leaving a real gap for two concurrent
 * approvals to collide.
 *
 * Already-issued serials from that previous scheme (TRU9, TRU10, ...)
 * are never touched or reissued — this only ever applies to a product
 * that doesn't have a serialNumber yet. Their shorter, unpadded format
 * can't collide with the new one: the new format is always at least 10
 * characters after "TRU" is added (4-digit brandNumber + 3-digit
 * sequence, brandNumber never below 1001), far longer than any serial
 * this platform has issued so far.
 */
import { Prisma } from "../generated/prisma/client";
import { prisma } from "./prisma";

const PREFIX = "TRU";
const BRAND_NUMBER_WIDTH = 4;
const PRODUCT_SEQUENCE_WIDTH = 3;
const BRAND_NUMBER_START = 1001;

function pad(value: number, width: number): string {
  const digits = String(value);
  return digits.length >= width ? digits : "0".repeat(width - digits.length) + digits;
}

/** Widens past 999 automatically (e.g. 1000 renders as "1000", not truncated) rather than erroring. */
export function formatSerialNumber(brandNumber: number, productSequence: number): string {
  return `${PREFIX}${pad(brandNumber, BRAND_NUMBER_WIDTH)}${pad(productSequence, PRODUCT_SEQUENCE_WIDTH)}`;
}

/**
 * Atomically reserves the next product sequence number for a brand and
 * returns the resulting serial number. Must be called with the SAME
 * transaction client that goes on to write the product's serialNumber —
 * `{ increment: 1 }` compiles to a single atomic SQL UPDATE, and Postgres
 * serializes concurrent updates to the same row, so two callers for the
 * same brand can never observe or reserve the same sequence number.
 */
export async function nextSerialNumberForBrand(tx: Prisma.TransactionClient, brandId: string): Promise<string> {
  const brand = await tx.brand.update({
    where: { id: brandId },
    data: { productSequence: { increment: 1 } },
    select: { brandNumber: true, productSequence: true },
  });

  if (brand.brandNumber == null) {
    throw new Error(`Brand ${brandId} has no brandNumber assigned yet — cannot generate a serial number.`);
  }

  return formatSerialNumber(brand.brandNumber, brand.productSequence);
}

/** MAX(brandNumber)+1 guess for a new brand — pairs with isBrandNumberConflict's retry-on-collision pattern. */
export async function nextBrandNumberGuess(): Promise<number> {
  const result = await prisma.brand.aggregate({ _max: { brandNumber: true } });
  return Math.max(result._max.brandNumber ?? 0, BRAND_NUMBER_START - 1) + 1;
}

export function isBrandNumberConflict(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    Array.isArray((error.meta as { target?: unknown })?.target) &&
    ((error.meta as { target?: unknown[] }).target ?? []).includes("brandNumber")
  );
}
