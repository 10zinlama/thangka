"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Download, Pencil, Search, SlidersHorizontal, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoreProduct } from "@/lib/products";
import { deleteProductAction } from "@/app/admin/products/actions";

const PAGE_SIZE = 10;

export function AdminProductsTable({ products }: { products: StoreProduct[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const storefrontCount = products.filter(isVisibleInStorefront).length;
  const hiddenCount = products.length - storefrontCount;

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category).filter(Boolean))),
    [products]
  );

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const haystack = [
          product.name,
          product.id,
          product.category,
          product.brand,
          product.description,
        ]
          .join(" ")
          .toLowerCase();
        const matchesSearch = haystack.includes(search.toLowerCase());
        const matchesCategory = category === "all" || product.category === category;
        const matchesStatus =
          status === "all" ||
          (status === "visible" && isVisibleInStorefront(product)) ||
          (status === "hidden" && !isVisibleInStorefront(product)) ||
          (status === "active" && product.active) ||
          (status === "inactive" && !product.active) ||
          product.availability === status;

        return matchesSearch && matchesCategory && matchesStatus;
      }),
    [products, search, category, status]
  );
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const start = filteredProducts.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(page * PAGE_SIZE, filteredProducts.length);

  useEffect(() => {
    setPage(1);
  }, [search, category, status]);

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, pageCount));
  }, [pageCount]);

  const exportProducts = () => {
    const headers = ["Name", "Category", "Brand", "Price", "Stock", "Status", "ID"];
    const rows = filteredProducts.map((product) => [
      product.name,
      product.category,
      product.brand,
      formatMoney(product.unitAmount, product.currency),
      String(product.stock),
      product.active ? product.availability : "inactive",
      product.id,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "st-thangka-products.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <SummaryStat label="Admin products" value={String(products.length)} />
        <SummaryStat label="Shown on website" value={String(storefrontCount)} />
        <SummaryStat label="Hidden from website" value={String(hiddenCount)} />
      </div>

      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
        <label className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products, brands, categories, or IDs"
            className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-9 text-sm outline-none focus:border-slate-400"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-950"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </label>

        <label className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-10 min-w-40 appearance-none rounded-md border border-slate-200 bg-white pl-9 pr-8 text-sm outline-none focus:border-slate-400"
          >
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-10 min-w-36 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
        >
          <option value="all">All status</option>
          <option value="visible">Shown on website</option>
          <option value="hidden">Hidden from website</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="in_stock">In stock</option>
          <option value="out_of_stock">Out of stock</option>
          <option value="preorder">Preorder</option>
        </select>

        <Button type="button" variant="outline" onClick={exportProducts}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
        <span>
          Showing {start}-{end} of {filteredProducts.length} products
        </span>
        {(search || category !== "all" || status !== "all") && (
          <button
            type="button"
            className="font-medium text-slate-950 underline underline-offset-4"
            onClick={() => {
              setSearch("");
              setCategory("all");
              setStatus("all");
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200">
        <div className="hidden grid-cols-[minmax(0,1.7fr)_88px_56px_96px_104px_144px] gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-500 lg:grid">
          <span>Product</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Status</span>
          <span>Storefront</span>
          <span className="text-right">Actions</span>
        </div>
        <div className="divide-y divide-slate-200">
          {paginatedProducts.map((product) => (
            <div
              key={product.id}
              className="grid gap-3 px-3 py-3 text-sm lg:grid-cols-[minmax(0,1.7fr)_88px_56px_96px_104px_144px] lg:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-slate-100">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="truncate text-xs text-slate-500">{product.id}</p>
                  <p className="mt-1 truncate text-xs text-slate-400">
                    {product.category || "No category"} - {product.brand || "No brand"}
                  </p>
                </div>
              </div>

              <RowMeta label="Price">
                <span className="font-medium">{formatMoney(product.unitAmount, product.currency)}</span>
              </RowMeta>
              <RowMeta label="Stock">{product.stock}</RowMeta>
              <RowMeta label="Status">
                <StatusBadge product={product} />
              </RowMeta>
              <RowMeta label="Storefront">
                <StorefrontBadge product={product} />
              </RowMeta>

              <div className="grid grid-cols-2 gap-2 min-[460px]:flex min-[460px]:items-center lg:justify-end">
                <Button asChild variant="outline" size="sm" className="h-8 w-full gap-1 px-2 has-[>svg]:px-2 min-[460px]:w-auto">
                  <Link href={`/admin/products/${product.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <DeleteProductButton id={product.id} name={product.name} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {!filteredProducts.length ? (
        <div className="rounded-md border border-dashed border-slate-200 py-14 text-center">
          <p className="font-semibold">No products found</p>
          <p className="mt-1 text-sm text-slate-500">Adjust the search or filter values.</p>
        </div>
      ) : null}

      {pageCount > 1 ? (
        <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Previous
          </Button>
          {getPageNumbers(page, pageCount).map((item, index) => {
            if (item === "dots") {
              return (
                <span key={`dots-${index}`} className="px-2 text-sm text-slate-400">
                  ...
                </span>
              );
            }

            const pageNumber = item;
            return (
              <Button
                key={pageNumber}
                type="button"
                variant={page === pageNumber ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </Button>
            );
          })}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page === pageCount}
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function RowMeta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[82px_1fr] items-center gap-3 lg:block">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400 lg:hidden">
        {label}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function StatusBadge({ product }: { product: StoreProduct }) {
  const label = product.active ? product.availability.replaceAll("_", " ") : "inactive";
  const className = product.active
    ? "bg-emerald-50 text-emerald-700"
    : "bg-slate-100 text-slate-600";

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${className}`}>
      {label}
    </span>
  );
}

function StorefrontBadge({ product }: { product: StoreProduct }) {
  if (isVisibleInStorefront(product)) {
    return (
      <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
        Visible
      </span>
    );
  }

  const reason = !product.active
    ? "Inactive"
    : product.unitAmount === null
      ? "No price"
      : "Hidden";

  return (
    <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
      {reason}
    </span>
  );
}

function isVisibleInStorefront(product: StoreProduct) {
  return product.active && product.unitAmount !== null;
}

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

function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [locked, setLocked] = useState(false);
  const lockedRef = useRef(false);

  return (
    <form
      action={deleteProductAction}
      className="min-w-0"
      onSubmit={(event) => {
        if (lockedRef.current) {
          event.preventDefault();
          return;
        }

        if (!window.confirm(`Delete ${name} from the storefront?`)) {
          event.preventDefault();
          return;
        }

        lockedRef.current = true;
        setLocked(true);
      }}
    >
      <input type="hidden" name="id" value={id} />
      <DeleteSubmitButton locked={locked} />
    </form>
  );
}

function DeleteSubmitButton({ locked }: { locked: boolean }) {
  const { pending } = useFormStatus();
  const disabled = pending || locked;

  return (
    <Button
      type="submit"
      variant="outline"
      size="sm"
      className="h-8 w-full gap-1 border-red-200 px-2 text-red-700 hover:bg-red-50 hover:text-red-800 has-[>svg]:px-2 min-[460px]:w-auto"
      disabled={disabled}
    >
      <Trash2 className="h-4 w-4" />
      {disabled ? "Deleting" : "Delete"}
    </Button>
  );
}

function formatMoney(unitAmount: number | null, currency = "usd") {
  if (unitAmount === null) return "No price";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(unitAmount / 100);
}
