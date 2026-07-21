import type { Metadata } from "next";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

const contactEmail = "thankgaten@gmail.com";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact ST Thangka for artwork guidance, private viewings, shipping, and collector support.",
};

const methods = [
  {
    icon: Phone,
    title: "Call",
    value: "+91 63622 70697",
    href: "tel:+916362270697",
  },
  {
    icon: Mail,
    title: "Email",
    value: contactEmail,
    href: `mailto:${contactEmail}`,
  },
  {
    icon: Clock3,
    title: "Response time",
    value: "Within one business day",
  },
  {
    icon: MapPin,
    title: "Based in",
    value: "India - Serving collectors worldwide",
  },
];

export default function ContactPage() {
  return (
    <div className="bg-[#fbfaf7]">
      <section className="section-shell pb-10 pt-12 sm:pb-12 sm:pt-24">
        <p className="eyebrow">Contact</p>
        <h1 className="max-w-4xl text-balance font-serif text-4xl leading-[1.04] min-[380px]:text-5xl sm:text-7xl">
          Let&apos;s find the right work,{" "}
          <em className="text-[#a7442d]">together.</em>
        </h1>
        <p className="mt-6 max-w-2xl leading-7 text-black/55">
          Ask about artwork details, request a private video viewing, or get help
          with an existing order.
        </p>
      </section>

      <section className="section-shell grid gap-12 pb-20 lg:grid-cols-[.72fr_1.28fr] lg:pb-28">
        <aside className="border-t border-black/15">
          {methods.map(({ icon: Icon, title, value, href }) => (
            <div key={title} className="flex gap-4 border-b border-black/15 py-6">
              <Icon className="h-5 w-5 shrink-0 text-[#a7442d]" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[.15em] text-black/40">
                  {title}
                </p>
                {href ? (
                  <a
                    href={href}
                    className="mt-2 block break-all text-sm font-semibold hover:text-[#a7442d]"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="mt-2 text-sm font-semibold">{value}</p>
                )}
              </div>
            </div>
          ))}
        </aside>

        <div className="border border-black/12 bg-white p-5 min-[380px]:p-6 sm:p-10 lg:p-12">
          <h2 className="mb-8 font-serif text-3xl">Send an enquiry</h2>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
