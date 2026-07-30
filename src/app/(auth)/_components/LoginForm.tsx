"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type * as zod from "zod";
import { authClient } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { signInSchema, type TSignInInput } from "@/types/user.types";

const LoginForm = ({ className, ...props }: React.ComponentProps<"form">) => {
  const [loginType, setLoginType] = useState<"email" | "phone">("email");
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm<zod.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const handleSubmit = async (data: TSignInInput) => {
    setLoading(true);

    const signInMethod = authClient.signIn.email;

    const signInData =
      loginType === "email"
        ? { email: data.identifier, password: data.password }
        : { username: data.identifier, password: data.password };

    await signInMethod({
      ...signInData,
      fetchOptions: {
        onSuccess: async (ctx: any) => {
          toast.success(
            "Login successful. We are redirecting you to your dashboard.",
          );

          // customSession augments the get-session response with
          // isVerified/hasOnboarded/role, but sign-in's own response body
          // isn't guaranteed to carry the same augmented shape across
          // better-auth versions — fall back to an explicit session fetch
          // if isVerified isn't already present here.
          let verifiedStatus = ctx.data?.user?.emailVerified;
          let email = ctx.data?.user?.email;
          let role = (ctx.data?.user as any)?.role;

          console.log(
            "signIn response",
            ctx.data,
            "verifiedStatus",
            verifiedStatus,
          );

          if (verifiedStatus === undefined || role === undefined) {
            const { data: freshSession } = await authClient.getSession();
            verifiedStatus = (freshSession?.user as any)?.emailVerified;
            email = freshSession?.user?.email ?? email;
            role = (freshSession?.user as any)?.role ?? role;
          }

          // NOTE: this uses a hard navigation (window.location.href) rather
          // than router.push(). Safari has a well-known quirk where a
          // Set-Cookie received by one fetch() isn't guaranteed to be visible
          // to an immediately-following fetch() in the same task (here, the
          // getSession() call right above, and/or the RSC fetch a client-side
          // router.push() makes to the destination route) — Chrome commits
          // cookies to the jar synchronously enough that this race never
          // shows up there, which is exactly why this looked fine in Chrome
          // and silently went nowhere in Safari. A hard navigation forces a
          // brand-new top-level document request, which always sees the
          // latest cookie jar, so the destination's server-side session check
          // (getServerSession in (dashboard)/layout.tsx etc.) reliably sees
          // the just-created session regardless of browser.
          //
          // Field agents go straight to their dedicated /agent app rather
          // than /get-started (an admin-dashboard-route-group page) — the
          // (dashboard) layout would bounce them to /agent anyway, but
          // routing there directly avoids the extra hop/flash.
          if (verifiedStatus === false) {
            window.location.href = `/verify-email?email=${encodeURIComponent(email || "")}`;
          } else if (role === "field_agent") {
            window.location.href = "/agent";
          } else {
            window.location.href = "/get-started";
          }

          // No form.reset()/setLoading(false) after this — a hard navigation
          // is about to tear down this component entirely, so updating its
          // state here would either no-op or (worse) log a harmless-but-noisy
          // "setState on unmounted component" warning in some browsers.
        },
        onError: (ctx: any) => {
          toast.error("Protocol Error", {
            description: ctx.error.message || "Invalid credentials.",
          });
          form.setError("root", { message: ctx.error.message });
          setLoading(false);
        },
        // onResponse: () => {
        //   setLoading(false);
        // },
      },
    } as any);
  };

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      {/* ── Institutional Toggle ── */}
      <div className="flex border-b border-slate-200 rounded-none">
        <button
          type="button"
          onClick={() => setLoginType("email")}
          className={cn(
            "flex-1 pb-4 text-[10px] font-mono font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 rounded-none",
            loginType === "email"
              ? "border-b-2 border-slate-900 text-slate-900"
              : "border-b-2 border-transparent text-slate-400 hover:text-slate-700",
          )}
        >
          <Mail size={14} /> Email Login
        </button>
        {/* <button
          type="button"
          onClick={() => setLoginType("phone")}
          className={cn(
            "flex-1 pb-4 text-[10px] font-mono font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 rounded-none",
            loginType === "phone"
              ? "border-b-2 border-slate-900 text-slate-900"
              : "border-b-2 border-transparent text-slate-400 hover:text-slate-700",
          )}
        >
          <Phone size={14} /> Mobile Vector
        </button> */}
      </div>

      {/* ── Form Payload ── */}
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-8"
        {...props}
      >
        {/* Identifier Input */}
        <div className="space-y-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex justify-between select-none">
            {loginType === "email" ? "Email Address" : "Phone Number"}
            {form.formState.errors.identifier && (
              <span className="text-red-600 font-mono tracking-normal normal-case">
                {form.formState.errors.identifier.message}
              </span>
            )}
          </div>
          <input
            {...form.register("identifier")}
            type={loginType === "email" ? "email" : "text"}
            placeholder={
              loginType === "email" ? "operative@institution.com" : "+233 50..."
            }
            disabled={loading}
            className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:border-slate-900 transition-colors disabled:opacity-50 outline-none"
          />
        </div>

        {/* Password Input */}
        <div className="space-y-3">
          <div className="flex justify-between items-baseline select-none">
            <label
              htmlFor="password"
              className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[9px] font-mono text-slate-700 hover:text-foreground transition-colors uppercase tracking-[0.2em]"
            >
              Reset Password?
            </Link>
          </div>
          <input
            {...form.register("password")}
            type="password"
            placeholder="••••••••••••"
            disabled={loading}
            className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:border-slate-900 transition-colors disabled:opacity-50 outline-none"
          />
          {form.formState.errors.password && (
            <p className="text-[10px] font-mono text-red-600 uppercase tracking-wide mt-2">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-brand text-foreground cursor-pointer rounded-none px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-foreground hover:text-brand transition-colors disabled:opacity-70 flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Authenticating...
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
