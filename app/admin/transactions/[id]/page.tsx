import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ReceiptText, ShoppingCart } from "lucide-react";

const orderItems = [
  ["Macbook pro 13", "1", "$1200", "0%", "$1200"],
  ["Apple Watch Ultra", "1", "$300", "50%", "$150"],
  ["iPhone 15 Pro Max", "2", "$800", "0%", "$1600"],
  ["iPad Pro 3rd Gen", "1", "$900", "0%", "$900"],
];

const history = [
  {
    title: "Checkout Started",
    detail: "via storefront",
    time: "12:54",
    icon: ShoppingCart,
  },
  {
    title: "Purchased",
    detail: "for US$4,235 via Stripe",
    time: "12:58",
    icon: ReceiptText,
  },
  {
    title: "Receipt Email Sent",
    detail: "Receipt #1734535",
    time: "12:58",
    icon: Mail,
  },
];

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Single Transaction</h1>
        <p className="text-sm text-slate-500">
          Transaction detail, customer data, and order history.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-xl font-semibold">Order ID: #{id}</h2>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              Completed
            </span>
            <span className="text-sm text-slate-500">Due date: 25 August 2025</span>
          </div>
          <div className="flex gap-3">
            <Button>View Receipt</Button>
            <Button variant="outline">Refund</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-left text-slate-500">
                    <th className="px-4 py-3">S. No.</th>
                    <th>Products</th>
                    <th>Quantity</th>
                    <th>Unit Cost</th>
                    <th>Discount</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => (
                    <tr key={item[0]} className="border-b last:border-0">
                      <td className="px-4 py-4">{index + 1}</td>
                      <td className="font-medium">{item[0]}</td>
                      <td>{item[1]}</td>
                      <td>{item[2]}</td>
                      <td>{item[3]}</td>
                      <td>{item[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="ml-auto w-full max-w-xs space-y-2 text-sm">
              <TotalLine label="Sub Total" value="$3,850" />
              <TotalLine label="Vat (10%)" value="$385" />
              <TotalLine label="Total" value="$4,235" strong />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <InfoLine label="Name" value="Mushafrof Chowdhury" />
              <InfoLine label="Email" value="name@example.com" />
              <InfoLine label="Phone" value="+123 456 7890" />
              <InfoLine label="Country" value="United States" />
              <InfoLine
                label="Address"
                value="62 Miles Drive St, Newark, NJ 07103, California."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {history.map((event) => {
                const Icon = event.icon;

                return (
                  <div key={event.title} className="flex gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-white">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-sm text-slate-500">{event.detail}</p>
                    </div>
                    <span className="text-xs text-slate-500">{event.time}</span>
                  </div>
                );
              })}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm">
                  Resend
                </Button>
                <Button variant="outline" size="sm">
                  Forward
                </Button>
                <Button variant="outline" size="sm">
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[90px_1fr] border-b pb-3 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function TotalLine({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className={`flex justify-between ${strong ? "text-lg font-bold" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

