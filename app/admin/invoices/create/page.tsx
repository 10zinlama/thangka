import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Save, Trash2 } from "lucide-react";

const items = [
  ["Macbook pro 13", "1", "$1200", "0%", "$1200.00"],
  ["Apple Watch Ultra", "1", "$300", "50%", "$150.00"],
  ["iPhone 15 Pro Max", "2", "$800", "0%", "$1600.00"],
  ["iPad Pro 3rd Gen", "1", "$900", "0%", "$900.00"],
];

export default function CreateInvoicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
        <p className="text-sm text-slate-500">
          Draft an invoice for a customer order.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Invoice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Invoice Number" placeholder="INV-0001" />
            <Field label="Customer Name" placeholder="Customer name" />
            <div className="md:col-span-2">
              <Field label="Customer Address" placeholder="Enter customer address" />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[850px] text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-slate-500">
                  <th className="px-4 py-3">S. No.</th>
                  <th>Products</th>
                  <th>Quantity</th>
                  <th>Unit Cost</th>
                  <th>Discount</th>
                  <th>Total</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item[0]} className="border-b last:border-0">
                    <td className="px-4 py-4">{index + 1}</td>
                    <td className="font-medium">{item[0]}</td>
                    <td>{item[1]}</td>
                    <td>{item[2]}</td>
                    <td>{item[3]}</td>
                    <td>{item[4]}</td>
                    <td>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 rounded-lg bg-slate-50 p-4 md:grid-cols-[1fr_1fr_160px_160px_180px]">
            <Field label="Product Name" placeholder="Enter product name" />
            <Field label="Price" placeholder="Enter product price" />
            <Field label="Quantity" placeholder="1" />
            <Field label="Discount" placeholder="0%" />
            <div className="flex items-end">
              <Button className="w-full">Save Product</Button>
            </div>
          </div>

          <div className="ml-auto w-full max-w-xs space-y-2 text-sm">
            <TotalLine label="Sub Total" value="$3850.00" />
            <TotalLine label="Vat (10%)" value="$385.00" />
            <TotalLine label="Total" value="$4235.00" strong />
          </div>
        </CardContent>
        <div className="grid gap-3 border-t p-6 sm:flex sm:justify-end">
          <Button variant="outline" className="w-full sm:w-auto">
            <Eye className="h-4 w-4" />
            Preview Invoice
          </Button>
          <Button className="w-full sm:w-auto">
            <Save className="h-4 w-4" />
            Save Invoice
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <input
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
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

