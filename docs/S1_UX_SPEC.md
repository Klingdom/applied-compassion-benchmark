# S1 UX Spec — S1.3 Entity Hero De-Dup + S1.6 Daily Briefing 30-Second Tier
**Date:** 2026-06-14
**Wave:** S1 (Simplify and Sharpen)
**Items:** S1.3, S1.6
**Status:** Implementation-ready for frontend-engineer
**Sources:** EntityDetail.tsx (1552 lines), DailyBriefing.tsx (1737 lines), DailyBriefingHeader.tsx, BrutalInsightCard.tsx, OpeningQuestion.tsx, HighCompassionContrast.tsx, TodaysAnalysisSection.tsx, LeadSignalCard.tsx, TodayInBrief.tsx, SITE_REVIEW_MASTER_2026-06-12.md, SITE_REVIEW_UX_2026-06-12.md

---

## Framing: what problem each item solves

**S1.3** — Between the top of the entity page and the dimension section, there are currently eleven distinct content regions, three of which are stacked horizontal `<section>` strips that each emit a `border-b border-line`. The dimension shape is encoded four separate times: in the radar, in the best/worst badge pair, in the "If you remember one thing" callout box, and in the ARIA description on the radar. Rank is stated in the AEO strip, in the callout box, and in the hero itself. No information is lost by consolidating — only duplicate encodings are removed.

**S1.6** — The briefing renders four sections in sequence (OpeningQuestion, BrutalInsightCard, HighCompassionContrast, TodaysAnalysisSection) that all occupy the same editorial function: synthesizing what today means. A reader cannot distinguish them from one another without reading all four. A 90-second reader who wants the day's headline and the top signals cannot identify which section to stop at. There is no "you are done if you stop here" tier.

---

## S1.3 — Entity Hero De-Dup

### Principle

Every distinct piece of information must survive. Remove only duplicate encodings, not data.

### Current component order (EntityDetail.tsx, lines 427–1175)

```
1.  AEO lead sentence strip          lines 427–440      section with border-b
2.  "If you remember one thing" box  lines 442–478      div with border-b
3.  Hero section                     lines 480–648      section with border-b
      - breadcrumb
      - h1, band, rank, cohort percentile line, band gloss, ScoreLegend
      - composite score card (top-right box)
      - BandPositionStrip
      - cohort rug <details>
      - sparkline + trend caption + history link
4.  Freshness stamp                  lines 650–682      section with border-b
5.  EntityEvidenceCard               lines 684–689      (internal border)
6.  Tier-provenance chips            lines 691–727      section with border-b
7.  Floor designation panel          lines 729–848      section with border-b (conditional)
8.  Dimension section                lines 855–1175     section with border-b
      - section header ("8 dimensions, scored 0–5")
      - best/worst badges            lines 872–891
      - composite breakdown          lines 893–973
      - radar                        lines 976–1027
      - 8 dimension cards grid       lines 1029–1120
      - deviation bars <details>     lines 1122–1145
      - band distribution <details>  lines 1147–1174
```

### Target component order after S1.3

```
1.  AEO lead sentence [invisible, in DOM only]
2.  Hero section
      - breadcrumb
      - h1, band, rank, metadata fields
      - cohort percentile line
      - band gloss
      - ScoreLegend details
      - composite score card
      - [NEW] key-takeaway note inline (see below)
      - BandPositionStrip
      - cohort rug <details>
      - sparkline + trend caption + history link
3.  Evidence panel [NEW, one collapsible panel]
      - summary row (always visible): date + status dot + evidence label + tier chips
      - <details> expands to: full EntityEvidenceCard
4.  Floor designation panel [unchanged, conditional]
5.  Dimension section
      - section header
      - radar [FIRST, no badges above it]
      - dimension bars grid [inside existing <details> — unchanged]
      - composite breakdown <details> [MOVED here, after radar]
      - deviation bars <details> [unchanged]
      - band distribution <details> [unchanged]
```

