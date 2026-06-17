# Updates (Daily Briefing) Page — Improvement Backlog

**Date:** 2026-06-17
**Scope:** `/updates` route → `DailyBriefing.tsx` and `components/updates/briefing/*`
**Goal:** Make the page easier to understand, more visual, and more compelling so visitors spend more time reading.
**Method:** 5 specialist agents (ux-designer, knowledge-architect, dataviz-architect, frontend-engineer, conversion-strategist) analyzed the real code. 35 candidates consolidated → top 20.

**Scoring model:** `Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk` (each 1–5).

---

## Status Log

**2026-06-17 — Do-first wave SHIPPED ✅** (items #2, #3, #6, #7, #10)
Delegated to frontend-engineer; build validated (`npm run build` — 1666 pages, 0 type errors). Coordinator caught + fixed a double-arrow regression in Item 10 (trailing "→" beside the animated SVG).
- **#2** Inline-gloss schema terms — band-crossing clause, floor-designation lead sentence, confirmations legend (DailyBriefing.tsx)
- **#3** `BandPositionStrip` wired into lead card with cross-kind score resolution + graceful skip (LeadSignalCard.tsx)
- **#6** CompletionBlock forward path — "Read yesterday's briefing →" + "Entities in this briefing" pills (CompletionBlock.tsx)
- **#7** Quiet-day analytical framing — `summary` first-two-sentences fallback for `editorialInsight` (TodaysAnalysisSection.tsx)
- **#10** Benefit-led entity links — "See [Entity]'s full history & 8 dimensions" (LeadSignalCard.tsx, DailyBriefing.tsx)

Remaining backlog (next candidates): **#1** (lead finding as visual headline), **#5** (diverging delta strip), **#4** (schema legend key).

---

## Ranked Top 20

| # | Improvement | Type | Lens | Effort | Risk | Priority |
|---|-------------|------|------|:------:|:----:|:--------:|
| 1 | **Lead finding becomes the visual headline** — demote literal "Daily Briefing" to kicker; promote the thesis/lead finding to H1 size. The real hook is already computed for social crawlers (`page.tsx:12-28`) but withheld from humans. | improvement | conversion | 2 | 2 | 17 |
| 2 | **Inline-gloss schema terms at first use** — half-sentence appositives for "band crossing", "boundary watch", "carry-forward", "first baseline", "floor / composite zero". Removes the comprehension tax that breaks the scan on *every* section. | fix | knowledge | 2 | 1 | 17 |
| 3 | **Wire `BandPositionStrip` into the lead + score cards** — a purpose-built, already-shipped SVG primitive sits unused; turns "2.2 pts below Functional" prose into a spatial track. | fix | dataviz | 2 | 1 | 16 |
| 4 | **"How to read this briefing" schema legend** — one collapsible key: 5-band ladder w/ ranges + colors, composite (0–100) vs dimensional (1–5) scales, 6–8 term micro-glossary. Teaches the system once, reinforced everywhere. | improvement | knowledge | 3 | 1 | 16 |
| 5 | **"Today's movement" diverging delta strip (chart of the day)** — horizontal diverging bars, one per assessed entity (length=|delta|, color=band); confirmations render as centerline ticks. Answers "what moved today?" in 1 second. | improvement | dataviz | 3 | 2 | 15 |
| 6 | **CompletionBlock → forward path** — add "Entities in this briefing" pills (topSignals[0..2]) + "Read yesterday's briefing →" (`manifest.dates[1]`). Converts the terminal state into a navigation springboard. | improvement | ux + frontend | 2 | 1 | 15 |
| 7 | **Surface analytical framing on quiet days** — when `editorialInsight` absent, use first 2 sentences of `summary` in `TodaysAnalysisSection`. On 0-change days the 680-word analysis never renders today. | improvement | ux | 1 | 1 | 15 |
| 8 | **30-second tier "what is this?" orientation line** — prepend one muted clause: "Independent daily scoring of how 1,160 institutions recognize, respond to, and reduce suffering — 0–100, 8 dimensions." Fixes the weakest rung for share-arrival visitors. | improvement | knowledge | 2 | 2 | 14 |
| 9 | **Two-tier hierarchy in Score Movement list** — color the left border of cards where `|delta|>0` (deltaColor already imported); mute confirmation-only rows; add "Changes" / "Confirmed" sublabels. Scan 19 rows in 3s. | improvement | ux | 2 | 2 | 14 |
| 10 | **Benefit-led entity links** — replace boilerplate "View entity profile" with "See [Entity]'s full history & all 8 dimensions →". Entity-profile click-through is the biggest dwell-time multiplier. | improvement | conversion | 2 | 1 | 14 |
| 11 | **30-second tier visual hierarchy + "keep reading" bridge** — make it the unmistakable "start here" element (larger bullets, metadata demoted) and add anchor "The full finding & its evidence ↓" + make the band-crossing flag a link. | improvement | ux + conversion | 2 | 1 | 14 |
| 12 | **Collapse the 3 stacked purchase CTAs** — one ranked primary ("See a full benchmark report") + a muted institutional line; benefit-led heading; add the "entities never pay" independence line at the point of the ask. | fix | conversion | 2 | 2 | 13 |
| 13 | **Pipeline funnel / proportion bar** — replace the "1,160 reviewed · 20 assessed · 1 moved" text with a segmented proportion bar. Visualizes the "signal from noise" value prop at the highest-bounce position. | improvement | dataviz | 2 | 2 | 13 |
| 14 | **Decode lead-signal title & Delta notation** — render synthesized score moves as "Published 12.5 → Assessed 6.3 · ▼ 6.2 points" instead of code-like "(Δ −6.2)". The most-read element becomes self-explaining. | fix | knowledge | 2 | 1 | 13 |
| 15 | **Plain-language framing for floor designations** — lead the gravest findings with a one-sentence definition before methodology jargon; show visible dimension names, not hover-only `title=` codes. | improvement | knowledge | 2 | 1 | 13 |
| 16 | **Remove header subscribe / re-time asks** — drop the in-header email field (asked before any value delivered); cut 3 subscribe asks → 2, both after value. Sharpen the header's one job: pull readers into the brief. | improvement | conversion | 1 | 2 | 12 |
| 17 | **Dimension-delta micro-bars ("why it moved")** — 8-dimension diverging micro-bar strip on lead/score cards (needs digest to emit per-dimension deltas; degrade to dominant-only). Shows the evidence→dimension mapping. | improvement | dataviz | 3 | 2 | 12 |
| 18 | **Accessibility pass** — add `aria-live` result count to SignalStack filter (mirror ArchiveList); `tabindex=-1` on jump-nav target sections for keyboard focus; `motion-safe:` on all `<details>` chevrons; error state for `inline-compact` NewsletterSignup. | fix | frontend + conversion | 2 | 1 | 12 |
| 19 | **Forward-watch proximity timeline + message-matched subscribe** — single time axis (today→+90d) with dots colored by proximity; tie the mid-briefing subscribe copy to the real countdown ("soonest in X days"). | improvement / experiment | dataviz + conversion | 3 | 2 | 11 |
| 20 | **Code hygiene** — remove dead `showNewsletter` prop; extract `FloorDesignationsPanel` (scans all 1,155 entities per render) to its own memoizable module; centralize the thrice-duplicated `resolveSlugHref` into `@/lib/entityHref`. | fix | frontend | 2 | 2 | 10 |

---

## Themes

- **Comprehension (easier to understand):** #2, #4, #8, #14, #15 — the architecture is strong; undefined vocabulary is the main barrier.
- **Visual (more visual):** #3, #5, #13, #17, #19 — rich numeric data is rendered as prose/tables; several purpose-built SVG primitives ship but are unused on this page.
- **Compelling / dwell time:** #1, #6, #7, #9, #10, #11, #12, #16 — better hook, forward paths, narrative bridges, re-timed asks.
- **Foundation:** #18, #20 — accessibility + code health.

## Quick wins (do-first wave — high priority, ≤2 effort, ≤1 risk)
#2, #3, #6, #7, #10 — together they lift comprehension, add a missing visual, and create forward paths with minimal risk.

## Notes
- All candidates passed the independence-policy check (entities never pay for inclusion/scores). #8, #12, #16 carry the only residual "drift into marketing" risk and are scoped to describe-not-sell.
- Unused-but-shipped primitives worth wiring in: `BandPositionStrip`, `BandDistributionBar`, `DimensionProfileBar`.
