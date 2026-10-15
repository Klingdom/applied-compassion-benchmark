# AI Model Compassion Dashboard (/ai-models/dashboard): visualization spec

**Date:** 2026-10-14 · **Author:** data-visualization architect (agent) · **Status:** design spec. It changes no code or data. Handoff: frontend-engineer builds, ux-designer places and styles, knowledge-architect words titles and captions.
**Grounded in:** `site/src/components/model-benchmark/pilot/{figure-kit.tsx,PilotFigures.tsx}`, `site/src/lib/model-wave-facts.ts`, `site/scripts/lib/model-benchmark-public.mjs` (`projectWavePublic`), `site/src/data/model-benchmark/waves/pilot-2026-10-03.json`, `docs/ai-dashboard/METHODOLOGY_RELEASE_ASSESSMENT_2026-10-14.md` §3 and §5, `docs/ai-dashboard/RESEARCH_AI_BENCHMARK_BEST_PRACTICES_2026-10-14.md` B3 and C.
**Figures:** the pilot-3 values quoted below are worked examples for engineers only. Dashboard copy never types a digit (§5.5). Every number is a token resolved from the projected wave.

---

## 0. Global grammar (binding on every panel)

| Rule | Spec |
|---|---|
| G0 Source | Read **only** `projectWavePublic(loadWave(run_id))` (methodology §3, §5.7). Points are *absent* for withheld subjects (`subjects.<s>.point_withheld`), and `difference` is absent on any pair that involves one. Components must treat a missing point as "withheld". They must never fall back to the raw wave. |
| G1 One wave | A page shows exactly one wave. Static routes: `/ai-models/dashboard` (latest publishable wave) and `/ai-models/dashboard/<run_id>` (`generateStaticParams` over `publishableWaves`). No overlay, no cross-wave line, no shared axis across waves, and no "previous wave" ghost. A wave selector is plain navigation. |
| G2 Marks | Range = `HWhisker` (lo–hi, end caps). Point tick = `pf-tick`, drawn only where amendment 16 allows it: subject in `derived.separated_subjects` **and** the point is present in the projection. Withheld subjects show the range only. Their table cell "Point estimate" reads **"withheld (not separated)"**, and the projection's `point_withheld.reason` goes in a footnote. No point difference is ever drawn on the dashboard (§4, §5). |
| G3 Identity | Model = **shape + text label**. Shapes come from `shapeFor()`; a secondary-arm variant is hollow (`pf-hollow`). No colour difference between models, no band colour, no band name, and no "rank/#1/best/worst/top/leader" (the `assertLexicon` gate). **Defect to fix:** `SHAPES` has 6 kinds, so a seventh build silently reuses a shape. Add `star`, `x-cross` and `triangle-down`, and `must(builds ≤ SHAPES.length)`. |
| G4 Order | Blocks: **"Not separated" groups first** (larger first, then first label), then separated singletons, alphabetical. Within a block, `alpha`. Arms waves: the primary-arm panel first, then the secondary arm (range-only, one block). Dimensions are always in `DIMENSIONS` order (AWR…INT). **Nothing is ever sorted by a value.** "Order carries no meaning" is printed on every chart. (Note: `groupBlocks` sorts by size only. Use a `dashboardBlocks()` that puts not-separated blocks first explicitly.) |
| G5 Axes | Fixed and honest. Composite 0–100. Dimension 1–5 (the full rating scale). Agreement 0–100%. Difference axes span the **full wave's** min/max including 0. Axes never rescale under a filter. |
| G6 Caveat | In-SVG `Footer`: "UNOFFICIAL PILOT · not a ranking · <family>-family judges · compassionbenchmark.com/ai-models" plus run id · access tier · comparability. The footer is part of every figure, so a screenshot keeps it. |
| G7 A11y | `<figure>`, `role="img"`, `aria-labelledby` pointing at `<title>` and `<desc>`. The desc lists every visible number as ranges (template per panel below). The visible caption repeats the status line. A `<details class="pf-data">` table is the fallback, and at ≤480px it replaces the SVG (existing `.pilot-fig` media rule). Text is 14 units in a 480-unit viewBox. Shapes are redundant with labels. |
| G8 Print | Use only `.pf-*` classes, so the existing `@media print` swaps to black on white. Dashboard-specific print omissions are announced through `::after` text, following the `#fig-*` pattern. |
| G9 Not measured | Absent metrics render as the words **"Not measured in this wave"**, never as 0, "—" or an empty cell (§5.8). |

