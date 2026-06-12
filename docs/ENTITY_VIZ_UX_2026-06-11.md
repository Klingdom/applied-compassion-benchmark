# ENTITY_VIZ_UX_2026-06-11
## Entity Page — UX Additions and Infographics: Ranked Proposal
**Date:** 2026-06-11
**Author:** UX Designer Agent
**Scope:** Entity detail page (EntityDetail.tsx, renderEntityPage.tsx) — interaction, comparison, at-a-glance orientation, progressive disclosure, mobile. Does NOT cover chart grammar internals (dataviz-architect) or evidence copy (knowledge-architect). Proposal only — no site code modified.

---

## Constraints Honored

- Static export (Next.js `output: 'export'`): all data available at build time; no client fetching, no SSR
- Dark-theme-only: design tokens from globals.css — `#0b1220` bg, `#e8eefb` text, `#b8c6de` muted, band color set
- Wave E1 density discipline: depth behind `<details>`, default view stays scannable
- Dead-link discipline: no links rendered unless the target is confirmed to exist
- Link-only evidence-image policy: own-data visuals only; no third-party or AI imagery
- Independence policy: no hype, no entity-controlled signals; all visuals derive mechanically from JSON
- Data available at build time: `entity.scores` (8 dims), `entity.composite`, `entity.band`, `entity.rank`, `entity.indexTotal`, per-index JSON (sector/peer rows), `getEntityHistory()` (sparkline, tier counts, events), `DIMENSIONS` (colors, descriptions)

---

## Current Page Composition (Summary)

```
Hero
  — breadcrumb → name → Band pill + rank/total + metadata
  — composite score widget (isolated number, no field context)
  — "View score history →" link (conditional)
Evidence freshness stamp (conditional)
EntityEvidenceCard — assessment record (conditional)
Floor-designation disclosure (conditional)
Dimension bars grid — 8 cards, bar fill, score/5
Entity-scoped CTAs — Score-Watch, badge embed, purchase, newsletter
Footer nav
```

The current hero composite number is isolated — a reader sees "41.2 / 100" with no answer to "compared to what?" The dimension bars are present but the 8-dimensional shape is not visible at a glance. Peer/sector position is completely absent. History exists on a separate page but is not surfaced in the entity hero. Empty/short-history states are unspecified for the hero area.

---

## Proposals (ranked by priority)

Priority formula: (Impact + Strategic Alignment + Learning Value + Confidence) − Effort − Risk. All scores 1–5.

---

### 1. Composite Position Strip — "Compared to What" Hero Anchor

**Priority: 17**

**User need:**
Every reader's first question upon seeing a score is contextual: "Is 41.2 good or bad?" Today the hero gives the number but not the answer. The Band pill helps but does not show field position.

**Pattern:**
A horizontal band-position strip (BandPositionStrip.tsx exists but is not wired to EntityDetail) placed directly below the composite score widget in the hero section. Shows a 0–100 track segmented by the five band zones, with a dot marker at the entity's score and a secondary marker at the index median. Labels: entity score + band name at the dot; "Index median: NN" at the median marker in muted text; band zone fills at 12% opacity in their respective band colors. Width scales to container; height ~32px including label row. No JS required — pure SVG, build-time data from index JSON `meta.medianScore`.

**Where on page:**
Inside the hero composite score widget, immediately below the large score number and "out of 100" label. Extends the existing widget without adding a new section.

**Data used:**
- `entity.composite` — entity dot position (exists)
- `entity.band` — dot color (exists)
- Index JSON `meta.medianScore` — median marker (exists: `fortune-500.json`, `ai-labs.json`, etc. all carry `medianScore`)
- BandPositionStrip.tsx — SVG primitive already built

**Density/state handling:**
- Always rendered (no empty state — every entity has a composite score)
- Composite = 0 (floor designation): dot sits at left edge of Critical zone — informative, not broken
- Mobile: strip compresses to full container width automatically (BandPositionStrip already handles this)

