# /indexes Hub — Visual Comprehension Review
**dataviz-architect · 2026-06-17**

Scope: `site/src/app/indexes/page.tsx` — the hub that routes to the 7 index pages — assessed for how graphics drive (1) knowledge acquisition, (2) methodology understanding, (3) interest in the daily living briefing. Reuse-before-build, own-data SVG only, CC-BY.

---

## Verdict

**The /indexes hub is currently 100% textual. There is not a single chart, band swatch, or score on the page.** The seven indexes are presented as identical word-cards (`Pill` tags + a one-line description in the "Current indexes" grid, `page.tsx:153-178`). A reader cannot tell — without clicking into each of 7 pages — that AI Labs (mean 43.6) and Countries (mean 36.5) sit in different places, that Robotics Labs leads the field, or that the whole benchmark uses a 5-band 0–100 model. The hub answers "what indexes exist?" but not the decision question it should own: **"which index should I open, and what state is each one in?"**

This is a comprehension gap, not a styling gap. The cards encode nothing — same shape, same color, same weight for an index in crisis and an index that leads. The reader learns the band model only after they leave the hub.

### What already exists (and where it lives — to avoid duplication)
- **HOME** (`app/page.tsx:157-200`) already owns BOTH the master aggregate bar (`BandDistributionBar index="all"`) AND the full 7-index small-multiples grid (7 full stacked `BandDistributionBar`s sorted by top-band share). The hub must NOT clone this — it would be pure duplication and the home already does it better with full-height bars.
- **Individual index pages** own per-index `BandDistributionBar` + `GroupMeanBars` + Top-5/Bottom-5 (`IndexPageCharts.tsx`).
- **Reusable primitives ready to wire:** `BandDistributionBar` (accepts `counts` override → can render a thin mini-strip), `ScoreLegend` (the canonical "How to read the scores" `<details>`), `GroupMeanBars`, `chartTokens` (`CHART_BANDS`, `getBand`), `ChartFrame`.
- **Data already on disk, zero new computation:** every `indexes/*.json` has `meta.meanScore`, `meta.medianScore`, `meta.entityCount`, and a precomputed `meta.bands[]` array (band + count + percentage). Everything below reads from these.

### The hub's distinct job (vs the home)
The home answers **"what is the state of the whole field?"** (one big bar + small multiples as a wall). The hub's job is narrower and more useful here: **differentiate the 7 indexes on a single comparable axis so the reader can choose one**, and **teach the band vocabulary once** so every downstream index page reads instantly. That argues for a *cross-index ranked comparison* (a thing the home does NOT have — the home shows distributions, not a single ranked "who leads" axis) plus per-card *identity marks*, not a re-run of the small-multiples.

---

## Ranked graphic proposals

Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk (repo model; higher = do first).

---

### 1. Cross-index "State of the field" ranked mean bars — the hero `[KNOWLEDGE] [METHODOLOGY] [CHOOSE]` — **Priority: HIGHEST**

**Reader question:** "Of the seven domains, which is doing best/worst, and how far apart are they — so where should I look first?"

**Why this and not the home's small-multiples:** the home shows seven separate distributions side by side (hard to rank at a glance — you're comparing seven shapes). The hub needs the *one chart the home lacks*: a single ranked axis where all 7 index **mean composites** sit on the same 0–100 band-colored scale, sorted high→low. One read tells you Robotics Labs leads, AI Labs/Cities cluster mid, Countries trails — the cross-type story in one mark. This is the choose-an-index decision instrument.

**Chart type + encoding:** horizontal ranked bars, one row per index, sorted descending by mean composite. Bar length = mean (magnitude), bar fill = band color of that mean via `getBand()` (decode-for-free: red Countries vs green Robotics needs no legend). Value label = mean to one decimal; muted `n=` count after. This is **exactly `GroupMeanBars`'s output** — already built, already band-colored, already accessible, already has the reference-line + `n=` affordances.

**Data source:** synthesize a 7-row array `[{ name: "Humanoid Robotics Labs", composite: meta.meanScore, _idx: slug }, …]` from the 7 `meta.meanScore` values (countries 36.5, ai-labs 43.6, etc.), pass as `rankings` with `groupKey` set so each "group" is one index. Reference line = the all-index grand mean (weighted or simple mean of the 7, computed inline). Zero new data.

**Reuse vs new:** **Reuse `GroupMeanBars` as-is** for v1 (feed it the 7-row synthetic array, `groupKey="name"`, `groupLabel="Index"`). One enhancement worth a tiny follow-up: make each bar a link to its index page (the hub is a router) — `GroupMeanBars` is pure SVG so this is a thin wrapper, or accept an optional `hrefByLabel` map. v1 can ship link-free.

