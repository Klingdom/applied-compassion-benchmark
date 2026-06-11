# GRAPHICS_REVIEW_FRONTEND_2026-06-11

**Scope**: Technical feasibility of adding data-derived graphs (Class A) and evidence images (Class B) to the /updates daily briefing.  
**Date**: 2026-06-11  
**Author**: Frontend Engineer agent  
**Repo root**: `C:\Users\philk\applied-compassion-benchmark`

---

## Baseline Facts

**Static-export constraint.** `site/next.config.ts:3` — `output: "export"`. No server-side rendering, no route handlers, no Next.js image optimization at runtime. All rendering is build-time or client-side. Any graphics approach must be either (a) pure inline SVG from server components, (b) static PNG/SVG files written to `site/public/` at prebuild time, or (c) client-side JS rendering (expensive, high bundle cost, no SEO).

**No charting dependency exists.** `site/package.json` lists only: `next`, `react`, `react-dom`, `zod`, `@radix-ui/react-tooltip`. No Recharts, Chart.js, D3, Victory, ECharts, or any charting library. The pattern established by `ScoreSparkline.tsx` — hand-rolled inline SVG with pure coordinate math — is the only in-use approach and is the right one to extend.

**Existing SVG primitive.** `site/src/components/updates/briefing/ScoreSparkline.tsx` (208 lines) is a zero-dependency server component that renders a `<polyline>` from `events[].newComposite` data loaded at build time. It handles: band-boundary gridlines, band-crossing markers, trajectory color (green/red/neutral), accessible `role="img"` + `<title>` + `aria-label`, compact mode, graceful null-return. This is the template for all Class A work.

**Data available.** `site/src/data/indexes/*.json` — 7 indexes, each with `rankings[].scores{8 dims}`, `composite`, `band`, and `meta.bands[]` distribution. `site/public/data/history/<slug>.json` — hundreds of entities with `events[]` arrays including `date`, `newComposite`, `delta`, `newBand`, `tier`. `site/src/data/dimensions.ts` — 8 dimensions with names, hex colors, codes. All data is build-time accessible from server components at zero network cost.

**Images.** `site/next.config.ts:5` — `images.unoptimized: true`. Next.js `<Image>` will pass-through without optimization. No CDN optimization available at runtime; images served from `site/public/` as static files via Nginx.

**Worker.** `worker/src/index.ts` routes: `/badge/<slug>.svg`, `/gumroad/webhook`, `/unsubscribe`, `/api/v1/subscribers`, `/admin/status`. No image-rendering endpoint exists. The Worker is a V8 isolate on Cloudflare — it can run `satori` (pure JS) but has no canvas or native binaries. Adding an OG image endpoint here is feasible without `sharp`.

---

## Scoring Rubric

Each candidate scored 1–5 on: Impact (user-visible value), Strategic Alignment (credibility + independence), Learning Value (diagnostic or SEO value), Confidence (feasibility certainty), Effort (1 = trivial, 5 = large), Risk (1 = safe, 5 = breakage risk).

**Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk**

---

## Candidate G1 — Dimension Profile Radar / Bar (Class A)

**Title**: 8-Dimension Score Bar Chart on Briefing Score Movement Cards

**Class**: A — data-derived graph

**Problem / opportunity (file evidence).**  
`site/src/components/updates/briefing/ScoreMovementCard.tsx:53–272` displays entity, delta, band, and confidence for each assessed entity — but has no visual representation of the 8-dimension breakdown. The briefing JSON carries `dominantDimension` (one dimension code + delta) per assessment card, but the full 8-dimension profile is available in `site/src/data/indexes/*.json:rankings[].scores`. A reader cannot see *why* a score changed — which dimensions drove the movement — from the current card layout.

