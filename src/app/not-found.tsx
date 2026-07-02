// src/app/not-found.tsx
"use client";

import {
  Compass,
  CornerDownLeft,
  HelpCircle,
  LayoutDashboard,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GalleryBackground from "@/components/GalleryBackground";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative h-screen w-screen overflow-hidden font-sans selection:bg-brand selection:text-slate-900 flex items-center justify-center p-4 sm:p-6">
      {/* Fixed masonry background matching the submission screen */}
      <GalleryBackground parallax={false} dim={true} />

      {/* Floating Editorial Canvas Container */}
      <div className="relative z-10 w-full max-w-2xl bg-white border border-slate-200 p-6 sm:p-12 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col justify-between min-h-[500px]">
        {/* Header Metadata Block */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">
              Protocol Fault
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5">
              Index Misaligned
            </span>
          </div>

          {/* Main Typography Display */}
          <div className="space-y-3">
            <h1 className="font-sans text-7xl font-light tracking-tighter text-foreground leading-none">
              404<span className="text-brand font-sans font-bold">.</span>
            </h1>
            <h2 className="font-sans text-2xl text-foreground tracking-tight italic">
              The asset or coordinate path does not exist.
            </h2>
            <p className="text-slate-500 text-xs font-light max-w-md leading-relaxed">
              The requested directory sector could not be resolved by the
              registry core. It may have been re-indexed, moved under an altered
              cryptographic hash, or archived.
            </p>
          </div>
        </div>

        {/* ── THE NAVIGATION COUNCIL ── */}
        <div className="my-8 border border-slate-100 bg-slate-50/50 p-4 sm:p-5">
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-foreground block mb-3">
            System Navigation Council
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 p-3 bg-white border border-slate-200 hover:border-foreground transition-all group"
            >
              <div className="w-7 h-7 bg-slate-950 text-white flex items-center justify-center group-hover:bg-brand transition-colors shrink-0">
                <LayoutDashboard size={14} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-foreground block tracking-wide">
                  Core Dashboard
                </span>
                <span className="text-[9px] text-slate-400 font-mono uppercase block tracking-wider">
                  Return to Base
                </span>
              </div>
            </Link>

            <Link
              href="/projects"
              className="flex items-center gap-3 p-3 bg-white border border-slate-200 hover:border-foreground transition-all group"
            >
              <div className="w-7 h-7 bg-slate-950 text-white flex items-center justify-center group-hover:bg-brand transition-colors shrink-0">
                <Compass size={14} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-foreground block tracking-wide">
                  Asset Registry
                </span>
                <span className="text-[9px] text-slate-400 font-mono uppercase block tracking-wider">
                  Browse Operations
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Action Button Layout */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 border border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-widest hover:text-foreground hover:border-slate-400 transition-all rounded-none bg-white"
          >
            <CornerDownLeft className="w-3 h-3 mr-2 text-slate-400" />
            Revert to Previous Position
          </button>

          <Link
            href="/support"
            className="w-full sm:flex-1 inline-flex items-center justify-center px-6 py-3.5 bg-foreground text-white font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-brand transition-colors rounded-none"
          >
            <HelpCircle className="w-3 h-3 mr-2 text-slate-300" />
            Report Pipeline Break
          </Link>
        </div>
      </div>
    </div>
  );
}
