"use client";

import {
  Calendar,
  Download,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";

function ComplianceCertificateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return (
    <div className="bg-[#f8fafc] min-h-screen py-20 px-6 animate-in fade-in duration-1000">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <button
            type="button"
            onClick={() => router.push("/compliance")}
            className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-2 hover:text-slate-900 transition-colors"
          >
            &larr; Back to Registry
          </button>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="rounded-xl border-slate-200 text-xs font-black uppercase tracking-widest shadow-sm"
            >
              <Download size={16} className="mr-2" /> Download PDF
            </Button>
            <Button className="bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl">
              <ExternalLink size={16} className="mr-2" /> Share Link
            </Button>
          </div>
        </div>

        {/* ── Certificate Document ── */}
        <div className="bg-white border-8 border-slate-900 p-12 md:p-24 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] relative overflow-hidden">
          {/* Watermark Logo */}
          <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
            <ShieldCheck size={400} />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center space-y-12">
            <div className="space-y-4">
              <p className="text-[#2cc295] font-black text-xs uppercase tracking-[0.4em]">
                Official Impact Verification
              </p>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 uppercase italic leading-none tracking-tighter">
                Certificate <br /> of Retirement
              </h1>
            </div>

            <div className="w-24 h-[2px] bg-slate-200" />

            <div className="space-y-4 max-w-2xl">
              <p className="text-slate-500 font-medium text-lg italic">
                This document certifies that the following carbon reduction
                units have been permanently retired from the Crevy Registry and
                are no longer available for trade.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full pt-8">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Retirement Volume
                </p>
                <p className="text-4xl font-black text-slate-900">
                  420 <span className="text-lg text-slate-400">tCO2e</span>
                </p>
              </div>
              <div className="space-y-2 border-x border-slate-100 px-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Registry Reference
                </p>
                <p className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  {id}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Vintage Year
                </p>
                <p className="text-4xl font-black text-slate-900">2024</p>
              </div>
            </div>

            <div className="w-full bg-slate-50 rounded-[2rem] p-10 mt-12 grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <MapPin className="text-brand-500 shrink-0" size={20} />
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Project Origin
                    </p>
                    <p className="font-bold text-slate-800 text-sm">
                      Volta Basin Reforestation Program
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Calendar className="text-brand-500 shrink-0" size={20} />
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Retirement Date
                    </p>
                    <p className="font-bold text-slate-800 text-sm">
                      May 12, 2026
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end justify-center">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <QrCode size={80} className="text-slate-900" />
                </div>
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-4">
                  Verification Scan
                </p>
              </div>
            </div>

            <div className="pt-12 text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] flex items-center gap-4">
              <Globe size={14} /> Cryptographically Anchored to Polygon Mainnet
              <span className="w-4 h-4 rounded-full bg-brand-500/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              </span>
              Live Verification Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComplianceCertificatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
        </div>
      }
    >
      <ComplianceCertificateContent />
    </Suspense>
  );
}
