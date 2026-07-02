"use client";

import { Check, Download, Loader2, Trash2, Upload } from "lucide-react";
import { useRef } from "react";
import { useFormContext } from "react-hook-form";
import {
  DOCUMENT_TYPES,
  type DocumentTypeId,
  type TCreateProject,
} from "@/constants/new-project";
import { cn } from "@/lib/utils";

const Step3_Documents = ({
  onPrev,
  onSubmit,
  isSubmitting,
}: {
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) => {
  const { watch, setValue } = useFormContext<TCreateProject>();
  const documents = watch("documents") ?? {};
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const requiredSlots = DOCUMENT_TYPES.filter((d) => d.required);
  const filledRequired = requiredSlots.filter((d) => {
    const val = documents[d.id];
    return val ? (Array.isArray(val) ? val.length > 0 : true) : false;
  });
  const allRequiredFilled = filledRequired.length === requiredSlots.length;

  const handleFileChange = (
    docTypeId: DocumentTypeId,
    e: React.ChangeEvent<HTMLInputElement>,
    multiple: boolean,
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    setValue(
      "documents",
      { ...documents, [docTypeId]: multiple ? files : files },
      { shouldTouch: true },
    );
    e.target.value = "";
  };

  const removeFile = (docTypeId: DocumentTypeId) => {
    const updated = { ...documents };
    delete updated[docTypeId];
    setValue("documents", updated, { shouldTouch: true });
  };

  const renderSlot = (doc: (typeof DOCUMENT_TYPES)[number]) => {
    const file = documents[doc.id];
    const hasFile =
      file != null && (Array.isArray(file) ? file.length > 0 : true);
    const fileName = hasFile
      ? Array.isArray(file)
        ? `${file.length} FILE(S) BUFFERED`
        : (file as File).name
      : null;

    return (
      <div
        key={doc.id}
        className={cn(
          "p-4 md:p-6 border transition-all",
          hasFile
            ? "border-brand-500 bg-brand-50/20"
            : "border-dashed border-slate-300 bg-white",
        )}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <p className="font-sans font-bold text-slate-900">{doc.label}</p>
              {doc.required ? (
                <span className="text-[9px] font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-2 py-0.5 border border-rose-100">
                  Required
                </span>
              ) : (
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 border border-slate-200">
                  Optional
                </span>
              )}
            </div>
            <p className="text-[11px] md:text-xs text-slate-500 font-light max-w-md">
              {doc.description}
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-start lg:items-end gap-3 w-full lg:w-auto mt-2 lg:mt-0 border-t border-slate-100 lg:border-none pt-4 lg:pt-0">
            <input
              type="file"
              ref={(el) => {
                fileRefs.current[doc.id] = el;
              }}
              accept={doc.accept}
              multiple={"multiple" in doc ? doc.multiple : false}
              className="hidden"
              onChange={(e) =>
                handleFileChange(
                  doc.id as DocumentTypeId,
                  e,
                  "multiple" in doc ? !!doc.multiple : false,
                )
              }
            />

            {hasFile ? (
              <div className="flex items-center justify-between w-full lg:w-auto gap-3 bg-white border border-brand-200 px-3 py-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Check size={14} className="text-brand-500 shrink-0" />
                  <span className="font-mono text-[10px] md:text-xs text-slate-900 max-w-[120px] md:max-w-[200px] truncate">
                    {fileName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(doc.id as DocumentTypeId)}
                  className="text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRefs.current[doc.id]?.click()}
                className="w-full lg:w-auto px-6 py-3 border border-slate-900 text-[10px] font-bold uppercase tracking-widest text-slate-900 hover:bg-slate-900 hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <Upload size={12} /> Select File
              </button>
            )}

            {"hasTemplate" in doc &&
              doc.hasTemplate &&
              "templateUrl" in doc && (
                <a
                  href={doc.templateUrl as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] font-mono text-brand-600 hover:underline uppercase tracking-widest flex items-center gap-1 self-start lg:self-end"
                >
                  <Download size={10} /> Fetch Template
                </a>
              )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="hidden md:block border-b-2 border-slate-900 pb-4">
        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.2em] mb-2">
          Phase 03 / 03
        </p>
        <h2 className="text-2xl font-sans text-slate-900 tracking-tight">
          Cryptographic Documentation
        </h2>
        <p className="text-[10px] font-mono text-slate-500 mt-2">
          STATUS: {filledRequired.length} / {requiredSlots.length} REQUIRED
          UPLOADS COMPLETE
        </p>
      </div>

      <div className="space-y-4 md:space-y-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-2">
          Mandatory Artifacts
        </p>
        <div className="space-y-4">
          {DOCUMENT_TYPES.filter((d) => d.required).map(renderSlot)}
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-2">
          Supplementary Artifacts
        </p>
        <div className="space-y-4">
          {DOCUMENT_TYPES.filter((d) => !d.required).map(renderSlot)}
        </div>
      </div>

      {!allRequiredFilled && (
        <div className="border-l-2 border-amber-500 bg-amber-50 p-4">
          <p className="font-mono text-xs text-amber-900 uppercase tracking-wide">
            Warning: Missing required artifacts. Payload cannot be signed.
          </p>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-4 pt-8 border-t border-slate-100">
        <button
          type="button"
          onClick={onPrev}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-400 transition-all text-center"
        >
          Retreat
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !allRequiredFilled}
          className="w-full sm:flex-1 bg-brand hover:bg-brand/80 text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Transmitting...
            </>
          ) : (
            "Sign & Submit Payload"
          )}
        </button>
      </div>
    </div>
  );
};

export default Step3_Documents;
