# Loop 2 visual QA and a11y re-test (D-61)

Build: `site/out` (2026-10-22, Loop 2). Chromium via Playwright, served nginx-style. Viewports 390 and 1366 (plus 720/800/1024 for overflow). Scripts (scratchpad): `a11y-recheck.mjs` (EXACT_BODY=1, 11 routes incl. pilot), `a11y-probe.mjs`, `l2probe.mjs` (SVG text, form borders, focus), `l2svg.mjs` (SVG text grouped), `l2lay.mjs` (widths, countries, pilot, updates), `toc.mjs`, `crop.mjs`, `af.mjs`. Screenshots: scratchpad `shots/l2/`.
Limits: contrast scan excludes text inside `<svg>` (the probe skips it), so SVG text contrast is unmeasured. Reduced-motion, hamburger-tap size and applied (solid) movement bars were not re-tested.

## Summary

| Area | Result |
|---|---|
| Contrast, HTML text (11 routes x 2 widths) | PASS: 0 fails everywhere (was 14/13/13/3/2-3/27) |
| Sub-12px, HTML text | PASS: 0 on all 11 routes at both widths |
| Sub-12px, SVG text (rendered size = font-size x CTM scale) | FAIL: 4.2-10.7px on 4 routes |
| Form-control borders | PASS: 7.27:1 on all 17 controls (was 1.35) |
| Focus ring transition | PASS |
| /countries 390 sticky | PASS with note |
| Pilot TOC and figure | PASS (one minor clip) |
| /updates 390 | PARTIAL: axis labels still collide |

## R1-R7 (Loop 1 QA report)

| # | Item | Verdict | Measured |
|---|---|---|---|
| R1 | Tablet overflow | PASS | scrollWidth == viewport at 390/720/800/1024/1366 on /updates, /updates/2026-10-14, /ai-models/tracker, /ai-models/watch/2026-10-22, /country/afghanistan, /countries (was 833, 1016, 773) |
| R2 | Even-profile copy | PASS | Afghanistan: "Even profile (std dev 0.00); the integration premium is +0..." and hero "Even profile: all 8 dimensions at 1.0/5" |
| R3 | Tracker filter orphan at 720 | PASS | 5 controls lay out 3+2 (x=16/249/483, then 16/249); no lone orphan |
| R4 | In-page TOC underline | PASS (pilot) | `.pilot-toc` links `text-decoration: none`, hover-only underline; wrapped items hang under text ("Separated model and reply / length"). Other pages' TOCs not re-checked |
| R5 | Movement strip axis labels at 390 | FAIL | /updates/2026-10-14 axis still reads "-28.4+28.4": spans at x=189-219 and 219-249, 0px gap, y=2499 |
| R6 | Ranking table sticky | PASS with note | see Countries section |
| R7 | Font floor | PASS for HTML (0 nodes <12px, was 56-57). Tap targets not re-measured (a11y recheck: 0 failures at 390) |

## Contrast per route (HTML text, 1366 and 390 identical)

/ 0, /updates 0, /updates/2026-10-14 0, /countries 0, /country/afghanistan 0, /methodology 0, /ai-models 0, /ai-models/tracker 0, /insights 0, /contact-sales 0, /ai-models/reports/pilot-2026-10-03 0. No remaining failing pairs. Primary button ink on gradient: 10.50:1 / 7.45:1 (unchanged). All in-prose links underlined (0 not underlined, excluding the "Buy on Gumroad" filled-button false positive on /countries).
Unmeasured: SVG text colour (captions/labels inside charts). Visual check of the radar/profile bars shows legible colour but at the sizes below.

## Sub-12px text

HTML: 0 on all 11 routes at 390 and 1366.
SVG (rendered px = computed font-size x screen CTM):
| Route | Width | Chart (aria-label) | Nodes | Rendered size |
|---|---|---|---|---|
| /countries | 390 | Mean composite by Region | 37 | 5.8-6.3px |
| /country/afghanistan | 390 and 1366 | Dimension profile (AWR/EMP bars, viewBox 600 wide in 340px) | 16 | 5.7-5.9px |
| /country/afghanistan | 390 | Dimension deviation from field average | 17 | 8.3-9.0px |
| /country/afghanistan | 390 | SAsia cohort strip | 3 | 10.7px |
| /methodology | 390 | pipeline 4.7-5.3, consistency step 4.2-5.8, integration premium 5.1-8.3, anchor ladder 6.1-9.6, band scale 4.8-5.4, evidence pyramid 4.8-5.4, flow 4.5-6.1 | ~107 | 4.2-9.6px |
| /methodology | 1366 | Consistency factor step chart | 17 | 7.9-11.0px |
Pilot figures at 1366: 0 small. Cause: SVGs use a fixed viewBox and shrink with width, so a 10-11 user-unit font renders at about 5px. The source guard cannot see this. Screenshots `afg_radar-390.png`, `meth_cons-390.png` show the consistency chart notes overlapping and unreadable at 390.

