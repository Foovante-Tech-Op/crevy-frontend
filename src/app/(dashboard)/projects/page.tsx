"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  LayoutGrid,
  List,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react"; // Added useCallback
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/hooks/use-user";
import { ProjectService } from "@/lib/services/project-service";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Project {
  id: string;
  code?: string;
  name: string;
  project_type?: string;
  projectType?: string;
  project_stage?: string;
  projectStage?: string;
  project_status?: string;
  projectStatus?: string;
  sector?: string;
  region?: string;
  country?: string;
  start_date?: string;
  createdAt?: string;
  registryStatus?: string;
  assessmentCompletion?: string;
}

// ─── Configuration ───────────────────────────────────────────────────────────

const statusConfig: Record<string, { color: string; dot: string; bg: string }> =
  {
    active: {
      color: "text-brand-700",
      dot: "bg-brand-500",
      bg: "bg-brand-500/10",
    },
    draft: {
      color: "text-slate-500",
      dot: "bg-slate-400",
      bg: "bg-slate-400/10",
    },
    suspended: {
      color: "text-red-700",
      dot: "bg-red-500",
      bg: "bg-red-500/10",
    },
    closed: {
      color: "text-slate-400",
      dot: "bg-slate-300",
      bg: "bg-slate-300/10",
    },
  };

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  return new Date(dateString)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
};

