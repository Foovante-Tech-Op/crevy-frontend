# Dashboard Redesign — Decision Record & Implementation Plan

> **Status:** Approved for implementation
> **Scope:** `src/app/(dashboard)/dashboard/`, `src/app/(public)/layout.tsx`, `src/components/`
> **Grounded in:** Full read of all 4 dashboard components, all service files, all hooks,
> `sidebar-items.ts`, `user.types.ts`, and the backend's scoring/assessment architecture
> **Authors:** Expert council session — Product, UX Architecture, Frontend, Backend, Carbon Domain

---

## 1. Council Discussion Summary

### The problem, stated precisely

The dashboard index is four separate components with no shared data contract,
no live KPI data wired (everything hardcoded), no buyer dashboard at all, and
a role-switcher in `page.tsx` whose `switch` statement is already out of sync
with the `TRole` type (e.g. `project_developer` appears in the entity rename plan
but is not handled). The `OrgAdminDashboard` exists but only org_admin/
sustainability_manager/org_auditor roles enter it — there is no `buyer` case.

### What actually exists vs what's claimed

Reading the code directly:

| Component               | Has live data? | Connected hooks/services                       | State          |
| ----------------------- | -------------- | ---------------------------------------------- | -------------- |
| `SuperAdminDashboard`   | Partly         | `useWaitlistRegistrations` (wired this sprint) | Updated        |
| `AdminDashboard`        | No             | None                                           | All mock       |
| `OrgAdminDashboard`     | No             | None                                           | All mock       |
| `ProjectOwnerDashboard` | Yes            | `ProjectService.getProjects` via `useQuery`    | Partially live |

`ProjectOwnerDashboard` is the most mature — it already fetches real project
data per `userId`, derives `activeProjects`, `verificationProjects`, and
`totalArea` from the response, and renders a live table. The other three are
entirely mock and silently lie.

### Design decisions reached

**Frontend architect:** The `Shared.tsx` primitives (`StatCard`, `SectionLabel`,
`AlertStrip`, `MrvPipelineStepper`) are already well-built and used consistently
across all four components. Extract them into `src/components/dashboard/` as the
shared design-system layer. The `AdminDashboard`'s tabbed domain view
(Project Operations / MRV & Credits / Financial Routing) is a good UX pattern
and should be preserved, not replaced.

**UX architect:** Every dashboard should answer one dominant question above the
fold. The `AdminDashboard`'s tabbed layout actually obscures the most urgent
signal — an admin shouldn't have to switch tabs to see if there are pending
actions. The alert strip should be unconditional and above the tabs, always
visible. The tab pattern is correct for deep-dive but not for the initial scan.

**Backend/data architect:** We have three service files covering everything we
need for live KPIs: `ProjectService`, `ProjectOwnerService`, `CreditService`,
`WaitlistService`. The gap is aggregation — none of these return a "total
credits issued" or "platform revenue MTD" figure because those require a
dedicated `/v2/dashboard/stats` endpoint that doesn't exist yet. Everything
else is achievable with existing endpoints today.

The cleanest approach: a single `GET /v2/dashboard/stats` endpoint that accepts
a `role` parameter and returns a role-scoped summary object. The frontend calls
it once per session, caches aggressively (5min TTL), and supplements it with
live list queries for the table sections.

**Carbon domain lead:** The `ProjectOwnerDashboard` currently shows
"Verified Yield: —" and "Settlement Revenue: [chart placeholder]" — both will
stay empty until the project completes MRV verification, which for a Ghana pilot
is months away. What IS immediately meaningful is the Carbon Readiness Score from
`project_assessment_score`, which updates as the project owner fills in
assessment modules. This should be the hero KPI for `project_owner`, replacing
the yield-centric framing that doesn't apply yet. The score and the module
completion checklist are the project owner's actual daily workflow.

**Product:** Role taxonomy is:

```
super_admin           → SuperAdminDashboard (platform operator)
admin                 → AdminDashboard
project_manager       → AdminDashboard
mrv_admin             → AdminDashboard
financial_admin       → AdminDashboard
project_owner         → ProjectDeveloperDashboard (renamed/rebuilt)
org_admin             → BuyerDashboard (renamed from OrgAdminDashboard)
sustainability_manager → BuyerDashboard
org_auditor           → BuyerDashboard
```

`buyer` is a future role string — add a case to `page.tsx` routing to
`BuyerDashboard` but don't build a separate component; it's the same view.

---

## 2. Role → Template Map (source of truth for `page.tsx`)

```tsx
// src/app/(dashboard)/dashboard/page.tsx — target switch statement
switch (role) {
  case "super_admin":
    return <SuperAdminDashboard userName={userName} />;

  case "admin":
  case "project_manager":
  case "mrv_admin":
  case "financial_admin":
    return <AdminDashboard userName={userName} role={role} />;

  case "project_owner":
    return <ProjectDeveloperDashboard userName={userName} />;

  case "org_admin":
  case "sustainability_manager":
  case "org_auditor":
  case "buyer": // future role string, same view
    return <BuyerDashboard userName={userName} role={role} />;

  default:
    return NO_ROLE_UI;
}
```

---

## 3. SuperAdminDashboard

**File:** `src/app/(dashboard)/dashboard/_components/SuperAdminDashboard.tsx`
**Status:** Updated this sprint. Live waitlist data wired.

### Sections (in render order)

| #   | Section              | Component                | Data source                               | Status           |
| --- | -------------------- | ------------------------ | ----------------------------------------- | ---------------- |
| 1   | Hero Dossier         | Custom grid              | `session.user.name`, mock counts          | Mock counts only |
| 2   | Alert Strip          | `AlertStrip`             | Derived from section 4 + mock             | Partially live   |
| 3   | Registry KPIs        | 4× `StatCard`            | MOCK — needs `/dashboard/stats`           | ❌ Mock          |
| 4   | Waitlist KPIs        | 4× `StatCard`            | `useWaitlistRegistrations`                | ✅ Live          |
| 5   | Waitlist Table       | `DataTable<WaitlistRow>` | `useWaitlistRegistrations({ limit: 10 })` | ✅ Live          |
| 6   | Financial Settlement | 3 custom cards           | MOCK                                      | ❌ Mock          |
| 7   | MRV Pipeline Stepper | `MrvPipelineStepper`     | MOCK counts                               | ❌ Mock          |
| 8   | System Diagnostics   | Custom list              | MOCK                                      | ❌ Mock          |
| 9   | Activity Feed        | Custom list              | MOCK — needs `/audit?limit=5`             | ❌ Mock          |

### Waitlist DataTable columns (implemented)

```
Applicant | Email | Organization | Role | Country | Status | Registered
```

Status badge colors: pending=amber, approved=emerald, rejected=rose.
"View Full Waitlist" action links to `/user-management`.

### KPIs to wire once `/dashboard/stats` exists

```ts
interface SuperAdminStats {
  totalCreditsIssuedTco2e: number;
  grossRegistryValueUsd: number;
  activeProjectCount: number;
  pendingGovernanceCount: number; // projects pending review + KYC pending
  platformRevenueMtdUsd: number;
  payoutQueueCount: number;
  payoutQueueOutstandingUsd: number;
  creditsAcquiredMtdTco2e: number;
  mrvPipelineStages: {
    ingest: number;
    verify: number;
    anchor: number;
    issue: number;
  };
}
```

### Alert strip logic (current)

```ts
const totalPending =
  pendingProjectsCount + pendingUsersCount + pendingWaitlistCount;
// pendingProjectsCount, pendingUsersCount: mock until /dashboard/stats wired
// pendingWaitlistCount: live from useWaitlistRegistrations
```

---

## 4. AdminDashboard

**File:** `src/app/(dashboard)/dashboard/_components/AdminDashboard.tsx`
**Status:** Exists, tab pattern is good, all data is mock.

