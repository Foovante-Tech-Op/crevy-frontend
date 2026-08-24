"use client";

import {
  Locate,
  Mail,
  MapPinned,
  Navigation,
  NotebookPen,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SpatialCoordinatePicker } from "@/components/SpatialCoordinatePicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GHANA_REGIONS, matchGhanaRegion } from "@/constants/ghana-regions";
import { axiosClient } from "@/lib/axiosClient";
import { getErrorMessage } from "@/lib/errors";
import {
  AgentDeveloperService,
  type TRegisterDeveloperInput,
} from "@/lib/services/field-agent-service";
import { StorageService } from "@/lib/services/storage-service";
import { cn } from "@/lib/utils";

// F3 — Register developer wizard.
//
// Autosave: every field change is written to localStorage immediately, and
// the step number lives in the URL (?step=N) via router.replace — so
// closing the browser mid-flow (connection drop, low battery, accidental
// back-swipe) and reopening /agent/register resumes exactly where the
// agent left off. This is the single most important design requirement
// from the spec for a field-capture tool used in areas with patchy
// connectivity.
//
// No boundary drawing here — per the earlier mapping/tools decision, plot
// boundaries are captured later (precise GPS walk or drawn boundary) once
// connectivity/equipment allows. This step only grabs a centroid, which
// the backend stores with boundaryCollectionMethod: 'buffered_centroid'
// (low-confidence, by design) — true regardless of *how* the centroid
// itself was obtained (live GPS vs. an agent marking a remembered spot on
// the map vs. typed-in coordinates), since none of those are a walked
// boundary either.
//
// Two location-capture contexts, one flow: an agent might be standing in
// the field right now, or filling this in later from handwritten notes
// taken on-site (patchy connectivity, dead phone, paper-first habit —
// whatever the reason). Those need genuinely different UI: live device
// GPS is only meaningful when the agent is actually there, so it's simply
// not offered in the "from notes" path (offering it there would silently
// capture wherever the agent happens to be sitting later, e.g. their own
// home, and label it as the farm's location).

const DRAFT_KEY = "crevy_agent_register_draft";
const TOTAL_STEPS = 4;

type TCaptureMode = "on_site" | "from_notes";
type TNotesLocationMode = "coords" | "map";

type TDraft = {
  developerName: string;
  phone: string;
  email: string;
  entityType: "individual" | "cooperative" | "company";
  farmOrProjectType: string;
  // Lead-contact capability capture — only asked/used for entityType !==
  // 'individual' (see Step 1). The lead becomes a project_developer_member
  // (role 'owner') exactly like any member added later via AddMemberModal.
  hasEmailAccess: boolean;
  hasWebAccess: boolean;
  agentManagesAccount: boolean;
  captureMode: TCaptureMode;
  notesLocationMode: TNotesLocationMode;
  region: string;
  village: string;
  lat: string;
  lng: string;
  estimatedAreaHectares: string;
  idPhotoObjectKey: string;
};

const EMPTY_DRAFT: TDraft = {
  developerName: "",
  phone: "",
  email: "",
  entityType: "individual",
  farmOrProjectType: "",
  hasEmailAccess: false,
  hasWebAccess: false,
  agentManagesAccount: false,
  captureMode: "on_site",
  notesLocationMode: "coords",
  region: "",
  village: "",
  lat: "",
  lng: "",
  estimatedAreaHectares: "",
  idPhotoObjectKey: "",
};

function loadDraft(): TDraft {
  if (typeof window === "undefined") return EMPTY_DRAFT;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? { ...EMPTY_DRAFT, ...JSON.parse(raw) } : EMPTY_DRAFT;
  } catch {
    return EMPTY_DRAFT;
  }
}

function saveDraft(draft: TDraft) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function clearDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DRAFT_KEY);
}

