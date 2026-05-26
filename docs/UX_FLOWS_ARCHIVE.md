# UX Flows: Daily Research Archive System

**Version:** 1.0
**Date:** 2026-05-25
**Author:** UX Designer Agent
**Status:** Ready for engineering handoff
**Downstream:** frontend-engineer, qa-engineer, product-manager

---

## 0. Context and Assumptions

**Existing system state:**
- `/updates` — latest daily briefing, 5-date tab nav, DailyBriefing component
- `/updates/[date]` — 42 prerendered archive pages, archive banner, same DailyBriefing component
- `manifest.json` — reverse-chrono date list, `latest` pointer
- Daily JSON shape: `date`, `headline`, `summary`, `pipeline`, `topSignals`, `scoreChanges`
- Dark-theme-only, design tokens: `--color-bg`, `--color-panel`, `--color-accent`, `--color-text`, `--color-muted`, band colors

**Users:** policy researchers, journalists, NGO analysts, AI safety teams, gov-affairs professionals. These are professional research users, not casual browsers. They arrive with a specific entity or date in mind, or they are doing exploratory research across a time window. Speed to the right briefing is the primary UX goal.

**Key assumption A:** The archive index page is built statically at deploy time. All search and filtering are client-side (no search server). The `manifest.json` + per-date JSON metadata is sufficient for index-level display (headline, top entities, change counts). Full briefing text is not needed for the list view.

**Key assumption B:** `/entity/<slug>/history` requires a new data shape — a per-entity timeline built from the existing daily JSON files at build time (same pattern as `entityChanges.ts`). This is confirmed feasible by the existing `buildIndex()` pattern.

**Key assumption C:** "Most-significant" sort means descending `pipeline.scoreChanges` count (number of formal applies on that day), not a per-user relevance signal.

**Key assumption D:** The date-picker for `/updates/<date>` does not need a full calendar library. A `<select>` rendered from `manifest.dates` is the minimum viable implementation; a custom inline calendar using a 100-line component is the premium path. Both are spec'd below. QA should validate the select path first.

---

## 1. Archive Landing Page — `/updates/archive`

### 1.1 User goal

Find a specific past briefing (by date, by entity mentioned, by sector) and navigate into it, OR scan for patterns across the historical record.

### 1.2 Entry states

| Entry state | Source | Expected behavior |
|---|---|---|
| Direct nav or footer link | None | Page loads with no filters active, newest first |
| Linked from `/updates` "Browse archive" | None | Same as direct nav |
| Linked from `/updates/<date>` "View full archive" | None | Same as direct nav |
| Linked from entity page "Score history" | Entity slug pre-populated in entity filter | Filter pre-applied, list narrows to matching briefings |

### 1.3 Primary user flow

```
1. User arrives at /updates/archive
2. Sees page title + search box + filter bar (all defaults: no filters active)
3. Sees month-grouped list, May 2026 first, newest dates first within group
4. Hovers a row — snippet preview appears inline (expands row, no tooltip)
5. Clicks a row — navigates to /updates/<date>
```

### 1.4 Filter flow

```
1. User selects "AI Labs" from sector filter
2. List immediately re-renders (no page reload) — only dates where topSignals contains index: "ai-labs"
3. Month groups with zero matching dates collapse entirely
4. If no dates match: empty state shown
5. User clicks "Clear filters" in empty state — all filters reset, list restored
```

### 1.5 Search flow

```
1. User types in search box — see Section 3 for full interaction model
2. Live results panel overlays the list
3. User selects a result — navigates to that briefing or entity history
4. User presses Escape — panel closes, focus returns to search input
```

### 1.6 Sort flow

```
1. Default: chronological (newest first)
2. User selects "Most significant" from sort control
3. List re-renders sorted by pipeline.scoreChanges descending (within any active month filter)
4. Month groupings are removed in "most significant" sort — replaced by flat ranked list with date pill per row
5. Switching back to chronological restores month groupings
```

