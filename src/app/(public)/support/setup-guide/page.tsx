"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  ClipboardCheck,
  FileStack,
  Fingerprint,
  Radar,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

type Step = {
  index: string;
  icon: React.ElementType;
  title: string;
  description: string;
  details: string[];
};

const steps: Step[] = [
  {
    index: "01",
    icon: Fingerprint,
    title: "Register your entity",
    description:
      "Create your organization profile in the Directory and complete KYC verification.",
    details: [
      "Legal entity or individual identification documents",
      "Land tenure or usage rights documentation",
      "Payout vector configuration (Mobile Money or bank transfer)",
    ],
  },
  {
    index: "02",
    icon: FileStack,
    title: "Document your project",
    description:
      "Prepare baseline data and select the accounting methodology that matches your project type.",
    details: [
      "GPS boundaries and project area geometry",
      "Sector classification (Agriculture, Forestry, Waste, etc.)",
      "Baseline methodology selection from the Registry Library",
    ],
  },
  {
    index: "03",
    icon: Radar,
    title: "Connect telemetry",
    description:
      "Link satellite, SAR, or Edge IoT data sources so the dMRV pipeline can continuously observe your project.",
    details: [
      "Optical and SAR satellite coverage confirmation",
      "Edge IoT sensor installation, if applicable",
      "Cryptographic device attestation for terrestrial hardware",
    ],
  },
  {
    index: "04",
    icon: ClipboardCheck,
    title: "Submit for verification",
    description:
      "Our review team validates data integrity against the selected methodology. Standard cycles run 2 to 6 weeks.",
    details: [
      "Automated eligibility screening",
      "Manual review of multimodal sensor and satellite pipelines",
      "Clarification requests routed directly to your entity profile",
    ],
  },
  {
    index: "05",
    icon: ShieldCheck,
    title: "Credit issuance",
    description:
      "Once verified, credits are minted on-chain and made available in your portfolio for trading or retirement.",
    details: [
      "On-chain minting with immutable audit trail",
      "Credits appear in your Portfolio dashboard",
      "Disbursements settle automatically upon transaction",
    ],
  },
];

export default function SetupGuidePage() {
  return (
    <div className="animate-in fade-in duration-700 pb-24 bg-slate-50 min-h-screen">
      {/* ── Editorial Header ── */}
      <div className="bg-white border-b border-slate-200 pt-24 pb-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <Link
            href="/support"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-8"
          >
            <ArrowLeft className="w-3 h-3" /> Support
          </Link>

          <h1 className="text-4xl md:text-6xl font-sans text-slate-900 tracking-tight leading-none mb-6">
            Setup <span className="italic text-brand">Guide.</span>
          </h1>
          <p className="text-slate-500 text-lg font-light leading-relaxed max-w-2xl">
            Five steps from entity registration to your first verified credit
            issuance. Follow the sequence below to submit your green project for
            verification.
          </p>
        </div>
      </div>

      {/* ── Step Sequence ── */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
        <div className="border border-slate-200 bg-white divide-y divide-slate-100">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.index}
                className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-8"
              >
                <div className="md:col-span-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 font-mono">
                    {step.index}
                  </span>
                </div>
                <div className="md:col-span-3 flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-900 shrink-0">
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-semibold font-sans text-slate-900 tracking-tight leading-snug pt-2.5">
                    {step.title}
                  </h3>
                </div>
                <div className="md:col-span-8">
                  <p className="text-sm text-slate-500 font-light leading-relaxed mb-6">
                    {step.description}
                  </p>
                  <ul className="space-y-2.5">
                    {step.details.map((detail) => (
                      <li
                        key={detail}
                        className="text-sm text-slate-600 flex items-start gap-3"
                      >
                        <span className="w-1 h-1 bg-brand mt-2 shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── CTA Footer ── */}
        <div className="mt-6 bg-foreground text-white p-10 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-sans tracking-tight mb-2">
              Ready to register your project?
            </h3>
            <p className="text-slate-400 text-sm font-light max-w-lg">
              Start the intake flow now — your entity registration and project
              documentation can be completed in one session.
            </p>
          </div>
          <Link
            href="/get-started"
            className="inline-flex items-center gap-1.5 shrink-0 text-[10px] font-bold uppercase tracking-widest px-6 py-3.5 border border-white bg-brand text-foreground hover:bg-white transition-colors"
          >
            Get Started
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 font-light">
            Have questions about a specific step?{" "}
            <Link
              href="/support/faq"
              className="text-brand border-b border-brand"
            >
              Check the Help Desk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
