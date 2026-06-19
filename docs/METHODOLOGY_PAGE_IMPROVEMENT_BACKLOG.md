# Methodology Page — Improvement Backlog

**Date:** 2026-06-17
**Scope:** `/methodology` → `site/src/app/methodology/page.tsx` (~800-line single static page)
**Goal:** Make the page easier to understand, more visual, and more compelling so visitors spend more time reading.
**Method:** 5 specialist agents (ux-designer, knowledge-architect, dataviz-architect, frontend-engineer, conversion-strategist) analyzed the real code. 35 candidates consolidated → top 20.

**Scoring model:** `Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk` (each 1–5).

---

## Status Log

**2026-06-18 — BACKLOG COMPLETE ✅ (remaining 13 items shipped)** — Iteration 8.
Shipped #5 (sticky TOC + reading-progress island `MethodologyTOC.tsx`), #6 (`ScorePipelineDiagram.tsx`), #7 (end-to-end worked example — real entity Abridge), #8 (inline "see it applied" links — real verified slugs: hugging-face, costco, israel, character-ai, myanmar), #10 (40-subdim table grouped/collapsed by dimension w/ behavioral anchors), #11 (reorder to reader's question order), #12 (`EvidencePyramid.tsx`), #13 (message-matched newsletter), #16 (`ConsistencyStepChart.tsx`), #17 (footer nav funnel), #18 (floor-designation progressive disclosure), #19 (`PipelineFlowDiagram.tsx` + human-gate valve), #20 (dimension-card↔subdim cross-links + back-to-top). Build 1,666 pages, tsc clean. **All 20 items now shipped** (do-first #1-4/9/14/15 + entity-count + this wave).

