# PAGES_REVIEW_UX_2026-06-11 — Special Reports and Daily Briefing

**Review date:** 2026-06-11  
**Scope:** `/updates/special/[slug]` (special reports — never reviewed); `/updates/special` (index page); `/updates` (daily briefing — remaining polish after Wave B, Wave C, Wave E1/E2, and the evidence-attribution review in BRIEFING_EVIDENCE_UX_2026-06-11)  
**Priority metric:** Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk

---

## How this review was grounded

Files read in full:

- `site/src/app/updates/special/[slug]/page.tsx` — 483 lines; the complete special-report renderer
- `site/src/app/updates/special/page.tsx` — the index listing
- `site/src/data/special-briefings/floor-and-critical-2026-06-11.json` — full content (7 keyFindings, 8 bodySections incl. 12 dense HTML tables)
- `site/src/data/special-briefings/exemplars-2026-06-11.json` — full content (7 keyFindings, 8 bodySections incl. 10+ tables)
- `site/src/data/special-briefings/manifest.json` — 2 entries
- `site/src/components/updates/DailyBriefing.tsx` — 1,793 lines; full section ordering and component registry
- `site/src/components/updates/briefing/BriefingJumpNav.tsx` — the existing sticky jump nav (daily briefing only; not used on special reports)
- `docs/GRAPHICS_BACKLOG_2026-06-11.md` — the consolidated graphics backlog; the band-distribution bar (#6), band-position strip (#1), and 8-dimension profile bar (#2) are explicitly flagged for special reports as the primary use case
- `docs/UPDATES_REVIEW2_UX_2026-06-10.md` — seven prior daily-briefing candidates; band-distribution bar scored Priority 14 there; not re-proposed here
- `docs/BRIEFING_EVIDENCE_UX_2026-06-11.md` — seven evidence-attribution candidates for the daily briefing; those items are not re-proposed here

**Content character of the two live reports:**  
`floor-and-critical`: 7 keyFindings + 8 bodySections; sections include a 7-row index-distribution table (§2), the 23-floor-entities table (§2 sub), a 4-row "failure families" table (§2 sub), a 6-row per-type Critical profile table (§3), a 10-row F500 quantization histogram (§4), a cross-entity dimension-vector comparison table (§5 — the Turkey/UnitedHealth pair), and a 5-row democratic-backsliding entrants table (§6). Estimated reading time: 14–18 minutes.  
`exemplars`: 7 keyFindings + 8 bodySections; sections include a 7-row per-index Exemplary count table (§2), a 7-row leader dimension-vector table (§2 sub), three inline scoring formula tables (§3), a 4-row weakness gate verification table (§3), a 5-row equity-below-4.0 count table (§3 sub), a cross-entity comparability table (§5), a 6-row cusp table (§8). Estimated reading time: 12–16 minutes.

**Section IDs as rendered today:**  
Sections render with `id="section-{i}-heading"` (sequential integer), not semantic IDs. Section 0 = "1. Frame"; section 1 = "2. The cohort"; etc. The heading text is the natural TOC label.

---

## Candidate 1 — Sticky In-Page Table of Contents (Section TOC)

**Page:** `/updates/special/[slug]`

**Problem (file evidence):**  
`[slug]/page.tsx` line 218–252: `bodySections.map()` renders each section with `id="section-{i}-heading"` and no sidebar or fixed navigation. There is no sticky nav analogous to `BriefingJumpNav` from the daily briefing. Both live reports have 8 body sections plus a keyFindings block at the top — roughly 14–18 minutes of reading at current text density.

The only navigation affordances are: (a) a breadcrumb at the top (line 137–154) that links back to `/updates` and `/updates/special` only; (b) a footer row at the bottom (lines 255–302) linking "All special briefings" and "Latest daily briefing."

A user who starts reading §3 ("Three failure modes") in the floor report has no way to jump to §5 ("Cross-type comparability") without scrolling through §4, which contains the densest table in either report (the 10-row F500 quantization histogram). On mobile, this is approximately 1,800px of scroll past a dense section to reach the next heading. The `BriefingJumpNav` component already implements the exact pattern needed — sticky, horizontally scrollable chips, IntersectionObserver active-state — for the daily briefing. It is not reused here.

**Proposed UX change:**  
Extract a `SpecialBriefingJumpNav` client component (or make `BriefingJumpNav` accept a generic `NavItem[]` with no briefing-specific props — it already accepts `NavItem[]` via `presentSections`). Build the nav array server-side in `[slug]/page.tsx` by mapping `briefing.bodySections` to `{ id: "section-{i}-heading", label: section.heading }`, prepending a `{ id: "key-findings-heading", label: "Key findings" }` entry when `keyFindings.length > 0`. Pass to `SpecialBriefingJumpNav` which renders identically to `BriefingJumpNav`: sticky at `top-[60px]`, horizontally scrollable chips, active section highlighted via IntersectionObserver.

The rightmost chip should be "Key findings" linked to `#key-findings-heading`, not an archive link. The existing breadcrumb nav stays above the sticky bar.

Heading IDs assigned in the current `bodySections.map()` render already match the IDs the TOC would target — no server-side changes to the section renderer required.

Screen behavior:
- Entry: user arrives, TOC renders below the breadcrumb area with 8–9 chips visible; "Key findings" is first active chip.
- Scrolling: IntersectionObserver marks the currently visible section chip as active (same `rootMargin` as BriefingJumpNav: `-10% 0px -60% 0px`).
- Mobile: horizontally scrollable with `overflow-x: auto; scrollbar-none`, same as BriefingJumpNav.
- No JS: plain anchor links; all sections reachable without scrolling.

**Why it improves the experience:**  
Both reports are intentionally long-form — they are the deepest analytical content on the site. The TOC makes non-linear reading possible: a researcher already familiar with the floor mechanics can jump directly to §5 (cross-type comparability) or §8 (forward view) without reading earlier sections. This is the standard affordance for long-form content and its absence is the single most obvious usability gap on these pages. The `BriefingJumpNav` implementation cost is already sunk.

**Independence check:** The TOC is mechanically derived from `bodySections[].heading` — no editorial selection of which sections to feature. All sections receive a chip. No entity or section receives prominence treatment.

| Dimension | Score |
|---|---|
| Impact | 5 |
| Strategic Alignment | 4 |
| Learning Value | 3 |
| Confidence | 5 |
| Effort | 2 |
| Risk | 1 |

**Priority = 5+4+3+5 − 2 − 1 = 14**

---

## Candidate 2 — Inline Band-Distribution Bar in Section Tables

**Page:** `/updates/special/[slug]`

**Problem (file evidence):**  
Both reports contain a §2 cohort table that shows Critical and Exemplary counts per index. In `floor-and-critical`, the cohort table row for `global-cities` reads: Total 250, Critical 68, Floor 7, Critical% 27.2%, Avg composite ~12.6. In `exemplars`, the Exemplary count for `robotics-labs` is 13 of 50 (26.0%).

These numbers are accurate but they require the reader to hold the denominator in working memory and perform a mental proportion calculation to understand "is 68 Critical out of 250 cities a lot?" The floor report's central thesis — that Critical band density varies enormously by type — is carried entirely by these proportion columns. The exemplars report's most striking finding (robotics-labs at 26% Exemplary vs. Fortune 500 at 1.8%) is similarly carried by text numbers.

The Graphics Backlog explicitly identifies the band-distribution bar (#6 in the backlog) as "the prime use case" for special reports specifically.

The tables are rendered via `dangerouslySetInnerHTML` from the JSON `html` field. They cannot be post-processed at render time without a structural change. However, the cohort table data is also structured in `briefing.cohortSummary` and `briefing.scope` and could be provided as a parallel structured field (e.g. `briefing.cohortTable[]`) alongside the existing `html`.

**Proposed UX change:**  
Add an optional `cohortRows` array to the special briefing data type (the JSON for each report). For the §2 cohort section specifically, when `cohortRows` is present, render the table as a React component instead of raw HTML. Each row includes a small inline bar: a 120px-wide segmented bar divided into two colored segments — the band-of-interest (Critical or Exemplary, band-colored using globals.css tokens) and the remainder (using `rgba(255,255,255,0.06)` background). The bar sits to the right of the percentage column, replacing the text percentage or augmenting it.

Example: `global-cities: 68 Critical / 250 total → bar shows 27% in #f87171 (band-red), 73% in dim background`.

The bars use `aria-label="N of Total — percentage"` and `role="img"`. No tooltip, no animation, no hover state — static SVG or CSS width-based bars using inline style width percentage.

On mobile, the bars collapse to `display: none` below 480px; the percentage column remains.

The existing `sb-table-wrap` overflow-x scroll wrapper handles tables wider than the viewport — the bar column is 120px fixed width, which does not break this.

**Why it improves the experience:**  
The floor report's central finding — "the same word, Critical, means different things across types" — is supported by the different Critical band percentages per type. A bar that visually shows 27.2% of cities are Critical versus 4.0% of robotics labs makes this comparison immediate. A reader does not need to scan and compare six numbers; they see the bar lengths differ and the detail confirms by how much. This is the canonical case for small multiples. It requires adding a structured data field alongside the existing HTML but does not require restructuring the renderer for all sections.

**Independence check:** Bar widths are computed from published entity counts. No editorial weighting. The Critical bar being tallest for countries (23.3%) and shortest for robotics-labs (4.0%) is a direct representation of the scores.

| Dimension | Score |
|---|---|
| Impact | 5 |
| Strategic Alignment | 5 |
| Learning Value | 4 |
| Confidence | 3 |
| Effort | 3 |
| Risk | 2 |

**Priority = 5+5+4+3 − 3 − 2 = 12**

---

## Candidate 3 — Structured Dimension Profile Visualization on Key Dimension Tables

**Page:** `/updates/special/[slug]`

**Problem (file evidence):**  
Both reports contain detailed dimension-vector comparison tables. The exemplars report's leader table (§2 sub) shows: Open Bionics at `4.5/4.5/4.5/4.5/4.5/4.5/4.5/4.5 spread 0.0` vs. Burlington at `4/4/4/3.5/4/4/4/4 spread 0.5`. The floor report's §5 table shows Turkey at `1.6/1.6/1.6/1.4/1.2/1.15/1.6/1.15` vs. UnitedHealth at `1.75/1.25/1.5/1.25/1.5/1.125/1.5/1.375`.

These are 8-column tables of decimal numbers. The exemplars report's central thesis — "the integration premium runs in reverse; Exemplary is achieved by flat high profiles, not by peak scores" — is invisible in the table. A reader cannot see at a glance that Open Bionics is flat and Burlington has one outlier. The floor report's cross-type comparability finding — "the numbers are the same but the profiles differ by which dimensions are weakest" — similarly requires the reader to mentally compare eight column values across two rows.

The Graphics Backlog item #2 is the "8-dimension profile bar" specifically: 8 band-colored bars (AWR…INT) for before/after delta. This is the most direct mapping to the problem in these tables.

**Proposed UX change:**  
For dimension-vector tables in the special reports, add an optional `showDimensionBars: true` flag to the JSON data. When set, the table renderer replaces the raw `/`-delimited vector string in the "Vector" column with a 160×16px inline SVG: 8 bars of equal width, each filled to a height proportional to its anchor value (1.0–5.0), colored using the band color from `globals.css` that matches the per-dimension score (e.g., values ≥ 4.0 = `#86efac` (band-green), 2.5–4.0 = `#fcd34d` (band-yellow), 1.0–2.5 = `#f87171` (band-red)). The bars are short vertical columns in a single row, not a full chart. Above each bar, the dimension code (AWR, EMP, etc.) as a 5px label, truncated.

The "Min dim" and "Spread" columns remain as text. The visualization adds a third representation of the same data — the text numbers are still present for readers who need precision.

This requires the `html` for affected tables to be replaced with a structured `rows[]` field in the JSON (same approach as Candidate 2's `cohortRows`). The visualization is `aria-hidden="true"` with the existing text columns remaining accessible.

On mobile (< 480px), the bar column is hidden; the vector string column is retained.

**Why it improves the experience:**  
The exemplars report's key finding — "Open Bionics at 0.0 spread vs. Burlington at 0.5 spread" — is directly visible in the bars: 8 equal-height bars vs. 7 equal-height bars with one shorter one. The floor report's cross-type comparison shows Turkey's profile as left-leaning (BND/ACC/INT cratered) vs. UnitedHealth's as right-leaning (ACC/EMP/EQU lower). These are the "picture worth a table of numbers" cases the briefing is structured around. The Graphics Backlog rates this item #2 and "Low-Med" effort.

**Independence check:** Bar heights are computed from published dimension anchor values. Color thresholds (band-green / band-yellow / band-red) are the same thresholds used across all band visualizations on the site. No editorial weighting of dimensions.

| Dimension | Score |
|---|---|
| Impact | 5 |
| Strategic Alignment | 5 |
| Learning Value | 5 |
| Confidence | 3 |
| Effort | 3 |
| Risk | 2 |

**Priority = 5+5+5+3 − 3 − 2 = 13**

---

## Candidate 4 — Entity Deep-Link Surface in Body Tables

**Page:** `/updates/special/[slug]`

**Problem (file evidence):**  
Both reports name specific entities in body tables. The floor report's §5 table names Turkey and UnitedHealth explicitly. The §6 table names Turkey, India, United States, China, Bolivia. The §3 per-type Critical profile table implies GEO Group (6.6), Oracle (20.6), Cigna/3M (20.3). The exemplars report names Open Bionics, Ottobock, Switzerland, Norway, Hungary explicitly in body sections, and names Target, Aflac, Hugging Face, Burlington in the leader table.

None of these entity names link to their entity profile pages (`/<index>/<slug>`). The body sections are rendered via `dangerouslySetInnerHTML` from pre-built HTML strings — links to entity profiles would need to be added during the JSON generation step or as a post-render transformation.

The daily briefing's `LegacyScoreChangesSection` and `ConfirmationsSection` both use `entityHref(index, slug)` to resolve links. The special report renderer has no equivalent.

The footer nav (lines 255–302) links to `/updates` and `/updates/special` but not to any entity pages mentioned in the report.

**Proposed UX change:**  
Two parallel changes:

1. During JSON generation for special briefings, when entity names appear in body section HTML, wrap them in `<a href="/<index>/<slug>">` using the same `entityHref()` resolution logic used in the daily briefing. This is a pipeline-side change; the renderer in `[slug]/page.tsx` already uses `dangerouslySetInnerHTML` and would render these links without modification.

2. At the bottom of the report, above the existing footer nav, add a "Key entities in this briefing" block: a flex-wrap list of entity name chips, each linking to its entity profile page. The chip list is generated from a `keyEntities: [{name, slug, index}]` array in the briefing JSON. This is a structured field added to the JSON at generation time.

Chip style: identical to the existing `TrackedEntityLink` chips used in the daily briefing.

Screen behavior: clicking a chip opens the entity page in the same tab. The footer nav remains below this block. The "Key entities" block is conditionally rendered only when `briefing.keyEntities.length > 0`.

**Why it improves the experience:**  
A reader who learns from the floor report that Turkey has entered Critical at 10.3 has no path from that finding to Turkey's entity page. The entity page shows their current score, dimension breakdown, and evidence history — the "drill deeper" destination. Adding entity links closes the most obvious navigation gap in the special reports and supports the cross-navigation goal between reports and entity pages. The "key entities" block at the end functions as a related-reading surface without competing with the editorial flow.

**Independence check:** Entity links are derived from published scores and existing entity profile pages. No entity pays for link placement. The chip list order is defined by the briefing data (chronological order of mention, or rank order) — no editorial prominence weighting. All named entities are linked regardless of their score band.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 4 |
| Learning Value | 3 |
| Confidence | 4 |
| Effort | 3 |
| Risk | 1 |

**Priority = 4+4+3+4 − 3 − 1 = 11**

---

## Candidate 5 — Reading Completion State and Cross-Report Handoff

**Page:** `/updates/special/[slug]`

**Problem (file evidence):**  
`[slug]/page.tsx` lines 255–302: the page ends with a footer nav containing two links — "All special briefings" (left-pointing) and "Latest daily briefing" (right-pointing). There is no completion signal, no summary, no recommended next action, and no cross-link between companion reports.

Both live reports are explicitly paired: the exemplars report describes itself as "the inverse companion to the Floor & Critical briefing" (see `edition` field). The floor report's conclusion (§7, missing from the live JSON — sections jump from §6 to §8) recommends the benchmark publish per-type interpretive frames. The exemplars report's §8 forward view identifies Norway re-entry as "the positive analog of a floor exit." These are natural entry points into companion content.

The daily briefing's `CompletionBlock` component (line 454) handles this for the briefing: it renders a summary, a subscribe prompt, and navigation forward. No equivalent exists for special reports.

The footer nav's "Latest daily briefing" link is undifferentiated — it always points to `/updates` regardless of whether the special report references specific daily briefing dates.

**Proposed UX change:**  
Add a completion block between the last body section and the footer nav. The block is a 3-part horizontal layout at `max-w-[860px]`:

Part 1 — "In this briefing": a restatement of `briefing.edition` and `briefing.date` with a horizontal rule above. This signals to the reader that they have reached the end of the report.

Part 2 — "Related reading": when the briefing JSON includes a `relatedSlugs: string[]` field, render companion-report chips linking to `/updates/special/<slug>`. For the floor report, this would be `["exemplars-2026-06-11"]`; for the exemplars report, `["floor-and-critical-2026-06-11"]`. Chip label = companion briefing title (truncated to 60 chars). If no related reports are present, this part does not render.

Part 3 — "What happened today": a link to the daily briefing for the matching date (`/updates/<briefing.date>` if a briefing exists for that date). This is more specific than the current "Latest daily briefing" link and gives the reader a temporal anchor: "see what was scored on the same day this was published."

The footer nav (existing two links) is removed and replaced by this completion block. The existing functionality (back to all special briefings, to daily briefing) is preserved inside the completion block.

**Why it improves the experience:**  
Currently the page ends abruptly — a "dead stop" as the brief describes it. The completion block solves three distinct problems: it signals the report is finished (reading completion); it surfaces the companion report (which exists and is thematically essential); and it connects the structural analysis to the live daily record. A reader who finishes the floor report should immediately see "Read the companion: What Good Looks Like" — these two reports are designed as a pair and the current footer gives no indication this is so.

**Independence check:** Related report links are defined in the briefing JSON by the report author at generation time, not by commercial relationship. The "What happened today" daily briefing link resolves from the briefing's own date field. No editorial promotion of specific entities or findings.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 4 |
| Learning Value | 3 |
| Confidence | 4 |
| Effort | 2 |
| Risk | 1 |

**Priority = 4+4+3+4 − 2 − 1 = 12**

---

## Candidate 6 — Special Briefings Index: Teaser Content and Scan Efficiency

**Page:** `/updates/special`

**Problem (file evidence):**  
`page.tsx` lines 140–190: the briefings list renders each entry as a card with edition badge, date, title (h2), and dek paragraph. With two briefings, the list is short. As the library grows to 8–12 reports, each card shows only the dek — a one-paragraph description. The dek for `floor-and-critical` is 74 words. The dek for `exemplars` is 70 words. Both are accurately descriptive but contain no scannable signals about what type of findings are inside (quantitative patterns, comparison tables, specific entities named).

There is no tag or category system. Both reports list `edition` in the badge — "Foundational (one-off; thereafter quarterly)" vs. "Monthly (What Good Looks Like)" — but the edition string is not structured (it is a free-text field used as a badge label), so it cannot drive filtering.

No word count or reading time estimate is shown. A reader choosing between two 16-minute reports cannot triage based on the index page.

**Proposed UX change:**  
Three targeted additions to the index card:

1. **Key findings count chip:** below the dek, render `N key findings` as a muted chip when `briefing.keyFindings.length > 0`. Both current reports have 7. This signals report depth without requiring the reader to open it.

2. **Two pull-out highlights:** below the dek, render the first two sentences of `briefing.keyFindings[0]` and `briefing.keyFindings[1]` as compact bullet points (`text-[0.82rem] text-muted-subtle` with a narrow left indent). These are the highest-value findings and give a reader a preview of the analytical tone and content type. Truncate each to 100 chars with ellipsis.

3. **Estimated read time:** compute server-side in `page.tsx` from `briefing.bodySections.reduce((acc, s) => acc + s.html.length, 0) / 1000` (rough word-count proxy, calibrated at ~200 words/min). Render as `~N min read` in the edition/date meta row. At current content density, both reports compute to ~14–16 min.

The card layout is unchanged (same rounded border, hover state, "Read briefing" footer). These additions fit within the existing card body between the dek and the "Read briefing" row.

**Why it improves the experience:**  
The index page is the entry point for readers who were not directly linked to a specific report. Without scan signals — what type of findings, how deep, how long — the reader must open each report to evaluate it. The two key-findings teasers do the work a table of contents does for a book: they signal what's inside. Read-time is the fastest possible triage signal.

**Independence check:** Content for the teasers comes from `keyFindings[]` already in the JSON — no additional editorial curation. The read-time estimate is a mechanical computation from content length, not an editorial judgment.

| Dimension | Score |
|---|---|
| Impact | 3 |
| Strategic Alignment | 3 |
| Learning Value | 3 |
| Confidence | 5 |
| Effort | 1 |
| Risk | 1 |

**Priority = 3+3+3+5 − 1 − 1 = 12**

---

## Candidate 7 — Pull-Quote / Scan Anchor for Dense Prose Sections

**Page:** `/updates/special/[slug]`

**Problem (file evidence):**  
Both reports contain sections that run 400–600 words of dense analytical prose between headings. The floor report §4 ("The corporate-no-floor gap") is 560 words with two embedded tables and an inline formula. The exemplars report §3 ("What produces Exemplary") is 480 words with three formula definitions and three verification tables.

The `sb-prose blockquote` style (page.tsx lines 379–385) is defined — `border-left: 2px solid rgba(125,211,252,0.3); padding-left: 1rem` — and could serve as a pull-quote container. But the current reports make no use of blockquotes in their HTML. The prose flow has no visual anchors between section headings and the next heading.

The daily briefing handles this through structural decomposition (each finding gets its own card). The special reports are intentionally long-form, so card decomposition is not appropriate — but visual rhythm within a dense section is.

**Proposed UX change:**  
In the JSON generation pipeline for special briefings, identify the single most quotable sentence in each dense section (400+ words) and wrap it in a `<blockquote>` in the HTML output. The selection criterion is: the sentence that most directly states the section's central finding (not the first sentence, which is typically contextual).

Examples from the current content:
- Floor §4: "The effective mathematical floor for a corporation that has not been ruled an active perpetrator is roughly 6–12, not 0. Critically, this is a side effect of the formula, not a deliberate judgment."
- Exemplars §3: "One soft dimension is the entire distance between the top of the band and its leaders. It is the exact inverse of the floor finding: the floor is reached by collapsing all dimensions at once; the top of the band is reached by letting none slip."

The `sb-prose blockquote` style already renders these with the left-accent treatment. No renderer change is needed — the existing CSS handles it. This is a content-generation discipline change, not a code change.

The rule: maximum one blockquote per body section; only for sections above 350 words; must be a verbatim sentence from the section prose (not a new sentence created for the quote).

**Why it improves the experience:**  
A reader skimming a 560-word section to decide whether to read it carefully needs a visual anchor — a sentence that represents the section's argument. The blockquote serves this role without adding a new UI element. It also makes the page more shareable: a pull-quote is the most copy-pasteable unit of analytical text. The existing CSS already handles the visual treatment correctly.

**Independence check:** Pull-quotes are verbatim sentences from the report's own prose — no new editorial characterization. The selection criterion (central finding sentence) is stated and auditable.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 3 |
| Learning Value | 2 |
| Confidence | 5 |
| Effort | 1 |
| Risk | 2 |

**Priority = 4+3+2+5 − 1 − 2 = 11**

---

## Candidate 8 — Daily Briefing: Apply Band-Distribution Bar to Header (already top-scored in UPDATES_REVIEW2; confirm as pending)

**Page:** `/updates` (daily briefing)

**Problem (file evidence):**  
Confirmed from UPDATES_REVIEW2_UX_2026-06-10 Candidate 2, scored Priority 14 — the highest score in that review. Unbuilt as of this review date. Confirmed not shipped by reading `DailyBriefingHeader.tsx` and `DailyBriefing.tsx`: there is no band-distribution visualization anywhere in the daily briefing rendering path. The trust line at the bottom of the header still reads static text.

Not re-scored here (it is the same candidate at the same score). Flagging as the top unbuilt daily-briefing item that has already cleared UX review. Engineering should treat it as Priority 1 for the `/updates` surface.

---

## Candidate 9 — Cross-Report and Cross-Surface Navigation Gap (Updates Index ↔ Special Reports ↔ Entity Pages)

**Page:** `/updates/special` (index) and `/updates` (daily briefing)

**Problem (file evidence):**  
`/updates/special/page.tsx` lines 107–129: the hero section has a single back-link to `/updates` ("Back to daily briefing"). There is no link from the daily briefing to special reports. `DailyBriefing.tsx` has no reference to `/updates/special` anywhere in its 1,793 lines. The `CompletionBlock` component (line 454) is not inspected here in full, but a Grep of `updates/special` in DailyBriefing.tsx found no matches.

The two surfaces — daily briefing and special reports — publish on overlapping themes. The floor report and exemplars report both published 2026-06-11. If a daily briefing reader that day had a path from the briefing to the special report, their engagement with both would be far higher than if discovery requires separate navigation.

**Proposed UX change:**  
Two targeted additions:

1. In `[slug]/page.tsx` footer nav (the existing two-link row, lines 255–302): add a third link `Related daily briefing: <date>` pointing to `/updates/<briefing.date>` when a briefing exists for that date. (The briefing date is already in `briefing.date`; whether a daily briefing JSON exists for that date is checkable at build time via `fs.existsSync`.)

2. In `DailyBriefing.tsx`, in the `CompletionBlock` or the purchase-CTA section (line 463), add a conditional "Special briefings" panel: when the manifest has any briefings published within the last 14 days (`manifest.briefings.filter(b => daysDiff(b.date, updates.date) <= 14)`), render a compact 1–2 card list. This surfaces newly published special reports to the daily briefing audience at the end of the read.

The special index page already links back to the daily briefing. The gap is the absence of the reverse path.

**Why it improves the experience:**  
Cross-navigation between the analytical layer (special reports) and the live record (daily briefings) is the primary way a returning reader understands both what is happening now and what the structural patterns mean. Without a link from the daily briefing to special reports, new special reports have no organic discovery path for daily briefing readers. The 14-day window ensures the panel only appears when a recent report is available — it does not permanently add a section to every daily briefing.

**Independence check:** The panel displays all recent special reports equally. No report is highlighted above others by editorial choice. The 14-day window is mechanical.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 5 |
| Learning Value | 3 |
| Confidence | 4 |
| Effort | 2 |
| Risk | 1 |

**Priority = 4+5+3+4 − 2 − 1 = 13**

---

## Priority Summary

| # | Candidate | Page | Priority | Effort | Type |
|---|-----------|------|----------|--------|------|
| 1 | Sticky In-Page Table of Contents (Section TOC) | `/updates/special/[slug]` | **14** | 2 | Improvement |
| 3 | Dimension Profile Visualization on Key Tables | `/updates/special/[slug]` | **13** | 3 | New capability |
| 9 | Cross-Surface Navigation (daily ↔ special reports) | Both | **13** | 2 | Improvement |
| 2 | Inline Band-Distribution Bar in Cohort Tables | `/updates/special/[slug]` | **12** | 3 | New capability |
| 5 | Reading Completion State and Cross-Report Handoff | `/updates/special/[slug]` | **12** | 2 | Improvement |
| 6 | Special Index: Teaser Content and Scan Efficiency | `/updates/special` | **12** | 1 | Improvement |
| 4 | Entity Deep-Link Surface in Body Tables | `/updates/special/[slug]` | **11** | 3 | Improvement |
| 7 | Pull-Quote / Scan Anchor for Dense Prose Sections | `/updates/special/[slug]` | **11** | 1 | Content discipline |
| 8 | Band-Distribution Bar in Daily Briefing Header | `/updates` | [14 per prior review] | 2 | Carry-forward |

---

## Key Assumptions Affecting Implementation

1. **TOC anchor IDs (Candidate 1):** The existing `id="section-{i}-heading"` scheme works for in-page navigation but produces IDs that are fragile if section order changes between builds. Consider adding a `sectionId` field to `bodySection` in the data type for stable anchors.

2. **Structured table data (Candidates 2 and 3):** The current cohort and dimension tables are pre-built HTML strings in the JSON. Adding `cohortRows[]` or enabling `showDimensionBars` requires either (a) generating structured parallel fields in the briefing JSON at pipeline time, or (b) parsing the HTML in the renderer at build time. Option (a) is cleaner and lower risk.

3. **Entity link resolution (Candidate 4):** `entityHref(index, slug)` requires a known index slug. Entity names in body prose are not always accompanied by index context in the current HTML (e.g., "Turkey" appears without "countries" in several table cells). The `keyEntities[]` structured field approach (option 2 in Candidate 4) sidesteps this by requiring explicit slug + index at generation time.

4. **Cross-report linking (Candidate 5):** `relatedSlugs[]` must be added to the briefing JSON and to the `SpecialBriefing` TypeScript type. This is a one-field addition.

5. **CompletionBlock integration (Candidate 9):** The `CompletionBlock` component for the daily briefing is not fully inspected here. If it already has a structured "related content" slot, Candidate 9's panel fits there. If not, it is an additive section after the existing CompletionBlock.

---

## Single Highest-Leverage Change for the Special Reports

**Candidate 1 — Sticky In-Page Table of Contents — Priority 14.**

The special reports are 14–18 minute reads with 8 body sections each. The TOC is the only change that transforms the reading experience for every user on every section of every report, requires no data model changes, and directly reuses an already-shipped and battle-tested component (`BriefingJumpNav`). The implementation cost is low because the component already exists; the anchor IDs already exist in the renderer; the data structure (a flat array of `{id, label}`) is trivially derivable from `briefing.bodySections`. No other candidate achieves this combination of impact, confidence, and effort ratio.

Candidates 3 (dimension visualization) and 9 (cross-surface navigation) are the next highest priority: 3 because the reports' central findings are carried by dimension data that is currently unreadable as numbers-only tables; and 9 because without a discovery path from the daily briefing, special reports have a structural distribution problem regardless of how good the reading experience is inside them.
