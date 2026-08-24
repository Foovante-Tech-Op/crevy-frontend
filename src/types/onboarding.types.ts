import z from "zod";

export const projectOwnerOnboardingSchema = z
  .object({
    // Step 1: User Info
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z
      .string()
      .email("Invalid email format")
      .optional()
      .or(z.literal("")),
    contactNumber: z.string().min(1, "Contact number is required"),

    // No password. An admin choosing the developer's credential means the
    // admin knows it — which is the thing the claim-code flow exists to
    // avoid, and which every other person this form can create (the
    // additional members) already avoided. The lead was the last exception.
    // They now receive a 14-day numeric setup code by email and SMS, and
    // choose their own password at /developer/claim.

    // ── On-site capability capture ──
    // Asked of the lead on EVERY entity type, individual included. These
    // were previously only collected for additional members, which this
    // form doesn't even offer for an individual — so an individual
    // developer recorded no capability data and no consent at all.
    // hasEmailAccess is the real gate: false means no account is ever
    // created, just a roster entry.
    hasEmailAccess: z.boolean(),
    hasWebAccess: z.boolean(),
    // Explicit consent — required for legal reasons, never defaulted true.
    agentManagesAccount: z.boolean(),

    countryOfOperation: z.string().min(1, "Country is required"),

    // Step 2: Payment Details
    paymentMethod: z.enum(["bank", "momo"]),
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    accountName: z.string().optional(),
    momoNetwork: z.string().optional(),
    momoNumber: z.string().optional(),

    // Step 3: Farm Plot
    region: z.string().min(1, "Region is required"),
    village: z.string().optional(),
    latitude: z.string().min(1, "Latitude is required"),
    longitude: z.string().min(1, "Longitude is required"),
    areaHectares: z.string().min(1, "Area is required"),

    // Step 4: Assignment
    partnerId: z.preprocess(
      (val) => (val === "" || val === undefined ? null : val),
      z.coerce.number().optional().nullable(),
    ),
    assignedAdminId: z.string().optional().nullable(),
    assignmentType: z.enum(["primary", "secondary"]).default("primary"),
    isB2cAssignment: z.boolean().default(true),
  })
  // Mirrors the API rule rather than discovering it via a 400: the setup
  // code has to be sent somewhere, so hasEmailAccess without an address is
  // a contradiction. Caught on the field so the message lands on it.
  .refine((data) => !data.hasEmailAccess || !!data.email, {
    message: "Email is required when this person has an active email account",
    path: ["email"],
  });

export type TProjectOwnerOnboardingInput = z.infer<
  typeof projectOwnerOnboardingSchema
>;
