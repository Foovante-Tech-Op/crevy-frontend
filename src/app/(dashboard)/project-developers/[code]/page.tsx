"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  MapPin,
  UserRound,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import { type Column, DataTable } from "@/components/DataTable";
import { LocationMap } from "@/components/SpatialCoordinatePicker";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type ProjectOwnerMember,
  ProjectOwnerService,
  type ProjectOwnerSite,
} from "@/lib/services/project-owner-service";
import { cn } from "@/lib/utils";

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
              isFarmPlot
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-blue-50 border-blue-200 text-blue-800",
            )}
          >
            {isFarmPlot ? "Enrolled Farm Plot" : "Project Site"}
          </span>
          <h3 className="font-sans text-base font-bold text-slate-900 mt-2">
            {site.projectName || "Unnamed Project"}
          </h3>
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            {site.projectCode}
          </p>
        </div>
        <Link href={`/projects/${site.projectId}`}>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-none text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            View <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
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
                {site.enrolledAreaHectares} ha
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
  // Compute a representative centroid for the map viewport.
  const mapCenter = useMemo(() => {
    const withCentroid = sites.filter((s) => s.centroid);
    if (withCentroid.length === 0) return null;
    const lat =
      withCentroid.reduce((sum, s) => sum + (s.centroid?.lat ?? 0), 0) /
      withCentroid.length;
    const lng =
      withCentroid.reduce((sum, s) => sum + (s.centroid?.lng ?? 0), 0) /
      withCentroid.length;
    return { lat: lat.toString(), lng: lng.toString() };
  }, [sites]);

  if (sites.length === 0) {
    return (
      <div className="border border-slate-200 bg-slate-50 p-12 text-center">
        <MapPin className="h-8 w-8 text-slate-300 mx-auto mb-4" />
        <p className="font-sans text-lg text-slate-900 mb-2">
          No enrolled sites
        </p>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          This developer has no farm plots enrolled in a project and no project
          sites recorded. Sites will appear once a project is created and
          linked.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border border-slate-200 bg-white">
        <div className="h-96">
          {/* Read-only overview — shows roughly where this developer's sites
              are, doesn't let anyone reposition anything (there's nothing
              here to reposition: it's an average of potentially several
              sites, not any one site's actual location). */}
          <LocationMap
            latitude={mapCenter?.lat ?? ""}
            longitude={mapCenter?.lng ?? ""}
            className="w-full h-full"
          />
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 mb-4">
          Site Inventory ({sites.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      </div>
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
  const [activeTab, setActiveTab] = useState("details");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["project-developer-detail", code],
    queryFn: () => ProjectOwnerService.getProjectOwnerByCode(code),
    enabled: !!code,
  });

  const developer = data?.data;

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
      header: "Profile",
      align: "right",
      render: (member) => (
        <Link href={`/user-management/${member.userId}`}>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-none text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            View <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
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
                value={developer.onboardedBy ?? undefined}
              />
              <InfoRow
                label="Onboarded At"
                value={new Date(developer.onboardedAt).toLocaleDateString()}
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
                <h2 className="text-lg font-sans font-bold text-slate-950 mb-4">
                  Members{" "}
                  <span className="text-slate-400 font-normal">
                    ({developer.members.length})
                  </span>
                </h2>
                <DataTable
                  columns={memberColumns}
                  data={developer.members}
                  emptyMessage="No members have been added to this entity yet."
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
    </div>
  );
}
