"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { Database, FileDigit, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getOptimizedVideoUrl } from "@/lib/utils/cloudinary";

// ─── MONOTONIC COUNTER ───
function Counter({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number | null = null;
    const duration = 2500;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      // easeOutQuart
      const easeOutQuart = 1 - (1 - progress) ** 4;
      setCount(Math.floor(easeOutQuart * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}
    </span>
  );
}

// ─── MEDIA CONFIGURATION ───
const CAROUSEL_DATA = [
  {
    id: "v1",
    src: getOptimizedVideoUrl("vid1.1_vn20nv.mp4"),
    tag: "Regenerative Agriculture",
    headlinePrefix: "Restoring Earth's",
    headlineItalic: "Baseline.",
    desc: "Financing high-yield carbon sequestration through verified soil rehabilitation across the African continent.",
  },
  {
    id: "v2",
    src: getOptimizedVideoUrl("vid2_cvgee6.mp4"),
    tag: "Reforestation Assets",
    headlinePrefix: "Scaling the",
    headlineItalic: "Canopy.",
    desc: "Immutable investment in native tree planting, restoring critical biodiversity while generating premium-grade carbon yields.",
  },
  {
    id: "v3",
    src: getOptimizedVideoUrl("vid3.1_ywgatv.mp4"),
    tag: "Renewable Infrastructure",
    headlinePrefix: "Powering the",
    headlineItalic: "Future.",
    desc: "Capital allocation for solar and wind arrays, displacing fossil fuel dependency with audited, clean energy metrics.",
  },
  {
    id: "v4",
    src: getOptimizedVideoUrl("pollution_br6cyo.mp4"),
    tag: "Industrial Decarbonization",
    headlinePrefix: "Abating Heavy",
    headlineItalic: "Emissions.",
    desc: "Cryptographic telemetry and verified offset mechanism integration to systematically neutralize heavy industry and scope-1 manufacturing footprints.",
  },
];

export function HeroSection({
  shouldReduceMotion,
}: {
  shouldReduceMotion?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeContent = CAROUSEL_DATA[activeIndex];

  // Logic: Change source without unmounting the video element to prevent layout shift
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = activeContent.src;
      videoRef.current.load();
      if (!shouldReduceMotion) {
        videoRef.current.play().catch(console.warn);
      }
    }
  }, [shouldReduceMotion, activeContent.src]);

  return (
    <section className="relative min-h-[95vh] w-full flex flex-col justify-center overflow-hidden bg-foreground pt-24 pb-16 border-b border-slate-900">
      {/* ── 1. Stabilized Cinematic Background ── */}
      {/* The container below forces a stable aspect ratio and blocks layout shifts */}
      <div className="absolute inset-0 z-0 bg-foreground">
        <video
          ref={videoRef}
          className="w-full h-full object-cover opacity-70"
          playsInline
          muted
          autoPlay={!shouldReduceMotion}
          onEnded={() =>
            setActiveIndex((prev) => (prev + 1) % CAROUSEL_DATA.length)
          }
        />
      </div>

      {/* ── 2. Animated Typography ── */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 relative z-10 w-full flex-1 flex flex-col justify-center py-12">
        <div className="max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeContent.id}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 border border-slate-700 bg-slate-900/50 backdrop-blur-md mb-8">
                <span className="w-2 h-2 bg-brand rounded-none animate-pulse" />
                <span className="text-white text-[10px] font-bold tracking-[0.2em] uppercase">
                  Live Asset Class: {activeContent.tag}
                </span>
              </div>

              <h1 className="font-extrabold text-5xl md:text-7xl lg:text-8xl text-white leading-[1.05] tracking-tight mb-8">
                {activeContent.headlinePrefix} <br />
                <span className="text-brand">
                  {activeContent.headlineItalic}
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-white font-light leading-relaxed max-w-3xl mb-12">
                {activeContent.desc}
              </p>
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
          >
            <Link
              href="/register"
              className="w-full sm:w-auto bg-brand text-white px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand/90 transition-colors text-center"
            >
              Join Us
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── 3. Carousel Progress Indicators ── */}
      <div className="relative z-20 w-full border-t border-slate-800 bg-slate-950/80 backdrop-blur-sm py-4">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex items-center gap-4">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 hidden md:block w-32 shrink-0">
            System Telemetry
          </p>
          <div className="flex-1 flex gap-2">
            {CAROUSEL_DATA.map((item, index) => (
              <button
                type="button"
                key={item.id}
                className="flex-1 h-1 bg-slate-800 relative cursor-pointer group"
                onClick={() => setActiveIndex(index)}
              >
                {activeIndex === index && (
                  <motion.div
                    layoutId="activeProgress"
                    className="absolute inset-y-0 left-0 bg-brand w-full origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 8, ease: "linear" }}
                  />
                )}
              </button>
            ))}
          </div>
          <p className="text-[10px] font-mono text-slate-500 shrink-0 w-12 text-right">
            0{activeIndex + 1} / 0{CAROUSEL_DATA.length}
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── TRUST LAYER SECTION ─────────────────────────────────────────────────────

export function TrustLayerSection({
  shouldReduceMotion,
}: {
  shouldReduceMotion?: boolean;
}) {
  return (
    <section className="relative z-20 pb-16 pt-4">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        {/* ── Live Counter & Ledger Truth ── */}
        <div className="grid lg:grid-cols-12 gap-px border-brand border -mt-12 relative z-30 p-3 shadow-2xl shadow-slate-950/50">
          {/* Live Data Block */}
          <div className="lg:col-span-4 bg-brand p-8 md:p-10 flex flex-col justify-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 mb-4">
              Live Ledger Telemetry
            </p>
            <div className="font-mono text-4xl md:text-6xl text-white font-bold tracking-tight mb-2">
              <Counter value={1204500} />
            </div>
            <p className="text-slate-900 text-xs font-mono uppercase tracking-widest">
              Tonnes of CO₂e Projected to be Retired by 2030
            </p>
          </div>

          {/* Infographic Process Block */}
          <div className="lg:col-span-8 p-8 md:p-10">
            <p className="text-[10px] uppercase tracking-[0.2em] mb-8">
              The Serial Number Promise
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {[
                {
                  label: "Baseline Assessment",
                  icon: Database,
                  desc: "Phase One: Project Onboarding",
                },
                {
                  label: "Pre-Verification",
                  icon: ShieldCheck,
                  desc: "Phase Two: Registry Onboarding",
                },
                {
                  label: "Marketplace & Issuance",
                  icon: FileDigit,
                  desc: "Phase Three: Asset Generation",
                },
              ].map((step, idx) => (
                <div key={idx} className="flex-1 w-full relative">
                  <div className="border border-brand/20 p-6 flex flex-col items-center text-center group hover:border-slate-900 transition-colors">
                    <step.icon
                      size={24}
                      className="text-brand mb-4 group-hover:text-slate-900 transition-colors"
                    />
                    <h4 className="font-bold text-sm mb-1">{step.label}</h4>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500">
                      {step.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Auditor Logos ── */}
        <div className="pt-4 mt-6 border-t border-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 shrink-0">
            Frameworks & Compliance:
          </p>
          <div className="flex flex-wrap gap-6 md:gap-12 text-xs md:text-xl font-bold text-slate-400">
            <span className="hover:text-white transition-colors cursor-default">
              [ ICVCM Aligned ]
            </span>
            {/* <span className="hover:text-white transition-colors cursor-default">
              [ CORSIA Ready ]
            </span> */}
            <span className="hover:text-white transition-colors cursor-default">
              [ Gold Standard ]
            </span>
            <span className="hover:text-white transition-colors cursor-default">
              [ Verra ]
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