### What to REMOVE

**Remove entirely (the box): "If you remember one thing" — lines 442–478**

This is the `<div role="note" aria-label="If you remember one thing">` block. The information it contains (rank, strongest/weakest dimension name) is already present in: the hero rank line, the band gloss, and the radar polygon. The label "If you remember one thing" is editorial voice that conflicts with evidence-first positioning.

Content preservation check: `keyTakeaway.head` says "Ranks #N of M." — rank survives in the hero. `keyTakeaway.body` says "Strongest on X, weakest on Y." — this survives in the inline note below the composite card (see below). `keyTakeaway.citationUrl` — survives in EntityEvidenceCard and EvidenceLedger.

The helper functions `buildKeyTakeaway` and its call can be kept for now if the inline note below uses the same data, but the border-box rendering block is removed.

**Remove from above the radar: best/worst dimension badge pair — lines 872–891**

This is the `<div className="mt-3 flex flex-wrap items-center gap-2 text-[0.82rem]">` block containing the green "Strongest" chip and the red "Weakest" chip. The radar polygon directly encodes which dimension has the largest and smallest area. The ARIA label on the radar wrapper already encodes accessibility text.

Content preservation check: strongest dimension name survives in the inline note in the hero (see below). The radar ARIA label should be updated to include `${entity.name}'s strongest dimension is ${strongest.name} and weakest is ${weakest.name}` as part of the change.

**Remove: AEO lead sentence visible strip — lines 427–440 (visible rendering only)**

The `<p data-pagefind-meta="answer">` block currently renders as a visible line with `py-2 border-b`. Make it invisible to sighted users while keeping it in the DOM for Pagefind and answer engine extraction. Change its class to `sr-only` (or equivalent: `absolute w-px h-px overflow-hidden whitespace-nowrap`). Do not remove the element — the AEO extraction depends on it being present.

Assumption: confirm with product/engineering that Pagefind indexes `sr-only` content. If it does not, keep the element at `opacity-0 h-0 overflow-hidden` instead, which keeps it in the reflow and guarantees extraction.

**Remove: three separate evidence strips (sections 4, 5, 6 in current order) as standalone sections**

Lines 650–727: the freshness stamp section and the tier-provenance chips section are removed as independent `<section>` elements with `border-b`. See "Evidence panel" consolidation below.

### What to ADD

**Add: key-takeaway note inline below the composite score card, inside the hero**

Location: inside the `<div className="shrink-0 rounded-[18px] ...">` composite score card block, or immediately below it as a line within the hero's right/bottom cluster. It should not have a visible label heading.

Content: one line, small type, muted text: `Strongest: {strongest.name} · Weakest: {weakest.name}`

Only render if both `strongest` and `weakest` are non-null. Use `text-[0.78rem] text-muted mt-2` with no border, no background, no icon, no heading label.

This preserves the strongest/weakest information without a named callout box or duplicate badge pair.

**Add: consolidated evidence panel (replaces the three separate strips)**

This is a single `<section>` with `border-b border-line` placed between the hero and the dimension section (after the floor designation, which is conditional).

Structure:

```
<section aria-label="Evidence record" class="py-3 border-b border-line">
  <Container>
    [Summary row — always visible]
    <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.82rem]">
      <status dot (orange = found, green = no change, grey = no review)>
      <span class="text-[#7dd3fc] font-semibold uppercase text-[0.72rem]">
        Evidence reviewed
      </span>
      <time>{evidenceReview.reviewed_at}</time>
      <span>·</span>
      <span>{found/no-change message}</span>
      [tier chips inline — same chips currently in lines 700–726]
      [expand trigger if evidenceCardProps is non-null]
    </div>

    [Expansion — only when evidenceCardProps is non-null]
    <details class="group mt-2">
      <summary ...>Assessment record</summary>
      <div class="mt-2">
        <EntityEvidenceCard {...evidenceCardProps} />
      </div>
    </details>
  </Container>
</section>
```