### 1.7 Wireframe — archive landing page

```
┌─────────────────────────────────────────────────────────────────────┐
│  COMPASSION BENCHMARK              [nav]                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ── DAILY RESEARCH ARCHIVE ──────────────────────────────────────  │
│  42 briefings  ·  Apr 15 – May 25, 2026                            │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🔍  Search briefings, entities, methodology rulings...       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  [Month ▾]  [Sector ▾]  [Entity ▾]   Sort: Chronological ▾        │
│  ─────────────────────────────────────────────────────────────     │
│                                                                     │
│  ▸ MAY 2026                              [sticky on scroll]        │
│  ─────────────────────────────────────────────────────────────     │
│  │ May 25  Slovakia −2.0 · EU Parliament urges conditionality   │  │
│  │          Turkey · Hungary · Palestine   +1 change · 9 sub    │  │
│  ├─────────────────────────────────────────────────────────────-┤  │
│  │ May 24  Turkey −2.5 · CHP headquarters seized by police      │  │
│  │          Turkey · CHP · EU                +1 change · 4 sub  │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │ May 23  Turkey −4.9 · Judicial removal of CHP leadership     │  │  
│  │          Turkey · Slovakia · Hungary      +1 change · 2 sub  │  │
│  │         ┌────────────────────────────────────────────────┐   │  │
│  │  HOVER  │ "Turkey 15.1 → 10.2: The judicial removal      │   │  │
│  │  STATE  │  of CHP's elected leadership by Turkey's       │   │  │
│  │         │  highest administrative court..."              │   │  │
│  │         │  [Read full briefing →]                        │   │  │
│  │         └────────────────────────────────────────────────┘   │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  ... (more May rows)                                         │  │
│                                                                     │
│  ▸ APRIL 2026                                                       │
│  ─────────────────────────────────────────────────────────────     │
│  │ Apr 30  Anthropic +1.5 · Constitutional AI...                │  │
│  │          Anthropic · OpenAI · DeepMind       +1 change       │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  ... (more April rows)                                       │  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.8 Row anatomy

Each row contains:
- **Date label** — "May 25" (no year, year shown in month header only)
- **Lead headline** — first sentence of `updates.headline`, truncated at 80 chars with ellipsis
- **Top entities** — up to 3 slugs from `topSignals[].slug`, rendered as accent-colored text pills
- **Change count badge** — "N changes" in band-orange if N > 0; "N sub" in muted text for sub-threshold count; omitted if both zero
- **Methodology ruling indicator** — small cyan dot if `pipeline.methodologyRulingsEstablished > 0`

Hover state expands the row in-place (not a tooltip, not a modal):
- Show first 200 chars of `updates.summary`
- Show "Read full briefing →" link
- Row background shifts from `--color-panel` to `--color-panel-2`
- Expansion is keyboard-accessible via Enter on focused row

### 1.9 Filter behavior details

**Month filter** — `<select>` listing months present in manifest. Multi-select not required in v1.

**Sector filter** — Options: All, AI Labs, Countries, Fortune 500, US States, US Cities, Global Cities, Robotics Labs. A briefing matches a sector if any `topSignals[].index` matches the sector's slug.

**Entity filter** — Text input (not a dropdown — entity count too large). User types an entity name; filter matches `topSignals[].slug` prefix match. Debounce 200ms. Shows match count inline ("3 briefings mention this entity").

**Filter combination** — AND logic. Month AND sector AND entity must all match. Active filter chips shown below filter bar. Each chip has an X to remove that filter individually.

**Active filter state display:**
```
[May 2026 ×]  [AI Labs ×]                    Clear all
─────────────────────────────────────────────────────
Showing 4 of 42 briefings
```

### 1.10 Empty state

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  No briefings match these filters.                   │
│                                                      │
│  Active filters:  [Countries ×]  [Entity: Oracle ×] │
│                                                      │
│  Oracle appears in 0 briefings in the Countries      │
│  index. Try removing the sector filter, or search    │
│  for "oracle" to find mentions across all indexes.   │
│                                                      │
│  [Reset all filters]                                 │
│                                                      │
└──────────────────────────────────────────────────────┘
```

