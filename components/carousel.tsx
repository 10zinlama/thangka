"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import type { StoreProduct } from "@/lib/products";

interface Props {
  products: StoreProduct[];
}

export const Carousel = ({ products }: Props) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (products.length === 0) return;

    const interval = setInterval(() => {
      setCurrent((previous) => (previous + 1) % products.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [products.length]);

  const currentProduct = products[current];

  if (!currentProduct) return null;

  const amount =
    currentProduct.unitAmount !== null
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currentProduct.currency || "usd",
        }).format(currentProduct.unitAmount / 100)
      : "Price on request";

  return (
    <section className="relative overflow-hidden rounded-lg border border-stone-200 bg-slate-950 shadow-lg">
      <div className="relative min-h-[360px] w-full">
        {currentProduct.imageUrl ? (
          <Image
            src={currentProduct.imageUrl}
            alt={currentProduct.name}
            fill
            sizes="(min-width: 1024px) 1100px, 100vw"
            className="object-cover opacity-65 transition-opacity duration-500"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-transparent" />
        <div className="relative flex min-h-[360px] max-w-xl flex-col justify-end p-6 text-white sm:p-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">
            Featured Artwork
          </p>
          <h2 className="text-3xl font-bold sm:text-4xl">{currentProduct.name}</h2>
          {currentProduct.description ? (
            <p className="mt-4 max-w-lg text-sm leading-6 text-stone-100 sm:text-base">
              {currentProduct.description}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="text-2xl font-bold">{amount}</span>
            <Button asChild className="bg-white text-slate-950 hover:bg-stone-100">
              <Link href={`/products/${currentProduct.id}`}>View Details</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
