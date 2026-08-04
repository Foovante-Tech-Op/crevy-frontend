// src/components/project-registration/NewProjectFlow.tsx
"use client";

// Shared project-registration wizard.
//
// Originally lived only at (dashboard)/projects/new/page.tsx. Field agents
// now get the exact same flow — same steps, same assessment modules, same
// backend calls — right after registering a developer, instead of a
// separate/simplified version. Two things differ by context, both driven
// by props rather than a duplicated component:
//   1. Which developer this new project belongs to. Admin flows ask via
//      AssignmentCheckModal (search/pick any developer). The agent flow
//      already knows — the agent just registered this developer, or is
//      looking at their detail page — so `preselectedProjectOwnerId` skips
//      the modal entirely and wires the id straight into the form.
//   2. Where "back"/"exit" and "submission complete" go. `mode="agent"`
//      points these at the agent app instead of the admin dashboard (which
//      the agent can't reach anyway — (dashboard)/layout.tsx redirects
//      field_agent away from every route under it).

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import AssessmentModuleStep from "@/app/(dashboard)/projects/new/_components/AssessmentModuleStep";
import ProcessingStep from "@/app/(dashboard)/projects/new/_components/ProcessingStep";
import ReviewStep from "@/app/(dashboard)/projects/new/_components/ReviewStep";
import SidebarProgress, {
  type ModuleStep,
} from "@/app/(dashboard)/projects/new/_components/SidebarProgress";
import Step1_ProjectProfile from "@/app/(dashboard)/projects/new/_components/Step1_ProjectProfile";
import Step3_Documents from "@/app/(dashboard)/projects/new/_components/Step3_Documents";
import { AssignmentCheckModal } from "@/components/AssignmentCheckModal";
import {
  createProjectDefaultValues,
  createProjectInputSchema,
  type TCreateProject,
} from "@/constants/new-project";
import { authClient } from "@/lib/auth";
import { ProjectService } from "@/lib/services/project-service";
import { StorageService } from "@/lib/services/storage-service";
import { cn } from "@/lib/utils";
import type { TRole } from "@/types/user.types";

export interface NewProjectFlowProps {
  /** Controls back/exit targets and a couple of copy/chrome differences. */
  mode?: "admin" | "agent";
  /**
   * When set, the AssignmentCheckModal (search-and-pick-a-developer gate)
   * is skipped entirely and this id is wired straight into the form —
   * used when the caller already knows which developer the project is
   * for (e.g. registering a project from that developer's detail page).
   */
  preselectedProjectOwnerId?: string;
  /** Shown in a small banner in place of the skipped modal, for context. */
  preselectedProjectOwnerLabel?: string;
  /**
   * Called once the project is fully submitted. Defaults to
   * `router.push(\`/projects/${projectId}\`)` — the admin dashboard's
   * project detail page, which field_agent accounts can't reach, so
   * mode="agent" callers should generally pass their own handler (e.g.
   * back to the developer's detail page).
   */
  onSubmitSuccess?: (projectId: string) => void;
}

