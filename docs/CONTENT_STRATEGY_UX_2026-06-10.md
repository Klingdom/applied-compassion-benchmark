# CONTENT_STRATEGY_UX_2026-06-10
## UX Review: Content Format, Information Density, and Screen-Level Layout

**Scope:** /updates (DailyBriefing), Homepage, Index pages (fortune-500), Entity detail, Methodology  
**Lens:** Space efficiency, above-the-fold real-estate, typographic scale, vertical rhythm, scan pattern  
**Date:** 2026-06-10  
**Author:** UX Designer Agent

---

## Scoring rubric

Each candidate is scored 1–5 on six axes.  
**Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk**

---

## Candidate 1: Stat of the Day — Collapse the Hero Number into an Inline Strip

**Page(s):** `/updates/[date]` — `DailyBriefingHeader.tsx` + `StatOfTheDay.tsx`

### Problem (file evidence + space cost)
`StatOfTheDay.tsx` uses `text-[clamp(2rem,5vw,3rem)]` for the hero number, rendering at 48px on desktop. The wrapping card has `p-5 sm:p-6` (20–24px all sides), a label row with `mb-2`, the number itself, a flex label row with `mb-4`, and a copy-citation button. This produces a card approximately 140–160px tall occupying one half of a 2-column grid.

`DailyBriefingHeader.tsx` stacks before this: 72px top padding, a date nav row (`mb-8`), a masthead row (`mb-5`), an H1 at `clamp(2.4rem,5.5vw,4.4rem)` with `mb-4`, a thesis paragraph with `mb-6`, and a 4-button CTA cluster with `mb-8`. The Stat-of-the-Day card then appears as the fifth visual block below the fold on most laptop viewports.

The hero number itself — a single stat like "47" or "0" — carries little meaning as a 48px isolated figure. The label below it (e.g., "entities with score changes this cycle") provides the meaning. The format inflates the container to communicate a number that would scan equally well at 28px bold inline.

**Space cost:** The card occupies ~160px of a post-fold vertical slot that could instead show 4–6 signal rows.

### Proposed UX change
Replace the two-card 2-column grid (StatOfTheDay + TodayInBrief) with a single **horizontal stat bar** placed immediately after the thesis line and before the CTA cluster. Layout:

```
[Stat of the Day label]  [47]  [entities with score changes — Entity Name →]  [Copy citation]
```

Concrete spec:
- Wrapper: full-width `flex items-center gap-4 flex-wrap`, `border-b border-line pb-3 mb-5`
- Eyebrow: `text-[0.68rem] uppercase tracking-[0.18em] text-[#7dd3fc] shrink-0`
- Number: `text-[1.6rem] font-bold tabular-nums leading-none shrink-0` (down from clamp 2–3rem)
- Label + entity link: `text-[0.9rem] text-muted flex-1` — entity as accent-colored link
- Copy button: `text-[0.72rem] text-muted border border-line rounded px-2 py-1 shrink-0`

This collapses the two 140px cards (combined ~300px including grid gap) to a single 44px strip. The TodayInBrief bullets move below the CTA cluster, becoming the first substantive section users read after choosing to engage.

### Why it improves density/scannability
- Above-the-fold now contains: masthead meta, H1, thesis, stat strip, CTAs, and the first Today-in-Brief bullet — vs. currently only masthead + H1 + thesis + CTAs (with both editorial cards below the fold).
- The stat number gains meaning from its inline context rather than from scale.
- Copy-citation remains accessible and keyboard reachable in the same row.

### Independence check
No change to data, scoring, or methodology display. The citation mechanism is preserved. No entity ranking information is omitted.

| Axis | Score |
|------|-------|
| Impact | 5 |
| Strategic Alignment | 4 |
| Learning Value | 3 |
| Confidence | 4 |
| Effort | 2 |
| Risk | 1 |
| **Priority** | **13** |

---

## Candidate 2: DailyBriefingHeader — Cut H1 Size and Compress the CTA Cluster

**Page(s):** `/updates/[date]` — `DailyBriefingHeader.tsx`