`site/src/data/indexes/ai-labs.json:56–68` shows the shape: `"scores": { "AWR": 4.4, "EMP": 4.4, "ACT": 4.4, "EQU": 4.4, "BND": 3.8, "ACC": 4.4, "SYS": 4.4, "INT": 4.8 }`. Values are 0–5 per dimension. `site/src/data/dimensions.ts` provides the dimension color for each code (AWR=#7dd3fc, EMP=#c084fc, ACT=#86efac, etc.).

**Proposed change + technical approach.**  
Create `site/src/components/updates/briefing/DimensionBar.tsx` — a server component. It accepts a `scores` object (`Record<string, number>`) and renders 8 horizontal bar segments as inline SVG in a `200×36` viewBox. Each bar is a `<rect>` from x=0 to x=(score/5 * maxWidth), colored by `DIMENSIONS.find(d => d.code === code).color`, spaced 4px apart vertically. The chart title and `aria-label` enumerate all 8 dimension values. No client JS, no deps, ~50 lines.

Placement: inside `ScoreMovementCard` on expand (behind a native `<details>` so it does not bloat the dense list view). When `assessment.scores` is present in the briefing JSON, render it; when absent, show nothing (null return). The scores can also be pulled at build time from the index JSON via a lookup helper if the briefing JSON does not carry them.

**Benefit.** Makes "why did the score change" visible without the user navigating to the entity page. Differentiates the briefing from a flat list. Zero bundle cost.

**Independence / licensing / integrity check.** Renders the benchmark's own scored data. No third-party content. Scores are never paid for or manipulated — purely output of the research pipeline. Safe.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 4 |
| Learning Value | 4 |
| Confidence | 4 |
| Effort | 2 |
| Risk | 1 |

**Priority = 4 + 4 + 4 + 4 − 2 − 1 = 13**

---

## Candidate G2 — Band Distribution Chart on Briefing Header (Class A)

**Title**: Index Band Distribution Bar at Briefing Header / Stat Strip

**Class**: A — data-derived graph

**Problem / opportunity (file evidence).**  
`site/src/data/indexes/ai-labs.json:19–49` — each index file carries a `bands[]` array with `{ name, range, count, pct }` for all 5 bands (Critical, Developing, Functional, Established, Exemplary). The briefing header (`DailyBriefingHeader.tsx`) currently renders a one-line pipeline micro-strip (entities reviewed, score changes, forward watches) but has no visual anchor showing the overall distribution of the 1,160 indexed entities across bands. A reader has no at-a-glance sense of whether most indexed institutions are "Functional" or "Critical" before reading the daily findings.

The `StatOfTheDay` strip (`StatOfTheDay.tsx`) has room for a compact annotation but is already text-dense.

**Proposed change + technical approach.**  
Create `site/src/components/updates/briefing/BandDistributionBar.tsx` — a server component. It accepts a `bands` array from any index JSON and renders a single stacked horizontal bar as inline SVG in a `200×14` viewBox. Five colored segments proportional to `pct`, each using the band's canonical color from the design system (Critical=#f87171, Developing=#fb923c, Functional=#fcd34d, Established=#86efac, Exemplary=#34d399 — all present in `globals.css` theme). Each segment carries a `<title>` with `"{band}: {count} entities ({pct})"`.

Place above the pipeline micro-strip in `DailyBriefingHeader.tsx`. Source data comes from whichever index is most featured in that day's briefing (e.g., the index of the lead signal's entity). Alternatively, show an aggregate across all indexes. Load is build-time from the index JSON — zero runtime cost.

**Benefit.** Gives the daily briefing a visual anchor showing the health distribution of all indexed entities. Supports the "benchmark-as-institution" brand positioning. No client JS.

**Independence / licensing / integrity check.** The benchmark's own scored and published band distribution data. No third-party content. Safe.

| Dimension | Score |
|---|---|
| Impact | 3 |
| Strategic Alignment | 4 |
| Learning Value | 3 |
| Confidence | 4 |
| Effort | 2 |
| Risk | 1 |

**Priority = 3 + 4 + 3 + 4 − 2 − 1 = 11**

---

## Candidate G3 — Delta Bullet Indicator on Score Movement Cards (Class A)

