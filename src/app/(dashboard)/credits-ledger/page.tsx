"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ChevronDown,
  Filter,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { type Column, DataTable } from "@/components/DataTable";
import { CreditService } from "@/lib/services/credit-service";
import { cn } from "@/lib/utils";

export default function PlatformCreditsLedgerPage() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  const { data, isLoading } = useQuery({
    queryKey: ["platform-credits-ledger", statusFilter, currentPage],
    queryFn: () =>
      CreditService.getCarbonCredits({
        creditStatus:
          statusFilter === "all" ? undefined : (statusFilter as any),
        limit: itemsPerPage,
        // If your service supports page-based offsets, pass pagination details here:
        // page: currentPage,
      }),
  });

  const credits = data?.data || [];

  // Local simulated pagination calculation if the underlying API setup doesn't deliver a total count meta wrapper
  const totalPages = Math.max(1, Math.ceil(credits.length / itemsPerPage) || 1);

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1); // Reset back to the initial viewport page
  };

  // Define Table Column Structural Configurations
  const columns: Column<any>[] = [
    {
      header: "Serial Number",
      render: (item) => (
        <div className="font-mono text-xs font-bold text-slate-900 tracking-tight bg-slate-100 px-2.5 py-1.5 inline-block rounded-none border border-slate-200">
          {item.serialNumber || `SN-${item.id.slice(0, 12).toUpperCase()}`}
        </div>
      ),
    },
    {
      header: "Project Details",
      render: (item) => (
        <>
          <div className="font-bold text-slate-900 text-sm tracking-tight">
            {item.project?.name || "Global Program Allocation"}
          </div>
          <div className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 flex items-center gap-2">
            <span className="w-1 h-1 bg-slate-300 rounded-none" />
            {item.project?.code || item.mrv_batch_id?.slice(0, 8).toUpperCase()}
          </div>
        </>
      ),
    },
    {
      header: "Vintage",
      render: (item) => (
        <div className="font-mono text-xs font-bold text-slate-800 tracking-wider">
          [{item.creditVintage}]
        </div>
      ),
    },
    {
      header: "Volume (tCO₂e)",
      align: "right",
      render: (item) => (
        <div className="font-mono text-base font-bold text-slate-900 tabular-nums">
          {parseFloat(item.availableAmount).toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
        </div>
      ),
    },
    {
      header: "Status",
      align: "right",
      render: (item) => (
        <div className="inline-flex items-center justify-end">
          <span
            className={cn(
              "inline-flex items-center gap-2 border px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-[0.15em] rounded-none select-none",
              item.creditStatus === "available"
                ? "border-slate-900 bg-slate-950 text-white"
                : "border-slate-200 bg-slate-50 text-slate-400",
            )}
          >
            {item.creditStatus === "available" ? (
              <Activity size={11} className="text-brand animate-pulse" />
            ) : (
              <ShieldCheck size={11} className="text-slate-400" />
            )}
            {item.creditStatus === "available" ? "Available" : "Retired"}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-brand selection:text-slate-900">
      {/* ── Simplified Editorial Header ── */}
      <div className="bg-white pt-14 pb-16 border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2 h-2 bg-brand rounded-none" />
            <span className="text-slate-900 text-[10px] font-mono font-bold tracking-[0.2em] uppercase">
              Carbon Credit Directory
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6 leading-none">
            Credit{" "}
            <span className="italic font-light text-slate-400">Registry.</span>
          </h1>
          <p className="text-slate-500 text-sm max-w-2xl leading-relaxed font-light">
            View and track the complete directory of verified carbon credits
            registered on the Crevy platform. This ledger provides real-time
            information on serial numbers, project origins, vintages, and
            available volumes to maintain absolute transparency and accuracy
            across our entire ecological network.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto py-12 px-6 lg:px-10">
        {/* ── Control Panel ── */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          {/* Search Input Terminal */}
          <div className="w-full md:w-1/2">
            <label
              htmlFor="global-registry-search"
              className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 block select-none"
            >
              Search Registry
            </label>
            <div className="relative border-b-2 border-slate-200 focus-within:border-slate-900 transition-colors">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-900 w-4 h-4" />
              <input
                id="global-registry-search"
                type="text"
                placeholder="Search by serial number, project name, or identifier..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full pl-7 pr-4 py-3 bg-transparent border-none outline-none font-mono text-sm text-slate-900 placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Filter Dropdown */}
          <div className="relative w-full md:w-56 rounded-none">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 z-10 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full pl-10 pr-10 py-4 bg-white border border-slate-200 text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-slate-700 outline-none hover:border-slate-900 cursor-pointer appearance-none rounded-none transition-colors"
            >
              <option value="all">All Carbon Credits</option>
              <option value="available">Available Credits</option>
              <option value="retired">Retired Credits</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* ── Custom Data Table Architecture Integration ── */}
        <DataTable
          columns={columns}
          data={credits}
          isLoading={isLoading}
          loadingMessage="Loading credit registry details..."
          emptyMessage="No structural registry records matched your query parameters."
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
}
