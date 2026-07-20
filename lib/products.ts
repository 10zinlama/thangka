import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, put } from "@vercel/blob";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

const CATALOG_PATH = "catalog/store-products.json";
const LOCAL_CATALOG_PATH = path.join(process.cwd(), "data", "store-products.json");
const placeholderImage =
  "https://images.unsplash.com/photo-1604077350837-c7f82f28653f?q=80&w=1200&auto=format&fit=crop";

export type ProductAvailability = "in_stock" | "out_of_stock" | "preorder";

export interface StoreProduct {
  id: string;
  stripeProductId: string;
  stripePriceId: string | null;
  name: string;
  description: string;
  imageUrl: string | null;
  category: string;
  brand: string;
  color: string;
  weight: string;
  length: string;
  width: string;
  stock: number;
  availability: ProductAvailability;
  active: boolean;
  currency: string;
  unitAmount: number | null;
  created: number;
  updated: number;
}

export interface ProductInput {
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  brand: string;
  color: string;
  weight: string;
  length: string;
  width: string;
  stock: string;
  availability: string;
  currency: string;
  priceValue: number;
}

const fallbackProducts: StoreProduct[] = [
  createFallbackProduct({
    id: "demo_thangka_mandala",
    name: "Mandala Thangka Painting",
    description: "A traditional mandala thangka for meditation spaces and sacred rooms.",
    price: 12000,
    category: "Mandala",
  }),
  createFallbackProduct({
    id: "demo_green_tara",
    name: "Green Tara Thangka",
    description: "Hand-painted Green Tara artwork inspired by Himalayan Buddhist tradition.",
    price: 18000,
    category: "Tara",
  }),
  createFallbackProduct({
    id: "demo_buddha",
    name: "Buddha Thangka Art",
    description: "A devotional Buddha thangka with warm tones and detailed line work.",
    price: 15000,
    category: "Buddha",
  }),
];

export async function getProducts(limit = 20) {
  const products = await getCatalogProducts();
  return products
    .filter((product) => product.active && product.unitAmount !== null)
    .slice(0, limit);
}

export async function getAdminProducts(limit = 100) {
  const products = await getCatalogProducts();
  return products.slice(0, limit);
}

export async function getProduct(id: string) {
  const products = await getCatalogProducts();
  return products.find((product) => product.id === id) ?? null;
}

export async function createStoreProduct(input: ProductInput) {
  const products = await getMutableCatalogProducts();
  const paymentProduct = await createStripePaymentProduct(input);
  const priceId =
    typeof paymentProduct.default_price === "string"
      ? paymentProduct.default_price
      : paymentProduct.default_price?.id ?? null;
  const now = Math.floor(Date.now() / 1000);

  const product: StoreProduct = {
    id: paymentProduct.id,
    stripeProductId: paymentProduct.id,
    stripePriceId: priceId,
    name: input.name,
    description: input.description,
    imageUrl: input.imageUrl || null,
    category: input.category,
    brand: input.brand,
    color: input.color,
    weight: input.weight,
    length: input.length,
    width: input.width,
    stock: parseStock(input.stock),
    availability: parseAvailability(input.availability),
    active: true,
    currency: normalizeCurrency(input.currency),
    unitAmount: Math.round(input.priceValue * 100),
    created: now,
    updated: now,
  };

  await saveCatalogProducts([product, ...products]);
  return product;
}

export async function updateStoreProduct(id: string, input: ProductInput) {
  const products = await getMutableCatalogProducts();
  const product = products.find((item) => item.id === id);
  if (!product) throw new Error("Product not found.");

  const unitAmount = Math.round(input.priceValue * 100);
  const currency = normalizeCurrency(input.currency);
  const stripePriceId = await updateStripePaymentProduct(product, input, unitAmount, currency);

  const updatedProduct: StoreProduct = {
    ...product,
    stripePriceId,
    name: input.name,
    description: input.description,
    imageUrl: input.imageUrl || null,
    category: input.category,
    brand: input.brand,
    color: input.color,
    weight: input.weight,
    length: input.length,
    width: input.width,
    stock: parseStock(input.stock),
    availability: parseAvailability(input.availability),
    active: true,
    currency,
    unitAmount,
    updated: Math.floor(Date.now() / 1000),
  };

  await saveCatalogProducts(
    products.map((item) => (item.id === id ? updatedProduct : item))
  );

  return updatedProduct;
}