**Title**: Delta Bullet / Progress Bar on ScoreMovementCard Score Display

**Class**: A — data-derived graph

**Problem / opportunity (file evidence).**  
`site/src/components/updates/briefing/ScoreMovementCard.tsx:186–220` renders the before/after score as `published → assessed (±delta)` in text, but the numbers carry no spatial context. A delta of +3 on a score of 19 (near-band-crossing) looks identical in text to a +3 on a score of 61. `distanceToBoundary` is already computed in the briefing JSON and surfaced as a text label in `ScoreMovementCard.tsx:135–141` when `pointsAway < 3.0` — but the spatial proximity to the band boundary is invisible.

**Proposed change + technical approach.**  
Create `site/src/components/updates/briefing/DeltaBullet.tsx` — a server component. It accepts `{ published, assessed, bandBoundary }` and renders a thin horizontal inline SVG progress track (e.g., `160×8` viewBox). The track shows the 0–100 score range; the current assessed score position is a filled dot; the published position is a hollow dot; the nearest band boundary (from `distanceToBoundary.band`) is a vertical tick. Color the fill segment using `deltaColor(delta)` from `briefing/utils.ts`. This is ~40 lines of SVG math, zero deps.

When `assessed` score and `distanceToBoundary` are both present, render the bullet below the score line in `ScoreMovementCard`. When absent, render nothing.

**Benefit.** Makes spatial proximity to band boundaries immediately visible. The band-crossing signal — currently the highest-value finding in the briefing — becomes visually prominent without requiring text expansion. Directly supports the Score-Watch product narrative (boundary proximity = urgency of monitoring).

**Independence / licensing / integrity check.** Derived from the benchmark's own score data. No third-party content. Safe.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 5 |
| Learning Value | 3 |
| Confidence | 5 |
| Effort | 1 |
| Risk | 1 |

**Priority = 4 + 5 + 3 + 5 − 1 − 1 = 15**

---

## Candidate G4 — Per-Day OG Social Card via Build-Time Prebuild Script (OG)

**Title**: Static-export OG images for `/updates/<date>` via satori prebuild script

**Class**: OG — social card generation

**Problem / opportunity (file evidence).**  
`site/src/app/updates/[date]/page.tsx:63–75` — `generateMetadata` constructs `openGraph` and `twitter` blocks with title and description but **no `images` field**. `twitter.card` is set to `"summary_large_image"` (line 71) — which promises a 1200×630 card to Twitter/X crawlers — but without an image URL every `/updates/<date>` share produces a blank or generic thumbnail. This was documented as a deferred gap in `UPDATES_REVIEW2_FRONTEND_2026-06-10.md:C1`.

`site/next.config.ts:3` — `output: "export"` rules out the Next.js built-in `app/opengraph-image.tsx` approach (requires a server at request time). No `public/updates/og/` directory exists.

**Proposed change + technical approach.**  
Add `site/scripts/build-og-images.mjs` as the last step in the `prebuild` chain. It runs Node.js at build time and:

1. Reads `manifest.dates` to enumerate all briefing dates.
2. Loads each daily JSON from `site/src/data/updates/daily/<date>.json`.
3. Uses `satori` (npm, pure JS, no native deps, works in Docker) to render a JSX-like template to SVG: dark `#0b1220` background, site name, date, lead headline (≤80 chars), score-change count, band distribution strip.
4. Passes the SVG through `@resvg/resvg-js` or `sharp` to produce a 1200×630 PNG at `site/public/updates/og/<date>.png`. (Alternatively, serve the satori-generated SVG directly as the OG image — Facebook/LinkedIn support SVG OG images with correct mime type.)
5. Skips dates that already have a PNG (incremental — only new briefings re-render).

In `[date]/page.tsx:generateMetadata`, add:
```
openGraph: { images: [{ url: `/updates/og/${date}.png`, width: 1200, height: 630 }] }
twitter: { images: [`/updates/og/${date}.png`] }
```

