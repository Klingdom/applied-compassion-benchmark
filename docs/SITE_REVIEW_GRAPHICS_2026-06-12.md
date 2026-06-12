# Site-Wide Visualization & Graphics Strategy (2026-06-12)

**Author:** dataviz-architect · **Scope:** the WHOLE site EXCEPT the entity page (entity page covered by Waves 1–3: band-position strip, dimension profile, radar, deviation bars, distribution). This doc covers **Home/landing, the 7 index pages, Methodology, Briefings (beyond the shipped sparkline/distribution), and a cross-site embeddable CC-BY chart system.**

**Constraints (hard):** static export (Next.js 16, `output: 'export'`, `images: unoptimized`) → all graphics are **build-time hand-rolled inline SVG**, no charting deps, no runtime canvas. **Own-data only** (reproducible from our scored JSON); **CC-BY "Compassion Benchmark"**; **never host third-party/AI imagery** (link-only via `SourceChip` + archive). Every graphic carries `role="img"` + a numeric `aria-label`/`<title>`; band color is always paired with label/position (never color-only).

**Scoring:** `Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk` (each 1–5; higher = do first).

---

## Ground truth (what already exists — reuse before building)

**Shipped chart primitives** (`site/src/components/charts/`), several NOT yet used outside the entity page / briefing:
- `BandDistributionBar` — stacked 5-band bar; **accepts `index="all"` (aggregates all 7 indexes / ~1,156 entities), an individual index slug, OR explicit `counts`**; built-in legend, `highlightBand` caret, aria. **This is the single most under-deployed asset on the site.**
- `BandPositionStrip` — 0–100 track with band zones + entity marker + optional `medianScore` tick + "X pts to next band" hint.
- `DimensionProfileBar` — 8 band-colored bars (AWR…INT) from a 0–100 scores object, optional before/after ghost.
- `DimensionRadar` — 8-axis polygon (0–5 scores), optional overlay + area-misleads caveat.
- `ScoreLegend` — `<details>` "How to read the scores" (bands + 8-dimension glossary). Server, crawlable.
- `ScoreSparkline` / `CompositeSparkline` — band-zone-shaded trajectory.

**Data realities** (verified in `site/src/data/indexes/*.json`):
- Dimension scores are stored **0–5**; **composite is 0–100**; `band` lowercase. `DimensionProfileBar` expects **0–100** (multiply dim ×20); `DimensionRadar` expects **0–5** (pass raw).
- Every index `meta` carries `meanScore` + `medianScore` (feed the median tick / reference lines for free).
- Breakdown fields per index: countries → `region`; global-cities → `country` + `region`; us-cities → `state` + `region`; us-states → `region`; fortune-500 → `sector` (+ `f500Rank`); ai-labs → `sector` + `hq`; robotics-labs → `category` + `country`.
- `dimensions.ts` holds canonical order + per-dimension `color` (AWR cyan … INT violet) + `BAND_DESCS`.

