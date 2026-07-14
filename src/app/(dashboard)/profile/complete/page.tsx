"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { authClient } from "@/lib/auth";
import { axiosClient } from "@/lib/axiosClient";

const completeProfileSchema = z
  .object({
    // Bank Details
    bankName: z.string().optional().or(z.literal("")),
    accountNumber: z.string().optional().or(z.literal("")),
    accountName: z.string().optional().or(z.literal("")),

    // Mobile Money Details
    momoNetwork: z.string().optional().or(z.literal("")),
    momoNumber: z.string().optional().or(z.literal("")),
    momoAccountName: z.string().optional().or(z.literal("")),

    // Farm Plot Details
    farmPlotRegion: z.string().min(1, "Region is required"),
    farmPlotVillage: z.string().optional().or(z.literal("")),
    farmPlotAreaHectares: z
      .string()
      .transform((val) => parseFloat(val))
      .pipe(z.number().min(0.1, "Area must be at least 0.1 hectares")),
    farmPlotCentroidLat: z
      .string()
      .transform((val) => parseFloat(val))
      .pipe(z.number().min(-90).max(90)),
    farmPlotCentroidLng: z
      .string()
      .transform((val) => parseFloat(val))
      .pipe(z.number().min(-180).max(180)),
  })
  .refine(
    (data) => {
      // At least one payment method required
      const hasBank = data.bankName && data.accountNumber;
      const hasMomo = data.momoNetwork && data.momoNumber;
      return hasBank || hasMomo;
    },
    {
      message:
        "Please provide at least one payment method (bank or mobile money)",
      path: ["bankName"],
    },
  );

type TCompleteProfile = z.infer<typeof completeProfileSchema>;

