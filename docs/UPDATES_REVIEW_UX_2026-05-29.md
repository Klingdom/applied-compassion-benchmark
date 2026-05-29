# UX Review: /updates Daily Briefing Reading Experience
**Date:** 2026-05-29
**Scope:** /updates, /updates/[date], /updates/archive — all reading flows
**Lens:** 5-second value, scanability, ritual, mobile, in-page wayfinding, archive navigation, accessibility, typographic rhythm, score and evidence communication

---

## Baseline Observation

The briefing is architecturally correct: 17 sections cascade from most-editorial (lead signal, opening question, brutal insight) through data-dense (score movement dashboard, evidence ledger) to administrative (math hygiene, hold records). Component isolation is clean. The archive is filterable and accessible.

The problem is **not content quality** — it is that a dense 17-section page with no in-page map, no progressive disclosure on the heavier sections, and no above-fold orientation signal asks a returning reader to rediscover the briefing every day. The reading ritual is not reinforced by the interface. Specific issues follow.

---

## Candidate Improvements

---

### 1. Persistent In-Page Table of Contents (Jump Nav)

**Type:** Fix

**Problem:**
`DailyBriefing.tsx` assembles up to 17 rendered sections in a single vertical scroll. Sections carry `id` attributes (`#lead-signal`, `#signals`, `#score-movements`, `#boundary-watch`, `#evidence-ledger`, `#floor-designations`, etc.) but there is no user-facing navigation to them. The only navigation surface is the 5-date tab row in `DailyBriefingHeader.tsx`, which moves between dates, not between sections within the current briefing. A reader on mobile who wants to jump directly to score movements must scroll past the header, opening question, lead signal card, brutal insight, compassion contrast, today's analysis, and signal stack — roughly 6 full sections — before reaching the `#score-movements` anchor.

**Proposed UX Change:**
Add a sticky jump nav bar that appears below the 5-date tabs and above the `#lead-signal` section. It should contain 5–7 named anchors as horizontal scrollable chips: "Lead signal", "Signals", "Score movements", "Boundary watch", "Evidence", and "Archive". On desktop it sits in a single row; on mobile it scrolls horizontally without wrapping. The active section is highlighted using `IntersectionObserver` on the existing section `id` anchors. On scroll, the bar sticks below the site navbar (accounting for the ~74px offset already used by `pt-[72px]` in the header section). The "Archive" chip links to `/updates/archive`. The bar is `aria-label="In-page briefing navigation"` and each chip is an anchor tag, not a button, so it is indexable and works without JS. When JS loads, the active state is added as a visual enhancement only.

**Why it improves the daily experience:**
A returning reader knows they want score movements or boundary watch. Today they must scroll past every earlier section. The jump nav provides a scannable table of contents, reducing time-to-value for the 3–4 sections a repeat reader actually reads each day. It also makes the briefing feel structured rather than monolithic — analogous to the section anchors on Axios AM or the BBC's long-form news format.

**Independence-policy check:** Navigation UI only. No content alteration. No entity sorting or prominence change. Clean.

| Dimension | Score |
|-----------|-------|
| Impact | 4 |
| Strategic Alignment | 4 |
| Learning Value | 2 |
| Confidence | 5 |
| Effort | 3 |
| Risk | 1 |
| **Priority Score** | **11** |

---

### 2. Collapsible "Confirmation Firehose" — Progressive Disclosure on Dense Technical Sections

**Type:** Fix

**Problem:**
The lower half of `DailyBriefing.tsx` renders several sections that are important for audit integrity but are low daily-reading priority for most readers: the `ConfirmationsSection` (a full table, up to 20+ rows in the 2026-05-29 data), `MathHygienePanel`, `CarryForwardCreditsPanel`, `HoldsPanel`, and `ForwardSignalsList`. These sections are rendered unconditionally in full. The confirmations table in particular (line 666–820 in `DailyBriefing.tsx`) has 8 columns and can contain many rows. On mobile this creates a horizontal scroll region that breaks reading flow. A reader who has finished the editorial content (sections 1–10) faces what amounts to a data audit appendix before they reach the `SubscribeCTA` and the research purchase callout.

**Proposed UX Change:**
Wrap the bottom four audit-tier sections — confirmations, math hygiene, carry-forward credits, and holds — in a single collapsible disclosure group. Default state: collapsed, showing a single-line summary ("23 confirmations, 2 hold records, 1 math hygiene flag — expand to review audit trail"). The expand trigger is a full-width button labeled "Show audit trail" with a chevron. When expanded, all four sections render as they do today. The collapse/expand state is not persisted — it resets on each page load, so the default is always collapsed. This preserves full transparency (content is in the DOM, indexable, accessible) while decluttering the daily reading path.

