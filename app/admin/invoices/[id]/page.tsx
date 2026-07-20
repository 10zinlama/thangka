import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer } from "lucide-react";

const invoiceItems = [
  ["Macbook pro 13", "1", "$48", "0%", "$1,200"],
  ["Apple Watch Ultra", "1", "$300", "50%", "$150"],
  ["iPhone 15 Pro Max", "3", "$800", "0%", "$1,600"],
  ["iPad Pro 3rd Gen", "1", "$900", "0%", "$900"],
];

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoice</h1>
        <p className="text-sm text-slate-500">Invoice detail and printable view.</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Invoice</CardTitle>
          <p className="font-semibold">ID: #{id}</p>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-slate-500">From</p>
              <p className="mt-2 font-bold">ST Thangka Store</p>
              <p className="mt-2 text-sm text-slate-600">
                1280 Clair Street, Massachusetts, New York - 02543
              </p>
              <p className="mt-5 text-sm font-semibold">Issued On:</p>
              <p className="text-sm text-slate-600">11 March, 2027</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm font-medium text-slate-500">To</p>
              <p className="mt-2 font-bold">Albert Word</p>
              <p className="mt-2 text-sm text-slate-600">
                355 Shobe Lane, Colorado, Fort Collins - 80543
              </p>
              <p className="mt-5 text-sm font-semibold">Due On:</p>
              <p className="text-sm text-slate-600">16 March, 2027</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[850px] text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-slate-500">
                  <th className="px-4 py-3">S.No.#</th>
                  <th>Products</th>
                  <th>Quantity</th>
                  <th>Unit Cost</th>
                  <th>Discount</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.map((item, index) => (
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
            <TotalLine label="Sub Total amount" value="$3,098" />
            <TotalLine label="Vat (10%)" value="$312" />
            <TotalLine label="Total" value="$3,410" strong />
          </div>

          <div className="flex justify-end gap-3 border-t pt-6">
            <Button variant="outline">Proceed to payment</Button>
            <Button>
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </CardContent>
      </Card>
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