### Problem (file evidence + space cost)
The H1 renders at `clamp(2.4rem,5.5vw,4.4rem)` — 70px on a 1280px viewport. "Daily Briefing" is a repeated page title that every return visitor already knows. It occupies approximately 80–90px of vertical space.

The CTA cluster below it renders 4 buttons in a `flex flex-wrap` row (`mb-8` = 32px bottom margin). On mobile these wrap to multiple rows, consuming 100–120px. Three of the four buttons ("Subscribe", "View methodology", "Explore indexes") are low-urgency secondary actions that are already reachable from the global nav.

Combined: H1 + thesis paragraph + 4-button CTA + mb-8 accounts for roughly 280–320px before any content appears.

### Proposed UX change
1. H1: `text-[clamp(1.6rem,3vw,2.4rem)]` — legible title, not a magazine cover. Reduce `mb-4` to `mb-2`.
2. Collapse 4 CTAs to 2 visible buttons: "Read today's brief" (primary, `href="#lead-signal"`) and "Subscribe" (secondary). Move "View methodology" and "Explore indexes" to a text-link row below: `text-[0.78rem] text-muted` with `·` separators. This saves approximately 44px of button row height on desktop and 60px+ on mobile where buttons wrap.
3. Reduce `mb-8` after CTA cluster to `mb-5`.

Combined saving: approximately 120–150px above the editorial content block.

### Why it improves density/scannability
Users arrive on `/updates` to read the briefing, not to navigate away. The two highest-intent actions (read brief, subscribe) are preserved prominently. The other navigation is available but not occupying button-row real-estate.

### Independence check
No content change. Methodology and indexes remain linked. Subscribe CTA preserved.

| Axis | Score |
|------|-------|
| Impact | 4 |
| Strategic Alignment | 4 |
| Learning Value | 2 |
| Confidence | 5 |
| Effort | 1 |
| Risk | 1 |
| **Priority** | **13** |

---

## Candidate 3: TodayInBrief — Move Before CTA Cluster; Drop Card Wrapper

**Page(s):** `/updates/[date]` — `TodayInBrief.tsx`, `DailyBriefingHeader.tsx`

### Problem (file evidence + space cost)
`TodayInBrief.tsx` wraps 3 bullets in `rounded-[18px] border border-line bg-[rgba(255,255,255,0.025)] p-5 sm:p-6` — a full card with all-side padding of 20–24px. The bullet list uses `space-y-2.5`. For 3 items of typical 1–2 line text, the card renders approximately 140–180px tall.

Critically, it is positioned after the CTA cluster in the grid (right column, same row as Stat-of-the-Day). Users who arrive to scan findings must scroll past all header apparatus before they see any content. The 3 bullets are the densest, highest-value summary on the page — they are editorial output, not a widget.

### Proposed UX change
Remove the card wrapper entirely. Position the 3 bullets inline between the thesis paragraph and the CTA cluster:

```
[Thesis paragraph]
• [Bullet 1 — entity linked]
• [Bullet 2 — entity linked]
• [Bullet 3 — entity linked]
[2-button CTA cluster]
```

Style: bare `ul` with `space-y-1.5 mb-5`. Numbered dots at current size (`w-5 h-5 rounded-full text-[0.7rem]`) preserved. No border, no background card, no padding. The section label "Today in Brief" becomes a `text-[0.65rem] uppercase tracking-widest text-muted mb-1.5` line above the list.

This collapses the card (~160px with padding) to a tight bullet list (~80px for 3 items), saving roughly 80px, and places the 3 most important findings above the CTAs where they motivate click-through.

### Why it improves density/scannability
First-time visitors see the 3 key findings before they decide whether to read further. Return visitors can scan the bullets and immediately jump to the relevant section. Removing the card wrapper also breaks the visual monotony of stacked identical card borders.

### Independence check
No content change. All entity links preserved. Methodology unchanged.

| Axis | Score |
|------|-------|
| Impact | 4 |
| Strategic Alignment | 4 |
| Learning Value | 3 |
| Confidence | 4 |
| Effort | 1 |
| Risk | 1 |
| **Priority** | **13** |

