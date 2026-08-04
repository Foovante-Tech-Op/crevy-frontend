"use client";

// Add-member modal for an existing cooperative/company project developer.
// This is the "invite the rest later" half of onboarding — the lead was
// already registered (with or without the full member roster), and an
// admin/field agent now wants to attach one more person to that same
// project_developer via POST /project-developers/:id/members.
//
// No password is collected here — an agent-set password is a security
// risk (the agent would then know the account's credential). Instead:
//   - hasEmailAccess (asked explicitly, not assumed) gates whether an
//     account is created at all. If yes, the person gets a 14-day claim
//     code by email + SMS to set their own real password. If no, there's
//     nothing to create an account WITH — they're recorded as a roster
//     entry only, and get a plain SMS acknowledgement instead.
//   - hasWebAccess is recorded separately (someone can have email but
//     rarely get online, or vice versa) for outreach planning.
//   - agentManagesAccount is required consent — asked regardless of the
//     above, for legal reasons.
//
// The optional "farm plot" section lets the admin capture that specific
// member's own parcel of land on the spot. It's attributed to THIS member
// (farm_plot.memberId) but still rolls up under the same project_developer
// as every other plot — the cooperative's land stays "one land mass" at
// the project level, while remaining individually traceable per member.

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Locate,
  Mail,
  MapPin,
  MapPinned,
  Navigation,
  NotebookPen,
  ShieldCheck,
  UserPlus,
  Wifi,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SpatialCoordinatePicker } from "@/components/SpatialCoordinatePicker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { axiosClient } from "@/lib/axiosClient";
import { ProjectOwnerService } from "@/lib/services/project-owner-service";
import { cn } from "@/lib/utils";

type TCaptureMode = "on_site" | "from_notes";
type TNotesLocationMode = "coords" | "map";

const addMemberSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    contactNumber: z.string().min(1, "Contact number is required"),
    hasEmailAccess: z.boolean(),
    email: z
      .string()
      .email("Invalid email format")
      .optional()
      .or(z.literal("")),
    hasWebAccess: z.boolean(),
    agentManagesAccount: z.boolean(),
    role: z.enum(["admin", "member"]),
    captureFarmPlot: z.boolean(),
    region: z.string().optional(),
    village: z.string().optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    areaHectares: z.string().optional(),
  })
  .refine((data) => !data.hasEmailAccess || !!data.email, {
    message: "Email is required when this person has an active email account",
    path: ["email"],
  })
  .refine(
    (data) =>
      !data.captureFarmPlot ||
      (data.region && data.latitude && data.longitude && data.areaHectares),
    {
      message:
        "Region, coordinates, and area are required when capturing a farm plot",
      path: ["region"],
    },
  );

type AddMemberFormValues = z.infer<typeof addMemberSchema>;

const DEFAULT_VALUES: AddMemberFormValues = {
  firstName: "",
  lastName: "",
  contactNumber: "",
  hasEmailAccess: false,
  email: "",
  hasWebAccess: false,
  agentManagesAccount: false,
  role: "member",
  captureFarmPlot: false,
  region: "",
  village: "",
  latitude: "",
  longitude: "",
  areaHectares: "",
};

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectDeveloperId: string;
  onSuccess?: () => void;
  /**
   * The developer's own already-captured location (from its primary farm
   * plot), if one exists. When present, Region and Village are pre-filled
   * and locked (grayed out) instead of asked again — the whole point of
   * per-member plots is that everyone's land rolls up under the same
   * developer/area; what actually varies member-to-member is the exact
   * coordinates and area of their own parcel, which stay fully editable.
   */
  sharedLocation?: { region: string; village?: string | null } | null;
}

