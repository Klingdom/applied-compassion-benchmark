# Entity Detail — Knowledge-Acquisition & Comprehension Additions

**Author lens:** Knowledge Architect (comprehension / retention)
**Date:** 2026-06-11
**Surface reviewed:** `site/src/components/entity/EntityDetail.tsx`, `renderEntityPage.tsx`, `EntityEvidenceCard.tsx`, `CompositeSparkline.tsx`, `site/src/data/dimensions.ts`, `site/src/lib/scoring.ts`, `site/src/types/entity-history.ts`
**Scope:** Structure, format, and inline teaching only. No pixels (UX owns), no chart grammar (dataviz owns), no CTA persuasion (conversion owns). Proposal only — no site code modified.

---

## The core comprehension gap

A first-time reader lands on an entity page and sees three opaque numbers with no on-page schema:

1. **A composite "out of 100"** (`EntityDetail.tsx:144`) — but the page never says how it is built from the 8 dimensions. The actual formula in `scoring.ts` is non-obvious and load-bearing: `baseComposite = ((avgDim − 1) / 4) × 100`, **plus** an *integration premium* of up to **+10** that is *gated three ways* (consistency std-dev bands → `1.0 / 0.75 / 0.4 / 0.1`; a weakness penalty of `−0.2` per dimension below 4.0; and **zeroed entirely if any dimension is a harm flag**). Nothing on the page lets a reader reconstruct or even sense this. Two entities with the same dimension average can differ by 10 points and the reader cannot see why.
2. **A band word** ("Critical", "Functional"…) rendered by `<Band>` (`EntityDetail.tsx:110`) — but `BAND_DESCS` (the plain-language meaning, already authored in `dimensions.ts:582`) is **never shown on the entity page**. The reader sees the label, not the definition.
3. **Eight three-letter codes** — AWR, EMP, ACT, EQU, BND, ACC, SYS, INT — used as bare badges in the floor-designation block (`EntityDetail.tsx:259`) with `title` tooltips only (invisible on mobile/touch, invisible to scanners). `dimension.desc` exists and is shown in the bars (`:356`) but the *codes* elsewhere are undefined jargon.

The page has rich, real, verbatim-sourced substance (dimension descs, behavioral anchors, BAND_DESCS, history events with citations) — but it is **not assembled into a comprehension ladder**. A scanner cannot answer "is this good or bad, and why?" in 5 seconds, and a 3-minute reader cannot leave able to explain the score to a colleague.

Below are 6 ranked additions, each reusing **only existing data** (no fabrication), respecting static export and the independence policy.

---

## Idea 1 — "Explain the number": the composite math as a visual breakdown

**What the reader will understand after:** Exactly how this entity's 8 dimension scores produce its /100 composite — that the score is a *base average mapped to 0–100* plus a *bonus for being consistently good*, and crucially **why an entity with decent dimensions can still score low** (premium withheld) or **why a harm flag collapses the score** (premium zeroed). This is the single biggest "aha" available on the page.

**Device / format:** A horizontal stacked accumulator bar with three labeled segments, rendered build-time as inline SVG (no client JS):
`Base score [((avg−1)/4)×100] → + Integration premium [computed] → = Composite`.
Below it, a one-line plain-language sentence templated from the *actual* computed values, e.g.:
> "Eight dimensions average **1.4 / 5**, which maps to a base of **10.2**. No integration premium was added because **consistency and weakness gates** applied. Final: **10.2 / 100**."

When `integrationPremium === 0` because of a harm flag, the sentence names that explicitly ("the premium is withheld whenever any dimension hits a harm flag") and links to `/methodology`. Wrap the full derivation (the std-dev band table, the −0.2-per-weak-dimension rule) in `<details>` to honor Wave E1 density.

**Placement:** Directly under the composite card in the hero (`EntityDetail.tsx:140-146`), or as the first block of the dimension section (`:319`). Co-locate with the number it explains.

**Real data used:** `entity.scores` (8 dims), `scoring.ts` `computeCompositeFromDimensions` / `calcScores` (already exports `integrationPremium`), `entity.composite`. All build-time.

**Independence check:** PASS. Pure mechanical explanation of the published formula; no judgment beyond what the math states.

| Impact | Strat. Align | Learning | Confidence | Effort | Risk | **Priority** |
|---|---|---|---|---|---|---|
| 5 | 5 | 5 | 5 | 3 | 1 | **16** |

---

## Idea 2 — Inline band meaning + the 5-band ladder ("where this entity sits")