const getUnifiedValue = (obj: any, snakeKey: string, camelKey: string) =>
  obj[snakeKey] || obj[camelKey] || "";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AllProjectsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [viewType, setViewType] = useState<"list" | "grid">("list");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [globalFilter, setGlobalFilter] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);

  const isSuperAdmin = user?.role === "super_admin";

  // Wrapped in useCallback to preserve function reference across renders
  const handleProjectClick = useCallback(
    (p: Project) => {
      if (p.assessmentCompletion === "complete") {
        router.push(`/projects/${p.id}`);
      } else {
        router.push(`/projects/new?projectId=${p.id}`);
      }
    },
    [router],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["all-projects", statusFilter, globalFilter, cursor, user?.id],
    queryFn: () =>
      ProjectService.getProjects({
        projectStatus: statusFilter === "all" ? undefined : statusFilter,
        name: globalFilter || undefined,
        cursor: cursor || undefined,
        limit: viewType === "grid" ? 12 : 10,
        managerId: isSuperAdmin ? undefined : user?.id,
      }),
    enabled: !!user,
  });

  const projects = data?.data ?? [];
  const nextCursor = data?.nextCursor;

  const columns = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        id: "asset_identity",
        header: "Asset Identity",
        cell: ({ row }) => {
          const p = row.original;
          const status =
            getUnifiedValue(p, "project_status", "projectStatus") || "draft";
          const config =
            statusConfig[status.toLowerCase()] ?? statusConfig.draft;
          const isIncomplete = p.assessmentCompletion !== "complete";
          return (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("w-1.5 h-1.5 rounded-none", config.dot)} />
                <div className="font-sans text-sm 2xl:text-lg text-foreground leading-none">
                  {p.name}
                </div>
                {isIncomplete && (
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5">
                    Incomplete
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-[0.2em] ml-3.5">
                {p.code || `PRJ-${p.id.slice(0, 8)}`}
              </div>
            </div>
          );
        },
      },
      {
        id: "methodology",
        header: "Methodology",
        cell: ({ row }) => {
          const p = row.original;
          const typeStr = getUnifiedValue(p, "project_type", "projectType");
          return (
            <div>
              <div className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">
                {typeStr.replace(/_/g, " ") || "UNSPECIFIED"}
              </div>
              <div className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">
                {(p.sector || "General").replace(/_/g, " ")}
              </div>
            </div>
          );
        },
      },
      {
        id: "status_stage",
        header: "Lifecycle & Registry",
        cell: ({ row }) => {
          const p = row.original;
          const stage =
            getUnifiedValue(p, "project_stage", "projectStage") || "initiation";
          const regStatus = p.registryStatus || "pending_verification";
          const isVerified = regStatus === "dmrv_verified";
          return (
            <div className="flex flex-col items-start gap-1.5">
              <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600 bg-slate-100 px-2 py-0.5 border border-slate-200">
                Stage: {stage.replace(/_/g, " ")}
              </span>
              <span
                className={cn(
                  "font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 border",
                  isVerified
                    ? "bg-brand-50 text-brand-700 border-brand-200"
                    : "bg-amber-50 text-amber-700 border-amber-200",
                )}
              >
                {isVerified ? "✓ " : "⏳ "}
                {regStatus.replace(/_/g, " ")}
              </span>
            </div>
          );
        },
      },
      {
        id: "location",
        header: "Spatial Coordinates",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <MapPin className="h-3 w-3 text-slate-400" />
              {p.region ? `${p.region}, ` : ""}
              {p.country || "UNKNOWN"}
            </div>
          );
        },
      },
      {
        id: "timeline",
        header: "Initiation Date",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-900 uppercase tracking-widest">
              <Calendar className="h-3 w-3 text-slate-400" />
              {formatDate(p.start_date || p.createdAt)}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 rounded-none border border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-400"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 rounded-none border-2 border-slate-900 shadow-none bg-white"
            >
              <DropdownMenuLabel className="text-[9px] text-slate-400 uppercase tracking-[0.2em] px-3 py-2 font-bold">
                Asset Operations
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuItem
                onClick={() => handleProjectClick(row.original)}
                className="text-xs font-bold uppercase tracking-widest cursor-pointer py-2.5 rounded-none"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-2 text-slate-400" />{" "}
                {row.original.assessmentCompletion === "complete"
                  ? "View Dossier"
                  : "Resume Registration"}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs font-bold uppercase tracking-widest cursor-pointer py-2.5 rounded-none">
                <Activity className="h-3.5 w-3.5 mr-2 text-slate-400" />{" "}
                Telemetry Data
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuItem className="text-xs font-bold uppercase tracking-widest text-brand-700 focus:bg-brand-50 focus:text-brand-800 cursor-pointer py-2.5 rounded-none">
                <ShieldCheck className="h-3.5 w-3.5 mr-2" /> Verify Protocol
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [handleProjectClick],
  );

  const table = useReactTable({
    data: projects,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="animate-in fade-in duration-700 pb-24 font-sans selection:bg-slate-900 selection:text-white">
      <div className="border-b border-slate-200 bg-white pt-12 pb-8">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-6 h-[1px] bg-slate-900" />
                <span className="text-slate-900 text-[10px] font-bold uppercase tracking-[0.2em]">
                  {isSuperAdmin ? "Global Registry" : "Managed Portfolio"}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-sans text-slate-900 tracking-tight leading-none mb-4">
                Asset <span className="italic text-slate-500">Oversight.</span>
              </h1>
              <p className="text-slate-500 text-sm max-w-xl leading-relaxed">
                Complete inventory of carbon sequestration assets under
                management.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                className="rounded-none border-slate-300 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 text-slate-900"
              >
                <Download className="w-4 h-4 mr-2" /> Export Roster
              </Button>
              <Button
                onClick={() => router.push("/projects/new")}
                className="rounded-none bg-foreground hover:bg-brand text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" /> Register Asset
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative group w-full md:w-72">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                placeholder="Query by asset name or code..."
                value={globalFilter}
                onChange={(e) => {
                  setGlobalFilter(e.target.value);
                  setCursor(null);
                }}
                className="w-full bg-transparent border-none border-b-2 border-slate-200 pl-7 pr-4 py-2 text-sm font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors rounded-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCursor(null);
              }}
              className="appearance-none bg-transparent border-none border-b-2 border-slate-200 py-2 pl-2 pr-8 text-[10px] font-bold uppercase tracking-widest text-slate-500 focus:outline-none focus:border-slate-900 cursor-pointer transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="flex items-center gap-1 border border-slate-200 bg-slate-50 p-1 shrink-0">
            <button
              type="button"
              onClick={() => setViewType("list")}
              className={cn(
                "p-1.5 transition-colors rounded-none",
                viewType === "list"
                  ? "bg-white text-slate-900 border border-slate-900 shadow-sm"
                  : "text-slate-400 hover:text-slate-900 border border-transparent",
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewType("grid")}
              className={cn(
                "p-1.5 transition-colors rounded-none",
                viewType === "grid"
                  ? "bg-white text-slate-900 border border-slate-900 shadow-sm"
                  : "text-slate-400 hover:text-slate-900 border border-transparent",
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center border border-slate-200 bg-white">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-none animate-spin mb-4" />
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
              Querying distributed ledger...
            </p>
          </div>
        ) : projects.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center border border-slate-200 bg-slate-50">
            <ShieldCheck
              className="h-10 w-10 text-slate-300 mb-4"
              strokeWidth={1}
            />
            <p className="text-xl font-sans text-slate-900 mb-1">
              No Assets Located
            </p>
            <p className="text-xs text-slate-500 max-w-sm text-center">
              Adjust filtering parameters or register a new project.
            </p>
          </div>
        ) : viewType === "list" ? (
          <div className="border border-slate-200 bg-white overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader className="bg-slate-50">
                {table.getHeaderGroups().map((hg) => (
                  <TableRow
                    key={hg.id}
                    className="border-b-2 border-slate-900 hover:bg-slate-50"
                  >
                    {hg.headers.map((h) => (
                      <TableHead
                        key={h.id}
                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 h-14"
                      >
                        {h.isPlaceholder
                          ? null
                          : flexRender(
                              h.column.columnDef.header,
                              h.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-slate-50 transition-colors border-b border-slate-100"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-5 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((p: Project) => {
              const status =
                getUnifiedValue(p, "project_status", "projectStatus") ||
                "draft";
              const regStatus = p.registryStatus || "pending_verification";
              const isVerified = regStatus === "dmrv_verified";
              const config =
                statusConfig[status.toLowerCase()] ?? statusConfig.draft;
              return (
                <div
                  key={p.id}
                  className="group border border-slate-200 bg-white hover:border-slate-900 transition-colors flex flex-col h-full"
                >
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                        {p.code || `PRJ-${p.id.slice(0, 8)}`}
                      </span>
                      <div className="flex items-center gap-2">
                        {p.assessmentCompletion !== "complete" && (
                          <span className="text-[9px] font-bold uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1">
                            Incomplete
                          </span>
                        )}
                        <span
                          className={cn(
                            "px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5",
                            config.color,
                            config.bg,
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5", config.dot)} />
                          {status}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-sans text-xl text-foreground leading-tight mb-2">
                      {p.name}
                    </h3>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6">
                      {(
                        getUnifiedValue(p, "project_type", "projectType") ||
                        "UNSPECIFIED"
                      ).replace(/_/g, " ")}
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                          Registry
                        </p>
                        <span
                          className={cn(
                            "font-mono text-[9px] uppercase tracking-widest px-2 py-1 border",
                            isVerified
                              ? "bg-brand-50 text-brand-700 border-brand-200"
                              : "bg-amber-50 text-amber-700 border-amber-200",
                          )}
                        >
                          {isVerified ? "✓ " : "⏳ "}
                          {regStatus.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                          Initiation
                        </p>
                        <p className="font-mono text-slate-900 font-bold text-[10px] mt-2">
                          {formatDate(p.start_date || p.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 grid grid-cols-2 divide-x divide-slate-200 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => handleProjectClick(p)}
                      className="py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      {p.assessmentCompletion === "complete"
                        ? "Dossier"
                        : "Resume"}
                    </button>
                    <button
                      type="button"
                      className="py-4 text-[10px] font-bold uppercase tracking-widest text-brand-700 hover:text-white hover:bg-brand-800 transition-colors"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Ledger Returns:{" "}
            <span className="text-slate-900">{projects.length} Assets</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-none border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-900"
              disabled={!cursor}
              onClick={() => setCursor(null)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-none border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-900"
              disabled={!nextCursor}
              onClick={() => setCursor(nextCursor)}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
