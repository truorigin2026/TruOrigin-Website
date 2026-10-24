import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getNeedsAttention } from "@/lib/notifications";
import { MountFadeIn } from "@/components/motion";
import { ActivityList, ActivityRow } from "@/components/dashboard/activity-list";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "BRAND" || !user.brandId) {
    redirect("/login");
  }

  const [brand, totalProducts, liveProducts, pendingProducts, needsAttention] = await Promise.all([
    prisma.brand.findUnique({ where: { id: user.brandId } }),
    prisma.product.count({ where: { brandId: user.brandId } }),
    prisma.product.count({ where: { brandId: user.brandId, status: "APPROVED" } }),
    prisma.product.count({
      where: { brandId: user.brandId, status: { in: ["DRAFT", "SUBMITTED", "IN_REVIEW"] } },
    }),
    getNeedsAttention(user.brandId),
  ]);

  if (!brand) {
    redirect("/login");
  }

  const statusLabel =
    brand.status === "ACTIVE" ? "Approved" : brand.status === "SUSPENDED" ? "Suspended" : "Pending review";
  const statusVariant: BadgeVariant = brand.status === "ACTIVE" ? "success" : brand.status === "SUSPENDED" ? "destructive" : "warning";

  return (
    <div data-dashboard className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-10 md:px-8 md:py-16">
        <MountFadeIn className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold tracking-tight text-foreground">TruOrigin</p>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action="/api/auth/logout" method="post">
              <Button variant="ghost" size="sm" type="submit">
                <LogOut size={14} />
                Log out
              </Button>
            </form>
          </div>
        </MountFadeIn>

        <MountFadeIn delay={0.08} className="mt-10 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Brand Portal</p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Welcome back, {brand.name}
          </h1>
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono text-xs">{brand.slug}</span>
            <span aria-hidden>·</span>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </div>
        </MountFadeIn>

        <MountFadeIn delay={0.14} className="mt-10 grid grid-cols-3 divide-x divide-border rounded-xl border border-border py-6 text-center">
          <div>
            <p className="font-heading text-3xl font-bold text-foreground">{totalProducts}</p>
            <p className="mt-1 text-xs text-muted-foreground">Total products</p>
          </div>
          <div>
            <p className="font-heading text-3xl font-bold text-foreground">{liveProducts}</p>
            <p className="mt-1 text-xs text-muted-foreground">Live</p>
          </div>
          <div>
            <p className="font-heading text-3xl font-bold text-foreground">{pendingProducts}</p>
            <p className="mt-1 text-xs text-muted-foreground">Needs review</p>
          </div>
        </MountFadeIn>

        <MountFadeIn delay={0.2} className="mt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">What&apos;s next</p>
          <ActivityList>
            {needsAttention.slice(0, 2).map((item) => (
              <ActivityRow key={item.id} title={item.message} detail={item.detail} href={item.href} />
            ))}
            <ActivityRow title="Add a new product" detail="Start a submission for admin review" href="/brand/products/new" />
            <ActivityRow title="Open the full dashboard" detail="Manage products, claims, documents, and settings" href="/brand/dashboard" />
          </ActivityList>
        </MountFadeIn>
      </div>
    </div>
  );
}
