"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { AssignmentCheckModal } from "@/components/AssignmentCheckModal";
import {
  createProjectDefaultValues,
  createProjectInputSchema,
  type TCreateProject,
} from "@/constants/new-project";
import { authClient } from "@/lib/auth";
import { ProjectService } from "@/lib/services/project-service";
import { StorageService } from "@/lib/services/storage-service";
import type { TRole } from "@/types/user.types";
import ProcessingStep from "./_components/ProcessingStep";
import SidebarProgress from "./_components/SidebarProgress";
import Step1_ProjectProfile from "./_components/Step1_ProjectProfile";
import Step2_PracticesContext from "./_components/Step2_PracticesContext";
import Step3_Documents from "./_components/Step3_Documents";

const STEPS = [
  "Asset Telemetry",
  "Operational Context",
  "Cryptographic Documentation",
];

const NewProject = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();
  const role = (session?.user as any)?.role as TRole;

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const methods = useForm<TCreateProject>({
    resolver: zodResolver(createProjectInputSchema) as any,
    defaultValues: createProjectDefaultValues,
    mode: "onTouched",
  });

  const nextStep = () =>
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  if (isPending) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-border border-t-slate-900 rounded-none animate-spin" />
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            Initializing Secure Terminal...
          </p>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: TCreateProject) => {
    console.log("Submitting Project Data:", data);
    setIsSubmitting(true);
    try {
      const projectRes = await ProjectService.createProject(data);
      const projectId: string = projectRes?.data?.id;

      if (!projectId) {
        throw new Error("Registry did not return a valid asset ID.");
      }

      const documentEntries = Object.entries(data.documents ?? {}).filter(
        ([, file]) => file != null,
      );

      if (documentEntries.length > 0) {
        const projectCode = projectRes?.data?.code || projectId;
        const uploadResults = await Promise.allSettled(
          documentEntries.flatMap(([documentType, fileOrFiles]) => {
            const files = Array.isArray(fileOrFiles)
              ? fileOrFiles
              : [fileOrFiles as File];
            return files.map(async (file: File) => {
              const storagePath = `project_doc/${projectCode}/`;
              const objectKey = await StorageService.uploadFile(
                file,
                storagePath,
              );
              return ProjectService.uploadDocument(projectId, {
                documentType,
                fileName: file.name,
                fileUrl: objectKey,
                fileSize: file.size,
                mimeType: file.type,
              });
            });
          }),
        );

        const failed = uploadResults.filter((r) => r.status === "rejected");
        if (failed.length > 0) {
          toast.warning(
            `Asset registered but ${failed.length} artifact(s) failed to sync.`,
          );
        }
      }

      try {
        await ProjectService.simulateMrv(projectId);
      } catch (simError) {
        console.warn("MRV simulation failed to trigger:", simError);
      }

      toast.success("Asset successfully committed to registry.");
      router.push(`/projects/detail?id=${projectId}`);
    } catch (error: any) {
      console.error("Submission Error:", error);
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "Failed to register asset. Protocol aborted.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalid = (errors: any) => {
    console.error("Form Validation Errors:", errors);
    const errorList = Object.entries(errors);
    if (errorList.length > 0) {
      const [field, error]: [string, any] = errorList[0];
      toast.error(
        `Validation Error [${field}]: ${error.message || "Invalid input"}`,
      );
    } else {
      toast.error("Please review all registration phases for missing data.");
    }
  };

  return (
    <div className="min-h-screen bg-muted selection:bg-secondary selection:text-white font-sans overflow-x-hidden">
      {isSubmitting && <ProcessingStep />}

      <AssignmentCheckModal
        isOpen={isModalOpen}
        role={role}
        onProceed={(projectDeveloperId, assignedAdminId) => {
          methods.setValue("projectDeveloperId", projectDeveloperId);
          if (assignedAdminId) {
            methods.setValue("assignedAdminId", assignedAdminId);
          }
          setIsModalOpen(false);
        }}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-12 flex flex-col lg:flex-row gap-8 lg:gap-14">
        {/* ── Progress Sidebar ── */}
        <aside className="w-full lg:w-72 shrink-0 h-fit lg:sticky top-12">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center gap-2 mb-8 md:mb-12 transition-colors"
          >
            <ChevronLeft size={14} /> Abort Registration
          </button>

          <h1 className="font-sans text-3xl md:text-4xl text-foreground leading-tight mb-8">
            Asset <br className="hidden lg:block" />
            <span className="italic text-muted-foreground">Ingestion.</span>
          </h1>

          {/* Hidden on mobile, shown on desktop for cleaner UX */}
          <div className="hidden md:block">
            <SidebarProgress currentStep={currentStep} steps={STEPS} />
          </div>

          <div className="mt-8 md:mt-16 p-5 md:p-6 bg-white border border-border rounded-none">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground mb-2">
              Project Support
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Require assistance with methodology alignment or document mapping?
            </p>
            <button
              type="button"
              className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 border-b border-emerald-700 hover:text-foreground hover:border-slate-900 transition-all"
              onClick={() => router.push("/support")}
            >
              Contact Directory
            </button>
          </div>
        </aside>

        {/* ── Form Payload ── */}
        <main className="flex-1 min-w-0 bg-white border border-border p-5 sm:p-8 md:p-14">
          {/* Mobile Progress Indicator */}
          <div className="md:hidden mb-8 border-b-2 border-slate-900 pb-4">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
              Phase 0{currentStep + 1} / 03
            </p>
            <h2 className="text-xl font-sans text-foreground tracking-tight mt-1">
              {STEPS[currentStep]}
            </h2>
          </div>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
              {currentStep === 0 && (
                <Step1_ProjectProfile
                  onNext={nextStep}
                  onPrev={() => router.push("/dashboard")}
                />
              )}
              {currentStep === 1 && (
                <Step2_PracticesContext onNext={nextStep} onPrev={prevStep} />
              )}
              {currentStep === 2 && (
                <Step3_Documents
                  onPrev={prevStep}
                  isSubmitting={isSubmitting}
                  onSubmit={() => methods.handleSubmit(onSubmit, onInvalid)()}
                />
              )}
            </form>
          </FormProvider>
        </main>
      </div>
    </div>
  );
};

export default NewProject;
