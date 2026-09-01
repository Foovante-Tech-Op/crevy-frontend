// src/app/(dashboard)/projects/new/_components/AssessmentModuleStep.tsx
"use client";

// One step of the onboarding wizard: one assessment module's questions.
//
// The field rendering, file uploads, and conflict-warning handling all
// live in @/components/assessment — shared with the post-registration
// dialogs, so a question asked here and the same question asked later
// look and behave identically. What is left in this file is only what is
// specific to being a wizard step: fetch the module, save, submit, move on.

import { ArrowLeft, CheckCircle, Save } from "lucide-react";
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
import { getErrorMessage, getRawErrorMessage } from "@/lib/errors";
import { ProjectService } from "@/lib/services/project-service";

export type {
  FieldDef,
  InputType,
  Manifest,
} from "@/components/assessment/AssessmentFieldRenderer";

interface AssessmentModuleStepProps {
  projectId: string;
  moduleKey: string;
  manifest: Manifest | null;
  onNext: () => void;
  onPrev: () => void;
  onSave: () => void;
}

const AssessmentModuleStep = ({
  projectId,
  moduleKey,
  manifest,
  onNext,
  onPrev,
  onSave,
}: AssessmentModuleStepProps) => {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<
    "not_started" | "in_progress" | "submitted"
  >("not_started");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  // Fetch existing module state on mount
  useEffect(() => {
    if (!projectId || !moduleKey) return;
    setIsLoading(true);
    ProjectService.getAssessment(projectId, moduleKey)
      .then((res) => {
        if (res.success) {
          setAnswers(res.data.answers ?? {});
          setStatus(res.data.status ?? "not_started");
        }
      })
      .catch(() => {
        // No existing row — fresh module
      })
      .finally(() => setIsLoading(false));
  }, [projectId, moduleKey]);

  const moduleDef = manifest?.modules?.[moduleKey];
  const fieldDefs = moduleDef?.fields
    ?.map((key) => ({ key, def: manifest?.fields?.[key] }))
    .filter((f): f is { key: string; def: FieldDef } => !!f.def);

  const isVisible = useCallback(
    (field: FieldDef) => isFieldVisible(field, answers),
    [answers],
  );

  const updateAnswer = (fieldKey: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [fieldKey]: value }));
    setMissingFields((prev) => prev.filter((f) => f !== fieldKey));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
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
        "in_progress",
      );
      // Replace File objects with their paths in local state so we don't re-upload
      setAnswers(payload);
      setStatus("in_progress");
      toast.success("Module saved");
      toastAssessmentWarnings(res?.warnings);
      onSave();
    } catch (error: any) {
      toast.error(
        getErrorMessage(
          error,
          "We couldn't save this module. Please try again.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
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
        "submitted",
      );
      if (res.success) {
        setAnswers(payload);
        setStatus("submitted");
        setMissingFields([]);
        toast.success(`Module "${moduleDef?.title}" submitted`);
        // Any conflict the engine found in the full answer set — e.g.
        // burned waste reported alongside anaerobic decomposition
        // conditions, which stops the methane baseline being calculated
        // at all. Shown here, at the moment it is caused, rather than
        // being discovered later as a blank figure on the project page.
        toastAssessmentWarnings(res.warnings);
        onNext();
      }
    } catch (error: any) {
      // Raw, not sanitized: this branch PARSES the backend string, and the
      // field list it carries is camelCase, which getErrorMessage refuses to
      // display. Using the sanitized text here would silently stop the
      // missing-field highlighting from ever matching.
      const missing = parseMissingRequiredFields(getRawErrorMessage(error));
      if (missing) {
        setMissingFields(missing);
        toast.error("Please complete all required fields before submitting");
      } else {
        toast.error(
          getErrorMessage(
            error,
            "We couldn't submit this module. Please try again.",
          ),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 animate-spin" />
      </div>
    );
  }

  if (!manifest || !moduleDef) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 font-mono text-sm">
          Module manifest unavailable. Please retry.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
      {/* Header */}
      <div className="border-b-2 border-slate-900 pb-4">
        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.2em] mb-2">
          {status === "submitted" ? "Submitted" : "In Progress"}
        </p>
        <h2 className="text-2xl font-sans text-slate-900 tracking-tight">
          {moduleDef.title}
        </h2>
        <p className="text-xs text-slate-500 font-light mt-1">
          {moduleDef.description}
        </p>
      </div>

      {/* Fields */}
      <div className="space-y-8">
        {fieldDefs?.map(({ key, def }) => {
          if (!isVisible(def)) return null;
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

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-4 pt-8 border-t border-slate-100">
        <button
          type="button"
          onClick={onPrev}
          className="w-full sm:w-auto px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-400 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft size={14} /> Retreat
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || isSubmitting}
          className="w-full sm:w-auto px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-900 border border-slate-900 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save size={14} /> {isSaving ? "Saving..." : "Save Progress"}
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving || isSubmitting}
          className="w-full sm:flex-1 bg-foreground hover:bg-brand text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            <>
              <CheckCircle size={14} /> Submit Module
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AssessmentModuleStep;
