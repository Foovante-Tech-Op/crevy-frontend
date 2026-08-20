"use client";

// F7 — Field-agent developer detail + "Register Project" entry point.
//
// Mirrors (dashboard)/project-developers/[code]/page.tsx at a glance, but
// trimmed down for the mobile agent context: no member data table, no
// multi-site inventory grid — just enough to confirm "yes, this is the
// developer I just registered" plus the one action that matters here.
//
// GET /project-developers/code/:code requires only requireAuth (no
// project_developer:view permission gate), so any authenticated field
// agent can already load this — including a developer another agent
// registered, same as any admin can. Registering a NEW project for them
// is what's actually scoped: ProjectService.createProject falls back to
// (and hasProjectAccess/listProjects check) the agent's own active
// project_owner_assignment row, so an agent can only build projects for
// developers assigned to them.

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  FolderPlus,
  Loader2,
  Mail,
  MapPinned,
  Phone,
  Search,
  StickyNote,
  UserPlus,
  UserRound,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentType } from "react";
import { use, useMemo, useState } from "react";
import { AddMemberModal } from "@/components/AddMemberModal";
import { LocationMap } from "@/components/SpatialCoordinatePicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { axiosClient } from "@/lib/axiosClient";
import { ProjectOwnerService } from "@/lib/services/project-owner-service";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const SITE_KIND_LABELS: Record<string, string> = {
  farm_plot: "Farm plot",
  project_site: "Project site",
};

const SITES_PAGE_SIZE = 8;

function InfoLine({
  icon: Icon,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 text-sm text-slate-700">
      <Icon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
      <span className="min-w-0 break-words">{value}</span>
    </div>
  );
}

