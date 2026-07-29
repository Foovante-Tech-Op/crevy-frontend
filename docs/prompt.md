# Crevy Dashboard Rebuild — AI Generation Prompt

### Comprehensive UI Specification for Three User Categories

---

## 0. Mission Statement

Rebuild the Crevy platform dashboard as a **world-class, editorially structured carbon registry command centre**. The result must feel like Bloomberg Terminal meets Linear — data-dense, visually coherent, zero fluff.

Three self-contained dashboard variants exist, driven by `session.user.role`:

| Role string(s)                                       | Dashboard variant         | Persona                                                               |
| ---------------------------------------------------- | ------------------------- | --------------------------------------------------------------------- |
| `super_admin`                                        | **Super Admin Dashboard** | Platform owner — full sovereignty over the registry                   |
| `project_manager`, `mrv_admin`, `financial_admin`    | **Admin Dashboard**       | Staff member — operates one domain within the platform                |
| `org_admin`, `sustainability_manager`, `org_auditor` | **Org Admin Dashboard**   | Corporate/institutional — manages carbon exposure and ESG obligations |

Every dashboard variant must be **fully responsive**, use **real API data where endpoints exist** (fall back to static illustrative mock data where they do not, clearly commented), and animate with **Framer Motion** using the existing staggered reveal pattern.

---

## 1. Technical Constraints & Design System

### 1.1 Stack — use only these, no new packages unless explicitly listed

```
Next.js 16 (App Router, "use client" where needed)
React 19 + TypeScript
Tailwind v4
Framer Motion (already installed)
@tanstack/react-query (useQuery for all API calls)
lucide-react (icons)
@hugeicons/react (secondary icons — use sparingly)
sonner (toasts)
```

### 1.2 Design tokens — use these exact values, never arbitrary colors

```
Brand primary:    #2cc295
Brand primary dk: #178a74
Brand dark:       #131927
White:            #ffffff
Surface:          #F8FAFC
Border:           #f1f5f9 (gray-100)
Text primary:     #131927
Text secondary:   #6b7280 (gray-500)
Text muted:       #9ca3af (gray-400)

Accent green:     #2cc295 / #178a74
Accent blue:      #3b82f6 / #1d4ed8
Accent amber:     #f59e0b / #b45309
Accent rose:      #f43f5e / #be123c
Accent purple:    #8b5cf6 / #6d28d9
Accent teal:      #14b8a6 / #0f766e
Accent slate:     #64748b / #475569
```

### 1.3 Typography

```css
/* Headings — already loaded via next/font/google */
font-family:
  var(--font-syne), sans-serif; /* section labels, card titles, KPI values */

/* Body — system default */
font-family: var(--font-geist), sans-serif; /* everything else */
```

### 1.4 Existing chart components — reuse, do not rewrite

All charts live in `src/app/(dashboard)/dashboard/_components/`. Import and reuse:

| Component         | Usage                                                                        |
| ----------------- | ---------------------------------------------------------------------------- |
| `AreaChart`       | Single-series trend over time                                                |
| `GroupedBarChart` | Two-series side-by-side comparison                                           |
| `MultiLineChart`  | Two-series line comparison                                                   |
| `DonutChart`      | Proportional breakdown with legend                                           |
| `StatCard`        | KPI card — `label`, `value`, `sub`, `icon`, `trend`, `accent`, `delay` props |
| `HeroSection`     | Top welcome/CTA card — already role-aware, extend as needed                  |
| `SectionLabel`    | Section title with framer-motion fade-in — export from ProjectOwnerDashboard |
| `OnboardingFlow`  | Project lifecycle stepper                                                    |
| `SystemHealth`    | 2×2 grid of platform metrics                                                 |

### 1.5 Editorial layout structure

Every dashboard section follows this hierarchy:

```
page.tsx
  └─ <DashboardVariant>
        ├─ HeroSection          ← welcome + primary CTA
        ├─ [AlertStrip]         ← conditional urgent notice (admin/super_admin only)
        ├─ Section: KPIs        ← 4× StatCard in a 4-col grid
        ├─ Section: Charts      ← 2–3 charts, use the 3/5 + 2/5 split pattern
        ├─ Section: [Table 1]   ← primary action table (approve/review queue)
        ├─ Section: [Table 2]   ← secondary table
        └─ Section: Activity    ← recent event feed
```

All `<section>` wrappers use `className="mx-auto max-w-5xl"`.