The suggestion copy is context-aware: if entity filter is active and sector filter is also active, recommend removing sector filter first. If only entity filter produces zero results, suggest using search instead.

### 1.11 Loading state

This is a statically exported page. The full briefing list is in `manifest.json`. No loading state is needed for the list itself. If the entity filter debounce is in flight, show a spinner inside the entity filter input, not on the list.

---

## 2. Per-Entity History Page — `/entity/<slug>/history`

### 2.1 User goal

Understand the complete scoring trajectory of a specific entity: when it changed, by how much, why, and how to be notified of future changes.

### 2.2 Entry states

| Entry state | Source | Expected |
|---|---|---|
| Link from entity detail page | Entity already known | Full timeline shown |
| Link from archive briefing row (entity pill click) | Entity and date context | Full timeline, date highlighted |
| Direct URL | None | Full timeline for slug |
| Slug not found in any briefing | None | Empty state |

### 2.3 Primary user flow

```
1. User arrives at /entity/turkey/history
2. Hero loads: "Turkey · Score 10.2 · Critical band · 3 change events"
3. User sees sparkline chart of composite over time
4. User reads timeline entries, newest first
5. User clicks a timeline entry's briefing link → opens /updates/<date>
6. User sees Score-Watch CTA in sidebar → clicks → goes to /score-watch
7. User presses Back → returns to history page with scroll position preserved
```

### 2.4 Wireframe — entity history page