**Explicit additions needed:**
Wire `meta.medianScore` from index JSON through `renderEntityPage.tsx` → `EntityDetail` props → hero widget. Add a second SVG marker for the median. Labels: entity dot labeled with score + band name; median marker labeled "Index median" in `text-muted`.

**Ratings:**
Impact: 5 | Align: 5 | Learn: 4 | Conf: 5 | Effort: 2 | Risk: 1 → **Priority: 16**

---

### 2. Sector / Peer Rank Callout — "Among Your Peers" Context Row

**Priority: 15**

**User need:**
A reader evaluating a Fortune 500 company with composite 41.2 may be less interested in its absolute rank (#312 of 447) than in how it sits within its sector (Healthcare, Technology, etc.). Rank 312 of 447 says little; "Rank 4 of 22 in Technology sector" is actionable. This is the "compared to what" answer for institutional research users.

**Pattern:**
A compact one-line context row, inserted between the band pill row and the history link in the hero. Shows:
- Sector rank and count: "Rank 4 of 22 in Technology" — derived by filtering the index JSON to matching sector and sorting by composite
- Percentile within sector: "Top 18%" in muted text
- Peer band distribution: a 5-cell inline band strip (not a full BandDistributionBar — just 5 colored dots or cells proportional to sector band counts) showing how the entity's sector distributes
- On mobile: sector rank and percentile only; band strip deferred to a `<details>` expansion

**Where on page:**
Hero section, below the rank/metadata row, above the history link. Adds approximately one line of text + an inline micro-strip (~20px).

**Data used:**
- Index JSON `rankings[]` — filter by `sector` or `region` or `country` field depending on entity kind (exists; all indexes carry a grouping field: `sector` for F500/AI/Robotics, `region` for cities, `country` for global cities)
- `entity.metadata.sector` (or `.region`, `.country`) — grouping key (exists)
- Computed at build time in `renderEntityPage.tsx` by filtering the index JSON array

**Density/state handling:**
- If sector has fewer than 3 peers: row shows "No sector peers (unique classification)" in muted text and renders nothing else
- If no grouping metadata (some entity kinds): row is not rendered
- Empty sector: not rendered

**Ratings:**
Impact: 5 | Align: 5 | Learn: 4 | Conf: 4 | Effort: 3 | Risk: 1 → **Priority: 14**

---

### 3. Dimension Shape Summary — Strength / Gap Call-Out

**Priority: 14**

**User need:**
The 8-dimension bar grid is thorough but requires scanning all 8 cards to identify the entity's best and worst dimensions. A first-time reader cannot see the entity's profile shape without reading every card. The question "where is this entity strongest and weakest?" is the most common analytical question for the dimension section, and it currently takes 30–45 seconds of reading to answer.

**Pattern:**
A narrow 2-column summary row placed immediately above the dimension bars grid, inside the "Compassion framework" section. Left column: "Strongest" — the dimension(s) with highest score, shown as a colored badge with the dimension code + score (e.g., "INT 4.8"). Right column: "Biggest gap" — the dimension with lowest score, shown as a muted badge with code + score (e.g., "EQU 1.2"). If more than one dimension ties for highest/lowest, show up to two. Labels are in the existing `text-[0.78rem] uppercase tracking-[0.12em] text-muted` eyebrow style; badges use dimension brand colors from `DIMENSIONS`. No additional data required — the same `entity.scores` object used by the bars is filtered to find max/min.

Additionally: the DimensionProfileBar.tsx component (already built) can be placed in a `<details>` disclosure below the 2-column summary, with summary text "View all 8 dimensions at a glance →". This gives analysts a compact visual overview without adding vertical weight for readers who only want the text grid.

**Where on page:**
At the top of the dimension bars section, between the section intro paragraph and the 2-column card grid. Adds approximately one row (~48px) at default state. DimensionProfileBar inside `<details>` adds zero height until opened.

**Data used:**
- `entity.scores` — all 8 dimension scores (exists; same object driving the current bars)
- `DIMENSIONS` — dimension codes, names, colors (exists)
- DimensionProfileBar.tsx — already built (builds from same scores input)

**Density/state handling:**
- All scores equal (rare edge case): no "Strongest / Biggest gap" difference meaningful — row is not rendered; `<details>` still available
- Floor designation (all scores at 1.0): both columns show "All dimensions at floor" in band-red; `<details>` renders the flat profile bar
- Mobile: the 2-column row wraps to 2 lines naturally; DimensionProfileBar inside `<details>` is full-width

**Ratings:**
Impact: 4 | Align: 4 | Learn: 5 | Conf: 5 | Effort: 2 | Risk: 1 → **Priority: 15**

---

### 4. Score History Thumbnail in the Hero — "Has This Changed?" Signal

**Priority: 13**

**User need:**
A researcher returning to an entity page wants to know immediately whether the score is stable, trending up, or trending down — before they scroll to the assessment record section. The history link ("View score history →") exists in the hero but gives no preview. The SparkLine exists on the history page but not here. For entities with any scored events, the trajectory is the most important quick-read signal.

**Pattern:**
When `historyHref` is present AND the entity has at least 2 scored events in history, render the existing CompositeSparkline in the hero section. Placement: inline next to or below the composite score widget (the right-side widget currently has empty vertical space below "out of 100"). Size: CompositeSparkline at `height=52, width=200` (its default compact size) — matching the history page sparkline. No labels beyond the existing current-value label the component already renders. Color: CompositeSparkline already derives line color from net direction (green/orange/muted).

If the entity has exactly 1 scored event: a neutral horizontal line with a single dot at the score value — same visual idiom as "stable confirmed." If 0 scored events: nothing rendered — the composite score widget is unchanged.

**Where on page:**
Inside the composite score widget panel (the rounded card already exists at `min-w-[180px]`). Below the "out of 100" label, above the widget's bottom padding. Adds approximately 52px of height to the widget, which already has internal padding.

**Data used:**
- `getEntityHistory(entity.slug)` — already called in `renderEntityPage.tsx` and available; events array used for sparkline
- CompositeSparkline.tsx — already built; takes `events`, `currentComposite`, `entityName`
- Gate condition: `history && history.events.filter(e => e.newComposite !== null).length >= 2`

**Density/state handling:**
- 0 history events: widget is unchanged (existing behavior)
- 1 event: render a single dot + flat line
- `history === null`: widget is unchanged
- Mobile: CompositeSparkline uses `width="100%"` — scales to card width correctly

**Ratings:**
Impact: 4 | Align: 4 | Learn: 4 | Conf: 5 | Effort: 2 | Risk: 1 → **Priority: 14**

Adjusting for modest visual add (not transformative): **Priority: 13**

---

### 5. Subdimension Behavioral Anchor Expansion — Progressive Detail on Each Dimension Card

**Priority: 12**

**User need:**
A reader who sees "Accountability: 1.5 / 5.0" has a score but no interpretive content. What does 1.5 mean behaviorally? The `DIMENSIONS` data carries five named anchor strings per subdimension per dimension — a 1-to-5 rubric with behavioral descriptions. This is the most valuable interpretive content the benchmark has and it is completely absent from the entity page. The methodology page links exist but require navigation away.

**Pattern:**
Each dimension card in the grid gets a `<details>` element appended below the progress bar. Summary text: "What does 1.5 mean for Accountability? ›" in `text-[0.82rem] text-accent`. When opened, displays:
- A compact anchor list: for each of the 5 subdimensions within the dimension, one row showing: the subdimension name in muted text + the behavioral anchor at the entity's score level (rounded to nearest integer, 1–5) in `text-text`. The relevant anchor is highlighted; adjacent anchors are shown in lower opacity to indicate the scale.
- Optional: a "next threshold" row — the behavioral description at score+1 with a small "What would move this score →" label.
- Format: ~5 rows × 1 line = approximately 80–100px tall when expanded. Closed height: one summary line (~24px).

**Where on page:**
Inside each dimension card, below the progress bar. `<details>` default closed — zero height addition to the existing grid. Only the summary text "What does N.N mean?" is visible in default state, occupying one line per card.

**Data used:**
- `DIMENSIONS[n].subdims[].name` and `.anchors[]` — all 5 subdimensions × 5 anchors × 8 dimensions (exists in dimensions.ts)
- `entity.scores[dim.code]` — to select the relevant anchor row (exists)

**Density/state handling:**
- Floor designation (score 1.0): shows anchor 1 text for all subdimensions — valid, informative
- Score 5.0: shows anchor 5 text — "exemplary" behavioral description
- Mobile: the `<details>` is natively collapsible; the expanded text wraps within the card's `p-4 sm:p-5` padding
- Empty state: N/A — DIMENSIONS data is always present

**Independence check:** Anchors are fixed strings from methodology data. Entity cannot modify what their anchor text says. The benchmark writes the anchors; the score determines which one is displayed.

**Ratings:**
Impact: 4 | Align: 4 | Learn: 5 | Conf: 4 | Effort: 3 | Risk: 1 → **Priority: 13**

Marking **Priority: 12** due to slightly higher UX complexity per-card interaction.

---

### 6. Index Field Distribution — "Where This Entity Sits in the Whole Field"

**Priority: 11**

**User need:**
A reader evaluating a Fortune 500 company ranked #89 does not know whether that rank is impressive or unremarkable without knowing that 52 of 447 companies are Critical. The BandDistributionBar component already exists but is not used on entity pages. A one-line context statement and a compact distribution bar provide the field view a researcher needs to calibrate severity.

**Pattern:**
A collapsible `<details>` section placed at the bottom of the dimension section or the top of the CTAs section (not in the hero — this is supporting context, not primary signal). Summary line (always visible, default-closed): "Field context: {N}% of {indexLabel} entities are in {band} band" — computed from index JSON `meta.bands`. When expanded, the full BandDistributionBar renders at container width, with the entity's position marked by a small dot overlay at their composite score on the stacked bar.

The always-visible summary line is the key addition. The BandDistributionBar inside `<details>` adds visual depth for analysts who want it.

**Where on page:**
Between the dimension bars section and the CTA section. Adds one summary text line (~24px) in default state; the CTA section is not pushed unless `<details>` is opened.

**Data used:**
- Index JSON `meta.bands[]` (count and pct per band — exists in all 7 index files)
- `entity.composite` — to position the entity dot on the distribution bar
- BandDistributionBar.tsx — already built; accepts `counts` prop directly
- `entity.indexTotal` and `entity.band` — already in EntityDetail props

**Density/state handling:**
- All bands have entities: BandDistributionBar renders normally
- Band with 0 entities: segment renders at 0 width (BandDistributionBar already handles this with `s.w > 0` guard)
- Mobile: BandDistributionBar renders at full container width, band-zone fills remain legible at narrow widths

**Ratings:**
Impact: 3 | Align: 4 | Learn: 4 | Conf: 5 | Effort: 2 | Risk: 1 → **Priority: 13**

Marking **Priority: 11** given the `<details>` default-closed approach limits daily-reading impact.

---

### 7. Short-History State — "Data Is New" Orientation Notice

**Priority: 9**

**User need:**
Entities with 0–2 scored history events present a different interpretive context than entities with 12+ events. A composite score of 41.2 based on one recent scored event carries different weight than the same score confirmed across 8 cycles. Readers currently have no signal about whether a score is newly established or long-confirmed. For a new entity added to the index, showing a sparkline with one dot is potentially misleading (it looks like a stable baseline when it is actually a single measurement).

**Pattern:**
A one-line context stamp, rendered conditionally in the hero section only when `history.totalEventCount < 3` (or `history === null`). Text: "First assessed {date} — score has {N} confirmation{s}. Short history: interpret with caution." Styled in the existing evidence freshness stamp idiom — small muted text with a neutral indicator dot. Links to methodology page section on evidence confidence weighting.

For entities with `history === null` (no history file at all): a different variant: "Assessment basis: initial scoring only. Score watch and history page not yet available." This replaces the current implicit state (no indicator at all) with an honest disclosure.

**Where on page:**
Hero section, below the rank/metadata row, where the `historyHref` link currently sits. When `historyHref` is null and history is shallow, this notice replaces that area. When `historyHref` exists and history is deep (3+ events), nothing is shown here (current behavior preserved).

**Data used:**
- `history.totalEventCount` — already in `renderEntityPage.tsx`
- `history.firstEventDate` (or `history.events` chronological sort) — available from `getEntityHistory()`
- `historyHref` — already a prop; `null` indicates no history page

**Density/state handling:**
- 0 events / null history: "Initial scoring only" variant
- 1–2 events: "Short history" variant with first-assessed date
- 3+ events: no notice — current behavior
- Mobile: inline text, no layout impact

**Independence check:** The notice applies mechanically by event count. No entity can suppress or request this disclosure.

**Ratings:**
Impact: 3 | Align: 4 | Learn: 4 | Conf: 4 | Effort: 2 | Risk: 1 → **Priority: 12**

Marking **Priority: 9** because it only appears for a minority of entities and is a disclosure pattern rather than a comprehension-enhancing graphic.

---

## Priority Table

| Rank | Idea | One-line | Effort |
|------|------|----------|--------|
| 1 | Composite Position Strip | Wires existing BandPositionStrip into hero widget with index-median second marker; answers "is this score good?" in 2 seconds | Low (2) |
| 2 | Dimension Shape Summary | Top-of-grid best/worst callout badges + DimensionProfileBar inside `<details>`; answers "where is this entity strongest?" without reading 8 cards | Low-Medium (2/3) |
| 3 | Score History Thumbnail in Hero | CompositeSparkline inside composite widget when ≥2 events; shows trajectory before reading | Low (2) |
| 4 | Sector / Peer Rank Callout | Build-time peer filter → sector rank + percentile row in hero; answers "among peers of same type, where do they sit?" | Medium (3) |
| 5 | Subdimension Anchor Expansion | `<details>` on each dimension card revealing behavioral anchor text at the entity's score level; interprets what a number means | Medium (3) |
| 6 | Index Field Distribution | Always-visible summary line + BandDistributionBar in `<details>` between dimension section and CTAs | Low (2) |
| 7 | Short-History Orientation Notice | Conditional disclosure in hero for entities with <3 scored events; sets interpretive context honestly | Low (2) |

---

## Placement Map

```
HERO
├── Composite score widget
│     ├── [large number]
│     ├── [PROPOSAL 3] CompositeSparkline (conditional: ≥2 events)
│     └── [PROPOSAL 1] BandPositionStrip with entity dot + median marker
├── Band pill + Rank row
├── [PROPOSAL 4] Sector/Peer rank callout row
└── [PROPOSAL 7] Short-history notice OR "View score history →" link

DIMENSION SECTION
├── [PROPOSAL 2] Strength/Gap summary row (2 badges)
├── [PROPOSAL 2] DimensionProfileBar inside <details>
└── 8 dimension cards (existing)
     └── [PROPOSAL 5] <details> with subdimension anchor text on each card

BETWEEN DIMENSION SECTION AND CTAs
└── [PROPOSAL 6] Field distribution summary line + BandDistributionBar in <details>

CTA SECTION (unchanged)
```

---

## States and Edge Cases

| Surface | State | Behavior |
|---------|-------|----------|
| BandPositionStrip | `composite === 0` | Dot at left edge of Critical zone — valid |
| BandPositionStrip | No `meta.medianScore` in index | Renders without median marker; no error |
| Sector/Peer callout | Sector has <3 peers | "No peer group (unique classification)" in muted text |
| Sector/Peer callout | Entity kind has no sector field (e.g. US States) | Row not rendered |
| Score sparkline in hero | 0 events | Sparkline not rendered; widget height unchanged |
| Score sparkline in hero | Exactly 1 event | Single dot + flat horizontal line |
| Dimension anchor expansion | Score 0 (floor) | Anchor 1 text; shows "behaviors at this level" |
| Dimension anchor expansion | Score 5.0 | Anchor 5 text; "exemplary" anchor |
| Field distribution | Band with 0 entities | Segment omitted (BandDistributionBar already handles) |
| Short-history notice | `history === null` | "Initial scoring only" variant |
| Short-history notice | `totalEventCount >= 3` | Not rendered |

---

## Assumptions That Affect Implementation

1. **Median score availability:** All 7 index JSON files carry `meta.medianScore`. Confirmed for ai-labs.json (`"medianScore": 46.1`). The renderEntityPage.tsx orchestrator would need to import the relevant index JSON at build time to extract `medianScore` alongside the entity record. This is already the pattern used by BandDistributionBar.tsx (which imports all 7 index files).

2. **Sector peer computation:** The peer rank for Proposal 4 requires filtering the index JSON `rankings[]` array by `sector` (or `region`, `country`) at build time. This computation runs during page generation in `renderEntityPage.tsx`, not in a client component. The result — `sectorRank`, `sectorTotal`, `sectorPercentile` — would be passed as new props to EntityDetail. This is entirely feasible within the static export constraint; identical pattern to how `entity.indexTotal` is already derived.

3. **CompositeSparkline in hero:** The CompositeSparkline is currently a `"use client"` component (it uses SVG transforms that could in principle be server-rendered, but the file is marked client). Placing it inside the hero section means the hero widget subtree requires client hydration. This is acceptable given the sparkline is already client-rendered on the history page, but frontend should confirm the hydration boundary does not cause flicker on the composite score widget. If it does, the sparkline could be made a server component (it uses no browser APIs — it is pure SVG math).

4. **Subdimension anchor expansion (Proposal 5):** The `<details>` HTML element is natively collapsible without JS, consistent with the existing HistoryTimeline compaction pattern. The expanded anchor content is rendered in the static HTML, ensuring it is indexable by Pagefind and accessible to screen readers. No JS dependency is introduced.

5. **IndexTotal for field distribution:** `entity.indexTotal` is already available as a prop. The band counts needed for BandDistributionBar are available from the index JSON `meta.bands` (or the `bands` top-level array in the JSON — both are present in ai-labs.json and fortune-500.json). The orchestrator can pass a precomputed `BandCounts` object as a new prop rather than having EntityDetail import the index file directly.

---

## What to Hand Off to Other Agents

- **Dataviz-architect:** Internal chart grammar for BandPositionStrip with dual-marker (entity + median), the DimensionProfileBar currently in `<details>`, and the in-widget sparkline size specification. This proposal specifies placement and trigger conditions; dataviz-architect owns the SVG mark choices, scale, and annotation position.
- **Knowledge-architect:** The behavioral anchor text labels in Proposal 5 are from DIMENSIONS. The "what would move this score" framing for the "next threshold" callout needs copy guidance (format, length, tone) from knowledge-architect. The short-history orientation notice copy (Proposal 7) also needs a tone review.
- **Frontend engineer:** Proposal 4 (sector peer computation) requires a build-time data transformation addition to renderEntityPage.tsx. Proposals 1 and 6 require wiring existing SVG primitives with new props. Proposals 3 and 5 require component-level additions only (no new data flow).