Cards use `rounded-2xl border border-gray-100 bg-white shadow-sm`.

Tables use `overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm` with thead `bg-gray-50/60`.

Stagger delays increase by `0.05s` per section: Hero=0, KPIs=0.05–0.25, Charts=0.3–0.4, Table 1=0.45–0.5, Table 2=0.55–0.6, Activity=0.65–0.7.

---

## 2. File Structure

```
src/app/(dashboard)/dashboard/
  page.tsx                          ← route — reads role, renders correct dashboard
  _components/
    SuperAdminDashboard.tsx         ← REBUILD (replaces AdminDashboard.tsx)
    AdminDashboard.tsx              ← REBUILD (project_manager / mrv_admin / financial_admin)
    OrgAdminDashboard.tsx           ← NEW (replaces CompanyDashboard.tsx)
    HeroSection.tsx                 ← UPDATE (extend configs for new roles)
    StatCard.tsx                    ← KEEP AS-IS
    AreaChart.tsx                   ← KEEP AS-IS
    BarChart.tsx                    ← KEEP AS-IS
    LineChart.tsx                   ← KEEP AS-IS
    PieChart.tsx                    ← KEEP AS-IS
    OnboardingFlow.tsx              ← KEEP AS-IS
    SystemHealth.tsx                ← KEEP AS-IS
    SectionLabel.tsx                ← EXTRACT from ProjectOwnerDashboard.tsx (standalone file)
    RecentActivity.tsx              ← EXTRACT from ProjectOwnerDashboard.tsx
    AlertStrip.tsx                  ← EXTRACT from AdminDashboard.tsx (reusable)
    ApprovalModal.tsx               ← EXTRACT from AdminDashboard.tsx (reusable)
    ProjectOwnerDashboard.tsx       ← UPDATE (wire real project data — already done)
```

Update `page.tsx` role switch:

```typescript
switch (role) {
  case "super_admin":
    return <SuperAdminDashboard userName={userName} />;
  case "project_manager":
  case "mrv_admin":
  case "financial_admin":
    return <AdminDashboard userName={userName} role={role} />;
  case "org_admin":
  case "sustainability_manager":
  case "org_auditor":
    return <OrgAdminDashboard userName={userName} role={role} />;
  default:
    return <ProjectOwnerDashboard userName={userName} role={role} />;
}
```

---

## 3. Dashboard 1 — Super Admin (`super_admin`)

### 3.1 Purpose

Full platform sovereignty. The super admin needs to understand the health of the entire registry: who is registering, what credits exist, how money flows, and whether the technical systems are stable.

### 3.2 Hero Section

```
Left card:
  Badge: "Super Admin · Platform Registry"
  Title: "Carbon Registry Command Centre"
  Description: "Monitor credit issuance, approve registrations, and ensure the integrity of the global offset pipeline."
  CTA button: "View Audit Log" → /compliance  (gradient: #2cc295 → #178a74)

Right card (gradient #178a74 → #131927):
  Welcome back: {firstName}
  Next Steps:
    → "{N} registrations pending approval"
    → "{N} MRV verifications awaiting review"
    → "Last system check: all services operational"
```

### 3.3 Alert Strip

Show when `pendingProjects.length > 0 || pendingUsers.length > 0`:

```
⚠️  {N} items need your attention — {x} project submissions and {y} user registrations are pending review.
```

Color: `bg-amber-50 border-amber-100 text-amber-700`.

### 3.4 KPI Section — "Registry Overview"

4 StatCards in a 4-column grid:

| KPI                      | Value source                                                            | Icon         | Accent |
| ------------------------ | ----------------------------------------------------------------------- | ------------ | ------ |
| **Total Credits Issued** | `GET /api/v2/credits?limit=1` — total from count or mock `42,840 tCO₂e` | `Leaf`       | green  |
| **Gross Registry Value** | Mock `$856,800`                                                         | `DollarSign` | blue   |
| **Active Projects**      | `GET /api/v2/projects?projectStatus=active&limit=1`                     | `Layers`     | green  |
| **Pending Approvals**    | Count pending projects + pending users                                  | `Clock`      | amber  |

Each StatCard must have a `trend` prop showing week-on-week change.

### 3.5 Charts Section — "Registry Analytics"

Layout: **3/5 left + 2/5 right**.

**Left (3/5) — two charts stacked:**

Chart A — `MultiLineChart`, title "User Growth", subtitle "Monthly onboarding by user type":

