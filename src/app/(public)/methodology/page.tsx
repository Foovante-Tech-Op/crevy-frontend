"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Cpu,
  Database,
  Eye,
  GitCommit,
  Globe2,
  HardDrive,
  HelpCircle,
  Link as LinkIcon,
  Loader2,
  Radar,
  Satellite,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button"; // Shadcn Button
import MathRenderer from "@/components/ui/math-renderer";
import "katex/dist/katex.min.css";

// ─── DATA DOMAIN A: METHODOLOGIES ──────────────────────────────────────────────

type Registry = "Verra" | "Gold Standard" | "ACR" | "CAR" | "Puro.earth";
type Sector =
  | "Agriculture"
  | "Forestry"
  | "Waste"
  | "Renewable Energy"
  | "Blue Carbon"
  | "Engineered Removals";

const FOUNDATIONAL_STANDARDS = [
  {
    id: "std-ghg",
    title: "Greenhouse Gas Protocol",
    scope: ["Agriculture", "Energy", "Forestry", "Waste", "Corporate"],
    purpose:
      "Provides the foundational baseline for emission source identification, scope categorization, and inventory development across all projects.",
  },
  {
    id: "std-iso14064",
    title: "ISO 14064 Series",
    scope: ["Organizational Inventories", "Project-Level Reductions"],
    purpose:
      "Ensures global consistency in the quantification, monitoring, reporting, and verification of GHG emission reductions.",
  },
  {
    id: "std-iso14067",
    title: "ISO 14067",
    scope: ["Agricultural Products", "Manufacturing", "Food Systems"],
    purpose:
      "Standardizes product-level carbon footprints, specifically targeted for agricultural exports like Cocoa, Coffee, and Cashew.",
  },
  {
    id: "std-ipcc",
    title: "IPCC Guidelines",
    scope: ["AFOLU", "Energy", "Waste"],
    purpose:
      "Serves as the ultimate default emission factor database for baseline calculations when localized terrestrial data is unavailable.",
  },
];

const METHODOLOGY_CATALOG = [
  {
    id: "meth-vm0042",
    code: "VM0042",
    registry: "Verra",
    title: "Improved Agricultural Land Management",
    sector: "Agriculture",
    applicableTo: [
      "Regenerative agriculture",
      "Cover cropping",
      "Reduced tillage",
    ],
    targetProjects: ["Cocoa", "Maize", "Rice", "Cashew"],
  },
  {
    id: "meth-vm0044",
    code: "VM0044",
    registry: "Verra",
    title: "Methodology for Biochar Utilization",
    sector: "Waste",
    applicableTo: ["Biochar production", "Soil application"],
    targetProjects: ["Cocoa husks", "Rice husks", "Palm residues"],
  },
  {
    id: "meth-vm0015",
    code: "VM0015",
    registry: "Verra",
    title: "Avoided Unplanned Deforestation",
    sector: "Forestry",
    applicableTo: ["Forest protection projects", "Conservation"],
    targetProjects: ["Forest restoration"],
  },
  {
    id: "meth-vm0007",
    code: "VM0007",
    registry: "Verra",
    title: "Afforestation and Reforestation",
    sector: "Forestry",
    applicableTo: ["Tree planting", "Restoration", "Agroforestry"],
    targetProjects: ["Cocoa agroforestry", "Shea parklands"],
  },
  {
    id: "meth-vm0022",
    code: "VM0022",
    registry: "Verra",
    title: "Organic Waste Composting",
    sector: "Waste",
    applicableTo: ["Food waste", "Municipal waste", "Agricultural waste"],
    targetProjects: ["Composting", "Organic waste diversion"],
  },
  {
    id: "meth-vm0034",
    code: "VM0034",
    registry: "Verra",
    title: "Methane Recovery",
    sector: "Waste",
    applicableTo: ["Landfills", "Anaerobic digestion"],
    targetProjects: ["Methane avoidance"],
  },
  {
    id: "meth-gs-alm",
    code: "GS-ALM",
    registry: "Gold Standard",
    title: "Agricultural Land Management",
    sector: "Agriculture",
    applicableTo: ["Regenerative agriculture", "Soil management"],
    targetProjects: ["Cocoa farms", "Maize farms"],
  },
  {
    id: "meth-gs-soc",
    code: "GS-SOC",
    registry: "Gold Standard",
    title: "Soil Organic Carbon",
    sector: "Agriculture",
    applicableTo: ["Soil carbon projects"],
    targetProjects: ["Agroforestry", "Cashew farms"],
  },
  {
    id: "meth-gs-re",
    code: "GS-RE",
    registry: "Gold Standard",
    title: "Renewable Energy Protocol",
    sector: "Renewable Energy",
    applicableTo: ["Solar", "Wind", "Clean cooking"],
    targetProjects: ["Solar irrigation", "Solar mini-grids"],
  },
  {
    id: "meth-acr-sep",
    code: "ACR-SEP",
    registry: "ACR",
    title: "Soil Enrichment Protocol",
    sector: "Agriculture",
    applicableTo: ["Regenerative agriculture"],
    targetProjects: ["Cocoa", "Maize"],
  },
  {
    id: "meth-car-ls",
    code: "CAR-LS",
    registry: "CAR",
    title: "Livestock Protocol",
    sector: "Agriculture",
    applicableTo: ["Enteric methane reduction", "Improved manure management"],
    targetProjects: ["Feed additives", "Livestock management"],
  },
  {
    id: "meth-puro-bc",
    code: "PURO-BC",
    registry: "Puro.earth",
    title: "Puro Biochar Methodology",
    sector: "Engineered Removals",
    applicableTo: ["Biochar projects"],
    targetProjects: ["Cocoa husks", "Rice husks"],
  },
];

