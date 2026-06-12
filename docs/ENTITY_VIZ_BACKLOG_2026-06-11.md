# Entity Detail Page — 20 Compelling Additions (Consolidated Backlog) — 2026-06-11

Consolidated from four lenses (`docs/ENTITY_VIZ_DATAVIZ_*`, `ENTITY_VIZ_UX_*`, `ENTITY_VIZ_KNOWLEDGE_*`, `ENTITY_VIZ_COMPETITIVE_*`). 24 raw proposals → 20 distinct, ranked items.

Scoring: **Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk**.

## The convergent finding
The entity page today shows **three opaque numbers** (composite /100, band word, rank) and **one chart idiom** (8 dimension bars on a 0–5 scale, dimension-colored, no band semantics) — while the substance to make all of it legible already exists in the repo and is **unused on this page**: four built-but-unwired chart primitives (`BandPositionStrip`, `DimensionProfileBar`, `BandDistributionBar`, `CompositeSparkline`), the band glossary (`BAND_DESCS`), the 40 behavioral anchors (`dimensions.ts`), the composite formula (`scoring`), `tierCounts`, and per-index peer `scores`/`sector`. **Most of the top items are "wire in what we already built," not "invent."**

The reader's five questions — **Is this score good or bad? Compared to what? Why this score? Where strong/weak? Which way is it moving?** — are each answerable from existing data.

---

## Wave 1 — Reuse-now quick wins (existing primitives / existing data; ship first)
*All static-export-safe own-data SVG, CC-BY. The single highest-leverage PR on the site: converts the page from one chart idiom to ~six answered questions.*

| # | Addition | Reader question | Source | Reuse/New | Effort | Priority |
|---|----------|-----------------|--------|-----------|--------|----------|
| 1 | **Hero band-position strip** — score on a banded 0–100 track + index-median marker + "X pts from the next band" | "Is 18.4 bad — vs what?" | `BandPositionStrip` (built) + `meta.medianScore` | **Reuse** | XS | **17** |
| 2 | **Band-colored dimension profile** — recolor the 8 bars by band (color = quality, not decoration); optional Δ ghost | "Where is it strong/weak?" | `DimensionProfileBar` (built; convert 0–5→0–100) | **Reuse** | XS | **16** |
| 3 | **Inline band meaning + 5-band ladder** — render `BAND_DESCS` gloss under the Band chip + `ScoreLegend` decoder | "What does 'Critical' mean?" | `ScoreLegend` (built) + `BAND_DESCS` | **Reuse** | XS | **16** |
| 4 | **Composite trajectory sparkline in hero** — gated to ≥3 points; band-transition markers; replaces the "View history →" text link | "Which way is it moving?" | `CompositeSparkline` (built) + `getEntityHistory` | **Reuse** | S | **15** |
| 5 | **Index band-distribution "you are here"** — the field across 5 bands + a caret at the entity (in `<details>`) | "How rare is this band?" | `BandDistributionBar` (built) | **Reuse** | S | **14** |
| 6 | **Evidence-tier provenance bar** — T1–T5 source mix behind the score; visible rigor = the independence moat | "How well-sourced is this?" | `tierCounts` (already on page) | New (tiny) | XS | **14** |
| 7 | **Trend-in-words caption** — "Down 2.3 pts over 4 assessments since Apr 2026" beside the sparkline | "Is it improving, in words?" | history deltas | New (tiny) | S | **14** |
| 8 | **Short-history orientation notice** — "First assessed [date] — short history, interpret with caution" when `totalEventCount < 3` | honesty / calibration | `totalEventCount` | New (tiny) | XS | **13** |