Render conditions:
- Render the section at all only when `evidenceReview` is non-null (preserves existing "always visible when scanner has touched this entity" behavior).
- Render tier chips only when `hasTierCounts` is true (same guard as current line 692).
- Render the `<details>` expand only when `evidenceCardProps` is non-null.
- When `evidenceReview` is null and `evidenceCardProps` is null and `!hasTierCounts`: render nothing (same as today — entities with no evidence data show no evidence region).

### What to MOVE

**Move: composite breakdown block — currently lines 893–973, move to below the radar**

Currently the composite breakdown formula and `<details>` toggle sit above the radar in the dimension section header. Move the entire block (starting `{compositeBreakdown ? (` at line 894 through the closing `)}` at line 973) to below the radar's `</div>` at line 1027 and above the 8-dimension card grid at line 1029.

New order inside the dimension section:

```
1. Section header ("8 dimensions, scored 0–5") + methodology link
   [NO badges here — removed]
2. DimensionRadar + companion note + "See dimension bars" <details>
3. Composite breakdown <details> [MOVED here]
4. 8-dimension card grid
5. Deviation bars <details>
6. Band distribution <details>
```

The composite breakdown `<details>` summary label stays "How the composite is calculated." No content change, only position change.

### Precise block cuts and merges for engineering

| Action | Source lines | Target |
|--------|-------------|--------|
| Make invisible | 427–440 (AEO `<p>`) | Add `sr-only` class, remove `py-2 border-b` |
| Remove | 442–478 ("If you remember one thing" box) | Delete block |
| Add inline note | Inside hero, below composite score card | See spec above |
| Remove as standalone section | 650–682 (freshness stamp section) | Fold content into new evidence panel |
| Remove as standalone section | 684–689 (EntityEvidenceCard bare call) | Fold into evidence panel `<details>` |
| Remove as standalone section | 691–727 (tier-provenance chips section) | Fold chips into evidence panel summary row |
| Remove | 872–891 (best/worst badges div) | Delete block |
| Move | 893–973 (composite breakdown block) | Relocate to after line 1027 (after radar) |
| Update ARIA | DimensionRadar's aria-label | Add strongest/weakest names |

### Read-order after S1.3 (from page top to dimension section)

1. AEO sentence (in DOM, invisible)
2. Breadcrumb
3. Index label + year caption
4. h1 entity name
5. Band chip + rank + metadata fields
6. Cohort percentile line (when available)
7. Band gloss sentence
8. ScoreLegend `<details>`
9. Composite score card (right-anchored on desktop, below on mobile) with inline "Strongest: X · Weakest: Y" note
10. BandPositionStrip
11. Cohort rug `<details>`
12. Sparkline + trend caption + history link
13. Evidence panel (one row: date + status + tier chips + expand trigger)
14. Floor designation panel (conditional, full red panel)
15. Dimension section header
16. DimensionRadar + companion note + "See dimension bars" `<details>`
17. "How the composite is calculated" `<details>`
18. 8-dimension card grid
19. "How it compares to the field" deviation bars `<details>`
20. "How the [index] is distributed" band distribution `<details>`

That is 20 items, down from the current 24+ between the top of the page and the end of the dimension section. More importantly, the three stacked horizontal strips (items 8, 9, 10 in the current order) become one strip, and the two redundant dimension-shape encodings (callout box + badge pair) are gone.

### Mobile

No mobile-specific changes needed beyond the above. The evidence panel consolidation improves mobile by reducing stacked borders. On mobile, the composite score card already drops below the text cluster (the `flex-col lg:flex-row` layout), so the inline key-takeaway note renders in the natural reading flow below the score card. The `<details>` for the evidence expansion is native HTML and requires no JS.

### Empty / short-data states after S1.3

