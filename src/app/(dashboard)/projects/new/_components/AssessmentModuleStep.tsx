// src/app/(dashboard)/projects/new/_components/AssessmentModuleStep.tsx
"use client";

import { ArrowLeft, CheckCircle, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ProjectService } from "@/lib/services/project-service";

// ─── Types from manifest ───────────────────────────────────────────────────

export type InputType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "multi_select"
  | "boolean"
  | "percentage_split"
  | "file"
  | "file_multi"
  | "geo_point";

interface FieldDef {
  label: string;
  inputType: InputType;
  required: boolean;
  unit?: string;
  options?: { value: string; label: string }[];
  dependsOn?: { fieldKey: string; equals: unknown };
  helpText?: string;
}

interface ModuleDef {
  title: string;
  description: string;
  fields: string[];
}

interface Manifest {
  fields: Record<string, FieldDef>;
  modules: Record<string, ModuleDef>;
}

// ─── Component Props ───────────────────────────────────────────────────────

interface AssessmentModuleStepProps {
  projectId: string;
  moduleKey: string;
  manifest: Manifest | null;
  onNext: () => void;
  onPrev: () => void;
  onSave: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

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
    (field: FieldDef) => {
      if (!field.dependsOn) return true;
      return answers[field.dependsOn.fieldKey] === field.dependsOn.equals;
    },
    [answers],
  );

  const updateAnswer = (fieldKey: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [fieldKey]: value }));
    setMissingFields((prev) => prev.filter((f) => f !== fieldKey));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await ProjectService.upsertAssessment(
        projectId,
        moduleKey,
        answers,
        "in_progress",
      );
      setStatus("in_progress");
      toast.success("Module saved");
      onSave();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Failed to save module");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await ProjectService.upsertAssessment(
        projectId,
        moduleKey,
        answers,
        "submitted",
      );
      if (res.success) {
        setStatus("submitted");
        setMissingFields([]);
        toast.success(`Module "${moduleDef?.title}" submitted`);
        onNext();
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? "";
      if (msg.includes("missing required fields")) {
        // Extract missing field names from error message
        const match = msg.match(/missing required fields: (.+)/i);
        if (match) {
          const missing = match[1].split(", ").map((s: string) => s.trim());
          setMissingFields(missing);
        }
        toast.error("Please complete all required fields before submitting");
      } else {
        toast.error(msg || "Failed to submit module");
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
        <h2 className="text-2xl font-serif text-slate-900 tracking-tight">
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
          const hasError = missingFields.includes(key);

          return (
            <div key={key} className="space-y-2">
              <label
                htmlFor={def.label}
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900"
              >
                {def.label}
                {def.required && (
                  <span className="text-emerald-600 ml-1">*</span>
                )}
                {def.unit && (
                  <span className="text-slate-400 font-normal ml-1 normal-case tracking-normal">
                    ({def.unit})
                  </span>
                )}
              </label>

              {def.helpText && (
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {def.helpText}
                </p>
              )}

              <FieldRenderer
                fieldKey={key}
                def={def}
                value={answers[key]}
                onChange={(val) => updateAnswer(key, val)}
              />

              {hasError && (
                <p className="text-red-500 text-xs font-mono">
                  This field is required
                </p>
              )}
            </div>
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
          className="w-full sm:flex-1 bg-slate-900 hover:bg-emerald-700 text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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

// ─── Field Renderer (maps inputType to concrete UI) ────────────────────────

function FieldRenderer({
  def,
  value,
  onChange,
}: {
  fieldKey: string;
  def: FieldDef;
  value: any;
  onChange: (val: any) => void;
}) {
  switch (def.inputType) {
    case "text":
      return (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={def.label}
          className="w-full rounded-none border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-0"
        />
      );

    case "textarea":
      return (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={def.label}
          rows={5}
          className="w-full rounded-none border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-0 resize-y"
        />
      );

    case "number":
      return (
        <input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.valueAsNumber)}
          placeholder={def.label}
          className="w-full rounded-none border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-0"
        />
      );

    case "select":
      return (
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-none border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:border-slate-900 focus:outline-none focus:ring-0"
        >
          <option value="" disabled>
            Select an option
          </option>
          {def.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case "multi_select": {
      const selected: string[] = Array.isArray(value) ? value : [];
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-200 border border-slate-200">
          {def.options?.map((opt) => {
            const checked = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  const next = checked
                    ? selected.filter((v) => v !== opt.value)
                    : [...selected, opt.value];
                  onChange(next);
                }}
                className={`flex items-start gap-3 p-4 bg-white text-left transition-colors ${
                  checked
                    ? "bg-slate-50 ring-2 ring-inset ring-slate-900"
                    : "hover:bg-slate-50"
                }`}
              >
                <div
                  className={`mt-0.5 w-4 h-4 shrink-0 border transition-colors ${
                    checked
                      ? "bg-slate-900 border-slate-900"
                      : "border-slate-300"
                  }`}
                />
                <span className="text-sm text-slate-700 font-medium">
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      );
    }

    case "boolean":
      return (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onChange(true)}
            className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest border transition-all ${
              value === true
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-500 border-slate-300 hover:border-slate-500"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => onChange(false)}
            className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest border transition-all ${
              value === false
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-500 border-slate-300 hover:border-slate-500"
            }`}
          >
            No
          </button>
        </div>
      );

    case "percentage_split": {
      const split = value ?? { burned: 0, dumped: 0, leftOnSite: 0, reused: 0 };
      const total =
        (split.burned || 0) +
        (split.dumped || 0) +
        (split.leftOnSite || 0) +
        (split.reused || 0);
      const keys = ["burned", "dumped", "leftOnSite", "reused"] as const;
      const labels: Record<string, string> = {
        burned: "Burned",
        dumped: "Dumped",
        leftOnSite: "Left on site",
        reused: "Reused / recycled",
      };
      return (
        <div className="space-y-4">
          {keys.map((k) => (
            <div key={k} className="flex items-center gap-4">
              <label
                htmlFor={k}
                className="text-xs text-slate-600 w-32 shrink-0"
              >
                {labels[k]}
              </label>
              <input
                id={k}
                type="number"
                min={0}
                max={100}
                value={split[k] ?? 0}
                onChange={(e) =>
                  onChange({ ...split, [k]: e.target.valueAsNumber })
                }
                className="w-24 rounded-none border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-0"
              />
              <span className="text-xs text-slate-400">%</span>
            </div>
          ))}
          <div
            className={`text-[10px] font-mono uppercase tracking-widest ${
              Math.abs(total - 100) < 0.01
                ? "text-emerald-600"
                : "text-rose-600"
            }`}
          >
            Total: {total.toFixed(1)}%{" "}
            {Math.abs(total - 100) < 0.01 ? "✓" : "(must equal 100%)"}
          </div>
        </div>
      );
    }

    case "file":
    case "file_multi": {
      const files: File[] = Array.isArray(value) ? value : value ? [value] : [];
      return (
        <div className="space-y-3">
          <input
            type="file"
            multiple={def.inputType === "file_multi"}
            onChange={(e) => {
              const selected = Array.from(e.target.files || []);
              onChange(
                def.inputType === "file_multi"
                  ? selected
                  : (selected[0] ?? null),
              );
            }}
            className="w-full text-sm text-slate-500 file:mr-4 file:rounded-none file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-[10px] file:font-bold file:uppercase file:tracking-widest file:text-white hover:file:bg-emerald-700"
          />
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((f: File, i: number) => (
                <span
                  key={i}
                  className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-1 border border-slate-200"
                >
                  {f.name}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }

    case "geo_point": {
      const pt = value ?? { lat: "", lng: "" };
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Latitude"
            value={pt.lat ?? ""}
            onChange={(e) => onChange({ ...pt, lat: e.target.value })}
            className="w-full rounded-none border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-0"
          />
          <input
            type="text"
            placeholder="Longitude"
            value={pt.lng ?? ""}
            onChange={(e) => onChange({ ...pt, lng: e.target.value })}
            className="w-full rounded-none border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-0"
          />
        </div>
      );
    }

    default:
      return (
        <p className="text-xs text-slate-400 font-mono">
          Unsupported input type: {def.inputType}
        </p>
      );
  }
}

export default AssessmentModuleStep;