## Wave 2 — Comprehension + comparison (small new components; mostly existing data)
| # | Addition | Reader question | Source | Reuse/New | Effort | Priority |
|---|----------|-----------------|--------|-----------|--------|----------|
| 9 | **Sector-cohort percentile strip / peer rug** — "Rank 4 of 22 in Technology · Top 18%" + spectrum bar with a tick per peer (MSCI/Yale model) | "Vs my actual peers?" | build-time filter of index `scores`/`sector` | New | S–M | **15** |
| 10 | **"Explain the number" composite breakdown** — accumulator: base score **+** integration premium **=** composite, with the harm-flag/consistency gates in `<details>` | "Why exactly this number?" | `scoring` formula + dimensions | New | M | **15** |
| 11 | **Dimension code legend + behavioral-anchor reveal** — kills AWR/EQU/INT jargon; `<details>` per dimension turns "1.5/5" into its anchor text + next rung | "What behavior earns this?" | `DIMENSIONS.subdims[].anchors[]` | New | M | **14** |
| 12 | **Best/worst dimension summary badges** — "Strongest: Action · Weakest: Accountability" atop the profile | "What's the shape, in one line?" | dimension scores | New (tiny) | XS | **14** |
| 13 | **Dimension deviation bars** — diverging bars vs the sector/field baseline (above/below average per dimension) | "Above or below its peers, where?" | dimension scores + sector means | New | S | **13** |
| 14 | **"If you remember one thing" anchor** — one templated, evidence-grounded line (strongest/weakest dim + verbatim latest headline + source) | retention | dimensions + latest evidence | New | S | **13** |
| 15 | **Balanced-vs-spiky consistency callout** — explains *why* the integration premium was full / partial / zero from the profile shape | "Why the premium?" | stdDev of dimensions | New | S | **12** |

## Wave 3 — Signature + depth (higher effort or data-gated)
| # | Addition | Reader question | Source | Reuse/New | Effort | Priority |
|---|----------|-----------------|--------|-----------|--------|----------|
| 16 | **8-axis radar / profile-shape polygon** — the signature single-glance "shape," entity polygon + faint sector-average overlay (V-Dem/EIU/SPI). Document the area-misleads caveat. | "What's the whole shape, at a glance?" | dimension scores + sector means | New | M | **14** |
| 17 | **Dimension Δ delta badges** — signed change since last assessment on each dimension bar (Yale EPI) | "Which dimensions moved?" | **needs per-dimension deltas stored** | New + data | M | **13** |
| 18 | **Peer dimension scatter** — trade-off pattern for large cohorts (e.g. high empathy / low accountability) | "What's the cohort trade-off?" | peer dimension scores | New | M | **11** |
| 19 | **Subdimension heat-grid / anchor panel** — 8×5 grid of all 40 subdimension scores + anchor text; makes the score falsifiable (Freedom House/WBA) | "Exactly where, at the finest grain?" | **needs 40 subdim scores/entity** | New + data | M–L | **11** |
| 20 | **Evidence-source dot plot** — every past assessed score as a dot, published score as a line; spread = confidence (CPI). The most brand-differentiated graphic. | "How contested / confident is this?" | **needs per-event dimension scores** | New + data | L | **10** |

---

## Data-gating note (important for sequencing)
Items **17, 19, 20** require richer data than the entity page currently stores (per-dimension deltas, 40 subdimension scores, per-assessment-event dimension scores). These need a **data-model + pipeline extension** (overnight-assessor must emit + persist that granularity) before the UI is buildable — route to **data-engineer + backend-engineer + the pipeline owner** first. Everything in Wave 1 and most of Wave 2 is buildable **today** from existing data.

## One correction surfaced during review
`DimensionProfileBar` expects **0–100**; the entity page's current dimension bars are **0–5**. Wiring it in (#2) needs a trivial unit conversion. The current bars also encode color by *dimension*, not by *band* — switching to band color (#2/#3) is what makes them diagnostic.

## Independence / integrity (all 20 PASS)
Every item is **own-data, build-time SVG/text, CC-BY** — fully reproducible from our scored data, zero third-party/AI imagery (link-only evidence policy intact), no fabricated trends (short-history items are gated/disclosed, #4/#8). The evidence-provenance items (#6, #20) actively *strengthen* the independence moat by making rigor visible.

## Recommended first build: Wave 1 (#1–#8)
One frontend PR wiring four existing primitives + four tiny new elements. It answers six of the reader's five questions, costs almost no new component work, and respects Wave E1 density (depth in `<details>`). Hand to **frontend-engineer**; dataviz-architect owns the band-position dual-marker + sparkline specs, knowledge-architect owns the band gloss + trend caption copy, ux-designer owns placement/hierarchy.
