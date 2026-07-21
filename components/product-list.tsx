"use client";

import { ProductCard } from "./product-card";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { StoreProduct } from "@/lib/products";

const PAGE_SIZE = 12;

export const ProductList = ({ products }: { products: StoreProduct[]; compact?: boolean }) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const categories = [
    "All",
    ...Array.from(new Set(products.map((product) => product.category).filter(Boolean))),
  ];

  const filtered = useMemo(
    () =>
      products
        .filter(
          (product) =>
            (category === "All" || product.category === category) &&
            `${product.name} ${product.description} ${product.brand} ${product.category}`
              .toLowerCase()
              .includes(search.toLowerCase())
        )
        .sort((a, b) => {
          const aPrice = a.unitAmount || 0;
          const bPrice = b.unitAmount || 0;
          return sort === "low" ? aPrice - bPrice : sort === "high" ? bPrice - aPrice : 0;
        }),
    [products, search, category, sort]
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedProducts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, category, sort]);

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, pageCount));
  }, [pageCount]);

  return (
    <div>
      <div className="z-30 mb-8 rounded-2xl border border-black/10 bg-[#f7f5f0]/90 p-3 shadow-sm backdrop-blur-xl sm:sticky sm:top-[86px] sm:mb-10">
        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by artwork, deity, or meaning"
              className="h-12 w-full rounded-xl border border-black/10 bg-white pl-11 pr-10 text-sm outline-none focus:border-[#b7502b]"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`h-12 whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition ${
                  category === item
                    ? "bg-[#171713] text-white"
                    : "border border-black/10 bg-white hover:border-black/30"
                }`}
              >
                {item}
              </button>
            ))}
            <label className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="h-12 appearance-none rounded-xl border border-black/10 bg-white pl-9 pr-8 text-sm font-semibold"
              >
                <option value="featured">Featured</option>
                <option value="low">Price: low</option>
                <option value="high">Price: high</option>
              </select>
            </label>
          </div>
        </div>
      </div>
      <div className="mb-6 flex flex-col gap-1 text-sm text-black/50 min-[420px]:flex-row min-[420px]:justify-between">
        <span>
          {filtered.length} work{filtered.length === 1 ? "" : "s"}
        </span>
        <span>Curated collection</span>
      </div>
      {filtered.length ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 min-[480px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {paginatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-black/20 py-24 text-center">
          <h3 className="text-2xl font-semibold">No artworks found</h3>
          <p className="mt-2 text-black/50">Try another search or collection.</p>
        </div>
      )}
      {pageCount > 1 ? (
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={page === 1}
            className="h-10 rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold disabled:opacity-40"
          >
            Previous
          </button>
          {getPageNumbers(page, pageCount).map((item, index) => {
            if (item === "dots") {
              return (
                <span key={`dots-${index}`} className="px-2 text-sm text-black/40">
                  ...
                </span>
              );
            }

            const pageNumber = item;
            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={`h-10 min-w-10 rounded-xl px-3 text-sm font-semibold ${
                  page === pageNumber
                    ? "bg-[#171713] text-white"
                    : "border border-black/10 bg-white"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            disabled={page === pageCount}
            className="h-10 rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
};

function getPageNumbers(currentPage: number, pageCount: number) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages: Array<number | "dots"> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(pageCount - 1, currentPage + 1);

  if (start > 2) pages.push("dots");
  for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
    pages.push(pageNumber);
  }
  if (end < pageCount - 1) pages.push("dots");
  pages.push(pageCount);

  return pages;
}
