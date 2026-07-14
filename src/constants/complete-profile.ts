// src/constants/complete-profile.ts
import { z } from "zod";

// Mirrors backend's completeProfileSchema body shape exactly
// (crevy-backend: src/v2/project_owners/schemas/complete_profile.schema.ts).
export const PAYMENT_METHOD_OPTIONS = ["Bank Account", "Mobile Money"] as const;

export const completeProfileFormSchema = z
  .object({
    paymentMethod: z.enum(PAYMENT_METHOD_OPTIONS),

    bankName: z.string().optional().or(z.literal("")),
    accountNumber: z.string().optional().or(z.literal("")),
    bankAccountName: z.string().optional().or(z.literal("")),

    network: z.string().optional().or(z.literal("")),
    momoNumber: z.string().optional().or(z.literal("")),
    momoAccountName: z.string().optional().or(z.literal("")),

    region: z.string().min(1, "Region is required"),
    village: z.string().optional().or(z.literal("")),
    latitude: z.string().min(1, "Latitude is required"),
    longitude: z.string().min(1, "Longitude is required"),
    areaHectares: z.string().min(1, "Area is required"),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === "Bank Account") {
      if (!data.bankName) {
        ctx.addIssue({
          code: "custom",
          path: ["bankName"],
          message: "Bank name is required",
        });
      }
      if (!data.accountNumber) {
        ctx.addIssue({
          code: "custom",
          path: ["accountNumber"],
          message: "Account number is required",
        });
      }
    } else {
      if (!data.network) {
        ctx.addIssue({
          code: "custom",
          path: ["network"],
          message: "Network is required",
        });
      }
      if (!data.momoNumber) {
        ctx.addIssue({
          code: "custom",
          path: ["momoNumber"],
          message: "Mobile money number is required",
        });
      }
    }
    if (Number.isNaN(Number(data.latitude))) {
      ctx.addIssue({
        code: "custom",
        path: ["latitude"],
        message: "Must be a number",
      });
    }
    if (Number.isNaN(Number(data.longitude))) {
      ctx.addIssue({
        code: "custom",
        path: ["longitude"],
        message: "Must be a number",
      });
    }
    if (
      Number.isNaN(Number(data.areaHectares)) ||
      Number(data.areaHectares) <= 0
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["areaHectares"],
        message: "Must be a positive number",
      });
    }
  });

export type TCompleteProfileForm = z.infer<typeof completeProfileFormSchema>;

export const completeProfileDefaultValues: TCompleteProfileForm = {
  paymentMethod: "Bank Account",
  bankName: "",
  accountNumber: "",
  bankAccountName: "",
  network: "",
  momoNumber: "",
  momoAccountName: "",
  region: "",
  village: "",
  latitude: "",
  longitude: "",
  areaHectares: "",
};
