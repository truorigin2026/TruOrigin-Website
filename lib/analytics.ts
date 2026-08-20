/**
 * Scan Analytics
 * ----------------------------------------------------------------------
 * Records ScanEvent rows for the admin Analytics dashboard. Geo resolution
 * uses platform-provided edge headers (no geolocation SDK); device parsing
 * is a small hand-rolled regex parser to avoid adding a dependency.
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

type ScanEventType = "SCAN" | "VIEW" | "CLAIM_VIEW" | "CERTIFICATE_VIEW";

export function resolveGeoFromRequest(request?: NextRequest) {
  return {
    country: request?.headers.get("x-vercel-ip-country") ?? null,
    city: request?.headers.get("x-vercel-ip-city") ?? null,
  };
}

export function parseDevice(userAgent: string | null | undefined): { device: string; browser: string } {
  const ua = userAgent ?? "";

  let device = "Desktop";
  if (/tablet|ipad/i.test(ua)) {
    device = "Tablet";
  } else if (/mobile|iphone|android/i.test(ua)) {
    device = "Mobile";
  }

  let browser = "Other";
  if (/edg\//i.test(ua)) {
    browser = "Edge";
  } else if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) {
    browser = "Chrome";
  } else if (/firefox\//i.test(ua)) {
    browser = "Firefox";
  } else if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) {
    browser = "Safari";
  }

  return { device, browser };
}

export async function recordScanEvent(params: {
  productId: string;
  eventType?: ScanEventType;
  source?: string;
  claimId?: string;
  certificateId?: string;
  sessionId?: string;
  request?: NextRequest;
}): Promise<void> {
  const { country, city } = resolveGeoFromRequest(params.request);
  const { device, browser } = parseDevice(params.request?.headers.get("user-agent"));

  await prisma.scanEvent.create({
    data: {
      productId: params.productId,
      eventType: params.eventType ?? "SCAN",
      source: params.source,
      claimId: params.claimId,
      certificateId: params.certificateId,
      sessionId: params.sessionId,
      country,
      city,
      device,
      browser,
    },
  });
}

export async function recordViewDuration(params: { sessionId: string; productId: string; viewDurationMs: number }) {
  const event = await prisma.scanEvent.findFirst({
    where: { sessionId: params.sessionId, productId: params.productId, eventType: "VIEW" },
    orderBy: { createdAt: "desc" },
  });

  if (!event) return;

  await prisma.scanEvent.update({
    where: { id: event.id },
    data: { viewDurationMs: params.viewDurationMs },
  });
}

export type AnalyticsSummary = {
  totalScans: number;
  byCountry: { key: string; count: number }[];
  byCity: { key: string; count: number }[];
  byDevice: { key: string; count: number }[];
  mostViewedProducts: { productId: string; count: number }[];
  mostViewedClaims: { claimId: string; count: number }[];
  mostViewedCertificates: { certificateId: string; count: number }[];
  averageViewTimeMs: number | null;
};

/** Pass productIds to scope every query to one brand's products; omit for the platform-wide admin view. */
export async function getAnalyticsSummary(productIds?: string[]): Promise<AnalyticsSummary> {
  const productScope = productIds ? { productId: { in: productIds } } : {};

  const [totalScans, byCountryRaw, byCityRaw, byDeviceRaw, byProductRaw, byClaimRaw, byCertificateRaw, avgDuration] =
    await Promise.all([
      prisma.scanEvent.count({ where: { eventType: "SCAN", ...productScope } }),
      prisma.scanEvent.groupBy({ by: ["country"], _count: { _all: true }, where: { eventType: "SCAN", ...productScope } }),
      prisma.scanEvent.groupBy({ by: ["city"], _count: { _all: true }, where: { eventType: "SCAN", ...productScope } }),
      prisma.scanEvent.groupBy({ by: ["device"], _count: { _all: true }, where: { eventType: "SCAN", ...productScope } }),
      prisma.scanEvent.groupBy({ by: ["productId"], _count: { _all: true }, where: productScope }),
      prisma.scanEvent.groupBy({
        by: ["claimId"],
        _count: { _all: true },
        where: { eventType: "CLAIM_VIEW", claimId: { not: null }, ...productScope },
      }),
      prisma.scanEvent.groupBy({
        by: ["certificateId"],
        _count: { _all: true },
        where: { eventType: "CERTIFICATE_VIEW", certificateId: { not: null }, ...productScope },
      }),
      prisma.scanEvent.aggregate({ _avg: { viewDurationMs: true }, where: { viewDurationMs: { not: null }, ...productScope } }),
    ]);

  const bucket = (rows: { _count: { _all: number } }[], keyOf: (r: unknown) => string | null) =>
    rows
      .map((row) => ({ key: keyOf(row) ?? "Unknown", count: row._count._all }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

  return {
    totalScans,
    byCountry: bucket(byCountryRaw, (r) => (r as { country: string | null }).country),
    byCity: bucket(byCityRaw, (r) => (r as { city: string | null }).city),
    byDevice: bucket(byDeviceRaw, (r) => (r as { device: string | null }).device),
    mostViewedProducts: byProductRaw
      .map((r) => ({ productId: r.productId, count: r._count._all }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    mostViewedClaims: byClaimRaw
      .filter((r) => r.claimId)
      .map((r) => ({ claimId: r.claimId as string, count: r._count._all }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    mostViewedCertificates: byCertificateRaw
      .filter((r) => r.certificateId)
      .map((r) => ({ certificateId: r.certificateId as string, count: r._count._all }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    averageViewTimeMs: avgDuration._avg.viewDurationMs,
  };
}

export type DailyScanCount = { date: string; scans: number };

/**
 * Buckets SCAN events by day for the last N days. No native Prisma day-bucketing
 * on groupBy, so this is done in JS — fine at this data volume. Pass productIds
 * to scope to one brand's products; omit for the platform-wide admin view.
 */
export async function getDailyScanCounts(days = 30, productIds?: string[]): Promise<DailyScanCount[]> {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const events = await prisma.scanEvent.findMany({
    where: {
      eventType: "SCAN",
      createdAt: { gte: since },
      ...(productIds ? { productId: { in: productIds } } : {}),
    },
    select: { createdAt: true },
  });

  const counts = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const day = new Date(since);
    day.setDate(day.getDate() + i);
    counts.set(day.toISOString().slice(0, 10), 0);
  }

  for (const event of events) {
    const key = event.createdAt.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([date, scans]) => ({ date, scans }));
}
