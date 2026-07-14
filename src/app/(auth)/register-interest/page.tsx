import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import GalleryBackground from "@/components/GalleryBackground";
import RegisterInterestForm from "../_components/RegisterInterestForm";

export const metadata: Metadata = {
  title: "Register Interest — Crevy",
  description:
    "Join the Crevy waitlist as a project owner, investor, or carbon credit buyer.",
};

// A clean, simple skeleton fallback that keeps layout shifts to a minimum
function FormLoadingFallback() {
  return (
    <div className="w-full max-w-md p-8 bg-background/80 backdrop-blur-md rounded-2xl border border-slate-200/10 flex flex-col items-center justify-center space-y-4 min-h-[400px]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-brand" />
      <p className="text-sm text-slate-400 animate-pulse">Loading form...</p>
    </div>
  );
}

export default function RegisterInterestPage() {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Fixed masonry background */}
      <GalleryBackground parallax={false} dim={true} />

      {/* Cinematic dark overlay to elevate content isolation */}
      <div className="fixed inset-0 bg-foreground/40 backdrop-blur-xs pointer-events-none z-0" />

      {/* Fixed Top Left Logo Identifier */}
      <div className="fixed top-6 left-6 sm:top-8 sm:left-10 z-30">
        <Link
          href="/"
          className="font-bold text-3xl tracking-tight text-brand hover:text-slate-700 transition-colors"
        >
          Crevy.
        </Link>
      </div>

      {/* Centered container keeping the form card stationary */}
      <div className="relative z-10 flex items-center justify-center h-full w-full px-4 sm:px-6 lg:px-8 py-6 pt-28 md:pt-0">
        <Suspense fallback={<FormLoadingFallback />}>
          <RegisterInterestForm />
        </Suspense>
      </div>
    </div>
  );
}