// ─── MAIN PAGE LAYOUT ────────────────────────────────────────────────────────

export default function MethodologyPage() {
  const [activeDomain, setActiveDomain] = useState<"protocols" | "telemetry">(
    "protocols",
  );

  return (
    <div className="bg-white min-h-screen selection:bg-slate-900 selection:text-white">
      <NotebookHero
        activeDomain={activeDomain}
        setActiveDomain={setActiveDomain}
      />

      <AnimatePresence mode="wait">
        {activeDomain === "protocols" ? (
          <motion.div
            key="protocols"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <FoundationalStandards />
            <MethodologyCatalog />
          </motion.div>
        ) : (
          <motion.div
            key="telemetry"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <TelemetrySpecs />
            <MathematicalSpecifications />
            <TreeToTokenPipeline />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── HERO & SEGMENTED CONTROL ────────────────────────────────────────────────

function NotebookHero({
  activeDomain,
  setActiveDomain,
}: {
  activeDomain: "protocols" | "telemetry";
  setActiveDomain: (v: "protocols" | "telemetry") => void;
}) {
  return (
    <section className="bg-white pt-32 pb-16 border-b border-slate-200">
      <div className="container mx-auto px-6 max-w-[1400px]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center gap-3 mb-8"
          >
            <div className="w-8 h-[1px] bg-slate-900"></div>
            <span className="text-slate-900 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <GitCommit size={14} className="animate-pulse text-emerald-600" />
              SCIENTIFIC_NOTEBOOK_V_2.4.1
            </span>
            <div className="w-8 h-[1px] bg-slate-900"></div>
          </motion.div>

          <h1 className="text-5xl md:text-7xl text-slate-900 tracking-tight mb-8">
            The Scientific <span className="italic text-brand">Notebook.</span>
          </h1>

          <p className="text-slate-600 text-lg md:text-xl font-light leading-relaxed mb-12 max-w-3xl mx-auto">
            Explore our exact data sources, foundational accounting standards,
            hardware integrity protocols, and the immutable methodologies that
            power every Crevy credit.
          </p>

          {/* Segmented Control Toggle */}
          <div className="inline-flex bg-brand/10 p-1.5 rounded-full shadow-inner">
            {/* Tab 1 */}
            <button
              type="button"
              onClick={() => setActiveDomain("protocols")}
              className={`relative px-8 py-3 text-sm font-semibold rounded-full transition-colors duration-300 cursor-pointer ${
                activeDomain === "protocols"
                  ? "text-slate-900"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {activeDomain === "protocols" && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-white rounded-full shadow-sm border border-slate-200"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">Methodologies & Protocols</span>
            </button>

            {/* Tab 2 */}
            <button
              type="button"
              onClick={() => setActiveDomain("telemetry")}
              className={`relative px-8 py-3 text-sm font-semibold rounded-full transition-colors duration-300 cursor-pointer ${
                activeDomain === "telemetry"
                  ? "text-slate-900"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {activeDomain === "telemetry" && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-white rounded-full shadow-sm border border-slate-200"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">dMRV & Telemetry</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── DOMAIN A: METHODOLOGIES UI ──────────────────────────────────────────────

function FoundationalStandards() {
  return (
    <section className="bg-slate-50 border-b border-slate-200 py-24">
      <div className="container mx-auto px-6 max-w-[1400px]">
        <div className="mb-12 border-b border-slate-200 pb-6 flex items-end justify-between">
          <div>
            <h2 className="text-3xl text-slate-900 flex items-center gap-3">
              <BookOpen
                className="text-slate-400"
                size={28}
                strokeWidth={1.5}
              />
              Layer 1: Foundational Standards
            </h2>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hidden md:block">
            Global Carbon Accounting
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FOUNDATIONAL_STANDARDS.map((std) => (
            <div
              key={std.id}
              className="bg-white border border-brand/20 p-8 hover:border-brand/90 transition-colors flex flex-col h-full shadow-sm"
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand mb-4 pb-4 border-b border-slate-100">
                CORE STANDARD
              </div>
              <h3 className="text-lg font-bold text-brand mb-4">{std.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed flex-grow mb-6">
                {std.purpose}
              </p>
              <div className="mt-auto">
                <div className="text-xs text-slate-400 font-mono mb-2 uppercase tracking-wider">
                  Applicable Scope
                </div>
                <div className="flex flex-wrap gap-2">
                  {std.scope.map((s) => (
                    <span
                      key={s}
                      className="bg-brand/10 text-brand px-2.5 py-1 text-[10px] font-semibold rounded"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MethodologyCatalog() {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const sectors = [
    "All",
    "Agriculture",
    "Forestry",
    "Waste",
    "Renewable Energy",
    "Engineered Removals",
  ];

  const filteredCatalog = useMemo(() => {
    if (activeFilter === "All") return METHODOLOGY_CATALOG;
    return METHODOLOGY_CATALOG.filter((m) => m.sector === activeFilter);
  }, [activeFilter]);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 max-w-[1400px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl text-slate-900 mb-4 leading-tight">
              Registry Methodology Library.
            </h2>
            <p className="text-slate-500 text-base">
              The Crevy Intelligence Engine automatically maps your project
              telemetry against these verified protocols to determine the most
              profitable and compliant credit pathway.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {sectors.map((sector) => (
              <Button
                key={sector}
                variant={activeFilter === sector ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(sector)}
                className={`rounded-full transition-all cursor-pointer ${
                  activeFilter === sector
                    ? "bg-brand/90 text-white hover:bg-brand/80"
                    : "text-slate-600 border-slate-200 hover:border-brand/90 hover:bg-brand/10 hover:text-brand/90"
                }`}
              >
                {sector}
              </Button>
            ))}
          </div>
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredCatalog.map((methodology) => (
              <motion.div
                key={methodology.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="group relative bg-white border border-brand/20 p-8 flex flex-col h-full hover:shadow-xl hover:border-brand/30 transition-all cursor-pointer"
              >
                {/* Header Row */}
                <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100">
                  <span className="font-mono text-sm font-bold text-brand/90 bg-brand/10 px-3 py-1 rounded">
                    {methodology.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full border ${
                      methodology.registry === "Verra"
                        ? "border-brand/20 text-brand bg-brand/5"
                        : methodology.registry === "Gold Standard"
                          ? "border-amber-200 text-amber-700 bg-amber-50"
                          : "border-blue-200 text-blue-700 bg-blue-50"
                    }`}
                  >
                    {methodology.registry}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-6 leading-snug group-hover:text-brand transition-colors">
                  {methodology.title}
                </h3>

                <div className="flex-grow space-y-6">
                  <div>
                    <h4 className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-2">
                      Intervention Type
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {methodology.applicableTo.join(", ")}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-2">
                      Target Footprints
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {methodology.targetProjects.map((tp) => (
                        <span
                          key={tp}
                          className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-sm"
                        >
                          {tp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hover Reveal Footer */}
                <div className="mt-8 pt-4 border-t border-slate-100 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all flex items-center justify-between">
                  <span className="text-xs font-bold text-brand/90 uppercase tracking-wider">
                    View Protocol
                  </span>
                  <ArrowRight size={16} className="text-brand" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Intelligence Engine Teaser */}
        <div className="mt-24 bg-slate-900 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-400 via-transparent to-transparent"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-xl">
              <h3 className="text-2xl mb-4">
                Don't know which methodology applies?
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                You don't need to. The Crevy Matching Engine evaluates your
                baseline telemetry, sector constraints, and MRV readiness to
                autonomously map your asset to the exact protocol with the
                highest registry acceptance probability.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-brand">
              <div className="px-4 py-2 border border-brand bg-brand/10 rounded">
                Baseline Screening
              </div>
              <ArrowRight size={14} className="text-slate-600" />
              <div className="px-4 py-2 border border-brand bg-brand/10 rounded">
                Eligibility Engine
              </div>
              <ArrowRight size={14} className="text-slate-600" />
              <div className="px-4 py-2 border border-brand bg-brand/50 rounded font-bold text-white shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                Optimal Protocol Matched
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── DOMAIN B: DMRV & TELEMETRY (EXISTING COMPONENTS) ────────────────────────

function TelemetrySpecs() {
  const specs = [
    {
      icon: Satellite,
      title: "Optical Satellite (Sentinel-2)",
      resolution: "10m / pixel",
      frequency: "5-Day Revisit",
      error: "± 2.5%",
      desc: "Primary optical ingestion. Multispectral analysis (NDVI, EVI) to establish baseline canopy cover and continuous health monitoring.",
    },
    {
      icon: Radar,
      title: "SAR Mapping (Sentinel-1)",
      resolution: "10m x 10m",
      frequency: "12-Day Revisit",
      error: "± 4.1%",
      desc: "Synthetic Aperture Radar penetrates cloud cover, allowing us to continuously measure structural volume in equatorial regions year-round.",
    },
    {
      icon: Cpu,
      title: "Edge IoT / Terrestrial",
      resolution: "Sub-millimeter",
      frequency: "Real-time (15 min)",
      error: "± 0.1%",
      desc: "Dendrometers and soil moisture sensors installed in index plots. Cryptographically signed payloads via LoRaWAN to prevent data spoofing.",
    },
  ];

  return (
    <section className="bg-slate-50 border-b border-slate-200 py-12">
      <div className="container mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 border border-slate-200">
          <div className="p-8 lg:p-12 lg:col-span-1 flex flex-col justify-center bg-slate-100/50">
            <Globe2 className="text-brand mb-6" size={32} strokeWidth={1.5} />
            <h2 className="text-2xl text-slate-900 mb-4 leading-tight">
              Data Ingestion Pipeline
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Continuous, multi-modal planetary observation mapping the physical
              world to the digital ledger.
            </p>
          </div>
          {specs.map((spec, i) => (
            <div
              key={i}
              className="p-8 lg:p-12 flex flex-col bg-white hover:bg-slate-50 transition-colors duration-500"
            >
              <spec.icon
                size={24}
                className="text-brand mb-6"
                strokeWidth={1.5}
              />
              <h3 className="text-lg font-bold text-slate-900 mb-6">
                {spec.title}
              </h3>
              <div className="space-y-4 mb-8 font-mono text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-400">RESOLUTION</span>
                  <span className="text-slate-900 font-semibold">
                    {spec.resolution}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-400">FREQUENCY</span>
                  <span className="text-slate-900 font-semibold">
                    {spec.frequency}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-400">ERROR MARGIN</span>
                  <span className="text-slate-900 font-semibold">
                    {spec.error}
                  </span>
                </div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mt-auto">
                {spec.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MathematicalSpecifications() {
  return (
    <section className="py-24 bg-white relative">
      <div className="container mx-auto px-6 max-w-[1400px]">
        <div className="mb-16 border-b border-slate-900 pb-6 flex items-end justify-between">
          <div>
            <h2 className="text-3xl text-slate-900 flex items-center gap-3">
              <Code2 className="text-slate-400" size={28} strokeWidth={1.5} />
              Rigorous Mathematical Proofs
            </h2>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hidden md:block">
            Open-source accounting validation
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-12 font-mono">
          <div className="border border-slate-200 p-8 md:p-10 flex flex-col justify-between bg-white shadow-sm hover:border-slate-900 transition-colors">
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] block mb-4 border-b border-slate-100 pb-4">
                01. BIOMASS SEQUESTRATION (AGB)
              </span>
              <h3 className="text-brand text-xl font-bold mb-4">
                Above-Ground Biomass Quantification
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Utilized to translate raw physical observations into total
                vegetative mass.
              </p>
            </div>
            <div className="bg-slate-50 p-6 border border-slate-200 my-4 overflow-x-auto w-full min-w-0 select-none flex justify-center">
              <MathRenderer
                formula="AGB = 0.0673 \times (\rho D^2 H)^{0.976}"
                displayMode={true}
                className="text-brand text-base md:text-lg"
              />
            </div>
            <div className="text-xs text-slate-600 space-y-3 mt-6">
              <p className="flex items-start gap-3">
                <strong className="text-brand font-mono w-12 shrink-0 pt-0.5">
                  AGB:
                </strong>
                <span>
                  Above-Ground Biomass volume equivalent (
                  <MathRenderer formula="\text{kg}" className="text-[11px]" />)
                </span>
              </p>
              <p className="flex items-start gap-3">
                <strong className="text-brand font-mono w-12 shrink-0 pt-0.5">
                  <MathRenderer formula="\rho" className="text-[13px]" />:
                </strong>
                <span>
                  Mean wood density metric calibrated by ecosystem databases
                </span>
              </p>
              <p className="flex items-start gap-3">
                <strong className="text-brand font-mono w-12 shrink-0 pt-0.5">
                  D / H:
                </strong>
                <span>
                  Extrapolated breast-height diameter and vertical structure
                  height (
                  <MathRenderer formula="\text{m}" className="text-[11px]" />)
                </span>
              </p>
            </div>
          </div>
          <div className="border border-slate-200 p-8 md:p-10 flex flex-col justify-between bg-white shadow-sm hover:border-slate-900 transition-colors">
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] block mb-4 border-b border-slate-100 pb-4">
                02. CONSERVATISM PRINCIPLE
              </span>
              <h3 className="text-brand text-xl font-bold mb-4">
                Net Asset Allocation Accounting
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Aligns directly with global standards. We explicitly subtract
                all risk factors before minting credits.
              </p>
            </div>
            <div className="bg-slate-50 p-6 border border-slate-200 my-4 overflow-x-auto w-full min-w-0 select-none flex justify-center">
              <MathRenderer
                formula="N_{\text{credits}} = G_{\text{removals}} - L_{\text{deduction}} - B_{\text{contribution}}"
                displayMode={true}
                className="text-brand text-base md:text-lg"
              />
            </div>
            <div className="text-xs text-slate-600 space-y-3 mt-6">
              <p className="flex items-start gap-3">
                <strong className="text-brand font-mono w-24 shrink-0 pt-0.5">
                  N_credits:
                </strong>
                <span>
                  Total finalized net carbon credits issued to the marketplace
                </span>
              </p>
              <p className="flex items-start gap-3">
                <strong className="text-brand font-mono w-24 shrink-0 pt-0.5">
                  G_removals:
                </strong>
                <span>
                  Total calculated gross carbon offset (
                  <MathRenderer
                    formula="\text{tCO}_2\text{e}"
                    className="text-[11px]"
                  />
                  )
                </span>
              </p>
              <p className="flex items-start gap-3">
                <strong className="text-brand font-mono w-24 shrink-0 pt-0.5">
                  L / B:
                </strong>
                <span>
                  Risk mitigations for project leakage and safety buffer pools
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TreeToTokenPipeline() {
  const [activeTab, setActiveTab] = useState<"json" | "gis">("json");
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<"optical" | "sar" | "ndvi">(
    "optical",
  );
  const [showIotNodes, setShowIotNodes] = useState(true);
  const [selectedIotNode, setSelectedIotNode] = useState<{
    id: string;
    name: string;
    val: string;
  } | null>(null);
  const [verificationState, setVerificationState] = useState<
    "idle" | "verifying" | "success"
  >("idle");

  return (
    <section className="py-24 bg-slate-50 border-t border-slate-200">
      <div className="container mx-auto px-6 max-w-[1400px]">
        <div className="mb-16">
          <h2 className="text-4xl text-slate-900 mb-4 leading-tight">
            Tree to Token: <br />
            <span className="italic text-slate-500">Chain of Custody.</span>
          </h2>
          <p className="text-slate-500 text-base max-w-xl">
            Explore the exact path data takes from a remote forest to an
            immutable public registry. No manual spreadsheets. No human
            tampering.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5 space-y-6 relative before:absolute before:inset-0 before:ml-[31px] before:-translate-x-px before:h-full before:w-[2px] before:bg-slate-200">
            <div className="relative flex items-start gap-6 group">
              <div className="flex items-center justify-center w-16 h-16 bg-white border border-slate-200 text-slate-900 shrink-0 relative z-10 group-hover:border-brand group-hover:bg-brand transition-colors">
                <HardDrive
                  className="text-brand group-hover:text-white"
                  size={24}
                  strokeWidth={1.5}
                />
              </div>
              <div className="pt-2">
                <h4 className="font-bold text-slate-900 text-lg mb-1">
                  1. Edge Capture
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Hardware physically signs raw telemetry with a private key.
                  Prevents data spoofing at the source.
                </p>
              </div>
            </div>
            <div className="relative flex items-start gap-6 group">
              <div className="flex items-center justify-center w-16 h-16 bg-white border border-slate-200 text-slate-900 shrink-0 relative z-10 group-hover:border-brand group-hover:bg-brand transition-colors">
                <Database
                  className="text-brand group-hover:text-white"
                  size={24}
                  strokeWidth={1.5}
                />
              </div>
              <div className="pt-2">
                <h4 className="font-bold text-slate-900 text-lg mb-1">
                  2. dMRV Ingestion & AI
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Satellite rasters and edge data are processed. Biomass and
                  carbon equivalence are calculated automatically.
                </p>
              </div>
            </div>
            <div className="relative flex items-start gap-6 group">
              <div className="flex items-center justify-center w-16 h-16 bg-brand border border-brand text-white shrink-0 relative z-10 group-hover:bg-white">
                <LinkIcon
                  className="group-hover:text-brand"
                  size={24}
                  strokeWidth={1.5}
                />
              </div>
              <div className="pt-2">
                <h4 className="font-bold text-slate-900 text-lg mb-1">
                  3. On-Chain Minting
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  The verified payload is hashed and a non-fungible digital
                  credit is minted on Polygon for immutability.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#0a0a0a] shadow-2xl border border-slate-800 flex flex-col h-[600px] relative font-mono text-sm min-w-0 w-full max-w-full">
            <div className="bg-[#111111] px-6 py-4 flex items-center justify-between border-b border-slate-800 select-none shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 ml-4">
                  dMRV_trust_console.sh
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("json");
                    setSelectedIotNode(null);
                  }}
                  className={`px-4 py-1 border transition-all cursor-pointer text-[10px] uppercase tracking-widest font-bold ${activeTab === "json" ? "border-emerald-500 text-emerald-400 bg-emerald-500/10" : "border-transparent text-slate-500 hover:text-slate-300"}`}
                >
                  ledger_payload.json
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("gis");
                    setSelectedIotNode(null);
                  }}
                  className={`px-4 py-1 border transition-all cursor-pointer text-[10px] uppercase tracking-widest font-bold ${activeTab === "gis" ? "border-emerald-500 text-emerald-400 bg-emerald-500/10" : "border-transparent text-slate-500 hover:text-slate-300"}`}
                >
                  gis_satellite.proof
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden relative bg-transparent">
              {verificationState === "verifying" && (
                <motion.div
                  initial={{ y: "-100%" }}
                  animate={{ y: "100%" }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  className="absolute left-0 right-0 h-[2px] bg-emerald-500 shadow-[0_0_15px_#10b981] z-20 pointer-events-none"
                />
              )}

              {activeTab === "json" ? (
                <div className="p-6 h-full flex flex-col justify-between overflow-y-auto">
                  <div className="relative overflow-x-auto w-full min-w-0">
                    <pre className="text-slate-300 leading-[1.8] text-xs select-text">
                      <span className="text-slate-500">{`{`}</span>
                      {"\n"}
                      <span
                        role="button"
                        tabIndex={0}
                        onMouseEnter={() => setHoveredField("asset_id")}
                        onMouseLeave={() => setHoveredField(null)}
                        className="text-emerald-400 cursor-help hover:bg-slate-800 transition-colors outline-none"
                      >{`  "asset_id"`}</span>
                      <span className="text-slate-500">{`: `}</span>
                      <span className="text-sky-300">{`"crv_0x8f2a...9b1c"`}</span>
                      <span className="text-slate-500">{`,`}</span>
                      {"\n"}
                      <span
                        role="button"
                        tabIndex={0}
                        onMouseEnter={() => setHoveredField("project_did")}
                        onMouseLeave={() => setHoveredField(null)}
                        className="text-emerald-400 cursor-help hover:bg-slate-800 transition-colors outline-none"
                      >{`  "project_did"`}</span>
                      <span className="text-slate-500">{`: `}</span>
                      <span className="text-sky-300">{`"did:crevy:gh:brong-ahafo:82"`}</span>
                      <span className="text-slate-500">{`,`}</span>
                      {"\n"}
                      <span
                        role="button"
                        tabIndex={0}
                        onMouseEnter={() => setHoveredField("vintage")}
                        onMouseLeave={() => setHoveredField(null)}
                        className="text-emerald-400 cursor-help hover:bg-slate-800 transition-colors outline-none"
                      >{`  "vintage"`}</span>
                      <span className="text-slate-500">{`: `}</span>
                      <span className="text-orange-300">{`2026`}</span>
                      <span className="text-slate-500">{`,`}</span>
                      {"\n"}
                      <span
                        role="button"
                        tabIndex={0}
                        onMouseEnter={() => setHoveredField("quantification")}
                        onMouseLeave={() => setHoveredField(null)}
                        className="text-emerald-400 cursor-help hover:bg-slate-800 transition-colors outline-none"
                      >{`  "quantification"`}</span>
                      <span className="text-slate-500">{`: {`}</span>
                      {"\n"}
                      <span
                        role="button"
                        tabIndex={0}
                        onMouseEnter={() => setHoveredField("mass_tco2e")}
                        onMouseLeave={() => setHoveredField(null)}
                        className="text-blue-400 cursor-help hover:bg-slate-800 transition-colors pl-4 outline-none"
                      >{`    "mass_tco2e"`}</span>
                      <span className="text-slate-500">{`: `}</span>
                      <span className="text-orange-300">{`1.000`}</span>
                      <span className="text-slate-500">{`,`}</span>
                      {"\n"}
                      <span
                        role="button"
                        tabIndex={0}
                        onMouseEnter={() => setHoveredField("confidence_score")}
                        onMouseLeave={() => setHoveredField(null)}
                        className="text-blue-400 cursor-help hover:bg-slate-800 transition-colors pl-4 outline-none"
                      >{`    "confidence_score"`}</span>
                      <span className="text-slate-500">{`: `}</span>
                      <span className="text-orange-300">{`0.962`}</span>
                      <span className="text-slate-500">{`,`}</span>
                      {"\n"}
                      <span
                        role="button"
                        tabIndex={0}
                        onMouseEnter={() => setHoveredField("satellite_cid")}
                        onMouseLeave={() => setHoveredField(null)}
                        className="text-blue-400 cursor-help hover:bg-slate-800 transition-colors pl-4 outline-none"
                      >{`    "satellite_cid"`}</span>
                      <span className="text-slate-500">{`: `}</span>
                      <span className="text-sky-300">{`"ipfs://QmX..."`}</span>
                      {"\n"}
                      <span className="text-slate-500">{`  },`}</span>
                      {"\n"}
                      <span
                        role="button"
                        tabIndex={0}
                        onMouseEnter={() =>
                          setHoveredField("hardware_attestation")
                        }
                        onMouseLeave={() => setHoveredField(null)}
                        className="text-emerald-400 cursor-help hover:bg-slate-800 transition-colors outline-none"
                      >{`  "hardware_attestation"`}</span>
                      <span className="text-slate-500">{`: {`}</span>
                      {"\n"}
                      <span
                        role="button"
                        tabIndex={0}
                        onMouseEnter={() => setHoveredField("device_mac")}
                        onMouseLeave={() => setHoveredField(null)}
                        className="text-blue-400 cursor-help hover:bg-slate-800 transition-colors pl-4 outline-none"
                      >{`    "device_mac"`}</span>
                      <span className="text-slate-500">{`: `}</span>
                      <span className="text-sky-300">{`"00:1B:44:11:3A:B7"`}</span>
                      <span className="text-slate-500">{`,`}</span>
                      {"\n"}
                      <span
                        role="button"
                        tabIndex={0}
                        onMouseEnter={() => setHoveredField("signature")}
                        onMouseLeave={() => setHoveredField(null)}
                        className="text-blue-400 cursor-help hover:bg-slate-800 transition-colors pl-4 outline-none"
                      >{`    "signature"`}</span>
                      <span className="text-slate-500">{`: `}</span>
                      <span className="text-sky-300">{`"0x3e8...f1a"`}</span>
                      {"\n"}
                      <span className="text-slate-500">{`  }`}</span>
                      {"\n"}
                      <span className="text-slate-500">{`}`}</span>
                    </pre>
                  </div>
                  <div className="h-20 border-t border-slate-800 pt-4 text-xs flex items-start text-slate-400 shrink-0 select-none mt-4">
                    <AnimatePresence mode="wait">
                      {hoveredField ? (
                        <motion.div
                          key={hoveredField}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-emerald-400 flex items-start gap-2"
                        >
                          <HelpCircle size={14} className="mt-0.5 shrink-0" />
                          <span className="leading-relaxed">
                            {hoveredField === "asset_id" &&
                              "Unique Polygon ERC-1155 Token Identifier representing this specific carbon vintage asset batch."}
                            {hoveredField === "project_did" &&
                              "Decentralized Identifier resolving to the immutable verification document registry."}
                            {hoveredField === "vintage" &&
                              "The calendar year of the carbon removals, determining vintage accounting."}
                            {hoveredField === "quantification" &&
                              "Algorithmic outputs calculating Above-Ground Biomass and carbon dioxide equivalent."}
                            {hoveredField === "mass_tco2e" &&
                              "Calculated net carbon removals in metric tonnes (tCO2e) after Conservatism Pool discounts."}
                            {hoveredField === "confidence_score" &&
                              "Confidence factor (96.2%) applied to discount asset totals, derived from multi-modal sensor alignment."}
                            {hoveredField === "satellite_cid" &&
                              "IPFS hash storing the raw, uncompressed multispectral raster data for public audit."}
                            {hoveredField === "hardware_attestation" &&
                              "Cryptographic proof that the telemetry was generated by a physical Edge IoT device on-site."}
                            {hoveredField === "device_mac" &&
                              "Unique hardware identifier of the secure-enclave terrestrial sensor array."}
                            {hoveredField === "signature" &&
                              "ECDSA cryptographic signature proving payload authenticity and anti-tamper verification."}
                          </span>
                        </motion.div>
                      ) : (
                        <span className="text-slate-600 font-mono text-[10px] uppercase tracking-widest" />
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full bg-[#0a0a0a] overflow-hidden flex flex-col justify-between">
                  <div
                    className="relative flex-1 bg-cover bg-center select-none"
                    style={{ backgroundImage: `url('/img/satellite_map.png')` }}
                  >
                    {activeLayer === "sar" && (
                      <div className="absolute inset-0 bg-blue-500/10 border border-blue-400/20 mix-blend-screen pointer-events-none flex items-center justify-center">
                        <Loader2 size={32} className="animate-spin" />
                        <div className="absolute bg-[#0a0a0a]/90 border border-sky-900 text-[10px] text-sky-400 px-3 py-1.5 font-mono bottom-4 right-4">
                          SAR CANOPY VOLUME: 12-DAY
                        </div>
                      </div>
                    )}
                    {activeLayer === "ndvi" && (
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-green-600/15 to-teal-900/35 mix-blend-color pointer-events-none">
                        <div className="absolute bg-[#0a0a0a]/90 border border-emerald-900 text-[10px] text-emerald-400 px-3 py-1.5 font-mono bottom-4 right-4">
                          NDVI SPECTRUM: 10m
                        </div>
                      </div>
                    )}
                    {activeLayer === "optical" && (
                      <div className="absolute bg-[#0a0a0a]/90 border border-slate-800 text-[10px] text-slate-300 px-3 py-1.5 font-mono bottom-4 right-4">
                        OPTICAL SPECTRUM: RGB
                      </div>
                    )}
                    {showIotNodes && (
                      <>
                        <div className="absolute top-[40%] left-[35%] z-10">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedIotNode({
                                id: "IoT-A1",
                                name: "Dendrometer (Wood Density)",
                                val: "Trunk Growth: +1.24mm | Temp: 28.1°C",
                              })
                            }
                            className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center animate-ping absolute opacity-75 cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedIotNode({
                                id: "IoT-A1",
                                name: "Dendrometer (Wood Density)",
                                val: "Trunk Growth: +1.24mm | Temp: 28.1°C",
                              })
                            }
                            className="w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0a0a0a] flex items-center justify-center relative cursor-pointer"
                          />
                        </div>
                        <div className="absolute top-[28%] left-[68%] z-10">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedIotNode({
                                id: "IoT-B7",
                                name: "Soil Hydration Sensor",
                                val: "Soil Moisture: 34.2% | VWC Calibration: OK",
                              })
                            }
                            className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center animate-ping absolute opacity-75 cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedIotNode({
                                id: "IoT-B7",
                                name: "Soil Hydration Sensor",
                                val: "Soil Moisture: 34.2% | VWC Calibration: OK",
                              })
                            }
                            className="w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0a0a0a] flex items-center justify-center relative cursor-pointer"
                          />
                        </div>
                      </>
                    )}
                    {selectedIotNode && (
                      <div className="absolute bottom-16 left-6 bg-[#0a0a0a]/95 border border-slate-800 p-4 shadow-2xl text-xs z-10 min-w-[280px]">
                        <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-2">
                          <span className="text-emerald-400 font-bold font-mono text-[10px] uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            {selectedIotNode.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedIotNode(null)}
                            className="text-slate-500 hover:text-white cursor-pointer font-bold"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-slate-300 font-medium mb-1">
                          {selectedIotNode.name}
                        </p>
                        <p className="text-slate-400 font-mono text-[10px]">
                          {selectedIotNode.val}
                        </p>
                        <p className="text-[10px] text-emerald-700 font-mono mt-2 pt-2 border-t border-slate-800">
                          ✓ SIG_HASH: 0x8a92...b61c
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="bg-[#111111] border-t border-slate-800 p-4 shrink-0 flex items-center justify-between">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setActiveLayer("optical")}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeLayer === "optical" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"}`}
                      >
                        Optical
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveLayer("sar")}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeLayer === "sar" ? "bg-slate-800 text-sky-400" : "text-slate-500 hover:text-slate-300"}`}
                      >
                        Radar (SAR)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveLayer("ndvi")}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeLayer === "ndvi" ? "bg-slate-800 text-emerald-400" : "text-slate-500 hover:text-slate-300"}`}
                      >
                        NDVI
                      </button>
                    </div>
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showIotNodes}
                        onChange={(e) => setShowIotNodes(e.target.checked)}
                        className="accent-emerald-500"
                      />
                      Overlay IoT
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#0a0a0a] px-6 py-4 border-t border-slate-800 shrink-0 flex items-center justify-between select-none">
              {verificationState === "idle" && (
                <>
                  <span className="text-slate-500 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse"></span>
                    Ready for pipeline evaluation
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationState("verifying");
                      setTimeout(() => setVerificationState("success"), 2500);
                    }}
                    className="bg-brand hover:bg-brand/90 text-slate-900 text-[10px] uppercase tracking-[0.2em] px-4 py-2 font-bold transition-colors cursor-pointer"
                  >
                    Execute Proof
                  </button>
                </>
              )}
              {verificationState === "verifying" && (
                <span className="text-slate-300 text-[10px] font-mono uppercase tracking-widest flex items-center gap-3 w-full justify-center">
                  <Loader2 size={14} className="animate-spin" />
                  VALIDATING LEDGER PAYLOAD & GIS ALIGNMENT...
                </span>
              )}
              {verificationState === "success" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full flex items-center justify-between"
                >
                  <span className="text-emerald-400 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 font-bold">
                    <ShieldCheck size={14} />
                    EVIDENCE COMPLETE: SIGNATURE MATCHES SATELLITE HASH
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationState("idle");
                      setSelectedIotNode(null);
                    }}
                    className="text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                  >
                    Reset
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
