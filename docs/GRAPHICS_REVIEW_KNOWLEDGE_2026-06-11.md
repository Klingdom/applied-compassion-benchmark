# Graphics Comprehension Review — /updates Briefing — 2026-06-11

**Agent:** knowledge-architect
**Lens:** visual comprehension / cognitive load — which *graphics* turn dense scores, 8 dimensions, and bands into fast understanding. Not styling (UX owns pixels), not implementation (frontend owns code). I own *which-visual-for-which-understanding*.
**Founder steer carried forward (Wave E1):** density is sacred. A chart must *earn its space* — deliver understanding a sentence cannot, in less room than the sentences it replaces.

Scope grounded in files:
`site/src/data/dimensions.ts` (8 dimensions / 40 subdimensions — the mental model), `site/src/data/indexes/countries.json` (scores, bands meta, distribution), `site/public/data/history/united-arab-emirates.json` (trajectory shape), `briefing/ScoreSparkline.tsx`, `briefing/ScoreMovementCard.tsx`, `briefing/LeadSignalCard.tsx`, `briefing/ScoreMovementDashboard.tsx`, `DailyBriefing.tsx`, the `2026-06-08.json` briefing, and the prior `CONTENT_STRATEGY_KNOWLEDGE_2026-06-10.md` / `UPDATES_BACKLOG2_2026-06-10.md`.

Scoring key: each metric 1–5. **Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk** (range −2 to +18).

---

## The convergent comprehension gap

The benchmark's entire mental model is **composite 0–100 → one of 5 named bands → driven by 8 dimensions (40 subdimensions)**. The briefing renders the *number* and the *band pill* well, but the two halves of the model that actually explain a score — **the 8-dimension shape** and **the 5-band field** — are almost never shown as pictures:

- **The dimension shape is collapsed to one chip.** `ScoreMovementCard.tsx` (76–81, 211–223) surfaces only `dominantDimension` — a single text chip like `INT −0.30`. But the UAE finding moved *four* dimensions (INT, ACC, SYS, EMP) while *preserving* BND (per `2026-06-08.json` topSignals[0] and methodologyNotes). A reader sees "INT −0.30" and learns nothing about the actual integrity-of-care collapse-with-capacity-intact pattern that *is* the finding. The 8-number `scores` object exists verbatim in `countries.json` (83–92) and is never drawn.
- **The 5-band field is never visualized.** `countries.json` carries a full distribution (`bands[]`: Exemplary 7% … Developing 41% … Critical 23%, lines 46–77) — a ready-made teaching graphic — but nothing in the briefing renders it. A newcomer reading "UAE → Critical" cannot see that Critical is 23% of all countries, or that 18.4 sits near the floor of a 0–20 band.
- **Boundary proximity is text-only.** `ScoreMovementCard.tsx` (45–51, 135–140) shows `0.6 above Critical` as a pill. The single most decision-relevant fact on quiet days — *how close is this to crossing?* — has no positional picture.
- **The one chart that exists is under-deployed and under-teaching.** `ScoreSparkline.tsx` draws a line with faint gridlines at 20/40/60/80 (30, 145–160), but: (1) only the **lead** entity gets one (`DailyBriefing.tsx` 274–293); (2) the band *zones* between gridlines aren't shaded or named, so the line teaches "went down" but not "fell *out of a band*"; (3) the −5.0 magnitude and the crossing aren't called out beside it.

Five candidates below target these gaps, ordered by the understanding they unlock per pixel.

---

## Candidate 1 — The 8-dimension profile bar (the "shape of a score")

**Surface:** `/updates` — inside `LeadSignalCard.tsx` (lead entity) and expandable in `ScoreMovementCard.tsx`; data from each entity's `scores` object in `site/src/data/indexes/*.json` (e.g. `countries.json` 83–92) and the per-dimension deltas already in `dominantDimension` / scoreChange evidence.

**Problem (comprehension cost of NOT having it).** This is the single biggest teaching miss in the briefing. The benchmark's core claim is that compassion is *multi-dimensional* — yet every score is presented as **one scalar plus, at most, one dimension chip**. In `ScoreMovementCard.tsx` the entire dimensional story is `formatDimensionChip` → `"INT −0.30"` (40–43, 211–223). The reader cannot answer the question the whole framework exists to answer: *where, specifically, does this entity fail or excel?* The UAE case is the proof: the finding is precisely that INT/ACC/SYS/EMP fell while **BND held** (`2026-06-08.json` topSignals[0]). That asymmetric profile — atrocity-complicity craters integrity-of-care but domestic service capacity is intact — is the *entire insight*, and it is invisible. A reader leaves understanding "UAE went down 5 points," not "UAE's integrity dimensions collapsed while its capacity dimensions didn't," which is a categorically deeper and more retainable understanding.

