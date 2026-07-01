"use client";

import { motion } from "framer-motion";
import {
  AlertCircleIcon,
  Bell,
  Cookie,
  Database,
  Eye,
  Globe,
  Lock,
  Mail,
  Shield,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// ─── INSTITUTIONAL POLICY SECTIONS ───────────────────────────────────────────

const SECTIONS = [
  { id: "overview", label: "1. Overview & Controller", icon: Shield },
  { id: "data-collected", label: "2. Data Telemetry", icon: Database },
  { id: "how-we-use", label: "3. Operational Usage", icon: Eye },
  { id: "legal-basis", label: "4. Legal Basis", icon: UserCheck },
  { id: "data-sharing", label: "5. Third-Party Sharing", icon: Globe },
  { id: "blockchain", label: "6. Ledger Immutability", icon: Database },
  { id: "cookies", label: "7. Cookies & Tracking", icon: Cookie },
  { id: "your-rights", label: "8. Entity Rights", icon: Lock },
  { id: "data-retention", label: "9. Data Retention", icon: Trash2 },
  { id: "security", label: "10. Cryptographic Security", icon: Shield },
  { id: "changes", label: "11. Protocol Modifications", icon: Bell },
  { id: "contact", label: "12. Governance Contact", icon: Mail },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("overview");

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
      <PrivacyHero />
      <PrivacyContent
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
    </div>
  );
}

// ─── 1. HERO SECTION ─────────────────────────────────────────────────────────