### What's good (keep)

The tabbed domain view is architecturally sound. Admins have distinctly different
responsibilities depending on their role sub-type:

- `admin` → all three tabs
- `project_manager` → Project Operations tab only
- `mrv_admin` → MRV & Credits tab only
- `financial_admin` → Financial Routing tab only

The tab visibility logic is already implemented correctly (`isProjectManager`,
`isMrvAdmin`, `isFinancialAdmin` booleans). Keep it.

### What's wrong (fix)

1. **Alert strip is missing.** An admin's most urgent signal ("8 projects need
   review") should appear above the tabs, not inside one of them.
2. **The developer table is custom HTML.** Replace with `DataTable` for
   consistency and built-in pagination.
3. **MRV tab only has 4 stat cards.** It needs a `MrvPipelineStepper` and
   a mini-table of pending MRV events.
4. **Financial tab has no links.** The payout card should link to
   `/financials/payouts`, contracts to `/financials/contracts`.

### Sections (target state)

```
ALWAYS VISIBLE (above tabs):
  ┌─ Alert Strip ─────────────────────────────────────────────────────┐
  │  N project submissions + M KYC audits pending                     │
  └───────────────────────────────────────────────────────────────────┘
  ┌─ Hero ─────────────────────────────────────────────────────────────┐
  │  Role label + Operative name + status dot                          │
  └────────────────────────────────────────────────────────────────────┘

TAB: Project Operations  (project_manager, admin)
  ├─ 4 KPI StatCards: Assigned Developers / Under Review / Site Visits / Pending KYC
  ├─ DataTable: Recent project owners (5 rows, "View All" → /project-developers)
  │    Columns: Entity | Jurisdiction | KYC Status | Assigned | Actions
  └─ DataTable: Projects awaiting review (5 rows, "View All" → /projects)
       Columns: Project Ref | Developer | Type | Stage | Actions

TAB: MRV & Credits  (mrv_admin, admin)
  ├─ 4 KPI StatCards: Pending Audits / Yield to Issue / AI Confidence / Anomaly Flags
  ├─ MrvPipelineStepper (same component, MRV-scoped counts)
  └─ DataTable: Recent MRV ingestion events (mock → needs /mrv endpoint)
       Columns: CC Ingestion ID | Project | Status | Submitted | Actions

TAB: Financial Routing  (financial_admin, admin)
  ├─ 4 KPI StatCards: Pending Payouts / Outstanding USD / Revenue MTD / Active Contracts
  ├─ DataTable: Payout queue (5 rows, "Manage Payouts" → /financials/payouts)
  │    Columns: Developer | Amount | Currency | Status | Actions
  └─ DataTable: Active contracts (5 rows, "View Contracts" → /financials/contracts)
       Columns: Contract ID | Parties | Value | Expires | Status
```

### Data sources for live wiring

```ts
// Project Operations tab
ProjectOwnerService.listProjectOwners({ limit: 5, verificationStatus: 'pending' })
ProjectService.getProjects({ limit: 5, stage: 'registration' })

// MRV tab — needs new endpoint
GET /v2/mrv/stats → { ingest: N, verify: N, anchor: N, issue: N, anomalyFlags: N }

// Financial tab — partially exists
GET /v2/financials/payouts?status=pending&limit=5  (PayoutService — not yet built on FE)
GET /v2/financials/contracts?limit=5              (ContractService — not yet built on FE)
```

### Frontend service gap

`financials-service.ts` exists (`src/lib/services/financials-service.ts`) but
wasn't in the files reviewed — add `listPayouts` and `listContracts` methods if
not already present. Check before building the tab.

---

## 5. ProjectDeveloperDashboard (rename of ProjectOwnerDashboard)

**File:** `src/app/(dashboard)/dashboard/_components/ProjectDeveloperDashboard.tsx`
**Current file:** `ProjectOwnerDashboard.tsx` — rename, don't delete
**Status:** Has the most live data of any dashboard. Rebuild around
Carbon Readiness Score as the hero.

