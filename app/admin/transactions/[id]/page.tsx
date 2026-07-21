import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ReceiptText, ShoppingCart } from "lucide-react";
import { getAdminTransaction, type AdminTransactionStatus } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const transaction = await getAdminTransaction(id);

  if (!transaction) {
    notFound();
  }

  const history = [
    {
      title: "Checkout session created",
      detail: transaction.dateLabel,
      icon: ShoppingCart,
    },
    {
      title: transaction.status === "Completed" ? "Payment completed" : "Payment status updated",
      detail: `${transaction.formattedAmount} through Stripe`,
      icon: ReceiptText,
    },
    {
      title: transaction.email === "No email" ? "Customer email unavailable" : "Customer email captured",
      detail: transaction.email,
      icon: Mail,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaction Detail</h1>
          <p className="text-sm text-slate-500">
            Stripe session, customer data, and purchased items.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/transactions">Back to transactions</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold">Order {transaction.displayId}</h2>
              <StatusBadge status={transaction.status} />
              <span className="text-sm text-slate-500">{transaction.dateLabel}</span>
            </div>
            <p className="mt-2 truncate text-xs text-slate-500">{transaction.id}</p>
          </div>
          <div className="grid w-full gap-3 sm:w-auto sm:grid-flow-col">
            {transaction.receiptUrl ? (
              <Button asChild>
                <Link href={transaction.receiptUrl} target="_blank" rel="noreferrer">
                  View Receipt
                </Link>
              </Button>
            ) : (
              <Button disabled>Receipt unavailable</Button>
            )}
            <Button asChild variant="outline">
              <Link href="https://dashboard.stripe.com/payments" target="_blank" rel="noreferrer">
                Open Stripe
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 md:hidden">
              {transaction.items.map((item, index) => (
                <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Item {index + 1}
                      </p>
                      <h3 className="mt-1 font-semibold">{item.name}</h3>
                    </div>
                    <p className="shrink-0 font-semibold">{item.total}</p>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <TransactionMeta label="Quantity" value={String(item.quantity)} />
                    <TransactionMeta label="Unit cost" value={item.unitAmount} />
                  </dl>
                </article>
              ))}
              {transaction.items.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
                  Stripe did not return line items for this session.
                </div>
              )}
            </div>
            <div className="hidden overflow-x-auto rounded-lg border md:block">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-left text-slate-500">
                    <th className="px-4 py-3">S. No.</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Cost</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transaction.items.map((item, index) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="px-4 py-4">{index + 1}</td>
                      <td className="font-medium">{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.unitAmount}</td>
                      <td>{item.total}</td>
                    </tr>
                  ))}
                  {transaction.items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                        Stripe did not return line items for this session.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="ml-auto w-full max-w-xs space-y-2 text-sm">
              <TotalLine label="Sub Total" value={transaction.subtotal} />
              <TotalLine label="Total" value={transaction.total} strong />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <InfoLine label="Name" value={transaction.customerName} />
              <InfoLine label="Email" value={transaction.email} />
              <InfoLine label="Phone" value={transaction.customerPhone} />
              <InfoLine label="Country" value={transaction.customerCountry} />
              <InfoLine label="Address" value={transaction.customerAddress} />
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
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{event.title}</p>
                      <p className="truncate text-sm text-slate-500">{event.detail}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: AdminTransactionStatus }) {
  const color =
    status === "Completed"
      ? "bg-emerald-50 text-emerald-700"
      : status === "Pending"
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";

  return <span className={`rounded-full px-3 py-1 text-sm font-medium ${color}`}>{status}</span>;
}

function TransactionMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 truncate font-medium text-slate-800">{value}</dd>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b pb-3 last:border-0 min-[420px]:grid-cols-[90px_1fr]">
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
