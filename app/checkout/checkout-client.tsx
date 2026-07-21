"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Minus, Plus, ShieldCheck, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/store/cart-store";
import { checkoutAction } from "./checkout-action";

const formatMoney = (amount: number, currency = "usd") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount / 100);

export function CheckoutClient() {
  const searchParams = useSearchParams();
  const { items, removeItem, addItem } = useCartStore();
  const checkoutError = searchParams.get("checkout_error");
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = items.length > 0 ? 0 : 0;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="bg-stone-50">
        <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
            <ShoppingBag className="h-7 w-7 text-amber-700" />
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950">
            Your cart is empty
          </h1>
          <p className="mt-4 max-w-xl text-slate-600">
            Add a thangka artwork to your cart and return here to complete secure checkout.
          </p>
          <Button asChild className="mt-8 bg-slate-950 text-white hover:bg-slate-800">
            <Link href="/products">Browse Products</Link>
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-stone-50">
      <section className="border-b border-stone-200 bg-white py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
            Secure Checkout
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Review Your Order
          </h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[1fr_380px] lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Cart Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-stone-200">
              {items.map((item) => (
                <li key={item.id} className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 min-[420px]:flex-row">
                  <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-md bg-stone-100 min-[420px]:h-24 min-[420px]:w-24">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="font-semibold text-slate-950">{item.name}</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatMoney(item.price, item.currency)} each
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="flex h-9 min-w-10 items-center justify-center rounded-md border border-stone-200 bg-white font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => addItem({ ...item, quantity: 1 })}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-slate-950 sm:text-right">
                      {formatMoney(item.price * item.quantity, item.currency)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SummaryLine label="Subtotal" value={formatMoney(subtotal, items[0]?.currency)} />
              <SummaryLine label="Shipping" value="Calculated after payment" />
              <div className="border-t border-stone-200 pt-4">
                <SummaryLine label="Total" value={formatMoney(total, items[0]?.currency)} strong />
              </div>
              {checkoutError ? (
                <p
                  role="alert"
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm leading-6 text-red-700"
                >
                  {checkoutError}
                </p>
              ) : null}
              <form action={checkoutAction}>
                <input
                  type="hidden"
                  name="items"
                  value={JSON.stringify(items.map(({ id, quantity }) => ({ id, quantity })))}
                />
                <Button type="submit" className="mt-2 w-full bg-slate-950 text-white hover:bg-slate-800">
                  Proceed To Payment
                </Button>
              </form>
              <div className="flex items-start gap-3 rounded-md bg-stone-50 p-3 text-sm leading-6 text-slate-600">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-amber-700" />
                <p>Payments are processed securely with Stripe.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function SummaryLine({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={strong ? "font-semibold text-slate-950" : "text-slate-600"}>
        {label}
      </span>
      <span className={strong ? "text-xl font-bold text-slate-950" : "font-medium"}>
        {value}
      </span>
    </div>
  );
}