### What's good (keep)

- `useQuery` for `ProjectService.getProjects({ createdBy: userId, limit: 10 })`
- `projects.length`, `activeProjects`, `verificationProjects`, `totalArea` derivations
- Asset ledger table (the row-click `router.push` pattern is good)
- Status/stage badge style dictionaries
- The "Ledger Empty" empty state with a CTA

### What's fundamentally wrong (rebuild)

The current hero KPI is "Verified Yield: —" and "Settlement Revenue: [chart
placeholder]". For a Ghana pilot project in the `registration` stage with no
MRV history, this will show blank indefinitely. The project owner's actual
concern right now is: **"How complete is my assessment, and what does Crevy
think my project is worth?"**

The Carbon Readiness Score (0–100, from `project_assessment_score`) answers
both questions in one number. It updates every time a module is submitted.
The assessment module checklist answers "what's left to do." These must be
the hero section.

### Sections (target state)

```
┌─ Hero — Assessment Command ──────────────────────────────────────────────┐
│                                                                           │
│  PROJECT NAME (most recently active project)          [Score Ring]        │
│  Stage badge       Methodology recommendation         [   72   ]          │
│                                                        [  / 100 ]          │
│  "Complete your assessment to unlock credit          Readiness            │
│   forecasting and methodology confirmation."          Score               │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘

Alert Strip (if outstanding modules exist):
  "3 assessment modules incomplete — submit them to improve your readiness score."

KPI Row (3 StatCards):
  Carbon Readiness Score | Projected CO₂e Reduction | Baseline Waste Volume
  (from project_assessment_score.carbonReadinessScore)
  (from projectedCo2eReductionTco2e)     (from baselineWasteVolumeTonnes)

Assessment Module Checklist:
  GET /v2/projects/:id/assessments → list of 8 modules with status
  Renders as a vertical checklist with status badges:
    not_started = slate dot
    in_progress  = amber dot + animate-pulse
    submitted    = emerald checkmark
  Each row is a link to /projects/:id?module=:moduleKey

Methodology Recommendation Card:
  GET /v2/projects/:id/assessment-score
  Shows: primaryMethodology, alternativeMethodology, futureMethodologyPathway
  Only renders once at least one module is 'submitted'

Asset Ledger (existing table, unchanged):
  All user's projects — same columns as today

Activity Feed (static → live):
  GET /v2/projects/:id/activities?limit=5
```

### ReadinessScoreRing component spec

```tsx
// src/components/dashboard/ReadinessScoreRing.tsx
// SVG circle-based ring. Props:
interface ReadinessScoreRingProps {
  score: number; // 0–100
  size?: number; // px, default 120
  strokeWidth?: number; // default 10
  showLabel?: boolean; // default true
}
// Color logic:
//   score < 41  → stroke="#f59e0b" (amber)
//   score < 71  → stroke="#3b82f6" (blue)
//   score >= 71 → stroke="#10b981" (emerald)
// Center text: score value, large mono font
// Below ring: "/ 100" in slate-400
```

### New React Query hooks needed

```ts
// src/hooks/use-project-assessment.ts  (new file)

export function useProjectAssessments(projectId: string | undefined) {
  return useQuery({
    queryKey: ["project-assessments", projectId],
    queryFn: () => ProjectService.listAssessments(projectId!),
    enabled: !!projectId,
  });
}

export function useProjectAssessmentScore(projectId: string | undefined) {
  return useQuery({
    queryKey: ["project-assessment-score", projectId],
    queryFn: () => ProjectService.getLatestScore(projectId!),
    enabled: !!projectId,
  });
}

export function useAssessmentManifest() {
  return useQuery({
    queryKey: ["assessment-manifest"],
    queryFn: () => ProjectService.getAssessmentManifest(),
    staleTime: 10 * 60 * 1000, // 10min — the manifest changes rarely
  });
}
```

All three methods already exist on `ProjectService` (added this sprint).

### Which project to show in the hero

