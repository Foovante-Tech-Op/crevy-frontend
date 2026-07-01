# Dashboard Redesign — Decision Record & Implementation Plan

> **Status:** Approved for implementation
> **Scope:** `(dashboard)/dashboard/page.tsx` and its `_components/`, across all 3 user categories
> **Authors:** Expert council session — Product, UX, Frontend, Backend, Carbon Domain

---

## 1. Council Discussion Summary

**The problem:** The dashboard index is currently three separate, largely static files
(`SuperAdminDashboard`, `AdminDashboard`, `OrgAdminDashboard`, `ProjectOwnerDashboard`)
with hardcoded mock data and no shared component system. There is no buyer/company
dashboard at all. The role-switcher in `page.tsx` routes by role string but the
role taxonomy in the product spec has grown beyond what the switch statement covers.

**Frontend architect:** The shared primitive set in `Shared.tsx` (`StatCard`,
`SectionLabel`, `AlertStrip`, `MrvPipelineStepper`) is the right foundation —
these should become the design system for the whole dashboard, not just the
super_admin view. Every role's dashboard should compose from the same small set of
primitives, with role-specific data queries wired behind them. No new layout
components should be built before we finish extracting these into a proper
`components/dashboard/` directory.

**UX architect:** The "at a glance" principle means each dashboard should answer
one question immediately, before the user has to scroll:
- super_admin: "Is the platform healthy and do I have actions outstanding?"
- admin / project_admin / project_developer: "Where are my projects and what do I need to do?"
- buyer / company: "What's in my portfolio and what can I buy?"

Each view should therefore lead with its most urgent signal (alert strip or action count),
then KPIs, then the first actionable table — all above the fold on a 1440px screen.

**Backend/data architect:** The current mock-data pattern means the dashboard
silently lies in production. Before wiring real queries, we need to decide which
KPIs are cheap (counts from existing list endpoints) vs expensive (aggregates
that need a dedicated `/dashboard/stats` endpoint on the backend). Decision:

- Cheap (use existing hooks): project count, waitlist count, credit portfolio value
- Needs a backend endpoint: platform revenue MTD, total tCO₂e issued, payout queue value
- Defer until backend endpoint exists: credit market liquidity chart data

**Carbon domain lead:** For project developers specifically, the dashboard must
surface the Carbon Readiness Score prominently — it's the one number that tells
a project owner "here's where you are in the process." This score lives in
`project_assessment_score` and should be the hero KPI for project_developer/
project_owner views, not buried in the project detail page.

**Product:** Three user categories maps to three layout templates, not four
separate files. We consolidate:
1. `SuperAdminDashboard` — super_admin only
2. `AdminDashboard` — admin, project_admin, mrv_admin, financial_admin, project_manager
3. `BuyerDashboard` — org_admin, sustainability_manager, org_auditor, buyer (new)
4. `ProjectDeveloperDashboard` — project_owner, project_developer (new entity name)

The `OrgAdminDashboard` file currently serves org buyers — rename and expand
to cover all buyer/company roles.

---

## 2. Dashboard Index — Role → Template Map

```
Role string                     Template
─────────────────────────       ─────────────────────────────
super_admin                  →  SuperAdminDashboard
admin                        →  AdminDashboard
project_manager              →  AdminDashboard
mrv_admin                    →  AdminDashboard
financial_admin              →  AdminDashboard
project_owner                →  ProjectDeveloperDashboard
project_developer            →  ProjectDeveloperDashboard  (future role string)
org_admin                    →  BuyerDashboard
sustainability_manager       →  BuyerDashboard
org_auditor                  →  BuyerDashboard
buyer                        →  BuyerDashboard             (future role string)
```

---

## 3. SuperAdminDashboard — Sections & Data Sources

**Completed in this sprint:**
- [x] Waitlist KPI row (4 cards: Total / Pending / Approved / Conversion Rate)
  - Data: `useWaitlistRegistrations({ limit: 10 })` — already wired
- [x] Waitlist mini-table (10 most recent, using `DataTable<WaitlistRow>`)
- [x] Alert strip counts waitlist pending in addition to projects & KYC

