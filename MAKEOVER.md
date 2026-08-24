# GROUND TRUTH — Crevy landing-page makeover

> Implementation brief for the public website. This is a plan, not a claim that Crevy is a carbon registry, verifier, or credit issuer.
>
> **Revision, 2026-08-23.** This document supersedes the previous makeover brief. Parts 1–3 replace the former §5 (landing architecture), §6 (image direction), §7 (asset generation) and §8 (scroll implementation). The former §1, §3, §4 and §11–14 are **retained** as Appendices A–F because the plan below is written against them and they remain binding. The original document is recoverable at commit `08902a5`.

---

## Context

The public site today is a competent scroll page: a four-video Cloudinary hero carousel, a pinned `CinematicScrollPitch`, a horizontal `ProjectTypesSection`. It reads as a good SaaS landing page. It does not read as an *event*.

Three things force a rebuild rather than a polish.

**1. The positioning is wrong and legally exposed.** Shipped metadata says `"Crevy — Carbon Registry"` ([src/app/layout.tsx](src/app/layout.tsx)); the landing marquee says `LIVE REGISTRY ✦ IMMUTABLE LEDGER`. Appendix A forbids exactly this — Crevy prepares projects, external registries verify and issue. **Decision taken: Appendix A governs.** Every headline in Part 1 complies.

**2. The story is generic.** The site's own [about-us page](src/app/(public)/about-us/page.tsx) holds the best line anyone has written for Crevy — *"Africa generates over 30% of the world's carbon sequestration potential, yet receives less than 2% of market revenue"* — and it is buried on a route the navbar does not even link to. That stat is the film.

**3. The foundations are broken in ways that will sabotage any cinematic work.** `--font-sans` and `--font-mono` both resolve to Geist, which is not installed, so the entire "monospaced telemetry" aesthetic currently renders in the browser default stack. `images.unoptimized: true`. Zero code-splitting — `three` and `mapbox-gl` ship statically on every route that touches them. CSP `media-src` has no `blob:`, which the scroll-world scrub engine requires.

**Intended outcome:** one seven-scene, cut-free camera flight on `/` that a visitor remembers, built on the `oso95/scroll-world` skill, at a hard performance budget, with a complete static fallback that ships first and costs nothing.

---

# Part 1 — The film

**Title:** `GROUND TRUTH` — a real MRV term (field-collected data used to validate satellite estimates), a double meaning, and ownable.

**Thesis:** The work is already happening. The financing infrastructure was never built where the work is. Crevy builds it.

**Camera:** One continuous forward flight. No cuts, no reversals. Every seam is a **portal** — a doorway, a window frame, a screen edge, a light bloom. Forward motion is the metaphor: your project moves forward. This maps to scroll-world **Architecture A** (grounded walkthrough, always-forward, legs chained frame-to-frame, no connector clips).

## Why the first-draft arc was inverted

The originally proposed arc — field → solar → pull back through a living-room window → land on a TV showing floods and heat deaths — attaches a superb camera move to a losing emotional shape. It travels good → bad, and abandons the visitor in despair at the midpoint, with all product proof pushed into the back half where drop-off is highest. Buyers and developers already believe in climate change. What they do not know is that the bottleneck is **infrastructure, not intent**.

Every beat is preserved. Only the meaning is inverted.

| Original beat | Kept as |
| --- | --- |
| Open field, regenerative agriculture | Scene 01, unchanged — dawn, Ghanaian agroforestry |
| Zoom out to solar panels and turbines | Scene 02, unchanged — but captioned as *invisible supply*, not "look, renewables" |
| Pull back through the living-room window | Scene 04 — we still arrive inside through glass, but we look **back out** at the field |
| TV showing climate disaster | **Scene 00 cold open** — we start there and walk away from it |

Doom becomes the thing we leave, not where we land.

## Scene chain

Copy uses the brand's editorial register: `font-extrabold` headline with an `italic font-light` or `text-brand` phrase; `font-mono text-[10px] uppercase tracking-[0.2em]` eyebrow and tags. See [docs/brandStyleGuide.md](docs/brandStyleGuide.md).

### 00 — COLD OPEN · `scroll: 0.6`

*Near-black room. A wall of screens flickering with flood water, heat shimmer, evacuation footage — legible as news, never readable as a specific broadcaster. The camera turns away from the screens and moves toward a doorway of grey dawn light.*

- **Eyebrow** `00 / THE GAP`
- **Title** **The problem is well documented.** *The financing isn't.*
- **Body** Two decades of evidence. A market that still cannot see most of the work being done about it.
- **Tags** none — keep this frame stark
- **Note** This still is the hero poster. Near-black compresses to almost nothing and gives white hero text maximum contrast.

