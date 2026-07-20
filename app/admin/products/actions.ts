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
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

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

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeName = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  const blob = await put(`products/${Date.now()}-${safeName || "product"}.${extension}`, file, {
    access: "public",
    addRandomSuffix: true,
  });
  return blob.url;
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