**Next sprint (backend endpoints needed):**

| Section | KPI | Backend endpoint needed |
|---|---|---|
| Registry Liquidity | Total credits issued | `GET /dashboard/stats/credits` |
| Registry Liquidity | Gross registry value | Same |
| Financial Settlement | Platform revenue MTD | `GET /dashboard/stats/financials` |
| Financial Settlement | Payout queue outstanding | `GET /financials/payouts?status=pending` — exists |
| System Diagnostics | Polygon anchoring latency | `GET /mrv/health` — needs building |

**Sections already complete (using real component, mock data):**
- Hero Dossier (role + username + pending counts)
- KPI Matrix (4 StatCards)
- Financial Settlement (3 cards, Manage Payouts link is live)
- MRV Pipeline Stepper (stages rendered, counts are mock)
- System Diagnostics block
- Activity Feed (static, to be replaced by `GET /audit?limit=5`)

---

## 4. AdminDashboard — At-a-Glance Sections

Target audience: Crevy internal admins managing the platform on behalf of Foovante.

**Above the fold:**
1. Alert strip — pending project submissions + pending project owner onboardings
2. KPI row (4 cards):
   - Projects under management (count + breakdown by stage)
   - Project owners onboarded this month
   - MRV ingestion events this week
   - Verification success rate (%)

**Body:**
3. Project queue — short DataTable (last 5 projects in `registration` stage, `View All Projects` action)
4. Project Owner onboarding queue — short DataTable (last 5 POs, `View All` action)
5. MRV pipeline stepper (same component, admin-scoped counts)
6. Quick actions grid: Register PO | Create Project | Verify Plot | Review KYC

**Data sources (all existing hooks/services):**
- `useWaitlistRegistrations` — for pending count badge
- `GET /project-owners?limit=5` — via `project-owner-service`
- `GET /projects?limit=5&stage=registration` — via `project-service`
- MRV counts — needs `GET /mrv/stats` (backend TODO)

---

## 5. ProjectDeveloperDashboard — At-a-Glance Sections

Target audience: individual farmers, cooperatives, or companies that are project
developers — the people who submitted their project for carbon credit registration.

**Above the fold:**
1. Hero — project name (their most recently active project), current `projectStage`,
   and Carbon Readiness Score as a big number (0–100 with a ring/progress indicator)
2. Alert strip — incomplete assessment modules ("You have 3 modules left to complete")

**Body:**
3. Assessment progress — a list of the 8 modules with their status
   (not_started / in_progress / submitted), linked to each module's form.
   Data: `GET /projects/:id/assessments` — built in this sprint.
