"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RBACService } from "@/lib/services/rbac-service";

export function useRolePermissions(roleId: number | null) {
  const queryClient = useQueryClient();
  const enabled = roleId != null;

  const { data, isLoading, error } = useQuery({
    queryKey: ["role-permissions", roleId],
    queryFn: () => RBACService.getRolePermissions(roleId as number),
    enabled,
  });

  const assignedPermissions = data || [];

  const assignMutation = useMutation({
    mutationFn: (permissionId: number) =>
      RBACService.assignPermissionToRole(roleId as number, permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions", roleId] });
      toast.success("Permission bound to role.");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to bind permission.");
    },
  });

  const unassignMutation = useMutation({
    mutationFn: (permissionId: number) =>
      RBACService.unassignPermissionFromRole(roleId as number, permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions", roleId] });
      toast.success("Permission revoked from role.");
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Failed to revoke permission.",
      );
    },
  });

  return {
    assignedPermissions,
    isLoading,
    error,
    assignPermission: assignMutation.mutate,
    unassignPermission: unassignMutation.mutate,
    isAssigning: assignMutation.isPending,
    isUnassigning: unassignMutation.isPending,
  };
}
