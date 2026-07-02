"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type SubmissionResultProps = {
  data: any;
};

const SubmissionResult = ({ data }: SubmissionResultProps) => {
  const router = useRouter();
  // data.id is the project id returned by the createProject endpoint
  const projectId: string | undefined = data?.id ?? data?.data?.id;

  return (
    <div className="space-y-0 -m-6 xl:-m-12 overflow-hidden rounded-3xl">
      {/* Header Banner */}
      <div className="bg-[#2ebc8d] py-8 px-12 text-center text-white">
        <CheckCircle2 className="h-14 w-14 mx-auto mb-3 opacity-90" />
        <h2 className="text-3xl font-bold tracking-tight">
          Project Registered!
        </h2>
        <p className="text-white/80 mt-2 text-base">
          Your project has been submitted to Crevy.
        </p>
      </div>

      <div className="p-6 xl:p-12 space-y-8 bg-white">
        {/* What happens next */}
        <div>
          <h3 className="text-slate-700 font-bold text-lg mb-4">
            What happens next?
          </h3>
          <ol className="space-y-4">
            {[
              {
                step: "1",
                title: "Document Review",
                desc: "Our team will review the documents you uploaded. You'll receive a notification when this is complete.",
              },
              {
                step: "2",
                title: "Sensor Deployment",
                desc: "CraftedClimate's field team will contact you to schedule sensor installation on your land.",
              },
              {
                step: "3",
                title: "MRV Data Collection",
                desc: "Once sensors are live, they'll start transmitting real-time carbon data. The verification process begins automatically.",
              },
              {
                step: "4",
                title: "Credits Issued",
                desc: "After successful verification, carbon credits will be issued and your project will go live on the Crevy marketplace.",
              },
            ].map(({ step, title, desc }) => (
              <li key={step} className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-brand-100 text-[#178a74] font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                  {step}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{title}</p>
                  <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
          {projectId && (
            <Button
              onClick={() => router.push(`/projects/${projectId}`)}
              className="flex-1 bg-[#2ebc8d] hover:bg-[#27a37b] h-12 rounded-xl font-bold"
            >
              View My Project
            </Button>
          )}
          <Button
            onClick={() => router.push("/track-verification")}
            variant="outline"
            className="flex-1 h-12 rounded-xl font-bold border-2 border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Track Verification
          </Button>
          <Button
            onClick={() => router.push("/marketplace")}
            variant="outline"
            className="flex-1 h-12 rounded-xl font-bold border-2 border-[#2ebc8d] text-[#2ebc8d] hover:bg-brand-50"
          >
            Explore Marketplace
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionResult;
