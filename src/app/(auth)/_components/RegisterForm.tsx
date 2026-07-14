"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, Sprout } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  applyManagesProjectsRefinement,
  completeRegistrationBaseSchema,
  MANAGES_PROJECTS_OPTIONS,
  REGISTER_CLIMATE_SECTOR_OPTIONS,
  type TCompleteRegistration,
} from "@/constants/register";
import {
  ROLE_DESCRIPTION_OPTIONS,
  USE_CASE_OPTIONS,
} from "@/constants/waitlist";
import { axiosClient } from "@/lib/axiosClient";
import { cn } from "@/lib/utils";
import {
  FieldLabel,
  MultiSelectChips,
  SelectableCardGroup,
  SingleSelectField,
  TextField,
} from "./form-fields";

type EntityType = "organization" | "project_owner";

const registerFormSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    contactNumber: z.string().optional().or(z.literal("")),
    // Spreads the un-refined base object — completeRegistrationSchema (the
    // refined version) does NOT expose `.shape`, so spreading that here
    // would silently drop every one of these fields from validation.
    ...completeRegistrationBaseSchema.shape,
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
    // Reapply the buyer-only organizationName/jobTitle requirement here,
    // at the schema that actually gets used for validation.
    applyManagesProjectsRefinement(data, ctx);
  });

type TRegisterForm = z.infer<typeof registerFormSchema>;

const defaultValues: TRegisterForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  contactNumber: "",
  roleDescription: "",
  climateSectors: [],
  useCases: [],
  managesProjects: "" as TCompleteRegistration["managesProjects"],
  organizationName: "",
  jobTitle: "",
};

