import { Suspense } from "react";
import { CheckoutClient } from "./checkout-client";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutClient />
    </Suspense>
  );
}

function CheckoutLoading() {
  return (
    <div className="bg-stone-50">
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-8 w-48 rounded-md bg-stone-200" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="h-64 rounded-md bg-white shadow-sm" />
          <div className="h-64 rounded-md bg-white shadow-sm" />
        </div>
      </section>
    </div>
  );
}
