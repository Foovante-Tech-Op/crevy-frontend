"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Check, Info, Key, Loader2, Plus, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  RBACService,
  type TPermission,
  type TRole,
} from "@/lib/services/rbac-service";
import { cn } from "@/lib/utils";

// Generic table body/header renderer. Kept generic-per-call (rather than
// selecting between rolesTable/permsTable via a ternary at the call site)
// so each render stays bound to a single concrete row type — collapsing
// Table<TRole> and Table<TPermission> into one union breaks flexRender's
// ability to reconcile the two incompatible columnDef.header signatures.
function ManagedDataTable<T>({
  table,
  emptyColSpan,
}: {
  table: ReturnType<typeof useReactTable<T>>;
  emptyColSpan: number;
}) {
  return (
    <>
      <TableHeader className="bg-slate-50 border-b border-slate-200">
        {table.getHeaderGroups().map((hg) => (
          <TableRow key={hg.id} className="hover:bg-transparent border-none">
            {hg.headers.map((h) => (
              <TableHead key={h.id} className="h-12 px-6">
                {h.isPlaceholder
                  ? null
                  : flexRender(h.column.columnDef.header, h.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className="px-6 py-4 font-mono text-xs text-slate-800"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={emptyColSpan}
              className="text-center py-12 text-xs font-mono uppercase text-slate-400 tracking-wider"
            >
              No configurations active.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </>
  );
}

export default function RolesManagementPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"permissions" | "roles">(
    "permissions",
  );
  const [selectedRole, setSelectedRole] = useState<TRole | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);

  // ─── Data Queries ──────────────────────────────────────────────────────────
  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ["rbac-roles"],
    queryFn: RBACService.getRoles,
  });

  const { data: permissions = [], isLoading: loadingPerms } = useQuery({
    queryKey: ["rbac-permissions"],
    queryFn: RBACService.getPermissions,
  });

  const { data: rolePermissions = [], isLoading: loadingRolePerms } = useQuery({
    queryKey: ["rbac-role-permissions", selectedRole?.id],
    queryFn: () => RBACService.getRolePermissions(selectedRole?.id as number),
    enabled: !!selectedRole,
  });

  // ─── Data Mutations ────────────────────────────────────────────────────────
  const createRoleMutation = useMutation({
    mutationFn: RBACService.createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac-roles"] });
      toast.success("Security authorization role deployed.");
      setIsRoleModalOpen(false);
    },
    onError: () => toast.error("Failed to construct system role."),
  });

  const createPermissionMutation = useMutation({
    mutationFn: RBACService.createPermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac-permissions"] });
      toast.success("Fine-grained system access permission registered.");
      setIsPermModalOpen(false);
    },
    onError: () =>
      toast.error("Failed to register system capability configuration."),
  });

  const assignPermission = useMutation({
    mutationFn: ({
      roleId,
      permissionId,
    }: {
      roleId: number;
      permissionId: number;
    }) => RBACService.assignPermissionToRole(roleId, permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["rbac-role-permissions", selectedRole?.id],
      });
      toast.success("Security scope updated: Permission attached.");
    },
  });

  const unassignPermission = useMutation({
    mutationFn: ({
      roleId,
      permissionId,
    }: {
      roleId: number;
      permissionId: number;
    }) => RBACService.unassignPermissionFromRole(roleId, permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["rbac-role-permissions", selectedRole?.id],
      });
      toast.success("Security scope updated: Permission revoked.");
    },
  });

  // ─── Strategic Matrix Synchronization Handler ─────────────────────────────
  const handleTogglePermission = (perm: TPermission) => {
    if (!selectedRole) return;
    const isCurrentlyAssigned = rolePermissions?.some((p) => p.id === perm.id);

    if (isCurrentlyAssigned) {
      unassignPermission.mutate({
        roleId: selectedRole.id,
        permissionId: perm.id,
      });
    } else {
      assignPermission.mutate({
        roleId: selectedRole.id,
        permissionId: perm.id,
      });
    }
  };

  // ─── Table Columns Structuring ─────────────────────────────────────────────
  const roleColumns = useMemo<ColumnDef<TRole>[]>(
    () => [
      {
        accessorKey: "name",
        header: () => (
          <span className="font-mono text-[10px] tracking-widest uppercase text-slate-400">
            Identity Identifier
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: () => (
          <span className="font-mono text-[10px] tracking-widest uppercase text-slate-400">
            Operational Scope
          </span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedRole(row.original)}
            className={cn(
              "rounded-none text-[10px] uppercase font-mono tracking-widest transition-all",
              selectedRole?.id === row.original.id
                ? "bg-slate-900 text-white hover:bg-slate-950"
                : "hover:bg-slate-50",
            )}
          >
            Configure Strategy Matrix
          </Button>
        ),
      },
    ],
    [selectedRole],
  );

  const permColumns = useMemo<ColumnDef<TPermission>[]>(
    () => [
      {
        accessorKey: "resource",
        header: () => (
          <span className="font-mono text-[10px] tracking-widest uppercase text-slate-400">
            Target Asset
          </span>
        ),
      },
      {
        accessorKey: "action",
        header: () => (
          <span className="font-mono text-[10px] tracking-widest uppercase text-slate-400">
            Operation Action
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: () => (
          <span className="font-mono text-[10px] tracking-widest uppercase text-slate-400">
            Capability Scope
          </span>
        ),
      },
    ],
    [],
  );

  const rolesTable = useReactTable({
    data: roles,
    columns: roleColumns,
    getCoreRowModel: getCoreRowModel(),
  });
  const permsTable = useReactTable({
    data: permissions,
    columns: permColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full min-h-screen bg-white p-8 font-sans selection:bg-slate-950 selection:text-white lg:overflow-x-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
        {/* ─── Left Configuration Layout Module ─── */}
        <div className="flex-1 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-3xl font-serif text-slate-950 tracking-tight leading-none mb-2">
                System Strategy Matrix.
              </h1>
              <p className="text-xs text-slate-400 font-light font-mono uppercase tracking-wider">
                Access Layer Alignment & Cryptographic Credential Scope
                Configuration
              </p>
            </div>

            {/* Context Dialog Action Control Panels */}
            <div className="flex items-center gap-3">
              <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-none bg-slate-950 text-white font-mono text-[10px] uppercase tracking-widest px-5 py-4 hover:bg-slate-800">
                    <Plus size={12} className="mr-1.5" /> Initialize Role Tier
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-none max-w-md p-0 border border-slate-200 bg-white">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      createRoleMutation.mutate({
                        name: fd.get("name") as string,
                        description: fd.get("description") as string,
                      });
                    }}
                  >
                    <div className="p-6 space-y-6">
                      <DialogHeader>
                        <DialogTitle className="font-serif text-xl tracking-tight text-slate-950">
                          Initialize Security Role Record
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-400 font-light font-mono uppercase tracking-wider">
                          Deploy a global authority identifier group to match
                          policy tiers.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Role Key Identity
                          </Label>
                          <Input
                            name="name"
                            placeholder="e.g. sustainability_manager"
                            required
                            className="rounded-none border-2 border-slate-200 bg-slate-50 px-4 py-4 font-mono text-sm text-slate-950 focus-visible:ring-0 focus-visible:border-slate-950"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Description Scope
                          </Label>
                          <Textarea
                            name="description"
                            placeholder="Specify authority restrictions or bounds..."
                            required
                            className="rounded-none border-2 border-slate-200 bg-slate-50 px-4 py-4 font-mono text-sm text-slate-950 resize-none h-24 focus-visible:ring-0 focus-visible:border-slate-950"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={() => setIsRoleModalOpen(false)}
                        className="rounded-none text-[10px] uppercase font-mono tracking-widest text-slate-400 hover:text-slate-900"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createRoleMutation.isPending}
                        className="rounded-none bg-slate-950 text-white px-6 font-mono text-[10px] uppercase tracking-widest"
                      >
                        {createRoleMutation.isPending
                          ? "Deploying..."
                          : "Save Role"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isPermModalOpen} onOpenChange={setIsPermModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-none border-slate-900 text-slate-950 font-mono text-[10px] uppercase tracking-widest px-5 py-4 hover:bg-slate-50"
                  >
                    <ShieldCheck size={12} className="mr-1.5" /> Initialize
                    Action Permission
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-none max-w-md p-0 border border-slate-200 bg-white">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      createPermissionMutation.mutate({
                        resource: fd.get("resource") as string,
                        action: fd.get("action") as string,
                        description: fd.get("description") as string,
                      });
                    }}
                  >
                    <div className="p-6 space-y-6">
                      <DialogHeader>
                        <DialogTitle className="font-serif text-xl tracking-tight text-slate-950">
                          Initialize Capability Rule
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-400 font-light font-mono uppercase tracking-wider">
                          Configure precise resource action criteria mappings.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              Target Asset Name
                            </Label>
                            <Input
                              name="resource"
                              placeholder="e.g. certified_ledger"
                              required
                              className="rounded-none border-2 border-slate-200 bg-slate-50 font-mono text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              Operation Action Name
                            </Label>
                            <Input
                              name="action"
                              placeholder="e.g. write_block"
                              required
                              className="rounded-none border-2 border-slate-200 bg-slate-50 font-mono text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Capability Restriction Context
                          </Label>
                          <Textarea
                            name="description"
                            placeholder="Context criteria info definition..."
                            required
                            className="rounded-none border-2 border-slate-200 bg-slate-50 resize-none h-24"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={() => setIsPermModalOpen(false)}
                        className="rounded-none text-[10px] uppercase font-mono tracking-widest text-slate-400 hover:text-slate-900"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createPermissionMutation.isPending}
                        className="rounded-none bg-slate-950 text-white px-6 font-mono text-[10px] uppercase tracking-widest"
                      >
                        {createPermissionMutation.isPending
                          ? "Deploying..."
                          : "Save Rule"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Interactive Core Administration Dashboard Tabs Layout */}
          <div className="flex gap-6 border-b border-slate-200 pb-px">
            <button
              type="button"
              onClick={() => setActiveTab("permissions")}
              className={cn(
                "pb-4 text-[10px] font-mono uppercase tracking-widest transition-all border-b-2 font-bold",
                activeTab === "permissions"
                  ? "border-slate-950 text-slate-950"
                  : "border-transparent text-slate-400 hover:text-slate-600",
              )}
            >
              Registered Platform Capability Rules ({permissions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("roles")}
              className={cn(
                "pb-4 text-[10px] font-mono uppercase tracking-widest transition-all border-b-2 font-bold",
                activeTab === "roles"
                  ? "border-slate-950 text-slate-950"
                  : "border-transparent text-slate-400 hover:text-slate-600",
              )}
            >
              Configured Structural Tiers ({roles.length})
            </button>
          </div>

          {loadingRoles || loadingPerms ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <Loader2 className="animate-spin mr-2" size={16} /> Parsing
              configurations...
            </div>
          ) : (
            <div className="border border-slate-200">
              <Table>
                {activeTab === "roles" ? (
                  <ManagedDataTable table={rolesTable} emptyColSpan={3} />
                ) : (
                  <ManagedDataTable table={permsTable} emptyColSpan={3} />
                )}
              </Table>
            </div>
          )}
        </div>

        {/* ─── Right Context Assignment Side Panel Matrix ─── */}
        <div className="w-full lg:w-[380px] xl:w-[425px] shrink-0">
          {selectedRole ? (
            <div className="border-2 border-slate-950 p-6 space-y-6 sticky top-8 bg-white selection:bg-slate-950">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    <Key size={10} className="text-slate-950" /> Selected
                    Authority Scope
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-slate-950 tracking-tight leading-none uppercase">
                    {selectedRole.name}
                  </h2>
                  {selectedRole.description && (
                    <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed font-mono">
                      {selectedRole.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-950">
                    Capability Grid Link Matrix
                  </h3>
                  {loadingRolePerms && (
                    <Loader2
                      className="animate-spin text-slate-400"
                      size={12}
                    />
                  )}
                </div>

                {permissions.length === 0 ? (
                  <p className="text-center text-[11px] font-mono uppercase text-slate-400 py-6 border border-dashed border-slate-200">
                    No capabilities available to link.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto pr-1 select-none">
                    {permissions.map((perm) => {
                      const isAssigned = rolePermissions?.some(
                        (p: TPermission) => p.id === perm.id,
                      );
                      return (
                        <button
                          type="button"
                          key={perm.id}
                          onClick={() => handleTogglePermission(perm)}
                          className={cn(
                            "p-3 border transition-all cursor-pointer flex items-start justify-between gap-4 hover:border-slate-950",
                            isAssigned
                              ? "border-slate-950 bg-slate-50/50"
                              : "border-slate-200 bg-transparent text-slate-400",
                          )}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={cn(
                                  "font-mono text-[10px] uppercase font-bold",
                                  isAssigned
                                    ? "text-slate-950"
                                    : "text-slate-400",
                                )}
                              >
                                {perm.resource}
                              </span>
                              <span className="font-mono text-[10px] opacity-60">
                                ({perm.action})
                              </span>
                            </div>
                            {perm.description && (
                              <p className="text-[11px] font-light leading-snug line-clamp-1">
                                {perm.description}
                              </p>
                            )}
                          </div>
                          <div
                            className={cn(
                              "w-4 h-4 border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                              isAssigned
                                ? "border-slate-950 bg-slate-950 text-white"
                                : "border-slate-300 bg-white",
                            )}
                          >
                            {isAssigned && <Check size={10} strokeWidth={3} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                className="w-full rounded-none font-mono text-[10px] uppercase tracking-widest py-5 border-slate-200 hover:bg-slate-50"
                onClick={() => setSelectedRole(null)}
              >
                Deselect Strategy Matrix
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 p-8 text-center text-slate-400 flex flex-col items-center justify-center h-72 sticky top-8">
              <Info size={20} className="mb-3 text-slate-300" />
              <p className="font-mono text-[10px] uppercase tracking-widest max-w-[240px] leading-relaxed">
                Select a structural role scope tier to configure the matrix
                capabilities grid allocation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
