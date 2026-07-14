// src/constants/register.ts
import { z } from "zod";

/**
 * Trimmed climate-sector list for the unified register form (Section 03).
 * Per Madam CEO: keep only these 7 for registration; the full 12-option
 * list stays on the waitlist form (see constants/waitlist.ts).
 *
 * IMPORTANT: values here must match ProjectTypesSection's `sector` slugs
 * 1:1 for the Regenerative Agriculture card, since the landing page passes
 * `?sector=regenerative-agriculture` and this list is used to pre-select
 * the matching chip on load.
 */
export const REGISTER_CLIMATE_SECTOR_OPTIONS = [
  "Regenerative Agriculture",
  "Forestry/Afforestation",
  "AgroForestry",
  "BioChar",
  "Renewable Energy",
  "Waste Management",
  "BioDiversity",
] as const;

/**
 * Maps each ProjectTypesSection card to:
 *  - `slug`      the `?sector=` query param value used in both destination URLs
 *  - `route`     "register" (regen-ag pilot) or "waitlist" (everything else)
 *  - `registerSector`  matching value in REGISTER_CLIMATE_SECTOR_OPTIONS (register page)
 *  - `waitlistSector`  matching value in CLIMATE_SECTOR_OPTIONS (waitlist page, constants/waitlist.ts)
 *
 * Single source of truth so ProjectTypesSection, the register page, and the
 * waitlist page never drift out of sync on slugs/labels.
 */
export const PROJECT_TYPE_ROUTING = {
  "regenerative-agriculture": {
    title: "Regenerative Agriculture",
    route: "register",
    registerSector: "Regenerative Agriculture",
    waitlistSector: "Regenerative Agriculture",
  },
  reforestation: {
    title: "Reforestation",
    route: "waitlist",
    registerSector: null,
    waitlistSector: "Forestry / Afforestation",
  },
  "renewable-energy": {
    title: "Renewable Energy",
    route: "waitlist",
    registerSector: null,
    waitlistSector: "Renewable Energy",
  },
  biochar: {
    title: "Biochar",
    route: "waitlist",
    registerSector: null,
    waitlistSector: "Biochar",
  },
  "blue-carbon": {
    title: "Blue Carbon",
    route: "waitlist",
    registerSector: null,
    waitlistSector: "Blue Carbon",
  },
  "waste-management": {
    title: "Waste Management",
    route: "waitlist",
    registerSector: null,
    waitlistSector: "Waste Management",
  },
} as const;

export type TProjectTypeSlug = keyof typeof PROJECT_TYPE_ROUTING;

// ─── Validation Schema ───────────────────────────────────────────────────────
//
// Mirrors the backend's completeRegistrationSchema body shape exactly
// (src/v2/auth/schemas/auth.schema.ts on crevy-backend). firstName/lastName/
// email/password are handled separately by RegisterForm via authClient's own
// signUp.email() call, not this schema — this only covers what's POSTed to
// /auth/register/complete-profile afterward.

export const MANAGES_PROJECTS_OPTIONS = [
  "I manage climate projects",
  "I invest in climate projects",
] as const;

// Base object schema (pre-refine) — kept separate so consumers like
// RegisterForm.tsx can safely spread `.shape` into a larger combined
// schema. `.shape` does not exist on the ZodEffects wrapper produced by
// `.superRefine()`/`.refine()`, so spreading THAT silently contributes zero
// fields and disables validation for everything in it. Learned this the
// hard way — don't refine this object directly, refine the composed schema
// that spreads it instead (see RegisterForm.tsx).
export const completeRegistrationBaseSchema = z.object({
  roleDescription: z.string().min(1, "Select your role"),
  climateSectors: z
    .array(z.string())
    .min(1, "Select at least one climate sector"),
  useCases: z.array(z.string()).min(1, "Select at least one use case"),

  managesProjects: z.enum(MANAGES_PROJECTS_OPTIONS, {
    message: "Select which applies to you",
  }),

  organizationName: z.string().max(255).optional().or(z.literal("")),
  jobTitle: z.string().max(150).optional().or(z.literal("")),
});

/**
 * Cross-field rule shared by any schema that embeds
 * `completeRegistrationBaseSchema` — organizationName/jobTitle are only
 * required on the buyer branch. Exported as a plain function (not baked
 * into a `.superRefine()` on the base object) precisely so it can be
 * reapplied by whatever TOP-LEVEL schema does the final `.superRefine()`,
 * instead of getting lost via the `.shape` issue above.
 */
export function applyManagesProjectsRefinement(
  data: {
    managesProjects: string;
    organizationName?: string;
    jobTitle?: string;
  },
  ctx: z.RefinementCtx,
) {
  if (data.managesProjects === "I invest in climate projects") {
    if (!data.organizationName) {
      ctx.addIssue({
        code: "custom",
        path: ["organizationName"],
        message: "Organization name is required",
      });
    }
    if (!data.jobTitle) {
      ctx.addIssue({
        code: "custom",
        path: ["jobTitle"],
        message: "Job title is required",
      });
    }
  }
}

// Standalone, fully-refined version — for any caller that submits ONLY
// this shape directly (not embedded in a larger form schema).
export const completeRegistrationSchema =
  completeRegistrationBaseSchema.superRefine(applyManagesProjectsRefinement);

export type TCompleteRegistration = z.infer<typeof completeRegistrationSchema>;

export const completeRegistrationDefaultValues: TCompleteRegistration = {
  roleDescription: "",
  climateSectors: [],
  useCases: [],
  managesProjects: "" as TCompleteRegistration["managesProjects"],
  organizationName: "",
  jobTitle: "",
};
