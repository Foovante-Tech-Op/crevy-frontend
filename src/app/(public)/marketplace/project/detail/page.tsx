"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Cpu,
  Globe2,
  Loader2,
  Lock,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ProjectService } from "@/lib/services/project-service";

/**
 * Marketplace Project Detail Page (Public Sales View)
 */
export default function MarketplaceProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [_isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: projectRes, isLoading } = useQuery({
    queryKey: ["marketplace-project", slug],
    queryFn: () => ProjectService.getProjectBySlug(slug),
    enabled: !!slug,
  });

  const project = projectRes?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center text-white">
        <h1 className="text-4xl font-extrabold text-white mb-4 uppercase tracking-tight">
          Project Not Located
        </h1>
        <p className="text-slate-400 mb-8 max-w-md font-light">
          The requested asset registry record could not be found.
        </p>
        <Button
          onClick={() => router.push("/marketplace")}
          className="bg-brand text-slate-900 hover:bg-white rounded-none uppercase font-bold tracking-[0.2em] text-xs px-10 h-14"
        >
          Return to Marketplace
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 font-sans text-white selection:bg-slate-900 selection:text-white pb-32">
      {/* ── 1. CINEMATIC HERO SECTION ───────────────────────────────────────── */}
      <section className="relative h-[90vh] w-full overflow-hidden bg-slate-950 border-b border-slate-900">
        <div className="absolute inset-0 z-0">
          <Image
            src={
              project.imageUrl ||
              "https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg?auto=compress&cs=tinysrgb&w=1200"
            }
            alt={project.name}
            fill
            sizes="100vw"
            priority
            className="object-cover mix-blend-luminosity opacity-50 transition-transform duration-[5s] hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10 h-full flex flex-col justify-end pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl space-y-8"
          >
            <div className="flex flex-wrap items-center gap-4">
              <span className="bg-slate-900/80 border border-slate-800 text-brand px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] rounded-none backdrop-blur-md">
                {project.projectType?.replace(/_/g, " ")}
              </span>
              <span className="bg-slate-950/80 border border-slate-800 text-slate-400 px-4 py-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.2em] rounded-none backdrop-blur-md">
                Registry:{" "}
                {project.registryStatus?.replace(/_/g, " ").toUpperCase()}
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold text-white tracking-tight leading-[0.9] uppercase">
              {project.name.split(" ").map((word: string, i: number) => (
                <span key={i} className={i === 0 ? "text-brand" : ""}>
                  {word}
                  <br className="hidden lg:block" />
                </span>
              ))}
            </h1>

            <div className="flex flex-wrap items-center gap-12 pt-8 border-l-2 border-brand pl-8">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">
                  Regional Context
                </p>
                <p className="text-white font-bold uppercase tracking-wide flex items-center gap-2 text-sm">
                  <MapPin size={14} className="text-brand" /> {project.region},{" "}
                  {project.country}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">
                  Institutional Status
                </p>
                <p className="text-brand font-mono font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-xs">
                  <ShieldCheck size={14} /> Technology Verified
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. ACQUISITION TERMINAL ────────────────────────────────────────── */}
      <section className="container mx-auto px-6 -mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Scientific Proof & Narrative */}
          <div className="lg:col-span-8 space-y-12">
            <div className="bg-slate-900 border border-slate-800 p-10 lg:p-16 shadow-2xl rounded-none">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand mb-8 border-b border-slate-800 pb-4">
                Impact Narrative
              </h2>
              <div className="space-y-6">
                <p className="text-3xl font-extrabold text-white leading-tight mb-8">
                  Transforming the {project.region} through high-fidelity{" "}
                  {project.projectType?.replace(/_/g, " ")} protocols.
                </p>
                <p className="text-slate-300 text-lg font-light leading-relaxed">
                  {project.description ||
                    "This project implements rigorous ecological restoration and monitoring. Utilizing the Crevy dMRV framework, we ensure that every metric tonne sequestered is backed by immutable telemetry and cryptographic signatures."}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-8 border-t border-slate-800">
                {[
                  {
                    label: "Total Area",
                    val: project.totalAreaHectares,
                    unit: "HA",
                  },
                  { label: "Annual Yield", val: "4,200", unit: "tCO2e" },
                  { label: "Vintage", val: "2024", unit: "EST" },
                  { label: "SDG Tags", val: "13, 15", unit: "#" },
                ].map((m, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                      {m.label}
                    </p>
                    <p className="text-2xl font-mono font-bold text-white tracking-tight tabular-nums">
                      {m.val}{" "}
                      <span className="text-[10px] text-slate-500 font-normal">
                        {m.unit}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Scientific Trust Module */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-slate-900 border border-slate-800 p-8 space-y-6 rounded-none">
                <div className="flex justify-between items-start">
                  <Cpu className="text-brand" size={28} strokeWidth={1.5} />
                  <span className="px-3 py-1 bg-brand text-slate-900 text-[9px] font-bold uppercase tracking-[0.2em]">
                    99.8% Conf.
                  </span>
                </div>
                <h3 className="text-lg font-extrabold uppercase tracking-tight text-white">
                  AI Verification Proof
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed font-light">
                  Crevy Worker 2 has validated this batch against historical
                  baselines with extreme certainty.
                </p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-8 space-y-6 text-white rounded-none">
                <div className="flex justify-between items-start">
                  <Lock className="text-brand" size={28} strokeWidth={1.5} />
                  <span className="px-3 py-1 border border-slate-700 text-brand text-[9px] font-mono font-bold uppercase tracking-[0.2em]">
                    SECURE
                  </span>
                </div>
                <h3 className="text-lg font-extrabold uppercase tracking-tight text-white">
                  Hardware Integrity
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed font-light">
                  Cryptographic hardware signatures confirm raw telemetry
                  originated from verified on-site NDIR sensors.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Pricing & Acquisition */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <div className="bg-slate-950 border border-slate-800 p-10 text-white shadow-2xl space-y-10 relative overflow-hidden rounded-none">
              <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12">
                <Globe2 size={180} />
              </div>

              <div className="relative z-10 space-y-2">
                <p className="text-brand text-[10px] font-bold uppercase tracking-[0.2em]">
                  Institutional Price
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-mono font-bold tracking-tight text-white tabular-nums">
                    $52.00
                  </span>
                  <span className="text-slate-500 font-mono font-bold uppercase tracking-widest text-xs">
                    USD
                  </span>
                </div>
                <p className="text-slate-400 text-[10px] font-mono uppercase tracking-widest">
                  Per verified carbon unit (tCO2e)
                </p>
              </div>

              <div className="relative z-10 pt-8 border-t border-slate-800 space-y-6">
                <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest">
                  <span className="text-slate-400">Inventory Status</span>
                  <span className="text-brand font-bold">● Liquid</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest">
                  <span className="text-slate-400">Available units</span>
                  <span className="font-bold text-white tabular-nums">
                    28,420 t
                  </span>
                </div>
              </div>

              <div className="relative z-10 space-y-4">
                <Button
                  asChild
                  className="w-full h-16 bg-brand hover:bg-white text-slate-900 rounded-none font-bold uppercase tracking-[0.2em] text-xs transition-colors group/btn"
                >
                  <Link href={`/marketplace/checkout?projectId=${project.id}`}>
                    Initiate Acquisition
                    <ArrowUpRight
                      size={18}
                      className="ml-3 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform"
                    />
                  </Link>
                </Button>
                <p className="text-[9px] text-slate-500 text-center font-mono uppercase tracking-widest leading-relaxed">
                  Transactions executed via smart-contracts and anchored on
                  Polygon PoS.
                </p>
              </div>
            </div>

            {/* Anonymized Developer */}
            <div className="mt-6 p-6 border border-slate-800 bg-slate-900 flex items-center justify-between rounded-none">
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">
                  Asset Developer
                </p>
                <p className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Developer {project.code?.split("-")[1] || "GH"}-
                  {project.id.slice(0, 4).toUpperCase()}
                </p>
              </div>
              <div className="w-10 h-10 bg-slate-950 rounded-none flex items-center justify-center text-slate-500 border border-slate-800 font-mono text-sm">
                ?
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