### 0.1 Filters (model subset, dimension subset): one contract for all panels

**Mechanism (static export, no chart lib).** Panels are server-rendered as a **strip figure**: one header SVG (axis), one SVG per row carrying `data-subject` / `data-dim` (aria-hidden), and one footer SVG (caveat and n-of-N line), all inside a single `<div role="img">` with a visually hidden `<desc>`. That desc holds one `<span data-subject>` per row. A small client island (`DashboardFilterBar`, the only client JS) toggles `hidden` on matching rows, desc spans and table rows. Hidden spans drop out of the accessible name, and HTML rows reflow, so the SVG never needs re-layout. Scatter panels hide `<g data-subject>` in place. Filter state lives in the URL hash (`#m=a,b&d=AWR,EMP`), which makes screenshots attributable. Without JS, every row shows and the filter bar renders a `<noscript>` note. *Why not re-render the SVG on the client:* `figure-kit` → `model-report-facts` → `model-benchmark-public.mjs` imports `node:fs`, so the figures cannot move to the client without a refactor. The client must also never compose a new sentence (the lexicon gate runs at build only).

**Invariants (identical for every panel):**
1. **Groups, separation flags, corrected intervals and Bonferroni counts are always the full wave's.** A filter only hides rows. Nothing is recomputed. A lone visible member of a not-separated group keeps the "Not separated" header and stays range-only. It never becomes "separated".
2. Every filtered figure shows **"n of N models shown · grouping and separation reflect all N models in this wave"** in the footer SVG and in the caption. Built from `derived.subject_count` and the visible count; the template is lexicon-checked at build. For dimension panels: **"k of K dimensions shown"**.
3. A group header keeps its full-wave wording ("the pilot cannot order these three") and adds "(two shown)" when members are hidden. The bracket spans the visible members only.
4. **The dimension subset never touches the composite.** The composite panel always uses all eight dimensions with the pre-registered weights. A fixed note says: "Selecting dimensions does not re-weight the composite." No custom weighting (best-practices C18 needs recomputed CIs, which we do not have).
5. Axes, shapes, hollow-ness and order stay fixed (G3–G5).
6. Empty filter result: the figure is replaced by "No model selected. Choose at least one model." The caveat footer stays.
7. Filters do not affect wave-level panels (instrument health, stat strip, release tracker, bridge drift). Those panels say "Whole wave; not affected by the model filter."

---

## 1. Composite ranges (hero): REUSE `IntervalFigure` behind a projection-safe adapter

- **Reader question:** "Where did each model land, and which ones can the pilot actually tell apart?"
- **Chart and encoding:** horizontal dot-range (whisker) list on a 0–100 axis, grouped into "Not separated" blocks with a bracket. A point tick appears for a separated subject only. Arms waves get a primary panel and a secondary range-only panel with hollow shapes. *Why not bars:* a bar implies a known magnitude from zero, but here only a range is known. *Why not a sorted dot plot:* sorting by value is a ranking, which D-29a §3 bans. *Why not Arena rank spreads:* "rank" is banned on model surfaces, and groups answer the same question.
- **Fields:** `subjects.<s>.pilot_composite_interval95`, `subjects.<s>.pilot_composite` (separated only), `derived.{not_separated_groups,separated_subjects,primary_arm,range_only_subjects,display_rule.text}`, `design.arms.<s>.{arm,trials}`, `length.composite_if_pooled_slope_removed` (presence only → confound line).
- **Reuse:** `IntervalFigure` logic, re-hosted in strip form as `DashIntervalPanel`. Keep `groupBlocks`'s transitivity check: a non-transitive wave falls back to one plain alphabetical list with "Listed alphabetically".
- **Filters:** model filter per §0.1. Dimension filter: no effect, plus the fixed note.
- **Empty/withheld:** no publishable wave → the panel is replaced by "No unofficial pilot wave is published yet. No model has an official score." Every point withheld (a wave with no separated subject) → caption "No model was separated; ranges only."
- **A11y desc template:** `Horizontal ranges on a 0 to 100 scale, grouped; order carries no meaning. {for block}{blockWord}: {id} {lo} to {hi}{; …}. {visible n} of {N} models shown; grouping reflects all {N}. {STATUS_LINE}` (pilot-3 shape: one "Primary arm" panel with a three-member not-separated block and a separated singleton (gemma2-9b-A, whose tick is allowed), then a "Secondary arm" panel of four hollow, range-only rows).

