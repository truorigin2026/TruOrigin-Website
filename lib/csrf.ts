import { NextRequest } from "next/server";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Lightweight CSRF defense: mutating requests must carry a matching Origin (or Referer) header. */
export function isSameOriginRequest(request: NextRequest): boolean {
  if (!MUTATING_METHODS.has(request.method)) return true;

  const origin = request.headers.get("origin");
  if (origin) {
    return origin === request.nextUrl.origin;
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin === request.nextUrl.origin;
    } catch {
      return false;
    }
  }

  return false;
}
