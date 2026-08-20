import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  return verifySessionToken(token);
}

/** Cached per-request: a layout + one of its pages both calling this only hits the DB once. */
export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.sub },
    include: { brand: true },
  });
});

/** Guards admin `page.tsx` server components — redirects if the caller isn't an active ADMIN. */
export async function requireAdminUser() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN" || !user.active) {
    redirect("/admin/login");
  }
  return user;
}

/** Guards brand `page.tsx` server components — redirects if the caller isn't an active BRAND user on a non-suspended brand. */
export async function requireBrandUser() {
  const user = await getCurrentUser();
  if (!user || user.role !== "BRAND" || !user.brandId || !user.active || !user.brand || user.brand.status === "SUSPENDED") {
    redirect("/login");
  }
  return user;
}
