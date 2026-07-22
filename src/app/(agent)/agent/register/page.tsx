"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AgentDeveloperService,
  type TRegisterDeveloperInput,
} from "@/lib/services/field-agent-service";
import { StorageService } from "@/lib/services/storage-service";

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
// connectivity/equipment allows. This step only grabs a centroid via the
// phone's GPS, which the backend stores with boundaryCollectionMethod:
// 'buffered_centroid' (low-confidence, by design).

const DRAFT_KEY = "crevy_agent_register_draft";
const TOTAL_STEPS = 4;

type TDraft = {
  developerName: string;
  phone: string;
  email: string;
  entityType: "individual" | "cooperative" | "company";
  farmOrProjectType: string;
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

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location services aren't available on this device");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update({
          lat: pos.coords.latitude.toString(),
          lng: pos.coords.longitude.toString(),
        });
        setLocating(false);
        toast.success("Location captured");
      },
      () => {
        setLocating(false);
        toast.error("Couldn't get location — check location permissions");
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
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

  const canProceedStep1 =
    draft.developerName.trim().length >= 2 && draft.phone.trim().length >= 6;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload: TRegisterDeveloperInput = {
        developerName: draft.developerName.trim(),
        phone: draft.phone.trim(),
        email: draft.email || undefined,
        entityType: draft.entityType,
        farmOrProjectType: draft.farmOrProjectType || undefined,
        idPhotoUrl: draft.idPhotoObjectKey
          ? (StorageService.resolveUrl(draft.idPhotoObjectKey) as string)
          : undefined,
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

      clearDraft();
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
        error?.response?.data?.message ||
          "Couldn't submit — your entries are saved, try again when you have signal",
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
        <Card>
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
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardContent className="py-6 space-y-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Where is the farm?
            </h2>
            <Button
              type="button"
              variant="outline"
              onClick={handleCaptureLocation}
              disabled={locating}
              className="w-full h-12"
            >
              {locating
                ? "Getting your location…"
                : draft.lat
                  ? "Location captured ✓ — recapture"
                  : "Capture GPS location"}
            </Button>
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                placeholder="e.g. Eastern Region"
                value={draft.region}
                onChange={(e) => update({ region: e.target.value })}
                className="h-12 text-base"
              />
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
                Rough farm size in hectares (optional)
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
        <Card>
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
        <Card>
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
                ["Region", draft.region || "—"],
                ["Village", draft.village || "—"],
                ["Location", draft.lat ? "Captured ✓" : "Not captured"],
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
        {step > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => goToStep(step - 1)}
            className="flex-1 h-12"
          >
            Back
          </Button>
        )}
        {step < TOTAL_STEPS ? (
          <Button
            type="button"
            onClick={() => goToStep(step + 1)}
            disabled={step === 1 && !canProceedStep1}
            className="flex-1 h-12 bg-slate-900 hover:bg-slate-800"
          >
            Next
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 h-12 bg-slate-900 hover:bg-slate-800"
          >
            {submitting ? "Submitting…" : "Submit"}
          </Button>
        )}
      </div>
    </div>
  );
}