---

## Candidate 4: IndexHero — Compress the Band Distribution Panel Row Heights

**Page(s):** All index pages — `IndexHero.tsx`

### Problem (file evidence + space cost)
`IndexHero.tsx` renders a Panel with a band distribution table. Each table row uses `py-3 px-2.5` (12px top + bottom = 24px padding per row). With 5 band rows at ~24px padding + ~20px content, each row is approximately 44px tall, giving the table ~220px total height plus header row, title, and bottom text.

The `py-3` row padding is appropriate for a primary data table where users need to click or compare rows. Band distribution is a read-once orientation table — users scan it once to understand the index shape. It does not need click targets or generous touch areas.

Alongside this, the H1 uses `clamp(2.2rem,5vw,4rem)` — 64px at 1280px viewport — for an index name like "Fortune 500 Compassion Benchmark Index 2026" which is already conveyed by the eyebrow. The `pt-[72px] pb-[30px]` section padding adds 102px of vertical white space.

### Proposed UX change
1. Band table rows: `py-2 px-2.5` (8px v-padding) → reduces table height from ~220px to ~160px.
2. H1: `clamp(1.8rem,3.5vw,3rem)` — preserves hierarchy, removes oversized presence.
3. Section: `pt-[48px] pb-[20px]` — 52px saving on section padding alone.
4. The 5-stat row below the description uses `gap-3 mt-5`; reduce to `mt-3`.

Combined vertical saving: approximately 120–140px on the index hero section. The rankings table — the actual utility of the page — reaches the viewport sooner.

### Why it improves density/scannability
Users arrive at index pages to query the rankings table. The hero should orient, not detain. A shorter hero means the search/filter interface and first table rows appear with less scrolling on a 900px laptop viewport.

### Independence check
No data change. All band, count, pct values still displayed. Rankings table unaffected.

| Axis | Score |
|------|-------|
| Impact | 3 |
| Strategic Alignment | 3 |
| Learning Value | 2 |
| Confidence | 5 |
| Effort | 1 |
| Risk | 1 |
| **Priority** | **11** |

---

## Candidate 5: Homepage Hero — Reduce H1 Scale and Collapse Stat Row

**Page(s):** `/` — `page.tsx`

### Problem (file evidence + space cost)
The homepage H1 uses `clamp(2.4rem,5vw,4.5rem)` — 72px at 1280px viewport. The heading text is 12 words across two lines, consuming approximately 160px. Below it: a 3-sentence description paragraph (approximately 100px), a 3-button CTA row (44px), and a 4-column stat grid with `mt-5` (approximately 100px). Total pre-content vertical space in the left column: roughly 440–480px.

The 4-column stat grid (`Stat` component × 4: "1,155", "7", "8", "40") uses individual `Stat` cards with their own padding. These four numbers are orientation anchors that would convey the same information as a single dense inline sentence.

### Proposed UX change
1. H1: `clamp(2rem,4vw,3.4rem)` — still the largest type on the page, now 54px instead of 72px. Saves approximately 40–50px.
2. Replace the 4-Stat grid with a single inline credential line: `1,155 entities · 7 indexes · 8 dimensions · 40 subdimensions` as `text-[0.88rem] text-muted mt-3 mb-0`. This collapses ~100px of grid to a single 20px line.
3. Description paragraph: trim from 3 sentences to 1 (the first sentence is sufficient for above-the-fold orientation). The full description can remain in an expanded section below.

Combined saving: approximately 150–180px above the fold on the homepage, revealing the "Today's research" section and "Latest evidence" date on most 900px laptop viewports without scrolling.

### Why it improves density/scannability
The homepage has two user intents: explore indexes (new visitor) and check today's research (return visitor). Currently neither the "Explore Indexes" CTA nor the "Today's research" section appear above the fold on a 900px viewport. Compressing the hero makes at least one of these visible without scrolling.

### Independence check
No content or data change. Stat values preserved in inline form.

