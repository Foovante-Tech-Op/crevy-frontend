# Crevy Design Inspiration Map

This document maps each inspiration resource to the Crevy pages where it should influence the experience. The goal is not to copy visual treatments literally, but to translate each reference into Crevy’s product language: scientific trust, African project storytelling, institutional-grade carbon markets, and memorable “wow” moments.

## Product Surfaces Studied

### Existing frontend pages

- Public brand: `/`, `/about-us`, `/support`, `/methodology`, `/public-registry`
- Marketplace: `/marketplace`, `/marketplace/[id]`, `/marketplace/checkout`, `/marketplace/success`
- Auth and onboarding: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/admins/setup-account`, `/auth/invite/verify/[token]`, `/new-project`, `/project-developers/register`
- Dashboards: `/dashboard`, `/projects`, `/projects/[id]`, `/project-developers`, `/project-developers/[userId]`
- Institutional buyer: `/portfolio`, `/portfolio/retire/[batchId]`, `/compliance`, `/credits/purchase`
- Operations and admin: `/track-verification`, `/carbon-credits`, `/financials`, `/financials/contracts`, `/financials/payouts`, `/user-management`, `/profile`, `/notifications`
- Placeholder or underbuilt pages: `/data-collection`, `/site-visits`, `/projects/new`, `/projects/[id]/telemetry`, `/projects/[id]/audit-log`

### Backend-inferred pages to design next

- MRV telemetry console from `/api/v2/mrv/ingestions`, `/verifications/project/:projectId`, `/anchors/project/:projectId`
- Audit ledger from `/api/v2/audit`
- ESG report history from `/api/v2/reports/esg/history`
- Retirement certificate history from `/api/v2/reports/certificates/history`
- Credit transaction detail from `/api/v2/credits/transactions/:id`
- Credit verification detail from `/api/v2/credits/verifications/:id`
- Partner management from `/api/v2/partners`
- Role and permissions management from `/api/v2/rbac`
- Notification center from `/api/v2/notifications`
- Farm plot and site visit management from `/api/v2/farm-plots`, `/api/v2/project-owner-assignments`

---

- For Buyer Dashboard inspo - https://dribbble.com/shots/27216264-GreenLedger-Enterprise-ESG-Carbon-Tracking-Dashboard - https://dribbble.com/shots/24851190-Carbon-Footprint-Reduction-SaaS-Application
- For Project Owner - Internals - https://dribbble.com/shots/18781231-CX2-Carbon-Credit-Platform-Website
- Landing page - https://dribbble.com/shots/25271958-Case-Study-Superly-Identity-and-Website-Design

## Marketplace

### Observable — observablehq.com

**Steal**

- Interactive project maps that let visitors explore geography, scale, project density, and impact.
- Vintage timelines that make carbon credit issuance feel historical, traceable, and alive.
- Transparent methodology notes that explain complex science without making the interface feel academic.

**Use on existing pages**

- `/marketplace` — add an “Impact Map” view beside grid/list view, with projects clustered by country, region, sector, available credits, and price.
- `/marketplace/[id]` — show a project-specific map with plot boundaries, project centroid, vintage milestones, and verification anchors.
- `/methodology` — convert static methodology copy into an explorable visual method notebook: data sources, dMRV pipeline, confidence scores, chain-of-custody.
- `/public-registry` — add registry timelines for every listed credit batch: registered, monitored, verified, issued, listed, purchased, retired.
- `/projects/[id]` — give admins/project owners an internal project timeline showing documents, MRV events, status changes, activities, and credit issuance.
- `/track-verification` — represent the verification queue as an interactive pipeline instead of a flat list.

**Use on pages to come**

- MRV telemetry console — map live sensor ingestions, webhook events, verification outcomes, and blockchain anchors by project/plot.
- Audit ledger — make audit trails filterable by actor, project, event type, and timestamp with an elegant event stream.
- Credit batch detail page — show vintage lineage, serial ranges, price history, ownership changes, and retirement state.
- Methodology deep-dive pages — one page per standard/methodology, with explorable diagrams rather than dense text.

---

### Pudding.cool — pudding.cool

**Steal**

- Scroll-led storytelling that guides a buyer from “total tonnes retired” into the individual project story.
- Narrative transitions where charts, maps, and text reveal context one idea at a time.
- Humanized data: a buyer should understand not only how many credits exist, but why the project matters.

**Use on existing pages**

- `/` — turn the landing page into a stronger narrative journey: climate challenge → African project opportunity → verified credits → institutional reporting.
- `/marketplace/[id]` — build a scroll story: land context, farmer/community, practices, dMRV proof, credits available, purchase CTA.
- `/about-us` — frame Crevy’s mission with a cinematic timeline and founder/platform story instead of only static sections.
- `/portfolio` — tell the buyer’s impact story from purchased credits to retired credits to verified institutional outcomes.
- `/compliance` — guide institutional users from emissions footprint to offsets, report status, certificate proof, and audit readiness.
- `/portfolio/retire/[batchId]` — make retirement feel ceremonial: “you are turning inventory into proof,” with a final certificate reveal.
- `/marketplace/success` — replace a simple success state with an impact receipt: project, tonnes, vintage, certificate path, next reporting action.

**Use on pages to come**

- ESG report detail page — narrative report viewer that explains Scope 1/2/3, removals, retired credits, and methodology proof.
- Retirement certificate gallery — buyer-facing story archive of all retirements, grouped by year, project, and impact theme.
- Public impact stories — editorial project pages that can be shared outside the logged-in dashboard.
- Buyer onboarding flow — teach companies how to buy, retire, and report credits without dumping them into a dashboard cold.

---

### National Geographic Data Graphics — nationalgeographic.com

**Steal**

- Earthy palettes, deep blues, crisp whites, and restrained contrast that signal “science-backed,” not gimmicky green.
- Clear typography pairing and disciplined information hierarchy.
- Data graphics that feel trustworthy, field-tested, and editorial.

**Use on existing pages**

- `/` — refine the landing visual system so sustainability feels premium and scientific, not generic eco-tech.
- `/methodology` — use editorial infographics for dMRV, AI verification, standards compliance, additionality, and permanence.
- `/public-registry` — make registry records feel like a credible public institution with crisp tables, evidence cards, and careful color coding.
- `/carbon-calculator` — redesign calculator outputs as scientific panels: emissions categories, assumptions, uncertainty, recommendations.
- `/compliance` — align ESG charts with an audit-grade visual tone; avoid colorful dashboard clutter.
- `/track-verification` — use calm status colors and visual confidence indicators for verification stages.
- `/projects/[id]` — present project metadata, SDGs, activities, documents, and credit status with an editorial science layout.

**Use on pages to come**

- ESG report viewer/history — visual language should match the “Monolithic Integrity” PDF philosophy from the backend docs.
- Retirement certificate detail — turn each certificate into a high-trust artifact with serial ranges, vintage, tx hash, and project facts.
- Methodology evidence library — searchable educational pages for standards, verification logic, and partner data sources.
- MRV verification detail — explain sensor readings and AI confidence with sober, scientific visuals.

---

### Spaceknow — spaceknow.com

**Steal**

- Dark satellite-map UI with precise control chrome.
- Before/after sliders, time-lapse scrubbers, and geospatial evidence panels.
- A “mission control” atmosphere for remote sensing, telemetry, and verification.

**Use on existing pages**

- `/marketplace/[id]` — add a dark “Proof Layer” section with satellite imagery, before/after comparison, project boundary, and verification badges.
- `/projects/[id]/telemetry` — this placeholder should become a full satellite/sensor command center.
- `/projects/[id]` — add a compact telemetry preview card linking to the full project telemetry page.
- `/track-verification` — show field/satellite verification progress as a technical operations console.
- `/public-registry` — add optional proof expansion rows: blockchain anchor, MRV status, last verification timestamp.
- `/site-visits` — create a field-ops map for scheduled visits, agent assignments, plot boundaries, and visit outcomes.

**Use on pages to come**

- MRV telemetry console — primary inspiration: dark map, ingestion status, webhook stream, confidence scores, blockchain anchors.
- Farm plot detail page — plot boundary, GPS centroid, site photos, owner assignment, and MRV deployment status.
- Site visit scheduler — field team planning map with status pins, region filters, and route planning.
- Project proof viewer — public/private page for satellite imagery, time-lapse evidence, and AI verification outcomes.

---

### Tableau Public — Viz of the Day — public.tableau.com/gallery

**Steal**

- Buyer dashboards: tonnes purchased, retired, remaining inventory, footprint vs. offsets.
- Portfolio analytics: tree maps, Sankey diagrams, stacked bars, and cohort comparisons.
- Seller/project developer analytics: project performance, credit issuance, payout flow, and verification status.

**Use on existing pages**

- `/dashboard` — make role-specific dashboard modules feel more analytical and less card-heavy.
- `/portfolio` — add portfolio composition views: by project type, country, vintage, price, retirement state, and SDG.
- `/compliance` — build an executive ESG dashboard: emissions, offsets, retired credits, report readiness, audit history.
- `/carbon-credits` — redesign the ledger with analytics above the table: inventory, issued, purchased, retired, pending verification.
- `/financials` — show contracts, payouts, revenue, outstanding balances, and project-owner earnings as dashboards.
- `/financials/contracts` and `/financials/payouts` — add lifecycle analytics and status breakdowns.
- `/projects` — give admins project funnel analytics by status, country, sector, and verifier.
- `/project-developers` — show onboarding, KYC, assignment, payout, and project participation analytics.
- `/carbon-calculator` — make results comparable against portfolio offsets and marketplace recommendations.

**Use on pages to come**

- ESG report history — dashboard of generated reports, periods, scopes, removals, download status, and audit readiness.
- Retirement certificate history — analytics for certificates by vintage, project, period, and organization.
- Credit transaction detail/list — transaction analytics with buyer, seller, price, quantity, status, and certificate path.
- Partner operations dashboard — partner performance by type: registry, dMRV provider, auditor, technology provider.
- Organization analytics — team actions, purchasing authority, auditor access, and reporting activity.

---

### SSENSE — ssense.com

**Steal**

- Premium marketplace grid layout with generous whitespace and stark typography.
- Product-card hover states that feel editorial and expensive, not SaaS-default.
- Wishlist/save behavior for comparing credits before buying.

**Use on existing pages**

- `/marketplace` — primary use: turn project cards into premium carbon assets with imagery, project type, vintage, price, availability, SDGs, and quick compare/save.
- `/marketplace/[id]` — borrow the product-detail discipline: strong hero, image/video gallery, sticky purchase card, essential specs, and related projects.
- `/marketplace/checkout` — simplify the checkout layout into a premium purchase flow with clean pricing, quantity, vintage, and organization context.
- `/credits/purchase` — align logged-in buyer purchasing with the public marketplace language.
- `/portfolio` — let buyers “collect” credits visually, almost like a curated asset vault.
- `/marketplace/success` — present purchased credits as a beautiful receipt and next-step artifact.

**Use on pages to come**

- Saved/compare projects page — wishlist-style project shortlist for institutional buyers.
- Project comparison page — side-by-side grid for price, vintage, methodology, SDGs, risk, location, available credits.
- Curated portfolio collections — “Nature-based Ghana,” “Scope 3 ready,” “High-additionality agriculture,” etc.
- Buyer watchlist notifications — alert users when saved projects change price, receive new credits, or become verified.

---

### Therabody — therabody.com

**Steal**

- Clear comparison tools that explain product differences without overwhelming users.
- Specification grids that help buyers make confident decisions.
- Guided recommendation patterns based on user needs.

**Use on existing pages**

- `/marketplace` — add compare mode for nature-based vs. tech-based credits, different vintages, methodologies, countries, prices, and risk signals.
- `/marketplace/[id]` — add “compare this project” and a specs grid: project type, vintage, methodology, available credits, price, SDGs, additionality, verification status.
- `/carbon-calculator` — recommend project types or credit bundles based on calculated footprint.
- `/portfolio` — compare owned batches before retiring: vintage, project, available quantity, certificate readiness, reporting use.
- `/portfolio/retire/[batchId]` — help users choose which batch to retire with clear tradeoffs.
- `/compliance` — compare reporting periods, emissions scopes, and offset coverage.

**Use on pages to come**

- Project comparison page — the main future page for this resource.
- Credit bundle builder — recommend portfolios based on budget, target tonnes, geography, or ESG goals.
- Buyer recommendation wizard — guided acquisition flow for first-time institutional buyers.
- Retirement planning page — compare which credits to retire now vs. hold for future reporting.

---

### Moncler Genius / Moncler — moncler.com

**Steal**

- Immersive detail pages with cinematic product presentation.
- Replace luxury product spin with drone footage, project terrain, audio soundscapes, sensor imagery, and community storytelling.
- Editorial pacing: the project should feel rare, tangible, and emotionally worth backing.

**Use on existing pages**

- `/marketplace/[id]` — primary use: make project detail pages unforgettable with hero media, story chapters, land visuals, farmer/community profile, and proof layers.
- `/` — use cinematic hero treatment and scroll transitions to make the brand feel premium.
- `/about-us` — create a richer brand narrative with mission, team, milestones, and African climate-market ambition.
- `/projects/[id]` — give internal project detail a polished project cockpit, not just operational data.
- `/project-developers/[userId]` — elevate farmer/project-owner profiles with portrait/story sections and project participation.
- `/marketplace/success` — reveal the purchased project with emotional closure, not just transaction confirmation.

**Use on pages to come**

- Project media gallery — drone footage, site photos, field notes, seasonal before/after, community portraits.
- Public project story page — editorial page separate from purchase mechanics for marketing/shareability.
- Founder/partner story pages — use cinematic storytelling for high-trust partnerships and local credibility.
- Field report page — site visit recaps that feel like documentary dispatches.

---

### Clos19 by LVMH — clos19.com

**Steal**

- “Story of the maker” layouts that create provenance and exclusivity.
- Vintage-year framing that maps perfectly to carbon credit vintages.
- Private-client feeling for curated portfolios and high-value institutional buyers.

**Use on existing pages**

- `/marketplace/[id]` — frame project owners, communities, and vintage years as provenance: who made the impact, where, when, and under which standard.
- `/marketplace` — add curated collections and “featured vintage” rails for premium discovery.
- `/portfolio` — make owned credits feel like an institutional asset vault, grouped by vintage, project, and certificate status.
- `/portfolio/retire/[batchId]` — make retirement feel like a formal handover into permanent climate proof.
- `/financials/contracts` — use private-client polish for contract details, terms, counterparties, and payout lifecycle.
- `/about-us` — emphasize Crevy’s local sourcing, partner network, and trust story.

**Use on pages to come**

- Curated portfolio page — private-market bundles for institutions: themed portfolios, target tonnes, vintage mix, geography, and compliance goal.
- Vintage credit detail page — explain the year, issuance history, serial range, price movement, and retirement eligibility.
- Institutional buyer concierge page — high-touch acquisition support for large companies.
- Partner profile pages — tell the story of registries, auditors, dMRV providers, NGOs, and financial partners.

---

## Cross-Page “Wow” Opportunities

### Highest-impact upgrades first

- `/marketplace/[id]` — combine Moncler, Pudding, Spaceknow, Clos19, and Observable into a cinematic, proof-rich project detail page.
- `/marketplace` — combine SSENSE, Tableau, Therabody, and Observable into premium discovery with filters, compare, map, save, and curated collections.
- `/portfolio` + `/compliance` — combine Tableau, National Geographic, and Pudding into institutional impact storytelling and reporting dashboards.
- `/projects/[id]/telemetry` — use Spaceknow as the north star for a full dMRV command center.
- `/public-registry` — combine Observable and National Geographic into a public trust ledger with elegant proof expansion.

### New pages worth adding

- `/marketplace/compare` — compare saved projects/credits side-by-side.
- `/marketplace/saved` — buyer wishlist/watchlist.
- `/marketplace/collections` — curated credit portfolios.
- `/projects/[id]/proof` — public/private proof viewer for MRV, satellite, blockchain, and methodology evidence.
- `/reports/esg` — ESG report history and download center.
- `/reports/certificates` — retirement certificate history and gallery.
- `/credits/transactions/[id]` — transaction receipt, proof, price, and ownership trail.
- `/credits/verifications/[id]` — credit verification evidence detail.
- `/partners` and `/partners/[id]` — partner management and partner provenance pages.
- `/farm-plots/[id]` — plot boundary, owner, site photos, assignments, and MRV deployment page.