`satori` bundle is ~120 KB and runs only at build time, not in the client bundle. The worker's `@vercel/og` is based on satori — the same approach, but the Worker route (adding `/og/<date>` dynamic rendering in the Cloudflare Worker) would avoid per-date PNG storage at the cost of Worker CPU per request. The static prebuild approach is simpler and avoids Worker changes.

Estimated storage: ~80 KB per PNG × 30 existing dates = ~2.4 MB. Fully acceptable.

**Benefit.** Fixes `summary_large_image` card gap that has existed since Wave A. Every briefing share on social becomes a distinct, content-carrying card. Directly improves click-through.

**Independence / licensing / integrity check.** All content is the benchmark's own published data — date, headline, entity count. No third-party content, no photos, no logos of rated entities. Safe.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 4 |
| Learning Value | 2 |
| Confidence | 3 |
| Effort | 3 |
| Risk | 2 |

**Priority = 4 + 4 + 2 + 3 − 3 − 2 = 8**

---

## Candidate G5 — Small-Multiples Sparkline Grid in Score Movement Dashboard (Class A)

**Title**: Score trajectory sparklines in ScoreMovementDashboard (reuse ScoreSparkline)

**Class**: A — data-derived graph

**Problem / opportunity (file evidence).**  
`ScoreSparkline.tsx` already exists as a server component that reads `site/public/data/history/<slug>.json` and renders a `200×52` inline SVG sparkline. It is currently used only in the `EntityDetail` component — not in the briefing itself. `ScoreMovementDashboard.tsx` renders N score movement cards (`sorted.map(assessment => <ScoreMovementCard>)`), each with before/after numbers, but no trajectory.

`site/public/data/history/*.json` is populated for hundreds of entities. History slugs are available at build time. The ScoreMovementCard has `slug` from the assessment object — this is the key needed to load the history file.

**Proposed change + technical approach.**  
In `ScoreMovementCard.tsx`, import `ScoreSparkline` (already exported from `briefing/ScoreSparkline.tsx`). When `slug` is present and `compact={true}`, render the sparkline inline — it renders at `120×32` in compact mode, fitting cleanly in the card's right gutter or below the score row. When `getEntityHistory(slug)` returns null (entity has no history yet), `ScoreSparkline` already returns null gracefully.

No new data infrastructure needed. No new npm deps. The only addition is ~3 lines in `ScoreMovementCard.tsx` and a single import.

**Benefit.** Makes the trajectory of every assessed entity visible within the briefing page. Differentiates the briefing from a static delta list. Connects the daily movement to the multi-cycle picture. Zero bundle cost (server component), zero new deps.

**Independence / licensing / integrity check.** Reuses the benchmark's own scored history data. Safe.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 4 |
| Learning Value | 3 |
| Confidence | 5 |
| Effort | 1 |
| Risk | 1 |

**Priority = 4 + 4 + 3 + 5 − 1 − 1 = 14**

---

## Candidate G6 — Evidence Image: Link-Out-Only Pattern for Photos and Maps (Class B)

**Title**: Safe evidence-image handling — link-out only, no hosted third-party imagery

**Class**: B — evidence image

**Problem / opportunity (file evidence).**  
The briefing schema (`DAILY_BRIEFING_SCHEMA.md:§2c-evidence`) defines `EvidenceItem` with fields `quote`, `source`, `url`, `publishedDate`, `sourceTier`, `archivedUrl`. No image URL field exists. The `EvidenceQuote` component (`evidence/index.tsx:175–227`) renders only text quotes and source links — no inline images. The briefing is currently text-and-SVG only. For high-severity signals (e.g., conflict zones, facility photos, satellite imagery), visual evidence could significantly increase credibility and reader comprehension.

**The copyright + provenance problem.** Third-party photographs, maps, and satellite imagery are typically licensed, not freely reusable. AP, Reuters, AFP, and Getty images have strict restrictions — hotlinking is explicitly prohibited and hosting a copy constitutes infringement without a license. UN Photo and OCHA imagery allows certain non-commercial uses but requires attribution and is not clearance-free for all contexts. Satellite imagery (Maxar, Planet, DigitalGlobe) is typically licensed at high cost. Even "public domain" government imagery (USGS, NASA) often carries secondary restrictions on use alongside commercial content.