### 01 — THE FIELD · `scroll: 1.2`

*Through the doorway into dawn. Low golden sun raking across a Ghanaian agroforestry plot — maize and cassava intercropped with young shade trees, red laterite soil, mist in the tree line. A figure walks a transect line, distant, back turned. Camera low, moving forward down the row.*

- **Eyebrow** `01 / GROUND TRUTH`
- **Title** **The work is already** *happening.*
- **Body** Before any credit exists, there is a plot, a practice, and a person who changed it.
- **Tags** `REGENERATIVE AG` · `ACCRA PILOT` · `SMALLHOLDER`
- **Product truth** Regenerative agriculture is the only project type that routes to real registration today ([src/constants/register.ts](src/constants/register.ts) → `PROJECT_TYPE_ROUTING`); the other five route to a waitlist. Opening here is honest.

### 02 — THE WIDER FARM · `scroll: 1.3`

*Camera rises and keeps pushing forward. The same land opens out: a solar array along the field edge, two turbines on the ridge line, a biogas digester behind the compound. Full morning light. A plausible mixed rural energy landscape, not a render.*

- **Eyebrow** `02 / INVISIBLE SUPPLY`
- **Title** **30% of the world's sequestration potential.** *2% of the revenue.*
- **Body** Africa's climate work is real and measurable. The infrastructure that turns it into a financeable asset was built somewhere else, for someone else.
- **Tags** `SOLAR` · `BIOGAS` · `REFORESTATION` · `WASTE-TO-VALUE`
- **Note** This is the film's argument, and it arrives at roughly 25% scroll depth — before anyone has left.

### 03 — THE BASELINE · `scroll: 1.2`

*Camera pushes toward a survey stake and soil core in the foreground. A thin white measurement grid and a single orange coordinate line register over the real terrain. A satellite pass ghosts overhead. The world becomes data without stopping being a place.*

- **Eyebrow** `03 / BASELINE`
- **Title** **Start with what can be** *evidenced.*
- **Body** Site, activity and source data become a structured baseline — and every missing input is named, not guessed.
- **Tags** `SENTINEL-2` · `EDGE IoT` · `DATA QUALITY`
- **Product truth** [/methodology](src/app/(public)/methodology/page.tsx) already documents Sentinel-2 optical, Sentinel-1 SAR and Edge IoT specifications. Reuse that language verbatim rather than inventing new terms.

### 04 — THE REVIEW ROOM · `scroll: 1.2`

*Fly forward through the grid into a dark glass interior. Slate, glass, one warm lamp. Through the far window the same field is still visible in morning light. On the near wall, a readiness profile assembling — six component bars, a versioned trail.*

- **Eyebrow** `04 / READINESS PROFILE`
- **Title** **Turn information into a** *defensible score.*
- **Body** Carbon readiness, data quality, additionality, monitoring capability, documentation, verification readiness. Every number shows its work.
- **Tags** `SCORING ENGINE` · `CALCULATION TRAIL` · `VERSIONED`
- **Caveat chip** `A readiness assessment, not a registry decision.`
- **Product truth** The six components come from `scoring.engine.ts` (Appendix B). This is the window beat — we arrive inside and look back out.

### 05 — THE ROUTE · `scroll: 1.3`

*Push through the screen into an abstract dark hall — tall vertical light-corridors receding into black, each one a methodology route. One is lit orange. Two are dim neutral. Each carries a mono label. The most stylised frame in the film; the set piece.*

- **Eyebrow** `05 / METHODOLOGY ROUTES`
- **Title** **See the strongest path —** *and what it still needs.*
- **Body** Routes ranked on sector fit, available data, readiness, complexity and buyer demand, with the rationale attached.
- **Tags** `VM0042` · `GS-SOC` · `ACR-SEP` · `GAP ANALYSIS`
- **Caveat chip** `Suggestion, subject to independent registry review.`
- **Product truth** `methodology-matching.engine.ts` (Appendix B); the route IDs already exist in the twelve-entry catalog on `/methodology`.

### 06 — TO MARKET · `scroll: 1.3`

*Emerge from the corridor into open air above a dawn landscape — the same light as Scene 01, the same land. Now lit project nodes dot the terrain, tied to a horizon line. A single clean marketplace card resolves in the foreground. The circle closes.*

- **Eyebrow** `06 / TO MARKET`
- **Title** **The value stays** *where the work is.*
- **Body** Crevy assembles a reviewable package. Independent registries verify and issue. Verified projects then reach buyers — with the economics facing the communities managing the carbon.
- **Tags** `DOCUMENT PACK` · `REGISTRY HANDOFF` · `MARKETPLACE`
- **CTA** `Assess your project` → `/register` · secondary `Browse projects` → `/marketplace`

