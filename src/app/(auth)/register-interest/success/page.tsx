"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import GalleryBackground from "@/components/GalleryBackground";

export default function RegisterInterestSuccessPage() {
  return (
    <div className="relative h-screen w-screen overflow-hidden font-sans selection:bg-brand selection:text-slate-900">
      {/* Fixed masonry background matching the submission screen */}
      <GalleryBackground parallax={false} dim={true} />

      {/* Cinematic dark overlay */}
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs pointer-events-none z-0" />

      {/* Fixed Top Left Logo Identifier */}
      <div className="fixed top-6 left-6 sm:top-8 sm:left-10 z-30">
        <Link
          href="/"
          className="font-bold text-3xl tracking-tight text-white hover:text-brand transition-colors"
        >
          Crevy<span className="text-brand">.</span>
        </Link>
      </div>

      {/* Centered card for success state */}
      <div className="relative z-10 flex items-center justify-center h-full w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full max-w-md 3xl:max-w-xl bg-white p-8 md:p-12 border border-slate-200 rounded-none text-center shadow-none relative">
          {/* Institutional Success Indicator */}
          <div className="w-12 h-12 bg-slate-950 border border-slate-900 rounded-none flex items-center justify-center mx-auto mb-6 text-brand">
            <CheckCircle2 size={20} strokeWidth={1.5} />
          </div>

          {/* Clean, Simple Typography */}
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Application Received<span className="text-brand">.</span>
          </h1>

          <p className="text-sm text-foreground/70 font-light leading-relaxed mb-8">
            Thank you for your interest in Crevy. We have successfully received
            your request to join the waitlist. Our team will review your
            submission details and reach out to you via email regarding the next
            steps.
          </p>

          {/* Action Button matching institutional style guide */}
          <Link
            href="/"
            className="inline-flex w-full bg-brand text-foreground rounded-none px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-foreground hover:text-white transition-colors items-center justify-center"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
