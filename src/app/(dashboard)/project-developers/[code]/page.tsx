"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  MapPin,
  UserPlus,
  UserRound,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import { AddMemberModal } from "@/components/AddMemberModal";
import { type Column, DataTable } from "@/components/DataTable";
import {
  LocationMap,
  type TMapMarker,
} from "@/components/SpatialCoordinatePicker";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { axiosClient } from "@/lib/axiosClient";
import {
  type ProjectOwnerMember,
  ProjectOwnerService,
  type ProjectOwnerSite,
} from "@/lib/services/project-owner-service";
import { cn } from "@/lib/utils";
import { KycDecisionPanel } from "./_components/KycDecisionPanel";

// ─── Editorial Configs (mirrors the list page's styling) ─────────────────────

const verificationConfig: Record<
  string,
  { label: string; className: string; bg: string; dot: string }
> = {
  pending: {
    label: "Pending KYC",
    className: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    dot: "bg-amber-500",
  },
  verified: {
    label: "Verified Entity",
    className: "text-brand-800",
    bg: "bg-brand-50 border-brand-200",
    dot: "bg-brand-500",
  },
  rejected: {
    label: "KYC Failed",
    className: "text-red-700",
    bg: "bg-red-50 border-red-200",
    dot: "bg-red-500",
  },
};

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "PD";

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-12 gap-4 py-4 border-b border-slate-200 last:border-0">
      <div className="col-span-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center">
        {label}
      </div>
      <div
        className={cn(
          "col-span-8 text-sm font-semibold text-slate-900",
          mono && "font-mono",
        )}
      >
        {value}
      </div>
    </div>
  );
}

// A member's own display name lives on the `user` row (firstName/lastName),
// separate from project_developer.name (the entity name — for a cooperative
// or company that's the org name, not any one member's name).
function memberDisplayName(member: ProjectOwnerMember): string {
  const name = [member.firstName, member.lastName].filter(Boolean).join(" ");
  return name || "Unnamed member";
}

const roleLabel: Record<ProjectOwnerMember["role"], string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

