"use client";

import {
  ArrowUpRight,
  Building2,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LocationMap } from "@/components/SpatialCoordinatePicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { authClient } from "@/lib/auth";
import { axiosClient } from "@/lib/axiosClient";

// F5 — Profile screen. Read-only except sign-out. Now also shows the
// agent's manager ("Who to call") and a pin-on-current-location map.
//
// Manager info comes from the new backend endpoint `GET /agent/me`, which
// the field-agent service exposes via FieldAgentService.getMyProfile. The
// endpoint also returns the agent's own contact details so the page is
// self-contained and doesn't depend on the better-auth session shape.

type TAgentMe = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string | null;
  countryOfOperation: string | null;
  isActive: boolean;
  createdAt: string;
  assignedAt: string | null;
  registrationsCount: number;
  manager: {
    id: string;
    name: string;
    email: string | null;
    contactNumber: string | null;
  } | null;
};

type TCoords = { lat: number; lon: number } | null;

export default function AgentProfilePage() {
  const { user } = useUser();
  const router = useRouter();

  const [me, setMe] = useState<TAgentMe | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [coords, setCoords] = useState<TCoords>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  // Pull full profile (with manager) from the backend.
  useEffect(() => {
    let cancelled = false;
    axiosClient
      .get("/agent/me")
      .then((res) => {
        if (!cancelled) {
          setMe(res.data?.data ?? null);
        }
      })
      .catch((err) => {
        console.error("[AgentProfile] /agent/me failed:", err);
        // Fall back to whatever the session has so the page still renders.
      })
      .finally(() => {
        if (!cancelled) setLoadingMe(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const requestLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocError("Geolocation is not supported in this browser.");
      return;
    }
    setLocLoading(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocLoading(false);
      },
      (err) => {
        setLocError(err.message || "Could not get your location.");
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  // Prefer the backend's firstName/lastName if available, fall back to the
  // session user so the avatar stays useful while the /agent/me fetch is
  // still in-flight or has failed.
  const displayName = me
    ? `${me.firstName} ${me.lastName}`
    : user
      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
      : "Field Agent";
  const displayEmail = me?.email ?? user?.email ?? "";
  const displayPhone = me?.contactNumber ?? (user as any)?.contactNumber;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Profile</h1>

      {/* Identity card */}
      <Card className="rounded-none">
        <CardContent className="py-6 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white text-xl font-semibold">
            {(me?.firstName ?? user?.firstName)?.charAt(0)?.toUpperCase() || (
              <UserRound className="h-6 w-6" />
            )}
          </div>
          <div>
            <div className="font-semibold text-lg text-slate-900">
              {displayName}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">
              Field Agent
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="rounded-none">
        <CardContent className="py-4 space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-slate-700 break-all">{displayEmail}</span>
          </div>
          {displayPhone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="text-slate-700">{displayPhone}</span>
            </div>
          )}
          {me?.countryOfOperation && (
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="text-slate-700">{me.countryOfOperation}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manager — "Who to call" card */}
      <Card className="rounded-none">
        <CardContent className="py-4 space-y-3">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
            Your Manager
          </div>
          {loadingMe ? (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading...
            </div>
          ) : me?.manager ? (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-900">
                {me.manager.name}
              </div>
              {me.manager.email && (
                <a
                  href={`mailto:${me.manager.email}`}
                  className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span className="break-all">{me.manager.email}</span>
                </a>
              )}
              {me.manager.contactNumber && (
                <a
                  href={`tel:${me.manager.contactNumber}`}
                  className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>{me.manager.contactNumber}</span>
                </a>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              No manager assigned yet. Reach out to support if this looks wrong.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current location (opt-in, no API key) */}
      <Card className="rounded-none">
        <CardContent className="py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              Current Location
            </div>
            <button
              type="button"
              onClick={requestLocation}
              disabled={locLoading}
              className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-900 hover:underline disabled:opacity-50"
            >
              {locLoading
                ? "Locating..."
                : coords
                  ? "Refresh"
                  : "Pin my location"}
            </button>
          </div>

          {locError && <div className="text-xs text-red-500">{locError}</div>}

          {coords ? (
            <>
              <div className="text-xs text-slate-500 font-mono">
                {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}
              </div>
              {/* Same map component used for coordinate picking elsewhere in
                  the app, in read-only mode: a static pin at the current
                  location, vibrant CARTO Voyager basemap, no API key. */}
              <LocationMap
                latitude={coords.lat.toString()}
                longitude={coords.lon.toString()}
                className="aspect-video w-full"
              />
              <Link
                href={`https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lon}#map=17/${coords.lat}/${coords.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900"
              >
                Open in map <ArrowUpRight className="h-3 w-3" />
              </Link>
            </>
          ) : (
            !locError && (
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> Tap &ldquo;Pin my
                location&rdquo; to drop a pin on your current GPS position.
              </div>
            )
          )}
        </CardContent>
      </Card>

      <Button
        variant="outline"
        onClick={handleLogout}
        className="w-full justify-center border-red-200 text-red-700 hover:bg-red-50 rounded-none"
      >
        <LogOut className="h-4 w-4 mr-2" /> Log out
      </Button>
    </div>
  );
}
