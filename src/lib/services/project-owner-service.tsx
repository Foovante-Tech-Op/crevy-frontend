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
  // The user id of the admin/field agent who onboarded them. Not a name —
  // the column comment on the backend model claimed otherwise for a long time,
  // which is how the raw id ended up rendered on the detail screen.
  onboardedBy: string | null;
  // Resolved display name for the above. Optional because only the detail
  // endpoint (GET /project-developers/code/:code) joins the user table for it;
  // the list endpoint returns the bare id.
  onboardedByName?: string | null;
  // ── KYC decision trail ──
  // Who approved/rejected, when, and why. All null while pending. As with
  // onboardedBy, verifiedBy is a user id and verifiedByName is the resolved
  // display name, populated only by the detail endpoint.
  verifiedBy?: string | null;
  verifiedByName?: string | null;
  verifiedAt?: string | null;
  rejectionReason?: string | null;
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
  // On-site captured contact info + field-agent note — only ever populated
  // when a field agent registers this developer before any user account
  // exists for them (see AgentDeveloperService.registerDeveloper on the
  // backend). null for admin-onboarded/self-registered developers, whose
  // contact info lives on the member's `user` row instead.
  contactPhone: string | null;
  contactEmail: string | null;
  registeredByAgentId: string | null;
  // Free-text field note on what the site is actually used for, captured
  // by the registering agent on-site (e.g. "cocoa agroforestry", "poultry
  // waste composting facility") — NOT the formal project-type taxonomy
  // chosen later during full project registration.
  siteActivityNote: string | null;
  // NOTE: email/contactNumber/userId are intentionally NOT part of the list
  // response — the list endpoint doesn't join project_developer_member/user
  // (that join only happens on the code-based detail fetch below, since a
  // cooperative/company can have many members and "the" email/phone for a
  // multi-member entity isn't a single well-defined value at list level).
};

export type ProjectOwnerMember = {
  id: string;
  userId: string | null;
  role: "owner" | "admin" | "member";
  hasOnboarded: boolean;
  joinedAt: string;
  // Populated from `user` when userId is set; from the member row's own
  // firstName/lastName columns when it isn't (an account-less roster
  // entry — see hasEmailAccess below).
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  contactNumber: string | null;
  isActive: boolean;
  // On-site capability capture — see project_developer_member model.
  // hasEmailAccess is what gated whether userId got set at all.
  hasEmailAccess: boolean;
  hasWebAccess: boolean;
  agentManagesAccount: boolean;
  agentManagesAccountConsentedAt: string | null;
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

// Payload for POST /project-developers/:id/members — adding ONE additional
// member to an existing cooperative/company. Mirrors the `members[]` entry
// shape from onboarding, plus the same optional per-member farmPlot shape
// used in onboarding/complete-profile.
//
// No password field — agent-set passwords are a security risk (the agent
// would know the account's credential). Instead: hasEmailAccess gates
// whether an account gets created at all (email required exactly when
// true); if it is, the person gets a 14-day claim code by email + SMS to
// set their own real password. agentManagesAccount is required consent,
// asked explicitly regardless of email/web access.
export type AddProjectOwnerMemberPayload = {
  firstName: string;
  lastName: string;
  contactNumber: string;
  hasEmailAccess: boolean;
  email?: string | null;
  hasWebAccess: boolean;
  agentManagesAccount: boolean;
  role?: "admin" | "member";
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

  /**
   * Admin KYC decision on a project developer.
   *
   * A field agent registers them on-site and they land in 'pending'; an admin
   * reviews the captured details and calls this. Requires
   * project_developer:manage server-side — there is deliberately no self-serve
   * path, so a developer can never approve themselves.
   *
   * `reason` is required by the API when status is "rejected" and is what the
   * registering field agent sees, so it should say what to correct.
   */
  setVerificationStatus: async (
    projectDeveloperId: string,
    payload: {
      status: "pending" | "verified" | "rejected";
      reason?: string;
    },
  ): Promise<{
    success: boolean;
    message: string;
    data: ProjectOwnerRecord;
  }> => {
    const response = await axiosClient.patch(
      `/project-developers/${projectDeveloperId}/verification`,
      payload,
    );
    return response.data;
  },

  /**
   * Add a member to an existing cooperative/company project developer
   * (the "invite the rest later" path — onboarding can create the lead +
   * some members up front, this covers adding more afterward). Rejected
   * server-side for entityType 'individual'. If `farmPlot` is supplied,
   * the member's own parcel is captured in the same request and attributed
   * to them via farm_plot.memberId, while still rolling up under this same
   * project developer.
   */
  addMember: async (
    projectDeveloperId: string,
    payload: AddProjectOwnerMemberPayload,
  ): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await axiosClient.post(
      `/project-developers/${projectDeveloperId}/members`,
      payload,
    );
    return response.data;
  },
};
