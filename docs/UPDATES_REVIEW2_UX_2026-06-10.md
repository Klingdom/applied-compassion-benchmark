# UPDATES_REVIEW2_UX — Daily Briefing Next-Level Candidates
**Review date:** 2026-06-10  
**Scope:** /updates daily briefing and /updates/archive — next tier of UX improvements  
**Baseline confirmed shipped (not re-proposed):** Wave A + Wave B (StatOfTheDay, TodayInBrief, BriefingJumpNav, ReadingProgress, CompletionBlock, collapsible audit trail, synthesis-before-raw section order, honest subscribe cadence)

---

## How this review was grounded

The following files were read in full:

- `site/src/components/updates/DailyBriefing.tsx` (1,746 lines — full section ordering, all section guards)
- All 21 components in `site/src/components/updates/briefing/` — ScoreMovementDashboard, ScoreMovementCard, BoundaryWatch, EvidenceLedger, OpeningQuestion, LeadSignalCard, StatOfTheDay, TodayInBrief, BriefingJumpNav, CompletionBlock, ReadingProgress, DailyBriefingHeader, and the remainder
- `site/src/components/updates/ArchiveList.tsx` — full archive list, filter bar, month grouping
- `site/src/app/updates/[date]/page.tsx` — date page, dateNav tabs, Pagefind integration
- `site/src/app/updates/archive/page.tsx` — archive page shell
- `site/src/data/updates/daily/2026-06-10.json` — representative live briefing (confirmed zero-change day: 20 entities assessed, 0 score changes, 4 floor confirmations, 3 boundary watch entities, cycleType "floor-reinforcement-and-confirmation-cycle")

The 2026-06-10 briefing is analytically significant as a **quiet-score day**: `scoreChanges: 0`, `bandCrossingsProposed: 0`, yet it contains materially important information (floor reinforcements on Myanmar/Russia/Israel/Sudan, Oracle WARN Act five-day countdown, Uganda Ebola Kampala escalation). This day type is a primary test case for several of the candidates below.

---

## Candidate 1 — Inline Score Sparkline on ScoreMovementCard

**Type:** Improvement

**Problem (file evidence):**  
`ScoreMovementCard.tsx` (lines 57–284) shows a single horizontal row of: entity name, whyHeadline (optional), published score → assessed score (numbers), delta, dominantDimension chip, Band pill, confidence label, distanceToBoundary pill. Everything is numbers and text. There is no visual representation of *trajectory* — whether today's score is part of a sustained decline, a recent bounce, or a long-plateau.  

