# UX Review — Daily Briefing Page Redesign
**Compassion Benchmark / /updates route**
**Date:** 2026-05-19
**Authored by:** UX Designer agent

---

## A. Reference Patterns Worth Borrowing

**1. Axios AM — Smart Brevity opener**
Each story leads with a single bold sentence that is the only sentence you need to read if time is short. Every subsequent sentence earns its presence. Applicable here: the Opening Question should compress the day's core tension into one precise interrogative. It should not be a paragraph. If it takes more than two sentences to ask, it is not sharp enough.

**2. Semafor — "The Scene / The View / Room for Disagreement" layered model**
Semafor physically separates what happened (factual) from what the outlet thinks (editorial) from where legitimate disagreement exists (tension). Applied here: the briefing currently blurs Lead Signal (what happened), Brutal Insight (what we think), and Today's Analysis (editorial synthesis) across three separate components with no visible hierarchy telling the reader which layer they are in. The Semafor model suggests making the layer type visible as a label on each section, not buried in the section heading.

**3. FT Morning Briefing — number-led lede with one chart or stat**
The FT briefing opens with the most consequential number of the day set at display size, then explains it. Applied here: the KPI grid in DailyBriefingHeader is the right instinct but positioned below the thesis and CTA cluster. The single most important number of the day (e.g., "1 band crossing — China: Developing → Critical") should appear at the very top of the page, before CTAs, as a visual anchor. One number. Not four.

**4. Politico Playbook — source-led section attribution**
Playbook opens each item with the attribution ("EXCLUSIVE: Per two senior staffers...") before the finding. Applied here: the Evidence Ledger's current table structure hides the source type. Making source type the leading piece of information for each evidence row — not a column you scan to the right to find — would align with how readers calibrate credibility before reading the finding.

---

## B. Canonical New Section Order

The founder's brief is mostly unambiguous. Two tensions require resolution before implementation:

**Tension 1: Where do Brutal Insight and High Compassion Contrast sit relative to the Opening Question?**
The Opening Question must establish the day's themes before editorial interpretation, not after. Brutal Insight and High Compassion Contrast are interpretive — they are the answer to a question the reader hasn't yet been asked. Resolution: Opening Question comes first (immediately after the Header), then Lead Signal (the factual anchor for that question), then Brutal Insight and High Compassion Contrast (interpretive response). Today's Analysis then synthesizes all three before the reader enters the Signal Stack.

**Tension 2: Where do the legacy sections (Confirmations, Floor Conduct, Math Hygiene, Carries, Holds, Forward Signals) belong?**
The founder's brief addresses the primary named sections. The legacy sections are operational disclosures, not editorial sections. They belong after the Evidence Ledger and before the purchase CTA — grouped under a single "Research Disclosures" heading. They do not compete with Sector Findings or Risk Signals for editorial real estate.

---

### Canonical Section Order

| Position | Section Name | IA Purpose | One-Line Content Brief |
|---|---|---|---|
| 1 | Header | Masthead + coverage KPIs | Date, issue number, one-sentence thesis, single lead-number callout, date nav tabs |
| 2 | Opening Question | Frame the day | Evidence-derived interrogative that names the tension the briefing resolves |
| 3 | Lead Signal | Primary factual anchor | Single most consequential finding, linked to entity and dimension |
| 4 | Brutal Insight | Editorial interpretation of the lead | One interpretive paragraph on what the lead means for the benchmark |
| 5 | High Compassion Contrast | Counterweight / responsible action frame | What responsible action looks like given today's evidence |
| 6 | Today's Analysis | Editorial synthesis | Numbered analytical findings (currently HighlightsSection) — moved from bottom legacy position to near-top |
| 7 | Signal Stack | Full filtered signal feed | All remaining top signals + sector alerts, filterable by category |
| 8 | Score Change Detail | Per-entity evidence record | Full evidence records for entities with score changes (LegacyScoreChangesSection) |
| 9 | Score Movements | Scannable assessed-entity grid | All assessed entities, enriched cards (see Section D) |
| 10 | Evidence Ledger | Source transparency | All primary sources reviewed, with type tags and jurisdictional context |
| 11 | Sector Findings | Cross-sector pattern analysis | Thematic findings by sector (SectorTrendsSection) |
| 12 | Risk Signals | Forward-looking watch items | Emerging risks with entity tags and timeframes (EmergingRisksSection) |
| 13 | Research Disclosures | Operational methodology record | Confirmations table, Floor Conduct, Math Hygiene, Carries, Holds, Forward Signals grouped together |
| 14 | Floor Designations | Registry disclosure | Permanent floor entity registry |
| 15 | Subscribe CTA | Conversion | Score-Watch and weekly digest subscription |
| 16 | Purchase CTA | Revenue | Full report and certified assessment CTAs |
| 17 | Archive nav | Navigation | Link to /updates archive |

**Note on Score Movements position:** If the card enrichment in Section D is implemented, Score Movements can move to position 7 (before Signal Stack) because each card then carries editorial weight. If only the minimal enrichment is built, keep it at position 9 as specified by the founder.

---

## C. Opening Question Component Spec