The `LegacyScoreChangesSection` (full evidence cards at section 8 in `DailyBriefing.tsx`, `id="score-changes-detail"`) is a separate but related case: it duplicates information that is also present in `ScoreMovementDashboard`. Consider collapsing it behind a "Full evidence record (N changes)" toggle so the dashboard is the default view and the detail cards are opt-in.

**Why it improves the daily experience:**
The confirmations table and math hygiene panel are correct and important, but they are appendix content for most readers. By collapsing them, the daily editorial arc completes naturally: editorial insight → signals → score movements → boundary watch → evidence ledger → subscribe. Audit-minded readers can expand. This matches how Bloomberg Terminal and Economist Espresso handle supporting data: reachable but not in the critical path.

**Independence-policy check:** No content is hidden from indexing (DOM present when collapsed using `hidden` attribute or `display: none` with `aria-expanded`). Pagefind indexes `data-pagefind-body` regardless of visibility. Confirmation data remains fully accessible. No change to scores or editorial hierarchy. Clean.

| Dimension | Score |
|-----------|-------|
| Impact | 4 |
| Strategic Alignment | 3 |
| Learning Value | 2 |
| Confidence | 5 |
| Effort | 2 |
| Risk | 1 |
| **Priority Score** | **11** |

---

### 3. Above-Fold "5-Second Card" — Today's Three Numbers

**Type:** Improvement

**Problem:**
`DailyBriefingHeader.tsx` opens with a KPI grid showing four statistics: "Entities monitored", "Fully assessed", "Score changes", "Risk signals". These are pipeline statistics, not editorial signals. "Entities monitored: 0" appears in the 2026-05-29.json data (`"entitiesScanned": 0`) — the `entitiesScanned` field is zero, so the KPI reads "0" until the pipeline populates it. More broadly, these four numbers answer "what did the pipeline do?" rather than "what happened today that matters?". A reader who lands on the page and sees "Score changes: 3 / Risk signals: 2" has very little orientation. The thesis line underneath the `<h1>` (line 115–117 in `DailyBriefingHeader.tsx`) is truncated to the first sentence of `updates.headline`, which often begins mid-context ("Floor confirmation at 0.0. METHODOLOGY RULING...") and reads as internal notation rather than a reader-facing hook.

**Proposed UX Change:**
Replace the four KPI cards with three editorial cards that answer reader intent directly:

- **Most significant change today** — entity name + delta + one-line context (sourced from `scoreChanges[0]` or `topSignals[0]`). If no score changed, show "No score changes — N confirmations held".
- **Sector in focus** — the lead sector from `sectorAlerts[0]` or the index of the lead signal.
- **Boundary watch** — count of entities on boundary watch + the top entity name. If zero, show "No boundary flags today".

Each card is a text-primary layout (no large numerals divorced from meaning). The section title "Daily Briefing" remains the `<h1>`. The thesis line is rewritten to use `updates.editorialInsight` if present, falling back to `topSignals[0].description` first sentence — not `scoreChanges[0].headline` which is written for internal audit format.

The pipeline stats ("N entities assessed") can move to a small muted line below the KPI grid, formatted as "Assessed N entities this cycle" — still present for transparency but not the primary above-fold signal.

**Why it improves the daily experience:**
A reader arriving at 8am wants to know: who moved, what sector is live, and is anything about to cross a band. The current KPI grid makes them work to derive this from four abstract counts. The proposed layout hands them those three answers in the first 5 seconds. This matches the Morning Brew "what you need to know" above-fold pattern and the Bloomberg opening summary approach.

**Independence-policy check:** The three editorial cards are sourced from scored data following the normal methodology. No entity is promoted by payment. The "most significant change" is derived from `delta` magnitude, the same signal already used by `ScoreMovementDashboard` for sort order. Clean.

| Dimension | Score |
|-----------|-------|
| Impact | 5 |
| Strategic Alignment | 5 |
| Learning Value | 3 |
| Confidence | 4 |
| Effort | 3 |
| Risk | 2 |
| **Priority Score** | **12** |

---

### 4. Persistent Date Navigation with "Streak" Indicator

**Type:** Improvement

