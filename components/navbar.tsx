"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Collection" },
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Contact" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [serverAdmin, setServerAdmin] = useState(false);
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const isAdmin = serverAdmin || user?.publicMetadata.role === "admin";

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!isSignedIn) {
      setServerAdmin(false);
      return;
    }
    fetch("/api/admin-status", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { isAdmin?: boolean }) => setServerAdmin(Boolean(data.isAdmin)))
      .catch(() => setServerAdmin(false));
  }, [isSignedIn]);
  if (pathname.startsWith("/admin")) return null;

  return <>
    <div className="bg-[#1d2a24] px-4 py-2 text-center text-[10px] font-semibold uppercase leading-5 tracking-[.12em] text-white sm:text-xs sm:tracking-[.16em]">Curated Himalayan art <span className="mx-2 text-[#dca65a]">*</span> Insured worldwide delivery</div>
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#fbfaf7]/95 backdrop-blur-xl">
      <div className="section-shell grid h-[76px] grid-cols-[1fr_auto] items-center lg:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="w-fit leading-none" aria-label="ST Thangka home"><span className="block font-serif text-xl font-bold tracking-[.08em]">ST THANGKA</span><span className="mt-1 block text-[8px] font-bold uppercase tracking-[.42em] text-[#a7442d]">Sacred Art</span></Link>
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">{links.map((link) => <NavLink key={link.href} {...link} active={link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)} />)}{isAdmin && <NavLink href="/admin" label="Dashboard" active={pathname.startsWith("/admin")} />}</nav>
        <div className="flex items-center justify-end gap-1">
          <Link href="/products" aria-label="Search the collection" title="Search" className="nav-icon"><Search /></Link>
          <Link href="/checkout" aria-label={`Shopping bag with ${cartCount} items`} title="Shopping bag" className="nav-icon relative"><ShoppingBag />{cartCount > 0 && <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-[#a7442d] px-1 text-[10px] font-bold text-white">{cartCount}</span>}</Link>
          {isSignedIn ? <div className="ml-1 hidden sm:block"><UserButton /></div> : <SignInButton mode="modal"><button className="nav-icon hidden sm:grid" aria-label="Sign in" title="Sign in"><UserRound /></button></SignInButton>}
          <button onClick={() => setOpen(!open)} className="nav-icon lg:hidden" aria-label="Toggle menu" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      <div className={cn("grid overflow-hidden bg-[#fbfaf7] transition-[grid-template-rows] duration-300 lg:hidden", open ? "grid-rows-[1fr] border-t border-black/10" : "grid-rows-[0fr]")}><div className="min-h-0"><nav className="section-shell grid py-5" aria-label="Mobile navigation">{links.map((link) => <NavLink key={link.href} {...link} active={link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)} mobile />)}{isAdmin && <NavLink href="/admin" label="Dashboard" active mobile />}{isSignedIn ? <div className="border-b border-black/10 py-4 sm:hidden"><UserButton /></div> : <SignInButton mode="modal"><button className="mt-3 h-12 border border-black/15 text-sm font-semibold">Sign in</button></SignInButton>}</nav></div></div>
    </header>
  </>;
};

function NavLink({ href, label, active, mobile = false }: { href: string; label: string; active: boolean; mobile?: boolean }) {
  return <Link href={href} className={cn("relative text-sm font-semibold transition-colors hover:text-[#a7442d]", mobile ? "border-b border-black/10 py-4 text-lg" : "py-2", active ? "text-[#a7442d]" : "text-black/65")}>{label}{active && !mobile && <span className="absolute inset-x-0 -bottom-0.5 h-px bg-[#a7442d]" />}</Link>;
}
