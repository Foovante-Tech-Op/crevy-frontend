# Dynamic Project Onboarding Redesign

### Modular, Sector-Agnostic Intake for Carbon, MRV & Verification Readiness Scoring

> **Document Status:** Design Proposal — Ready for Review
> **Scope:** `crevy-backend/src/v2/projects`, `crevy-frontend/src/app/(dashboard)/projects`
> **Trigger Document:** `Crevy Project Requirement Document.md` (cocoa waste → livestock feed pilot, Ghana)
> **Author Context:** Internal panel discussion — Database, Backend, Frontend, UX, and Carbon/MRV domain perspectives, written up as one document

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Panel Discussion Summary](#2-panel-discussion-summary)
3. [Core Design Decision: Dynamic Form Schema Engine](#3-core-design-decision-dynamic-form-schema-engine)
4. [Taxonomy Redesign — Sector & Project Type](#4-taxonomy-redesign--sector--project-type)
5. [Database Schema](#5-database-schema)
6. [Backend Architecture](#6-backend-architecture)
7. [Scoring Engine — Carbon, MRV & Verification Readiness](#7-scoring-engine--carbon-mrv--verification-readiness)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Migration Plan](#9-migration-plan)
10. [Open Questions for Anwar / Product](#10-open-questions-for-anwarproduct)
11. [Appendix: Module → Field → Question Map](#11-appendix-module--field--question-map)

---

## 1. Problem Statement

The current onboarding flow (`Step1_ProjectProfile` → `Step2_PracticesContext` → `Step3_Documents`) was built for one shape of project: a land-based regenerative-agriculture or renewable-energy asset with hectares, GPS centroid, and a fixed list of "practice tags." It collects identity, location, and a free-text description, then stops.

The new requirement document asks for something structurally different: **8 assessment modules** (~45 individual questions) that don't apply uniformly across project types. A cocoa-waste-to-feed project needs to answer questions about feedstock, decomposition conditions, and methane monitoring. A solar mini-grid project needs none of that — it needs capacity factors, grid displacement, and equipment specs instead. A mangrove restoration project needs neither, but needs tidal hydrology and salinity data.

Three forces are colliding:

1. **The pilot is narrow** — cocoa waste → livestock feed, Ghana only, ship fast.
2. **The platform is not** — `sectorEnum` already scaffolds `green_economy` / `brown_economy` / `blue_economy`, and `PROJECT_TYPES` already scaffolds `waste_management`, `water_projects`, `blue_carbon` as `pilotEnabled: false`. Anwar is already building for a multi-sector future.
3. **The questions are reusable, not unique** — "annual volume," "monitoring systems," "funding sources," "legal status" are asked in some form across nearly every carbon methodology on earth (Verra VM0042, Gold Standard, ACM0022, etc). Hard-coding them once per sector means re-deriving the same wheel 5 times and never converging on consistency.

If we bolt the 8 modules onto the `project` table as 45 new nullable columns, two things break immediately: the table becomes sector-specific (columns like `feedstockSource` are meaningless for a solar project), and every future sector requires a migration. The panel's job was to find the structure that avoids both.

---

## 2. Panel Discussion Summary

*(Internal working session — Database, Backend, Frontend/UX, Carbon-MRV — positions summarized below.)*

**Database lead, opening position:** The instinct to "add columns to `project`" is wrong, and we should kill it early. We're describing a JSON-schema-driven dynamic form, not a fixed entity. Postgres handles this well with a normalized core table (your scored, queryable, joinable fields) plus `jsonb` for the long tail of sector-specific answers. The key design question isn't "JSON or columns" — it's **which fields get promoted out of JSON into real columns**, because anything Crevy needs to filter, sort, sum, or score in SQL should not live buried in a blob.

**Carbon/MRV lead:** Strongly agree with not hardcoding per-sector tables. In the wild, methodology bodies (Verra, Gold Standard) already group projects by "sectoral scope" and ask overlapping baseline/monitoring/additionality questions regardless of the underlying activity. The 8 modules in the requirement doc *are* a methodology-adjacent intake structure — Module 3 (Baseline), Module 6 (Additionality), Module 7 (MRV Readiness), Module 8 (Verification Readiness) map almost 1:1 onto what Verra calls "PDD sections." That means this isn't a one-off form for cocoa waste — it's the shape every future project type's intake should take, with Module 2 ("Waste Stream Assessment") and Module 4/5 (intervention + activity data) being the *only* modules specific to Agricultural Waste Management. Modules 1, 3, 6, 7, 8 are sector-agnostic and should be shared verbatim.

**Backend lead:** Agreed on the jsonb + promoted-columns split. Practically: a project's `sector` determines which `projectType`s are selectable (many-to-many — waste management can plausibly sit in `brown_economy` AND `green_economy` depending on the intervention, so don't force one sector per type). `projectType` then determines which **modules** apply via a static, versioned config map (`PROJECT_TYPE_MODULE_MAP`), not a database table, because the question set changes with methodology updates and shouldn't require a migration to edit — it should require a config/code change with a PR review, deployed like any other code. The actual *answers* go into a new `project_assessment` table keyed by `(projectId, moduleKey)`, one row per module, `jsonb` payload, with a `schemaVersion` so we can evolve the question set under a type without corrupting old submissions.

**Frontend/UX lead:** From a UI standpoint this is good news, not bad news — it means Step 2 of the wizard becomes a **module renderer** driven by a manifest, not a hand-built form per sector. We already disable unbuilt types in `Step1_ProjectProfile` (`pilotEnabled: false`); the same pattern extends naturally — show all 8 modules in the sidebar, render whichever ones the selected `projectType` maps to, skip the rest. For Ghana-local pilot users specifically (per the prompt: "local project owners in Ghana," many on mobile, some with literacy/connectivity constraints), the **register-now-answer-later** pattern matters: don't block project creation on completing every module. Let the project exist in a `draft`/`incomplete_assessment` state, and let the readiness scores simply reflect "we don't know yet" until each module is filled in. Forcing 45 fields before a project is allowed to exist is the single most common reason these intake systems die in the field.

**Database lead, response:** Agreed, and it changes the schema: `project_assessment.status` per module (`not_started` / `in_progress` / `submitted`), not just one big "is the project complete" flag.

**Carbon/MRV lead, on scoring:** The "automatically generate baseline / readiness scores" requirement needs its own service, not inline logic in `project.service.ts`. The scoring is methodology-dependent (e.g. methane avoidance calculations differ for cocoa husk vs rice husk vs landfill diversion), so it has to be pluggable per `projectType`, same as the question modules. Score now, recompute later — a project's score is a derived snapshot, not a static field; it should be regenerated whenever a module is submitted, and timestamped/versioned so changes are auditable (the existing `audit_log` table already gives us a pattern to follow). Critically: **this is not credit calculation.** `project.service.ts`'s own comments are explicit that CraftedClimate is the sole source of truth for `net_credits_issued`. The readiness scores and baseline estimates are *pre-screening / methodology-routing outputs* — they tell Crevy and the project owner "this looks promising, here's the gap," not "you will get X credits." That boundary needs to be loud in the code and the UI so nobody confuses a readiness score with a verified credit volume.

**Backend lead, on facility vs land:** One more structural problem nobody's said out loud yet — `project_plot` / `farm_plot` is a *land parcel* model (centroid, GPS boundary, hectares). A cocoa-waste-to-feed operation is a **processing facility**, not a farm plot. Forcing it through `farm_plot` (which the current `createProject` transaction does automatically, grabbing "the project owner's first farm plot") is a latent bug — it will silently misattribute facility projects to whatever farm plot the owner happens to have, or fail/null out if they have none. We need a `projectSite` concept that's facility-or-plot, not just plot.

**UX lead, closing:** One last thing — the existing wizard's copywriting (Phase 01/03, "Asset Telemetry," "Cryptographic Documentation," "Commit & Proceed") is a deliberate stylistic choice (terminal/ledger aesthetic) that's already shipped and the team should keep it, but it was written for a 3-step land-asset flow. With modules now variable in count (5–8 depending on type), the step labels need to become data-driven from the module manifest rather than a hardcoded `STEPS` array, or every new project type requires editing `page.tsx`.

**Consensus reached.** The sections below are the resulting design.

---

## 3. Core Design Decision: Dynamic Form Schema Engine

The architecture has four moving parts that didn't exist before:

```
sector (1) ──< (many) projectType ──< (many) assessmentModule ──< (many) questionField
                     │
                     └──> determines which modules render, via a static manifest
```

**Sector ↔ ProjectType is many-to-many**, not the current `pilotEnabled` flat list. A project type like `agricultural_waste_management` can belong to `brown_economy` (its default/primary classification, since it's diverting waste) but the *intervention* chosen inside Module 4 (e.g. "biochar production") could push it toward `green_economy` characteristics for marketplace/buyer-facing purposes. Rather than guess, the panel's resolution is:

- Every `projectType` has exactly one **primary sector** (used for default classification, indexing, and the existing `sector` column on `project` — nothing breaks downstream).
- A project type *may* declare additional **eligible sectors** it can also be tagged into, surfaced as a multi-select at review time, stored separately (see §5.2 `project_sector_tag`), purely for marketplace discovery/filtering. This does not change `project.sector`, which stays a single source of truth for the existing credit/marketplace pipeline.

**ProjectType → Modules is a static, versioned manifest** (`PROJECT_TYPE_MODULE_MAP`), not a database table. Reasoning: question sets change when methodology guidance changes, and that's a reviewable, testable, deployable code change — not something a non-technical admin should be able to silently edit via a CMS and break baseline scoring. The manifest lives in `src/v2/projects/config/assessment-modules.config.ts` and is imported by both the validation schema and the scoring engine, so the questions, the validation, and the score inputs can never drift out of sync with each other.

**Module answers are `jsonb`, validated per-module by a Zod schema selected at runtime** based on `projectType`. This is the only way to keep 8 modules × N project types from becoming 8×N database tables or 8×N hardcoded branches in one giant schema file.

---

## 4. Taxonomy Redesign — Sector & Project Type

### 4.1 Sector enum (extend, don't replace)

`sectorEnum` stays as-is (`green_economy`, `brown_economy`, `blue_economy`) — it's already correct and is referenced by the marketplace, credits, and `project.sector`. We are not adding a 4th sector; existing carbon-market taxonomy (and the requirement doc's own sector list) maps fully into these three buckets.

### 4.2 Project type enum (extend)

```ts
export const projectTypeEnum = pgEnum('project_type_enum', [
  // ── Existing — Green Economy — PILOT ──────────────────────────────
  'regenerative_agriculture',
  'renewable_energy',

  // ── Existing — scaffolded, now being activated ────────────────────
  'agricultural_waste_management',   // renamed from 'waste_management' — see note below
  'water_projects',
  'blue_carbon',

  // ── New — implied by requirement doc's Sector Classification list ─
  'biochar',
  'agricultural_land_management',
  'circular_bioeconomy',
  'aquaculture',
  'fisheries',
  'other',
])
```

**Naming note:** the requirement doc's sector-classification list uses "Agricultural Waste Management" as a distinct category from the generic "Waste Management" currently in `PROJECT_TYPES`/`projectTypeEnum`. Renaming `waste_management` → `agricultural_waste_management` is a breaking enum rename — see §9 Migration Plan for the safe path (Postgres enum rename, not column re-type). If no production rows exist yet with `project_type = 'waste_management'` (likely true, given `pilotEnabled: false`), this is a zero-risk rename done in the same migration that adds the others.

`'other'` exists for the open-ended "have a different project in mind" path the frontend's `ProjectTypeStep.tsx` already supports via `customProjectName` — currently that free-text field has no backend home at all (it's frontend-only state that's silently dropped on submit, since `createProjectInputSchema` has no `customProjectName` field). This redesign gives it one: `projectType: 'other'` + a required `customProjectTypeLabel` string, stored on `project`, with **zero assessment modules** rendered (an "other" project gets only Module 1 + a generic free-text description, and is flagged for manual methodology assignment by an admin — see `assignedMethodologyStatus` in §5.1).

### 4.3 Sector ↔ Project Type mapping

| Project Type | Primary Sector | Eligible Secondary Sectors | Pilot Status |
|---|---|---|---|
| `regenerative_agriculture` | `green_economy` | — | ✅ Active pilot |
| `renewable_energy` | `green_economy` | — | ✅ Active pilot |
| `agricultural_waste_management` | `brown_economy` | `green_economy` (if intervention = biochar/composting) | ✅ **New pilot — cocoa waste** |
| `biochar` | `green_economy` | `brown_economy` | 🔲 Scaffolded |
| `circular_bioeconomy` | `brown_economy` | `green_economy` | 🔲 Scaffolded |
| `agricultural_land_management` | `green_economy` | — | 🔲 Scaffolded |
| `water_projects` | `blue_economy` | — | 🔲 Scaffolded |
| `blue_carbon` | `blue_economy` | — | 🔲 Scaffolded |
| `aquaculture` | `blue_economy` | `green_economy` | 🔲 Scaffolded |
| `fisheries` | `blue_economy` | — | 🔲 Scaffolded |
| `other` | *(set at review by admin)* | — | 🔲 Manual triage |

This table is the literal content of `PROJECT_TYPE_SECTOR_MAP` in the config file referenced throughout this document — single source of truth, imported by frontend (for the type-selector UI) and backend (for `sector` auto-fill on project creation) alike, via a shared package or a generated constants file so the two never drift (see §6.5).

---

## 5. Database Schema

### 5.1 `project` table — minimal additions

No waste-stream-specific columns are added here — that's the point of the redesign. Three small, sector-agnostic additions:

```ts
// src/v2/projects/models/project.model.ts — additions only

export const assessmentCompletionEnum = pgEnum('assessment_completion_enum', [
  'not_started', 'in_progress', 'complete',
])

// ...inside pgTable('project', { ... })
customProjectTypeLabel: varchar('custom_project_type_label', { length: 255 }),
// only populated when projectType = 'other'; admin re-classifies during review

assessmentCompletion: assessmentCompletionEnum('assessment_completion')
  .notNull().default('not_started'),
// rolled up from project_assessment rows — denormalized for fast list/filter
// queries (e.g. "show me all projects still missing MRV readiness data")
// without a join+aggregate on every list call. Recomputed by
// AssessmentService whenever a module is submitted.

assignedMethodologyStatus: varchar('assigned_methodology_status', { length: 50 })
  .default('pending'),
// 'pending' | 'auto_suggested' | 'admin_confirmed'
// Tracks the Methodology Recommendation output (§7) lifecycle — whether it's
// just an algorithmic suggestion or has been confirmed by a human reviewer.
// Confirmation gate before a project can move past `projectStage: 'registration'`.
```

Everything else proposed by the requirement doc — feedstock source, disposal practice, methane monitoring, energy use, funding sources, legal status, etc — does **not** belong on `project`. It belongs in the new table below.

### 5.2 New table: `project_sector_tag`

Implements the many-to-many secondary-sector tagging from §4.3, purely additive, purely for marketplace discovery — never read by the credit/scoring pipeline.

```ts
// src/v2/projects/models/project_sector_tag.model.ts
import { pgTable, uuid, timestamp, unique } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { project, sectorEnum } from './project.model'
import { uuidv7PK } from '@/shared/utils/id'

/**
 * project_sector_tag
 * Secondary/eligible-sector tagging for marketplace discovery only.
 * project.sector remains the single authoritative sector for credit
 * accounting and the existing marketplace filter. This table answers
 * "what else could a buyer reasonably search this project under" —
 * e.g. a biochar project is primarily green_economy but a buyer
 * filtering by brown_economy (waste diversion) should still find it.
 */
export const projectSectorTag = pgTable('project_sector_tag', {
  id:         uuid('id').primaryKey().$defaultFn(uuidv7PK),
  projectId:  uuid('project_id').notNull().references(() => project.id, { onDelete: 'cascade' }),
  sector:     sectorEnum('sector').notNull(),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique('uq_project_sector_tag').on(t.projectId, t.sector),
])

export const projectSectorTagRelations = relations(projectSectorTag, ({ one }) => ({
  project: one(project, { fields: [projectSectorTag.projectId], references: [project.id] }),
}))
```

### 5.3 New table: `project_assessment` (the core of the redesign)

```ts
// src/v2/projects/models/project_assessment.model.ts
import { pgTable, pgEnum, uuid, varchar, integer, jsonb, timestamp, unique, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { project } from './project.model'
import { uuidv7PK } from '@/shared/utils/id'

export const assessmentModuleKeyEnum = pgEnum('assessment_module_key_enum', [
  'project_identification',       // Module 1 — shared by ALL project types
  'waste_stream',                 // Module 2 — agri-waste-management family
  'baseline_emissions',           // Module 3 — shared by most types
  'project_intervention',         // Module 4 — agri-waste-management family
  'activity_data',                // Module 5 — agri-waste-management family
  'carbon_market_readiness',      // Module 6 — shared by ALL project types
  'mrv_readiness',                // Module 7 — shared by ALL project types
  'verification_readiness',       // Module 8 — shared by ALL project types
])

export const assessmentStatusEnum = pgEnum('assessment_status_enum', [
  'not_started', 'in_progress', 'submitted',
])

/**
 * project_assessment
 * One row per (project, module). The `answers` jsonb payload is validated
 * server-side against the Zod schema selected by
 * (project.projectType, moduleKey, schemaVersion) — see
 * src/v2/projects/config/assessment-modules.config.ts.
 *
 * WHY ONE ROW PER MODULE, NOT ONE ROW PER PROJECT:
 *   - Lets the UX "register now, answer later" pattern work: a module can be
 *     'not_started' while siblings are 'submitted', without nullable-column
 *     sprawl on a single mega-row.
 *   - Lets the scoring engine recompute a single module's contribution
 *     without re-parsing a project-wide blob.
 *   - schemaVersion is PER MODULE, because methodology guidance for, say,
 *     "Baseline Emissions" can revise independently of "MRV Readiness".
 *
 * schemaVersion: integer, bumped whenever the corresponding Zod schema in
 * the config file changes shape. Old submitted rows keep their original
 * schemaVersion forever — we do NOT retroactively migrate jsonb answers.
 * The scoring engine reads schemaVersion to know how to interpret old rows.
 */
export const projectAssessment = pgTable('project_assessment', {
  id:             uuid('id').primaryKey().$defaultFn(uuidv7PK),
  projectId:      uuid('project_id').notNull().references(() => project.id, { onDelete: 'cascade' }),
  moduleKey:      assessmentModuleKeyEnum('module_key').notNull(),
  schemaVersion:  integer('schema_version').notNull().default(1),
  status:         assessmentStatusEnum('status').notNull().default('not_started'),
  answers:        jsonb('answers').$type<Record<string, unknown>>().notNull().default({}),
  submittedBy:    varchar('submitted_by', { length: 255 }),
  submittedAt:    timestamp('submitted_at', { withTimezone: true }),
  createdAt:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:      timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  unique('uq_project_assessment_module').on(t.projectId, t.moduleKey),
  index('idx_project_assessment_project').on(t.projectId),
  index('idx_project_assessment_status').on(t.status),
  // GIN index enables querying inside the jsonb payload directly when needed
  // (e.g. admin dashboard: "find all projects where feedstockSource = 'cocoa_husks'")
  index('idx_project_assessment_answers').using('gin', t.answers),
])

export const projectAssessmentRelations = relations(projectAssessment, ({ one }) => ({
  project: one(project, { fields: [projectAssessment.projectId], references: [project.id] }),
}))
```

### 5.4 New table: `project_assessment_score`

Separates *what the user answered* (`project_assessment`) from *what we calculated from it* (`project_assessment_score`) — per the panel's "score is a derived, recomputable, versioned snapshot" decision. This also cleanly answers "what Crevy should calculate automatically" from the requirement doc without polluting `project_assessment.answers`.

```ts
// src/v2/projects/models/project_assessment_score.model.ts
import { pgTable, uuid, integer, decimal, jsonb, varchar, timestamp, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { project } from './project.model'
import { uuidv7PK } from '@/shared/utils/id'

/**
 * project_assessment_score
 * Derived output of ScoringService, recomputed every time a relevant
 * project_assessment module is submitted/updated. Append-only — each
 * recomputation inserts a NEW row rather than updating in place, so the
 * score history is auditable (mirrors the audit_log pattern already used
 * for `project` and `project_owner_enrollment`). Callers needing the
 * "current" score should query ORDER BY created_at DESC LIMIT 1, or use
 * ScoringService.getLatest(projectId), which wraps that query.
 *
 * IMPORTANT — SCOPE BOUNDARY:
 * This table holds PRE-SCREENING outputs (readiness scores, baseline
 * estimates, methodology suggestions). It is NEVER read by the credit
 * issuance pipeline. CraftedClimate's mrv_verification_result.net_credits_issued
 * remains the sole authoritative source for actual issued credit volumes,
 * exactly as documented in project.model.ts and carbon_credit.model.ts.
 * Mixing these two concerns is the single biggest risk this table
 * introduces if a future engineer doesn't read this comment.
 */
export const projectAssessmentScore = pgTable('project_assessment_score', {
  id:                       uuid('id').primaryKey().$defaultFn(uuidv7PK),
  projectId:                uuid('project_id').notNull().references(() => project.id, { onDelete: 'cascade' }),

  carbonReadinessScore:     integer('carbon_readiness_score'),       // 0–100
  dataQualityScore:         integer('data_quality_score'),           // component
  additionalityScore:       integer('additionality_score'),          // component
  monitoringCapabilityScore: integer('monitoring_capability_score'), // component
  documentationScore:       integer('documentation_score'),          // component
  verificationReadinessScore: integer('verification_readiness_score'), // component

  baselineWasteVolumeTonnes:   decimal('baseline_waste_volume_tonnes', { precision: 12, scale: 3 }),
  baselineDisposalPathway:     varchar('baseline_disposal_pathway', { length: 100 }),
  baselineMethanePotentialTco2e: decimal('baseline_methane_potential_tco2e', { precision: 12, scale: 6 }),
  baselineEmissionsEstimateTco2e: decimal('baseline_emissions_estimate_tco2e', { precision: 12, scale: 6 }),

  projectedWasteDivertedTonnes: decimal('projected_waste_diverted_tonnes', { precision: 12, scale: 3 }),
  projectedMethaneAvoidedTco2e: decimal('projected_methane_avoided_tco2e', { precision: 12, scale: 6 }),
  projectedCo2eReductionTco2e:  decimal('projected_co2e_reduction_tco2e', { precision: 12, scale: 6 }),

  primaryMethodology:       varchar('primary_methodology', { length: 150 }),
  alternativeMethodology:   varchar('alternative_methodology', { length: 150 }),
  futureMethodologyPathway: text('future_methodology_pathway'),

  // Full structured calculation trail — every intermediate value the
  // scoring engine used, for auditability and for surfacing "why this
  // score" detail in the admin UI without recomputing.
  calculationTrail:        jsonb('calculation_trail').$type<Record<string, unknown>>(),

  scoringEngineVersion:     varchar('scoring_engine_version', { length: 50 }).notNull(),
  calculatedAt:             timestamp('calculated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('idx_assessment_score_project').on(t.projectId),
  index('idx_assessment_score_calculated_at').on(t.calculatedAt),
])

export const projectAssessmentScoreRelations = relations(projectAssessmentScore, ({ one }) => ({
  project: one(project, { fields: [projectAssessmentScore.projectId], references: [project.id] }),
}))
```

*(Note: `text` import needs adding alongside the others in the actual file — omitted from the snippet header above for brevity.)*

### 5.5 New table: `project_site` — replacing the farm-plot assumption

Addresses the panel's facility-vs-land finding directly. This does **not** replace `project_plot`/`farm_plot` — land-based project types (`regenerative_agriculture`, `agricultural_land_management`) keep using them exactly as today. It adds a parallel, explicit "what kind of physical site does this project run on" concept so `createProject` stops silently grabbing "the owner's first farm plot" for project types that aren't land-based at all.

```ts
// src/v2/projects/models/project_site.model.ts
import { pgTable, pgEnum, uuid, varchar, decimal, customType, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { project } from './project.model'
import { uuidv7PK } from '@/shared/utils/id'

export const siteTypeEnum = pgEnum('site_type_enum', [
  'farm_plot',           // land parcel — delegates to existing farm_plot/project_plot tables
  'processing_facility',  // cocoa waste→feed plant, biochar kiln, composting yard, etc
  'energy_installation',  // solar array, biogas digester, mini-hydro
  'water_body',           // for water_projects / aquaculture / fisheries
  'coastal_zone',         // for blue_carbon
])

const geographyPoint = customType<{ data: string }>({
  dataType() { return 'GEOGRAPHY(Point, 4326)' },
})

/**
 * project_site
 * One row per project (1:1 for the pilot; schema allows 1:many for future
 * multi-site projects, e.g. a feed-processing operator sourcing from
 * several collection points). Decouples "where does this project
 * physically happen" from the land-tenure-specific farm_plot model.
 *
 * For siteType = 'farm_plot', plotId is populated and most fields here
 * are left null — the farm_plot row remains the source of truth for
 * boundary/centroid/tenure. For all other siteTypes, this row IS the
 * source of truth; there is no farm_plot to defer to.
 */
export const projectSite = pgTable('project_site', {
  id:             uuid('id').primaryKey().$defaultFn(uuidv7PK),
  projectId:      uuid('project_id').notNull().references(() => project.id, { onDelete: 'cascade' }),
  siteType:       siteTypeEnum('site_type').notNull(),
  plotId:         uuid('plot_id'),  // FK to farm_plot.id when siteType = 'farm_plot'; nullable otherwise
  facilityName:   varchar('facility_name', { length: 255 }),
  address:        varchar('address', { length: 500 }),
  centroid:       geographyPoint('centroid'),
  areaOrCapacity: decimal('area_or_capacity', { precision: 12, scale: 3 }),
  // areaOrCapacity unit is contextual to siteType — hectares for farm_plot/
  // coastal_zone, tonnes/year processing capacity for processing_facility,
  // kW/MW nameplate for energy_installation. Unit is recorded alongside the
  // value inside project_assessment (Module 1/4 answers), not duplicated here.
  createdAt:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const projectSiteRelations = relations(projectSite, ({ one }) => ({
  project: one(project, { fields: [projectSite.projectId], references: [project.id] }),
}))
```

This also resolves a real, currently-shippable bug: `ProjectService.createProject` (see `services/project.service.ts`) unconditionally does:

```ts
const [plot] = await tx.select().from(farmPlot)
  .where(eq(farmPlot.projectOwnerId, ownerId)).limit(1)...
if (plot) { await tx.insert(projectPlot).values({ ... }) }
```

For a cocoa-waste project owner with no `farm_plot` row at all, this silently no-ops (fine, if accidental) — but for an owner who *also* has unrelated farm plots from a different project, it will enroll the wrong, unrelated plot against this new project. §6.2 specifies the corrected branch.

---

## 6. Backend Architecture

### 6.1 Directory additions

```
src/v2/projects/
├── config/
│   └── assessment-modules.config.ts   ← NEW — the manifest (§6.4)
├── models/
│   ├── project_assessment.model.ts        ← NEW
│   ├── project_assessment_score.model.ts  ← NEW
│   ├── project_sector_tag.model.ts        ← NEW
│   └── project_site.model.ts              ← NEW
├── schemas/
│   ├── project_assessment.schema.ts       ← NEW (dynamic, see §6.3)
│   └── (existing schemas — project.schema.ts gets the §5.1 additions)
├── services/
│   ├── project_assessment.service.ts      ← NEW
│   ├── scoring.service.ts                 ← NEW (§7)
│   └── (existing — project.service.ts gets the §6.2 fix)
├── controllers/
│   └── project_assessment.controller.ts   ← NEW
└── routes/
    └── (existing project.route.ts gets new sub-routes, §6.6)
```

### 6.2 `project.service.ts` — fix the plot-enrollment branch

```ts
// Inside createProject, replace the unconditional farmPlot lookup with:

if (PROJECT_TYPE_SITE_KIND[body.projectType] === 'farm_plot') {
  // existing behavior, unchanged, for land-based project types
  const [plot] = await tx.select().from(farmPlot)
    .where(eq(farmPlot.projectOwnerId, ownerId)).limit(1);
  if (plot) {
    await tx.insert(projectPlot).values({ ...existing logic... });
  }
} else {
  // facility/energy/water project types — create a project_site row instead,
  // populated from the Module 1 "Project Information" answers once submitted.
  // At creation time (before any module is submitted) we insert a placeholder
  // project_site row with siteType only, so downstream code can always find
  // *a* site row for the project without null-checking project type first.
  await tx.insert(projectSite).values({
    projectId: created.id,
    siteType: PROJECT_TYPE_SITE_KIND[body.projectType],
  });
}
```

`PROJECT_TYPE_SITE_KIND` is a small exported map living next to `PROJECT_TYPE_SECTOR_MAP` in the config file (§6.4) — e.g. `{ regenerative_agriculture: 'farm_plot', agricultural_waste_management: 'processing_facility', renewable_energy: 'energy_installation', blue_carbon: 'coastal_zone', ... }`.

### 6.3 Dynamic validation — how one endpoint validates N different shapes

The hard requirement is: `POST /api/v2/projects/:id/assessments/:moduleKey` must validate the request body differently depending on the project's `projectType`, without 8 modules × 10 types = 80 hand-written Zod schemas.

Resolution: **composable field schemas, assembled per (moduleKey, projectType) at request time**, not 80 static schemas.

```ts
// src/v2/projects/schemas/project_assessment.schema.ts

import { z } from 'zod';
import { FIELD_LIBRARY } from '../config/assessment-modules.config';

/**
 * FIELD_LIBRARY (defined in the config file, §6.4) holds ONE Zod schema
 * fragment per question field, keyed by a stable fieldKey
 * (e.g. 'feedstockSource', 'annualWasteVolumeTonnes', 'fundingSources').
 * Modules are just an ordered list of fieldKeys per projectType.
 * This means "Annual Volume" is written ONCE and reused by every project
 * type that asks it — Module 2 reuses it for waste, a future biochar
 * module reuses the same field for feedstock-in, etc.
 */
export function buildAssessmentSchema(moduleKey: string, projectType: string) {
  const fieldKeys = getModuleFieldsForType(moduleKey, projectType); // from manifest
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const key of fieldKeys) {
    shape[key] = FIELD_LIBRARY[key].zodSchema;
  }
  return z.object({ body: z.object(shape).partial() });
  // .partial() because of "register now, answer later" — a module can be
  // saved as in_progress with only some fields filled. Full-completeness
  // (status: 'submitted') is checked separately by required-field rules
  // also declared in the manifest, NOT by Zod required(), so partial saves
  // never fail validation.
}
```

The validation middleware (`validateInboundRequest`) already takes a Zod schema per route — the only change needed is that this particular route resolves its schema dynamically inside the controller (fetch project → get projectType → `buildAssessmentSchema`) rather than statically at route-definition time like every other route in the codebase. This is the one deliberate exception to the "schema defined at route level" convention, and should be called out as such in code comments so it doesn't look like an oversight during review.

### 6.4 The manifest — `assessment-modules.config.ts`

This is the single file that encodes "what does the requirement doc's 8-module structure actually mean in code." Structure (abbreviated — full field list in §11 Appendix):

```ts
// src/v2/projects/config/assessment-modules.config.ts
import { z } from 'zod';

export const FIELD_LIBRARY = {
  feedstockSource: {
    label: 'What waste material is being utilized?',
    zodSchema: z.enum(['cocoa_pods', 'cocoa_husks', 'cocoa_shells', 'rice_husks', 'palm_waste', 'mixed_agricultural_residues', 'other']),
    inputType: 'select',
  },
  annualWasteVolumeTonnes: {
    label: 'How much waste is generated annually?',
    zodSchema: z.coerce.number().nonnegative(),
    inputType: 'number',
    unit: 'tonnes/year',
  },
  // ...all ~45 fields, ONE definition each, reused across modules/types...
} satisfies Record<string, FieldDefinition>;

export const MODULE_DEFINITIONS: Record<AssessmentModuleKey, ModuleDefinition> = {
  project_identification: {
    title: 'Project Identification',
    sharedAcrossAllTypes: true,
    fields: ['projectName', 'organizationName', 'projectLead', 'contactDetails',
             'gpsCoordinates', 'currentProjectStage', 'sectorClassification', 'projectDescription'],
  },
  waste_stream: {
    title: 'Waste Stream Assessment',
    sharedAcrossAllTypes: false,
    fields: ['feedstockSource', 'annualWasteVolumeTonnes', 'currentDisposalPractice',
             'disposalLocation', 'historicalDataYears'],
  },
  baseline_emissions: {
    title: 'Baseline Emissions Assessment',
    sharedAcrossAllTypes: true,  // every methodology needs SOME baseline
    fields: ['existingWasteManagementSplit', 'decompositionConditions',
             'averageDecompositionPeriod', 'methaneMonitoringExists', 'methaneMonitoringEvidence'],
  },
  // ...modules 4-8...
};

/**
 * THE manifest: which modules render for which project type, in what order.
 * This is the literal translation of "the questions for Agricultural Waste
 * Management won't all apply to other types" into something the renderer
 * and validator both consume.
 */
export const PROJECT_TYPE_MODULE_MAP: Record<string, AssessmentModuleKey[]> = {
  agricultural_waste_management: [
    'project_identification', 'waste_stream', 'baseline_emissions',
    'project_intervention', 'activity_data', 'carbon_market_readiness',
    'mrv_readiness', 'verification_readiness',
  ],
  biochar: [
    'project_identification', 'waste_stream', 'baseline_emissions',
    'project_intervention', 'activity_data', 'carbon_market_readiness',
    'mrv_readiness', 'verification_readiness',
  ], // same shape as agri-waste-management — biochar IS a waste→carbon intervention
  circular_bioeconomy: [
    'project_identification', 'waste_stream', 'baseline_emissions',
    'project_intervention', 'activity_data', 'carbon_market_readiness',
    'mrv_readiness', 'verification_readiness',
  ],
  regenerative_agriculture: [
    'project_identification', 'baseline_emissions',
    'carbon_market_readiness', 'mrv_readiness', 'verification_readiness',
    // no waste_stream / project_intervention / activity_data — not applicable
  ],
  renewable_energy: [
    'project_identification', 'baseline_emissions',
    'carbon_market_readiness', 'mrv_readiness', 'verification_readiness',
  ],
  other: ['project_identification'],
  // remaining scaffolded types follow the same pattern, filled in as each
  // is activated — see §10 open question on water/blue-carbon module design
};

export const PROJECT_TYPE_SECTOR_MAP = { /* §4.3 table, as code */ };
export const PROJECT_TYPE_SITE_KIND  = { /* §6.2 site-kind map */ };
```

This file is the **one place** a future engineer edits to onboard a new project type's question set — not the schema file, not the model, not the frontend component tree. That centralization is the entire point of the redesign.

### 6.5 Frontend/backend manifest sync

The frontend needs `MODULE_DEFINITIONS` and `PROJECT_TYPE_MODULE_MAP` too (to render the right fields with the right labels/input types), but must never be allowed to silently diverge from the backend's copy — that's how "field exists in UI but backend rejects it" bugs happen. Two viable options, both acceptable, pick one during implementation:

- **Option A (simpler, recommended for the pilot):** Backend exposes `GET /api/v2/projects/assessment-manifest` returning the full manifest as JSON. Frontend fetches it once (cached, rarely changes) and renders entirely from the response. Zero duplication, by construction.
- **Option B (if a shared monorepo package is feasible later):** Extract the manifest into a package both repos import. More setup cost, not worth it for a two-repo, non-monorepo pilot right now.

Recommend **Option A** for this phase. It also means the frontend's `PROJECT_TYPES` / `PRACTICES_BY_TYPE` constants in `new-project.ts` shrink to just display metadata (icon, title, color) — the actual question structure comes from the API, not a hardcoded TS file that has to be redeployed to change a label.

### 6.6 New routes

```ts
// Added to src/v2/projects/routes/project.route.ts

GET    /api/v2/projects/assessment-manifest
       → returns MODULE_DEFINITIONS + PROJECT_TYPE_MODULE_MAP + FIELD_LIBRARY metadata
         (labels/options/input types only — never the zodSchema objects themselves)

GET    /api/v2/projects/:id/assessments
       → list all project_assessment rows for a project, with status per module

GET    /api/v2/projects/:id/assessments/:moduleKey
       → fetch one module's current answers + status

PUT    /api/v2/projects/:id/assessments/:moduleKey
       → upsert answers for one module. body validated dynamically (§6.3).
         query param ?status=in_progress|submitted controls whether full
         required-field checks run (submitted) or are skipped (in_progress)

GET    /api/v2/projects/:id/assessment-score
       → latest project_assessment_score row (ScoringService.getLatest)

POST   /api/v2/projects/:id/assessment-score/recalculate
       → manual trigger (admin-only) — normally auto-triggered on submit
```

Permission model follows the existing precedent in `project.controller.ts`'s own comment block: project owner (creator) can read/write their own project's assessments; `projects:manage` admins can read/write any.

---

## 7. Scoring Engine — Carbon, MRV & Verification Readiness

`ScoringService` (`src/v2/projects/services/scoring.service.ts`) is deliberately **pluggable per `projectType`**, mirroring the module manifest's structure — because the actual *math* of "how much methane did diverting cocoa husks avoid" is nothing like "how much carbon does a solar mini-grid displace," even though both produce the same shaped output (`project_assessment_score` row).

```ts
interface ScoringStrategy {
  computeBaseline(answers: ModuleAnswersByKey): BaselineResult;
  computeProjectedImpact(baseline: BaselineResult, answers: ModuleAnswersByKey): ProjectedImpactResult;
  computeReadinessScore(answers: ModuleAnswersByKey): ReadinessScoreResult; // the 0-100 + components
  recommendMethodology(answers: ModuleAnswersByKey, baseline: BaselineResult): MethodologyRecommendation;
}

// One strategy per project type (or shared where the math is genuinely shared):
const SCORING_STRATEGIES: Record<string, ScoringStrategy> = {
  agricultural_waste_management: agriculturalWasteManagementStrategy,
  biochar: biocharStrategy,
  // regenerative_agriculture / renewable_energy: readiness-score-only strategy
  // (no waste-stream baseline math applies — see fallback below)
};

const FALLBACK_READINESS_ONLY_STRATEGY: Partial<ScoringStrategy> = {
  // used for project types with no waste/emissions baseline math defined yet —
  // computes the readiness score components only, leaves baseline/projected
  // impact fields null rather than guessing
};
```

### 7.1 `agriculturalWasteManagementStrategy` — the pilot's actual math

This is the concrete implementation the cocoa-waste pilot needs immediately. Pulled directly from the requirement doc's "10 most important fields" list and Module 2/3 questions:

**Baseline waste volume** = `annualWasteVolumeTonnes` (Module 2, direct passthrough).

**Baseline disposal pathway** = `currentDisposalPractice` (Module 2, direct passthrough) — but weighted by the `existingWasteManagementSplit` percentages from Module 3 if provided (e.g. "60% burned, 40% left on-site" rather than one single answer), since real operations rarely use one disposal method exclusively.

**Baseline methane generation potential** — this is the one place the panel flagged a real methodological dependency: methane generation potential from organic waste decomposition is standard climate-science territory (IPCC default emission factors / first-order decay model, the same approach Verra's ACM0022 and Gold Standard's GHG accounting for organic waste both use). The formula needs:
- waste mass (`annualWasteVolumeTonnes`)
- a feedstock-specific degradable organic carbon factor (DOC) — **this requires a lookup table of default emission factors per `feedstockSource`**, which does not yet exist anywhere in the codebase and is **the one genuinely new piece of domain data this redesign requires someone with carbon-accounting expertise to supply** (see §10, open question #1)
- decomposition conditions (`decompositionConditions` from Module 3 — open air vs covered vs waterlogged materially changes methane correction factor MCF)
- historical baseline disposal method, to compute counterfactual (what would have happened without the project)

Until that emission-factor lookup table is supplied and reviewed, `ScoringService` should **return the score components it can compute (data quality, additionality, monitoring capability, documentation, verification readiness — all answerable directly from yes/no and categorical Module 6/7/8 answers) and explicitly null out `baselineMethanePotentialTco2e` / `projectedMethaneAvoidedTco2e` with a `calculationTrail` note explaining why**, rather than shipping a guessed default factor that could materially mislead a project owner about their carbon potential. This is a deliberate "don't fabricate a number" decision, consistent with the existing codebase's `mrv_verification_result` comment about never using unvetted gross figures.

**Carbon Readiness Score (0–100)** — this part has no external dependency and can ship immediately:

| Component | Weight | Computed from |
|---|---|---|
| Data quality | 20 | `historicalDataYears` (Module 2) + whether `methaneMonitoringEvidence` was uploaded (Module 3) |
| Additionality | 20 | `additionality` answer (Module 6: Yes/No/Unsure) — "No" or "Unsure" scores low, since it threatens the entire carbon-finance case |
| Monitoring capability | 20 | `monitoringSystems` selection (Module 7) — Sensors/ERP score higher than Manual/Excel |
| Documentation quality | 20 | count of uploaded supporting docs present (Module 7) against the expected set |
| Verification readiness | 20 | legal registration + land/facility rights + permits, all boolean (Module 8) |

Each component is independently computable the moment its module is `submitted` — this is exactly why scores recompute per-module-submission rather than waiting for all 8 modules, satisfying the "register now, answer later" UX requirement while still giving the project owner an improving, partial score to see progress against.

**Methodology Recommendation** — for the pilot, this can reasonably be a **rules table, not a model**: `feedstockSource = cocoa_husks/cocoa_pods/cocoa_shells` + `intervention = livestock_feed_production` → primary methodology suggestion drawn from a small static lookup (e.g. pointing toward the Verra/Gold Standard methodology families that cover agricultural-residue diversion and avoided-methane projects), with `alternativeMethodology` as a documented fallback and `futureMethodologyPathway` as free text. This also needs domain-expert input to populate correctly — flagged in §10.

---

## 8. Frontend Architecture

### 8.1 Wizard restructure — module-driven, not step-count-hardcoded

`page.tsx`'s `STEPS` array (currently `["Asset Telemetry", "Operational Context", "Cryptographic Documentation"]`) becomes derived, not hardcoded:

```
Step 0: Project Profile      (existing Step1_ProjectProfile — mostly unchanged:
                               name, country, region, GPS, dates, area/currency.
                               projectType selector stays here.)
Step 1..N: One step per module returned by
           GET /assessment-manifest for the selected projectType
           (renders generically — see §8.2)
Step N+1: Documents           (existing Step3_Documents — unchanged structurally;
                               DOCUMENT_TYPES may eventually also become
                               projectType-dependent, but out of scope for this pass)
Step N+2: Review              (existing ReviewStep.tsx, extended to show
                               module summaries)
```

For `agricultural_waste_management`, that's Project Profile + 8 module steps + Documents + Review = 11 steps, considerably longer than today's 3. This is exactly why §2's "register now, answer later" decision matters: the project record is created (status: `draft`, `assessmentCompletion: not_started`) **after Step 0**, not after the last step. Every module step after that is a save against an already-existing project, individually skippable, individually resumable. The "Abort Registration" exit on every step becomes "Save & Exit" instead, since there's now always a persisted project to return to.

### 8.2 Generic module-step renderer

Instead of writing a bespoke component per module (`WasteStreamStep.tsx`, `BaselineEmissionsStep.tsx`, ×8, ×N project types — exactly the duplication problem the backend redesign avoids), one component renders any module from its manifest definition:

```tsx
// src/app/(dashboard)/projects/new/_components/AssessmentModuleStep.tsx
// Renders MODULE_DEFINITIONS[moduleKey].fields by mapping each fieldKey's
// inputType (select / number / text / textarea / boolean / file / percentage-split)
// to the existing shared input components (CustomInput, Checkbox, etc — already
// used by Step1/Step2). Field-level conditional logic (e.g. Module 3's
// "If yes: Upload evidence" sub-question) is declared in the field's manifest
// entry as a `dependsOn` clause, not hand-coded per module.
```

This is the highest-leverage frontend change in the whole redesign: it means activating a *new project type* later (water projects, blue carbon) requires **zero new frontend components**, only a manifest entry on the backend, as long as the field's `inputType` is one of the generic types already supported. Net-new input types (e.g. a future geo-boundary drawer) are the only case that requires new frontend code.

### 8.3 `SidebarProgress.tsx`

Currently takes a flat `steps: string[]`. Extend to accept module metadata so it can show module *titles* (from the manifest, e.g. "Waste Stream Assessment") rather than generic step numbers, and show a per-module status pill (not started / in progress / submitted) sourced from `GET /:id/assessments`, so a returning user immediately sees what's left — directly serving the Ghana-pilot UX concern about not making users re-discover where they left off.

### 8.4 `Step1_ProjectProfile.tsx` — type selector changes

The `PROJECT_TYPES.map(...)` block that currently renders a flat grid with a `pilotEnabled` disabled-state needs to:
1. Pull from the manifest API (§6.5) instead of (or in addition to) the static `PROJECT_TYPES` constant, so newly-activated types show up without a frontend deploy.
2. On selection, auto-set `sector` from `PROJECT_TYPE_SECTOR_MAP[selectedType].primarySector` (already does this via `handleTypeSelect`'s `sector` param — just needs the source of that param to come from the manifest going forward).
3. Surface the "eligible secondary sectors" (§5.2) as an optional multi-select, deferred to the Review step rather than cluttering Step 0.

### 8.5 `new-project.ts` constants — what stays, what goes

- **Stays, becomes display-only:** `SDGS` (static, genuinely universal, no reason to fetch from API), `DOCUMENT_TYPES` (until/unless made type-dependent — out of scope here).
- **Shrinks to display metadata, sourced from manifest API:** `PROJECT_TYPES` (icon/title/description stay client-side as visual assets; `pilotEnabled`/`sector`/question-relevant data comes from the API).
- **Removed entirely, replaced by dynamic per-module schemas:** `PRACTICES_BY_TYPE` — its function (type-conditional fields) is now the *general* pattern, not a one-off for practice tags. Practice tags themselves become just another field in `MODULE_DEFINITIONS` for the types that use them (regenerative_agriculture, renewable_energy keep something equivalent to a "practices" field inside their module list).
- **`createProjectInputSchema` shrinks** to cover Step 0 only (name, country, region, GPS, dates, area, currency, projectType, sector) — module answers are no longer part of one giant submit payload; they're saved incrementally via the assessment endpoints, consistent with §8.1.

---

## 9. Migration Plan

Sequenced to keep the app deployable at every step — no big-bang cutover.

1. **Migration 1 — additive, zero behavior change.** Add `agricultural_waste_management` + new project types to `projectTypeEnum` (alongside renaming `waste_management`, if confirmed unused — see §10 open question #2). Add the 3 new columns to `project` (§5.1), all nullable/defaulted, no existing code path reads or writes them yet. Create `project_assessment`, `project_assessment_score`, `project_sector_tag`, `project_site` tables. Ship behind no feature flag needed — purely additive DDL.
2. **Migration 2 — backend services + manifest.** Ship `assessment-modules.config.ts` with the full Module 1–8 field library for `agricultural_waste_management` only (the active pilot). Ship `AssessmentService`, `ScoringService` (readiness-score components only, per §7's "don't fabricate the methane number yet" decision), and the new routes. `project.service.ts`'s `createProject` gets the `project_site` branch fix (§6.2). Fully backward compatible — existing `regenerative_agriculture`/`renewable_energy` projects are entirely unaffected since their manifest entries can ship as "module list = baseline/readiness modules only" without any new required fields.
3. **Migration 3 — frontend wizard restructure.** Ship the manifest-driven `AssessmentModuleStep.tsx`, updated `page.tsx` step derivation, updated `Step1_ProjectProfile.tsx` type selector. Recommend feature-flagging this behind an environment check or role check initially (e.g. only visible to the boss's test accounts / internal testers) given how much the wizard's shape changes, consistent with the existing pattern of `pilotEnabled` gating in production.
4. **Migration 4 — domain data backfill.** Once a carbon-accounting-literate reviewer supplies the emission-factor lookup table (§10, open question #1) and methodology-mapping rules table (§10, open question #3), extend `agriculturalWasteManagementStrategy` to compute the methane/baseline numbers and remove the "intentionally null" placeholders. This is the only step gated on something outside engineering's control — everything above it can ship without it.

---

## 10. Open Questions for Anwar / Product

These are the items the panel could not resolve internally because they require either a product decision or domain expertise the engineering discussion doesn't have:

1. **Methane/emission-factor lookup table.** Who supplies default DOC (degradable organic carbon) and MCF (methane correction factor) values per `feedstockSource`? This determines whether `baselineMethanePotentialTco2e` ships in the pilot or ships null with "coming soon" messaging. Needs a carbon-accounting specialist's sign-off before any number is shown to a project owner — getting this wrong is a credibility/liability risk, not just a UX gap.
2. **Is `waste_management` (current enum value) actually unused in any environment** (staging/prod), confirming the rename to `agricultural_waste_management` in Migration 1 is safe as a pure rename rather than needing a backfill/dual-write period?
3. **Methodology recommendation rules** — who owns the static lookup table mapping `(feedstockSource, intervention)` → suggested Verra/Gold Standard methodology codes? Likely the same person as #1.
4. **Document requirements per project type** — `DOCUMENT_TYPES` (Step 3) is currently one fixed list for all types. The requirement doc's Module 7 ("Supporting Documentation") and Module 8 ("Existing Certifications") imply waste-management projects need different/additional document slots (production records, utility bills, audit history) than a land-based project needs (title deed, consent form). Should this redesign extend `DOCUMENT_TYPES` to be projectType-dependent now, or is that explicitly deferred to a later pass? (This document treats it as deferred — §8.5 — pending your confirmation.)
5. **"Other" project type review workflow** — once an `other`-typed project is submitted, who triages it to assign a real `projectType`/`sector`/methodology, and does that need its own small admin UI, or is it handled outside the platform for now (email/manual DB update)?
6. **Multi-site projects** — the requirement doc and pilot are single-facility. `project_site` is designed to allow 1:many later (§5.5) but nothing in this phase builds UI for it. Confirm that's correctly out of scope for now.

---

## 11. Appendix: Module → Field → Question Map

Full field-by-field breakdown of all 8 modules as `fieldKey`s for `FIELD_LIBRARY`, derived directly from the requirement document. This is the working checklist for populating `assessment-modules.config.ts` — input types are suggested, not final, and should be confirmed against the generic input types `AssessmentModuleStep.tsx` (§8.2) actually supports before implementation.

### Module 1 — Project Identification *(shared by all project types)*

| fieldKey | Question | Input Type |
|---|---|---|
| `projectName` | Project name | text |
| `organizationName` | Organization name | text |
| `projectLead` | Project lead | text |
| `contactDetails` | Contact details | text |
| `gpsCoordinates` | GPS coordinates (if available) | text/geo |
| `currentProjectStage` | Idea / Pilot / Operational / Scaling | select |
| `sectorClassification` | Project type selector (drives the whole manifest) | select — *this is `projectType` itself, handled at Step 0, not duplicated here* |
| `projectDescription` | Describe the project (≤500 words) | textarea |

*(`organizationName`, `projectLead`, `contactDetails`, `country`, `region`, `startDate` overlap with existing Step 0 fields on `project` — implementation should reuse those rather than re-asking, listed here only because the requirement doc lists them under Module 1.)*

### Module 2 — Waste Stream Assessment *(agri-waste-management family only)*

| fieldKey | Question | Input Type |
|---|---|---|
| `feedstockSource` | Cocoa pods / husks / shells / rice husks / palm waste / mixed / other | select |
| `annualWasteVolumeTonnes` | Tonnes/year | number |
| `currentDisposalPractice` | Decompose / burned / dumped / landfilled / composting / other | select |
| `disposalLocation` | Where does disposal occur | text |
| `historicalDataYears` | Years of waste generation records available | number |

### Module 3 — Baseline Emissions Assessment *(shared — every methodology needs a baseline)*

| fieldKey | Question | Input Type |
|---|---|---|
| `existingWasteManagementSplit` | % burned / dumped / left on-site / reused | percentage-split (must sum to 100) |
| `decompositionConditions` | Open air / covered / waterlogged / mixed with organics | multi-select |
| `averageDecompositionPeriod` | How long waste remains before disposal | text/number + unit |
| `methaneMonitoringExists` | Yes/No | boolean |
| `methaneMonitoringEvidence` | Upload (image/pdf) — `dependsOn: methaneMonitoringExists = true` | file |

### Module 4 — Project Intervention Assessment *(agri-waste-management family only)*

| fieldKey | Question | Input Type |
|---|---|---|
| `interventionType` | Livestock feed / composting / biochar / fertilizer / other | select |
| `processingTechnology` | Describe the conversion process | textarea |
| `annualProcessingCapacityTonnes` | Tonnes/year | number |
| `wasteDiversionRatePercent` | % of waste diverted | number (0–100) |
| `expectedProductOutputTonnes` | Tonnes/year of product | number |

### Module 5 — Activity Data Collection *(agri-waste-management family only)*

| fieldKey | Question | Input Type |
|---|---|---|
| `annualWasteCollectedTonnes` | Input data | number |
| `annualProductProducedTonnes` | Output data | number |
| `yieldRatio` | Product per tonne of waste | number (computed/display, optionally user-overridable) |
| `electricityConsumedAnnually` | Energy use | number + unit |
| `fuelConsumedAnnually` | Energy use | number + unit |
| `annualWaterConsumption` | Water use | number + unit |

### Module 6 — Carbon Market Readiness Assessment *(shared by all project types)*

| fieldKey | Question | Input Type |
|---|---|---|
| `additionality` | Without carbon finance, would this proceed? Yes/No/Unsure | select |
| `financialViabilityWithoutCarbon` | Is the project profitable without carbon revenue? | boolean/text |
| `fundingSources` | Grants / equity / debt / self-financed | multi-select |
| `carbonCreditIntent` | Are carbon credits a project objective? | boolean |

### Module 7 — MRV Readiness Assessment *(shared by all project types)*

| fieldKey | Question | Input Type |
|---|---|---|
| `dataTrackedCategories` | Waste volumes / product volumes / energy use / water use | multi-select |
| `monitoringSystems` | Manual / Excel / Sensors / ERP / other | multi-select |
| `dataFrequency` | Daily / weekly / monthly / quarterly | select |
| `supportingDocumentation` | Production / operational / financial records / utility bills | file (multi) — *integrates with existing `project_document` table & `documentTypeEnum`, see §10 Q4* |

### Module 8 — Verification Readiness Assessment *(shared by all project types)*

| fieldKey | Question | Input Type |
|---|---|---|
| `legalStatus` | Is the organization legally registered? | boolean/text |
| `landOrFacilityRights` | Can you demonstrate rights to operate? | boolean/text |
| `environmentalPermits` | Do permits exist? | boolean/text |
| `auditHistory` | Environmental / carbon audit / sustainability certification | multi-select |
| `existingCertifications` | Organic / Fairtrade / Rainforest Alliance / other | multi-select |

---

*End of document. Next step per §10: route the open questions to whoever on the team owns carbon-accounting methodology, then proceed with Migration 1 (additive schema) once `waste_management` rename safety (Q2) is confirmed.*