**Problem:**
The date navigation in `DailyBriefingHeader.tsx` (lines 66–95) shows 5 date tabs. The tabs show formatted short dates like "May 29", "May 28", etc. On mobile at narrow widths the tabs wrap into two rows due to `flex-wrap`. There is no indication of which date is "today" versus "yesterday" in semantic terms — only a blue active chip for the currently viewed date. On archive pages (`/updates/[date]/page.tsx`), the archive banner (lines 93–126) duplicates navigation: it adds "Back to latest" and "Browse all briefings" links, but the date tabs from `DailyBriefingHeader` are also present, creating three navigation surfaces for the same intent.

Additionally, from the /updates main page, there is no affordance indicating whether a new briefing has been published since the user last visited. The "Browse all N briefings" link in the top bar is right-aligned in a thin strip (line 39–53 in `updates/page.tsx`) and visually disconnected from the date tabs that appear inside `DailyBriefingHeader`.

**Proposed UX Change:**
Three changes to the date navigation system:

1. **Unified nav strip:** Merge the archive discovery link (currently in a separate border-b strip in `updates/page.tsx`, line 39–53) into the date tabs row inside `DailyBriefingHeader`. Place the "View all briefings" link as the rightmost item in the tab row, visually separated by a `|` divider. This removes one navigation layer.

2. **Semantic date labels:** The current tab for today's date shows "May 29" (from `formatDateLabel`). Add "Today" as the label for the most recent date, "Yesterday" for the second-most-recent, and formatted short dates for the rest. This is already derivable from `manifest.latest` and the date index — no new data required. Today's tab should always be labeled "Today" regardless of which date is currently viewed.

3. **On the archive `/updates/[date]` page:** Remove the duplicate archive banner (lines 93–126 in `[date]/page.tsx`) for dates within the visible 5-tab window. The banner is only needed when the viewed date is older than the 5-tab window — i.e., when the date does not appear in `dateNav`. For dates in the tab window, the active tab state provides sufficient context.

**Why it improves the daily experience:**
"Today" and "Yesterday" are the two most-used tabs. Labeling them semantically reduces the cognitive step of parsing a date. Removing duplicate navigation on archive pages reduces visual noise. Unifying the archive discovery link into the tab row makes it feel like part of the navigation system rather than an editorial afterthought.

**Independence-policy check:** Navigation UI only. No score or content changes. Clean.

| Dimension | Score |
|-----------|-------|
| Impact | 3 |
| Strategic Alignment | 3 |
| Learning Value | 2 |
| Confidence | 5 |
| Effort | 2 |
| Risk | 1 |
| **Priority Score** | **10** |

---

### 5. Score Movement Card — Expandable Evidence Preview

**Type:** Improvement

**Problem:**
`ScoreMovementCard.tsx` renders each assessed entity as a compact single-row card showing: index label, entity name, optional `whyHeadline`, score movement, band, confidence, boundary pill, and optional evidence URL icon. When a score change entry has a full `evidence` array (as most entries in 2026-05-29.json do — UnitedHealth has 7 evidence items, Turkey has 6), none of this evidence is visible in the dashboard card. To see the evidence, the reader must navigate away to the `LegacyScoreChangesSection` below (which renders the full evidence record as a large card), or click through to the entity profile page.

This creates a disconnected experience: the dashboard shows the movement but not the reason; the reason is buried further down the page in a separate section that uses a different card format. The `LegacyScoreChangesSection` (lines 336–664 in `DailyBriefing.tsx`) and `ScoreMovementDashboard` therefore contain redundant representations of the same data in different formats, causing the page to be longer without adding clarity.

**Proposed UX Change:**
Add an expand toggle to `ScoreMovementCard` that reveals, inline below the main row, a compact evidence preview when the entity has a `headline` or `evidence` array. The expanded state shows:
- The `headline` string (one-line text, styled as it is in `LegacyScoreChangesSection`)
- Up to 3 evidence items (plain text for string evidence, domain link for rich evidence with `url`)
- A "Full record" link to the entity's profile page

The toggle is a chevron button on the right of the card, replacing the currently empty right side for non-boundary entries. Default state: collapsed. Keyboard: Enter/Space toggles, Escape collapses.

With this in place, the `LegacyScoreChangesSection` can be moved below the fold (or removed from the critical reading path) because its content is now accessible inline in the dashboard. It would still render for audit completeness but would be wrapped in the collapsible audit trail proposed in Improvement 2.

**Why it improves the daily experience:**
The score movement dashboard is the section where a returning reader wants to understand what changed and why. Currently it tells you a score moved but not why. The inline expand gives the reason without navigating away, keeping reading flow within the dashboard. This matches the Axios "one paragraph + read more" pattern: the datum and the evidence in one card.