const NewProjectFlow = ({
  mode = "admin",
  preselectedProjectOwnerId,
  preselectedProjectOwnerLabel,
  onSubmitSuccess,
}: NewProjectFlowProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingProjectIdParam = searchParams.get("projectId");
  const backHref = mode === "agent" ? "/agent" : "/dashboard";

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Skipped entirely when a developer is already known — there's nothing
  // to ask the modal to resolve.
  const [isModalOpen, setIsModalOpen] = useState(
    !existingProjectIdParam && !preselectedProjectOwnerId,
  );
  const [projectId, setProjectId] = useState<string | null>(null);
  const [manifest, setManifest] = useState<any>(null);
  const [modules, setModules] = useState<ModuleStep[]>([]);
  const [score, setScore] = useState<any>(null);
  const [isResuming, setIsResuming] = useState(!!existingProjectIdParam);
  const hasAttemptedResume = useRef(false);

  const { data: session, isPending } = authClient.useSession();
  const role = (session?.user as any)?.role as TRole;

  const methods = useForm<TCreateProject>({
    resolver: zodResolver(createProjectInputSchema) as any,
    defaultValues: createProjectDefaultValues,
    mode: "onTouched",
  });

  const selectedType = methods.watch("projectType");

  // Determine if the full screen methodology panel is active
  const isMethodologySelection = currentStep === 0 && !selectedType;

  useEffect(() => {
    ProjectService.getAssessmentManifest()
      .then((res) => {
        if (res.success) setManifest(res.data);
      })
      .catch(() => {
        toast.error("Failed to load assessment manifest. Please refresh.");
      });
  }, []);

  // Wire the known developer straight into the form on mount — the
  // equivalent of AssignmentCheckModal's onProceed having already run.
  useEffect(() => {
    if (preselectedProjectOwnerId && !existingProjectIdParam) {
      methods.setValue("projectOwnerId", preselectedProjectOwnerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedProjectOwnerId, methods.setValue, existingProjectIdParam]);

  const deriveSteps = useCallback((): ModuleStep[] => {
    if (!manifest || !selectedType) return [];
    const moduleKeys: string[] =
      manifest.projectTypeModuleMap?.[selectedType] ?? [];
    return moduleKeys.map((key) => {
      const mod = manifest.modules?.[key];
      return {
        moduleKey: key,
        title: mod?.title ?? key,
        description: mod?.description ?? "",
        status: "not_started",
      };
    });
  }, [manifest, selectedType]);

  const refreshModules = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await ProjectService.listAssessments(projectId);
      if (res.success) {
        const serverModules = res.data.map((m: any) => ({
          moduleKey: m.moduleKey,
          title: m.title,
          description: m.description,
          status: m.status,
        }));
        setModules(serverModules);
      }
      const scoreRes = await ProjectService.getLatestScore(projectId);
      if (scoreRes?.success) setScore(scoreRes.data);
    } catch {}
  }, [projectId]);

  const handleProjectCreated = (id: string) => {
    setProjectId(id);
    const steps = deriveSteps();
    setModules(steps);
    // Persist the projectId in the URL so a reload can resume instead of
    // silently dropping back to Step 1 and POSTing a duplicate project.
    const basePath =
      mode === "agent" ? "/agent/register-project" : "/projects/new";
    router.replace(`${basePath}?projectId=${id}`, { scroll: false });
  };

  // ── Resume-in-progress-registration ─────────────────────────────────────
  // On mount, if the URL carries a projectId (either because we just set
  // it above, or because the user reloaded/revisited the page), rebuild
  // wizard state from the server instead of starting over at Step 1. The
  // backend's listAssessments already synthesizes 'not_started' rows for
  // every applicable module, so it's a reliable source of truth for "which
  // step was I on" — we don't need to persist currentStep ourselves.
  useEffect(() => {
    if (hasAttemptedResume.current) return;
    hasAttemptedResume.current = true;

    if (!existingProjectIdParam) {
      setIsResuming(false);
      return;
    }

    (async () => {
      try {
        const [projectRes, assessmentsRes] = await Promise.all([
          ProjectService.getProject(existingProjectIdParam),
          ProjectService.listAssessments(existingProjectIdParam),
        ]);

        if (projectRes?.success && projectRes.data) {
          const p = projectRes.data;
          if (p.projectType) {
            methods.setValue("projectType", p.projectType, {
              shouldValidate: false,
            });
          }
          if (p.name) {
            methods.setValue("name", p.name, { shouldValidate: false });
          }
        }

        setProjectId(existingProjectIdParam);
        setIsModalOpen(false);

        if (assessmentsRes?.success) {
          const serverModules: ModuleStep[] = assessmentsRes.data.map(
            (m: any) => ({
              moduleKey: m.moduleKey,
              title: m.title,
              description: m.description,
              status: m.status,
            }),
          );
          setModules(serverModules);

          const firstIncompleteIndex = serverModules.findIndex(
            (m) => m.status !== "submitted",
          );
          const resumeStep =
            firstIncompleteIndex === -1
              ? serverModules.length + 1 // every module submitted — resume at Documents
              : 1 + firstIncompleteIndex;
          setCurrentStep(resumeStep);
        }

        toast.info("Resumed your in-progress asset registration.");
      } catch (error) {
        console.error("Failed to resume registration:", error);
        toast.error(
          "Could not resume your previous registration. Starting over.",
        );
        const basePath =
          mode === "agent" ? "/agent/register-project" : "/projects/new";
        router.replace(basePath);
      } finally {
        setIsResuming(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingProjectIdParam, methods.setValue, router.replace, mode]);

  const totalSteps = 1 + modules.length + 2;
  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  useEffect(() => {
    if (currentStep >= 1 + modules.length) {
      refreshModules();
    }
  }, [currentStep, modules.length, refreshModules]);

  const handleFinalSubmit = async () => {
    if (!projectId) return;
    setIsSubmitting(true);
    try {
      const documents = methods.getValues("documents") ?? {};
      const documentEntries = Object.entries(documents).filter(
        ([, file]) => file != null,
      );
      if (documentEntries.length > 0) {
        const projectCode = methods.getValues("name") || projectId;
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

      toast.success("Asset successfully committed to registry.");
      if (onSubmitSuccess) {
        onSubmitSuccess(projectId);
      } else {
        router.push(`/projects/${projectId}`);
      }
    } catch (error: any) {
      console.error("Submission Error:", error);
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "Failed to finalize asset. Protocol aborted.",
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

  if (isPending || isResuming) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-foreground rounded-none animate-spin" />
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
            {isResuming
              ? "Resuming Registration..."
              : "Initializing Secure Terminal..."}
          </p>
        </div>
      </div>
    );
  }

  const sidebarSteps: ModuleStep[] =
    currentStep === 0
      ? [
          {
            moduleKey: "project_profile",
            title: "Asset Telemetry",
            status: "in_progress",
          },
        ]
      : modules.length > 0
        ? modules
        : [];

  const projectName = methods.getValues("name");

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-foreground selection:text-white font-sans overflow-x-hidden transition-colors duration-300">
      {isSubmitting && <ProcessingStep />}

      <AssignmentCheckModal
        isOpen={isModalOpen}
        role={role}
        onProceed={(projectOwnerId, assignedAdminId) => {
          methods.setValue("projectOwnerId", projectOwnerId);
          if (assignedAdminId) {
            methods.setValue("assignedAdminId", assignedAdminId);
          }
          setIsModalOpen(false);
        }}
        onClose={mode === "agent" ? () => router.push(backHref) : undefined}
      />

      <div
        className={cn(
          "mx-auto px-4 sm:px-6 lg:px-2 py-8 md:py-12 flex flex-col gap-4 transition-all duration-300",
          isMethodologySelection
            ? "max-w-[1600px] lg:flex-col"
            : "max-w-[1400px] lg:flex-row",
        )}
      >
        {/* ── Progress Sidebar ── */}
        {!isMethodologySelection && (
          <aside className="w-full lg:w-72 shrink-0 h-fit lg:sticky top-12 animate-in fade-in slide-in-from-left-4 duration-300">
            <button
              type="button"
              onClick={() => router.push(backHref)}
              className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-foreground flex items-center gap-2 mb-8 md:mb-12 transition-colors"
            >
              <ChevronLeft size={14} />{" "}
              {projectId ? "Save & Exit" : "Abort Registration"}
            </button>

            <h1 className="font-sans text-3xl md:text-4xl text-foreground leading-tight mb-8">
              Asset <br className="hidden lg:block" />
              <span className="italic text-slate-500">Ingestion.</span>
            </h1>

            {preselectedProjectOwnerLabel && (
              <div className="mb-8 p-4 border border-slate-200 bg-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">
                  Registering For
                </p>
                <p className="text-sm font-bold text-foreground">
                  {preselectedProjectOwnerLabel}
                </p>
              </div>
            )}

            <div className="hidden md:block">
              <SidebarProgress
                currentStep={
                  currentStep === 0 ? 0 : Math.max(0, currentStep - 1)
                }
                steps={sidebarSteps}
              />
            </div>

            {mode !== "agent" && (
              <div className="mt-8 md:mt-16 p-5 md:p-6 bg-white border border-slate-200 rounded-none">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground mb-2">
                  Project Support
                </p>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Require assistance with methodology alignment or document
                  mapping?
                </p>
                <button
                  type="button"
                  className="text-[10px] font-bold uppercase tracking-widest text-brand-700 border-b border-brand-700 hover:text-foreground hover:border-foreground transition-all"
                  onClick={() => router.push("/support")}
                >
                  Contact Directory
                </button>
              </div>
            )}
          </aside>
        )}

        {/* ── Form Payload ── */}
        <main
          className={cn(
            "flex-1 min-w-0 transition-all duration-300",
            isMethodologySelection
              ? "bg-transparent border-none p-0"
              : "bg-white border border-slate-200 p-5 sm:p-8 md:p-14 shadow-sm",
          )}
        >
          {/* Mobile Progress Indicator */}
          {!isMethodologySelection && (
            <div className="md:hidden mb-8 border-b-2 border-foreground pb-4">
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.2em]">
                Phase 0{currentStep + 1} /{" "}
                {totalSteps.toString().padStart(2, "0")}
              </p>
              <h2 className="text-xl font-sans text-foreground tracking-tight mt-1">
                {currentStep === 0
                  ? "Asset Telemetry"
                  : currentStep <= modules.length
                    ? (modules[currentStep - 1]?.title ?? "Assessment")
                    : currentStep === modules.length + 1
                      ? "Cryptographic Documentation"
                      : "Review & Submit"}
              </h2>
            </div>
          )}

          <FormProvider {...methods}>
            <form onSubmit={(e) => e.preventDefault()} noValidate>
              {currentStep === 0 && (
                <Step1_ProjectProfile
                  onNext={nextStep}
                  onPrev={() => router.push(backHref)}
                  onProjectCreated={handleProjectCreated}
                />
              )}

              {currentStep >= 1 &&
                currentStep <= modules.length &&
                projectId && (
                  <AssessmentModuleStep
                    projectId={projectId}
                    moduleKey={modules[currentStep - 1]?.moduleKey}
                    manifest={manifest}
                    onNext={nextStep}
                    onPrev={prevStep}
                    onSave={refreshModules}
                  />
                )}

              {currentStep === modules.length + 1 && projectId && (
                <Step3_Documents
                  onPrev={prevStep}
                  isSubmitting={isSubmitting}
                  onSubmit={handleFinalSubmit}
                />
              )}

              {currentStep === modules.length + 2 && projectId && (
                <ReviewStep
                  onPrev={prevStep}
                  onSubmit={handleFinalSubmit}
                  isSubmitting={isSubmitting}
                  projectName={projectName}
                  projectType={selectedType}
                  modules={modules}
                  score={score}
                />
              )}
            </form>
          </FormProvider>
        </main>
      </div>
    </div>
  );
};

export default NewProjectFlow;
