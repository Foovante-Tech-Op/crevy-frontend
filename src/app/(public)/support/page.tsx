"use client";

import {
  ArrowUpRight,
  Code2,
  MessageCircle,
  Search,
  Settings2,
  SquarePen,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type SupportCard = {
  icon: React.ElementType;
  title: string;
  description: string;
  cta: string;
  href?: string; // present + disabled=false → live card
  disabled?: boolean;
};

const cards: SupportCard[] = [
  {
    icon: Search,
    title: "Search the Help Desk",
    description: "Get quick answers to any questions about Crevy",
    cta: "Find answers",
    href: "/support/faq",
  },
  {
    icon: MessageCircle,
    title: "Get in touch",
    description: "Send us a message or chat when someone is available",
    cta: "Contact us",
    disabled: true,
  },
  {
    icon: Settings2,
    title: "Setup Guide",
    description: "Learn how to submit your green project for verification",
    cta: "Show me",
    href: "/support/setup-guide",
  },
  {
    icon: Code2,
    title: "API Documentation",
    description: "Learn how to build amazing things with the Crevy API",
    cta: "Read docs",
    href: "/support/api-docs",
  },
  {
    icon: SquarePen,
    title: "Suggest an improvement",
    description: "If you spot something that can be better, let us know",
    cta: "Make a suggestion",
    href: "/support/suggest",
  },
];

function SupportCardTile({ card }: { card: SupportCard }) {
  const { icon: Icon, title, description, cta, href, disabled } = card;

  const content = (
    <div
      className={cn(
        "bg-brand border border-slate-200 p-10 h-full flex flex-col transition-colors",
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:border-slate-900 group",
      )}
    >
      {!disabled ? null : (
        <span className="self-start mb-4 text-[9px] font-bold uppercase tracking-widest text-slate-400 border border-slate-200 px-2 py-1">
          Coming Soon
        </span>
      )}
      <div
        className={cn(
          "w-12 h-12 bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-900 mb-8 transition-colors",
          !disabled && "group-hover:bg-slate-900 group-hover:text-white",
        )}
      >
        <Icon size={20} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-semibold font-sans text-slate-900 tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-sm text-white font-light leading-relaxed mb-8 flex-1">
        {description}
      </p>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 self-start text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 border transition-colors",
          disabled
            ? "border-slate-200 text-slate-400"
            : "bg-foreground text-white group-hover:border-slate-900 group-hover:text-brand",
        )}
      >
        {cta}
        {!disabled && <ArrowUpRight size={14} />}
      </span>
    </div>
  );

  if (disabled || !href) {
    return <div aria-disabled="true">{content}</div>;
  }

  return (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  );
}

export default function SupportPage() {
  return (
    <div className="animate-in fade-in duration-700 pb-24 bg-slate-50 min-h-screen">
      {/* ── Editorial Header ── */}
      <div className="bg-white border-b border-slate-200 pt-24 pb-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-slate-900" />
            <span className="text-slate-900 text-[10px] font-bold uppercase tracking-[0.2em]">
              Help & Operations Center
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-sans text-slate-900 tracking-tight leading-none mb-6">
            Institutional <span className="italic text-brand">Support.</span>
          </h1>
          <p className="text-slate-500 text-lg font-light leading-relaxed max-w-2xl">
            Access methodology documentation, review cryptographic operational
            guidelines, or connect with our specialized support divisions.
          </p>
        </div>
      </div>

      {/* ── Support Card Grid ── */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {cards.slice(0, 3).map((card) => (
            <SupportCardTile key={card.title} card={card} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {cards.slice(3).map((card) => (
            <SupportCardTile key={card.title} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
}
