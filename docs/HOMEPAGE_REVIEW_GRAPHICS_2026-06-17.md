# Home Page Visual Review — Graphics Assessment

**Date:** 2026-06-17
**Author:** dataviz-architect
**Scope:** `site/src/app/page.tsx` visuals, evaluated for (1) knowledge acquisition, (2) methodology understanding, (3) daily-briefing interest. Review/proposal only — no code modified.

---

## Files grounded

- `site/src/app/page.tsx` — the home page (hero, flagship callout, S3.1 master bar, S3.3 small-multiples grid, "Today's research" live wire, indexes, services).
- `site/src/components/charts/BandDistributionBar.tsx` — the master bar + per-index strips. **Has an inline SVG legend with band names + ranges baked in** (`{s.key} {s.range}` → "Critical 0–20" … "Exemplary 80–100", lines 278–305).
- `site/src/components/charts/ScoreLegend.tsx` — rich `<details>` "How to read the scores": 5-band scale WITH descriptions + the 8-dimension glossary. **Not imported on the home page.**
- `site/src/components/charts/DimensionRadar.tsx` — 8-axis profile radar, supports an `overlay` polygon (field average) + honesty caveat. **Not on the home page.**
- `site/src/components/index/DimensionLegend.tsx` — single-row colored 8-code strip with hover meanings. **Not on the home page.**
- `site/src/components/charts/chartTokens.ts` + `dimensions.ts` `BANDS` — band ranges/colors are a single source of truth; ranges (0–20…80–100) are real data.
- `site/src/components/entity/CompositeSparkline.tsx` + `site/src/components/updates/briefing/ScoreSparkline.tsx` — both exist, both hand-rolled SVG, reusable.
- `site/src/data/updates/latest.json` — today is a **zero-proposal confirmation cycle**: no `scoreChanges[]`, but `topSignals[]`, `recentAssessments[]`, `boundaryWatch[]`, `methodologyNotes[]` are rich.

---

## Assessment against the five questions asked

**(a) Do the master bar + small-multiples actually TEACH the band model + state of the field?**
Partly. The master bar (`BandDistributionBar index="all"` inside `ChartFrame`, page.tsx 155–166) is a correct FT-grammar *part-to-whole* encoding with a real takeaway dek, count + % labels in-segment, and — crucially — **the band names AND ranges are rendered in its own SVG legend** (BandDistributionBar 300–303). So the score-range labels are NOT missing on the bar. What IS missing is the *meaning* of each band: a reader sees "Critical 0–20" colored red but is never told what Critical means ("foundational practices absent or active harm present"). The `ScoreLegend` component carries exactly that copy (band descriptions + 8-dim glossary) and is **absent from the home page entirely**. The bar teaches the shape of the field; it does not yet teach the rubric.