| Axis | Score |
|------|-------|
| Impact | 3 |
| Strategic Alignment | 3 |
| Learning Value | 2 |
| Confidence | 4 |
| Effort | 1 |
| Risk | 1 |
| **Priority** | **10** |

---

## Candidate 6: Entity Detail Hero — Compress py-12/py-16 Section Padding

**Page(s):** Entity pages — `EntityDetail.tsx`

### Problem (file evidence + space cost)
`EntityDetail.tsx` opens with `section className="py-12 sm:py-16 border-b border-line"` — 48px top/bottom (64px on sm+). The breadcrumb row uses `mb-4`, the name/band flex uses `mb-6`, and the entity name H1 is `text-[2.2rem] sm:text-[2.8rem]` (44px mobile, 45px sm). On a 390px mobile screen this hero alone occupies approximately 60% of the viewport before the dimension score bars appear.

Entity detail pages are used to review specific scores and evidence — the primary utility is the 8-dimension breakdown. The hero section is structural framing, not the content.

### Proposed UX change
1. Section padding: `py-8 sm:py-10` (32px/40px, down from 48px/64px). Saves 32–48px.
2. H1 size: `text-[1.8rem] sm:text-[2.2rem]` — still bold and prominent, no longer magazine scale.
3. Reduce `mb-6` on the main flex row to `mb-4`.

Dimension score bars then appear approximately 100px sooner on mobile, 80px sooner on desktop.

### Why it improves density/scannability
Entity pages have one primary job: show the 8 dimension scores and the evidence rationale. The hero's job is to confirm entity identity and band classification — this requires a name, a band badge, and a rank. It does not require large vertical white space.

### Independence check
No data change. All entity metadata, band, rank, and scores remain displayed.

| Axis | Score |
|------|-------|
| Impact | 3 |
| Strategic Alignment | 3 |
| Learning Value | 2 |
| Confidence | 5 |
| Effort | 1 |
| Risk | 1 |
| **Priority** | **11** |

---

## Candidate 7: Briefing Section Vertical Rhythm — Reduce py-[30px] to py-[18px] for Non-Lead Sections

**Page(s):** `/updates/[date]` — `DailyBriefing.tsx` (all legacy section components)

### Problem (file evidence + space cost)
Every briefing section — `SectorTrendsSection`, `EmergingRisksSection`, `InsightsSection`, `ConfirmationsSection`, `LegacyScoreChangesSection`, `FloorConductSection`, `MathHygienePanel` — uses `py-[30px]`. At 30px top + 30px bottom, each section boundary consumes 60px of vertical space containing no information. A typical briefing renders 8–12 such sections, totalling 480–720px of pure section-gap whitespace below the editorial cluster.

The `SectionHead` component used by most of these sections adds its own internal top/bottom padding via its container. The 30px section padding is therefore additive whitespace, not semantic spacing.

### Proposed UX change
Establish two section padding tiers in the briefing:

- **Lead sections** (LeadSignalCard, BrutalInsightCard, TodaysAnalysisSection): keep `py-[24px]`
- **Detail/audit sections** (ScoreMovementDashboard, EvidenceLedger, SectorTrends, EmergingRisks, Insights, Confirmations, FloorConduct, MathHygiene): `py-[14px]`

This is a systematic change to the `py-[30px]` values on the section wrappers only — no inner component padding changes. For 10 detail sections at 30px → 14px: 10 × 32px saving = 320px. Users reading top-to-bottom through the briefing will reach the evidence ledger and audit trail significantly sooner.

### Why it improves density/scannability
The briefing is a reading document, not a landing page. Landing page whitespace conventions (30px section gaps to "breathe") are misapplied here. A newsletter-style vertical rhythm (14–18px between sections) is consistent with the editorial nature of the content and matches how reference documents read.

### Independence check
No data or content change. All sections still render. Audit trail, evidence ledger, and methodology sections remain fully visible.

| Axis | Score |
|------|-------|
| Impact | 4 |
| Strategic Alignment | 4 |
| Learning Value | 2 |
| Confidence | 4 |
| Effort | 2 |
| Risk | 1 |
| **Priority** | **11** |

