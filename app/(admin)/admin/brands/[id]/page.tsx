import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatGrid, StatCard } from "@/components/dashboard/stat-card";
import { DataTable } from "@/components/dashboard/data-table";
import { Card, CardHeader, CardTitle, CardContent, CardAction } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BrandActions } from "@/components/admin/brand-actions";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";
import { formatMoney } from "@/lib/utils/money";
import { CheckCircle2, Clock, XCircle, Package } from "lucide-react";

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  ACTIVE: "success",
  SUSPENDED: "destructive",
  PENDING: "warning",
};

const PRODUCT_STATUS_VARIANT: Record<string, BadgeVariant> = {
  APPROVED: "success",
  REJECTED: "destructive",
  IN_REVIEW: "info",
  SUBMITTED: "warning",
  DRAFT: "outline",
};

const PRODUCTS_SHOWN = 10;

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/50 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm">
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default async function AdminBrandDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminUser();
  const { id } = await params;

  const brand = await prisma.brand.findUnique({
    where: { id },
    include: {
      products: { orderBy: { updatedAt: "desc" }, include: { category: true } },
      subscriptions: {
        orderBy: { createdAt: "desc" },
        include: { plan: true, invoices: { orderBy: { issuedAt: "desc" }, take: 10 } },
      },
    },
  });

  if (!brand) {
    notFound();
  }

  const activeSubscription = brand.subscriptions[0];
  const invoices = activeSubscription?.invoices ?? [];
  const unpaidInvoice = invoices.find((invoice) => invoice.status === "PENDING" || invoice.status === "FAILED");

  const approvedCount = brand.products.filter((p) => p.status === "APPROVED").length;
  const pendingCount = brand.products.filter((p) => p.status === "SUBMITTED" || p.status === "IN_REVIEW").length;
  const rejectedCount = brand.products.filter((p) => p.status === "REJECTED").length;

  const productRows = brand.products.slice(0, PRODUCTS_SHOWN).map((product) => ({
    key: product.id,
    href: `/admin/products/${product.id}`,
    cells: [
      <span key="name" className="font-medium">{product.name}</span>,
      `${product.category.name} • ${product.serialNumber ?? "No serial"}`,
      <div key="status" className="flex flex-wrap gap-1.5">
        <Badge variant={PRODUCT_STATUS_VARIANT[product.status] ?? "outline"}>{product.status.replaceAll("_", " ")}</Badge>
        {product.hidden ? <Badge variant="destructive">Hidden</Badge> : null}
        {product.archived ? <Badge variant="outline">Archived</Badge> : null}
      </div>,
    ],
  }));

  return (
    <>
      <PageHeader
        eyebrow="Admin Brands"
        title={brand.name}
        description={`Workspace status: ${brand.status}${brand.deletedAt ? " (deleted)" : ""}`}
        actions={<Badge variant={STATUS_VARIANT[brand.status] ?? "outline"}>{brand.status}</Badge>}
      />

      <StatGrid>
        <StatCard icon={Package} label="Total Products" value={brand.products.length} detail="Submitted by this brand" />
        <StatCard icon={CheckCircle2} label="Approved" value={approvedCount} detail="Live and verified" />
        <StatCard icon={Clock} label="Pending Review" value={pendingCount} detail="Submitted or in review" />
        <StatCard icon={XCircle} label="Rejected" value={rejectedCount} detail="Needs resubmission" />
      </StatGrid>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid min-w-0 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <InfoTile label="Subscription Status" value={activeSubscription ? `${activeSubscription.plan.name} • ${activeSubscription.status}` : "No plan"} />
                <InfoTile label="Payment Status" value={unpaidInvoice ? `${unpaidInvoice.status} — ${unpaidInvoice.invoiceNumber}` : "Up to date"} />
              </div>
              {brand.summary ? <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{brand.summary}</p> : null}
              {brand.status === "SUSPENDED" && brand.suspendedReason ? (
                <div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <p className="font-semibold">Suspension reason</p>
                  <p className="mt-1">{brand.suspendedReason}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Products ({brand.products.length})</CardTitle>
              {brand.products.length > PRODUCTS_SHOWN ? (
                <CardAction>
                  <Button variant="outline" size="sm" render={<Link href={`/admin/products?brandId=${brand.id}`} />} nativeButton={false}>
                    View all
                  </Button>
                </CardAction>
              ) : null}
            </CardHeader>
            <CardContent>
              <DataTable
                headers={["Product", "Category / Serial", "Status"]}
                rows={productRows}
                emptyMessage="No products submitted yet."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2.5">
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <InfoRow
                    key={invoice.id}
                    label={invoice.invoiceNumber}
                    value={
                      <span className="flex items-center gap-2">
                        {formatMoney(invoice.amount, invoice.currency)}
                        <Badge variant="outline">{invoice.status}</Badge>
                      </span>
                    }
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No invoices yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid min-w-0 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage this brand</CardTitle>
            </CardHeader>
            <CardContent>
              <BrandActions brand={{ id: brand.id, status: brand.status }} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