**Proposed visual.** A compact **horizontal 8-bar strip** (one short bar per dimension, AWR→INT in fixed order, each bar length = 0–5 sub-score, colored with each dimension's `color` token from `dimensions.ts`). For a scored change, overlay the prior value as a faint ghost bar or a small downward tick so the reader sees *which* bars moved. ~8 rows × ~14px = roughly the height of two text lines. A horizontal *bar* profile (not a radar) is chosen deliberately: bars are read left-to-right in F-pattern, label cleanly, and stay legible at thumbnail size on mobile — a radar's angular encoding is prettier but slower to decode and worse at showing a small delta on one axis.

**What understanding it creates.** "The shape of a score" becomes literal: the reader instantly sees a *spiky* profile (one dimension dragging the rest) vs. a *flat-low* profile (uniformly failing) vs. a *flat-high* profile (exemplary). It teaches the 8-dimension schema by *using* it on a concrete entity — concrete-before-abstract — and makes the UAE "integrity collapses, capacity holds" pattern self-evident without a sentence of explanation.

**Knowledge benefit.** Highest of any candidate: it converts the framework's central abstraction (multi-dimensionality) into a glanceable picture, and it teaches the 8 dimensions at the point of need, every cycle, on the most-read card.

**Independence/integrity check:** PASS. It plots the published sub-scores verbatim — more transparent than a single composite, not less. No value-laden framing; the bars are the evidence.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk |
|---|---|---|---|---|---|
| 5 | 5 | 5 | 4 | 3 | 2 |

**Priority = 5+5+5+4 − 3 − 2 = 14**

---

## Candidate 2 — Band-position gauge (0–100 track with 5 zones + a marker)

**Surface:** `/updates` — `LeadSignalCard.tsx` meta row and `ScoreMovementCard.tsx`; static band ranges from `countries.json` `bands[]` (46–77) and `BAND_DESCS` in `dimensions.ts` (582–593).

**Problem (comprehension cost of NOT having it).** The briefing shows a band *pill* (`<Band level="critical" />`) and a number (18.4), but never the **field** they live in. A first-time reader cannot tell from "Critical · 18.4" whether 18.4 is at the top or the bottom of Critical, how far the band spans, or where the next boundary is. The boundary distance, when shown at all, is a bare text pill — `formatBoundaryLabel` → `"0.6 above Critical"` (`ScoreMovementCard.tsx` 45–51). The reader has to mentally reconstruct a number line that the data already fully specifies (`bands[]` ranges 0-20 / 21-40 / 41-60 / 61-80 / 81-100). The 5-band model — the schema the prior content review flagged as *under-taught* — is asserted by a colored pill but never *drawn*.

**Proposed visual.** A thin **horizontal 0–100 track** segmented into the five band zones (each tinted with the band's color, labeled once), with a marker dot at the entity's composite. For a crossing, show *from* and *to* markers connected by a short arrow so the reader sees the score physically stepping across a zone boundary (UAE: a dot sliding from the Developing zone into Critical). One row, ~20px tall.

**What understanding it creates.** Teaches the entire 5-band model in one glanceable object: the reader learns the bands *are* ranges on a 0–100 line, sees how wide each is, sees where this entity sits within its band, and — critically — sees how close it is to crossing. "0.6 above Critical" stops being an abstract number and becomes a marker hovering at the edge of a zone.

**Knowledge benefit.** Directly fixes the prior review's "band schema is under-taught" finding by making the band model a *picture* instead of a definition the reader must hold in working memory. Doubles as the boundary-proximity visual.

**Independence/integrity check:** PASS. Pure positional encoding of published score against published band ranges. No persuasion.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk |
|---|---|---|---|---|---|
| 4 | 5 | 5 | 5 | 2 | 1 |

**Priority = 4+5+5+5 − 2 − 1 = 16**

---

## Candidate 3 — Upgrade ScoreSparkline into a banded trajectory chart

**Surface:** `/updates` — `briefing/ScoreSparkline.tsx` (exists, Wave C), consumed in `DailyBriefing.tsx` (274–293).

**Problem (comprehension cost of NOT having it).** The sparkline already plots `newComposite` over time and even marks crossings (`ScoreSparkline.tsx` 108–193) — good. But it under-teaches in three ways the data would support: (1) the band **zones** are only four faint dashed gridlines (30, 145–160), not shaded/named regions, so the line shows "fell" but not "fell *out of the Developing band*" — the band crossing, the most meaningful event, is encoded only as a slightly larger yellow dot (181–182) the reader won't decode; (2) the **magnitude** (−5.0) and the from→to bands aren't labeled beside the chart, so the picture lacks its own caption; (3) it renders **only for the lead entity** (`DailyBriefing.tsx` 287), so the dozens of confirmed/boundary entities — exactly the ones whose "is this drifting?" trajectory matters on quiet days — get no trajectory at all. The UAE history (`united-arab-emirates.json`) is a textbook teaching arc: 23.4 → 18.4 with a clean band step, wasted as a bare line.

**Proposed visual.** Keep the existing SVG/no-JS approach; add (a) faint **shaded band zones** behind the line with the band color tokens (so the line visibly crosses a *colored region*, not just a dashed rule), (b) a small **delta + band-step caption** rendered beside it (`−5.0 · Developing → Critical`), and (c) extend it from "lead only" to the **boundary-watch and crossing entities** as a compact inline variant (the `compact` prop already exists, 81–83). This is an enhancement of a shipped component, not a new one.

**What understanding it creates.** The trajectory stops being "a wiggly line" and becomes "this entity fell *through a band floor*" — the band model and the movement are taught simultaneously, in motion. Extending it to boundary entities turns the abstract "0.6 above Critical" pill into a visible approach toward a colored edge over several cycles.

**Knowledge benefit.** High: reuses an existing visual and existing history data to teach band + trajectory together, and finally gives quiet-day boundary entities a comprehension payload.

**Independence/integrity check:** PASS. Plots published composites over time; band zones are factual ranges. The delta caption is the arithmetic, not a claim.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk |
|---|---|---|---|---|---|
| 4 | 4 | 4 | 5 | 2 | 1 |

**Priority = 4+4+4+5 − 2 − 1 = 14**

---

## Candidate 4 — Band-distribution bar in the header ("what the field looks like now")

**Surface:** `/updates` — `briefing/DailyBriefingHeader.tsx` (above the fold); data from each index's `bands[]` distribution (`countries.json` 46–77) aggregated, or per-index.

**Problem (comprehension cost of NOT having it).** When "UAE → Critical" is the day's finding, the reader has no sense of the *population* that judgment places it in. The distribution is sitting in the data — Exemplary 7.3% / Established 13.5% / Functional 15% / Developing 40.9% / Critical 23.3% (`countries.json` meta.bands 18–44) — and it is one of the most *teaching-dense* facts the project owns: it shows at a glance that **most institutions cluster low** (64% Developing-or-Critical), which is the benchmark's whole sobering thesis. It is never drawn. The prior backlog flagged this independently (`UPDATES_BACKLOG2` item #5, score 14) as a quiet-day win.

**Proposed visual.** A single **stacked 100%-width bar** in the header, five segments in band colors sized by share, labeled with band name + %. ~24px tall, full width, one row. On a day with a crossing, lightly mark *which* segment the day's entity moved into.

**What understanding it creates.** Teaches the 5-band model *and* the field shape in one object: the reader learns the bands exist, sees their colors (reinforcing every pill elsewhere), and absorbs the headline truth that compassion is *rare at the top and common at the bottom*. It gives every briefing — especially quiet ones — an above-the-fold "state of the field" anchor.

**Knowledge benefit.** Teaches the band schema to newcomers and frames each day's finding against the population. Strong retention hook (one memorable distribution).

**Independence/integrity check:** PASS. Factual distribution of published scores; descriptive, not alarmist (labels are band names + percentages only).

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk |
|---|---|---|---|---|---|
| 4 | 4 | 4 | 5 | 2 | 1 |

**Priority = 4+4+4+5 − 2 − 1 = 14**

---

## Candidate 5 — Dimension-delta diverging bar (the movement, not the chip)

**Surface:** `/updates` — `LeadSignalCard.tsx` (the scored lead) and the expand-in-place detail under `ScoreMovementCard.tsx`; data from the per-dimension deltas in scoreChange evidence / `dominantDimension` (`2026-06-08.json` topSignals[0] lists INT 1.5→1.2, ACC 1.5→1.2, SYS 2.0→1.5, EMP 2.0→1.5, BND preserved 3.0).

**Problem (comprehension cost of NOT having it).** Candidate 1 shows the *state* (current shape); this shows the *change* (what moved this cycle), which is the briefing's actual job. Today that change is reduced to a single chip — `dominantDimension` `INT −0.30` (`ScoreMovementCard.tsx` 211–223) — so a multi-dimension ruling is misrepresented as a one-dimension event. The reader cannot see that the UAE finding pulled *four* dimensions in concert and deliberately *held* a fifth (BND) — the asymmetry that the methodology note (`2026-06-08.json` methodologyNotes[0]) spends a paragraph explaining. A picture of which bars dropped (and which pointedly didn't) replaces that paragraph.

**Proposed visual.** A small **diverging bar set**: one short bar per affected dimension, length = magnitude of delta, direction = sign (down = warm/red, up = green), zero-line centered; unmoved dimensions shown as flat ticks at the zero line (so "BND held" is visible, not absent). Renders only for scored changes (most cards have no deltas, so it's absent on confirmations — earning its space only when there's movement to show).

**What understanding it creates.** The reader sees the *mechanism* of a score change: not "−5.0 happened" but "these four dimensions fell, this one held." Cause→effect at a glance, and it teaches that the composite is a function of dimensional moves.

**Knowledge benefit.** High germane value, but overlaps Candidate 1 (state) — best treated as the *delta* companion inside the same expand-in-place detail, not a separate surface. Slightly lower confidence because per-dimension deltas aren't in every briefing's `dominantDimension` (only the dominant one is structured; the full set lives in prose for some entries), so it depends on a small schema enrichment.

**Independence/integrity check:** PASS. Plots the published dimensional deltas; showing the *held* dimension actively strengthens the evidence→score audit trail.

| Impact | Strategic Alignment | Learning Value | Confidence | Effort | Risk |
|---|---|---|---|---|---|
| 4 | 4 | 4 | 3 | 3 | 2 |

**Priority = 4+4+4+3 − 3 − 2 = 10**

---

## Secondary note — evidence images (per the brief)

Evidence images (screenshots of a source document, a photo from a cited report) carry real comprehension value — concrete, memorable, trust-building — but they sit **outside** the data-derived visual layer and carry an integrity caveat the data charts do not: a chosen photograph editorializes in a way a plotted sub-score cannot. If ever added they should be (a) strictly captioned as *source evidence*, never decoration, (b) attributed to the same tiered source chain already in `evidence[]`, and (c) kept visually subordinate to the data visuals so the briefing's voice stays evidence-first, not photojournalistic. **Lower priority than all five data visuals above** and explicitly the conversion/UX/editorial team's call, not a comprehension-layer default.

---

## Summary table (sorted by Priority)

| # | Candidate | Surface | What it teaches | Priority |
|---|---|---|---|---|
| 2 | Band-position gauge (0–100 track + zones + marker) | Lead + movement cards | the 5-band field + boundary proximity | **16** |
| 1 | 8-dimension profile bar ("shape of a score") | Lead + expandable cards | the 8-dimension model / where it fails | **14** |
| 3 | Banded trajectory (upgrade ScoreSparkline) | Lead + boundary entities | band crossing over time | **14** |
| 4 | Band-distribution stacked bar in header | Header (above fold) | the field shape + 5-band model | **14** |
| 5 | Dimension-delta diverging bar | Expand-in-place detail | the mechanism of a change | **10** |

---

## The single highest-comprehension-leverage visual

**Candidate 1 — the 8-dimension profile bar.** Candidate 2 (band gauge) scores one point higher and is the lower-risk, faster win — and it *should* ship, likely first, because it is cheap and teaches the band half of the model. But the question asked is *highest comprehension leverage*, and that is the dimension profile. The band gauge teaches the reader to place a *number*; the dimension profile teaches the reader what the benchmark actually *is* — that compassion is eight measurable dimensions and that a score has a *shape*. It converts the framework's central, hardest-to-teach abstraction into a glanceable picture, on the most-read card, every single cycle, and it makes findings like the UAE ruling ("integrity-of-care collapses while domestic capacity holds") self-evident from the shape alone — understanding no sentence in the current briefing delivers. Pair it with Candidate 2 as the two-visual core: **gauge teaches *where in the field*, profile teaches *why* — together they make a score legible in one glance.**