**Total scroll: ~8.1 viewport-heights. Seven scenes, six legs, zero connectors.**

## Hero — static, above the film

- **Eyebrow** `CLIMATE PROJECT READINESS · ACCRA, GHANA`
- **H1** **The value should stay** *where the work is.*
- **Sub** Africa holds 30% of the world's carbon sequestration potential and receives 2% of the revenue. Crevy closes the gap that causes it — turning an early-stage climate project into a structured baseline, a defensible readiness score, a ranked methodology route, and a package a registry can actually review.
- **Qualifier**, always visible, never collapsed: `Crevy prepares and connects projects. Independent registries verify and issue credits.`
- **CTAs** `Assess your project` / `Browse projects`
- The **LCP element is this text block**. Never the video, never a poster.

## The Project Signal — the persistent object

Same silhouette in every scene. It changes **state, not style** — that is what makes it read as one object rather than seven decorations. Faceted matte graphite planes, white evidence points, one orange coordinate path (`#F38221`).

Rendered as an **SVG/Canvas overlay above the video layer**, driven by the same scroll progress. Deliberately **not** baked into the generated video: no generative video model will hold an object identical across seven scenes — it will morph, and morphing destroys the entire premise of a persistent anchor.

| Scene | Signal state |
| --- | --- |
| 00 | Absent. Only a faint orange horizon rule. |
| 01 | Silhouette fades up; three disconnected white points. |
| 02 | Points multiply and scatter; still unconnected. |
| 03 | A thin white measurement grid snaps into register; points align to it. |
| 04 | Points resolve into six component bars around the form. |
| 05 | One orange path lights through the form; two neutral paths remain. |
| 06 | The form opens into a route line terminating in a small market node. |

It blends into each scene through **lighting and placement, not form** — warm rim-light and low-right against the sky in the field; cool and glass-reflected in the review room; the source of the orange in the corridor.

The same states are the reduced-motion illustrations. Animated with `framer-motion`, already a dependency. **No new packages.**

---

# Part 2 — scroll-world intake answers

The skill runs an interview before generating anything. These are the prepared answers.

**1. Subject.** Crevy (Foovante Global, Accra) — a climate-project readiness platform. It turns an early-stage African climate project into a structured baseline, a readiness score, a ranked methodology route and a reviewable evidence package for external registries, then surfaces verified projects to buyers. It does not verify or issue credits.

**2. Brand kit** — provide directly. Do **not** fetch from the live URL; that site's copy is the copy being replaced.

```
#F38221  brand orange   (--brand, oklch(71.953% 0.1692 54.279))
#020617  slate-950      foundation
#0F172A  slate-900      containers
#1E293B  slate-800      borders / grid
#F8FAFC  slate-50       light canvas
#FFFFFF  white          ink on dark
```

Name: `Crevy`. Tone: institutional, industrial-cinematic, radically transparent, evidentiary, unsentimental.

**Orange is scarce** — exactly one high-chroma accent per frame, per Appendix C. Reject any still where orange reads as a wash.

**3. Art direction** — **override the skill's default clay-diorama style.** Shared style preamble, pasted verbatim into every still prompt:

```
Cinematic documentary photograph, 3:2, anamorphic-adjacent framing, 35mm film
grain, natural available light, shallow depth of field, muted desaturated
palette of graphite, slate and warm dawn neutrals, deep blacks with retained
shadow detail, exactly one high-chroma orange accent (#F38221) in frame,
West African setting, no text, no logos, no UI overlays, no watermarks,
no recognisable faces.
```

Human figures appear only at distance, backs turned or silhouetted, never with a recognisable face. This avoids both uncanny-valley failure and likeness/consent exposure.

**4. Camera style** — **Architecture A: continuous walkthrough, grounded and realistic, always-forward.** Never Architecture B; its dive-and-reverse at each seam would destroy the single-flight illusion this film is built on.

**5. Journey** — the seven scenes in Part 1, with their eyebrow, headline, body and tags exactly as written.

**6. Mobile** — **yes, a native 9:16 portrait chain.** Crevy's developer audience is mobile-first in emerging markets; a cropped 16:9 clip on a phone looks amateur. This roughly doubles video spend and is worth it.

**7. Budget** — **stills free and external; video paid and deferred.**

The skill treats these as separate choices: its own intake already offers Higgsfield `gpt_image_2` *or* Codex `image_gen` as the stills source. Supplying stills from outside is a supported path, not a workaround — approved files are dropped in as `assets/still_0.png … still_6.png` (plus `stillMobile_N.png`) and the skill's stills step is skipped.