export async function deleteStoreProduct(id: string) {
  const products = await getMutableCatalogProducts();
  const product = products.find((item) => item.id === id);
  if (!product) return;

  if (product.stripeProductId.startsWith("prod_") && stripe) {
    try {
      await stripe.products.update(product.stripeProductId, { active: false });
    } catch (error) {
      console.warn("Stripe product could not be deactivated.", error);
    }
  }

  await saveCatalogProducts(products.filter((item) => item.id !== id));
}

async function getCatalogProducts() {
  const storedProducts = await readCatalogProducts();
  if (storedProducts) return storedProducts;

  const hydratedProducts = await hydrateProductsFromStripe();
  return hydratedProducts.length > 0 ? hydratedProducts : fallbackProducts;
}

async function getMutableCatalogProducts() {
  const storedProducts = await readCatalogProducts();
  if (storedProducts) return storedProducts;

  const hydratedProducts = await hydrateProductsFromStripe();
  return hydratedProducts.length > 0 ? hydratedProducts : [];
}

async function readCatalogProducts() {
  const blobProducts = await readBlobCatalog();
  if (blobProducts) return blobProducts;
  return readLocalCatalog();
}

async function readBlobCatalog() {
  if (!shouldUseBlobStorage()) return null;

  try {
    const result = await get(CATALOG_PATH, { access: "public" });
    if (!result || result.statusCode !== 200) return null;

    const text = await streamToText(result.stream);
    return parseCatalog(text);
  } catch {
    return null;
  }
}

async function readLocalCatalog() {
  try {
    const text = await readFile(LOCAL_CATALOG_PATH, "utf8");
    return parseCatalog(text);
  } catch {
    return null;
  }
}

async function saveCatalogProducts(products: StoreProduct[]) {
  const body = JSON.stringify({ products }, null, 2);

  if (shouldUseBlobStorage()) {
    await put(CATALOG_PATH, body, {
      access: "public",
      allowOverwrite: true,
      contentType: "application/json",
    });
    return;
  }

  if (process.env.NODE_ENV !== "development") {
    throw new Error("Product catalog storage is not connected. Connect Vercel Blob to this project before creating, editing, or deleting products.");
  }

  await mkdir(path.dirname(LOCAL_CATALOG_PATH), { recursive: true });
  await writeFile(LOCAL_CATALOG_PATH, body, "utf8");
}

async function hydrateProductsFromStripe() {
  if (!stripe || process.env.DISABLE_STRIPE === "true") return [];

  try {
    const products = await stripe.products.list({
      expand: ["data.default_price"],
      limit: 100,
    });

    return products.data.map(stripeProductToStoreProduct);
  } catch (error) {
    console.warn("Stripe products unavailable, using local demo products.", error);
    return [];
  }
}

async function createStripePaymentProduct(input: ProductInput) {
  if (!stripe) throw new Error("STRIPE_SECRET_KEY is not configured.");

  return stripe.products.create({
    name: input.name,
    description: input.description || undefined,
    active: true,
    metadata: productMetadata(input),
    default_price_data: {
      currency: normalizeCurrency(input.currency),
      unit_amount: Math.round(input.priceValue * 100),
    },
    expand: ["default_price"],
  });
}

