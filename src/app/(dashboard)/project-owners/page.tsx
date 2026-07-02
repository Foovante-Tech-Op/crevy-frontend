"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ExternalLink,
  LayoutGrid,
  List as ListIcon,
  MapPin,
  Plus,
  Search,
  Users,
  UsersIcon,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { type Column, DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import {
  type ProjectOwnerFilters,
  type ProjectOwnerRecord,
  ProjectOwnerService,
} from "@/lib/services/project-owner-service";
import { cn } from "@/lib/utils";

// ─── Editorial Configs ────────────────────────────────────────────────────────

const verificationConfig: Record<
  string,
  { label: string; className: string; bg: string; dot: string }
> = {
  pending: {
    label: "Pending KYC",
    className: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    dot: "bg-amber-500",
  },
  verified: {
    label: "Verified",
    className: "text-brand",
    bg: "bg-brand/10 border-brand/30",
    dot: "bg-brand",
  },
  rejected: {
    label: "Rejected",
    className: "text-red-700",
    bg: "bg-red-50 border-red-200",
    dot: "bg-red-500",
  },
};

const getInitials = (firstName: string, lastName: string) =>
  `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();

const getAvatarStyle = (code: string) => {
  const styles = [
    "bg-foreground text-background",
    "bg-brand text-white",
    "bg-muted text-foreground border border-border",
  ];
  return styles[code.charCodeAt(code.length - 1) % styles.length];
};

// ─── Cursor Pagination Stack ──────────────────────────────────────────────────

function useCursorPagination() {
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([
    undefined,
  ]);
  const currentPage = cursorStack.length - 1;
  const currentCursor = cursorStack[currentPage];

  const goNext = useCallback(
    (nextCursor: string) => setCursorStack((s) => [...s, nextCursor]),
    [],
  );
  const goPrev = useCallback(
    () => setCursorStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    [],
  );
  const resetToFirst = useCallback(() => setCursorStack([undefined]), []);

  return {
    currentPage,
    currentCursor,
    goNext,
    goPrev,
    resetToFirst,
    canGoPrev: currentPage > 0,
  };
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function ProjectOwnersPage() {
  const { user } = useUser();
  const isSuperAdmin = user?.role === "super_admin";

  const _PAGE_SIZE = 12;

  // ── State ──
  const [viewType, setViewType] = useState<"list" | "grid">("list");
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState("");

  const {
    currentPage,
    currentCursor,
    goNext,
    goPrev,
    resetToFirst,
    canGoPrev,
  } = useCursorPagination();

  const applySearch = () => {
    resetToFirst();
    setSearch(searchDraft);
  };
  const clearFilters = () => {
    setSearchDraft("");
    setSearch("");
    setStatusFilter("all");
    setCountryFilter("");
    resetToFirst();
  };
  const hasActiveFilters = search || statusFilter !== "all" || countryFilter;

  // ── Query ──
  const filters: ProjectOwnerFilters = useMemo(
    () => ({
      cursor: currentCursor,
      limit: viewType === "grid" ? 12 : 10,
      verificationStatus:
        statusFilter === "all" ? undefined : (statusFilter as any),
      country: countryFilter || undefined,
      search: search || undefined,
    }),
    [currentCursor, viewType, statusFilter, countryFilter, search],
  );

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["project-owners", filters],
    queryFn: () => ProjectOwnerService.listProjectOwners(filters),
    staleTime: 30_000,
  });

  const owners: ProjectOwnerRecord[] = data?.data ?? [];
  const nextCursor: string | null = data?.nextCursor ?? null;
  const total: number = data?.total ?? 0;

  // ── DataTable Columns ──
  const columns = useMemo<Column<ProjectOwnerRecord>[]>(
    () => [
      {
        header: "Entity Name",
        render: (owner) => (
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-8 h-8 flex items-center justify-center text-xs font-bold shrink-0",
                getAvatarStyle(owner.code),
              )}
            >
              {getInitials(owner.name, owner.name)}
            </div>
            <div className="font-sans text-base text-foreground font-bold">
              {owner.name}
            </div>
          </div>
        ),
      },
      {
        header: "Registry Code",
        render: (owner) => (
          <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
            {owner.code}
          </span>
        ),
      },
      {
        header: "Entity Type",
        render: (owner) => (
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            <UsersIcon className="h-3 w-3 text-muted-foreground" />{" "}
            {owner.entityType || "N/A"}
          </div>
        ),
      },
      {
        header: "KYC Status",
        render: (owner) => {
          const vc =
            verificationConfig[owner.verificationStatus] ??
            verificationConfig.pending;
          return (
            <span
              className={cn(
                "px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-max border",
                vc.bg,
                vc.className,
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", vc.dot)} />
              {vc.label}
            </span>
          );
        },
      },
      {
        header: "Dossier",
        align: "right",
        render: (owner) => (
          <Link href={`/project-owners/${owner.userId}`}>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-none text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <div className="animate-in fade-in duration-700 pb-24">
      {/* ── Editorial Header ── */}
      <div className="bg-background border-b border-border pt-12 pb-8">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-6 h-[1px] bg-foreground" />
                <span className="text-foreground text-[10px] font-bold uppercase tracking-[0.2em]">
                  {isSuperAdmin ? "Global Network" : "Managed Roster"}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-sans text-foreground tracking-tight leading-none mb-4">
                Project{" "}
                <span className="italic text-muted-foreground">Owners.</span>
              </h1>
              <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
                Institutional directory of verified developers and land
                stewards. Manage KYC documentation, review payment pipelines,
                and oversee active operations.
              </p>
            </div>

            {(isSuperAdmin || user?.role === "project_manager") && (
              <Link href="/project-owners/register">
                <Button className="rounded-none bg-foreground hover:bg-brand text-[10px] font-bold uppercase tracking-widest transition-colors h-12 px-6">
                  <Plus className="h-4 w-4 mr-2" /> Onboard Entity
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
        {/* ── Control Bar ── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative group w-full md:w-64">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors pointer-events-none" />
              <input
                placeholder="Query by name or ID..."
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applySearch()}
                className="w-full bg-transparent border-none border-b-2 border-border pl-7 pr-4 py-2 text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors rounded-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                resetToFirst();
              }}
              className="appearance-none bg-transparent border-none border-b-2 border-border py-2 pl-2 pr-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground focus:outline-none focus:border-foreground focus:text-foreground cursor-pointer transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending KYC</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>

            <input
              placeholder="Country Code..."
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                resetToFirst();
              }}
              className="w-32 bg-transparent border-none border-b-2 border-border py-2 text-[10px] font-bold uppercase tracking-widest text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors rounded-none"
            />

            <div className="flex items-center gap-2">
              <Button
                onClick={applySearch}
                variant="outline"
                className="rounded-none border-border text-[10px] font-bold uppercase tracking-widest"
              >
                Apply
              </Button>
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  className="rounded-none text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 border border-border bg-muted p-1 shrink-0">
            <button
              type="button"
              onClick={() => setViewType("list")}
              className={cn(
                "p-1.5 transition-colors",
                viewType === "list"
                  ? "bg-background text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewType("grid")}
              className={cn(
                "p-1.5 transition-colors",
                viewType === "grid"
                  ? "bg-background text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Institutional Stats ── */}
        {!isLoading && data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border mb-8">
            {[
              { label: "Total Network", value: total },
              {
                label: "Verified Entities",
                value: owners.filter((o) => o.verificationStatus === "verified")
                  .length,
              },
              {
                label: "Pending Reviews",
                value: owners.filter((o) => o.verificationStatus === "pending")
                  .length,
              },
              {
                label: "Rejected Profiles",
                value: owners.filter((o) => o.verificationStatus === "rejected")
                  .length,
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-background p-6">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  {stat.label}
                </p>
                <p className="text-3xl font-mono font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Content Area ── */}
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center border border-border bg-background">
            <div className="w-6 h-6 border-2 border-border border-t-foreground rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Syncing personnel directory...
            </p>
          </div>
        ) : isError ? (
          <div className="py-24 border border-border bg-red-50 flex flex-col items-center justify-center text-center">
            <XCircle className="h-8 w-8 text-red-500 mb-4" />
            <p className="font-sans text-xl text-red-900 mb-4">
              Directory Synchronization Failed
            </p>
            <Button
              onClick={() => refetch()}
              className="rounded-none bg-foreground text-background font-bold text-[10px] uppercase tracking-widest px-6"
            >
              Retry Connection
            </Button>
          </div>
        ) : owners.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center border border-border bg-muted">
            <Users
              className="h-10 w-10 text-muted-foreground mb-4"
              strokeWidth={1}
            />
            <p className="text-xl font-sans text-foreground mb-1">
              No Entities Located
            </p>
            <p className="text-xs text-muted-foreground">
              Adjust screening parameters or onboard a new entity.
            </p>
          </div>
        ) : viewType === "list" ? (
          <DataTable
            columns={columns}
            data={owners}
            isLoading={isLoading}
            loadingMessage="Syncing personnel directory..."
            emptyMessage="No entities matched your search parameters."
            currentPage={currentPage + 1}
            totalPages={nextCursor ? currentPage + 2 : currentPage + 1}
            onPageChange={(page) => {
              if (page > currentPage + 1 && nextCursor) {
                goNext(nextCursor);
              } else if (page < currentPage + 1) {
                goPrev();
              }
            }}
          />
        ) : (
          /* ── GRID VIEW ── */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {owners.map((owner) => {
              const vc =
                verificationConfig[owner.verificationStatus] ??
                verificationConfig.pending;
              return (
                <Link
                  key={owner.id}
                  href={`/project-owners/${owner.userId}`}
                  className="block group"
                >
                  <div className="border border-border bg-background hover:border-foreground transition-colors h-full flex flex-col">
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-6">
                        <div
                          className={cn(
                            "w-10 h-10 flex items-center justify-center text-sm font-bold",
                            getAvatarStyle(owner.code),
                          )}
                        >
                          {getInitials(owner.name, owner.name)}
                        </div>
                        <span
                          className={cn(
                            "px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 border",
                            vc.bg,
                            vc.className,
                          )}
                        >
                          <span
                            className={cn("w-1.5 h-1.5 rounded-full", vc.dot)}
                          />
                          {vc.label}
                        </span>
                      </div>

                      <h3 className="font-sans text-xl text-foreground leading-tight mb-1 group-hover:text-brand transition-colors">
                        {owner.name}
                      </h3>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-6">
                        {owner.code}
                      </p>

                      <div className="space-y-3 pt-4 border-t border-border">
                        {owner.email && (
                          <p className="text-[11px] font-mono text-muted-foreground truncate">
                            {owner.email}
                          </p>
                        )}
                        {owner.contactNumber && (
                          <p className="text-[11px] font-mono text-muted-foreground">
                            {owner.contactNumber}
                          </p>
                        )}
                        {owner.entityType && (
                          <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                            <UsersIcon className="h-3 w-3" /> {owner.entityType}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-muted border-t border-border px-6 py-4 flex items-center gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                        Payment Routing:
                      </span>
                      {owner.momoDetails && (
                        <span className="font-mono text-[10px] text-foreground font-bold">
                          MOMO
                        </span>
                      )}
                      {owner.bankDetails && (
                        <span className="font-mono text-[10px] text-foreground font-bold">
                          BANK
                        </span>
                      )}
                      {!owner.momoDetails && !owner.bankDetails && (
                        <span className="font-mono text-[10px] text-muted-foreground">
                          UNSET
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Pagination Footer ── */}
        {owners.length > 0 && (
          <div className="flex items-center justify-between pt-6 mt-8 border-t border-border">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Page {currentPage + 1}:{" "}
              <span className="text-foreground">{owners.length}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetToFirst}
                disabled={!canGoPrev || isFetching}
                className="rounded-none border-border text-muted-foreground hover:text-foreground"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goPrev}
                disabled={!canGoPrev || isFetching}
                className="rounded-none border-border text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => nextCursor && goNext(nextCursor)}
                disabled={!nextCursor || isFetching}
                className="rounded-none border-border text-muted-foreground hover:text-foreground"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
