# Entity Detail Page — Data-Visualization Proposal

**Agent:** dataviz-architect · **Date:** 2026-06-11
**Scope:** the strongest 8–10 visualization/graphic ideas for the entity detail page (`/company/{slug}`, `/country/{slug}`, …), grounded in the current page composition and the existing chart primitives.
**Constraint:** hand-rolled static-export-safe own-data SVG only; CC-BY "Compassion Benchmark"; no third-party/AI imagery; no fabricated trends. Reuse before build.
**This is a proposal artifact. No site code was modified.**

---

## Grounding — what the page shows today, and what's missing

`EntityDetail.tsx` (the only entity-page renderer, shared by all 7 kinds via `renderEntityPage.tsx`) currently visualizes the entity with exactly **one chart idiom**: eight `role="progressbar"` divs, one per dimension, each a dimension-colored fill on a 0–5 scale (`EntityDetail.tsx:337–381`). Everything else is text: a composite number in a card, a band pill, "rank #X of Y", a freshness stamp, the `EntityEvidenceCard`, and CTAs.

Concretely, the page answers **none** of the reader's five core questions visually:

| Reader question | Today | Gap |
|---|---|---|
| "Is 18.4 bad?" | bare number "out of 100" | no field/band context on the score itself |
| "Where did it fail / excel?" | 8 progress bars, **dimension-colored, 0–5, no band semantics** | bars don't encode good/bad; can't see shape; no min/max call-out |
| "Compared to peers?" | "#X of Y" text only | **no peer visual anywhere** |
| "Which way is it moving?" | nothing on entity page (`CompositeSparkline` lives only on `/history`) | trajectory invisible on the page itself |
| "How was it scored?" | link to /methodology | no in-page legend; bars have no decoder |

Meanwhile **four finished, static-export-safe primitives already exist and are not wired onto this page**:
`charts/BandPositionStrip.tsx`, `charts/DimensionProfileBar.tsx`, `charts/BandDistributionBar.tsx`, `charts/ScoreLegend.tsx` — plus `entity/CompositeSparkline.tsx` (used only on `/history`). Their own header comments say integration was "deferred to Wave H3." **Wiring these in is the lowest-effort, highest-leverage win on the whole page.**

Data available per entity, all build-time and already loaded:
- 8 dimension scores 0–5 (`entity.scores`), composite 0–100, band, rank, indexTotal, kind, sector/region/country metadata.
- Full peer set: every other entity in the same index JSON carries identical `scores`/`composite`/`band`/`rank`/`sector` → percentile, sector cohort, peer scatter all trivially computable.
- History (`getEntityHistory`): `events[].newComposite/delta/tier`, `latestScoreChange`, `daysSinceLastChange`, `tierCounts`, boundary-watch.

The ×1,160 leverage: every one of these graphics is a server component that renders from data already on the page, so a single build wires it onto **all ~1,160 entity pages** at once. There is no per-entity authoring cost — that is the entire reason to invest in own-data SVG.

---

## Reuse-now quick wins (wire these in first — near-zero build, all primitives already exist)

These four are not new components. They are finished SVG primitives sitting unused. Wiring them in is a props-and-placement task for frontend-engineer, not a design-from-scratch task.