export function AddMemberModal({
  isOpen,
  onClose,
  projectDeveloperId,
  onSuccess,
  sharedLocation,
}: AddMemberModalProps) {
  const [loading, setLoading] = useState(false);
  const [captureMode, setCaptureMode] = useState<TCaptureMode>("on_site");
  const [notesLocationMode, setNotesLocationMode] =
    useState<TNotesLocationMode>("coords");
  const [locating, setLocating] = useState(false);
  const [resolvingLocation, setResolvingLocation] = useState(false);
  const hasSharedLocation = !!sharedLocation?.region;

  const defaultValues: AddMemberFormValues = {
    ...DEFAULT_VALUES,
    region: sharedLocation?.region || "",
    village: sharedLocation?.village || "",
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues,
  });

  const captureFarmPlot = watch("captureFarmPlot");
  const hasEmailAccess = watch("hasEmailAccess");
  const hasWebAccess = watch("hasWebAccess");
  const agentManagesAccount = watch("agentManagesAccount");
  const role = watch("role");
  const latitude = watch("latitude");
  const longitude = watch("longitude");

  const handleClose = () => {
    reset(defaultValues);
    setCaptureMode("on_site");
    setNotesLocationMode("coords");
    setLocating(false);
    setResolvingLocation(false);
    onClose();
  };

  // Best-effort: fills in Region and Village from the coordinates if the
  // agent hasn't already typed them in themselves (and only when there's no
  // developer-level shared location already locking those fields). Never
  // overwrites a value already set — this is a convenience prefill, not a
  // correction. Mirrors the same helper on the developer registration flow
  // (/agent/register) so the two location-capture experiences stay in sync.
  const tryAutoFillLocation = async (lat: number, lng: number) => {
    setResolvingLocation(true);
    try {
      const response = await axiosClient.get("/geo/reverse", {
        params: { lat, lng },
      });
      const resolvedRegion: string | undefined = response.data?.data?.region;
      const resolvedLocality: string | undefined =
        response.data?.data?.locality;
      if (!hasSharedLocation) {
        if (!getValues("region") && resolvedRegion) {
          setValue("region", resolvedRegion);
        }
        if (!getValues("village") && resolvedLocality) {
          setValue("village", resolvedLocality);
        }
      }
    } catch {
      // Non-fatal — region/village stay whatever gets entered manually.
    } finally {
      setResolvingLocation(false);
    }
  };

  const queryGeolocationPermission = async () => {
    if (typeof navigator === "undefined" || !navigator.permissions) return null;
    try {
      const status = await navigator.permissions.query({
        name: "geolocation" as PermissionName,
      });
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
      setValue("latitude", pos.coords.latitude.toString());
      setValue("longitude", pos.coords.longitude.toString());
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

  const onSubmit = async (data: AddMemberFormValues) => {
    setLoading(true);
    try {
      await ProjectOwnerService.addMember(projectDeveloperId, {
        firstName: data.firstName,
        lastName: data.lastName,
        contactNumber: data.contactNumber,
        hasEmailAccess: data.hasEmailAccess,
        email: data.hasEmailAccess ? data.email || null : null,
        hasWebAccess: data.hasWebAccess,
        agentManagesAccount: data.agentManagesAccount,
        role: data.role,
        farmPlot: data.captureFarmPlot
          ? {
              region: data.region!,
              village: data.village || null,
              centroid: {
                lat: Number(data.latitude),
                lng: Number(data.longitude),
              },
              areaHectares: Number(data.areaHectares),
            }
          : null,
      });

      toast.success(
        data.hasEmailAccess
          ? `${data.firstName} ${data.lastName} added — a setup code was sent by email and SMS`
          : `${data.firstName} ${data.lastName} added — an SMS acknowledgement was sent`,
      );
      reset(defaultValues);
      setCaptureMode("on_site");
      setNotesLocationMode("coords");
      onClose();
      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Couldn't add this member. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        data-lenis-prevent
        className="max-w-full md:max-w-4xl p-0 rounded-none border border-slate-900 shadow-2xl gap-0 bg-white max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader className="p-8 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3 mb-4">
            <UserPlus size={20} className="text-slate-900" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
              Cooperative Membership
            </span>
          </div>
          <DialogTitle className="text-3xl font-sans text-slate-900 tracking-tight leading-none mb-2">
            Add Member
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-light text-sm">
            Register a new person under this entity. A few quick questions about
            their access decide how (or whether) they get an online account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  First Name
                </Label>
                <Input
                  placeholder="e.g. Ama"
                  {...register("firstName")}
                  className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-slate-900 transition-colors"
                />
                {errors.firstName && (
                  <p className="text-xs text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Last Name
                </Label>
                <Input
                  placeholder="e.g. Boateng"
                  {...register("lastName")}
                  className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-slate-900 transition-colors"
                />
                {errors.lastName && (
                  <p className="text-xs text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Contact Number
                </Label>
                <Input
                  placeholder="0245..."
                  {...register("contactNumber")}
                  className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-slate-900 transition-colors"
                />
                {errors.contactNumber && (
                  <p className="text-xs text-red-600">
                    {errors.contactNumber.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Role in Entity
                </Label>
                <Select
                  value={role}
                  onValueChange={(val) =>
                    setValue("role", val as "admin" | "member")
                  }
                >
                  <SelectTrigger className="w-full rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm text-slate-900 focus:ring-0 focus:border-slate-900 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border border-slate-200 shadow-xl">
                    <SelectItem value="member" className="font-mono text-xs">
                      Member
                    </SelectItem>
                    <SelectItem value="admin" className="font-mono text-xs">
                      Admin (co-lead)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ── Access capture — asked explicitly, drives account creation ── */}
            <div className="space-y-3">
              <div className="p-5 bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="hasEmailAccess"
                    checked={hasEmailAccess}
                    onCheckedChange={(checked) =>
                      setValue("hasEmailAccess", !!checked)
                    }
                    className="mt-1 rounded-none border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                  />
                  <div>
                    <label
                      htmlFor="hasEmailAccess"
                      className="text-xs font-bold uppercase tracking-widest text-slate-700 cursor-pointer flex items-center gap-1.5"
                    >
                      <Mail className="h-3.5 w-3.5" /> Has an active email
                      account
                    </label>
                    <p className="text-[10px] font-mono text-slate-400 mt-1">
                      {hasEmailAccess
                        ? "They'll get an account and a 14-day setup code by email + SMS to choose their own password."
                        : "No account will be created — just a roster entry. They'll get a plain SMS confirming they've been registered."}
                    </p>
                  </div>
                </div>
              </div>

              {hasEmailAccess && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Email
                  </Label>
                  <Input
                    type="email"
                    placeholder="member@coop.com"
                    {...register("email")}
                    className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-slate-900 transition-colors"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              )}

              <div className="p-5 bg-slate-50 border border-slate-200">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="hasWebAccess"
                    checked={hasWebAccess}
                    onCheckedChange={(checked) =>
                      setValue("hasWebAccess", !!checked)
                    }
                    className="mt-1 rounded-none border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                  />
                  <div>
                    <label
                      htmlFor="hasWebAccess"
                      className="text-xs font-bold uppercase tracking-widest text-slate-700 cursor-pointer flex items-center gap-1.5"
                    >
                      <Wifi className="h-3.5 w-3.5" /> Can get online
                      (smartphone / computer)
                    </label>
                    <p className="text-[10px] font-mono text-slate-400 mt-1">
                      Independent of email access — used to plan outreach (web
                      vs. USSD, once available).
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agentManagesAccount"
                    checked={agentManagesAccount}
                    onCheckedChange={(checked) =>
                      setValue("agentManagesAccount", !!checked)
                    }
                    className="mt-1 rounded-none border-amber-300 data-[state=checked]:bg-amber-900 data-[state=checked]:border-amber-900"
                  />
                  <div>
                    <label
                      htmlFor="agentManagesAccount"
                      className="text-xs font-bold uppercase tracking-widest text-amber-900 cursor-pointer flex items-center gap-1.5"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" /> Consents to the
                      agent managing their account on their behalf
                    </label>
                    <p className="text-[10px] font-mono text-amber-800/70 mt-1">
                      Ask this explicitly, regardless of email/web access —
                      required for the record.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="captureFarmPlot"
                  checked={captureFarmPlot}
                  onCheckedChange={(checked) =>
                    setValue("captureFarmPlot", !!checked)
                  }
                  className="mt-1 rounded-none border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                />
                <div>
                  <label
                    htmlFor="captureFarmPlot"
                    className="text-xs font-bold uppercase tracking-widest text-slate-700 cursor-pointer flex items-center gap-1.5"
                  >
                    <MapPin className="h-3.5 w-3.5" /> Capture this member's
                    farm/project plot now
                  </label>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">
                    Optional — this member's own parcel of land, still enrolled
                    under this same cooperative.
                  </p>
                </div>
              </div>
            </div>

            {captureFarmPlot && (
              <div className="space-y-4 pt-2">
                {/* Capture context toggle — same on-site/from-notes options
                    and flow as the developer registration wizard
                    (/agent/register), so agents get one consistent muscle
                    memory for capturing a location anywhere in the app. */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    How are you entering this?
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCaptureMode("on_site")}
                      className={cn(
                        "flex flex-col items-center gap-1.5 border p-4 text-center transition-colors",
                        captureMode === "on_site"
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-400",
                      )}
                    >
                      <Navigation className="h-4 w-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest leading-tight">
                        I&apos;m at the site now
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCaptureMode("from_notes")}
                      className={cn(
                        "flex flex-col items-center gap-1.5 border p-4 text-center transition-colors",
                        captureMode === "from_notes"
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-400",
                      )}
                    >
                      <NotebookPen className="h-4 w-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest leading-tight">
                        Entering from notes
                      </span>
                    </button>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400">
                    {captureMode === "on_site"
                      ? "We'll use this device's GPS to capture the exact spot you're standing on."
                      : "For filling this in later — e.g. from handwritten notes taken on a visit. We won't use this device's current location, since that's wherever you are right now, not the plot."}
                  </p>
                </div>

                {captureMode === "on_site" ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCaptureLocation}
                    disabled={locating}
                    className="w-full rounded-none border-slate-300 text-slate-700 hover:border-slate-900 hover:text-slate-900 hover:bg-transparent px-8 py-6 text-[10px] font-bold uppercase tracking-widest transition-colors"
                  >
                    {locating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Locate className="h-4 w-4 mr-2" />
                    )}
                    {locating
                      ? "Getting your location…"
                      : latitude
                        ? "Location captured ✓ — recapture"
                        : "Capture GPS location"}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Do you have exact coordinates written down?
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setNotesLocationMode("coords")}
                          className={cn(
                            "border p-3 text-center text-[10px] font-bold uppercase tracking-widest transition-colors",
                            notesLocationMode === "coords"
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-400",
                          )}
                        >
                          Yes, type them in
                        </button>
                        <button
                          type="button"
                          onClick={() => setNotesLocationMode("map")}
                          className={cn(
                            "border p-3 text-center text-[10px] font-bold uppercase tracking-widest transition-colors",
                            notesLocationMode === "map"
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-400",
                          )}
                        >
                          No, mark it on a map
                        </button>
                      </div>
                    </div>

                    {notesLocationMode === "coords" ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Latitude
                          </Label>
                          <Input
                            placeholder="6.1234"
                            {...register("latitude")}
                            className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-slate-900 transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Longitude
                          </Label>
                          <Input
                            placeholder="-0.6543"
                            {...register("longitude")}
                            className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-slate-900 transition-colors"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                          <MapPinned className="h-3.5 w-3.5 text-slate-400" />
                          Drag the map so the crosshair sits on the plot
                        </Label>
                        <SpatialCoordinatePicker
                          mode="write"
                          latitude={latitude ?? ""}
                          longitude={longitude ?? ""}
                          className="w-full h-64"
                          onChange={({ lat, lng, region, locality }) => {
                            setValue("latitude", lat);
                            setValue("longitude", lng);
                            if (!hasSharedLocation) {
                              if (!getValues("region") && region) {
                                setValue("region", region);
                              }
                              if (!getValues("village") && locality) {
                                setValue("village", locality);
                              }
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {resolvingLocation && (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                    <Loader2 className="h-3 w-3 animate-spin" /> Resolving
                    region from captured coordinates…
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Region
                      {hasSharedLocation && (
                        <span className="ml-1.5 normal-case font-normal text-slate-300">
                          (same for every member)
                        </span>
                      )}
                    </Label>
                    <Input
                      placeholder="e.g. Ashanti"
                      readOnly={hasSharedLocation}
                      tabIndex={hasSharedLocation ? -1 : 0}
                      {...register("region")}
                      className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-slate-900 transition-colors read-only:text-slate-400 read-only:bg-slate-100 read-only:cursor-not-allowed read-only:focus-visible:border-slate-200"
                    />
                    {errors.region && (
                      <p className="text-xs text-red-600">
                        {errors.region.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Village (Optional)
                      {hasSharedLocation && sharedLocation?.village && (
                        <span className="ml-1.5 normal-case font-normal text-slate-300">
                          (same for every member)
                        </span>
                      )}
                    </Label>
                    <Input
                      placeholder="e.g. Ejura"
                      readOnly={hasSharedLocation && !!sharedLocation?.village}
                      tabIndex={
                        hasSharedLocation && sharedLocation?.village ? -1 : 0
                      }
                      {...register("village")}
                      className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-slate-900 transition-colors read-only:text-slate-400 read-only:bg-slate-100 read-only:cursor-not-allowed read-only:focus-visible:border-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Estimated Area (Hectares)
                  </Label>
                  <Input
                    placeholder="e.g. 2.5"
                    {...register("areaHectares")}
                    className="rounded-none border-0 border-b-2 border-slate-200 bg-slate-50 px-4 py-6 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-slate-900 transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 bg-slate-50 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 items-center gap-4 w-full">
            <Button
              variant="ghost"
              type="button"
              onClick={handleClose}
              className="w-full rounded-none text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-none bg-foreground hover:bg-brand text-white px-8 py-6 text-[10px] font-bold uppercase tracking-widest transition-colors"
            >
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                "Add Member"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
