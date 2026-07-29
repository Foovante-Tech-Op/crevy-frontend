"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  BookOpen,
  Briefcase,
  Building2,
  FileText,
  Gavel,
  Globe,
  HelpCircle,
  Leaf,
  Scale,
  ShieldAlert,
  UserCheck,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// ─── INSTITUTIONAL POLICY SECTIONS ───────────────────────────────────────────

const SECTIONS = [
  { id: "acceptance", label: "1. Acceptance of Terms", icon: BadgeCheck },
  { id: "definitions", label: "2. Protocol Definitions", icon: BookOpen },
  { id: "eligibility", label: "3. Identity & Eligibility", icon: UserCheck },
  { id: "platform-use", label: "4. Infrastructure Use", icon: Globe },
  { id: "prohibited", label: "5. Prohibited Vectors", icon: ShieldAlert },
  { id: "carbon-credits", label: "6. Asset Immutability", icon: Leaf },
  {
    id: "project-developers",
    label: "7. Developer Obligations",
    icon: Briefcase,
  },
  { id: "corporate-buyers", label: "8. Institutional Buyers", icon: Building2 },
  { id: "payments", label: "9. Settlement & Fees", icon: Wallet },
  { id: "ip", label: "10. Intellectual Property", icon: FileText },
  { id: "governing-law", label: "11. Governing Law", icon: Gavel },
  { id: "disputes", label: "12. Dispute Resolution", icon: Scale },
  { id: "changes", label: "13. Protocol Amendments", icon: HelpCircle },
];

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState("acceptance");

  // Intersection Observer for scroll tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -80% 0px" },
    );

    SECTIONS.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="animate-in fade-in duration-700 bg-slate-50 min-h-screen pb-24 selection:bg-slate-900 selection:text-white">
      <TermsHero />
      <TermsContent
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
    </div>
  );
}

// ─── 1. HERO SECTION ─────────────────────────────────────────────────────────

