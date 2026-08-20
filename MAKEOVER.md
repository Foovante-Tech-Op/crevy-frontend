# Crevy landing-page makeover

> Implementation brief for the public website. This is a plan, not a claim that Crevy is a carbon registry, verifier, or credit issuer.

## 1. The decision

Build a cinematic, scroll-led landing page that makes Crevy's actual value easy to understand:

> **Crevy turns an early-stage climate project into a registry-ready, market-visible opportunity.**

It helps a project team create a structured baseline, assess project readiness with Crevy's own scoring engine, automatically rank appropriate methodology routes, identify evidence gaps, and assemble a reviewable package. External registries such as Verra and Gold Standard remain responsible for independent verification and credit issuance. Once a project has been verified and issued by the appropriate body, Crevy can expose it to buyers in the marketplace.

### Non-negotiable positioning boundaries

- Crevy **does not** certify projects, operate as a registry, independently verify projects, or issue carbon credits.
- Never claim that a score, match, checklist, or submitted document guarantees registry acceptance, verification, issuance, funding, or a credit volume.
- Describe the product as readiness assessment, methodology guidance, documentation coordination, a versioned calculation/evidence trail, submission preparation, and marketplace access.
- Do not use retired partner terminology or frame the product as a partner-operated measurement pipeline. The public story is Crevy's own engine and project workflow.
- Keep registry names in proof/caveat copy such as “prepared for review against registry requirements,” not in an implied endorsement or affiliation.

### The visual idea: Project Signal

Do not recreate Alethia's boulder. Use an original **Project Signal**: a tactile abstract marker built from black graphite planes, white evidence points, and a single orange coordinate line. It evolves as the visitor scrolls:

1. A sparse marker appears with unconnected evidence points.
2. Points resolve into a score profile.
3. Orange paths separate into ranked methodology routes.
4. The completed marker opens into a clear route from registry readiness to marketplace visibility.

This gives the page a memorable visual anchor without copying either reference site's object, palette, language, or choreography.

### Scope

- **V1:** fast static-image sequence (or short, muted motion clips), pinned story, real product language, responsive fallback, reduced-motion mode, and existing public routes preserved.
- **V1.1:** optional generated 3D/video sequence only after the V1 narrative, performance budget, and legal asset review are approved.
- **Not in this task:** a fake live score, registry verification UI, a credit-issuance claim, or a complex WebGL experience that excludes mobile and reduced-motion users.

---

## 2. What to borrow from the references—and what not to borrow

### Alethia (`alethia.earth`)

Useful patterns observed:

- A short first-visit loading moment creates anticipation before the main scene begins.
- A persistent hero object provides continuity while the narrative changes on scroll.
- Full-bleed visuals, restrained overlays, and short editorial copy make the experience feel deliberate.
- The scroll sequence uses one idea at a time instead of presenting a conventional feature grid immediately.

Do **not** copy:

- Its rock/moss treatment, opening language, dark organic palette, imagery, or shot sequence.
- A long loader that delays a visitor from understanding the product.

### SCFO (`scfo.de`)

Useful patterns observed:

- Strong typographic hierarchy and high contrast make a highly visual page legible.
- A fixed, scene-based journey makes progression explicit.
- It provides a static/reduced-motion path rather than requiring the animated experience.

Do **not** copy:

- Its exact scene navigation, interactive object, visual assets, or bold experimental motion simply for decoration.

### Crevy's distinct direction

The page should feel like a **quietly rigorous project-readiness system**: documentary project imagery plus clean black, white, and orange information layers. The drama comes from moving a real project from uncertainty to a reviewable route—not from imitating a nature brand.

---

## 3. Product truth to put at the centre

The implementation brief must follow the current backend rather than old integration-era copy.

### Evidence in the codebase

