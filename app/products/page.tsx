import { ProductList } from "@/components/product-list";
import { getProducts } from "@/lib/products";

export default async function ProductsPage() {
  const products = await getProducts(100);

  return (
    <div className="bg-[#f7f5f0] text-[#171713]">
      <section className="border-b border-black/10 py-10 sm:py-12 lg:py-16">
        <div className="section-shell">
          <p className="eyebrow">The collection</p>
          <h1 className="max-w-4xl text-balance text-4xl font-medium leading-[1.04] min-[380px]:text-5xl sm:text-6xl lg:text-7xl">Find a work that <span className="font-serif italic text-[#b7502b]">speaks to you.</span></h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-black/55">Original sacred works, thoughtfully documented and ready to become part of your story.</p>
        </div>
      </section>

      <section className="section-shell py-10 lg:py-16">
        <ProductList products={products} />
      </section>
    </div>
  );
}