```typescript
data: Array<{ label: string; a: number; b: number }>;
// a = Project Owners, b = Org Admins / Buyers
// 12 months of mock data, growing trend
labelA = "Project Owners";
labelB = "Org Buyers";
colorA = "#2cc295";
colorB = "#131927";
```

Chart B — `GroupedBarChart`, title "Credit Market Liquidity", subtitle "tCO₂e by quarter":

```typescript
// labelA="Issued", labelB="Purchased", colorA="#2cc295", colorB="#131927"
// 4 quarters of mock data
```

**Right (2/5) — two widgets stacked:**

Widget A — `OnboardingFlow` (existing component — shows project lifecycle).

Widget B — `SystemHealth` (existing component — API latency, DB load, etc.).

### 3.6 Table 1 — "Project Vetting Queue"

Fetch: `GET /api/v2/projects?projectStatus=draft&limit=10` (or mock while endpoint is built).

Columns: `Project Name`, `Owner`, `Type`, `Location`, `Submitted`, `Priority`, `Action`.

Priority badge colors:

- High → `bg-rose-50 text-rose-600`
- Medium → `bg-amber-50 text-amber-600`
- Low → `bg-gray-100 text-gray-500`

Action buttons per row:

- **Verify** → green button → opens `ApprovalModal` → `PATCH /api/v2/projects/:id { projectStatus: 'active', projectStage: 'active' }`
- **Reject** → rose button → opens `ApprovalModal` (type: reject) → `PATCH /api/v2/projects/:id { projectStatus: 'suspended' }`
- **View** → ghost button → `router.push('/project-profile/:id')`

`ApprovalModal` props: `{ item: { id, name }, type: 'approve' | 'reject', onConfirm: () => void, onClose: () => void }`.

On confirm: call the API, `invalidateQueries(['projects-pending'])`, show sonner toast.

### 3.7 Table 2 — "Pending User Registrations"

Fetch: Mock data — `GET /api/v2/users?verificationStatus=pending` (endpoint not yet built — use static mock and add TODO comment).

Columns: `Name`, `Organisation`, `Role`, `Applied`, `KYC`, `Action`.

KYC badge:

- `verified` → `bg-[#2cc295]/10 text-[#178a74]`
- `pending` → `bg-amber-50 text-amber-600`
- `rejected` → `bg-rose-50 text-rose-600`

Action buttons: **Approve** / **Decline** — same modal pattern as projects.

### 3.8 Section — "Financial Overview"

A 3-column card row. Each card is `rounded-2xl border bg-white shadow-sm p-5`:

**Card 1 — Revenue This Month**

- Large number: `$24,600` (mock)
- Subtitle: "platform fees collected"
- Sparkline: use a tiny 6-point AreaChart embedded inline (SVG, height 40px)
- Trend: `+18% vs last month`

**Card 2 — Payout Queue**

- Count: `12 pending payouts`
- Total: `$38,240 outstanding`
- CTA link: "Manage Payouts →" → `/financials/payouts`

**Card 3 — Credits Sold (MTD)**

- Number: `2,840 tCO₂e`
- Value: `$56,800`
- Projects contributing: `7`

### 3.9 Section — "MRV Pipeline Status"

A horizontal stepper showing the 4 MRV stages with live counts:

```
[ Ingestion: 14 ] ──► [ Verification: 6 ] ──► [ Anchored: 3 ] ──► [ Credits Issued: 28 ]
```

Each stage node:

- Circle with count badge
- Label below
- Connector line between stages (gray, not green — represents in-progress flow)
- Click → navigates to `/track-verification?stage={stage}`

Fetch: `GET /api/v2/mrv/ingestions/project/:projectId` (or platform-wide mock counts).

### 3.10 Section — "Registry Health & Compliance"

A 2×2 grid using the SystemHealth card pattern, but with registry-specific metrics:

| Metric              | Value     | Status  |
| ------------------- | --------- | ------- |
| Registry Uptime     | 99.97%    | good    |
| Webhook Processing  | 142ms avg | good    |
| Pending Audit Items | 3         | warning |
| Double-Count Checks | ✓ Clean   | good    |

Below the grid: a compact "Recent Audit Events" feed (3 items, icon + title + timestamp).

### 3.11 Section — "Recent Activity"

Reuse `AdminRecentActivity` component. Feed should include:

- New user registrations (🔐)
- Project stage changes (🌱)
- Credit issuances (💚)
- MRV verifications (🔬)
- System alerts (⚠️)
- Payout completions (💸)