**Hosting options assessed:**

| Option | Legal exposure | Integrity risk | Implementation cost |
|---|---|---|---|
| Hotlink (direct embed from third-party CDN) | High — most news/stock CDNs block hotlinking; may serve wrong image post-update | High — no provenance control once URL changes | Low |
| Host copy in `site/public/images/evidence/` | High — redistribution without license is infringement for AP/Reuters/Getty | Medium — must manually track each file's license | High |
| Worker proxy (fetch + serve via CF Worker) | High — proxying does not change copyright status | High — no cache integrity guarantee | Medium |
| Link-out only (no inline display, external link) | None — same as the current SourceChip pattern | Low — user sees the source as published | Zero |
| Own-generated graphics (maps, diagrams, data vis) | None — copyright owned | None | Medium |

**Proposed change + technical approach.**  
The correct policy for Class B is: **no inline display of third-party imagery; link-out only.** The existing `SourceChip` pattern (a named external link with tier badge) is already the correct treatment for photographic evidence. For maps and location context, generate own-created SVG maps from public coordinate data (e.g., using Natural Earth data under CC0). For screenshots of documents, host only if the source is CC0/public domain (UN filings, court records) and carry a `license` field in the `EvidenceItem` schema.

Add an optional `imageUrl` field to `EvidenceItem` (per `DAILY_BRIEFING_SCHEMA.md`) that is **schema-permitted but display-blocked** unless a `license` field is also present with value `"public-domain"` or `"cc0"` or `"cc-by"`. When both are present, render a `<figure>` with `<img>` and a license attribution caption. When `imageUrl` is present without a clean `license`, display nothing and log a build warning. This prevents accidental embedding of unlicensed imagery.

**Benefit.** Provides a safe, auditable path to evidence images without copyright exposure. Keeps the evidence ledger honest. The link-out-only default is zero implementation cost today; the opt-in licensed path can be added in a future cycle when needed.

**Independence / licensing / integrity check.** This candidate *is* the integrity check. The link-out-only default protects the benchmark's credibility and legal standing. Inline images of rated entities (logos, facility photos) carry the additional risk of appearing to endorse or target specific entities, which conflicts with the independence policy.

**Integrity risk to flag explicitly.** Using satellite imagery or facility photos of rated entities in a "negative finding" briefing context (e.g., a prison facility photo for a Critical-band government) could constitute defamation risk or create an association between a third-party image and a benchmark finding the image does not directly substantiate. The link-out pattern keeps the evidence and the benchmark finding separated.

| Dimension | Score |
|---|---|
| Impact | 2 |
| Strategic Alignment | 3 |
| Learning Value | 3 |
| Confidence | 4 |
| Effort | 1 |
| Risk | 2 |

**Priority = 2 + 3 + 3 + 4 − 1 − 2 = 9**

---

## Candidate G7 — Own-Generated SVG Maps for Geographic Entities (Class A/B boundary)

**Title**: Build-time SVG country/region maps for geographic entities in briefings

**Class**: A/B boundary — own-generated from public data, no copyright risk

**Problem / opportunity (file evidence).**  
The briefing surfaces findings for countries, US states, global cities, and US cities (4 of 7 indexes). For a finding about a specific country or city, a minimal outline map showing its location provides immediate geographic context. Currently there is no map rendering anywhere in the codebase.

Existing data: `site/src/data/indexes/countries.json` has 193 countries; `global-cities.json` has 250 cities with `country` and `region`. No geo coordinates exist in these files — they would need to be added or sourced from a free dataset.

