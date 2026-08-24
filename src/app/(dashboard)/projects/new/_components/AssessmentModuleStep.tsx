// src/app/(dashboard)/projects/new/_components/AssessmentModuleStep.tsx
"use client";

import { ArrowLeft, CheckCircle, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage, getRawErrorMessage } from "@/lib/errors";
import { ProjectService } from "@/lib/services/project-service";
import { StorageService } from "@/lib/services/storage-service";

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

  /**
   * Scans answers for File objects (file / file_multi fields), uploads them
   * to the object store via presigned URL, and returns a deep-cloned answers
   * object where every File has been replaced by its storage object key.
   */
  const prepareAnswersWithUploadedFiles = async (): Promise<
    Record<string, any>
  > => {
    const payload: Record<string, any> = { ...answers };

    for (const [fieldKey, value] of Object.entries(payload)) {
      const def = manifest?.fields?.[fieldKey];
      if (!def) continue;

      if (def.inputType === "file" && value instanceof File) {
        const path = `project_assessment/${projectId}/${moduleKey}/`;
        const objectKey = await StorageService.uploadFile(value, path);
        payload[fieldKey] = objectKey;
      }

      if (def.inputType === "file_multi" && Array.isArray(value)) {
        const uploadedPaths: string[] = [];
        for (const item of value) {
          if (item instanceof File) {
            const path = `project_assessment/${projectId}/${moduleKey}/`;
            const objectKey = await StorageService.uploadFile(item, path);
            uploadedPaths.push(objectKey);
          } else if (typeof item === "string") {
            // Already-uploaded file path — keep it
            uploadedPaths.push(item);
          }
        }
        payload[fieldKey] = uploadedPaths;
      }
    }

    // Final safety net: no File/Blob should survive to this point for ANY
    // field, not just ones the manifest currently tags as file/file_multi.
    // If one does (stale manifest, a field whose inputType got typoed, a
    // network hiccup that left an upload half-applied, etc.), axios's JSON
    // serializer silently turns it into `{}` and the backend rejects it
    // with an opaque "expected string, received object" — the failure mode
    // that prompted this guard. Fail loudly here instead, with the actual
    // field name, so it's fixable in seconds rather than re-diagnosed from
    // a generic 400.
    const stillBinary = Object.entries(payload).filter(([, value]) => {
      if (value instanceof File || value instanceof Blob) return true;
      if (Array.isArray(value)) {
        return value.some((v) => v instanceof File || v instanceof Blob);
      }
      return false;
    });
    if (stillBinary.length > 0) {
      const fieldNames = stillBinary.map(([key]) => key).join(", ");
      throw new Error(
        `Upload didn't complete for: ${fieldNames}. Please retry before saving.`,
      );
    }

    return payload;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = await prepareAnswersWithUploadedFiles();
      await ProjectService.upsertAssessment(
        projectId,
        moduleKey,
        payload,
        "in_progress",
      );
      // Replace File objects with their paths in local state so we don't re-upload
      setAnswers(payload);
      setStatus("in_progress");
      toast.success("Module saved");
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
      const payload = await prepareAnswersWithUploadedFiles();
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
        onNext();
      }
    } catch (error: any) {
      // Raw, not sanitized: this branch PARSES the backend string, and the
      // field list it carries is camelCase, which getErrorMessage refuses to
      // display. Using the sanitized text here would silently stop the
      // missing-field highlighting from ever matching.
      const raw = getRawErrorMessage(error);
      if (raw.toLowerCase().includes("missing required fields")) {
        const match = raw.match(/missing required fields: (.+)/i);
        if (match) {
          const missing = match[1].split(", ").map((s: string) => s.trim());
          setMissingFields(missing);
        }
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
          const hasError = missingFields.includes(key);

          return (
            <div key={key} className="space-y-2">
              <label
                htmlFor={def.label}
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900"
              >
                {def.label}
                {def.required && <span className="text-brand ml-1">*</span>}
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
                className="w-24 rounded-none border border-slate-300 px-3 py-2 text-sm text-foreground focus:border-slate-900 focus:outline-none focus:ring-0"
              />
              <span className="text-xs text-slate-400">%</span>
            </div>
          ))}
          <div
            className={`text-[10px] font-mono uppercase tracking-widest ${
              Math.abs(total - 100) < 0.01 ? "text-brand" : "text-rose-600"
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
      const files: (File | string)[] = Array.isArray(value)
        ? value
        : value
          ? [value]
          : [];
      return (
        <div className="space-y-3">
          <input
            type="file"
            multiple={def.inputType === "file_multi"}
            onChange={(e) => {
              const selected = Array.from(e.target.files || []);
              if (def.inputType === "file_multi") {
                // Append new files to existing array (allows multi-select or repeated single picks)
                onChange([...files, ...selected]);
              } else {
                onChange(selected[0] ?? null);
              }
              // Reset the input so the same file can be re-selected if needed
              e.target.value = "";
            }}
            className="w-full text-sm text-slate-500 file:mr-4 file:rounded-none file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-[10px] file:font-bold file:uppercase file:tracking-widest file:text-white hover:file:bg-brand"
          />
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((f: File | string, i: number) => {
                const isFile = f instanceof File;
                const displayName = isFile ? f.name : f.split("/").pop() || f;
                const displayKey = isFile
                  ? `file-${f.name}-${i}`
                  : `path-${f}-${i}`;
                return (
                  <div
                    key={displayKey}
                    className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-brand-700 bg-brand-50 border border-brand-200 px-1.5 py-0.5 shrink-0">
                        {isFile ? "File" : "Stored"}
                      </span>
                      <span className="text-[10px] font-mono text-slate-600 truncate">
                        {displayName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next = files.filter((_, idx) => idx !== i);
                        onChange(
                          def.inputType === "file_multi"
                            ? next
                            : (next[0] ?? null),
                        );
                      }}
                      className="text-[10px] font-bold uppercase tracking-widest text-rose-600 hover:text-rose-800 px-2 shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
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