The project owner may have multiple projects. Hero should show the most
recently updated project that is NOT in status 'closed'. Logic:

```ts
const heroProject = projects
  .filter((p) => p.projectStatus !== "closed")
  .sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )[0];
```

If `heroProject` is undefined (no projects yet), show a "Register your first
project" CTA instead of the score ring.

---

## 6. BuyerDashboard (rename of OrgAdminDashboard)

**File:** `src/app/(dashboard)/dashboard/_components/BuyerDashboard.tsx`
**Current file:** `OrgAdminDashboard.tsx` — rename, expand coverage
**Status:** All mock. The `NetZeroGauge` component is well-built and should be kept.
Roles entering this view: `org_admin`, `sustainability_manager`, `org_auditor`, `buyer`.

### What's good (keep)

- `NetZeroGauge` SVG gauge — genuinely useful, keep and potentially extract to
  `src/components/dashboard/NetZeroGauge.tsx`
- The corporate framing (ESG / compliance / net-zero trajectory) is correct
- The "Acquire Verified Yield" CTA linking to `/marketplace` is the right action
- Auditor role getting read-only copy (no acquisition CTA) is correct logic

### What's missing

1. No live data at all — organization's credits, portfolio value, retired total
2. No portfolio snapshot table
3. No ESG compliance link with meaningful data
4. `org_auditor` has the CTA hidden but still sees the same mock data as
   `org_admin` — they should see a slightly different view (compliance/audit
   focus rather than acquisition focus)

### Role-scoped view logic

```
org_admin:             Full view — portfolio + acquisition + ESG + net-zero gauge
sustainability_manager: Full view — same as org_admin
org_auditor:            Read-only view — ESG compliance + audit trail (no Buy Credits CTA)
buyer:                  Acquisition-focused — emphasize marketplace and portfolio
```

### Sections (target state)

```
┌─ Hero ─────────────────────────────────────────────────────────────────────┐
│  Company name (from organization profile)                                   │
│  "Corporate Carbon Portfolio"                                               │
│  CTA: "Acquire Verified Yield" → /marketplace  (hidden for org_auditor)   │
└────────────────────────────────────────────────────────────────────────────┘

KPI Row (4 StatCards):
  Credits Held | Credits Retired | Pending Purchases | Net Position
  (tCO₂e)        (total retired)   (processing count)   (held - retired)

Portfolio Snapshot Table (5 rows):
  DataTable<CreditRow>
  Columns: Credit Batch ID | Project | Volume (tCO₂e) | Price paid | Vintage | Status
  "View Full Portfolio" → /portfolio

Net-Zero Section (2 columns):
  Left:  NetZeroGauge (kept, now takes live data)
  Right: Scope 3 Liability card + Quick Actions
         org_auditor: ESRS compliance PDF only
         others: Buy Credits + ESRS PDF

ESG Section:
  Link to /compliance/reports
  Summary card: Last report date | Coverage period | ESG Trust Score
  (all mock until /reports/esg endpoint built)
```

### Data sources for live wiring

```ts
// Credits held
CreditService.getCarbonCredits({ ownerId: session.user.activeOrganizationId });
// → derive: totalHeldTco2e, totalRetiredTco2e, pendingPurchaseCount, netPosition

// Portfolio transactions (last 5)
CreditService.getTransactions({
  limit: 5,
  orgId: session.user.activeOrganizationId,
});

// Organization profile (for company name, net-zero targets)
OrganizationService.getOrganizationById(session.user.activeOrganizationId);
// → org.name for hero, org.carbonNeutralityTargets for gauge goal value
```

`OrganizationService` and `CreditService` are both already built in
`src/lib/services/`. No new service files needed for this dashboard.

---

## 7. Public Layout — CrevyLoader (completed this sprint)

**File:** `src/app/(public)/layout.tsx`
**Status:** ✅ Fully updated.

### What changed

The previous implementation hid the `Navbar` during loading, causing a flash
when the loader exited. The updated version:

```
BEFORE:
  isLoading → <CrevyLoader> only (Navbar unmounted)
  !isLoading → <Navbar> + <main> + <PublicFooter>

AFTER:
  always → <Navbar /> at z-50 (mounted unconditionally)
  isLoading → <CrevyLoader /> at z-[100] (overlays Navbar and everything else)
  !isLoading → <main> + <PublicFooter> revealed
```

The `Navbar` renders beneath the loader — when the loader exits upward
(`exit={{ y: "-100%" }}`), the Navbar is already in place with no layout shift.

### `window.__showCrevyLoader` pattern

```ts
// Exposed in layout.tsx useEffect:
(window as any).__showCrevyLoader = () => setIsLoading(true);

// Consumed in NavLink.tsx handleClick:
if ((window as any).__showCrevyLoader) {
  (window as any).__showCrevyLoader();
}
setTimeout(() => router.push(href), 100);
```

The 100ms delay ensures the loader animation starts before React begins
rendering the next route, avoiding a visual race where the new page
flashes before the loader covers it.

### Remaining gap: same-page anchors

Clicking `href="#how-it-works"` on the landing page fires the loader,
which then completes and reveals the same page — a full-screen flash for
a same-page scroll. Fix in `NavLink.tsx`:

```tsx
// NavLink.tsx — proposed fix (not yet implemented)
const handleClick = (e: React.MouseEvent) => {
  e.preventDefault();
  onClick?.();

  const isSamePageAnchor = href.startsWith("#");
  if (!isSamePageAnchor && (window as any).__showCrevyLoader) {
    (window as any).__showCrevyLoader();
  }

  setTimeout(
    () => {
      router.push(href);
    },
    isSamePageAnchor ? 0 : 100,
  );
};
```

---

## 8. Shared Component System — Extraction Plan

The primitives in `Shared.tsx` are used by all four dashboard components.
Moving them to a shared location makes them available to future components
without creating import cycles through `(dashboard)/dashboard/_components/`.

### Target directory structure

```
src/components/dashboard/
├── StatCard.tsx              ← extracted from Shared.tsx
├── SectionLabel.tsx          ← extracted from Shared.tsx
├── AlertStrip.tsx            ← extracted from Shared.tsx
├── MrvPipelineStepper.tsx    ← extracted from Shared.tsx
├── NetZeroGauge.tsx          ← extracted from OrgAdminDashboard.tsx
├── ReadinessScoreRing.tsx    ← NEW (§5)
├── QuickActionsGrid.tsx      ← NEW — grid of action shortcut buttons
└── MiniDataTable.tsx         ← NEW — DataTable wrapper, no pagination,
                                  max 5 rows, "View All" footer link
```

### Migration path

1. Create the new files in `src/components/dashboard/`
2. Update `Shared.tsx` to re-export everything from the new locations:
   ```ts
   // Shared.tsx — transitional re-export shim
   export { StatCard } from "@/components/dashboard/StatCard";
   export { SectionLabel } from "@/components/dashboard/SectionLabel";
   export { AlertStrip } from "@/components/dashboard/AlertStrip";
   export { MrvPipelineStepper } from "@/components/dashboard/MrvPipelineStepper";
   ```
3. All existing consumers continue to work unchanged during migration
4. Remove `Shared.tsx` once all four dashboard components are updated
   to import directly from `@/components/dashboard/`

### `MiniDataTable` spec

```tsx
// Thin wrapper around DataTable — used for dashboard "peek" tables
// (5-row previews with a "View All" link, no pagination controls)
interface MiniDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}
// Renders DataTable with currentPage=1, totalPages=1, onPageChange=noop
// Appends a "View All →" link below the table if viewAllHref is provided
```

### `QuickActionsGrid` spec

```tsx
// Role-specific shortcut buttons displayed in a 2×2 or 3×2 grid
interface QuickAction {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  variant?: "primary" | "outline"; // primary = bg-slate-900, outline = border
}
interface QuickActionsGridProps {
  actions: QuickAction[];
  columns?: 2 | 3; // default 2
}
```

