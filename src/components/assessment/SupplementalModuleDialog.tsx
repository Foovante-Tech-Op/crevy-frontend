// src/components/assessment/SupplementalModuleDialog.tsx
"use client";

// ─────────────────────────────────────────────────────────────────────────
// A supplemental assessment module, collected after registration.
//
// Some questions cannot reasonably be asked during onboarding. Project
// Emissions & Leakage is the clearest case: it wants a grid emission
// factor, a year of fuel records, and haulage tonne-kilometres — none of
// which a project owner has open in a browser tab while registering, and
// all of which are needed before a gross avoided-emissions estimate can
// honestly be called a net creditable reduction.
//
// So the backend marks the module `stage: 'supplemental'`, keeps it out of
// the wizard and out of the completion roll-up, and ships an `intro` block
// with it: why this is being asked, what answering it unlocks, what to
// have to hand. This dialog is that block plus the module's own fields —
// which are rendered by exactly the same components the wizard uses, so a
// question asked here behaves the way it would have there.
// ─────────────────────────────────────────────────────────────────────────

import { CheckCircle2, FileText, Loader2, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AssessmentField,
  type FieldDef,
  isFieldVisible,
  type Manifest,
} from "@/components/assessment/AssessmentFieldRenderer";
import {
  parseMissingRequiredFields,
  toastAssessmentWarnings,
  uploadPendingFiles,
} from "@/components/assessment/assessment-io";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getErrorMessage, getRawErrorMessage } from "@/lib/errors";
import { ProjectService } from "@/lib/services/project-service";

interface SupplementalModuleDialogProps {
  projectId: string;
  moduleKey: string;
  manifest: Manifest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful submit — the caller refetches the score. */
  onSubmitted?: () => void;
}

export function SupplementalModuleDialog({
  projectId,
  moduleKey,
  manifest,
  open,
  onOpenChange,
  onSubmitted,
}: SupplementalModuleDialogProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("not_started");

  const moduleDef = manifest?.modules?.[moduleKey];
  const intro = moduleDef?.intro;

  // Load whatever has already been answered each time the dialog opens —
  // this module is explicitly something a project owner comes back to
  // across sessions once they have dug out their bills.
  useEffect(() => {
    if (!open || !projectId || !moduleKey) return;
    setIsLoading(true);
    setMissingFields([]);
    ProjectService.getAssessment(projectId, moduleKey)
      .then((res) => {
        if (res.success) {
          setAnswers(res.data.answers ?? {});
          setStatus(res.data.status ?? "not_started");
        }
      })
      .catch(() => {
        setAnswers({});
        setStatus("not_started");
      })
      .finally(() => setIsLoading(false));
  }, [open, projectId, moduleKey]);

  const fieldDefs = moduleDef?.fields
    ?.map((key) => ({ key, def: manifest?.fields?.[key] }))
    .filter((f): f is { key: string; def: FieldDef } => !!f.def);

  const updateAnswer = useCallback((fieldKey: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [fieldKey]: value }));
    setMissingFields((prev) => prev.filter((f) => f !== fieldKey));
  }, []);

  const persist = async (requestedStatus: "in_progress" | "submitted") => {
    const payload = await uploadPendingFiles(
      answers,
      manifest,
      projectId,
      moduleKey,
    );
    const res = await ProjectService.upsertAssessment(
      projectId,
      moduleKey,
      payload,
      requestedStatus,
    );
    setAnswers(payload);
    return res;
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const res = await persist("in_progress");
      setStatus("in_progress");
      toast.success("Saved — you can finish this later");
      toastAssessmentWarnings(res?.warnings);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "We couldn't save your answers. Please retry."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await persist("submitted");
      if (res.success) {
        setStatus("submitted");
        setMissingFields([]);
        toast.success(`${moduleDef?.title ?? "Module"} submitted`, {
          description:
            "Your project score is being recalculated with these figures.",
        });
        toastAssessmentWarnings(res.warnings);
        onSubmitted?.();
        onOpenChange(false);
      }
    } catch (error) {
      const missing = parseMissingRequiredFields(getRawErrorMessage(error));
      if (missing) {
        setMissingFields(missing);
        toast.error("Some required answers are still missing", {
          description:
            "The fields that need an answer are marked below. You can also save a draft and come back.",
        });
      } else {
        toast.error(
          getErrorMessage(error, "We couldn't submit this. Please retry."),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden rounded-none border-slate-900 p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-slate-200 px-6 py-5 text-left">
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
            {status === "submitted"
              ? "Submitted — editing"
              : status === "in_progress"
                ? "Draft in progress"
                : "Optional · improves your estimate"}
          </p>
          <DialogTitle className="text-xl tracking-tight text-slate-900">
            {moduleDef?.title ?? "Additional information"}
          </DialogTitle>
          <DialogDescription className="text-xs font-light text-slate-500">
            {moduleDef?.description}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(90vh-13rem)] overflow-y-auto px-6 py-6">
          {intro && (
            <div className="mb-8 space-y-5 border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm leading-relaxed text-slate-700">
                {intro.rationale}
              </p>

              {intro.unlocks.length > 0 && (
                <div className="space-y-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
                    What this unlocks
                  </p>
                  <ul className="space-y-1.5">
                    {intro.unlocks.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-xs text-slate-600"
                      >
                        <Sparkles className="mt-0.5 size-3 shrink-0 text-brand" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {intro.prerequisites && intro.prerequisites.length > 0 && (
                <div className="space-y-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
                    Have these to hand
                  </p>
                  <ul className="space-y-1.5">
                    {intro.prerequisites.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-xs text-slate-600"
                      >
                        <FileText className="mt-0.5 size-3 shrink-0 text-slate-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-5 animate-spin text-slate-400" />
            </div>
          ) : !manifest || !moduleDef ? (
            <p className="py-12 text-center font-mono text-sm text-slate-500">
              This form is unavailable right now. Please reload the page.
            </p>
          ) : (
            <div className="space-y-8">
              {fieldDefs?.map(({ key, def }) => {
                if (!isFieldVisible(def, answers)) return null;
                return (
                  <AssessmentField
                    key={key}
                    fieldKey={key}
                    def={def}
                    value={answers[key]}
                    onChange={(val) => updateAnswer(key, val)}
                    hasError={missingFields.includes(key)}
                  />
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="gap-3 border-t border-slate-200 bg-white px-6 py-4 sm:justify-between">
          <p className="hidden max-w-xs text-[11px] leading-relaxed text-slate-400 sm:block">
            Nothing here is required. A draft is kept until you submit, and your
            gross estimate is unaffected either way.
          </p>
          <div className="flex w-full gap-3 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isLoading || isSaving || isSubmitting}
              className="flex-1 rounded-none border-slate-900 text-[10px] font-bold uppercase tracking-widest sm:flex-none"
            >
              {isSaving ? "Saving..." : "Save draft"}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || isSaving || isSubmitting}
              className="flex-1 rounded-none bg-foreground text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:bg-brand sm:flex-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5" /> Submit &amp; recalculate
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SupplementalModuleDialog;
