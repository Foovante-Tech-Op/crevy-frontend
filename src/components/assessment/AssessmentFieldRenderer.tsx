// src/components/assessment/AssessmentFieldRenderer.tsx
"use client";

// ─────────────────────────────────────────────────────────────────────────
// THE RENDERER
// ─────────────────────────────────────────────────────────────────────────
// One manifest field in, one rendered input out. Every screen that asks a
// project owner an assessment question renders through here — the
// onboarding wizard's module step and the post-registration dialogs both
// — so a question looks and behaves the same wherever it is asked.
//
// Which component each inputType renders as is NOT decided here. The
// backend manifest declares it, in UI_COMPONENT_MAP
// (crevy-backend/src/v2/projects/configs/assessment-modules.config.ts),
// and this file implements that contract with the shadcn/ui primitives it
// names. That is why `date` opens a Calendar in a Popover rather than a
// browser-native date input, and why `boolean` is two radios rather than a
// switch — those are stated decisions with reasons attached, not local
// styling choices. A `ui` block on a field supplies the details the
// binding cannot know: placeholder, numeric range, date format.
//
// Validation stays server-side. `ui.min` is a nicety for the stepper
// arrows; the field's zodSchema is what decides whether an answer is
// acceptable, and it never leaves the backend.
// ─────────────────────────────────────────────────────────────────────────

