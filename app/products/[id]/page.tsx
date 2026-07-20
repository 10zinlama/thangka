import { ProductDetail } from "@/components/product-detail";
import { getProduct } from "@/lib/products";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product || !product.active) notFound();

  return <ProductDetail product={product} />;
}