export default function AgentDeveloperDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [siteSearch, setSiteSearch] = useState("");
  const [siteKind, setSiteKind] = useState<
    "all" | "farm_plot" | "project_site"
  >("all");
  const [sitePage, setSitePage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["agent-developer-detail", code],
    queryFn: () => ProjectOwnerService.getProjectOwnerByCode(code),
    enabled: !!code,
  });

  const developer = data?.data;

  // Best-effort — the low-confidence plot captured at registration time
  // (if any). Not present for developers registered without a location,
  // or once it's been superseded by proper project enrollment (shown via
  // developer.sites instead, same as the admin detail page).
  const { data: plotsRes } = useQuery({
    queryKey: ["agent-developer-plots", developer?.id],
    queryFn: async () => {
      const res = await axiosClient.get("/farm-plots", {
        params: { projectOwnerId: developer?.id, limit: 1 },
      });
      return res.data as { data: any[] };
    },
    enabled: !!developer?.id,
  });
  const plot = plotsRes?.data?.[0];
  const plotCentroid = plot?.centroid
    ? { lat: plot.centroid.y, lng: plot.centroid.x }
    : null;

  const allSites = useMemo(() => developer?.sites ?? [], [developer?.sites]);

  const filteredSites = useMemo(() => {
    const term = siteSearch.trim().toLowerCase();
    return allSites.filter((site) => {
      if (siteKind !== "all" && site.kind !== siteKind) return false;
      if (!term) return true;
      return (
        site.projectName?.toLowerCase().includes(term) ||
        site.projectCode?.toLowerCase().includes(term)
      );
    });
  }, [allSites, siteSearch, siteKind]);

  const siteTotalPages = Math.max(
    1,
    Math.ceil(filteredSites.length / SITES_PAGE_SIZE),
  );
  const currentSitePage = Math.min(sitePage, siteTotalPages);
  const pagedSites = filteredSites.slice(
    (currentSitePage - 1) * SITES_PAGE_SIZE,
    currentSitePage * SITES_PAGE_SIZE,
  );

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <span className="text-xs">Loading developer…</span>
      </div>
    );
  }

  if (isError || !developer) {
    return (
      <div className="py-24 flex flex-col items-center text-center gap-3">
        <XCircle className="h-8 w-8 text-red-400" />
        <p className="text-slate-600 text-sm">Couldn't load this developer.</p>
        <Link
          href="/agent/registrations"
          className="text-sm font-medium text-slate-900 underline"
        >
          Back to my registrations
        </Link>
      </div>
    );
  }

  const registerProjectHref = `/agent/register-project?developerId=${developer.id}&developerCode=${developer.code}&developerName=${encodeURIComponent(developer.name)}`;
  const isIndividual = developer.entityType === "individual";

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          {developer.name}
        </h1>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs font-mono text-slate-400">
            {developer.code}
          </span>
          <Badge
            variant="outline"
            className={STATUS_STYLES[developer.verificationStatus] || ""}
          >
            {developer.verificationStatus}
          </Badge>
        </div>
      </div>

      <Link href={registerProjectHref}>
        <Button className="w-full h-14 rounded-none bg-brand hover:bg-brand/90 text-white text-base font-semibold">
          <FolderPlus className="h-5 w-5 mr-2" />
          Register Project
        </Button>
      </Link>

      <Card className="rounded-none">
        <CardContent className="py-5 space-y-3.5">
          <InfoLine
            icon={Building2}
            value={
              developer.entityType
                ? developer.entityType.charAt(0).toUpperCase() +
                  developer.entityType.slice(1)
                : "Unspecified entity type"
            }
          />
          {developer.contactPhone && (
            <InfoLine icon={Phone} value={developer.contactPhone} />
          )}
          {developer.contactEmail && (
            <InfoLine icon={Mail} value={developer.contactEmail} />
          )}
          {developer.siteActivityNote && (
            <InfoLine icon={StickyNote} value={developer.siteActivityNote} />
          )}
          {!developer.contactPhone &&
            !developer.contactEmail &&
            developer.members.length === 0 && (
              <p className="text-xs text-slate-400">
                No contact details captured for this developer yet.
              </p>
            )}
        </CardContent>
      </Card>

      {plot && (
        <Card className="rounded-none">
          <CardContent className="py-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
              <MapPinned className="h-4 w-4 text-slate-400" />
              Farm plot
            </div>
            <p className="text-xs text-slate-500">
              {[plot.region, plot.village].filter(Boolean).join(", ") ||
                "Location captured"}
              {plot.areaHectares ? ` · ${plot.areaHectares} ha` : ""}
            </p>
            {plotCentroid && (
              <LocationMap
                latitude={String(plotCentroid.lat)}
                longitude={String(plotCentroid.lng)}
                className="w-full h-48"
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Members — only relevant for cooperatives/companies. An 'individual'
          entity only ever has the one person, so there's nothing to add. */}
      {!isIndividual && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Members ({developer.members.length})
            </h2>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setAddMemberOpen(true)}
              className="rounded-none text-xs"
            >
              <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Add Member
            </Button>
          </div>
          {developer.members.length === 0 ? (
            <Card className="rounded-none">
              <CardContent className="py-6 flex flex-col items-center text-center gap-1.5">
                <UserRound
                  className="h-6 w-6 text-slate-300"
                  strokeWidth={1.5}
                />
                <p className="text-xs text-slate-400">No members added yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {developer.members.map((member) => (
                <Card key={member.id} className="rounded-none">
                  <CardContent className="py-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 text-sm truncate">
                        {[member.firstName, member.lastName]
                          .filter(Boolean)
                          .join(" ") || "Unnamed member"}
                      </div>
                      <div className="text-xs text-slate-400">
                        {member.contactNumber || member.email || "—"}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <Badge
                          variant="outline"
                          className={
                            member.hasEmailAccess
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"
                              : "bg-slate-50 text-slate-500 border-slate-200 text-[10px]"
                          }
                        >
                          {member.hasEmailAccess
                            ? "Has account"
                            : "No account (roster only)"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            member.agentManagesAccount
                              ? "bg-amber-50 text-amber-700 border-amber-200 text-[10px]"
                              : "bg-slate-50 text-slate-500 border-slate-200 text-[10px]"
                          }
                        >
                          {member.agentManagesAccount
                            ? "Consented to agent managing"
                            : "Not consented"}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize shrink-0">
                      {member.role}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {allSites.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Registered projects ({filteredSites.length})
          </h2>

          <div className="space-y-2 mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                placeholder="Search by name or code..."
                value={siteSearch}
                onChange={(e) => {
                  setSiteSearch(e.target.value);
                  setSitePage(1);
                }}
                className="w-full rounded-none border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(["all", "farm_plot", "project_site"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    setSiteKind(k);
                    setSitePage(1);
                  }}
                  className={`px-3 py-1.5 rounded-none text-xs font-medium whitespace-nowrap transition-colors ${
                    siteKind === k
                      ? "bg-foreground text-white"
                      : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  {k === "all" ? "All" : SITE_KIND_LABELS[k]}
                </button>
              ))}
            </div>
          </div>

          {filteredSites.length === 0 ? (
            <Card className="rounded-none">
              <CardContent className="py-6 flex flex-col items-center text-center gap-1.5">
                <p className="text-xs text-slate-400">
                  No projects match this filter.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-2">
                {pagedSites.map((site) => (
                  <Link
                    key={site.id}
                    href={`/agent/projects/${site.projectId}`}
                  >
                    <Card className="rounded-none hover:border-slate-400 transition-colors">
                      <CardContent className="py-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 text-sm truncate">
                            {site.projectName || "Unnamed project"}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-slate-400 font-mono">
                              {site.projectCode}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-slate-50 text-slate-500 border-slate-200"
                            >
                              {SITE_KIND_LABELS[site.kind]}
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {siteTotalPages > 1 && (
                <div className="flex items-center justify-between mt-3">
                  <button
                    type="button"
                    disabled={currentSitePage <= 1}
                    onClick={() => setSitePage((p) => Math.max(1, p - 1))}
                    className="text-xs font-medium text-slate-600 disabled:text-slate-300 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                  <span className="text-xs text-slate-400">
                    Page {currentSitePage} of {siteTotalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentSitePage >= siteTotalPages}
                    onClick={() =>
                      setSitePage((p) => Math.min(siteTotalPages, p + 1))
                    }
                    className="text-xs font-medium text-slate-600 disabled:text-slate-300 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {!isIndividual && (
        <AddMemberModal
          isOpen={addMemberOpen}
          onClose={() => setAddMemberOpen(false)}
          projectDeveloperId={developer.id}
          sharedLocation={
            plot ? { region: plot.region, village: plot.village } : null
          }
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ["agent-developer-detail", code],
            });
          }}
        />
      )}
    </div>
  );
}