Video cannot be swapped the same way. The seam rule requires `--start-image` set to the previous leg's *actual last frame*; the skill explicitly says to reject any model lacking that capability, because without frame-locking every seam pops. No free video model does reliable start-frame conditioning at usable quality.

- **Stills — $0.** Fourteen frames (seven desktop 3:2, seven mobile 9:16), generated free, approved before anything else happens.
- **Video — six desktop legs plus six mobile legs**, Standard `seedance_2_0` at 1080p / 720p portrait, with ~15% re-roll headroom. Roughly **$15–25** on Monid now that stills are not billed. **Deferred to Milestone B.**

## Free stills workflow

| Service | Use for | Why |
| --- | --- | --- |
| **Google AI Studio / Gemini** | The workhorse — iteration, re-rolls, all mobile crops | Far more generous free tier; supports reference-image conditioning, which is what holds style across sessions |
| **ChatGPT (GPT Image), free tier** | The three hero frames: 00, 02, 06 | Best prompt adherence and photoreal quality; tight daily limits make it wrong for volume |
| **Adobe Firefly**, free credits | Fallback and provenance-sensitive frames | Trained on licensed content — a clean rights story for a climate-finance brand that will be scrutinised |

Non-negotiable method, whichever service is used:

1. **Generate Scene 01 first and approve it.** It is the style bible. Nothing else starts until it is right.
2. **Feed the approved Scene 01 back as a reference image** into every subsequent prompt, alongside the shared style preamble pasted verbatim. Reference-chaining — not prompt repetition — is what survives a multi-day free-tier grind across separate sessions.
3. Generate at **1536×1024** (desktop 3:2) and **1024×1536** (mobile 9:16) natively. Never crop a landscape frame to portrait.
4. Expect this to take **several days** on free limits. That is the real cost, and it is precisely why Milestone A's build work proceeds in parallel rather than waiting.

**Verify each service's current commercial-use, attribution and input-rights terms before launch.** Do not assume free-tier output is clear to use commercially; these terms change. This is already required by Appendix F.

**Do not upload** customer project documents, geospatial coordinates, site photographs, or personal data to any generation service. Record creator, license, prompt, model version, date and approval per asset in the asset manifest (Appendix E, section B).

## Prerequisites

```
/plugin marketplace add oso95/scroll-world
/plugin install scroll-world@scroll-world
```

`ffmpeg` / `ffprobe` and Python 3 + Pillow are already present on the build machine. A Monid **or** Higgsfield CLI is needed **only at Milestone B** — neither is on PATH today, and nothing before Milestone B requires one.

---

# Part 3 — Engineering

## Blockers to clear before any asset work

| Fix | File | Why |
| --- | --- | --- |
| Add `blob:` to `media-src` | [next.config.ts](next.config.ts) | The scrub engine fetches clips and plays them from object URLs. Without this the film fails silently in production. |
| Point `--font-sans` / `--font-mono` at fonts that are actually loaded | [src/app/globals.css](src/app/globals.css), [src/app/layout.tsx](src/app/layout.tsx) | Both currently resolve to Geist, which is not installed. The entire mono-telemetry aesthetic is rendering in the browser default stack today. |
| Convert Montserrat `.ttf` → `.woff2` | [public/fonts/](public/fonts/) | Roughly 70% smaller. Free win, and required before adding any video bytes. |
| Raise Lenis `lerp` on `/` | [src/components/providers/SmoothScroll.tsx](src/components/providers/SmoothScroll.tsx) | `lerp: 0.02` is extremely heavy; the scrub will trail the wheel by roughly half a second and feel broken. Needs about `0.1` on the landing route. |
| Fix the dead Pexels video | [src/app/(public)/marketplace/_components/PrimaryMarketplaceHero.tsx](src/app/(public)/marketplace/_components/PrimaryMarketplaceHero.tsx) | A hardcoded `pexels.com` src is already CSP-blocked in production — `media-src` allows only `'self'` and Cloudinary. |

## Asset hosting

**Videos → Cloudinary.** Already allowed by both `media-src` and `connect-src`, already receives `q_auto,f_auto,vc_auto`, and [src/lib/utils/cloudinary.ts](src/lib/utils/cloudinary.ts) `getOptimizedVideoUrl()` exists to be reused. Do **not** put ~9MB of MP4 into `public/`, which is already 16MB.

Add `NEXT_PUBLIC_CLOUDINARY_URL` to `.env.example` — it is currently undocumented, so a fresh clone silently renders `src=""`.

