"use server";

import { requireAdmin } from "@/lib/admin";
import {
  createStoreProduct,
  deleteStoreProduct,
  updateStoreProduct,
  type ProductInput,
} from "@/lib/products";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const ALLOWED_IMAGE_TYPES = Object.keys(IMAGE_EXTENSIONS);
const MAX_TEXT_LENGTHS = {
  name: 120,
  description: 2000,
  category: 80,
  brand: 80,
  color: 80,
  measurement: 40,
};

export async function createProductAction(formData: FormData) {
  await requireAdmin();

  const input = await productInputFromForm(formData);
  validateProductInput(input);
  await createStoreProduct(input);

  revalidateProductPages();
  redirect("/admin/products");
}

export async function updateProductAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Product id is required.");

  const input = await productInputFromForm(formData);
  validateProductInput(input);
  await updateStoreProduct(id, input);

  revalidateProductPages(id);
  redirect("/admin/products");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Product id is required.");

  await deleteStoreProduct(id);
  revalidateProductPages(id);
  redirect("/admin/products");
}

async function productInputFromForm(formData: FormData): Promise<ProductInput> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  let imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const imageFile = formData.get("imageFile");

  if (imageFile instanceof File && imageFile.size > 0) {
    imageUrl = await uploadProductImage(imageFile, name);
  }

  return {
    name,
    description,
    imageUrl,
    category: String(formData.get("category") ?? "").trim(),
    brand: String(formData.get("brand") ?? "").trim(),
    color: String(formData.get("color") ?? "").trim(),
    weight: String(formData.get("weight") ?? "").trim(),
    length: String(formData.get("length") ?? "").trim(),
    width: String(formData.get("width") ?? "").trim(),
    stock: String(formData.get("stock") ?? "0").trim(),
    availability: String(formData.get("availability") ?? "in_stock").trim(),
    currency: String(formData.get("currency") ?? "usd").trim().toLowerCase(),
    priceValue: Number(formData.get("price")),
  };
}

function validateProductInput(input: ProductInput) {
  if (!input.name || !Number.isFinite(input.priceValue) || input.priceValue <= 0) {
    throw new Error("Product name and a valid price are required.");
  }

  if (input.priceValue > 1000000) {
    throw new Error("Product price is too large.");
  }

  if (!/^[a-z]{3}$/.test(input.currency)) {
    throw new Error("Currency must use a three-letter currency code.");
  }

  if (input.name.length > MAX_TEXT_LENGTHS.name) throw new Error("Product name is too long.");
  if (input.description.length > MAX_TEXT_LENGTHS.description) {
    throw new Error("Product description is too long.");
  }
  if (input.category.length > MAX_TEXT_LENGTHS.category) throw new Error("Category is too long.");
  if (input.brand.length > MAX_TEXT_LENGTHS.brand) throw new Error("Brand is too long.");
  if (input.color.length > MAX_TEXT_LENGTHS.color) throw new Error("Color is too long.");
  if (
    input.weight.length > MAX_TEXT_LENGTHS.measurement ||
    input.length.length > MAX_TEXT_LENGTHS.measurement ||
    input.width.length > MAX_TEXT_LENGTHS.measurement
  ) {
    throw new Error("Measurement fields are too long.");
  }

  const stock = Number.parseInt(input.stock, 10);
  if (!Number.isFinite(stock) || stock < 0 || stock > 9999) {
    throw new Error("Stock must be between 0 and 9999.");
  }

  if (input.imageUrl && !isAllowedProductImageUrl(input.imageUrl)) {
    throw new Error("Image URL must be HTTPS and from an approved image host.");
  }
}

async function uploadProductImage(file: File, productName: string) {
  if (!hasBlobCredentials()) {
    throw new Error(
      "Direct image upload is not connected yet. Connect a Vercel Blob store to this project or use the hosted Image URL field."
    );
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Please upload a JPG, PNG, WEBP, or GIF image.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Please upload an image smaller than 5 MB.");
  }

  if (!(await hasValidImageSignature(file))) {
    throw new Error("The uploaded file does not look like a valid image.");
  }

  const extension = IMAGE_EXTENSIONS[file.type] ?? "jpg";
  const safeName = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  const blob = await put(`products/${Date.now()}-${safeName || "product"}.${extension}`, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type,
  });
  return blob.url;
}

function isAllowedProductImageUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "files.stripe.com" ||
        url.hostname === "images.unsplash.com" ||
        url.hostname.endsWith(".public.blob.vercel-storage.com"))
    );
  } catch {
    return false;
  }
}

async function hasValidImageSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  if (file.type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (file.type === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    );
  }

  if (file.type === "image/gif") {
    return bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46;
  }

  if (file.type === "image/webp") {
    return (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    );
  }

  return false;
}

function revalidateProductPages(id?: string) {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  if (id) revalidatePath(`/products/${id}`);
}

function hasBlobCredentials() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN)
  );
}