**(b) Is there a graphic that makes "what is institutional compassion / the 8 dimensions" instantly legible to a first-timer?**
No. The 8 dimensions appear only as a plain bold-text comma list in the "How the benchmark works" panel (page.tsx 365–373) and inside the closed `ScoreLegend` (which isn't on the page). There is **zero visual** for the conceptual core of the entire benchmark. `DimensionRadar` and `DimensionLegend` both exist and are built for exactly this, but neither is wired in. This is the single biggest comprehension gap on the page.

**(c) Does any visual preview/tease the daily briefing's living data?**
No. The "Today's research" section (page.tsx 202–276) is **text + colored delta cards only**, and on a zero-proposal day like today it falls back to a plain highlight paragraph — no chart at all. `CompositeSparkline` and `ScoreSparkline` exist and are unused here. The living, daily-updating nature of the benchmark — its strongest reason-to-return — is invisible as a graphic.

**(d) Are the score-range labels on bands (0–20 etc.) present?**
Yes — inside `BandDistributionBar`'s own SVG legend on every instance (master + 7 small-multiples). Confirmed in source. No action needed for the ranges themselves; the gap is band *descriptions*, not ranges.

**(e) What single graphic most increases comprehension at a glance?**
A **first-timer dimension primer** — the 8-axis `DimensionRadar` (showing one recognizable real entity's shape vs. the field average overlay) paired with the `DimensionLegend` strip, placed immediately after the hero. It converts the abstract phrase "institutional compassion framework" into a concrete, decodable shape in under two seconds, and it does not duplicate the flagship callout (which is about the *distribution*, not the *dimensions*). See G1 below.

**Redundancy check vs. the flagship callout:** the flagship callout (page.tsx 126–152) already states the distribution thesis in prose ("67.7% cluster in the middle bands, 90.5% equity gap"). The S3.1 master bar visually proves that same thesis. These two are mutually reinforcing, not redundant — but a *third* distribution graphic would be. All proposals below avoid re-stating distribution; they teach the rubric (bands meaning, dimensions) or the living data (briefing).

---

## Ranked graphic proposals

Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk (each −2…+3).

### LEAD — G1. First-timer dimension primer: a radar + legend "what we measure" block
**Goal: (1) knowledge acquisition + (2) methodology understanding.** Highest leverage.

- **Reader question:** "What is institutional compassion actually measuring — and what does a good vs. bad profile look like?"
- **Chart + encoding:** `DimensionRadar` (8 axes, AWR…INT, 0–5 radial scale, polygon filled by band color) showing ONE recognizable entity's real shape with the **field-average overlay** (dashed polygon) for instant "compared to what." Pair it with the `DimensionLegend` colored-code strip beneath so each axis label is decodable. The radar already ships the honesty caveat ("radar area can exaggerate — read per-axis values").
- **Data source (exists):** real dimension scores from any index JSON (e.g. a high-profile entity from `countries.json`); field average computed at build time from the same files (the radar accepts an `overlay` prop). No new data.
- **Reuse vs. new:** 100% reuse — `DimensionRadar` + `DimensionLegend` both exist; wrap in the existing `ChartFrame`. Zero new primitives.
- **Placement / density:** new section immediately after the hero, before or beside the flagship callout. Hero-level (open, not in `<details>`) — this is the conceptual anchor of the page.
- **Annotation/title:** "What we measure: eight dimensions of institutional compassion" / dek naming the entity and the takeaway shape ("strong on Action, hollow on Integrity — a common pattern").
- **Accessibility:** `DimensionRadar` already emits `role="img"` + an `aria-label` enumerating all 8 scores + the overlay; supply a custom `ariaLabel` naming strongest/weakest dimension.
- **×Leverage:** ×1 on home, but the radar primitive is reused on all ~1,160 entity pages — wiring it here makes the home page teach the exact visual language used everywhere else (understanding compounds).
- **Priority:** Impact +3, Strategic +3, Learning +3, Confidence +3, Effort −1, Risk −1 = **+10**

### G2. `ScoreLegend` disclosure under the master bar — teach the band rubric
**Goal: (2) methodology understanding.**

- **Reader question:** "The bar shows most institutions are red/orange — but what does 'Critical' or 'Functional' actually mean?"
- **Chart + encoding:** Not a new chart — the existing `ScoreLegend` `<details>` (5 bands WITH descriptions + 8-dimension glossary, closed by default = 0 height closed, satisfying the density budget).
- **Data source (exists):** `BANDS` + `DIMENSIONS` from `dimensions.ts`. No new data.
- **Reuse vs. new:** 100% reuse — already built, designed to be dropped under any chart.
- **Placement / density:** directly under the S3.1 master bar (`ChartFrame`, page.tsx ~164). Closed by default; progressive disclosure.
- **Annotation/title:** ships its own summary "How to read the scores."
- **Accessibility:** already accessible, crawlable, Pagefind-indexable; color always paired with the band name + range text.
- **×Leverage:** ×1 home, but reinforces the band vocabulary the small-multiples grid and every index page depend on.
- **Priority:** Impact +2, Strategic +2, Learning +3, Confidence +3, Effort −0, Risk −0 = **+10** (lowest-effort high-value; ship alongside G1.)

### G3. Briefing tease: a `BandPositionStrip` mini-chart for today's lead signal
**Goal: (3) interest in the daily briefing.**

- **Reader question:** "The benchmark says it updates daily — show me, don't tell me. Where does today's headline entity sit?"
- **Chart + encoding:** `BandPositionStrip` for the lead `topSignals[0]` entity (today: Meta Platforms, 7.8 Critical) — a 0–100 strip with the five band zones and a "you are here" marker at the entity's composite. On a *quiet* day this is the right encoding: it makes a confirmation ("floor-confirmed at 7.8") legible and dramatic without implying movement that didn't happen.
- **Data source (exists):** `latest.json` → `topSignals[0]` / `recentAssessments[0]` carries `slug`, `published`/`assessed`, `index`. Composite + band resolvable via `chartTokens.getBand()`. Schema-safe: works on zero-proposal days where `scoreChanges[]` is empty (the current home `scoreChangesArr` gate would otherwise hide the section's drama).
- **Reuse vs. new:** reuse `BandPositionStrip`; small build-time mapping from briefing JSON to the strip's props.
- **Placement / density:** inside the "Today's research" section header card, replacing or augmenting the bare highlight paragraph. Hero-within-section.
- **Annotation/title:** "Today's lead finding: [entity] confirmed at [score] ([band])" with the verdict/why one-liner from `whyHeadline`.
- **Accessibility:** `BandPositionStrip` emits `role="img"` + an aria-label with the score, band, and position; pair the marker with the band-name text.
- **×Leverage:** ×daily — refreshes every cycle with no per-day authoring; turns a static section into living proof.
- **Priority:** Impact +3, Strategic +3, Learning +2, Confidence +2, Effort −2, Risk −1 = **+7**

### G4. 30-day movement sparkline of benchmark activity
**Goal: (3) interest in the daily briefing.**

- **Reader question:** "Is this thing actually alive — how much has moved recently?"
- **Chart + encoding:** `CompositeSparkline`/`ScoreSparkline` showing a 30-day series of either the lead entity's composite history OR daily proposal counts, with the latest point marked and annotated. Honest on quiet days: a flat line correctly reads "stable" and is captioned as a confirmation cycle, not a misleading climb.
- **Data source (mostly exists):** `CompositeSparkline` already consumes entity history on entity pages. For an *activity* sparkline (proposals/day) we'd need a small build-time series aggregated from the `updates/daily/*.json` archive — trivially computable, but it's the one item needing a tiny new data derivation. Safest v1: reuse the existing entity-history sparkline for the lead signal entity.
- **Reuse vs. new:** reuse the sparkline primitive; new data wiring only if doing the activity series.
- **Placement / density:** small, beside the briefing CTA or under G3's position strip. Secondary.
- **Annotation/title:** "[entity] — 30-day composite" or "Benchmark activity, last 30 days."
- **Accessibility:** sparkline primitives already carry `role="img"` + value aria-labels.
- **×Leverage:** ×daily if activity-series; otherwise ×1 per featured entity.
- **Priority:** Impact +2, Strategic +2, Learning +2, Confidence +2, Effort −2, Risk −1 = **+5**
- **Honesty note:** if the series is shorter than ~14 points, label it explicitly and do NOT draw a trend line (per integrity rule).

### G5. (Defer) Methodology-anchor mini-diagram: adjudication vs. allegation
**Goal: (2) methodology understanding.** Tempting given today's `methodologyNotes`, but defer.

- **Reader question:** "Why didn't a $6M jury verdict against Meta move the score?"
- **Why defer:** this is genuinely interesting (the K.G.M. vs. OpenAI-subpoena evidence-tier contrast) but it is *episode-specific*, would need a bespoke new SVG, and the daily briefing page — not the home page — is its natural home. Building it as a home-page graphic risks staleness and authoring cost. Knowledge-architect should own the framing; revisit as a `/updates` graphic, not a home hero.
- **Priority:** Impact +1, Strategic +1, Learning +2, Confidence +1, Effort −2, Risk −2 = **+1**

---

## Recommended sequence

1. **G1 + G2 together** (one PR): wire `DimensionRadar`+`DimensionLegend` after the hero, and drop `ScoreLegend` under the master bar. Both are pure reuse, zero new data, and together they make the home page teach *both* halves of the rubric (what we measure + what the bands mean). This is the comprehension unlock.
2. **G3**: `BandPositionStrip` on today's lead signal — also make the "Today's research" section render on zero-proposal days using `topSignals`/`recentAssessments`, not just `scoreChanges`.
3. **G4**: sparkline once G3 ships, for living-data proof.

## Top 3 next graphics — what each lets the reader finally understand

1. **G1 dimension-radar primer** → "Institutional compassion isn't a vibe — it's 8 measurable dimensions, and here is what a real institution's shape looks like against the field." (Turns the page's abstract thesis into a decodable picture.)
2. **G2 `ScoreLegend` under the master bar** → "Red isn't just red — 'Critical' means foundational practices are absent or active harm is documented." (Gives the color-coded distribution its meaning.)
3. **G3 lead-signal position strip** → "This benchmark is alive: today it confirmed Meta at 7.8, pinned at the bottom of the field." (Converts the daily briefing from a text block into living, returnable proof.)
