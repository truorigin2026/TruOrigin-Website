import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Distributed rate limiting, backed by Postgres (the RateLimitBucket model)
 * instead of a per-process in-memory Map. This app runs on Vercel's
 * serverless platform, where each invocation can land on an independent
 * instance with its own memory — an in-process counter only ever throttled
 * requests landing on the same warm instance, not the caller as a whole.
 * Every policy, threshold, and window below is unchanged from the previous
 * implementation; only the storage layer moved.
 */

// Never persist a caller's raw IP/email as the row's primary key — only a
// one-way hash of it. This bounds exposure if the table is ever dumped,
// leaked, or casually queried; it does not make the identifier
// cryptographically anonymous (IPs and known emails are both guessable),
// but it avoids storing plaintext PII that the feature doesn't need to see.
function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

// How a DB failure should be treated for this specific call: whether to
// fail OPEN (allow the request through, since this endpoint's rate limit
// exists only to reduce noise/abuse, not to gate a credential-guessing
// surface) or CLOSED (deny, since this endpoint protects authentication or
// a password reset/change and must never silently lose that protection
// just because the rate-limit store is briefly unreachable). Mandatory,
// not defaulted, so every call site states its own policy explicitly
// rather than inheriting an implicit choice that could be wrong for it.
export type RateLimitFailureMode = "fail-open" | "fail-closed";

// ~1 in 100 calls opportunistically sweeps rows whose window has already
// closed. This mirrors the old in-memory implementation's "only sweep when
// the map is large" opportunism, translated to a table: a random trigger
// avoids an extra COUNT query on every single call just to decide whether
// to clean up. Always fire-and-forget — cleanup latency or failure must
// never affect the request that happened to trigger it, and deleting an
// already-expired row can't race unsafely with a concurrent checkRateLimit
// upsert on the same key: Postgres's row locking serializes the two, and
// either ordering ends with the same correct state (a fresh row, or a new
// one created from scratch — both represent "a new window started now").
const CLEANUP_PROBABILITY = 0.01;

function sweepExpiredInBackground(now: Date) {
  if (Math.random() >= CLEANUP_PROBABILITY) return;
  prisma.rateLimitBucket
    .deleteMany({ where: { resetAt: { lte: now } } })
    .catch((error) => console.error("[rate-limit] background cleanup sweep failed:", error));
}

/**
 * Fixed-window counter: at most `limit` calls with the same `key` are
 * allowed within any `windowMs` window; the window resets `windowMs` after
 * the first call that starts it. Atomic under concurrency via a single
 * INSERT ... ON CONFLICT ... DO UPDATE statement — Postgres serializes
 * concurrent upserts on the same row, so two requests racing each other
 * can never both read a stale pre-increment count and both be let through
 * past the limit (the failure mode a separate read-then-write would have).
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  onDbError: RateLimitFailureMode,
): Promise<RateLimitResult> {
  const now = new Date();
  const freshResetAt = new Date(now.getTime() + windowMs);
  const storageKey = hashKey(key);

  try {
    const rows = await prisma.$queryRaw<{ count: number; resetAt: Date }[]>`
      INSERT INTO "RateLimitBucket" ("key", "count", "resetAt", "updatedAt")
      VALUES (${storageKey}, 1, ${freshResetAt}, ${now})
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "RateLimitBucket"."resetAt" <= ${now} THEN 1
          ELSE "RateLimitBucket"."count" + 1
        END,
        "resetAt" = CASE
          WHEN "RateLimitBucket"."resetAt" <= ${now} THEN ${freshResetAt}
          ELSE "RateLimitBucket"."resetAt"
        END,
        "updatedAt" = ${now}
      RETURNING "count", "resetAt";
    `;

    sweepExpiredInBackground(now);

    const row = rows[0];
    // The stored count isn't capped at `limit` — it keeps incrementing
    // under a sustained flood within one window, unlike the old
    // implementation, which pinned it. This changes nothing observable:
    // once count exceeds limit it stays above limit (monotonically
    // increasing) for the rest of the window, so every decision below is
    // identical to the old pin-at-limit behavior for every request, in
    // order. Capping it would need `limit` threaded into the CASE above
    // too, for no behavioral difference — simpler to leave it uncapped.
    const allowed = row.count <= limit;
    return {
      allowed,
      retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil((row.resetAt.getTime() - now.getTime()) / 1000)),
    };
  } catch (error) {
    console.error(`[rate-limit] DB error checking "${key}":`, error);
    if (onDbError === "fail-closed") {
      // The store itself is unreachable, so there's no real resetAt to
      // report — windowMs capped at 60s is a conservative, bounded
      // Retry-After; the client just retries shortly rather than being
      // told to wait out a full (possibly much longer) window.
      return { allowed: false, retryAfterSeconds: Math.min(60, Math.ceil(windowMs / 1000)) };
    }
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

export function getClientIp(request: NextRequest): string {
  // Per Vercel's own docs, Vercel's edge sets x-forwarded-for itself and
  // overwrites/strips a client-supplied value when nothing else sits in
  // front of it — but that guarantee is specific to that exact header
  // name. x-vercel-forwarded-for is Vercel's own unambiguous duplicate of
  // the same value, so prefer it: if this app is ever placed behind
  // another CDN/WAF in front of Vercel, an attacker-supplied leftmost
  // x-forwarded-for entry from that upstream hop can't be mistaken for it.
  const vercelForwardedFor = request.headers.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) return vercelForwardedFor.split(",")[0].trim();

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  return request.headers.get("x-real-ip") ?? "unknown";
}

export function rateLimitResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}
