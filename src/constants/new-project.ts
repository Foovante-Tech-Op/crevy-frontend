// src/constants/new-project.ts
import { z } from "zod";

// ─── Taxonomy (display-only metadata) ────────────────────────────────────────
// NOTE: The canonical source for project types, sectors, and modules is the
// backend manifest (GET /api/v2/projects/assessment-manifest). This constant
// is kept for display metadata (icons, descriptions) that the manifest does
// not carry. Always fetch the manifest at runtime for the authoritative
// module list, pilot status, and sector mappings.

export const PROJECT_TYPES = [
  {
    id: "regenerative_agriculture",
    sector: "green_economy",
    title: "Regenerative Agriculture",
    pilotEnabled: true,
    icon: "/icons/3d-leaf.png",
    description:
      "Restore soil health and sequester carbon through sustainable farming.",
  },
  {
    id: "renewable_energy",
    sector: "green_economy",
    title: "Renewable Energy",
    pilotEnabled: true,
    icon: "/icons/3d-renewable.png",
    description:
      "Generate clean power using solar, wind, or hydro infrastructure.",
  },
  {
    id: "agricultural_waste_management",
    sector: "brown_economy",
    title: "Agricultural Waste Management",
    pilotEnabled: true,
    icon: "/icons/3d-waste.png",
    description: "Reduce landfill reliance and capture methane emissions.",
  },
  {
    id: "biochar",
    sector: "green_economy",
    title: "Biochar",
    pilotEnabled: false,
    icon: "/icons/3d-waste.png",
    description: "Carbon-negative soil amendment from waste biomass.",
  },
  {
    id: "circular_bioeconomy",
    sector: "brown_economy",
    title: "Circular Bioeconomy",
    pilotEnabled: false,
    icon: "/icons/3d-waste.png",
    description: "Closed-loop waste-to-value processing systems.",
  },
  {
    id: "water_projects",
    sector: "blue_economy",
    title: "Water Projects",
    pilotEnabled: false,
    icon: "/icons/blue-carbon.png",
    description: "Clean water infrastructure and wetland restoration.",
  },
  {
    id: "blue_carbon",
    sector: "blue_economy",
    title: "Blue Carbon",
    pilotEnabled: false,
    icon: "/icons/blue-carbon.png",
    description: "Mangrove and coastal ecosystem protection.",
  },
  {
    id: "aquaculture",
    sector: "blue_economy",
    title: "Aquaculture",
    pilotEnabled: false,
    icon: "/icons/blue-carbon.png",
    description: "Sustainable aquaculture and fisheries management.",
  },
  {
    id: "fisheries",
    sector: "blue_economy",
    title: "Fisheries",
    pilotEnabled: false,
    icon: "/icons/blue-carbon.png",
    description: "Sustainable marine and inland fisheries.",
  },
  {
    id: "agricultural_land_management",
    sector: "green_economy",
    title: "Agricultural Land Management",
    pilotEnabled: false,
    icon: "/icons/3d-leaf.png",
    description: "Integrated land use planning and stewardship.",
  },
  {
    id: "other",
    sector: "green_economy",
    title: "Other",
    pilotEnabled: false,
    icon: "/icons/3d-leaf.png",
    description: "Have a different project in mind? Describe it below.",
  },
] as const;

// ─── Document slots ────────────────────────────────────────────────────────────

export const DOCUMENT_TYPES = [
  {
    id: "land_ownership",
    label: "Land Ownership Proof",
    description:
      "Title deed, land certificate, lease agreement, or a signed letter from the chief confirming your land rights.",
    required: true,
    hasTemplate: false,
    accept: ".pdf,.jpg,.jpeg,.png",
    multiple: false,
  },
  {
    id: "community_consent",
    label: "Community / Landowner Consent Form",
    description:
      "Signed consent to participate in the Crevy dMRV monitoring programme and allow sensor deployment on your land.",
    required: true,
    hasTemplate: true,
    templateUrl: "/templates/consent-form.pdf",
    accept: ".pdf",
    multiple: false,
  },
  {
    id: "site_access_authorization",
    label: "Site Access Authorization",
    description:
      "Written permission for our technical team to access your land to install monitoring sensors.",
    required: true,
    hasTemplate: true,
    templateUrl: "/templates/site-access-form.pdf",
    accept: ".pdf",
    multiple: false,
  },
  {
    id: "national_id",
    label: "National ID / Business Registration",
    description:
      "Your national ID card, passport, or business registration certificate.",
    required: true,
    hasTemplate: false,
    accept: ".pdf,.jpg,.jpeg,.png",
    multiple: false,
  },
  {
    id: "site_photos",
    label: "Site Photographs",
    description:
      "Recent photos of your land (up to 5 images). Helps buyers understand your project.",
    required: false,
    hasTemplate: false,
    accept: ".jpg,.jpeg,.png",
    multiple: true,
    maxFiles: 5,
  },
] as const;

export type DocumentTypeId = (typeof DOCUMENT_TYPES)[number]["id"];

