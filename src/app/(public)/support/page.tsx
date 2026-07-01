"use client";

import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  FileText,
  LifeBuoy,
  Mail,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

export default function SupportPage() {
  const faqs = [
    {
      q: "How do I initialize an entity registration protocol?",
      a: "Entity onboarding is restricted to authorized personnel. Navigate to the Directory terminal and select 'Onboard Entity'. All KYC documentation must be verified before the profile achieves 'Active' status.",
    },
    {
      q: "What constitutes the dMRV framework?",
      a: "digital Monitoring, Reporting, and Verification (dMRV) is our core cryptographic and scientific framework. It bridges raw geospatial/sensor telemetry directly to Polygon mainnet assertions for absolute credit integrity.",
    },
    {
      q: "What is the standard SLA for methodology verification?",
      a: "Standard verification cycles run between 2 to 6 weeks, contingent upon the availability and resolution of the project's multimodal sensor and satellite data pipelines.",
    },
    {
      q: "How are financial disbursements routed?",
      a: "Payout vectors (Mobile Money or Institutional Bank Transfers) are configured during entity onboarding. Capital outflows are automatically settled upon the completion of verified credit transactions.",
    },
  ];

  const docs = [
    { title: "dMRV Technical Specification v1.0", category: "Architecture" },
    { title: "ISO 14064 Compliance Protocol", category: "Compliance" },
    { title: "Entity Onboarding & KYC Guide", category: "Operations" },
  ];

  return (
    <div className="animate-in fade-in duration-700 pb-24 bg-slate-50 min-h-screen">
      {/* ── Editorial Header & Search ── */}
      <div className="bg-white border-b border-slate-200 pt-24 pb-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-slate-900"></div>
            <span className="text-slate-900 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-700" />
              Help & Operations Center
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-serif text-slate-900 tracking-tight leading-none mb-6">
            Institutional{" "}
            <span className="italic text-slate-500">Support.</span>
          </h1>
          <p className="text-slate-500 text-lg font-light leading-relaxed max-w-2xl mb-12">
            Access methodology documentation, review cryptographic operational
            guidelines, or connect with our specialized support divisions.
          </p>

          {/* Stark Search Input */}
          <div className="relative max-w-3xl group">
            <Search
              className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-slate-900 transition-colors"
              strokeWidth={1.5}
            />
            <input
              placeholder="Query knowledge base, methodologies, or technical guidelines..."
              className="w-full bg-transparent border-b-2 border-slate-200 pl-12 pr-4 py-4 text-xl font-serif text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors rounded-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
        {/* ── Contact Channels Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-200 border border-slate-200 mb-20">
          <div className="bg-white p-10 hover:bg-slate-50 transition-colors group flex flex-col justify-between min-h-[280px]">
            <div>
              <div className="w-12 h-12 bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-900 mb-8 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <MessageCircle size={20} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-serif text-slate-900 tracking-tight mb-2">
                Live Terminal
              </h3>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-relaxed">
                Connect directly with a registry engineer.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                2 Min ETA
              </span>
              <button
                type="button"
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 hover:text-emerald-700 transition-colors flex items-center gap-1"
              >
                Initiate <ArrowUpRight size={14} />
              </button>
            </div>
          </div>

          <div className="bg-white p-10 hover:bg-slate-50 transition-colors group flex flex-col justify-between min-h-[280px]">
            <div>
              <div className="w-12 h-12 bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-900 mb-8 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <Mail size={20} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-serif text-slate-900 tracking-tight mb-2">
                Encrypted Mail
              </h3>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-relaxed">
                For complex queries and document submission.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-900">
                SUPPORT@CREVY.APP
              </span>
              <button
                type="button"
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 hover:text-emerald-700 transition-colors flex items-center gap-1"
              >
                Draft <ArrowUpRight size={14} />
              </button>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-10 flex flex-col justify-between min-h-[280px] relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 border border-white/20 flex items-center justify-center text-white mb-8">
                <Phone size={20} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-serif text-white tracking-tight mb-2">
                Institutional Hotline
              </h3>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-relaxed">
                24/7 dedicated line for high-volume traders and admins.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-white/20 flex items-center justify-between relative z-10">
              <span className="text-sm font-mono font-bold text-emerald-400">
                +233 504 609 989
              </span>
            </div>
            <div className="absolute -bottom-4 -right-4 opacity-10">
              <LifeBuoy size={160} />
            </div>
          </div>
        </div>

        {/* ── Knowledge Base & FAQs ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* FAQ Ledger */}
          <div className="lg:col-span-8">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 border-b-2 border-slate-900 pb-4 mb-8">
              Frequently Queried Protocols
            </h2>
            <div className="border border-slate-200 bg-white divide-y divide-slate-100">
              {faqs.map((f, i) => (
                <div
                  key={i}
                  className="p-8 hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-start gap-8">
                    <div>
                      <h4 className="font-serif text-lg text-slate-900 mb-3 group-hover:text-emerald-800 transition-colors leading-snug">
                        {f.q}
                      </h4>
                      <p className="text-sm text-slate-500 leading-relaxed font-light">
                        {f.a}
                      </p>
                    </div>
                    <div className="shrink-0 pt-1">
                      <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-slate-900 group-hover:text-slate-900 transition-all">
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Core Documentation */}
          <div className="lg:col-span-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 border-b-2 border-slate-900 pb-4 mb-8">
              Core Documentation
            </h2>
            <div className="space-y-4">
              {docs.map((doc, i) => (
                <Link
                  href="#"
                  key={i}
                  className="block p-6 border border-slate-200 bg-white hover:border-slate-900 transition-colors group"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <FileText className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      {doc.category}
                    </span>
                  </div>
                  <h4 className="font-serif text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {doc.title}
                  </h4>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-slate-400 group-hover:text-slate-900 transition-colors">
                    Access Resource <ArrowUpRight size={12} />
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 p-6 bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
                  Developer Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Access webhook configurations, API endpoints, and dMRV
                integration guides for your IoT infrastructure.
              </p>
              <button
                type="button"
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 hover:text-emerald-700 transition-colors flex items-center gap-1 border-b border-slate-900 pb-0.5 w-fit"
              >
                Open Portal <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