const defaultValues: TCompleteProfile = {
  bankName: "",
  accountNumber: "",
  accountName: "",
  momoNetwork: "",
  momoNumber: "",
  momoAccountName: "",
  farmPlotRegion: "",
  farmPlotVillage: "",
  farmPlotAreaHectares: 0,
  farmPlotCentroidLat: 0,
  farmPlotCentroidLng: 0,
};

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingProfile, setExistingProfile] =
    useState<TCompleteProfile | null>(null);

  const methods = useForm<TCompleteProfile>({
    resolver: zodResolver(completeProfileSchema) as any,
    defaultValues,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const session = await authClient.getSession();
        const userId = session?.data?.user?.id;

        if (!userId) {
          router.push("/login");
          return;
        }

        // Try to fetch existing profile
        const response = await axiosClient.get(`/project-owners/${userId}`);
        if (response.data?.success && response.data?.data) {
          const data = response.data.data;
          const profileData: TCompleteProfile = {
            bankName: data.bankDetails?.bankName || "",
            accountNumber: data.bankDetails?.accountNumber || "",
            accountName: data.bankDetails?.accountName || "",
            momoNetwork: data.momoDetails?.network || "",
            momoNumber: data.momoDetails?.number || "",
            momoAccountName: data.momoDetails?.accountName || "",
            farmPlotRegion: data.farmPlot?.region || "",
            farmPlotVillage: data.farmPlot?.village || "",
            farmPlotAreaHectares: data.farmPlot?.areaHectares || 0,
            farmPlotCentroidLat: data.farmPlot?.centroid?.lat || 0,
            farmPlotCentroidLng: data.farmPlot?.centroid?.lng || 0,
          };
          setExistingProfile(profileData);
          reset(profileData);
        }
      } catch (error) {
        // No existing profile, that's fine
        console.log("No existing profile found");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router, reset]);

  const onSubmit = async (data: TCompleteProfile) => {
    setIsSubmitting(true);

    try {
      const payload = {
        // Bank details
        bankDetails:
          data.bankName && data.accountNumber
            ? {
                bankName: data.bankName,
                accountNumber: data.accountNumber,
                accountName: data.accountName || undefined,
              }
            : null,

        // Mobile money details
        momoDetails:
          data.momoNetwork && data.momoNumber
            ? {
                network: data.momoNetwork,
                number: data.momoNumber,
                accountName: data.momoAccountName || undefined,
              }
            : null,

        // Farm plot details
        farmPlot: {
          region: data.farmPlotRegion,
          village: data.farmPlotVillage || undefined,
          areaHectares: data.farmPlotAreaHectares,
          centroid: {
            lat: data.farmPlotCentroidLat,
            lng: data.farmPlotCentroidLng,
          },
        },
      };

      await axiosClient.post("/project-developers/complete-profile", payload);

      toast.success(
        existingProfile
          ? "Profile updated successfully!"
          : "Profile completed! You can now access all features.",
      );

      // Redirect to dashboard after success
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to save profile. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none mb-3">
            Complete Your Profile
          </h1>
          <p className="text-sm text-slate-500 font-light leading-relaxed">
            {existingProfile
              ? "Update your payment and farm plot information."
              : "Add your payment details and farm plot information to start managing carbon projects."}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Payment Details Section */}
          <section className="bg-white border border-slate-200 p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                Payment Details
              </h2>
              <p className="text-xs text-slate-500">
                Provide at least one payment method for receiving payments from
                carbon credit sales.
              </p>
            </div>

            {/* Bank Details */}
            <div className="space-y-4">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
                Bank Account (Optional)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label
                    htmlFor="bankName"
                    className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 block"
                  >
                    Bank Name
                  </label>
                  <Controller
                    control={control}
                    name="bankName"
                    render={({ field }) => (
                      <input
                        type="text"
                        {...field}
                        className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 font-serif text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors outline-none"
                        placeholder="e.g. GCB Bank"
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </div>
                <div className="space-y-3">
                  <label
                    htmlFor="accountNumber"
                    className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 block"
                  >
                    Account Number
                  </label>
                  <Controller
                    control={control}
                    name="accountNumber"
                    render={({ field }) => (
                      <input
                        type="text"
                        {...field}
                        className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 font-mono text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors outline-none"
                        placeholder="Account number"
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label
                  htmlFor="accountName"
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 block"
                >
                  Account Name (Optional)
                </label>
                <Controller
                  control={control}
                  name="accountName"
                  render={({ field }) => (
                    <input
                      type="text"
                      {...field}
                      className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 font-serif text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors outline-none"
                      placeholder="Name on account"
                      disabled={isSubmitting}
                    />
                  )}
                />
              </div>
            </div>

            {/* Mobile Money Details */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
                Mobile Money (Optional)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label
                    htmlFor="momoNetwork"
                    className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 block"
                  >
                    Network
                  </label>
                  <Controller
                    control={control}
                    name="momoNetwork"
                    render={({ field }) => (
                      <input
                        type="text"
                        {...field}
                        className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 font-serif text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors outline-none"
                        placeholder="e.g. M-Pesa, MTN"
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </div>
                <div className="space-y-3">
                  <label
                    htmlFor="momoNumber"
                    className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 block"
                  >
                    Phone Number
                  </label>
                  <Controller
                    control={control}
                    name="momoNumber"
                    render={({ field }) => (
                      <input
                        type="tel"
                        {...field}
                        className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 font-mono text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors outline-none"
                        placeholder="+233 123 456 789"
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label
                  htmlFor="momoAccountName"
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 block"
                >
                  Account Name (Optional)
                </label>
                <Controller
                  control={control}
                  name="momoAccountName"
                  render={({ field }) => (
                    <input
                      type="text"
                      {...field}
                      className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 font-serif text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors outline-none"
                      placeholder="Name on mobile money account"
                      disabled={isSubmitting}
                    />
                  )}
                />
              </div>
            </div>

            {errors.bankName && (
              <p className="text-[10px] font-mono text-red-600 uppercase tracking-wide">
                {errors.bankName.message}
              </p>
            )}
          </section>

          {/* Farm Plot Section */}
          <section className="bg-white border border-slate-200 p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                Farm Plot / Project Site
              </h2>
              <p className="text-xs text-slate-500">
                Provide location details for your carbon projects.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label
                  htmlFor="farmPlotRegion"
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 block"
                >
                  Region <span className="text-slate-900">*</span>
                </label>
                <Controller
                  control={control}
                  name="farmPlotRegion"
                  render={({ field }) => (
                    <input
                      type="text"
                      {...field}
                      className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 font-serif text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors outline-none"
                      placeholder="e.g. Ashanti Region"
                      disabled={isSubmitting}
                    />
                  )}
                />
                {errors.farmPlotRegion && (
                  <p className="text-[10px] font-mono text-red-600 uppercase tracking-wide">
                    {errors.farmPlotRegion.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="farmPlotVillage"
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 block"
                >
                  Village / Town (Optional)
                </label>
                <Controller
                  control={control}
                  name="farmPlotVillage"
                  render={({ field }) => (
                    <input
                      type="text"
                      {...field}
                      className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 font-serif text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors outline-none"
                      placeholder="e.g. Kumasi"
                      disabled={isSubmitting}
                    />
                  )}
                />
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="farmPlotAreaHectares"
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 block"
                >
                  Area (Hectares) <span className="text-slate-900">*</span>
                </label>
                <Controller
                  control={control}
                  name="farmPlotAreaHectares"
                  render={({ field }) => (
                    <input
                      type="number"
                      step="0.1"
                      {...field}
                      className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 font-mono text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors outline-none"
                      placeholder="e.g. 25.5"
                      disabled={isSubmitting}
                    />
                  )}
                />
                {errors.farmPlotAreaHectares && (
                  <p className="text-[10px] font-mono text-red-600 uppercase tracking-wide">
                    {errors.farmPlotAreaHectares.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label
                    htmlFor="farmPlotCentroidLat"
                    className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 block"
                  >
                    Latitude <span className="text-slate-900">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="farmPlotCentroidLat"
                    render={({ field }) => (
                      <input
                        type="number"
                        step="0.0001"
                        {...field}
                        className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 font-mono text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors outline-none"
                        placeholder="e.g. 6.6947"
                        disabled={isSubmitting}
                      />
                    )}
                  />
                  {errors.farmPlotCentroidLat && (
                    <p className="text-[10px] font-mono text-red-600 uppercase tracking-wide">
                      {errors.farmPlotCentroidLat.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <label
                    htmlFor="farmPlotCentroidLng"
                    className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 block"
                  >
                    Longitude <span className="text-slate-900">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="farmPlotCentroidLng"
                    render={({ field }) => (
                      <input
                        type="number"
                        step="0.0001"
                        {...field}
                        className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 font-mono text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors outline-none"
                        placeholder="e.g. -1.6252"
                        disabled={isSubmitting}
                      />
                    )}
                  />
                  {errors.farmPlotCentroidLng && (
                    <p className="text-[10px] font-mono text-red-600 uppercase tracking-wide">
                      {errors.farmPlotCentroidLng.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand text-slate-900 rounded-none px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                {existingProfile ? "Updating..." : "Completing Profile..."}
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                {existingProfile ? "Update Profile" : "Complete Profile"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
