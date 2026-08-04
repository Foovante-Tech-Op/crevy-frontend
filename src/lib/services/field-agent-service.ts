// src/lib/services/field-agent-service.ts
import { axiosClient } from "../axiosClient";

// ── Admin-facing (super_admin / project_admin) ──────────────────────────────

export interface TFieldAgentRow {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string | null;
  isActive: boolean | null; // null for a still-pending invitation
  status: "active" | "disabled" | "pending";
  createdAt: string;
  disabledAt: string | null;
  registrationsCount: number;
  expiresAt?: string; // only present for pending rows
}

export interface TListFieldAgentsResponse {
  agents: TFieldAgentRow[];
  total: number;
  page: number;
  limit: number;
}

export const FieldAgentService = {
  listFieldAgents: async (params?: {
    status?: "active" | "disabled" | "pending";
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<TListFieldAgentsResponse> => {
    const response = await axiosClient.get("/admin/field-agents", { params });
    return response.data.data;
  },

  inviteFieldAgent: async (data: {
    email: string;
    phone?: string;
    fullName: string;
  }) => {
    const response = await axiosClient.post("/admin/field-agents/invite", data);
    return response.data;
  },

  toggleFieldAgentStatus: async (agentId: string, isActive: boolean) => {
    const response = await axiosClient.patch(
      `/admin/field-agents/${agentId}/status`,
      { isActive },
    );
    return response.data;
  },

  acceptInvite: async (data: {
    token: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const response = await axiosClient.post("/agent/accept-invite", data);
    return response.data;
  },
};

// ── Field-agent-facing (field_agent role) ───────────────────────────────────

export interface TRegisterDeveloperInput {
  developerName: string;
  phone: string;
  email?: string;
  entityType?: "individual" | "cooperative" | "company";
  farmOrProjectType?: string;
  idPhotoUrl?: string;
  // Lead-contact capability capture — only meaningful (and only sent) for
  // entityType 'cooperative' | 'company', where the lead also becomes a
  // project_developer_member (role 'owner'). hasEmailAccess gates whether
  // an account gets created at all; agentManagesAccount is required
  // consent, asked regardless.
  hasEmailAccess?: boolean;
  hasWebAccess?: boolean;
  agentManagesAccount?: boolean;
  location?: {
    region: string;
    village?: string;
    lat: number;
    lng: number;
    estimatedAreaHectares?: number;
  };
}

export interface TMyDeveloperRow {
  id: string;
  code: string;
  name: string;
  entityType: string;
  verificationStatus: "pending" | "verified" | "rejected";
  createdAt: string;
}

export const AgentDeveloperService = {
  registerDeveloper: async (data: TRegisterDeveloperInput) => {
    const response = await axiosClient.post("/agent/developers", data);
    return response.data;
  },

  listMine: async (params?: {
    cursor?: string;
    limit?: number;
    status?: "pending" | "verified" | "rejected";
    search?: string;
  }): Promise<{
    data: TMyDeveloperRow[];
    nextCursor: string | null;
    total: number;
  }> => {
    const response = await axiosClient.get("/agent/developers/mine", {
      params,
    });
    return response.data.data;
  },
};

// ── Developer claim (for project developers to accept invites) ─────────────────
// Long-token URL flow — entityType 'individual' only, no member row.

export const DeveloperClaimService = {
  acceptInvite: async (data: {
    token: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const response = await axiosClient.post("/developer/accept-invite", data);
    return response.data;
  },
};

// ── Member claim (redeeming a short claim code) ─────────────────────────────
// For cooperative/company members (and their lead contact) — distinct from
// DeveloperClaimService above: a short numeric code (SMS-friendly, 14-day
// validity) instead of a long URL token, and updates a pre-created
// project_developer_member row instead of creating a new one.

export const MemberClaimService = {
  claimAccount: async (data: {
    code: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const response = await axiosClient.post("/developer/claim", data);
    return response.data;
  },
};