**Placement:** new hero section immediately under the page hero (after `page.tsx:75`, before Entity search), wrapped in `ChartFrame` with `path="/indexes"`, `page_type="indexes"`. This is the first thing the reader sees — it frames the whole hub.

**Annotation/title (hand to knowledge-architect):** title states the takeaway, not the chart type — e.g. *"Robotics labs lead; governments trail — mean compassion by domain."* Dek: *"Each index's mean composite on the shared 0–100 scale. Bar color shows the band."*

**Accessibility:** `GroupMeanBars` already emits `role="img"` + an `aria-label` enumerating every group mean and the reference line. Inherited for free.

**×Leverage:** 1 graphic, renders once on the single hub page, but it is the page's organizing spine and the only cross-index ranked view on the entire site — it answers the question the home structurally cannot.

---

### 2. Per-card band mini-strip + mean badge on each index card — index identity `[KNOWLEDGE] [METHODOLOGY] [CHOOSE]` — **Priority: HIGH**

**Reader question:** "Looking at this one card — what state is *this* index in, before I click?"

**Why:** the "Current indexes" cards (`page.tsx:153-178`) are the literal click targets. Right now every card is visually identical. Adding a thin band-distribution strip + a band-colored mean badge to each card turns each card into a self-describing preview: the reader sees Countries' card is mostly red/orange (crisis), Robotics' card skews green, *before* committing a click. This teaches the band model passively (the same five colors recur on every card) and makes the card grid itself the comparison instrument — complementing #1's ranked summary with per-card detail. It is NOT the home's small-multiples: those are standalone full-height bars in a dedicated section; these are compact strips *inside the navigation cards*, doing wayfinding work the home doesn't do.