---

## Candidate 8: ForwardTriggerCountdown — Inline into Signal Stack; Remove Separate Section

**Page(s):** `/updates/[date]` — `ForwardTriggerCountdown.tsx`, `DailyBriefing.tsx`

### Problem (file evidence + space cost)
`ForwardTriggerCountdown.tsx` renders as a full section with `py-[30px]`, its own section header row with badge + "See all forward watches" link, and a `ul` of trigger rows at `py-3.5` each. For a typical 3–5 trigger list this is approximately 220–280px of vertical real-estate, positioned between the ScoreSparkline and BrutalInsightCard in the editorial cluster.

The trigger list and the signal stack (SignalStack) are informationally adjacent: both surface forward-looking risks and upcoming assessments for specific entities. They use compatible row layouts (entity name, badge, date, description).

### Proposed UX change
Merge forward triggers into the SignalStack as a distinct signal type rather than a standalone section:

- Add trigger items to the `allSignals` array in `SignalStack.tsx` with `type: "forward-trigger"`
- Add a "Forward watch" filter chip to the `ALL_FILTERS` array (already has an extensible type pattern)
- Remove the standalone `ForwardTriggerCountdown` section from `DailyBriefing.tsx`
- Remove the "forward-watch" section from `presentSections` in `BriefingJumpNav`

The days-countdown badge and priority badge rendering from `ForwardTriggerCountdown` are absorbed into the `SignalCard` component via a `daysUntil` prop.

This eliminates one full 280px section and collapses its content into the already-present signals area, increasing the signal density per scroll unit.

### Why it improves density/scannability
The jump nav already lists "Signals" as a section. Forward triggers are signals. Users do not benefit from navigating to a separate section for them. The merged view allows users to filter by "Forward watch" within the signal stream without leaving the section.

**Assumption flagged for engineering:** `SignalCard` would need a `daysUntil` and `forwardDate` prop variant. This is additive, not breaking.

### Independence check
All forward trigger data still surfaces. The "See all forward watches" link to `/updates/forward-watch` can remain as a footer link within the signals section. No methodology information suppressed.

| Axis | Score |
|------|-------|
| Impact | 3 |
| Strategic Alignment | 3 |
| Learning Value | 3 |
| Confidence | 3 |
| Effort | 3 |
| Risk | 2 |
| **Priority** | **7** |

---

## Candidate 9: Methodology Page Hero — Compress the 6-Stat Grid to Inline and Reduce H1

**Page(s):** `/methodology` — `methodology/page.tsx`

### Problem (file evidence + space cost)
The methodology hero uses the same structural pattern as the homepage: `pt-[72px] pb-10` section, `clamp(2.2rem,5vw,4rem)` H1 (64px at 1280px), a 104-word description paragraph, and a `grid grid-cols-2 lg:grid-cols-6 gap-3` of 6 Stat components. The 6-Stat grid at full desktop (6 columns) is approximately 80–90px tall including gap; at mobile (2 columns, 3 rows) it is approximately 200px tall.

Methodology is a reference page — users arrive to read the framework, not to be oriented by a stat grid. The six numbers ("8", "40", "7", "5", "0–100", "v1.1") are valuable but function as footnotes, not headline content.

### Proposed UX change
1. H1: `clamp(1.8rem,3.5vw,3rem)` — 48px at 1280px.
2. Description paragraph: trim to the first sentence. The remaining sentences are already covered by the sections below.
3. Replace the 6-Stat grid with a single inline meta line in the same pattern as Candidate 5: `8 dimensions · 40 subdimensions · 5 evidence tiers · v1.1` as `text-[0.85rem] text-muted mt-2`.
4. Section: `pt-[48px] pb-[20px]`.

Combined saving: approximately 120–150px. The pressure-test principle callout (currently the first section below the hero) comes into view on most viewports without scrolling.

### Why it improves density/scannability
Users reading methodology are already engaged. The hero just needs to confirm they're in the right place. The actual value — the pressure-test principle and the 8-dimension framework — should be immediately visible.

