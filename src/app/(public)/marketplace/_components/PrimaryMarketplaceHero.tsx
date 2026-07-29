"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Activity, Globe2, History, LucideLayoutDashboard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
// Add your LiquidEther import here
import LiquidEther from "@/components/LiquidEther";

const HERO_STATS = [
  {
    value: "100%",
    label: "Digital dMRV Pipeline",
    icon: <Activity size={16} />,
  },
  {
    value: "0%",
    label: "Double-Counting Risk",
    icon: <Globe2 size={16} />,
  },
  {
    value: "100Y",
    label: "Target Durability Epoch",
    icon: <History size={16} />,
  },
];

export default function PrimaryMarketplaceHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax scroll logic
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Map scroll progress to vertical transformations
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -120]); // Moves up faster
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 60]); // Moves down slightly
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -200]); // Moves up fastest

  return (
    <div
      ref={containerRef}
      className="bg-foreground min-h-[90vh] border-b border-slate-900 relative overflow-hidden flex items-center"
    >
      {/* Liquid Ether Background */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden opacity-80">
        <LiquidEther
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          colors={["#10B981", "#ffffff", "#e69e6e"]}
          autoDemo
          autoSpeed={0.5}
          autoIntensity={2.2}
          isBounce={false}
          resolution={0.5}
        />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 relative z-10 w-full pt-32 pb-24 pointer-events-none">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 relative pointer-events-auto">
          {/* Left Column: Typography, CTAs, and Stats */}
          <div className="lg:col-span-6 flex flex-col justify-center relative z-20">
            <div className="inline-flex items-center gap-3 px-4 py-2 border border-slate-700 bg-foreground/80 mb-8 max-w-max rounded-none backdrop-blur-md">
              <span className="w-2 h-2 bg-brand animate-pulse rounded-none" />
              <span className="text-white text-[10px] font-mono font-bold tracking-[0.2em] uppercase">
                Pre-Pilot Telemetry: Primary Marketplace Intent
              </span>
            </div>

            <h1 className="font-extrabold text-5xl md:text-7xl text-white leading-[1.05] tracking-tight mb-6 drop-shadow-lg">
              Curated Environmental <br />
              <span className="text-brand italic font-light pr-4">Assets.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed max-w-xl mb-10 drop-shadow-md">
              Acquire verified carbon credits directly from high-integrity
              projects. Every asset is planned to be strictly audited,
              satellite-verified, and structured for immutable retirement.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-16">
              <Link
                href="/dashboard"
                className="border border-slate-700 bg-background/80 backdrop-blur-sm text-black px-8 py-5 text-[10px] font-mono font-bold uppercase tracking-[0.2em] hover:bg-brand transition-colors rounded-none flex items-center gap-2 group"
              >
                <LucideLayoutDashboard className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                Dashboard
              </Link>
            </div>

            {/* Stats Block */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-slate-800/80">
              {HERO_STATS.map((s, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-brand mb-1">
                    {s.icon}
                    <span className="text-2xl font-mono text-white font-bold tabular-nums leading-none">
                      {s.value}
                    </span>
                  </div>
                  <p className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Parallax Floating Bento Media */}
          <div className="lg:col-span-6 relative h-[600px] hidden lg:block">
            {/* Angular Telemetry Path */}
            <svg
              className="absolute inset-0 w-full h-full z-0 opacity-30"
              viewBox="0 0 600 600"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <title>Angular Telemetry Path</title>
              <path
                d="M 50 150 L 300 220 L 250 480 L 550 400"
                stroke="currentColor"
                strokeWidth="2"
                className="text-brand"
                strokeDasharray="4 4"
              />
              <circle cx="50" cy="150" r="4" fill="#2cc295" />
              <circle cx="300" cy="220" r="4" fill="#2cc295" />
              <circle cx="250" cy="480" r="4" fill="#2cc295" />
              <circle cx="550" cy="400" r="4" fill="#2cc295" />
            </svg>

            {/* Visual 1: Parallax Image (Top Right) */}
            <motion.div
              style={{ y: y1 }}
              className="absolute top-[5%] right-[5%] w-[280px] h-[340px] border border-slate-800 bg-foreground p-2 z-10 group rounded-none"
            >
              <div className="relative w-full h-full overflow-hidden border border-slate-800 rounded-none bg-black">
                <Image
                  src="https://images.pexels.com/photos/17764754/pexels-photo-17764754.jpeg"
                  alt="Canopy"
                  fill
                  className="object-cover opacity-65 group-hover:mix-blend-normal group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute top-3 left-3 bg-background/90 border border-slate-800 px-2 py-1 z-10">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-foreground font-bold">
                    Green Projects
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Visual 2: Parallax Video (Center Left) */}
            <motion.div
              style={{ y: y2 }}
              className="absolute top-[35%] left-[5%] w-[320px] h-[220px] border border-brand bg-foreground/80 p-2 z-20 group shadow-2xl shadow-brand/10 rounded-none backdrop-blur-sm"
            >
              <div className="relative w-full h-full overflow-hidden border border-slate-800 rounded-none bg-black">
                <video
                  src="https://www.pexels.com/download/video/34494550"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-65 group-hover:mix-blend-normal group-hover:opacity-90 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center z-10">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-brand font-bold animate-pulse">
                    LIVE STREAM
                  </span>
                  <div className="w-1.5 h-1.5 bg-brand rounded-none" />
                </div>
              </div>
            </motion.div>

            {/* Visual 3: Parallax Image (Bottom Right) */}
            <motion.div
              style={{ y: y3 }}
              className="absolute top-[65%] right-[15%] size-[250px] border border-slate-800 bg-foreground p-2 z-10 group rounded-none"
            >
              <div className="relative w-full h-full overflow-hidden border border-slate-800 rounded-none bg-black">
                <Image
                  src="https://images.pexels.com/photos/31938887/pexels-photo-31938887.jpeg"
                  alt="Soil"
                  fill
                  className="object-cover opacity-65 group-hover:mix-blend-normal group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                />
                <div className="absolute bottom-3 right-3 bg-brand/50 backdrop-blur-sm border border-slate-800 px-2 py-1 z-10">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-foreground font-bold">
                    Canopy
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
