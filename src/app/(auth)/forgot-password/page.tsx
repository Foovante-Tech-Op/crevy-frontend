"use client";

import { ArrowLeft, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import GalleryBackground from "@/components/GalleryBackground";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API identity validation
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("If that email is registered, we've sent a reset link.");
    }, 1500);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden font-sans selection:bg-brand selection:text-slate-900">
      {/* Fixed masonry background from registration interest paradigm */}
      <GalleryBackground parallax={false} dim={true} />

      {/* Cinematic dark overlay to elevate content isolation */}
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

      {/* Centered stationary container matching the structural workflow layout */}
      <div className="relative z-10 flex items-center justify-center h-full w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full max-w-xl bg-white p-8 md:p-12 border border-slate-200 rounded-none shadow-none relative">
          {submitted ? (
            <div className="text-center py-4 animate-in fade-in duration-300">
              <div className="w-12 h-12 bg-slate-950 border border-slate-900 rounded-none flex items-center justify-center mx-auto mb-6 text-brand">
                <Mail size={20} strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
                Check your email<span className="text-brand">.</span>
              </h2>
              <p className="text-sm text-slate-500 font-light leading-relaxed mb-8">
                An authentication recovery link has been compiled and dispatched
                to your registered vector.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={12} className="text-brand" /> Return to Login
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                {/* Core Navigation Back Button */}
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors mb-6"
                >
                  <ArrowLeft size={12} className="text-brand" /> Back to Login
                </Link>

                <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none mb-3">
                  Reset Token<span className="text-brand">.</span>
                </h1>
                <p className="text-sm text-slate-500 font-light leading-relaxed">
                  Provide your registered organizational email matrix to
                  initialize a cryptographic security overwrite cycle.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label
                    htmlFor="email"
                    className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 block"
                  >
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="operative@institution.com"
                    required
                    disabled={loading}
                    className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 font-mono text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors outline-none disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand text-foreground rounded-none px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" /> Submitting...
                    </>
                  ) : (
                    "Initialize Recovery Protocol"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
