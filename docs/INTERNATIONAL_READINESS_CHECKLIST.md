# Crevy Platform — International Market Readiness Checklist

### Carbon Credits Platform · Global Standards Compliance · 10,000 Concurrent Users

> **Document purpose:** This checklist maps every feature, security measure, infrastructure upgrade, and compliance requirement needed to position Crevy as a credible international carbon credits marketplace. It reflects the actual state of the codebase as of May 2026. Each item is marked ✅ Done, 🔧 Partial, or ❌ Missing.
>
> Following this document from top to bottom will produce a platform capable of handling 10,000 concurrent users, meeting Verra/Gold Standard marketplace requirements, and reducing cybersecurity attack surface by ≥90%.

---

## Table of Contents

1. [Current State Summary](#1-current-state-summary)
2. [Carbon Market Standards & Compliance](#2-carbon-market-standards--compliance)
3. [Credit Lifecycle & Marketplace](#3-credit-lifecycle--marketplace)
4. [Security — Backend](#4-security--backend)
5. [Security — Frontend](#5-security--frontend)
6. [Performance & Scalability](#6-performance--scalability)
7. [Infrastructure & DevOps](#7-infrastructure--devops)
8. [API Quality & Developer Experience](#8-api-quality--developer-experience)
9. [Frontend — Pages & Flows](#9-frontend--pages--flows)
10. [Testing Coverage](#10-testing-coverage)
11. [Monitoring & Observability](#11-monitoring--observability)
12. [Data Privacy & Regulatory](#12-data-privacy--regulatory)
13. [Internationalisation & Accessibility](#13-internationalisation--accessibility)
14. [Carbon Calculator](#14-carbon-calculator)
15. [Marketplace Search & Discovery](#15-marketplace-search--discovery)
16. [Outbound Webhooks & Buyer API](#16-outbound-webhooks--buyer-api)
17. [Mobile Readiness](#17-mobile-readiness)
18. [Disaster Recovery & Business Continuity](#18-disaster-recovery--business-continuity)
19. [Load Testing & Performance Benchmarks](#19-load-testing--performance-benchmarks)
20. [Priority Build Order](#20-priority-build-order)
21. [Dependency Reference](#21-dependency-reference)

---

## 1. Current State Summary

### What is built and working ✅

| Domain                   | What Exists                                                                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**                 | better-auth email+password, sessions, custom role on session via `customSession` plugin                                             |
| **RBAC**                 | `role`, `permission`, `role_permission`, `user_role` tables; `requirePermission` middleware; seeded roles and permissions           |
| **Project Owners**       | Registration, KYC status, farm plot GPS, agent assignments, list + detail pages                                                     |
| **Projects**             | Create, list, activate, project type taxonomy (Green/Brown/Blue Economy), `projectTags`, `sdgs`, sector                             |
| **Partners**             | CRUD, approval workflow, CraftedClimate seeded as dMRV provider                                                                     |
| **MRV Pipeline**         | Ingestion, verification, and blockchain anchor tables; webhook handler for Worker 2 and Worker 3; dMRV simulation endpoint for demo |
| **Carbon Credits**       | UTXO batch model (`carbon_credit`), purchase/split, retire, `credit_transaction` ledger, `credit_verification`                      |
| **Financials**           | `payout`, `contract`, `financial_record` tables and services                                                                        |
| **Storage**              | Cloudflare R2 with presigned URL generation; `StorageService.uploadFile()` and `resolveUrl()` in frontend                           |
| **Notifications**        | Table and service scaffolded                                                                                                        |
| **Marketplace (public)** | Route exists at `/marketplace`                                                                                                      |
| **Project Profile**      | Detail page with Overview, Documents, MRV tabs                                                                                      |
| **Track Verification**   | Kanban board by pipeline stage                                                                                                      |
| **Project Owners list**  | Paginated list with role-aware filtering                                                                                            |
| **Seed data**            | Roles, permissions, currencies, CraftedClimate partner                                                                              |
| **Swagger / OpenAPI**    | Mounted at `/api-docs`                                                                                                              |
| **Redis**                | `ioredis` installed, `REDIS_URL` in settings                                                                                        |
| **Logging**              | Pino + rotating file stream + Morgan                                                                                                |
| **Tests**                | Vitest + Supertest; RBAC, Partners, Project Owners, MRV test suites                                                                 |

### What is scaffolded but not functional 🔧

| Item                 | Status                                                          |
| -------------------- | --------------------------------------------------------------- |
| Compliance page      | Placeholder component                                           |
| Data collection page | Placeholder                                                     |
| Site visits page     | Placeholder                                                     |
| User management page | Placeholder                                                     |
| Notifications UI     | No bell dropdown, no real-time                                  |
| Payout disbursement  | Service exists, no trigger wiring to credit purchase            |
| Contract management  | Service exists, no frontend                                     |
| Marketplace listing  | Route exists, no product page, no buyer flow                    |
| Email verification   | `requireEmailVerification: false` in better-auth                |
| Rate limiting        | Redis installed, no middleware implemented                      |
| Audit log            | Planned in ERD analysis, no model or middleware                 |
| Carbon calculator    | Page exists, hardcoded mock, not connected to real project data |

### What is missing ❌

Security hardening, audit logging, email flows, marketplace buyer journey, ESG reporting, registry integration, real-time notifications, performance optimisation, full test coverage, i18n, mobile PWA, load testing, and disaster recovery planning.

---

## 2. Carbon Market Standards & Compliance

### 2.1 Methodology Alignment

| Item                                           | Status     | Implementation                                                                                                                                 |
| ---------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Verra VM0042 v2.2 label stored on verification | ✅ Done    | `mrv_verification_result.methodologyApplied`                                                                                                   |
| Gold Standard GS4GG label stored               | ✅ Done    | Stored on verification result for renewable energy                                                                                             |
| Vintage year tracked per credit                | ✅ Done    | `carbon_credit.creditVintage`                                                                                                                  |
| Registry field on credit                       | 🔧 Partial | Column exists, not populated                                                                                                                   |
| Additionality assertion stored                 | ✅ Done    | Add `is_additional: boolean` + `additionality_reason: text` to `carbon_credit`                                                                 |
| Permanence risk buffer tracked                 | ✅ Done    | `buffer_contribution` in `mrv_verification_result`                                                                                             |
| Leakage tracked                                | ✅ Done    | `leakage_deduction` in `mrv_verification_result`                                                                                               |
| Co-benefits (SDGs) stored                      | ✅ Done    | `project.sdgs` array                                                                                                                           |
| Emission scope classification                  | ✅ Done    | Add `emission_scope: enum('scope_1','scope_2','scope_3','removal')` to `carbon_credit`. Corporate buyers need this for GHG Protocol reporting. |

### 2.2 Registry Integration

| Item                                       | Status     | Implementation                                                                                                                                                                                                                       |
| ------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Verra VCS API integration                  | ❌ Missing | **Backend:** Create `src/v2/registry/verra.service.ts`. POST credit issuance events to Verra's REST API (`POST /api/v1/projects/{id}/issuances`). Store `verra_issuance_id` on `carbon_credit`. No extra package — standard `axios`. |
| Gold Standard API integration              | ❌ Missing | Same pattern as Verra. Store `gs_certificate_id` on `carbon_credit`.                                                                                                                                                                 |
| Registry serial number synchronisation     | ❌ Missing | Add `registry_serial_number: varchar` to `carbon_credit`. Update on registry confirmation webhook.                                                                                                                                   |
| Credit retirement notification to registry | ❌ Missing | On `retireCarbonCredit()`, POST retirement to Verra/GS API. This is a hard requirement for internationally recognised retirement.                                                                                                    |
| Registry status badge on credit            | ❌ Missing | Frontend: show "Verra Registered" or "Gold Standard" badge on credit and marketplace cards                                                                                                                                           |

### 2.3 Audit Trail

| Item                       | Status  | Implementation                                                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Immutable audit log table  | ✅ Done | **Backend — Critical.** Create `src/v2/audit/models/audit_log.model.ts`: `id`, `actor_id`, `action` (enum: `create`, `update`, `delete`, `approve`, `issue`, `transfer`, `retire`), `resource`, `resource_id`, `old_values` (jsonb), `new_values` (jsonb), `ip_address`, `user_agent`, `created_at`. No `UPDATE` or `DELETE` allowed on this table — ever. Row-level security at DB level: `GRANT INSERT ON audit_log TO app_user` only. |
| Audit log Synchonization   | ✅ Done | Synchronous logging into the audit_log table via transactions for major modules in their service layers                                                                                                                                                                                                                                                                                                                                  |
| Audit log API              | ✅ Done | `GET /api/v2/audit?resource=&resourceId=&actorId=&from=&to=` — super_admin only. Paginated cursor-based.                                                                                                                                                                                                                                                                                                                                 |
| Frontend audit trail view  | ✅ Done | "Audit Trail" tab on project detail page. Table: timestamp, actor, action, old → new values. the audit log page, there for all authenticated users                                                                                                                                                                                                                                                                                       |
| Audit log retention policy | ✅ Done | Minimum 7-year retention (Verra requirement). Document in data governance doc. Archive to cold storage after 2 years. Postgres CronJob to move records older than 90 days to an S3-compatible bucket. Uses 3 extensions: `pg_cron`, `pgduckdb`, `aws_s3`                                                                                                                                                                                 |

### 2.4 ESG Reporting

| Item                                     | Status  | Implementation                                                                                                                                                                                                                                                           |
| ---------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ESG report generation (PDF)              | ✅ Done | `POST /api/v2/reports/esg/:companyUserId`. PDF contents: company name, reporting period, total tCO₂e offset, breakdown by scope, project list with types and countries, vintage years, blockchain proof hashes, CraftedClimate methodology references. Package: `pdfkit` |
| ESG report history                       | ✅ Done | `GET /api/v2/reports/esg/history` — returns list of previously generated reports stored in R2                                                                                                                                                                            |
| Scope 1/2/3 emission breakdown in report | ✅ Done | Requires `emission_scope` field on `carbon_credit` (see 2.1)                                                                                                                                                                                                             |
| Certificate of retirement PDF            | ✅ Done | Auto-generated when credits are retired. Includes: credit serial numbers, tCO₂e amount, project name, vintage, blockchain tx hash, Crevy seal. Package: `pdfkit`                                                                                                         |
| ESG dashboard for corporate buyers       | ✅ Done | Frontend: `/compliance/reports` — visual breakdown of portfolio, downloadable PDF, shareable public URL                                                                                                                                                                  |

### 2.5 Carbon Price & Market Data

| Item                                | Status     | Implementation                                                                                                                                   |
| ----------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Price history per project           | ✅ Done    | Add `price_history` table: `project_id`, `price_per_credit`, `currency_id`, `recorded_at`. Insert a row whenever a credit transaction completes. |
| Market price display on marketplace | ❌ Missing | Frontend: Show "Last sold at $X.XX" on marketplace cards. Fetch from `price_history`.                                                            |
| Price chart on project page         | ❌ Missing | Frontend: line chart on project detail page — average credit price per month over 12 months.                                                     |

---

## 3. Credit Lifecycle & Marketplace

### 3.1 Marketplace — Buyer Journey

| Item                               | Status     | Implementation                                                                                                                                                                                                                                                              |
| ---------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public marketplace listing page    | 🔧 Partial | Route exists, no real project cards                                                                                                                                                                                                                                         |
| `GET /api/v2/projects/marketplace` | ✅ Done    | Add to `project.route.ts`: **no auth required**. Filters: `sector`, `projectType`, `country`, `region`, `minCredits`, `maxPricePerCredit`, `vintageYear`, `sdg`, `registry`. Returns projects with their available credit quantities aggregated from `carbon_credit` table. |
| Project marketplace detail page    | ✅ Done    | `/marketplace/[projectId]` — project story, practices, SDG badges, MRV proof cards, available credit quantity, price, vintage, registry badges, "Buy Credits" CTA.                                                                                                          |
| Credit purchase flow (checkout)    | ✅ Done    | **Frontend multi-step:** (1) select quantity → (2) select currency → (3) review total + emission scope → (4) payment → (5) confirmation. Call `POST /api/v2/credits/:id/purchase`.                                                                                          |
| Payment gateway integration        | ❌ Missing | **Stripe** for international buyers (`pnpm add stripe`). **Paystack** for African buyers (`pnpm add paystack`). Flow: create payment intent → buyer pays → confirm payment → mark transaction `completed` → issue credits to buyer.                                         |
| Payment webhook handler            | ❌ Missing | `POST /api/v2/payments/stripe/webhook` and `/paystack/webhook`. Verify signature. On `payment_intent.succeeded` → call `CreditService.purchaseCarbonCredit()`.                                                                                                              |
| Buyer portfolio page               | ✅ Done    | `/portfolio` — buyer's owned credits: serial numbers, tCO₂e, project name, vintage, MRV proof link, retire button.                                                                                                                                                          |
| Credit retirement flow             | ✅ Done    | Service exists, no frontend UI                                                                                                                                                                                                                                              |
| Retirement certificate download    | ✅ Done    | Post-retirement PDF (see Section 2.4)                                                                                                                                                                                                                                       |
| Marketplace SEO                    | ✅ Done    | Each project marketplace page needs: `title`, `description`, `og:image`, `og:type: website`, `schema.org/Product` structured data for search engine indexing                                                                                                                |

### 3.2 Payout Automation

| Item                                | Status     | Implementation                                                                                                                                                                   |
| ----------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auto-create payout on credit sale   | ❌ Missing | Wire `FinancialsService.createPayout()` inside `CreditService.purchaseCarbonCredit()` DB transaction. `payoutAmount = totalAmount × (1 - PLATFORM_FEE_PCT)`.                     |
| Platform fee financial record       | ❌ Missing | Same transaction: insert `financial_record` with `record_type: 'platform_fee'`, `amount = totalAmount × PLATFORM_FEE_PCT`.                                                       |
| `PLATFORM_FEE_PCT` env var          | ❌ Missing | Add to `settings.ts` and `EnvSchema`. Default: `0.05` (5%). Make configurable without redeployment.                                                                              |
| Mobile money disbursement           | ❌ Missing | Integrate **Hubtel** or **MTN Mobile Money API** to automate payout to `momoDetails.number`. Package: REST API via `axios`. Trigger via BullMQ job on payout status = `pending`. |
| Bank transfer disbursement          | ❌ Missing | Integrate **Flutterwave** or **Paystack Transfer API** for bank account payouts. Same BullMQ trigger.                                                                            |
| Payout dashboard for project owners | ❌ Missing | `/financials/payouts` — list: date, amount, currency, project, status (pending/completed/failed), payment method                                                                 |
| Payout status notification          | ❌ Missing | Fire in-app + email notification when payout status changes to `completed` or `failed`                                                                                           |
| Failed payout retry                 | ❌ Missing | If payout API returns failure, queue a BullMQ retry (3 attempts: 1h, 24h, 48h). Alert admin on 3rd failure.                                                                      |

### 3.3 Contracts (Offtake Agreements)

| Item                                   | Status     | Implementation                                                                                                         |
| -------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| Contract creation UI                   | ❌ Missing | Form: buyer, project, committed quantity, price per credit, currency, start/end date, payment terms, notes             |
| Contract status management UI          | ❌ Missing | `contract.status`: `draft → active → completed / terminated`. Admin approval step before `active`.                     |
| Offtake agreement PDF generation       | ❌ Missing | Generate legal PDF on contract activation. Contents: parties, quantity, price, schedule, Crevy T&Cs. Package: `pdfkit` |
| Contract credit fulfilment tracking    | ❌ Missing | Show how many of the committed credits have been delivered vs outstanding.                                             |
| Contract listing for buyers and admins | ✅ Done    | `/financials/contracts` — filterable list                                                                              |

---

## 4. Security — Backend

> **Target: reduce attack surface by ≥90%.** Every item below contributes to this goal.

### 4.1 Rate Limiting — HIGHEST PRIORITY

| Item                                | Status     | Implementation                                                                                                                                                |
| ----------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Global rate limiter                 | ✅ Done    | **Critical.** used ArcJet for rate-limiting and bot protection not `pnpm add express-rate-limit rate-limit-redis`. Apply globally: `100 req / 15 min per IP`. |
| Auth route rate limiter             | ✅ Done    | `10 req / 15 min per IP` on `/api/auth/sign-in` and `/api/v2/auth/register`. Blocks brute-force.                                                              |
| MRV webhook rate limiter            | ❌ Missing | `50 req / min per IP` on `/api/v2/mrv/webhook/*`. Blocks webhook flooding.                                                                                    |
| Per-user rate limiter (post-auth)   | ❌ Missing | `500 req / hour per user.id`. Key: Redis `ratelimit:user:{userId}`.                                                                                           |
| Marketplace public endpoint limiter | ❌ Missing | `200 req / 15 min per IP` on `GET /api/v2/projects/marketplace`. Prevents scraping.                                                                           |

```typescript
// src/index.ts — add after app.use(helmet())
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";

const store = new RedisStore({
  sendCommand: (...args: string[]) => redis.sendCommand(args),
});

app.use(
  "/api/",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    store,
    standardHeaders: true,
  }),
);

// Stricter on auth
app.use(
  "/api/auth/sign-in",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10, store }),
);
app.use(
  "/api/v2/auth/register",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10, store }),
);
```

### 4.2 HTTP Security Headers

| Item                    | Status     | Implementation                                                                                                                                                                                              |
| ----------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Helmet.js               | ✅ Done    | **Critical — one line.** `pnpm add helmet`. `app.use(helmet())` after `trust proxy`. Adds: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Strict-Transport-Security`, `Referrer-Policy`. |
| Content-Security-Policy | ✅ Done    | Configure via Helmet. Restrict to `'self'` + known CDNs. Block inline scripts.                                                                                                                              |
| HSTS                    | ✅ Done    | `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` — set in production only.                                                                                                         |
| CORS hardening          | 🔧 Partial | Whitelist exists but `settings.FRONTEND_URL` is a single string. Move to env var `ALLOWED_ORIGINS` as comma-separated list parsed at startup.                                                               |

```typescript
// src/index.ts
import helmet from "helmet";
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", settings.FRONTEND_URL],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  }),
);
```

### 4.3 Input Validation & Sanitisation

| Item                               | Status     | Implementation                                                                                                                                                             |
| ---------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zod validation on all routes       | 🔧 Partial | Most routes have it, some controllers still do manual checks                                                                                                               |
| HTML/script injection sanitisation | ✅ Done    | `pnpm add xss`. All `text` fields from user input sanitised before DB write.                                                                                               |
| SQL injection protection           | ✅ Done    | Drizzle ORM parameterises all queries                                                                                                                                      |
| Path traversal on storage paths    | ❌ Missing | Validate R2 key in `StorageService` — strip `../`, `./`, null bytes. Enforce prefix: `/project_docs/`, `/site_photos/`.                                                    |
| File upload validation             | 🔧 Partial | Multer installed. Add: MIME type whitelist (`application/pdf`, `image/jpeg`, `image/png`), 10MB size cap, magic-byte validation (check first 4 bytes, not just extension). |
| Request body size limit            | ✅ Done    | `express.json()` defaults to 100kb. Set explicit limit: `express.json({ limit: '2mb' })`. Webhook routes: `1mb`.                                                           |
| Parameter pollution protection     | ✅ Done    | `pnpm add hpp`. `app.use(hpp())`. Prevents `?status=active&status=retired` query confusion.                                                                                |

### 4.4 Authentication Hardening

| Item                               | Status     | Implementation                                                                                                                                       |
| ---------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Email verification                 | ❌ Missing | Enable `requireEmailVerification: true` in better-auth. Add `nodemailer` SMTP transport.                                                             |
| Password strength                  | 🔧 Partial | Min 6 chars — weak for financial platform. Enforce: min 8 chars, 1 uppercase, 1 number, 1 symbol. Update Zod schema in `auth.schema.ts`.             |
| Two-factor authentication (TOTP)   | ❌ Missing | Enable `twoFactor()` plugin in better-auth. **Mandatory for `super_admin` and `financial_admin` roles** — enforce at `requireAuth` middleware level. |
| Account lockout on failed attempts | ❌ Missing | Track `login_attempt:{email}` in Redis. Lock after 5 failures for 15 min. Return `429 Too Many Requests`.                                            |
| `deletedAt` soft-delete respected  | 🔧 Partial | Field exists on user, not checked in `requireAuth`. Add: if `user.deletedAt !== null` → return 401.                                                  |
| Session expiry                     | 🔧 Partial | Confirm `sessionExpiresIn: '7d'` and `updateAge: '1d'` set in better-auth config.                                                                    |
| Password reset flow                | ❌ Missing | better-auth supports `forgetPassword()` + `resetPassword()` — enable and wire to SMTP. Add frontend: `/forgot-password` and `/reset-password` pages. |
| OAuth social login                 | ❌ Missing | Optional for pilot. Google OAuth via better-auth `socialProviders: { google: { ... } }` removes friction for corporate buyers.                       |

### 4.5 Authorisation

| Item                                   | Status     | Implementation                                                                                                                                                       |
| -------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RBAC on all protected routes           | 🔧 Partial | Some routes use only `requireAuth` without `requirePermission`                                                                                                       |
| Resource ownership checks              | ✅ Done    | Project ownership checked. Farm plots, documents, credits need same ownership pattern.                                                                               |
| `project_owner` data scope enforcement | ✅ Done    | All list queries for project owners must auto-filter `createdBy = req.user.id` unless caller has `manage` permission. Enforce in service layer, not just controller. |
| Horizontal privilege escalation guard  | ✅ Done    | A project owner must not be able to access another owner's documents, plots, or credits. Verify ownership before every `SELECT by id`.                               |
| Admin impersonation audit              | ❌ Missing | When a super_admin reads another user's data, log it to `audit_log` with `action: 'impersonate_view'`.                                                               |

### 4.6 Webhook Security

| Item                                 | Status     | Implementation                                                                                                                                       |
| ------------------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| CraftedClimate webhook auth          | ✅ Done    | Bearer token + optional SHA-256 body hash                                                                                                            |
| Payload size limit on webhooks       | ❌ Missing | `express.json({ limit: '1mb' })` on `/api/v2/mrv/webhook/*` routes specifically                                                                      |
| Webhook idempotency                  | 🔧 Partial | `verificationEventId` unique constraint prevents duplicates. Explicitly return 200 on duplicate (not 409) — CraftedClimate may retry on any non-2xx. |
| Replay attack prevention             | ❌ Missing | Reject webhook payloads where `transmission_timestamp` is older than 5 minutes. Check in `requireMrvWebhookAuth` middleware.                         |
| Payment webhook signature validation | ❌ Missing | Stripe: verify `stripe-signature` header using `stripe.webhooks.constructEvent()`. Paystack: HMAC-SHA512 of raw body against secret.                 |

### 4.7 Secrets & Environment

| Item                             | Status     | Implementation                                                                                              |
| -------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| Secrets in environment variables | ✅ Done    | All secrets are env vars                                                                                    |
| Env schema validation on startup | ✅ Done    | `EnvSchema` via Zod                                                                                         |
| `.env` in `.gitignore`           | ✅ Done    |                                                                                                             |
| Secret scanning in CI            | ❌ Missing | Add `gitleaks` action to GitHub CI. Fails pipeline on committed secrets.                                    |
| `BETTER_AUTH_SECRET` rotation    | ❌ Missing | Document quarterly rotation procedure: update env var on Render, active sessions remain valid until expiry. |
| R2 key rotation                  | ❌ Missing | Document 90-day rotation for `R2_ACCESS_KEY_ID` + `R2_SECRET_ACCESS_KEY`.                                   |

### 4.8 Dependency Security

| Item                              | Status     | Implementation                                                                      |
| --------------------------------- | ---------- | ----------------------------------------------------------------------------------- |
| `pnpm audit` in CI                | ❌ Missing | Add to `.github/workflows/ci.yml`. Fail on `high` or `critical` severity.           |
| Dependabot automated PRs          | ❌ Missing | Add `.github/dependabot.yml` — weekly dependency updates, auto-approve patch bumps. |
| Lock file committed and verified  | ✅ Done    | `pnpm-lock.yaml` present                                                            |
| No eval or dynamic code execution | ✅ Done    | Not present in codebase                                                             |

---

## 5. Security — Frontend

### 5.1 Authentication

| Item                            | Status     | Implementation                                                                                                       |
| ------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------- |
| Cookie-based session (HttpOnly) | ✅ Done    | better-auth sets `httpOnly: true`                                                                                    |
| `secure: true` in production    | ✅ Done    | Conditionally set on `NODE_ENV === 'production'`                                                                     |
| Auto-redirect on 401            | 🔧 Partial | Add Axios response interceptor: on `401` → `authClient.signOut()` → `router.push('/login')` in `axiosClient.tsx`     |
| Session refresh on activity     | ✅ Done    | better-auth `updateAge` handles this                                                                                 |
| Logout clears all browser tabs  | ❌ Missing | `BroadcastChannel('auth').postMessage('logout')` on sign-out. Listener in root layout calls `router.push('/login')`. |
| Inactivity timeout              | ❌ Missing | After 30 min of inactivity, warn user and log out. Use `setTimeout` reset on user events (`mousemove`, `keydown`).   |

### 5.2 Content Security

| Item                                    | Status     | Implementation                                                                                                                                                                                         |
| --------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `next.config.ts` security headers       | ❌ Missing | Add `headers()` config: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: geolocation=(), camera=(), microphone=()` |
| User content sanitisation before render | ❌ Missing | Any DB field rendered as text that could contain user input: `pnpm add dompurify @types/dompurify`. Wrap in `DOMPurify.sanitize()`.                                                                    |
| No `dangerouslySetInnerHTML`            | ✅ Done    | Not used                                                                                                                                                                                               |
| No secrets in `NEXT_PUBLIC_*` vars      | ✅ Done    | Only public keys exposed                                                                                                                                                                               |
| Subresource Integrity on CDN assets     | ❌ Missing | If loading anything from cdnjs or unpkg, add `integrity` + `crossOrigin="anonymous"` attributes.                                                                                                       |

```typescript
// next.config.ts — add headers() to config
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options',        value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy',     value: 'geolocation=(), camera=(), microphone=()' },
    ],
  }];
},
```

### 5.3 Form Security

| Item                             | Status     | Implementation                                                                                                                   |
| -------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| CSRF protection                  | ✅ Done    | better-auth: `SameSite: Lax` + Origin header check                                                                               |
| Client-side file type validation | 🔧 Partial | Type checking in `Step3_Documents`. Add magic-byte check using `FileReader` on first 4 bytes.                                    |
| No sensitive data in URL params  | 🔧 Partial | Audit all `router.push()` calls — no token/secret/password ever in URL                                                           |
| Form submission debounce         | ❌ Missing | Prevent double-submit on all forms. Disable submit button while `isSubmitting = true`. Already done on most forms but audit all. |

---

## 6. Performance & Scalability

> Target: 10,000 concurrent users, P95 API response time < 200ms.

### 6.1 Database

| Item                               | Status     | Implementation                                                                                                                                                                                                      |
| ---------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Connection pooling                 | 🔧 Partial | Drizzle uses `node-postgres` directly. Add `max: 20, idleTimeoutMillis: 30000` to pool config. Or use **PgBouncer** (Render add-on) as a connection pooler in front of PostgreSQL.                                  |
| Indexes on all FK + filter columns | 🔧 Partial | Run `EXPLAIN ANALYZE` on: marketplace query, project list by `createdBy`, `carbon_credit` by owner + status. Add missing indexes. Key gaps: `project.created_by`, `carbon_credit.current_owner_id + credit_status`. |
| Composite index for marketplace    | ❌ Missing | `CREATE INDEX idx_project_marketplace ON project (project_status, project_stage, sector)` — covers the most common marketplace filter combination.                                                                  |
| Slow query logging                 | ❌ Missing | Set `log_min_duration_statement = 200` in PostgreSQL. Log all queries >200ms. Review weekly.                                                                                                                        |
| Cursor pagination everywhere       | 🔧 Partial | Credits list still uses `OFFSET` — replace with cursor (UUIDv7 ordering).                                                                                                                                           |
| Read replica                       | ❌ Missing | For 10k users: Render PostgreSQL read replica. Route all `SELECT` queries to replica via a second Drizzle instance `dbRead`.                                                                                        |
| `VACUUM ANALYZE` schedule          | ❌ Missing | PostgreSQL autovacuum handles this by default, but confirm it is not disabled on Render. Run `ANALYZE` manually after large seed operations.                                                                        |

### 6.2 Caching (Redis)

| Item                      | Status     | Implementation                                                                                                                                                                                               |
| ------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Redis installed           | ✅ Done    | `ioredis`, `REDIS_URL` in settings                                                                                                                                                                           |
| Session caching in Redis  | ❌ Missing | **Single highest-impact optimisation.** `requireAuth` calls `auth.api.getSession()` on every request — this hits Postgres every time. Cache result: `SETEX session:{token} 60 {json}`. Invalidate on logout. |
| Marketplace listing cache | ❌ Missing | Cache `GET /api/v2/projects/marketplace` for 5 min per filter combination. Key: hash of query params. Invalidate on project status change.                                                                   |
| Currency list cache       | ❌ Missing | Cache for 1 hour. Currencies never change after seeding.                                                                                                                                                     |
| User profile cache        | ❌ Missing | Cache `GET /api/v2/auth/me` for 5 min. Invalidate on profile update.                                                                                                                                         |
| Credit availability cache | ❌ Missing | Cache `availableAmount` per `carbon_credit` id for 30s. Invalidate on purchase. Prevents multiple buyers seeing stale quantities.                                                                            |

```typescript
// src/config/redis.ts
import { Redis } from "ioredis";
import settings from "./settings";

export const redis = new Redis(settings.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on("error", (err) => console.error("[Redis]", err));
```

### 6.3 Background Jobs (BullMQ)

| Item                          | Status     | Implementation                                                                                                                                        |
| ----------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| BullMQ job queue              | ❌ Missing | `pnpm add bullmq`. Create `src/config/queues.ts` with queues: `email`, `payout`, `pdf`, `registry`, `notification`.                                   |
| Email queue                   | ❌ Missing | Never send email synchronously. Queue all emails. Worker: `nodemailer.sendMail()`.                                                                    |
| Payout disbursement queue     | ❌ Missing | Queue payout job when `credit_transaction.status → completed`. Worker calls MoMo / bank API.                                                          |
| PDF generation queue          | ❌ Missing | ESG reports, retirement certificates, contracts — all generated async.                                                                                |
| Registry notification queue   | ❌ Missing | Verra / Gold Standard API calls queued. Retry on failure (3 attempts).                                                                                |
| MRV webhook retry queue       | ❌ Missing | If webhook processing fails, retry with exponential backoff: 30s, 5min, 30min.                                                                        |
| BullMQ dashboard (Bull Board) | ❌ Missing | `pnpm add @bull-board/express`. Mount at `/admin/queues` behind `requireAuth + requirePermission('rbac','manage')`. Gives visibility into job status. |

### 6.4 API Response Optimisation

| Item                   | Status     | Implementation                                                                                                                                      |
| ---------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Response compression   | ✅ Done    | `pnpm add compression @types/compression`. `app.use(compression())`. Reduces payload 60–80%.                                                        |
| Avoid N+1 queries      | 🔧 Partial | `listProjectOwners` joins correctly. `listProjects` with credit quantities needs a subquery or join — not a loop. Audit all list service functions. |
| Lean response shapes   | 🔧 Partial | Some endpoints return the full DB row including internal fields. Use `select({ ... })` to return only what the frontend needs.                      |
| `ETag` caching headers | ❌ Missing | Add `ETag` headers to read-heavy endpoints (marketplace, project detail). Allows CDN and browser to cache responses.                                |
| Database query timeout | ❌ Missing | Set `statement_timeout = 5000` (5s) on the DB connection to prevent runaway queries blocking the pool.                                              |

### 6.5 Frontend Performance

| Item                                   | Status     | Implementation                                                                                           |
| -------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| React Query global stale time          | 🔧 Partial | Set globally: `new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } })`                  |
| Image optimisation                     | ✅ Done    | `next/image` used                                                                                        |
| Code splitting                         | ✅ Done    | Next.js automatic                                                                                        |
| Bundle size analysis                   | ❌ Missing | `pnpm add @next/bundle-analyzer`. Run before each release.                                               |
| Loading skeletons on all list pages    | 🔧 Partial | Add `Skeleton` component to all tables/lists while `isLoading`                                           |
| Error boundaries                       | ❌ Missing | Wrap each dashboard section in an `<ErrorBoundary>`. A crashed chart must not bring down the whole page. |
| `next/font` for all custom fonts       | ✅ Done    | Geist and Syne loaded via `next/font/google`                                                             |
| `<Suspense>` wrapping on heavy tabs    | ❌ Missing | Wrap MRV tab, documents tab in `<Suspense>` with a skeleton fallback                                     |
| Prefetch on hover for navigation links | ❌ Missing | `next/link` prefetches on hover by default — ensure all `<a>` tags are `<Link>`                          |

---

## 7. Infrastructure & DevOps

### 7.1 CI/CD Pipeline

| Item                            | Status     | Implementation                                                                                                                                                         |
| ------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub Actions CI               | ❌ Missing | `.github/workflows/ci.yml`. Triggers: every PR to `main` and `develop`. Steps: `pnpm install` → `pnpm lint` → `pnpm test` → `pnpm build`. Required check before merge. |
| Automated deployment            | 🔧 Partial | Render auto-deploys on push to main. Add required CI check before Render deploys.                                                                                      |
| Branch protection on `main`     | ❌ Missing | Require: 1 PR review, CI passing, no direct pushes. Set in GitHub repo settings.                                                                                       |
| Preview deployments on PRs      | ❌ Missing | Vercel preview deployments on PRs. Frontend team gets a shareable URL for visual review.                                                                               |
| DB migration in deploy pipeline | 🔧 Partial | `render:build` runs `db:generate`. Add `db:migrate` after.                                                                                                             |
| Migration rollback plan         | ❌ Missing | Document: for every migration that adds a `NOT NULL` column, the previous deploy must handle `null` gracefully. Use `DEFAULT` on new columns.                          |

### 7.2 Database Operations

| Item                                          | Status     | Implementation                                                                                              |
| --------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| Automated daily backups                       | ❌ Missing | Enable Render PostgreSQL daily backups. Retain 7 days. Test restore monthly — schedule a calendar reminder. |
| Point-in-time recovery (PITR)                 | ❌ Missing | Required for a financial platform. Render PostgreSQL Pro plan supports PITR. Document RTO: 2 hours.         |
| Migration tested on staging before production | ❌ Missing | Add `db:migrate` step in staging deploy. Monitor logs. Only deploy to production after staging succeeds.    |
| Database schema versioning                    | ✅ Done    | `drizzle/` migration folder with timestamped SQL files                                                      |
| Backup verification                           | ❌ Missing | Quarterly: restore a backup to a throwaway DB instance and verify data integrity.                           |

### 7.3 Environments

| Item          | Status     | Implementation                                                                                                                                                                             |
| ------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Production    | ✅ Done    | Render + Vercel                                                                                                                                                                            |
| Staging       | ❌ Missing | Clone Render service as `crevy-backend-staging`. Separate `DATABASE_URL` pointing to a `crevy_staging` DB. Required before every production deploy.                                        |
| Test (CI)     | 🔧 Partial | `vitest.config.ts` has `TEST_DATABASE_URL` but CI doesn't provision a test PostgreSQL instance. Add GitHub Actions service container: `services: postgres: image: postgis/postgis:16-3.4`. |
| Feature flags | ❌ Missing | Use a simple `feature_flag` table: `{ name, enabled, description }`. Allows toggling incomplete features (e.g. payment gateway) without a deploy. Seed with all in-progress features.      |

### 7.4 Container & Deploy

| Item                       | Status     | Implementation                                                                                                                                                  |
| -------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ---------------------------------------------------------------------- |
| Dockerfile                 | ✅ Done    | Present in repo                                                                                                                                                 |
| Docker Compose (local dev) | ✅ Done    | `docker-compose.yml` present                                                                                                                                    |
| Health check in Dockerfile | ❌ Missing | Add `HEALTHCHECK CMD curl -f http://localhost:4000/api/v2/health                                                                                                |     | exit 1` to Dockerfile. Render uses this to detect unhealthy instances. |
| Graceful shutdown          | ❌ Missing | Handle `SIGTERM` in `server.ts`: stop accepting new requests, drain in-flight requests, close DB pool, then exit. Prevents dropped requests on rolling deploys. |
| Multi-region deployment    | ❌ Missing | Future: Render supports multi-region. Deploy backend in `eu-west` and `us-east` with a global load balancer for international buyers.                           |

---

## 8. API Quality & Developer Experience

### 8.1 OpenAPI / Swagger

| Item                             | Status     | Implementation                                                                                                                      |
| -------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Swagger UI mounted               | ✅ Done    | `/api-docs`                                                                                                                         |
| v2 endpoints documented          | ❌ Missing | Add `@swagger` JSDoc to every v2 controller. Currently only v1 is documented.                                                       |
| Request/response schemas in spec | ❌ Missing | `pnpm add @asteasolutions/zod-to-openapi`. Generate OpenAPI spec from existing Zod schemas.                                         |
| Typed frontend client from spec  | ❌ Missing | `pnpm add -D openapi-typescript openapi-fetch`. Generate typed client from OpenAPI spec. Replaces hand-written `axiosClient` calls. |
| API changelog (`CHANGELOG.md`)   | ❌ Missing | Document breaking changes per API version. Required for enterprise buyer integrations.                                              |

### 8.2 Error Handling

| Item                              | Status     | Implementation                                                                                                                                                                                     |
| --------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Global error handler              | ✅ Done    | `globalErrorHandler` in `errorHandler.ts`                                                                                                                                                          |
| Operational vs programmer error   | ✅ Done    | `AppError.isOperational`                                                                                                                                                                           |
| Stack traces hidden in production | ✅ Done    | `sendErrorProd` omits stack                                                                                                                                                                        |
| Machine-readable error codes      | ❌ Missing | Add `errorCode: string` to `AppError`. Examples: `CREDIT_INSUFFICIENT_BALANCE`, `PROJECT_NOT_FOUND`, `DUPLICATE_EMAIL`. Allows frontend to show contextual messages without parsing human strings. |
| Unhandled rejection handler       | 🔧 Partial | Express 5 propagates async errors. Add `process.on('unhandledRejection', (reason) => logger.error(reason))` in `server.ts`.                                                                        |
| 404 response shape                | ✅ Done    | `NotFound` middleware returns consistent JSON                                                                                                                                                      |

### 8.3 Versioning & Deprecation

| Item                                 | Status     | Implementation                                                                                   |
| ------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------ |
| v2 API active                        | ✅ Done    | `/api/v2`                                                                                        |
| v1 deprecation header                | ❌ Missing | Add `Deprecation: true` and `Sunset: Sat, 01 Nov 2026 00:00:00 GMT` headers to all v1 responses. |
| v1 removal milestone                 | ❌ Missing | Document in `README.md`: v1 removed 2026-11-01. Give 6 months notice.                            |
| Semantic versioning in API responses | ❌ Missing | Return `X-API-Version: 2.0.0` header on every v2 response.                                       |

---

## 9. Frontend — Pages & Flows

### 9.1 Missing Pages (complete list)

| Page                                    | Status     | Priority | Description                                                 |
| --------------------------------------- | ---------- | -------- | ----------------------------------------------------------- |
| `/marketplace`                          | ✅ Done    | P0       | Real project cards with filters, credit availability, price |
| `/marketplace/[projectId]`              | ✅ Done    | P0       | Project story, MRV proof, buy CTA, registry badges          |
| `/credits/purchase`                     | ✅ Done    | P0       | Checkout: quantity → currency → payment → confirmation      |
| `/portfolio`                            | ✅ Done    | P0       | Buyer's owned credits + retire flow                         |
| `/financials/payouts`                   | ✅ Done    | P1       | Project owner payout history                                |
| `/financials/contracts`                 | ✅ Done    | P1       | Contracts list + create form                                |
| `/compliance`                           | ✅ Done    | P1       | Audit trail, ESG reports, certificates                      |
| `/reports/esg`                          | ✅ Done    | P1       | Corporate buyer ESG dashboard + PDF download                |
| `/user-management`                      | ✅ Done    | P1       | User list with role assignment, deactivation                |
| `/notifications`                        | ✅ Done    | P1       | Full notification inbox, mark read, filters                 |
| `/data-collection`                      | ✅ Done    | P2       | Transaction log — credit purchases, retirements             |
| `/site-visits`                          | 🔧 Partial | P2       | Field visit scheduling, assignment, status                  |
| `/settings`                             | ❌ Missing | P2       | Platform config: fee %, currencies, email templates         |
| `/project-developers/[userId]/projects` | ❌ Missing | P1       | Projects belonging to a specific project owner              |
| `/forgot-password`                      | ✅ Done    | P1       | Request password reset email                                |
| `/reset-password`                       | ✅ Done    | P1       | Set new password from reset link                            |
| `/verify-email`                         | ❌ Missing | P1       | Email verification landing page                             |
| `/project-profile/[id]/credits`         | ❌ Missing | P1       | Credits issued for a specific project with buyer info       |

### 9.2 Notification System

| Item                                   | Status     | Implementation                                                                                                                                                                                    |
| -------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Notification bell in dashboard header  | ❌ Missing | `<NotificationBell />` component. `GET /api/v2/notifications?limit=5&status=unread`. Badge shows unread count. Dropdown shows latest 5.                                                           |
| Server-Sent Events (real-time)         | ❌ Missing | `GET /api/v2/notifications/stream` — SSE endpoint. Client subscribes on mount: `new EventSource('/api/v2/notifications/stream', { withCredentials: true })`. No extra package for SSE in Node.js. |
| Mark all as read                       | 🔧 Partial | Backend route exists, frontend button missing                                                                                                                                                     |
| Notification fire triggers             | ❌ Missing | Backend must fire notifications on: project stage change, credit issuance, payout created/completed/failed, document verified, KYC approved/rejected, contract signed                             |
| Email notification for critical events | ❌ Missing | On payout failure, KYC rejection, credit purchase — send email via `nodemailer` (queued via BullMQ)                                                                                               |
| Push notifications (PWA)               | ❌ Missing | Future: Web Push API with service worker. `pnpm add web-push`. Allow users to subscribe on dashboard.                                                                                             |

### 9.3 Landing Page & SEO

| Item                           | Status     | Implementation                                                                                                                          |
| ------------------------------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Landing page built             | ✅ Done    | `LANDING_PAGE_PROMPT.md` created, page at `/`                                                                                           |
| `metadata` export on all pages | ❌ Missing | Add `export const metadata: Metadata = { title, description, openGraph }` to every public-facing page                                   |
| `robots.txt`                   | ❌ Missing | `/public/robots.txt`: `Disallow: /dashboard`, `Disallow: /api`. Allow marketplace pages.                                                |
| `sitemap.xml`                  | ❌ Missing | `src/app/sitemap.ts` using Next.js 16 sitemap generator. Include all marketplace project pages.                                         |
| Structured data (schema.org)   | ❌ Missing | Add `<script type="application/ld+json">` with `schema.org/Product` on marketplace project pages. Improves search engine rich snippets. |
| Core Web Vitals                | ❌ Missing | Run Lighthouse CI on every PR. Target: LCP < 2.5s, CLS < 0.1, FID < 100ms. `pnpm add -D @lhci/cli`                                      |

---

## 10. Testing Coverage

### 10.1 Backend Test Coverage (current vs target)

| Module                  | Current | Target   | What to Add                                                                                 |
| ----------------------- | ------- | -------- | ------------------------------------------------------------------------------------------- |
| RBAC                    | ✅ ~80% | 90%      | Permission revocation, role deletion cascades                                               |
| Partners                | ✅ ~80% | 85%      | Status transition edge cases                                                                |
| Project Owners          | ✅ ~80% | 85%      | Buffered centroid rejection, assignment conflicts                                           |
| MRV Pipeline            | ✅ ~80% | 85%      | Simulation idempotency, flagged webhook handling                                            |
| Auth                    | ❌ 0%   | 90%      | Register, login, logout, duplicate email, invalid password, account lockout, password reset |
| Projects                | ❌ 0%   | 85%      | Create, activate, enroll farmer, enroll plot, marketplace query                             |
| Credits                 | ❌ 0%   | 90%      | Issue, purchase, split, retire, double-purchase prevention, insufficient balance            |
| Financials              | ❌ 0%   | 80%      | Payout creation on purchase, fee calculation, contract lifecycle                            |
| Storage                 | ❌ 0%   | 75%      | Presigned URL generation, path traversal prevention                                         |
| Integration (full flow) | ❌ 0%   | Required | Register → create project → simulate MRV → issue credits → purchase → payout created        |

### 10.2 Frontend Testing

| Item                    | Status     | Implementation                                                                                                                                                                                 |
| ----------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Component unit tests    | ❌ Missing | `pnpm add -D @testing-library/react @testing-library/user-event vitest jsdom`. Test: `RegisterForm`, `Step1_ProjectProfile`, `Step3_Documents`, `ProjectOwnerCard`.                            |
| E2E tests (Playwright)  | ❌ Missing | `pnpm add -D @playwright/test`. Critical path tests: (1) registration → login → create project → view MRV data, (2) marketplace browse → purchase credits, (3) project owner onboarding → KYC. |
| Accessibility tests     | ❌ Missing | `pnpm add -D axe-core @axe-core/playwright`. Run on all public pages. Target WCAG 2.1 AA.                                                                                                      |
| Visual regression tests | ❌ Missing | `pnpm add -D @playwright/test`. Screenshot comparison on key pages. Prevents accidental layout breaks.                                                                                         |

### 10.3 Test Data Management

| Item                                | Status     | Implementation                                                                                                                                                          |
| ----------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Test DB provisioned in CI           | 🔧 Partial | `TEST_DATABASE_URL` in vitest config. CI does not provision the DB. Add GitHub Actions `services.postgres` with PostGIS image.                                          |
| Factory functions for test fixtures | ❌ Missing | Create `src/tests/factories/` — functions that create minimal valid DB rows: `createTestUser()`, `createTestProject()`, `createTestCredit()`. Reduces test boilerplate. |
| Database teardown after each suite  | 🔧 Partial | Some suites clean up, others don't. Standardise: `afterAll(async () => { await cleanTestDb() })`                                                                        |

---

## 11. Monitoring & Observability

| Item                               | Status     | Implementation                                                                                                                                                                                 |
| ---------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Structured logging                 | ✅ Done    | Pino JSON logging                                                                                                                                                                              |
| Error logging to file              | ✅ Done    | Rotating file stream for 4xx+                                                                                                                                                                  |
| PII redaction in logs              | ❌ Missing | Pino `redact` config: `['body.password', 'body.email', '*.bankAccountNumber', '*.contactNumber']`                                                                                              |
| Application Performance Monitoring | ❌ Missing | **Sentry.** `pnpm add @sentry/node @sentry/profiling-node` (backend), `pnpm add @sentry/nextjs` (frontend). Captures: exceptions, slow transactions, P95 response times. Free tier sufficient. |
| Uptime monitoring                  | ❌ Missing | **BetterUptime** or **UptimeRobot** (free). Monitor: `/api/v2/health`, frontend URL. Alert on downtime via email + Slack.                                                                      |
| Custom business metrics            | ❌ Missing | Track in Sentry custom spans: credits issued per day, purchases per day, failed payouts, active users. Alert on anomalies (e.g. zero purchases for 24h).                                       |
| Database performance insights      | ❌ Missing | Enable `pg_stat_statements` extension. Review top 10 slow queries weekly via Render's database insights.                                                                                       |
| API response time dashboard        | ❌ Missing | Sentry Performance tab automatically shows P50/P95/P99 for every endpoint. No extra work once Sentry is integrated.                                                                            |
| Log aggregation                    | ❌ Missing | For production: ship Pino JSON logs to **Logtail** or **Datadog** (free tiers available). Enables log search and alerting. `pnpm add @logtail/node`                                            |
| Alerting on critical errors        | ❌ Missing | In Sentry: create alert rules for `error rate > 1%`, `P95 response time > 500ms`, `unhandled exception in credits module`. Notify via email or Slack webhook.                                  |

---

## 12. Data Privacy & Regulatory

### 12.1 GDPR (European buyers)

| Item                            | Status     | Implementation                                                                                                                                                                                                      |
| ------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Data export endpoint            | ❌ Missing | `GET /api/v2/users/me/export` — returns full JSON of user's data: profile, projects, credits, transactions, payouts. Required by GDPR Article 20.                                                                   |
| Right to erasure                | ❌ Missing | `DELETE /api/v2/users/me` — soft-delete user, anonymise PII: `email → deleted_{id}@deleted.invalid`, `firstName → Deleted`, `lastName → User`. Financial records retained (legal requirement).                      |
| Cookie consent banner           | ❌ Missing | Frontend: non-dismissible banner on first visit. Options: "Accept all", "Essential only". Store preference in `localStorage`. Only load analytics scripts after consent. `pnpm add cookie-consent` or build custom. |
| Privacy policy page             | 🔧 Partial | Page exists at `/privacy`. Ensure it references: data retention periods (7 years for financial), data residency (Render region), third parties (CraftedClimate, Stripe, Paystack).                                  |
| Data processing agreement (DPA) | ❌ Missing | Required for GDPR when processing EU citizens' data. Document that Render (data processor) has a DPA with Foovante Global.                                                                                          |

### 12.2 Ghana Data Protection Act (2012)

| Item                                         | Status     | Implementation                                                                                                  |
| -------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------- |
| Data subject rights                          | ❌ Missing | Same as GDPR export + erasure — covers Ghanaian users under the Act                                             |
| Registration with Data Protection Commission | ❌ Missing | Foovante Global must register as a data controller with Ghana's DPC before launch. This is a legal requirement. |
| Data localisation                            | ❌ Missing | The Act does not mandate data must stay in Ghana, but document your data flows clearly in the privacy policy.   |

### 12.3 KYC / AML Compliance

| Item                                   | Status     | Implementation                                                                                                                                                                         |
| -------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| KYC status field                       | ✅ Done    | `project_owner.verificationStatus: pending/verified/rejected`                                                                                                                          |
| Manual KYC review by admin             | 🔧 Partial | Admin can update verification status. No structured review workflow.                                                                                                                   |
| Automated KYC (Smile Identity)         | ❌ Missing | **Smile Identity** for African users (Ghana card, Kenya ID, Nigeria BVN). REST API integration. `pnpm add @smile-identity/server-side-sdk`. Store `kyc_provider_ref` on project owner. |
| Global KYC (Sumsub)                    | ❌ Missing | For non-African international project owners. REST API.                                                                                                                                |
| AML transaction screening              | ❌ Missing | For credit purchases above USD 1,000: run buyer through Stripe Radar (built into Stripe) or Comply Advantage API.                                                                      |
| Credit purchase limits before full KYC | ❌ Missing | Block purchases >USD 500 if buyer's KYC is `pending`. Enforce in `CreditService.purchaseCarbonCredit()`.                                                                               |

### 12.4 Application-Layer Encryption

| Item                                   | Status     | Implementation                                                                                                                                                                                                      |
| -------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TLS in transit                         | ✅ Done    | Render + Vercel enforce HTTPS                                                                                                                                                                                       |
| At-rest encryption                     | ✅ Done    | Render PostgreSQL encrypts at rest by default                                                                                                                                                                       |
| Sensitive field encryption (app layer) | ❌ Missing | `bankAccountNumber`, `momoNumber`, `national_id` document paths: encrypt before DB insert using `crypto.createCipheriv('aes-256-gcm', key, iv)`. Decrypt on read. Store key in `ENCRYPTION_KEY` env var (32 bytes). |
| PII in logs prevention                 | ❌ Missing | Pino `redact` config (see Section 11). Never log `email`, `contactNumber`, `bankAccountNumber`.                                                                                                                     |

---

## 13. Internationalisation & Accessibility

### 13.1 Internationalisation (i18n)

| Item                        | Status     | Implementation                                                                                                                                                                                      |
| --------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Multi-language support      | ❌ Missing | **Phase 5.** Package: `pnpm add next-intl`. Priority languages: English (default), French (West Africa / EU buyers), Swahili (East Africa). All UI strings must be extracted to `messages/en.json`. |
| Locale routing              | ❌ Missing | `next-intl` supports `/en/dashboard`, `/fr/tableau-de-bord`. Add `middleware.ts` for locale detection and redirect.                                                                                 |
| Currency display formatting | 🔧 Partial | Currencies are stored as codes (USD, GHS). All monetary values must use `Intl.NumberFormat` with the correct locale and currency for display.                                                       |
| Date/time formatting        | ❌ Missing | All dates must use `Intl.DateTimeFormat` with the user's locale. Never hardcode `en-GB` format.                                                                                                     |
| Right-to-left (RTL) support | ❌ Missing | Not required for current markets, but Tailwind CSS supports `rtl:` variant. Add `dir="ltr"` on `<html>` now to make future RTL migration easier.                                                    |
| Number formatting           | ❌ Missing | tCO₂e values: always use `Intl.NumberFormat` with appropriate decimal precision. Never use `.toFixed()` directly in JSX.                                                                            |

### 13.2 Accessibility (WCAG 2.1 AA)

| Item                             | Status     | Implementation                                                                                                                                                       |
| -------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Semantic HTML                    | 🔧 Partial | Most components use `div`. Replace with: `<nav>`, `<main>`, `<section>`, `<article>`, `<header>`, `<footer>`.                                                        |
| Keyboard navigation              | 🔧 Partial | shadcn/ui components are keyboard accessible. Custom components need audit. All interactive elements must be reachable via `Tab` and actionable via `Enter`/`Space`. |
| ARIA labels on icon-only buttons | ❌ Missing | All icon-only buttons (`<Button size="icon">`) need `aria-label`. Example: `<Button aria-label="Refresh project list">`.                                             |
| Focus visible styles             | 🔧 Partial | Tailwind `focus-visible:ring-2` present on some components. Audit all interactive elements.                                                                          |
| Colour contrast (4.5:1 minimum)  | 🔧 Partial | Brand green `#2CC295` on white: contrast ratio ~2.6:1 — **fails WCAG AA for small text.** Use `#178a74` (darker green) for text on white backgrounds.                |
| Screen reader announcements      | ❌ Missing | Dynamic content changes (toast, modal open, data load) need `aria-live="polite"` regions.                                                                            |
| Form error associations          | 🔧 Partial | Most form errors are rendered below inputs. Add `aria-describedby` linking input to its error message element.                                                       |
| Images have meaningful alt text  | 🔧 Partial | `next/image` alt prop present. Ensure descriptive text, not just "image".                                                                                            |
| Automated accessibility testing  | ❌ Missing | `pnpm add -D axe-core @axe-core/playwright`. Run on every PR. Zero critical violations required before merge.                                                        |
| Skip to main content link        | ❌ Missing | Add visually hidden `<a href="#main-content">Skip to main content</a>` as first element in layout. Required for screen reader users.                                 |

---

## 14. Carbon Calculator

> The carbon calculator page exists at `/carbon-calculator` but is entirely hardcoded with mock data. In v2, it must connect to real project data and the MRV verification results.

| Item                                | Status     | Implementation                                                                                                                                                                                                                                                                      |
| ----------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Calculator page exists              | 🔧 Partial | Route exists, UI built, data is hardcoded                                                                                                                                                                                                                                           |
| Connect to real project data        | ❌ Missing | Fetch `GET /api/v2/projects?createdBy={userId}` to populate the project selector dropdown                                                                                                                                                                                           |
| Connect to MRV verification results | ❌ Missing | Fetch `GET /api/v2/mrv/verifications/project/{projectId}` to show actual `net_credits_issued` vs the calculator's estimate                                                                                                                                                          |
| Pre-registration estimate mode      | ❌ Missing | Before a project is registered: user inputs land area, project type, country → calculator returns a rough tCO₂e estimate based on lookup tables. This is marketing-facing and does not require MRV.                                                                                 |
| Post-registration verified mode     | ❌ Missing | After project has MRV data: show side-by-side comparison of estimated vs CraftedClimate verified credits. Highlight the `buffer_contribution` and `leakage_deduction`.                                                                                                              |
| Emissions baseline input            | ❌ Missing | For corporate buyers: input current annual emissions (tCO₂e) → calculator shows how many Crevy credits needed to offset Scope 1/2/3. Shows cost at current market price.                                                                                                            |
| Calculator results shareable        | ❌ Missing | "Share estimate" button generates a `/calculator/results/{hash}` URL with the parameters encoded. Useful for buyers to share with their finance team.                                                                                                                               |
| Backend estimate endpoint           | ❌ Missing | `POST /api/v2/calculator/estimate` — body: `{ projectType, areaHectares, country }`. Returns `{ estimatedTco2e, estimatedCredits, estimatedRevenue, methodology }`. Based on published IPCC lookup tables per land use type. No external API needed — static table in the codebase. |

---

## 15. Marketplace Search & Discovery

> At 10,000 users, a basic PostgreSQL `ILIKE` search on the marketplace will be slow. A dedicated search service is required.

| Item                                         | Status     | Implementation                                                                                                                                                                                                                                                             |
| -------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | --------------------------------------- | --- | ----------------------------- |
| Basic text search (PostgreSQL)               | 🔧 Partial | `ilike` on project name. Works for pilot.                                                                                                                                                                                                                                  |
| Full-text search on project descriptions     | ❌ Missing | PostgreSQL `tsvector` + `tsquery` on `project.name`, `project.description`, `project.projectTags`. Add `CREATE INDEX idx_project_fts ON project USING GIN(to_tsvector('english', name                                                                                      |                | ' '                                     |     | COALESCE(description, '')))`. |
| Dedicated search engine (Phase 4)            | ❌ Missing | **Meilisearch** (self-hosted, open source) or **Typesense** (simpler API). Both have Node.js SDKs. Package: `pnpm add meilisearch`. Sync projects to Meilisearch index on create/update via BullMQ job. Frontend calls Meilisearch directly for instant search (sub-50ms). |
| Filters: sector, type, country, SDG, vintage | ❌ Missing | Build filter UI in marketplace page. Each filter maps to a backend query param.                                                                                                                                                                                            |
| Sort: newest, most credits, lowest price     | ❌ Missing | Add `sortBy: 'newest'                                                                                                                                                                                                                                                      | 'credits_desc' | 'price_asc'`to`ListProjectsQuerySchema` |
| Faceted filter counts                        | ❌ Missing | Show "(12)" next to each filter option. Requires an aggregation query: `SELECT sector, COUNT(*) FROM project WHERE status='active' GROUP BY sector`                                                                                                                        |
| Marketplace project cards — SEO              | ❌ Missing | Each project on the marketplace must have a canonical URL and be crawlable by search engines. Add `<Link prefetch>` and `metadata` export to `/marketplace/[projectId]`.                                                                                                   |
| "Related projects" section                   | ❌ Missing | After a buyer purchases credits, show: "Other projects in Ghana" or "Other regenerative agriculture projects". Simple SQL: `WHERE sector = current AND id != current LIMIT 3`.                                                                                             |

---

## 16. Outbound Webhooks & Buyer API

> Corporate buyers (enterprise customers) need programmatic access to their portfolio. This is table-stakes for international enterprise sales.

| Item                          | Status     | Implementation                                                                                                                                                                                                                                                                            |
| ----------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Buyer API key management      | ❌ Missing | `POST /api/v2/api-keys` — generates a long-lived API key for programmatic access. Store hashed in DB (`api_key` table: `id`, `user_id`, `key_hash`, `name`, `last_used_at`, `created_at`). Authenticate via `Authorization: Bearer {apiKey}` header as an alternative to session cookies. |
| Outbound webhook registration | ❌ Missing | `POST /api/v2/webhooks` — buyers register a URL to receive events. Store in `webhook_subscription` table: `user_id`, `url`, `secret`, `events[]` (e.g. `credit.purchased`, `credit.retired`, `payout.completed`).                                                                         |
| Webhook delivery              | ❌ Missing | On events, queue a BullMQ job that POSTs the payload to each subscriber's URL. Sign with HMAC-SHA256 of payload + subscriber's secret. Retry on non-2xx with exponential backoff.                                                                                                         |
| Webhook delivery logs         | ❌ Missing | `webhook_delivery_log` table: `subscription_id`, `event`, `payload`, `response_status`, `attempt`, `delivered_at`. API: `GET /api/v2/webhooks/{id}/deliveries`.                                                                                                                           |
| Partner API documentation     | ❌ Missing | Dedicated `/api-docs/partners` page. Covers: authentication, webhook events, rate limits, pagination. Required for enterprise buyer integrations.                                                                                                                                         |

---

## 17. Mobile Readiness

> The majority of project owners in the field will access Crevy on mobile. The current app is responsive but not optimised for field use.

### 17.1 Progressive Web App (PWA)

| Item                  | Status     | Implementation                                                                                                                                                                 |
| --------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| PWA manifest          | ❌ Missing | `public/manifest.json`: `name`, `short_name`, `icons`, `theme_color: #2CC295`, `background_color: #131927`, `display: standalone`. Add `<link rel="manifest">` to root layout. |
| Service worker        | ❌ Missing | `pnpm add next-pwa`. Caches: dashboard page, marketplace listings, project profiles. Allows offline viewing of previously visited pages.                                       |
| Install prompt        | ❌ Missing | Show "Add to Home Screen" banner after 3rd visit. Use `beforeinstallprompt` event.                                                                                             |
| Push notifications    | ❌ Missing | Web Push API with service worker. Allow project owners to subscribe. Use `web-push` package.                                                                                   |
| Offline fallback page | ❌ Missing | Service worker shows `/offline` page when request fails and cache miss occurs.                                                                                                 |

### 17.2 Mobile UX

| Item                               | Status     | Implementation                                                                                                                                                                            |
| ---------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile-first design                | ✅ Done    | Tailwind mobile-first breakpoints used throughout                                                                                                                                         |
| Touch targets ≥ 44px               | 🔧 Partial | Most buttons are large enough. Audit small icon buttons and filter chips.                                                                                                                 |
| Bottom navigation on mobile        | ❌ Missing | The current sidebar collapses to a hamburger. Consider a bottom tab bar for mobile: Dashboard, Projects, Marketplace, Notifications, Profile. Much faster to reach with thumbs.           |
| GPS coordinate capture             | ❌ Missing | Farm plot registration: "Use my location" button calls `navigator.geolocation.getCurrentPosition()` and fills `latitude/longitude` fields automatically. Critical for field registration. |
| Camera upload for documents        | ❌ Missing | `Step3_Documents` file input should include `accept="image/*" capture="environment"` for mobile users to take photos of documents directly.                                               |
| Offline project registration draft | ❌ Missing | Save form state to `localStorage` periodically. If connection drops mid-form, user can resume.                                                                                            |

---

## 18. Disaster Recovery & Business Continuity

| Item                           | Status     | Implementation                                                                                                                                                                                                     |
| ------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Recovery Time Objective (RTO)  | ❌ Missing | Define and document: target RTO = 2 hours (time to restore service after failure).                                                                                                                                 |
| Recovery Point Objective (RPO) | ❌ Missing | Define and document: target RPO = 24 hours (max data loss). Daily backups satisfy this.                                                                                                                            |
| Backup restore testing         | ❌ Missing | Monthly calendar reminder: restore last night's DB backup to a throwaway instance. Verify row counts match.                                                                                                        |
| Runbook: database failure      | ❌ Missing | Document: (1) Render sends alert, (2) check Render dashboard, (3) if instance failed — redeploy, (4) if data corruption — restore from backup, (5) contact Render support. Store in `docs/runbooks/db-failure.md`. |
| Runbook: backend service down  | ❌ Missing | (1) UptimeRobot alerts, (2) check Render logs for crash reason, (3) rollback to previous deploy if new code caused it, (4) fix and redeploy. Store in `docs/runbooks/service-down.md`.                             |
| Runbook: R2 storage outage     | ❌ Missing | Documents served from R2 will return 404. (1) Inform users via status page, (2) wait for Cloudflare R2 restoration (SLA: 99.9%), (3) if long outage — temporarily serve from DB base64 fallback.                   |
| Multi-region failover plan     | ❌ Missing | Future (Phase 5): replicate DB to a second region. Use Render's multi-region DB replication. Update DNS to point to healthy region within 5 min.                                                                   |
| Status page                    | ❌ Missing | Public `status.crevy.io` showing system health. Use **Instatus** or **Betterstack** (free tiers). Incidents automatically reflect from UptimeRobot.                                                                |
| Incident post-mortems          | ❌ Missing | After every P1 incident: write a blameless post-mortem in `docs/incidents/`. Template: timeline, root cause, impact, action items.                                                                                 |

---

## 19. Load Testing & Performance Benchmarks

> Before public launch, verify the system handles 10,000 concurrent users without degradation.

| Item                              | Status     | Implementation                                                                                                                                                                                                         |
| --------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Load testing tool                 | ❌ Missing | **k6** (Grafana open source). `pnpm add -g k6`. Define scenarios in `tests/load/`.                                                                                                                                     |
| Baseline benchmark                | ❌ Missing | Measure current P95 response time with 1 concurrent user for: marketplace list, project detail, credit purchase. Store as baseline.                                                                                    |
| Ramp-up test                      | ❌ Missing | k6 scenario: ramp from 0 → 1,000 users over 5 min, hold 10 min, ramp down. Target: P95 < 200ms, 0 errors.                                                                                                              |
| Spike test                        | ❌ Missing | k6: instantly jump to 5,000 users for 2 min. Target: server recovers within 30s of spike, P95 < 500ms during spike.                                                                                                    |
| Soak test                         | ❌ Missing | k6: 500 concurrent users for 2 hours. Check for: memory leaks, DB connection pool exhaustion, Redis connection leaks.                                                                                                  |
| Credit purchase under load        | ❌ Missing | k6 scenario: 100 simultaneous credit purchases of the same `carbon_credit` row. Verify: exactly the available amount is sold, no overselling, DB constraint never violated, all transactions complete or cleanly fail. |
| Redis session cache effectiveness | ❌ Missing | Profile: `requireAuth` with and without Redis cache. Measure DB calls per second reduction. Target: ≥80% of session lookups served from Redis (not Postgres).                                                          |
| Bottleneck report                 | ❌ Missing | After each k6 run: document the top 3 bottlenecks found. Fix before the next test run. Iterate until targets are met.                                                                                                  |

```javascript
// tests/load/marketplace.js — example k6 scenario
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "2m", target: 100 }, // ramp up
    { duration: "5m", target: 1000 }, // stay at 1000
    { duration: "2m", target: 0 }, // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<200"], // 95% of requests < 200ms
    http_req_failed: ["rate<0.01"], // < 1% error rate
  },
};

export default function () {
  const res = http.get("https://api.crevy.io/api/v2/projects/marketplace");
  check(res, { "status is 200": (r) => r.status === 200 });
  sleep(1);
}
```

---

## 20. Priority Build Order

### 🔴 Phase 1 — Security Foundation (Week 1–2) — MUST DO BEFORE LAUNCH

```
[ ] Backend: pnpm add helmet → app.use(helmet()) in src/index.ts
[ ] Backend: pnpm add express-rate-limit rate-limit-redis → rate limit all routes
[ ] Backend: pnpm add compression → app.use(compression())
[ ] Backend: pnpm add hpp → app.use(hpp())
[ ] Backend: Redis session caching for requireAuth (eliminates Postgres bottleneck)
[ ] Backend: Account lockout after 5 failed login attempts (Redis counter)
[ ] Backend: Email verification enabled in better-auth + nodemailer + BullMQ email queue
[ ] Backend: Password strength enforced: min 8 chars, 1 uppercase, 1 number, 1 symbol
[ ] Backend: Audit log table + middleware on credit issuance, purchases, approvals
[ ] Backend: PII redaction in Pino logger (redact: email, password, bankAccountNumber)
[ ] Backend: Replay protection on MRV webhooks (timestamp > 5 min reject)
[ ] Frontend: next.config.ts security headers (X-Frame-Options, CSP, HSTS)
[ ] Frontend: Axios interceptor — auto-redirect to /login on 401
[ ] Frontend: BroadcastChannel logout sync across tabs
[ ] Frontend: /forgot-password and /reset-password pages
[ ] Both: pnpm audit → fix all high/critical severity vulnerabilities
[ ] Both: GitHub Actions CI pipeline (lint + test + build on every PR)
```

### 🟠 Phase 2 — Carbon Market Core (Week 2–4)

```
[ ] Backend: GET /api/v2/projects/marketplace (public, filtered, paginated, with credit quantities)
[ ] Backend: Auto-create payout + platform fee inside CreditService.purchaseCarbonCredit() transaction
[ ] Backend: PLATFORM_FEE_PCT env var in settings.ts
[ ] Backend: Verra registry API integration (POST issuances, POST retirements)
[ ] Backend: emission_scope field on carbon_credit (Scope 1/2/3)
[ ] Backend: ESG report PDF generation endpoint (pdfkit)
[ ] Backend: Certificate of retirement PDF generation
[ ] Backend: BullMQ job queue (email, payout, pdf, registry queues)
[ ] Backend: Mobile money payout integration (Hubtel)
[ ] Backend: POST /api/v2/calculator/estimate endpoint
[ ] Frontend: /marketplace page — real project cards, filters, credit availability
[ ] Frontend: /marketplace/[projectId] — project detail + buy CTA + registry badges
[ ] Frontend: Credit purchase checkout flow (quantity → currency → payment → confirm)
[ ] Frontend: /portfolio — buyer's owned credits + retirement flow
[ ] Frontend: /financials/payouts — project owner payout history
[ ] Frontend: /carbon-calculator — connected to real project data + MRV results
[ ] Frontend: Notification bell + real-time SSE
```

### 🟡 Phase 3 — Compliance & Reporting (Week 4–6)

```
[ ] Backend: Stripe payment gateway integration + webhook handler
[ ] Backend: Paystack payment gateway integration + webhook handler
[ ] Backend: Immutable audit log table + middleware
[ ] Backend: GDPR data export endpoint (GET /api/v2/users/me/export)
[ ] Backend: GDPR right to erasure (DELETE /api/v2/users/me)
[ ] Backend: Smile Identity KYC integration for African project owners
[ ] Backend: Credit purchase blocked if buyer KYC = pending AND amount > $500
[ ] Backend: Outbound webhook registration + delivery for enterprise buyers
[ ] Frontend: /compliance page — audit trail view, verification history
[ ] Frontend: /reports/esg — corporate buyer ESG dashboard + PDF download
[ ] Frontend: Cookie consent banner (GDPR)
[ ] Frontend: Privacy policy updated with data flows
[ ] Frontend: GPS "use my location" on farm plot registration
[ ] Frontend: Document template downloads (consent, site access)
```

### 🟢 Phase 4 — Scale & Reliability (Week 6–8)

```
[ ] Infrastructure: Staging environment on Render (separate DB)
[ ] Infrastructure: Automated daily PostgreSQL backups + monthly restore test
[ ] Infrastructure: Read replica for SELECT queries
[ ] Infrastructure: PgBouncer connection pooling
[ ] Infrastructure: Status page (Instatus or BetterStack)
[ ] Backend: Sentry error monitoring + performance tracing
[ ] Backend: Meilisearch integration for marketplace full-text search
[ ] Backend: price_history table + price chart on project pages
[ ] Frontend: Sentry for React error boundaries
[ ] Frontend: PWA manifest + service worker (next-pwa)
[ ] Frontend: SEO metadata on all public pages + sitemap.xml + robots.txt
[ ] Frontend: Structured data (schema.org/Product) on marketplace pages
[ ] Frontend: Core Web Vitals CI check (Lighthouse CI)
[ ] Both: Full test coverage — auth, credits, financials, E2E Playwright
[ ] Both: k6 load test — 1,000 concurrent users, P95 < 200ms
```

### 🔵 Phase 5 — International Market Positioning (Week 8–12)

```
[ ] KYC: Sumsub integration for non-African international project owners
[ ] Registry: Gold Standard API integration
[ ] Regulatory: Register with Ghana Data Protection Commission
[ ] i18n: Extract all UI strings to messages/en.json via next-intl
[ ] i18n: French translation for West African / EU markets
[ ] Accessibility: WCAG 2.1 AA audit + axe-core zero critical violations
[ ] Payment: Flutterwave bank transfer disbursement
[ ] API: Full OpenAPI v2 spec from Zod schemas (zod-to-openapi)
[ ] API: Typed frontend client from OpenAPI spec (openapi-typescript)
[ ] Performance: k6 soak test — 500 users × 2 hours, no memory leaks
[ ] Performance: k6 spike test — 5,000 users, server recovers within 30s
[ ] Docs: Runbooks for DB failure, service down, R2 outage
[ ] Mobile: PWA push notifications (web-push)
[ ] Mobile: Bottom navigation tab bar for mobile viewport
[ ] Multi-region: Render multi-region DB replication plan documented
```

---

## 21. Dependency Reference

All packages referenced in this document:

```bash
# ── Backend: Security ─────────────────────────────────────────────────────────
pnpm add helmet                           # HTTP security headers (CSP, HSTS, X-Frame-Options)
pnpm add express-rate-limit               # Rate limiting middleware
pnpm add rate-limit-redis                 # Redis store for rate limiter
pnpm add hpp                              # HTTP Parameter Pollution protection
pnpm add xss                              # Input sanitisation (HTML entities)
pnpm add compression @types/compression  # Gzip response compression

# ── Backend: Auth & Identity ──────────────────────────────────────────────────
pnpm add nodemailer @types/nodemailer     # SMTP email transport
pnpm add @smile-identity/server-side-sdk  # African KYC (Smile Identity)

# ── Backend: Jobs & Queues ────────────────────────────────────────────────────
pnpm add bullmq                           # Redis-backed job queue
pnpm add @bull-board/express              # BullMQ admin dashboard

# ── Backend: Payments ─────────────────────────────────────────────────────────
pnpm add stripe                           # Stripe payment gateway
pnpm add paystack                         # Paystack (Africa)

# ── Backend: PDF & Reporting ──────────────────────────────────────────────────
pnpm add pdfkit @types/pdfkit            # PDF generation

# ── Backend: Search ───────────────────────────────────────────────────────────
pnpm add meilisearch                      # Full-text search engine client

# ── Backend: Monitoring ───────────────────────────────────────────────────────
pnpm add @sentry/node @sentry/profiling-node  # Error tracking + performance
pnpm add @logtail/node                    # Log aggregation (Logtail/BetterStack)

# ── Backend: API Docs ─────────────────────────────────────────────────────────
pnpm add @asteasolutions/zod-to-openapi   # Generate OpenAPI spec from Zod schemas

# ── Frontend: Security ────────────────────────────────────────────────────────
pnpm add dompurify @types/dompurify       # HTML sanitisation before render

# ── Frontend: PWA ─────────────────────────────────────────────────────────────
pnpm add next-pwa                         # Next.js Progressive Web App support
pnpm add web-push @types/web-push        # Web Push notifications

# ── Frontend: i18n ────────────────────────────────────────────────────────────
pnpm add next-intl                        # Internationalisation for Next.js

# ── Frontend: Monitoring ──────────────────────────────────────────────────────
pnpm add @sentry/nextjs                   # Frontend error tracking + performance

# ── Frontend: Dev & Testing ───────────────────────────────────────────────────
pnpm add -D @next/bundle-analyzer         # Bundle size analysis
pnpm add -D @testing-library/react @testing-library/user-event  # Component tests
pnpm add -D @playwright/test              # E2E browser tests
pnpm add -D axe-core @axe-core/playwright # Accessibility testing in Playwright
pnpm add -D @lhci/cli                     # Lighthouse CI (Core Web Vitals)
pnpm add -g k6                            # Load testing (install globally)

# ── Frontend: API Client ─────────────────────────────────────────────────────
pnpm add -D openapi-typescript openapi-fetch  # Typed API client from OpenAPI spec
```

---

## Quick Reference: Status Summary by Domain

| Domain                  | ✅ Done | 🔧 Partial | ❌ Missing | Priority    |
| ----------------------- | ------- | ---------- | ---------- | ----------- |
| Security — Backend      | 3       | 8          | 22         | 🔴 Critical |
| Security — Frontend     | 4       | 5          | 8          | 🔴 Critical |
| Carbon Market Standards | 5       | 2          | 8          | 🔴 Critical |
| Credit Lifecycle        | 3       | 3          | 14         | 🟠 High     |
| Performance & Caching   | 3       | 6          | 14         | 🟠 High     |
| Frontend Pages          | 8       | 6          | 12         | 🟠 High     |
| Testing                 | 4       | 3          | 10         | 🟠 High     |
| Infrastructure          | 5       | 4          | 8          | 🟡 Medium   |
| Monitoring              | 2       | 0          | 8          | 🟡 Medium   |
| Data Privacy            | 3       | 2          | 10         | 🟡 Medium   |
| i18n & Accessibility    | 2       | 5          | 9          | 🟡 Medium   |
| Carbon Calculator       | 1       | 1          | 6          | 🟡 Medium   |
| Marketplace Search      | 1       | 1          | 6          | 🟢 Low      |
| Buyer API & Webhooks    | 0       | 0          | 5          | 🟢 Low      |
| Mobile / PWA            | 2       | 3          | 8          | 🟢 Low      |
| Disaster Recovery       | 0       | 0          | 10         | 🟢 Low      |
| Load Testing            | 0       | 0          | 8          | 🟢 Low      |
| **TOTAL**               | **46**  | **49**     | **166**    |             |

> **261 total items.** 46 done (17%), 49 partial (19%), 166 to build (64%).
> Completing all 🔴 Critical items (Phases 1 + 2) brings Crevy to a secure, internationally-viable state.
> Completing Phases 1–4 qualifies the platform for Verra/Gold Standard marketplace listing.
> Completing all 5 phases positions Crevy as a best-in-class African carbon markets infrastructure platform.

---

_Checklist prepared: May 2026 · Crevy Platform · Foovante Global_
_Based on full codebase audit of crevy-backend (v2) and crevy-frontend._
_Follow the Priority Build Order section (§20) to reach international launch readiness._
