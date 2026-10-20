import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  normalizeEmail,
  roleHomePath,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  signSession,
} from "@/lib/auth";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { padToMinimumDuration } from "@/lib/timing";

const ADMIN_EMAIL = normalizeEmail(process.env.ADMIN_EMAIL ?? "");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
// Hashed once at module load so the comparison below is timing-safe (bcrypt.compare)
// instead of a plaintext `!==`, without changing how ADMIN_PASSWORD is provisioned.
const ADMIN_PASSWORD_HASH = ADMIN_PASSWORD ? bcrypt.hashSync(ADMIN_PASSWORD, 12) : null;

// A bcrypt.compare at cost 12 typically runs ~100-300ms. Padding every
// response to at least this floor means "no such user" (which used to
// return near-instantly, skipping bcrypt entirely) and "wrong password"
// (which always ran bcrypt) take indistinguishable time from the outside.
const MIN_LOGIN_RESPONSE_MS = 400;

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(`login:${getClientIp(request)}`, 10, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

  const body = (await request.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;

  const email = normalizeEmail(body?.email ?? "");
  const password = body?.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const start = Date.now();

  if (ADMIN_EMAIL && email === ADMIN_EMAIL) {
    const adminPasswordMatches = ADMIN_PASSWORD_HASH ? await bcrypt.compare(password, ADMIN_PASSWORD_HASH) : false;
    if (!adminPasswordMatches) {
      await padToMinimumDuration(start, MIN_LOGIN_RESPONSE_MS);
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const adminPasswordHash = await bcrypt.hash(password, 12);
    const adminUser = await prisma.user.upsert({
      where: { email },
      update: {
        role: "ADMIN",
        passwordHash: adminPasswordHash,
      },
      create: {
        email,
        passwordHash: adminPasswordHash,
        role: "ADMIN",
      },
    });

    if (!adminUser.active) {
      await padToMinimumDuration(start, MIN_LOGIN_RESPONSE_MS);
      return NextResponse.json({ error: "This account has been suspended." }, { status: 403 });
    }

    await prisma.user.update({ where: { id: adminUser.id }, data: { lastLoginAt: new Date() } });

    const token = await signSession({
      sub: adminUser.id,
      email: adminUser.email,
      role: "ADMIN",
      tokenVersion: adminUser.tokenVersion,
    });

    const response = NextResponse.json({
      ok: true,
      redirectTo: roleHomePath("ADMIN"),
    });
    response.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
    await padToMinimumDuration(start, MIN_LOGIN_RESPONSE_MS);
    return response;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { brand: true },
  });

  if (!user || (user.role !== "BRAND" && user.role !== "ADMIN")) {
    // No real user to compare against — run a dummy bcrypt compare anyway
    // (against this module's own admin hash, never a real match for an
    // empty/mismatched email) so this branch cost the same as the "wrong
    // password" branch below, on top of the response-time floor.
    if (ADMIN_PASSWORD_HASH) await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    await padToMinimumDuration(start, MIN_LOGIN_RESPONSE_MS);
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    await padToMinimumDuration(start, MIN_LOGIN_RESPONSE_MS);
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  if (!user.active) {
    await padToMinimumDuration(start, MIN_LOGIN_RESPONSE_MS);
    return NextResponse.json({ error: "This account has been suspended." }, { status: 403 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const token = await signSession(
    user.role === "ADMIN"
      ? { sub: user.id, email: user.email, role: "ADMIN", tokenVersion: user.tokenVersion }
      : {
          sub: user.id,
          email: user.email,
          role: "BRAND",
          brandId: user.brandId,
          brandSlug: user.brand?.slug ?? null,
          brandName: user.brand?.name ?? null,
          mustChangePassword: user.mustChangePassword,
          tokenVersion: user.tokenVersion,
        },
  );

  const response = NextResponse.json({
    ok: true,
    redirectTo: roleHomePath(user.role),
  });
  response.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
  await padToMinimumDuration(start, MIN_LOGIN_RESPONSE_MS);
  return response;
}
