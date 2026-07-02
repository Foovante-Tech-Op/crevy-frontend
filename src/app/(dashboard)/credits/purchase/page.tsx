"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Info,
  ShieldCheck,
  Wallet,
  Zap,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditService } from "@/lib/services/credit-service";
import { ProjectService } from "@/lib/services/project-service";

export default function PurchaseCreditsPage() {
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
      ProjectService.getProjectMarketplaceDetail(projectId as string),
    enabled: !!projectId,
  });

  const project = projectRes?.data;
  const pricePerCredit = parseFloat(project?.pricePerCredit || "52.00");
  const totalAmount = quantity * pricePerCredit;

  const handlePurchase = async () => {
    setIsProcessing(true);
    try {
      // In a real flow, you'd find an available carbon_credit ID for this project
      // For simplicity, we assume the backend handles the allocation or we fetch an ID first.
      // Let's assume we fetch available credits first.
      const creditsRes = await CreditService.getCarbonCredits({
        projectId,
        creditStatus: "available",
        limit: 1,
      });
      const availableCredit = creditsRes.data[0];

      if (!availableCredit)
        throw new Error("No available credits found for this project.");

      await CreditService.purchaseCredits(availableCredit.id, {
        quantity,
        pricePerCredit,
        currencyId: project?.currencyId || 1, // Default to USD
        notes: `Purchase for ESG compliance - ${project?.name}`,
      });

      setStep(3); // Success Step
      toast.success("Credits acquired successfully!");
    } catch (err: any) {
      toast.error(err.message || "Acquisition failed");
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
      <div className="p-20 text-center animate-pulse uppercase font-black tracking-widest text-brand-600">
        Initializing Secure Checkout...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-10 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
        {/* ── Left: Checkout Flow ── */}
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
                <div className="space-y-2">
                  <h1 className="text-4xl font-black text-slate-900 uppercase italic">
                    Credit Volume
                  </h1>
                  <p className="text-slate-500 font-medium">
                    Define the amount of verified carbon reduction units to
                    acquire.
                  </p>
                </div>

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
                        className="h-16 text-3xl font-black rounded-2xl border-2 border-slate-100 focus:border-brand-500 transition-all"
                      />
                      <span className="text-sm font-black text-slate-400 uppercase tracking-widest">
                        Units
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase italic">
                      Available Supply:{" "}
                      {parseFloat(
                        project?.availableCredits || "0",
                      ).toLocaleString()}{" "}
                      t
                    </p>
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
                <div className="space-y-2">
                  <h1 className="text-4xl font-black text-slate-900 uppercase italic">
                    Payment Method
                  </h1>
                  <p className="text-slate-500 font-medium">
                    Select your preferred institutional settlement method.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      id: "card",
                      name: "Corporate Credit Card",
                      icon: CreditCard,
                    },
                    { id: "wire", name: "Bank Wire Transfer", icon: Wallet },
                    { id: "crypto", name: "Digital Asset (USDC)", icon: Zap },
                  ].map((method) => (
                    <button
                      type="button"
                      key={method.id}
                      className="w-full bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between group hover:border-brand-500 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600">
                          <method.icon size={24} />
                        </div>
                        <span className="font-black text-slate-900 uppercase text-[11px] tracking-widest">
                          {method.name}
                        </span>
                      </div>
                      <div className="w-6 h-6 rounded-full border-2 border-slate-100 group-hover:border-brand-500 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handlePurchase}
                  disabled={isProcessing}
                  className="w-full h-16 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-900/20"
                >
                  {isProcessing
                    ? "Processing Registry Handshake..."
                    : `Confirm Settlement — $${totalAmount.toLocaleString()}`}
                </Button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-slate-200 rounded-[3rem] p-16 text-center space-y-8 shadow-2xl"
              >
                <div className="w-24 h-24 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-10">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 uppercase italic">
                  Acquisition Finalized
                </h2>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">
                  Your carbon credits have been successfully assigned to your
                  institutional portfolio and anchored on the blockchain.
                </p>

                <div className="pt-8 flex flex-col gap-3">
                  <Button
                    onClick={() => router.push("/portfolio")}
                    className="h-14 bg-slate-900 rounded-xl font-black uppercase tracking-widest text-[10px]"
                  >
                    View Registry Portfolio
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/marketplace")}
                    className="text-slate-400 font-black uppercase tracking-widest text-[10px]"
                  >
                    Back to Discovery
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right: Summary Sidebar ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck size={80} className="text-brand-400" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-400 mb-8">
              Asset Summary
            </h3>

            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-500 uppercase">
                  Project
                </p>
                <p className="font-black text-white uppercase tracking-tight leading-tight">
                  {project?.name}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase">
                    Vintage
                  </p>
                  <p className="font-black text-white uppercase">2024</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase">
                    Registry
                  </p>
                  <p className="font-black text-white uppercase">VERRA</p>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="flex justify-between items-center text-[11px] font-black uppercase">
                  <span className="text-slate-500">Unit Price</span>
                  <span>$52.00</span>
                </div>
                <div className="flex justify-between items-center text-xl font-black uppercase italic tracking-tight">
                  <span className="text-brand-400">Total</span>
                  <span>${totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed flex items-start gap-3">
                <Info size={16} className="text-brand-500 flex-shrink-0" />
                Institutional acquisition includes permanent custody tracking
                and automated ESG reporting data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
