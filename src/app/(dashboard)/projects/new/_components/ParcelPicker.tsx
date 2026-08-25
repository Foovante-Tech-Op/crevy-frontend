// src/app/(dashboard)/projects/new/_components/ParcelPicker.tsx
"use client";

// Pick which of a developer's parcels a project runs on, and how much of each.
//
// This replaces nothing in the UI — there was nothing here. The wizard
// collected one coordinate pair, and createProject took the developer's FIRST
// farm_plot (`.limit(1)`, no ORDER BY) and enrolled that single parcel with
// the project's entire declared hectarage. For an individual with one parcel
// that looked correct. For a cooperative it was wrong three ways at once: one
// arbitrary member's land stood in for everyone's, every other parcel was
// left out of the project, and the one that was enrolled got credited with
// area it does not have — which is the number the carbon calculation reads.
//
// project_plot has always been a many-row join table with a per-row
// enrolled_area_hectares. Nothing ever wrote more than one row into it.

import { useQuery } from "@tanstack/react-query";
import { Layers, MapPin, TriangleAlert } from "lucide-react";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import type { TCreateProject } from "@/constants/new-project";
import { axiosClient } from "@/lib/axiosClient";
import { cn } from "@/lib/utils";

type TParcel = {
  id: string;
  region: string;
  village: string | null;
  areaHectares: string;
  memberName: string | null;
  centroid: { x: number; y: number } | null;
  enrolledInProjectId: string | null;
  enrolledInProjectCode: string | null;
  enrolledInProjectName: string | null;
};

/** Two decimals, without the trailing noise of toFixed on a whole number. */
const ha = (n: number) => `${Number(n.toFixed(2))} ha`;

