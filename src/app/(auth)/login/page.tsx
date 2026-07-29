"use client";

import { Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import BackButton from "../_components/BackButton";
import LoginForm from "../_components/LoginForm";

const STATS = [
  { value: "200+", label: "Assets Waiting to be Verified" },
  { value: "50K+", label: "tCO₂e Estimated to be Sequestered" },
  { value: "20+", label: "Partners across the continent" },
];

const LoginPage = () => {
  return (
    <div className="w-full flex font-sans bg-slate-50 selection:bg-brand selection:text-slate-900 lg:h-screen lg:overflow-hidden">
      {/* ── Left: Authentication Terminal ────────────────────────────────────── */}
      <div className="relative flex flex-col w-full lg:w-[45%] xl:w-[40%] bg-white px-8 md:px-16 py-12 lg:h-full overflow-y-auto border-r border-slate-200 z-10">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-16 shrink-0 border-b border-slate-200 pb-6">
          <Link
            href="/"
            className="font-bold text-3xl tracking-tight text-slate-900 hover:text-brand transition-colors"
          >
            Crevy<span className="text-brand">.</span>
          </Link>
          <Link
            href="/register"
            className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 transition-colors"
          >
            No clearance?{" "}
            <span className="text-brand border-b border-brand pb-0.5 ml-1 hover:text-slate-900 hover:border-slate-900 transition-colors">
              Sign Up
            </span>
          </Link>
        </div>

        <BackButton
          href="/register"
          label="Back to Register"
          className="mb-8 -mt-4"
        />

        {/* Form Container */}
        <div className="flex flex-1 flex-col justify-center max-w-sm mx-auto w-full">
          {/* Institutional Eyebrow */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-2 h-2 bg-brand rounded-none animate-pulse shrink-0" />
              <span className="text-slate-900 text-[10px] font-mono font-bold tracking-[0.2em] uppercase">
                Authentication Protocol
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-none mb-4">
              Access{" "}
              <span className="italic font-light text-slate-400">
                Dashboard.
              </span>
            </h1>
            <p className="mt-2 text-sm text-slate-500 font-light leading-relaxed">
              Provide authorization credentials to pull system records, dispatch
              carbon assets, and audit algorithmic network yield.
            </p>
          </div>

          <LoginForm />

          {/* Footer Note */}
          <div className="mt-12 pt-6 border-t border-slate-100 text-left">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
              By authenticating, you bind yourself to the{" "}
              <Link
                href="/terms-of-service"
                className="text-slate-900 hover:text-brand transition-colors border-b border-slate-200 hover:border-brand"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                className="text-slate-900 hover:text-brand transition-colors border-b border-slate-200 hover:border-brand"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="mt-auto shrink-0 pt-8">
          <p className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400">
            © 2026 Crevy Infrastructure · Accra, GH
          </p>
        </div>
      </div>

      {/* ── Right: Institutional Imagery ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] relative bg-foreground">
        {/* Strict Image Frame */}
        <div className="relative w-full h-full border border-slate-900 rounded-none overflow-hidden group">
          <Image
            src="https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg"
            alt="Ecological Asset Landscape"
            fill
            priority
            className="object-cover opacity-40 mix-blend-luminosity group-hover:scale-102 transition-transform duration-[8s] ease-out"
            sizes="60vw"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/20 to-transparent" />

          {/* Content Ledger */}
          <div className="absolute z-10 bottom-0 left-0 w-full p-12 xl:p-16 flex flex-col justify-end h-full">
            <div className="mb-auto mt-8">
              <Globe size={48} className="text-brand" strokeWidth={1} />
            </div>

            <div className="max-w-2xl border-l-2 border-brand pl-8 mb-16">
              <h2 className="text-4xl xl:text-6xl font-bold text-white leading-[1.05] tracking-tight mb-6">
                Turn ecological assets into verified{" "}
                <span className="italic font-light text-brand">
                  institutional yield.
                </span>
              </h2>
              <p className="text-slate-400 text-lg font-light leading-relaxed max-w-xl">
                Join capital allocators interacting with cryptographically
                certified carbon credits — transparent, immutable, and strictly
                audited.
              </p>
            </div>

            {/* Telemetry Strip */}
            <div className="grid grid-cols-3 gap-px bg-slate-900 border border-slate-800 rounded-none">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-slate-950 p-6 flex flex-col justify-center hover:bg-slate-900 transition-colors rounded-none"
                >
                  <p className="text-white font-mono font-bold text-3xl xl:text-4xl leading-none mb-2 tracking-tight tabular-nums">
                    {stat.value}
                  </p>
                  <p className="text-slate-500 font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
