import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Search } from "lucide-react";

const transactions = [
  ["#323537", "Abram Schleifer", "abram@example.com", "$43,999", "25 Apr, 2027", "Completed"],
  ["#323544", "Ava Smith", "ava.smith@example.com", "$1,200", "01 Dec, 2027", "Pending"],
  ["#323538", "Carla George", "carla65@example.com", "$919", "11 May, 2027", "Completed"],
  ["#323543", "Ekstrom Bothman", "ekstrom@example.com", "$679", "15 Nov, 2027", "Completed"],
  ["#323552", "Ella Davis", "ella.davis@example.com", "$210", "01 Mar, 2028", "Failed"],
  ["#323539", "Emery Culhane", "emery09@example.com", "$839", "29 Jun, 2027", "Completed"],
  ["#323547", "Ethan Patel", "ethan.patel@example.com", "$2,100", "05 Jan, 2028", "Pending"],
];

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-sm text-slate-500">
          Review customer payments and order status.
        </p>
      </div>

      <Card>
        <CardHeader className="flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Transactions</CardTitle>
            <p className="text-sm text-slate-500">
              Your most recent transactions list
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              <Search className="h-4 w-4" />
              Search
            </Button>
            <Button variant="outline">Last 7 Days</Button>
            <Button variant="outline">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-3">Order ID</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Total Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction[0]} className="border-b last:border-0">
                  <td className="py-4 font-medium">{transaction[0]}</td>
                  <td>{transaction[1]}</td>
                  <td className="text-slate-500">{transaction[2]}</td>
                  <td>{transaction[3]}</td>
                  <td>{transaction[4]}</td>
                  <td>
                    <StatusBadge status={transaction[5]} />
                  </td>
                  <td>
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/admin/transactions/${transaction[0].replace("#", "")}`}
                      >
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

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "Completed"
      ? "bg-emerald-50 text-emerald-700"
      : status === "Pending"
      ? "bg-amber-50 text-amber-700"
      : "bg-red-50 text-red-700";

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${color}`}>
      {status}
    </span>
  );
}

