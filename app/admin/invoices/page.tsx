import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Plus, Search, SlidersHorizontal } from "lucide-react";

const invoices = [
  ["#323534", "Lindsey Curtis", "August 7, 2028", "February 28, 2028", "$999", "Paid"],
  ["#323535", "John Doe", "July 1, 2028", "January 1, 2029", "$1200", "Unpaid"],
  ["#323536", "Jane Smith", "June 15, 2028", "December 15, 2028", "$850", "Draft"],
  ["#323537", "Michael Brown", "May 10, 2028", "November 10, 2028", "$1500", "Paid"],
  ["#323538", "Emily Davis", "April 5, 2028", "October 5, 2028", "$700", "Unpaid"],
];

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-sm text-slate-500">View and create customer invoices.</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/invoices/create">
            <Plus className="h-4 w-4" />
            Create Invoice
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Summary label="Overdue" value="$120.80" />
          <Summary label="Due within next 30 days" value="$0.00" />
          <Summary label="Average time to get paid" value="24 days" />
          <Summary label="Upcoming payout" value="$3,450.50" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Invoices</CardTitle>
            <p className="text-sm text-slate-500">Your most recent invoices list</p>
          </div>
          <div className="grid grid-cols-2 gap-2 min-[520px]:flex min-[520px]:flex-wrap">
            <Button variant="outline" size="sm">
              All Invoices
            </Button>
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4" />
              Search
            </Button>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-3">Invoice Number</th>
                <th>Customer</th>
                <th>Creation Date</th>
                <th>Due Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice[0]} className="border-b last:border-0">
                  <td className="py-4 font-medium">{invoice[0]}</td>
                  <td>{invoice[1]}</td>
                  <td>{invoice[2]}</td>
                  <td>{invoice[3]}</td>
                  <td>{invoice[4]}</td>
                  <td>
                    <StatusBadge status={invoice[5]} />
                  </td>
                  <td>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/invoices/${invoice[0].replace("#", "")}`}>
                        View
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "Paid"
      ? "bg-emerald-50 text-emerald-700"
      : status === "Unpaid"
      ? "bg-red-50 text-red-700"
      : "bg-slate-100 text-slate-600";

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${color}`}>
      {status}
    </span>
  );
}

