# Loop 1 data-visualisation audit (D-61)

Date: 2026-10-22. Scope: index ranking tables, entity pages, briefing score-movement visuals (`/updates/<date>`),
AI model pages (pilot reports, AI Model Watch edition, tracker). Evidence: the `before/` and `before2/` screenshots
(desktop 1366, mobile 390) and the component source. Every fix below is presentational only: no data changes, no new
figures, no new claims, hand-rolled SVG/CSS, no chart libraries. Ranked by comprehension impact.

**D-29 / D-29a guard (applies to every AI-model item).** Pilot visuals stay ranges, alphabetical within group, a point
tick only where `showsPoint()` allows. Do NOT reuse band colours, `BandPositionStrip`, band-zone tracks, sparklines or
any sort-by-value on AI model pages; any of those would read as a band, official score or ranking and conflicts
with D-29/D-29a. None of the fixes below need them.

---

## 1. Compact band-position strips print text at about 4.5 to 6 px
- **Routes:** index pages ("Most and least compassionate" rows), `/updates/<date>` lead signal, signal cards, boundary watch.
- **Component:** `site/src/components/charts/BandPositionStrip.tsx`, used with `compact` in `index/IndexPageCharts.tsx:126,164`,
  `updates/briefing/LeadSignalCard.tsx:247`, `SignalCard.tsx:192`, `BoundaryWatch.tsx:192`.
- **Problem:** in compact mode the 300-unit viewBox is drawn at 180 px (0.6x), so the 7.5-unit "median" and "pts to"
  labels render at about 4.5 px and the score label at about 5.7 px. They cannot be read on any screen (see `ai-labs-desktop-full.png`).
  The band zones are drawn at 0.25 opacity, so the five zones barely show against the dark panel.
- **Fix:** in compact mode, draw no text inside the SVG. Put the score, "median 35.9" and "N pts to Developing" in an HTML
  line under the strip (`text-[0.72rem] tabular-nums`). Raise the zone opacity to about 0.45 and keep the white boundary ticks.
  Keep the existing `aria-label`.

## 2. The entity sparkline stretches its y-axis and spaces points by count, not date
- **Route:** every entity page hero, and the history page. **Component:** `site/src/components/entity/CompositeSparkline.tsx`.
- **Problem:** the y-domain is fitted to min to max ±12% (lines 49-57), so a 1-point change draws as a cliff and a flat history
  sits at an arbitrary height. x is spread by index (`toX(i)`), although the header says "gaps matter". The only label is
  the last value: no start value, no dates, no scale. On Afghanistan (`country_afghanistan-desktop-top.png`) 14 identical
  hollow dots read as a ruler.
- **Fix:** use a fixed 0 to 100 domain with faint gridlines at 20/40/60/80 (the band edges, same tokens as the strip).
  Position x by date. Label the first point too (value and short date) and put the last date under the end dot.
  Reuse the date-axis logic that already exists in `HistoryTimeline.tsx`.

## 3. The dimension bars draw a 1-to-5 scale on a 0-to-5 track
- **Route:** entity pages, the eight dimension cards. **Component:** `site/src/components/entity/EntityDetail.tsx:178-189, 1027-1074`.
- **Problem:** dimensions are rated 1 to 5 and the composite maps 1 to 0 (`lib/scoring.ts:36`). The bar fill is `score/5`,
  so a floor score of 1.0 fills 20% while the composite reads 0.0 (Afghanistan: eight 1.0 bars, composite 0.0).
  `aria-valuemin={0}` is wrong as well. The bar colour uses the same `score/5` mapping, so a 1.8 is shown orange
  (Developing) while the equivalent composite position is red (Critical).
- **Fix:** fill = `(score-1)/4`, `aria-valuemin={1}`, and colour from the same mapping. Add small "1" and "5" end labels under
  the first card (or in the section intro: "1 = floor, 5 = top anchor"). `DimensionProfileBar` and the methodology already use `(v-1)/4`.

