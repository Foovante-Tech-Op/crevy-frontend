// src/app/(dashboard)/projects/new/_components/Step1_ProjectProfile.tsx
"use client";

import { ArrowRight, ChevronLeft, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import CustomDatePicker from "@/components/CustomDatePicker";
import CustomInput from "@/components/CustomInput";
import { SpatialCoordinatePicker } from "@/components/SpatialCoordinatePicker";
import { CountryDropdown } from "@/components/ui/country-dropdown";
import { PROJECT_TYPES, type TCreateProject } from "@/constants/new-project";
import { ProjectService } from "@/lib/services/project-service";
import { cn } from "@/lib/utils";

// Mirrors PROJECT_TYPE_SITE_KIND in crevy-backend's assessment-modules.config.ts.
// These two project types route to project_plot → farm_plot on the backend
// (no facility name/address concept applies), so the Site Details fields
// below are hidden for them. Everything else routes to project_site, which
// DOES need a facility name/address to be meaningfully populated.
const FARM_PLOT_PROJECT_TYPES = [
  "regenerative_agriculture",
  "agricultural_land_management",
];

interface ManifestType {
  projectTypeModuleMap: Record<string, string[]>;
  projectTypeSectorMap: Record<
    string,
    { primarySector: string; eligibleSectors: string[] }
  >;
  fields: Record<string, any>;
  modules: Record<string, any>;
}

const Step1_ProjectProfile = ({
  onNext,
  onPrev,
  onProjectCreated,
}: {
  onNext: () => void;
  onPrev: () => void;
  onProjectCreated: (projectId: string) => void;
}) => {
  const {
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
    getValues,
  } = useFormContext<TCreateProject>();

  const [manifest, setManifest] = useState<ManifestType | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const selectedType = watch("projectType");
  const startDate = watch("startDate");
  // Parse current latitude and longitude from the unified telemetry field
  const gpsCoordinates = watch("gpsCoordinates") || "";
  const [latValue, lngValue] = gpsCoordinates
    ? gpsCoordinates.split(",").map((s) => s.trim())
    : ["", ""];

  // Local state for the map search lookup helper
  const [subStep, setSubStep] = useState<1 | 2>(selectedType ? 2 : 1);

  useEffect(() => {
    ProjectService.getAssessmentManifest()
      .then((res) => {
        if (res.success) setManifest(res.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedType) {
      setSubStep(1);
    }
  }, [selectedType]);

  const handleTypeSelect = (typeId: string) => {
    const sector =
      manifest?.projectTypeSectorMap?.[typeId]?.primarySector ??
      "green_economy";
    setValue("projectType", typeId, {
      shouldTouch: true,
      shouldValidate: true,
    });
    setValue("sector", sector, { shouldTouch: true });
    setSubStep(2);
  };

  const handleNext = async () => {
    const valid = await trigger([
      "projectType",
      "name",
      "description",
      "country",
      "region",
      "startDate",
      "totalAreaHectares",
      "projectOwnerId",
      "customProjectTypeLabel",
      // Note: Make sure to update your Zod schema to validate these broken-out spatial keys
      "latitude" as any,
      "longitude" as any,
    ]);
    if (!valid) return;

    setIsCreating(true);
    try {
      const data = getValues();
      // If your backend specifically expects a single "gpsCoordinates" string,
      // you can aggregate them here before hitting the API service:
      // (data as any).gpsCoordinates = `${data.latitude}, ${data.longitude}`;

      const projectRes = await ProjectService.createProject(data);
      const projectId = projectRes?.data?.id;
      if (!projectId) {
        throw new Error("Registry did not return a valid asset ID.");
      }
      onProjectCreated(projectId);
      onNext();
    } catch (error: any) {
      console.error("Project creation error:", error);
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "Failed to register asset. Protocol aborted.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* SUB-STEP 1: Full-width Methodology Class Selection */}
      {subStep === 1 && (
        <div className="space-y-8 w-full max-w-7xl mx-auto">
          <div className="border-b-2 border-foreground pb-6">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.2em] mb-2">
              Phase 01
            </p>
            <h2 className="text-3xl md:text-4xl font-sans text-foreground tracking-tight">
              Select Sector
            </h2>
            <p className="text-slate-500 text-sm font-light mt-1">
              Choose the approved sector that closely matches your ecological
              project.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROJECT_TYPES.map((type) => {
              const isSelected = selectedType === type.id;
              const manifestEntry = manifest?.projectTypeModuleMap?.[type.id];
              const isEnabled = type.pilotEnabled;

              return (
                <button
                  key={type.id}
                  type="button"
                  disabled={!isEnabled}
                  onClick={() => handleTypeSelect(type.id)}
                  className={cn(
                    "relative p-6 md:p-8 text-left transition-all bg-white border border-slate-200 flex flex-col justify-between min-h-[200px] group",
                    isSelected
                      ? "ring-2 ring-foreground border-foreground bg-slate-50/50"
                      : !isEnabled
                        ? "opacity-40 cursor-not-allowed bg-slate-50"
                        : "hover:border-foreground hover:bg-slate-50/30 shadow-sm hover:shadow-md",
                  )}
                >
                  {!isEnabled && (
                    <span className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-widest bg-slate-200 text-slate-500 px-2 py-1">
                      Pending
                    </span>
                  )}
                  <div>
                    <p className="font-sans font-bold text-foreground text-lg md:text-xl mb-3 group-hover:text-brand transition-colors">
                      {type.title}
                    </p>
                    <p className="text-slate-500 text-xs leading-relaxed font-light">
                      {type.description}
                    </p>
                  </div>
                  {isEnabled && (
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-foreground pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      Select Protocol{" "}
                      <ArrowRight size={12} className="text-brand" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {errors.projectType && (
            <p className="text-red-500 text-xs font-mono mt-2">
              {errors.projectType.message}
            </p>
          )}

          <div className="flex pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onPrev}
              className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-foreground border border-slate-200 hover:border-slate-400 transition-all text-center"
            >
              Abort Ingestion
            </button>
          </div>
        </div>
      )}

      {/* SUB-STEP 2: Asset Metadata Telemetry Form */}
      {subStep === 2 && (
        <div className="space-y-8 max-w-4xl">
          <div className="border-b-2 border-foreground pb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.2em] mb-2">
                Phase 01
              </p>
              <h2 className="text-2xl font-sans text-foreground tracking-tight">
                Project Profile
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setValue("projectType", "");
                setSubStep(1);
              }}
              className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-foreground flex items-center gap-1.5 border border-slate-200 px-3 py-1.5 transition-colors"
            >
              <ChevronLeft size={12} /> Change Type
            </button>
          </div>

          {selectedType === "other" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CustomInput
                control={control}
                name="customProjectTypeLabel"
                type="text"
                label="Describe your project type *"
                placeholder="e.g. Agroforestry with mixed hardwoods"
              />
              {errors.customProjectTypeLabel && (
                <p className="text-red-500 text-xs mt-2 font-mono">
                  {errors.customProjectTypeLabel.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-6">
            <CustomInput
              control={control}
              name="name"
              type="text"
              label="Project Name *"
              placeholder="e.g. Volta Basin Regeneration Initiative"
            />

            <CustomInput
              control={control}
              name="description"
              type="textarea"
              label="Project Description *"
              placeholder="Describe the project's objectives, activities, and expected impact (min. 20 characters)"
            />

            {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div data-lenis-prevent="true">
                <CountryDropdown
                  control={control}
                  name="country"
                  label="Jurisdiction *"
                  placeholder="Select country"
                />
              </div>
              <CustomInput
                control={control}
                name="region"
                type="text"
                label="Region *"
                placeholder="e.g. Ashanti Region"
              />
            </div> */}

            {/* ── SPATIAL ANALYSIS & BOUNDS CONFIGURATION ── */}
            <div className="space-y-4 border border-slate-200 p-5 bg-white">
              <div>
                <label
                  htmlFor="gpsCoordinates"
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground block mb-1"
                >
                  Spatial Bounds Location *
                </label>
                <p className="text-xs text-slate-500 font-light">
                  Input accurate boundaries manually, or position the viewport
                  crosshair precisely over your project location to auto-resolve
                  structural metadata.
                </p>
              </div>

              {/* Coordinates Text Display Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="gpsCoordinates"
                    className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1"
                  >
                    Latitude (Decimal Degrees) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 6.5244"
                    value={latValue}
                    onChange={(e) => {
                      const newLat = e.target.value;
                      setValue("gpsCoordinates", `${newLat},${lngValue}`, {
                        shouldValidate: true,
                        shouldTouch: true,
                      });
                    }}
                    className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 p-4 font-mono text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="gpsCoordinates"
                    className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1"
                  >
                    Longitude (Decimal Degrees) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. -1.3792"
                    value={lngValue}
                    onChange={(e) => {
                      const newLng = e.target.value;
                      setValue("gpsCoordinates", `${latValue},${newLng}`, {
                        shouldValidate: true,
                        shouldTouch: true,
                      });
                    }}
                    className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 p-4 font-mono text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors"
                  />
                </div>
              </div>

              {errors.gpsCoordinates && (
                <p className="text-red-500 text-[10px] font-mono mt-1">
                  {errors.gpsCoordinates.message}
                </p>
              )}

              {/* Global Geo-Registry Information Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div data-lenis-prevent="true">
                  <CountryDropdown
                    control={control}
                    name="country"
                    label="Country *"
                    placeholder="Select Country"
                  />
                </div>

                <CustomInput
                  control={control}
                  name="region"
                  type="text"
                  label="State / Province / Region *"
                  placeholder="Auto-resolved from map canvas"
                />
              </div>

              {/* Interactive Map Component Wrapper */}
              <div className="space-y-2 pt-4">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block">
                  Precision Mapping Grid Matrix
                </span>

                <Controller
                  control={control}
                  name="gpsCoordinates"
                  render={({ field }) => {
                    const [currentLat, currentLng] = field.value
                      ? field.value.split(",").map((s: string) => s.trim())
                      : ["", ""];

                    return (
                      <SpatialCoordinatePicker
                        latitude={currentLat || ""}
                        longitude={currentLng || ""}
                        onChange={({ lat, lng, region, countryCode }) => {
                          // Commit the coordinates update to the true schema key
                          field.onChange(`${lat},${lng}`);

                          // Seamlessly fill administrative data vectors when returned from API
                          if (region) {
                            setValue("region", region, {
                              shouldValidate: true,
                              shouldTouch: true,
                            });
                          }
                          if (countryCode) {
                            setValue("country", countryCode, {
                              shouldValidate: true,
                              shouldTouch: true,
                            });
                          }
                        }}
                      />
                    );
                  }}
                />
              </div>
            </div>

            <div className="bg-slate-50 border-l-2 border-foreground p-4 flex flex-col sm:flex-row gap-3">
              <Info className="h-4 w-4 text-foreground shrink-0 sm:mt-0.5 hidden sm:block" />
              <p className="text-[11px] md:text-xs text-slate-600 font-mono leading-relaxed">
                <span className="font-bold uppercase text-foreground">
                  Verification Warning:
                </span>{" "}
                Precise GPS spatial mapping is locked into satellite
                configurations. Ensure spatial fields match valid legal boundary
                documents exactly.
              </p>
            </div>

            {!FARM_PLOT_PROJECT_TYPES.includes(selectedType) && (
              <div className="space-y-4 border border-slate-200 p-5 bg-white animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <label
                    htmlFor="site-details"
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground block mb-1"
                  >
                    Site Details
                  </label>
                  <p className="text-xs text-slate-500 font-light">
                    Identify the physical facility, installation, or water body
                    this project operates at.
                  </p>
                </div>

                <CustomInput
                  control={control}
                  name="facilityName"
                  type="text"
                  label="Facility / Site Name"
                  placeholder="e.g. Volta Basin Processing Facility"
                />

                <CustomInput
                  control={control}
                  name="address"
                  type="text"
                  label="Site Address"
                  placeholder="e.g. Plot 12, Industrial Area, Ho, Volta Region"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <CustomDatePicker
                control={control}
                name="startDate"
                label="Implementation Start *"
                enableFutureDates
                minDate={new Date()}
              />
              <CustomDatePicker
                control={control}
                name="endDate"
                label="Projected End (Optional)"
                enableFutureDates
                minDate={startDate || new Date()}
              />
            </div>

            <CustomInput
              control={control}
              name="totalAreaHectares"
              type="number"
              label="Project Plot Scale (Hectares) *"
              placeholder="e.g. 50"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-4 pt-8 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSubStep(1)}
              className="w-full sm:w-auto px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-foreground border border-slate-200 hover:border-slate-400 transition-all text-center"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={isCreating}
              className="w-full sm:flex-1 bg-foreground hover:bg-brand text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isCreating ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Committing...
                </span>
              ) : (
                <>
                  Commit & Proceed <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step1_ProjectProfile;