---

## 4. Dashboard 2 — Admin (`project_manager` | `mrv_admin` | `financial_admin`)

### 4.1 Purpose

Role-specific operator view. The admin dashboard uses a **tab pattern** at the top to switch between sub-views when the user has multiple admin roles. For single-role admins, no tabs are needed.

### 4.2 Role Detection & Tabs

```typescript
// At the top of AdminDashboard
const isProjectManager = role === "project_manager";
const isMrvAdmin = role === "mrv_admin";
const isFinancialAdmin = role === "financial_admin";

const tabs = [
  isProjectManager && { key: "projects", label: "Project Ops", icon: Layers },
  isMrvAdmin && { key: "mrv", label: "MRV & Credits", icon: Radio },
  isFinancialAdmin && {
    key: "financials",
    label: "Financials",
    icon: Banknote,
  },
].filter(Boolean);

const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? "projects");
```

Tab UI: pill-style tabs with `bg-[#2cc295] text-white` for active, `bg-gray-50 text-gray-500` for inactive. Tabs appear below HeroSection and above the KPIs.

### 4.3 Hero Section configs

**project_manager:**

- Badge: "Project Manager"
- Title: "Regional Project Operations"
- CTA: "Field Assignments" → `/site-visits`
- Gradient: `#2cc295 → #131927`
- Next steps: pending KYC count, overdue site visits

**mrv_admin:**

- Badge: "MRV Administrator"
- Title: "Verification & Credit Engine"
- CTA: "Verification Queue" → `/track-verification`
- Gradient: `#0d9488 → #131927`
- Next steps: pending verifications, credit batches awaiting issuance

**financial_admin:**

- Badge: "Financial Administrator"
- Title: "Payout & Contract Centre"
- CTA: "Manage Payouts" → `/financials/payouts`
- Gradient: `#1d4ed8 → #131927`
- Next steps: pending payouts, contracts expiring this month

---

### 4.4 Sub-view A: Project Operations (`project_manager`)

**KPIs — "My Portfolio":**

| KPI                     | Value                                                | Icon          | Accent |
| ----------------------- | ---------------------------------------------------- | ------------- | ------ |
| Assigned Project Owners | Fetch `GET /api/v2/project-developers?limit=1` count | `Users`       | green  |
| Projects Under Review   | Mock `8`                                             | `FileSearch`  | amber  |
| Site Visits Scheduled   | Mock `3 this week`                                   | `Calendar`    | blue   |
| KYC Approvals Pending   | Mock `5`                                             | `ShieldCheck` | rose   |

**Charts:**

Left (3/5):

- `MultiLineChart`: "Project Onboarding Rate" — monthly registered vs approved
  - labelA="Registered", labelB="Approved", colorA="#2cc295", colorB="#131927"

Right (2/5):

- `DonutChart`: "Projects by Stage" — registration/active/verification/completed
  - colors: amber / blue / purple / #2cc295

**Table — "My Assigned Project Owners":**

Fetch: `GET /api/v2/project-developers` (backend injects agentId for project_manager).

Columns: `Name`, `Code`, `Country`, `Verification`, `Projects`, `Action`.

Actions: **View Profile** → `/project-developers/:userId` | **KYC Approve** (if pending).

**Table — "Project Vetting Queue":**

Same structure as super_admin's project table but filtered to the manager's region. Use mock data with a TODO.

**Upcoming Site Visits card:**

A standalone card (not a table) listing 3 upcoming visits:

```
[ 📍 Brong-Ahafo Farm | Kwame Mensah | Tomorrow 9:00 AM | [View Map] ]
[ 📍 Volta Basin Plot  | Abena Asare  | Thu 2:00 PM      | [View Map] ]
[ 📍 Upper West Hub    | Yaw Boateng  | Fri 10:00 AM     | [View Map] ]
```

---

### 4.5 Sub-view B: MRV & Credits (`mrv_admin`)

**KPIs — "Verification Engine":**

| KPI                   | Value                                             | Icon            | Accent |
| --------------------- | ------------------------------------------------- | --------------- | ------ |
| Pending Verifications | `GET /api/v2/mrv/verifications/project/:id` count | `Radio`         | amber  |
| Credits to Issue      | Mock `14 batches ready`                           | `Leaf`          | green  |
| Avg Confidence Score  | Mock `98.2%`                                      | `ScanSearch`    | blue   |
| Flagged Readings      | Mock `2`                                          | `AlertTriangle` | rose   |