**Stills → `public/`**, hand-encoded to AVIF and WebP with ffmpeg. `images.unoptimized: true` means `next/image` buys nothing today, so encode manually rather than rebuilding the whole image pipeline in this pass.

## Components

New, under `src/components/public/landing/ground-truth/`:

- **`scenes.config.ts`** — the single typed source of truth, feeding both the scrub config and the static fallback. Write this first.
- **`GroundTruthStatic.tsx`** — the seven stills as a crossfading pinned scroll story with the real DOM copy. Primary at Milestone A, fallback at Milestone B. Built once, no rewrite.
- **`ProjectSignal.tsx`** — the SVG overlay, seven states, `framer-motion`, driven by shared scroll progress.
- **`SceneCopy.tsx`** — the DOM text layer. **All copy stays real accessible DOM**, never baked into video, so it is selectable, translatable and legible to a screen reader.
- **`GroundTruthFilm.tsx`** — wraps `mountScrollWorld` from the skill's `scrub-engine.js` in a `useEffect` with cleanup. Loaded from `page.tsx` via `next/dynamic({ ssr: false })`.

`HeroSection`, `CinematicScrollPitch` and `ProjectTypesSection` are superseded on `/`. Retire `ProjectTypesSection`'s six-color category system per Appendix C. `HowItWorksSection.tsx`, `WhyCrevySection.tsx` and `public-navbar.tsx` are already dead code and should be deleted.

Scene config shape — Architecture A, so `connectors` is unused:

```ts
{
  brand: { name: 'Crevy' },
  sections: [{
    id: 'ground-truth', label: 'Ground Truth',
    still: '/scenes/still_1.avif', stillMobile: '/scenes/stillMobile_1.avif',
    clip: cloudinaryUrl('leg_1'), clipMobile: cloudinaryUrl('leg_1-m'),
    scroll: 1.2, accent: '#F38221',
    eyebrow: '01 / GROUND TRUTH', title: '…', body: '…', tags: [...],
  }, /* … */],
}
```

## Performance contract

Extends the budget in Appendix D. These are hard caps, not targets.

- **LCP is the hero text.** Never the video, never a poster image.
- Desktop video total **≤ 9MB**; mobile **≤ 4.5MB**. Six legs at crf 20 / 1080p lands near 1.5MB each.
- Each still **≤ 250KB** AVIF, 2560px desktop and 1440px portrait mobile.
- `preload="none"` until the film is within 1.5 viewports. Prefetch leg *i+1* while leg *i* plays. **Never fetch the whole chain up front.**
- The **entire film mount** is `next/dynamic({ ssr: false })`, so scrub-engine bytes never reach any other route.
- The static fallback triggers on **any** of: `prefers-reduced-motion`, `navigator.connection.saveData`, `effectiveType` of `2g` or `slow-2g`, `deviceMemory < 4`, or no JavaScript. **Zero video bytes** in that path.
- Record LCP, INP, CLS, image bytes and JS bytes on a throttled mobile profile before and after. `.unlighthouse/` already exists for this.

[src/app/(public)/layout.tsx](src/app/\(public\)/layout.tsx) blocks all children behind `CrevyLoader`. Turn that into an asset: the loader holds while `still_0` and `leg_0` preload, then reveals. Cap it hard at about 1.5s so it never delays comprehension.

## Accessibility

Extends Appendix D. Additionally:

- Every scene has a meaningful text equivalent in the DOM. Signal art is `aria-hidden`; documentary stills carry truthful, concise alt text.
- The complete story works keyboard-only, at 200% zoom, with no motion and no JavaScript.
- A visible `Reduce motion` control **in addition to** honouring the media query.
- No scroll-jacking beyond the scrub itself. No wheel interception, no time-limited interactions.
- WCAG AA for white-on-photography and for orange action states — verify `#F38221` contrast on every surface it lands on.

## The rest of the public site — shared grammar, no second film

`/marketplace` reuses the Scene 06 still as a static hero and the Signal in its market state. `/about-us`, `/methodology` and `/support/*` inherit the Signal in a fixed state, the mono telemetry system, sharp-edge cards, and one editorial pull-quote each. **No additional video chains.** Scarcity is what makes the landing page land; if every page flies, none of them do.

While in these files, fix the dead links: footer `/public-registry` (no such route exists), `/new-project` (the real route is `/projects/new`), and the footer links to `/carbon-calculator` and `/register` which sit behind authentication.

---

# Build order

Two milestones. **Milestone A costs nothing and is shippable on its own.**

## Milestone A — the static film ($0)

