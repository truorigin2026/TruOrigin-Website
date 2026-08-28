import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { isStrongPassword, normalizeEmail, PASSWORD_REQUIREMENTS_MESSAGE, slugify } from "@/lib/auth";

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

  const result = await prisma.$transaction(async (tx) => {
    const brand = await tx.brand.create({
      data: {
        name: brandName,
        slug: brandSlug,
        summary: `${brandName} brand workspace on TruOrigin`,
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
