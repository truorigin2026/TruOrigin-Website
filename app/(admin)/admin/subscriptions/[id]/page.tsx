import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubscriptionActions } from "@/components/admin/subscription-actions";
import { InvoiceForm } from "@/components/admin/invoice-form";
import { InvoiceActions } from "@/components/admin/invoice-actions";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";
import { formatMoney } from "@/lib/utils/money";

export default async function AdminSubscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminUser();
  const { id } = await params;

  const subscription = await prisma.subscription.findUnique({
    where: { id },
    include: { brand: true, plan: true, invoices: { orderBy: { issuedAt: "desc" } } },
  });

  if (!subscription) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin Billing"
        title={`${subscription.brand.name} — ${subscription.plan.name}`}
        description={
          subscription.currentPeriodEnd
            ? `Renews ${subscription.currentPeriodEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
            : undefined
        }
        actions={<Badge variant="outline">{subscription.status}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <InvoiceForm subscriptionId={subscription.id} />
            <div className="grid gap-2.5">
              {subscription.invoices.length > 0 ? (
                subscription.invoices.map((invoice) => (
                  <div key={invoice.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{invoice.invoiceNumber}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {formatMoney(invoice.amount, invoice.currency)} •{" "}
                        {invoice.issuedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Badge variant="outline">{invoice.status}</Badge>
                      <InvoiceActions invoiceId={invoice.id} status={invoice.status} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No invoices yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage this subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionActions subscriptionId={subscription.id} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
