import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateProductAction } from "../../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploadField } from "@/components/image-upload-field";
import { getProduct } from "@/lib/products";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product || product.id !== id) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-sm text-slate-500">
            Update storefront details while keeping Stripe connected for checkout.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/products">Back to Products</Link>
        </Button>
      </div>

      <form action={updateProductAction} className="space-y-6">
        <input type="hidden" name="id" value={product.id} />

        <Card>
          <CardHeader>
            <CardTitle>Product Description</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <Field label="Product Name" name="name" defaultValue={product.name} />
            <Field label="Category" name="category" defaultValue={product.category} />
            <Field label="Brand" name="brand" defaultValue={product.brand} />
            <Field label="Color" name="color" defaultValue={product.color} />
            <Field label="Weight (KG)" name="weight" type="number" defaultValue={product.weight} />
            <Field label="Length (CM)" name="length" type="number" defaultValue={product.length} />
            <Field label="Width (CM)" name="width" type="number" defaultValue={product.width} />
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Description</label>
              <textarea
                name="description"
                rows={6}
                defaultValue={product.description}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing & Availability</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-3">
            <Field
              label="Price"
              name="price"
              type="number"
              defaultValue={product.unitAmount !== null ? String(product.unitAmount / 100) : ""}
            />
            <Field label="Currency" name="currency" defaultValue={product.currency || "usd"} />
            <Field label="Stock Quantity" name="stock" type="number" defaultValue={String(product.stock)} />
            <div className="md:col-span-3">
              <label className="mb-2 block text-sm font-medium">Availability Status</label>
              <select
                name="availability"
                defaultValue={product.availability}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="preorder">Preorder</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {product.imageUrl ? (
              <div className="flex items-center gap-4 rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="relative h-20 w-20 overflow-hidden rounded-md bg-white">
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Current image</p>
                  <p className="mt-1 break-all text-xs text-slate-500">{product.imageUrl}</p>
                </div>
              </div>
            ) : null}
            <ImageUploadField />
            <div className="relative text-center text-xs uppercase tracking-wide text-slate-400">
              <span className="bg-white px-3">or paste a hosted URL</span>
              <div className="absolute left-0 right-0 top-1/2 -z-10 border-t border-slate-200" />
            </div>
            <Field label="Image URL" name="imageUrl" defaultValue={product.imageUrl ?? ""} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button asChild variant="outline">
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        step={type === "number" ? "0.01" : undefined}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}
