"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Ban,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  RotateCcw,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { InviteFieldAgentModal } from "@/components/InviteFieldAgentModal";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FieldAgentService,
  type TFieldAgentRow,
} from "@/lib/services/field-agent-service";
import { cn } from "@/lib/utils";

// F6 — Admin field agent management table.
// A project_admin only ever sees agents they themselves invited; a
// super_admin sees everyone. That scoping is enforced server-side
// (field_agent.service.ts) — this page just renders whatever the API
// returns, no client-side filtering needed to keep it correct.

export default function FieldAgentsPage() {
  const queryClient = useQueryClient();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "disabled" | "pending"
  >("all");
  const [search, setSearch] = useState("");
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["field-agents", statusFilter, search],
    queryFn: () =>
      FieldAgentService.listFieldAgents({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search || undefined,
      }),
  });

  const agents = data?.agents || [];

  const handleToggleStatus = async (agent: TFieldAgentRow) => {
    if (agent.status === "pending") return; // nothing to toggle yet
    setPendingToggleId(agent.id);
    try {
      await FieldAgentService.toggleFieldAgentStatus(agent.id, !agent.isActive);
      toast.success(
        agent.isActive
          ? `${agent.fullName} disabled — their session was ended immediately`
          : `${agent.fullName} re-enabled`,
      );
      queryClient.invalidateQueries({ queryKey: ["field-agents"] });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to update agent status",
      );
    } finally {
      setPendingToggleId(null);
    }
  };

  const handleResendInvite = async (agent: TFieldAgentRow) => {
    try {
      await FieldAgentService.inviteFieldAgent({
        fullName: agent.fullName,
        email: agent.email,
        phone: agent.contactNumber || undefined,
      });
      toast.success(`Invite resent to ${agent.email}`);
      queryClient.invalidateQueries({ queryKey: ["field-agents"] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to resend invite");
    }
  };

  const columns = useMemo<ColumnDef<TFieldAgentRow>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: "Agent",
        cell: ({ row }) => {
          const a = row.original;
          const initial = a.fullName?.charAt(0)?.toUpperCase() || "?";
          return (
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-slate-900 text-white font-sans text-lg">
                {initial}
              </div>
              <div>
                <div className="font-sans font-bold text-slate-900 text-base leading-none mb-1.5">
                  {a.fullName}
                </div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Mail className="h-3 w-3" />
                  {a.email}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "contactNumber",
        header: "Phone",
        cell: ({ row }) => (
          <div className="text-[11px] font-mono text-slate-600 flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-slate-400" />
            {row.original.contactNumber || "—"}
          </div>
        ),
      },
      {
        accessorKey: "registrationsCount",
        header: "Registered",
        cell: ({ row }) => (
          <div className="text-sm font-sans text-slate-900">
            {row.original.status === "pending"
              ? "—"
              : row.original.registrationsCount}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Invited",
        cell: ({ row }) => (
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
            {format(new Date(row.original.createdAt), "dd MMM yyyy")}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const a = row.original;
          if (a.status === "pending") {
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-amber-200 bg-amber-50 text-[9px] font-bold uppercase tracking-[0.2em] text-amber-700">
                <Clock className="h-3 w-3" /> Pending
              </span>
            );
          }
          return (
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-none",
                  a.isActive ? "bg-emerald-500" : "bg-red-500",
                )}
              />
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                {a.isActive ? "Active" : "Disabled"}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const a = row.original;
          if (a.status === "pending") {
            return (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResendInvite(a)}
                className="rounded-none border-slate-300 text-[9px] font-bold uppercase tracking-widest"
              >
                <RotateCcw className="h-3 w-3 mr-1.5" /> Resend
              </Button>
            );
          }
          return (
            <Button
              variant="outline"
              size="sm"
              disabled={pendingToggleId === a.id}
              onClick={() => handleToggleStatus(a)}
              className={cn(
                "rounded-none text-[9px] font-bold uppercase tracking-widest",
                a.isActive
                  ? "border-red-200 text-red-700 hover:bg-red-50"
                  : "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
              )}
            >
              {a.isActive ? (
                <>
                  <Ban className="h-3 w-3 mr-1.5" /> Disable
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1.5" /> Enable
                </>
              )}
            </Button>
          );
        },
      },
    ],
    // biome-ignore lint/correctness/useExhaustiveDependencies: handlers close over stable service calls
    [pendingToggleId, handleToggleStatus, handleResendInvite],
  );

  const table = useReactTable({
    data: agents,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="animate-in fade-in duration-700 pb-24">
      <InviteFieldAgentModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvited={() =>
          queryClient.invalidateQueries({ queryKey: ["field-agents"] })
        }
      />

      <div className="border-b border-slate-200 bg-white pt-12 pb-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="text-left">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-6 h-[1px] bg-slate-900" />
                <span className="text-slate-900 text-[10px] font-bold uppercase tracking-[0.2em]">
                  Field Operations
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-sans text-slate-900 tracking-tight leading-none mb-4">
                Field <span className="italic text-slate-500">Agents.</span>
              </h1>
              <p className="text-slate-500 text-sm max-w-xl leading-relaxed font-light">
                Invite and manage the field agents registering project
                developers on your behalf.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button
                onClick={() => setIsInviteModalOpen(true)}
                className="rounded-none bg-slate-900 hover:bg-emerald-900 text-white text-[10px] font-bold uppercase tracking-widest"
              >
                <UserPlus className="h-3.5 w-3.5 mr-2" /> Invite Field Agent
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative group w-full md:w-64">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors pointer-events-none" />
              <input
                placeholder="Search agents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none border-b-2 border-slate-200 pl-7 pr-4 py-2 text-sm font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors rounded-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="appearance-none bg-transparent border-none border-b-2 border-slate-200 py-2 pl-2 pr-8 text-[10px] font-bold uppercase tracking-widest text-slate-500 focus:outline-none focus:border-slate-900 focus:text-slate-900 cursor-pointer transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
              <option value="pending">Pending Invite</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="border border-slate-200 bg-white overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-b-2 border-slate-900 hover:bg-slate-50"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 h-14"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
                        Loading field agents...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-slate-50 transition-colors border-b border-slate-100"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users
                        className="h-10 w-10 text-slate-300 mb-2"
                        strokeWidth={1}
                      />
                      <p className="font-sans text-xl text-slate-900">
                        No field agents yet.
                      </p>
                      <p className="text-xs text-slate-500 font-light">
                        Invite your first field agent to start registering
                        developers on-site.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-200">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Displaying <span className="text-slate-900">{agents.length}</span>{" "}
              {agents.length === 1 ? "agent" : "agents"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