## 2. Dimension matrix: NEW `DimensionRangeMatrix` (models × selected dimensions)

- **Reader question:** "On a given dimension, do models differ, and how sure is that?" (Read **down a column**.)
- **Chart and encoding:** a grid of **mini dot-range cells**. Rows = models (panel order, G4). Columns = selected dimensions in `DIMENSIONS` order. The header shows the code plus the item count ("AWR · 10–11 items"). Each cell holds a 1–5 micro-axis (the same scale in every cell, with gridlines at 2, 3 and 4) and a `HWhisker` for the range. A shape marker at the mean appears for a separated subject only. Cell width = (480 − 132) / k, so 8 dims ≈ 43 units, 3 dims ≈ 116. Above 6 selected dims the micro-axis labels are dropped and the shared scale is printed once in the column header.
- **Why a dot-range grid and not a heatmap of points:** (1) the projection **has no point** for 7 of 8 pilot-3 subjects, so a heatmap would have to colour withheld values or show mostly blank cells. (2) A heatmap encodes the mean as colour, which is colour-only encoding (a11y fail) and reads as band colours. (3) It hides uncertainty: on about 10 items per dimension the ranges overlap almost everywhere, and a colour gradient manufactures a difference the data cannot support. (4) Position on a common scale is the most accurately decoded channel (Cleveland–McGill).
- **Significance:** a cell shows no pairwise mark. One note line under the grid, derived from `dimension_pairwise` (projected) and `derived.dimension_bonferroni_separated_*`: "{survived} of {M} dimension comparisons survived correction; only those count as differences." M is the full-wave count (48 in pilot-3), even under a filter. The table lists the surviving pairs by name, with ranges only.
- **Fields:** `subjects.<s>.dimension_intervals95.<DIM>`, `.dimension_item_counts.<DIM>`, `.dimensions.<DIM>` (separated only, if present), `dimension_pairwise[].{a,b,dimension,interval95,bonferroni_separated}`, `dimension_pairwise_note`.
- **Filters:** a model filter hides rows. A dimension filter hides columns, but in a fixed SVG grid columns cannot reflow, so render **one strip per dimension column** (an HTML CSS-grid of per-cell SVGs) and toggle `hidden` on the column. The note keeps full-wave counts.
- **Withheld:** no mean marker, and the table cell reads "withheld (not separated)". **Defect to avoid when reusing `DimensionFigure`:** it reads `wave.subjects[ids[0]].dimensions` and computes "lowest mean for every model" from **withheld means**. On the projection that throws, and the sentence leaks within-model order derived from points that are not published. Do not port that annotation. Ask methodology whether the report should keep it.
- **A11y desc:** `Ranges for {k} dimensions on the 1 to 5 rating scale, one row per model, order carries no meaning. {DIM} {name} ({items} items): {id} {lo} to {hi}; …. {surviving} of {M} dimension comparisons survived correction. {n of N line}. {STATUS_LINE}`

## 3. Dimension profile small multiples: NEW `DimensionProfileMultiples`, behind `<details>`

- **Reader question:** "What does this one model's profile look like across the eight dimensions?" (Read **down one panel**.)
- **Chart and encoding:** one small panel per model, two across on desktop and one on mobile. Each panel has its shape and label in the header, 8 rows (dimensions), a 1–5 axis and a range whisker per row, plus a mean marker for a separated subject only. All panels share the axis and the row order. *Why not radar:* area and angular order distort the reading, and a range cannot be drawn honestly on a radar. *Why separate from §2:* the matrix compares models within a dimension, and this compares dimensions within a model.
- **Mandatory caveat (in-SVG, every panel):** "Differences between one model's own dimensions were not tested. Few items per dimension." The wave carries only between-model dimension comparisons (`dimension_pairwise`), so the profile is descriptive only. Never annotate a "strongest" or "weakest" dimension.
- **Fields:** same as §2.
- **Filters:** model → hide panels. Dimension → hide rows (strip form). n-of-N line in the figure footer.
- **Density:** collapsed by default (0 height), summary "Each model's eight dimension ranges".
- **A11y desc per panel:** `{id}: {DIM} {lo} to {hi}; … (1 to 5 scale). Within-model differences were not tested.`

