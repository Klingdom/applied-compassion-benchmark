# Loop 1 visual regression QA report (D-61)

Build under test: site/out (2026-10-22). Method: Playwright probes (computed styles, element boxes, scrollWidth) at 390/600/720/800/1024/1366/1600/1920, plus screenshots.
Screenshots: scratchpad `shots/after/*` (provided set) and `shots/probe2/*` (new). Probe scripts: scratchpad `qa1.mjs` to `qa5.mjs`.
Limits: no `before` build exists in site/out, so "pre-existing vs new" is inferred from source, not measured. The 2026-10-14 edition has no applied changes, so the solid half of the applied/not-applied key was not seen rendered.

## Verdicts

| # | Item | Verdict | Evidence |
|---|------|---------|----------|
| 1a | Primary button = dark ink | PASS | Header "Contact Sales" colour rgb(7,17,31) on blue gradient (home 1366); hero CTAs legible in countries-mobile-top.png |
| 1b | Prose links underlined, nav/buttons/cards not | PASS with note | 0/7 buttons, 0/40 footer links, 0/6 insight cards underlined (/insights 1366); no unexpected underline on /, /methodology, /countries. Underlined: in-prose links and explicit `underline` TOC links (see R4) |
| 1c | Card linked = block (/insights) | PASS | insights1366.png; 6/6 card anchors `block` |
| 1d | Scroll-padding | PASS | html scroll-padding-top 128px |
| 1e | Form control borders/placeholders | PASS (visual) | Tracker select borders visible in tracker720.png. Placeholder contrast not measured |
| 1f | Reduced motion | NOT TESTED | emulateMedia not run |
| 2 | Nav targets, aria-expanded, "(new)" | PASS with note | Top-level links 40px tall (was smaller); "Indexes"/"Tools" aria-expanded="false"; "Updates" has sr-only "(new)" (position:absolute). Note: the 28x28 and 34x34 icon toggles are under the 44px guideline. Mobile `header button` selector returned nothing, so hamburger target size was not measured |
| 3 | Methodology TOC at >=1600 | PASS | 1366: rail `display:none`, inline TOC static full width, no overlap (meth1366.png). 1599: still inline. 1600: fixed rail x=1416..1576, top 96, width 160, no content overlap (meth1600.png). 1920: x=1580..1740 |
| 4a | Band strip labels in HTML | PASS (visual) | Afghanistan and briefing cards render labels, no clipping at 390 |
| 4b | Entity sparkline fixed 0-100 | PASS | afghanistan-390 "Scale 0-100; lines mark band edges (20/40/60/80)"; flat 0.0 history sits at baseline |
| 4c | Dimension bars (s-1)/4, 1/5 end labels | PASS | afg_390_1800.png: 1.0 score shows empty bar, "1" and "5" end labels |
| 4d | Even-profile wording | FAIL | R2 |
| 4e | Radar labels larger | PASS | afg_390_800.png: AWR/EMP/etc. and values readable, no clipping at 390 |
| 5a | Briefing movement strip responsive, outline = not applied, key | PASS at 390 and 1366, FAIL at 720-800 | Key text "Outline = measured, not applied..." present; hatched outline bars for all 7 non-zero rows (brf_390_2200.png, brf_720_2200.png). Page overflows at 720-800, see R1. At 390 the axis labels run together ("-28.40+28.4") and bars are about 30px wide, see R5 |
| 5b | Band chips, neutral severity pills | PASS | "5 Critical / 5 Developing / 1 Functional" chips; "2 HIGH / 3 MEDIUM / 1 LOW" pills neutral (brf_390_1100.png). The dashed MEDIUM pill has no key |
| 5c | StatOfTheDay non-numeric | PASS | "TODAY'S QUESTION" + tag chips + italic summary (brf_390_2200.png) |
| 5d | Font floor | PARTIAL | 57 text nodes at 11.2px (<11.5) on /updates/2026-10-14 (dimension names "Accountability" x8, "Empathy", "Integrity", "Boundaries", "Related", "Lead signal", "Today's question"). No wrapping/overflow seen at 390, but the floor is below 12px |
| 6 | Ranking tables | PASS with notes | /countries 390: Country column `position:sticky; left:0`, z-index 2 (th) / 1 (td), opaque bg rgb(11,18,32), so scrolled columns slide beneath (countries-tbl390.png). Numeric cells `text-align:right; tabular-nums`; scores show 3 decimals. Notes: R6 (header row not sticky vertically, rank scrolls away); `th` numeric columns do not carry tabular-nums (header only, harmless) |
| 7a | /ai-models mobile CTA order | PASS | aimodels390.png: "Read this week's edition" (primary) > "Browse the model list" > "Read the latest pilot report" > "Read the method" |
| 7b | Tracker filters grid at ~720 | FAIL (minor) | tracker720.png: 4 filters in row + 1 orphan ("Tested by us") on its own row. See R3 |
| 7c | Tracker source chips | PASS (visual) | Chips render in table at 1024+; see R1 for overflow |
| 7d | Watch edition queue heading | PASS (visual) | Not blocking; watch 2026-10-22 renders at 390/1366 with no overflow |
| 7e | Pilot report figure top ticks | NOT CONFIRMED | /ai-models/reports/pilot-2026-10-03 renders (no overflow at any width tested, 0 text nodes <11.5px) but I did not locate the figure to read tick labels |
| 8 | Home publication table from registry | PASS (visual) | Home loads; no overflow at 390/1366; publication cards render (home-*-full.png). Not diffed against registry |

