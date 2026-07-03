"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Globe,
  Leaf,
  Lightbulb,
  Shield,
  Target,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

// ─── INSTITUTIONAL DATA ──────────────────────────────────────────────────────

const TEAM_MEMBERS = [
  {
    name: "Kwame Ofori",
    role: "Chief Executive Officer",
    id: "EXEC-001",
    bio: "Former climate policy advisor with 12 years in African carbon markets. Kwame architected Crevy to democratize institutional access to green finance for local project developers.",
    initials: "KO",
  },
  {
    name: "Abena Darko",
    role: "Chief Technology Officer",
    id: "EXEC-002",
    bio: "Full-stack engineer and data scientist previously at a London-based climate tech startup. Abena leads platform architecture and our proprietary carbon calculation engine.",
    initials: "AD",
  },
  {
    name: "Emmanuel Asiedu",
    role: "Head of Carbon Verification",
    id: "EXEC-003",
    bio: "Certified carbon auditor trained under VCS and Gold Standard methodologies. Emmanuel enforces strict compliance protocols and oversees all project dMRV audits.",
    initials: "EA",
  },
  {
    name: "Naomi Sarpong",
    role: "Head of Partnerships",
    id: "EXEC-004",
    bio: "Sustainability strategist with deep experience in corporate ESG programmes across West Africa. Naomi manages institutional offtakes and counterparty relationships.",
    initials: "NS",
  },
];

const CORE_VALUES = [
  {
    icon: Shield,
    title: "Cryptographic Integrity",
    description:
      "Every credit is verified by independent auditors and permanently anchored. We never compromise on scientific accuracy or verification protocols.",
  },
  {
    icon: Target,
    title: "Climate-First Unit Economics",
    description:
      "Our platform decisions start with a single constraint: does this maximize localized climate impact? Capital routing must follow ecological purpose.",
  },
  {
    icon: Users,
    title: "Equitable Market Access",
    description:
      "We dismantle systemic barriers, ensuring African Developers and land stewards receive fair-market liquidity for their sequestration assets.",
  },
  {
    icon: Lightbulb,
    title: "Radical Transparency",
    description:
      "Full audit trails, real-time dMRV telemetry, and open methodologies. Counterparties operate with complete informational symmetry.",
  },
];

const MILESTONES = [
  {
    id: "01",
    status: "Completed",
    title: "Inception & Protocol Architecture",
    desc: "Foovante Global incorporates. Founders identify the critical liquidity gap between African green projects and international voluntary carbon markets. Initial feasibility and regulatory studies commence.",
  },
  {
    id: "02",
    status: "Active",
    title: "Registry Engineering & Sandbox",
    desc: "Development of the Crevy platform's core infrastructure. Designing the institutional ledger, defining Role-Based Access Control (RBAC) matrices, and prototyping digital Measurement, Reporting, and Verification (dMRV) flows.",
  },
  {
    id: "03",
    status: "Projected",
    title: "Genesis Pilot Cohort",
    desc: "Targeting the onboarding of our first closed-beta cohort of regenerative agriculture assets in Ghana. Focus on stress-testing the verification pipeline and generating the first test-net carbon certificates.",
  },
  {
    id: "04",
    status: "Projected",
    title: "Institutional Marketplace Live",
    desc: "Opening the spot market trading desk to early corporate counterparties. Executing the first official lifecycle: from project audit and issuance to corporate purchase and public ledger retirement.",
  },
  {
    id: "05",
    status: "Projected",
    title: "Ecosystem Liquidity & Scaling",
    desc: "Scaling registry infrastructure to support 50+ active assets. Expanding methodology coverage to include Reforestation and Renewable Energy, while integrating automated ESRS/IFRS S2 compliance reporting for enterprise buyers.",
  },
];

export default function AboutPage() {
  return (
    <div className="font-sans selection:bg-[#0A2540] selection:text-[#F8F8F9] bg-[#F6F9FC]">
      <AboutHero />
      <StorySection />
      <MissionVisionSection />
      {/* <ImpactSection /> */}
      <TeamSection />
      <MilestonesSection />
      <AboutCTA />
    </div>
  );
}

// ─── 1. HERO SECTION ─────────────────────────────────────────────────────────