**Charts:**

Left (3/5):

- `AreaChart`: "Net Credits Issued (Monthly)" — fetch from mrv_verification_result or use mock 12-month series. `color="#2cc295"`, unit="tCO₂e"

Right (2/5):

- `DonutChart`: "Verification Status Distribution"
  - `{ label: 'Success', value: 84, color: '#2cc295' }`
  - `{ label: 'Flagged', value: 10, color: '#f59e0b' }`
  - `{ label: 'Failed',  value: 6,  color: '#f43f5e' }`

**Table — "Recent MRV Verifications":**

Fetch: `GET /api/v2/mrv/verifications/project/{projectId}` (use a platform-wide mock list for MRV admin since no global endpoint exists yet).

Columns: `Verification ID (truncated)`, `Project`, `Status`, `Net Credits`, `Confidence`, `Anchored`, `Action`.

Status badge:

- `success` → `bg-[#2cc295]/10 text-[#178a74]`
- `flagged` → `bg-amber-50 text-amber-700`
- `failed` → `bg-rose-50 text-rose-600`

Action: **Issue Credits** button (only visible on success + not yet issued) → `POST /api/v2/credits/issue` (confirm in modal first).

**MRV Pipeline Stepper:**

Same horizontal stepper from SuperAdminDashboard §3.9. Reuse the component.

**Sensor Health widget:**

A 2×2 grid (same style as SystemHealth):

- Avg Upload Interval: `4.2 min`
- Geo-fence Pass Rate: `98.1%`
- Hardware Integrity: `97.4%`
- Anomalous Readings: `1.8%`

---

### 4.6 Sub-view C: Financials (`financial_admin`)

**KPIs — "Financial Overview":**

| KPI                    | Value                                                 | Icon         | Accent |
| ---------------------- | ----------------------------------------------------- | ------------ | ------ |
| Pending Payouts        | `GET /api/v2/financials/payouts?status=pending` count | `Banknote`   | amber  |
| Total Outstanding      | Mock `$42,800`                                        | `DollarSign` | rose   |
| Platform Revenue (MTD) | Mock `$18,400`                                        | `TrendingUp` | green  |
| Active Contracts       | `GET /api/v2/financials/contracts` count              | `FileText`   | blue   |

**Charts:**

Full-width: `GroupedBarChart` — "Monthly Payout Disbursements vs Platform Revenue"

- labelA="Disbursed", labelB="Revenue", colorA="#2cc295", colorB="#131927"
- 6-month mock data

**Table — "Payout Queue":**

Fetch: `GET /api/v2/financials/payouts?limit=10` (mock if endpoint not returning data).

Columns: `Ref`, `Project Owner`, `Amount`, `Currency`, `Method (MoMo/Bank)`, `Status`, `Created`, `Action`.

Status badge:

- `pending` → amber
- `processing` → blue
- `completed` → green
- `failed` → rose

Action: **Release** button (pending only) → `PATCH /api/v2/financials/payouts/:id { status: 'processing' }` + confirm modal.

**Table — "Active Contracts":**

Fetch: `GET /api/v2/financials/contracts?status=active&limit=5`.

Columns: `Ref`, `Buyer`, `Project`, `Committed (tCO₂e)`, `Value`, `Expires`, `Status`.

---

## 5. Dashboard 3 — Org Admin (`org_admin` | `sustainability_manager` | `org_auditor`)

### 5.1 Purpose

Corporate/institutional carbon management. This user has purchased credits or intends to. They need to see their carbon exposure, progress toward net-zero, portfolio breakdown, team management, and compliance reporting.

### 5.2 Role Detection

```typescript
const isOrgAdmin = role === "org_admin";
const isSustainabilityManager = role === "sustainability_manager";
const isAuditor = role === "org_auditor";
```

Auditors get a **read-only** view — no action buttons, no CTAs that mutate data. Add a `data-readonly` indicator badge in the hero section for auditors.

### 5.3 Hero Section configs

**org_admin:**

- Badge: "Organisation Admin"
- Title: "Institutional Carbon Dashboard"
- CTA: "Buy Credits" → `/marketplace`
- Gradient: `#0d9488 → #115e59`

**sustainability_manager:**

- Badge: "Sustainability Manager"
- Title: "ESG Performance Centre"
- CTA: "Generate ESG Report" → `/compliance`
- Gradient: `#059669 → #065f46`

**org_auditor:**

