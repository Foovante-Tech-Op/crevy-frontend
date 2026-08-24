"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Info, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getErrorMessage } from "@/lib/errors";
import { FieldAgentService } from "@/lib/services/field-agent-service";
import {
  RBACService,
  type TPermission,
  type TRole,
} from "@/lib/services/rbac-service";
import { UserService } from "@/lib/services/user-service";
import { cn } from "@/lib/utils";

export default function UserManagementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  // Fetch user details
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user-detail", id],
    queryFn: () => UserService.getUserProfile(id),
    enabled: !!id,
  });

  // Fetch all permissions
  const { data: permissions = [], isLoading: loadingPerms } = useQuery({
    queryKey: ["rbac-permissions"],
    queryFn: RBACService.getPermissions,
  });

  // Fetch field agents if user is project_admin
  const { data: fieldAgents, isLoading: loadingFieldAgents } = useQuery({
    queryKey: ["field-agents", "user-detail", id],
    queryFn: async () => {
      const response = await FieldAgentService.listFieldAgents({});
      return response.agents || [];
    },
    enabled: !!user && user.role === "project_admin",
  });

  // Fetch permissions for the user's role
  const { data: userRolePermissions = [], isLoading: loadingRolePerms } =
    useQuery({
      queryKey: ["rbac-role-permissions", user?.role],
      queryFn: async () => {
        if (!user?.role) return [];
        // Get all roles to find the role ID
        const allRoles = await RBACService.getRoles();
        const userRole = allRoles.find((r) => r.name === user.role);
        if (!userRole) return [];
        return RBACService.getRolePermissions(userRole.id);
      },
      enabled: !!user?.role,
    });

  // Assign permission to role
  const assignPermission = useMutation({
    mutationFn: async ({ permissionId }: { permissionId: number }) => {
      if (!user?.role) throw new Error("User role not found");
      const allRoles = await RBACService.getRoles();
      const userRole = allRoles.find((r) => r.name === user.role);
      if (!userRole) throw new Error("Role not found");
      return RBACService.assignPermissionToRole(userRole.id, permissionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac-role-permissions"] });
      toast.success("Permission added.");
    },
    onError: (error) =>
      toast.error(
        getErrorMessage(
          error,
          "We couldn't add that permission. Please try again.",
        ),
      ),
  });

  const unassignPermission = useMutation({
    mutationFn: async ({ permissionId }: { permissionId: number }) => {
      if (!user?.role) throw new Error("User role not found");
      const allRoles = await RBACService.getRoles();
      const userRole = allRoles.find((r) => r.name === user.role);
      if (!userRole) throw new Error("Role not found");
      return RBACService.unassignPermissionFromRole(userRole.id, permissionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac-role-permissions"] });
      toast.success("Permission removed.");
    },
    onError: (error) =>
      toast.error(
        getErrorMessage(
          error,
          "We couldn't remove that permission. Please try again.",
        ),
      ),
  });

  const handleTogglePermission = (perm: TPermission) => {
    const isCurrentlyAssigned = userRolePermissions?.some(
      (p) => p.id === perm.id,
    );

    if (isCurrentlyAssigned) {
      unassignPermission.mutate({ permissionId: perm.id });
    } else {
      assignPermission.mutate({ permissionId: perm.id });
    }
  };

  const isLoading = isLoadingUser || loadingPerms || loadingRolePerms;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-20">
          <p className="text-slate-500 text-lg">User not found</p>
          <Button
            onClick={() => router.back()}
            className="mt-4"
            variant="outline"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-slate-400 hover:text-slate-600"
              >
                ← Back
              </Button>
            </div>
            <h1 className="text-3xl font-sans text-slate-950 tracking-tight leading-none mb-2">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
              {user.role?.replace(/_/g, " ")} • Identity Dossier
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: User Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <div className="border border-slate-200 p-6 space-y-4">
              <h2 className="text-lg font-sans font-bold text-slate-950 mb-4">
                Identity Profile
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                    Full Name
                  </p>
                  <p className="text-sm text-slate-900">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                    Email
                  </p>
                  <p className="text-sm text-slate-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                    Contact
                  </p>
                  <p className="text-sm text-slate-900">
                    {user.contactNumber || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                    Country
                  </p>
                  <p className="text-sm text-slate-900">
                    {user.countryOfOperation || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                    Role
                  </p>
                  <p className="text-sm text-slate-900 font-mono uppercase">
                    {user.role?.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                    Status
                  </p>
                  <p className="text-sm text-slate-900">
                    {user.isActive ? "Active" : "Suspended"}
                  </p>
                </div>
              </div>
            </div>

            {/* Field Agents Table (for project_admin) */}
            {user.role === "project_admin" && (
              <div className="border border-slate-200 p-6">
                <h2 className="text-lg font-sans font-bold text-slate-950 mb-4">
                  Managed Field Agents
                </h2>
                {loadingFieldAgents ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  </div>
                ) : fieldAgents && fieldAgents.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Registered</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fieldAgents.map((agent) => (
                        <TableRow key={agent.id}>
                          <TableCell className="font-medium">
                            {agent.fullName}
                          </TableCell>
                          <TableCell>{agent.email}</TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
                                agent.status === "active"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : agent.status === "pending"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-red-50 text-red-700",
                              )}
                            >
                              {agent.status}
                            </span>
                          </TableCell>
                          <TableCell>{agent.registrationsCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-sm text-slate-400 py-8">
                    No field agents assigned yet
                  </p>
                )}
              </div>
            )}

            {/* Permissions Management */}
            <div data-lenis-prevent className="border border-slate-200 p-6">
              <h2 className="text-lg font-sans font-bold text-slate-950 mb-4">
                Permission Configuration
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Manage permissions for the{" "}
                <span className="font-bold text-slate-900">
                  {user?.role?.replace(/_/g, " ")}
                </span>{" "}
                role
              </p>

              {loadingRolePerms ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : permissions.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">
                  No permissions available
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto">
                  {permissions.map((perm) => {
                    const isAssigned = userRolePermissions?.some(
                      (p) => p.id === perm.id,
                    );

                    return (
                      <button
                        type="button"
                        key={perm.id}
                        onClick={() => handleTogglePermission(perm)}
                        className={cn(
                          "p-3 border transition-all text-left flex items-start justify-between gap-4 hover:border-slate-950",
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
                            <p className="text-[11px] font-light leading-snug">
                              {perm.description}
                            </p>
                          )}
                        </div>
                        <div
                          className={cn(
                            "w-4 h-4 border flex items-center justify-center shrink-0 mt-0.5",
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
          </div>

          {/* Right: Summary Panel */}
          <div className="space-y-6">
            <div className="border-2 border-slate-950 p-6 sticky top-8">
              <h3 className="text-sm font-bold text-slate-950 mb-4">
                Access Summary
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    Role
                  </p>
                  <p className="text-sm text-slate-900 font-mono uppercase">
                    {user.role?.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    Status
                  </p>
                  <p className="text-sm text-slate-900">
                    {user.isActive ? "Active" : "Suspended"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    Member Since
                  </p>
                  <p className="text-sm text-slate-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {user.role === "project_admin" && fieldAgents && (
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                      Field Agents Managed
                    </p>
                    <p className="text-sm text-slate-900">
                      {fieldAgents.length}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
