"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  Download,
  ExternalLink,
  FileText,
  Flame,
  Globe2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { CreditService } from "@/lib/services/credit-service";

export default function PortfolioOverview() {
  const { user } = useUser();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch Owned Credits
  const { data: creditsRes, isLoading } = useQuery({
    queryKey: ["portfolio-credits", user?.id],
    queryFn: () =>
      CreditService.getCarbonCredits({ currentOwnerId: user?.id, limit: 20 }),
    enabled: !!user?.id,
  });

  const credits = creditsRes?.data || [];
  const totalOwned = credits.reduce(
    (acc: number, curr: any) => acc + parseFloat(curr.availableAmount),
    0,
  );

  // Simulated Market Value & Trends
  const netValue = totalOwned * 52.4;

  const valueTrend = [
    { day: "01", val: 4200 },
    { day: "05", val: 4500 },
    { day: "10", val: 4400 },
    { day: "15", val: 4800 },
    { day: "20", val: 5100 },
    { day: "25", val: 5350 },
    { day: "30", val: 5600 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen pt-40 pb-20 flex flex-col items-center justify-center text-slate-400">
        <Globe2
          size={32}
          className="mb-4 animate-pulse text-slate-300"
          strokeWidth={1}
        />
        <span className="text-[10px] font-mono uppercase tracking-[0.3em]">
          Syncing Institutional Ledger...
        </span>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      {/* ── Editorial Header ── */}
      <div className="bg-white border-b border-slate-200 py-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-8 h-[1px] bg-slate-900"></div>
                <span className="text-slate-900 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                  <ShieldCheck size={14} className="text-brand-700" />
                  Private Institutional Assets
                </span>
                <div className="w-8 h-[1px] bg-slate-900"></div>
              </div>

              <h1 className="text-5xl md:text-7xl font-sans text-slate-900 tracking-tight leading-[1.05] mb-6">
                Institutional{" "}
                <span className="italic text-slate-500">Registry.</span>
              </h1>

              <p className="text-slate-500 text-lg font-light leading-relaxed italic">
                The secure vault for your organization&apos;s carbon credit
                holdings. Manage your proprietary asset inventory, track
                valuation trends, and execute strategic retirements to fulfill
                ESG commitments.
              </p>
            </div>

            {/* Financial Value Metric Box */}
            <div className="w-full md:w-auto bg-slate-900 p-8 min-w-[320px] shadow-2xl shrink-0">
              <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                <p className="text-brand-400 text-[10px] font-bold uppercase tracking-widest">
                  Net Portfolio Value
                </p>
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <h2 className="text-5xl font-mono text-white font-bold">
                  $
                  {netValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h2>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                  USD
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-400">
                <TrendingUp size={12} /> +8.2% Market Yield
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* ── Liquid Asset Ledger (Left Column) ── */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex justify-between items-end border-b-2 border-slate-900 pb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
                Liquid Asset Ledger
              </h3>
              <Link
                href="/portfolio/ledger"
                className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
              >
                View Full Index <ArrowUpRight size={12} />
              </Link>
            </div>

            <div className="bg-white border border-slate-200">
              {credits.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center justify-center bg-slate-50">
                  <ShieldCheck
                    size={32}
                    className="text-slate-300 mb-4"
                    strokeWidth={1}
                  />
                  <p className="text-slate-500 font-sans text-lg">
                    No active assets in registry.
                  </p>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mt-2">
                    Acquire credits from the primary marketplace.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {credits.map((credit: any, i: number) => (
                    <motion.div
                      key={credit.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors group"
                    >
                      {/* Asset Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 shrink-0">
                          <BadgeCheck size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-sans text-xl text-slate-900 leading-none">
                              Verified Carbon Unit
                            </h4>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-2">
                            <span>
                              Batch: {credit.mrv_batch_id.slice(0, 12)}...
                            </span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span>Vintage: {credit.creditVintage}</span>
                          </div>
                        </div>
                      </div>

                      {/* Volume & Actions */}
                      <div className="flex items-center gap-8 md:gap-12">
                        <div className="text-right">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                            Liquid Volume
                          </p>
                          <p className="text-xl font-mono font-bold text-brand-800">
                            {parseFloat(
                              credit.availableAmount,
                            ).toLocaleString()}{" "}
                            <span className="text-xs text-slate-500 font-normal">
                              t
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button
                            asChild
                            variant="outline"
                            className="rounded-none border-slate-300 text-[10px] font-bold uppercase tracking-widest text-slate-900 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-colors h-10 px-6"
                          >
                            <Link href={`/portfolio/retire/${credit.id}`}>
                              <Flame size={14} className="mr-2 text-red-500" />{" "}
                              Retire
                            </Link>
                          </Button>
                          <a
                            href={`https://polygonscan.com/tx/${credit.blockchainTxHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View On-Chain Proof"
                            className="w-10 h-10 flex items-center justify-center border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-colors"
                          >
                            <ExternalLink size={16} />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Impact Insights & Exports (Right Column) ── */}
          <div className="lg:col-span-4 space-y-8">
            {/* Market Chart */}
            <div className="bg-white border border-slate-200 p-8">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 mb-6 flex items-center justify-between">
                Performance Index
                <span className="text-brand-600 flex items-center gap-1">
                  <TrendingUp size={12} /> Live
                </span>
              </h3>

              <div className="w-full mb-6 min-h-[180px]">
                {!isMounted ? (
                  <div className="h-[180px] w-full bg-slate-50 animate-pulse flex items-center justify-center">
                    <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">
                      Waking Chart...
                    </span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%" aspect={2.5}>
                    <AreaChart
                      data={valueTrend}
                      margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorVal"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#0f172a"
                            stopOpacity={0.1}
                          />
                          <stop
                            offset="95%"
                            stopColor="#0f172a"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#0f172a",
                          color: "#fff",
                          fontSize: "12px",
                          fontFamily: "monospace",
                        }}
                        itemStyle={{ color: "#fff" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="val"
                        stroke="#0f172a"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorVal)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Index Alpha
                  </p>
                  <p className="text-xl font-sans text-slate-900 leading-none">
                    1.24×
                  </p>
                </div>
                <p className="text-[10px] font-mono text-brand-700 uppercase tracking-widest">
                  Outperforming
                </p>
              </div>
            </div>

            {/* Compliance Exports */}
            <div className="bg-slate-50 border border-slate-200 p-8">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 mb-6">
                Compliance Documents
              </h3>
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 hover:border-slate-900 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <FileText
                      className="text-slate-400 group-hover:text-slate-900 transition-colors"
                      size={18}
                    />
                    <span className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">
                      Q2 ESG Summary
                    </span>
                  </div>
                  <Download
                    size={14}
                    className="text-slate-300 group-hover:text-slate-900 transition-colors"
                  />
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 hover:border-slate-900 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck
                      className="text-slate-400 group-hover:text-slate-900 transition-colors"
                      size={18}
                    />
                    <span className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">
                      Audit Proofs (ZIP)
                    </span>
                  </div>
                  <Download
                    size={14}
                    className="text-slate-300 group-hover:text-slate-900 transition-colors"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