| State | Behavior |
|-------|----------|
| No `evidenceReview` | Evidence panel not rendered (same as today) |
| `evidenceReview` present, `evidenceCardProps` null | Evidence panel shows summary row only, no expand trigger |
| `evidenceCardProps` present, `tierCounts` all zero | Evidence panel shows summary row without tier chips; expand trigger shows EntityEvidenceCard |
| `!strongest` or `!weakest` | Inline key-takeaway note not rendered (same guard as current badge pair) |
| No `cohortStats` | Cohort line and rug omitted (unchanged) |
| No sparkline | Short-history notice rendered (unchanged) |
| `floorDesignation.designated` | Floor panel renders below evidence panel (unchanged) |

### Dead-link risk from S1.3

None. The "If you remember one thing" box has no `id` attribute and is not linked from anywhere in the codebase (confirmed: no `#remember` or similar anchor exists in any nav or jump-link). The tier-provenance chips section has no `id`. The freshness stamp section has no `id`. Removing or folding these creates no broken anchors.

---

## S1.6 — Daily Briefing "Today in 30 Seconds" + Unify Synthesis Sections

### Principle

A reader who has 30 seconds should be able to get today's headline and top signals without clicking anything. A reader who has 90 seconds should be able to get the editorial interpretation. Everything else is on demand.

### Current editorial-synthesis block (DailyBriefing.tsx, lines 218–269)

```
DailyBriefingHeader          — contains TodayInBrief bullets (deriveTodayInBrief → topSignals titles or highlights)
OpeningQuestion              — reads updates.dailyOpeningQuestion.text
LeadSignalCard               — reads topSignals[0] or synthesized from scoreChanges
ScoreSparkline               — reads topSignals[0].slug
ForwardTriggerCountdown      — reads updates.forwardTriggers
BrutalInsightCard            — reads updates.editorialInsight or derives from lead signal
MidBriefingSubscribe         — client, subscribe capture
HighCompassionContrast       — reads topSignals[0], carryForwardWatches, emergingRisks
TodaysAnalysisSection        — reads updates.highlights
```

The overlap:

- `TodayInBrief` in the header shows bullets derived from `topSignals[0..2].title` or `highlights[0..2]`.
- `TodaysAnalysisSection` shows the same `highlights` array as numbered cards with a "Today's analysis" heading.
- `BrutalInsightCard` shows `updates.editorialInsight` or a derived sentence about the lead signal.
- `HighCompassionContrast` shows responsible-action / improve / worsen derivations for the lead signal entity.
- `OpeningQuestion` shows `updates.dailyOpeningQuestion.text`.

The result: a reader scrolls through five components that all describe what today means before seeing the SignalStack.

### Target structure: three explicit reader tiers

**Tier 1 — "Today in 30 seconds" (always visible, above the fold)**

Location: immediately below the jump nav (BriefingJumpNav), above LeadSignalCard.

This is a new `<section id="today-30s">` component (call it `ThirtySecondTier` or inline in DailyBriefing). It shows 3–5 atoms with no interaction required:

| Atom | Data source | When shown |
|------|-------------|-----------|
| Pipeline line | `pipelineParts` from header (already computed) | When pipeline data exists |
| Lead signal title + delta | `topSignals[0].title` + delta if present | Always (fallback: scoreChanges[0]) |
| Top 2 additional signals | `topSignals[1].title`, `topSignals[2].title` | When non-empty |
| Band-crossing flag | `topSignals[0].actionType === "band-crossing-finding"` | When present |
| Forward trigger count | `forwardTriggers.length` + earliest trigger date | When non-empty |

Presentation: compact list, same style as the current `TodayInBrief` bare bullets in the header — numbered dots, 0.9rem text, no card border, no section background. This gives the 30-second reader a self-contained fact set before the lead card.

The `TodayInBrief` component in the header currently shows these same bullets. After this change, `TodayInBrief` in the header is removed from `DailyBriefingHeader` and the content is promoted to the explicit `ThirtySecondTier` section. The header retains: masthead, h1, thesis, pipeline micro-strip, date nav, CTA cluster, trust line.