// ─── SDGs ──────────────────────────────────────────────────────────────────────

export const SDGS = [
  { id: "1", title: "No Poverty", color: "bg-[#E5243B]" },
  { id: "2", title: "Zero Hunger", color: "bg-[#DDA63A]" },
  { id: "3", title: "Good Health and Well-being", color: "bg-[#4C9F38]" },
  { id: "4", title: "Quality Education", color: "bg-[#C5192D]" },
  { id: "5", title: "Gender Equality", color: "bg-[#FF3A21]" },
  { id: "6", title: "Clean Water and Sanitation", color: "bg-[#26BDE2]" },
  { id: "7", title: "Affordable and Clean Energy", color: "bg-[#FCC30B]" },
  { id: "8", title: "Decent Work and Economic Growth", color: "bg-[#A21942]" },
  {
    id: "9",
    title: "Industry, Innovation and Infrastructure",
    color: "bg-[#FD6925]",
  },
  { id: "10", title: "Reduced Inequality", color: "bg-[#DD1367]" },
  {
    id: "11",
    title: "Sustainable Cities and Communities",
    color: "bg-[#FD9D24]",
  },
  {
    id: "12",
    title: "Responsible Consumption and Production",
    color: "bg-[#BF8B2E]",
  },
  { id: "13", title: "Climate Action", color: "bg-[#3F7E44]" },
  { id: "14", title: "Life Below Water", color: "bg-[#0A97D9]" },
  { id: "15", title: "Life on Land", color: "bg-[#56C02B]" },
  {
    id: "16",
    title: "Peace, Justice and Strong Institutions",
    color: "bg-[#00689D]",
  },
  { id: "17", title: "Partnerships for the Goals", color: "bg-[#19486A]" },
];

// ─── Zod schema ───────────────────────────────────────────────────────────────
// NOTE: country uses ISO alpha-3 (3-char) codes because that is what the
// CountryDropdown component stores (e.g. "GHA" for Ghana).
// The project service maps this value straight to the backend which now
// accepts min(2).max(3).
//
// This schema covers ONLY Step 0 (Project Profile). Module answers are saved
// incrementally via the assessment endpoints, not in one giant payload.

export const createProjectInputSchema = z
  .object({
    // Step 0 — Project Profile
    projectType: z.string().min(1, "Select a project type"),
    sector: z.string().min(1, "Sector is required"),
    customProjectTypeLabel: z.string().optional(),
    name: z.string().min(1, "Project name is required").max(255),
    country: z.string().min(2, "Select a country").max(3),
    region: z.string().min(1, "Region / area is required"),
    gpsCoordinates: z
      .string()
      .regex(
        /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/,
        "Format: lat, lng — e.g. 6.5244, -1.3792",
      )
      .optional()
      .or(z.literal("")),
    startDate: z.coerce.date({
      error: () => ({ message: "Enter a valid start date" }),
    }),
    endDate: z.coerce
      .date()
      .optional()
      .refine((date) => {
        if (!date) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      }, "End date must be today or in the future"),
    totalAreaHectares: z.coerce
      .number({
        error: () => ({ message: "Enter the project area in hectares" }),
      })
      .positive("Area must be greater than 0"),

    // Project metadata (still part of createProject payload — modules can refine later)
    description: z
      .string()
      .min(20, "Project description is required (min 20 characters)")
      .max(1000, "Project description must be under 1000 characters"),
    projectTags: z.array(z.string()).default([]),
    sdgs: z.array(z.string()).default([]),
    currency: z.object({
      code: z.string().min(3, "Select a currency").max(3),
      name: z.string().min(1, "Select a currency"),
    }),

    projectOwnerId: z
      .string()
      .uuid("Please select a valid project owner")
      .optional()
      .or(z.literal("")),
    assignedAdminId: z.string().optional(),

    // Step 1..N — Module answers are NOT part of this schema.
    // They are saved incrementally via PUT /projects/:id/assessments/:moduleKey

    // Step N+1 — Documents (tracked client-side, uploaded separately)
    documents: z.record(z.string(), z.any().nullable()).default({}),
  })
  .superRefine((data, ctx) => {
    if (data.endDate && data.startDate && data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date cannot be earlier than start date",
        path: ["endDate"],
      });
    }
    // Require customProjectTypeLabel when projectType = 'other'
    if (data.projectType === "other" && !data.customProjectTypeLabel) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please describe your project type",
        path: ["customProjectTypeLabel"],
      });
    }
  });

export type TCreateProject = z.infer<typeof createProjectInputSchema>;

export const createProjectDefaultValues: TCreateProject = {
  projectType: "",
  sector: "green_economy",
  customProjectTypeLabel: "",
  name: "",
  country: "GHA",
  region: "",
  gpsCoordinates: "",
  startDate: new Date(),
  endDate: undefined,
  totalAreaHectares: 0,
  currency: { code: "", name: "" },
  description: "",
  projectTags: [],
  sdgs: [],
  projectOwnerId: "",
  assignedAdminId: "",
  documents: {},
};