- Badge: "Compliance Auditor · Read Only"
- Title: "Audit & Verification Access"
- CTA: "View Audit Ledger" → `/compliance`
- Gradient: `#475569 → #1e293b`

### 5.4 KPI Section — "Carbon Portfolio"

| KPI                   | Value                                                          | Icon         | Accent |
| --------------------- | -------------------------------------------------------------- | ------------ | ------ |
| **Total CO₂e Offset** | `GET /api/v2/credits?currentOwnerId=userId` sum of quantities  | `Globe`      | green  |
| **Portfolio Value**   | Mock `$84,000`                                                 | `DollarSign` | blue   |
| **ESG Score**         | Mock `9.1 / 10` (computed from diversity + vintage + registry) | `BarChart2`  | green  |
| **Net-Zero Progress** | Mock `80%` — derive from offset / annual target                | `Target`     | amber  |

Trend indicators:

- CO₂e: `+18% vs last quarter`
- Portfolio value: `+11%`
- ESG Score: `+0.4 pts`
- Net-Zero: `+12% this month`

### 5.5 Net-Zero Gauge Component — `NetZeroGauge`

A standalone, reusable gauge component. Props: `{ pct: number; goal: number; current: number; unit: string }`.

Visual: a semicircular arc gauge (the existing one in CompanyDashboard is acceptable — extract it as `NetZeroGauge.tsx`).

Below the arc:

```
{current} of {goal} {unit} goal reached
```

Color transitions:

- 0–49%: `#f59e0b` (amber)
- 50–79%: `#2cc295` (brand primary)
- 80–100%: `#178a74` (dark green)

### 5.6 Charts Section — "Impact Analytics"

Layout: **1/3 donut + 2/3 area + full-width net-zero row**.

**Row 1:**

Left (1/3): `DonutChart` — "Portfolio by Project Type"

```typescript
data: [
  { label: "Regenerative Agriculture", value: 38, color: "#2cc295" },
  { label: "Renewable Energy", value: 22, color: "#178a74" },
  { label: "Blue Carbon", value: 28, color: "#131927" },
  { label: "Waste Management", value: 12, color: "#94a3b8" },
];
centerLabel = "4 types";
```

Right (2/3): `AreaChart` — "Monthly Offset Progress"

```typescript
// 12-month series, values 0 → goal
// Fetch: GET /api/v2/credits?currentOwnerId= — sum per month
// Mock: progressive growth toward net-zero target
title = "Monthly Offset Progress";
subtitle = "Cumulative tCO₂e offset toward annual net-zero goal";
color = "#2cc295";
unit = "";
```

**Row 2 — 3 cards side by side:**

Card A: `NetZeroGauge` component — current vs goal.

Card B: `AreaChart` (small, embedded height 100px) — "Monthly Spend" — purchases in $ per month. `color="#3b82f6"`, `unit="$"`.

Card C: Two quick-action buttons stacked:

- "Explore Marketplace" → `/marketplace` — dark background card
- "Download ESG Report" → `/compliance` — green background card

### 5.7 Table — "Carbon Portfolio Holdings"

Fetch: `GET /api/v2/credits?currentOwnerId={userId}&creditStatus=available` (mock while API being wired).

Columns: `Project Name`, `Type`, `Vintage`, `Credits (tCO₂e)`, `Value`, `ESG Score`, `Status`, `Action`.

ESG Score: inline pill — ≥9.0 green, 7.5–8.9 amber, <7.5 rose.

Status:

- `available` → `bg-[#2cc295]/10 text-[#178a74]`
- `reserved` → `bg-blue-50 text-blue-600`
- `retired` → `bg-slate-100 text-slate-500`

Actions (hidden for auditors):

- **Retire Credits** → opens confirm modal → `PATCH /api/v2/credits/:id/retire`
- **View Proof** → opens a small panel showing `transactionHash` and `auditUri`

### 5.8 Section — "Scope Breakdown"

A 3-card row showing carbon emissions by scope:

| Scope   | Description                            | Offset      | Status         |
| ------- | -------------------------------------- | ----------- | -------------- |
| Scope 1 | Direct emissions (combustion, process) | 420 tCO₂e   | ✅ Covered     |
| Scope 2 | Purchased electricity and heat         | 280 tCO₂e   | 🔶 Partial     |
| Scope 3 | Value chain, travel, supply chain      | 1,200 tCO₂e | ⏳ In Progress |

Each card: icon + scope label + offset amount + coverage status badge. Show a small horizontal progress bar for coverage percentage.