import { format, isValid, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// ─── Manifest types (mirror of the backend's serialized manifest) ──────────

export type InputType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "multi_select"
  | "boolean"
  | "percentage_split"
  | "file"
  | "file_multi"
  | "geo_point";

export interface FieldUiHints {
  placeholder?: string;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  dateFormat?: string;
  minDate?: string;
  maxDate?: string;
  columns?: 1 | 2;
  accept?: string;
}

export interface FieldDef {
  label: string;
  inputType: InputType;
  required: boolean;
  unit?: string;
  options?: { value: string; label: string }[];
  dependsOn?: { fieldKey: string; equals: unknown };
  helpText?: string;
  ui?: FieldUiHints;
}

export interface ModuleDef {
  title: string;
  description: string;
  fields: string[];
  stage?: "core" | "supplemental";
  intro?: {
    rationale: string;
    unlocks: string[];
    prerequisites?: string[];
  };
}

export interface Manifest {
  fields: Record<string, FieldDef>;
  modules: Record<string, ModuleDef>;
  projectTypeModuleMap?: Record<string, string[]>;
  projectTypeSupplementalModuleMap?: Record<string, string[]>;
  uiComponents?: Record<string, unknown>;
}

/**
 * Mirror of assessmentDependencyMatches in the backend manifest. A
 * multi-select answer is an array, and `["other"]` must satisfy a
 * dependency on `"other"` — strict equality silently hides the follow-up
 * question the backend then demands before it will accept a submission.
 */
export function dependencyMatches(value: unknown, expected: unknown) {
  if (Array.isArray(value)) return value.includes(expected);
  return value === expected;
}

export function isFieldVisible(
  def: FieldDef,
  answers: Record<string, any>,
): boolean {
  if (!def.dependsOn) return true;
  return dependencyMatches(
    answers[def.dependsOn.fieldKey],
    def.dependsOn.equals,
  );
}

// ─── Shared styling ───────────────────────────────────────────────────────
// The app's assessment forms are square-cornered and slate-bordered rather
// than shadcn's default rounded/ringed look. Kept in one constant so the
// two are never argued over field by field.

const FIELD_CLASS =
  "rounded-none border-slate-300 bg-white text-sm text-slate-900 shadow-none focus-visible:border-slate-900 focus-visible:ring-0";

// ─── Field renderer ───────────────────────────────────────────────────────

export function AssessmentFieldRenderer({
  fieldKey,
  def,
  value,
  onChange,
  hasError,
}: {
  fieldKey: string;
  def: FieldDef;
  value: any;
  onChange: (val: any) => void;
  hasError?: boolean;
}) {
  const ui = def.ui ?? {};

  switch (def.inputType) {
    case "text":
      return (
        <Input
          id={fieldKey}
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={ui.placeholder ?? def.label}
          aria-invalid={hasError}
          className={cn(FIELD_CLASS, "h-10")}
        />
      );

    case "textarea":
      return (
        <Textarea
          id={fieldKey}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={ui.placeholder ?? def.label}
          rows={ui.rows ?? 5}
          aria-invalid={hasError}
          className={cn(FIELD_CLASS, "resize-y")}
        />
      );

    case "number":
      return (
        <Input
          id={fieldKey}
          type="number"
          inputMode="decimal"
          min={ui.min}
          max={ui.max}
          step={ui.step}
          // "" rather than undefined when the field is cleared: an
          // undefined value flips the input from controlled to
          // uncontrolled mid-edit, and React drops the keystroke.
          value={value ?? ""}
          onChange={(e) =>
            onChange(e.target.value === "" ? "" : e.target.valueAsNumber)
          }
          placeholder={ui.placeholder ?? def.label}
          aria-invalid={hasError}
          className={cn(FIELD_CLASS, "h-10")}
        />
      );

    case "date":
      return (
        <DateField
          fieldKey={fieldKey}
          ui={ui}
          value={value}
          onChange={onChange}
          hasError={hasError}
        />
      );

    case "select":
      return (
        <Select value={value ?? ""} onValueChange={(next) => onChange(next)}>
          <SelectTrigger
            id={fieldKey}
            aria-invalid={hasError}
            className={cn(FIELD_CLASS, "h-10 w-full")}
          >
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            {def.options?.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="rounded-none text-sm"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "multi_select": {
      const selected: string[] = Array.isArray(value) ? value : [];
      return (
        <div
          className={cn(
            "grid gap-px border border-slate-200 bg-slate-200",
            ui.columns === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2",
          )}
        >
          {def.options?.map((opt) => {
            const id = `${fieldKey}-${opt.value}`;
            const checked = selected.includes(opt.value);
            return (
              <Label
                key={opt.value}
                htmlFor={id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 bg-white p-4 text-sm font-medium leading-snug text-slate-700 transition-colors hover:bg-slate-50",
                  checked && "bg-slate-50 ring-2 ring-inset ring-slate-900",
                )}
              >
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={(next) =>
                    onChange(
                      next === true
                        ? [...selected, opt.value]
                        : selected.filter((v) => v !== opt.value),
                    )
                  }
                  className="mt-0.5 rounded-none border-slate-300 data-[state=checked]:border-slate-900 data-[state=checked]:bg-slate-900"
                />
                <span>{opt.label}</span>
              </Label>
            );
          })}
        </div>
      );
    }

    case "boolean":
      return (
        // Radios, not a switch: a switch has an "off" resting state, which
        // makes "not answered yet" indistinguishable from "no" — and the
        // difference between those two decides whether a required field is
        // complete.
        <RadioGroup
          value={value === true ? "yes" : value === false ? "no" : ""}
          onValueChange={(next) => onChange(next === "yes")}
          className="flex items-center gap-3"
        >
          {[
            { id: "yes", label: "Yes" },
            { id: "no", label: "No" },
          ].map((opt) => {
            const id = `${fieldKey}-${opt.id}`;
            const active = (opt.id === "yes") === value && value !== undefined;
            return (
              <Label
                key={opt.id}
                htmlFor={id}
                className={cn(
                  "flex cursor-pointer items-center gap-2 border px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all",
                  active
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white text-slate-500 hover:border-slate-500",
                )}
              >
                <RadioGroupItem
                  id={id}
                  value={opt.id}
                  className={cn(
                    "size-3 rounded-none border-current",
                    active && "text-white",
                  )}
                />
                {opt.label}
              </Label>
            );
          })}
        </RadioGroup>
      );

    case "percentage_split": {
      const split = value ?? { burned: 0, dumped: 0, leftOnSite: 0, reused: 0 };
      const keys = ["burned", "dumped", "leftOnSite", "reused"] as const;
      const labels: Record<string, string> = {
        burned: "Burned",
        dumped: "Dumped",
        leftOnSite: "Left on site",
        reused: "Reused / recycled",
      };
      const total = keys.reduce((sum, k) => sum + (split[k] || 0), 0);
      const balanced = Math.abs(total - 100) < 0.01;

      return (
        <div className="space-y-4">
          {keys.map((k) => {
            const id = `${fieldKey}-${k}`;
            return (
              <div key={k} className="flex items-center gap-4">
                <Label
                  htmlFor={id}
                  className="w-32 shrink-0 text-xs font-normal text-slate-600"
                >
                  {labels[k]}
                </Label>
                <Input
                  id={id}
                  type="number"
                  min={0}
                  max={100}
                  value={split[k] ?? 0}
                  onChange={(e) =>
                    onChange({
                      ...split,
                      [k]: Number.isNaN(e.target.valueAsNumber)
                        ? 0
                        : e.target.valueAsNumber,
                    })
                  }
                  className={cn(FIELD_CLASS, "h-10 w-24")}
                />
                <span className="text-xs text-slate-400">%</span>
              </div>
            );
          })}
          <div className="space-y-1.5">
            <Progress
              value={Math.min(total, 100)}
              className={cn(
                "h-1 rounded-none bg-slate-100",
                balanced
                  ? "[&>[data-slot=progress-indicator]]:bg-brand"
                  : "[&>[data-slot=progress-indicator]]:bg-rose-500",
              )}
            />
            <div
              className={cn(
                "font-mono text-[10px] uppercase tracking-widest",
                balanced ? "text-brand" : "text-rose-600",
              )}
            >
              Total: {total.toFixed(1)}% {balanced ? "✓" : "(must equal 100%)"}
            </div>
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
      const multiple = def.inputType === "file_multi";
      return (
        <div className="space-y-3">
          <Input
            id={fieldKey}
            type="file"
            multiple={multiple}
            accept={ui.accept}
            onChange={(e) => {
              const selected = Array.from(e.target.files || []);
              onChange(
                multiple ? [...files, ...selected] : (selected[0] ?? null),
              );
              // Reset so the same file can be picked again after removal.
              e.target.value = "";
            }}
            className={cn(
              FIELD_CLASS,
              "h-auto py-2 text-slate-500 file:mr-4 file:rounded-none file:bg-slate-900 file:px-4 file:py-1.5 file:text-[10px] file:font-bold file:uppercase file:tracking-widest file:text-white hover:file:bg-brand",
            )}
          />
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((f, i) => {
                const isFile = f instanceof File;
                const displayName = isFile
                  ? f.name
                  : (f as string).split("/").pop() || (f as string);
                return (
                  <div
                    key={isFile ? `file-${f.name}-${i}` : `path-${f}-${i}`}
                    className="flex items-center justify-between border border-slate-200 bg-slate-50 p-2"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Badge
                        variant="outline"
                        className="shrink-0 rounded-none border-brand-200 bg-brand-50 text-[9px] font-bold uppercase tracking-widest text-brand-700"
                      >
                        {isFile ? "File" : "Stored"}
                      </Badge>
                      <span className="truncate font-mono text-[10px] text-slate-600">
                        {displayName}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const next = files.filter((_, idx) => idx !== i);
                        onChange(multiple ? next : (next[0] ?? null));
                      }}
                      className="h-auto shrink-0 rounded-none px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-rose-600 hover:bg-transparent hover:text-rose-800"
                    >
                      Remove
                    </Button>
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label
              htmlFor={`${fieldKey}-lat`}
              className="text-[10px] font-normal uppercase tracking-widest text-slate-400"
            >
              Latitude
            </Label>
            <Input
              id={`${fieldKey}-lat`}
              type="text"
              placeholder="Latitude"
              value={pt.lat ?? ""}
              onChange={(e) => onChange({ ...pt, lat: e.target.value })}
              className={cn(FIELD_CLASS, "h-10")}
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor={`${fieldKey}-lng`}
              className="text-[10px] font-normal uppercase tracking-widest text-slate-400"
            >
              Longitude
            </Label>
            <Input
              id={`${fieldKey}-lng`}
              type="text"
              placeholder="Longitude"
              value={pt.lng ?? ""}
              onChange={(e) => onChange({ ...pt, lng: e.target.value })}
              className={cn(FIELD_CLASS, "h-10")}
            />
          </div>
        </div>
      );
    }

    default:
      return (
        <p className="font-mono text-xs text-slate-400">
          Unsupported input type: {def.inputType}
        </p>
      );
  }
}

// ─── Date field ───────────────────────────────────────────────────────────

/**
 * The shadcn date-picker pattern the manifest's `date` binding names: a
 * Button showing the formatted date, opening a Popover containing a
 * single-mode Calendar.
 *
 * The value is an ISO `yyyy-MM-dd` string in and out — never a Date.
 * Answers are stored in a jsonb column and round-trip through JSON, where
 * a Date becomes a UTC timestamp; a commissioning date entered in Accra
 * would come back as the previous day. The backend's zodSchema rejects
 * anything but yyyy-MM-dd for exactly this reason.
 */
function DateField({
  fieldKey,
  ui,
  value,
  onChange,
  hasError,
}: {
  fieldKey: string;
  ui: FieldUiHints;
  value: any;
  onChange: (val: any) => void;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const parsed =
    typeof value === "string" && value ? parseISO(value) : undefined;
  const selected = parsed && isValid(parsed) ? parsed : undefined;

  const minDate = ui.minDate ? parseISO(ui.minDate) : undefined;
  const maxDate = ui.maxDate ? parseISO(ui.maxDate) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={fieldKey}
          type="button"
          variant="outline"
          aria-invalid={hasError}
          className={cn(
            FIELD_CLASS,
            "h-10 w-full justify-start px-3 font-normal hover:bg-white",
            !selected && "text-slate-400",
          )}
        >
          <CalendarIcon className="mr-2 size-4 opacity-50" />
          {selected
            ? format(selected, ui.dateFormat ?? "d MMM yyyy")
            : (ui.placeholder ?? "Pick a date")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto rounded-none p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          captionLayout="dropdown"
          startMonth={minDate ?? new Date(2000, 0)}
          endMonth={maxDate ?? new Date(new Date().getFullYear() + 40, 11)}
          disabled={(date) =>
            (minDate ? date < minDate : false) ||
            (maxDate ? date > maxDate : false)
          }
          onSelect={(date) => {
            onChange(date ? format(date, "yyyy-MM-dd") : "");
            setOpen(false);
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

// ─── Labelled field ───────────────────────────────────────────────────────

/**
 * Label, unit, help text, input, error — the whole question. The wizard
 * step and the post-registration dialogs both render questions through
 * this, so a field's required marker, its unit, and its "this field is
 * required" message look the same wherever it is asked.
 */
export function AssessmentField({
  fieldKey,
  def,
  value,
  onChange,
  hasError,
}: {
  fieldKey: string;
  def: FieldDef;
  value: any;
  onChange: (val: any) => void;
  hasError?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={fieldKey}
        className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900"
      >
        {def.label}
        {def.required && <span className="ml-1 text-brand">*</span>}
        {def.unit && (
          <span className="ml-1 font-normal normal-case tracking-normal text-slate-400">
            ({def.unit})
          </span>
        )}
      </Label>

      {def.helpText && (
        <p className="text-[11px] leading-relaxed text-slate-400">
          {def.helpText}
        </p>
      )}

      <AssessmentFieldRenderer
        fieldKey={fieldKey}
        def={def}
        value={value}
        onChange={onChange}
        hasError={hasError}
      />

      {hasError && (
        <p className="font-mono text-xs text-red-500">This field is required</p>
      )}
    </div>
  );
}

export default AssessmentFieldRenderer;
