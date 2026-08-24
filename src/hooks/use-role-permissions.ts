"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
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
      toast.success("Permission added to role.");
    },
    onError: (err: any) => {
      toast.error(
        getErrorMessage(
          err,
          "We couldn't add that permission. Please try again.",
        ),
      );
    },
  });

  const unassignMutation = useMutation({
    mutationFn: (permissionId: number) =>
      RBACService.unassignPermissionFromRole(roleId as number, permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions", roleId] });
      toast.success("Permission removed from role.");
    },
    onError: (err: any) => {
      toast.error(
        getErrorMessage(
          err,
          "We couldn't remove that permission. Please try again.",
        ),
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
