"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Key, Loader2, User } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import GalleryBackground from "@/components/GalleryBackground";
import { Form } from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { authClient } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";
import { DeveloperClaimService } from "@/lib/services/field-agent-service";

// ── Validation Schema Definition ──
const acceptInviteSchema = z
  .object({
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
    password: z.string().min(8, "Password must be at least 8 characters long."),
    confirmPassword: z
      .string()
      .min(8, "Please confirm your selected password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type TAcceptInviteForm = z.infer<typeof acceptInviteSchema>;

function AcceptInviteTerminal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);

  const form = useForm<TAcceptInviteForm>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  // Verify token exists on mount
  useEffect(() => {
    if (!token) {
      toast.error("Missing invitation token.");
      setVerifying(false);
    } else {
      setVerifying(false);
    }
  }, [token]);

  const onValidSubmit = async (formData: TAcceptInviteForm) => {
    if (!token) return;

    setLoading(true);
    try {
      // 1. Accept the invite and create the account
      const { data: result, error } = await DeveloperClaimService.acceptInvite({
        token,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      if (error || !result?.data) {
        throw new Error(error?.message || "Failed to activate account.");
      }

      // 2. Log the user in automatically
      const { data: signInData, error: signInError } =
        await authClient.signIn.email({
          email: result.data.email,
          password: formData.password,
        });

      if (signInError) {
        // Account created but auto-login failed — redirect to login
        toast.success(
          "Account activated! Please log in with your credentials.",
        );
        router.push("/login");
        return;
      }

      // 3. Redirect to dashboard
      toast.success("Account activated successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("[AcceptInviteTerminal] Error:", error);
      toast.error(
        getErrorMessage(
          error,
          "We couldn't activate your account. Please try again.",
        ),
      );
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

  if (!token) {
    return (
      <div className="w-full max-w-md bg-white p-10 md:p-12 border border-slate-200 rounded-none text-center">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
          Invalid Link
        </h2>
        <p className="text-sm text-slate-500 font-light leading-relaxed mb-8">
          This invitation link is missing a required token parameter. Please
          check your email for the correct link.
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
            Account Activation
          </span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">
          Set Up Your Account<span className="text-brand">.</span>
        </h2>
        <p className="text-slate-400 font-light text-xs leading-relaxed">
          Create your password to activate your project developer account.
        </p>
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
                <Loader2 className="animate-spin h-3.5 w-3.5" /> Activating
                Account...
              </>
            ) : (
              "Activate Account"
            )}
          </button>
        </form>
      </Form>
    </div>
  );
}

export default function AcceptInvitePage() {
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
          <AcceptInviteTerminal />
        </Suspense>
      </div>
    </div>
  );
}
