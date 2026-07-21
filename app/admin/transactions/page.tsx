import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Search } from "lucide-react";
import {
  filterTransactions,
  getAdminTransactions,
  type AdminTransactionStatus,
} from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = getParam(params.q);
  const status = getParam(params.status) || "all";
  const range = getParam(params.range) || "all";
  const transactions = await getAdminTransactions();
  const visibleTransactions = filterTransactions(transactions, { query, status, range });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-sm text-slate-500">
          Review Stripe checkout payments and order status.
        </p>
      </div>

      <Card>
        <CardHeader className="flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Transactions</CardTitle>
            <p className="text-sm text-slate-500">
              Showing {visibleTransactions.length} of {transactions.length} Stripe sessions
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/transactions/export">
              <Download className="h-4 w-4" />
              Export CSV
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-5 px-4 sm:px-6">
          <form className="grid gap-3 md:grid-cols-[1fr_170px_150px_auto]" action="/admin/transactions">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={query}
                placeholder="Search ID, customer, or email"
                className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </label>
            <select
              name="status"
              defaultValue={status}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="all">All statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="expired">Expired</option>
            </select>
            <select
              name="range"
              defaultValue={range}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="all">All time</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
            </select>
            <Button type="submit" variant="outline">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </form>

          <div className="grid gap-3 lg:hidden">
            {visibleTransactions.map((transaction) => (
              <article key={transaction.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{transaction.displayId}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">{transaction.id}</p>
                  </div>
                  <StatusBadge status={transaction.status} />
                </div>
                <dl className="mt-4 grid gap-3 text-sm min-[520px]:grid-cols-2">
                  <TransactionMeta label="Customer" value={transaction.customerName} />
                  <TransactionMeta label="Email" value={transaction.email} />
                  <TransactionMeta label="Amount" value={transaction.formattedAmount} />
                  <TransactionMeta label="Date" value={transaction.dateLabel} />
                </dl>
                <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                  <Link href={`/admin/transactions/${transaction.id}`}>View details</Link>
                </Button>
              </article>
            ))}
            {visibleTransactions.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
                No Stripe transactions match these filters yet.
              </div>
            )}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="py-3">Order ID</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Total Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b last:border-0">
                    <td className="py-4 font-medium">
                      <div>{transaction.displayId}</div>
                      <div className="max-w-40 truncate text-xs font-normal text-slate-500">
                        {transaction.id}
                      </div>
                    </td>
                    <td>{transaction.customerName}</td>
                    <td className="text-slate-500">{transaction.email}</td>
                    <td>{transaction.formattedAmount}</td>
                    <td>{transaction.dateLabel}</td>
                    <td>
                      <StatusBadge status={transaction.status} />
                    </td>
                    <td className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/transactions/${transaction.id}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                {visibleTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-14 text-center text-slate-500">
                      No Stripe transactions match these filters yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TransactionMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 truncate font-medium text-slate-800">{value}</dd>
    </div>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function StatusBadge({ status }: { status: AdminTransactionStatus }) {
  const color =
    status === "Completed"
      ? "bg-emerald-50 text-emerald-700"
      : status === "Pending"
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";

  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${color}`}>{status}</span>;
}