```
┌─────────────────────────────────────────────────────────────────────┐
│  COMPASSION BENCHMARK              [nav]                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ← Back to Turkey                                                   │
│                                                                     │
│  ┌─────────────────────────────────────────┐  ┌─────────────────┐ │
│  │ TURKEY                                  │  │ SCORE-WATCH     │ │
│  │ Score history                           │  │                 │ │
│  │                                         │  │ Get alerted     │ │
│  │ Current composite: 10.2                 │  │ when Turkey's   │ │
│  │ Band: ██ Critical                       │  │ score changes.  │ │
│  │ 3 change events recorded                │  │                 │ │
│  │                                         │  │ $79/year        │ │
│  │ [sparkline chart ─────╮                 │  │                 │ │
│  │  40 ─·─·──·╮  30     │                 │  │ [Subscribe →]   │ │
│  │  10  ──────╯  10.2   │                 │  │                 │ │
│  │  Apr 15      May 25  ─]                 │  │ Third-party     │ │
│  └─────────────────────────────────────────┘  │ observer alerts │ │
│                                               │ only. Entities  │ │
│  ── SCORE TIMELINE ──────────────────────     │ do not purchase │ │
│                                               │ their own watch.│ │
│  2026-05-24                                   └─────────────────┘ │
│  ┌──────────────────────────────────────────┐                     │
│  │ ▼ −2.5       10.2    Critical band       │                     │
│  │                                           │                     │
│  │ CHP headquarters seized by police        │                     │
│  │ following court order. Physical control  │                     │
│  │ of opposition party infrastructure...   │                     │
│  │                                           │                     │
│  │ [Read briefing: May 24, 2026 →]          │                     │
│  └──────────────────────────────────────────┘                     │
│                                                                     │
│  2026-05-23                                                        │
│  ┌──────────────────────────────────────────┐                     │
│  │ ▼ −4.9       12.7    Critical band       │                     │
│  │                                           │                     │
│  │ Judicial removal of elected CHP          │                     │
│  │ leadership. First apply: judicial...     │                     │
│  │                                           │                     │
│  │ [Read briefing: May 23, 2026 →]          │                     │
│  └──────────────────────────────────────────┘                     │
│                                                                     │
│  First baseline (no prior changes)                                 │
│  ┌──────────────────────────────────────────┐                     │
│  │ ◆ Baseline: 17.6   Critical band         │                     │
│  │                                           │                     │
│  │ Initial scoring included in index.       │                     │
│  │ No change events prior to this date.     │                     │
│  │                                           │                     │
│  │ [View entity page →]                     │                     │
│  └──────────────────────────────────────────┘                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.5 Hero block content

- Entity name (from entity data, not slug — proper capitalized name)
- "Score history" label in eyebrow treatment
- Current composite score (large tabular number)
- Current band — rendered using the Band component with correct color
- "N change events recorded" — formal score changes only, not sub-threshold
- Back link to entity detail page (`/entity/<slug>` or equivalent)

### 2.6 Sparkline chart spec

- X axis: dates present in timeline (not full date range)
- Y axis: composite score, auto-scaled to min/max with 10% padding
- Data points: one point per event including baseline
- Line: 1.5px `--color-accent` stroke
- Points: 4px circles, filled `--color-accent`
- Most recent point: 6px, filled with band color
- No axis labels — data points show values via tooltip on hover/focus
- No chart library required. SVG polyline with viewBox calculated from data. Approximately 60 lines of code.
- Width: 100% of container, height: 64px fixed

### 2.7 Timeline event anatomy

Each timeline entry (newest first):

- **Date** — full ISO date in muted eyebrow above the card
- **Delta badge** — `▼ −2.5` in `--color-band-orange` or `▲ +1.5` in `--color-band-green`; size: prominent (1.2rem)
- **New composite** — tabular number, text size 1.4rem
- **Band** — Band component pill (only shown if band changed from previous; otherwise omitted to reduce noise)
- **Headline** — first sentence of the change event's `headline` field from daily JSON
- **Methodology ruling** — if `pipeline.methodologyRulingsEstablished > 0` on that date: small cyan-bordered note reading "New methodology ruling established — [first ruling name]"
- **Briefing link** — "Read briefing: [Month DD, YYYY] →" link to `/updates/<date>`

**Baseline entry** (shown at bottom of timeline):
- Diamond icon instead of arrow
- "Baseline: [score]" label
- "Initial scoring included in index. No change events prior to this date."
- Link to entity detail page

### 2.8 Score-Watch sidebar CTA

The sidebar CTA must comply with the independence policy. Exact copy:

**Heading:** "Score-Watch: Turkey"
**Body:** "Get alerted when Turkey's score changes. Third-party observer alerts only — Turkey does not purchase this service about itself."
**Price:** "$79 / year"
**CTA button:** "Subscribe to Score-Watch"
**Link destination:** `/score-watch` (existing page, not direct Gumroad — preserves conversion context)

On mobile the sidebar moves below the sparkline, above the timeline.

### 2.9 Empty state — no change events

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  No score changes recorded for [Entity Name] yet.   │
│                                                      │
│  This entity is monitored across 1,155+ indexed     │
│  institutions. Score changes are recorded when       │
│  evidence meets the formal apply threshold.          │
│                                                      │
│  [View current score for Entity Name →]             │
│                                                      │
│  Want to be notified if this changes?               │
│  [Subscribe to Score-Watch →]                       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 2.10 Data requirements (for engineering)

A build-time function `getEntityTimeline(indexSlug, entitySlug)` is needed. It must:
- Iterate `manifest.dates` (already reverse-chrono)
- For each date, load daily JSON and scan `scoreChanges[]` for matching `index + slug`
- Return array of `{ date, delta, newScore, oldScore, bandChange, newBand, headline, methodologyRulings[] }`
- Include a synthetic baseline entry: score before the first recorded change

The pattern mirrors `buildIndex()` in `entityChanges.ts` but returns all events rather than the latest only.

---

## 3. Search Experience

### 3.1 Interaction model

Search lives on `/updates/archive` only in v1. It is not a site-wide search bar.

The search input sits at the top of the archive page, above the filter bar. It is always visible without scrolling on desktop. On mobile it is pinned below the page header.

### 3.2 Trigger and debounce

- Search activates after 2 characters typed (not on first character — prevents noisy results for "a", "t" etc.)
- Debounce: 150ms after last keystroke
- While debounce is pending: no change to results. No spinner. No indication of pending state (too distracting at 150ms)
- When results are ready: live results panel appears below the input

### 3.3 Search scope

Client-side. The search corpus is built from the archive index data loaded into memory on page mount:
- `date` — match "2026-05-23", "may 23", "may 2026"
- `headline` — full text substring match (case-insensitive)
- `topSignals[].slug` — match entity slugs (e.g. "turkey", "slovakia")
- `topSignals[].title` — match entity display names
- `pipeline.methodologyRulingsEstablished` > 0 dates are tagged as "methodology ruling" and matchable by typing "methodology" or "ruling"

The search corpus does NOT include full `summary` or `scoreChanges[].description` text. Those fields are in individual daily JSON files which are not all loaded at archive page mount. This keeps the archive page bundle small. If "full-text search" is added later, it requires a separate indexed build artifact.

### 3.4 Live results panel

Appears below the input, overlays the list (position: absolute, z-index above list). Width matches input width. Max height: 400px with internal scroll.

**Result groupings — shown in this order:**

1. **Briefings by date** — matched briefings, showing date + headline snippet (max 5 shown, "+N more" if overflow)
2. **Entities** — entities whose slug or display name matched, showing entity name + index label + "N briefings mention this entity" (max 5)
3. **Methodology rulings** — if "ruling" or "methodology" in query, list dates with methodology rulings established

Each result group has a small muted header: "BRIEFINGS", "ENTITIES", "METHODOLOGY RULINGS"

**Panel anatomy:**
```
┌──────────────────────────────────────────────────────┐
│ turkey                                             ✕ │
├──────────────────────────────────────────────────────┤
│ BRIEFINGS                                            │
│ > May 25 — Slovakia −2.0 · EU Parliament urges…     │  ← highlighted (active)
│   May 24 — Turkey −2.5 · CHP headquarters…          │
│   May 23 — Turkey −4.9 · Judicial removal of…       │
│   +19 more briefings mention Turkey                  │
├──────────────────────────────────────────────────────┤
│ ENTITIES                                             │
│   Turkey · Countries · 21 briefings                 │
│   Turkey (Robotics) · not found                     │
└──────────────────────────────────────────────────────┘
```

### 3.5 Keyboard navigation

- `↓` — move focus into panel, first result highlighted
- `↑` / `↓` — move between results; wrap at boundaries
- `Enter` — navigate to highlighted result
- `Escape` — close panel, return focus to input
- `Tab` — close panel (focus moves to next focusable element in page)

When a result is highlighted (keyboard or hover): background `--color-panel-2`, left border 2px `--color-accent`.

### 3.6 No-results state

```
┌──────────────────────────────────────────────────────┐
│ xyzcorp432                                         ✕ │
├──────────────────────────────────────────────────────┤
│  No results for "xyzcorp432"                         │
│                                                      │
│  Suggestions:                                        │
│  · Try an entity name (e.g. "Turkey", "Anthropic")  │
│  · Try a date (e.g. "May 15", "2026-04-22")         │
│  · Try a sector (e.g. "AI labs", "countries")        │
└──────────────────────────────────────────────────────┘
```

### 3.7 Search interaction — failure states

| Failure | Behavior |
|---|---|
| Network offline | Search corpus is already in memory (client-side). No failure mode. |
| Query too short (1 char) | No results panel shown. No error shown. Input is plain. |
| All 42 briefings match (empty query cleared by typing space) | Panel closes (query is 1 char). |
| Entity slug has no briefing mentions | "Entities" group shows entity name + "0 briefings mention this entity." Not an error — informational. |

---

## 4. Navigation Integration

### 4.1 Primary navigation

The archive link lives under the `/updates` section of the nav. Implementation: add "Browse archive →" as a secondary link below the "Updates" primary nav item in the dropdown or sub-nav. Do not add a top-level nav item — the archive is a secondary surface.

In `site/src/data/nav.ts`, the recommended entry:
```
{ label: "Browse archive", href: "/updates/archive" }
```
under the existing Updates nav item.

### 4.2 From `/updates` (latest briefing page)

Below the 5-date tab navigation, add a secondary link:

```
[May 25]  [May 24]  [May 23]  [May 22]  [May 21]     Browse all 42 →
```

The "Browse all N →" text is right-aligned on desktop, below the tab row on mobile. N is derived from `manifest.dates.length` at build time.

### 4.3 From `/updates/<date>` (archive briefing pages)

The existing archive banner already links back to `/updates`. Add a second link to the banner:

**Current:** `← Back to latest`
**Add:** `Browse all briefings →` linking to `/updates/archive`

The banner then has two actions, separated by a muted `·` divider on desktop, stacked on mobile.

### 4.4 From entity pages to `/entity/<slug>/history`

On entity detail pages, add a "Score history" link. Placement: in the score metadata area, below the current composite display, before the Score-Watch CTA. Render only if the entity has at least one recorded change event (determined at build time by `getEntityTimeline()`). If no history exists, do not show the link.

Link label: "View score history →"

### 4.5 Date picker on `/updates/<date>`

**Purpose:** Jump to any briefing date without going through the archive.

**Implementation (no library required):**

Option A — Minimal (`<select>`, recommended for v1):
```html
<select aria-label="Jump to date">
  <option>May 25</option>
  <option>May 24</option>
  ...
