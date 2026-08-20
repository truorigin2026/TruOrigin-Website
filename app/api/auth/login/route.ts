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

const ADMIN_EMAIL = normalizeEmail(process.env.ADMIN_EMAIL ?? "");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
// Hashed once at module load so the comparison below is timing-safe (bcrypt.compare)
// instead of a plaintext `!==`, without changing how ADMIN_PASSWORD is provisioned.
const ADMIN_PASSWORD_HASH = ADMIN_PASSWORD ? bcrypt.hashSync(ADMIN_PASSWORD, 12) : null;

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

  if (ADMIN_EMAIL && email === ADMIN_EMAIL) {
    const adminPasswordMatches = ADMIN_PASSWORD_HASH ? await bcrypt.compare(password, ADMIN_PASSWORD_HASH) : false;
    if (!adminPasswordMatches) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const adminPasswordHash = await bcrypt.hash(password, 10);
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
      return NextResponse.json({ error: "This account has been suspended." }, { status: 403 });
    }

    await prisma.user.update({ where: { id: adminUser.id }, data: { lastLoginAt: new Date() } });

    const token = await signSession({
      sub: adminUser.id,
      email: adminUser.email,
      role: "ADMIN",
    });

    const response = NextResponse.json({
      ok: true,
      redirectTo: roleHomePath("ADMIN"),
    });
    response.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
    return response;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { brand: true },
  });

  if (!user || (user.role !== "BRAND" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  if (!user.active) {
    return NextResponse.json({ error: "This account has been suspended." }, { status: 403 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const token = await signSession(
    user.role === "ADMIN"
      ? { sub: user.id, email: user.email, role: "ADMIN" }
      : {
          sub: user.id,
          email: user.email,
          role: "BRAND",
          brandId: user.brandId,
          brandSlug: user.brand?.slug ?? null,
          brandName: user.brand?.name ?? null,
          mustChangePassword: user.mustChangePassword,
        },
  );

  const response = NextResponse.json({
    ok: true,
    redirectTo: roleHomePath(user.role),
  });
  response.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
  return response;
}
