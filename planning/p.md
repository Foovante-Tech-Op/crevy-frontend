For Auditors (Org Auditor Role):
Immutable Assets Panel – Satellite imagery viewer + on-chain verification status + document attestation (permits, receipts)
Methodology Scorecard – 5-tier risk scores + additionality assessment + quantification methodology approval status
Audit Trail – Complete version history of all project documents with cryptographic hashes

For Buyers (Org Admin Role):
Impact Dashboard – Total retired carbon + active contracts + project ratings
Portfolio View – Holdings by project type, vintage, geography with real-time pricing
ESG Scorecard – Sustainable development co-benefits + SDG alignment

From our Engineering Lead:
Standardize on TanStack Table with a custom wrapper for this across the app
Perform a wide-scale replacement of Tailwind classes (e.g., text-slate-900 -> text-foreground)
For the Project Detail Route, when we click on "View Detail/Dossier" we should be details to the details page, whereever it may be
Fro the chart library we can use Recharts

General Project Structure:
For the Project Switcher in the Hero, should be a global component foe just the assigned admin(project manager) and super admin to see, The super_admin should see all non-closed projects.
For the dynamic Kanban Board, we can do: Submission -> Methodology Review -> Audit -> Registry Submission