# Crevy — field agent dashboard & admin management: implementation spec

This document is written to be handed to a coding LLM (e.g. Claude Code) one step at a time, or as a full spec for a single implementation pass. Each step is self-contained: it states its goal, the files it likely touches, the data/API contracts involved, and acceptance criteria — so an implementer with no prior context on this conversation can pick it up and build it correctly.

---

## 0. Context for the implementer

**What Crevy is:** A carbon credit registry platform (Next.js frontend + Node.js/Express/Drizzle ORM backend) built for a company called Foovante, currently in a Ghana-focused pilot phase targeting agricultural waste projects. The platform integrates with CraftedClimate for dMRV (digital Monitoring, Reporting, Verification) via physical sensors and webhook workers.

**Existing roles/entities you should assume exist** (verify against the actual repo before writing code — names may differ slightly):

- An `RBACService` handling role-based access control.
- A `project_developer` entity (recently renamed from `project_owner`) representing a registered project developer/buyer.
- A `completeRegistration` service with buyer/developer branching logic and a `hasOnboarded` flag.
- A `project_manager` role, joined through a `project_developer_member` table.
- Session handling via a `customSessionClient`.
- A multi-step project registration wizard with step state persisted via URL query params — reuse this pattern for the new agent-facing wizard.

**What's being built:** Two connected features:

1. A **field agent dashboard** — a simple, responsive (mobile/tablet/desktop) interface for field agents whose only job is registering new project developers on location.
2. An **admin management interface** — for super admins and project admins to invite, enable, disable, and monitor field agents.

**New roles being introduced:**

- `super_admin` — full system access across all projects.
- `project_admin` (may already exist as `project_manager` — confirm and reuse if so) — manages field agents and developers within their own project(s) only.
- `field_agent` — new role, scoped to registering developers and viewing their own submissions only.

**Design principles to preserve throughout implementation:**

- Field agent UI: one task per screen, large tap targets, autosave every step, plain language (no registry jargon), works on a phone browser.
- Admin UI: information-dense table view is fine — admins are expected to be at a laptop/tablet more often.
- Disabling a field agent's access must be a soft flag, not a delete — registration history must remain intact and attributed.

---

## 1. Data model changes

### Step D1 — Add `field_agent` support to the RBAC/role system

**Goal:** Extend the existing role enum/table to support `field_agent`, `project_admin`, and `super_admin` if they don't already exist in some form.

**Files likely touched:** Drizzle schema file(s) for roles/users (e.g. `schema/roles.ts`, `schema/users.ts`), a new Drizzle migration file. Drizzle generates its own migration files by transforming javascript/typecript models into sql so write these are models following the existing model struture, we will manually invoke drizzle to generate the migration from the model.

**Details:**

