"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  CreditCard,
  Loader2,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/errors";
import { CreditService } from "@/lib/services/credit-service";
import { ProjectService } from "@/lib/services/project-service";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId");

  const [step, setStep] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Fetch Project Details for Checkout Context
  const { data: projectRes, isLoading } = useQuery({
    queryKey: ["project-checkout", projectId],
    queryFn: () =>
      projectId
        ? ProjectService.getProjectMarketplaceDetail(projectId)
        : Promise.reject("No Project ID"),
    enabled: !!projectId,
  });

  const project = projectRes?.data;
  const pricePerCredit = parseFloat(project?.pricePerCredit || "52.00");
  const totalAmount = quantity * pricePerCredit;

  const handlePurchase = async () => {
    if (!projectId) return;
    setIsProcessing(true);
    try {
      const creditsRes = await CreditService.getCarbonCredits({
        projectId: projectId,
        creditStatus: "available",
        limit: 1,
      });
      const availableCredit = creditsRes.data[0];

      if (!availableCredit)
        throw new Error("No available credits found for this project.");

      await CreditService.purchaseCredits(availableCredit.id, {
        quantity,
        pricePerCredit,
        currencyId: project?.currencyId || 1,
        notes: `Marketplace purchase — ${project?.name}`,
      });

      router.push(
        `/marketplace/success?projectId=${projectId}&amount=${totalAmount}&qty=${quantity}`,
      );
    } catch (err: any) {
      toast.error(
        getErrorMessage(
          err,
          "We couldn't complete your purchase. You haven't been charged.",
        ),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!projectId)
    return (
      <div className="p-20 text-center uppercase font-black tracking-widest text-slate-400">
        Invalid Project Context
      </div>
    );
  if (isLoading)
    return (
      <div className="p-20 text-center animate-pulse uppercase font-black tracking-widest text-emerald-600">
        Initializing Secure Checkout...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto py-32 px-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-10 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Project
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
        <div className="lg:col-span-3 space-y-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
                  Credit Volume
                </h1>
                <div className="bg-white border border-slate-200 rounded-[2rem] p-10 shadow-sm space-y-6">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      tCO2e Quantity
                    </Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(1, parseInt(e.target.value, 10) || 0),
                          )
                        }
                        className="h-16 text-3xl font-black rounded-2xl border-2 border-slate-100 focus:border-emerald-500 transition-all"
                      />
                      <span className="text-sm font-black text-slate-400 uppercase tracking-widest">
                        Units
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setStep(2)}
                    className="w-full h-16 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs"
                  >
                    Continue to Payment{" "}
                    <ChevronRight size={16} className="ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
                  Payment
                </h1>
                <div className="space-y-4">
                  {[
                    {
                      id: "card",
                      name: "Corporate Credit Card",
                      icon: CreditCard,
                    },
                    { id: "wire", name: "Bank Wire Transfer", icon: Wallet },
                  ].map((method) => (
                    <button
                      type="button"
                      key={method.id}
                      className="w-full bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between group hover:border-emerald-50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600">
                          <method.icon size={24} />
                        </div>
                        <span className="font-black text-slate-900 uppercase text-[11px] tracking-widest">
                          {method.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <Button
                  onClick={handlePurchase}
                  disabled={isProcessing}
                  className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl"
                >
                  {isProcessing
                    ? "Finalizing..."
                    : `Pay $${totalAmount.toLocaleString()}`}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck size={80} className="text-emerald-400" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-8">
              Summary
            </h3>
            <div className="space-y-6">
              <p className="font-black text-white uppercase leading-tight">
                {project?.name}
              </p>
              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="flex justify-between items-center text-xl font-black uppercase italic">
                  <span className="text-emerald-400">Total</span>
                  <span>${totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketplaceCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
