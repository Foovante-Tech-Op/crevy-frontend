// src/hooks/use-dashboard.ts
import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "@/lib/services/dashboard-service";
import type { TSuperAdminDashboard } from "@/types/dashboard.types";

/**
 * Super admin platform metrics.
 *
 * staleTime matches the backend's 2-minute Redis cache — refetching sooner
 * just re-reads the same cached payload.
 */
export function useSuperAdminDashboard() {
  return useQuery<TSuperAdminDashboard>({
    queryKey: ["dashboard", "super-admin"],
    queryFn: DashboardService.getSuperAdminDashboard,
    staleTime: 120_000,
  });
}
