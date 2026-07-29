// src/lib/services/project-owner-service.tsx
import { axiosClient } from "../axiosClient";

export type ProjectOwnerFilters = {
  cursor?: string;
  limit?: number;
  verificationStatus?: "pending" | "verified" | "rejected";
  country?: string;
  search?: string;
  // Only used by super_admin drilling into a specific manager's portfolio
  agentId?: string;
};

export type ProjectOwnerRecord = {
  id: string;
  code: string;
  verificationStatus: "pending" | "verified" | "rejected";
  onboardedBy: string | null;
  onboardedAt: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName?: string;
  } | null;
  momoDetails: { network: string; number: string; accountName?: string } | null;
  createdAt: string;
  updatedAt: string;
  // project_developer's own name column — for entityType 'individual' this
  // is the person's name; for 'cooperative'/'company' this is the entity
  // name (e.g. "Cocoa Coop Ltd"), NOT any individual member's name.
  name: string;
  entityType: "individual" | "cooperative" | "company" | null;
  // NOTE: email/contactNumber/userId are intentionally NOT part of the list
  // response — the list endpoint doesn't join project_developer_member/user
  // (that join only happens on the code-based detail fetch below, since a
  // cooperative/company can have many members and "the" email/phone for a
  // multi-member entity isn't a single well-defined value at list level).
};

export type ProjectOwnerMember = {
  id: string;
  userId: string;
  role: "owner" | "admin" | "member";
  hasOnboarded: boolean;
  joinedAt: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  contactNumber: string | null;
  isActive: boolean;
};

export type ProjectOwnerSite = {
  id: string;
  projectId: string;
  projectCode: string | null;
  projectName: string | null;
  kind: "farm_plot" | "project_site";
  centroid: { lat: number; lng: number } | null;
} & (
  | {
      kind: "farm_plot";
      plotId: string;
      enrolledAreaHectares: string;
      status: string;
      enrolledDate: string;
      farmPlotId: string;
      country: string;
      region: string;
      village: string | null;
      boundary: unknown;
      areaHectares: string;
    }
  | {
      kind: "project_site";
      siteType: string;
      facilityName: string | null;
      address: string | null;
      areaOrCapacity: string | null;
    }
);

export type ProjectOwnerDetail = ProjectOwnerRecord & {
  members: ProjectOwnerMember[];
  sites: ProjectOwnerSite[];
};

export type ProjectOwnerListResponse = {
  success: boolean;
  data: ProjectOwnerRecord[];
  nextCursor: string | null;
  total: number;
};

export type ProjectOwnerOnboardPayload = {
  firstName: string;
  lastName: string;
  email?: string | null;
  contactNumber: string;
  password: string;
  countryOfOperation: string;
  partnerId?: number | null;
  assignedAdminId?: string | null;
  assignmentType?: "primary" | "secondary";
  isB2cAssignment?: boolean;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName?: string | null;
  } | null;
  momoDetails?: {
    network: string;
    number: string;
    accountName?: string | null;
  } | null;
  farmPlot?: {
    region: string;
    village?: string | null;
    centroid: { lat: number; lng: number };
    areaHectares: number;
  } | null;
};

export const ProjectOwnerService = {
  /**
   * List project owners.
   * The backend injects role-based filtering:
   *   - super_admin: sees all
   *   - project_manager: sees only their assigned owners
   * The frontend passes filters but never controls the scope boundary.
   */
  listProjectOwners: async (
    filters: ProjectOwnerFilters = {},
  ): Promise<ProjectOwnerListResponse> => {
    // Strip undefined values so axios doesn't send empty params
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== ""),
    );
    const response = await axiosClient.get("/project-developers", { params });
    return response.data;
  },

  /**
   * Onboard a new project owner (admin / field-agent only).
   * The backend creates the Better Auth user, project owner profile,
   * farm plot, and assignment in a single atomic transaction.
   */
  onboardProjectOwner: async (
    payload: ProjectOwnerOnboardPayload,
  ): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await axiosClient.post(
      "/project-developers/onboard",
      payload,
    );
    return response.data;
  },

  getProjectOwner: async (
    userId: string,
  ): Promise<{ success: boolean; data: ProjectOwnerRecord }> => {
    const response = await axiosClient.get(`/project-developers/${userId}`);
    return response.data;
  },

  /**
   * Detail-screen fetch, keyed on the registry code (e.g. PD-GH-000001)
   * shown throughout the UI — not the raw UUID. Response includes the full
   * member roster; render a single inline member block when entityType is
   * 'individual', or a data table (one row per member, linking to that
   * member's /user-management/:userId profile) for 'cooperative'/'company'.
   */
  getProjectOwnerByCode: async (
    code: string,
  ): Promise<{ success: boolean; data: ProjectOwnerDetail }> => {
    const response = await axiosClient.get(`/project-developers/code/${code}`);
    return response.data;
  },
};