function AboutHero() {
  return (
    <section className="bg-[#F8F8F9] border-b border-[#0A2540]/10 pt-32 pb-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
        <Globe size={400} />
      </div>
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 mb-8"
        >
          <div className="w-8 h-[1px] bg-[#0A2540]"></div>
          <span className="text-[#0A2540] text-[10px] font-bold uppercase tracking-[0.2em]">
            Corporate Overview
          </span>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-serif text-[#0A2540] tracking-tight leading-[1.05] mb-8 max-w-4xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Engineering the{" "}
          <span className="italic text-[#F38221]">
            financial infrastructure
          </span>{" "}
          for Africa's climate assets.
        </motion.h1>
      </div>
    </section>
  );
}

// ─── 2. THE NARRATIVE ────────────────────────────────────────────────────────

function StorySection() {
  return (
    <section className="py-24 bg-white border-b border-slate-200">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-12 gap-12 lg:gap-24">
          <div className="md:col-span-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#425466] mb-4 border-t border-[#0A2540] pt-4">
              The African Climate Paradox
            </h2>
            <p className="text-3xl font-serif text-[#0A2540] leading-tight">
              Africa generates over 30% of the world's carbon sequestration
              potential, yet receives less than 2% of market revenue.
            </p>
          </div>
          <div className="md:col-span-8 space-y-8 text-[#425466] text-lg font-light leading-relaxed">
            <p>
              <span className="float-left text-7xl font-serif text-[#0A2540] leading-none pr-4 pt-2">
                C
              </span>
              revy was engineered as the antidote for African climate projects
              in accessing the global carbon market. The existing infrastructure
              was built for the Global North, characterized by opaque
              intermediaries, prohibitive auditing costs, and fractured data
              pipelines that marginalized smallholder farmers and local project
              developers.
            </p>
            <p>
              Crevy was engineered as the antidote. We recognized that to unlock
              Africa’s ecological value, we had to rebuild the trust layer from
              the ground up. By integrating rigorous digital Measurement,
              Reporting, and Verification (dMRV) with direct-to-developer
              payment routing, we remove the friction that has historically
              suppressed African participation in global ESG markets.
            </p>
            <p className="font-medium text-[#0A2540]">
              We do not just verify carbon; we are establishing a transparent,
              highly-liquid marketplace that enforces equitable unit economics
              for the communities actively managing our planet's carbon sinks.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 3. MISSION & VISION ─────────────────────────────────────────────────────

function MissionVisionSection() {
  return (
    <section className="py-24 bg-[#F6F9FC] border-b border-[#0A2540]/10">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-[#F8F8F9] border border-[#0A2540]/10 p-12 hover:border-[#F38221] transition-colors group">
            <Target
              size={24}
              className="text-[#425466] mb-8 group-hover:text-[#F38221] transition-colors"
            />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#425466] mb-4">
              Core Mission
            </h2>
            <h3 className="text-3xl font-serif text-[#0A2540] mb-6 leading-tight">
              To engineer radical transparency and liquidity into African
              environmental assets.
            </h3>
            <p className="text-[#425466] leading-relaxed font-light">
              We exist to ensure that voluntary carbon markets function as an
              equitable financial mechanism for African communities, delivering
              rigorous, auditable climate impact to global enterprises.
            </p>
          </div>

          <div className="bg-[#0A2540] border border-[#0A2540] p-12">
            <Zap size={24} className="text-[#F38221] mb-8" />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F38221] mb-4">
              Long-Term Vision
            </h2>
            <h3 className="text-3xl font-serif text-[#F8F8F9] mb-6 leading-tight">
              A continent where localized ecological stewardship is recognized
              as a premium, highly-valued global asset class.
            </h3>
            <p className="text-[#F8F8F9]/85 leading-relaxed font-light">
              We envision a unified pan-African registry where every verifiable
              green project is instantly bankable, fundamentally shifting the
              continent from climate victims to climate financiers.
            </p>
          </div>
        </div>

        {/* Core Values Matrix */}
        <div className="mt-24">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0A2540] border-b border-[#0A2540]/10 pb-4 mb-12">
            Operational Principles
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {CORE_VALUES.map((value, idx) => (
              <div key={idx} className="group">
                <value.icon className="text-[#425466] mb-4 w-5 h-5 group-hover:text-[#F38221] transition-colors" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#0A2540] mb-3">
                  {value.title}
                </h3>
                <p className="text-[#425466] text-sm leading-relaxed font-light">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 4. INSTITUTIONAL IMPACT ─────────────────────────────────────────────────
// Was asked to remove entirely by CEO
// function ImpactSection() {
//   return (
//     <section className="bg-slate-900 py-24 border-b border-slate-900">
//       <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
//         <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500 border-b border-slate-800 pb-4 mb-12">
//           Current Network Telemetry
//         </h2>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-800 border border-slate-800">
//           {IMPACT_STATS.map((stat, idx) => (
//             <div
//               key={idx}
//               className="p-8 bg-slate-900 flex flex-col justify-center"
//             >
//               <div className="text-4xl lg:text-5xl font-mono font-bold text-white mb-3 tracking-tight">
//                 {stat.value}
//               </div>
//               <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
//                 {stat.label}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// ─── 5. EXECUTIVE DIRECTORY (Meet the Team) ──────────────────────────────────

function TeamSection() {
  return (
    <section className="py-24 bg-[#F8F8F9] border-b border-[#0A2540]/10">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#425466] border-t border-[#0A2540] pt-4 mb-4">
              Executive Directory
            </h2>
            <h3 className="text-4xl font-serif text-[#0A2540] tracking-tight">
              Corporate Governance.
            </h3>
          </div>
          <p className="text-[#425466] max-w-sm text-sm font-light">
            Led by veterans in climate policy, software architecture, and
            corporate ESG strategy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM_MEMBERS.map((member, idx) => (
            <div
              key={idx}
              className="border border-[#0A2540]/10 bg-[#F6F9FC] hover:border-[#F38221] transition-colors flex flex-col h-full group"
            >
              <div className="p-6 border-b border-[#0A2540]/10 flex justify-between items-start bg-[#F8F8F9]">
                <div className="w-12 h-12 bg-[#0A2540] text-[#F8F8F9] flex items-center justify-center font-serif text-xl">
                  {member.initials}
                </div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#425466] group-hover:text-[#0A2540] transition-colors">
                  {member.id}
                </span>
              </div>
              <div className="p-6 flex-1 bg-[#F8F8F9]">
                <h4 className="text-xl font-serif text-[#0A2540] mb-1">
                  {member.name}
                </h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#F38221] mb-4">
                  {member.role}
                </p>
                <p className="text-[#425466] text-sm leading-relaxed font-light">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 6. HISTORICAL LEDGER (Our Journey) ──────────────────────────────────────

function MilestonesSection() {
  return (
    <section className="py-24 bg-[#F6F9FC] border-b border-[#0A2540]/10">
      <div className="max-w-[1000px] mx-auto px-6 lg:px-10">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#425466] border-t border-[#0A2540] pt-4 mb-16">
          Infrastructure Roadmap
        </h2>

        <div className="space-y-0 border-l border-[#0A2540]/20 ml-4 md:ml-28">
          {MILESTONES.map((m, idx) => (
            <div
              key={idx}
              className="relative pl-8 md:pl-16 pb-16 last:pb-0 group"
            >
              {/* Timeline Dot */}
              <div className="absolute left-[-5px] top-0 w-[9px] h-[9px] bg-[#0A2540]/30 group-hover:bg-[#F38221] transition-colors rounded-none"></div>

              <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8 mb-3">
                {/* Milestone ID & Status */}
                <div className="text-[#0A2540] font-mono font-bold text-2xl md:absolute md:-left-24 md:top-[-4px] md:text-right md:w-16">
                  {m.id}
                  <span className="text-[#425466] text-[9px] uppercase tracking-widest block mt-1">
                    {m.status}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif text-2xl text-[#0A2540] leading-tight">
                  {m.title}
                </h3>
              </div>
              <p className="text-[#425466] text-base leading-relaxed font-light max-w-2xl">
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 7. CTA ──────────────────────────────────────────────────────────────────

function AboutCTA() {
  return (
    <section className="py-32 bg-[#F8F8F9] text-center">
      <div className="max-w-3xl mx-auto px-6">
        <Leaf className="w-8 h-8 mx-auto text-[#F38221] mb-8" />
        <h2 className="text-4xl md:text-5xl font-serif text-[#0A2540] tracking-tight mb-8">
          Initiate Partnership
        </h2>
        <p className="text-[#425466] font-light text-lg mb-10 max-w-xl mx-auto">
          Join leading enterprises and local developers in scaling Africa's
          verified carbon ecosystem.
        </p>
        <Link href="/register">
          <button
            type="button"
            className="bg-[#0A2540] text-[#F8F8F9] hover:bg-[#F38221] hover:text-[#0A2540] px-8 py-4 text-[10px] font-bold uppercase tracking-widest transition-colors inline-flex items-center gap-3"
          >
            Access Platform <ArrowRight size={14} />
          </button>
        </Link>
      </div>
    </section>
  );
}
