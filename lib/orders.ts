import "server-only";

import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

export type AdminTransactionStatus = "Completed" | "Pending" | "Failed" | "Expired";

export type AdminTransaction = {
  id: string;
  displayId: string;
  customerName: string;
  email: string;
  amountTotal: number;
  currency: string;
  formattedAmount: string;
  created: number;
  dateLabel: string;
  status: AdminTransactionStatus;
  paymentStatus: Stripe.Checkout.Session.PaymentStatus;
  sessionStatus: Stripe.Checkout.Session.Status | null;
};

export type AdminTransactionItem = {
  id: string;
  name: string;
  quantity: number;
  unitAmount: string;
  total: string;
};

export type AdminTransactionDetail = AdminTransaction & {
  customerPhone: string;
  customerCountry: string;
  customerAddress: string;
  receiptUrl: string | null;
  items: AdminTransactionItem[];
  subtotal: string;
  total: string;
};

export type DashboardOrderSummary = {
  orders: number;
  paidOrders: number;
  customers: number;
  revenue: string;
  currency: string;
  monthlySales: number[];
  monthlySalesLabels: string[];
  completionRate: number;
  stripeConfigured: boolean;
};

const ZERO_DECIMAL_CURRENCIES = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
]);

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function getAdminTransactions(limit = 100) {
  if (!stripe) return [];

  const sessions = await stripe.checkout.sessions.list({
    limit,
    expand: ["data.payment_intent"],
  });

  return sessions.data.map(mapSessionToTransaction);
}

export async function getAdminTransaction(id: string) {
  if (!stripe || !id.startsWith("cs_")) return null;

  const session = await stripe.checkout.sessions.retrieve(id, {
    expand: ["payment_intent"],
  });
  const lineItems = await stripe.checkout.sessions.listLineItems(id, {
    limit: 100,
  });

  const transaction = mapSessionToTransaction(session);
  const receiptUrl = await getReceiptUrl(session);
  const currency = transaction.currency;
  const items = lineItems.data.map((item) => {
    const amountSubtotal = item.amount_subtotal ?? item.amount_total ?? 0;
    const quantity = item.quantity ?? 1;
    const unitAmount = quantity > 0 ? Math.round(amountSubtotal / quantity) : amountSubtotal;

    return {
      id: item.id,
      name: item.description || "Store item",
      quantity,
      unitAmount: formatMoney(unitAmount, currency),
      total: formatMoney(item.amount_total ?? amountSubtotal, currency),
    };
  });

  return {
    ...transaction,
    customerPhone: session.customer_details?.phone || "Not provided",
    customerCountry: formatCountry(session.customer_details?.address?.country),
    customerAddress: formatAddress(session.customer_details?.address),
    receiptUrl,
    items,
    subtotal: formatMoney(session.amount_subtotal ?? session.amount_total ?? 0, currency),
    total: transaction.formattedAmount,
  };
}

export async function getDashboardOrderSummary() {
  const transactions = await getAdminTransactions(100);
  const paidTransactions = transactions.filter((transaction) => transaction.status === "Completed");
  const primaryCurrency = paidTransactions[0]?.currency || transactions[0]?.currency || "usd";
  const revenueMinor = paidTransactions
    .filter((transaction) => transaction.currency === primaryCurrency)
    .reduce((sum, transaction) => sum + transaction.amountTotal, 0);
  const customers = new Set(
    paidTransactions
      .map((transaction) => transaction.email.toLowerCase())
      .filter((email) => email && email !== "no email")
  );
  const monthlySales = buildMonthlySales(paidTransactions, primaryCurrency);
  const completionRate =
    transactions.length === 0 ? 0 : Math.round((paidTransactions.length / transactions.length) * 100);

  return {
    orders: transactions.length,
    paidOrders: paidTransactions.length,
    customers: customers.size,
    revenue: formatMoney(revenueMinor, primaryCurrency),
    currency: primaryCurrency,
    monthlySales,
    monthlySalesLabels: monthLabels,
    completionRate,
    stripeConfigured: Boolean(stripe),
  } satisfies DashboardOrderSummary;
}

