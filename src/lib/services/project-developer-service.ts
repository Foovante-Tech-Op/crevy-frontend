// src/lib/services/project-developer-service.ts
import { axiosClient } from "@/lib/axiosClient";

export type TBankDetails = {
  bankName: string;
  accountNumber: string;
  accountName?: string;
};

export type TMomoDetails = {
  network: string;
  number: string;
  accountName?: string;
};

export type TCompleteProfilePayload = {
  bankDetails?: TBankDetails | null;
  momoDetails?: TMomoDetails | null;
  farmPlot: {
    region: string;
    village?: string | null;
    centroid: { lat: number; lng: number };
    areaHectares: number;
  };
};

/**
 * Self-service "complete your profile" — fills in the payment + farm plot
 * details deliberately left out of the lightweight public register form.
 * Scoped server-side to the calling user's own project_developer record.
 */
export async function completeProjectDeveloperProfile(
  payload: TCompleteProfilePayload,
) {
  const { data } = await axiosClient.post(
    "/project-developers/complete-profile",
    payload,
  );
  return data;
}