1. Clear the five blockers above. Verify the font fix visually — the whole site changes the moment `font-mono` resolves to a real face.
2. Write `scenes.config.ts` and all copy. Text before pictures: if the script does not hold as plain prose, it will not hold at 60fps.
3. Generate Scene 01 free, approve it, then the remaining six by reference-chaining. Then the seven mobile portraits. Encode to AVIF and WebP with ffmpeg.
4. Build `GroundTruthStatic.tsx` — the seven stills as a crossfading pinned scroll story with the real DOM copy.
5. Layer `ProjectSignal.tsx` over it, seven states.
6. Ship behind a flag. Measure.

At this point the page loads in a fraction of the byte budget, works on every device, and satisfies the definition of done in Appendix F with video as progressive enhancement. **If the story does not land here, more money will not fix it.**

## Milestone B — the flight (~$15–25)

7. Install a generation CLI. Run the skill's interview with the Part 2 answers, supplying the approved stills.
8. Generate the six desktop legs. **Verify each seam before generating the next.** Then the six mobile legs.
9. Encode, upload to Cloudinary, wire the clip fields in `scenes.config.ts`, mount the scrub engine via `next/dynamic`.
10. `GroundTruthStatic.tsx` becomes the fallback path rather than the primary — no rewrite required.
11. Re-measure against the budget, then retire the superseded sections and delete the dead components.

---

# Verification

- **Seams.** Screenshot immediately before and after each of the six seams; frames must be near-identical in composition. A visible pop is the single most common failure mode of this skill.
- **Scrub.** `video.seekable.end(0) > 0` for every clip; scrolling moves `currentTime` monotonically; no console errors; scrolling backwards is as smooth as forwards.
- **Mobile.** Real device, portrait and landscape, CPU throttled 4–6×. Confirm the `-m` variants are served (`videoWidth < videoHeight`). Confirm URL-bar collapse does not jump the page.
- **Fallback.** DevTools reduced-motion, then Save-Data, then JavaScript disabled. In all three the full story must be readable and **no video request may appear in the network panel**.
- **CSP.** Build and serve production (`pnpm build && pnpm start`); confirm zero CSP violations in the console. This is where a missing `blob:` will surface.
- **Budget.** Lighthouse mobile against the deployed preview. LCP must be the hero text. Total transferred bytes on a first scroll-through must sit under the caps above.
- **Copy compliance.** Re-read every headline against Appendix A. Nothing may state or imply that Crevy verifies, certifies, issues, or guarantees registry acceptance.

---
---

# Appendix A — Non-negotiable positioning boundaries

*Retained verbatim. Binding on all copy in Part 1.*

> **Crevy turns an early-stage climate project into a registry-ready, market-visible opportunity.**

It helps a project team create a structured baseline, assess project readiness with Crevy's own scoring engine, automatically rank appropriate methodology routes, identify evidence gaps, and assemble a reviewable package. External registries such as Verra and Gold Standard remain responsible for independent verification and credit issuance. Once a project has been verified and issued by the appropriate body, Crevy can expose it to buyers in the marketplace.

- Crevy **does not** certify projects, operate as a registry, independently verify projects, or issue carbon credits.
- Never claim that a score, match, checklist, or submitted document guarantees registry acceptance, verification, issuance, funding, or a credit volume.
- Describe the product as readiness assessment, methodology guidance, documentation coordination, a versioned calculation/evidence trail, submission preparation, and marketplace access.
- Do not use retired partner terminology or frame the product as a partner-operated measurement pipeline. The public story is Crevy's own engine and project workflow.
- Keep registry names in proof/caveat copy such as "prepared for review against registry requirements," not in an implied endorsement or affiliation.

---

# Appendix B — Product truth

*Retained. The implementation must follow the current backend rather than old integration-era copy.*

| Capability | Evidence | Public-language implication |
| --- | --- | --- |
| In-house score computation | `src/v2/projects/engine/scoring.engine.ts` composes baseline estimation, readiness scoring, methodology recommendation, and circularity scoring. | "Assess readiness with Crevy's scoring engine." |
| Score profile | The engine returns carbon-readiness, data-quality, additionality, monitoring-capability, documentation, and verification-readiness components. | "See a structured readiness profile and what needs attention." |
| Automatic methodology matching | `src/v2/projects/engine/methodology-matching.engine.ts` ranks routes using sector/activity fit, available data, readiness, complexity, registry relevance, and buyer demand. | "Get ranked methodology routes with a clear rationale." |
| Evidence and history | `src/v2/projects/services/scoring.service.ts` appends assessment-score records; score records retain the engine version and calculation trail. | "Maintain a versioned calculation trail and organized project evidence." |
| Document workflow and public project discovery | Project routes include assessment, document, and marketplace flows. | "Prepare a reviewable package, then present verified projects to the market." |