export default function ParcelPicker({
  projectOwnerId,
}: {
  projectOwnerId?: string;
}) {
  const { watch, setValue } = useFormContext<TCreateProject>();
  const selected = watch("enrolledPlots") ?? [];

  const { data, isLoading, isError } = useQuery({
    queryKey: ["developer-parcels", projectOwnerId],
    queryFn: async () => {
      const res = await axiosClient.get("/farm-plots", {
        // A cooperative can run to tens of parcels and the picker has to show
        // all of them — paging here would mean someone silently enrols only
        // the first page of their own land.
        params: { projectOwnerId, limit: 200 },
      });
      return (res.data?.data ?? []) as TParcel[];
    },
    enabled: !!projectOwnerId,
  });

  const parcels = useMemo(() => data ?? [], [data]);
  const available = parcels.filter((p) => !p.enrolledInProjectId);
  const taken = parcels.filter((p) => p.enrolledInProjectId);

  const selectedById = new Map(selected.map((s) => [s.plotId, s]));
  const totalSelected = selected.reduce(
    (sum, s) => sum + (Number(s.enrolledAreaHectares) || 0),
    0,
  );

  /**
   * Keep totalAreaHectares in step with the sum of what's ticked.
   *
   * The project's area is no longer a number anyone types — it IS the land
   * enrolled in it. Letting the two disagree is how a project ends up
   * claiming 90 hectares while standing on 2.4, which is precisely the state
   * the old single-plot behaviour produced.
   */
  const commit = (next: TCreateProject["enrolledPlots"]) => {
    const rows = next ?? [];
    setValue("enrolledPlots", rows, { shouldValidate: true });
    setValue(
      "totalAreaHectares",
      Number(
        rows
          .reduce((sum, r) => sum + (Number(r.enrolledAreaHectares) || 0), 0)
          .toFixed(2),
      ),
      { shouldValidate: true },
    );
  };

  const toggle = (parcel: TParcel, on: boolean) => {
    if (on) {
      // Default to the whole parcel. Enrolling all of it is the common case;
      // trimming it is the exception, and an input that starts empty forces
      // everyone to retype a number the system already knows.
      commit([
        ...selected,
        {
          plotId: parcel.id,
          enrolledAreaHectares: Number(parcel.areaHectares),
        },
      ]);
    } else {
      commit(selected.filter((s) => s.plotId !== parcel.id));
    }
  };

  const setArea = (parcelId: string, raw: string) => {
    const value = raw === "" ? 0 : Number(raw);
    commit(
      selected.map((s) =>
        s.plotId === parcelId
          ? { ...s, enrolledAreaHectares: Number.isFinite(value) ? value : 0 }
          : s,
      ),
    );
  };

  if (!projectOwnerId) {
    return (
      <div className="border border-slate-200 bg-slate-50 p-5 text-xs text-slate-500">
        Choose the project developer first — their registered parcels will
        appear here.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="border border-slate-200 bg-white p-5 text-xs text-slate-500">
        Loading this developer's parcels…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border border-amber-200 bg-amber-50 p-5 text-xs text-amber-900">
        We couldn't load this developer's parcels. You can still register the
        project using the coordinates below, and enrol the land afterwards from
        the project's page.
      </div>
    );
  }

  // No land on record. The backend still accepts a single coordinate for this
  // case and creates one parcel from it — which is the right fallback for a
  // developer a field agent registered without capturing plot data.
  if (parcels.length === 0) {
    return (
      <div className="border border-slate-200 bg-slate-50 p-5">
        <p className="text-xs font-medium text-slate-700 mb-1">
          No parcels on record for this developer
        </p>
        <p className="text-xs text-slate-500">
          Use the coordinates below to capture the project's location. It will
          be registered as a single low-confidence parcel, which someone can
          refine later with a proper boundary.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <Layers className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
            Land in this project *
          </p>
          <p className="text-xs text-slate-500 font-light mt-1">
            Tick each parcel this project runs on. Enrol all of a parcel or part
            of it — the project's area is the total of what you tick.
          </p>
        </div>
      </div>

      <div className="border border-slate-200 divide-y divide-slate-100 bg-white">
        {available.map((parcel) => {
          const chosen = selectedById.get(parcel.id);
          const registered = Number(parcel.areaHectares);
          const over =
            chosen && Number(chosen.enrolledAreaHectares) > registered;

          return (
            <div key={parcel.id} className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id={`parcel-${parcel.id}`}
                  checked={!!chosen}
                  onCheckedChange={(v) => toggle(parcel, !!v)}
                  className="mt-0.5 rounded-none border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                />
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor={`parcel-${parcel.id}`}
                    className="text-sm font-medium text-slate-900 cursor-pointer block"
                  >
                    {parcel.memberName ?? "Developer's own land"}
                  </label>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {[parcel.village, parcel.region]
                      .filter(Boolean)
                      .join(", ") || "Location not recorded"}
                    <span className="text-slate-300">·</span>
                    {ha(registered)} registered
                  </p>
                </div>

                {chosen && (
                  <div className="shrink-0 text-right">
                    <label
                      htmlFor={`area-${parcel.id}`}
                      className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1"
                    >
                      Enrolling
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        id={`area-${parcel.id}`}
                        type="number"
                        step="0.01"
                        min="0"
                        max={registered}
                        value={chosen.enrolledAreaHectares}
                        onChange={(e) => setArea(parcel.id, e.target.value)}
                        className={cn(
                          "w-24 bg-slate-50 border-0 border-b-2 p-2 font-mono text-sm text-right text-slate-900 focus:ring-0 transition-colors",
                          over
                            ? "border-red-400 focus:border-red-500"
                            : "border-slate-200 focus:border-slate-900",
                        )}
                      />
                      <span className="text-xs text-slate-400">ha</span>
                    </div>
                  </div>
                )}
              </div>

              {over && (
                <p className="text-[10px] font-mono text-red-600 mt-2 ml-7">
                  Only {ha(registered)} is registered for this parcel.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="flex items-center justify-between border border-slate-900 bg-slate-900 px-4 py-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
            {selected.length} parcel{selected.length === 1 ? "" : "s"} enrolled
          </span>
          <span className="font-mono text-sm font-bold text-white">
            {ha(totalSelected)}
          </span>
        </div>
      )}

      {/* Parcels already committed elsewhere. Shown rather than hidden: a
          member's land missing from the list with no explanation reads as
          lost data, and "it's in PRJ-004" is the answer someone needs in
          order to go and release it. One parcel can only be actively
          enrolled once — the backend enforces it with a unique index. */}
      {taken.length > 0 && (
        <div className="border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
            <TriangleAlert className="h-3 w-3" />
            Already in another project ({taken.length})
          </p>
          <ul className="space-y-1.5">
            {taken.map((parcel) => (
              <li
                key={parcel.id}
                className="text-xs text-slate-500 flex items-center justify-between gap-4"
              >
                <span className="truncate">
                  {parcel.memberName ?? "Developer's own land"} ·{" "}
                  {ha(Number(parcel.areaHectares))}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 shrink-0">
                  {parcel.enrolledInProjectCode}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