export default function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectorParam = searchParams.get("sector");

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const methods = useForm<TRegisterForm>({
    resolver: zodResolver(registerFormSchema) as any,
    defaultValues,
    mode: "onTouched",
  });

  const { control, handleSubmit, watch, setValue } = methods;
  const managesProjects = watch("managesProjects");
  const climateSectors = watch("climateSectors");
  const isInvestor = managesProjects === "I invest in climate projects";

  // Pre-select sector from URL param
  useEffect(() => {
    if (
      sectorParam &&
      REGISTER_CLIMATE_SECTOR_OPTIONS.includes(sectorParam as any)
    ) {
      setValue("climateSectors", [sectorParam]);
    }
  }, [sectorParam, setValue]);

  const onSubmit = async (data: TRegisterForm) => {
    setLoading(true);

    try {
      // Single call — the backend creates the better-auth user AND the
      // org/project_developer entity, with a compensating rollback if the
      // entity half fails. No more stranded half-accounts from a failed
      // second request.
      await axiosClient.post("/auth/register/account", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        contactNumber: data.contactNumber || undefined,
        roleDescription: data.roleDescription,
        climateSectors: data.climateSectors,
        useCases: data.useCases,
        managesProjects: data.managesProjects,
        organizationName: data.organizationName || undefined,
        jobTitle: data.jobTitle || undefined,
      });

      // Show success modal. Registration no longer auto-logs the person in
      // (better-auth's session cookie is only set on a direct browser call
      // to signUp.email(), which this endpoint doesn't proxy) — "Go to
      // Login" below is the actual next step, not just a formality.
      setRegisteredEmail(data.email);
      setShowSuccessModal(true);

      toast.success(
        "Account created successfully! Please check your email to verify.",
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const onInvalid = (errors: any) => {
    const entries = Object.entries(errors);
    if (entries.length > 0) {
      const [field, error]: [string, unknown][] = entries;
      toast.error(`${field}: ${(error as any)?.message || "Invalid input"}`);
    }
  };

  return (
    <div className={cn("w-full max-w-md mx-auto", className)} {...props}>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none mb-3">
          Create Account<span className="text-brand">.</span>
        </h1>
        <p className="text-sm text-slate-500 font-light leading-relaxed">
          Join Crevy as a buyer or project developer. Start your journey in the
          carbon market.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-8">
        {/* ── Personal Details ── */}
        <section className="space-y-6">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 pb-3 border-b border-slate-200">
            Personal Details
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <FieldLabel required>First Name</FieldLabel>
              <Controller
                control={control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 font-serif text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors outline-none"
                      {...field}
                      disabled={loading}
                    />
                    {fieldState.error && (
                      <p className="text-[10px] font-mono text-red-600 uppercase tracking-wide mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
            <div className="space-y-3">
              <FieldLabel required>Last Name</FieldLabel>
              <Controller
                control={control}
                name="lastName"
                render={({ field, fieldState }) => (
                  <>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 font-serif text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors outline-none"
                      {...field}
                      disabled={loading}
                    />
                    {fieldState.error && (
                      <p className="text-[10px] font-mono text-red-600 uppercase tracking-wide mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
          </div>

          <div className="space-y-3">
            <FieldLabel required>Email Address</FieldLabel>
            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <>
                  <input
                    type="email"
                    className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 font-mono text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors outline-none"
                    {...field}
                    disabled={loading}
                  />
                  {fieldState.error && (
                    <p className="text-[10px] font-mono text-red-600 uppercase tracking-wide mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          <div className="space-y-3">
            <FieldLabel>Phone Number</FieldLabel>
            <Controller
              control={control}
              name="contactNumber"
              render={({ field, fieldState }) => (
                <>
                  <input
                    type="tel"
                    placeholder="+233 123 456 789"
                    className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 font-mono text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors outline-none"
                    {...field}
                    disabled={loading}
                  />
                  {fieldState.error && (
                    <p className="text-[10px] font-mono text-red-600 uppercase tracking-wide mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <FieldLabel required>Password</FieldLabel>
              <Controller
                control={control}
                name="password"
                render={({ field, fieldState }) => (
                  <>
                    <input
                      type="password"
                      className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 font-mono text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors outline-none"
                      {...field}
                      disabled={loading}
                    />
                    {fieldState.error && (
                      <p className="text-[10px] font-mono text-red-600 uppercase tracking-wide mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
            <div className="space-y-3">
              <FieldLabel required>Verify Password</FieldLabel>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <>
                    <input
                      type="password"
                      className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 font-mono text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors outline-none"
                      {...field}
                      disabled={loading}
                    />
                    {fieldState.error && (
                      <p className="text-[10px] font-mono text-red-600 uppercase tracking-wide mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
          </div>
        </section>

        {/* ── Profile Section ── */}
        <section className="space-y-6">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 pb-3 border-b border-slate-200">
            03 — Profile
          </p>

          <div className="space-y-3">
            <FieldLabel required>Which best describes you?</FieldLabel>
            <SelectableCardGroup
              control={control}
              name="roleDescription"
              options={ROLE_DESCRIPTION_OPTIONS}
            />
          </div>

          <MultiSelectChips
            control={control}
            name="climateSectors"
            label="Which climate sectors are you interested in?"
            options={REGISTER_CLIMATE_SECTOR_OPTIONS}
            required
          />

          <MultiSelectChips
            control={control}
            name="useCases"
            label="What would you like to use Crevy for?"
            options={USE_CASE_OPTIONS}
            required
          />
        </section>

        {/* ── Engagement Section ── */}
        <section className="space-y-6">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 pb-3 border-b border-slate-200">
            04 — Engagement
          </p>

          <div className="space-y-3">
            <FieldLabel required>Which applies to you?</FieldLabel>
            <SelectableCardGroup
              control={control}
              name="managesProjects"
              options={MANAGES_PROJECTS_OPTIONS}
            />
          </div>

          {isInvestor && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 animate-in fade-in duration-300">
              <div className="space-y-3">
                <FieldLabel required>Organization Name</FieldLabel>
                <Controller
                  control={control}
                  name="organizationName"
                  render={({ field, fieldState }) => (
                    <>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 font-serif text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors outline-none"
                        {...field}
                        disabled={loading}
                      />
                      {fieldState.error && (
                        <p className="text-[10px] font-mono text-red-600 uppercase tracking-wide mt-1">
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
              <div className="space-y-3">
                <FieldLabel required>Job Title</FieldLabel>
                <Controller
                  control={control}
                  name="jobTitle"
                  render={({ field, fieldState }) => (
                    <>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 font-serif text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors outline-none"
                        {...field}
                        disabled={loading}
                      />
                      {fieldState.error && (
                        <p className="text-[10px] font-mono text-red-600 uppercase tracking-wide mt-1">
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
            </div>
          )}
        </section>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand text-slate-900 rounded-none px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4" /> Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-8 max-w-md w-full shadow-2xl">
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-brand border border-slate-900">
                <svg
                  className="w-6 h-6 text-slate-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  role="img"
                  aria-label="Success icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Check Your Email
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We've sent a verification link to{" "}
                  <span className="font-mono font-bold text-slate-900">
                    {registeredEmail}
                  </span>
                  . Please click the link to activate your account.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="w-full bg-brand text-slate-900 rounded-none px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-colors"
                >
                  Go to Login
                </button>
                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-none px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
