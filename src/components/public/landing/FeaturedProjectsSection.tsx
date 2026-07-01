"use client";

import { motion } from "framer-motion";
import Link from "next/link";

// ─── INSTITUTIONAL TICKER ───
export function ScrollingMarquee() {
  return (
    <div className="bg-slate-200 py-3 overflow-hidden relative border-b border-slate-300">
      <style jsx>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .marquee-container { display: flex; white-space: nowrap; animation: marquee 40s linear infinite; }
      `}</style>
      <div className="marquee-container">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center space-x-8 px-4">
            <span className="text-slate-500 font-mono font-bold text-[10px] uppercase tracking-[0.2em] whitespace-nowrap">
              LIVE REGISTRY ✦ VERIFIED ASSETS ✦ NO DOUBLE COUNTING ✦ IMMUTABLE
              LEDGER ✦ INSTITUTIONAL GRADE ✦ CORE CARBON PRINCIPLES ✦
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FINAL CTA ───
export function FinalCTASection({
  shouldReduceMotion,
}: {
  shouldReduceMotion?: boolean;
}) {
  return (
    <section className="bg-foreground py-32 border-t border-slate-800">
      <div className="max-w-[1000px] mx-auto px-6 text-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-12"
        >
          <div className="inline-block border border-brand px-4 py-2 text-brand text-[10px] font-bold uppercase tracking-widest">
            The Infrastructure of Tomorrow
          </div>
          <h2 className="font-bold text-5xl md:text-7xl text-white leading-tight tracking-tight">
            Join the future of carbon.
            <br />
            <span className="text-brand italic font-light">
              Generate, buy, or verify.
            </span>
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-px bg-slate-700 border border-slate-700 p-px mx-auto w-fit">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-brand text-white hover:bg-slate-900 px-8 py-5 text-[10px] font-bold uppercase tracking-widest transition-colors"
            >
              Become a Project Owner
            </Link>
            <Link
              href="/marketplace"
              className="w-full sm:w-auto bg-foreground text-brand hover:bg-slate-900 px-8 py-5 text-[10px] font-bold uppercase tracking-widest transition-colors"
            >
              Start Buying Credits
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto bg-white text-brand hover:bg-brand hover:text-white px-8 py-5 text-[10px] font-bold uppercase tracking-widest transition-colors"
            >
              Auditor Access Request
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