**Independence-policy check:** Evidence content is sourced from the briefing data directly. No editorial transformation. Expansion is reader-driven. Clean.

| Dimension | Score |
|-----------|-------|
| Impact | 4 |
| Strategic Alignment | 4 |
| Learning Value | 3 |
| Confidence | 4 |
| Effort | 3 |
| Risk | 2 |
| **Priority Score** | **10** |

---

### 6. Archive: Pagefind Full-Text Search Upgrade + "No results for [entity]" Resolution Path

**Type:** Improvement

**Problem:**
`ArchiveList.tsx` (lines 526–642) offers two search surfaces: `ArchiveSearch` (Pagefind full-text, above the filter bar) and a client-side entity text filter (within the filter bar, line 381). These two inputs are visually adjacent but conceptually different — one searches briefing text, the other filters by entity name in the `topEntities` array. A user who types "UnitedHealth" into the entity filter will only get results when "unitedhealth-group" appears in the `topEntities` list of a given briefing entry. If UnitedHealth appears in evidence text but not as a top entity, the filter returns nothing.

The `EmptyState` component (lines 486–521) provides a contextual suggestion: `"${activeEntity}" appears in 0 briefings. Try a different entity name or check your spelling.` However, it does not redirect the user to the Pagefind search box even when Pagefind would likely find the entity. The two search surfaces work independently and there is no resolution path from one to the other.

Additionally, the archive page header (lines 100–116 in `archive/page.tsx`) shows a coverage date range as plain text ("42 briefings · Apr 16 – May 29") without an interactive affordance. A reader who wants to jump to a specific month has to use the month filter dropdown, which is below the fold.

**Proposed UX Change:**
Three archive UX changes:

1. **Empty state resolution path:** When the entity filter returns zero results, add a secondary action button: "Search full text for '[term]'" that scrolls to and focuses the Pagefind search input and pre-populates it with the entity term. This links the two search surfaces and provides a next step when the filter fails.

2. **Single search surface promotion:** Add a label above the Pagefind search box: "Search all briefing text" and above the entity filter: "Filter by top entity" — distinguishing the two modes. The current layout places them in the same visual zone with no label distinction.

3. **Month jump links in archive header:** Add clickable month chips below the briefing count line in the archive page header. Clicking a month chip sets `activeMonth` state (requires lifting state or a ref callback) and scrolls to that month group. This gives direct access to month sections without scrolling to the filter bar.

**Why it improves the daily experience:**
The archive is the compounding-value part of the product — readers who return regularly need to find past coverage of specific entities. The current entity filter has a false-negative problem that sends readers to a dead end. The resolution path converts the empty state from a stopping point into a continuation.

**Independence-policy check:** Search relevance in Pagefind is based on text occurrence, not entity payment. Filter behavior is unchanged. Clean.

| Dimension | Score |
|-----------|-------|
| Impact | 3 |
| Strategic Alignment | 3 |
| Learning Value | 3 |
| Confidence | 4 |
| Effort | 3 |
| Risk | 1 |
| **Priority Score** | **9** |

---

### 7. Mobile Typographic Rhythm — Section Header Scale and Density

**Type:** Fix

**Problem:**
Section headings in the briefing body use inconsistent font-size approaches across components. `DailyBriefingHeader.tsx` uses `text-[clamp(2.4rem,5.5vw,4.4rem)]` for the `<h1>`. `LeadSignalCard.tsx` uses `text-[1.3rem] sm:text-[1.55rem]` for its `<h2>`. `SignalStack.tsx` uses `text-[1.25rem]` with no responsive qualifier. `TodaysAnalysisSection.tsx` uses `SectionHead` which has its own size. `BoundaryWatch.tsx` uses `text-[1.1rem] sm:text-[1.22rem]`.

On mobile (width <640px), the briefing produces a heading-size staircase that is not intentional: the H1 clamp resolves to roughly 2.4rem, the LeadSignalCard H2 to 1.3rem, then most body section H2s to 1.25rem with no responsive scaling. The gap between the hero H1 and all subsequent section heads is visually abrupt. The section label convention (`text-[0.68rem] font-bold uppercase tracking-[0.18em]`) is used as a visual H3 in `LeadSignalCard`, `BrutalInsightCard`, `HighCompassionContrast`, and `ScoreMovementCard` — the same eyebrow-cap style appears 20+ times per briefing, reducing its distinctiveness as a wayfinding cue.

Additionally, `py-[30px]` is the near-universal section vertical padding used across 10+ sections. On mobile this creates a continuous undifferentiated scroll with no visual breaks between sections of different importance.

