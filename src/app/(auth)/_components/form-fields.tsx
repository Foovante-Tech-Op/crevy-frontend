// src/app/(auth)/_components/form-fields.tsx
//
// Shared field primitives for the register + register-interest forms.
// Extracted out of RegisterInterestForm so RegisterForm can reuse the same
// building blocks (and the same visual language) instead of redefining them
// — keeps the two forms' presentation/validation atoms DRY even though they
// submit to different endpoints and persist to different tables.
"use client";

import type React from "react";
import { Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 select-none">
      {children}
      {required && <span className="text-slate-900 ml-1">*</span>}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-[10px] font-mono text-red-600 uppercase tracking-wide mt-1">
      {message}
    </p>
  );
}

export function TextField({
  control,
  name,
  label,
  placeholder,
  required,
  type = "text",
}: {
  control: any;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-3">
          <FieldLabel required={required}>{label}</FieldLabel>
          <input
            type={type}
            placeholder={placeholder}
            className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 font-sans text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors outline-none"
            {...field}
            value={(field.value as string) ?? ""}
          />
          <FieldError message={fieldState.error?.message} />
        </div>
      )}
    />
  );
}

export function SingleSelectField({
  control,
  name,
  label,
  options,
  placeholder = "Select an option",
  required,
}: {
  control: any;
  name: string;
  label: string;
  options: readonly string[];
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-3">
          <FieldLabel required={required}>{label}</FieldLabel>
          <Select value={field.value as string} onValueChange={field.onChange}>
            <SelectTrigger className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none p-4 h-auto font-serif text-sm text-slate-900 focus:ring-0 data-[state=open]:border-slate-900">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              {options.map((opt) => (
                <SelectItem key={opt} value={opt} className="rounded-none">
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={fieldState.error?.message} />
        </div>
      )}
    />
  );
}

export function MultiSelectChips({
  control,
  name,
  label,
  options,
  required,
}: {
  control: any;
  name: string;
  label: string;
  options: readonly string[];
  required?: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selected: string[] = Array.isArray(field.value)
          ? field.value
          : [];

        const toggle = (option: string) => {
          if (selected.includes(option)) {
            field.onChange(selected.filter((v) => v !== option));
          } else {
            field.onChange([...selected, option]);
          }
        };

        return (
          <div className="space-y-3">
            <FieldLabel required={required}>{label}</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {options.map((option) => {
                const isActive = selected.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggle(option)}
                    className={cn(
                      "px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest border rounded-none transition-colors",
                      isActive
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-900",
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            <FieldError message={fieldState.error?.message} />
          </div>
        );
      }}
    />
  );
}

export function SelectableCardGroup({
  control,
  name,
  options,
  required,
}: {
  control: any;
  name: string;
  options: readonly string[];
  required?: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {options.map((option) => {
              const isActive = field.value === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => field.onChange(option)}
                  className={cn(
                    "text-left p-6 border rounded-none transition-colors",
                    isActive
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "bg-slate-50 border-slate-200 text-slate-900 hover:border-slate-400",
                  )}
                >
                  <p className="font-sans text-base leading-snug">{option}</p>
                </button>
              );
            })}
          </div>
          <FieldError message={fieldState.error?.message} />
        </div>
      )}
    />
  );
}