**Proposed change + technical approach.**  
Natural Earth data (naturalearthdata.com) is CC0 / public domain — country and region boundary GeoJSON can be freely used and transformed. A prebuild script (`scripts/build-svg-maps.mjs`) could generate simplified SVG outlines for each country using a minimal equirectangular projection (~30 lines of coordinate math per path), writing them to `site/public/maps/<slug>.svg`. A server component `CountryMapInset.tsx` could then load `maps/<country-slug>.svg` via `<img>` or inline SVG at build time.

The practical constraint: full-accuracy country outlines add significant SVG complexity (thousands of path points per country). At briefing inset scale (e.g., 80×60px), simplified outlines (Natural Earth 110m resolution) work well — these files are ~5–50 KB each. 193 countries × ~20 KB average = ~4 MB of map SVGs. Acceptable for the Docker image if generated once and committed (or generated at build time).

**Benefit.** Geographic context for country and city findings without any third-party dependency or copyright exposure. Differentiates briefing pages for geographic entities.

**Independence / licensing / integrity check.** Natural Earth data is explicitly CC0 — no attribution required. Own-generated SVG rendering code. No copyright exposure. Safe. The maps show geography, not a judgment about the entity — no integrity risk.

| Dimension | Score |
|---|---|
| Impact | 3 |
| Strategic Alignment | 3 |
| Learning Value | 3 |
| Confidence | 3 |
| Effort | 4 |
| Risk | 2 |

**Priority = 3 + 3 + 3 + 3 − 4 − 2 = 6**

---

## Candidate G8 — ScoreSparkline in Lead Signal Card (Class A — trivial extension)

**Title**: Score trajectory sparkline in LeadSignalCard (reuse ScoreSparkline, 3-line addition)

**Class**: A — data-derived graph (trivial reuse)

**Problem / opportunity (file evidence).**  
`site/src/components/updates/briefing/LeadSignalCard.tsx:69–313` is the most prominent single component in the briefing. It renders the day's top finding — entity name, severity, description, evidence quote, source chip, band — but no score trajectory. `ScoreSparkline.tsx` already exists and renders gracefully when no history is available. `lead.slug` is available from the briefing JSON. The history file for the lead entity (`site/public/data/history/<slug>.json`) is available at build time.

**Proposed change + technical approach.**  
In `LeadSignalCard.tsx`, after the evidence block, add:
```tsx
import ScoreSparkline from "./ScoreSparkline";
// ...inside the article, after evidence, before the meta row:
{lead.slug && (
  <div className="mb-4">
    <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted mb-2">Score trajectory</div>
    <ScoreSparkline slug={lead.slug} entityName={lead.title} />
  </div>
)}
```
This is literally 7 lines. `ScoreSparkline` returns null when no history exists. No new dep, no new data pipeline, no risk.

**Benefit.** The most-read component in the briefing gains trajectory context at zero cost. For entities that have been in the benchmark across multiple cycles, the trend line adds analytical depth to the lead finding.

**Independence / licensing / integrity check.** Own data only. Safe.

| Dimension | Score |
|---|---|
| Impact | 3 |
| Strategic Alignment | 4 |
| Learning Value | 2 |
| Confidence | 5 |
| Effort | 1 |
| Risk | 1 |

**Priority = 3 + 4 + 2 + 5 − 1 − 1 = 12**

---

## Candidate G9 — History Over Time: Multi-Entity Comparison Sparkline Strip (Class A)

**Title**: Small-multiples sparkline strip comparing N entities across a sector in BoundaryWatch or EvidenceLedger

**Class**: A — data-derived graph (medium effort)

**Problem / opportunity (file evidence).**  
`site/src/components/updates/briefing/BoundaryWatch.tsx` renders entities approaching band boundaries. These are already the highest commercial-value signals (they drive Score-Watch subscriptions). A reader watching multiple entities in the same sector — e.g., three AI labs all within 3 points of a band crossing — currently has no visual comparison of their respective trajectories.

`site/public/data/history/` exists for hundreds of entities. All the prerequisite data exists. The technical gap is that `ScoreSparkline` loads one history file per render — to show N entities in a strip, the server component would need to call `getEntityHistory` N times (all build-time safe, all cached by Next.js `fs` reads).

