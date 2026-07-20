import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminProductsTable } from "@/components/admin-products-table";
import { getAdminProducts } from "@/lib/products";

export default async function AdminProductsPage() {
  const products = await getAdminProducts(100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-slate-500">
            Search, filter, edit, and publish products shown in the storefront.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/add" prefetch>
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products List</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminProductsTable products={products} />
        </CardContent>
      </Card>
    </div>
  );
}
