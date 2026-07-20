import Link from "next/link";
import { Check, CircleAlert, PackageCheck } from "lucide-react";
import { getStripe } from "@/lib/stripe";
import { ClearCart } from "@/components/clear-cart";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId?.startsWith("cs_")) {
    return <StatusPanel valid={false} />;
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") return <StatusPanel valid={false} />;

    const amount = session.amount_total
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: session.currency || "usd",
        }).format(session.amount_total / 100)
      : null;

    return <div className="bg-[#f4f1e9] px-4 py-16 sm:py-24"><ClearCart /><section className="mx-auto max-w-2xl border border-black/10 bg-white p-7 text-center shadow-sm sm:p-12"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Check className="h-8 w-8" /></span><p className="eyebrow mt-7">Order confirmed</p><h1 className="font-serif text-4xl sm:text-5xl">Payment successful.</h1><p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-black/55">Thank you for your purchase. A Stripe receipt has been sent to {session.customer_details?.email || "your email address"}. We will contact you with preparation and delivery details.</p><div className="mx-auto mt-8 grid max-w-md grid-cols-2 border-y border-black/10 py-5 text-left"><div><p className="text-xs uppercase tracking-[.12em] text-black/40">Order reference</p><p className="mt-2 truncate text-sm font-bold">{session.id.slice(-12).toUpperCase()}</p></div><div className="border-l border-black/10 pl-5"><p className="text-xs uppercase tracking-[.12em] text-black/40">Paid</p><p className="mt-2 text-sm font-bold">{amount || "Confirmed"}</p></div></div><div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/products" className="premium-button">Continue shopping</Link><Link href="/contact" className="premium-button secondary">Contact support</Link></div></section></div>;
  } catch {
    return <StatusPanel valid={false} />;
  }
}

function StatusPanel({ valid }: { valid: boolean }) {
  return <div className="bg-[#f4f1e9] px-4 py-20"><section className="mx-auto max-w-xl border border-black/10 bg-white p-10 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-50 text-amber-700">{valid ? <PackageCheck /> : <CircleAlert />}</span><h1 className="mt-6 font-serif text-4xl">Payment not confirmed</h1><p className="mt-4 text-sm leading-7 text-black/55">We could not verify a completed Stripe payment for this page. Your cart has not been cleared.</p><div className="mt-7 flex justify-center gap-3"><Link href="/checkout" className="premium-button">Return to checkout</Link><Link href="/contact" className="premium-button secondary">Get help</Link></div></section></div>;
}