- If roles are a Postgres enum, add the new values via `ALTER TYPE ... ADD VALUE` in a migration (note: Postgres requires this to run outside a transaction block in some Drizzle migration runners — check how the existing `developer_id` type-mismatch migration on Render was handled, and follow the same direct-SQL-edit approach if the generated migration doesn't apply cleanly).
- If roles are a join table (e.g. `user_roles` with a `role` text column + FK to `projects`), just ensure `field_agent` and `project_admin` are valid values, and that the table already supports project-scoping (a field agent's role should be tied to a specific `project_id`, not global).

**Acceptance criteria:**

- A user record can be assigned the `field_agent` role scoped to exactly one project.
- A user record can be assigned `project_admin` scoped to one or more projects.
- A user record can be assigned `super_admin` with no project scope required.
- Existing roles/queries continue to work unchanged (regression check on `RBACService`).

### Step D2 — Extend the user/agent table with access-control fields

**Goal:** Add fields needed for the invite/enable/disable flow.

**New columns (on the users table, or a new `field_agent_profiles` table if you don't want to touch the core users table):**

```
is_active          boolean      not null default true
invited_by         uuid         references users(id), nullable
invited_at         timestamptz  nullable
invite_token       text         nullable  -- hashed, single-use
invite_expires_at  timestamptz  nullable
project_id         uuid         references projects(id), not null  -- for field_agent role rows
disabled_at         timestamptz nullable
disabled_by         uuid        references users(id), nullable
```

**Acceptance criteria:**

- Migration runs cleanly against the existing dev/staging DB.
- `is_active` defaults to `true` for all existing users (backward compatible).
- Indexes added on `project_id` and `invite_token` (the latter for fast lookup during invite acceptance).

### Step D3 — Add attribution field to the project_developer registration record

**Goal:** Track which field agent (if any) registered a given project developer.

**New column on `project_developer` (or its registration/onboarding table):**

```
registered_by_agent_id  uuid  references users(id), nullable
```

`null` means the developer self-registered through the normal wizard; a non-null value means an agent registered them on-site.

**Acceptance criteria:** Existing self-registration flow is unaffected (column is nullable, defaults to null).

---

## 2. Backend implementation steps

All endpoints below assume Express + the existing `RBACService` middleware pattern. Adjust route prefixes to match the existing API structure (e.g. `/api/v1/...`).

### Step B1 — Invite a field agent

**Endpoint:** `POST /api/v1/admin/field-agents/invite`

**Auth:** `super_admin` (any project) or `project_admin` (only for their own project — reject with 403 if `project_id` in body doesn't match an admin's scope).

**Request body:**

```json
{
  "email": "agent@example.com",
  "phone": "+233...",
  "project_id": "uuid",
  "full_name": "string"
}
```

**Behavior:**

1. Validate the requester's project scope via `RBACService`.
2. Create (or find) a user record with role `field_agent`, `is_active: true`, `project_id` set, `invited_by` set to requester's id.
3. Generate a cryptographically random invite token, store only its hash, set `invite_expires_at` (recommend 7 days).
4. Send an invite email/SMS containing a link like `https://app.crevy.io/agent/accept-invite?token=<raw_token>`.
5. Return `201` with the created agent record (excluding token).

**Edge cases:** re-inviting an already-invited-but-not-yet-accepted agent should regenerate the token and extend expiry rather than erroring. Inviting an email that already belongs to a `project_developer` or other role should be rejected with a clear error — one identity should not silently gain a second role via this path without an explicit admin decision.

**Acceptance criteria:** invite email/SMS is sent; token is single-use and expires; re-invite flow works; scoping is enforced.

### Step B2 — Accept invite / activate account

**Endpoint:** `POST /api/v1/agent/accept-invite`

**Request body:** `{ "token": "string", "password": "string" }` (or integrate with existing session/auth provider's account-creation flow if passwordless/OAuth is already in use — check `customSessionClient` setup first).

**Behavior:** Look up user by hashed token match, verify not expired, set password/complete account setup, clear `invite_token`, set `invited_at` confirmation timestamp, establish a session.

**Acceptance criteria:** expired or already-used tokens return a clear 400 error; successful acceptance logs the agent in immediately.

### Step B3 — Enable / disable a field agent

**Endpoint:** `PATCH /api/v1/admin/field-agents/:agentId/status`

**Auth:** `super_admin` (any agent) or `project_admin` (only agents within their own project).

**Request body:** `{ "is_active": false }`

**Behavior:**

1. Verify scope.
2. Update `is_active`, and if disabling: set `disabled_at`, `disabled_by`, and **invalidate all active sessions** for that user immediately (check how `customSessionClient` exposes session revocation — likely a "delete sessions by user id" call).
3. Do not delete or anonymize any of the agent's prior registrations — `registered_by_agent_id` attribution must remain intact.

**Acceptance criteria:** disabling an agent immediately logs them out of any active session (verify this with a live-session test, not just a DB flag check); re-enabling restores access without needing a new invite.

### Step B4 — List field agents (admin table data source)

**Endpoint:** `GET /api/v1/admin/field-agents?project_id=&status=&search=`

**Auth:** `super_admin` sees all; `project_admin` is auto-scoped to their project(s) regardless of query params.

**Response:**

```json
{
  "agents": [
    {
      "id": "uuid",
      "full_name": "string",
      "email": "string",
      "phone": "string",
      "project_id": "uuid",
      "project_name": "string",
      "is_active": true,
      "invited_at": "iso8601",
      "registrations_count": 12,
      "last_active_at": "iso8601 | null"
    }
  ],
  "total": 1
}
```

**Acceptance criteria:** `registrations_count` is computed via a join/count against `project_developer` on `registered_by_agent_id`, not stored redundantly; pagination supported for large agent lists.

### Step B5 — Agent-assisted developer registration

**Goal:** Extend the existing `completeRegistration` service rather than duplicating it.

**Endpoint:** `POST /api/v1/agent/developers` (distinct from the self-service registration endpoint, but calling into the same underlying service with an `agentAssisted: true` flag and `registeredByAgentId` set to the authenticated agent's id).

**Request body (kept intentionally minimal for field use):**

```json
{
  "developer_name": "string",
  "phone": "string",
  "location": { "lat": 0.0, "lng": 0.0, "boundary_geojson": null },
  "farm_or_project_type": "string",
  "id_photo_url": "string | null"
}
```

**Behavior:**

1. Auth check: requester must be an active `field_agent`.
2. Call `completeRegistration` (or a thin wrapper around it) with `hasOnboarded: false`, `registered_by_agent_id: <agent id>`.
3. Persist partial data even if some optional fields are missing — this is a lightweight on-site capture, not the full registration wizard. Full details (methodology, assessment modules, etc.) are filled in later, either by the developer themselves or during formal project assessment.
4. Return the created record with a status the frontend can render as "Pending review" / "Needs more info".

**Acceptance criteria:** does not break or duplicate the existing self-registration `completeRegistration` logic; partial submissions are allowed and clearly flagged as incomplete downstream.

### Step B6 — "My registrations" list for a field agent

**Endpoint:** `GET /api/v1/agent/developers/mine?status=&search=`

**Auth:** `field_agent`, auto-scoped to `registered_by_agent_id = <self>`.

**Acceptance criteria:** an agent can never see another agent's registrations, even by manipulating query params (enforce scope server-side, not via a client-supplied filter).

---

## 3. Frontend implementation steps

Assumes Next.js (App Router) + existing component conventions in `crevy-frontend`. If Tailwind isn't already the styling approach used in the repo, adapt these steps to match whatever is actually in place — check `crevy-frontend/package.json` and existing dashboard components before starting.

### Step F1 — Field agent app shell (responsive layout)

**Goal:** A minimal, mobile-first layout wrapper distinct from the existing admin dashboard shell — no sidebar-heavy navigation. Bottom tab bar on mobile/tablet widths, simple top nav on desktop widths.

**Screens it wraps:** Home, Register developer, My registrations, Profile (see F2–F5).

**Acceptance criteria:** renders cleanly at common breakpoints (360px phone, 768px tablet, 1280px desktop) with no horizontal scroll; nav items have large (min 44px) tap targets.

### Step F2 — Home screen

**Content:** A single prominent "Register a new developer" button/card, plus a short recent-activity list (last 5 registrations with status badges). No charts, no analytics — that belongs to the admin dashboard, not here.

**Data source:** `GET /api/v1/agent/developers/mine` (limit 5, sorted by most recent).

### Step F3 — Register developer wizard

**Goal:** 3–4 step wizard, reusing the existing step-state-in-URL pattern from the project registration wizard.

**Steps:**

1. Developer identity (name, phone)
2. Location (map component for pin-drop or boundary draw — see the separate mapping/tools spec discussed previously; use Mapbox GL JS or Leaflet, not Google Maps)
3. ID/photo capture (device camera input via `<input type="file" accept="image/*" capture="environment">`)
4. Review & submit

**Behavior:** autosave to local state (and ideally a draft endpoint or `localStorage`-free persistence — do not use browser storage per this environment's constraints if this wizard is ever rendered inside an artifact context; a normal Next.js app has no such restriction, so `localStorage` or IndexedDB is fine here for offline draft resilience) after every step; submit button calls `POST /api/v1/agent/developers`.

**Acceptance criteria:** closing the browser mid-wizard and reopening resumes at the last completed step; submission shows a clear, plain-language confirmation state.

### Step F4 — My registrations screen

**Content:** Searchable list of the agent's own submissions with status (pending / verified / needs info). Tapping one shows a read-only detail view — agents should not be able to edit after submission (edits go through the admin/developer flow instead).

**Data source:** `GET /api/v1/agent/developers/mine`.

### Step F5 — Profile screen

**Content:** Agent's own name, phone, assigned project — read-only except perhaps a "log out" action. Nothing else.

### Step F6 — Admin: field agent management table

**Goal:** A new page in the existing admin dashboard (e.g. `/admin/field-agents`) listing all agents visible to the logged-in admin.

**Columns:** Name, phone/email, project, status (active/disabled toggle), # registered, last active, actions (disable/enable, resend invite if pending).

**Data source:** `GET /api/v1/admin/field-agents`.

**Behavior:** the status toggle calls `PATCH /api/v1/admin/field-agents/:agentId/status` optimistically, with rollback on failure and a toast/error state.

**Acceptance criteria:** `project_admin` users only ever see their own project's agents (verify this is enforced server-side per B4, not just hidden client-side); `super_admin` sees a project filter dropdown.

### Step F7 — Admin: invite field agent modal

**Goal:** A modal/form triggered from F6's "Invite agent" button — name, email, phone, project (pre-filled and locked if the admin is a `project_admin` scoped to one project; a dropdown if `super_admin`).

**Data source:** `POST /api/v1/admin/field-agents/invite` (B1).

**Acceptance criteria:** clear success state ("Invite sent to [email]"), clear duplicate-invite error handling.

---

## 4. Testing & QA checklist

- [ ] A `project_admin` cannot invite, view, enable, or disable a field agent outside their own project (test via direct API call, not just UI).
- [ ] Disabling a field agent immediately terminates their active session (test with a live logged-in session, not just a DB flag).
- [ ] Re-enabling a previously disabled agent restores access without requiring a new invite.
- [ ] An agent's registrations remain visible and correctly attributed after the agent is disabled.
- [ ] The registration wizard survives a browser refresh mid-flow (autosave verified).
- [ ] The wizard works on a real low-end Android phone browser and a tablet, not just desktop responsive mode.
- [ ] Partial/incomplete agent-submitted developer records don't break the downstream project assessment flow (Step B5's `hasOnboarded: false` and any partial-data handling).
- [ ] Invite tokens expire and cannot be reused after acceptance.

---

## 5. Suggested implementation order

1. D1 → D2 → D3 (schema first — everything else depends on it)
2. B1 → B2 (invite/accept, so agents can even log in)
3. B3 → B4 (admin management endpoints)
4. F6 → F7 (admin UI — lets you manually create/manage test agents before building the agent-facing UI)
5. B5 → B6 (agent-facing endpoints)
6. F1 → F2 → F3 → F4 → F5 (agent-facing UI, wizard last since it's the most complex piece)
7. Testing checklist pass

This order lets you manually create and manage test field agent accounts through the admin UI before the agent-facing dashboard exists, which makes steps 5–6 much easier to test end-to-end.
