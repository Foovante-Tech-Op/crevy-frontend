"use client";

// F7 — Field-agent "Register Project" entry point. Renders the exact same
// wizard used on the admin dashboard (see NewProjectFlow) — same steps,
// same assessment modules, same backend calls — with the developer
// pre-wired in from the query string instead of asking via
// AssignmentCheckModal, since the agent already knows who this is for
// (they got here from that developer's detail page).

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import NewProjectFlow from "@/components/project-registration/NewProjectFlow";

function AgentRegisterProjectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const developerId = searchParams.get("developerId") ?? undefined;
  const developerCode = searchParams.get("developerCode");
  const developerName = searchParams.get("developerName");

  const label =
    developerName && developerCode
      ? `${developerName} (${developerCode})`
      : undefined;

  return (
    <NewProjectFlow
      mode="agent"
      preselectedProjectOwnerId={developerId}
      preselectedProjectOwnerLabel={label}
      onSubmitSuccess={() => {
        router.push(
          developerCode
            ? `/agent/developers/${developerCode}?projectRegistered=1`
            : "/agent",
        );
      }}
    />
  );
}

export default function AgentRegisterProjectPage() {
  return (
    <Suspense fallback={null}>
      <AgentRegisterProjectInner />
    </Suspense>
  );
}
