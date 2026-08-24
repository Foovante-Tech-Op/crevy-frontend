// src/types/dashboard.types.ts
//
// Response shapes for GET /api/v2/dashboards/*.
// Mirrors DashboardService in the backend (src/v2/dashboards/services/
// dashboard.service.ts). Numeric aggregates come back as strings because
// Postgres SUM() over numeric columns is serialised as a string by pg —
// don't assume they are numbers.

export interface TDashboardTrend {
  value: number;
  changePct: number;
  direction: "up" | "down" | "flat";
  label: string;
}

export interface TDashboardActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  icon: string;
}

export interface TSuperAdminVettingProject {
  id: string;
  projectReference: string | null;
  originator: string;
  methodology: string;
  status: string;
  createdAt: string;
}

export interface TSuperAdminVettingIdentity {
  id: string;
  identityReference: string | null;
  entityName: string;
  roleRequest: string;
  kycStatus: string;
  ownerEmail: string;
  submittedAt: string;
}

export interface TSuperAdminDashboard {
  hero: {
    pendingProjects: number;
    pendingKyc: number;
    totalPending: number;
  };
  kpi: {
    totalCreditsIssued: { value: string; unit: string; trend: string };
    grossRegistryValue: { value: string; unit: string; trend: string };
    activeProjects: { value: string; unit: string; trend: string };
    pendingGovernance: { value: string; unit: string; trend: string };
  };
  financial: {
    platformRevenueMtd: { value: string; currency: string; trend: string };
    payoutQueue: {
      count: number;
      outstandingAmount: string;
      currency: string;
    };
    creditsAcquiredMtd: {
      quantity: string;
      unit: string;
      value: string;
      currency: string;
    };
  };
  mrvPipeline: Record<
    "ingest" | "verify" | "anchor" | "issue",
    { count: number; href: string }
  >;
  systemDiagnostics: {
    registryUptime: string;
    polygonAnchoring: string;
    doubleCountDb: string;
    pendingKyc: number;
  };
  vetting: {
    projects: TSuperAdminVettingProject[];
    identities: TSuperAdminVettingIdentity[];
  };
  activityFeed: TDashboardActivityItem[];
}
