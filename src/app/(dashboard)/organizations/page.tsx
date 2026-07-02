"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ExternalLink,
  Globe,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { OrganizationService } from "@/lib/services/organization-service";
import { cn } from "@/lib/utils";

export default function OrganizationsListPage() {
  const router = useRouter();
  const [globalFilter, setGlobalFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["all-organizations"],
    queryFn: OrganizationService.listOrganizations,
  });

  const organizations = data?.data || [];

  return (
    <div className="animate-in fade-in duration-700 pb-24">
      {/* ── Editorial Header ── */}
      <div className="border-b border-slate-200 bg-white pt-12 pb-8">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 text-left">
            <div className="text-left">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-6 h-[1px] bg-slate-900"></div>
                <span className="text-slate-900 text-[10px] font-bold uppercase tracking-[0.2em]">
                  Global Corporate Registry
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-sans text-slate-900 tracking-tight leading-none mb-4">
                Institutional{" "}
                <span className="italic text-slate-500">Entities.</span>
              </h1>
              <p className="text-slate-500 text-sm max-w-xl leading-relaxed">
                Manage organizational profiles, monitor cross-border tax
                residencies, and oversee institutional credit acquisition
                lifecycles.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button className="rounded-none bg-slate-900 hover:bg-brand-900 text-[10px] font-bold uppercase tracking-widest transition-colors h-12 px-8">
                <Plus className="h-4 w-4 mr-2" /> Onboard Organization
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
        {/* Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative group w-full md:w-96">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors pointer-events-none" />
            <input
              placeholder="Query by organization name or registry ID..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full bg-transparent border-none border-b-2 border-slate-200 pl-7 pr-4 py-2 text-sm font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors rounded-none"
            />
          </div>
        </div>

        {/* Table Area */}
        <div className="border border-slate-200 bg-white overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-b-2 border-slate-900 hover:bg-slate-50">
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 h-14 px-8 text-left">
                  Organization
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 h-14 px-8 text-left">
                  Residency
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 h-14 px-8 text-right">
                  Team Size
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 h-14 px-8 text-right">
                  Acquired (t)
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 h-14 px-8 text-left">
                  Status
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 h-14 px-8 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-64 text-center text-slate-400"
                  >
                    Querying registry...
                  </TableCell>
                </TableRow>
              ) : organizations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-64 text-center text-slate-400"
                  >
                    No organizations found.
                  </TableCell>
                </TableRow>
              ) : (
                organizations.map((org: any) => (
                  <TableRow
                    key={org.id}
                    className="hover:bg-slate-50 transition-colors border-b border-slate-100"
                  >
                    <TableCell className="px-8 py-5 align-middle font-sans text-lg text-slate-900 text-left">
                      {org.name}
                    </TableCell>
                    <TableCell className="px-8 py-5 align-middle text-[10px] font-mono text-slate-500 uppercase tracking-widest text-left">
                      <div className="flex items-center gap-2">
                        <Globe size={14} className="text-slate-400" />
                        {org.residency}
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-5 align-middle text-right text-sm font-mono font-bold text-slate-900">
                      {org.memberCount}
                    </TableCell>
                    <TableCell className="px-8 py-5 align-middle text-right text-sm font-mono font-bold text-brand-700">
                      {org.totalAcquired}
                    </TableCell>
                    <TableCell className="px-8 py-5 align-middle text-left">
                      <Badge
                        className={cn(
                          "rounded-none px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border-none",
                          org.status === "active"
                            ? "bg-brand-50 text-brand-700"
                            : "bg-slate-100 text-slate-500",
                        )}
                      >
                        {org.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-8 py-5 align-middle text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-none hover:bg-slate-100 text-slate-400"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="rounded-none border border-slate-200 shadow-xl"
                        >
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/organizations/${org.id}`)
                            }
                            className="text-xs font-bold uppercase tracking-widest cursor-pointer py-2.5"
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-2 text-slate-400" />{" "}
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-100" />
                          <DropdownMenuItem className="text-xs font-bold uppercase tracking-widest text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer py-2.5">
                            Suspend Access
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
