import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Globe2, HeartHandshake, ShieldCheck } from "lucide-react";
import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { HomeExperience } from "@/components/home-experience";

export default async function Home() {
  const products = await getProducts(12);

  return (
    <div className="overflow-hidden">
      <section className="relative min-h-[min(760px,calc(100svh-108px))] bg-[#17211c] text-white sm:min-h-[calc(100svh-108px)]">
        <Image
          src="/thangka-hero.png"
          alt="A framed thangka painting in a contemplative interior"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,17,13,.94)_0%,rgba(10,17,13,.74)_52%,rgba(10,17,13,.28)_100%)] sm:bg-[linear-gradient(90deg,rgba(10,17,13,.9)_0%,rgba(10,17,13,.68)_43%,rgba(10,17,13,.12)_78%)]" />
        <div className="section-shell relative flex min-h-[min(760px,calc(100svh-108px))] items-end pb-12 pt-16 sm:min-h-[calc(100svh-108px)] sm:items-center sm:pb-20">
          <div className="max-w-3xl animate-rise">
            <p className="eyebrow !text-[#e5bd7b]">Sacred Himalayan art - Curated in India</p>
            <h1 className="max-w-[11ch] text-balance font-serif text-4xl font-medium leading-[1.02] min-[380px]:text-5xl sm:max-w-3xl sm:text-7xl lg:text-[6.8rem]">
              Bring home a work of <em className="text-[#e5bd7b]">presence.</em>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/72 sm:text-lg">
              Distinctive thangka paintings selected for their craft, symbolism, and ability to
              transform a space.
            </p>
            <div className="mt-8 grid gap-3 min-[420px]:flex min-[420px]:flex-wrap">
              <Link href="/products" className="button-light">
                Shop the collection <ArrowRight />
              </Link>
              <Link href="/about" className="button-outline">
                Discover our story
              </Link>
            </div>
          </div>
          <div className="absolute bottom-5 right-4 hidden text-right text-xs uppercase tracking-[.15em] text-white/55 sm:block sm:right-6 lg:right-8">
            <p>ST Thangka</p>
            <p className="mt-1 font-semibold text-white">Sacred art for meaningful spaces</p>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-white">
        <div className="section-shell grid divide-y divide-black/10 py-1 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          <Trust icon={BadgeCheck} title="Curated works" text="Selected with care" />
          <Trust icon={ShieldCheck} title="Secure payment" text="Protected checkout" />
          <Trust icon={Globe2} title="Worldwide delivery" text="Insured shipping" />
          <Trust
            icon={HeartHandshake}
            title="Personal support"
            text="Before and after purchase"
          />
        </div>
      </section>

      <section className="section-shell py-16 lg:py-28">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Curated collection</p>
            <h2 className="section-title">
              Art with <span>meaning.</span>
            </h2>
          </div>
          <Link href="/products" className="hidden items-center gap-2 text-sm font-bold sm:flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 min-[480px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.slice(0, 10).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <Link href="/products" className="mt-8 inline-flex items-center gap-2 text-sm font-bold sm:hidden">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="bg-[#a7442d] text-white">
        <div className="section-shell grid min-h-[520px] lg:grid-cols-2">
          <div className="flex flex-col justify-center py-14 lg:pr-20">
            <p className="eyebrow !text-white/60">A living tradition</p>
            <h2 className="text-balance font-serif text-4xl leading-[1.04] sm:text-6xl">
              More than decoration. A visual practice.
            </h2>
            <p className="mt-6 max-w-lg leading-7 text-white/70">
              Thangka painting carries centuries of Buddhist iconography, disciplined craft, and
              contemplative purpose. We help collectors approach each work with context and
              confidence.
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex w-fit items-center gap-2 border-b border-white/40 pb-2 text-sm font-bold"
            >
              How we curate <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative min-h-80 overflow-hidden lg:min-h-full">
            <Image
              src="/thangka-hero.png"
              alt="Detail of a framed thangka painting"
              fill
              sizes="(min-width:1024px) 50vw,100vw"
              className="object-cover object-right"
            />
          </div>
        </div>
      </section>
      <HomeExperience />
    </div>
  );
}

function Trust({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof BadgeCheck;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-5 sm:px-6">
      <Icon className="h-5 w-5 shrink-0 text-[#a7442d]" />
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-0.5 text-xs text-black/45">{text}</p>
      </div>
    </div>
  );
}