---

## 9. New React Query Hooks Needed

All new hooks go in `src/hooks/` following the existing naming convention
(`use-{noun}.ts`).

### `src/hooks/use-project-assessment.ts` (new)

```ts
export function useProjectAssessments(projectId: string | undefined);
// queryKey: ['project-assessments', projectId]
// queryFn: ProjectService.listAssessments(projectId!)

export function useProjectAssessmentScore(projectId: string | undefined);
// queryKey: ['project-assessment-score', projectId]
// queryFn: ProjectService.getLatestScore(projectId!)

export function useAssessmentManifest();
// queryKey: ['assessment-manifest']
// staleTime: 10 * 60 * 1000
// queryFn: ProjectService.getAssessmentManifest()
```

All three `ProjectService` methods are already implemented (`getLatestScore`,
`listAssessments`, `getAssessmentManifest`) — hooks just need to be written
to consume them.

### `src/hooks/use-credits.ts` (new or extend)

```ts
export function useCarbonCredits(params?: Record<string, unknown>);
// queryKey: ['carbon-credits', params]
// queryFn: CreditService.getCarbonCredits(params)

export function useCreditTransactions(params?: Record<string, unknown>);
// queryKey: ['credit-transactions', params]
// queryFn: CreditService.getTransactions(params)
```

### `src/hooks/use-organization.ts` (new)

```ts
export function useOrganization(id: string | undefined);
// queryKey: ['organization', id]
// queryFn: OrganizationService.getOrganizationById(id!)
// enabled: !!id
```

---

## 10. Backend Endpoints Needed

Ordered by priority against what the dashboards need to stop showing mock data.

| Priority  | Endpoint                                            | Consuming dashboard                    | Returns                                                     |
| --------- | --------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------- |
| 🔴 High   | `GET /v2/dashboard/stats?role=super_admin`          | SuperAdminDashboard                    | `SuperAdminStats` object (§3)                               |
| 🔴 High   | `GET /v2/dashboard/stats?role=admin`                | AdminDashboard                         | Project/KYC/MRV aggregate counts                            |
| 🔴 High   | `GET /v2/projects/:id/assessment-score`             | ProjectDeveloperDashboard              | Latest score row — **controller already built this sprint** |
| 🟡 Medium | `GET /v2/mrv/stats`                                 | AdminDashboard MRV tab                 | Pipeline stage counts + anomaly flag count                  |
| 🟡 Medium | `GET /v2/financials/payouts?status=pending&limit=5` | AdminDashboard Financial tab           | Payout queue rows                                           |
| 🟡 Medium | `GET /v2/financials/contracts?limit=5`              | AdminDashboard Financial tab           | Contract rows                                               |
| 🟡 Medium | `GET /v2/projects/:id/activities?limit=5`           | ProjectDeveloperDashboard              | Activity feed rows                                          |
| 🟢 Low    | `GET /v2/reports/esg?limit=1`                       | BuyerDashboard                         | Latest ESG report summary                                   |
| 🟢 Low    | `GET /v2/mrv/health`                                | SuperAdminDashboard System Diagnostics | Anchoring latency, uptime                                   |

### `/v2/dashboard/stats` — recommended shape

```ts
// Backend can scope by role via the authenticated user's role,
// not a query param — the role param is just for documentation.

// SuperAdmin shape
interface SuperAdminStats {
  totalCreditsIssuedTco2e: number;
  grossRegistryValueUsd: number;
  activeProjectCount: number;
  pendingProjectSubmissions: number;
  pendingKycCount: number;
  pendingWaitlistCount: number; // sum of above three = totalPending
  platformRevenueMtdUsd: number;
  payoutQueueCount: number;
  payoutQueueOutstandingUsd: number;
  creditsAcquiredMtdTco2e: number;
  creditsAcquiredMtdValueUsd: number;
  mrvPipeline: {
    ingest: number;
    verify: number;
    anchor: number;
    issue: number;
  };
}

// Admin shape
interface AdminStats {
  assignedDeveloperCount: number;
  developersUnderReview: number;
  scheduledSiteVisits: number;
  pendingKycCount: number;
  pendingProjectSubmissions: number;
  mrvPendingAudits: number;
  mrvYieldToIssue: number;
  aiConfidenceAvg: number;
  anomalyFlagCount: number;
  pendingPayoutCount: number;
  pendingPayoutOutstandingUsd: number;
  platformRevenueMtdUsd: number;
  activeContractCount: number;
}
```