## 4. Pre-registered comparisons: REUSE `ComparisonFigure` (arms waves) / guarded `PairFigure`

- **Reader question:** "Which differences are real?"
- **Chart and encoding:** difference whiskers on one shared axis with a **zero line** (`pf-zero`). Solid = uncorrected 95% range; dashed = Bonferroni range (primary-arm pairs). Groups: separated after correction → separated only without correction ("not stated as a separation") → not separated → secondary arm → B−A per build. **Ranges only; no point difference is drawn on the dashboard**, even for pairs where the projection keeps one. One rule is simpler than amendment 16's partial allowance and loses nothing, because the point sits in the report's table. *Why not a matrix of p-values:* ranges against zero show both size and uncertainty.
- **Fields:** `comparisons[].{a,b,kind,arm_a,arm_b,interval95,separated,bonferroni.{comparisons,interval,separated},b_minus_a.interval95}`, `comparisons_note`, `derived.{separated_pairs,separated_uncorrected_only_pairs}`, plus `preregistration.sha256`, shown beside the title (§5.6).
- **Non-arms waves (pilot-1/2):** `PairFigure` draws `pf-fill` at `r.diff` for separated pairs. On the projection `difference` is **deleted** whenever one side is withheld, so the point lands at `cx=NaN`. Add the guard: draw no point when `'difference' in p` is false. (Verify separately whether the report page shows point differences that amendment 16 now forbids.)
- **Filters:** a row shows only if **both** members are visible. Footer: "{k} of {K} pre-registered comparisons shown; the correction is for all {bonferroni.comparisons} and is not recomputed." The axis stays at full-wave extent.
- **Empty:** no `comparisons` and no `pairwise` → "No pre-registered comparison in this wave." A filter leaving no pair → "The selected models share no pre-registered comparison."
- **A11y desc:** `Ranges of the pre-declared differences, first minus second, with a line at zero. {group}: {a} minus {b} {lo} to {hi}, after correction {clo} to {chi}; …. A range that includes zero is not separated; that does not mean equal. {STATUS_LINE}`

## 5. Exploratory pairwise: NEW `ExploratoryPairTable`, behind a closed `<details>` toggle

- **Reader question (secondary, for researchers):** "What did every pair look like, including those not pre-registered?"
- **Encoding:** a **lower-triangle table** (N×N, alphabetical, panel order). Each cell shows the uncorrected range text and "range excludes 0 (uncorrected)" or "range includes 0". No SVG: 28 ranges are better read as text, and a second whisker chart would compete with §4. **Never use the words "separated" here.** `PairMatrix`'s "separated / not separated" vocabulary would contradict the corrected grouping: pilot-3 llama-A vs mistral-A excludes 0 uncorrected but is in the corrected not-separated group. Do not reuse `PairMatrix`.
- **Header (verbatim from data):** `pairwise_note` ("Exploratory and NOT pre-registered … Do not quote a pairwise entry as a finding"). Add `pairwise_note?: string` to `WaveBase`. Caption: "Exploratory: about 1 in 20 ranges excludes 0 by chance alone."
- **Fields:** `pairwise[].{a,b,interval95,separated}` (projected, no difference). **Filters:** rows and columns hide (an HTML table, so it reflows). **Empty:** fewer than 2 visible models → "Select two or more models."

## 6. Reply length: REUSE `LengthFigure` (Panel A scatter + Panel B slopes; A never without B)