**Tier 2 — "Today's analysis" (one unified section, directly after LeadSignalCard)**

Pick ONE canonical synthesis section. Fold the others.

**Canonical: `TodaysAnalysisSection`** (`updates.highlights`) — this is the section that:
- Has a stable named heading ("Today's analysis")
- Works on flat/legacy briefings (highlights array ships on all briefings)
- Supports both plain strings and rich objects with `whyItMatters`
- Has a consistent numbered-card layout

**Fold into TodaysAnalysisSection:**

1. `BrutalInsightCard` — the `updates.editorialInsight` string, when present, becomes the first item in the highlights list OR is prepended above the highlights cards as an untitled intro paragraph inside `TodaysAnalysisSection`. Do not render `BrutalInsightCard` as a separate section. Implementation: in `TodaysAnalysisSection`, check `updates.editorialInsight` before rendering the numbered list — if present, show it as a lead paragraph in the same container.

2. `OpeningQuestion` — the question text, when present, becomes the last item in the "Today's analysis" section, under a label "Today's question." Do not render `OpeningQuestion` as a separate section. The entity chip links from `tiedToEntities` are preserved inside this appended block.

3. `HighCompassionContrast` — the three-column contrast grid (responsible action / would improve / would worsen), when any column has content, becomes a collapsible `<details>` block at the bottom of the `TodaysAnalysisSection` container, labeled "Compassion contrast — [entity name]." This preserves all content and the distinct visual treatment while removing it as a standalone pre-analysis section.

The unified `TodaysAnalysisSection` after this change renders:
```
[Lead editorial insight paragraph, if editorialInsight present]
[Numbered highlights cards, 01 02 03...]
[Today's question block, if dailyOpeningQuestion present]
[Compassion contrast <details>, if HighCompassionContrast has content]
```

All within the existing `#highlights` anchor so the jump nav link still resolves.

**Tier 3 — Deep read (on demand, Wave E1 `<details>` region)**

The following sections are already appropriately below the editorial cluster. They do not need to move, but they need to be clearly separated from Tier 2 with a visual break or a section label:

```
SignalStack              — id="signals" (unchanged)
ScoreMovementDashboard   — id="score-movements" (unchanged)
BoundaryWatch            — id="boundary-watch" (unchanged)
SectorTrendsSection      — id="sector-findings" (unchanged)
EmergingRisksSection     — id="emerging-risks" (unchanged)
FailureModeCard          — (unchanged)
MethodologyInnovationList — (unchanged)
ForwardSignalsList       — (unchanged)
InsightsSection          — (unchanged)
LegacyScoreChangesSection — id="score-changes-detail" (unchanged)
EvidenceLedger           — id="evidence-ledger" (unchanged)
FloorConductSection      — id="floor-conduct" (unchanged)
Audit Trail <details>    — id="audit-trail" (unchanged, already collapsed)
FloorDesignationsPanel   — id="floor-designations" (unchanged)
CompletionBlock          — (unchanged)
```

Optional: wrap the Deep Read cluster in a single `<details id="deep-read">` with summary "Full briefing — score movements, evidence ledger, audit trail" to create a single on-demand expansion for the 90-second reader who is done after Tier 1 + Tier 2. This is optional; it adds engineering complexity. If not implemented in S1.6, it remains a Wave E1+ improvement. The minimum viable S1.6 is the Tier 1 addition and the Tier 2 unification.

### Target read-order for a 90-second reader after S1.6

