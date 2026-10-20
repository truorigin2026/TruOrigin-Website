/**
 * Decides whether a Postgres connection string's TLS requirement can be
 * safely relaxed. Split out from lib/prisma.ts (which instantiates a real
 * PrismaClient on import) so this pure logic can be unit tested in
 * isolation, with no database connection involved.
 */

const LOOPBACK_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1", "[::1]", "0.0.0.0"]);

/**
 * True only for a connection string whose host is a loopback address.
 * Fails closed: an unparseable URL returns false (never silently loosens
 * a connection whose target we failed to identify), and nothing that
 * resolves to a real deployment (Supabase or otherwise) is ever reachable
 * via one of these literal loopback hostnames, so this can't misclassify
 * a real database as local.
 */
export function isLoopbackHost(url: string): boolean {
  try {
    // `postgresql://` isn't one of the URL spec's "special schemes"
    // (http/https/ws/wss/ftp/file), so unlike those, its host is NOT
    // automatically lowercased by the parser — caught by a test using
    // "LOCALHOST", which came back as the literal, unlowercased string.
    const hostname = new URL(url).hostname.toLowerCase();
    return LOOPBACK_HOSTNAMES.has(hostname);
  } catch {
    return false;
  }
}

/** The ssl option to pass to the pg/Prisma adapter for a given connection string. */
export function resolveSslConfig(url: string): false | { rejectUnauthorized: true } {
  return isLoopbackHost(url) ? false : { rejectUnauthorized: true };
}
