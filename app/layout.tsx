import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { SiteFooter } from "@/components/site-footer";
import { SiteAnalyticsTracker } from "@/components/site-analytics-tracker";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://thangka.vercel.app"),
  title: { default: "ST Thangka | Sacred Himalayan Art", template: "%s | ST Thangka" },
  description: "Curated thangka paintings and Himalayan Buddhist art, delivered worldwide with collector care.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#fbfaf7] text-[#151914] antialiased"
      >
        <ClerkProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-7rem)]">{children}</main>
          <SiteFooter />
          <SiteAnalyticsTracker />
          <Analytics />
        </ClerkProvider>
      </body>
    </html>
  );
}