```
ReadingProgress (fixed bar)
DailyBriefingHeader
  - masthead + date nav
  - h1 + thesis
  - pipeline micro-strip
  - CTA cluster
  - trust line
  [TodayInBrief REMOVED from here]
BriefingJumpNav (sticky)

[TIER 1 — 30-second read]
ThirtySecondTier                       NEW section, id="today-30s"
  - pipeline line (reviewed / assessed / changes / watches)
  - numbered bullets: lead signal + 2 additional signals
  - band-crossing flag when present
  - forward trigger count + earliest date

LeadSignalCard                         id="lead-signal" (unchanged)
ScoreSparkline                         (unchanged)
ForwardTriggerCountdown                (when non-empty, unchanged)

[TIER 2 — 90-second read]
TodaysAnalysisSection (UNIFIED)        id="highlights"
  - editorial insight paragraph (folded from BrutalInsightCard)
  - numbered highlights cards
  - today's question block (folded from OpeningQuestion)
  - compassion contrast <details> (folded from HighCompassionContrast)

MidBriefingSubscribe                   (unchanged, Wave E2 capture)

[TIER 3 — deep read, existing order preserved]
SignalStack                            id="signals"
ScoreMovementDashboard                 id="score-movements"
BoundaryWatch                          id="boundary-watch"
SectorTrendsSection                    id="sector-findings"
EmergingRisksSection                   id="emerging-risks"
FailureModeCard
MethodologyInnovationList
ForwardSignalsList
InsightsSection
LegacyScoreChangesSection
EvidenceLedger                         id="evidence-ledger"
FloorConductSection                    id="floor-conduct"
Audit Trail <details>                  id="audit-trail"
FloorDesignationsPanel                 id="floor-designations"
CompletionBlock
Purchase CTA
Archive nav
```

### BriefingJumpNav update required

The `presentSections` array in DailyBriefing.tsx currently computes which jump-nav chips to show. After S1.6:

- Add `{ id: "today-30s", label: "30 seconds" }` as the first item, always present.
- The existing `{ id: "lead-signal", label: "Lead signal" }` chip remains but moves to second position.
- The `id="opening-question"` anchor in `OpeningQuestion` will no longer exist as a standalone section — remove that from `presentSections` if it was ever included. (Currently OpeningQuestion is not in the `presentSections` array, so no change needed there.)
- The `id="highlights"` anchor is preserved in `TodaysAnalysisSection`, which is unchanged — the jump nav chip for "Today's analysis" if one exists continues to work.

### Components to REMOVE as standalone rendered sections

| Component | Current location in render | Disposition after S1.6 |
|-----------|---------------------------|------------------------|
| `<OpeningQuestion updates={updates} />` | Line 219 | Remove standalone call; fold content into TodaysAnalysisSection |
| `<BrutalInsightCard updates={updates} />` | Line 257 | Remove standalone call; fold content into TodaysAnalysisSection |
| `<HighCompassionContrast updates={updates} />` | Line 263 | Remove standalone call; fold content into TodaysAnalysisSection as a `<details>` |
| `TodayInBrief` (inside DailyBriefingHeader) | DailyBriefingHeader.tsx line 175 | Remove from header; promote content to ThirtySecondTier |

The component files themselves (BrutalInsightCard.tsx, OpeningQuestion.tsx, HighCompassionContrast.tsx, TodayInBrief.tsx) should be KEPT — do not delete them. They are folded into TodaysAnalysisSection's render logic, not removed from the codebase. The standalone `<section>` wrappers are what disappear.

### TodaysAnalysisSection — required prop additions

Currently TodaysAnalysisSection reads only `updates.highlights` and `updates.date`. After S1.6 it needs to read three additional fields that were previously consumed by the removed components:

- `updates.editorialInsight` (string | undefined) — prepended as lead paragraph
- `updates.dailyOpeningQuestion` (object | undefined) — appended as question block
- The data for HighCompassionContrast: `updates.topSignals`, `updates.carryForwardWatches`, `updates.emergingRisks` — passed to an internal `CompassionContrastDetails` block

Since TodaysAnalysisSection already receives the `updates` object via `{ updates }` props, and all these fields are on `updates`, no prop signature change is needed — the component already has access to all required data. The internal rendering logic expands.