### 5.9 Section — "Team Members" (org_admin only)

Compact table showing organisation members and their roles:

Columns: `Name`, `Email`, `Role`, `Last Active`, `Action`.

Action: **Remove** button (admin only, hidden for sustainability_manager and auditor).

Below the table: "Invite Member" button → opens inline form (email + role dropdown) → `POST /api/v2/org/members/invite` (mock endpoint — add TODO comment).

### 5.10 Section — "Compliance & Certificates"

A card grid (3 columns):

Card 1 — "Latest ESG Report":

- Date: Q1 2026
- Coverage: Scope 1 + 2
- Button: "Download PDF" → (stub — show sonner "PDF generation coming soon")

Card 2 — "Retirement Certificates":

- Count: 3 certificates issued
- Button: "View All" → `/compliance`

Card 3 — "Next Reporting Deadline":

- Date: Sept 30, 2026
- Status: "On track"
- CTA: "Schedule Review"

### 5.11 Recent Activity

Feed shows:

- Credit purchases (💚)
- Credit retirements (🏆)
- ESG reports generated (📊)
- Team member changes (👥)
- Portfolio value changes (💹)

---

## 6. Shared Components to Extract

### 6.1 `AlertStrip.tsx`

```typescript
interface AlertStripProps {
  count: number;
  message: string;
  type?: "warning" | "info" | "error";
  ctaLabel?: string;
  ctaHref?: string;
}
```

Colors: warning=amber, info=blue, error=rose.

### 6.2 `ApprovalModal.tsx`

```typescript
interface ApprovalModalProps {
  item: { id: string; name: string } | null;
  type: "approve" | "reject";
  entityType: "project" | "user" | "payout" | "credit";
  onConfirm: (id: string) => Promise<void>;
  onClose: () => void;
}
```

Uses `AnimatePresence` + `motion.div` for the enter/exit animation (copy the existing pattern from AdminDashboard.tsx).

On confirm: set `isLoading=true`, call `onConfirm(item.id)`, show sonner `toast.success(...)` or `toast.error(...)`, then `onClose()`.

### 6.3 `SectionLabel.tsx`

```typescript
interface SectionLabelProps {
  label: string;
  delay?: number;
  inline?: boolean;
  action?: { label: string; href: string };
}
```

If `action` is provided, render it as a small link to the right of the label.

### 6.4 `MrvPipelineStepper.tsx`

```typescript
interface MrvPipelineStepperProps {
  stages: Array<{
    key: string;
    label: string;
    count: number;
    href: string;
  }>;
}
```

Renders the horizontal stepper with click-to-navigate behaviour.

---

## 7. API Integration Map

For every `useQuery` or `useMutation` call, use this pattern:

```typescript
// Real data
const { data, isLoading } = useQuery({
  queryKey: ["key", filters],
  queryFn: () => ServiceModule.method(filters),
  enabled: !!userId,
  staleTime: 30_000,
});

// Fallback for unbuilt endpoints — use mock but comment clearly
// TODO: replace with GET /api/v2/users?status=pending when endpoint exists
const pendingUsers = MOCK_PENDING_USERS;
```

Never silently swallow errors. Every query must have an `isError` branch that shows a friendly error state card (not a crash).

### 7.1 Real endpoints to wire now

| Dashboard   | Section           | Endpoint                                                   |
| ----------- | ----------------- | ---------------------------------------------------------- |
| All         | Projects list     | `GET /api/v2/projects?createdBy=userId&limit=10`           |
| All         | Currencies        | `GET /api/v2/auth/currencies`                              |
| Super Admin | Pending projects  | `GET /api/v2/projects?projectStatus=draft`                 |
| Super Admin | Project owners    | `GET /api/v2/project-developers?limit=5`                   |
| Admin (PM)  | My project owners | `GET /api/v2/project-developers` (backend injects agentId) |
| Admin (MRV) | Verifications     | `GET /api/v2/mrv/verifications/project/:id`                |
| Admin (MRV) | Anchors           | `GET /api/v2/mrv/anchors/project/:id`                      |
| Org Admin   | My credits        | `GET /api/v2/credits?currentOwnerId=userId`                |
| Org Admin   | Transactions      | `GET /api/v2/credits/transactions?buyerId=userId`          |

### 7.2 Mock data — use until endpoints are built

Mark every mock data block with:

```typescript
// MOCK — replace with GET /api/v2/financials/payouts when wired
// TODO: remove mock once FinancialsService.listPayouts() is called from route
```

