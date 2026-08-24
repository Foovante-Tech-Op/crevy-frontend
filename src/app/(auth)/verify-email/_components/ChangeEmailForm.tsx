"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { axiosClient } from "@/lib/axiosClient";
import { getErrorMessage } from "@/lib/errors";

const changeEmailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type TChangeEmail = z.infer<typeof changeEmailSchema>;

export default function ChangeEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentEmail = searchParams.get("email") || "";

  const [loading, setLoading] = useState(false);

  const methods = useForm<TChangeEmail>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      email: currentEmail,
    },
  });

  const { control, handleSubmit, formState } = methods;

  const onSubmit = async (data: TChangeEmail) => {
    setLoading(true);

    try {
      await axiosClient.post("/auth/change-email", {
        email: data.email,
      });

      toast.success("Email updated! Please check your new inbox to verify.");

      // Redirect to verify-email page with new email
      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      }, 1500);
    } catch (err: any) {
      toast.error(
        getErrorMessage(
          err,
          "We couldn't update your email. Please try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 p-8 max-w-md w-full shadow-2xl">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
              Change Email Address
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Update your email address if you made a typo. We'll send a new
              verification link.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              <label
                htmlFor="email"
                className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 block"
              >
                Email Address
              </label>
              <input
                type="email"
                {...control.register("email")}
                className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 font-mono text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors outline-none"
                placeholder="you@example.com"
                disabled={loading}
              />
              {formState.errors.email && (
                <p className="text-[10px] font-mono text-red-600 uppercase tracking-wide mt-1">
                  {formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand text-slate-900 rounded-none px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" /> Updating...
                  </>
                ) : (
                  "Update Email"
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-none px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-100 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
