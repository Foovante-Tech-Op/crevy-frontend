"use client";

import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { TCreateProject } from "@/constants/new-project";
import { SDGS } from "@/constants/new-project";

export const SDGSelection = () => {
  const { watch, setValue } = useFormContext<TCreateProject>();
  const selectedSdgs = watch("sdgs") ?? [];

  const toggleSdg = (id: string) => {
    const next = selectedSdgs.includes(id)
      ? selectedSdgs.filter((s) => s !== id)
      : [...selectedSdgs, id];
    setValue("sdgs", next, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div className="space-y-4">
      <Label className="text-slate-700 font-bold">
        Sustainable Development Goals (SDGs)
        <span className="block text-slate-400 text-xs font-normal mt-1">
          Select the goals your project aligns with:
        </span>
      </Label>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SDGS.map((sdg) => {
          const isSelected = selectedSdgs.includes(sdg.id);
          return (
            <label
              key={sdg.id}
              className={`flex items-start text-left space-x-3 p-3 border rounded-xl transition-all cursor-pointer hover:shadow-sm w-full
        ${isSelected ? "border-brand-500 bg-brand-50/30" : "border-slate-100 bg-white"}`}
              htmlFor={`sdg-${sdg.id}`}
            >
              <Checkbox
                id={`sdg-${sdg.id}`}
                checked={isSelected}
                onCheckedChange={() => toggleSdg(sdg.id)}
                className="mt-1 w-5 h-5 border-slate-200 data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500"
              />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-700 block leading-tight">
                  {sdg.id}. {sdg.title}
                </span>
                <div className={`h-1 w-8 mt-2 rounded-full ${sdg.color}`} />
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};
