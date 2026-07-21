import { requireAdmin } from "@/lib/admin";
import { getAdminTransactions } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin();

  const transactions = await getAdminTransactions();
  const rows = [
    ["Order ID", "Stripe Session ID", "Customer", "Email", "Amount", "Date", "Status"],
    ...transactions.map((transaction) => [
      transaction.displayId,
      transaction.id,
      transaction.customerName,
      transaction.email,
      transaction.formattedAmount,
      transaction.dateLabel,
      transaction.status,
    ]),
  ];
  const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="st-thangka-transactions.csv"`,
    },
  });
}

function escapeCsv(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}