**Proposed UX Change:**
Three typographic rhythm changes:

1. **Section head sizing:** Standardize section H2 headings at `text-[1.1rem] sm:text-[1.3rem]` for secondary sections (signal stack, score movements, evidence ledger) and `text-[1.3rem] sm:text-[1.55rem]` for primary editorial sections (lead signal card, opening question, today's analysis). This creates a two-level hierarchy rather than the current near-uniform 1.25rem level.

2. **Section padding differentiation:** Use `py-[40px]` for primary editorial sections (lead signal, opening question) and `py-[24px]` for data/secondary sections (evidence ledger, confirmations, math hygiene). The current `py-[30px]` universal padding gives equal visual weight to a section containing a 1,500-word editorial card and one containing a 3-row table.

3. **Eyebrow cap reduction:** The `text-[0.68–0.78rem] font-bold uppercase tracking-[0.18em]` label style is used as section sub-labels, card sub-labels, and metadata labels interchangeably. Reserve this style for card-level sub-labels only. For section-level orientation text, use `text-muted text-[0.85rem]` without uppercase — matching the description text style already used in `SectionHead`. This reduces visual noise and makes the uppercase caps meaningful when they do appear.

**Why it improves the daily experience:**
Dense intelligence content requires clear typographic rhythm to be readable at pace. When every section has the same heading size, padding, and label style, the reader must parse the content of each section to understand its position in the briefing hierarchy. Differentiated scale communicates importance before the reader reads the section name.

**Independence-policy check:** Visual and typographic only. No scoring or content changes. Clean.

| Dimension | Score |
|-----------|-------|
| Impact | 3 |
| Strategic Alignment | 3 |
| Learning Value | 2 |
| Confidence | 4 |
| Effort | 3 |
| Risk | 2 |
| **Priority Score** | **7** |

---

## Priority Summary

| # | Title | Priority Score | Type |
|---|-------|---------------|------|
| 3 | Above-Fold "5-Second Card" | **12** | Improvement |
| 1 | Persistent In-Page Jump Nav | **11** | Fix |
| 2 | Collapsible Audit Trail | **11** | Fix |
| 4 | Semantic Date Nav + Unified Strip | **10** | Improvement |
| 5 | Score Movement Expandable Evidence | **10** | Improvement |
| 6 | Archive Search Resolution Path | **9** | Improvement |
| 7 | Mobile Typographic Rhythm | **7** | Fix |

---

## Implementation Sequencing Recommendation

**Phase 1 (immediate, highest effort/return):** Improvements 3 and 2 together. The above-fold 5-second card (3) fixes the first impression for every new and returning reader. The collapsible audit trail (2) shortens the critical reading path by removing the confirmation firehose from the daily scroll. These two changes make the most visible difference to the daily ritual.

**Phase 2 (next sprint):** Improvements 1 and 5 together. The jump nav (1) and expandable evidence in score movement cards (5) serve the same user moment — a reader who knows what they want and wants to get to it quickly without leaving the briefing.

**Phase 3 (polish):** Improvements 4 and 7. Date nav semantics and typographic rhythm are lower-risk, lower-dependency changes that improve the daily experience without structural component work.

**Phase 4 (archive-focused):** Improvement 6. The archive resolution path requires a small interaction design addition to `ArchiveList.tsx` and is lower urgency than the main briefing reading flow.

---

## Assumptions That Affect Implementation

- Improvement 1 (jump nav) assumes IntersectionObserver is available; the static fallback (active state not applied) must be tested.
- Improvement 2 (collapsible audit trail) assumes Pagefind indexes DOM-present hidden content; if Pagefind skips `display:none` elements, use `visibility:hidden` + `height:0` instead, or confirm indexing behavior.
- Improvement 3 (5-second card) requires `topSignals[0]` and `sectorAlerts[0]` to be reliably present in the nightly digest; a defensive fallback for empty arrays must be specified.
- Improvement 5 (expandable score card) requires `evidence` to be present on the `recentAssessments` entries passed to `ScoreMovementDashboard`, not only on `scoreChanges`. The 2026-05-29 data shows `evidence` on `scoreChanges` entries but the `recentAssessments` field does not appear in the excerpt read; confirm whether the merge in `ScoreMovementDashboard.tsx` lines 41–63 copies `evidence` arrays through.
- Improvement 6 (archive search) requires state-sharing or a ref callback between `ArchiveSearch` (Pagefind, separate component at `components/search/ArchiveSearch`) and `ArchiveList`; the current architecture separates them.