### Mobile + empty/short-data states after S1.6

| State | Behavior |
|-------|----------|
| No `topSignals` and no `scoreChanges` | ThirtySecondTier shows pipeline line only (or renders null if pipeline also absent) |
| No `highlights` and no `editorialInsight` and no `dailyOpeningQuestion` | TodaysAnalysisSection renders null (unchanged behavior) |
| No `dailyOpeningQuestion.text` | Question block not appended (same as current OpeningQuestion null return) |
| HighCompassionContrast has no substantive points | Contrast `<details>` not rendered inside TodaysAnalysisSection |
| Legacy/flat briefing (pre-2026-05-26 schema) | ThirtySecondTier falls back to `highlights[0..2]` or `scoreChanges[0..2].headline` via the same `deriveTodayInBrief` logic already in utils.ts |
| Mobile viewport | ThirtySecondTier is a bare list with no card/border — renders identically on mobile as on desktop |

### Dead-link / anchor risk from S1.6

| Anchor | Risk | Resolution |
|--------|------|------------|
| `#lead-signal` | No risk — LeadSignalCard still renders with this id | None needed |
| `#opening-question` | OpeningQuestion no longer renders as a standalone section | This id was never added to `presentSections` in DailyBriefing.tsx — confirmed no jump-nav chip pointed to it. No external links known. Safe to remove. |
| `#highlights` | Preserved in TodaysAnalysisSection (unchanged) | None needed |
| `#today-30s` | New anchor | New jump-nav chip must be added (see above) |
| `#brief` | Preserved in DailyBriefingHeader (unchanged) | None needed |
| `#signals`, `#score-movements`, `#boundary-watch`, `#sector-findings`, `#evidence-ledger`, `#audit-trail`, `#floor-designations`, `#floor-conduct` | All preserved in unchanged sections | None needed |

The BriefingJumpNav's `presentSections` guard logic already mirrors the exact render conditions for each section. The new `ThirtySecondTier` is always-present (push it unconditionally like `#lead-signal`). The `#opening-question` anchor from OpeningQuestion's `id="opening-question"` disappears — this is safe because it was never wired into `presentSections` and no other part of the codebase links to it via `href="#opening-question"`.

Verify before shipping: run `grep -r "opening-question" site/src` to confirm no stale links. Expected result: only the now-deleted OpeningQuestion component file itself.

---

## Cross-cutting constraints

**Static export:** All changes are pure JSX restructuring or class changes. No new client components required for S1.3. The `ThirtySecondTier` section is a Server Component (no interactivity required — it is static data display). The existing `<details>` pattern used throughout both files is native HTML and requires no JS. Compliance with `output: 'export'` is unchanged.

**Dark theme tokens:** All new elements should use existing tokens: `text-muted`, `text-text`, `text-accent`, `border-line`, `bg-[rgba(255,255,255,0.02)]`, `text-[#7dd3fc]`. Do not introduce new color values.

**Wave E1 density:** The ThirtySecondTier bare-list style and the evidence panel summary row follow the Wave E1 densification pattern already established in DailyBriefingHeader.tsx (pipeline micro-strip, TodayInBrief bare bullets). Consistent with that pass.

**Independence:** No change affects content or scoring. Only display structure and duplicate encoding are modified. No entity data is removed or reordered.

---

## Implementation checklist for frontend-engineer

### S1.3