| Capability | Evidence | Public-language implication |
| --- | --- | --- |
| In-house score computation | `src/v2/projects/engine/scoring.engine.ts` composes baseline estimation, readiness scoring, methodology recommendation, and circularity scoring. | “Assess readiness with Crevy's scoring engine.” |
| Score profile | The engine returns carbon-readiness, data-quality, additionality, monitoring-capability, documentation, and verification-readiness components. | “See a structured readiness profile and what needs attention.” |
| Automatic methodology matching | `src/v2/projects/engine/methodology-matching.engine.ts` ranks routes using sector/activity fit, available data, readiness, complexity, registry relevance, and buyer demand. | “Get ranked methodology routes with a clear rationale.” |
| Evidence and history | `src/v2/projects/services/scoring.service.ts` appends assessment-score records; score records retain the engine version and calculation trail. | “Maintain a versioned calculation trail and organized project evidence.” |
| Document workflow and public project discovery | Project routes include assessment, document, and marketplace flows. | “Prepare a reviewable package, then present verified projects to the market.” |

### Important copy restraint

The scoring engine is a project-readiness and pre-screening tool. It is not a registry decision engine. Baseline and projected values can be unavailable until source emissions information is present; the UI must explain missing inputs rather than inventing results.

### Core message hierarchy

1. **Assess the project.** Build a reliable baseline and evidence profile.
2. **Score its readiness.** Crevy calculates a transparent readiness profile from the information available.
3. **Match the route.** Crevy ranks suitable methodology options and reveals the inputs still required.
4. **Prepare the handoff.** Organize documents and calculation history for external registry review.
5. **Reach the market.** After the relevant registry verifies and issues credits, make the project discoverable to buyers.

---

## 4. Visual system: brand first

Use the existing semantic tokens in `app/globals.css` as the starting point:

| Role | Token / treatment | Usage |
| --- | --- | --- |
| Canvas | `--background` / white | Main page surface and calm space around media. |
| Ink | `--foreground` / black | All core text, rules, icons, and the Project Signal base. |
| Primary action | `--brand` / orange | Primary button, active state, route line, focus ring, and one decisive emphasis per view. |
| Support | Neutral gray tokens derived from black and white | Metadata, dividers, inactive controls, and subtle image protection. |
| Photography protection | Black translucent overlay or a white surface | Maintain contrast without introducing another brand color. |

### Rules

- Use only black, white, orange, and neutral gray in the new landing experience.
- Keep orange scarce and meaningful: it denotes action, the currently active stage, or the selected route. It is not a full-page wash.
- Remove deprecated nonsemantic color aliases from landing components. Do not introduce colored gradients or category-color systems.
- Use the sans font for display text, body text, navigation, buttons, and all standard UI.
- Use a real loaded mono font only for supporting information: stage numbers, engine version, document states, route IDs, dates, and compact labels.
- Do not introduce a serif font. Resolve the current font-token mismatch before visual work: `--font-sans` and `--font-mono` must reference fonts actually loaded by the app.

### Suggested token behaviour

```css
/* Semantic intent, not a second color system. Preserve the project's token syntax. */
--background: white;
--foreground: black;
--brand: /* existing Crevy orange */;
--surface-subtle: color-mix(in oklab, black 4%, white);
--border-subtle: color-mix(in oklab, black 14%, white);
--ink-muted: color-mix(in oklab, black 62%, white);
```

Check browser support if `color-mix()` is introduced. A fixed neutral fallback is acceptable.

---

## 5. Proposed landing-page architecture

Use the motion scene to explain the product; do not make the user decode a metaphor before seeing the value.

| Order | Section | Job | Primary action |
| --- | --- | --- | --- |
| 1 | Compact intro / utility bar | Communicate “Project readiness → registry review → marketplace” at a glance. | `Explore how it works` |
| 2 | Hero | State the promise and show the incomplete Project Signal. | `Assess your project` |
| 3 | Pinned scroll story | Explain assess → score → match → prepare. The background and Signal change by stage. | Stage-aware inline action |
| 4 | Scoring engine proof | Explain the score profile, calculation trail, and human-readable gaps without pretending it is a registry result. | `See the assessment flow` |
| 5 | Methodology route | Show a ranked primary route, alternative route, required evidence, and a “suggestion, subject to external review” note. | `Explore methodology matching` |
| 6 | Registry-ready handoff | Make the division of responsibility explicit: Crevy prepares; registries verify and issue. | `Prepare a project` |
| 7 | Marketplace outcome | Explain that verified, issued projects can become discoverable to potential buyers. | `Browse projects` |
| 8 | Final conversion block | One clear audience split for developers and buyers. | `Submit a project` / `Find projects` |

