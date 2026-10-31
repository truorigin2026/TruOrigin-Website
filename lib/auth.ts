import { SignJWT, jwtVerify } from "jose";
import { createHash, randomBytes } from "crypto";

export const SESSION_COOKIE_NAME = "truorigin_session";
const TOKEN_TTL = "7d";
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export type SessionRole = "ADMIN" | "BRAND";

export type SessionPayload = {
  sub: string;
  email: string;
  role: SessionRole;
  brandId?: string | null;
  brandSlug?: string | null;
  brandName?: string | null;
  mustChangePassword?: boolean;
  // Revocation epoch, copied from User.sessionVersion at sign time (see
  // the Prisma schema comment). Required here -- every call site must
  // supply the account's CURRENT value, not an arbitrary one -- so
  // TypeScript catches any sign-in path that forgets to. A token decoded
  // from before this field existed simply won't have it in its payload;
  // isSessionRevoked() below treats that as 0.
  sessionVersion: number;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET in environment");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * The single shared comparison every DB-backed session guard uses
 * (getCurrentUser, requireAdminSession, requireBrandSession) -- a token
 * is revoked once its own sessionVersion claim no longer matches the
 * account's current one. `tokenSessionVersion` is read from a decoded
 * JWT payload at runtime, not type-checked, so a pre-rollout token that
 * never had this claim at all comes through as `undefined` here; it's
 * treated as 0, the same default the sessionVersion column itself
 * starts every existing user at, so a legacy token stays valid exactly
 * until that user's first revocation event after this ships -- never
 * retroactively broken, never exempt from a future one.
 */
export function isSessionRevoked(tokenSessionVersion: number | undefined, currentSessionVersion: number): boolean {
  return (tokenSessionVersion ?? 0) !== currentSessionVersion;
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 7,
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isAdminRole(role: string | undefined | null) {
  return role === "ADMIN";
}

export function isBrandRole(role: string | undefined | null) {
  return role === "BRAND";
}

export function roleHomePath(role: SessionRole) {
  return role === "ADMIN" ? "/admin" : "/account";
}

export const PASSWORD_REQUIREMENTS_MESSAGE =
  "Password must be at least 12 characters and include a letter and a number.";

export function isStrongPassword(password: string): boolean {
  return password.length >= 12 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
}

export function createResetToken() {
  const token = randomBytes(32).toString("hex");
  return { token, tokenHash: hashResetToken(token) };
}

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