function TermsHero() {
  return (
    <section className="bg-white border-b border-slate-200 pt-32 pb-16">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <div className="flex items-center gap-4 mb-12">
            <span className="w-2 h-2 bg-slate-900 rounded-none shrink-0" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Governance Protocol
            </span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl text-slate-900 tracking-tight leading-[1.05] mb-8">
            Terms of <br />
            <span className="italic text-slate-500">Service Protocol.</span>
          </h1>

          <p className="text-slate-600 text-lg leading-relaxed mb-12 max-w-2xl font-light">
            These Terms of Service ("Terms") dictate the legal parameters for
            accessing and utilizing the Crevy platform, an institutional-grade
            environmental asset registry operated by Foovante Global Ltd.
          </p>

          <div className="flex flex-col sm:flex-row gap-px bg-slate-200 border border-slate-200 w-fit">
            <div className="bg-white px-6 py-4 flex flex-col gap-1">
              <span className="font-bold text-[9px] uppercase tracking-widest text-slate-400">
                Last Revised
              </span>
              <span className="font-mono text-sm font-bold text-slate-900">
                03 APR 2026
              </span>
            </div>
            <div className="bg-white px-6 py-4 flex flex-col gap-1">
              <span className="font-bold text-[9px] uppercase tracking-widest text-slate-400">
                Enforcement Date
              </span>
              <span className="font-mono text-sm font-bold text-slate-900">
                03 APR 2026
              </span>
            </div>
            <div className="bg-white px-6 py-4 flex flex-col gap-1">
              <span className="font-bold text-[9px] uppercase tracking-widest text-slate-400">
                Jurisdiction
              </span>
              <span className="font-mono text-sm font-bold text-slate-900">
                REPUBLIC OF GHANA
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── 2. CONTENT MATRIX ───────────────────────────────────────────────────────

function TermsContent({
  activeSection,
  setActiveSection,
}: {
  activeSection: string;
  setActiveSection: (id: string) => void;
}) {
  return (
    <section className="py-16">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* ── Index / Table of Contents ── */}
          <aside className="lg:w-64 shrink-0 hidden md:block">
            <div className="sticky top-32">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-200 pb-4">
                Protocol Index
              </p>
              <nav className="space-y-0" aria-label="Terms of service sections">
                {SECTIONS.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "flex items-center gap-3 py-3 text-[10px] font-bold uppercase tracking-widest transition-all border-l-2",
                      activeSection === section.id
                        ? "border-slate-900 text-slate-900 bg-white"
                        : "border-transparent text-slate-400 hover:text-slate-900 hover:bg-white/50 pl-2",
                      "pl-4",
                    )}
                  >
                    {section.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* ── Legal Text ── */}
          <div className="flex-1 bg-white border border-slate-200 p-8 md:p-16">
            <div className="space-y-24">
              <TermsSection id="acceptance" title="1. Acceptance of Terms">
                <p>
                  By accessing, registering for, or utilizing the Crevy platform
                  infrastructure (the "Platform"), you mathematically and
                  legally bind yourself to these Terms. If you are accepting
                  these Terms on behalf of a corporation, government entity, or
                  other legal organization, you represent and warrant that you
                  possess the requisite authority to bind said entity to this
                  protocol.
                </p>
              </TermsSection>

              <TermsSection id="definitions" title="2. Protocol Definitions">
                <ul className="list-disc pl-5 space-y-4 mt-4 marker:text-emerald-700">
                  <li>
                    <strong>"Carbon Asset" or "Credit"</strong> refers to a
                    cryptographically verified unit representing the removal or
                    avoidance of one metric tonne of carbon dioxide equivalent
                    (tCO₂e).
                  </li>
                  <li>
                    <strong>"dMRV"</strong> refers to digital Measurement,
                    Reporting, and Verification utilizing IoT, satellite
                    telemetry, and AI algorithms to establish asset integrity.
                  </li>
                  <li>
                    <strong>"Developer"</strong> refers to the individual or
                    entity managing the land or project responsible for the
                    carbon sequestration.
                  </li>
                  <li>
                    <strong>"Institutional Buyer"</strong> refers to a corporate
                    entity utilizing the Platform to acquire Carbon Assets for
                    ESG compliance or offset purposes.
                  </li>
                  <li>
                    <strong>"Ledger"</strong> refers to the Polygon public
                    blockchain network utilized by Crevy for immutable data
                    anchoring.
                  </li>
                </ul>
              </TermsSection>

              <TermsSection id="eligibility" title="3. Identity & Eligibility">
                <p>
                  Access to the Platform is strictly gated by comprehensive Know
                  Your Customer (KYC) and Know Your Business (KYB) protocols.
                  You must be at least 18 years of age or a legally registered
                  corporate entity. We reserve the sovereign right to deny
                  platform access if identity verification fails or if the
                  entity is subject to international financial sanctions.
                </p>
              </TermsSection>

              <TermsSection id="platform-use" title="4. Infrastructure Use">
                <p>
                  You are granted a non-exclusive, non-transferable, revocable
                  license to access the Platform. You are solely responsible for
                  maintaining the cryptographic security of your account
                  credentials (including TOTP/MFA devices). Foovante Global Ltd
                  holds zero liability for asset loss stemming from compromised
                  user credentials.
                </p>
              </TermsSection>

              <TermsSection id="prohibited" title="5. Prohibited Vectors">
                <p>
                  Under penalty of immediate account termination and legal
                  prosecution, you agree NOT to:
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-4 marker:text-emerald-700">
                  <li>
                    Tamper with, spoof, or manipulate dMRV IoT sensors or
                    satellite telemetry data.
                  </li>
                  <li>
                    Attempt to register Carbon Assets that have already been
                    issued, retired, or claimed on another registry (Double
                    Counting).
                  </li>
                  <li>
                    Utilize the Platform for money laundering, terrorist
                    financing, or sanctions evasion.
                  </li>
                  <li>
                    Deploy automated scripts, bots, or scrapers against the
                    Platform APIs without explicit, written authorization.
                  </li>
                </ul>
              </TermsSection>

              <TermsSection
                id="carbon-credits"
                title="6. Asset Immutability & Status"
              >
                <p>
                  Carbon Assets issued on the Platform are immutable. Once an
                  Institutional Buyer executes a "Retirement" action, the asset
                  is permanently burned on the public Ledger to prevent
                  double-spending. Retired assets cannot be reversed, refunded,
                  or transferred under any circumstance.
                </p>
              </TermsSection>

              <TermsSection
                id="project-developers"
                title="7. Developer Obligations"
              >
                <p>
                  Developers warrant that they hold undisputed legal title or
                  carbon rights to the registered land. Developers must grant
                  Crevy and authorized third-party auditors (VVBs) physical and
                  digital access to the project site for verification purposes.
                  Discovery of fraudulent land claims will result in immediate
                  asset seizure and notification of local law enforcement.
                </p>
              </TermsSection>

              <TermsSection
                id="corporate-buyers"
                title="8. Institutional Buyer Terms"
              >
                <p>
                  Institutional Buyers acknowledge that carbon markets carry
                  inherent regulatory and pricing risks. Foovante Global Ltd
                  does not guarantee the future market value of any acquired
                  Carbon Asset. All acquisitions are final upon settlement.
                </p>
              </TermsSection>

              <TermsSection id="payments" title="9. Settlement & Fees">
                <p>
                  The Platform facilitates financial settlement via fiat
                  gateways and USDC stablecoin infrastructure. We charge a
                  dynamic platform fee on market acquisitions and payouts, which
                  is explicitly displayed prior to transaction execution.
                  Developer payouts are subject to minimum withdrawal thresholds
                  and standard banking/Mobile Money settlement delays.
                </p>
              </TermsSection>

              <TermsSection id="ip" title="10. Intellectual Property">
                <p>
                  The Platform, including its underlying AI models, dMRV
                  algorithms, UI/UX, and source code, remains the exclusive
                  intellectual property of Foovante Global Ltd. Project data
                  submitted by Developers grants us a perpetual, royalty-free
                  license to utilize said data for verification, machine
                  learning optimization, and public ledger anchoring.
                </p>
              </TermsSection>

              <TermsSection id="governing-law" title="11. Governing Law">
                <p>
                  This protocol and any systemic disputes arising from it shall
                  be governed by and construed in accordance with the sovereign
                  laws of the Republic of Ghana, without regard to its conflict
                  of law principles.
                </p>
              </TermsSection>

              <TermsSection id="disputes" title="12. Dispute Resolution">
                <p>
                  Any dispute, controversy, or claim arising out of this
                  agreement shall be settled through binding arbitration in
                  Accra, Ghana, in accordance with the rules of the Ghana
                  Arbitration Centre. The language of arbitration shall be
                  English.
                </p>
              </TermsSection>

              <TermsSection id="changes" title="13. Protocol Amendments">
                <p>
                  We reserve the right to modify these Terms to reflect updates
                  in regulatory compliance or system architecture. Continued use
                  of the Platform after an updated protocol has been published
                  constitutes explicit acceptance of the new Terms.
                </p>
              </TermsSection>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 3. SUB-COMPONENTS ───────────────────────────────────────────────────────

function TermsSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="scroll-mt-32"
    >
      <h2 className="font-serif text-3xl md:text-4xl text-slate-900 mb-6 border-b-2 border-slate-900 pb-4 tracking-tight">
        {title}
      </h2>
      <div className="space-y-4 text-slate-600 leading-relaxed font-light text-base md:text-lg">
        {children}
      </div>
    </motion.div>
  );
}