**Current visual gaps:**
- **Home** (`app/page.tsx`): zero charts. Two plain HTML tables (publication set, today's research). Headline stat is "1,155 entities" with no picture of *how compassionate the world is*.
- **Index pages** (`app/countries/page.tsx` + 6 siblings): `IndexHero` renders band distribution as a **4-column HTML table**; the rankings are a **bare `RankingTable`**. No distribution strip, no sector/region breakdown, no top/bottom callout graphic, no map.
- **Methodology** (`app/methodology/page.tsx`): the 8-dimension framework, 0–5 anchor ladder, 5-band scale, and the **integration-premium formula** are all **prose + tables**. The site's core IP is invisible.
- **Briefings**: have the sparkline + band-distribution from the prior wave; missing a *cross-index* "state of the field" and a standalone shareable chart-of-the-day.

---

## Reuse-now quick wins (ship first — ~3-line swaps, zero new components)

> These deploy **already-built** primitives onto surfaces that currently use plain tables. Highest leverage per hour on the whole site.

| # | Move | Surface | What it replaces | Effort |
|---|------|---------|------------------|--------|
| **QW-1** | Drop `<BandDistributionBar index="all" />` into the Home hero | Home | the picture the site lacks entirely | Trivial |
| **QW-2** | Replace `IndexHero`'s band-distribution **table** with `<BandDistributionBar index={slug} highlightBand>` | all 7 index pages (×7 reuse) | the 4-col HTML table | Trivial |
| **QW-3** | Render `<ScoreLegend />` once on each index page + methodology | 7 indexes + methodology | nothing (adds teach-the-scale) | Trivial |
| **QW-4** | Per-row `<BandPositionStrip score={composite} medianScore={meta.medianScore} compact />` in the top/bottom callout | index pages | numeric-only callout | Low |

QW-1/QW-2 alone convert **8 plain tables into the site's signature encoding** and make the band model decode-for-free everywhere.

---

## Ranked backlog by surface

### A. HOME / LANDING — the "State of Institutional Compassion" signature

The home page is the front door and currently shows **no data picture**. The single highest-strategic-value graphic on the whole site lives here: one honest cross-index visual that *only this institution can draw* (no comparator scores governments + corporations + AI labs + robotics + cities on one scale).

**H1 — "State of institutional compassion" master distribution** · **Priority 17** · reuse
- *Reader question:* "Across everything you measure — is the world doing well at this?"
- *Chart + encoding:* `BandDistributionBar index="all"` — single stacked 5-band bar across all ~1,156 entities; length = share, band color = level, in-segment count + %. Bold takeaway title above it (knowledge-architect): e.g. *"Of 1,156 institutions benchmarked, most sit in Critical–Functional."*
- *Data:* `BandDistributionBar`'s built-in `index="all"` aggregation. **Zero new data.**
- *Reuse vs new:* **pure reuse** (QW-1).
- *Placement:* Home hero, replacing or beside the static "current publication set" table. Density: hero, full width.
- *Accessibility:* primitive already emits `role="img"` + "Band distribution across 1,156 entities: Critical … (n, %) …".
- *×leverage:* the canonical institution-level artifact; reused on briefings + as the OG card base.

**H2 — Small-multiple band strips: one per index ("the 7 fields at a glance")** · **Priority 15** · new (thin)
- *Reader question:* "Which sectors are healthy and which are in crisis?" (governments vs corporations vs AI labs vs cities)
- *Chart + encoding:* 7 stacked mini band-bars (one per index), **sorted by % in Established+Exemplary**, each labeled with index name + n. This is FT "small multiples" — comparison across categories with a shared scale. Reveals the real story (e.g. us-cities meanScore 38.1 vs robotics 56.7) that the homepage card grid hides.
- *Data:* `BandDistributionBar` called 7× with each slug; or a thin `IndexBandStrips` wrapper iterating `INDEX_DATA`.
- *Reuse vs new:* reuses `BandDistributionBar` 7×; optional thin layout wrapper.
- *Placement:* Home, "Published indexes" section — turns the link grid into a *ranked comparison*. Closed-`<details>` acceptable on mobile.
- *Accessibility:* each bar's existing aria + a group label "Band distribution by index, sorted by share in the top two bands."
- *×leverage:* doubles as the index-directory hero (`/indexes`) and a recurring briefing visual.

**H3 — Live "today's movement" delta bullets on the home research strip** · **Priority 13** · reuse
- *Reader question:* "What changed today and by how much?"
- *Chart + encoding:* the home "Today's research" cards already show `published → assessed`. Add a `BandPositionStrip score={assessed} medianScore={published}` so the move is *positional*, not just two numbers, with the band crossing visible.
- *Data:* `updates.scoreChanges[]` (already read in `page.tsx`: `publishedScore`, `assessedScore`, `band`).
- *Reuse vs new:* **pure reuse** of `BandPositionStrip`.
- *Placement:* inside the two existing score-change cards.
- *Accessibility:* primitive aria already names both positions + band.
- *×leverage:* same component used on every briefing card.

---

### B. INDEX PAGES (×7) — rankings are a bare table

Every index page shares `IndexHero` + `RankingTable`. **One fix replicates across 7 pages** (and every future index). This is the biggest *reuse-leverage* surface on the site.

**I1 — Replace the `IndexHero` band-distribution TABLE with `BandDistributionBar`** · **Priority 17** · reuse (×7)
- *Reader question:* "What does this whole field look like — and where do most entities land?"
- *Chart + encoding:* swap the 4-column HTML table in `IndexHero` for `<BandDistributionBar index={slug} highlightBand={undefined} />`. Length = share, in-bar n + %. The `bands` prop already passed to `IndexHero` carries exactly the counts.
- *Data:* `data.bands` / `data.rankings[].band` (already loaded).
- *Reuse vs new:* **pure reuse** (QW-2). `IndexHero` takes `children`/`bands` already; minimal prop change.
- *Placement:* the existing `<Panel>` in `IndexHero`'s right column.
- *Accessibility:* built in.
- *×leverage:* **×7 pages from one change**; consistent encoding with Home + briefings.

**I2 — Sector/region breakdown bar ("which cohorts lead and lag")** · **Priority 15** · new
- *Reader question:* "Within this index, which sector/region is most vs least compassionate?"
- *Chart + encoding:* horizontal **ranked bar of mean composite by group** (sector for fortune-500/ai-labs; region for countries/cities/states; category for robotics; country for global-cities) — bars sorted descending, colored by the *group-mean's* band, value label at end, a faint vertical line at the index mean (`meta.meanScore`). FT "magnitude + ranking." This is the single most *citable/quotable* index graphic ("Retail outscores Energy by 22 points").
- *Data:* group-by over `rankings[]` on the index-specific field; pure build-time reduce. No new data.
- *Reuse vs new:* **new** `GroupMeanBars` primitive (generic: takes `{label, mean, n}[]`). One component serves all 7 via different group key. ~Med effort.
- *Placement:* index page, new "Breakdown" section above the full table. Density: lead graphic, full width.
- *Accessibility:* `role="img"`, aria = "Mean composite by {sector/region}: {group}: {mean} (n) …; index mean {meanScore}."
- *×leverage:* one component, 7 index pages, every grouping; recurring briefing fodder ("sector watch").

**I3 — Top-5 / Bottom-5 callout with position strips** · **Priority 14** · reuse
- *Reader question:* "Who's best and worst here, and how far apart are they?"
- *Chart + encoding:* two small stacks (leaders / laggards), each row = name + `BandPositionStrip score={composite} medianScore={meta.medianScore} compact`. Makes the spread *visible* (e.g. Switzerland 97.5 vs the floor). Extends the existing answer-first lead sentence the country page already builds (`topEntry`/`bottomEntry`).
- *Data:* `rankings.slice(0,5)` + `slice(-5)`; `meta.medianScore`.
- *Reuse vs new:* **reuse** `BandPositionStrip`; thin list layout.
- *Placement:* index page, between hero and table; mirrors the AEO lead paragraph.
- *Accessibility:* per-strip aria already names score, band, median, pts-to-next-band.
- *×leverage:* ×7; the top/bottom pair is the most-screenshotted index artifact.

**I4 — Own-band choropleth (geographic indexes only)** · **Priority 12** · new (medium-high)
- *Reader question:* "What's the *geography* of compassion?"
- *Chart + encoding:* a hand-rolled inline-SVG world/US map with regions/states filled by **our band colors**. Honest caveat for partial coverage (countries 193/207, states 21/51) — render uncovered units in neutral grey with a "not yet scored" legend entry (no fabricated fills). Applies to: countries, us-states, us-cities (points), global-cities (points).
- *Data:* `rankings[].band` joined to a **static own/CC0 topojson→inline-SVG path set committed to the repo** (no external tiles, no runtime fetch — keeps static-export-safe; do NOT use OSM raster tiles, which add license-attribution + a network dependency). Points-on-map for cities uses lat/long we'd add to the JSON (small data task) or region-centroid clustering as a v1.
- *Reuse vs new:* **new** `BandChoropleth` (paths committed as data). Higher effort + the only item needing a new static asset; flagged for sequencing later.
- *Placement:* countries / us-states index hero or a dedicated "Map" section, in `<details>` on mobile.
- *Accessibility:* `role="img"` + aria enumerating per-region band counts; **must** pair color with a labeled legend and a data-table fallback (already have `CrawlableRankingTable`).
- *×leverage:* 3–4 geographic indexes; strong social/press artifact; but highest effort + only own-band-color encoding keeps it integrity-safe.

---

### C. METHODOLOGY — the framework & formula are invisible

The methodology page is the trust/IP centerpiece and is **entirely prose + tables**. Visualizing the framework makes it *teachable, citable, and defensible* — and every graphic here is reusable as an explainer across the site and in sales decks.

**M1 — The 8-dimension wheel / framework diagram** · **Priority 15** · reuse-ish
- *Reader question:* "What are the 8 things you measure, and how do they relate?"
- *Chart + encoding:* an **empty (or exemplar-filled) `DimensionRadar`** used as a *labeled framework diagram* — 8 axes named AWR…INT in their canonical colors, with the 0–5 anchor rings labeled (Absent→Exemplary). Not an entity score: a "this is the instrument" diagram. Pairs with the existing "Framework overview" card grid.
- *Data:* `DIMENSIONS` (names, codes, colors) — pass a flat 5,5,5… or a representative profile; **zero entity data.**
- *Reuse vs new:* **reuse** `DimensionRadar` (it already renders rings + colored axis labels); a thin "framework mode" caption.
- *Placement:* methodology "Framework overview" section.
- *Accessibility:* aria = "The 8 compassion dimensions: Awareness, Empathy … each scored 0–5."
- *×leverage:* the canonical framework graphic — reuse on Home "How it works", `/about`, sales.

**M2 — The 0–5 anchor ladder ("what each score means")** · **Priority 14** · new (thin)
- *Reader question:* "What does a 3 vs a 5 actually mean?"
- *Chart + encoding:* a vertical **5-rung ladder** (Active Harm 0 → Exemplary 5) as colored stacked segments mapped to the band palette, each rung labeled with the anchor word + one-line meaning (from the existing rubric table). Turns the "Rubric anchors" HTML table into a scannable scale.
- *Data:* the anchor rows already inline in `methodology/page.tsx`; `dimensions.ts` `anchors[]` per subdimension.
- *Reuse vs new:* **new** small `AnchorLadder` (trivial SVG; or even styled divs). Low effort.
- *Placement:* "Rubric anchors and score bands" section, beside the band cards.
- *Accessibility:* `role="img"` + aria listing all 6 anchors.
- *×leverage:* explains the unit behind every number sitewide.

**M3 — Integration-premium "explain the formula" diagram** · **Priority 14** · new
- *Reader question:* "Why isn't the score just the average? Where do the +10 points come from?"
- *Chart + encoding:* a **part-to-whole stacked bar**: `base/80` + `integration premium (0–10)` → `composite/100`, annotated with the consistency-factor ladder (std-dev ≤1.5 → 100% … >5.0 → 10%) and the harm-override → 0 rule. A worked example (a real entity's 8 dims → base → premium → composite) makes the math legible. This is the most-misunderstood part of the model; visualizing it is a defensibility win.
- *Data:* the formula constants already in `methodology/page.tsx`; one worked example computed at build time from any `rankings[]` row.
- *Reuse vs new:* **new** `IntegrationPremiumDiagram` (stacked bar + annotated ladder). Med effort.
- *Placement:* "Integration premium logic" panel.
- *Accessibility:* aria spelling out base, premium, composite, and the consistency tiers.
- *×leverage:* one diagram; settles the recurring "how is this computed" question; quotable in the report PDF.

**M4 — Evidence-tier pyramid** · **Priority 12** · new (thin)
- *Reader question:* "What evidence counts more?"
- *Chart + encoding:* a 5-tier **pyramid/wedge** (T1 independent audit at the narrow top … T5 self-report at the wide base), width = abundance, vertical = weight; the "evidence beats aspiration" rule annotated. Converts the existing 6-card grid into one honesty-encoding graphic.
- *Data:* the tier copy already inline in `methodology/page.tsx`.
- *Reuse vs new:* **new** trivial SVG (or CSS).
- *Placement:* "Evidence hierarchy" section.
- *Accessibility:* aria naming all 5 tiers top→bottom.
- *×leverage:* reusable next to any evidence/provenance block (entity pages, briefings).

---

### D. BRIEFINGS — beyond the shipped sparkline/distribution

The daily/special briefings already have `ScoreSparkline` + (from the prior wave) a band-distribution. The gaps are a **cross-index "state of the field"** anchor for quiet days and a **standalone shareable chart**.

**D1 — Cross-index "state of the field" strip (quiet-day anchor)** · **Priority 14** · reuse
- *Reader question:* "Even on a day with no big moves — how's the field overall?"
- *Chart + encoding:* `BandDistributionBar index="all"` (or the H2 7-index small-multiples), with the day's moved entities' bands carated via `highlightBand`. Guarantees every briefing has a visual even when `scoreChanges` is empty.
- *Data:* the same aggregation primitive + today's `scoreChanges` slugs.
- *Reuse vs new:* **pure reuse.**
- *Placement:* briefing header / "today in brief" when no large delta exists.
- *Accessibility:* built in.
- *×leverage:* shared with Home H1; one asset, two surfaces.

**D2 — "Chart of the Day" — one standalone narrative chart** · **Priority 13** · reuse + wrapper
- *Reader question:* "What's the one number worth remembering today?"
- *Chart + encoding:* a single hero chart (most often the moved entity's `BandPositionStrip` or trajectory, occasionally the I2 sector breakdown) with a **bold Burn-Murdoch headline** ("Bolivia's drop puts it below 93% of countries") + a copy-embed/cite affordance (see E1). OWID "Graphic Detail" model.
- *Data:* today's lead `scoreChange` + index `rankings` for the percentile.
- *Reuse vs new:* reuses existing strips/sparkline inside a `ChartOfTheDay` framing wrapper.
- *Placement:* top of the briefing.
- *Accessibility:* the wrapped primitive's aria + a visible takeaway caption.
- *×leverage:* the recurring shareable artifact that drives backlinks.

---

### E. CROSS-SITE — embeddable, attributed CC-BY chart system (OWID model)

Every chart we draw is already own-data + CC-BY. The strategic unlock is making each one a **citation/backlink surface** — the OWID/V-Dem growth flywheel. This is infrastructure, not a single chart, and it multiplies the value of *every* item above.

**E1 — "Cite / embed this chart" affordance on every figure** · **Priority 15** · new (cross-cutting)
- *Reader question (publisher's):* "How do I reuse this with attribution?"
- *Mechanism:* a small `<figcaption>` action under each chart figure offering (a) **copy citation** ("Compassion Benchmark, *{Index} 2026*, CC-BY, {url}") and (b) **copy a static-img/iframe-free embed** — since we're static-export, the "embed" is a **link to a permalinked standalone chart page** (`/charts/{id}`) that renders the same server SVG, plus a "copy image" (right-click the inline SVG). No runtime JS embed widget needed.
- *Data:* the chart's own props + canonical URL.
- *Reuse vs new:* **new** thin `ChartFrame` wrapper (figure + caption + cite button) that all primitives opt into; tiny client island only for clipboard.
- *Placement:* wraps Home H1/H2, index I1/I2/I3, methodology M1–M4, briefing D1/D2.
- *Accessibility:* the cite button is a real `<button>` with `aria-label`; SVG aria unchanged.
- *×leverage:* **every chart on the site** becomes a backlink/attribution surface — the highest compounding-value item in this doc.

**E2 — Build-time OG social cards (per index / briefing / chart)** · **Priority 12** · new (medium)
- *Reader question (sharer's):* "What shows when I post this link?"
- *Mechanism:* a prebuild script (Satori + resvg, run at build like `export-public-data.mjs`) renders a PNG per index/briefing/chart-of-the-day: name, composite/band, the band-distribution bar, source line. `og:image` is currently empty → every shared link is blank.
- *Data:* the same scored JSON; reuses the SVG layouts.
- *Reuse vs new:* **new** build script; static-export-safe (build-time, not edge).
- *Placement:* `<head>` `og:image` on index / briefing / `/charts/{id}` pages.
- *Accessibility:* n/a (image alt set from the page title).
- *×leverage:* every shared URL across the whole site; pairs with E1.

**E3 — Consistent `ChartFrame` + shared band/dimension token module** · **Priority 13** · refactor
- *Problem:* band colors (`#f87171…#7dd3fc`) and the `bandColor(score)` helper are **re-declared in every primitive** (`BandDistributionBar`, `BandPositionStrip`, `DimensionProfileBar`, `DimensionRadar`). Drift risk as charts spread sitewide.
- *Mechanism:* extract one `chartTokens.ts` (band ranges/colors/labels + `bandColor()` + `bandFromComposite()`) and one `ChartFrame` (figure + CC-BY caption + E1 cite). Every existing + new primitive imports them.
- *Reuse vs new:* **refactor of shipped code** (no behavior change); de-risks all site-wide reuse.
- *×leverage:* protects honesty-in-encoding (one source of truth for band thresholds) as charts multiply.

---

## Consolidated ranking (do-first order)

| Rank | Item | Surface | Priority | Reuse? |
|------|------|---------|----------|--------|
| 1 | **I1** Band-distribution bar replaces `IndexHero` table | 7 index pages | 17 | reuse ×7 |
| 2 | **H1** "State of institutional compassion" master bar | Home | 17 | reuse |
| 3 | **E1** Cite/embed affordance (`ChartFrame`) | all charts | 15 | new (cross-cut) |
| 4 | **H2** 7-index small-multiple band strips | Home / `/indexes` | 15 | reuse ×7 |
| 5 | **I2** Sector/region mean-composite breakdown bars | 7 index pages | 15 | new (1 comp) |
| 6 | **M1** 8-dimension framework radar diagram | Methodology | 15 | reuse |
| 7 | **I3** Top-5/Bottom-5 callout with position strips | 7 index pages | 14 | reuse |
| 8 | **M2** 0–5 anchor ladder | Methodology | 14 | new (thin) |
| 9 | **M3** Integration-premium formula diagram | Methodology | 14 | new |
| 10 | **D1** Cross-index quiet-day field strip | Briefings | 14 | reuse |
| 11 | **H3** Position-strip deltas on home research cards | Home | 13 | reuse |
| 12 | **E3** `chartTokens.ts` + `ChartFrame` refactor | infra | 13 | refactor |
| 13 | **D2** Chart of the Day | Briefings | 13 | reuse+wrap |
| 14 | **M4** Evidence-tier pyramid | Methodology | 12 | new (thin) |
| 15 | **E2** Build-time OG social cards | site-wide head | 12 | new (med) |
| 16 | **I4** Own-band choropleth | geo index pages | 12 | new (high) |

---

## Sequencing

1. **Reuse-now quick wins (QW-1…QW-4 = items I1, H1, H3, ScoreLegend):** ship the already-built primitives onto Home + 7 index pages. Converts 8 plain tables into the site's signature encoding for near-zero effort/risk. **Do this week.**
2. **Comprehension + comparison (I2, H2, M1, I3):** the new `GroupMeanBars` + framework radar + small-multiples — turns rankings into *quotable comparisons* and makes the framework visible.
3. **Citation flywheel (E3 → E1 → E2):** extract tokens, wrap every figure in `ChartFrame` with cite/embed, then OG cards. This is the compounding-value layer — every prior chart becomes a backlink/share surface.
4. **Methodology depth + maps (M2, M3, M4, I4):** formula/anchor/tier explainers and the choropleth — higher effort, lower frequency; the choropleth is the only item needing a committed static asset and is sequenced last.

## Independence / integrity
Every item is **fully reproducible from our own scored JSON** — no image selection, no third-party/AI imagery, no editorializing beyond what the data shows. The choropleth (I4) renders uncovered units as labeled grey (no fabricated fills) and uses committed own/CC0 paths (no OSM tiles → no runtime fetch, no external attribution dependency). All figures tagged CC-BY; E1/E3 make attribution structural. This visual layer is a positioning strength (OWID/V-Dem), not a concession.

## Top 3 next graphics — and what each finally lets the reader understand
1. **I1 + H1 (band-distribution bars, reuse):** *"Most institutions — governments, corporations, AI labs, cities — are NOT doing well at this,"* at a glance, on the front door and every index, with the band model decoded for free.
2. **I2 (sector/region mean bars, new):** *"Within a field, which cohort leads and which is in crisis"* (Retail vs Energy; Nordic vs others) — the most citable, screenshot-ready index insight.
3. **E1 (cite/embed `ChartFrame`, new):** *"I can quote and link this with attribution"* — turns every chart into a backlink, kicking off the OWID-style citation flywheel that compounds the value of all the others.
