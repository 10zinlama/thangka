import Link from "next/link";
import { getAdminProducts } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Package, ReceiptText, Users } from "lucide-react";

const monthlySales = [
  150, 370, 190, 285, 175, 185, 275, 95, 205, 375, 270, 100,
];

export default async function AdminDashboardPage() {
  const products = await getAdminProducts(100);

  const productCount = products.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Manage products, invoices, billing, and transactions.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/add">Add Product</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Products"
          value={productCount.toString()}
          detail="Active products"
          icon={<Package className="h-5 w-5" />}
        />
        <MetricCard
          title="Orders"
          value="0"
          detail="Connect Stripe payments next"
          icon={<ReceiptText className="h-5 w-5" />}
        />
        <MetricCard
          title="Customers"
          value="0"
          detail="Available after orders"
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          title="Revenue"
          value="$0.00"
          detail="Use Stripe balance later"
          icon={<BarChart3 className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-72 items-end gap-4 border-b border-slate-200 px-2">
              {monthlySales.map((sale, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-3">
                  <div
                    className="w-full max-w-8 rounded-t-md bg-blue-600"
                    style={{ height: `${sale / 4}px` }}
                  />
                  <span className="text-xs text-slate-500">
                    {
                      [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ][index]
                    }
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-72 flex-col items-center justify-center rounded-lg bg-slate-50 text-center">
              <div className="relative mb-6 h-36 w-72 overflow-hidden">
                <div className="absolute inset-x-0 top-4 h-56 rounded-full border-[18px] border-slate-200" />
                <div className="absolute inset-x-0 top-4 h-56 rounded-full border-[18px] border-blue-600 border-b-transparent border-r-transparent" />
              </div>
              <p className="text-5xl font-bold">75.55%</p>
              <p className="mt-3 text-sm text-slate-500">
                Target progress placeholder until order data is connected.
              </p>
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
