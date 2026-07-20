"use client";

import Link from "next/link";
import { ChevronDown, MessageCircleMore, Star } from "lucide-react";
import { useState } from "react";

const reviews = [
  ["Maya R.", "London", "The guidance was thoughtful and the painting completely changed my meditation room."],
  ["Daniel K.", "Singapore", "Beautifully documented, carefully packed, and delivered in perfect condition."],
  ["Anika S.", "Toronto", "The curator helped me choose a deeply meaningful gift without any pressure."],
  ["Tenzin P.", "Bengaluru", "The details are extraordinary. It feels even more alive in person."],
  ["Sofia M.", "Madrid", "Every question was answered with patience. A wonderful first collecting experience."],
  ["David L.", "New York", "A rare mix of genuine knowledge, responsive service, and beautiful work."],
  ["Priya A.", "Delhi", "The scale and colours were exactly as described. It belongs in our home."],
  ["Noah W.", "Sydney", "From first enquiry to delivery, the whole experience felt considered."],
];

const faqs = [
  ["How do I choose the right thangka?", "Begin with the figure or quality that resonates with you, then consider scale and the room. Our curator can help you narrow the collection."],
  ["Are the artworks handmade?", "Each product page identifies the technique and details available for that work. Contact us for close-up images or additional documentation."],
  ["How is artwork packed and shipped?", "Each piece is carefully protected, securely packed, and sent with the most suitable insured delivery service for its destination."],
  ["Can I request a private viewing?", "Yes. We can arrange a guided video viewing and share additional detail photographs before you decide."],
];

export function HomeExperience() {
  const [open, setOpen] = useState(0);
  return <>
    <section className="bg-[#edf0e9] py-18 lg:py-24"><div className="section-shell"><div className="mb-9 flex items-end justify-between"><div><p className="eyebrow">Collector reviews</p><h2 className="section-title">Trusted <span>worldwide.</span></h2></div><p className="hidden text-sm text-black/50 sm:block">Five-star collector care</p></div>
      <div className="review-window"><div className="review-track">{[...reviews,...reviews].map(([name,place,quote],index) => <article key={`${name}-${index}`} className="review-card"><div className="flex gap-0.5 text-[#a7442d]">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-3.5 w-3.5 fill-current" />)}</div><p className="mt-4 text-sm leading-6">“{quote}”</p><div className="mt-5 border-t border-black/10 pt-4"><p className="text-sm font-bold">{name}</p><p className="text-xs text-black/45">Collector · {place}</p></div></article>)}</div></div>
    </div></section>

    <section className="bg-[#fbfaf7] py-20 lg:py-28"><div className="section-shell grid gap-12 lg:grid-cols-[.75fr_1.25fr]"><div><p className="eyebrow">Collector guidance</p><h2 className="section-title">Questions, <span>answered.</span></h2><p className="mt-5 max-w-sm text-sm leading-6 text-black/55">A real person can help with subject, scale, condition, and delivery.</p><Link href="/contact" className="mt-7 inline-flex items-center gap-2 text-sm font-bold"><MessageCircleMore className="h-4 w-4"/> Ask a curator</Link></div><div className="border-y border-black/15">{faqs.map(([question,answer],index)=><div key={question} className="border-b border-black/15 last:border-0"><button className="flex w-full items-center justify-between gap-5 py-6 text-left font-bold" onClick={()=>setOpen(open===index?-1:index)} aria-expanded={open===index}>{question}<ChevronDown className={`h-4 w-4 shrink-0 transition ${open===index?"rotate-180":""}`}/></button><div className={`grid transition-[grid-template-rows,opacity] duration-300 ${open===index?"grid-rows-[1fr] opacity-100":"grid-rows-[0fr] opacity-0"}`}><div className="overflow-hidden"><p className="max-w-2xl pb-6 text-sm leading-7 text-black/55">{answer}</p></div></div></div>)}</div></div></section>
  </>;
}
