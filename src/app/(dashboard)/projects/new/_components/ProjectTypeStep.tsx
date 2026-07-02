"use client";

import Image from "next/image";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PROJECT_TYPES } from "@/constants/new-project";

const ProjectTypeStep = ({
  onNext,
  onPrev,
}: {
  onNext: () => void;
  onPrev: () => void;
}) => {
  const { setValue, watch } = useFormContext();
  const selected = watch("projectType");
  const customProjectName = watch("customProjectName");
  const [showError, setShowError] = useState(false);

  const handleContinue = () => {
    if (!selected && !customProjectName?.trim()) {
      setShowError(true);
      return;
    }
    setShowError(false);
    onNext();
  };

  const handleTypeSelect = (typeId: string) => {
    setValue("projectType", typeId, { shouldTouch: true });
    setShowError(false);
  };

  const handleCustomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("customProjectName", e.target.value, { shouldTouch: true });
    if (e.target.value.trim()) {
      setShowError(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold mb-2">
        Select Your Project Type
      </h2>
      <p className="text-slate-400 mb-6 md:mb-8 text-sm md:text-base">
        Choose the category that best describes your green project.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
        {PROJECT_TYPES.map((type) => (
          <button
            type="button"
            key={type.id}
            onClick={() => handleTypeSelect(type.id)}
            className={`cursor-pointer p-4 md:p-6 rounded-2xl border-2 transition-all text-center flex flex-col items-center justify-center min-h-[180px] md:min-h-[200px]
              ${selected === type.id ? "border-brand-500 bg-brand-50/50" : "border-slate-100 hover:border-brand-200"}`}
          >
            <Image
              src={type.icon}
              alt={type.title}
              width={70}
              height={70}
              className="md:w-[90px] md:h-[90px]"
            />
            <h4 className="font-bold text-slate-800 text-sm md:text-base mt-2">
              {type.title}
            </h4>
            <p className="text-brand-500 text-xs font-semibold mt-1">
              Starting Up
            </p>
            <p className="text-slate-500 text-xs leading-relaxed max-w-[200px] mt-1">
              {type.description}
            </p>
          </button>
        ))}
      </div>

      {/* Custom project option */}
      <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-slate-100">
        <div className="flex items-center gap-2 text-[#2ebc8d] font-semibold mb-4">
          <span className="text-base md:text-lg">⚙️</span>
          <span className="text-sm md:text-base">
            Have a different project in mind?
          </span>
        </div>
        <input
          type="text"
          placeholder="Enter a descriptive name for your project"
          onChange={handleCustomNameChange}
          className="w-full p-3 md:p-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm md:text-base"
        />
      </div>

      {/* Error message */}
      {showError && (
        <div className="mt-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-xs md:text-sm font-medium">
            Please select a project type or enter a custom project name to
            continue.
          </p>
        </div>
      )}

      <div className="mt-8 md:mt-12 flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
        <Button
          variant="ghost"
          onClick={onPrev}
          type="button"
          className="px-6 md:px-8 py-3 md:py-4 text-slate-400 font-bold text-sm md:text-base order-2 sm:order-1"
        >
          Previous
        </Button>
        <Button
          onClick={handleContinue}
          type="button"
          className="bg-[#2ebc8d] hover:bg-[#27a37b] px-8 py-3 md:px-12 md:py-4 xl:py-6 text-sm md:text-base xl:text-lg rounded-xl font-bold transition-all order-1 sm:order-2"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default ProjectTypeStep;