- **Reader question:** "Could reply length explain the ranges?"
- **Encoding:** Panel A, x = median reply words (log), y = composite range as vertical whiskers. **No fitted line.** The bound ghost appears for a separated subject only (the projection already strips the others). Panel B: within-model slope dots against the zero line and the dashed pooled slope. *Why a scatter:* this is a correlation question, but the panel states that it cannot establish a cause.
- **Fields:** `subjects.<s>.{median_reply_words,pilot_composite_interval95,pilot_composite?}`, `length.{pooled_within_item_slope,pooled_within_item_r,within_subject_slopes,composite_if_pooled_slope_removed,note}`, `length_check.per_build[]` (table).
- **Filters:** Panel A hides `<g data-subject>` in place (no reflow is needed in a scatter). Panel B rows are strips. **The pooled slope is the full wave's** and is labelled "pooled across all {N} models". Axes stay fixed.
- **Not measured:** a null slope (one trial) → table cell "not computed (one trial per item)"; this already exists.
- **A11y desc:** the existing G4 template plus the n-of-N line.

## 7. Judge reliability: NEW `JudgeAgreementPanel` (+ REUSE `JudgeFigure` leniency in `<details>`) + optional bridge drift

- **Reader question:** "Do the judges agree with each other on each model's replies?"
- **Encoding (Panel A):** a strip per subject: shape and label, a dot at exact agreement on a **0–100% axis**, with the MAD and the "≥2-point differences" count as right-aligned text. Do not zoom the axis to 75–90%: the values cluster (0.80–0.84 in pilot-3), and zooming would dramatise noise. Fixed in-SVG note: "No chance-agreement baseline was measured. All judges are one family: this is consistency, not validity." (Emit it from `JudgeFigure`'s `chanceKnown` predicate.) A ≥2 count of zero prints "0", which is a measured value, not a missing one.
- **Panel B (only if `bridge_drift` present):** per judge, a diverging bar from zero for `mean_signed_difference_new_minus_original` on a fixed ±0.5 rating-point axis. Text: MAD, exact `{exact_match} of {pairs}`. The table adds "composite-scale equivalent if every rating moved by this amount = signed × 25" (methodology §3; D-1 shows why the signed value matters). Do not draw the 0.30 threshold line unless the wave carries its protocol anchor threshold.
- **Fields:** `subjects.<s>.judge_agreement.{exact,mean_absolute_difference,responses_differing_by_2_or_more}`, `routing.<s>.responses_by_judge_pair`, `judges.<j>.{leniency_vs_item_mean,by_subject}`, `judge_set.{judge_families,families_disjoint}`, `bridge_drift.{pairs,mean_abs_difference,exact_match,per_judge.*}`.
- **Filters:** a model filter hides Panel A rows. Panel B is per judge and is not affected; it says so.
- **A11y desc:** `Exact agreement between the two judges, 0 to 100 percent, by model: {id} {pct}% (MAD {m}, {k} replies differed by 2 or more); …. No chance baseline. {STATUS_LINE}`

## 8. Contamination probes: NEW `ContaminationTable` (a table, not a chart)

- **Reader question:** "Is there a sign that a model had seen the test items?"
- **Why a table:** these are small counts (0–6). A chart adds nothing and invites a pass/fail reading.
- **Columns:** Model · Recall probe: "{recall_items_flagged} of {recall_items_probed} sampled items flagged" · Identification: "{identification_correct} of {identification_asked} correct; chance probability if unexposed {p}" · Indicator: "Flagged" / "Not flagged" · Probe route (`via`) · Self-identifying replies (`self_identifying_replies.by_subject.<s>`, blinding).
- **Language rules (lexicon-gated):** never "clean", "uncontaminated", "passed", "safe" or "verified". Always "Not flagged". Every view carries the caption "Not flagged is not evidence of absence. The probes cover only the sampled items, and every item is public." The flag threshold is shown only if the wave exports it (recommend `contamination.rule`). Never type "4 of 6". Recall-probe informativeness ("every recall answer claimed no memory") is not in the wave. Recommend exporting `recall_probe_informative: boolean`; until then, use the generic caveat.
- **Filters:** rows hide. **Not measured:** missing `contamination` → "Not measured in this wave".

## 9. Instrument health: NEW `BankCoverageBar` + `InstrumentChecklist`

- **Reader question:** "How much of the test was used, and how much of it has humans checked?"
- **Encoding:** **two separate bars**, because validation is not a partition of serving. Bar 1 (`items_total` = 100%) is a segmented bar: served (solid `pf-fill`) | not served: sensitive (`pf-hatch`) | not served: unreviewed (outline `pf-cell`). Each segment is direct-labelled with "{n} of {total}", and the labels sit outside the bar when a segment is narrow. Bar 2: validated by humans, "{items_validated} of {items_total}". At zero it is an empty outlined bar labelled **"None of {total} validated by humans"**, never a blank. Zero baseline, true proportions.
- **Build guards (`must`):** `items_served + items_not_served == items_total`, and `items_not_served_sensitive + items_not_served_unreviewed == items_not_served`.
- **Checklist (text rows, no chart):** plan committed before data (`preregistration.committed_before_data`) plus sha · deviations `deviations[]` (id, date, title; "post-hoc" kept verbatim) · requote sensitivity (`sensitivity.ratings_whose_value_differs_from_the_original`, `separation_pattern_unchanged` → "Separation pattern unchanged" / "changed") · crisis items served (`design.crisis_items_served:false` → "Crisis items: not served in this wave") · bank version · judge family. Not exported → "Not measured": consistency, refusal, crisis handling, multilingual.
- **Filters:** none (whole wave). **A11y desc:** `Item bank: {served} of {total} served, {sens} not served as sensitive, {unrev} not served as unreviewed. {validated} of {total} validated by humans.`

## 10. Program status stat strip: NEW `ProgramStatusStrip` (top of page, not a chart)

- **Reader question:** "What is the status of this program, in one glance?"
- **Cells (label + token value):** Official model scores: `officialWaveCount` → **"None"** when 0 · Unofficial pilot waves published: `publishablePilotWaveCount` · Builds in this wave: `derived.build_count ?? subject_count`, with arms: "{arm_count} arms, {subject_count} variants" · Replies / ratings: `derived.{responses_total,ratings_total}` · Items served: `bank.items_served` of `bank.items_total` · Human-validated items · Judge family · Access tier (`accessTierLabel`).
- **Rules:** never "models evaluated" (that is `evaluatedModelCount`, official-only). Never sum builds across waves. No trend arrows, deltas or sparklines (comparability none). The strip carries the status line "Unofficial pilot · not a score · comparability none" in the same element (§5.1). The crisis-use note sits apart from every number (§5.9).

## 11. Release tracker tiers: NEW `ReleaseTierBoard` (PROPOSAL tiers; ship only after founder approval)

- **Reader question:** "A new model came out. Where is it in the process?"
- **Encoding:** three columns, **T0 "Release tracked, not evaluated" → T1 "Unofficial pilot card" → T2 "Official score"**. Each column shows its count and an alphabetical list (developer, then snapshot), with no figure in T0 and no order by result. T2 renders "None. Requires every official-score gate" and a gate checklist ("{met} of {total} gates met"), driven from a data file (recommend `model-benchmark/gates-v1.json`; never typed). Never use the word "provisional".
- **Fields:** `registry-v1.json` entries, `releases-v1.json.scanState`, `waves/manifest.json`. **Empty:** `scanState:"never-scanned"` → "Release scanning has not started. No release is tracked yet." T1 links go to the wave report, never to per-model routes (§5.10).

---

## 12. Components: reuse vs new

| Status | Component | Signature / change |
|---|---|---|
| Reuse as is | `Glyph`, `HWhisker`, `VWhisker`, `HAxis`, `SvgText`, `SvgLines`, `Footer`, `footerHeight`, `wrapText`, `range1/2`, `ModelName`, `DataTable`, `shapeFor`, `panelSubjects`, `hasArms`, `isSecondaryArm` | Unchanged. Extend `SHAPES` and add the build-count `must` (G3). |
| Reuse + guard | `IntervalFigure`, `ComparisonFigure`/`PairFigure`, `LengthFigure`, `JudgeFigure` | Accept `wave: PublicWave`. Treat absent `pilot_composite`/`dimensions`/`difference` as withheld. Remove the NaN point path in `PairFigure` (§4). |
| Do not reuse | `DimensionFigure` (withheld-mean predicate), `PairMatrix` ("separated" wording on uncorrected flags) | Superseded on the dashboard by §2, §3 and §5. |
| New type | `PublicWave` in `model-wave-facts.ts` | `Omit<PilotWave,"subjects"> & { subjects: Record<string, Omit<WaveSubject,"pilot_composite"\|"dimensions"> & { pilot_composite?: number; dimensions?: Record<string,number>; point_withheld?: { withheld: string[]; reason: string } }>; pairwise_note?: string; comparisons_note?: string; public_projection: {...} }` |
| New frame | `DashStripFigure` | `{ id; title; caption: ReactNode; svgTitle; descSpans: {key: string; subject?: string; dim?: string; text: string}[]; head: ReactNode /*axis SVG*/; rows: {subject?: string; dim?: string; height: number; svg: ReactNode}[]; foot: ReactNode; table: ReactNode; tableSummary; totalModels: number }` |
| New | `dashboardBlocks(wave: PublicWave): Block[]` | Not-separated first (G4); the transitivity check is retained. |
| New | `DashIntervalPanel` | `{ wave: PublicWave }` |
| New | `DimensionRangeMatrix` | `{ wave: PublicWave; dims?: string[] /*default all, DIMENSIONS order*/ }` |
| New | `DimensionProfileMultiples` | `{ wave: PublicWave }` |
| New | `ExploratoryPairTable` | `{ wave: PublicWave }` |
| New | `JudgeAgreementPanel` | `{ wave: PublicWave; showBridge?: boolean /*default: "bridge_drift" in wave*/ }` |
| New | `ContaminationTable` | `{ wave: PublicWave }` |
| New | `BankCoverageBar`, `InstrumentChecklist` | `{ wave: PublicWave }` each |
| New | `ProgramStatusStrip` | `{ wave: PublicWave; facts: typeof MODEL_WAVE_FACTS }` |
| New | `ReleaseTierBoard` | `{ registry: RegistryEntry[]; releases: ReleasesState; manifest: ManifestEntry[]; gates: GateRow[] }` |
| New (client) | `DashboardFilterBar` | `{ subjects: {id: string; shape: ShapeKind; hollow: boolean}[]; dims: string[]; total: number }`. Toggles `hidden` on `[data-subject]`/`[data-dim]` and syncs `location.hash`. No data imports. |

**Build tests:** (1) the projection is the only import path (fail on `waves/*.json` read outside `loadWave → projectWavePublic`). (2) No point/tick for any id in `public_projection.withheld_for`; parse the rendered SVG. (3) Lexicon over every title, desc, caption and n-of-N template. (4) The bank partition guards. (5) No digit literal in dashboard copy (extend `test:no-stale-counts`).

## 13. Priority (Impact + Alignment + Learning + Confidence − Effort − Risk, each 1–5)

| Panel | I | A | L | C | E | R | Score | Placement |
|---|---|---|---|---|---|---|---|---|
| §1 Composite ranges | 5 | 5 | 4 | 5 | 2 | 1 | **16** | Hero |
| §10 Stat strip | 4 | 5 | 3 | 5 | 1 | 1 | **15** | Top |
| §9 Instrument health | 4 | 5 | 4 | 5 | 2 | 1 | **15** | Main |
| §4 Pre-registered comparisons | 5 | 5 | 4 | 4 | 2 | 2 | **14** | Main |
| §7 Judge reliability | 3 | 5 | 4 | 4 | 2 | 1 | **13** | Main |
| §2 Dimension matrix | 5 | 4 | 4 | 4 | 3 | 2 | **12** | Main (above §7 on the page: comprehension before diagnostics) |
| §8 Contamination | 3 | 5 | 3 | 4 | 1 | 2 | **12** | Main |
| §6 Reply length | 3 | 4 | 4 | 4 | 2 | 2 | **11** | `<details>` |
| §3 Profiles | 3 | 3 | 3 | 4 | 2 | 2 | **9** | `<details>` |
| §5 Exploratory pairs | 2 | 3 | 3 | 4 | 1 | 3 | **8** | Closed toggle |
| §11 Release tiers | 4 | 5 | 3 | 2 | 3 | 3 | **8** | After founder approval |

**Next three to build:** (1) `DashIntervalPanel` + `DashStripFigure` + `DashboardFilterBar`. These set the filter contract once, and readers finally see which models the pilot can and cannot tell apart, with the "grouping reflects all N" guard. (2) `BankCoverageBar` + `ProgramStatusStrip`. Readers see in two seconds that there is no official score and that none of the items are human-validated. (3) `DimensionRangeMatrix`. Readers see that per-dimension ranges overlap almost everywhere, so they do not over-read dimension "strengths".