export function filterTransactions(
  transactions: AdminTransaction[],
  {
    query,
    status,
    range,
  }: {
    query?: string;
    status?: string;
    range?: string;
  }
) {
  const normalizedQuery = query?.trim().toLowerCase() ?? "";
  const normalizedStatus = status?.trim().toLowerCase() ?? "all";
  const days = range === "7" ? 7 : range === "30" ? 30 : null;
  const minCreated = days ? Date.now() / 1000 - days * 24 * 60 * 60 : null;

  return transactions.filter((transaction) => {
    const matchesQuery =
      !normalizedQuery ||
      transaction.id.toLowerCase().includes(normalizedQuery) ||
      transaction.displayId.toLowerCase().includes(normalizedQuery) ||
      transaction.customerName.toLowerCase().includes(normalizedQuery) ||
      transaction.email.toLowerCase().includes(normalizedQuery);
    const matchesStatus =
      normalizedStatus === "all" || transaction.status.toLowerCase() === normalizedStatus;
    const matchesRange = !minCreated || transaction.created >= minCreated;

    return matchesQuery && matchesStatus && matchesRange;
  });
}

export function formatMoney(amount: number, currency: string) {
  const normalizedCurrency = (currency || "usd").toLowerCase();
  const divisor = ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency) ? 1 : 100;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: normalizedCurrency.toUpperCase(),
  }).format(amount / divisor);
}

function mapSessionToTransaction(session: Stripe.Checkout.Session): AdminTransaction {
  const currency = session.currency || "usd";
  const email = session.customer_details?.email || session.customer_email || "No email";
  const customerName =
    session.customer_details?.name ||
    (email !== "No email" ? email.split("@")[0] : null) ||
    "Guest customer";
  const amountTotal = session.amount_total ?? 0;

  return {
    id: session.id,
    displayId: `#${session.id.slice(-8).toUpperCase()}`,
    customerName,
    email,
    amountTotal,
    currency,
    formattedAmount: formatMoney(amountTotal, currency),
    created: session.created,
    dateLabel: formatDate(session.created),
    status: getTransactionStatus(session),
    paymentStatus: session.payment_status,
    sessionStatus: session.status,
  };
}

function getTransactionStatus(session: Stripe.Checkout.Session): AdminTransactionStatus {
  if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
    return "Completed";
  }

  if (session.status === "expired") {
    return "Expired";
  }

  if (session.status === "complete") {
    return "Failed";
  }

  return "Pending";
}

function buildMonthlySales(transactions: AdminTransaction[], currency: string) {
  const currentYear = new Date().getFullYear();
  const monthlySales = Array.from({ length: 12 }, () => 0);

  transactions.forEach((transaction) => {
    const date = new Date(transaction.created * 1000);
    if (date.getFullYear() === currentYear && transaction.currency === currency) {
      monthlySales[date.getMonth()] += transaction.amountTotal;
    }
  });

  return monthlySales;
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp * 1000));
}

async function getReceiptUrl(session: Stripe.Checkout.Session) {
  const paymentIntent = session.payment_intent;

  if (!stripe || !paymentIntent) return null;

  const intent =
    typeof paymentIntent === "string"
      ? await stripe.paymentIntents.retrieve(paymentIntent, { expand: ["latest_charge"] })
      : paymentIntent;
  const charge = intent.latest_charge;

  if (charge && typeof charge !== "string") {
    return charge.receipt_url;
  }

  return null;
}

function formatCountry(country: string | null | undefined) {
  if (!country) return "Not provided";

  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(country) || country;
  } catch {
    return country;
  }
}

function formatAddress(address: Stripe.Address | null | undefined) {
  if (!address) return "Not provided";

  return [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postal_code,
    formatCountry(address.country),
  ]
    .filter(Boolean)
    .join(", ");
}