**Copy restraint.** The scoring engine is a project-readiness and pre-screening tool. It is not a registry decision engine. Baseline and projected values can be unavailable until source emissions information is present; the UI must explain missing inputs rather than inventing results.

**Core message hierarchy.** Assess the project → Score its readiness → Match the route → Prepare the handoff → Reach the market. Scenes 03 through 06 in Part 1 map to these in order.

---

# Appendix C — Visual system rules

*Retained. See also [docs/brandStyleGuide.md](docs/brandStyleGuide.md).*

| Role | Token / treatment | Usage |
| --- | --- | --- |
| Canvas | `--background` / white | Document sections and calm space around media. |
| Cinematic canvas | `slate-950` | The film, the hero, and any full-bleed media section. |
| Ink | `--foreground` / black, white on dark | All core text, rules, icons, and the Project Signal base. |
| Primary action | `--brand` / orange `#F38221` | Primary button, active state, route line, focus ring, and one decisive emphasis per view. |
| Support | Neutral gray tokens | Metadata, dividers, inactive controls, subtle image protection. |

- Use only black, white, orange, and neutral gray in the landing experience.
- Keep orange **scarce and meaningful**: it denotes action, the currently active stage, or the selected route. It is never a full-page wash.
- Remove deprecated nonsemantic color aliases from landing components. No colored gradients, no category-color systems.
- Sans for display, body, navigation, buttons, and all standard UI. A real loaded mono **only** for stage numbers, engine versions, document states, route IDs, dates and compact labels.
- **No serif.** Resolve the font-token mismatch before any visual work: `--font-sans` and `--font-mono` must reference fonts the app actually loads.
- Sharp edges. `rounded-none` or subtle `rounded-sm`. No soft-SaaS bubbles.

---

# Appendix D — Performance budget, accessibility, and measurement

*Retained. Part 3 tightens these with the video caps.*

## Performance budget

- [ ] First hero visual has a poster/static source and is optimized through `next/image` or the project's equivalent.
- [ ] Never make video the LCP element by default; the primary LCP candidate is text or a carefully optimized image.
- [ ] Initial landing payload excludes below-the-fold media and optional animation libraries where code splitting is possible.
- [ ] Target each story image at roughly 200–350KB where quality permits; validate with real encoded assets, not source files.
- [ ] Lazy-load lower chapters and defer nonessential motion code until the story is near the viewport.
- [ ] Reserve image dimensions to avoid layout shift.
- [ ] Set video `muted`, `playsInline`, `preload="none"` or `metadata`, and a useful poster; never autoplay media with sound.
- [ ] Record LCP, INP, CLS, image bytes, and JavaScript bytes on mobile before and after launch.

## Accessibility checklist

- [ ] Every visual scene has a meaningful text equivalent. Decorative Signal art uses empty alt text; documentary photos use concise truthful alt text.
- [ ] The complete story works with no motion, no JavaScript, keyboard-only navigation, and 200% browser zoom.
- [ ] Respect `prefers-reduced-motion` without a toggle being required. Offer a visible `Reduce motion` control as well.
- [ ] Maintain WCAG AA contrast for text and controls, including white text over photography and orange action states.
- [ ] Focus indicators are obvious, orange/black compliant, and never obscured by the sticky scene.
- [ ] Avoid scroll-jacking, wheel interception, forced horizontal scrolling, and time-limited interactions.
- [ ] Buttons and the stage navigator have descriptive accessible names and current-state semantics.

## Analytics events

Only with approved consent/privacy setup.

| Event | When | Useful decision |
| --- | --- | --- |
| `landing_story_stage_viewed` | A scene is at least 50% visible | Where visitors leave the explanation. |
| `landing_story_reduced_motion` | Static fallback is selected | Whether the fallback remains well used. |
| `landing_cta_clicked` | Any primary/secondary CTA is selected | Which audience route converts. |
| `landing_methodology_preview_opened` | Details are expanded | Whether matching explanation earns interest. |
| `landing_marketplace_clicked` | Marketplace route is selected | Demand for verified-project discovery. |

Do not send assessment inputs, project names, location data, scores, documents, or personally identifying information to marketing analytics.

---

# Appendix E — Pre-launch checklist

*Retained, resequenced against the Build order in Part 3.*

## A. Establish the facts

- [ ] Read this document and walk through the existing landing route before editing.
- [ ] Confirm the final public name for the in-house scoring engine with product.
- [ ] Confirm exact public wording for "registry-ready," "methodology recommendation," "verification," and "marketplace."
- [ ] Obtain written approval before naming a registry, describing a partnership, or displaying any project/customer result.
- [ ] Verify all final CTA destinations and authentication behavior.
- [ ] Identify old marketing language implying a third-party-operated assessment pipeline and remove it — including the shipped `"Crevy — Carbon Registry"` metadata title and the `LIVE REGISTRY` marquee.

