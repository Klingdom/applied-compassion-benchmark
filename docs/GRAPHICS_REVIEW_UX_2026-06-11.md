# GRAPHICS_REVIEW_UX_2026-06-11
## Visual Opportunities for the /updates Briefing
**Scope:** Design-only review. No implementation, no licensing law. Dark-theme, density-aware, Wave E1-consistent.

---

## Context and Constraints

The briefing page is dense editorial journalism built on structured JSON (`topSignals`, `recentAssessments`, `boundaryWatch`, `sectorAlerts`, `methodologyNotes`, `forwardTriggers`). Wave E1 compressed sections into horizontal strips and collapsed Tier-D history runs for a reason: the content itself is information-rich and the user is a paying subscriber who reads quickly. Any graphic added must earn its vertical real estate by reducing cognitive work — not by decorating what prose already says clearly.

The existing visual vocabulary consists of:
- Band-colored pills (`#86efac` green, `#fcd34d` yellow, `#fb923c` orange, `#f87171` red, `#7dd3fc` cyan)
- Horizontal score readout (`published → assessed Δ`) in ScoreMovementCard
- Inline ScoreSparkline: 200×52px polyline SVG, no JS, band-boundary gridlines at 20/40/60/80
- SourceChip with tier badge
- BoundaryWatch grid cards with text pressure-direction arrows

The gap: the sparkline exists but is compact/passive. No graphic makes the 8-dimension profile visible. No graphic shows the field distribution. No graphic makes boundary proximity visceral. Evidence images do not appear at all.

Color tokens used throughout: `--color-bg: #0b1220`, `--color-text: #e8eefb`, `--color-muted: #b8c6de`, `--color-line: rgba(255,255,255,0.10)`, `--color-accent: #7dd3fc`.

---

## Candidate Inventory

---

### Candidate 1 — Expanded Score-Over-Time Chart
**Class:** A (data-derived)
**Surface:** LeadSignalCard, inside the article when `actionType === "band-crossing-finding"` or severity is critical/high. Also available as a standalone section on entity detail pages reached from the briefing.

**Problem evidence:**
ScoreSparkline.tsx renders at 200×52px (compact: 120×32px). It plots `newComposite` over time with band-boundary gridlines but gives no axis labels, no date labels on the x-axis, no value annotations at key events. For the UAE June 8 briefing the sparkline would show only three scored points (23.4, 23.4, 18.4) spanning four days — which visually reads as a cliff with no temporal context. A first-time reader cannot understand that 23.4 was a published-and-stable score before the band-crossing proposal without a labeled baseline annotation. The history file for UAE shows `scoredEventCount: 3`, `firstEventDate: 2026-06-08`, `lastEventDate: 2026-06-11` — a genuinely short history that the sparkline handles adequately for stable entities but fails for the highest-drama moment (a band crossing).

**Proposed visual:**
A labeled score timeline, 480×96px at desktop (240×72px on mobile), pure SVG, no JS dependency. The design extends the existing ScoreSparkline aesthetic and reuses its math:
- X-axis: dates, rendered as short month-day labels at 3–4 key waypoints only (first point, band-crossing date, latest point). Not every tick — too noisy.
- Y-axis: implicit via band-zone fill areas (Critical zone fills `0–20` in `rgba(248,113,113,0.06)`, Developing fills `20–40` in `rgba(251,146,60,0.06)`, etc. — one fill per visible zone only). No axis lines printed.
- Score polyline: same trajectory-color logic (green/orange/neutral based on net direction).
- Annotation: at the band-crossing point, a vertical dashed line in `#fcd34d` (band-yellow) with a tiny label "Band crossing" in `0.65rem`.
- Latest score: a filled dot with a callout bubble (`18.4 Critical`) anchored at the rightmost point.
- The entire chart is still `<svg role="img">` with `<title>` and `aria-label` — no new a11y burden.
- Placement: immediately below the `<h2>` headline inside LeadSignalCard, replacing the gap that currently exists between the title and the "What the evidence shows" section. Only rendered when the entity has `≥2 scored history events`.
- Density discipline: the chart fits in the `<article>` border-radius container, adds no new section, no new heading. It replaces negative space.

