"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Code2,
  Cpu,
  Database,
  Eye,
  GitCommit,
  Globe2,
  HardDrive,
  HelpCircle,
  Link as LinkIcon,
  Radar,
  Satellite,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import MathRenderer from "@/components/ui/math-renderer";
import "katex/dist/katex.min.css";

export default function MethodologyPage() {
  return (
    <div className="bg-white min-h-screen font-sans selection:bg-secondary selection:text-white">
      <NotebookHero />
      <TelemetrySpecs />
      <MathematicalSpecifications />
      <TreeToTokenPipeline />
    </div>
  );
}

function NotebookHero() {
  return (
    <section className="bg-white pt-32 pb-24 border-b border-border">
      <div className="container mx-auto px-6 max-w-[1400px]">
        <div className="flex flex-col items-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center gap-3 mb-8"
          >
            <div className="w-8 h-[1px] bg-secondary"></div>
            <span className="text-foreground text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <GitCommit size={14} className="animate-pulse text-emerald-600" />
              PROTOCOL_V_2.4.1
            </span>
            <div className="w-8 h-[1px] bg-secondary"></div>
          </motion.div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-sans text-foreground tracking-tight leading- mb-8">
            The Scientific <span className="italic text-brand">Notebook.</span>
          </h1>

          <p className="text-slate-600 text-lg md:text-xl font-light leading-relaxed max-w-2xl mb-12">
            We reject "estimated impact." Explore our exact data sources,
            Above-Ground Biomass (AGB) calculations, hardware integrity
            protocols, and the immutable chain-of-custody that powers every
            Crevy credit.
          </p>

          <div className="flex gap-4 border-t border-border pt-8">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground">
              <ShieldCheck size={16} className="text-emerald-700" />
              ISO 14064 Compliant
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground ml-6">
              <Eye size={16} className="text-emerald-700" />
              Peer Reviewed
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

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
    <section className="bg-muted border-b border-border">
      <div className="container mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Header Column */}
          <div className="p-8 lg:p-12 lg:col-span-1 flex flex-col justify-center bg-slate-100/50">
            <Globe2
              className="text-foreground mb-6"
              size={32}
              strokeWidth={1.5}
            />
            <h2 className="text-2xl font-sans text-foreground mb-4 leading-tight">
              Data Ingestion Pipeline
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Continuous, multi-modal planetary observation mapping the physical
              world to the digital ledger.
            </p>
          </div>

          {/* Specs Columns */}
          {specs.map((spec, i) => (
            <div
              key={i}
              className="p-8 lg:p-12 flex flex-col hover:bg-white transition-colors duration-500"
            >
              <spec.icon
                size={24}
                className="text-emerald-700 mb-6"
                strokeWidth={1.5}
              />
              <h3 className="text-lg font-bold text-foreground mb-6 font-sans">
                {spec.title}
              </h3>

              <div className="space-y-4 mb-8 font-mono text-xs">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">RESOLUTION</span>
                  <span className="text-foreground font-semibold">
                    {spec.resolution}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">FREQUENCY</span>
                  <span className="text-foreground font-semibold">
                    {spec.frequency}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">ERROR MARGIN</span>
                  <span className="text-foreground font-semibold">
                    {spec.error}
                  </span>
                </div>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed font-sans mt-auto">
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
    <section className="py-24 bg-white relative font-sans">
      <div className="container mx-auto px-6 max-w-[1400px]">
        <div className="mb-16 border-b border-slate-900 pb-6 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-sans text-foreground flex items-center gap-3">
              <Code2
                className="text-muted-foreground"
                size={28}
                strokeWidth={1.5}
              />
              Rigorous Mathematical Proofs
            </h2>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hidden md:block">
            Open-source accounting validation
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 font-mono">
          {/* Formula 1 */}
          <div className="border border-border p-8 md:p-10 flex flex-col justify-between bg-white shadow-sm hover:border-brand transition-colors">
            <div>
              <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] block mb-4 border-b border-border pb-4">
                01. BIOMASS SEQUESTRATION (AGB)
              </span>
              <h3 className="text-foreground text-xl font-bold font-sans mb-4">
                Above-Ground Biomass Quantification
              </h3>
              <p className="text-muted-foreground text-sm font-sans leading-relaxed mb-8">
                Utilized to translate raw physical observations (whether via
                LiDAR canopy dimensions or environmental indices) into total
                vegetative mass.
              </p>
            </div>

            <div className="bg-muted p-6 border border-border my-4 overflow-x-auto w-full min-w-0 select-none flex justify-center">
              <MathRenderer
                formula="AGB = 0.0673 \times (\rho D^2 H)^{0.976}"
                displayMode={true}
                className="text-foreground text-base md:text-lg font-sans"
              />
            </div>

            <div className="text-xs text-slate-600 space-y-3 font-sans mt-6">
              <p className="flex items-start gap-3">
                <strong className="text-foreground font-mono w-12 shrink-0 pt-0.5">
                  AGB:
                </strong>
                <span>
                  Above-Ground Biomass volume equivalent (
                  <MathRenderer formula="\text{kg}" className="text-[11px]" />)
                </span>
              </p>
              <p className="flex items-start gap-3">
                <strong className="text-foreground font-mono w-12 shrink-0 pt-0.5">
                  <MathRenderer formula="\rho" className="text-[13px]" />:
                </strong>
                <span>
                  Mean wood density metric calibrated by ecosystem databases
                </span>
              </p>
              <p className="flex items-start gap-3">
                <strong className="text-foreground font-mono w-12 shrink-0 pt-0.5">
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

          {/* Formula 2 */}
          <div className="border border-border p-8 md:p-10 flex flex-col justify-between bg-white shadow-sm hover:border-brand transition-colors">
            <div>
              <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] block mb-4 border-b border-border pb-4">
                02. CONSERVATISM PRINCIPLE
              </span>
              <h3 className="text-foreground text-xl font-bold font-sans mb-4">
                Net Asset Allocation Accounting
              </h3>
              <p className="text-muted-foreground text-sm font-sans leading-relaxed mb-8">
                Aligns directly with global standards (Verra VM0042 / Gold
                Standard). We explicitly subtract all risk factors before
                minting credits.
              </p>
            </div>

            <div className="bg-muted p-6 border border-border my-4 overflow-x-auto w-full min-w-0 select-none flex justify-center">
              <MathRenderer
                formula="N_{\text{credits}} = G_{\text{removals}} - L_{\text{deduction}} - B_{\text{contribution}}"
                displayMode={true}
                className="text-foreground text-base md:text-lg font-sans"
              />
            </div>

            <div className="text-xs text-slate-600 space-y-3 font-sans mt-6">
              <p className="flex items-start gap-3">
                <strong className="text-foreground font-mono w-24 shrink-0 pt-0.5">
                  N_credits:
                </strong>
                <span>
                  Total finalized net carbon credits issued to the marketplace
                </span>
              </p>
              <p className="flex items-start gap-3">
                <strong className="text-foreground font-mono w-24 shrink-0 pt-0.5">
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
                <strong className="text-foreground font-mono w-24 shrink-0 pt-0.5">
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
    <section className="py-24 bg-muted border-t border-border">
      <div className="container mx-auto px-6 max-w-[1400px]">
        <div className="mb-16">
          <h2 className="text-4xl font-sans text-foreground mb-4 leading-tight">
            Tree to Token: <br />
            <span className="italic text-brand">Chain of Custody.</span>
          </h2>
          <p className="text-muted-foreground text-base max-w-xl font-sans">
            Explore the exact path data takes from a remote forest to an
            immutable public registry. No manual spreadsheets. No human
            tampering.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Pipeline Visual (Left Col) */}
          <div className="lg:col-span-5 space-y-6 relative before:absolute before:inset-0 before:ml-[31px] before:-translate-x-px before:h-full before:w-[2px] before:bg-slate-200">
            <div className="relative flex items-start gap-6 group">
              <div className="flex items-center justify-center w-16 h-16 bg-white border border-border text-foreground shrink-0 relative z-10 group-hover:border-slate-900 transition-colors">
                <HardDrive size={24} strokeWidth={1.5} />
              </div>
              <div className="pt-2 font-sans">
                <h4 className="font-bold text-foreground text-lg mb-1">
                  1. Edge Capture
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Hardware physically signs raw telemetry with a private key.
                  Prevents data spoofing at the source.
                </p>
              </div>
            </div>

            <div className="relative flex items-start gap-6 group">
              <div className="flex items-center justify-center w-16 h-16 bg-white border border-border text-foreground shrink-0 relative z-10 group-hover:border-slate-900 transition-colors">
                <Database size={24} strokeWidth={1.5} />
              </div>
              <div className="pt-2 font-sans">
                <h4 className="font-bold text-foreground text-lg mb-1">
                  2. dMRV Ingestion & AI
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Satellite rasters and edge data are processed. Biomass and
                  carbon equivalence are calculated automatically.
                </p>
              </div>
            </div>

            <div className="relative flex items-start gap-6 group">
              <div className="flex items-center justify-center w-16 h-16 bg-foreground border border-slate-900 text-white shrink-0 relative z-10">
                <LinkIcon size={24} strokeWidth={1.5} />
              </div>
              <div className="pt-2 font-sans">
                <h4 className="font-bold text-foreground text-lg mb-1">
                  3. On-Chain Minting
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  The verified payload is hashed and a non-fungible digital
                  credit is minted on Polygon for immutability.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Console UI (Right Col) */}
          {/* Note: Kept dark for contrast as requested by UI/UX architect for terminal simulation */}
          <div className="lg:col-span-7 bg-[#0a0a0a] shadow-2xl border border-slate-800 flex flex-col h-[600px] relative font-mono text-sm min-w-0 w-full max-w-full">
            {/* Terminal Title Bar */}
            <div className="bg-[#111111] px-6 py-4 flex items-center justify-between border-b border-slate-800 select-none shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-4">
                  dMRV_trust_console.sh
                </span>
              </div>

              {/* Console Tabs */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("json");
                    setSelectedIotNode(null);
                  }}
                  className={`px-4 py-1 border transition-all cursor-pointer text-[10px] uppercase tracking-widest font-bold ${
                    activeTab === "json"
                      ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                      : "border-transparent text-muted-foreground hover:text-slate-300"
                  }`}
                >
                  ledger_payload.json
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("gis");
                    setSelectedIotNode(null);
                  }}
                  className={`px-4 py-1 border transition-all cursor-pointer text-[10px] uppercase tracking-widest font-bold ${
                    activeTab === "gis"
                      ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                      : "border-transparent text-muted-foreground hover:text-slate-300"
                  }`}
                >
                  gis_satellite.proof
                </button>
              </div>
            </div>

            {/* Console Content Screen */}
            <div className="flex-1 overflow-hidden relative bg-transparent">
              {/* Laser Scan Line Overlay */}
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
                /* JSON TAB */
                <div className="p-6 h-full flex flex-col justify-between overflow-y-auto">
                  <div className="relative overflow-x-auto w-full min-w-0">
                    <pre className="text-slate-300 leading-[1.8] text-xs select-text">
                      <span className="text-muted-foreground">{`{`}</span>
                      {"\n"}
                      <span
                        role="button"
                        tabIndex={0}
                        onMouseEnter={() => setHoveredField("asset_id")}
                        onMouseLeave={() => setHoveredField(null)}
                        onFocus={() => setHoveredField("asset_id")}
                        onBlur={() => setHoveredField(null)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && setHoveredField("asset_id")
                        }
                        className="text-emerald-400 cursor-help hover:bg-slate-800 transition-colors outline-none"
                      >{`  "asset_id"`}</span>
                      <span className="text-muted-foreground">{`: `}</span>
                      <span className="text-sky-300">{`"crv_0x8f2a...9b1c"`}</span>
                      <span className="text-muted-foreground">{`,`}</span>
                      {"\n"}
                      <span
                        role="button"
                        tabIndex={0}
                        onMouseEnter={() => setHoveredField("project_did")}
                        onMouseLeave={() => setHoveredField(null)}
                        onFocus={() => setHoveredField("project_did")}
                        onBlur={() => setHoveredField(null)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && setHoveredField("project_did")
                        }
                        className="text-emerald-400 cursor-help hover:bg-slate-800 transition-colors outline-none"
                      >{`  "project_did"`}</span>
                      <span className="text-muted-foreground">{`: `}</span>
                      <span className="text-sky-300">{`"did:crevy:gh:brong-ahafo:82"`}</span>
                      <span className="text-muted-foreground">{`,`}</span>
                      {"\n"}
                      <span
                        role="button"
                        tabIndex={0}
                        onMouseEnter={() => setHoveredField("vintage")}
                        onMouseLeave={() => setHoveredField(null)}
                        onFocus={() => setHoveredField("vintage")}
                        onBlur={() => setHoveredField(null)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && setHoveredField("vintage")
                        }
                        className="text-emerald-400 cursor-help hover:bg-slate-800 transition-colors outline-none"
                      >{`  "vintage"`}</span>
                      <span className="text-muted-foreground">{`: `}</span>
                      <span className="text-orange-300">{`2026`}</span>
                      <span className="text-muted-foreground">{`,`}</span>
                      {"\n"}
                      <span
                        role="button"
                        tabIndex={0}
                        onMouseEnter={() => setHoveredField("quantification")}
                        onMouseLeave={() => setHoveredField(null)}
                        onFocus={() => setHoveredField("quantification")}
                        onBlur={() => setHoveredField(null)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && setHoveredField("quantification")
                        }
                        className="text-emerald-400 cursor-help hover:bg-slate-800 transition-colors outline-none"
                      >{`  "quantification"`}</span>
                      <span className="text-muted-foreground">{`: {`}</span>
                      {"\n"}
                      <span
                        role="button"
                        tabIndex={0}
                        onMouseEnter={() => setHoveredField("mass_tco2e")}
                        onMouseLeave={() => setHoveredField(null)}
                        onFocus={() => setHoveredField("mass_tco2e")}
                        onBlur={() => setHoveredField(null)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && setHoveredField("mass_tco2e")
                        }
                        className="text-blue-400 cursor-help hover:bg-slate-800 transition-colors pl-4 outline-none"
                      >{`    "mass_tco2e"`}</span>
                      <span className="text-muted-foreground">{`: `}</span>
                      <span className="text-orange-300">{`1.000`}</span>
                      <span className="text-muted-foreground">{`,`}</span>
                      {"\n"}
                      <span
                        role="button"
                        tabIndex={0}
                        onMouseEnter={() => setHoveredField("confidence_score")}
                        onMouseLeave={() => setHoveredField(null)}
                        onFocus={() => setHoveredField("confidence_score")}
                        onBlur={() => setHoveredField(null)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          setHoveredField("confidence_score")
                        }
                        className="text-blue-400 cursor-help hover:bg-slate-800 transition-colors pl-4 outline-none"
                      >{`    "confidence_score"`}</span>
                      <span className="text-muted-foreground">{`: `}</span>
                      <span className="text-orange-300">{`0.962`}</span>
                      <span className="text-muted-foreground">{`,`}</span>
                      {"\n"}
                      <span
                        role="button"
                        tabIndex={0}
                        onMouseEnter={() => setHoveredField("satellite_cid")}
                        onMouseLeave={() => setHoveredField(null)}
                        onFocus={() => setHoveredField("satellite_cid")}
                        onBlur={() => setHoveredField(null)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && setHoveredField("satellite_cid")
                        }
                        className="text-blue-400 cursor-help hover:bg-slate-800 transition-colors pl-4 outline-none"
                      >{`    "satellite_cid"`}</span>
                      <span className="text-muted-foreground">{`: `}</span>
                      <span className="text-sky-300">{`"ipfs://QmX..."`}</span>
                      {"\n"}
                      <span className="text-muted-foreground">{`  },`}</span>
                      {"\n"}
                      <span
                        role="button"
                        tabIndex={0}
                        onMouseEnter={() =>
                          setHoveredField("hardware_attestation")
                        }
                        onMouseLeave={() => setHoveredField(null)}
                        onFocus={() => setHoveredField("hardware_attestation")}
                        onBlur={() => setHoveredField(null)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          setHoveredField("hardware_attestation")
                        }
                        className="text-emerald-400 cursor-help hover:bg-slate-800 transition-colors outline-none"
                      >{`  "hardware_attestation"`}</span>
                      <span className="text-muted-foreground">{`: {`}</span>
                      {"\n"}
                      <span
                        role="button"
                        tabIndex={0}
                        onMouseEnter={() => setHoveredField("device_mac")}
                        onMouseLeave={() => setHoveredField(null)}
                        onFocus={() => setHoveredField("device_mac")}
                        onBlur={() => setHoveredField(null)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && setHoveredField("device_mac")
                        }
                        className="text-blue-400 cursor-help hover:bg-slate-800 transition-colors pl-4 outline-none"
                      >{`    "device_mac"`}</span>
                      <span className="text-muted-foreground">{`: `}</span>
                      <span className="text-sky-300">{`"00:1B:44:11:3A:B7"`}</span>
                      <span className="text-muted-foreground">{`,`}</span>
                      {"\n"}
                      <span
                        role="button"
                        tabIndex={0}
                        onMouseEnter={() => setHoveredField("signature")}
                        onMouseLeave={() => setHoveredField(null)}
                        onFocus={() => setHoveredField("signature")}
                        onBlur={() => setHoveredField(null)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && setHoveredField("signature")
                        }
                        className="text-blue-400 cursor-help hover:bg-slate-800 transition-colors pl-4 outline-none"
                      >{`    "signature"`}</span>
                      <span className="text-muted-foreground">{`: `}</span>
                      <span className="text-sky-300">{`"0x3e8...f1a"`}</span>
                      {"\n"}
                      <span className="text-muted-foreground">{`  }`}</span>
                      {"\n"}
                      <span className="text-muted-foreground">{`}`}</span>
                    </pre>
                  </div>

                  {/* Hover Tooltip display area */}
                  <div className="h-20 border-t border-slate-800 pt-4 text-xs flex items-start text-muted-foreground shrink-0 select-none font-sans mt-4">
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
                        <span className="text-slate-600 font-mono text-[10px] uppercase tracking-widest">
                          {/* Inspect payload keys for dMRV architectural details. */}
                        </span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                /* GIS TAB */
                <div className="relative w-full h-full bg-[#0a0a0a] overflow-hidden flex flex-col justify-between">
                  <div
                    className="relative flex-1 bg-cover bg-center select-none"
                    style={{ backgroundImage: `url('/img/satellite_map.png')` }}
                  >
                    {/* Overlay layers */}
                    {activeLayer === "sar" && (
                      <div className="absolute inset-0 bg-blue-500/10 border border-blue-400/20 mix-blend-screen pointer-events-none flex items-center justify-center">
                        <svg
                          className="w-full h-full absolute inset-0 text-sky-400/30 opacity-80"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                        >
                          <title>SAR Wireframe</title>
                          <path
                            d="M 0 0 L 100 100 M 100 0 L 0 100 M 0 50 L 100 50 M 50 0 L 50 100"
                            stroke="currentColor"
                            strokeWidth="0.1"
                            strokeDasharray="1 1"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="0.1"
                            strokeDasharray="1 2"
                          />
                        </svg>
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

                    {/* IoT Pins Overlay */}
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

                    {/* IoT Telemetry Popup */}
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
                            className="text-muted-foreground hover:text-white cursor-pointer font-bold"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-slate-300 font-sans font-medium mb-1">
                          {selectedIotNode.name}
                        </p>
                        <p className="text-muted-foreground font-mono text-[10px]">
                          {selectedIotNode.val}
                        </p>
                        <p className="text-[10px] text-emerald-700 font-mono mt-2 pt-2 border-t border-slate-800">
                          ✓ SIG_HASH: 0x8a92...b61c
                        </p>
                      </div>
                    )}
                  </div>

                  {/* GIS Controls Footer */}
                  <div className="bg-[#111111] border-t border-slate-800 p-4 shrink-0 flex items-center justify-between">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setActiveLayer("optical")}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeLayer === "optical" ? "bg-slate-800 text-white" : "text-muted-foreground hover:text-slate-300"}`}
                      >
                        Optical
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveLayer("sar")}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeLayer === "sar" ? "bg-slate-800 text-sky-400" : "text-muted-foreground hover:text-slate-300"}`}
                      >
                        Radar (SAR)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveLayer("ndvi")}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeLayer === "ndvi" ? "bg-slate-800 text-emerald-400" : "text-muted-foreground hover:text-slate-300"}`}
                      >
                        NDVI
                      </button>
                    </div>
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground cursor-pointer select-none">
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

            {/* Terminal Action / Status Bar */}
            <div className="bg-[#0a0a0a] px-6 py-4 border-t border-slate-800 shrink-0 flex items-center justify-between select-none">
              {verificationState === "idle" && (
                <>
                  <span className="text-muted-foreground text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted0 animate-pulse"></span>
                    Ready for pipeline evaluation
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationState("verifying");
                      setTimeout(() => setVerificationState("success"), 2500);
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-foreground text-[10px] uppercase tracking-[0.2em] px-4 py-2 font-bold transition-colors cursor-pointer"
                  >
                    Execute Proof
                  </button>
                </>
              )}

              {verificationState === "verifying" && (
                <span className="text-slate-300 text-[10px] font-mono uppercase tracking-widest flex items-center gap-3 w-full justify-center">
                  <svg
                    className="animate-spin h-3 w-3 text-slate-300"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <title>Verifying</title>
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
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
                    className="text-muted-foreground hover:text-white text-[10px] font-bold uppercase tracking-widest cursor-pointer"
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
