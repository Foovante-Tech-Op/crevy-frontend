// src/types/user.types.ts
import { z } from "zod";

/**
 * v2 registration schema — flat, no userType discriminated union.
 *
 * What was removed:
 *   - userType (Company / ProjectOwner / Admin)
 *   - Conditional company / projectOwner / admin sub-objects
 *   - userName (not required at registration)
 *
 * The backend assigns super_admin role automatically for the pilot.
 * Role-specific onboarding flows will be added after the demo.
 */
export const userRegistrationSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must not exceed 50 characters")
      .trim(),

    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must not exceed 50 characters")
      .trim(),

    email: z
      .string()
      .toLowerCase()
      .trim()
      .refine((val) => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
        message: "Invalid email format",
      })
      .optional()
      .or(z.literal("")),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must not exceed 100 characters"),

    confirmPassword: z.string().min(1, "Please confirm your password"),

    contactNumber: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .max(20, "Phone number must not exceed 20 characters")
      .optional()
      .or(z.literal("")),

    countryOfOperation: z
      .string()
      .max(100, "Country must not exceed 100 characters")
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) =>
      (data.email && data.email !== "") ||
      (data.contactNumber && data.contactNumber !== ""),
    {
      message: "Either email or contact number is required",
      path: ["email"],
    },
  );

export type TUserRegistrationInput = z.infer<typeof userRegistrationSchema>;

export const signInSchema = z.object({
  identifier: z.string().min(1, "Email or phone is required").trim(),
  password: z.string().min(1, "Password is required"),
});

export type TSignInInput = z.infer<typeof signInSchema>;

export type TRole =
  | "super_admin"
  | "admin"
  | "financial_admin"
  | "mrv_admin"
  | "project_manager"
  | "project_owner"
  | "org_admin"
  | "sustainability_manager"
  | "org_auditor";

export type TBetterAuthUser = {
  id: string;
  email: string;
  name: string;
  // Injected by customSession plugin on the backend via a DB join on roleId.
  // Will be null if the user has no role assigned yet.
  role?: TRole | null;
  // Injected by customSession — the org this user belongs to (if any).
  activeOrganizationId?: string | null;
  // Injected by customSession via a join on project_developer_member.
  // true/false for project developers, null if not applicable (e.g. buyers).
  // Frontend should only act (show the complete-profile banner/modal) on
  // an explicit `false` — null means "doesn't apply to this account".
  hasOnboarded?: boolean | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  // additionalFields
  firstName?: string;
  lastName?: string;
  contactNumber?: string | null;
  countryOfOperation?: string | null;
  roleId?: number | null;
  profileCompleted?: boolean | null;
};
