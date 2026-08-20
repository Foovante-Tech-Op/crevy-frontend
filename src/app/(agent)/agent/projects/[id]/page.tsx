"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  Calendar,
  FileText,
  Loader2,
  MapPinned,
  Route,
  ShieldAlert,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { LocationMap } from "@/components/SpatialCoordinatePicker";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectService } from "@/lib/services/project-service";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  draft: "bg-slate-50 text-slate-600 border-slate-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

function formatDate(value?: string | null) {
  if (!value) return "TBD";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function normalizeCentroid(
  centroid: unknown,
): { lat: string; lng: string } | null {
  if (!centroid) return null;
  if (Array.isArray(centroid)) {
    const [lng, lat] = centroid;
    return lat != null && lng != null
      ? { lat: String(lat), lng: String(lng) }
      : null;
  }
  const point = centroid as {
    lat?: number;
    lng?: number;
    x?: number;
    y?: number;
  };
  const lat = point.lat ?? point.y;
  const lng = point.lng ?? point.x;
  return lat != null && lng != null
    ? { lat: String(lat), lng: String(lng) }
    : null;
}

function Metric({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="border border-slate-200 bg-white p-4">
      <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-slate-900 break-words">
        {value || "N/A"}
      </div>
    </div>
  );
}

export default function AgentProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["agent-project-detail", id],
    queryFn: () => ProjectService.getProject(id),
    enabled: !!id,
  });

  const project = data?.data;
  const centroid = normalizeCentroid(project?.site?.centroid);
  const assessments = project?.onboardingAssessments ?? [];
  const score = project?.assessmentScore;
  const developer = project?.developer;

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <span className="text-xs">Loading project...</span>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="py-24 flex flex-col items-center text-center gap-3">
        <ShieldAlert className="h-8 w-8 text-red-400" />
        <p className="text-slate-600 text-sm">
          {(error as any)?.response?.data?.message ||
            "Couldn't load this project."}
        </p>
        <Link
          href="/agent/registrations"
          className="text-sm font-medium text-slate-900 underline"
        >
          Back to my registrations
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-slate-400">
            {project.code}
          </span>
          <Badge
            variant="outline"
            className={STATUS_STYLES[project.projectStatus] || ""}
          >
            {project.projectStatus}
          </Badge>
          {project.registryStatus && (
            <Badge variant="outline" className="bg-white text-slate-600">
              {project.registryStatus.replace(/_/g, " ")}
            </Badge>
          )}
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 leading-tight">
          {project.name}
        </h1>
        {project.description && (
          <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">
            {project.description}
          </p>
        )}
      </div>

      <Card className="rounded-none">
        <CardContent className="py-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Building2 className="h-4 w-4 text-slate-400" />
            Project developer
          </div>
          <div>
            <div className="font-medium text-slate-900">
              {developer?.name || "Unknown developer"}
            </div>
            {developer?.code && (
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {developer.code}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Metric
          label="Project type"
          value={project.projectType?.replace(/_/g, " ")}
        />
        <Metric label="Sector" value={project.sector?.replace(/_/g, " ")} />
        <Metric label="Region" value={project.region} />
        <Metric label="Country" value={project.country} />
        <Metric
          label="Area"
          value={
            project.totalAreaHectares ? `${project.totalAreaHectares} ha` : null
          }
        />
        <Metric label="Currency" value={project.currencyCode} />
      </div>

      <Card className="rounded-none">
        <CardContent className="py-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Calendar className="h-4 w-4 text-slate-400" />
            Timeline
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">
                Start
              </div>
              <div className="mt-1 text-slate-900">
                {formatDate(project.startDate)}
              </div>
            </div>
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">
                End
              </div>
              <div className="mt-1 text-slate-900">
                {formatDate(project.endDate)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {project.sdgs?.length > 0 && (
        <Card className="rounded-none">
          <CardContent className="py-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Target className="h-4 w-4 text-slate-400" />
              SDGs
            </div>
            <div className="flex flex-wrap gap-2">
              {project.sdgs.map((sdg: string) => (
                <Badge key={sdg} variant="outline" className="bg-brand-50">
                  {sdg}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-none">
        <CardContent className="py-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FileText className="h-4 w-4 text-slate-400" />
            Assessment
          </div>
          {score ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Metric
                  label="Readiness"
                  value={
                    score.carbonReadinessScore != null
                      ? `${score.carbonReadinessScore}%`
                      : null
                  }
                />
                <Metric
                  label="Data quality"
                  value={
                    score.dataQualityScore != null
                      ? `${score.dataQualityScore}%`
                      : null
                  }
                />
                <Metric
                  label="Additionality"
                  value={
                    score.additionalityScore != null
                      ? `${score.additionalityScore}%`
                      : null
                  }
                />
                <Metric
                  label="Monitoring capability"
                  value={
                    score.monitoringCapabilityScore != null
                      ? `${score.monitoringCapabilityScore}%`
                      : null
                  }
                />
                <Metric
                  label="Documentation"
                  value={
                    score.documentationScore != null
                      ? `${score.documentationScore}%`
                      : null
                  }
                />
                <Metric
                  label="Verification readiness"
                  value={
                    score.verificationReadinessScore != null
                      ? `${score.verificationReadinessScore}%`
                      : null
                  }
                />
              </div>

              {(score.primaryMethodology ||
                score.alternativeMethodology ||
                score.futureMethodologyPathway) && (
                <div className="border border-slate-200 bg-white p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                    <Route className="h-3.5 w-3.5 text-slate-400" />
                    Methodology routes
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Metric label="Primary" value={score.primaryMethodology} />
                    <Metric
                      label="Alternative"
                      value={score.alternativeMethodology}
                    />
                  </div>
                  {score.futureMethodologyPathway && (
                    <div>
                      <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">
                        Future pathway
                      </div>
                      <p className="mt-1 text-sm text-slate-700 leading-relaxed">
                        {score.futureMethodologyPathway}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {(score.calculatedAt || score.scoringEngineVersion) && (
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  {score.calculatedAt &&
                    `Calculated ${formatDate(score.calculatedAt)}`}
                  {score.calculatedAt && score.scoringEngineVersion && " • "}
                  {score.scoringEngineVersion &&
                    `Engine v${score.scoringEngineVersion}`}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500">
              No assessment score has been calculated yet.
            </p>
          )}
          {assessments.length > 0 && (
            <div className="space-y-2">
              {assessments.map((assessment: any) => (
                <div
                  key={assessment.id || assessment.moduleKey}
                  className="flex items-center justify-between gap-3 border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <span className="text-sm text-slate-700 min-w-0 truncate">
                    {assessment.moduleKey?.replace(/_/g, " ")}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0",
                      assessment.status === "submitted"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-white text-slate-500",
                    )}
                  >
                    {assessment.status?.replace(/_/g, " ") || "not started"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {centroid && (
        <Card className="rounded-none">
          <CardContent className="py-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <MapPinned className="h-4 w-4 text-slate-400" />
              Site location
            </div>
            <LocationMap
              latitude={centroid.lat}
              longitude={centroid.lng}
              className="w-full h-64"
              locationLabel={[project.region, project.country]
                .filter(Boolean)
                .join(", ")}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
