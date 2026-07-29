"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Key,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  Shield,
  UserCheck,
  UserCircle,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { InviteAdminModal } from "@/components/InviteAdminModal";
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
import { UserService } from "@/lib/services/user-service";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string | null;
  countryOfOperation: string | null;
  role: string | null;
  isActive: boolean;
  createdAt: string;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UserManagementPage() {
  const { user } = useUser();
  const isSuperAdmin = user?.role === "super_admin";
  const isOrgAdmin = user?.role === "org_admin";
  const isOrgRelated =
    user?.role === "org_admin" ||
    user?.role === "sustainability_manager" ||
    user?.role === "org_auditor";
  const organizationId = (user as any)?.organizationId;
  const router = useRouter();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [globalFilter, setGlobalFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["users", roleFilter, organizationId],
    queryFn: () =>
      UserService.listUsers(
        isOrgAdmin
          ? { organizationId }
          : roleFilter === "all"
            ? undefined
            : { role: roleFilter },
      ),
  });

  const users = data?.data || [];

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Identity Profile",
        cell: ({ row }) => {
          const u = row.original;
          const initial = u.firstName.charAt(0).toUpperCase();
          return (
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-slate-900 text-white font-sans text-lg">
                {initial}
              </div>
              <div>
                <div className="font-sans font-bold text-slate-900 text-base leading-none mb-1.5">
                  {u.firstName} {u.lastName}
                </div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Mail className="h-3 w-3" />
                  {u.email}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Clearance Level",
        cell: ({ row }) => {
          const role = (row.getValue("role") as string) || "unassigned";
          return (
            <span className="px-2.5 py-1 border border-slate-200 bg-slate-50 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-700">
              {role.replace(/_/g, " ")}
            </span>
          );
        },
      },
      {
        accessorKey: "contactNumber",
        header: "Contact Vector",
        cell: ({ row }) => (
          <div className="text-[11px] font-mono text-slate-600 flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-slate-400" />
            {row.getValue("contactNumber") || "UNSET"}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Date Anchored",
        cell: ({ row }) => (
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
            {format(new Date(row.getValue("createdAt")), "dd MMM yyyy")}
          </div>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
          const active = row.getValue("isActive") as boolean;
          return (
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-none",
                  active ? "bg-brand-500" : "bg-red-500",
                )}
              />
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                {active ? "Active" : "Suspended"}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 rounded-none text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 rounded-none border border-slate-200 shadow-xl"
            >
              <DropdownMenuLabel className="text-[9px] text-slate-400 uppercase tracking-[0.2em] px-3 py-2 font-bold">
                Identity Controls
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/user-management/${row.original.id}`)
                }
                className="text-xs font-bold uppercase tracking-widest cursor-pointer py-2.5 rounded-none"
              >
                <UserCircle className="h-3.5 w-3.5 mr-2 text-slate-400" /> View
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/user-management/${row.original.id}`)
                }
                className="text-xs font-bold uppercase tracking-widest cursor-pointer py-2.5 rounded-none"
              >
                <Shield className="h-3.5 w-3.5 mr-2 text-slate-400" /> Manage
                Clearance
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuItem className="text-xs font-bold uppercase tracking-widest text-red-700 focus:bg-red-50 focus:text-red-800 cursor-pointer py-2.5 rounded-none">
                <UserX className="h-3.5 w-3.5 mr-2" /> Suspend Entity
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [router],
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="animate-in fade-in duration-700 pb-24">
      <InviteAdminModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      {/* ── Editorial Header ── */}
      <div className="border-b border-slate-200 bg-white pt-12 pb-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="text-left">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-6 h-[1px] bg-slate-900"></div>
                <span className="text-slate-900 text-[10px] font-bold uppercase tracking-[0.2em]">
                  Administrative Control
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-sans text-slate-900 tracking-tight leading-none mb-4">
                Access &{" "}
                <span className="italic text-slate-500">Identity.</span>
              </h1>
              <p className="text-slate-500 text-sm max-w-xl leading-relaxed font-light">
                Manage platform participants, provision administrative
                credentials, and configure granular access controls across the
                registry ecosystem.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {isSuperAdmin && (
                <Link
                  href="/user-management/roles"
                  className="border border-slate-300 text-slate-900 hover:border-slate-900 px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                >
                  <Key className="w-3.5 h-3.5" /> IAM Config
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12">
        {/* ── Control Bar ── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative group w-full md:w-64">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors pointer-events-none" />
              <input
                placeholder="Query identity ledger..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full bg-transparent border-none border-b-2 border-slate-200 pl-7 pr-4 py-2 text-sm font-sans text-slate-900 placeholder:text-slate-400 placeholder:font-sans focus:outline-none focus:border-slate-900 transition-colors rounded-none"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none bg-transparent border-none border-b-2 border-slate-200 py-2 pl-2 pr-8 text-[10px] font-bold uppercase tracking-widest text-slate-500 focus:outline-none focus:border-slate-900 focus:text-slate-900 cursor-pointer transition-colors"
            >
              <option value="all">All Clearances</option>
              <option value="super_admin">Super Admin</option>
              <option value="financial_admin">Financial Admin</option>
              <option value="mrv_admin">MRV Admin</option>
              <option value="project_manager">Project Manager</option>
              <option value="project_owner">Project Owner</option>
            </select>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => setIsInviteModalOpen(true)}
              variant="outline"
              className="rounded-none border-slate-300 text-slate-900 hover:border-slate-900 text-[10px] font-bold uppercase tracking-widest"
            >
              <Mail className="h-3.5 w-3.5 mr-2" />{" "}
              {isOrgAdmin ? "Invite Team Member" : "Invite Admin"}
            </Button>
            {!isOrgRelated && (
              <Button
                onClick={() => router.push("/project-developers/register")}
                className="rounded-none bg-slate-900 hover:bg-brand-900 text-white text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                <UserCheck className="h-3.5 w-3.5 mr-2" /> Onboard Project Owner
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Identity Ledger ── */}
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
                <TableCell
                  colSpan={columns.length}
                  className="h-64 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
                      Syncing Identity Registry...
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
                <TableCell
                  colSpan={columns.length}
                  className="h-64 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <UserX
                      className="h-10 w-10 text-slate-300 mb-2"
                      strokeWidth={1}
                    />
                    <p className="font-sans text-xl text-slate-900">
                      No Participants Found.
                    </p>
                    <p className="text-xs text-slate-500 font-light">
                      Adjust filtering parameters to query the ledger.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-200">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Displaying{" "}
            <span className="text-slate-900">
              {table.getRowModel().rows.length}
            </span>{" "}
            identities
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-none border-slate-200 text-slate-500 hover:text-slate-900"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-none border-slate-200 text-slate-500 hover:text-slate-900"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
