"use client";

import {
  motion,
  useMotionTemplate,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { getOptimizedVideoUrl } from "@/lib/utils/cloudinary";

/* ═════════════════════════════════════════════════════════════════
   CINEMATIC SCROLL-DRIVEN EXPANSION REVEAL
   ───────────────────────────────────────────────────────────────
   Phase 1  (0.00 → 0.18)  Video expands from inset to fullscreen
   Phase 2  (0.10 → 0.22)  Darkening overlay settles in
   Phase 3  (0.22 → 0.44)  Text cascade — staggered timeline reveal
   Phase 4  (0.44 → 1.00)  Hold for reading / breathing room
   ═════════════════════════════════════════════════════════════════ */
export function CinematicScrollPitch({
  shouldReduceMotion,
}: {
  shouldReduceMotion?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  /* Smooth the raw scroll value so nothing feels jittery */
  const progress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  /* ── PHASE 1: VIDEO EXPANSION ── */
  const videoWidth = useTransform(progress, [0, 0.18], ["30vw", "100vw"]);
  const videoHeight = useTransform(progress, [0, 0.18], ["40vh", "100vh"]);
  const videoRadius = useTransform(progress, [0, 0.18], ["24px", "0px"]);
  const videoShadow = useTransform(
    progress,
    [0, 0.18],
    ["0 25px 80px -20px rgba(0,0,0,0.6)", "0 0px 0px 0px rgba(0,0,0,0)"],
  );

  /* Marquee drifts away as the video takes focus */
  const marqueeOpacity = useTransform(progress, [0, 0.12], [1, 0]);

  /* ── PHASE 2: ATMOSPHERE ── */
  const overlayOpacity = useTransform(progress, [0.08, 0.22], [0, 0.85]);

  /* Master text layer — locked to 0 until the video is fully open */
  const pitchOpacity = useTransform(progress, [0, 0.2, 0.22], [0, 0, 1]);

  /* ── PHASE 3: CASCADING TEXT TIMELINE ──
     Each line gets an 0.08-wide scroll window with 0.035 stagger.
     y: 80 → 0 creates a dramatic upward drift.                        */
  const line1 = {
    opacity: useTransform(progress, [0.22, 0.3], [0, 1]),
    y: useTransform(progress, [0.22, 0.3], [80, 0]),
  };
  const line2 = {
    opacity: useTransform(progress, [0.255, 0.335], [0, 1]),
    y: useTransform(progress, [0.255, 0.335], [80, 0]),
  };
  const line3 = {
    opacity: useTransform(progress, [0.29, 0.37], [0, 1]),
    y: useTransform(progress, [0.29, 0.37], [80, 0]),
  };
  const line4 = {
    opacity: useTransform(progress, [0.325, 0.405], [0, 1]),
    y: useTransform(progress, [0.325, 0.405], [80, 0]),
  };
  const line5 = {
    opacity: useTransform(progress, [0.36, 0.44], [0, 1]),
    y: useTransform(progress, [0.36, 0.44], [80, 0]),
  };

  /* Convert shadow MotionValue to a valid CSS string */
  const boxShadow = useMotionTemplate`${videoShadow}`;

  if (shouldReduceMotion) {
    return <StaticPitchFallback />;
  }

  return (
    <section
      ref={containerRef}
      className="relative h-[350vh] bg-foreground border-t border-slate-900"
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {/* ═══════════════════════════════════════════
            BACKGROUND MARQUEE
            ═══════════════════════════════════════════ */}
        <motion.div
          style={{ opacity: marqueeOpacity }}
          className="absolute inset-0 flex flex-col justify-center gap-8 md:gap-16 pointer-events-none z-0 overflow-hidden"
        >
          <style jsx>{`
            @keyframes slide-left {
              from { transform: translateX(0); }
              to   { transform: translateX(-50%); }
            }
            @keyframes slide-right {
              from { transform: translateX(-50%); }
              to   { transform: translateX(0); }
            }
            .track-left  { display: flex; white-space: nowrap; animation: slide-left  40s linear infinite; }
            .track-right { display: flex; white-space: nowrap; animation: slide-right 40s linear infinite; }
          `}</style>

          <div className="track-left opacity-10">
            {[...Array(2)].map((_, i) => (
              <span
                key={i}
                className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white px-8"
              >
                NO GREENWASHING ✦ VERIFIABLE IMPACT ✦ IMMUTABLE LEDGER ✦{" "}
              </span>
            ))}
          </div>
          <div className="track-right opacity-10">
            {[...Array(2)].map((_, i) => (
              <span
                key={i}
                className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white px-8"
              >
                CORE CARBON PRINCIPLES ✦ ZERO DOUBLE COUNTING ✦{" "}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            EXPANDING VIDEO WINDOW
            ═══════════════════════════════════════════ */}
        <motion.div
          style={{
            width: videoWidth,
            height: videoHeight,
            borderRadius: videoRadius,
            boxShadow,
          }}
          className="relative z-10 bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800 will-change-transform"
        >
          <video
            key={getOptimizedVideoUrl("vid1.1_vn20nv.mp4")}
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            src={getOptimizedVideoUrl("vid1.1_vn20nv.mp4")}
            autoPlay
            muted
            loop
            playsInline
          />

          {/* Darkening overlay */}
          <motion.div
            style={{ opacity: overlayOpacity }}
            className="absolute inset-0 bg-foreground/70 will-change-opacity"
          />

          {/* ═══════════════════════════════════════════
              CASCADING TEXT REVEAL
              ═══════════════════════════════════════════ */}
          <motion.div
            style={{ opacity: pitchOpacity }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 lg:px-10 pointer-events-none opacity-0"
          >
            <div className="max-w-4xl mx-auto flex flex-col items-center">
              {/* Line 1 — Badge */}
              <motion.div
                style={{ opacity: line1.opacity, y: line1.y }}
                className="inline-flex items-center gap-3 px-4 py-2 border border-slate-700 bg-slate-900/50 backdrop-blur-md mb-8 pointer-events-auto opacity-0 will-change-transform"
              >
                <Lock size={12} className="text-emerald-500" />
                <span className="text-white text-[10px] font-bold tracking-[0.2em] uppercase">
                  Institutional Infrastructure
                </span>
              </motion.div>

              {/* Line 2 — Headline */}
              <motion.h2
                style={{ opacity: line2.opacity, y: line2.y }}
                className="font-extrabold text-4xl md:text-6xl lg:text-7xl text-white leading-[1.1] tracking-tight mb-6 pointer-events-auto opacity-0 will-change-transform"
              >
                From Verification to{" "}
                <span className="italic text-brand">Retirement.</span>
              </motion.h2>

              {/* Line 3 — Sub-headline */}
              <motion.h3
                style={{ opacity: line3.opacity, y: line3.y }}
                className="font-mono text-brand text-sm md:text-base uppercase tracking-widest mb-8 pointer-events-auto opacity-0 will-change-transform"
              >
                Infrastructure Built for Market Integrity.
              </motion.h3>

              {/* Line 4 — Body paragraph */}
              <motion.p
                style={{ opacity: line4.opacity, y: line4.y }}
                className="text-lg md:text-xl text-slate-300 font-light leading-relaxed max-w-2xl mb-12 pointer-events-auto opacity-0 will-change-transform"
              >
                We connect audited climate projects with committed corporations.
                <br className="hidden md:block" />
                <strong className="text-white">For Developers:</strong> access
                premium demand.
                <br className="hidden md:block" />
                <strong className="text-white">For buyers:</strong> verifiable
                impact.
                <br className="hidden md:block" />
                <strong className="text-white">For auditors:</strong> full
                lifecycle transparency.
              </motion.p>

              {/* Line 5 — CTA Buttons */}
              <motion.div
                style={{ opacity: line5.opacity, y: line5.y }}
                className="flex flex-col sm:flex-row gap-px bg-slate-700 border border-slate-700 p-px pointer-events-auto opacity-0 will-change-transform"
              >
                <Link
                  href="/marketplace"
                  className="bg-white text-slate-900 hover:bg-brand hover:text-white px-8 py-5 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 flex items-center justify-center gap-3"
                >
                  Access the Marketplace <ArrowRight size={14} />
                </Link>
                <Link
                  href="/methodology"
                  className="bg-brand text-white hover:bg-slate-800 px-8 py-5 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 flex items-center justify-center"
                >
                  Review Methodology
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════
   ACCESSIBILITY FALLBACK
   ═════════════════════════════════════════════════════════════════ */
function StaticPitchFallback() {
  return (
    <section className="relative min-h-screen bg-slate-950 flex flex-col justify-center items-center py-24 overflow-hidden border-t border-slate-900">
      <video
        className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-40"
        src={getOptimizedVideoUrl("vid1.1_vn20nv.mp4")}
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-slate-950/70" />

      <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
        <div className="inline-flex items-center gap-3 px-4 py-2 border border-slate-700 bg-slate-900/50 backdrop-blur-md mb-8">
          <Lock size={12} className="text-emerald-500" />
          <span className="text-white text-[10px] font-bold tracking-[0.2em] uppercase">
            Institutional Infrastructure
          </span>
        </div>

        <h2 className="font-extrabold text-4xl md:text-6xl text-white leading-tight mb-6">
          From Verification to{" "}
          <span className="italic text-slate-400">Retirement.</span>
        </h2>

        <h3 className="font-mono text-emerald-400 text-sm md:text-base uppercase tracking-widest mb-8">
          Infrastructure Built for Market Integrity.
        </h3>

        <p className="text-lg text-slate-300 mb-12 max-w-2xl mx-auto">
          We connect audited climate projects with committed corporations. For
          developers: access premium demand. For buyers: verifiable impact. For
          auditors: full lifecycle transparency.
        </p>

        <div className="flex flex-col sm:flex-row gap-px bg-slate-700 border border-slate-700 p-px w-fit mx-auto">
          <Link
            href="/marketplace"
            className="bg-white text-slate-900 hover:bg-emerald-500 hover:text-white px-8 py-5 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 flex items-center justify-center gap-3"
          >
            Access the Registry <ArrowRight size={14} />
          </Link>
          <Link
            href="/methodology"
            className="bg-slate-900 text-white hover:bg-slate-800 px-8 py-5 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 flex items-center justify-center"
          >
            Review Methodology
          </Link>
        </div>
      </div>
    </section>
  );
}