async function updateStripePaymentProduct(
  product: StoreProduct,
  input: ProductInput,
  unitAmount: number,
  currency: string
) {
  if (!stripe || !product.stripeProductId.startsWith("prod_")) return product.stripePriceId;

  let priceId = product.stripePriceId;

  if (product.unitAmount !== unitAmount || product.currency !== currency || !priceId) {
    const price = await stripe.prices.create({
      currency,
      product: product.stripeProductId,
      unit_amount: unitAmount,
    });
    priceId = price.id;
  }

  await stripe.products.update(product.stripeProductId, {
    name: input.name,
    description: input.description || undefined,
    active: true,
    default_price: priceId ?? undefined,
    metadata: productMetadata(input),
  });

  return priceId;
}

function stripeProductToStoreProduct(product: Stripe.Product): StoreProduct {
  const price = product.default_price;
  const stripePrice = typeof price === "string" ? null : price;
  const now = Math.floor(Date.now() / 1000);

  return {
    id: product.id,
    stripeProductId: product.id,
    stripePriceId: stripePrice?.id ?? (typeof price === "string" ? price : null),
    name: product.name,
    description: product.description ?? "",
    imageUrl: product.images[0] ?? null,
    category: product.metadata.category ?? "",
    brand: product.metadata.brand ?? "",
    color: product.metadata.color ?? "",
    weight: product.metadata.weight ?? "",
    length: product.metadata.length ?? "",
    width: product.metadata.width ?? "",
    stock: parseStock(product.metadata.stock),
    availability: parseAvailability(product.metadata.availability),
    active: product.active,
    currency: stripePrice?.currency ?? "usd",
    unitAmount: stripePrice?.unit_amount ?? null,
    created: product.created ?? now,
    updated: product.updated ?? now,
  };
}

function productMetadata(input: ProductInput) {
  return {
    category: input.category,
    brand: input.brand,
    stock: String(parseStock(input.stock)),
    availability: parseAvailability(input.availability),
    color: input.color,
    weight: input.weight,
    length: input.length,
    width: input.width,
    managed_by: "st_thangka_admin",
  };
}

function parseCatalog(text: string) {
  const parsed = JSON.parse(text) as { products?: StoreProduct[] };
  if (!Array.isArray(parsed.products)) return null;
  return parsed.products.map(normalizeProduct);
}

function normalizeProduct(product: StoreProduct): StoreProduct {
  return {
    ...product,
    imageUrl: product.imageUrl || null,
    description: product.description ?? "",
    category: product.category ?? "",
    brand: product.brand ?? "",
    color: product.color ?? "",
    weight: product.weight ?? "",
    length: product.length ?? "",
    width: product.width ?? "",
    stock: parseStock(String(product.stock ?? 0)),
    availability: parseAvailability(product.availability),
    currency: normalizeCurrency(product.currency),
    unitAmount: typeof product.unitAmount === "number" ? product.unitAmount : null,
  };
}

function createFallbackProduct({
  id,
  name,
  description,
  price,
  category,
}: {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    id,
    stripeProductId: id,
    stripePriceId: `price_${id}`,
    name,
    description,
    imageUrl: placeholderImage,
    category,
    brand: "ST Thangka",
    color: "",
    weight: "",
    length: "",
    width: "",
    stock: 10,
    availability: "in_stock",
    active: true,
    currency: "usd",
    unitAmount: price,
    created: now,
    updated: now,
  } satisfies StoreProduct;
}

function parseAvailability(value: string | undefined): ProductAvailability {
  if (value === "out_of_stock" || value === "preorder") return value;
  return "in_stock";
}

function parseStock(value: string | undefined) {
  const stock = Number.parseInt(value ?? "0", 10);
  return Number.isFinite(stock) && stock > 0 ? stock : 0;
}

function normalizeCurrency(currency: string | undefined) {
  return (currency || "usd").trim().toLowerCase();
}

function shouldUseBlobStorage() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return true;
  if (process.env.NODE_ENV === "development") return false;
  return Boolean(process.env.BLOB_STORE_ID);
}

async function streamToText(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }

  return result + decoder.decode();
}
