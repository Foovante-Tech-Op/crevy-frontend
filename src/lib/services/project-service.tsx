// src/lib/services/project-service.tsx

import { format } from "date-fns";
import type { TCreateProject } from "@/constants/new-project";
import { axiosClient } from "../axiosClient";
import { slugify } from "../utils";

export const ProjectService = {
  // ─── Projects ──────────────────────────────────────────────────────────────

  createProject: async (data: TCreateProject) => {
    const payload = {
      projectType: data.projectType,
      sector: data.sector,
      name: data.name,
      slug: slugify(data.name),
      country: data.country,
      region: data.region,
      gpsCoordinates: data.gpsCoordinates || undefined,
      startDate: format(data.startDate, "yyyy-MM-dd"),
      endDate: data.endDate ? format(data.endDate, "yyyy-MM-dd") : undefined,
      totalAreaHectares: data.totalAreaHectares,
      facilityName: data.facilityName || undefined,
      address: data.address || undefined,
      currency: data.currency, // Pass the {code, name} object
      projectTags: data.projectTags ?? [],
      description: data.description || "",
      sdgs: data.sdgs ?? [],
      projectOwnerId: data.projectOwnerId || undefined,
      assignedAdminId: data.assignedAdminId || undefined,
    };
    const response = await axiosClient.post("/projects", payload);
    return response.data;
  },

  updateProject: async (id: string, data: Partial<TCreateProject>) => {
    const response = await axiosClient.put(`/projects/${id}`, data);
    return response.data;
  },

  getProject: async (id: string) => {
    const response = await axiosClient.get(`/projects/${id}`);
    return response.data;
  },

  getProjectBySlug: async (slug: string) => {
    const response = await axiosClient.get(`/projects/slug/${slug}`);
    return response.data;
  },

  getProjects: async (params?: Record<string, unknown>) => {
    const response = await axiosClient.get("/projects", { params });
    return response.data;
  },

  deleteProject: async (id: string) => {
    const response = await axiosClient.delete(`/projects/${id}`);
    return response.data;
  },

  getMarketplaceProjects: async (params?: Record<string, unknown>) => {
    const response = await axiosClient.get("/projects/marketplace", {
      params,
    });
    return response.data;
  },

  getProjectMarketplaceDetail: async (id: string) => {
    // This will be used for the high-fidelity marketplace project detail page
    const response = await axiosClient.get(`/projects/marketplace/${id}`);
    return response.data;
  },

  getProjectPriceHistory: async (projectId: string) => {
    // Fetch average credit price per month over 12 months
    const response = await axiosClient.get(
      `/projects/${projectId}/price-history`,
    );
    return response.data;
  },

  // ─── Documents ─────────────────────────────────────────────────────────────

  /**
   * Upload a single project document.
   * The file is first uploaded to Supabase/S3 by the caller to obtain a URL,
   * then this method stores the metadata on Crevy's backend.
   *
   * Storage is now wired via StorageService — pass the resolved public URL.
   *
   */
  uploadDocument: async (
    projectId: string,
    payload: {
      documentType: string;
      fileName: string;
      fileUrl: string;
      fileSize: number;
      mimeType?: string;
    },
  ) => {
    const response = await axiosClient.post(
      `/projects/${projectId}/documents`,
      payload,
    );
    return response.data;
  },

  listDocuments: async (projectId: string) => {
    const response = await axiosClient.get(`/projects/${projectId}/documents`);
    return response.data;
  },

  // ─── Currencies ────────────────────────────────────────────────────────────

  getCurrencies: async () => {
    const response = await axiosClient.get("/currencies");
    return response.data;
  },

  // ─── MRV ───────────────────────────────────────────────────────────────────

  getProjectVerifications: async (projectId: string) => {
    const response = await axiosClient.get(
      `/mrv/verifications/project/${projectId}`,
    );
    return response.data;
  },

  getProjectAnchors: async (projectId: string) => {
    const response = await axiosClient.get(`/mrv/anchors/project/${projectId}`);
    return response.data;
  },

  getProjectIngestions: async (projectId: string) => {
    const response = await axiosClient.get(
      `/mrv/ingestions/project/${projectId}`,
    );
    return response.data;
  },

  getProjectTransactions: async (projectId: string) => {
    const response = await axiosClient.get("/credits/transactions", {
      params: { projectId },
    });
    return response.data;
  },

  simulateMrv: async (projectId: string) => {
    const response = await axiosClient.post(`/mrv/simulate/${projectId}`);
    return response.data;
  },

  // ─── Assessment Modules (Onboarding Redesign v2) ───────────────────────────

  getAssessmentManifest: async () => {
    const response = await axiosClient.get("/projects/assessment-manifest");
    return response.data;
  },

  listAssessments: async (projectId: string) => {
    const response = await axiosClient.get(
      `/projects/${projectId}/assessments`,
    );
    return response.data;
  },

  getAssessment: async (projectId: string, moduleKey: string) => {
    const response = await axiosClient.get(
      `/projects/${projectId}/assessments/${moduleKey}`,
    );
    return response.data;
  },

  upsertAssessment: async (
    projectId: string,
    moduleKey: string,
    body: Record<string, unknown>,
    status: "in_progress" | "submitted" = "in_progress",
  ) => {
    const response = await axiosClient.put(
      `/projects/${projectId}/assessments/${moduleKey}?status=${status}`,
      body,
    );
    return response.data;
  },

  getLatestScore: async (projectId: string) => {
    const response = await axiosClient.get(
      `/projects/${projectId}/assessment-score`,
    );
    return response.data;
  },

  recalculateScore: async (projectId: string) => {
    const response = await axiosClient.post(
      `/projects/${projectId}/assessment-score/recalculate`,
    );
    return response.data;
  },

  updateClassification: async (
    projectId: string,
    data: Partial<{
      industrySector: string;
      activity: string;
      product: string;
      carbonMechanism: string;
      creditType: string;
      economySubClassification: string[];
    }>,
  ) => {
    const response = await axiosClient.patch(
      `/projects/${projectId}/classification`,
      data,
    );
    return response.data;
  },
};
