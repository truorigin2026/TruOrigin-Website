import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlanForm } from "@/components/admin/plan-form";
import { PlanToggle } from "@/components/admin/plan-toggle";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";
import { formatMoney } from "@/lib/utils/money";

export default async function AdminPlansPage() {
  await requireAdminUser();

  const plans = await prisma.plan.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { subscriptions: true } } },
  });

  return (
    <>
      <PageHeader
        eyebrow="Admin Billing"
        title="Manage subscription plans."
        description="Create the plans brands can be subscribed to. Deactivating a plan hides it from new subscriptions without affecting brands already on it."
      />

      <Card className="mb-5">
        <CardHeader>
          <CardTitle>New Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <PlanForm />
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {plans.length > 0 ? (
          plans.map((plan) => (
            <Card key={plan.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{plan.name}</p>
                    <Badge variant={plan.isActive ? "success" : "outline"}>{plan.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.slug} • {plan.priceMonthly != null ? `${formatMoney(plan.priceMonthly)}/mo` : "Custom pricing"}
                    {plan.maxProducts != null ? ` • up to ${plan.maxProducts} products` : ""} • {plan._count.subscriptions} subscriber(s)
                  </p>
                </div>
                <PlanToggle
                  plan={{
                    id: plan.id,
                    name: plan.name,
                    isActive: plan.isActive,
                    priceMonthly: plan.priceMonthly,
                    maxProducts: plan.maxProducts,
                    subscriberCount: plan._count.subscriptions,
                  }}
                />
              </div>
            </Card>
          ))
        ) : (
          <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">No plans yet. Create one above.</div>
        )}
      </div>
    </>
  );
}
