"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Key, Loader2, Phone, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import GalleryBackground from "@/components/GalleryBackground";
import { CountryDropdown } from "@/components/ui/country-dropdown";
import { Form } from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { axiosClient } from "@/lib/axiosClient";
import { getErrorMessage } from "@/lib/errors";

// ── Validation Schema Definition ──
const adminSetupSchema = z
  .object({
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
    contactNumber: z.string().optional(),
    country: z.string().min(1, "Country selection is required."),
    password: z.string().min(8, "Password must be at least 8 characters long."),
    confirmPassword: z
      .string()
      .min(8, "Please confirm your selected password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Security credential keys do not match.",
    path: ["confirmPassword"],
  });

type TAdminSetupForm = z.infer<typeof adminSetupSchema>;

/**
 * F2 — Invitation acceptance page.
 *
 * Owns the form (first/last name, country, password) and calls the
 * server-side /auth/register/invite endpoint to create the user. Crucially,
 * this page does NOT call authClient.signUp.email() directly — that would
 * create the better-auth user in the browser and immediately set a session
 * cookie, which would auto-log the user in before they ever see /login. We
 * send the entire payload (token + name + password) to the backend, which
 * creates the user via auth.api.signUpEmail (no Set-Cookie forwarded), and
 * on success we redirect to /login so the user can sign in normally.
 *
 * The phone number (if any) is pre-filled from the verify-token response —
 * invitation.verifyToken() now returns the invite's `phone` column (the
 * backend was updated to include it; the previous version only returned
 * the email/role, so this field used to always be blank).
 */
function AdminSetupTerminal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [assignedEmail, setAssignedEmail] = useState<string | null>(null);
  const [assignedRole, setAssignedRole] = useState<{
    name: string;
    id: string;
  } | null>(null);
  const [prefilledPhone, setPrefilledPhone] = useState<string>("");

  const form = useForm<TAdminSetupForm>({
    resolver: zodResolver(adminSetupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      contactNumber: "",
      country: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = form;

  // Verify invitation parameters prior to rendering profile options.
  // NOTE: contactNumber is pre-filled from the verify response when the
  // invitation captured a phone (e.g. field-agent invites); org-admin /
  // project-admin invites may not have one and the field stays empty.
  useEffect(() => {
    if (!token) {
      toast.error("Missing invitation token.");
      setVerifying(false);
      return;
    }

    axiosClient
      .get(`/auth/invite/verify/${token}`)
      .then((res) => {
        const data = res.data?.data;
        if (!data) {
          throw new Error("Invalid invite payload");
        }
        setAssignedEmail(data.email ?? null);
        setAssignedRole(data.role ?? null);

        // Pre-fill phone if the invite carried one — `phone` is on the
        // invitation row and is now returned by verifyToken.
        if (data.phone) {
          setPrefilledPhone(data.phone);
          setValue("contactNumber", data.phone);
        }
      })
      .catch(() => toast.error("Invalid or expired invitation link."))
      .finally(() => setVerifying(false));
  }, [token, setValue]);

  const onValidSubmit = async (formData: TAdminSetupForm) => {
    if (!assignedEmail || !token) return;

    setLoading(true);
    try {
      // Single server-side call: backend creates the better-auth user,
      // assigns the role/org membership, sets emailVerified, and (if this
      // is a field-agent invite) sets assignedBy. NO Set-Cookie is forwarded
      // to the browser, so the user is NOT auto-logged-in. They are sent
      // to /login to sign in normally — same contract as the public
      // /register flow.
      await axiosClient.post("/auth/register/invite", {
        token,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        contactNumber: formData.contactNumber || undefined,
        countryOfOperation: formData.country || undefined,
      });

      toast.success("Account setup complete. Please sign in to continue.");
      router.push("/login");
    } catch (error: any) {
      console.error("[AdminSetupTerminal] Error:", error);
      const message = getErrorMessage(
        error,
        "An unexpected error occurred during account creation.",
      );
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="w-full max-w-md bg-white p-12 border border-slate-200 rounded-none text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-none animate-spin" />
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 font-bold">
          Verifying Invitation Link...
        </p>
      </div>
    );
  }

  if (!assignedEmail) {
    return (
      <div className="w-full max-w-md bg-white p-10 md:p-12 border border-slate-200 rounded-none text-center">
        <div className="w-12 h-12 bg-slate-950 border border-slate-900 rounded-none flex items-center justify-center mx-auto mb-6 text-brand">
          <ShieldCheck size={20} strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
          Access Denied
        </h2>
        <p className="text-sm text-slate-500 font-light leading-relaxed mb-8">
          This invitation link is invalid, broken, or has already expired.
          Please reach out to your system administrator for a new invite.
        </p>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="inline-flex w-full bg-brand text-slate-900 rounded-none px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-colors items-center justify-center"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-white border border-background rounded-none overflow-hidden shadow-none my-12 relative">
      {/* Branding Segment */}
      <div className="bg-foreground p-8 md:p-10 border-b border-background text-white">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-2 h-2 bg-brand rounded-none" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400">
            Account Registration
          </span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">
          Complete Setup<span className="text-brand">.</span>
        </h2>
        <p className="text-slate-400 font-light text-xs leading-relaxed">
          Set up your profile details and security credentials to initialize
          access into your dashboard workspace.
        </p>
      </div>

      {/* Target Clearance Identity Context */}
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 bg-slate-50 border-b border-slate-200">
        {/* Email Address Block */}
        <div className="px-8 py-4 md:px-10 flex flex-col justify-center gap-1">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">
            Assigned Email
          </span>
          <span className="font-mono text-xs font-bold text-slate-900 break-all">
            {assignedEmail}
          </span>
        </div>

        {/* System Authorization Role Block */}
        <div className="px-8 py-4 md:px-10 flex flex-col justify-center gap-1">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">
            Assigned Workspace Role
          </span>
          <span className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wide">
            {assignedRole
              ? assignedRole.name.replace("_", " ")
              : "Platform User"}
          </span>
        </div>
      </div>

      {/* Form Context Engine Wrapper */}
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onValidSubmit)}
          className="p-8 md:p-10 space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* First Name Input */}
            <div className="space-y-2">
              <label
                htmlFor="firstName"
                className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block"
              >
                First Name
              </label>
              <div className="relative border-b border-slate-200 focus-within:border-slate-900 transition-colors">
                <User className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-900" />
                <input
                  id="firstName"
                  type="text"
                  disabled={loading}
                  className="w-full pl-6 pr-2 py-3 bg-transparent border-none outline-none font-sans text-sm text-slate-900 placeholder:text-slate-300 disabled:opacity-50"
                  placeholder="John"
                  {...register("firstName")}
                />
              </div>
              {errors.firstName && (
                <p className="text-[10px] font-mono text-red-500 tracking-tight">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name Input */}
            <div className="space-y-2">
              <label
                htmlFor="lastName"
                className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block"
              >
                Last Name
              </label>
              <div className="relative border-b border-slate-200 focus-within:border-slate-900 transition-colors">
                <User className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-900" />
                <input
                  id="lastName"
                  type="text"
                  disabled={loading}
                  className="w-full pl-6 pr-2 py-3 bg-transparent border-none outline-none font-sans text-sm text-slate-900 placeholder:text-slate-300 disabled:opacity-50"
                  placeholder="Doe"
                  {...register("lastName")}
                />
              </div>
              {errors.lastName && (
                <p className="text-[10px] font-mono text-red-500 tracking-tight">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Contact Number Input — pre-filled from the invite when present */}
            <div className="space-y-2">
              <label
                htmlFor="contactNumber"
                className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block"
              >
                Contact Number
                {prefilledPhone && (
                  <span className="ml-2 normal-case tracking-normal text-slate-300">
                    (pre-filled from invite)
                  </span>
                )}
              </label>
              <div className="relative border-b border-slate-200 focus-within:border-slate-900 transition-colors">
                <Phone className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-900" />
                <input
                  id="contactNumber"
                  type="tel"
                  disabled={loading}
                  className="w-full pl-6 pr-2 py-3 bg-transparent border-none outline-none font-mono text-sm text-slate-900 placeholder:text-slate-300 disabled:opacity-50"
                  placeholder="+1 (555) 000-0000"
                  {...register("contactNumber")}
                />
              </div>
              {errors.contactNumber && (
                <p className="text-[10px] font-mono text-red-500 tracking-tight">
                  {errors.contactNumber.message}
                </p>
              )}
            </div>

            {/* Country Selection */}
            <div data-lenis-prevent="true" className="space-y-2">
              <CountryDropdown
                control={control}
                name="country"
                label="Country*"
                placeholder="Select country"
                disabled={loading}
              />
              {errors.country && (
                <p className="text-[10px] font-mono text-red-500 tracking-tight">
                  {errors.country.message}
                </p>
              )}
            </div>
          </div>

          {/* Password Matrix Field */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block"
            >
              Password
            </label>
            <div className="relative border-b border-slate-200 focus-within:border-slate-900 transition-colors">
              <Key className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-900" />
              <PasswordInput
                id="password"
                disabled={loading}
                className="w-full pl-6 pr-2 py-3 bg-transparent border-none outline-none font-mono text-sm text-slate-900 placeholder:text-slate-300 disabled:opacity-50"
                placeholder="••••••••••••"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-[10px] font-mono text-red-500 tracking-tight">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Verification Password Matrix Field */}
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block"
            >
              Confirm Password
            </label>
            <div className="relative border-b border-slate-200 focus-within:border-slate-900 transition-colors">
              <Key className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-900" />
              <PasswordInput
                id="confirmPassword"
                disabled={loading}
                className="w-full pl-6 pr-2 py-3 bg-transparent border-none outline-none font-mono text-sm text-slate-900 placeholder:text-slate-300 disabled:opacity-50"
                placeholder="••••••••••••"
                {...register("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-[10px] font-mono text-red-500 tracking-tight">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-brand text-slate-900 font-bold uppercase tracking-[0.2em] text-[10px] py-5 rounded-none hover:bg-slate-900 hover:text-white transition-colors flex items-center justify-center gap-2 mt-8 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-3.5 w-3.5" /> Completing
                Setup...
              </>
            ) : (
              "Complete Account Setup"
            )}
          </button>
        </form>
      </Form>
    </div>
  );
}

export default function AdminSetupPage() {
  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden font-sans selection:bg-brand selection:text-slate-900 flex items-center justify-center">
      {/* Background Paradigm Layout Matrix */}
      <GalleryBackground parallax={false} dim={true} />

      {/* Cinematic dark overlay blend layer */}
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs pointer-events-none z-0" />

      {/* Fixed Top Left Structural Logo */}
      <div className="fixed top-6 left-6 sm:top-8 sm:left-10 z-30">
        <Link
          href="/"
          className="font-bold text-3xl tracking-tight text-white hover:text-brand transition-colors"
        >
          Crevy<span className="text-brand">.</span>
        </Link>
      </div>

      {/* Execution View Context Wrapper */}
      <div className="relative z-10 flex items-center justify-center w-full h-full px-4 sm:px-6 lg:px-8 py-12">
        <Suspense
          fallback={
            <div className="w-full max-w-md bg-white p-12 border border-slate-200 rounded-none text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-none animate-spin" />
            </div>
          }
        >
          <AdminSetupTerminal />
        </Suspense>
      </div>
    </div>
  );
}
