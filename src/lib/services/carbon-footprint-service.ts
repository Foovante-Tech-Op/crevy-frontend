import { axiosClient } from "../axiosClient";

export interface CarbonFootprintInputs {
  energy?: {
    electricityKwh?: number;
    electricityPeriod?: "monthly" | "yearly";
    naturalGasTherms?: number;
    gasPeriod?: "daily" | "monthly";
    usesRenewables?: "yes" | "no";
  };
  transport?: {
    carKm?: number;
    carPeriod?: "monthly" | "yearly";
    carFuelType?: "petrol" | "diesel" | "hybrid" | "electric";
    publicTransportKm?: number;
    publicTransportPeriod?: "monthly" | "yearly";
    flightsShortHaulPerYear?: number;
    flightsLongHaulPerYear?: number;
  };
  lifestyle?: {
    dietType?:
      | "meat_heavy"
      | "omnivore_average"
      | "low_meat"
      | "vegetarian"
      | "vegan";
    clothingSpendMonthly?: number;
    goodsSpendMonthly?: number;
  };
}

export interface CarbonFootprintResult {
  id: string;
  userId: string;
  inputs: any;
  breakdown: Array<{
    category: string;
    subcategory: string;
    factorId: string;
    quantity: number;
    unit: string;
    co2eKg: number;
  }>;
  totalCo2eKg: string;
  periodLabel: string;
  factorIdsUsed: string[];
  regionCode: string;
  createdAt: string;
}

export interface CarbonFootprintHistory {
  calculations: CarbonFootprintResult[];
  total: number;
  page: number;
  limit: number;
}

export const CarbonFootprintService = {
  /**
   * Calculate and persist a carbon footprint.
   */
  calculate: async (data: {
    inputs: CarbonFootprintInputs;
    regionCode?: string;
  }): Promise<CarbonFootprintResult> => {
    const response = await axiosClient.post(
      "/carbon-footprint/calculate",
      data,
    );
    return response.data.data;
  },

  /**
   * Get active emission factors for a region (for live preview).
   */
  getFactors: async (regionCode?: string): Promise<any[]> => {
    const response = await axiosClient.get("/carbon-footprint/factors", {
      params: { regionCode },
    });
    return response.data.data;
  },

  /**
   * Get calculation history for the current user.
   */
  getHistory: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<CarbonFootprintHistory> => {
    const response = await axiosClient.get("/carbon-footprint/history", {
      params,
    });
    return response.data.data;
  },

  /**
   * Get a single calculation by ID.
   */
  getCalculation: async (id: string): Promise<CarbonFootprintResult> => {
    const response = await axiosClient.get(`/carbon-footprint/history/${id}`);
    return response.data.data;
  },
};
