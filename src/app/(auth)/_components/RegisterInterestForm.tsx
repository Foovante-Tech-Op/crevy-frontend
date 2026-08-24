"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { CountryDropdown } from "@/components/ui/country-dropdown";
import {
  CLIMATE_SECTOR_OPTIONS,
  INVESTMENT_BUDGET_OPTIONS,
  MANAGES_PROJECTS_OPTIONS,
  PRIMARY_INTEREST_OPTIONS,
  PROJECT_COUNT_OPTIONS,
  ROLE_DESCRIPTION_OPTIONS,
  type TWaitlistRegistration,
  USE_CASE_OPTIONS,
  waitlistRegistrationDefaultValues,
  waitlistRegistrationSchema,
} from "@/constants/waitlist";
import { useCreateWaitlistRegistration } from "@/hooks/use-waitlist";
import { getErrorMessage, getFieldErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import {
  FieldLabel,
  MultiSelectChips,
  SelectableCardGroup,
  SingleSelectField,
  TextField,
} from "./form-fields";

// ─── Main Form Component ──────────────────────────────────────────────────────

export default function RegisterInterestForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectorParam = searchParams.get("sector");
  const { mutateAsync, isPending } = useCreateWaitlistRegistration();

  const methods = useForm<TWaitlistRegistration>({
    resolver: zodResolver(waitlistRegistrationSchema) as any,
    defaultValues: waitlistRegistrationDefaultValues,
    mode: "onTouched",
  });

  const { control, handleSubmit, setValue } = methods;
  const managesProjects = useWatch({ control, name: "managesProjects" });
  const isManager = managesProjects === "I manage climate projects";
  const isInvestor = managesProjects === "I invest in climate projects";

  // Pre-select the climate sector the person clicked through on
  // (ProjectTypesSection passes ?sector=<CLIMATE_SECTOR_OPTIONS value>).
  // Only set once on mount so it doesn't fight the user's own edits.
  useEffect(() => {
    if (
      sectorParam &&
      (CLIMATE_SECTOR_OPTIONS as readonly string[]).includes(sectorParam)
    ) {
      setValue("climateSectors", [sectorParam], { shouldValidate: false });
    }
  }, [setValue, sectorParam]);

  const onSubmit = async (data: TWaitlistRegistration) => {
    try {
      await mutateAsync(data);
      toast.success(
        "You're on the waitlist. A member of our team will reach out soon.",
      );
      router.push("/register-interest/success");
    } catch (err: any) {
      toast.error(
        getErrorMessage(err, "Something went wrong. Please try again."),
      );
    }
  };

  const onInvalid = (errors: any) => {
    const entries = Object.entries(errors);
    if (entries.length > 0) {
      // entries is Array<[field, error]>; the first element is the pair,
      // not the field name. Destructuring one level too shallow made the
      // old toast read "email,[object Object]: undefined".
      const [[field, error]] = entries;
      toast.error(getFieldErrorMessage(field, (error as any)?.message));
    }
  };

  return (
    <div
      className={cn(
        "w-full max-w-4xl bg-background border border-slate-200 rounded-none shadow-2xl transition-all max-h-[95vh] flex flex-col overflow-hidden",
        className,
      )}
      {...props}
    >
      <div
        className="overflow-y-auto p-6 sm:p-10 md:p-16 custom-scrollbar"
        data-lenis-prevent="true"
      >
        <div className="mb-12">
          {/* <div className="inline-flex items-center gap-2 mb-4 text-slate-900">
            <Sprout className="w-4 h-4 text-slate-900" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
              Crevy Early Access
            </span>
          </div> */}
          <h1 className="font-sans font-bold text-4xl md:text-5xl text-slate-900 tracking-tight leading-none mb-4">
            Register Your <span className="italic text-brand">Interest.</span>
          </h1>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-2xl">
            Tell us about yourself and how you'd like to engage with the carbon
            markets. A member of our team will personally follow up to discuss
            next steps.
          </p>
        </div>

        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            noValidate
            className="space-y-14"
          >
            {/* ── Identity ── */}
            <section className="space-y-6">
              <p className="font-mono text-sm uppercase tracking-[0.2em] text-slate-900 pb-3 border-b border-slate-200 underline underline-offset-6">
                01 — Identity
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <TextField
                  control={control}
                  name="firstName"
                  label="First Name"
                  required
                />
                <TextField
                  control={control}
                  name="lastName"
                  label="Last Name"
                  required
                />
              </div>
              <TextField
                control={control}
                name="middleName"
                label="Middle Name (Optional)"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <TextField
                  control={control}
                  name="email"
                  label="Email Address"
                  type="email"
                  required
                />
                <TextField
                  control={control}
                  name="phoneNumber"
                  label="Phone Number (Optional)"
                  type="tel"
                />
              </div>
            </section>

            {/* ── Organization ── */}
            <section className="space-y-6">
              <p className="font-mono text-sm uppercase tracking-[0.2em] text-slate-900 pb-3 border-b border-slate-200 underline underline-offset-6">
                02 — Organization
              </p>
              <TextField
                control={control}
                name="organizationName"
                label="Organization Name"
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <TextField
                  control={control}
                  name="jobTitle"
                  label="Job Title"
                  required
                />
                <div data-lenis-prevent="true">
                  <CountryDropdown
                    control={control}
                    name="country"
                    label="Country*"
                    placeholder="Select country"
                  />
                </div>
              </div>
            </section>

            {/* ── Profile ── */}
            <section className="space-y-6">
              <p className="font-mono text-sm uppercase tracking-[0.2em] text-slate-900 pb-3 border-b border-slate-200 underline underline-offset-6">
                03 — Profile
              </p>
              <SingleSelectField
                control={control}
                name="roleDescription"
                label="Which best describes you?"
                options={ROLE_DESCRIPTION_OPTIONS}
                required
              />
              <MultiSelectChips
                control={control}
                name="climateSectors"
                label="Which climate sectors are you interested in?"
                options={CLIMATE_SECTOR_OPTIONS}
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

            {/* ── Engagement (conditional) ── */}
            <section className="space-y-6">
              <p className="font-mono text-sm uppercase tracking-[0.2em] text-slate-900 pb-3 border-b border-slate-200 underline underline-offset-6">
                04 — Engagement
              </p>
              <div className="space-y-3">
                <FieldLabel required>Which applies to you?</FieldLabel>
                <SelectableCardGroup
                  control={control}
                  name="managesProjects"
                  options={MANAGES_PROJECTS_OPTIONS}
                  required
                />
              </div>

              {isManager && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 animate-in fade-in duration-300">
                  <SingleSelectField
                    control={control}
                    name="projectCount"
                    label="How many projects do you manage?"
                    options={PROJECT_COUNT_OPTIONS}
                    required
                  />
                  <TextField
                    control={control}
                    name="hectaresManaged"
                    label="Total Hectares Managed (Optional)"
                    placeholder="e.g. 250"
                  />
                </div>
              )}

              {isInvestor && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 animate-in fade-in duration-300">
                  <SingleSelectField
                    control={control}
                    name="primaryInterest"
                    label="Primary Interest"
                    options={PRIMARY_INTEREST_OPTIONS}
                    required
                  />
                  <SingleSelectField
                    control={control}
                    name="investmentBudget"
                    label="Investment Budget"
                    options={INVESTMENT_BUDGET_OPTIONS}
                    required
                  />
                </div>
              )}
            </section>

            {/* ── Feedback ── */}
            <section className="space-y-6">
              <p className="font-mono text-sm uppercase tracking-[0.2em] text-slate-900 pb-3 border-b border-slate-200 underline underline-offset-6">
                05 — Feedback
              </p>
              <TextField
                control={control}
                name="biggestChallenge"
                label="What's your biggest challenge in this space today?"
                required
              />
              <TextField
                control={control}
                name="platformValueExpectation"
                label="What would you want a platform like Crevy to do for you?"
                required
              />
            </section>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-brand text-slate-900 rounded-none px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" /> Submitting...
                </>
              ) : (
                "Join the Waitlist"
              )}
            </button>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