**Proposed change + technical approach.**  
Create `site/src/components/updates/briefing/SparklineStrip.tsx` — a server component that accepts `slugs: string[]` and renders N `ScoreSparkline compact={true}` instances in a horizontal flex row with entity name labels below each. Each sparkline is `120×32`. For N=4, the strip is `120*4 + gaps ≈ 500px` wide — fits below the boundary watch entity list on desktop, wraps gracefully on mobile.

`BoundaryWatch.tsx` already maps over `boundaryEntities` — passing their slugs to `SparklineStrip` requires one prop addition.

**Benefit.** Enables sector-level visual comparison of trajectory within a single briefing section. Directly enhances the boundary-watch narrative that drives subscriptions.

**Independence / licensing / integrity check.** Own data only. Safe.

| Dimension | Score |
|---|---|
| Impact | 3 |
| Strategic Alignment | 4 |
| Learning Value | 4 |
| Confidence | 4 |
| Effort | 2 |
| Risk | 1 |

**Priority = 3 + 4 + 4 + 4 − 2 − 1 = 12**

---

## Priority Ranking Summary

| # | Candidate | Class | Priority |
|---|---|---|---|
| G3 | Delta Bullet / proximity bar on ScoreMovementCard | A | 15 |
| G1 | 8-Dimension Score Bar Chart | A | 13 |
| G5 | Sparklines in ScoreMovementDashboard (reuse ScoreSparkline) | A | 14 |
| G8 | SparkLine in LeadSignalCard (7-line reuse) | A | 12 |
| G9 | Multi-entity sparkline strip in BoundaryWatch | A | 12 |
| G2 | Band Distribution Bar in Briefing Header | A | 11 |
| G6 | Evidence image policy — link-out only | B | 9 |
| G4 | OG social card via satori prebuild script | OG | 8 |
| G7 | Own-generated SVG maps for geographic entities | A/B | 6 |

*Note: G5 and G3 are trivially cheap despite scoring below G1 — they should be implemented first.*

---

## What's Cheap vs Expensive

**Cheap (1–3 hours each, zero new deps):** G3 (DeltaBullet, ~40 lines SVG), G5 (ScoreSparkline in ScoreMovementCard, ~3 lines + import), G8 (SparkLine in LeadSignalCard, 7 lines). These reuse the existing ScoreSparkline pattern or existing history data with no new infrastructure.

**Expensive (real build-time work or new deps):** G4 (OG images via satori — new npm dep, new prebuild script, ~2-4 hours to produce correct output including Docker test), G7 (SVG maps — Natural Earth data pipeline, coordinate math, ~4-6 hours), G1 (DimensionBar — moderate, ~2 hours but requires score data lookup from index JSON at build time).

**Class B (evidence images) verdict:** Do not host or proxy third-party photographs, maps, or satellite imagery. The link-out-only default (already implemented via `SourceChip`) is correct policy and zero cost. The only safe path to inline evidence imagery is own-generated graphics (G7) or images with explicit CC0/public-domain provenance logged in `EvidenceItem.license`. Implement the `license` field gate in the schema as a cheap policy guard to prevent accidental unlicensed embedding in future briefings.

---

## Top 3 Candidates with Scores

1. **G3 — Delta Bullet** (Priority 15): 40-line server component, zero deps. Makes band-crossing proximity visual on every score movement card. Directly supports the Score-Watch product narrative. Build in one sitting.

2. **G5 — Sparklines in ScoreMovementDashboard** (Priority 14): 3-line change + one import. Reuses `ScoreSparkline` exactly as designed. Every assessed entity in the daily briefing gains a trajectory line. Build in 20 minutes.

3. **G1 — 8-Dimension Bar Chart** (Priority 13): ~50 lines, zero deps, server component. Surfaces the *reason* for score changes — which of the 8 dimensions moved. Requires a build-time lookup from index JSON. Highest analytical value of the Class A group.