### Purpose distinction from the existing DailyQuestion

The existing `DailyQuestion` component is a **closing philosophical rotation** — it asks a generic methodology question drawn from a 12-item list, keyed to issue number. It is timeless by design. Its function is to leave the reader with a framework question, not to orient them to today's specific evidence.

The new **Opening Question** is the opposite: it must be specific to the evidence reviewed in this cycle. It cannot be drawn from a rotation. It must be populated by the daily digest pipeline and should fail loudly (or fall back to a visible placeholder) if the field is absent.

### Schema fields

The digest should populate `updates.openingQuestion` as an object:

```
{
  question: string,           // The question itself — one or two sentences max
  themes: string[],           // 2–4 theme slugs, e.g. ["band-crossing", "conflict-arc", "reform-arc"]
  tensionFraming: string,     // One sentence: what two forces are in tension today
  tiedToEntities: string[]    // Entity slugs referenced by the question
}
```

The component renders `question` prominently. `themes`, `tensionFraming`, and `tiedToEntities` are used for:
- Rendering theme chips below the question (visible to user)
- Providing anchor links to the relevant sections (each `tiedToEntities` slug becomes a scroll-link to the Score Change Detail card for that entity)
- QA verification that the opening question is evidence-grounded (if `tiedToEntities` is empty, the question is generalist and should be flagged)

### Visual prominence

- Position: immediately below the Header, before Lead Signal
- The question text renders at `1.35rem` to `1.55rem` (between body and h2 scale), not as an h1
- Left border accent at full height (4px, accent color) — same visual treatment as the thesis in the Header, but wider left padding
- Label above the question: `TODAY'S QUESTION` in the standard uppercase tracking style, muted color
- Theme chips below the question: pill-style, same chip component used in Signal Stack filters — not clickable on mobile, scroll-anchors on desktop
- Entity slugs rendered as small inline links that scroll to the Score Change Detail card for that entity
- No citation line (unlike the closing question which cites the methodology team) — the opening question is presented as the briefing's framing, not an editorial quote

### Fallback behavior

If `updates.openingQuestion` is absent (older briefings): render nothing. Do not fall back to the rotation. The closing question rotation handles that position. Two question components on the same page with different data models would cause confusion.

### Example — 2026-05-19 evidence

Based on the 2026-05-18 digest (the evidence available for the May 19 briefing):

```
question: "When a state supplies 90% of an ally's drone technology and that ally strikes a vessel the state owns — with its own crew aboard — does absorbing the strike without protest confirm the alliance, or expose its cost?"

themes: ["band-crossing", "conflict-arc", "dual-use-supply"]

tensionFraming: "China's BND dimension sits at the intersection of its stated neutrality and its documented material support for Russia's military-industrial complex — the KSL Deyang strike forces that contradiction into the open."

tiedToEntities: ["china", "russia"]
```

This question:
- Names the actual events (KSL Deyang, dual-use supply, the summit)
- Frames the scoring tension (INT consistency vs BND conduct)
- Is falsifiable — China's observable response in the next 48 hours either confirms or weakens the framing
- Links to two entities whose Score Change Detail cards are present in this briefing

---

## D. Score Movement Card Enrichment

### Current card state (ScoreMovementCard.tsx)

The card shows: entity name, index label, status text, published score, arrow, assessed score, delta, band chip, confidence chip, boundary pill.

It answers: "what happened to this score?" It does not answer: "why did it happen?" or "what happens next?"

### Proposed additional fields

**High value — build these:**

| Field | Display | Source |
|---|---|---|
| `movementReason` | 1-line "why this moved" below entity name | Populated from `scoreChanges[n].headline` or `recentAssessments[n].headline` — already present in data for score changes, needs to be passed through to the card |
| `dominantDimension` | Chip showing the dimension that drove the delta, with a signed delta e.g. "BND -0.25" | Populate from `scoreChanges[n].dimensionalChange` or `topSignals[n].dimension` |
| `bandBoundaryDistance` | Small inline text: "0.3pt above Critical" or "1.9pt below Functional" — only shown when distance is ≤ 2pt | Calculated from assessed score and band thresholds; already partially available via `boundaryWatch` boolean |
| `entityProfileLink` | "View entity" link at card end | Already implemented in LegacyScoreChangesSection; missing from ScoreMovementCard |

**Nice to have — defer until after core layout ships:**

| Field | Display | Rationale for deferral |
|---|---|---|
| `sparkline` | Mini 5-cycle delta line (SVG) | Requires historical delta array per entity; not currently in digest shape; new pipeline field needed |
| `nextForwardSignalDate` | "Next signal: May 27" text | Requires forward signals to be linked to entities by slug; currently forward signals are a separate top-level array |
| `interpretationLabel` | "Band crossing" / "Carry-forward" / "First baseline" / "Hold lifted" as a status label | Partially available from `status` field but inconsistently populated; needs digest-side normalization before it's reliable enough to display |

### Card layout with enrichment

The enriched card moves from a single-row flex layout to a two-row layout on desktop:

**Row 1:** Index label (muted caps) | Entity name (linked) | Status label chip
**Row 2:** Movement reason text (muted, 0.85rem, max 2 lines)
**Right cluster:** Dominant dimension chip | Published → Assessed | Delta | Band | Confidence | Boundary distance | Entity link

On mobile: stacked single column, movement reason below entity name, scores and chips in a flex-wrap row below.

### Threshold for moving Score Movements up the page

If `movementReason` and `dominantDimension` are both populated for at least the entities that have a non-zero delta, Score Movements can move from position 9 to position 7 (before Signal Stack). The card then carries enough editorial weight to reward reading before the full signal feed. Without those two fields, the grid is a reference table — it belongs lower.

---

## E. Evidence Ledger — Additional Affordances

### Current state

EvidenceLedger.tsx infers source type from domain matching and renders: domain, type chip, entity, dimension, and "Open" link. It already has the right column structure. The gaps are:

**1. `sourceDate` — date of the source document, not the briefing date**
Currently absent. Required for credibility auditing: a May 18 briefing citing a January 2026 NGO report should display that distinction. Add as a column between "Entity" and "Dimension." Format: "Jan 2026" (month-year only). Source: `evidence[n].date` field in the digest, currently not consistently populated.

**2. `primaryVsSecondary` — is this a direct source or a secondary report about a primary source?**
High value. A Reuters article reporting on an EU Council document is secondary; the EU Council document itself is primary. Add a "Primary / Secondary" flag as a sub-label inside the Type chip, or as a separate column if the table has room. Source: `evidence[n].tier` already partially used in EvidenceLedger (`row.tier`); needs standardized values of "primary" | "secondary" | "tertiary" in the digest.

**3. `jurisdictionalFlag` — which jurisdiction does this source speak to?**
Useful for country-index assessments where a domestic press report, an EU institutional document, and a UN expert letter on the same entity carry very different evidential weight. Display as a 2-letter country/org code chip (e.g., "EU", "UN", "US") in the Source column. Source: new field `evidence[n].jurisdiction` needed in digest.

**4. `methodologyAnchorLink`**
When a piece of evidence is the anchor instance for a methodology category (e.g., the EU sanctions package for `state-facilitation-of-allied-war-crimes-via-dual-use-supply`), add an inline link to `/methodology` with the category fragment. This makes the Evidence Ledger a live methodology cross-reference, not just a source list. Source: `evidence[n].methodologyCategory` field in digest; already exists for some score change entries.

**What not to add now:** Do not add "confidence per source" as a column. That judgment belongs in the Score Change Detail card at the entity level, not in the flat evidence ledger. Adding it to the ledger creates a false precision impression (source confidence is distinct from finding confidence) and would require either hardcoded values or a new digest field with significant pipeline overhead.

---

## F. Final Compact Wireframe

Page outline in canonical order. Each entry: Section Name — 3-word descriptor.

```
01  HEADER                    — masthead, KPIs, nav
02  OPENING QUESTION          — evidence-grounded interrogative
03  LEAD SIGNAL               — most consequential finding
04  BRUTAL INSIGHT            — editorial interpretation, lead
05  HIGH COMPASSION CONTRAST  — responsible action frame
06  TODAY'S ANALYSIS          — numbered editorial synthesis
07  SIGNAL STACK              — filterable signal feed
08  SCORE CHANGE DETAIL       — per-entity evidence records
09  SCORE MOVEMENTS           — enriched assessed-entity grid
10  EVIDENCE LEDGER           — sourced primary links
11  SECTOR FINDINGS           — cross-sector pattern analysis
12  RISK SIGNALS              — forward-looking watch items
13  RESEARCH DISCLOSURES      — confirmations, hygiene, holds
14  FLOOR DESIGNATIONS        — registry disclosure panel
15  SUBSCRIBE CTA             — score-watch conversion
16  PURCHASE CTA              — report / advisory upsell
17  ARCHIVE NAV               — previous briefings link
```

---

## Implementation Assumptions for Engineering

1. The `openingQuestion` object field in the digest JSON must be added by the research pipeline before the Opening Question component can be built. The component should render null if the field is absent — no fallback rotation.

2. The `DailyQuestion` (closing question rotation) is retired from its current position. It either moves to a very bottom decorative position (after Archive Nav) or is removed entirely. Do not keep it in two places.

3. `movementReason` for ScoreMovementCard is already available in the data for entities that have a `scoreChanges` entry — it maps to `headline`. The enrichment work is primarily passing that field through the merge logic in ScoreMovementDashboard, not new pipeline work.

4. `dominantDimension` with signed delta requires a new field in the digest shape: `dimensionalChange: { dimension: string, delta: number }[]` on each score change. The 2026-05-18 digest has this data in prose ("BND 2.0 → 1.75") but not in a structured field. Pipeline change required.

5. The legacy sections (Confirmations, Math Hygiene, Carries, Holds, Forward Signals) are grouped under a "Research Disclosures" section heading with a visual separator. They do not get new section headers inside that grouping — their existing rendering is preserved. This is a positional move only, no component changes needed.

6. `HighlightsSection` (Today's Analysis) is moved from its current position after the legacy sections to position 6 in the new order. The component itself is unchanged. The move is in DailyBriefing.tsx render order only.