**2026-06-18 — Canonical entity-count RESOLVED ✅ (site-wide; unblocks #19)** — Iteration 6.
New single source of truth `site/src/data/entityCount.ts` (`SCORED_ENTITY_COUNT` = 1,156, derived from index rankings). Stale `1,155`/`~1,160` catalog literals removed across 13 files; methodology page (lines ~230, ~257) now renders the canonical 1,156. Scored (1,156) vs scanned (1,160) distinction documented. The open blocker noted below ("resolve canonical entity count 1,155 vs 1,160 before #19") is now closed. Build 1,666 pages, validate-indexes 0 errors, tsc clean.

**2026-06-17 — Do-first wave SHIPPED ✅** (items #1, #2, #3, #4, #9, #14, #15)
Delegated to frontend-engineer; build validated (`npm run build` — 1669 pages, 0 type errors, one `<h1>`).
- **#1** `<main>` landmark, section ids + scroll-mt, table captions/scope, mobile scroll hint, heading-outline repair, motion-reduce chevron
- **#2** 40-subdimension table now derived from canonical `DIMENSIONS` (kills data drift)
- **#3** Hero rewritten — "what they say vs. what they do" hook + plain-words scale
- **#4** New `BandScaleStrip` (0–100 ruler) under the AnchorLadder; replaces floating band cards
- **#9** Band/anchor name-collision callout + numeral-prefixed anchor levels
- **#14** Inline scoring formula line in the Common scoring model panel
- **#15** Jargon expanded (IRR, ACB, T1/T2 gloss) + premium intuition surfaced before the σ table

Remaining next candidates: **#5** (sticky TOC + progress), **#6** (score-building pipeline diagram), **#8** (inline "see it applied" entity links — needs editorial slug picks).
Open: resolve canonical entity count (1,155 vs 1,160) before #19.

---

## Ranked Top 20

| # | Improvement | Type | Lens | Effort | Risk | Priority |
|---|-------------|------|------|:------:|:----:|:--------:|
| 1 | **Semantics + a11y foundation** — wrap page in `<main>`, add `id` + `scroll-mt-24` to every titled `<section>`, add `<caption>` + `scope="col"` to both tables + mobile scroll affordance, repair h1→h2→h3 outline, `motion-reduce:` on `<details>` chevron. Also unlocks the TOC (#5). | fix | frontend | 2 | 1 | 17 |
| 2 | **Drive the 40-subdimension table from canonical `DIMENSIONS`** — replace the hand-written 40-row array with a derived view; eliminates already-drifting duplicate data. | fix | frontend | 1 | 1 | 17 |
| 3 | **Rewrite the 120-word hero** — lead with a one-line "what they say vs. what they do" hook + the 8/40/0–100 scale in plain words; demote the architecture sentence; keep the stat row below the hook. | improvement | knowledge + conversion | 2 | 2 | 16 |
| 4 | **Band scale strip (0–100 ruler)** — replace the 5 floating band cards with one contiguous 0–100 gradient strip (reuse `BandDistributionBar`/`chartTokens`); canonical band legend, ×1,160 reuse leverage. | improvement | dataviz | 2 | 1 | 16 |
| 5 | **Sticky "On this page" TOC + reading progress** — client island: sticky right-rail (desktop) / collapsible top list (mobile) with IntersectionObserver active state; thin top progress bar. Benefit-phrased labels. | improvement | ux + frontend + conversion | 3 | 2 | 15 |
| 6 | **Score-building pipeline diagram** — new SVG hero for the scoring section: `subdim 0–5 → dim /10 → base /80 → +premium /10 → composite /100 → band`. The page's missing thesis visual; frames every downstream chart. | improvement | dataviz | 3 | 2 | 15 |
| 7 | **End-to-end worked example** — one representative entity walked from anchors → dimension → base → premium → composite → band, with the sum→/10 rule shown numerically (currently asserted, never demonstrated). | improvement | knowledge | 3 | 2 | 14 |
| 8 | **Inline "see this rule applied" links** to real entity pages after pressure-test, floor designation, integration premium, evidence hierarchy. Converts a dead-end proof page into a methodology→entity→index funnel. (Needs editorial slug picks.) | improvement | conversion | 3 | 2 | 14 |
| 9 | **Band/anchor name-collision disambiguator** — "Developing/Established/Exemplary" mean different things on the 0–5 anchor scale vs the 0–100 band scale; add a one-line callout between the two co-located tables + numeral-prefix anchor levels. | fix | knowledge | 1 | 1 | 14 |
| 10 | **Group + collapse the 40-subdimension table by dimension** — colored per-dimension header rows (use `DIMENSIONS[].color`), each group a `<details>`; optionally reveal the 5 behavioral anchors (already in `dimensions.ts`, currently unused on page). | improvement | ux + knowledge | 3 | 2 | 13 |
| 11 | **Reorder to the reader's question order** — move the scoring block (scoring model → worked example → anchors → bands) and evidence hierarchy ABOVE the operational/edge-case sections (pipeline, approval gate, floor designation). | improvement | knowledge + ux | 2 | 2 | 13 |
| 12 | **Evidence hierarchy as a weighted pyramid** — replace 6 equal cards with a tapered 5-tier stack + explicit weight bars + trust-gradient color; the equal-card layout currently contradicts the "stronger claims need stronger evidence" point. | improvement | dataviz | 3 | 2 | 13 |
| 13 | **Message-match the mid-page newsletter ask** — replace generic "highlights" card copy with methodology-matched benefit ("watch the methodology in motion — every change runs the human gate you just read about"); keep the independence preamble. | improvement | conversion | 2 | 1 | 13 |
| 14 | **Inline scoring formula line** — a compact styled formula (`8 dims × ≤10 + premium 0–10 = 0–100`) directly in the "Common scoring model" panel, above the premium diagram, so the mental model lands before the worked examples. | improvement | ux | 1 | 1 | 13 |
| 15 | **Define jargon at first use** — expand IRR (inter-rater reliability), ACB, T1/T2 (forward-referenced before evidence tiers), and precede the integration-premium math with the one-sentence intuition already in `INTEGRATION_PREMIUM.detail`. | fix | knowledge | 2 | 1 | 13 |
| 16 | **Std-dev → consistency-factor step chart** — turn the σ→% bullet list (rendered twice) into a small descending step chart with the "balanced 70/70 beats spiky 90/40" annotation. | improvement | dataviz | 2 | 1 | 12 |
| 17 | **Rank the footer nav into a funnel** — make "See the framework applied" (Indexes) the dominant primary, "Assess your org" secondary, demote the 4 commercial links to one quiet independence-framed line. | improvement | conversion | 2 | 1 | 12 |
| 18 | **Progressive disclosure on Floor Designation** — keep the definition visible; wrap trigger criteria / disclosure contents / exit protocol in labeled `<details>` (pattern already on page). Cuts ~4–5 screens of scroll fatigue. | improvement | ux | 2 | 1 | 12 |
| 19 | **Continuous pipeline as a 4-stage flow with the human-approval gate** — replace 4 equal cards with a flow + prominent gate valve + the "~30% sent back" feedback branch; makes the integrity safeguard visible. (Resolve the 1,155 vs 1,160 count first.) | improvement | dataviz | 3 | 2 | 11 |
| 20 | **Dimension cards ↔ subdimension table cross-links + "back to top"** — each of the 8 framework cards links to its subdim group; a floating back-to-top appears after deep scroll. | improvement | ux + frontend | 2 | 1 | 11 |

---

## Themes
- **Easier to understand:** #3, #7, #9, #14, #15 — every fact to reconstruct a score exists but is never assembled into one chain; scale-name collision actively misleads.
- **More visual:** #4, #6, #12, #16, #19 — the score-building spine lives entirely in prose; several dense blocks are equal-card walls that contradict their own meaning.
- **Compelling / dwell time:** #5, #8, #11, #13, #17, #18 — no wayfinding on an 800-line page; zero links to real scores until the footer.
- **Foundation:** #1, #2, #20 — a11y, single source of truth, navigation.

## Do-first wave (high value, low risk, mostly reuse/copy) — RECOMMENDED
**#1, #2, #3, #4, #9** + the cheap comprehension micro-fixes **#14, #15**. Together: a11y + semantics foundation, kill data drift, a scannable hook, the canonical band ruler, and the comprehension traps — all low-risk, no editorial-slug dependency.

## Notes
- All candidates passed the independence-policy check.
- **Open data question:** the page says "1,155" entities; the updates pipeline says "1,160". Resolve canonical count before #19 / any hero count change. For now, keep the page's existing "1,155".
- Unused-but-available assets: per-subdimension `anchors` arrays in `dimensions.ts` (#10), `BandDistributionBar` / `chartTokens` (#4), the `<details>` pattern already on the page (#18).
