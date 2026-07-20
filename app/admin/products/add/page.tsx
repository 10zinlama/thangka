import Link from "next/link";
import { createProductAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploadField } from "@/components/image-upload-field";

export default function AddProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Product</h1>
        <p className="text-sm text-slate-500">
          Create storefront details and connect a Stripe checkout price.
        </p>
      </div>

      <form action={createProductAction} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Description</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <Field label="Product Name" name="name" placeholder="Enter product name" />
            <Field label="Category" name="category" placeholder="Thangka, Mandala" />
            <Field label="Brand" name="brand" placeholder="Artist or collection" />
            <Field label="Color" name="color" placeholder="Primary color" />
            <Field label="Weight (KG)" name="weight" type="number" placeholder="1.5" />
            <Field label="Length (CM)" name="length" type="number" placeholder="120" />
            <Field label="Width (CM)" name="width" type="number" placeholder="80" />
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Description</label>
              <textarea
                name="description"
                rows={6}
                placeholder="Product description"
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
            <Field label="Price" name="price" type="number" placeholder="199.00" />
            <Field label="Currency" name="currency" placeholder="usd" defaultValue="usd" />
            <Field label="Stock Quantity" name="stock" type="number" placeholder="10" />
            <div className="md:col-span-3">
              <label className="mb-2 block text-sm font-medium">
                Availability Status
              </label>
              <select
                name="availability"
                defaultValue="in_stock"
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
            <ImageUploadField />
            <div className="relative text-center text-xs uppercase tracking-wide text-slate-400">
              <span className="bg-white px-3">or paste a hosted URL</span>
              <div className="absolute left-0 right-0 top-1/2 -z-10 border-t border-slate-200" />
            </div>
            <Field
              label="Image URL"
              name="imageUrl"
              placeholder="https://example.com/product-image.jpg"
            />
            <p className="text-xs text-slate-500">
              Uploaded files are stored in Vercel Blob and linked to the new
              product. The URL field is optional when you upload a file.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button asChild variant="outline">
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button type="submit">Publish Product</Button>
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