---

## 8. Interactions & Micro-animations

### 8.1 Standard Framer Motion patterns to use consistently

```typescript
// Card entrance
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}

// List item stagger
initial={{ opacity: 0, x: -8 }}
animate={{ opacity: 1, x: 0 }}
transition={{ delay: baseDelay + index * 0.05 }}

// Section header
initial={{ opacity: 0, x: -8 }}
animate={{ opacity: 1, x: 0 }}
transition={{ delay, duration: 0.35 }}

// Modal entrance (already in ApprovalModal)
initial={{ opacity: 0, scale: 0.94, y: 16 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.94, y: 16 }}
transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
```

### 8.2 Table row hover

```typescript
className = "hover:bg-gray-50/50 transition-colors cursor-pointer";
```

Clicking a project row should `router.push('/project-profile/:id')`.
Clicking a project owner row should `router.push('/project-developers/:userId')`.

### 8.3 Approve/Reject button feedback

On click → button shows `<Loader2 className="animate-spin" />` while the API is in flight. On success → green checkmark icon for 1.5s, then the row fades out via `AnimatePresence`.

### 8.4 Loading states

All data-driven sections must render a skeleton while `isLoading`:

```typescript
{isLoading ? (
  <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
    <Loader2 className="h-5 w-5 animate-spin" />
    <span className="text-sm">Loading {sectionName}…</span>
  </div>
) : /* content */}
```

For StatCards while loading: show `value="—"` (already supported by the prop type).

---

## 9. Responsive Behaviour

All grids must stack on mobile:

```
4-col KPI grid:     sm:grid-cols-2 lg:grid-cols-4
3-col chart split:  md:grid-cols-3 (1 col on mobile)
3/5 + 2/5 layout:   lg:grid-cols-5 (stacked on mobile)
Tables:             overflow-x-auto on mobile (horizontal scroll)
```

Sidebar is hidden on mobile (`SidebarProvider` already handles this in the layout).

---

## 10. Accessibility

- All SVG charts must have `role="img"` and `aria-label={title}`.
- All interactive SVG elements (bars, lines, pie slices) must have `role="button"` + `tabIndex={0}` + `onKeyDown` (Enter/Space).
- All action buttons must have descriptive `aria-label`.
- Modal backdrop must have `aria-modal="true"` and focus-trap (Radix Dialog is available via shadcn — use it for the ApprovalModal instead of the manual implementation).
- Colour contrast: all text on coloured backgrounds must meet WCAG AA (4.5:1 for normal text).

---

## 11. What NOT to do

- Do not add any new `npm`/`pnpm` packages without explicit instruction.
- Do not use `localStorage` or `sessionStorage`.
- Do not create any API route files in the Next.js app — all backend calls go through `axiosClient`.
- Do not render `dangerouslySetInnerHTML`.
- Do not hard-code user IDs or role IDs — always derive from `session.user`.
- Do not use `any` TypeScript type unless wrapping `session.user as any` for known better-auth shape mismatch.
- Do not put more than 500 lines in a single component file — split into sub-components.

---

## 12. Deliverables Checklist

After generation, verify all of these:

```
[ ] page.tsx updated with new role switch
[ ] SuperAdminDashboard.tsx — complete with all 9 sections
[ ] AdminDashboard.tsx — tab-based with 3 sub-views (PM, MRV, Financial)
[ ] OrgAdminDashboard.tsx — complete with all 8 sections
[ ] SectionLabel.tsx extracted to standalone file
[ ] RecentActivity.tsx extracted to standalone file
[ ] AlertStrip.tsx extracted and reusable
[ ] ApprovalModal.tsx extracted, uses Radix Dialog, handles loading state
[ ] NetZeroGauge.tsx extracted as reusable component
[ ] MrvPipelineStepper.tsx as reusable component
[ ] HeroSection.tsx updated with super_admin, org_admin, sustainability_manager, org_auditor configs
[ ] All real API calls wired with useQuery
[ ] All mock data clearly marked with TODO comments
[ ] All loading states handled
[ ] All error states handled
[ ] Mobile responsive
[ ] Framer Motion animations on all sections
[ ] Accessibility: aria-labels on all SVG charts
[ ] No TypeScript errors (run tsc --noEmit to verify)
```

---

_Prompt authored: May 2026 · Crevy Platform · Foovante Global_
_Target: Next.js 16 / React 19 / Tailwind v4 / Framer Motion_