**What the reader will understand after:** What this band *means* in words (not just a colored label), and where it falls on the full Critical → Exemplary ladder — so the band becomes a position on a known scale, not an isolated adjective. Teaches the schema once, reusable everywhere.

**Device / format:** A compact 5-segment band ladder (Critical / Developing / Functional / Established / Exemplary) with the entity's segment highlighted and its composite plotted on it, plus the matching `BAND_DESCS` sentence rendered as a one-line gloss directly beneath the `<Band>` chip. The ladder also silently teaches the score cutoffs (≤20, ≤40, ≤60, ≤80) from `getBand` so the reader internalizes the scale.

**Placement:** Hero, immediately adjacent to the existing `<Band level={bandLevel} />` (`EntityDetail.tsx:110`). This is the 5-second-test fix.

**Real data used:** `entity.band`, `entity.composite`, `BAND_DESCS` (`dimensions.ts:582` — already written, currently unused on this page), `getBand` cutoffs (`scoring.ts:79`).

**Independence check:** PASS. `BAND_DESCS` is existing neutral copy; rendering it adds no new claim.

| Impact | Strat. Align | Learning | Confidence | Effort | Risk | **Priority** |
|---|---|---|---|---|---|---|
| 5 | 5 | 5 | 5 | 2 | 1 | **17** |

---

## Idea 3 — "If you remember one thing" anchor + plain-language why-this-score

**What the reader will understand after:** The single retainable takeaway for this entity, framed as cause→effect from real evidence — the sentence they could repeat to a colleague an hour later. This is the retention hook the page currently lacks entirely.

**Device / format:** One bordered callout near the top, with a fixed label ("If you remember one thing") and a templated, evidence-grounded line assembled deterministically from existing data — **no new prose, no AI hype**:
- Strongest and weakest dimension by name (from `entity.scores` + `DIMENSIONS`), e.g. *"Strongest: Awareness 1.8 · Weakest: Accountability 1.1."*
- The most recent Tier-A scored headline verbatim from `history.latestScoreChange.headline` (already verbatim-sourced) as the "why," with its `citationUrl` as "Source ↗".
- Band position in words.

For floor-designated entities, reuse `floorDesignation.rationale` (`EntityDetail.tsx:229`) as the anchor instead. Strictly factual, evidence-first; no adjectives the data does not support.

**Placement:** Between the hero and the evidence freshness stamp (`EntityDetail.tsx:150`), so it is the first *interpretive* thing after the raw numbers — top of the 30-second rung.

**Real data used:** `entity.scores`, `DIMENSIONS`, `history.latestScoreChange` (headline + citationUrl), `floorDesignation.rationale`.

**Independence check:** PASS — provided copy stays templated/factual (min/max dims, verbatim headline). Must avoid editorializing; flag to UX/independence reviewer that the template wording is locked.

| Impact | Strat. Align | Learning | Confidence | Effort | Risk | **Priority** |
|---|---|---|---|---|---|---|
| 5 | 4 | 5 | 4 | 3 | 2 | **13** |

---

## Idea 4 — Dimension code legend + "what would move this score" anchor reveal

**What the reader will understand after:** What every three-letter code means (killing AWR/EQU/INT jargon debt site-wide), and concretely *what behavior the entity would need to demonstrate to score one level higher* — turning an abstract "1.5/5" into a legible next-rung target. Teaches that scores are behavioral-anchor based, not opinions.

**Device / format:** Two parts.
(a) A one-time **code legend** strip at the top of the dimension section (`EntityDetail.tsx:337`): `AWR Awareness · EMP Empathy · …` so every code elsewhere on the page (floor drivers, history) is decodable. Cheap, high-coverage.
(b) On each dimension card, a `<details>` "What this score means" that shows the **current behavioral anchor** for that score and the **next anchor up** — pulled from `DIMENSIONS[].subdims[].anchors` (the 5-level anchors already in `dimensions.ts`). Even at dimension granularity, showing the anchor band the score lands in (`Math.round(score)−1` index) makes "1.5/5" mean *"problems discovered only through crises; next level is reactive detection with pathways."*

**Placement:** Dimension section (`EntityDetail.tsx:318-383`). Legend above the grid; anchor reveal inside each existing card.

**Real data used:** `DIMENSIONS[].code/name`, `DIMENSIONS[].subdims[].anchors`, `entity.scores`. All build-time.

**Independence check:** PASS. Anchors are the published rubric; mapping a score to its anchor band is mechanical.

| Impact | Strat. Align | Learning | Confidence | Effort | Risk | **Priority** |
|---|---|---|---|---|---|---|
| 4 | 4 | 5 | 4 | 3 | 1 | **13** |

