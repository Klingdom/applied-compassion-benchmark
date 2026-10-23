# Loop 3 — SVG small-text design (VIS-L3 / SVG-SMALL-TEXT)

Status: design + gate spec only. No source edited. Sizes are computed from source, not measured in a browser:
rendered px = fontSize x (rendered SVG width / viewBox width).

Container widths used:
- `Container` = `w-[min(1280px,calc(100%-32px))]` gives 358px at 390 and 1280px at 1366.
- `Panel` = `p-[22px]` + 1px border, so its content box is 46px narrower than the Panel.
- `ChartFrame` adds no horizontal padding.

The ConsistencyStepChart figure (6.5 x 312/480 = 4.2px) matches the 4.2px reported in the backlog, so the method holds.

## Measurements

| Component | Route | viewBox W | Rendered W 390 / 1366 | Smallest font (units) | px @390 | px @1366 | Passes from viewport |
|---|---|---|---|---|---|---|---|
| ConsistencyStepChart | /methodology (Panel, lg 2-col) | 480 | 312 / 586 | 6.5 ("never occurs"), 7 (axis, notes) | 4.2 | 7.9 | never (largest is 9 units, 11.0px @1366) |
| ScorePipelineDiagram | /methodology | 700 (viewBox uses totalW, not VW=660) | 440 (min-width, scrolls) / 1280 | 7.5 | 4.7 | 13.7 | ~1152 |
| PipelineFlowDiagram | /methodology | 620 | 400 (min-width, scrolls) / 1280 | 7 | 4.5 | 14.5 | ~1095 |
| IntegrationPremiumDiagram | /methodology | 560 | 358 / 1280 | 8 | 5.1 | 18.3 | ~872 |
| EvidencePyramid | /methodology | 560 | 358 / 1280 | 7.5 | 4.8 | 17.1 | ~928 |
| BandScaleStrip | /methodology | 600 | 358 / 1280 | 8 | 4.8 | 17.1 | ~932 |
| AnchorLadder | /methodology | 560 | 358 / 1280 | 9.5 | 6.1 | 21.7 | ~740 |
| DimensionProfileBar | every entity page, inside the closed "See dimension bars" `<details>`, `max-w-[340px]` | 600 | ~326 / 340 | 8 (prior-score notes), 10, 10.5 | 4.3 | 4.5 | never (capped at 340px) |
| PilotFigures (figure-kit) | /ai-models/reports/pilot-2026-10-0{1,2,3} | 480 | hidden at 480px and below (table replaces it) / 660 | 14 | n/a (hidden) | 19.3 | above 480 (~13px at 481) |
| MovementDeltaStrip | /updates, /updates/[date] | n/a: already HTML, no SVG | — | 0.75rem | 12 | 12 | yes |

Notes:
- PilotFigures font size is fine. The defect is clipping: the footer's third line (`l3` in `figure-kit.tsx` Footer) is not wrapped. "pilot-2026-10-02 · local open-weight build, 4-bit quantised · comparability none" is about 80 characters at 14 units, roughly 585 units wide starting at x=12, but the viewBox is 480 wide. Footer line 2 (bold, 56 characters) is close to the edge, at about 460 units.
- MovementDeltaStrip already uses HTML text (header comment: "text >= 12px") and already hides the centre "0" below `sm`. The axis labels "−max / +max" can still touch when `maxAbsDelta` prints with many decimals, because it is printed raw rather than through `formatDelta`. This needs an HTML overlap check in the gate, not an SVG font check. Formatting the number would change the digits shown, so it needs sign-off before anyone changes it.
- At 1366 most of the full-width charts are oversized (2.1–2.3x). That is not a defect, but they fail at 768 and 1024, so the gate needs those widths as well as 390 and 1366.

## Proposed fixes (presentational only: same strings, same numbers, same data arrays)

**Pattern A: HTML fallback below `md`, plus a font floor from `md` up.**
Applies to ScorePipeline, PipelineFlow, EvidencePyramid, BandScaleStrip, AnchorLadder and IntegrationPremium.
1. Wrap the SVG in `hidden md:block`.
2. Add a `md:hidden` stacked HTML `<ol>`/`<dl>` rendered from the same const arrays (BOXES, stages, TIERS, ANCHORS, bands, the three worked examples). Text at 0.8125rem or larger. Bars or swatches stay as CSS boxes with the same values.
3. Raise the smallest SVG fontSize to the floor `ceil(VW x 12 / 736)`, where 736px is the Container width at a 768 viewport:
   - VW 560: 9.5 units
   - VW 600: 10 units
   - VW 620: 10.5 units
   - VW 700: 11.5 units
