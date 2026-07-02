"use client";

import { motion } from "framer-motion";

const ProcessingStep = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden">
      <div className="absolute inset-0 flex justify-center pointer-events-none opacity-20">
        <div className="w-px h-full bg-brand-500/50" />
        <div className="w-px h-full bg-brand-500/50 mx-[25vw]" />
        <div className="w-px h-full bg-brand-500/50 mx-[25vw]" />
      </div>

      <div className="flex flex-col items-center gap-8 max-w-md text-center px-6 relative z-10">
        <div className="w-12 h-12 border border-slate-700 border-t-brand-500 rounded-none animate-spin" />

        <div className="space-y-4">
          <h2 className="font-sans text-3xl md:text-4xl tracking-tight text-white">
            Encrypting <span className="italic text-slate-400">Payload.</span>
          </h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              repeat: Infinity,
              duration: 1,
              repeatType: "reverse",
            }}
            className="text-[10px] font-mono text-brand-500 uppercase tracking-[0.2em]"
          >
            &gt; Transmitting telemetry to ledger...
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingStep;