### Independence check
All 6 stat values are preserved in the inline meta line. No methodology content suppressed.

| Axis | Score |
|------|-------|
| Impact | 2 |
| Strategic Alignment | 2 |
| Learning Value | 2 |
| Confidence | 4 |
| Effort | 1 |
| Risk | 1 |
| **Priority** | **8** |

---

## Priority summary table

| # | Candidate | Impact | StrAlign | Learning | Confidence | Effort | Risk | Priority |
|---|-----------|--------|----------|----------|------------|--------|------|----------|
| 1 | Stat of the Day → inline strip | 5 | 4 | 3 | 4 | 2 | 1 | **13** |
| 2 | DailyBriefingHeader H1 + CTA compression | 4 | 4 | 2 | 5 | 1 | 1 | **13** |
| 3 | TodayInBrief → unwrapped bullets above CTA | 4 | 4 | 3 | 4 | 1 | 1 | **13** |
| 4 | IndexHero band table row height + H1 | 3 | 3 | 2 | 5 | 1 | 1 | **11** |
| 5 | Homepage hero H1 + stat grid collapse | 3 | 3 | 2 | 4 | 1 | 1 | **10** |
| 6 | Entity detail hero padding compression | 3 | 3 | 2 | 5 | 1 | 1 | **11** |
| 7 | Briefing section py-[30px] → py-[14px] | 4 | 4 | 2 | 4 | 2 | 1 | **11** |
| 8 | ForwardTriggerCountdown → merged into SignalStack | 3 | 3 | 3 | 3 | 3 | 2 | **7** |
| 9 | Methodology hero stat grid collapse | 2 | 2 | 2 | 4 | 1 | 1 | **8** |

---

## Highest-leverage layout fix

**Candidates 1, 2, and 3 should be implemented together as a single coordinated change to `DailyBriefingHeader.tsx` + `StatOfTheDay.tsx` + `TodayInBrief.tsx`.** Individually each saves 80–150px; together they restructure the entire above-the-fold of the briefing.

The combined before/after:

**Before (current):** 72px top pad → date nav tabs → masthead meta → H1 at 70px → thesis paragraph → 4-button CTA cluster (32px mb) → [below fold] 2-column card grid: 140px Stat-of-the-Day card | 160px TodayInBrief card → trust line

**After (candidates 1+2+3):** 48px top pad → date nav tabs → masthead meta → H1 at 38px → 3 Today-in-Brief bullets (bare, ~80px) → thesis → stat strip (44px) → 2-button CTA + secondary text links → trust line

Estimated above-the-fold gain: 300–360px. On a 900px laptop viewport, users would see the lead signal card beginning to enter the viewport without scrolling. On a 390px mobile viewport, the first Today-in-Brief bullet appears in the first screen rather than requiring 2 full scrolls to reach.

**Candidate 7** (section padding reduction) is the next independent high-return fix and requires only a search-and-replace of `py-[30px]` to `py-[14px]` on detail-cluster section wrappers in `DailyBriefing.tsx`.

---

## Assumptions logged for engineering review

1. **Candidate 1:** The copy-citation interaction (`navigator.clipboard`) currently requires a client component (`"use client"`). Moving StatOfTheDay to an inline strip does not change this requirement — the strip wrapper still needs to be a client component or the copy button needs to be a separately isolated client island.

2. **Candidate 3:** Removing the card background from TodayInBrief means the bullets are visually uncontained within the header section's ambient gradient. Engineering should verify that the bullet rows remain legible against the radial-gradient backdrop defined in `globals.css body`.

3. **Candidate 8:** SignalCard needs a `daysUntil?: number | null` prop and conditional rendering for the countdown badge. This is non-breaking but requires coordination with the data normalization in SignalStack.

4. **Candidates 2+7:** The `py-[30px]` and `mb-8` values do not currently reference CSS tokens — they are Tailwind arbitrary values. A future improvement would be to define `--spacing-section-gap` and `--spacing-section-gap-dense` in `globals.css @theme` so density changes are systematic rather than per-component.