## Form-control borders

Border `rgb(143,163,190)` (#8fa3be) on #0b1220 = 7.27:1, 1px: /countries 4 controls, /ai-models/tracker 7, /contact-sales 6. PASS (needs 3:1; was 1.35). Placeholder 5.57-5.77:1 (a11y-probe, computed). Newsletter input 6.61.

## Focus ring

Focused nav link (Updates): `transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform` (no outline-color), outline `rgb(147,197,253)` 2px, offset 2px. PASS. Primary button settled ring same colour. Skip link flagged "obscured" is the documented false positive (z-index 100, topmost).

## /countries at 390

- Rank th/td: `position:sticky; left:0; width 52`; Country: `sticky; left:52; width 257`; opaque bg rgb(11,18,32); th z-index 2, td z-index 1. After scrollLeft=300 Rank at x=17 and Country at x=69 stay put; Region slides to x=26 beneath them. Header does not overlap: PASS.
- Note: pinned columns occupy 309px of the 356px scroll viewport, leaving about 47px for data, so after scrolling the numeric columns are almost fully hidden under the pinned pair. Country column is 257px wide for names like "Finland". Usability defect (LOW-MEDIUM).
- Header row is not vertically sticky (about 195 rows): still open from R6 (LOW).

## /ai-models/reports/pilot-2026-10-03

- TOC (25 items, 5 wrap at 390, 7 at 1366): decimal numbering with hanging indent, no underline: PASS.
- Figures (5 SVGs, 660px wide at 1366): top tick row "0|25|50|75|100", 0 label collisions, 0 sub-12px. Clipped: each figure's footer line ("pilot-2026-10-03 · local open-weight build ... comparability n") runs past the right edge of the SVG (1 clipped text per figure). LOW.
- No horizontal overflow at 390 or 1366. At 390 the pilot SVG text count is 0 (figures render in another form).

## /updates at 390

- Briefing header: no line starts with "·" (separators trail the previous line: "COMPASSION BENCHMARK ·", "...2026 ·", then "NO. 183"). PASS; trailing dots are slightly untidy (cosmetic).
- Movement strip: FAIL (R5 above). Bars 14-30px, readable; labels/values right column fine.
- ForwardTriggerTimeline: PASS. Empty state "No triggers within the next 90 days." plus a clear Undated list (TBD chips, MEDIUM/LOW pills, text 12px+).

## New-regression scan (screenshots, 390 and 1366)

/, /updates, /country/afghanistan, /ai-models, /insights, /countries, /methodology reviewed. No overflow (scrollWidth == viewport at both), no clipped hero copy, CTAs in intended order, primary button legible, insights cards block-level. No new regressions. Pre-existing: 404 console errors per route (home desktop 20, mobile 6; /updates 28/18) unchanged and unexplained.

## Remaining failures, ranked

1. SVG chart text renders at 4-10px (MEDIUM-HIGH, customer-visible, undetected by source guard). Components: `site/src/components/charts/ConsistencyStepChart.tsx`, `PipelineFlowDiagram.tsx`, `ScorePipelineDiagram.tsx`, `IntegrationPremiumDiagram.tsx`, `AnchorLadder.tsx`, `BandScaleStrip.tsx`, `EvidencePyramid.tsx`, `DimensionProfileBar.tsx` (5.7px even at 1366), `GroupMeanBars.tsx` (/countries region chart, 6px), `DimensionRadar.tsx` (deviation chart 9px). Fix: raise font user-units so rendered >= 12px at 358px width, or give a horizontal-scroll min-width wrapper, and add a rendered-size test (CTM scale) to the guard.
2. Movement strip axis labels collide at 390 (LOW-MEDIUM): `site/src/components/briefing/MovementDeltaStrip.tsx`.
3. /countries pinned Rank+Country columns consume 309 of 356px (LOW-MEDIUM): `site/src/components/index/RankingTable.tsx`. Narrow the Country column (name width ~120px) or pin only Country.
4. Pilot figure footer text clipped at SVG right edge (LOW): pilot report figure component under `site/src/app/ai-models/reports/` (pilot figure SVGs).
5. /countries table header not vertically sticky (LOW): `RankingTable.tsx`.
6. Unresolved 404 console errors on every route (LOW, pre-existing).

Release: no HTML-text contrast, font-floor, overflow, focus or form-border blockers remain. Item 1 is the only substantive open defect.