function SiteCard({ site }: { site: ProjectOwnerSite }) {
  const isFarmPlot = site.kind === "farm_plot";

  return (
    <div className="border border-slate-200 bg-white p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span
            className={cn(
              "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border",
              !site.isEnrolled
                ? "bg-slate-50 border-slate-200 text-slate-600"
                : isFarmPlot
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-blue-50 border-blue-200 text-blue-800",
            )}
          >
            {!site.isEnrolled
              ? "Registered Parcel"
              : isFarmPlot
                ? "Enrolled Farm Plot"
                : "Project Site"}
          </span>
          {/* An unenrolled parcel has no project, so it is titled by whose
              land it is and where. Titling it "Unnamed Project" — which is
              what the old fallback did the moment projectName was null —
              invents a project that does not exist. */}
          <h3 className="font-sans text-base font-bold text-slate-900 mt-2">
            {site.isEnrolled
              ? site.projectName || "Unnamed Project"
              : isFarmPlot
                ? (site.memberName ??
                  [site.village, site.region].filter(Boolean).join(", ") ??
                  "Parcel")
                : "Unassigned site"}
          </h3>
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            {site.isEnrolled ? site.projectCode : "Not enrolled in a project"}
          </p>
        </div>
        {/* Only enrolled sites have somewhere to go. The link used to render
            unconditionally, which for a parcel with no project resolved to
            /projects/null. */}
        {site.isEnrolled && site.projectId && (
          <Link href={`/projects/${site.projectId}`}>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-none text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              View <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        {isFarmPlot ? (
          <>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">
                Region
              </span>
              <span className="font-medium text-slate-900">
                {site.region || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">
                Village
              </span>
              <span className="font-medium text-slate-900">
                {site.village || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">
                Enrolled Area
              </span>
              <span className="font-medium text-slate-900">
                {site.isEnrolled ? `${site.enrolledAreaHectares} ha` : "—"}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">
                Total Plot Area
              </span>
              <span className="font-medium text-slate-900">
                {site.areaHectares} ha
              </span>
            </div>
          </>
        ) : (
          <>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">
                Site Type
              </span>
              <span className="font-medium text-slate-900 capitalize">
                {site.siteType.replace(/_/g, " ")}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">
                Facility
              </span>
              <span className="font-medium text-slate-900">
                {site.facilityName || "N/A"}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">
                Address
              </span>
              <span className="font-medium text-slate-900">
                {site.address || "N/A"}
              </span>
            </div>
          </>
        )}
      </div>

      {site.centroid && (
        <div className="font-mono text-[10px] text-slate-500 flex items-center gap-2">
          <MapPin className="h-3 w-3" />
          {site.centroid.lat.toFixed(6)}, {site.centroid.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
}

function SitesTab({ sites }: { sites: ProjectOwnerSite[] }) {
  // One pin per site, replacing an averaged centroid.
  //
  // What was here computed the arithmetic mean of every site's coordinates
  // and dropped a single pin on it. That point is not any of the sites: for
  // a developer with parcels in two regions it lands halfway between them,
  // which around here is often the Gulf of Guinea. It answered no question
  // anyone had — not "where is this parcel", not "how spread out is this
  // developer's land" — and it looked authoritative while doing it.
  const markers = useMemo<TMapMarker[]>(
    () =>
      sites
        .filter((s) => s.centroid)
        .map((s) => {
          const centroid = s.centroid as { lat: number; lng: number };

          if (s.kind === "farm_plot") {
            const where = [s.village, s.region].filter(Boolean).join(", ");
            return {
              id: s.id,
              lat: centroid.lat,
              lng: centroid.lng,
              label: s.memberName ?? where ?? "Parcel",
              detail: s.isEnrolled
                ? `${s.enrolledAreaHectares} of ${s.areaHectares} ha — ${s.projectCode}`
                : `${s.areaHectares} ha — not enrolled`,
              variant: s.isEnrolled ? "solid" : "outline",
            };
          }

          return {
            id: s.id,
            lat: centroid.lat,
            lng: centroid.lng,
            label: s.facilityName || "Project site",
            detail: [s.siteType?.replace(/_/g, " "), s.projectCode]
              .filter(Boolean)
              .join(" — "),
            variant: "solid",
          };
        }),
    [sites],
  );

  // Split rather than filtered. "This developer has no land" and "this
  // developer's land isn't in a project yet" are different situations with
  // different next actions, and the tab previously showed only the second
  // group — so eight registered parcels rendered as "No enrolled sites".
  const { enrolled, registered } = useMemo(
    () => ({
      enrolled: sites.filter((s) => s.isEnrolled),
      registered: sites.filter((s) => !s.isEnrolled),
    }),
    [sites],
  );

  const totalHa = (rows: ProjectOwnerSite[]) =>
    rows
      .reduce((sum, s) => {
        if (s.kind !== "farm_plot") return sum;
        const ha = Number(
          s.isEnrolled ? s.enrolledAreaHectares : s.areaHectares,
        );
        return sum + (Number.isFinite(ha) ? ha : 0);
      }, 0)
      .toFixed(2);

  if (sites.length === 0) {
    return (
      <div className="border border-slate-200 bg-slate-50 p-12 text-center">
        <MapPin className="h-8 w-8 text-slate-300 mx-auto mb-4" />
        <p className="font-sans text-lg text-slate-900 mb-2">
          No land on record
        </p>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          No parcels have been captured for this developer yet. A field agent
          records them during registration, or you can add them from a member's
          row.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border border-slate-200 bg-white">
        <div className="h-96">
          <LocationMap markers={markers} className="w-full h-full" />
        </div>
        <div className="flex flex-wrap items-center gap-6 border-t border-slate-200 px-5 py-3">
          <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
            Enrolled in a project ({enrolled.length})
          </span>
          <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
            Registered, not enrolled ({registered.length})
          </span>
          {markers.length < sites.length && (
            <span className="text-[10px] uppercase tracking-widest text-amber-700">
              {sites.length - markers.length} without coordinates
            </span>
          )}
        </div>
      </div>

      {enrolled.length > 0 && (
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 mb-4">
            Enrolled in a project ({enrolled.length}) · {totalHa(enrolled)} ha
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrolled.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
        </div>
      )}

      {registered.length > 0 && (
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 mb-1">
            Registered, not enrolled ({registered.length}) ·{" "}
            {totalHa(registered)} ha
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Captured land that no project is using yet. Available to enrol when
            a project is registered for this developer.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registered.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectDeveloperDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("details");
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["project-developer-detail", code],
    queryFn: () => ProjectOwnerService.getProjectOwnerByCode(code),
    enabled: !!code,
  });

  const developer = data?.data;

  // Best-effort — the developer's primary captured location (if any),
  // used to pre-fill/gray-out Region & Village in the Add Member modal so
  // every member isn't asked to re-enter the same area.
  const { data: plotsRes } = useQuery({
    queryKey: ["project-developer-plots", developer?.id],
    queryFn: async () => {
      const res = await axiosClient.get("/farm-plots", {
        params: { projectOwnerId: developer?.id, limit: 1 },
      });
      return res.data as { data: any[] };
    },
    enabled: !!developer?.id,
  });
  const primaryPlot = plotsRes?.data?.[0];

  if (isLoading) {
    return (
      <div className="min-h-screen pt-40 flex flex-col items-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <span className="text-[10px] font-mono uppercase tracking-[0.2em]">
          Retrieving developer dossier...
        </span>
      </div>
    );
  }

  if (isError || !developer) {
    return (
      <div className="min-h-screen pt-40 flex flex-col items-center text-center">
        <XCircle className="h-10 w-10 text-red-500 mb-4" />
        <p className="font-sans text-xl text-slate-900 mb-2">
          Dossier Retrieval Failed
        </p>
        <Link
          href="/project-developers"
          className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 border-b border-slate-900 pb-0.5"
        >
          Return to Directory
        </Link>
      </div>
    );
  }

  const vc =
    verificationConfig[developer.verificationStatus] ??
    verificationConfig.pending;
  const isIndividual = developer.entityType === "individual";
  const soleMember = developer.members[0];
  const sites = developer.sites ?? [];

  const memberColumns: Column<ProjectOwnerMember>[] = [
    {
      header: "Member",
      render: (member) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center text-xs font-bold shrink-0 bg-foreground text-background">
            {getInitials(memberDisplayName(member))}
          </div>
          <span className="font-sans text-sm text-foreground font-bold">
            {memberDisplayName(member)}
          </span>
        </div>
      ),
    },
    {
      header: "Role",
      render: (member) => (
        <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
          {roleLabel[member.role] ?? member.role}
        </span>
      ),
    },
    {
      header: "Contact",
      render: (member) => (
        <div className="text-[11px] font-mono text-muted-foreground">
          <div>{member.email || "—"}</div>
          {member.contactNumber && <div>{member.contactNumber}</div>}
        </div>
      ),
    },
    {
      header: "Status",
      render: (member) => (
        <span
          className={cn(
            "px-2 py-1 text-[9px] font-bold uppercase tracking-widest border",
            member.isActive
              ? "bg-brand-50 border-brand-200 text-brand-800"
              : "bg-slate-50 border-slate-200 text-slate-500",
          )}
        >
          {member.isActive ? "Active" : "Suspended"}
        </span>
      ),
    },
    {
      header: "Account",
      render: (member) => (
        <div className="flex flex-col gap-1">
          <span
            className={cn(
              "px-2 py-1 text-[9px] font-bold uppercase tracking-widest border inline-block w-fit",
              member.hasEmailAccess
                ? "bg-brand-50 border-brand-200 text-brand-800"
                : "bg-slate-50 border-slate-200 text-slate-500",
            )}
          >
            {member.hasEmailAccess ? "Has account" : "Roster only"}
          </span>
          <span
            className={cn(
              "px-2 py-1 text-[9px] font-bold uppercase tracking-widest border inline-block w-fit",
              member.agentManagesAccount
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-slate-50 border-slate-200 text-slate-400",
            )}
          >
            {member.agentManagesAccount ? "Agent consented" : "No consent"}
          </span>
        </div>
      ),
    },
    {
      header: "Profile",
      align: "right",
      render: (member) =>
        member.userId ? (
          <Link href={`/user-management/${member.userId}`}>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-none text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              View <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <span className="text-[10px] font-mono text-slate-300">
            No account
          </span>
        ),
    },
  ];

  return (
    <div className="animate-in fade-in duration-700 pb-24">
      {/* ── Editorial Header ── */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <button
            type="button"
            onClick={() => router.push("/project-developers")}
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-8"
          >
            <ArrowLeft className="w-3 h-3" /> Developer Directory
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-slate-900 text-white flex items-center justify-center text-2xl font-sans">
                {getInitials(developer.name)}
              </div>
              <div>
                <h1 className="text-4xl font-sans text-slate-900 tracking-tight leading-none mb-3">
                  {developer.name}
                </h1>
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-mono text-slate-500 uppercase tracking-[0.2em]">
                    {developer.code}
                  </span>
                  <span
                    className={cn(
                      "px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 border",
                      vc.bg,
                      vc.className,
                    )}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full", vc.dot)} />
                    {vc.label}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    {developer.entityType || "unspecified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Add Members button — only relevant for cooperatives and
                companies. An 'individual' entity can only ever have one
                member (the person themselves), so the button is hidden. */}
            {!isIndividual && (
              <Button
                onClick={() => setAddMemberOpen(true)}
                className="rounded-none bg-slate-900 hover:bg-brand text-white text-[10px] font-bold uppercase tracking-widest transition-colors h-12 px-6 shrink-0"
              >
                <UserPlus className="h-4 w-4 mr-2" /> Add Member
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 rounded-none bg-transparent border-b border-slate-200 w-full justify-start h-auto p-0 gap-6">
            <TabsTrigger
              value="details"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 data-[state=active]:text-slate-900"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="sites"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 data-[state=active]:text-slate-900"
            >
              Plots & Sites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-8">
            {/* ── KYC Review ──
                The approve/reject control. Placed above the captured details
                rather than below them because the decision is the reason an
                admin opens this screen; the details are what they read to
                make it. */}
            <KycDecisionPanel
              developerId={developer.id}
              developerName={developer.name}
              status={developer.verificationStatus}
              verifiedByName={developer.verifiedByName}
              verifiedAt={developer.verifiedAt}
              rejectionReason={developer.rejectionReason}
              onDecided={() => {
                queryClient.invalidateQueries({
                  queryKey: ["project-developer-detail", code],
                });
              }}
            />

            {/* ── Developer Details ── */}
            <div className="border border-slate-200 p-6 bg-white">
              <h2 className="text-lg font-sans font-bold text-slate-950 mb-2">
                Developer Details
              </h2>
              <InfoRow label="Registry Code" value={developer.code} mono />
              <InfoRow
                label="Entity Type"
                value={developer.entityType ?? undefined}
              />
              <InfoRow
                label="Onboarded By"
                // Falls back to a stated unknown rather than the raw id: if the
                // onboarder's account has since been removed there is no name
                // to resolve, and an opaque id is worse than saying so.
                value={
                  developer.onboardedByName ??
                  (developer.onboardedBy
                    ? "Unknown — account no longer exists"
                    : undefined)
                }
              />
              <InfoRow
                label="Onboarded At"
                value={new Date(developer.onboardedAt).toLocaleDateString()}
              />
              <InfoRow label="Verified By" value={developer.verifiedByName} />
              <InfoRow
                label="Verified At"
                value={
                  developer.verifiedAt
                    ? new Date(developer.verifiedAt).toLocaleDateString()
                    : undefined
                }
              />
              <InfoRow
                label="Rejection Reason"
                value={developer.rejectionReason}
              />
              <InfoRow
                label="Site Activity Note"
                value={developer.siteActivityNote}
              />
              <InfoRow
                label="On-site Contact Phone"
                value={developer.contactPhone}
                mono
              />
              <InfoRow
                label="On-site Contact Email"
                value={developer.contactEmail}
                mono
              />
              <InfoRow
                label="Bank Details"
                value={
                  developer.bankDetails
                    ? `${developer.bankDetails.bankName} · ${developer.bankDetails.accountNumber}`
                    : undefined
                }
                mono
              />
              <InfoRow
                label="Mobile Money"
                value={
                  developer.momoDetails
                    ? `${developer.momoDetails.network} · ${developer.momoDetails.number}`
                    : undefined
                }
                mono
              />
            </div>

            {/* ── Individual: show the sole member's details right after the
                 developer details, inline — a data table is overkill for one
                 person, and this is the only member an 'individual' entity
                 will ever have. ── */}
            {isIndividual ? (
              <div className="border border-slate-200 p-6 bg-white">
                <h2 className="text-lg font-sans font-bold text-slate-950 mb-2 flex items-center gap-2">
                  <UserRound className="w-4 h-4 text-slate-400" /> Member
                  Details
                </h2>
                {soleMember ? (
                  <>
                    <InfoRow
                      label="Full Name"
                      value={memberDisplayName(soleMember)}
                    />
                    <InfoRow label="Email" value={soleMember.email} mono />
                    <InfoRow
                      label="Contact Number"
                      value={soleMember.contactNumber}
                      mono
                    />
                    <InfoRow
                      label="Account Status"
                      value={soleMember.isActive ? "Active" : "Suspended"}
                    />
                    <InfoRow
                      label="Joined"
                      value={new Date(soleMember.joinedAt).toLocaleDateString()}
                    />
                    {soleMember.userId && (
                      <div className="pt-4">
                        <Link href={`/user-management/${soleMember.userId}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-none text-xs"
                          >
                            View Full Profile{" "}
                            <ExternalLink className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-slate-400 py-4">
                    No member account is linked to this developer yet.
                  </p>
                )}
              </div>
            ) : (
              /* ── Cooperative / company: a data table of every member, each
                   row linking to that member's own profile. ── */
              <div className="border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-sans font-bold text-slate-950">
                    Members{" "}
                    <span className="text-slate-400 font-normal">
                      ({developer.members.length})
                    </span>
                  </h2>
                  <Button
                    onClick={() => setAddMemberOpen(true)}
                    variant="outline"
                    size="sm"
                    className="rounded-none border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900 hover:border-slate-900 transition-colors"
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Add Member
                  </Button>
                </div>
                <DataTable
                  columns={memberColumns}
                  data={developer.members}
                  emptyMessage="No members have been added to this entity yet. Use the button above to register the first member."
                  currentPage={1}
                  totalPages={1}
                  onPageChange={() => {}}
                  getRowKey={(member) => member.id}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="sites">
            <SitesTab sites={sites} />
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Add Member Modal ── */}
      {!isIndividual && (
        <AddMemberModal
          isOpen={addMemberOpen}
          onClose={() => setAddMemberOpen(false)}
          projectDeveloperId={developer.id}
          sharedLocation={
            primaryPlot
              ? { region: primaryPlot.region, village: primaryPlot.village }
              : null
          }
          onSuccess={() => {
            // Invalidate the detail query so the member table refreshes
            // immediately after the modal closes.
            queryClient.invalidateQueries({
              queryKey: ["project-developer-detail", code],
            });
          }}
        />
      )}
    </div>
  );
}
