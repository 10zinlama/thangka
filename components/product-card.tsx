import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Heart, Star } from "lucide-react";
import type { StoreProduct } from "@/lib/products";

export const ProductCard = ({ product }: { product: StoreProduct }) => {
  const amount =
    product.unitAmount !== null
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: product.currency || "usd",
          maximumFractionDigits: 0,
        }).format(product.unitAmount / 100)
      : "Enquire";

  return (
    <article className="group min-w-0">
      <Link
        href={`/products/${product.id}`}
        className="relative block aspect-[4/4.25] overflow-hidden rounded-xl bg-[#e8e3d9]"
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width:1280px) 20vw, (min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
            className="object-cover transition duration-700 group-hover:scale-[1.04]"
          />
        ) : null}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] backdrop-blur">
          {product.category || "Thangka"}
        </span>
        <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 opacity-0 transition hover:text-[#b7502b] group-hover:opacity-100">
          <Heart className="h-3.5 w-3.5" />
        </span>
        <span className="absolute bottom-3 right-3 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-[#171713] text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </Link>
      <div className="px-0.5 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 flex items-center gap-1 text-[11px] text-black/45">
              <Star className="h-3 w-3 shrink-0 fill-[#b7502b] text-[#b7502b]" /> 4.9{" "}
              <span>- Collector favorite</span>
            </p>
            <Link href={`/products/${product.id}`}>
              <h3 className="line-clamp-2 text-sm font-semibold leading-5 transition group-hover:text-[#b7502b]">
                {product.name}
              </h3>
            </Link>
          </div>
          <p className="shrink-0 text-sm font-semibold">{amount}</p>
        </div>
      </div>
    </article>
  );
};