</select>
```
Renders from `manifest.dates` at build time. On change, router.push to `/updates/<date>`. Styled to match existing tab buttons (dark background, accent border on focus). Approximately 15 lines of code.

Option B — Custom inline calendar (~100 lines):
- A single-month calendar grid in a `<details>`/`<summary>` disclosure (no external positioning)
- Summary shows current date: "May 25, 2026 ▾"
- Calendar renders the current month's grid
- Only dates present in `manifest.dates` are interactive; others are rendered as muted non-links
- Month navigation: `<` `>` buttons that swap the rendered month
- Selecting a date navigates to `/updates/<date>` and closes the disclosure
- Keyboard: Tab to open, arrow keys to move within grid, Enter to select, Escape to close

Option A is recommended for v1. Option B is the upgrade path when the archive grows beyond 6 months.

The date picker (either option) renders inside the existing DailyBriefingHeader date nav area. It replaces the current 5-date tab bar, or sits alongside it as "Jump to date" at the right edge.

---

## 5. Mobile Considerations

### 5.1 Archive landing — `/updates/archive`

- Month headers: sticky at top (with `position: sticky; top: 56px` — below the main nav which is fixed)
- Month groups: collapsible accordion on screens below 768px. Default: all months collapsed except the most recent. Collapse indicator: `▸` / `▾` chevron.
- Each collapsed month group shows: "Month YYYY — N briefings" in the header
- Row layout on mobile: stack date above headline (no horizontal truncation). Top entities on second line. Change count on third line.
- Search box: position `sticky; top: 56px` on mobile, so it stays reachable while scrolling the list
- Filter bar: horizontally scrollable on mobile (no wrapping). Each filter is a compact pill/select.

**Mobile row (320px min-width):**
```
May 25
Slovakia −2.0 · EU Parliament urges conditionality mechanism
Turkey  Hungary  Palestine   +1 change
─────────────────────────────────────────
```

- Hover state becomes tap-to-expand on mobile (tap the row, it expands in-place; tap again or tap elsewhere to collapse)
- "Browse all →" on date nav area: full-width button on mobile, below tab row

### 5.2 Entity history — `/entity/<slug>/history`

- Sidebar moves below sparkline, above timeline (single column layout on mobile)
- Sparkline full-width, 56px height on mobile (reduced from 64px)
- Timeline cards: full-width, no horizontal constraints
- Score-Watch CTA: compact horizontal layout on mobile (icon + text + button in one row)

### 5.3 Search panel on mobile

- Panel takes full width of screen below the search input
- Max height: 60vh with scroll
- Keyboard does not appear automatically on mobile when panel opens — user has already triggered keyboard by typing

---

## 6. Accessibility

### 6.1 Archive list

- Month group headers: `<h2>` with `id` attribute for potential anchor linking
- Collapsible groups (mobile): use `<details>`/`<summary>` — native keyboard and screen reader support, no JS required
- Each briefing row: `<a>` wrapping the row, `aria-label` = "[Date] — [headline]"
- Hover-expand content: also reachable by keyboard. When row has focus, `Enter` triggers expand. Expanded content has `role="region"` and is included in tab order only when expanded.

### 6.2 Search

- Input: `role="combobox"`, `aria-expanded="true/false"`, `aria-controls="search-results-panel"`, `aria-autocomplete="list"`
- Results panel: `role="listbox"`, `id="search-results-panel"`, `aria-label="Search results"`
- Each result: `role="option"`, `aria-selected="true/false"` for the highlighted item
- Live region: `role="status"` (or `aria-live="polite"`) outside the panel, updates with "N results for [query]" when results render. Screen reader users hear result count without focus being moved.
- "No results" message: announced via same `role="status"` live region
- Clear button (✕): `aria-label="Clear search"`, visible at all times when input has a value

### 6.3 Date picker (Option B custom calendar)

- `<details>`/`<summary>`: keyboard accessible natively
- Calendar grid: `role="grid"`, each date cell `role="gridcell"`
- Unavailable dates: `aria-disabled="true"`, `tabindex="-1"`, visually muted
- Available dates: `tabindex="0"` when focused, `aria-label="[Full date label]"` (e.g. "May 15, 2026 — briefing available")
- Month navigation buttons: `aria-label="Previous month"` / `"Next month"`
- On date select: focus moves to the briefing page after navigation. No further focus management needed.

### 6.4 Entity timeline

- Timeline container: `role="feed"` (chronological stream of cards)
- Each card: `role="article"`, `aria-label="[Date]: score changed [delta] to [new score]"`
- Delta direction: use text — "decrease of 2.5 points" — not relying solely on ▼ arrow character
- Score-Watch sidebar: `aria-label="Subscribe to Score-Watch alerts for [entity name]"`
- Sparkline: `role="img"`, `aria-label="Composite score over time for [entity name]: from [first score] on [first date] to [current score] on [current date]"`

### 6.5 Focus management — filters

- When a filter changes and the list re-renders, focus stays on the filter control that was just changed (do not move focus to the list)
- When all filters are cleared via "Reset all filters", focus moves to the search input
- When "Reset all filters" is in the empty state, it should be the first and only focusable element in that state region, ensuring keyboard users can reach it without tabbing through an empty list

---

## 7. Edge Cases and QA Scenarios

### 7.1 Archive landing

| Scenario | Expected behavior |
|---|---|
| Only 1 briefing exists | Month group shows 1 row, no "Browse all N" link (redundant) |
| Month with only 1 briefing | Month group shows, accordion still works, no visual issue |
| Briefing with 0 score changes | "No changes" shown in change count area; row still appears |
| Briefing JSON missing `topSignals` | Row renders with empty entity pills area; no JS error |
| Entity filter value matches no entities | Show empty state with suggestion copy |
| Sector filter active + entity filter active with no overlap | Show empty state, context-aware copy mentions both filters |
| "Most significant" sort with all briefings having 0 changes | Sort is stable (original date order preserved) |
| manifest.dates contains future dates (shouldn't happen, but) | Rows appear at top of list; no crash |

### 7.2 Entity history

| Scenario | Expected behavior |
|---|---|
| Entity has 0 change events | Empty state shown; no timeline rendered; Score-Watch CTA still shown |
| Entity has 1 change event | Timeline shows 1 card + baseline card (2 total items) |
| Entity has events spanning 2 months | All events shown, no month grouping on this page (flat timeline) |
| Band changed in an event | Band pill shown on that event card |
| Band did not change in an event | Band pill omitted from that event card |
| `getEntityTimeline` returns null | Falls back to empty state, not a crash |
| Slug in URL is valid entity but has no history JSON | Empty state shown |

### 7.3 Search

| Scenario | Expected behavior |
|---|---|
| Query is 1 character | Panel does not open |
| Query is 2 characters, no matches | Panel opens, shows no-results state |
| Query exactly matches a date string "2026-05-23" | Briefings group shows that date's briefing as first result |
| Query matches 42 briefings (e.g. "2026") | Panel shows first 5 with "+37 more" — does not crash from large result set |
| User types very fast (faster than debounce) | Only final query used, intermediate queries discarded |
| User clears input while panel is open | Panel closes |

---

## 8. Content Guidance

### 8.1 Labels

| Surface | Label | Notes |
|---|---|---|
| Archive page title | "Daily Research Archive" | Not "History" — users are researchers, not casual readers |
| Archive page subtitle | "N briefings · [earliest date] – [latest date]" | Computed at build time from manifest |
| Score-Watch CTA heading | "Score-Watch: [Entity Name]" | Entity name in heading — makes clear this is entity-specific |
| Score-Watch independence note | "Third-party observer alerts only — [Entity] does not purchase this service about itself." | Required by independence policy; plain language, not legalese |
| Timeline empty state | "No score changes recorded for [Entity] yet." | "Yet" matters — implies monitoring is ongoing |
| Search placeholder | "Search briefings, entities, methodology rulings..." | Three concrete examples of what can be searched |
| Archive row methodology dot | `title="Methodology ruling established"` on the dot | Tooltip text for sighted mouse users; screen readers get aria-label on the row |

### 8.2 Date format conventions

- In archive list rows: "May 25" (short, no year — year shown in month group header)
- In briefing links within timeline: "May 25, 2026" (full — standalone context)
- In search results: "May 25" (short)
- In entity timeline date markers: "2026-05-25" in muted eyebrow (ISO format — unambiguous for researchers)
- In sparkline tooltip: "May 25, 2026: 10.2"

---

## 9. Flows Summary for Engineering Handoff

### New routes required

| Route | Type | New component |
|---|---|---|
| `/updates/archive` | Static page | `ArchiveIndex` (new) |
| `/entity/<slug>/history` | Static page, generated per entity | `EntityHistory` (new) |

### New data functions required

| Function | Location | Description |
|---|---|---|
| `getArchiveIndex()` | `site/src/data/updates/archiveIndex.ts` | Returns array of `{date, headline, topEntities, changeCounts, hasMethodologyRuling}` for all dates in manifest — computed once at build time |
| `getEntityTimeline(indexSlug, entitySlug)` | `site/src/data/updates/entityTimeline.ts` | Returns ordered array of all score change events for a given entity across all daily JSONs |

### New components required

| Component | Complexity | Notes |
|---|---|---|
| `ArchiveIndex` | Medium | Filter state, sort state, search state — all client-side React hooks |
| `ArchiveRow` | Low | Row + expand behavior |
| `ArchiveFilters` | Low | Three filters + sort + active chip display |
| `ArchiveSearch` | Medium | Combobox with keyboard nav, live results panel |
| `EntityHistory` | Medium | Hero + sparkline + timeline |
| `EntitySparkline` | Low | ~60 lines SVG, no dependency |
| `EntityTimelineCard` | Low | Single event card |
| `DatePickerSelect` | Low | `<select>` from manifest.dates, ~15 lines |
| `DatePickerCalendar` | Medium | ~100 lines custom calendar (v2) |

### Existing components reused unchanged

`Container`, `Panel`, `Pill`, `Band`, `Button`, `SectionHead`, `Eyebrow`, `Callout` — all existing UI primitives apply directly. No new design tokens required.
