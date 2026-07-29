# Crevy Platform — UI Design Specification

### Complete Page Inventory for the Design Team

> **Audience:** UI/UX Designers · Frontend Engineers receiving design handoff
>
> **Purpose:** This document is the single source of truth for every screen that needs to be designed on the Crevy platform. It lists every existing page (with its current state), every placeholder page (needs a full design), and every missing page (needs to be designed and built from scratch). Use this document to organise design sprints and Figma file structure.
>
> **Brand Tokens**
> | Token | Value | Usage |
> |---|---|---|
> | Primary Green | `#2CC295` | CTAs, active states, badges, icons |
> | Dark Green | `#178A74` | Hover states, text on light backgrounds |
> | Navy / Dark | `#131927` | Sidebar, headers, dark cards |
> | Off-white | `#F8FAFC` | Page backgrounds |
> | Border | `#F1F5F9` | Card borders, table separators |
>
> **Typography**
>
> - Display / headings: **Syne** (bold, geometric)
> - Body / UI text: **Geist Sans**
> - Monospace (codes, hashes): **Geist Mono**

---

## Contents

1. [Page Status Legend](#1-page-status-legend)
2. [Public Pages](#2-public-pages)
3. [Auth Pages](#3-auth-pages)
4. [Dashboard — All Roles](#4-dashboard--all-roles)
5. [Project Owner Flow](#5-project-owner-flow)
6. [Admin / Project Manager Flow](#6-admin--project-manager-flow)
7. [Marketplace & Buyer Flow](#7-marketplace--buyer-flow)
8. [Financial Pages](#8-financial-pages)
9. [Compliance & Reporting](#9-compliance--reporting)
10. [Settings & Config](#10-settings--config)
11. [Component Library](#11-component-library)
12. [Design Sprint Priorities](#12-design-sprint-priorities)

---

## 1. Page Status Legend

| Badge              | Meaning                                                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| ✅ **DONE**        | Fully implemented with real data. Design review only.                                              |
| 🔧 **PARTIAL**     | Page exists with real structure but is missing sections, data connections, or states.              |
| 📋 **PLACEHOLDER** | Page exists in code but shows a `<PlaceholderPage>` component. Needs full design + implementation. |
| ❌ **MISSING**     | Page does not exist at all. Needs design + build from scratch.                                     |

---

## 2. Public Pages

These pages are accessible without logging in. They are the brand face of the platform.

---

### 2.1 Landing Page — `/`

**Status:** ✅ DONE (review needed)
**Route group:** `(root)`
**Role access:** Everyone — unauthenticated visitors

**Current sections:**

- Navbar (transparent → solid on scroll, hamburger on mobile)
- Hero section (fullscreen video background, headline, CTAs)
- Stats strip (counters animating on scroll)
- How It Works (two-tab: Project Owner / Company)
- Project Types (6-card grid)
- Why Crevy (dark navy banner with glass cards)
- Scrolling marquee
- Featured Projects (3-card sample)
- Testimonials (3-card)
- Final CTA banner
- Footer (4-column)

**Design needs:**

- [ ] Swap placeholder Pexels video for an actual Crevy/CraftedClimate field video when available
- [ ] Update "Featured Projects" section cards with real project data pulled from `GET /api/v2/projects/marketplace`
- [ ] Update stats strip numbers with real platform stats
- [ ] Add Google Analytics / Clarity script placeholder in layout

---

### 2.2 Marketplace — `/marketplace`

**Status:** 🔧 PARTIAL
**Route group:** `(public)`
**Role access:** Everyone — unauthenticated

**Current state:** Route exists. Basic shell with a list query. No project cards, no filters, no credit availability display.

**Full design required:**

**Page layout:**

```
┌─────────────────────────────────────────────────────┐
│  HERO BANNER                                        │
│  "Invest in verified African green projects"        │
│  Sub-copy · search bar                              │
├─────────────────────────────────────────────────────┤
│  FILTER BAR                                         │
│  [Sector ▾] [Type ▾] [Country ▾] [Vintage ▾]       │
│  [Price Range slider]  [Min Credits]                │
│  Active filter chips · Result count "24 projects"   │
├─────────────────────────────────────────────────────┤
│  SORT BAR                                           │
│  Sort by: [Newest ▾]  View: [Grid ■] [List ≡]       │
├────────────────────────────────────┬────────────────┤
│  PROJECT CARDS GRID (3-col desktop)│  STICKY         │
│  ┌──────────────────────────────┐  │  SIDEBAR        │
│  │ [Project Type colour band]   │  │  (optional)     │
│  │ Project Name                 │  │  ─────────      │
│  │ Location · Area              │  │  Total          │
│  │ Practices chips              │  │  Projects: 24   │
│  │ ─────────────────────────    │  │  ─────────      │
│  │ 0.000130 tCO₂e available     │  │  Latest         │
│  │ GHS 45 / credit  [Buy Now →] │  │  Vintage: 2026  │
│  └──────────────────────────────┘  │                 │
│  (repeat × N)                      │                 │
├────────────────────────────────────┴────────────────┤
│  CURSOR PAGINATION                                  │
│  [← Prev]  Page 2  [Next →]                         │
└─────────────────────────────────────────────────────┘
```

**Project card states:** Default · Hover (shadow + border glow) · Sold out (greyed, "No credits available") · Coming soon (non-pilot sector, locked)

**Empty state:** "No projects match your filters" with clear-filter button

**Mobile:** Single column, filter bar collapses behind a "Filters" sheet drawer

---

### 2.3 Marketplace Project Detail — `/marketplace/[projectId]`

**Status:** ❌ MISSING
**Role access:** Everyone — unauthenticated

**Full design required:**

```
┌─────────────────────────────────────────────────────┐
│  BREADCRUMB: Marketplace › Regenerative Agriculture │
├─────────────────────────────────────────────────────┤
│  PROJECT HEADER                                     │
│  [Sector badge] [Registry badge: Verra VM0042]      │
│  Project Name (Syne, 40px)                          │
│  Location pill · Area pill · Start date pill        │
│  ─────────────────────────────────────────────      │
│  DESCRIPTION paragraph                              │
├──────────────────────┬──────────────────────────────┤
│  LEFT COLUMN (60%)   │  RIGHT COLUMN (40%)          │
│                      │  ┌──────────────────────┐    │
│  PRACTICES           │  │  PURCHASE CARD       │    │
│  [chip] [chip] [chip]│  │  0.000130 tCO₂e /    │    │
│                      │  │  credit              │    │
│  SDG BADGES          │  │  GHS 45.00 / credit  │    │
│  [SDG 13] [SDG 15]   │  │  ─────────────────── │    │
│                      │  │  Quantity: [  10  ]  │    │
│  MRV PROOF           │  │  Total: GHS 450.00   │    │
│  AI Confidence: 99%  │  │  ─────────────────── │    │
│  Methodology: VM0042 │  │  [Buy Credits →]     │    │
│  [Polygon tx hash]   │  │  ─────────────────── │    │
│  [IPFS audit link]   │  │  Available: 1,200    │    │
│                      │  │  Vintage: 2026       │    │
│  FARMER PROFILE      │  │  Registry: Verra     │    │
│  Code: PO-GH-000001  │  └──────────────────────┘    │
│  Location: Ashanti   │                              │
│                      │  VERIFICATION TIMELINE       │
│  PROJECT ACTIVITIES  │  ─────────────────────────── │
│  Timeline component  │  [Registered] ● ─ ─ ─       │
│                      │  [Active]     ─ ● ─ ─        │
│                      │  [Verified]   ─ ─ ● ─        │
│                      │  [Listed]     ─ ─ ─ ○        │
└──────────────────────┴──────────────────────────────┘
```

**States:** Logged-out (Buy button → redirect to register), Logged-in (Buy button → purchase flow), Sold-out (Buy button disabled, "Join waitlist" CTA)

---

### 2.4 About — `/about`

**Status:** 🔧 PARTIAL (basic page exists)
**Design needs:** Full brand story page — mission, team, impact numbers, Verra/Gold Standard logos

---

### 2.5 Support — `/support`

**Status:** 🔧 PARTIAL
**Design needs:** FAQ accordion, contact form, link to documentation

---

### 2.6 Privacy Policy — `/privacy`

**Status:** ✅ DONE (legal copy, minimal design)

---

### 2.7 Terms of Service — `/terms`

**Status:** ✅ DONE (legal copy, minimal design)

---

## 3. Auth Pages

---

### 3.1 Login — `/login`

**Status:** ✅ DONE
**Design needs:**

- [ ] Add "Forgot password?" link (route: `/forgot-password`)
- [ ] Add subtle animated background (CSS-only, no JS)
- [ ] Error state: show red banner when credentials fail (currently using toast)

---

### 3.2 Register — `/register`

**Status:** ✅ DONE (v2 form — flat, no userType selector)
**Design needs:**

- [ ] Progress indicator (step 1 of 1 — currently single form)
- [ ] Password strength meter (shows while typing)
- [ ] Email confirmation "check your inbox" screen shown after submit

---

### 3.3 Forgot Password — `/forgot-password`

**Status:** ❌ MISSING

**Design:**

```
┌──────────────────────────────────────┐
│  CREVY LOGO                          │
│  ─────────────────────────────────── │
│  "Reset your password"               │
│  Enter your email address and we'll  │
│  send you a reset link.              │
│                                      │
│  [Email address input]               │
│  [Send Reset Link →]                 │
│                                      │
│  ← Back to Login                     │
└──────────────────────────────────────┘
```

**States:** Default · Submitted ("Check your inbox" confirmation card) · Email not found (inline error, not toast)

---

### 3.4 Reset Password — `/reset-password`

**Status:** ❌ MISSING

**Design:** Same card layout. Fields: New password + Confirm password. Password strength meter. On success → "Password updated! Log in →"

---

### 3.5 Email Verification — `/verify-email`

**Status:** ❌ MISSING

**Design:** Full-page card. Two states: (1) "Verifying your email…" spinner, (2) "Email verified! Continue to dashboard →"

---

## 4. Dashboard — All Roles

The dashboard route `/dashboard` renders a different component depending on the user's role. Three variants exist.

---

### 4.1 Project Owner Dashboard

**Status:** ✅ DONE (real data from API)
**Route:** `/dashboard` when `roleId = project_owner`

**Sections:**

- Hero section (personalised welcome, role-aware next steps)
- KPI stats (total projects, verified credits, land area, pending verifications)
- Charts (revenue growth, sequestration efficiency — currently show "no data" empty state)
- Projects table (real data, links to `/project-profile/:id`)
- Recent activity feed

**Design needs:**

- [ ] Empty chart states need an illustrated "no data yet" state (not just muted text)
- [ ] "Register Your First Project" empty state on projects table needs illustration
- [ ] Mobile: stats row should collapse to 2×2 grid

---

### 4.2 Admin / Super Admin Dashboard

**Status:** 🔧 PARTIAL (component exists, data is mock/static)
**Route:** `/dashboard` when `roleId = super_admin or project_manager`

**Sections needed:**

- System-wide KPIs: total project owners, total projects, total credits issued, total payout volume
- Pending actions queue: KYC approvals pending, projects awaiting activation, payouts pending disbursement
- Platform activity chart: new registrations per day (30 days)
- Recent verifications feed
- Quick links: User Management, Project Registry, Site Visits, Compliance

**Design:**

```
┌─────────────────────────────────────────────────────┐
│  WELCOME BANNER                                     │
│  "Good morning, Admin · 3 items need attention"     │
├─────────────────────────────────────────────────────┤
│  KPI ROW (4 cards)                                  │
│  [Project Owners] [Active Projects] [Credits] [Vol] │
├─────────────────────────────────────────────────────┤
│  PENDING ACTIONS QUEUE                              │
│  ┌──────────────────────────────────────────────┐   │
│  │ ● 4 KYC reviews awaiting approval       [→]  │   │
│  │ ● 2 projects ready for activation       [→]  │   │
│  │ ● 7 payouts pending disbursement        [→]  │   │
│  └──────────────────────────────────────────────┘   │
├──────────────────────┬──────────────────────────────┤
│  REGISTRATIONS CHART │  RECENT VERIFICATIONS        │
│  (30-day line chart) │  (list with status badges)   │
└──────────────────────┴──────────────────────────────┘
```

---

### 4.3 Company / Buyer Dashboard

**Status:** 🔧 PARTIAL (component exists, data is mock)
**Route:** `/dashboard` when `roleId = financial_admin`

**Sections needed:**

- Portfolio summary: total credits owned, total tCO₂e offset, spend to date
- Credits by project type (donut chart)
- Recent purchases
- "Explore Marketplace" hero CTA
- ESG report download button

---

## 5. Project Owner Flow

---

### 5.1 Register New Project — `/new-project`

**Status:** ✅ DONE (3-step form, connects to v2 API)

**Steps:**

1. Project Profile (type, name, location, dates, area, currency)
2. Practices & Context (practices checkboxes, description, SDGs)
3. Documents (4 required + 1 optional upload slots)

**Design needs:**

- [ ] Step 1: non-pilot project type cards need a cleaner "Coming Soon" treatment — currently just a text badge. Use a diagonal ribbon or lock icon overlay.
- [ ] Step 3: "Download Template" links need a PDF icon treatment
- [ ] Processing screen (currently a full-page overlay): add a step-by-step status animation showing "Creating project → Uploading documents → Running MRV simulation"
- [ ] `SubmissionResult` page: add a QR code / shareable link for the project page

---

### 5.2 My Project Profiles — `/project-profile`

**Status:** ✅ DONE (real data, paginated grid)
**Design needs:**

- [ ] Add a "Sort by" dropdown (newest / oldest / alphabetical)
- [ ] Card hover state: slide up a "View →" strip from the bottom

---

### 5.3 Project Detail — `/project-profile/[id]`

**Status:** ✅ DONE (tabs: Overview, Documents, MRV)
**Design needs:**

- [ ] **Overview tab:** Add a "Price History" chart card (line chart of credit price over time — requires `price_history` table)
- [ ] **Documents tab:** Add a "Documents complete" progress bar at top (e.g. "3 of 4 required documents uploaded · 1 verified")
- [ ] **MRV tab — verified state:** The verification result card needs more visual hierarchy. Show `net_credits_issued` in a large green number at the top.
- [ ] **MRV tab — empty state "Simulate MRV Pipeline" button:** Add a subtle "Demo mode" label beneath it so investors understand the context
- [ ] Add a **Credits tab:** Shows credits issued from this project (list), total issued, how many are available vs sold vs retired
- [ ] Add a **4th pipeline step**: "Marketplace Listed" → shown when `projectStatus = active` and credits are available

---

### 5.4 Track Verification — `/track-verification`

**Status:** ✅ DONE (Kanban by pipeline stage)
**Design needs:**

- [ ] Empty column state needs an illustration (leaf/plant for "registration", sensor icon for "active", etc.)
- [ ] Add a list-view toggle alternative to the Kanban (some users prefer a table)
- [ ] Add "Last activity" timestamp on each project card

---

### 5.5 Project Owner's Payout History — `/financials/payouts`

**Status:** ❌ MISSING

**Design:**

```
┌─────────────────────────────────────────────────────┐
│  PAGE HEADER                                        │
│  "Payout History"                                   │
│  Total received: GHS 12,450.00 · 3 pending          │
├─────────────────────────────────────────────────────┤
│  FILTER BAR                                         │
│  [Status: All ▾] [Project ▾] [Date range picker]    │
├─────────────────────────────────────────────────────┤
│  PAYOUT LIST                                        │
│  ┌────────────────────────────────────────────────┐ │
│  │ PAY-2026-000001 · GHS 1,235.00 · ● Completed   │ │
│  │ Volta Basin Reforestation · MoMo MTN            │ │
│  │ 15 May 2026 · 1,000 credits sold               │ │
│  └────────────────────────────────────────────────┘ │
│  (repeat × N)                                       │
├─────────────────────────────────────────────────────┤
│  CURSOR PAGINATION                                  │
└─────────────────────────────────────────────────────┘
```

**Payout status badges:** `pending` (amber), `completed` (green), `failed` (red with retry button)

---

## 6. Admin / Project Manager Flow

---

### 6.1 Project Owners List — `/project-developers`

**Status:** ✅ DONE (real data, cursor pagination, role-aware filtering)
**Design needs:**

- [ ] Add a "Map view" toggle — shows all farm plots on a Mapbox map (requires `farm_plot.centroid` coordinates). Use `react-map-gl`.
- [ ] KYC status filter buttons should be styled as pills, not a dropdown
- [ ] "Export CSV" button for admin reporting

---

### 6.2 Project Owner Detail — `/project-developers/[userId]`

**Status:** ✅ DONE (identity, payment methods, status, quick actions)
**Design needs:**

- [ ] Add a **Farm Plots tab**: list of registered plots with a mini-map showing centroid markers. Shows: area (ha), boundary method, verified status.
- [ ] Add a **Projects tab**: list of projects this owner has enrolled in or created
- [ ] "KYC Approve" and "KYC Reject" action buttons should be more prominent — currently not on this page. Show as a banner when `verificationStatus = pending`.
- [ ] Add a **Notes section** (admin can add internal notes about this project owner — requires a `project_owner_note` table)

---

### 6.3 Register / Onboard Project Owner — `/project-developers/register`

**Status:** 🔧 PARTIAL (form exists, connects to API)
**Design needs:**

- [ ] The form is currently a long single-page scroll. Break into steps: (1) Account Details, (2) Payment Method, (3) Initial Farm Plot
- [ ] Show a preview summary card on the right as the user fills in the form
- [ ] Success state: show the generated `PO-GH-000001` code prominently

---

### 6.4 User Management — `/user-management`

**Status:** ✅ DONE (users table + RBAC tabs — fully implemented)
**Design needs:**

- [ ] "Invite Admin" button needs a modal: enter email + select role → sends invite email
- [ ] "Manage Role" action in the dropdown needs a modal with role selector
- [ ] "Deactivate User" needs a confirmation dialog with a reason input
- [ ] The IAM tab (roles/permissions) needs visual hierarchy between the two tables — currently they are stacked without clear separation

---

### 6.5 All Projects Registry — `/projects`

**Status:** ✅ DONE (table with filters, pagination, actions)
**Design needs:**

- [ ] "MRV Telemetry" action in the dropdown row menu should link to `/project-profile/{id}?tab=mrv`
- [ ] "Verify Assets" action should link to the verification/activation flow
- [ ] Add a column: "Credits Issued" showing the total from `SUM(net_credits_issued)` for this project
- [ ] Add an "Activate Project" button/action for projects in `draft` status

---

### 6.6 Project Detail (Admin view) — `/projects/[id]`

**Status:** ❌ MISSING (the `/project-profile/[id]` page exists for project owners. Admins need a version with extra actions.)

**Additional actions vs project owner view:**

- Approve/activate project (move from `draft → active`)
- Verify a document (mark `isVerified = true`)
- View all credit transactions for this project
- View full audit trail for this project
- Assign a project manager to this project
- Simulate MRV pipeline (same button as project owner, but always visible for admin)

**Same tab structure as `/project-profile/[id]` + add two admin-only tabs:**

- `Admin Actions` tab
- `Audit Trail` tab

---

### 6.7 Site Visits — `/site-visits`

**Status:** 📋 PLACEHOLDER

**Full design required:**

```
┌─────────────────────────────────────────────────────┐
│  PAGE HEADER                                        │
│  "Field Site Visits" · Schedule · Manage            │
├─────────────────────────────────────────────────────┤
│  STATS ROW                                          │
│  [Scheduled] [In Progress] [Completed] [Overdue]    │
├─────────────────────────────────────────────────────┤
│  CALENDAR VIEW / LIST TOGGLE                        │
│  [Calendar ■] [List ≡]                              │
├─────────────────────────────────────────────────────┤
│  VISIT LIST                                         │
│  ┌────────────────────────────────────────────────┐ │
│  │ [Date] [Assigned Agent] [Project] [Status]     │ │
│  │ Volta Basin Reforestation                      │ │
│  │ Assigned: Kofi Mensah · 20 May 2026            │ │
│  │ Status: ● Scheduled  [Edit] [Mark Complete]    │ │
│  └────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│  [+ Schedule New Visit] button (floating or header) │
└─────────────────────────────────────────────────────┘
```

**"Schedule New Visit" modal:**

- Select project (searchable dropdown)
- Assign agent (user with `project_manager` role)
- Date + time picker
- Notes / instructions textarea
- On submit → creates a `project_activity` record with `activity_status: planned`

---

### 6.8 Compliance & Audit — `/compliance`

**Status:** 📋 PLACEHOLDER

**Full design required:**

**Tabs:**

1. **Audit Trail** — filterable table of all audit log entries (actor, action, resource, before/after values, timestamp, IP)
2. **Verification Log** — all MRV verification results across all projects (status, methodology, AI confidence, credits issued)
3. **Document Status** — cross-project table: which documents are pending verification vs verified vs rejected
4. **ESG Reports** — list of generated ESG reports with download links. "Generate New Report" button.

**Audit Trail table columns:** Timestamp · Actor · Action · Resource · Resource ID · IP address · [View Details →]

**"View Details" expands to show:** old_values JSON diff vs new_values JSON diff (side-by-side)

---

### 6.9 Data Collection / Transaction Log — `/data-collection`

**Status:** 📋 PLACEHOLDER

**Full design required:**

```
┌─────────────────────────────────────────────────────┐
│  "Credit Transaction Ledger"                        │
│  Immutable record of all credit activity            │
├─────────────────────────────────────────────────────┤
│  FILTER BAR                                         │
│  [Type: All ▾] [Project ▾] [Date range] [Search]   │
├─────────────────────────────────────────────────────┤
│  LEDGER TABLE                                       │
│  Ref · Date · Type · Buyer · Seller · Qty · Amount │
│  ─────────────────────────────────────────────────  │
│  TXN-2026-00001 · Purchase · 100 tCO₂e · $4,500    │
│  [Blockchain proof icon] [View details →]           │
└─────────────────────────────────────────────────────┘
```

**Transaction type badges:** `purchase` (green), `retirement` (blue), `transfer` (purple), `refund` (amber), `platform_fee` (slate)

---

## 7. Marketplace & Buyer Flow

---

### 7.1 Credit Purchase Checkout — `/credits/purchase`

**Status:** ❌ MISSING

**3-step checkout flow:**

**Step 1 — Select Quantity:**

```
┌──────────────────────────────────────────────────┐
│  Purchasing from: Volta Basin Reforestation       │
│  Vintage: 2026 · Registry: Verra VM0042           │
│  ────────────────────────────────────────────     │
│  How many credits?                                │
│  [  -  ] [   50   ] [  +  ]                       │
│  Available: 1,200 credits                         │
│  ────────────────────────────────────────────     │
│  Emission scope: [Scope 1 ▾]                      │
│  ────────────────────────────────────────────     │
│  Price per credit: GHS 45.00                      │
│  Total: GHS 2,250.00                              │
│  [Continue →]                                     │
└──────────────────────────────────────────────────┘
```

**Step 2 — Payment:**

```
┌──────────────────────────────────────────────────┐
│  Order Summary                                    │
│  50 credits × GHS 45.00 = GHS 2,250.00           │
│  ────────────────────────────────────────────     │
│  Payment Method                                   │
│  ○ Stripe (International card)                    │
│  ○ Paystack (Ghana / Africa)                      │
│  [Stripe/Paystack payment element renders here]   │
│  ────────────────────────────────────────────     │
│  [Pay GHS 2,250.00 →]                             │
└──────────────────────────────────────────────────┘
```

**Step 3 — Confirmation:**

```
┌──────────────────────────────────────────────────┐
│  ✅ Purchase Complete!                            │
│  Transaction: TXN-2026-00042                      │
│  50 tCO₂e · Vintage 2026 · Verra VM0042           │
│  ────────────────────────────────────────────     │
│  Blockchain proof: [tx hash]                      │
│  IPFS audit: [QmXxx...]                           │
│  ────────────────────────────────────────────     │
│  [Download Certificate] [View Portfolio →]        │
│  [Retire Credits] [Buy More]                      │
└──────────────────────────────────────────────────┘
```

---

### 7.2 Buyer Portfolio — `/portfolio`

**Status:** ❌ MISSING

**Design:**

```
┌─────────────────────────────────────────────────────┐
│  PORTFOLIO SUMMARY BANNER                           │
│  Total owned: 350 tCO₂e · Avg price: GHS 44.20     │
│  Total retired: 50 tCO₂e · Available to retire: 300│
├─────────────────────────────────────────────────────┤
│  PORTFOLIO BREAKDOWN (donut chart)                  │
│  By project type: Regen Agri 60% · Renewable 40%   │
├─────────────────────────────────────────────────────┤
│  CREDITS LIST                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │ [Project badge] Volta Basin Reforestation   │   │
│  │ 100 tCO₂e · Vintage 2026 · ● Available     │   │
│  │ Verra VM0042 · [Blockchain proof →]         │   │
│  │ [Retire Credits] [View MRV Proof]           │   │
│  └─────────────────────────────────────────────┘   │
│  (repeat × N)                                       │
├─────────────────────────────────────────────────────┤
│  [Download ESG Report] button                       │
└─────────────────────────────────────────────────────┘
```

**Credit row states:** `available` (default), `retired` (greyed with "Retired" badge and certificate download link), `reserved` (amber "Reserved" badge)

---

### 7.3 ESG Report Page — `/reports/esg`

**Status:** ❌ MISSING

**Design:**

```
┌─────────────────────────────────────────────────────┐
│  ESG IMPACT DASHBOARD                               │
│  Reporting period: [Jan 2026 – Dec 2026 ▾]          │
├─────────────────────────────────────────────────────┤
│  SUMMARY CARDS                                      │
│  [Total Offset] [Scope 1] [Scope 2] [Scope 3]       │
├─────────────────────────────────────────────────────┤
│  CHARTS ROW                                         │
│  Credits by project type (bar) · By vintage (bar)   │
├─────────────────────────────────────────────────────┤
│  PROJECT BREAKDOWN TABLE                            │
│  Project · Type · Country · tCO₂e · Vintage · Proof │
├─────────────────────────────────────────────────────┤
│  ACTIONS                                            │
│  [Generate PDF Report ↓] [Share public URL]         │
│                                                     │
│  PAST REPORTS                                       │
│  2025-Q4 report · 2025-Q3 report (downloads)        │
└─────────────────────────────────────────────────────┘
```

---

## 8. Financial Pages

---

### 8.1 Contracts — `/financials/contracts`

**Status:** ❌ MISSING

**Tabs:** All Contracts · Active · Draft · Completed / Terminated

**Contract list row:** Ref · Buyer · Project · Committed qty · Status · Start / End dates · [View →]

**"Create Contract" modal:**

- Select buyer (user search)
- Select project
- Committed quantity (credits)
- Price per credit
- Currency
- Start/end date
- Payment terms (free text)
- On submit → status: `draft` → requires admin activation

**Contract detail page:** `/financials/contracts/[id]`

- Full terms, parties, quantities, fulfilment progress bar
- Payment schedule
- Download PDF button (offtake agreement)
- Status management: [Activate] [Terminate] buttons

---

### 8.2 Platform Financial Records — `/financials/records`

**Status:** ❌ MISSING (admin-only)

**Design:** Table — Date · Type (platform_fee, payout, refund) · Amount · Currency · Related transaction · [View →]

---

## 9. Compliance & Reporting

> These pages are documented in Section 6.8 above. Summarised here for the design team's sprint planning.

| Page                                 | Status         | Notes                                                  |
| ------------------------------------ | -------------- | ------------------------------------------------------ |
| `/compliance` (Audit Trail tab)      | 📋 Placeholder | Filterable audit log table with before/after diff view |
| `/compliance` (Verification Log tab) | 📋 Placeholder | All MRV verification results across platform           |
| `/compliance` (Document Status tab)  | 📋 Placeholder | Cross-project document verification status             |
| `/compliance` (ESG Reports tab)      | 📋 Placeholder | Report generation + download history                   |

---

## 10. Settings & Config

---

### 10.1 Profile — `/profile`

**Status:** ✅ DONE (edit profile, change password, account security sections)
**Design needs:**

- [ ] Add 2FA setup section: "Enable Two-Factor Authentication" with QR code display
- [ ] Add "Delete my account" section with confirmation flow (GDPR right to erasure)
- [ ] Profile completion progress bar at top ("Your profile is 70% complete")

---

### 10.2 Notifications — `/notifications`

**Status:** 📋 PLACEHOLDER

**Full design required:**

```
┌─────────────────────────────────────────────────────┐
│  PAGE HEADER                                        │
│  "Notifications" · [Mark all as read]               │
├─────────────────────────────────────────────────────┤
│  FILTER TABS                                        │
│  [All] [Unread (3)] [MRV] [Credits] [Payouts]       │
├─────────────────────────────────────────────────────┤
│  NOTIFICATION LIST                                  │
│  ┌────────────────────────────────────────────────┐ │
│  │ ● [Green dot = unread]                         │ │
│  │   🌱 Your project "Volta Basin" has been       │ │
│  │      activated.                                │ │
│  │      2 minutes ago · [View Project →]          │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │   💰 Payout GHS 1,235 completed to MoMo MTN.  │ │
│  │      15 May 2026 · [View Payout →]             │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Notification icon types:** 🌱 Project event · 📡 MRV event · 💰 Payout event · 🔬 Verification event · ⚠️ Alert / warning

**Notification bell component (in sidebar/header):**

- Badge showing unread count
- Dropdown showing latest 5 notifications
- "View all →" link to `/notifications`

---

### 10.3 Platform Settings — `/settings`

**Status:** ❌ MISSING (super_admin only)

**Tabs:**

1. **General** — Platform fee percentage, default currency, maintenance mode toggle
2. **Email Templates** — Edit email content for: welcome email, KYC approved, credit purchase confirmation, payout completed
3. **Feature Flags** — Toggle in-development features on/off (table: `feature_flag` rows with toggle switches)
4. **API Keys** — Manage API keys for enterprise buyer integrations (list, revoke, create new)

---

## 11. Component Library

> The design team should define these reusable components. The dev team will implement them once as shared components.

### 11.1 Status Badges

Consistent badges used across multiple pages:

| Category            | Values                                              | Colours                           |
| ------------------- | --------------------------------------------------- | --------------------------------- |
| Project Status      | draft · active · suspended · closed                 | slate · green · red · grey        |
| Project Stage       | registration · active · verification · completed    | amber · blue · purple · green     |
| Verification Status | pending · verified · rejected                       | amber · green · red               |
| Credit Status       | available · reserved · sold · retired · invalidated | green · blue · slate · grey · red |
| Payout Status       | pending · completed · failed                        | amber · green · red               |
| KYC Status          | pending · verified · rejected                       | same as verification              |

### 11.2 Empty States

Every list/table page needs a designed empty state:

- Illustration (SVG — abstract, not character-based)
- Title: "No [items] yet"
- Sub-copy: context-specific
- CTA button (when applicable)

### 11.3 Loading States

- Skeleton loader variant for: table rows, stat cards, chart areas, project cards
- Full-page spinner for: form submissions, report generation

### 11.4 Confirmation Dialogs

Standard pattern for destructive actions:

- Title: "Are you sure?"
- Body: consequence description
- Red "Confirm" button + "Cancel" ghost button
- Optional: reason text input (for deactivation, rejection)

### 11.5 Notification Bell

- Bell icon with animated badge (bounce on new notification)
- Popover: 5 latest, mark read on click, "View all" link
- SSE connection dot (green = connected, grey = reconnecting)

### 11.6 Data Tables

Standard table pattern used across the app:

- Column headers: 10px bold uppercase tracking-wider slate-400
- Row hover: `bg-slate-50/50`
- Pagination: cursor-based, shows "Showing N results", Prev/Next buttons
- Export button: CSV download (top-right of table)

### 11.7 Map Components

Required for: farm plot boundaries, project locations

- Library: `react-map-gl` with Mapbox GL JS
- Style: Mapbox Light style with `#2CC295` markers
- Features: cluster markers for list views, polygon rendering for farm plots

---

## 12. Design Sprint Priorities

### Sprint 1 — Unblock Demo (1 week)

```
[ ] Landing page polish (swap placeholder video, real project cards)
[ ] Register page: email confirmation screen
[ ] Marketplace page: real project cards with filters
[ ] MRV tab: net_credits_issued large green number treatment
[ ] Notification bell component (dropdown only, no full page yet)
```

### Sprint 2 — Core Investor Demo Screens (1 week)

```
[ ] Marketplace project detail page (/marketplace/[projectId])
[ ] Credit purchase checkout (3 steps)
[ ] Buyer portfolio page (/portfolio)
[ ] Project owner payout history
[ ] Project detail — Credits tab
```

### Sprint 3 — Admin Operations (2 weeks)

```
[ ] Site visits page (full design)
[ ] Compliance page (all 4 tabs)
[ ] Transaction log / Data collection page
[ ] Project owner detail — Farm Plots tab + Projects tab
[ ] Admin project detail (/projects/[id]) with admin actions
[ ] KYC approval banner on project owner detail
```

### Sprint 4 — Full Platform (2 weeks)

```
[ ] ESG report page (/reports/esg)
[ ] Contracts page (/financials/contracts + detail)
[ ] Notifications full page
[ ] Settings page (all 4 tabs)
[ ] Forgot/reset password pages
[ ] Email verification page
[ ] Platform settings admin page
[ ] 2FA setup in profile
[ ] GDPR delete account flow
```

### Sprint 5 — Polish & International Readiness

```
[ ] Accessibility audit across all pages (WCAG 2.1 AA)
[ ] Mobile: bottom tab bar navigation
[ ] PWA install banner
[ ] Dark mode support (optional)
[ ] RTL layout preparation (dir="ltr" on all pages)
[ ] All empty state illustrations
[ ] All loading skeleton states
[ ] Error boundary fallback pages (500, 404, offline)
```

---

## Appendix: Complete URL Map

```
PUBLIC (no auth)
├── /                             Landing page                     ✅ DONE
├── /marketplace                  Marketplace listing               🔧 PARTIAL
├── /marketplace/[projectId]      Project marketplace detail        ❌ MISSING
├── /about                        About page                        🔧 PARTIAL
├── /support                      Support / FAQ                     🔧 PARTIAL
├── /privacy                      Privacy policy                    ✅ DONE
└── /terms                        Terms of service                  ✅ DONE

AUTH (unauthenticated only)
├── /login                        Login                             ✅ DONE
├── /register                     Register                          ✅ DONE
├── /forgot-password              Request password reset            ❌ MISSING
├── /reset-password               Set new password                  ❌ MISSING
└── /verify-email                 Email verification                ❌ MISSING

PROJECT FLOW (authenticated)
└── /new-project                  3-step project registration       ✅ DONE

DASHBOARD (authenticated, role-aware)
├── /dashboard                    Dashboard (role-aware)            🔧 PARTIAL
├── /project-profile              My projects grid                  ✅ DONE
├── /project-profile/[id]         Project detail (owner view)       ✅ DONE
├── /track-verification           Kanban pipeline view              ✅ DONE
├── /carbon-calculator            Carbon calculator                 🔧 PARTIAL (mock data)
├── /notifications                Notification inbox                📋 PLACEHOLDER
├── /profile                      User profile settings             ✅ DONE
├── /portfolio                    Buyer credit portfolio             ❌ MISSING
├── /reports/esg                  ESG report dashboard              ❌ MISSING

ADMIN OPERATIONS (admin roles)
├── /project-developers               Project owners list               ✅ DONE
├── /project-developers/register      Onboard project owner             🔧 PARTIAL
├── /project-developers/[userId]      Project owner detail              ✅ DONE
├── /projects                     All projects registry table       ✅ DONE
├── /projects/[id]                Project detail (admin view)       ❌ MISSING
├── /user-management              Users + RBAC management           ✅ DONE
├── /site-visits                  Field visit scheduling            📋 PLACEHOLDER
├── /data-collection              Transaction ledger                📋 PLACEHOLDER
└── /compliance                   Audit trail + ESG reports         📋 PLACEHOLDER

FINANCIAL
├── /financials/payouts           Payout history                    ❌ MISSING
├── /financials/contracts         Contracts list + create           ❌ MISSING
├── /financials/contracts/[id]    Contract detail                   ❌ MISSING
└── /financials/records           Platform financial records        ❌ MISSING

SETTINGS (admin only)
└── /settings                     Platform config                   ❌ MISSING

PURCHASE FLOW
└── /credits/purchase             Credit checkout flow              ❌ MISSING
```

**Summary counts:**
| Status | Count |
|---|---|
| ✅ DONE | 16 |
| 🔧 PARTIAL | 9 |
| 📋 PLACEHOLDER | 4 |
| ❌ MISSING | 15 |
| **TOTAL** | **44 pages** |

---

_UI Design Specification prepared: May 2026 · Crevy Platform · Foovante Global_
_Hand this document to the design team alongside the brand guidelines and Figma component library starter._