---

## Idea 5 — Dimension profile shape: "balanced vs. spiky" callout (the consistency story)

**What the reader will understand after:** *Why* the integration premium was full, partial, or zero — by seeing the entity's dimension profile as a **shape**: a flat/balanced profile earns the premium; a spiky one is penalized; any harm-flag zero collapses it. This makes the std-dev consistency gate from `scoring.ts:19-23` intuitive without a single formula.

**Device / format:** A one-line verdict derived from the same std-dev the scorer uses, mapped to plain words — "Balanced profile (low spread) — earns the full consistency multiplier" vs. "Uneven profile — consistency multiplier reduced." Pair with the existing dimension bars (already sorted-friendly) and a single highlighted marker on the weakest dimension labeled "drags the profile." Pure derived text + reuse of existing bars; **dataviz owns** any radar/shape chart — this idea contributes the *interpretation layer*, not the chart.

**Placement:** Header of the dimension section (`EntityDetail.tsx:321-335`), as a one-sentence lead-in that frames the 8 bars below.

**Real data used:** `entity.scores`, std-dev computation mirrored from `scoring.ts` (or surfaced from `calcScores`), harm-flag check.

**Independence check:** PASS. Neutral mechanical description of spread; no praise/alarm language (avoid "good/bad" — use "balanced/uneven").

| Impact | Strat. Align | Learning | Confidence | Effort | Risk | **Priority** |
|---|---|---|---|---|---|---|
| 4 | 4 | 4 | 4 | 3 | 2 | **11** |

---

## Idea 6 — Trend-in-words label on the composite history (read the sparkline without reading it)

**What the reader will understand after:** The direction and magnitude of this entity's trajectory in one glance — "Down 2.3 points over 4 assessments since Apr 2026" — so the sparkline (`CompositeSparkline.tsx`) communicates even to a scanner who never parses the line, and the score is understood as a *moving* measurement, not a static verdict.

**Device / format:** A short templated caption beside/under the existing sparkline: net delta, number of data points, and span dates — all already computed inside `CompositeSparkline` (`netDelta`, `rawPoints`). Add a one-clause "why" using the most recent Tier-A headline. Keep direction wording neutral and band-token colored per existing independence rules (green up / orange down, no red alarm), consistent with `EntityEvidenceCard`'s `EventDeltaBadge`.

**Placement:** Wherever the sparkline renders (currently history page; recommend also surfacing a mini version + this caption in the entity hero near `historyHref`, `EntityDetail.tsx:128-137`).

**Real data used:** `history.events[].newComposite`, `firstEventDate`/`lastEventDate`, `latestScoreChange.headline`. Build-time.

**Independence check:** PASS. Reuses existing neutral delta conventions.

| Impact | Strat. Align | Learning | Confidence | Effort | Risk | **Priority** |
|---|---|---|---|---|---|---|
| 4 | 3 | 4 | 5 | 2 | 1 | **13** |

---

## Ranked summary

| Rank | Idea | Priority |
|---|---|---|
| 1 | **#2** Inline band meaning + 5-band ladder | 17 |
| 2 | **#1** "Explain the number" composite math breakdown | 16 |
| 3 | **#3** "If you remember one thing" anchor | 13 |
| 3 | **#4** Dimension code legend + anchor reveal | 13 |
| 3 | **#6** Trend-in-words sparkline caption | 13 |
| 6 | **#5** Balanced-vs-spiky consistency callout | 11 |

(Idea #1 edges below #2 only on effort; on raw learning value #1 is the deepest insight on the page. The two are designed to ship together — band ladder answers "where," the math breakdown answers "why.")

---

## If you fix one thing

**Ship Ideas #1 + #2 as a single "Understand this score" block under the composite card.** Today the hero shows three numbers (`composite`, `band`, `rank`) with *zero* on-page schema — a reader cannot tell good from bad in 5 seconds, nor reconstruct the number in 3 minutes. Surfacing the already-written `BAND_DESCS`, a band ladder with the score plotted, and the base + integration-premium breakdown converts the page's biggest opaque element into its biggest teaching moment — using only data that already exists in `dimensions.ts` and `scoring.ts`, at build time, fully within the independence policy.

---

**Hand-offs:** Chart geometry for the band ladder, accumulator bar, and any profile-shape/radar visual → **dataviz-architect**. Exact spacing, color tokens, mobile `<details>` affordances → **ux**. CTA wording untouched → **conversion-strategist**.