## 4. Index ranking tables: mixed decimals, left-aligned numbers, no scan aid
- **Routes:** all eight index pages. **Component:** `site/src/components/index/RankingTable.tsx:136-152, 263-295`.
- **Problem:** cells print raw values: `4`, `4.4`, `2.75`; composites `50` next to `48.4` (`ai-labs-desktop-full.png`).
  Numbers are left-aligned and proportional, so columns do not line up. The composite is accent blue, not band-coded, and the
  band pill is far right. On mobile the table has 12 or more columns and scrolls sideways with no pinned name column.
- **Fix:** display formatting only. Composite always one decimal. Dimension scores to a consistent precision (pad `4`→`4.0`;
  keep two decimals only where the data has them). Right-align numeric columns with `tabular-nums`. Add a thin 0 to 100
  band-coloured bar under the composite number in the score cell, with the number kept. Make rank and name `sticky left-0` with a
  panel background when the table is wider than the viewport.

## 5. The briefing "assessments by band" bar is colour only
- **Route:** `/updates/<date>`, "Today in 30 seconds" (`updates_2026-10-14-desktop-top.png`).
- **Component:** `site/src/components/updates/DailyBriefing.tsx:376-405`, which calls `charts/BandDistributionBar.tsx` with `compact`.
- **Problem:** compact mode drops all labels and the legend. Readers see red/orange/yellow blocks with no counts and no band names,
  so the meaning is in colour only (accessibility and comprehension).
- **Fix:** keep the compact bar and add an HTML chip row under it, in the same pattern as the severity pills next to it:
  "6 Critical · 4 Developing · 1 Functional" (count + name, zero-count bands omitted). Swatch dots are fine as long as the text is there.

## 6. Index-hero band distribution: labels shrink with the SVG and narrow segments lose them
- **Routes:** index hero cards (`countries-desktop-top.png`) and any non-compact use. **Component:** `charts/BandDistributionBar.tsx:243-335`.
- **Problem:** legend (9.5 units) and % (9 units) live inside a 600-unit viewBox. In a ~490 px card they render at about 7.5 px, and on a
  390 px phone at about 5 px. Segments under 60 units lose the % (Exemplary "14" has no %), under 40 lose everything.
- **Fix:** keep the bars in SVG. Move the legend into an HTML flex-wrap row (swatch + "Critical 0–20 · 56 (29%)") so it reflows and
  stays at 0.75rem or larger. Inside-segment labels are optional once the legend carries count and percent.

## 7. The briefing movement strip draws unapplied differences the same as applied moves
- **Route:** `/updates/<date>`, "Measured differences". **Component:** `site/src/components/updates/briefing/MovementDeltaStrip.tsx`.
- **Problem:** the takeaway text and the aria-label separate applied from not applied (BRF-MOVE), but the bars do not: every row is a
  solid band-coloured bar (lines 332-342), so a proposal looks like a movement. The SVG is fixed at 600 px (`minWidth`), so mobile
  readers scroll sideways. Text is 7 to 8.5 px. The bar colour means "band of the new reading", which is never explained.
- **Fix:** draw not-applied rows as outline-only (stroke, no fill, dashed) and add "not applied" after the delta label. Add a
  one-line key: "Solid = applied to the published score · Outline = measured, not applied · Colour = band of the measurement".
  Drop `minWidth`, let it scale to the container, and give the SVG a minimum rendered text size of 11 px (or render names in HTML).

## 8. "Strongest: Awareness · Weakest: Awareness" on even profiles
- **Route:** entity page hero card (`country_afghanistan-desktop-top.png`). Common wherever all eight scores are equal (AI labs at 4.0/3.0/1.0).
- **Component:** `site/src/components/entity/EntityDetail.tsx:565-571` (also the radar aria-label at 896-899 and the takeaway at 364-374).
- **Problem:** when every dimension ties, the first dimension is shown as both strongest and weakest. This reads as a bug and
  tells the reader nothing.
- **Fix:** when max equals min, render "Even profile: all 8 dimensions at 1.0/5" (the value is already on the page). Use the same
  wording in the aria-label and the takeaway line.