**Chart type + encoding:** a slim (≈14px) stacked band strip per card — `BandDistributionBar` already supports a `counts` override and renders a stacked band bar; for the card context render it compact (the component degrades fine; a `compact`/height prop is a trivial add if the full legend is too tall). Pair with a small band-colored mean pill ("Mean 43.6 · Developing") using `getBand()`. Position encodes nothing new; color reuses `CHART_BANDS` so no per-card legend is needed (the legend lives once in #3).

**Data source:** each index's `meta.bands[]` (already `{ band, count, percentage }`) → map to the `BandCounts` shape for the `counts` prop; `meta.meanScore` for the badge. Zero new computation.

**Reuse vs new:** **Reuse `BandDistributionBar`** with `counts`. Recommend one small enhancement (hand to frontend-engineer): a `height`/`compact` prop and option to suppress the inline legend, so the card strip stays ~14–18px. Otherwise reuse as-is.

**Placement:** inside each `Card` in the "Current indexes" grid (`page.tsx:153-178`), between the title and description. Applies to all 7 (countries featured card + the mapped 6). Keep the strip closed-cost-zero concern moot — it's tiny and the cards are already the page's tallest section.

**Annotation:** no per-card title needed beyond the existing card heading; the mean badge ("Developing", band-colored) is the annotation. The shared legend (#3) carries the key.

**Accessibility:** `BandDistributionBar` emits `role="img"` + per-band `aria-label`. The mean badge needs its band name as text (not color-only) — "Mean 43.6 · Developing" satisfies this.

**×Leverage:** 7 cards on 1 page, but the pattern (band strip inside a nav card) is reusable on any future hub/landing grid.

---

### 3. `ScoreLegend` — wire the canonical "How to read the scores" disclosure onto the hub `[METHODOLOGY]` — **Priority: HIGH (do alongside #1/#2)**

**Reader question:** "What do these colors and the 0–100 number actually mean?"

**Why:** the moment the hub shows ANY band color (#1 or #2), it incurs an obligation to explain the encoding — and the canonical explainer already exists and is closed-cost-zero (`<details>`, indexed, no runtime JS). The hub is the natural teaching surface: it's the entry funnel to all 7 index pages, so explaining the band model + 8 dimensions here means every downstream page reads fluently. Pure methodology-comprehension win, near-zero effort.

**Chart type:** not a chart — the existing `ScoreLegend` disclosure (band scale + 8-dimension glossary, links to /about methodology).

**Data source:** `dimensions.ts` `BANDS` + `DIMENSIONS` (already wired inside the component).

**Reuse vs new:** **Reuse `ScoreLegend` verbatim.** One import, one tag.

**Placement:** directly beneath the #1 hero chart (so color encoding is explained right where it first appears), or as a thin band under the "Current indexes" `SectionHead`. `asSection` prop available if a divider is wanted.

**Accessibility:** already compliant (semantic `<details>`, labeled sections, not color-only).

**×Leverage:** one shared component; teaching the model on the hub reduces confusion on all 7 index pages and every entity page downstream.

---

### 4. Daily-briefing live tease strip — "the benchmark is alive" `[BRIEFING]` — **Priority: MEDIUM**

**Reader question:** "Is this a static report, or is something happening *now* that's worth subscribing to?"

**Why:** the hub currently has zero signal that the benchmark is a living, updated instrument — nothing teases the daily briefing. The home already surfaces "latest score changes / highlights" from the updates feed (`app/page.tsx:202+`). The hub should carry a compact echo: a one-line "Latest movement" strip — most recent score change(s) with a band-colored delta chip and a link to the daily briefing. This converts hub browsers into briefing subscribers by proving freshness.

**Chart type + encoding:** not a full chart — a compact "delta chip" row: entity name + arrow + signed delta, chip color = direction (green up / red down, matching the home's `#86efac`/`#f87171` deltas). Optionally a 1-row `BandPositionStrip` showing where the moved entity now sits. Keep to 1–2 items so it's a tease, not a feed.

**Data source:** the same updates/score-change data the home reads (latest `scoreChanges`). No new data, no per-entity history call needed for a 1–2 item tease.

**Reuse vs new:** mostly reuse — the delta-chip markup exists on the home (`app/page.tsx:225-260`); could be extracted to a tiny shared `ScoreDeltaChip` so home + hub share it (small build). `BandPositionStrip` reused if a position mark is wanted.

**Placement:** a thin strip near the top of the hub (under the hero stats, or adjacent to #1), with a "See today's briefing →" link.

**Accessibility:** delta must not be color-only — include the sign and word ("−1.3, declined"); chips need text labels.

**×Leverage:** 1 strip, but it's the conversion bridge from "browse rankings" to "subscribe to the living briefing" — strategic alignment with goal (3).

---

### 5. (Reject / defer) Re-running the 7-index small-multiples grid on the hub — **do NOT build**

The home already ships the full 7-index `BandDistributionBar` small-multiples grid sorted by top-band share (`app/page.tsx:168-200`). Cloning it on the hub is pure duplication and violates the hub's differentiate-and-choose job. Proposals #1 (ranked means — the view the home lacks) and #2 (band strips *inside* the nav cards — wayfinding the home doesn't do) cover the same data more usefully for the hub's purpose. Skip.

---

## Top 3 next graphics — and what each finally lets the reader understand

1. **Cross-index ranked mean bars (reuse `GroupMeanBars`)** — *"Robotics leads, governments trail."* The reader finally understands the **whole-field hierarchy and where to look first**, on one shared band-colored axis the home doesn't provide. Single highest-leverage move; near-zero effort.
2. **Per-card band mini-strip + mean badge (reuse `BandDistributionBar` + `getBand`)** — *the card itself previews the index's state.* The reader understands **what condition each index is in before clicking**, and absorbs the 5-band model passively across all 7 cards.
3. **Wire `ScoreLegend` onto the hub (reuse verbatim)** — *"this is what the colors and 0–100 mean."* The reader understands the **band + 8-dimension vocabulary** at the funnel entry, so every downstream index and entity page reads fluently.

All three are reuse-first, own-data SVG, CC-BY, zero licensing risk, and computable entirely from `meta.*` fields already in `indexes/*.json`. Hand-off: frontend-engineer builds the thin `GroupMeanBars` synthetic-row wrapper + the `BandDistributionBar` `compact`/`height` prop; ux-designer places the hero + card strips; knowledge-architect writes the takeaway titles/deks.

---

## Files referenced
- `C:\Users\philk\applied-compassion-benchmark\site\src\app\indexes\page.tsx` (the hub — currently chart-free)
- `C:\Users\philk\applied-compassion-benchmark\site\src\app\page.tsx` (home — owns master bar + small-multiples; avoid duplicating)
- `C:\Users\philk\applied-compassion-benchmark\site\src\components\charts\GroupMeanBars.tsx` (reuse for #1)
- `C:\Users\philk\applied-compassion-benchmark\site\src\components\charts\BandDistributionBar.tsx` (reuse for #2; `counts` prop + suggested `compact`)
- `C:\Users\philk\applied-compassion-benchmark\site\src\components\charts\ScoreLegend.tsx` (reuse for #3)
- `C:\Users\philk\applied-compassion-benchmark\site\src\components\charts\chartTokens.ts` (`CHART_BANDS`, `getBand`)
- `C:\Users\philk\applied-compassion-benchmark\site\src\components\charts\ChartFrame.tsx` (wrapper for #1)
- `C:\Users\philk\applied-compassion-benchmark\site\src\components\index\IndexPageCharts.tsx` (per-index pattern, for consistency)
- `C:\Users\philk\applied-compassion-benchmark\site\src\data\indexes\*.json` (`meta.meanScore`, `meta.medianScore`, `meta.entityCount`, `meta.bands[]`)
- `C:\Users\philk\applied-compassion-benchmark\site\src\data\dimensions.ts` (`BANDS`, `DIMENSIONS`)