- [ ] Add `sr-only` to the AEO `<p data-pagefind-meta="answer">` block; remove `py-2 border-b` classes
- [ ] Delete lines 442–478 ("If you remember one thing" box and its containing `<div>`)
- [ ] Add inline key-takeaway note below composite score card: `Strongest: {strongest.name} · Weakest: {weakest.name}` (conditional on both being non-null)
- [ ] Update DimensionRadar `aria-label` to include strongest/weakest dimension names
- [ ] Delete lines 872–891 (best/worst badges `<div>`)
- [ ] Move lines 893–973 (composite breakdown block) to after the radar `</div>` (after line 1027 in original file)
- [ ] Replace lines 650–727 (three standalone sections) with single consolidated evidence panel per spec above
- [ ] QA: entity page with no evidenceReview — evidence panel absent
- [ ] QA: entity page with evidenceReview but no evidenceCardProps — panel shows summary row only, no expand trigger
- [ ] QA: entity page with full evidence data — summary row + tier chips + expand trigger opens EntityEvidenceCard
- [ ] QA: mobile 375px — read order is correct, no horizontal overflow from evidence panel

### S1.6

- [ ] Create `ThirtySecondTier` section (inline in DailyBriefing.tsx or new `briefing/ThirtySecondTier.tsx`)
- [ ] Remove `<TodayInBrief items={briefItems} />` from DailyBriefingHeader.tsx (line 175)
- [ ] Remove `<OpeningQuestion updates={updates} />` standalone call (line 219 of DailyBriefing.tsx)
- [ ] Remove `<BrutalInsightCard updates={updates} />` standalone call (line 257)
- [ ] Remove `<HighCompassionContrast updates={updates} />` standalone call (line 263)
- [ ] Expand TodaysAnalysisSection to read and render: editorialInsight lead paragraph, question block, compassion contrast `<details>`
- [ ] Add `{ id: "today-30s", label: "30 seconds" }` as first item in `presentSections` (DailyBriefing.tsx, line 155 area)
- [ ] QA: briefing with full data — ThirtySecondTier shows 3 bullets + pipeline line + band-crossing flag
- [ ] QA: legacy flat briefing (highlights only, no topSignals) — ThirtySecondTier shows highlights[0..2] as bullets
- [ ] QA: briefing with no editorialInsight — TodaysAnalysisSection renders normally from highlights only
- [ ] QA: briefing with no dailyOpeningQuestion — TodaysAnalysisSection renders without question block
- [ ] QA: jump nav — "30 seconds" chip appears first and links to ThirtySecondTier section; "Lead signal" still present

---

## Assumptions requiring confirmation before shipping

1. **AEO / Pagefind**: confirm that Pagefind indexes `sr-only` class content on static export. If it does not, use `position: absolute; width: 1px; height: 1px; overflow: hidden` inline style instead of Tailwind `sr-only`. Do not use `display: none` — that removes content from extraction.

2. **ThirtySecondTier data independence**: the ThirtySecondTier bullets are derived from `topSignals[0..2].title`, which is the same source as `TodayInBrief` in the header. The header's `deriveTodayInBrief` utility in `briefing/utils.ts` already handles all fallback paths (topSignals → highlights → scoreChanges → headline). Reuse that function directly for ThirtySecondTier rather than re-deriving. Confirm with engineering that the function is importable without circular dependency from the DailyBriefing render.

3. **TodaysAnalysisSection expansion complexity**: folding three component's worth of logic into TodaysAnalysisSection is a larger change than it appears because BrutalInsightCard and HighCompassionContrast have non-trivial derivation logic (`pickLeadSignal`, `carryForwardWatches` lookup, `emergingRisks` lookup). If the expansion of TodaysAnalysisSection is estimated at more than 2 hours of engineering, the minimum viable S1.6 is: add ThirtySecondTier + remove TodayInBrief from header + keep BrutalInsightCard / OpeningQuestion / HighCompassionContrast in place but move them inside a single `<details id="synthesis-detail">` wrapper with summary "Editorial synthesis." This satisfies the "one step to reach deep analysis" goal without a full unification.

4. **Backward compatibility**: existing briefing JSON files (pre-2026-05-26) have no `topSignals` or `dailyOpeningQuestion`. ThirtySecondTier's null/fallback path must not crash on those briefings. The `deriveTodayInBrief` function already handles this; reusing it covers the risk.