## Regressions and remaining issues (ranked)

### R1 (HIGH) Horizontal page scroll at tablet widths on 3 routes
- Routes and widths (document scrollWidth vs clientWidth):
  - `/updates` and `/updates/<date>`: 833 vs 720 and 800 (600 and 390 are clean).
  - `/ai-models/tracker`: 1016 vs 720 and 800.
  - `/ai-models/watch/2026-10-22`: 773 vs 720.
- Cause A (briefing): the container with `flex items-center gap-2 shrink-0 flex-wrap` (severity/band pills row inside `flex flex-col sm:flex-row sm:items-center gap-3`) cannot shrink at the `sm` breakpoint, so the row is 551px wide inside a 687px parent. Component: the briefing signal/card header in site/src/components/briefing/* (the article with `px-4 py-3.5 rounded-[14px] border-l-[3px]`). Fix: drop `shrink-0` (use `min-w-0`), or switch to `sm:flex-row` only at `lg`, and add `min-w-0` to the sibling text.
- Cause B (tracker/watch): the tables sit in `hidden min-[720px]:block overflow-x-auto` wrappers, but the wrapper is not `position:relative`, so an absolutely positioned `.sr-only` span in a cell (watch: sr-only at x=773) escapes the clip and widens the document. The same applies to any sr-only inside these tables. Component: tracker/watch table wrappers in site/src/app/ai-models/tracker and site/src/app/ai-models/watch/[date]/page.tsx. Fix: add `relative` to the `overflow-x-auto` wrapper. Re-measure after: tracker should report 720.
- Impact: visible sideways page scroll on iPad portrait and small laptops. Release recommendation: fix before shipping.

### R2 (MEDIUM) Wrong consistency copy for evenly low profiles
- Route `/country/afghanistan` (all dimensions 1.0, std dev 0.00): reads "Uneven profile (std dev 0.00) - integration premium reduced to +0.0 pts." Zero spread is not uneven; and "reduced" is wrong when the base is simply low.
- File: site/src/components/entity/EntityDetail.tsx, `buildConsistencyCallout` (about line 346): the `integrationPremium < 0.1` branch assumes unevenness. Fix: branch on `stdDev` first (e.g. stdDev < 0.15 gives "Even profile (std dev 0.00); no integration premium because dimension scores are low"), then fall through to the uneven wording.
- Affects every entity with a flat low profile; a customer-visible factual contradiction.

### R3 (LOW) Tracker filter grid leaves an orphan at ~720px
- Route `/ai-models/tracker`, 600 to 800px: 4 columns plus 1 orphan select. Component: the filter `div` in the tracker client component. Fix: use `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`.

### R4 (LOW) In-page TOC links underlined
- `/ai-models`, watch edition, `/insights/<slug>`, and the pilot report TOC all use an explicit `text-muted underline underline-offset-2`, so the "ON THIS PAGE" list is fully underlined; wrapped entries show broken numbering (pilot-2026-10-03 at 1366, "7. length", "10. wrong"). This conflicts with the "no underline in nav" rule. Files: site/src/app/ai-models/page.tsx:458, :485; site/src/app/ai-models/watch/[date]/page.tsx:117; site/src/app/insights/[slug]/page.tsx:93. Fix: use `no-underline hover:underline` and a hanging-indent list for the numbering.

### R5 (LOW) Movement strip axis labels collide at 390px
- `/updates/2026-10-14`, 390: axis reads "-28.40+28.4" (the "0" is jammed between the two end labels); bars for Cornell/Delhi are about 20 to 30px. Fix: hide the end labels below `sm` or use `justify-between` with a min width on the track; the numeric column on the right already conveys the value.

### R6 (LOW) Ranking table polish on mobile
- `/countries` 390: rank column scrolls away (only Country is sticky), so after a sideways scroll rows keep a name but lose rank. Header row is not vertically sticky (about 195 rows). Fix: optional sticky `thead` with `top` set to the nav height, and a narrow sticky rank column.

### R7 (LOW) Font floor and tap targets
- 11.2px text remains in dense briefing chips and labels (57 nodes on /updates/2026-10-14). Raise to 12px (`text-[0.75rem]`), keeping `tracking-wide` for uppercase labels.
- Nav icon toggles measure 28x28 and 34x34. Raise to 44px hit area (padding or `min-h-11 min-w-11`).

### Not covered
- Reduced-motion behaviour, pilot figure tick labels, hamburger target size, applied (solid) movement bars, home table versus registry diff.
- Console: every route logs 404 resource errors (20 on home desktop, 6 on mobile); not new this loop, but unresolved. Likely missing images/data in the local static server; check the URLs in `shots/after/report.json` before shipping.
