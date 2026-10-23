# Loop 1 visual/UX audit (D-61)

Scope: presentational fixes only. No change to data, scores, published figures or copy meaning.
Evidence: before/ and before2/ screenshots (1366 desktop, 390 mobile) plus report.json. Full-page shots are downscaled and unreadable at detail, so findings come from the top shots, report.json and source.
Excluded as already known: hydration #418, home/methodology mobile overflow, "8indexes" spacing, stale home counts.
Effort S/M/L. Risk is blast radius of the change.

## Ranked issues

### 1. Primary buttons render pale text on a pale-blue gradient (low contrast)
- Routes: all (home, /ai-models, /updates, /countries, /ai-labs); desktop and mobile.
- See: "Read today's briefing", "Read this week's edition", "Purchase Full Report - $195", "Contact Sales" (navbar) show near-white label on light blue, roughly 1.5:1. The component intends dark `#07111f` text.
- Why: the main call to action on every page is hard to read. This is an accessibility failure.
- Cause: `site/src/app/globals.css` line 47 `a { color: inherit }` is unlayered. In Tailwind v4 utilities live in `@layer utilities`, so the unlayered rule beats `text-[#07111f]` on any `<Link>`/`<a>` button. Source: `site/src/components/ui/Button.tsx` line 41.
- Fix: wrap the base rule in `@layer base { a { color: inherit; text-decoration: none } }`. Safer alternative with the same effect: add `!text-[#07111f]` to the `primary` variant string in Button.tsx.
- Effort: S. Risk: low for the `!` alternative; medium for the layer move, because any link that relied on the override changes colour. Check the navbar and footer links after.

### 2. Linked cards are inline anchors, so borders and background fragment (ghost corner shapes)
- Routes: /insights (desktop, clearly visible); anywhere `<Card href>` is used (indexes, services, research).
- See: on /insights the post cards have no visible rectangle. Only stray rounded corner fragments show at the top and bottom of each column, and the layout looks broken.
- Why: it reads as a rendering bug and the click target is unclear.
- Cause: `site/src/components/ui/Card.tsx`. When `href` is set the root is a `<Link>` (inline by default) and the variants do not include `block`. `h-full` has no effect on an inline element.
- Fix: in Card.tsx use `const cls = \`${href ? "block " : ""}${variants[variant]} ${className}\``. Or add `block` to all three variant strings.
- Effort: S. Risk: low. Cards that were already wrapped in flex or grid are unaffected. Check card height alignment in grids.

### 3. Methodology sticky "On this page" rail overlaps the hero panel and the "3 minutes" strip
- Route: /methodology, desktop 1366 (the rail shows at the `xl` breakpoint, 1280 and up).
- See: the 160px rail, fixed at top-24 on the right, sits on top of the "What every published score guarantees" card (text runs through the labels) and the bottom-right of the collapsible strip. The labels are unreadable there.
- Why: the page's own navigation collides with the first content, so neither can be read.
- Cause: `site/src/components/methodology/MethodologyTOC.tsx` line 164. Position is `right-[max(1.5rem,calc((100vw-1200px)/2-180px))]`. At 1366 the rail's left edge is about 1182px, but the container runs to about 1323px.
- Fix: show the rail only when there is a gutter. Change `hidden xl:block` to `hidden min-[1640px]:block`. Below that width, show the existing mobile collapsible list at `lg` and up as an inline sticky bar. A lower-risk alternative is a `lg:grid grid-cols-[1fr_180px]` page layout with a `sticky top-24` aside.
- Effort: S for the breakpoint change, M for the grid. Risk: low.

### 4. Updates/briefing pages have 337 to 338 elements under the readable size
- Routes: /updates, /updates/2026-10-14 (desktop and mobile). Also /country/afghanistan (22) and /methodology (10 to 11).
- See: tiny uppercase labels ("TODAY'S 11 ASSESSMENTS BY BAND", "1,329 scanned", chart axis text). The Afghanistan chart annotations ("median 35.9", "20 pts to Developing") are about 7px.
- Why: unreadable on mobile and for low-vision readers. The briefing is the flagship daily page.
- Cause: arbitrary `text-[0.6x-0.7xrem]` and `text-[9-11px]` classes: `components/updates/DailyBriefing.tsx` (50 hits), `components/entity/EntityDetail.tsx` (25), `components/updates/TopSignals.tsx` (15), `components/updates/briefing/TodaysAnalysisSection.tsx` (12), `components/charts/*`.
- Fix: set a floor of 0.75rem (12px) for labels. Mechanical pass: `text-[0.6*]` and `text-[0.65*]` become `text-[0.75rem]`, and `text-[9px]/[10px]/[11px]` become `text-xs`. Keep uppercase tracking on labels only. Set SVG text `fontSize` to 11 or more at the rendered scale.
- Effort: M (many files, mechanical). Risk: medium. Wrapping can change chart and badge layout, so re-shoot.