### Hero copy direction

**Eyebrow:** `CLIMATE PROJECT READINESS PLATFORM`

**Headline:** `Move from project potential to a registry-ready route.`

**Supporting copy:** `Build a baseline, calculate a readiness profile, match methodology options, and organize the evidence needed for external review—then reach the market once credits are verified and issued.`

**Primary CTA:** `Assess your project`

**Secondary CTA:** `See how Crevy works`

**Plain-language qualifier:** `Crevy prepares and connects projects. Independent registries verify and issue credits.`

### Scrollytelling chapters

| Step | Overline | Headline | On-screen proof | Background direction |
| --- | --- | --- | --- | --- |
| 01 | `PROJECT BASELINE` | `Start with what can be evidenced.` | Structured project, site, ownership, activity, and baseline inputs. | A real project site at first light: land, infrastructure, or field team, with quiet white labels. |
| 02 | `READINESS PROFILE` | `Turn information into a clear score.` | An honest component profile: data quality, documentation, additionality, monitoring capability, and verification readiness. | Close documentary detail: measurement, planning, records, or field observation. |
| 03 | `METHODOLOGY ROUTES` | `See the strongest path—and what it needs.` | Ranked primary and alternative routes, standards, requirements, and rationale. | Project team working with a site plan or evidence set; orange route line moves across the Signal. |
| 04 | `REVIEW TO MARKET` | `Prepare the handoff. Reach the right buyers.` | Document pack + versioned calculation history → external registry review → verified-and-issued project visible in the marketplace. | An optimistic, grounded project in operation; a subtle grid resolves into a marketplace card. |

No chapter should state or imply that scrolling creates a verified project. The final stage describes the process and explicitly separates Crevy's work from registry responsibility.

### Responsibility line

Present this as a compact diagram beneath stage 04:

```text
Crevy: assess + score + match + organize evidence
                         ↓
External registry: independently review, verify, and issue credits
                         ↓
Crevy marketplace: help verified projects reach potential buyers
```

The registry step must use language approved by legal/product before launch. It is a process diagram, not a partnership claim.

---

## 6. Image direction and sourcing

### Choose imagery by product stage, not by generic “sustainability” stereotypes

Use one coherent, documentary visual world. Prioritize places and people doing credible climate-project work: restoration, clean energy, agroforestry, waste-to-value, efficient infrastructure, coastal protection, or circular production—only where those project types are truly in Crevy's market focus.

| Stage | Look for | Avoid |
| --- | --- | --- |
| Baseline | Wide site context, field notebook, mapping, site visit, land stewardship, equipment in situ. | Stock hands cupping soil, anonymous leaves, implausible drone shots. |
| Score | Evidence gathering, sensors, logs, measurements, project planning, teams reviewing source material. | Fake dashboards, invented charts, laboratory theatre unrelated to the project. |
| Match | Maps, field layout, project operators, document review, technical planning. | Literal split-screen “AI chooses for you” imagery. |
| Market | A mature project, community benefit where consented, operational infrastructure, a buyer/project conversation. | Credit-card imagery, trading-floor clichés, smokestacks presented as an offset solution. |

### Source order