4. Re-space colliding labels where needed.
5. Drop the `minWidth` and `overflow-x-auto` workaround.
6. Move `role="img"` and `aria-label` onto whichever version is visible. The other version gets `aria-hidden`, or carries the same label.
- Effort: S–M each (about 6 x 1–2h).

**Pattern B: HTML labels with a proportional bar.**
Applies to DimensionProfileBar.
- Rebuild as a 3-column HTML grid (code/name | bar track | score), the same pattern MovementDeltaStrip already ships. Only the bars scale. The prior-score note becomes a 0.75rem HTML line.
- One component fixes all 1,325 entity pages. Effort M.

**Pattern C: half-column chart.**
Applies to ConsistencyStepChart.
1. Move the two italic annotation lines and the "never occurs" marks into HTML `<p>`/`<span>` below the SVG, word for word.
2. Raise the remaining fontSize to 10 units, which gives 12.2px at 586.
3. Wrap the SVG in `overflow-x-auto`, with an SVG `min-width` of 576px below `xl`, OR switch to Pattern A below `md`. The Pattern A route is preferred: 4 steps fit as a 4-row HTML list.
- Effort S.

**Pattern D: wrap the footer.**
Applies to the PilotFigures footer.
1. Wrap `l3` with `wrapText()` into `<tspan>`s.
2. Make `footerHeight(lines)` depend on the number of lines.
3. Optionally split footer line 2 at " · ".
- Effort S. Text unchanged.

## Gate: `site/scripts/test-svg-text-size.mjs` (`npm run test:svg-text`, add to `npm run test`)

**Serve and load**
- Serve `site/out` with a node `http` server. Map `/x` to `x.html`, then to `x/index.html`.
- Launch Playwright chromium (already in `site/node_modules`).

**Viewports:** 390x844, 768x1024, 1024x768, 1366x900.

**Routes**
- /methodology
- /ai-models/reports/pilot-2026-10-01, -02, -03
- /updates
- /updates/2026-10-14
- one entity per index, e.g. /company/costco plus one country, state, AI lab, robotics lab, US city, global city and university
- auto-discovered: every `out/**/*.html` whose markup contains `<svg` and `<text`. Cap with a sample, but always include the fixed list above.

**Per page**
1. Set `open=true` on every `<details>`, so DimensionProfileBar and pf-data are measured.
2. Wait for fonts: `document.fonts.ready`.
3. For each `svg text` with a non-empty `textContent` that is visible:
   - "visible" means `checkVisibility()`, a rect with non-zero width/height, and no `display:none` ancestor.
   - Compute `px = parseFloat(getComputedStyle(t).fontSize) * Math.hypot(ctm.a, ctm.b)`, where `ctm = t.getScreenCTM()`.
   - **Fail** if `px < 12 - 0.05`.
4. **Clip check:** for each text element, compare its `getBBox()` against the root `svg.viewBox.baseVal`. Fail if `x + width > vb.x + vb.width + 0.5` or `x < vb.x - 0.5`. This catches the pilot footer.
5. **HTML overlap check:** for `[data-axis-label]` siblings (add the attribute to the MovementDeltaStrip axis spans), fail if any two rects intersect or are less than 4px apart.

**Output:** route, viewport, component (closest `figure[aria-label]` or `data-chart` attribute), text, px. Exit 1 on any failure.

**Baseline:** the gate is red today. Either land it in the same PR as the fixes, or start with a shrink-only allowlist (`svg-text-allowlist.json`, keyed by route + component) that the script also fails on when an entry no longer reproduces.

**Negative control:** with `--probe`, after load the script injects a test SVG into the first visible `svg` of each route:
- `<text font-size="6" data-probe>probe</text>`, which must be reported
- `<text x="vbW-5" font-size="40" data-probe-clip>clip</text>`, which must be reported
- one HTML pair of overlapping `[data-axis-label]` spans, which must be reported

The run passes only if every planted probe is reported and nothing else new is. A second fixture checks the threshold: font-size 11.9px must fail and 12px must pass, at a CTM scale of 1.
