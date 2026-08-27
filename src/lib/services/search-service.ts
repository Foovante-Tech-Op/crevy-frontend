import { axiosClient } from "../axiosClient";

/**
 * Response shape for GET /api/v2/search.
 * Mirrors SearchService in the backend (src/v2/search/services/search.service.ts).
 */

export interface TSearchResult {
  id: string;
  title: string;
  subtitle?: string;
  /**
   * Built server-side. The palette navigates straight to it and never derives
   * a route from an entity type — the backend already knows that developers
   * route by code while projects route by id.
   */
  url: string;
  badge?: string;
}

export interface TSearchGroup {
  type: string;
  label: string;
  results: TSearchResult[];
}

export interface TSearchResponse {
  groups: TSearchGroup[];
}

export const SearchService = {
  search: async (q: string): Promise<TSearchResponse> => {
    const response = await axiosClient.get("/search", { params: { q } });
    return response.data.data;
  },
};