**Why it improves comprehension:**
Text currently says "23.4 → 18.4, −5.0, Developing → Critical." The number is clear but the severity of context is not: readers cannot see whether 23.4 was a stable long-term score or a recent estimate, and whether 18.4 is near the absolute floor or mid-Critical. The zone fills answer both questions without reading text. The band-crossing annotation converts an abstract number into a visible threshold crossing — the core claim the briefing is making.

**Independence / integrity check:**
All data is internal benchmark scores. No external source images. No entity can request a more favorable chart appearance. The chart is mechanically generated from `history/<slug>.json` — same source the sparkline uses. No editorial discretion enters the visual rendering.

**Ratings (1–5):**
- Impact: 5
- Strategic Alignment: 5
- Learning Value: 4
- Confidence: 5
- Effort: 2
- Risk: 1

**Priority = (5+5+4+5) − 2 − 1 = 16**

---

### Candidate 2 — 8-Dimension Profile Bar Chart
**Class:** A (data-derived)
**Surface:** LeadSignalCard (when the entity's per-dimension scores are available in the briefing JSON or can be cross-referenced from the index JSON), and as a distinct panel in ScoreMovementCard for entities with a non-zero delta.

**Problem evidence:**
The briefing identifies `dominantDimension: {code: "INT", delta: -0.3}` for UAE but renders it as a text chip ("INT −0.30") at 0.72rem. The description prose says "INT 1.5 → 1.2, ACC 1.5 → 1.2, SYS 2.0 → 1.5, EMP 2.0 → 1.5" — four dimension changes that require the reader to parse a comma-separated list and mentally rank which moved most. The countries.json shows each entity has 8 dimension scores (AWR, EMP, ACT, EQU, BND, ACC, SYS, INT), each on a 1–5 scale. The 8 dimensions have distinct brand colors already defined in dimensions.ts (`AWR: #7dd3fc`, `EMP: #c084fc`, `ACT: #86efac`, `EQU: #fcd34d`, `BND: #fb923c`, `ACC: #f472b6`, `SYS: #34d399`, `INT: #a78bfa`).

**Proposed visual:**
A horizontal bar chart, 8 rows (one per dimension), rendered as a pure SVG or styled `<div>` stack — no charting library needed. Design:
- Each row: dimension code label (3 chars, `0.68rem` monospace) + colored bar filling 0–100% of a fixed 160px track + score value at the right end (`0.8rem` tabular-nums).
- Bar color: the dimension's brand color at 70% opacity for baseline bar; if a delta exists, an overlay segment in a brighter shade of the same color shows the before/after difference with a thin dashed right edge on the "before" position.
- Track background: `rgba(255,255,255,0.05)` — matches the card background idiom.
- Total height: approximately 8 × 20px = 160px, narrower than a paragraph of description text.
- Placement: inside the `<details>` progressive disclosure element already used for SourcesDisclosure. Summary label: "Dimension breakdown." Closed by default, so it adds zero visual weight to the default reading path. Opens on click/tap without a page reload.
- On mobile: the 160px track compresses to 100% container width — still fully readable.
- Accessibility: each bar row has an `aria-label` like "Accountability (ACC): 1.2 out of 5, down from 1.5."

**Why it improves comprehension:**
The critical question after reading a band-crossing story is: "which dimension failed hardest?" The text names four but does not show their relative magnitude or their position in the full 8-dimension profile. A reader seeing BND still at 3.0 while ACC and INT sit at 1.2 instantly understands the domestic-scope-preserved / external-conduct-collapsed pattern that the prose describes in three paragraphs. The chart answers the structural question in under 2 seconds.

**Independence / integrity check:**
Renders from the same per-dimension scores in `indexes/countries.json` that the Self-Assessment tool already displays. No additional editorial judgment enters the chart. Delta rendering requires `dominantDimension` from the briefing JSON — if absent, the chart renders baseline profile only.

**Ratings (1–5):**
- Impact: 5
- Strategic Alignment: 5
- Learning Value: 5
- Confidence: 4
- Effort: 3
- Risk: 1

**Priority = (5+5+5+4) − 3 − 1 = 15**

---

### Candidate 3 — Boundary Proximity Gauge
**Class:** A (data-derived)
**Surface:** BoundaryWatch section (replaces or augments the numeric `distance` text), and the `distanceToBoundary` pill in ScoreMovementCard.

**Problem evidence:**
BoundaryWatch.tsx renders the distance-to-threshold as a number: `0.6pt to threshold` in `0.72rem` monospace. The section uses text pressure-direction arrows (▼ ▲) and a color-coded border. The problem: "0.6 points above Critical" is highly precise but lacks proportional context — a reader who doesn't know the band width (20 points) cannot feel how close 0.6 is. Oracle at 0.6, 3M at 0.3, Alphabet at 0.0, UAE at 1.6 are all mentioned in the June 8 briefing. These four entities form a genuine risk ladder that currently reads as four equivalent text cards.

**Proposed visual:**
A segmented progress bar, one per BoundaryWatch entity, 100% width within the card, ~8px height. Design:
- The bar represents the current band range (20 points for standard bands).
- A filled section shows the score position within the band. Color is the entity's current band color (Critical red, Developing orange, etc.).
- A thin vertical marker (2px, `#fcd34d`) marks the band threshold.
- The score position dot sits to the right or left of the threshold marker, making the "above" vs "below" relationship physical rather than textual.
- At the Oracle-at-0.6 extreme: the dot nearly touches the threshold marker — this is immediately visceral without reading text.
- At Alphabet-at-0.0: the dot sits exactly on the threshold — ambiguity is visible at a glance.
- Label: `[score] — [X.X]pt to [Band]` stays below the bar at `0.65rem`, as confirmation not primary signal.
- Placement: inside each BoundaryWatch card, between the entity name row and the "Trigger to watch" text. Adds approximately 20px of height per card.
- Accessibility: `role="img"` with `aria-label="Oracle: 20.6 points, 0.6 above Critical threshold"`.

**Why it improves comprehension:**
The gauge makes the risk ladder scannable. A reader scanning the BoundaryWatch section can see in one pass that 3M and Oracle are nearly at the line, that UAE just crossed it (showing the marker to their right), and that Nigeria has meaningful margin. The editorial framing — "the most proximate hard trigger date across all assessed entities" for Oracle — is confirmed visually before the reader reads a word.

**Independence / integrity check:**
Mechanical calculation from `distanceToBoundary.pointsAway` and `distanceToBoundary.band` fields in the JSON. Zero editorial input.

**Ratings (1–5):**
- Impact: 4
- Strategic Alignment: 4
- Learning Value: 4
- Confidence: 5
- Effort: 2
- Risk: 1

**Priority = (4+4+4+5) − 2 − 1 = 14**

---

### Candidate 4 — Band Distribution Strip (Index Field View)
**Class:** A (data-derived)
**Surface:** A new compact section near the top of the briefing — between DailyBriefingHeader and LeadSignalCard — or inside TodayInBrief. Approximately 48px tall.

**Problem evidence:**
The June 8 briefing assesses 20 entities across countries, Fortune 500, AI Labs, Robotics, and US Cities in a single cycle. The `pipeline` object provides `entitiesScanned: 1160`, `entitiesAssessed: 20`, `scoreChanges: 1`. These numbers appear only in the header or summary text (if they appear at all). The band distribution for each relevant index — countries: 14 Exemplary / 26 Established / 29 Functional / 79 Developing / 45 Critical out of 193 — is buried in index JSON and never shown to briefing readers. A reader who has just learned that the UAE crossed from Developing into Critical has no frame for how many entities sit in Critical (45 of 193 countries = 23.3%).

**Proposed visual:**
A single-row proportional band strip, one per index referenced in this briefing cycle, each strip being a segmented horizontal bar at 8px height. Layout:
- Label: index name (`Countries`, `Fortune 500`, `AI Labs`) in `0.65rem` uppercase at left.
- Segmented bar: 5 colored segments proportional to band counts. Left-to-right: Critical (red), Developing (orange), Functional (yellow), Established (green), Exemplary (cyan). Each segment labeled with a count inside it if wide enough, otherwise via tooltip/title attribute.
- The entity in today's briefing is called out with a small dot marker on the bar at their score position if their index is shown. For UAE at 18.4 in Countries: the dot appears in the Critical segment.
- Width: full container width, one strip per index = approximately 3 strips × (8px bar + 18px label + 6px margin) = ~100px total height for the group.
- Progressive disclosure: this entire group sits inside a `<details>` with summary "Index field view — 3 indexes" — hidden by default, opened by readers who want context.
- The closed summary line itself is a 20px text strip: "1,160 entities monitored across 7 indexes — 45 countries in Critical." This summary line is always visible and already provides the key fact without expanding.

**Why it improves comprehension:**
The band distribution converts the benchmark's scope claim ("we score 1,160 entities") into a visceral field view. It lets the reader calibrate: is 18.4 Critical unusual or common? 45 of 193 countries = 23% is a number that changes the weight of a country band-crossing versus a lone corporate outlier. The dot marker on today's entity locates today's news within the field.

**Independence / integrity check:**
Derived entirely from the `meta.bands` array in index JSON files — static, mechanically generated, not editable per entity.

**Ratings (1–5):**
- Impact: 4
- Strategic Alignment: 5
- Learning Value: 5
- Confidence: 4
- Effort: 3
- Risk: 1

**Priority = (4+5+5+4) − 3 − 1 = 14**

---

### Candidate 5 — Score Delta Heatmap Strip (Cycle Summary)
**Class:** A (data-derived)
**Surface:** ScoreMovementDashboard — as a compact visual header above the list of `ScoreMovementCard` rows.

**Problem evidence:**
ScoreMovementDashboard renders a flat list of `sorted` assessment cards, with the section heading "Score movements" and a count ("20 assessed"). The sort is by absolute delta magnitude. The problem: on a cycle with 1 score change and 19 confirms, the list visually reads as homogeneous rows — the single real change (UAE −5.0) does not visually dominate the section. The header says "1 score change" in prose but the list gives it the same card height as a rotation confirm.

**Proposed visual:**
A horizontal score-delta strip: one bar per assessed entity, left-to-right ordered by absolute delta (same order as the current list). Each bar is 6px tall × proportional width (maximum entity takes 100% of a 48px height allocation; non-changes render as a 1px neutral line; the UAE −5.0 bar is the most prominent in orange/red). The bars use `deltaColor` (green for positive, orange/red for negative, neutral for zero) already defined in `utils.ts`. Hovering (or focusing) a bar shows a tooltip with entity name and delta. The strip sits between the section header and the first card row, adding ~56px total (8px margin above, 40px strip, 8px margin below).

On mobile: the strip compresses to the same full width but bars are narrower. The signal — one tall bar, many flat lines — is still readable.

This is density-disciplined: it does not add a new section. It adds approximately 56px to an existing section that already has dozens of cards. The comprehension payoff is that readers scanning downward immediately understand the cycle's shape before reading a single card.

**Why it improves comprehension:**
Turns "20 assessed, 1 change" from a stat into a shape. The change stands alone visually. Confirmed holds collapse to silence. The chart makes the news/not-news distinction instantaneous.

**Independence / integrity check:**
All deltas are from the JSON `recentAssessments[].delta` field. No editorial input to the visual.

**Ratings (1–5):**
- Impact: 3
- Strategic Alignment: 4
- Learning Value: 3
- Confidence: 4
- Effort: 2
- Risk: 1

**Priority = (3+4+3+4) − 2 − 1 = 11**

---

### Candidate 6 — Evidence Source Image (Thumbnail + Attribution Block)
**Class:** B (external image)
**Surface:** EvidenceLedger section, and inside the LeadSignalCard `EvidenceQuote` when the evidence item includes an `imageUrl` field.

**Problem evidence:**
EvidenceQuote renders verbatim pull-quotes in a `<blockquote>` with a SourceChip. The evidence model (`EvidenceItem`) has fields for `quote`, `claim`, `source`, `url`, `publishedDate`, `sourceTier`, `archivedUrl` — but no image field. For the UAE/Sudan story, the UN Fact-Finding Mission report includes photographic documentation; the Amnesty investigation was accompanied by satellite imagery of weapons in North Darfur. These images are not surfaced anywhere in the briefing. The evidence ledger is a table of domains and links — no visual representation of what the sources actually documented.

**Proposed visual (design spec — not licensing):**
The `EvidenceItem` type gains an optional `imageUrl: string` and `imageAlt: string` and `imageCaption: string` and `imageLicense: string` field. When all four are present, EvidenceCard renders:
- A constrained thumbnail: `max-width: 280px`, `max-height: 160px`, `object-fit: cover`, `border-radius: 8px`, aligned right on desktop and stacked below the quote on mobile.
- Below the image: a caption line at `0.68rem text-muted`, followed by a source-and-license line at `0.65rem text-muted` with an external link to the original: `"Source: [SourceChip] · [imageLicense]"`.
- The image never appears without caption, license note, and source link. The triple requirement prevents ambiguous provenance.
- On mobile: the image appears below the blockquote text, at full container width, capped at 180px height.
- `loading="lazy"` and explicit `width` and `height` attributes for layout stability.
- Accessibility: `alt={imageAlt}` required field — the data producer must supply it; without it the image renders a decorative `alt=""` and is skipped by screen readers.

Placement discipline: images appear only in EvidenceLedger (already a dedicated "sources" section the reader has chosen to expand) and inside the `showPullQuote` branch of LeadSignalCard — the highest-severity events where an image is most likely to illuminate rather than decorate. They do not appear in ScoreMovementCard or BoundaryWatch.

**Why it improves comprehension:**
Satellite imagery of weapons in the field, a photograph of a tent camp strike, or an official document excerpt turns abstract claims into witnessed evidence. The benchmark's core audience (institutional, policy, journalistic) is trained to evaluate sourced images. A visual citation adds evidentiary weight the prose cannot replicate.

**Independence / integrity check:**
The image is provided by the researcher as a field in the JSON — not selected algorithmically. Caption and license note must be present at the data-entry stage. The benchmark publishes the image as attributed evidence, not as editorial illustration. Independence policy is unchanged: an entity cannot provide images. All images come from independent third-party sources already cited as evidence.

**Ratings (1–5):**
- Impact: 3
- Strategic Alignment: 3
- Learning Value: 4
- Confidence: 3
- Effort: 3
- Risk: 3

**Priority = (3+3+4+3) − 3 − 3 = 7**

---

### Candidate 7 — Sector / Region Heat Strip
**Class:** A (data-derived)
**Surface:** SectorAlerts section header, or a new compact "sector view" row below the section title.

**Problem evidence:**
SectorAlerts in the June 8 briefing covers 8 named sectors: Countries (new ruling), Countries (floor cohort), Countries (near-floor cluster), Fortune 500 Tech, Fortune 500 Health, AI Labs, Sudan/Darfur, Fortune 500 DEI. The section renders each as a full-width card with headline + observations list. There is no visual that shows which sector has the most activity this cycle or how sectors distribute across bands. A reader interested only in AI Labs cannot immediately see that AI Labs sector has 2 entities assessed and 0 score changes versus Fortune 500 Health with 2 entities and 1 boundary watch.

**Proposed visual:**
A 1-row compact sector strip — one colored cell per sector active this cycle, proportional to entity count or signal count within the sector. Each cell is ~28px wide × 24px tall, colored by the highest-severity signal in the sector (`#f87171` for critical, `#fb923c` for high, etc.), with the sector short name in `0.6rem` text. Total strip height: ~40px including label row.

This is low-priority because: (a) the 8 sectors are already organized below the strip as full cards, so the strip summarizes what the reader is about to read — marginal value; (b) sector names vary per briefing; (c) color alone doesn't carry enough meaning without accompanying text. The strip works as a scannability aid for long briefings but adds little that a strong section heading doesn't.

**Why it improves comprehension:**
Modest improvement. Lets a reader scanning on mobile pre-select which sectors to read before scrolling through the full card list. Useful when sector count exceeds 5.

**Independence / integrity check:**
Derived from `sectorAlerts` array — sector groupings are editorial and written by the researcher, so the strip inherits any editorial grouping choices. No scoring data in the strip itself.

**Ratings (1–5):**
- Impact: 2
- Strategic Alignment: 3
- Learning Value: 2
- Confidence: 3
- Effort: 2
- Risk: 2

**Priority = (2+3+2+3) − 2 − 2 = 6**

---

### Candidate 8 — "Chart of the Day" OG Image
**Class:** OG (generated, not embedded in page body)
**Surface:** `<meta property="og:image">` in page `<head>`. Not rendered in the page body.

**Problem evidence:**
The briefing URL shared to social media generates a generic OG image (or no image) because there is no `og:image` route. The briefing's lead signal and score delta are the most shareable facts the benchmark produces. Without a generated OG image, every social share defaults to link-unfurl text only — bypassing the most significant distribution channel for a publication-style product.

**Proposed visual:**
A statically generated 1200×630px PNG (or an `/api/og` route using Next.js edge rendering) showing:
- Dark background (`#0b1220`) with the radial gradient from globals.css.
- Top-left: "Compassion Benchmark" wordmark in `#7dd3fc`, `28px`.
- Center: The lead signal entity name at `56px` bold. Below it: the score delta in large type (`23.4 → 18.4, −5.0`) with the band transition (`Developing → Critical`) in band colors. A minimal 3-point sparkline (the three scored events for UAE) at right.
- Bottom strip: date (`June 8, 2026`) + severity badge + `compassionbenchmark.com`.
- When there is no score change (a confirms-only cycle): the OG image shows the "Stat of the Day" figure at large scale instead.

This is not an embedded page graphic — it does not add density to the briefing itself. It is a distribution-layer graphic that makes the briefing linkable at institutional fidelity.

**Why it improves comprehension (for share recipients):**
First-time visitors arriving from a social share see the core finding before the page loads. The delta and band transition are legible at thumbnail scale. This is the lowest-friction path from "someone shared this" to "I understand why."

**Independence / integrity check:**
Fully data-derived. Entity cannot request favorable framing in the OG image. The template is fixed; only the data fields change.

**Ratings (1–5):**
- Impact: 4
- Strategic Alignment: 5
- Learning Value: 2
- Confidence: 4
- Effort: 3
- Risk: 2

**Priority = (4+5+2+4) − 3 − 2 = 10**

---

### Candidate 9 — Dimension Delta Comparison (Multi-Cycle)
**Class:** A (data-derived)
**Surface:** Entity history pages (not the main briefing), linked from ScoreMovementCard "View entity profile" CTA.

**Problem evidence:**
The `HistoryTimeline` component shows scored events chronologically with the Wave E1 compaction of Tier-D runs. A reader following the UAE story clicks to the entity profile and sees a list of events. The per-dimension breakdown of how each scoring event changed individual dimensions (INT, ACC, SYS, EMP for the June 8 UAE event) is not visible in the history view. The briefing prose gives this for the current cycle only. There is no graphic showing how each dimension has trended across multiple scoring cycles for a given entity.

**Proposed visual:**
On the entity history page (not the briefing): a stacked multi-line chart, one thin colored line per dimension, sharing the same y-axis (1–5 scale) and x-axis (dates of scored events). Dimensions use their brand colors. Because there are only 3 scored events for UAE this is trivially small, but for entities like Microsoft (multiple scoring cycles over months) this becomes genuinely useful. The chart is implemented as a pure SVG built from the same `getEntityHistory` function the sparkline uses, with per-dimension arrays rather than composite-only.

This is lower priority for the briefing because it lives downstream on entity pages, not in the briefing itself. Included here for completeness and to set up a forward design note.

**Why it improves comprehension:**
Shows which dimensions have been historically volatile versus stable for a given entity — a dimension-level signature that the composite score obscures.

**Independence / integrity check:**
Fully data-derived from indexed per-dimension scores.

**Ratings (1–5):**
- Impact: 3
- Strategic Alignment: 3
- Learning Value: 5
- Confidence: 3
- Effort: 4
- Risk: 1

**Priority = (3+3+5+3) − 4 − 1 = 9**

---

## Priority Table

| # | Title | Class | Priority | Impact | Align | Learn | Conf | Effort | Risk |
|---|-------|-------|----------|--------|-------|-------|------|--------|------|
| 1 | Expanded Score-Over-Time Chart | A | **16** | 5 | 5 | 4 | 5 | 2 | 1 |
| 2 | 8-Dimension Profile Bar Chart | A | **15** | 5 | 5 | 5 | 4 | 3 | 1 |
| 3 | Boundary Proximity Gauge | A | **14** | 4 | 4 | 4 | 5 | 2 | 1 |
| 4 | Band Distribution Strip | A | **14** | 4 | 5 | 5 | 4 | 3 | 1 |
| 5 | Score Delta Heatmap Strip | A | **11** | 3 | 4 | 3 | 4 | 2 | 1 |
| 8 | OG Image (Chart of the Day) | OG | **10** | 4 | 5 | 2 | 4 | 3 | 2 |
| 9 | Dimension Delta (Multi-Cycle) | A | **9** | 3 | 3 | 5 | 3 | 4 | 1 |
| 6 | Evidence Source Image | B | **7** | 3 | 3 | 4 | 3 | 3 | 3 |
| 7 | Sector Heat Strip | A | **6** | 2 | 3 | 2 | 3 | 2 | 2 |

---

## Highest-Leverage Graphic: Candidate 1 — Expanded Score-Over-Time Chart

This is the single chart to build first. It:
- Extends code that already exists (ScoreSparkline.tsx) rather than introducing a new subsystem.
- Requires no new data fields — all data lives in `site/public/data/history/<slug>.json`.
- Answers the most common comprehension question for a band-crossing story: "what does this crossing look like as a trajectory, and where does the new score sit relative to the band thresholds?"
- Fits entirely inside an existing component (LeadSignalCard), adding approximately 96px of height only for the highest-severity signals — not on every card.
- Is pure SVG with no JavaScript dependency, consistent with the ScoreSparkline implementation pattern.
- Produces zero editorial judgment in the rendering — the shape of the line is the data.

The design difference from the current sparkline is: (a) wider and taller (480×96 vs 200×52), (b) band-zone fill areas replacing abstract gridlines, (c) labeled x-axis waypoints at key dates, (d) an annotated band-crossing vertical marker in `#fcd34d`, and (e) a score callout bubble at the latest point. All five additions serve legibility for the highest-importance moment in the briefing — the band crossing — and add no weight when the graphic is not rendered (which is most cards, since it appears only on LeadSignalCard for critical/high severity signals with `≥2 scored history events`).

---

## Dark-Theme Dataviz Palette Reference

All graphics should draw from the established token set:

| Use | Token / Hex |
|-----|-------------|
| Background | `#0b1220` (`--color-bg`) |
| Panel fill | `rgba(255,255,255,0.02)–0.05` |
| Grid / track | `rgba(255,255,255,0.07)` |
| Text | `#e8eefb` (`--color-text`) |
| Muted labels | `#b8c6de` (`--color-muted`) |
| Upward delta | `#86efac` (`--color-band-green`) |
| Downward delta | `#fb923c` / `#f87171` |
| Neutral / stable | `#94a3b8` |
| Band crossing marker | `#fcd34d` (`--color-band-yellow`) |
| AWR dimension | `#7dd3fc` |
| EMP dimension | `#c084fc` |
| ACT dimension | `#86efac` |
| EQU dimension | `#fcd34d` |
| BND dimension | `#fb923c` |
| ACC dimension | `#f472b6` |
| SYS dimension | `#34d399` |
| INT dimension | `#a78bfa` |

Band zone fills should use 6–8% opacity on dark bg (e.g. `rgba(248,113,113,0.07)` for Critical) to be visible without overpowering the line chart.

---

## Accessibility and Mobile Requirements

- All SVG graphics: `role="img"`, `<title>` element with full verbal description, `aria-label` on the root element.
- No graphic-only information: every visual insight must also be present in adjacent text or an `aria-label` — no color-only coding without text backup.
- Touch targets on interactive elements (bars with tooltips, gauge dots): minimum 24×24px tap area even if the visual element is smaller.
- Mobile breakpoints: the Expanded Score-Over-Time chart compresses to 240×72px at viewport ≤480px (matching the compact sparkline pattern). The Dimension Profile bars collapse to a narrower track but remain legible. The Boundary Gauge is purely proportional and scales automatically.
- `prefers-reduced-motion`: remove transitions, keep final state visible.
- `prefers-contrast: more`: increase bar opacity to 90%, increase grid line opacity to 20%.

---

## Progressive Disclosure Rules

Consistent with Wave E1 density principles:
1. Graphics for band-crossing or critical/high severity signals: rendered inline, visible by default, because they are load-bearing for comprehension of the day's most important story.
2. Graphics for confirmed / hold entities: behind a `<details>` with a text summary that carries the key number. The graphic elaborates; it does not replace.
3. The Band Distribution Strip (Candidate 4) and Dimension Profile (Candidate 2): both behind `<details>` by default. The summary line carries the key fact; the expanded view provides depth.
4. Evidence images (Candidate 6): always inside the EvidenceLedger section, which is already a secondary/depth section at the bottom of the briefing.

This ensures the reading experience for a subscriber scanning on a phone at `375px` width in under 2 minutes is not degraded — they see the lead signal chart (Candidate 1) and the proximity gauge (Candidate 3) and nothing else that they did not choose to expand.