## 9. The dimension radar leads, but its labels are tiny and a flat profile draws a dot
- **Route:** entity page "8 dimensions" section. **Component:** `site/src/components/charts/DimensionRadar.tsx` (labels 6.5 to 9.5 units in a 340 viewBox), placed by `EntityDetail.tsx:886`.
- **Problem:** axis codes and values render at about 6 to 8 px. For low or even profiles the polygon is a small octagon near the centre.
  The area caveat is in faint grey. The bar view, which answers "where is it weak?" better, is hidden behind "See dimension bars".
- **Fix:** make the `DimensionProfileBar` view the default and move the radar into the `<details>`. Or keep the order and raise radar label sizes to
  at least 11 px rendered, and put the area caveat in normal muted text, not the faint caption colour.

## 10. Severity pills reuse the band palette
- **Route:** `/updates/<date>`, directly under the band bar. **Component:** `site/src/components/updates/DailyBriefing.tsx:417-423`.
- **Problem:** HIGH uses the Developing orange `#fb923c` and MEDIUM uses the Functional yellow `#fcd34d`, one line below a band bar in the
  same colours. Readers can map "high" to a band.
- **Fix:** give severity its own encoding. Use neutral pills with a weight cue (filled for high, outline for medium, muted for low), or a
  single non-band hue such as violet at different opacities. Keep the count + word text.

## 11. "Today's number" can show a word, not a number
- **Route:** `/updates/2026-10-14` header ("TODAY'S NUMBER · HIGH priority signal — Lisbon's").
- **Component:** `site/src/components/updates/briefing/StatOfTheDay.tsx`.
- **Problem:** the figure slot is filled with a severity word, and the entity name ends as a truncated possessive. The stat element
  promises a number and has none.
- **Fix:** when the figure is not numeric, render nothing (or fall back to the existing headline figure already in the briefing JSON).
  Do not truncate entity names into possessives. Never make up a number to fill the slot.

## 12. AI model pages: queue tiles and the pilot range axis
- **Routes:** `/ai-models/watch/<date>` ("5. Queue status"); `/ai-models/reports/<runId>` (range figure).
- **Components:** `site/src/app/ai-models/watch/[date]/page.tsx` (queue tiles); `site/src/components/model-benchmark/pilot/PilotFigures.tsx:111-248`
  with `pilot/figure-kit.tsx` (`HAxis`).
- **Problem (watch):** the tiles "9 Queued / 4 Measured / 0 Skipped" carry the date "as of 2026-10-13" only in small text under them, in an
  edition dated 22 October whose section 4 says nothing was measured this window. "Measured" next to that reads as a contradiction.
- **Fix (watch):** put the as-of date in the section heading ("Queue status, as of 13 October") and label the tile "Measured to date".
  Text and layout only. No order, no colour by status.
- **Problem (pilot figure):** the 0 to 100 axis is drawn once, at the bottom of a tall figure (eight models, two arms). On a phone the
  reader scrolls away from the scale to read a whisker.
- **Fix (pilot figure):** repeat the tick labels (0/25/50/75/100) at the top of the plot. Keep the existing gridlines. **D-29a check:** this
  changes no order (alphabetical within group stays), adds no point where `showsPoint()` is false, and uses no band colour. Compliant.
  Do NOT add band zones, a sorted order or a summary "leader" marker. Those would conflict with D-29/D-29a.

---

### Not flagged (checked, fine as built)
- The tracker table already switches to cards below 720 px and is alphabetical by provider with no score column (D-29 compliant).
- The pilot reports index lists models alphabetically and states separation in words. A separation diagram there would add new figures, so it is out of scope for Loop 1.
- The pilot `DimensionPanel` (`dashboard/panels.tsx`) already uses the `(v-1)/4` mapping and "order carries no meaning".

### Handoff
frontend-engineer builds items 1–7 (shared primitives: biggest reach, about 1,325 entity pages plus every briefing). ux-designer
owns the sizes and opacities in 1, 6 and 9. knowledge-architect owns the wording in 7, 8, 11 and 12. Re-shoot `before/` and
`before2/` at 390 and 1366 after each fix.
