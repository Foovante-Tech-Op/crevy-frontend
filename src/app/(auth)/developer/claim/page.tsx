"use client";

// Member-level claim page — redeems a short numeric code (sent by email +
// SMS, 14-day validity) rather than a long URL token. Distinct from
// (auth)/developer/accept-invite, which handles the older individual-
// developer long-token flow. The code is typed in manually (this is
// designed to be read off an SMS, not necessarily clicked from a link),
// though a `?code=` query param pre-fills it as a convenience if the email
// version of the link is used instead.

import { zodResolver } from "@hookform/resolvers/zod";
import { Hash, Key, Loader2, User } from "lucide-react";
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
import { MemberClaimService } from "@/lib/services/field-agent-service";

const claimSchema = z
  .object({
    code: z.string().min(4, "Enter the code you were sent"),
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

type TClaimForm = z.infer<typeof claimSchema>;

function ClaimTerminal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get("code") || "";

  const [loading, setLoading] = useState(false);

  const form = useForm<TClaimForm>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      code: codeFromUrl,
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

  useEffect(() => {
    if (codeFromUrl) form.setValue("code", codeFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeFromUrl, form.setValue]);

  const onValidSubmit = async (formData: TClaimForm) => {
    setLoading(true);
    try {
      const result = await MemberClaimService.claimAccount({
        code: formData.code.trim(),
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      const email = result?.data?.email;
      if (!email) {
        throw new Error("Failed to activate account.");
      }

      const { error: signInError } = await authClient.signIn.email({
        email,
        password: formData.password,
      });

      if (signInError) {
        toast.success(
          "Account activated! Please log in with your credentials.",
        );
        router.push("/login");
        return;
      }

      toast.success("Account activated successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("[ClaimTerminal] Error:", error);
      toast.error(
        getErrorMessage(
          error,
          "That code didn't work — check it and try again, or ask the agent who registered you for a new one.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white border border-background rounded-none overflow-hidden shadow-none my-12 relative">
      {/* Branding Segment */}
      <div className="bg-foreground p-8 md:p-10 border-b border-background text-white">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-2 h-2 bg-brand rounded-none" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400">
            Account Setup
          </span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">
          Enter Your Code<span className="text-brand">.</span>
        </h2>
        <p className="text-slate-400 font-light text-xs leading-relaxed">
          A field agent registered you with Crevy and sent you a setup code by
          email and SMS. Enter it below to create your password.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={handleSubmit(onValidSubmit)}
          className="p-8 md:p-10 space-y-6"
        >
          <div className="space-y-2">
            <label
              htmlFor="code"
              className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block"
            >
              Setup Code
            </label>
            <div className="relative border-b border-slate-200 focus-within:border-slate-900 transition-colors">
              <Hash className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-900" />
              <input
                id="code"
                type="text"
                inputMode="numeric"
                disabled={loading}
                className="w-full pl-6 pr-2 py-3 bg-transparent border-none outline-none font-mono text-2xl tracking-[0.3em] text-slate-900 placeholder:text-slate-300 disabled:opacity-50"
                placeholder="000000"
                {...register("code")}
              />
            </div>
            {errors.code && (
              <p className="text-[10px] font-mono text-red-500 tracking-tight">
                {errors.code.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

          <p className="text-[10px] font-mono text-slate-400 text-center pt-2">
            Didn't get a code, or has it expired? Ask the agent who registered
            you to add you again.
          </p>
        </form>
      </Form>
    </div>
  );
}

export default function ClaimPage() {
  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden font-sans selection:bg-brand selection:text-slate-900 flex items-center justify-center">
      <GalleryBackground parallax={false} dim={true} />
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs pointer-events-none z-0" />

      <div className="fixed top-6 left-6 sm:top-8 sm:left-10 z-30">
        <Link
          href="/"
          className="font-bold text-3xl tracking-tight text-white hover:text-brand transition-colors"
        >
          Crevy<span className="text-brand">.</span>
        </Link>
      </div>

      <div className="relative z-10 flex items-center justify-center w-full h-full px-4 sm:px-6 lg:px-8 py-12">
        <Suspense
          fallback={
            <div className="w-full max-w-md bg-white p-12 border border-slate-200 rounded-none text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-none animate-spin" />
            </div>
          }
        >
          <ClaimTerminal />
        </Suspense>
      </div>
    </div>
  );
}
