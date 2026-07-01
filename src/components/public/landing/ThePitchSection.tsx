"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function ThePitchSection() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 space-y-24">
        {/* ── 1. PROJECT OWNERS (Supply) ── */}
        <PitchBlock
          tag="For Project Developers (Supply)"
          headline="Smart Carbon, Real Value."
          painPoint="Complex verification hurdles, delayed issuances, and fragmented buyer networks."
          bullets={[
            {
              title: "Diverse Buyer Network",
              desc: "Connect with a global network of corporate counterparties committed to genuine climate action and high-integrity environmental assets.",
            },
            {
              title: "Reduced Verification Timeline",
              desc: "Minimize the lag from project audit to credit issuance. Our platform streamlines dMRV data ingestion and registry processing.",
            },
            {
              title: "Lifecycle Technical Support",
              desc: "Receive dedicated operational and technical guidance from project inception through the asset's entire verifiable lifetime.",
            },
          ]}
          cta={{ label: "Calculate Your Revenue Potential", href: "/register" }}
          align="left"
        />

        {/* ── 2. ORGANIZATIONS (Demand) ── */}
        <PitchBlock
          tag="For Corporate Buyers (Demand)"
          headline="Retire with Confidence. Defend Your ESG Report."
          painPoint="Fear of reputational risk, double counting, and low-quality junk credits."
          bullets={[
            {
              title: "Radical Transparency",
              desc: "Track every credit from project audit to public retirement. No double counting. No ambiguity.",
            },
            {
              title: "Quality First",
              desc: "We only list credits that meet Core Carbon Principles (CCP) or equivalent gold standards. Zero 'junk credits'.",
            },
            {
              title: "Instant Retirement",
              desc: "Generate a public, immutable retirement certificate ready for your annual sustainability audit.",
            },
            {
              title: "Portfolio Diversification",
              desc: "Choose from Nature-Based (REDD+, Blue Carbon), Tech-Based (DAC), or Renewable Energy.",
            },
          ]}
          cta={{ label: "Explore the Spot Market", href: "/marketplace" }}
          align="right"
        />

        {/* ── 3. AUDITORS (Credibility) ── */}
        <PitchBlock
          tag="For Auditors & Verifiers (Credibility)"
          headline="The Data Framework You Can Actually Trust."
          painPoint="Inconsistent data standards and difficulty tracking historical provenance."
          bullets={[
            {
              title: "Immutable Audit Trail",
              desc: "Every transaction (issuance, transfer, retirement) is time-stamped and mathematically unchangeable.",
            },
            {
              title: "Standardized Data Schema",
              desc: "Our API outputs data in strict alignment with GHG Protocol and SBTi reporting requirements.",
            },
            {
              title: "No Retroactive Changes",
              desc: "Unlike standard spreadsheets, our registry prevents historical data manipulation post-anchor.",
            },
            {
              title: "Open Source Verification",
              desc: "Auditors receive read-only cryptographic access to project monitoring reports and serial hashes.",
            },
          ]}
          cta={{ label: "Request Auditor Access", href: "/contact" }}
          align="left"
        />
      </div>
    </section>
  );
}

function PitchBlock({ tag, headline, painPoint, bullets, cta, align }: any) {
  const isRight = align === "right";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className={cn(
        "flex flex-col lg:flex-row gap-12 lg:gap-24",
        isRight ? "lg:flex-row-reverse" : "",
      )}
    >
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">
          {tag}
        </p>
        <h2 className="text-4xl md:text-5xl text-slate-900 leading-tight tracking-tight mb-6">
          {headline}
        </h2>
        <div className="bg-brand/20 border-2 border-brand p-4 mb-8">
          <p className="text-xs font-mono uppercase tracking-widest mb-1">
            Industry Pain Point:
          </p>
          <p className="text-sm">{painPoint}</p>
        </div>
        <Link
          href={cta.href}
          className="inline-flex items-center gap-3 bg-brand text-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 transition-colors"
        >
          {cta.label} <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="flex-1 bg-white border border-slate-200 p-8 md:p-10">
        <div className="space-y-8">
          {bullets.map((b: any, i: number) => (
            <div key={i} className="flex items-start gap-4">
              <div className="mt-1 p-1 bg-brand/10 text-brand shrink-0 rounded-full">
                <Check size={14} strokeWidth={3} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">{b.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
