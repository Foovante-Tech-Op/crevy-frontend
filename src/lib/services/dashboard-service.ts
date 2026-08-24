// src/lib/services/dashboard-service.ts
import type { TSuperAdminDashboard } from "@/types/dashboard.types";
import { axiosClient } from "../axiosClient";

export const DashboardService = {
  /**
   * Super admin — global platform metrics (registry KPIs, financial vectors,
   * MRV pipeline counters, vetting queues, audit-log activity feed).
   *
   * Requires the `users:manage` permission; the backend caches the payload
   * for 2 minutes, so polling harder than that gains nothing.
   */
  getSuperAdminDashboard: async (): Promise<TSuperAdminDashboard> => {
    const response = await axiosClient.get("/dashboards/super-admin");
    return response.data.data;
  },
};