1. **Owned project photography** — best evidence and strongest differentiation. Obtain a signed location/model/property release and record the project, photographer, territory, date, and allowed marketing use.
2. **Commissioned photographer or videographer** — provide the shot list below and negotiate broad website, paid-social, and derivative/AI-edit rights in writing.
3. **Properly licensed stock** — useful for concept prototypes and bridging shots. Review the exact license and retain a receipt/screenshot with each selected asset. Start with [Unsplash](https://unsplash.com/license), [Pexels](https://www.pexels.com/license/), [Adobe Stock](https://stock.adobe.com/), or [Shutterstock](https://www.shutterstock.com/). Do not assume an asset is cleared merely because it appears in a search engine.
4. **Generated visuals** — only for the abstract Project Signal, atmospherics, and clearly illustrative transition frames. Do not use generated imagery to document a real project, community, emission result, certificate, registry interface, or verification outcome.

### Moodboard collection protocol

- Gather 20–30 candidate images in a private board (Figma, Milanote, or a shared folder).
- For each candidate, record source URL, license, photographer/creator, project type, region, portrait/property releases, crop availability, and whether AI transformation is permitted.
- Label each image `baseline`, `score`, `match`, or `market`; do not select four visually unrelated photos.
- Select a final set of 4–6 images that shares light direction, camera distance, grain, and subject dignity.
- Obtain written consent before showing identifiable people, local communities, or exact project locations. Never fabricate consent or impact stories.

### Commissioning shot list

- One wide establishing frame with generous negative space for copy (desktop and mobile crops).
- One medium project-team frame showing real work and source material, not posed corporate theatre.
- One evidence detail: note, label, sensor, map, measurement, or approved document texture with sensitive material removed.
- One operational project frame that conveys ongoing activity.
- One human-benefit frame only where the subject has consented and the description is true.

Ask for 16:9, 4:5, and 9:16 crops, RAW originals, and a web-ready export set. Do not put personal information, coordinates of sensitive sites, document IDs, or protected ecological locations into public assets.

---

## 7. Generating the Project Signal and motion assets

### Use the right medium for the job

| Asset | Best production choice | Why |
| --- | --- | --- |
| Project Signal | SVG/CSS or Blender-rendered transparent PNG/WebP sequence | Crisp, brandable, controllable, and not mistaken for evidence. |
| Chapter backgrounds | Licensed photo + subtle CSS transform | Fastest, lightest, most credible V1. |
| Organic transition texture | Short generated/edited video loop | Optional atmosphere between real images. |
| Score and route changes | DOM/SVG/Canvas animation | Accessible text remains real text and adapts to product data. |

### Recommended no-cost workflow

1. **Sketch the four Signal states in Figma.** Use black shape, white points, and orange route line only.
2. **Model or refine the form in Blender.** Blender is free and ideal for a small original form, lighting, and consistent camera movement. Render at twice intended display resolution.
3. **Export one still per stage first.** Validate narrative and mobile crops before making video.
4. **Animate only the abstract object.** Use Blender, SVG/GSAP, Motion, or Rive. Keep all product words and scores as accessible DOM.
5. **Use DaVinci Resolve (free) or Kdenlive** to trim, color-match, and export a short web clip when needed.
6. **Use FFmpeg** to make WebM/MP4 variants and poster images. Keep the original render outside the public bundle.
7. **Add asset manifest entries** with creator, license, prompt, model/tool version, date, and approval status.

### Free / free-tier tools

| Need | First choice | Notes |
| --- | --- | --- |
| Moodboarding and layout | Figma free plan | Use it for storyboards and final crop approval. |
| Original 3D form | Blender | Fully controllable; no recurring generation spend. |
| 2D vector motion | SVG + Motion or GSAP | Lowest payload for line/point transitions. |
| Interactive vector animation | Rive free plan | Confirm current export/license terms before shipping. |
| Video edit and grading | DaVinci Resolve free / Kdenlive | Resolve may require more capable hardware. |
| Encode and thumbnails | FFmpeg | Open-source command-line encoder. |
| Generative exploration | Adobe Firefly free credits or other tool with current commercial terms | Treat free-tier terms as changeable; verify the plan before production use. |

Do not rely on a free video-generator plan for a commercial launch until its commercial-use, attribution, privacy, and input-rights terms have been checked. Do not upload private customer materials, unpublished documentation, personal data, or sensitive geospatial data to any external generation service.

### Prompt template for the abstract Signal

Use image generation only after it has passed legal/brand review. Prompt for an original abstract shape, not an imitation of another site's object.

```text
Original abstract project-readiness marker, faceted matte graphite form,
thin single orange coordinate path, small white evidence points, minimal
editorial studio lighting, white seamless background, high-contrast black
and white composition, product-design photography, no plants, no moss,
no rocks, no text, no logo, no UI, no people, 16:9.
```

For each stage, preserve camera, lens, lighting, and object silhouette. Change only the evidence-point density and route configuration. Save the final seed/settings, source image IDs, and usage terms with the asset manifest.

### Frame-by-frame sequence

The four stills are the required V1 deliverable. Video is a progressive enhancement.

| Frame | State | Visual change | Copy relationship |
| --- | --- | --- | --- |
| `00` | Unknown | Black form is quiet; 2–3 white points are disconnected. | “Start with what can be evidenced.” |
| `01` | Assessed | More points appear; a thin white measurement grid aligns. | “Turn information into a clear score.” |
| `02` | Matched | One orange path becomes primary; two lighter neutral paths remain secondary. | “See the strongest path—and what it needs.” |
| `03` | Prepared | The Signal opens into a tidy route line and a small marketplace node. | “Prepare the handoff. Reach the right buyers.” |

Export targets:

- Desktop image sequence: AVIF/WebP, 2560px wide maximum, each independently compressed.
- Mobile image sequence: AVIF/WebP, 1440px wide maximum, use a deliberate portrait crop rather than shrinking desktop art.
- Optional video: 4–6 seconds, no audio required, `webm` plus `mp4` fallback, with a static poster.
- Do not automatically download all high-resolution frames. Preload the first meaningful image and fetch the next one when the story nears the viewport.

---

## 8. Scroll experience: implementation from start to finish

### Preferred implementation

Start with CSS `position: sticky` and a small scroll-progress controller. It is understandable, resilient, easy to test, and lets the content remain useful when JavaScript is unavailable or motion is reduced.

Use a `<section>` with roughly `400vh` of scroll range on desktop. Inside it, place one `sticky top-0 h-dvh` scene. Each narrative chapter receives approximately one viewport of progress. The background layer and Project Signal crossfade between four discrete states; text is not scrubbed letter by letter.

Do **not** begin with a canvas/WebGL implementation. Add Canvas only if static sequences cannot reach the desired fidelity within the performance budget.

### Component plan

```text
app/
  (marketing)/
    page.tsx
    _components/
      landing-header.tsx
      project-signal-loader.tsx
      project-readiness-story.tsx
      story-copy.tsx
      story-media.tsx
      score-profile-preview.tsx
      methodology-route-preview.tsx
      responsibility-line.tsx
      marketplace-outcome.tsx
      marketing-footer.tsx
components/
  ui/                         # Existing shadcn primitives; do not duplicate them
lib/
  marketing-story.ts           # Stage content, asset metadata, alt text
public/
  marketing/
    project-signal/
    story/
```

Adapt this structure to the repository's existing route conventions. Do not move unrelated app/dashboard files to achieve a landing-page redesign.

### Content model

```ts
type StoryStage = {
  id: "baseline" | "score" | "match" | "prepare";
  number: string;
  eyebrow: string;
  title: string;
  body: string;
  evidence: string[];
  image: {
    desktopSrc: string;
    mobileSrc: string;
    alt: string;
    attribution?: string;
  };
  signalFrame: string;
  primaryAction?: { label: string; href: string };
};
```

Keep this data separate from the animation. It allows content, legal, and product teams to approve claims without editing motion code.

### Build sequence

- [ ] **Inventory the current marketing route.** Identify the active homepage entry point, existing header/footer, auth links, analytics, and any public API calls. Preserve those links.
- [ ] **Create a static semantic skeleton.** Build all sections with a normal document flow and all copy visible before any scroll code is added.
- [ ] **Approve content and legal boundaries.** Product approves scoring/methodology language; legal approves registry references, marketplace wording, and asset releases.
- [ ] **Set the semantic tokens and typography.** Use `--background`, `--foreground`, `--brand`, a real sans font, and a real mono font. Remove old landing-specific raw colors.
- [ ] **Prepare images and Signal frames.** Add responsive source files, accurate alt text, and an asset manifest.
- [ ] **Build the sticky scene in CSS.** Pin the visual layer; keep each chapter heading and body in a normal, keyboard-readable semantic region.
- [ ] **Connect scroll progress.** Use Motion's `useScroll` / `useTransform` or a throttled `IntersectionObserver`-based stage switch. Convert progress into one active stage and at most one adjacent crossfade.
- [ ] **Crossfade only composited properties.** Animate `opacity` and `transform`; do not animate filters, layout dimensions, or large shadows while scrolling.
- [ ] **Add navigation state.** A compact `01–04` control can jump to each chapter using anchors. Give it `aria-current="step"` for the active state.
- [ ] **Add motion preferences.** If `prefers-reduced-motion: reduce`, render the four chapters sequentially with static media; skip the loader, pinning, parallax, and auto-playing video.
- [ ] **Add the loader last.** See below. It must never block the site for more than a short moment and must be bypassed for returning visitors.
- [ ] **Test real devices.** Test a low-power mobile device, touch scrolling, keyboard navigation, 200% zoom, JavaScript disabled, slow 3G simulation, and reduced motion.

### Scroll-state pseudocode

```ts
const stages = ["baseline", "score", "match", "prepare"] as const;
const progress = clamp((scrollY - sectionStart) / sectionHeight, 0, 0.9999);
const activeIndex = Math.min(stages.length - 1, Math.floor(progress * stages.length));

// Render the active image plus the next/previous image only during a transition.
// Text follows the active stage; it remains in the DOM and readable without JS.
```

Avoid mapping arbitrary scroll pixels directly to hundreds of video frames in V1. It makes scrubbing, memory, and mobile bandwidth harder to control. Four strong art-directed states with short crossfades are more robust.

### Optional image-sequence upgrade

Only use after V1 ships successfully:

1. Produce 24–48 consistent frames in Blender or an approved generator.
2. Export poster, low-resolution/mobile, and desktop variants.
3. Preload a tiny subset around the current frame; use `requestIdleCallback` where available.
4. Clamp frame selection to loaded assets; never show a blank frame during a fast scroll.
5. Use the static stage images when reduced motion, Save-Data, poor connection, or limited memory is detected.
6. Measure memory and scroll smoothness on representative mobile hardware before release.

### Optional first-visit loader

The loader should be a maximum 800–1200ms brand cue, not a wait screen.

- Show a minimal black Signal outline and one orange path completing.
- Skip when `prefers-reduced-motion` is set, `navigator.connection.saveData` is true, the document is restored from back/forward cache, or the user has already completed it in this session.
- Store only a harmless session flag such as `crevy:marketing-loader-seen` in `sessionStorage`.
- Immediately reveal the hero on timeout, asset error, keyboard interaction, pointer interaction, or `Escape`.
- Do not gate the page behind font/image/video loading.

---

## 9. The score and methodology experience

The visual concept must stay anchored to product truth. Use a preview of the actual information architecture, not an invented “AI score” graphic.

### Score profile preview

Show score components as compact labeled rows or a radial-free grid:

```text
Readiness profile                 Engine version 4.x
Data quality                      Complete source evidence
Documentation                     3 items to review
Additionality                     Needs project input
Monitoring capability             Evidence mapped
Verification readiness            Preparation in progress
```

Important:

- Use real project values only in authenticated/product contexts with permission.
- For marketing, label the view `Illustrative assessment structure` and avoid percentage claims, fabricated tonnes, expected credit volumes, or generic “approved” statuses.
- Explain that unavailable inputs remain visible as requirements, rather than appearing as artificially certain values.

### Methodology route preview

Show a ranked route layout:

```text
Suggested route        Fit rationale                 Next evidence
Primary                sector + data alignment       baseline document
Alternative            viable with added input       monitoring plan
Future pathway         relevant after scale-up       updated activity record
```

Add the note: `Methodology routes are recommendations. Acceptance and verification are determined by the applicable external registry and its review process.`

### Evidence trail preview

Use real product language:

```text
Assessment created → inputs recorded → score calculated → requirements updated → package prepared
```

Call it a **versioned calculation trail** and **organized project evidence**. Do not call it a registry certificate, immutable public record, on-chain proof, or an external verification result unless those capabilities have separately been shipped and approved.

---

## 10. shadcn/ui and interaction guidelines

The repo already uses shadcn/ui conventions. Reuse existing primitives and semantic tokens instead of introducing a second component library.

| Need | Preferred primitive / approach |
| --- | --- |
| Primary / secondary CTA | Existing `Button` variants, updated via semantic token classes rather than one-off colors. |
| Stage navigation | Accessible button list or anchor list with active state; do not hide the story behind tabs. |
| Methodology preview | `Card`, `Badge`, `Separator`, and simple semantic table/list. |
| Score details | `Accordion` or `Collapsible` on small screens; always keep a readable summary visible. |
| Legal/context note | `Alert`-like callout or a quiet bordered content block, not a hover-only tooltip. |
| Mobile action | A single sticky action after the user reaches the story, respecting safe-area inset. |

### Component quality rules

- Use the project's configured shadcn style and Tailwind version; do not paste examples designed for a different setup without adapting them.
- Use token utilities such as `bg-background`, `text-foreground`, `border-border`, and the approved brand utility. Do not add raw decorative color values to individual components.
- Keep the CTA hierarchy consistent: one orange primary action per viewport; all secondary actions use black/white outline or text treatment.
- Build real `<button>`, `<a>`, heading, list, and landmark elements. Do not substitute `div` click targets.
- All copy remains selectable, searchable, translatable, and available to assistive technology.

---

## 11. Performance, accessibility, and measurement

### Performance budget

- [ ] First hero visual has a poster/static source and is optimized through `next/image` or the project's equivalent image component.
- [ ] Never make video the LCP element by default; the primary LCP candidate should be text or a carefully optimized image.
- [ ] Initial landing payload excludes below-the-fold media and optional animation libraries where code splitting is possible.
- [ ] Target each V1 story image at roughly 200–350KB where quality permits; validate with real encoded assets, not source files.
- [ ] Lazy-load lower chapters and defer nonessential motion code until the story is near the viewport.
- [ ] Reserve image dimensions to avoid layout shift.
- [ ] Set video `muted`, `playsInline`, `preload="none"` or `metadata`, and a useful poster; never autoplay media with sound.
- [ ] Record LCP, INP, CLS, image bytes, and JavaScript bytes on mobile before/after launch.

### Accessibility checklist

- [ ] Every visual scene has a meaningful text equivalent. Decorative Signal art uses empty alt text; documentary photos use concise truthful alt text.
- [ ] The complete story works with no motion, no JavaScript, keyboard-only navigation, and 200% browser zoom.
- [ ] Respect `prefers-reduced-motion` without a toggle being required. Offer a visible `Reduce motion` control if the full experience remains substantial.
- [ ] Maintain WCAG AA contrast for text and controls, including white text over photography and orange action states.
- [ ] Focus indicators are obvious, orange/black compliant, and never obscured by the sticky scene.
- [ ] Avoid scroll-jacking, wheel interception, forced horizontal scrolling, and time-limited interactions.
- [ ] Buttons and the stage navigator have descriptive accessible names and current-state semantics.
- [ ] Captions/transcripts are supplied if any video contains meaningful spoken or textual content.

### Analytics events (only with approved consent/privacy setup)

| Event | When | Useful decision |
| --- | --- | --- |
| `landing_story_stage_viewed` | A chapter is at least 50% visible | Where visitors leave the explanation. |
| `landing_story_reduced_motion` | Static fallback is selected | Whether fallback remains well used. |
| `landing_cta_clicked` | Any primary/secondary CTA is selected | Which audience route converts. |
| `landing_methodology_preview_opened` | Details are expanded | Whether matching explanation earns interest. |
| `landing_marketplace_clicked` | Marketplace route is selected | Demand for verified-project discovery. |

Do not send assessment inputs, project names, location data, scores, documents, or personally identifying information in marketing analytics.

---

## 12. Junior-developer checklist

### A. Establish the facts

- [ ] Read this document and walk through the existing landing route before editing.
- [ ] Confirm the final public name for the in-house scoring engine with product.
- [ ] Confirm exact public wording for “registry-ready,” “methodology recommendation,” “verification,” and “marketplace.”
- [ ] Obtain written approval before naming a registry, describing a partnership, or displaying any project/customer result.
- [ ] Verify all final CTA destinations and authentication behavior.
- [ ] Identify old marketing language that implies a third-party-operated assessment pipeline and remove it from the landing experience.

### B. Design and content approval

- [ ] Create a wireframe for desktop and mobile using the architecture in section 5.
- [ ] Create a four-panel storyboard for the Project Signal and background changes.
- [ ] Build a moodboard of 20–30 rights-tracked images; nominate 4–6 coherent final assets.
- [ ] Create a written asset manifest with file path, source, creator, license/release, rights expiry (if any), prompt/settings (if generated), reviewer, and date approved.
- [ ] Write all stage copy in a document/product review tool. Mark claims that require legal or registry review.
- [ ] Confirm all demo score/methodology content is either real and authorized or explicitly illustrative.

### C. Foundations

- [ ] Inspect the existing font loader and CSS variables; load the approved sans and approved mono font once.
- [ ] Set sans as the sole display/body/UI family; limit mono to metadata and supporting labels.
- [ ] Align marketing components to background/foreground/brand semantic tokens.
- [ ] Remove old landing components' decorative color aliases and replace with black/white/orange/neutral treatment.
- [ ] Confirm dark and light behavior only if a dark mode is part of the existing product. Do not invent a separate campaign palette.

### D. Static, correct page first

- [ ] Build semantic header, hero, four story chapters, score preview, methodology preview, responsibility line, marketplace section, final CTA, and footer.
- [ ] Ensure every section is coherent as a normal static document before adding sticky scroll behavior.
- [ ] Add the responsibility line clearly separating Crevy from independent registry work.
- [ ] Add an illustrative-data note to every score/methodology demonstration that does not use approved real data.
- [ ] Validate links, heading order, landmarks, focus order, and mobile reading order.

### E. Assets and animation

- [ ] Export responsive image assets, Signal frames, poster(s), and optional video variants.
- [ ] Add dimensions, `sizes`, alt text, and credits/attribution where license requires it.
- [ ] Implement stage changes with the four static Signal frames first.
- [ ] Add the sticky scene and stage crossfades using opacity/transform only.
- [ ] Add anchor-based stage navigation and active-state updates.
- [ ] Implement reduced-motion static sequence before adding optional video or image-sequence upgrades.
- [ ] Add the brief first-visit loader only after every direct navigation and failure state has been tested.

### F. QA and release

- [ ] Test current Chrome, Safari, Firefox, and mobile Safari/Chrome.
- [ ] Test 320px, common phone widths, tablet, desktop, ultrawide, landscape phone, and 200% zoom.
- [ ] Test keyboard-only, screen reader landmarks, no-JavaScript content, slow connection, Save-Data, and reduced motion.
- [ ] Run lint, type-check, unit tests, and production build commands used by the repository.
- [ ] Measure mobile LCP/INP/CLS before and after; reduce media before accepting visual complexity.
- [ ] Check that the landing page makes no claim of direct registry verification, credit issuance, partner affiliation, or guaranteed outcome.
- [ ] Receive product, legal, design, and marketing sign-off before publishing.

---

## 13. Definition of done

The makeover is complete when:

- A first-time visitor can accurately explain that Crevy assesses project readiness, scores it with Crevy's own engine, recommends methodology routes, helps organize the package for external registry review, and helps verified projects reach potential buyers.
- A visitor cannot reasonably infer that Crevy itself verifies projects or issues carbon credits.
- The scroll sequence is original, restrained, accessible, responsive, and useful even without motion.
- The landing system uses white background, black foreground, orange primary action, sans as the core typeface, and mono only for supporting information.
- All photography, generated assets, prompts, licenses, releases, and approvals are documented.
- The mobile experience meets the agreed performance budget and does not force video or a heavy rendering engine onto visitors.

---

## 14. Implementation references

- [Motion `useScroll` documentation](https://motion.dev/docs/react-use-scroll)
- [MDN: `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [Next.js image optimization](https://nextjs.org/docs/app/api-reference/components/image)
- [FFmpeg documentation](https://ffmpeg.org/documentation.html)
- [Blender](https://www.blender.org/)
- [Rive licensing](https://rive.app/pricing)
- [Adobe Firefly plan and terms](https://www.adobe.com/products/firefly.html)
- [Unsplash license](https://unsplash.com/license)
- [Pexels license](https://www.pexels.com/license/)

Before using any external service, re-check its current license, commercial-use terms, attribution requirements, privacy policy, and restrictions on submitted source material.