## B. Design and content approval

- [ ] Wireframe desktop and mobile against Part 1.
- [ ] Storyboard the seven Signal states and scene backgrounds.
- [ ] Create a written **asset manifest** with file path, source service, creator, license/release, rights expiry, prompt and settings, model version, reviewer, and date approved — one row per generated still and clip.
- [ ] Write all scene copy in a review tool. Mark claims requiring legal review.
- [ ] Confirm all demo score/methodology content is either real and authorized or explicitly labelled illustrative.
- [ ] Verify current commercial-use terms for every generation service used.

## C. Foundations

- [ ] Load the approved sans and approved mono font once; fix the Geist token mismatch.
- [ ] Set sans as the sole display/body/UI family; limit mono to metadata and supporting labels.
- [ ] Align marketing components to background/foreground/brand semantic tokens.
- [ ] Remove old landing components' decorative color aliases.
- [ ] Add `blob:` to `media-src`; document `NEXT_PUBLIC_CLOUDINARY_URL` in `.env.example`.

## D. Static, correct page first

- [ ] Build semantic header, hero, seven scenes, responsibility line, marketplace section, final CTA, and footer.
- [ ] Ensure every section is coherent as a normal static document before adding sticky scroll behavior.
- [ ] Add the responsibility line clearly separating Crevy from independent registry work.
- [ ] Add an illustrative-data note to every score/methodology demonstration not using approved real data.
- [ ] Validate links, heading order, landmarks, focus order, and mobile reading order. Fix the four dead footer links.

## E. Assets and animation

- [ ] Export responsive stills, Signal states, posters, and video variants.
- [ ] Add dimensions, `sizes`, alt text, and attribution where a license requires it.
- [ ] Implement scene changes with the seven static Signal states first.
- [ ] Add the sticky scene and crossfades using opacity and transform only.
- [ ] Add anchor-based scene navigation and active-state updates.
- [ ] Implement the reduced-motion static sequence **before** adding the video chain.
- [ ] Cap the first-visit loader after every direct navigation and failure state has been tested.

## F. QA and release

- [ ] Test current Chrome, Safari, Firefox, and mobile Safari/Chrome.
- [ ] Test 320px, common phone widths, tablet, desktop, ultrawide, landscape phone, and 200% zoom.
- [ ] Test keyboard-only, screen reader landmarks, no-JavaScript content, slow connection, Save-Data, and reduced motion.
- [ ] Run lint, type-check, and the production build (`pnpm build`).
- [ ] Measure mobile LCP/INP/CLS before and after; reduce media before accepting visual complexity.
- [ ] Check that the landing page makes no claim of direct registry verification, credit issuance, partner affiliation, or guaranteed outcome.
- [ ] Receive product, legal, design, and marketing sign-off before publishing.

---

# Appendix F — Definition of done

The makeover is complete when:

- A first-time visitor can accurately explain that Crevy assesses project readiness, scores it with Crevy's own engine, recommends methodology routes, helps organize the package for external registry review, and helps verified projects reach potential buyers.
- A visitor cannot reasonably infer that Crevy itself verifies projects or issues carbon credits.
- The scroll sequence is original, restrained, accessible, responsive, and useful without motion.
- The landing system uses a light canvas for document sections, `slate-950` for the film, black or white ink, orange as a scarce primary action, sans as the core typeface, and a real mono only for supporting information.
- All photography, generated assets, prompts, licenses, releases, model versions, and approvals are documented in the asset manifest.
- The mobile experience meets the performance budget in Part 3 and never forces video or a heavy rendering engine onto a visitor.

---

# Appendix G — Implementation references

- [scroll-world skill](https://github.com/oso95/scroll-world)
- [Motion `useScroll` documentation](https://motion.dev/docs/react-use-scroll)
- [MDN: `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [Next.js image optimization](https://nextjs.org/docs/app/api-reference/components/image)
- [FFmpeg documentation](https://ffmpeg.org/documentation.html)
- [Google AI Studio](https://aistudio.google.com/)
- [Adobe Firefly plan and terms](https://www.adobe.com/products/firefly.html)
- [Blender](https://www.blender.org/)
- [Unsplash license](https://unsplash.com/license)
- [Pexels license](https://www.pexels.com/license/)

Before using any external service, re-check its current license, commercial-use terms, attribution requirements, privacy policy, and restrictions on submitted source material.