1. **`BandPositionStrip`** → drop into the hero, beside the composite card. Instantly answers "is 18.4 bad?" by placing the score on the banded 0–100 track. (Idea #1)
2. **`DimensionProfileBar`** → replace (or sit above) the eight progress bars. Same 8 dimensions but **band-colored** so weak/strong reads without a legend, and it supports a delta ghost for free. (Idea #2)
3. **`ScoreLegend`** → add once as a closed `<details>` under the dimension section so the band/dimension colors have an in-page decoder. (Idea #8)
4. **`CompositeSparkline`** → already built and accessibility-complete; lift it from `/history` into an entity-page `<details>` (with the small-N honesty guard). (Idea #3)

Wiring all four is one PR and converts the page from "one chart idiom" to "answers four of the five reader questions."

---

## Ranked ideas

Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk (each 1–5; Priority shown as net).

---

### 1. Hero band-position strip — "is this score good or bad?"  ★ Priority: very high · REUSE

- **Reader question:** "Is 18.4 bad?" — the single most important question, and the page currently never answers it visually.
- **Chart type / encoding:** the existing `BandPositionStrip` — a 0–100 track segmented into the 5 band zones (Critical→Exemplary), boundary ticks at 20/40/60/80, and a band-colored marker dot at the entity's composite. Position = score; color = band; zones = "compared to the whole scale."
- **Data source:** `entity.composite` (0–100). Already a prop. `BandPositionStrip.tsx` exists verbatim.
- **Reuse vs new:** **REUSE** — zero new component. Just import and render.
- **Placement / density:** **Hero**, directly under or beside the composite card (`EntityDetail.tsx:140–146`). This is the one chart that earns hero space because it reframes the lone number.
- **Annotation/title pattern:** caption states the takeaway: *"{composite} of 100 — {Band} band ({range})."* e.g. "18.4 of 100 — Critical band (0–20)." Burn-Murdoch rule: the label carries the point, not just the axis.
- **aria-label:** already built — `"{entityName} score: {score} — in the {band} band ({min}–{max})"`.
- **×1,160 leverage:** one import → banded context on every entity page. Highest comprehension-per-byte on the page.
- **Note:** component currently takes `score` as the raw composite; pass `entity.composite` and `entity.name`. No change to the primitive needed.

---

### 2. Dimension profile — band-colored 8-bar replacement for the progress bars  ★ Priority: very high · REUSE

- **Reader question:** "Where is it strong, where did it fail?" The current progress bars are dimension-colored (decorative), so a reader cannot tell a 1.2 from a 4.8 by color — only by reading the number.
- **Chart type / encoding:** the existing `DimensionProfileBar` — 8 horizontal bars, one per dimension, each **band-colored by its own score** (red→blue), with the dimension code label, the score, and 20/40/60/80 gridlines. Length = magnitude; color = band; gridlines = where each dimension falls in the scale. This is the FT "deviation/magnitude across categories" idiom done right.
- **Data source:** `entity.scores` — but note the unit mismatch: `DimensionProfileBar` expects **0–100** per dimension; `entity.scores` are **0–5**. Trivial conversion (`score/5*100`, the same `scorePct` already in `EntityDetail.tsx:69`). Pass that.
- **Reuse vs new:** **REUSE** the primitive; the only work is the ×20 conversion + deciding whether it replaces or sits above the existing cards.
- **Placement / density:** **Hero-adjacent / top of the dimension section** (replaces or precedes `EntityDetail.tsx:337–381`). It's compact (8 thin rows) and is the page's "shape at a glance."
- **Annotation/title pattern:** title *"Where {name} is strong and weak — 8 dimensions on the 0–100 scale."* Optionally annotate the min and max dimension inline ("weakest: INT 24 · strongest: BND 71").
- **aria-label:** already built — enumerates every dimension code + name + score.
- **Bonus (free):** the primitive already accepts a `before` prop and draws a ghost bar + signed delta. When `history.latestScoreChange` exists, pass prior dimension scores to show movement per dimension with zero extra component work. (If per-dimension history isn't stored, ship without `before` — never fabricate the ghost.)
- **×1,160 leverage:** converts the most-viewed block on every entity page from decorative to diagnostic in one wiring pass.

---

### 3. Composite trajectory sparkline — "which way is it moving?" (with honesty guard)  ★ Priority: high · REUSE

- **Reader question:** "Is it improving or declining?" Today the entity page shows nothing; the trajectory is hidden on `/history`.
- **Chart type / encoding:** the existing `CompositeSparkline` — chronological line of `newComposite` over event dates, colored by net direction (green up / red down / muted flat), current value labeled at the right point. Time on X (gaps preserved), composite on Y.
- **Data source:** `history.events[].newComposite` + `entity.composite`. Already computed in `renderEntityPage.tsx` (the `history` object is built there).
- **Reuse vs new:** **REUSE** — already accessibility-complete and shipping on `/history`.
- **Placement / density:** **`<details>`** ("Score trajectory") near the `EntityEvidenceCard`, so it costs 0 height closed (Wave E1 density discipline). A 1-line summary ("net +6.2 over 4 assessments") sits on the `<summary>`.
- **Honesty guard (REQUIRED):** only render when there are **≥3 distinct scored points**. With 0–1 points a line is a fabricated trend — show the single value or nothing. This is an integrity rule, not a nicety; the component should be gated in `renderEntityPage.tsx`, e.g. `events.filter(e => e.newComposite != null).length >= 3`.
- **Annotation/title pattern:** summary states the net move and count; never a trend word ("rising") on a 2-point series.
- **aria-label:** already built — "Composite score over time … N data points from X to Y."
- **×1,160 leverage:** trajectory on every entity that has enough history, gated so thin-history entities (the majority today) degrade honestly.

---

### 4. Sector-cohort percentile strip — "compared to its peers, not the whole field"  ★ Priority: high · NEW (small)

- **Reader question:** "Sure it's rank #312 of 447 overall — but how does it compare to *other banks* / *other Gulf states* / *other AI labs*?" The most persuasive comparison for a buyer evaluating one entity is its peer cohort, and the page has none.
- **Chart type / encoding:** a ranked **dot strip**: a thin horizontal axis of all same-sector (companies) / same-region (countries/cities) / same-category peers' composites, each a faint dot, with **this entity's dot enlarged and band-colored**, plus a label "*Nth of M in {sector}*". This is the FT "ranking / position-in-field" idiom. Reuses `BandPositionStrip`'s visual grammar (banded track) but plots the cohort, not just the marker.
- **Data source:** filter the same index JSON by `metadata.sector` (companies) / `region` / `country` / `category` — every peer carries `composite`. Group-by + sort is ~15 lines at build time. **No fabrication** — pure aggregation of scored data.
- **Reuse vs new:** **NEW** small component (`SectorPercentileStrip`), but it's a thin variant of `BandPositionStrip` and shares its band constants. ~80 SVG lines.
- **Placement / density:** **Hero-adjacent or first `<details>`** — "How {name} compares to its {sector} peers." For companies/cities the cohort is large and meaningful; for tiny cohorts (some categories) gate to ≥5 peers or fall back to index-wide.
- **Annotation/title pattern:** *"{name} ranks {n} of {m} {sector} {kindPlural} — {above/below} the sector median ({med})."* Mark the median tick.
- **aria-label:** "{name} composite {x}; ranks {n} of {m} in {sector}; sector median {med}, range {min}–{max}."
- **×1,160 leverage:** every entity gets a *relevant* peer comparison for free; this is the comparison a Score-Watch / dataset buyer actually cares about, so it doubles as conversion surface.

---

### 5. Index band-distribution bar with "you are here" marker — "how rare is this score?"  ★ Priority: high · REUSE + tiny extension

- **Reader question:** "Is an Established score common or rare in this index?" Context the lone band pill can't give.
- **Chart type / encoding:** the existing `BandDistributionBar` (stacked bar of the 5 band counts for the entity's index) **plus a small caret/marker under the entity's own band segment**. Part-to-whole of the field; the marker locates the entity within the distribution.
- **Data source:** `BandDistributionBar` already computes counts from `indexes/{slug}.json`; pass `index = KIND_CONFIG[kind].indexSlug`. The marker just needs the entity's band.
- **Reuse vs new:** **REUSE** the bar as-is for v1 (no marker); the "you are here" caret is a tiny optional extension (one `<polygon>` positioned under the matching segment). Ship v1 with zero changes, add the caret in a follow-up.
- **Placement / density:** **`<details>`** ("How {indexLabel} scores are distributed") — context, not headline.
- **Annotation/title pattern:** *"{name} sits in the {band} band — {count} of {total} {kindPlural} ({pct}%) score here."*
- **aria-label:** already built (full distribution); extend marker label with "{name} falls in the {band} segment."
- **×1,160 leverage:** one bar per index (7 distinct renders) reused across all members of that index; rarity framing makes a high band feel earned and a low band feel diagnostic.

---

### 6. Strength/weakness deviation bars — dimensions vs the entity's own average  ★ Priority: medium-high · NEW (small)

- **Reader question:** "Within this entity, which dimensions are *relatively* dragging or leading?" A flat profile of 8 bars shows absolute level; a deviation chart shows internal imbalance ("integrity is its blind spot even though everything else is fine").
- **Chart type / encoding:** **diverging bars from the entity's own composite/mean** — each dimension as a bar extending left (below own average, orange) or right (above, green) of a center baseline. FT "deviation" idiom. This is the single best graphic for *narrative* ("strong on Action, hollow on Accountability").
- **Data source:** `entity.scores` + their mean. Pure arithmetic, no new data.
- **Reuse vs new:** **NEW** small component (`DimensionDeviationBars`), ~90 SVG lines, shares band/dimension color tokens and the `DimensionProfileBar` layout constants.
- **Placement / density:** **`<details>`** ("Relative strengths and gaps") — it's a second lens on the same 8 numbers, so it belongs behind disclosure to respect the density budget; pairs naturally under #2.
- **Annotation/title pattern:** *"Relative to its own average ({mean}), {name} leads on {topDim} and lags on {bottomDim}."* Center baseline labeled with the mean.
- **aria-label:** "Dimension deviation from {name}'s average {mean}: " + each dim's signed gap.
- **Risk note:** must use a **zero-deviation baseline** and label it as "relative to this entity's average," never imply absolute quality. Honest framing required.
- **×1,160 leverage:** turns 8 numbers into a one-glance "personality" on every page; high learning value as a reusable deviation primitive for /updates and reports too.

---

### 7. Subdimension drill-down heat-grid — "where inside a weak dimension did it fail?"  ★ Priority: medium · NEW (medium) — gated on data

- **Reader question:** "Awareness is 2.1 — but is that a uniform 2.1, or is it 4 on detection and 0.x on blind-spots?" The 40-subdimension structure exists in `dimensions.ts` but is invisible per-entity.
- **Chart type / encoding:** an 8×5 **band-colored cell grid** (rows = dimensions, columns = the 5 subdimensions), each cell colored by its 1–5 anchor level. The FT "heatmap of an ordered category matrix." Reveals texture the dimension roll-up hides.
- **Data source:** **gated** — `entity.scores` only carries the 8 roll-ups today; subdimension scores are referenced as a product feature ("subdimension breakdowns" in the purchase CTA, `EntityDetail.tsx:476`). **Do not fabricate cells.** Two honest paths: (a) if/when subdimension scores land in the entity data, render real cells; (b) until then, render the grid as a **structure/anchor reference** (cells show the 5 anchor labels from `dimensions.ts`, not scores) behind a "what each dimension measures" disclosure — still useful, never misleading.
- **Reuse vs new:** **NEW** medium component (`SubdimensionGrid`), ~140 lines.
- **Placement / density:** **`<details>`** per dimension or one grid behind "Full subdimension detail."
- **Annotation/title pattern:** v(a): *"{name}'s weakest subdimension: {sub} ({score}/5)."* v(b): structural, no entity claim.
- **aria-label:** matrix described row-by-row with codes + values (or anchor labels in v(b)).
- **Why ranked here:** highest *potential* depth, but its best version depends on data the page doesn't yet expose — so it scores lower on Confidence and carries the only real fabrication risk. Flagged explicitly; ship the honest reference version now, upgrade when data lands.

---

### 8. In-page ScoreLegend disclosure — the decoder for every color on the page  ★ Priority: medium-high · REUSE

- **Reader question:** "What do these bands and dimension colors *mean*?" Every graphic above leans on band color and dimension color; without a decoder, color-encoding is opaque to a first-time visitor.
- **Chart type / encoding:** not a chart — the existing `ScoreLegend` `<details>`: the 5-band scale with colors + descriptions, and the 8-dimension glossary. It makes "encode once, decode for free" actually true site-wide.
- **Data source:** `dimensions.ts` (`DIMENSIONS`, band descs) — self-contained.
- **Reuse vs new:** **REUSE** verbatim.
- **Placement / density:** **`<details>` closed by default**, once, under the dimension section. In DOM always → crawlable / Pagefind-indexable (SEO bonus).
- **Annotation/title pattern:** summary "How to read the scores" (already in component).
- **×1,160 leverage:** one import unlocks the legibility of every other graphic on all entity pages; pairs with #1/#2/#6 which all depend on band color being decodable.

---

### 9. Peer scatter — dimension trade-off ("does it buy Action at the cost of Boundaries?")  ★ Priority: medium · NEW (medium)

- **Reader question:** "Among its peers, is this entity's *pattern* unusual — high empathy but low accountability?" A scatter exposes trade-offs a per-entity bar set cannot.
- **Chart type / encoding:** a 2-axis **scatter** of all index (or sector) peers on two chosen dimensions (e.g. X = Accountability, Y = Action), faint dots for peers, the entity's dot enlarged/band-colored, quadrant gridlines at the band midpoints. FT "correlation" idiom — used *sparingly* per role guidance.
- **Data source:** every peer's `scores` in the index JSON. Pure aggregation.
- **Reuse vs new:** **NEW** medium component (`PeerScatter`), ~130 lines; the axis pair could be fixed (the two most diagnostic dimensions) to avoid an interactive picker (static export — no runtime controls).
- **Placement / density:** **`<details>`** ("How {name}'s pattern compares") — advanced lens, low on the page.
- **Annotation/title pattern:** *"{name} scores high on {X} but low on {Y} — unusual among {cohort}."* Only assert "unusual" when the entity is a genuine outlier (>1σ); otherwise neutral.
- **Risk note:** scatter is the easiest chart to over-read; keep axis pair fixed and meaningful, label the entity dot, don't imply causation. Lower priority because effort is higher and the insight is narrower than #4/#6.
- **×1,160 leverage:** one component, any dimension pair, all entities — but most valuable for large-cohort kinds (companies, cities).

---

### 10. Evidence-tier provenance bar — "how well-sourced is this assessment?"  ★ Priority: medium · NEW (tiny)

- **Reader question:** "How much evidence is behind this score — is it one wire story or a documented pattern?" Trust/independence question that a benchmark institution must answer visibly.
- **Chart type / encoding:** a small **segmented count bar** of `tierCounts` (A/B/C/D evidence tiers) — same stacked-bar grammar as `BandDistributionBar`, repurposed for provenance. Part-to-whole of the evidence base.
- **Data source:** `history.tierCounts` — already computed and passed into `EntityEvidenceCard` (`renderEntityPage.tsx:104`). No new data.
- **Reuse vs new:** **NEW** tiny component (`EvidenceTierBar`), ~60 lines, or fold into `EntityEvidenceCard` which already receives `tierCounts`. Strong reuse of the stacked-bar pattern.
- **Placement / density:** inside/under the **`EntityEvidenceCard`** ("Assessment record") — exactly where provenance belongs.
- **Annotation/title pattern:** *"{A} Tier-A (always-visible) assessments · {total} events on record."* Neutral, independence-safe language (no "risk"/"alert" — matches the card's existing policy).
- **aria-label:** "Evidence base: {A} Tier-A, {B} Tier-B, {C} Tier-C, {D} Tier-D events."
- **×1,160 leverage:** makes the rigor of every assessment legible at a glance; reinforces the OWID/V-Dem independence positioning that is the product's strategic moat.

---

## Ranked summary

| # | Idea | Reuse/New | Effort | Why it wins |
|---|------|-----------|--------|-------------|
| 1 | Hero band-position strip | **REUSE** | XS | Finally answers "is this score bad?" — hero |
| 2 | Band-colored dimension profile | **REUSE** | XS | Makes the 8 bars diagnostic, not decorative; free delta ghost |
| 8 | In-page ScoreLegend | **REUSE** | XS | Decoder that unlocks every color-encoded graphic |
| 3 | Composite trajectory sparkline | **REUSE** | S | "Which way is it moving?" — gated for honesty |
| 4 | Sector-cohort percentile strip | NEW (S) | S | The peer comparison a buyer actually cares about |
| 5 | Index band-distribution + marker | **REUSE**+tiny | S | "How rare is this band?" |
| 6 | Dimension deviation bars | NEW (S) | S | One-glance personality / narrative lens |
| 10 | Evidence-tier provenance bar | NEW (XS) | XS | Visible rigor → independence moat |
| 9 | Peer dimension scatter | NEW (M) | M | Trade-off pattern for large cohorts |
| 7 | Subdimension heat-grid | NEW (M) | M | Deepest, but gated on data the page lacks |

**Sequencing recommendation:** ship #1, #2, #8, #3 as a single "wire the existing primitives" PR (all REUSE, hero+dimension+legend+trajectory) — this alone takes the page from one chart idiom to four answered reader questions. Then #4 and #5 (peer/field context). Then #6/#10 (narrative + provenance). Hold #9/#7 until the first batch is validated and (for #7) subdimension data is exposed.

---

## Top 3 next graphics — what each finally lets the reader understand

1. **Hero band-position strip (#1)** — the reader instantly knows whether the composite is good or bad *on the actual scale*, instead of staring at a context-free number.
2. **Band-colored dimension profile (#2)** — the reader sees the entity's *shape* — where it's strong, where it failed — without reading eight numbers, because color now means quality.
3. **Sector-cohort percentile strip (#4)** — the reader sees how the entity stacks up against the peers it's actually judged against, which is the comparison that drives both understanding and purchase intent.

---

### Independence / integrity checklist (applies to every idea above)
- All graphics render from our own scored data — fully reproducible, CC-BY "Compassion Benchmark." ✔
- No third-party / satellite / wire / AI imagery; the verbatim evidence quote remains the human anchor. ✔
- No fabricated trends: #3 gated to ≥3 points; #7 never invents subdimension cells; #9 only calls an entity "unusual" when it genuinely is. ✔
- Honest encoding: zero baselines (#2/#6), band-zone truth on the scale (#1/#5), deviation baselines labeled as *relative to the entity's own average* (#6). ✔
- Accessibility: every SVG ships `role="img"` + numeric `aria-label`; color always paired with label/position, never color-only. ✔
