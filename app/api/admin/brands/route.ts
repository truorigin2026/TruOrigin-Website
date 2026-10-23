import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { isStrongPassword, normalizeEmail, PASSWORD_REQUIREMENTS_MESSAGE, slugify } from "@/lib/auth";
import { isBrandNumberConflict, nextBrandNumberGuess } from "@/lib/serial";

async function uniqueBrandSlug(baseSlug: string) {
  const seed = baseSlug || "brand";
  let candidate = seed;
  let counter = 2;

  while (await prisma.brand.findUnique({ where: { slug: candidate } })) {
    candidate = `${seed}-${counter}`;
    counter += 1;
  }

  return candidate;
}

export async function POST(request: NextRequest) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { brandName?: string; email?: string; password?: string }
    | null;

  const brandName = body?.brandName?.trim() ?? "";
  const email = normalizeEmail(body?.email ?? "");
  const password = body?.password ?? "";

  if (!brandName || !email || !isStrongPassword(password)) {
    return NextResponse.json(
      { error: `Brand name, email, and a password are required. ${PASSWORD_REQUIREMENTS_MESSAGE}` },
      { status: 400 },
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
  }

  const brandSlug = await uniqueBrandSlug(slugify(brandName));
  const passwordHash = await bcrypt.hash(password, 12);

  // brandNumber is assigned via MAX+1 and retried on a unique-constraint
  // collision (same spirit as this codebase's existing slug-retry pattern
  // in lib/product-submission.ts) rather than a dedicated atomic counter —
  // brand creation is a rare, deliberate, admin-only action, not a
  // concurrent hot path, so a short retry loop is proportionate.
  const maxAttempts = 5;
  let result: { brand: { id: string; name: string }; user: { id: string; email: string } } | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const brandNumber = await nextBrandNumberGuess();
    try {
      result = await prisma.$transaction(async (tx) => {
        const brand = await tx.brand.create({
          data: {
            name: brandName,
            slug: brandSlug,
            summary: `${brandName} brand workspace on TruOrigin`,
            brandNumber,
          },
        });

        const user = await tx.user.create({
          data: {
            email,
            passwordHash,
            role: "BRAND",
            brand: { connect: { id: brand.id } },
            brandRole: "OWNER",
            mustChangePassword: true,
          },
        });

        return { brand, user };
      });
      break;
    } catch (error) {
      if (isBrandNumberConflict(error) && attempt < maxAttempts - 1) continue;
      console.error("[POST /api/admin/brands]", error);
      return NextResponse.json({ error: "Could not create brand. Please try again." }, { status: 500 });
    }
  }

  if (!result) {
    return NextResponse.json({ error: "Could not assign a brand number. Please try again." }, { status: 500 });
  }

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.BRAND_CREATE,
    targetType: "Brand",
    targetId: result.brand.id,
    targetLabel: result.brand.name,
    request,
  });

  return NextResponse.json({ ok: true, brand: { id: result.brand.id, name: result.brand.name }, user: { id: result.user.id, email: result.user.email } });
}