The backend service for this should live in a new `src/v2/dashboard/` domain,
following the BFF (Backend for Frontend) pattern — it aggregates from other
services rather than hitting DB tables directly, keeping domain services clean.

---

## 11. Implementation Sequence

Recommended order to avoid building UI for endpoints that don't exist yet,
and to ship the most user-visible improvements first:

### Sprint 1 (this sprint — ✅ mostly done)

- [x] Public layout CrevyLoader overlay pattern
- [x] SuperAdminDashboard: waitlist KPIs + DataTable wired to live API
- [x] Backend: assessment controller + routes + service + scoring engines
- [ ] NavLink anchor-link fix (30 min, §7)

### Sprint 2 (next)

- [ ] Extract `Shared.tsx` primitives to `src/components/dashboard/`
- [ ] Build `ReadinessScoreRing` component
- [ ] Build `use-project-assessment.ts` hooks
- [ ] Rebuild `ProjectDeveloperDashboard` (rename from ProjectOwnerDashboard)
      around Carbon Readiness Score hero
- [ ] Update `page.tsx` switch statement to match §2 role map

### Sprint 3

- [ ] Backend: `GET /v2/dashboard/stats` (super_admin + admin shapes)
- [ ] Wire SuperAdminDashboard Registry KPIs to live data
- [ ] Wire AdminDashboard KPIs to live data
- [ ] Replace AdminDashboard custom tables with `DataTable`/`MiniDataTable`

### Sprint 4

- [ ] Build `BuyerDashboard` (rename from OrgAdminDashboard)
- [ ] Build `use-credits.ts` and `use-organization.ts` hooks
- [ ] Wire BuyerDashboard portfolio + gauge to live data
- [ ] Build `MiniDataTable` and `QuickActionsGrid` shared components

---

## 12. Open Questions

1. **Role string for project developer:** Backend RBAC seed uses `project_owner`
   as the role string. Entity rename to `project_developer` is complete on the
   DB but the role string itself hasn't changed. Does `session.user.role` still
   return `project_owner`? If yes, `page.tsx`'s switch case stays `'project_owner'`
   until the RBAC seed is updated. Confirm before renaming the case.

2. **`activeOrganizationId` on the session:** `TBetterAuthUser.activeOrganizationId`
   is declared in the type but it's unclear if the backend's `customSession`
   plugin actually populates it. The BuyerDashboard needs this to scope credit
   and organization queries. Verify in the backend's session plugin before wiring.

3. **Payout and contract service on the frontend:** `financials-service.ts`
   exists in `src/lib/services/` but wasn't reviewed in this session. Check if
   `listPayouts` and `listContracts` methods already exist before building them.

4. **Multiple active projects for ProjectDeveloperDashboard:** The hero
   section shows the most recently updated non-closed project. If a developer
   has 5 active projects, the other 4 get no dashboard signal. Consider a
   project switcher in the hero once >1 project exists — out of scope for Sprint 2
   but worth designing for in the hero component's prop interface.

5. **Buyer role timing:** The `buyer` role case in the switch statement should
   be added immediately (routing to BuyerDashboard) even before the BuyerDashboard
   is fully built, so a newly-onboarded buyer doesn't hit the `NO_ROLE_UI` fallback.
   Add the case with a `<BuyerDashboard>` render that gracefully shows "coming soon"
   sections for any unbuilt parts.