4. KPI row (3 cards):
   - Carbon Readiness Score (from `project_assessment_score`)
   - Projected CO₂e reduction (from score's `projectedCo2eReductionTco2e`)
   - Baseline waste volume (from score's `baselineWasteVolumeTonnes`)
5. Methodology recommendation card — `primaryMethodology` + `futureMethodologyPathway`
   from the latest `project_assessment_score`
6. Activity feed — last 5 project activities (`GET /projects/:id/activities`)

**Carbon Readiness Score UI:**
The score (0–100) should render as a circular progress ring with a colour gradient:
- 0–40: amber (needs work)
- 41–70: blue (in progress)
- 71–100: emerald (ready)

This is the single most important number for a project developer and should be
the visual hero of their dashboard, not a footnote.

---

## 6. BuyerDashboard (OrgAdmin / Sustainability / Buyer) — At-a-Glance Sections

Target audience: corporate buyers purchasing carbon credits for offset/compliance.

**Above the fold:**
1. Hero — company name, current portfolio tCO₂e held, next retirement deadline (if set)
2. KPI row (4 cards):
   - Credits held (tCO₂e from `portfolio`)
   - Credits retired (total retired, from `credit_transaction`)
   - Pending purchases (from `credit_transaction` where status = processing)
   - Net position (held - retired)

**Body:**
3. Portfolio snapshot — short DataTable of the buyer's 5 most recently
   purchased credit batches, linked to `/portfolio`
4. Retirement timeline — upcoming retirement commitments
5. ESG snapshot — link to `/compliance/reports` with a summary card showing
   latest ESG report date and coverage period
6. Quick actions: Buy Credits | View Portfolio | Generate ESG Report | Retire Credits

**Data sources:**
- `GET /credits/carbon-credits?ownerId=me` — via `credit-service`
- `GET /portfolio` — existing page, needs a summary endpoint
- ESG report summary — `GET /reports/esg?limit=1`

---

## 7. Public Layout — CrevyLoader on Navigation (this sprint)

**Completed:**
- [x] `(public)/layout.tsx` updated: Navbar always rendered (z-50), loader overlays
      at z-[100] — eliminates the flash where Navbar disappears during loader exit
- [x] `window.__showCrevyLoader` exposed and consumed — fires on NavLink click
      *before* router.push so the loader starts immediately on user interaction
- [x] Navbar is always mounted even during loading — no layout-shift on reveal

**Remaining gap:**
Same-page anchor clicks (e.g. `href="#how-it-works"` on the homepage) also
trigger the loader unnecessarily. Fix in `NavLink.tsx`:

```tsx
// Proposed NavLink fix
const isSamePage = href.startsWith('#');
if (!isSamePage && (window as any).__showCrevyLoader) {
  (window as any).__showCrevyLoader();
}
```

---

## 8. Component Extraction Plan

Before implementing ProjectDeveloperDashboard and BuyerDashboard, extract
shared primitives from `Shared.tsx` into `src/components/dashboard/`:

```
src/components/dashboard/
├── StatCard.tsx              ← move from dashboard/_components/Shared.tsx
├── SectionLabel.tsx          ← move from Shared.tsx
├── AlertStrip.tsx            ← move from Shared.tsx
├── MrvPipelineStepper.tsx    ← move from Shared.tsx
├── QuickActionsGrid.tsx      ← new (grid of action buttons)
├── ReadinessScoreRing.tsx    ← new (circular progress for ProjectDeveloper hero)
└── MiniDataTable.tsx         ← thin wrapper around DataTable with fixed limit=5
                                 and no pagination controls
```

`Shared.tsx` should re-export from these files for backwards compatibility during
the transition, then be removed once all consumers are updated.

---

## 9. Backend TODOs Unlocked by This Redesign

| Endpoint | Purpose | Priority |
|---|---|---|
| `GET /v2/dashboard/stats` | Aggregates for SuperAdmin KPIs (credits issued, platform revenue, payout queue total) | High |
| `GET /v2/mrv/stats` | MRV pipeline stage counts for pipeline stepper | High |
| `GET /v2/projects/:id/assessment-score` | Latest readiness score — scoring.service already has getLatestScore | High (just expose the existing method) |
| `GET /v2/audit?limit=5&actorId=me` | Activity feed for project developer dashboard | Medium |
| `GET /v2/reports/esg?limit=1` | Latest ESG report summary for buyer dashboard | Medium |

---

## 10. Open Questions

1. **Role name alignment:** The backend RBAC seed uses `project_owner` as a role
   string. The entity is now `project_developer` on the DB. Should the role string
   stay `project_owner` (RBAC permission string) or be renamed? This changes what
   `session.user.role` returns and therefore what `page.tsx` routes on. Decision
   needed before building `ProjectDeveloperDashboard`.

2. **Buyer role:** Is `buyer` a planned role string in the RBAC seed, or will
   buyers always come in as `org_admin`? If buyer is a distinct role, the switch
   statement in `page.tsx` needs a new case.

3. **Carbon Readiness Score when no modules are submitted:** Should the project
   developer dashboard show a score of 0, or a "complete your assessment" CTA?
   Panel recommendation: show partial score with a `componentsAwaitingData` note
   (already in the score's `calculationTrail`), and pin a prominent CTA at the top
   of the module list for any module still in `not_started` status.

4. **Dashboard stats endpoint domain:** New `src/v2/dashboard/` domain on the
   backend (BFF pattern — aggregates from other services), or add stat methods
   to existing service files? Recommendation: separate domain for cleanliness,
   named `src/v2/dashboard/services/dashboard-stats.service.ts`, returning a
   single consolidated response object to minimize round trips from the frontend.