### 5. Afghanistan (entity) hero: band chart is stranded and tiny, with large dead space
- Route: /country/afghanistan desktop (applies to all /country/*, /state/*, etc. via EntityDetail).
- See: the score band bar sits at about 300px wide in the far left column with unreadable captions. The score-history sparkline below it is also small, and its caption "No net change over 14 assessments since May 2026" floats at x of about 395, misaligned with the line. Composite card is at far right, leaving about 600px of empty space between.
- Why: the key visual is the least legible element on the page, and the hero looks unfinished.
- Cause: `site/src/components/entity/EntityDetail.tsx` and `components/charts/BandDistributionBar.tsx` (SVG with a fixed width). The hero grid does not give the chart a full column.
- Fix: make the chart `w-full max-w-[560px]` with `viewBox` scaling (`width="100%"`). Put the history caption beside the sparkline as `flex items-center gap-3`. Cap the hero grid with `lg:grid-cols-[minmax(0,1fr)_320px]`.
- Effort: M. Risk: medium (chart geometry).

### 6. Long-form text blocks have no hierarchy in the AI Models hub opening
- Route: /ai-models, desktop and mobile (18,631px tall on mobile).
- See: a single 7-line lead paragraph (about 110 words, 940px wide) under the H1, then a dense full-width notice box. On mobile, the lead takes more than 780px, so the first screen has no action.
- Why: the first screen answers nothing a reader can scan. CTAs ("Read this week's edition") come after about 600px on desktop and are off-screen on mobile.
- Cause: copy rendered by `site/src/app/ai-models/page.tsx` and `site/src/lib/model-dashboard-copy.ts`.
- Fix (presentation only): render the lead in `text-[1.05rem] leading-relaxed`, put the CTA row directly under the H1 on `<md`, and wrap the long lead in a `<details>`-style "Read the full summary" only if the founder agrees (it hides copy, so check D-61). Without changing copy: use `order-` to float the CTA row above the lead on mobile.
- Effort: S for reorder, M for collapse. Risk: low for reorder.

### 7. Mobile pages are extremely long with no in-page navigation
- Routes: /methodology (38,297px), /ai-models/tracker (20,658), /updates (20,865), /ai-models (18,631), /countries (17,659), /indexes (12,687).
- See: a continuous scroll. The only in-page nav is the methodology collapsible. The briefing tab strip ("30 seconds / Today's analysis / Lead signal / Forw...") is cut off at the right edge with no fade.
- Why: readers cannot find or return to a section, and there is no hint that the strip scrolls.
- Cause: `components/updates/DailyBriefing.tsx` (tab strip), page layouts for the others.
- Fix: (a) add a right-edge mask to scroll strips, `[mask-image:linear-gradient(to_right,#000_85%,transparent)]`, with `snap-x`. (b) Add a fixed "Back to top" button after 2 screens, `fixed bottom-4 right-4 min-h-[44px]`. (c) Reuse `MethodologyTOC` mobile list on /ai-models and /updates.
- Effort: S for (a) and (b), M for (c). Risk: low.

### 8. Tracker on mobile: 63 stacked cards (20,658px) with each metadata field on its own line
- Route: /ai-models/tracker mobile.
- See: the table is swapped below 720px for tall cards, and the three stat cards (63 / 18 / date) each take a full row (about 110px each).
- Why: scanning 63 models takes about 20 screens. The stats push the filter down by 330px.
- Cause: `site/src/app/ai-models/tracker/page.tsx` line 157 (`hidden min-[720px]:block`) and the stat grid above it.
- Fix: stats as `grid grid-cols-3 gap-2` with smaller `p-3` on mobile. Make cards two-column `grid-cols-2` key-value (Released / Status / Access / Licence) instead of one per line. Make the filter bar `sticky top-[64px]` with a "Filters" disclosure.
- Effort: M. Risk: low.

### 9. Tracker desktop table: filter row is misaligned and the Source column wraps three-deep
- Route: /ai-models/tracker desktop.
- See: five selects of unequal widths (Provider 280, Access 150, Licence 245, Status 150, Tested 150). "Showing 63 of 63" sits below with no reset. The Source cell stacks "huggingface.co source / ollama.com source / +1 more" and sets row height to about 100px.
- Why: uneven rows make the table look unfinished and slow to scan.
- Cause: `components/model-benchmark/*` `TrackerFilters` and the tracker page line 158.
- Fix: `grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3` for filters; add `whitespace-nowrap` to Released/Status/Access; add a "Reset filters" link; table rows `align-top`, source links `text-[0.85rem]`.
- Effort: S. Risk: low.

### 10. Homepage hero: right "Current publication set" panel ends 470px above the left column and leaves a dead block
- Route: / desktop. Also /indexes (same "Three ways to start" panel).
- See: the panel ends at y of about 680 while the left column runs to about 870, so the right column is empty beside the stat cards.
- Why: unbalanced hero, and the panel's table is visually weaker than the headline.
- Cause: the hero grid in the home page or `components/index/IndexHero.tsx`.
- Fix: `items-start` becomes `items-stretch` on the grid and `lg:sticky lg:top-24` on the panel, or move the four stat cards under the panel to fill the column. No copy change.
- Effort: S. Risk: low.

### 11. Hero H1 scale differs wildly across pages
- Routes: home (about 64px, thin weight), /country/afghanistan (about 48px, bold), /updates (about 36px, bold), /insights and /ai-models (about 50px, thin), pilot header (`globals.css` line 117, max 2.7rem).
- See: three different weights and at least four sizes for page titles.
- Why: this weakens the sense of one product and makes the hierarchy unpredictable.
- Cause: per-page `text-[clamp(...)]` values (for example `app/insights/page.tsx` line 42) and `.pilot-header h1`.
- Fix: define `--text-h1: clamp(2rem, 4.5vw, 3.1rem)` and an `.h1-page` utility (weight 500, leading 1.1, tracking -0.01em); keep the home hero as the only exception. Replace per-page clamps.
- Effort: M. Risk: low to medium (wrapping on long titles).

### 12. Hero paragraphs run at 900 to 940px with `max-w-[900px]`
- Routes: /ai-models, /ai-models/tracker, /insights, /how-we-analyse page, /methodology (desktop).
- See: lines of about 120 characters.
- Why: past roughly 75 characters per line, reading speed and tracking fall.
- Cause: `ui/SectionHead.tsx` line 15, `app/insights/page.tsx` line 43, and similar.
- Fix: replace `max-w-[900px]` with `max-w-[68ch]` for body copy, and keep 900px for card grids.
- Effort: S. Risk: low.

### 13. Callout/notice on /ai-models/cycle: bold lead runs into the next sentence with no space
- Route: /ai-models/cycle desktop.
- See: "No official model ranking, band or score is published.Where this page says ..." (the bold span runs straight into the next sentence).
- Why: looks like a typo, in the page's key disclaimer.
- Cause: JSX whitespace dropped between `<strong>` and text, in `app/ai-models/cycle/page.tsx` or its copy source.
- Fix: add `{" "}` after the `</strong>`, or `strong { margin-right: .25em }` inside `.callout`. No change to the words.
- Effort: S. Risk: none.

### 14. Button rows: inconsistent heights, widths and wrapping
- Routes: / (3 buttons stack to full-width on mobile), /ai-models (4 buttons of different widths), /updates ("Read today's brief" next to 2 text links), mobile hero CTAs.
- See: the mobile buttons are content-width, ragged, and the primary one is narrower than the secondary on /countries (about 270px vs 182px). The "Browse the 8 indexes" tertiary link has no hit area (about 20px tall).
- Why: touch targets are inconsistent, and the visual rhythm is uneven.
- Cause: `ui/Button.tsx` (`inline-flex`, `min-h-[48px]`), with no `full` default on mobile, and ad hoc wrappers on each page.
- Fix: in Button add `max-sm:w-full` (or pass `full` in hero rows) and give text-link CTAs `inline-flex min-h-[44px] items-center`. Make hero button wrappers `flex flex-col sm:flex-row gap-3`.
- Effort: S. Risk: low.

### 15. Updates page head: tab chips and meta lines wrap awkwardly on mobile
- Routes: /updates mobile.
- See: the meta line "- Wednesday, October 14, 2026 - NO. 183" starts with an orphan separator dot. "HIGH priority signal -" is followed by "Lisbon's" on the next line, with the copy button floating beside it. Date chips wrap onto a second row ("Sep 21" alone).
- Why: broken-looking at the top of the flagship page.
- Cause: `components/updates/DailyBriefing.tsx` (flex-wrap with separator spans).
- Fix: hide the leading separator with `first:hidden`, or render separators via `[&>*+*]::before`. Make the date chips a single `overflow-x-auto flex-nowrap` row with `snap-x`. Put "Lisbon's" in the same `inline` run as "priority signal".
- Effort: M. Risk: low.

### 16. Entity-page rows of tiny status strips (evidence line, "Assessment record") look like debris
- Route: /country/afghanistan desktop.
- See: a 1366px strip carrying a 10px green dot, small caps "EVIDENCE REVIEWED", a date, a text note and a purple "14xTier-C NGO/academic" badge, all at roughly 12px. "Assessment record" sits below as a collapsed caret.
- Why: this is proof of independence and evidence quality, and the page hides it in a low-contrast strip.
- Cause: `components/entity/EntityDetail.tsx` and `EntityEvidenceCard.tsx` (7 sub-12px hits).
- Fix: raise to `text-[0.85rem]`, add `py-4` and `gap-x-4 gap-y-2`, and keep the colour tokens. The badge gets `text-[0.8rem]`.
- Effort: S. Risk: low.

### 17. Heading rhythm: section gaps vary from 16px to 38px
- Routes: /insights (`py-[38px]`, `py-[16px]`, `py-[20px]`, `pb-[40px]`), others per page.
- See: "Posts" sits only 16px under the hero and the filter chips; later sections change spacing again.
- Cause: bespoke `py-[Npx]` on every `<section>`; `ui/Band.tsx` is not used consistently.
- Fix: define two section paddings, `py-10 md:py-14` (default) and `py-6` (tight), then migrate pages gradually. Do not change in this loop beyond /insights, /ai-models and the tracker.
- Effort: M. Risk: low.

### 18. Navbar: 10 top-level items plus a CTA crowd at 1366
- Routes: all, desktop.
- See: Indexes, AI Models, Updates (red dot), Methodology, Research, Services, About, Contact, Tools, search, "Contact Sales". Spacing is tight (about 16px) and "Contact" and "Contact Sales" sit close together.
- Why: two near-identical contact targets and decision load.
- Cause: `site/src/data/nav.ts` and `components/layout/Navbar.tsx`.
- Fix (presentation only): move "Contact" and "About" under the existing Tools dropdown at `<1536px`, via `max-2xl:hidden` on those two items plus duplicates in Tools. Needs the founder's say, since it changes nav structure.
- Effort: M. Risk: medium (IA).

### 19. Insights filter chips look like tabs but behave as filters
- Route: /insights desktop and mobile.
- See: "All / Labs / Agent builders" pills with only the active one outlined. There is no result count and no empty message when a filter yields none.
- Cause: `components/insights/InsightsFilter` (found via `app/insights/page.tsx` line 59).
- Fix: add `aria-pressed` styling (`aria-pressed:bg-accent/15 aria-pressed:border-accent`) and a `role="status"` line "Showing N posts".
- Effort: S. Risk: low.

### 20. Stat cards: inconsistent shapes between pages
- Routes: home (4 cards, 2-line labels), /ai-models/tracker (3 cards, 245px wide), /countries mobile (2x2 grid), /ai-labs mobile.
- See: tracker cards are left-clustered and leave 520px empty at right; home cards are equal-width in a row.
- Cause: `ui/Stat.tsx` with per-page grid wrappers.
- Fix: one wrapper class `grid gap-3 grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]`. Value size `text-[1.5rem]`.
- Effort: S. Risk: low.

## Cross-site patterns (for sequencing)

| Pattern | Items | Single change |
|---|---|---|
| Component specificity bugs | 1, 2 | Fix in Button.tsx / Card.tsx / `@layer base`. One edit repairs every page. |
| Sub-readable type | 4, 5, 16 | One floor token (12px) and a mechanical class sweep. |
| Heading and measure scale | 11, 12, 17 | Tokens `--text-h1`, `max-w-[68ch]`, two section paddings. |
| Button and CTA rows | 1, 6, 14 | `max-sm:w-full`, 44px link hit areas, CTA ahead of long leads on mobile. |
| Long pages, no nav | 7, 8 | Mask on scroll strips, back-to-top, reuse TOC on the long hubs. |
| Dense tables and cards on mobile | 8, 9 | 2-column key-value cards, sticky filters. |

## Suggested Loop 1 batch (highest return for lowest risk)
Do 1, 2, 3, 13, 14, 12, 9, 10, 20 first (all S). Then 4 (limited to Updates and Afghanistan), 5 and 15 as a second pass with re-shoots.

## Assumptions and checks for the implementer
- Item 1: the diagnosis comes from the CSS cascade plus the screenshots, not from computed styles. Confirm with a computed-colour check on `a.bg-gradient-to-br` before editing globally.
- Item 3: the viewport at which the overlap starts is estimated from the CSS; test at 1280, 1366 and 1440.
- Item 13: the source file was not opened; find it by searching "is published.Where" or the string "No official model ranking, band or score".
- Re-run the screenshot script after each batch and compare `report.json` smallText counts (target under 20 on /updates).
- Do not alter any score, count or sentence. Items 6 and 18 need founder approval if implemented beyond reordering.