The `distanceToBoundary` field (P1, only shown when `pointsAway < 3.0`) is the only proximity signal, and it is a text pill: "0.6 above Critical". On a quiet day like 2026-06-10, all 20 cards show delta=0, so the visual field collapses: arrow renders "—" in grey (#94a3b8), and the published/assessed numbers are identical. The row communicates no urgency for boundary cases like Oracle (20.6, 0.6 pts from Critical) or Uganda (20.3, 0.3 pts from Critical) despite the cycle labeling them as the most consequential entities that day.  

Per-entity history exists at `/<index>/<slug>/history` but there is no link or visual summary back into the briefing.

**Proposed UX change:**  
Add a 24×14px inline sparkline SVG at the right edge of each ScoreMovementCard, rendered from the last N score values available in the entity's history data. The sparkline uses two horizontal band-threshold lines (drawn as faint dashed strokes at the appropriate y-positions) so boundary proximity is immediately visible as a distance from a line rather than a number. The chart area uses no axes, no labels, no tooltip — it is a pure shape element.

Behavior:
- When history data is unavailable or N < 3 points, the sparkline is not rendered (graceful omission, not a broken gap).
- The final dot on the sparkline is colored using the existing `deltaColor()` function, consistent with the delta chip color.
- For entities at absolute floor (score=0), the sparkline collapses to a flat red line at the bottom of the chart area — a visually distinct "nothing moves here" signal.
- The sparkline is `aria-hidden="true"` with no interaction; the existing numeric score row remains the accessible representation.
- Under `prefers-reduced-motion`, the line is rendered as a static SVG path (no animation is used in any case, so this is already satisfied by the static export architecture).

Screen: the `distanceToBoundary` text pill and the sparkline coexist — the pill provides the precise number, the sparkline provides the pattern context. On mobile (<640px), the sparkline container collapses to display:none to protect the existing flex layout integrity on small viewports.

**Why it improves the daily experience:**  
On a quiet-score day — the most common day type — the ScoreMovementDashboard reads as a flat table of grey arrows. The sparkline makes the *reason* a boundary case matters immediately legible: a two-week descent toward a threshold communicates differently from a stable plateau that happens to be near a line. It also creates the first visual connection from the briefing to the entity history pages, supporting the "drill deeper" user goal without adding a navigation step.

**Independence-policy check:**  
The sparkline renders from published scores only — no editorial weighting, no paid inclusion path. Entities at floor (perpetrators) render a flat red line, which accurately represents their record. No display manipulation is possible.

**Scores:**
- Impact: 4 (directly addresses the primary UX gap — visual flatness on zero-change days)
- Strategic Alignment: 4 (reinforces benchmark-as-living-record positioning; connects briefing to history pages)
- Learning Value: 3 (high on zero-change days; lower on busy-change days where delta chips carry the load)
- Confidence: 3 (requires history data to be accessible at render time; shape of history API is not confirmed in this review)
- Effort: 3 (SVG sparkline logic is contained; main cost is wiring history data into the SSR render path)
- Risk: 2 (history data missing for some entities is the main risk; mitigated by graceful omission)

**Priority = 4+4+3+3−3−2 = 9**

---

## Candidate 2 — Band Distribution Bar in the Briefing Header (Stat of the Day upgrade path)

**Type:** Improvement

**Problem (file evidence):**  
`StatOfTheDay.tsx` and `DailyBriefingHeader.tsx` (lines 136–162) render a 2-column grid: StatOfTheDay on the left (one hero number + copy-citation), TodayInBrief on the right (3 bullets). The StatOfTheDay number is a single entity's value or a derived aggregate. On the 2026-06-10 briefing, the stat will be derived from the 20 assessed entities but shows one number in isolation with no distribution context.

There is no anywhere-in-the-briefing visualization of *how the 1,160 indexed entities distribute across the five bands*. A reader cannot answer at a glance: "Is the index getting worse on average? Are entities moving into Critical or out of it?" The above-the-fold block thus answers "what's the most notable thing today" but not "what does the state of the benchmark look like right now."

`DailyBriefingHeader.tsx` has a `trust line` at the bottom: "1,160 entities reviewed across 7 indexes." This number exists but does nothing visually with the distribution.

**Proposed UX change:**  
Replace the static trust line below the header 2-column grid with a segmented horizontal bar showing band distribution across all indexed entities. The bar is 100% width of the Container, divided into five color-coded segments (one per band, using existing band colors from the Band component). Each segment's width is proportional to the number of entities in that band.

Above the bar: a single row of five count+label chips (e.g., "Critical 47 | Developing 312 | Functional 406 | Established 189 | Exemplary 26"). Below the bar: the existing trust-line text, unchanged.

Behavior:
- The bar renders entirely from the static entity data already loaded at build time (no new data source needed).
- Each segment is a button (keyboard-navigable) with an aria-label of "N entities in Band band. Click to explore." that links to `/<index>?band=<band>` or `/indexes` when clicked — a future filter hook, not a required behavior for V1 of this feature.
- On quiet days, the distribution bar gives the briefing visceral context: "Of 1,160 entities, 47 are at Critical. Today confirmed 4 of them." This answers a question that the current UX cannot answer at all above the fold.
- Under `prefers-reduced-motion`: the bar is static. A potential future animation (fill from left) is excluded from scope here.

**Why it improves the daily experience:**  
Every daily reader currently must hold the macro picture in their head from prior visits or the index pages. The distribution bar makes the benchmark's *current state* legible in under 3 seconds, and it contextualizes quiet days: "20 entities assessed, 0 changed, but the Critical band still holds 47 entities" is a meaningful daily signal even when no scores moved.

**Independence-policy check:**  
Pure data-derived visualization from published scores. No entity pays to appear in any band. The Critical band's visual prominence increases with the number of Critical entities, not with editorial choice — that is the correct direction. No manipulation path.

**Scores:**
- Impact: 4 (solves the "what is the benchmark's current state" above-the-fold gap; directly improves quiet-day utility)
- Strategic Alignment: 5 (reinforces benchmark-as-institution framing; makes the macro picture legible to new and returning visitors alike)
- Learning Value: 3 (moderately novel; returns a stable signal unless the band distribution changes)
- Confidence: 5 (all data is already in the static build; no new API or data source needed)
- Effort: 2 (band counts can be computed from existing entity data at build time; bar rendering is 30–40 lines of Tailwind/SVG)
- Risk: 1 (fully static; no interactivity required for V1)

**Priority = 4+5+3+5−2−1 = 14**

---

## Candidate 3 — "Since Your Last Visit" Delta Surface on the Daily Briefing Entry

**Type:** Experiment

**Problem (file evidence):**  
The date navigation tabs in `DailyBriefingHeader.tsx` (lines 68–97) show up to 5 recent dates as pill links. They indicate recency but not change. A returning reader who last read the briefing 3 days ago sees "Jun 9 | Jun 8 | Jun 7 | Jun 6" but has no indication of which of those days contained score changes, boundary crossings, or methodology rulings versus quiet confirmation-only days.

`ArchiveList.tsx` (ArchiveRow, lines 59–227) does show `entry.scoreChanges` and entity chips on the archive page, but that requires navigating away from the briefing. The date tabs in the briefing itself carry no such signal.

The `ArchiveEntry` type already carries `scoreChanges`, `subThresholdMovements`, `hasMethodologyRuling`, and `topEntities` — these are exactly the right signals. They are not surfaced in the date nav tabs.

**Proposed UX change:**  
Augment each non-current date tab in `DailyBriefingHeader` with a minimal signal indicator:

- If the date had 1+ score changes: show a small amber dot (matching the existing "+N changes" color from ArchiveRow, #fb923c) to the right of the date label.
- If the date had a methodology ruling: show a small blue dot (#7dd3fc, matching the existing ArchiveRow indicator).
- If the date had 0 changes and no methodology ruling: no dot; the tab renders as today — unadorned.

The dots use `aria-label` text: "2 score changes" / "Methodology ruling established" / combined if both. They are `role="status"` spans inside the tab.

The `dateNav` array already passes `{ date, label, isCurrent }` from `[date]/page.tsx` (line 98). This would need to be extended with `scoreChanges: number` and `hasMethodologyRuling: boolean`, derivable from `getArchiveIndex()` which is already called on the archive page.

**Why it improves the daily experience:**  
The daily ritual problem is: a returning reader wants to know "what did I miss." Today this requires navigating to the archive, scanning, and returning. With signal dots on the date tabs, a reader can see at a glance which of the past 4 dates warrant reading before today's briefing. This is the smallest possible implementation of "what changed since your last visit" without requiring client-side persistence (cookies/localStorage) or server state.

**Independence-policy check:**  
The signal dots reflect factual counts (score changes, methodology rulings) from the published data. No editorial curation of which days appear important — the data determines it. No entity-level prominence manipulation.

**Scores:**
- Impact: 3 (improves returning-reader flow significantly; new reader flow is unchanged)
- Strategic Alignment: 4 (directly supports daily ritual / habit loop)
- Learning Value: 4 (validates whether readers engage with historical date tabs when they carry information)
- Confidence: 3 (data is available; the `dateNav` prop extension is a small but real engineering change)
- Effort: 2 (low: archive index is already computed at build time; the prop extension is 2–3 fields)
- Risk: 1 (static data; no client state; gracefully degrades to current behavior if data unavailable)

**Priority = 3+4+4+3−2−1 = 11**

---

## Candidate 4 — Boundary Proximity Bar on BoundaryWatch Cards

**Type:** Improvement

**Problem (file evidence):**  
`BoundaryWatch.tsx` (lines 39–185) renders boundary-watch entities as cards with: entity name, composite score (large number, #7dd3fc), "N.N pt to threshold" text (line 127), directional arrow, trigger text, status badge.

The "N.N pt to threshold" is the critical number for a boundary card, but it is rendered as small muted text (`text-[0.72rem] text-muted tabular-nums`) below the composite score — the least visually prominent position on the card. It carries the same visual weight as a footnote despite being the defining fact of why the entity appears in this section at all.

On the 2026-06-10 briefing, Oracle at 20.6 (0.6 pts from Critical) and Uganda at 20.3 (0.3 pts from Critical) are the two most proximate cases. But no visual indicates Oracle is twice as far from the boundary as Uganda, or that both are measurably closer than Cigna at 20.3.

**Proposed UX change:**  
Add a horizontal proximity bar at the bottom of each BoundaryWatch card, inside the existing card border. The bar spans the full card width and represents the distance from the entity's current score to the nearest band boundary, normalized across a 0–5 pt scale (covering the typical proximity range of concern).

- The filled portion represents the distance remaining (more fill = more buffer = safer). The unfilled portion represents "how close to the line."
- The bar uses three fill color zones: 0–1.0 pt: red fill (#f87171); 1.0–2.5 pts: amber fill (#fcd34d); 2.5–5.0 pts: muted fill (#94a3b8).
- Above the bar, a label: "N.N pts to [Band] threshold" (moved here from the numeric label, now rendered at `text-[0.82rem]` instead of `text-[0.72rem]`, and in `text-text` instead of `text-muted`).
- The bar is `aria-hidden="true"`; the label text is the accessible representation.

On mobile, the bar collapses to full width of the card (same as desktop). No animation.

**Why it improves the daily experience:**  
The proximity bar makes the *relative urgency* of boundary cases immediately legible. Oracle at 0.6 pts and Uganda at 0.3 pts are both "0-point-something away" in text, but the bar makes clear that Uganda is materially closer to crossing than Oracle. This matters for a reader deciding how much time to spend on each card. The June 15 Oracle trigger is reinforced visually: the red fill communicates urgency that the text alone underdelivers.

**Independence-policy check:**  
The bar is a direct visualization of the published `boundaryDistance` field. No editorial amplification. Entities with larger distance get more fill, communicating less urgency — that is the correct directional signal. No entity can improve their bar position except by improving their actual score.

**Scores:**
- Impact: 4 (directly addresses the primary information gap in the highest-urgency section of the briefing)
- Strategic Alignment: 3 (secondary alignment: reinforces rigor of the scoring methodology; less directly tied to growth or ritual)
- Learning Value: 2 (low novelty; straightforward visualization of existing data)
- Confidence: 4 (all data is present: `boundaryDistance` is in the BoundaryWatch data shape; bar is pure CSS/SVG)
- Effort: 1 (single card component change; no data plumbing needed)
- Risk: 1 (fully contained; no breakage surface)

**Priority = 4+3+2+4−1−1 = 11**

---

## Candidate 5 — Archive Timeline View with Score-Activity Heatmap

**Type:** Experiment

**Problem (file evidence):**  
`ArchiveList.tsx` (lines 526–642) renders two views: chronological (month-grouped rows) and most-significant (flat ranked list). Both are text-list views. The archive page header (`archive/page.tsx`, line 100) says "Daily Research Archive" and describes "42 days of evidence-linked institutional findings" — a temporal collection — but the interface offers no temporal visualization.

A reader cannot answer: "Has activity been increasing or decreasing?" "Were there weeks with no score changes?" "When did the last band crossing happen?" The month-group headers give calendar structure, but within a month, each row carries the same visual weight whether it has 5 score changes or 0.

The existing `ArchiveEntry` type already carries `scoreChanges`, `subThresholdMovements`, `hasMethodologyRuling`, `topEntities`, and `date`. This is exactly the data needed for a heatmap.

**Proposed UX change:**  
Add a "Timeline" view toggle alongside the existing "Chronological / Most significant" sort control. In Timeline view, the month-grouped list is replaced by a compact heatmap: a grid of day cells (7 columns × N rows, one row per week in the archive date range). Each cell:

- Is colored by activity level: empty/quiet (no changes) = very dark background (#0b1220, near invisible); sub-threshold only = muted blue (#1e3a5f); confirmed score changes (1+) = amber (#7c4f00); band crossings = red (#7c1a1a). These map to the existing `deltaColor` and status colors.
- Shows a tooltip (or expanded label on keyboard focus) with the date, headline truncated to 60 chars, and score-change count.
- Is a link to `/updates/[date]` on click.
- Renders days outside the archive range (past or future) as empty cells with no link.

Below the heatmap, the existing month-grouped or ranked list continues, allowing both the overview and the row-level detail to coexist.

On mobile, the heatmap renders as a single-column list of week rows (7 days across, scrollable horizontally if needed).

**Why it improves the daily experience:**  
The archive is a **primary return-visit surface** — readers who missed a day come here. The heatmap makes weeks-level patterns legible at a glance: "there were two weeks with multiple band crossings in May, then a quiet period." This communicates the benchmark as an active, event-driven record rather than a static report catalog. It also makes "quiet weeks" visible as quiet — an honest representation that reinforces institutional credibility. The ritual value is high: a reader can see their own reading history (the last date they visited) relative to the activity pattern.

**Independence-policy check:**  
The heatmap colors activity purely from published data counts. No editorial curation of which days appear prominent. Quiet days appear visually quiet — that is honest. No entity is named or advantaged in the visualization.

**Scores:**
- Impact: 3 (high for archive-visiting power users; moderate for casual readers who rarely visit the archive)
- Strategic Alignment: 4 (benchmark-as-living-record positioning; differentiates the archive from a simple list of articles)
- Learning Value: 5 (high experiment value: tests whether readers engage with the temporal overview vs. jumping straight to filtering)
- Confidence: 3 (data is available; cell-grid layout has some mobile complexity; tooltip behavior needs careful accessible design)
- Effort: 4 (grid layout, tooltip behavior, color-scale logic, mobile adaptation — more than a contained card change)
- Risk: 2 (medium: heatmap must degrade gracefully when the archive has <14 days of data; partial week rows need edge handling)

**Priority = 3+4+5+3−4−2 = 9**

---

## Candidate 6 — "Quiet Day" Contextual Banner for Zero-Change Briefings

**Type:** Improvement

**Problem (file evidence):**  
`DailyBriefingHeader.tsx` (lines 136–162) renders a 2-column grid (StatOfTheDay + TodayInBrief) preceded by a one-sentence thesis from `updates.headline`. On 2026-06-10, `scoreChanges: 0`, `bandCrossingsProposed: 0` — but the page renders identically to a day with 5 score changes. The reader must parse the full briefing to understand the day's type.

`ScoreMovementDashboard.tsx` (lines 82–100) does detect this case and shows "All entities assessed this cycle. No score changes." as a description. But this is below the fold, deep in the detail section. It is not surfaced above the fold where reading decisions are made.

The StatOfTheDay placeholder on zero-score-change days (DailyBriefingHeader line 143) renders: "No scored movement today" in a box. This is the right message but is visually identical to the populated stat box and reads as a gap rather than a meaningful signal.

The 2026-06-10 briefing's `pipeline.cycleType = "floor-reinforcement-and-confirmation-cycle"` — a rich, typed description of what the cycle produced. This field is not rendered anywhere in the current UI.

**Proposed UX change:**  
When `pipeline.scoreChanges === 0` and `pipeline.bandCrossingsProposed === 0`, render a contextual banner directly below the date nav tabs and above the H1, replacing the empty StatOfTheDay placeholder. The banner:

- Headline: Derived from `pipeline.cycleType` — map cycle types to human labels: "floor-reinforcement-and-confirmation-cycle" → "Floor reinforcement + confirmation cycle"; "methodology-ruling-cycle" → "Methodology ruling cycle"; fallback to "Confirmation cycle."
- Body: One sentence from the briefing's `summary` that names the primary activity. Use the first sentence that contains a number (entities, confirmations, floor cases).
- Visual: A horizontal band across the full Container width, using a subtle amber-tinted background (matching the existing BoundaryWatch section's border tint) with the cycle-type label in small caps.
- The existing "No scored movement today" placeholder in StatOfTheDay is replaced by a count display: "N entities confirmed · M boundary cases · P floor confirmations" in the StatOfTheDay area, drawn from pipeline fields.

This banner renders only on true no-movement days. On days with score changes, the existing header renders unchanged.

**Why it improves the daily experience:**  
The current no-movement day reads as a failure state — "No scored movement today" in a grey box implies nothing happened. The 2026-06-10 briefing contains substantively important information (four floor-reinforcement confirmations, Oracle's 5-day countdown, Uganda Kampala escalation). The banner reframes the day's value correctly: "This is a confirmation cycle, and here is what was confirmed." It makes quiet days compelling without fabricating activity.

**Independence-policy check:**  
The banner derives entirely from pipeline metadata and the briefing summary — no editorial curation of which entities to highlight. The cycle type label is a methodology term, not a promotional claim. The count display in the StatOfTheDay area uses factual pipeline counts.

**Scores:**
- Impact: 4 (quiet days are the most common day type by frequency; the current experience is weak on these days)
- Strategic Alignment: 4 (directly supports the "benchmark as rigorous process, not just a leaderboard" positioning)
- Learning Value: 3 (moderate: confirms whether readers engage more on quiet days when framed correctly)
- Confidence: 4 (all data is in `pipeline.*` and `summary`; the cycle-type mapping is a small lookup table)
- Effort: 2 (banner component is a contained addition; the `cycleType` field already exists in the data)
- Risk: 1 (purely additive; no existing component modified)

**Priority = 4+4+3+4−2−1 = 12**

---

## Candidate 7 — Mobile Score-Movement Row Tap-to-Expand

**Type:** Improvement

**Problem (file evidence):**  
`ScoreMovementCard.tsx` (lines 128–284) renders a flex row with up to 6 distinct information zones: index label, entity name + whyHeadline, score numbers, delta chip, dominantDimension chip, Band pill, confidence label, distanceToBoundary pill, primaryEvidenceUrl link, and nextForwardSignal italic. On desktop (sm:flex-row), these wrap into a single horizontal row. On mobile, the flex-col layout stacks them vertically — but all zones always render, producing cards that are 80–120px tall on mobile for an entity with all enrichment fields present.

A typical briefing has 20 assessed entities (as in 2026-06-10). 20 cards × ~100px = 2,000px of stacked content in this single section, all always-visible, on a mobile viewport. The reader has no way to differentiate "I want to scan this list for names/bands" from "I want to read the full evidence for this entity."

`ArchiveRow` in `ArchiveList.tsx` (lines 59–227) already implements tap-to-expand with a well-considered keyboard interaction pattern (Enter to expand, Escape to collapse, focus management). The same pattern is absent from ScoreMovementCard.

**Proposed UX change:**  
On mobile viewports (<640px), render ScoreMovementCard in a collapsed state:

Collapsed state (always visible):
- Index label + entity name (full)
- Score numbers + delta (the core fact)
- Band pill

Hidden in collapsed state on mobile:
- whyHeadline
- dominantDimension chip
- distanceToBoundary pill
- confidence label
- primaryEvidenceUrl button
- nextForwardSignal

A chevron button at the right edge toggles expansion. Keyboard: Enter/Space to expand, Escape to collapse. ARIA: `aria-expanded`, `aria-controls` matching the hidden region id.

On desktop (sm: breakpoint), the card renders exactly as today — all zones visible, no toggle.

Collapsed height on mobile: approximately 44–48px per card. 20 cards = 880–960px total for the section — a 50% reduction in the expected mobile scroll depth for this section.

**Why it improves the daily experience:**  
Mobile reading of the score-movement section is currently a long-scroll through a uniform wall of cards. The tap-to-expand pattern respects the reader's attention: scanning 20 entity names and scores is a fast task (~10 seconds); reading 20 full evidence rows is a slow task (~5 minutes). Separating these by a single interaction makes the slow path opt-in. The `ArchiveRow` precedent confirms this pattern is already design-system-consistent in this codebase.

**Independence-policy check:**  
No editorial selection of which entities are expanded by default. All entities start collapsed on mobile; the reader selects which to expand. No entity receives prominence treatment in this interaction pattern.

**Scores:**
- Impact: 3 (meaningful mobile ergonomics improvement; desktop experience unchanged)
- Strategic Alignment: 2 (operational quality improvement; not a strategic differentiator)
- Learning Value: 2 (low novelty; pattern is already implemented in ArchiveRow)
- Confidence: 5 (pattern is fully established in the codebase; ArchiveRow is the direct template)
- Effort: 2 (converting ScoreMovementCard to a client component with collapse state; reuse of ArchiveRow interaction logic)
- Risk: 1 (desktop unchanged; mobile progressive enhancement; graceful degradation if JS absent = all expanded)

**Priority = 3+2+2+5−2−1 = 9**

---

## Priority Summary

| # | Candidate | Priority Score | Type |
|---|-----------|---------------|------|
| 2 | Band Distribution Bar in Header | **14** | Improvement |
| 6 | Quiet Day Contextual Banner | **12** | Improvement |
| 3 | Since Your Last Visit Date Tab Signals | **11** | Experiment |
| 4 | Boundary Proximity Bar on BoundaryWatch Cards | **11** | Improvement |
| 1 | Inline Score Sparkline on ScoreMovementCard | **9** | Improvement |
| 5 | Archive Timeline Heatmap | **9** | Experiment |
| 7 | Mobile Score-Movement Tap-to-Expand | **9** | Improvement |

---

## Top 3 Candidates with Rationale

**1. Band Distribution Bar in Header (Priority 14)**  
Every briefing currently answers "what happened today" but never "what is the state of the benchmark right now." The distribution bar adds this in one static build-time visualization using data already loaded, at near-zero effort and risk.

**2. Quiet Day Contextual Banner (Priority 12)**  
The most common day type (zero score changes, as on 2026-06-10) renders identically to a busy day except for one muted description line deep in the detail section. The banner reframes quiet days as confirmation cycles — a real and important work product — without fabricating urgency. `pipeline.cycleType` already carries the right data.

**3. Since Your Last Visit Date Tab Signals (Priority 11)**  
The daily return ritual is currently blind: the five date tabs in the header tell you *when* but not *what happened*. Adding signal dots (amber for score changes, blue for methodology rulings) to the non-current tabs answers the returning reader's primary question — "did I miss anything?" — at the point of entry and with no persistence or server state required.

---

## Key Assumptions Affecting Implementation

1. **Sparkline history access (Candidate 1):** The per-entity score history is confirmed to exist at `/<index>/<slug>/history` as a page route, but it is not confirmed that the history data is accessible as structured data at the `DailyBriefing` SSR render time. If history JSON is not included in the static build, sparklines require a separate data pipeline step and the effort score increases to 4.

2. **Band distribution data (Candidate 2):** Assumed that `getAllEntities()` (already called in `FloorDesignationsPanel` in DailyBriefing.tsx, line 1192) provides the full entity set with current scores and bands. If band is not a top-level field on entity records, a lookup into the index JSON is needed.

3. **Archive index data at briefing render (Candidate 3):** `getArchiveIndex()` is called on `archive/page.tsx` but not on `[date]/page.tsx`. Extending the `dateNav` prop requires calling `getArchiveIndex()` in the date page, which is already a static build function (no server cost).

4. **`cycleType` field stability (Candidate 6):** `pipeline.cycleType` is present in 2026-06-10.json but is treated as a new field. If older briefings lack it, the banner silently omits on those dates — this is the correct fallback.