export default function RegisterDeveloperPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = Math.min(
    Math.max(Number(searchParams.get("step")) || 1, 1),
    TOTAL_STEPS,
  );

  const [draft, setDraft] = useState<TDraft>(EMPTY_DRAFT);
  const [hydrated, setHydrated] = useState(false);
  const [locating, setLocating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Hydrate from localStorage once on mount (avoids SSR/client mismatch).
  useEffect(() => {
    setDraft(loadDraft());
    setHydrated(true);
  }, []);

  // Autosave on every change.
  useEffect(() => {
    if (hydrated) saveDraft(draft);
  }, [draft, hydrated]);

  const goToStep = (n: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", String(n));
    router.replace(`/agent/register?${params.toString()}`);
  };

  const update = (patch: Partial<TDraft>) =>
    setDraft((d) => ({ ...d, ...patch }));

  // clearDraft() alone only empties localStorage. The component keeps its own
  // `draft` state, and the autosave effect above writes that state back on the
  // next change — so after registering someone, coming back to the form showed
  // the previous farmer's details again. Both halves have to be cleared.
  const resetDraft = () => {
    clearDraft();
    setDraft(EMPTY_DRAFT);
  };

  // Best-effort: fills in Region and Village from the coordinates if the
  // agent hasn't already typed them in themselves. Never overwrites a
  // value they've already set — this is a convenience prefill, not a
  // correction.
  const tryAutoFillLocation = async (lat: number, lng: number) => {
    try {
      const response = await axiosClient.get("/geo/reverse", {
        params: { lat, lng },
      });
      const resolvedRegion: string | undefined = response.data?.data?.region;
      const resolvedLocality: string | undefined =
        response.data?.data?.locality;
      const matched = matchGhanaRegion(resolvedRegion);
      setDraft((d) => ({
        ...d,
        region: d.region ? d.region : matched || d.region,
        village: d.village ? d.village : resolvedLocality || d.village,
      }));
    } catch {
      // Non-fatal — region/village stay whatever the agent picks manually.
    }
  };

  const queryGeolocationPermission = async () => {
    if (typeof navigator === "undefined" || !navigator.permissions) return null;
    try {
      const status = await navigator.permissions.query({ name: "geolocation" });
      return status.state;
    } catch {
      return null;
    }
  };

  const getCurrentPosition = (options: PositionOptions) =>
    new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

  const handleCaptureLocation = async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Location services aren't available on this device");
      return;
    }

    setLocating(true);

    const permissionState = await queryGeolocationPermission();
    if (permissionState === "denied") {
      setLocating(false);
      toast.error(
        "Location access is blocked. Please enable location permissions in your browser or device settings.",
      );
      return;
    }

    const primaryOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 60000,
    };

    const fallbackOptions: PositionOptions = {
      enableHighAccuracy: false,
      timeout: 30000,
      maximumAge: 120000,
    };

    const handleError = (error: GeolocationPositionError) => {
      if (error.code === error.PERMISSION_DENIED) {
        toast.error(
          "Location permission denied. Allow location access and try again.",
        );
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        toast.error(
          "Location unavailable. Try again outdoors or ensure your device's GPS/location services are enabled.",
        );
      } else if (error.code === error.TIMEOUT) {
        toast.error(
          "Location lookup timed out. Try again in a moment with a stronger signal.",
        );
      } else {
        toast.error("Couldn't get location — please try again.");
      }
    };

    const applyPosition = (pos: GeolocationPosition) => {
      update({
        lat: pos.coords.latitude.toString(),
        lng: pos.coords.longitude.toString(),
      });
      tryAutoFillLocation(pos.coords.latitude, pos.coords.longitude);
    };

    try {
      const pos = await getCurrentPosition(primaryOptions);
      applyPosition(pos);
      toast.success("Location captured");
    } catch (err) {
      const geoError = err as GeolocationPositionError;
      if (
        geoError?.code === geoError.TIMEOUT ||
        geoError?.code === geoError.POSITION_UNAVAILABLE
      ) {
        try {
          const pos = await getCurrentPosition(fallbackOptions);
          applyPosition(pos);
          toast.success("Location captured using fallback GPS accuracy");
        } catch {
          handleError(geoError);
        }
      } else {
        handleError(geoError);
      }
    } finally {
      setLocating(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const objectKey = await StorageService.uploadFile(
        file,
        "field-agent-id-photos/",
      );
      update({ idPhotoObjectKey: objectKey });
      toast.success("Photo uploaded");
    } catch {
      toast.error("Photo upload failed — you can try again or skip for now");
    } finally {
      setUploading(false);
    }
  };

  const trimmedEmail = draft.email.trim();

  // Checked here rather than left to the API. The backend schema is
  // `z.string().email().optional()`, which accepts `undefined` but rejects ""
  // and anything malformed with a 400 "Invalid email address" — a confusing
  // failure on a field the form labels optional. An empty value must never
  // block; a non-empty one is worth catching before the round trip.
  const emailIsWellFormed =
    trimmedEmail === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail);

  // Only genuinely required when a login is going to be created for them.
  const emailIsRequired =
    draft.entityType !== "individual" && draft.hasEmailAccess;

  const canProceedStep1 =
    draft.developerName.trim().length >= 2 &&
    draft.phone.trim().length >= 6 &&
    emailIsWellFormed &&
    (!emailIsRequired || trimmedEmail.length > 0);

  const handleCancel = () => {
    resetDraft();
    router.push("/agent");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload: TRegisterDeveloperInput = {
        developerName: draft.developerName.trim(),
        phone: draft.phone.trim(),
        // .trim() before the fallback: an untrimmed " " is truthy, so it
        // was sent as-is and rejected by the API's email() check.
        email: draft.email.trim() || undefined,
        entityType: draft.entityType,
        farmOrProjectType: draft.farmOrProjectType || undefined,
        idPhotoUrl: draft.idPhotoObjectKey
          ? (StorageService.resolveUrl(draft.idPhotoObjectKey) as string)
          : undefined,
        ...(draft.entityType !== "individual"
          ? {
              hasEmailAccess: draft.hasEmailAccess,
              hasWebAccess: draft.hasWebAccess,
              agentManagesAccount: draft.agentManagesAccount,
            }
          : {}),
        location:
          draft.region && draft.lat && draft.lng
            ? {
                region: draft.region.trim(),
                village: draft.village.trim() || undefined,
                lat: Number(draft.lat),
                lng: Number(draft.lng),
                estimatedAreaHectares: draft.estimatedAreaHectares
                  ? Number(draft.estimatedAreaHectares)
                  : undefined,
              }
            : undefined,
      };

      const result = await AgentDeveloperService.registerDeveloper(payload);

      resetDraft();
      if (result?.data?.inviteSent) {
        toast.success(
          `Developer registered — an invite was sent to ${result.data.inviteEmail}`,
        );
      } else {
        toast.success(result?.message || "Developer registered successfully");
      }
      router.push("/agent?registered=1");
    } catch (error: any) {
      toast.error(
        getErrorMessage(
          error,
          "Couldn't submit — your entries are saved, try again when you have signal",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i + 1 <= step ? "bg-slate-900" : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">
        Step {step} of {TOTAL_STEPS}
      </div>

      {step === 1 && (
        <Card className="rounded-none">
          <CardContent className="py-6 space-y-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Who are you registering?
            </h2>
            <div className="space-y-2">
              <Label htmlFor="developerName">Full name</Label>
              <Input
                id="developerName"
                placeholder="e.g. Ama Owusu"
                value={draft.developerName}
                onChange={(e) => update({ developerName: e.target.value })}
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+233 XX XXX XXXX"
                value={draft.phone}
                onChange={(e) => update({ phone: e.target.value })}
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label>Registering as</Label>
              <Select
                value={draft.entityType}
                onValueChange={(v) =>
                  update({ entityType: v as TDraft["entityType"] })
                }
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">
                    An individual farmer
                  </SelectItem>
                  <SelectItem value="cooperative">A cooperative</SelectItem>
                  <SelectItem value="company">A company</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {draft.entityType === "individual" ? (
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email (optional)
                  <span className="text-slate-400 font-normal normal-case">
                    {" — we'll send them a link to manage their project online"}
                  </span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="farmer@example.com"
                  value={draft.email}
                  onChange={(e) => update({ email: e.target.value })}
                  className="h-12 text-base"
                />
                {!emailIsWellFormed && (
                  <p className="text-xs text-red-600">
                    That doesn't look like a valid email address. Correct it, or
                    clear the field to skip it.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  About {draft.developerName.trim() || "this contact"}
                  {"'s access"}
                </p>
                <div className="p-4 bg-slate-50 border border-slate-200">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="hasEmailAccess"
                      checked={draft.hasEmailAccess}
                      onCheckedChange={(checked) =>
                        update({ hasEmailAccess: !!checked })
                      }
                      className="mt-0.5 rounded-none border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                    />
                    <div>
                      <label
                        htmlFor="hasEmailAccess"
                        className="text-sm font-medium text-slate-800 cursor-pointer flex items-center gap-1.5"
                      >
                        <Mail className="h-3.5 w-3.5" /> Has an active email
                        account
                      </label>
                      <p className="text-xs text-slate-400 mt-1">
                        {draft.hasEmailAccess
                          ? "They'll get an account and a 14-day setup code by email + SMS to choose their own password."
                          : "No account will be created — just a roster entry, with a plain SMS confirming they've been registered."}
                      </p>
                    </div>
                  </div>
                </div>

                {draft.hasEmailAccess && (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="farmer@example.com"
                      value={draft.email}
                      onChange={(e) => update({ email: e.target.value })}
                      className="h-12 text-base"
                    />
                    {!emailIsWellFormed && (
                      <p className="text-xs text-red-600">
                        That doesn't look like a valid email address.
                      </p>
                    )}
                  </div>
                )}

                <div className="p-4 bg-slate-50 border border-slate-200">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="hasWebAccess"
                      checked={draft.hasWebAccess}
                      onCheckedChange={(checked) =>
                        update({ hasWebAccess: !!checked })
                      }
                      className="mt-0.5 rounded-none border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                    />
                    <div>
                      <label
                        htmlFor="hasWebAccess"
                        className="text-sm font-medium text-slate-800 cursor-pointer flex items-center gap-1.5"
                      >
                        <Wifi className="h-3.5 w-3.5" /> Can get online
                        (smartphone / computer)
                      </label>
                      <p className="text-xs text-slate-400 mt-1">
                        Independent of email access — used to plan outreach.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="agentManagesAccount"
                      checked={draft.agentManagesAccount}
                      onCheckedChange={(checked) =>
                        update({ agentManagesAccount: !!checked })
                      }
                      className="mt-0.5 rounded-none border-amber-300 data-[state=checked]:bg-amber-900 data-[state=checked]:border-amber-900"
                    />
                    <div>
                      <label
                        htmlFor="agentManagesAccount"
                        className="text-sm font-medium text-amber-900 cursor-pointer flex items-center gap-1.5"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" /> Consents to you
                        managing their account on their behalf
                      </label>
                      <p className="text-xs text-amber-800/70 mt-1">
                        Ask this explicitly — required for the record.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="rounded-none">
          <CardContent className="py-6 space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Where is the farm/project site?
            </h2>

            {/* Capture context toggle */}
            <div className="space-y-2">
              <Label>How are you entering this?</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => update({ captureMode: "on_site" })}
                  className={cn(
                    "flex flex-col items-center gap-1.5 border p-3 text-center transition-colors",
                    draft.captureMode === "on_site"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700",
                  )}
                >
                  <Navigation className="h-4 w-4" />
                  <span className="text-xs font-medium leading-tight">
                    I'm at the site now
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => update({ captureMode: "from_notes" })}
                  className={cn(
                    "flex flex-col items-center gap-1.5 border p-3 text-center transition-colors",
                    draft.captureMode === "from_notes"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700",
                  )}
                >
                  <NotebookPen className="h-4 w-4" />
                  <span className="text-xs font-medium leading-tight">
                    Entering from notes
                  </span>
                </button>
              </div>
              <p className="text-xs text-slate-400">
                {draft.captureMode === "on_site"
                  ? "We'll use this device's GPS to capture the exact spot you're standing on."
                  : "For filling this in later — e.g. from handwritten notes taken on a visit. We won't use this device's current location, since that's wherever you are right now, not the site."}
              </p>
            </div>

            {draft.captureMode === "on_site" ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleCaptureLocation}
                disabled={locating}
                className="w-full h-12 rounded-none"
              >
                <Locate className="h-4 w-4 mr-2" />
                {locating
                  ? "Getting your location…"
                  : draft.lat
                    ? "Location captured ✓ — recapture"
                    : "Capture GPS location"}
              </Button>
            ) : (
              <div className="space-y-4">
                {/* Notes sub-mode: exact remembered coordinates vs. rough map pin */}
                <div className="space-y-2">
                  <Label>Do you have exact coordinates written down?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => update({ notesLocationMode: "coords" })}
                      className={cn(
                        "border p-3 text-center text-xs font-medium transition-colors",
                        draft.notesLocationMode === "coords"
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700",
                      )}
                    >
                      Yes, type them in
                    </button>
                    <button
                      type="button"
                      onClick={() => update({ notesLocationMode: "map" })}
                      className={cn(
                        "border p-3 text-center text-xs font-medium transition-colors",
                        draft.notesLocationMode === "map"
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700",
                      )}
                    >
                      No, mark it on a map
                    </button>
                  </div>
                </div>

                {draft.notesLocationMode === "coords" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="lat">Latitude</Label>
                      <Input
                        id="lat"
                        type="text"
                        inputMode="decimal"
                        placeholder="6.1234"
                        value={draft.lat}
                        onChange={(e) => update({ lat: e.target.value })}
                        className="h-12 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lng">Longitude</Label>
                      <Input
                        id="lng"
                        type="text"
                        inputMode="decimal"
                        placeholder="-0.6543"
                        value={draft.lng}
                        onChange={(e) => update({ lng: e.target.value })}
                        className="h-12 text-base"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <MapPinned className="h-3.5 w-3.5 text-slate-400" />
                      Drag the map so the crosshair sits on the site
                    </Label>
                    <SpatialCoordinatePicker
                      mode="write"
                      latitude={draft.lat}
                      longitude={draft.lng}
                      className="w-full h-64"
                      onChange={({ lat, lng, region, locality }) => {
                        setDraft((d) => {
                          const matched = matchGhanaRegion(region);
                          return {
                            ...d,
                            lat,
                            lng,
                            region: d.region ? d.region : matched || d.region,
                            village: d.village
                              ? d.village
                              : locality || d.village,
                          };
                        });
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Region</Label>
              <Select
                value={draft.region}
                onValueChange={(v) => update({ region: v })}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                  {GHANA_REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="village">Village / town (optional)</Label>
              <Input
                id="village"
                value={draft.village}
                onChange={(e) => update({ village: e.target.value })}
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">
                Rough site size in hectares (optional)
              </Label>
              <Input
                id="area"
                type="number"
                step="0.1"
                placeholder="Eyeball it — this gets refined later"
                value={draft.estimatedAreaHectares}
                onChange={(e) =>
                  update({ estimatedAreaHectares: e.target.value })
                }
                className="h-12 text-base"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="rounded-none">
          <CardContent className="py-6 space-y-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Photo & project type
            </h2>
            <div className="space-y-2">
              <Label htmlFor="idPhoto">ID photo (optional)</Label>
              {/* capture="environment" opens the rear camera directly on mobile */}
              <input
                id="idPhoto"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-slate-900 file:text-white file:text-sm"
              />
              {uploading && (
                <p className="text-xs text-slate-400">Uploading…</p>
              )}
              {draft.idPhotoObjectKey && !uploading && (
                <p className="text-xs text-emerald-600">Photo attached ✓</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="farmType">Farm / project type (optional)</Label>
              <p className="text-xs text-slate-400">
                What is the site actually used for? A quick note is enough —
                e.g. "cocoa farming", "oil palm and plantain", "poultry waste
                composting facility", "small solar installation". This is just a
                field note for context; the formal project category gets chosen
                later during full project registration.
              </p>
              <Input
                id="farmType"
                placeholder="e.g. Cocoa agroforestry"
                value={draft.farmOrProjectType}
                onChange={(e) => update({ farmOrProjectType: e.target.value })}
                className="h-12 text-base"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="rounded-none">
          <CardContent className="py-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Review & submit
            </h2>
            <dl className="divide-y divide-slate-100">
              {[
                ["Name", draft.developerName],
                ["Phone", draft.phone],
                ["Email", draft.email || "—"],
                ["Registering as", draft.entityType],
                ...(draft.entityType !== "individual"
                  ? ([
                      [
                        "Their account",
                        draft.hasEmailAccess
                          ? "Setup code by email + SMS"
                          : "No account — roster entry + SMS acknowledgement",
                      ],
                      ["Can get online", draft.hasWebAccess ? "Yes" : "No"],
                      [
                        "Manages account on their behalf",
                        draft.agentManagesAccount
                          ? "Consented"
                          : "Not consented",
                      ],
                    ] as const)
                  : []),
                ["Region", draft.region || "—"],
                ["Village", draft.village || "—"],
                [
                  "Location",
                  draft.lat
                    ? `Captured ✓ (${
                        draft.captureMode === "on_site"
                          ? "on-site GPS"
                          : draft.notesLocationMode === "coords"
                            ? "typed coordinates"
                            : "marked on map"
                      })`
                    : "Not captured",
                ],
                [
                  "Photo",
                  draft.idPhotoObjectKey ? "Attached ✓" : "Not attached",
                ],
                ["Project type", draft.farmOrProjectType || "—"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between py-2.5 text-sm"
                >
                  <dt className="text-slate-400">{label}</dt>
                  <dd className="text-slate-900 font-medium text-right">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-slate-400">
              Anything missing can be filled in later by the developer or during
              project assessment.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Nav buttons */}
      <div className="flex gap-3">
        {step === 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1 h-12 rounded-none border-red-200 text-red-700 hover:bg-red-50"
          >
            Cancel
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => goToStep(step - 1)}
            className="flex-1 h-12 rounded-none"
          >
            Back
          </Button>
        )}
        {step < TOTAL_STEPS ? (
          <Button
            type="button"
            onClick={() => goToStep(step + 1)}
            disabled={step === 1 && !canProceedStep1}
            className="flex-1 h-12 bg-foreground hover:bg-slate-800 rounded-none"
          >
            Next
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 h-12 bg-brand hover:bg-brand/90 rounded-none"
          >
            {submitting ? "Submitting…" : "Submit"}
          </Button>
        )}
      </div>
    </div>
  );
}
