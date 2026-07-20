import Link from "next/link";
import { Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";

const contactEmail = "thankgaten@gmail.com";

export function SiteFooter() {
  return (
    <footer className="bg-[#17211c] text-white">
      <div className="section-shell grid gap-8 border-b border-white/15 py-9 sm:grid-cols-3">
        <FooterFact icon={MapPin} title="Visit us" text="India - Online appointments" />
        <FooterFact
          icon={Phone}
          title="Call us"
          text="+91 63622 70697"
          href="tel:+916362270697"
        />
        <FooterFact
          icon={Mail}
          title="Email us"
          text={contactEmail}
          href={`mailto:${contactEmail}`}
        />
      </div>

      <div className="section-shell grid gap-12 py-14 md:grid-cols-[1.2fr_.7fr_.7fr] lg:py-20">
        <div>
          <p className="font-serif text-3xl font-bold tracking-[.05em]">ST THANGKA</p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/60">
            Thoughtfully curated Himalayan Buddhist art for contemplative homes,
            meaningful gifts, and lasting collections.
          </p>
          <div className="mt-6 flex gap-2">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              title="Instagram"
              className="social-icon"
            >
              <Instagram />
            </a>
            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              title="YouTube"
              className="social-icon"
            >
              <Youtube />
            </a>
          </div>
        </div>

        <FooterLinks
          title="Quick links"
          links={[
            ["About us", "/about"],
            ["Contact us", "/contact"],
            ["Collection", "/products"],
            ["Your cart", "/checkout"],
          ]}
        />
        <FooterLinks
          title="Collector care"
          links={[
            ["Artwork guidance", "/contact"],
            ["Shipping enquiries", "/contact"],
            ["Private viewing", "/contact"],
            ["Secure checkout", "/checkout"],
          ]}
        />
      </div>

      <div className="border-t border-white/15">
        <div className="section-shell flex flex-col gap-2 py-5 text-xs text-white/40 sm:flex-row sm:justify-between">
          <p>&copy; {new Date().getFullYear()} ST Thangka. All rights reserved.</p>
          <p>Art, tradition, and thoughtful collecting.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterFact({
  icon: Icon,
  title,
  text,
  href,
}: {
  icon: typeof MapPin;
  title: string;
  text: string;
  href?: string;
}) {
  const content = (
    <>
      <Icon className="h-5 w-5 text-[#dca65a]" />
      <div>
        <p className="text-xs font-bold uppercase tracking-[.16em]">{title}</p>
        <p className="mt-1 break-all text-sm text-white/55">{text}</p>
      </div>
    </>
  );

  return href ? (
    <a href={href} className="flex items-center gap-4 transition hover:text-[#dca65a]">
      {content}
    </a>
  ) : (
    <div className="flex items-center gap-4">{content}</div>
  );
}

function FooterLinks({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <p className="footer-title">{title}</p>
      <div className="grid gap-3 text-sm text-white/65">
        {links.map(([label, href]) => (
          <Link key={label} href={href} className="transition hover:text-[#dca65a]">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
