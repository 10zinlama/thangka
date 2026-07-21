import Link from "next/link";
import { getAdminProducts } from "@/lib/products";
import { getDashboardOrderSummary, formatMoney } from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Package, ReceiptText, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [products, orderSummary] = await Promise.all([
    getAdminProducts(100),
    getDashboardOrderSummary(),
  ]);
  const activeProductCount = products.filter((product) => product.active).length;
  const maxMonthlySale = Math.max(...orderSummary.monthlySales, 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Products, orders, customers, and revenue from the live store.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/add">Add Product</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Products"
          value={activeProductCount.toString()}
          detail={`${products.length} total catalog items`}
          icon={<Package className="h-5 w-5" />}
        />
        <MetricCard
          title="Orders"
          value={orderSummary.orders.toString()}
          detail={`${orderSummary.paidOrders} paid through Stripe`}
          icon={<ReceiptText className="h-5 w-5" />}
        />
        <MetricCard
          title="Customers"
          value={orderSummary.customers.toString()}
          detail="Unique paid customer emails"
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          title="Revenue"
          value={orderSummary.revenue}
          detail="Paid Stripe checkout total"
          icon={<BarChart3 className="h-5 w-5" />}
        />
      </div>

      {!orderSummary.stripeConfigured && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-5 text-sm text-amber-800">
            Stripe is not configured in this environment, so order metrics cannot load yet.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-72 items-end gap-4 border-b border-slate-200 px-2">
              {orderSummary.monthlySales.map((sale, index) => (
                <div key={orderSummary.monthlySalesLabels[index]} className="flex flex-1 flex-col items-center gap-3">
                  <div
                    className="w-full max-w-8 rounded-t-md bg-blue-600 transition-all"
                    title={formatMoney(sale, orderSummary.currency)}
                    style={{ height: `${Math.max(8, (sale / maxMonthlySale) * 190)}px` }}
                  />
                  <span className="text-xs text-slate-500">
                    {orderSummary.monthlySalesLabels[index]}
                  </span>
                </div>
              ))}
            </div>
            {orderSummary.paidOrders === 0 && (
              <p className="mt-4 text-sm text-slate-500">
                No paid Stripe orders yet. This chart will update after successful checkout.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-72 flex-col items-center justify-center rounded-lg bg-slate-50 text-center">
              <div
                className="mb-6 flex h-40 w-40 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#2563eb ${orderSummary.completionRate * 3.6}deg, #e2e8f0 0deg)`,
                }}
              >
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-50">
                  <span className="text-3xl font-bold">{orderSummary.completionRate}%</span>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                {orderSummary.paidOrders} completed of {orderSummary.orders} checkout sessions.
              </p>
              <Button asChild variant="outline" className="mt-5">
                <Link href="/admin/transactions">Review transactions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  detail,
  icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          {icon}
        </div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-4xl font-bold">{value}</p>
        <p className="mt-2 text-xs text-slate-500">{detail}</p>
      </CardContent>
    </Card>
  );
}
