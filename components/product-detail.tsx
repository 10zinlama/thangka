"use client";

import Image from "next/image";
import { Minus, Plus, ShieldCheck, ShoppingBag } from "lucide-react";
import { Button } from "./ui/button";
import { useCartStore } from "@/store/cart-store";
import type { StoreProduct } from "@/lib/products";

interface Props {
  product: StoreProduct;
}

export const ProductDetail = ({ product }: Props) => {
  const { items, addItem, removeItem } = useCartStore();
  const cartItem = items.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const amount =
    product.unitAmount !== null
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: product.currency || "usd",
        }).format(product.unitAmount / 100)
      : "Price on request";

  const onAddItem = () => {
    if (product.unitAmount === null) return;

    addItem({
      id: product.id,
      name: product.name,
      price: product.unitAmount,
      currency: product.currency || "usd",
      imageUrl: product.imageUrl,
      quantity: 1,
    });
  };

  return (
    <div className="bg-stone-50">
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:items-center lg:px-8 lg:py-14">
        <div className="relative mx-auto aspect-square w-full max-w-[520px] overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm lg:mx-0">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 520px, 100vw"
              className="object-contain"
              priority
            />
          ) : null}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
            {product.category || "Artwork"}
          </p>
          <h1 className="mt-3 text-balance text-3xl font-bold text-slate-950 sm:text-4xl">
            {product.name}
          </h1>
          {product.description ? (
            <p className="mt-5 text-base leading-8 text-slate-600">
              {product.description}
            </p>
          ) : null}

          <div className="mt-8 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">Price</p>
                <p className="break-words text-3xl font-bold text-slate-950">{amount}</p>
              </div>
              <div className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                {product.availability}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => removeItem(product.id)}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="flex h-10 min-w-12 items-center justify-center rounded-md border border-stone-200 bg-stone-50 text-lg font-semibold">
                {quantity}
              </span>
              <Button size="icon" onClick={onAddItem} aria-label="Increase quantity">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              className="mt-6 w-full bg-slate-950 text-white hover:bg-slate-800"
              onClick={onAddItem}
              disabled={product.unitAmount === null}
            >
              <ShoppingBag className="h-4 w-4" />
              Add To Cart
            </Button>
          </div>

          <div className="mt-5 flex items-start gap-3 text-sm leading-6 text-slate-600">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-amber-700" />
            <p>
              Secure checkout is handled through Stripe. Artwork details and
              images are managed from the admin dashboard.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
