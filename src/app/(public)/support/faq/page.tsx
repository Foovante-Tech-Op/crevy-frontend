"use client";

import { ArrowLeft, ChevronRight, Search, XCircle } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const faqs = [
  {
    q: "What is Crevy and who is it for?",
    a: "Crevy is a carbon credit marketplace that connects project developers (who create carbon credits through verified green projects) with corporate buyers (who purchase credits to offset their emissions). We also support auditors, field agents, and institutional partners who need transparent access to verified carbon data. Whether you're a farmer practicing regenerative agriculture, a corporation pursuing ESG goals, or a verifier ensuring data integrity—Crevy is built for you.",
  },
  {
    q: "How do I register a carbon project on Crevy?",
    a: "To register a project, you'll need to sign up as a Project Developer and complete KYC verification. Once approved, navigate to 'Register Project' from your dashboard, select your project type (Reforestation, Regenerative Agriculture, Renewable Energy, Biochar, Blue Carbon, or Waste Management), and submit your project details including location, methodology, and estimated carbon impact. Our team will review your submission and guide you through the verification process.",
  },
  {
    q: "What types of carbon projects does Crevy support?",
    a: "We support six main project categories: Regenerative Agriculture (soil-building practices), Reforestation (native forest restoration), Renewable Energy (solar, hydro, wind), Biochar (organic waste conversion), Blue Carbon (mangrove and wetland restoration), and Waste Management (methane capture). Each project type follows recognized standards like Verra, Gold Standard, or Puro.earth to ensure credit quality and market acceptance.",
  },
  {
    q: "How does the verification process work?",
    a: "Our digital MRV (Monitoring, Reporting, and Verification) process typically takes 2-6 weeks. We collect satellite imagery, sensor data, and field reports to validate your project's carbon sequestration claims. Once verified, credits are issued and can be listed on our marketplace. You can track your verification status in real-time from your dashboard, and our MRV admins are available to answer questions throughout the process.",
  },
  {
    q: "How do I buy carbon credits on the marketplace?",
    a: "Browse our marketplace to view verified projects filtered by type, region, price, or UN Sustainable Development Goals. Each project listing shows the credit price, total available credits, verification status, and impact metrics. Select a project, specify the number of credits you want to purchase, and complete checkout. You'll receive a retirement certificate that you can use for ESG reporting and sustainability disclosures.",
  },
  {
    q: "What payment methods are supported?",
    a: "Crevy supports Mobile Money (for regions where it's prevalent) and institutional bank transfers. Payment preferences are configured during your account setup. For project developers, payouts are automatically processed once credits are sold and the transaction is confirmed. Corporate buyers can pay via bank transfer or integrated payment gateways depending on their region.",
  },
  {
    q: "What is the Carbon Calculator and how does it work?",
    a: "Our Carbon Calculator helps individuals and organizations estimate their annual carbon footprint based on household size, transportation habits, energy usage, and diet. Simply answer a few questions about your lifestyle, and we'll calculate your estimated CO2 emissions in tonnes per year. This helps you understand your environmental impact and identify areas where you can reduce emissions or offset through carbon credits.",
  },
  {
    q: "What are the different user roles on Crevy?",
    a: "Crevy has several roles: Project Owners (register and manage carbon projects), Project Admins (oversee field agents and project developers), Field Agents (register project developers on-site), Corporate Buyers (purchase credits for ESG compliance), MRV Admins (verify project data), and Auditors (review transaction records). Each role has specific permissions and dashboard views tailored to their responsibilities.",
  },
  {
    q: "How does Crevy ensure credit quality and prevent double-counting?",
    a: "Every credit on Crevy is backed by verified data aligned with Core Carbon Principles (CCP) and recognized standards like Verra, Gold Standard, or CDM. Our blockchain-anchored registry creates an immutable audit trail—once a credit is issued, transferred, or retired, the transaction is permanently recorded and cannot be altered. This prevents double-counting and ensures full transparency for buyers and auditors.",
  },
  {
    q: "Can I track my portfolio and generate ESG reports?",
    a: "Yes. Corporate buyers and institutional users have access to a portfolio dashboard showing all purchased credits, their project origins, and retirement status. You can generate compliance-ready ESG reports that break down your offset portfolio by project type, region, and UN SDG alignment. These reports are formatted to meet GHG Protocol and SBTi reporting requirements for your annual sustainability disclosures.",
  },
];

export default function SupportFaqPage() {
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="animate-in fade-in duration-700 pb-24 bg-slate-50 min-h-screen">
      {/* ── Editorial Header & Search ── */}
      <div className="bg-white border-b border-slate-200 pt-24 pb-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <Link
            href="/support"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-8"
          >
            <ArrowLeft className="w-3 h-3" /> Support
          </Link>

          <h1 className="text-4xl md:text-6xl font-sans text-slate-900 tracking-tight leading-none mb-6">
            Help <span className="italic text-brand">Desk.</span>
          </h1>
          <p className="text-slate-500 text-lg font-light leading-relaxed max-w-2xl mb-12">
            Search frequently queried protocols, or browse the full ledger
            below.
          </p>

          <div className="relative max-w-3xl group">
            <Search
              className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-slate-900 transition-colors"
              strokeWidth={1.5}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Query the help desk..."
              className="w-full bg-transparent border-b-2 border-slate-200 pl-12 pr-4 py-4 text-xl font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors rounded-none"
            />
          </div>
        </div>
      </div>

      {/* ── FAQ Ledger ── */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 border-b-2 border-slate-900 pb-4 mb-8">
          Frequently Asked Questions
        </h2>

        {filtered.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center border border-slate-200 bg-white text-center">
            <XCircle className="h-8 w-8 text-slate-300 mb-4" />
            <p className="font-sans text-lg text-slate-900 mb-1">
              No matching entries
            </p>
            <p className="text-sm text-slate-500 font-light">
              Try a different search term, or{" "}
              <Link
                href="/support"
                className="text-brand border-b border-brand"
              >
                get in touch
              </Link>{" "}
              directly.
            </p>
          </div>
        ) : (
          <div className="border border-slate-200 bg-white divide-y divide-slate-100">
            {filtered.map((f) => {
              const originalIndex = faqs.indexOf(f);
              const isOpen = openIndex === originalIndex;
              return (
                <button
                  type="button"
                  key={f.q}
                  className="p-8 hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => setOpenIndex(isOpen ? null : originalIndex)}
                >
                  <div className="flex justify-between items-start gap-8">
                    <div className="flex-1">
                      <h4 className="font-sans text-lg text-foreground mb-3 group-hover:text-brand transition-colors leading-snug">
                        {f.q}
                      </h4>
                      {isOpen && (
                        <p className="text-sm text-slate-500 leading-relaxed font-light animate-in fade-in duration-300">
                          {f.a}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 pt-1">
                      <div
                        className={`w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-slate-900 group-hover:text-slate-900 transition-all ${
                          isOpen
                            ? "rotate-90 border-slate-900 text-slate-900"
                            : ""
                        }`}
                      >
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
