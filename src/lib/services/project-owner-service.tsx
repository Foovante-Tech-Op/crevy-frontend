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
  userId: string;
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
  // Joined from user table
  name: string;
  email: string | null;
  contactNumber: string | null;
  entityType: string | null;
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
    const response = await axiosClient.get("/project-owners", { params });
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
    const response = await axiosClient.post("/project-owners/onboard", payload);
    return response.data;
  },

  getProjectOwner: async (
    userId: string,
  ): Promise<{ success: boolean; data: ProjectOwnerRecord }> => {
    const response = await axiosClient.get(`/project-owners/${userId}`);
    return response.data;
  },
};