function PrivacyHero() {
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
            Data Privacy & <br />
            <span className="italic text-slate-500">Protection Policy.</span>
          </h1>

          <p className="text-slate-600 text-lg leading-relaxed mb-12 max-w-2xl font-light">
            Foovante Global Ltd ("Crevy", "we", "us", "our") is committed to
            absolute cryptographic and legal protection of your data. This
            protocol dictates the collection, processing, and retention of
            entity data within the Crevy registry ecosystem.
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
                Compliance
              </span>
              <span className="font-mono text-sm font-bold text-slate-900">
                GDPR & GH-DPA
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── 2. CONTENT MATRIX ───────────────────────────────────────────────────────

function PrivacyContent({
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
              <nav className="space-y-0" aria-label="Privacy policy sections">
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
              <PolicySection
                id="overview"
                title="1. Overview & Data Controller"
              >
                <p>
                  This Privacy Policy applies to all systemic actors
                  (Developers, Corporate Entities, Auditors) utilizing the Crevy
                  platform infrastructure, accessible at{" "}
                  <span className="font-mono text-emerald-700">crevy.app</span>.
                </p>
                <p>
                  For the purposes of the General Data Protection Regulation
                  (GDPR) and the Ghana Data Protection Act 2012 (Act 843), the
                  data controller is:
                </p>
                <InfoBox>
                  <strong>Foovante Global Ltd</strong>
                  <br />
                  Registration No: CS-2022-84920
                  <br />
                  Accra, Greater Accra, Ghana
                  <br />
                  <span className="text-emerald-700">
                    legal@foovante-global.com
                  </span>
                </InfoBox>
              </PolicySection>

              <PolicySection
                id="data-collected"
                title="2. Telemetry & Data Collected"
              >
                <p>
                  We systematically collect and process the following categories
                  of data to operate the registry:
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-4 marker:text-emerald-700">
                  <li>
                    <strong>Identity Metadata (KYC/KYB):</strong> Full legal
                    names, corporate registration documents, government-issued
                    IDs, and biometric liveness checks (processed via authorized
                    third-party identity vendors).
                  </li>
                  <li>
                    <strong>Financial Vectors:</strong> Mobile Money (MoMo)
                    routing numbers, SWIFT/IBAN bank details, and Polygon/EVM
                    wallet addresses for settlement.
                  </li>
                  <li>
                    <strong>Spatial & Environmental Telemetry:</strong> Precise
                    GIS polygons, GPS coordinates of sensor deployments, and
                    continuous IoT data streams (e.g., Soil Carbon, Biomass
                    readings) tied to your identity.
                  </li>
                  <li>
                    <strong>System Access Logs:</strong> IP addresses,
                    cryptographic signatures, browser types, and timestamped
                    audit trails of platform actions.
                  </li>
                </ul>
              </PolicySection>

              <PolicySection id="how-we-use" title="3. Operational Usage">
                <p>
                  The collected telemetry is utilized strictly for the following
                  operational imperatives:
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-4 marker:text-emerald-700">
                  <li>
                    To establish cryptographic proof of environmental assets
                    (carbon credits).
                  </li>
                  <li>
                    To execute identity verification to prevent double-counting
                    and financial fraud in compliance with AML/CFT regulations.
                  </li>
                  <li>
                    To route corporate liquidity to local project developers
                    seamlessly.
                  </li>
                  <li>
                    To generate ESRS and IFRS S2 compliant ESG reports for
                    corporate buyers.
                  </li>
                </ul>
              </PolicySection>

              <PolicySection
                id="legal-basis"
                title="4. Legal Basis for Processing"
              >
                <p>
                  We ground our data processing in the following legal bases:
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-4 marker:text-emerald-700">
                  <li>
                    <strong>Contractual Necessity:</strong> To fulfill our Terms
                    of Service (e.g., issuing credits, executing payouts).
                  </li>
                  <li>
                    <strong>Legal Obligation:</strong> To comply with Ghanaian
                    and international financial regulations (KYC/AML).
                  </li>
                  <li>
                    <strong>Legitimate Interest:</strong> To maintain platform
                    security, prevent fraud, and optimize the dMRV algorithm.
                  </li>
                  <li>
                    <strong>Explicit Consent:</strong> For non-essential
                    marketing communications and analytical cookies.
                  </li>
                </ul>
              </PolicySection>

              <PolicySection id="data-sharing" title="5. Third-Party Sharing">
                <p>
                  We do not sell entity data. Telemetry is shared exclusively
                  with authorized infrastructure partners:
                </p>
                <InfoBox>
                  <ul className="space-y-3 font-mono text-xs">
                    <li className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="font-bold text-slate-900">
                        Identity Verification:
                      </span>
                      <span className="text-slate-500 text-right">
                        SmileID / Onfido
                      </span>
                    </li>
                    <li className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="font-bold text-slate-900">
                        Validation Bodies (VVB):
                      </span>
                      <span className="text-slate-500 text-right">
                        Verra, Gold Standard (Anonymized)
                      </span>
                    </li>
                    <li className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="font-bold text-slate-900">
                        Financial Settlement:
                      </span>
                      <span className="text-slate-500 text-right">
                        Paystack / Circle (USDC)
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-bold text-slate-900">
                        Cloud Infrastructure:
                      </span>
                      <span className="text-slate-500 text-right">
                        Oracle Cloud (OCI) / AWS
                      </span>
                    </li>
                  </ul>
                </InfoBox>
              </PolicySection>

              <PolicySection
                id="blockchain"
                title="6. Ledger Immutability (Important)"
              >
                <div className="bg-amber-50 border border-amber-200 p-6 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircleIcon />
                    <span className="font-bold text-[10px] uppercase tracking-widest text-amber-900">
                      Web3 Architectural Notice
                    </span>
                  </div>
                  <p className="text-amber-800 text-sm leading-relaxed font-mono">
                    Crevy anchors carbon credit issuance data (including
                    anonymized project IDs, GIS hashes, and credit volumes) to
                    the public Polygon blockchain. Once data is anchored to a
                    public ledger, it is mathematically impossible to delete or
                    alter. By using our platform, you acknowledge this
                    immutability.
                  </p>
                </div>
              </PolicySection>

              <PolicySection id="cookies" title="7. Cookies & Tracking">
                <p>
                  We utilize cryptographic session tokens and minimal cookies to
                  maintain state and secure access. We categorize these as:
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-4 marker:text-emerald-700">
                  <li>
                    <strong>Strictly Necessary:</strong> Authentication tokens
                    and CSRF protection. Cannot be disabled.
                  </li>
                  <li>
                    <strong>Analytical (Optional):</strong> Aggregated telemetry
                    to monitor platform latency and user flow.
                  </li>
                </ul>
              </PolicySection>

              <PolicySection id="your-rights" title="8. Entity Rights">
                <p>Under the GDPR and GH-DPA, you possess the right to:</p>
                <ul className="list-disc pl-5 space-y-2 mt-4 marker:text-emerald-700">
                  <li>
                    Request a cryptographic export of all your personal data
                    (Right to Portability).
                  </li>
                  <li>Request correction of inaccurate identity profiles.</li>
                  <li>
                    Request deletion of your data (Right to be Forgotten) —{" "}
                    <em>
                      Note: This does not apply to data already anchored to the
                      public blockchain or data we must retain for AML
                      compliance.
                    </em>
                  </li>
                </ul>
              </PolicySection>

              <PolicySection id="data-retention" title="9. Data Retention">
                <p>
                  We retain identity and financial transaction data for a
                  minimum of <strong>seven (7) years</strong> following account
                  termination to comply with international auditing and
                  anti-money laundering statutes. Environmental telemetry used
                  to generate active carbon credits is stored indefinitely to
                  ensure the lifetime integrity of the issued asset.
                </p>
              </PolicySection>

              <PolicySection id="security" title="10. Cryptographic Security">
                <p>
                  Our infrastructure employs AES-256 encryption at rest and TLS
                  1.3 in transit. Access to sensitive corporate and personal
                  data is governed by strict Role-Based Access Control (RBAC),
                  requiring Multi-Factor Authentication (MFA) for all
                  administrative operations.
                </p>
              </PolicySection>

              <PolicySection id="changes" title="11. Protocol Modifications">
                <p>
                  We may update this policy periodically to reflect changes in
                  legal frameworks or system architecture. Material changes will
                  be communicated via the platform dashboard or email prior to
                  enforcement. Continued use of the platform post-enforcement
                  constitutes acceptance of the modified protocol.
                </p>
              </PolicySection>

              <PolicySection id="contact" title="12. Governance Contact">
                <p>
                  For inquiries regarding this protocol, data subject access
                  requests, or to contact our Data Protection Officer (DPO):
                </p>
                <div className="mt-6">
                  <a
                    href="mailto:privacy@foovante-global.com"
                    className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-900 transition-colors"
                  >
                    <Mail size={14} /> Contact Privacy Team
                  </a>
                </div>
              </PolicySection>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 3. SUB-COMPONENTS ───────────────────────────────────────────────────────

function PolicySection({
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

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 border border-slate-200 p-8 font-mono text-sm text-slate-700 leading-relaxed mt-6">
      {children}
    </div>
  );
}

// function AlertIcon() {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       width="14"
//       height="14"
//       viewBox="0 0 24 24"
//       fill="none"
//       aria-label="Alert icon"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
//       <path d="M12 9v4" />
//       <path d="M12 17h.01" />
//     </svg>
//   );
// }
