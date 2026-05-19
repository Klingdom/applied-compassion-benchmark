# Frontend Implementation Plan — /updates Page Redesign
**Date:** 2026-05-19
**Author:** Frontend Engineer Agent
**Status:** Pre-implementation — awaiting parallel review outputs

---

## A. File-by-File Change List

### MOVE (reordering in DailyBriefing.tsx only — no file changes)

| Current position in DailyBriefing.tsx | New position | What moves |
|---------------------------------------|-------------|------------|
| `HighlightsSection` (legacy, near bottom) | Section 2 (immediately after header) | Promoted from legacy group to near-top; no file change, just call site reorder |
| `LegacyScoreChangesSection` (currently position 8) | Section 5 (between SignalStack and ScoreMovementDashboard) | Reordering of existing call site in DailyBriefing.tsx |
| `EvidenceLedger` (currently position 11) | Section 7 (between Score Movements and Sector Findings) | Reordering of existing call site |
| `SectorTrendsSection` (legacy, near bottom) | Section 8 | Pulled up from legacy tail group |
| `EmergingRisksSection` (legacy, near bottom) | Section 9 | Pulled up from legacy tail group |

**Only the call-site order inside DailyBriefing.tsx changes. No sub-component files move on disk.**

---

### MODIFY

**`site/src/components/updates/briefing/DailyQuestion.tsx`**
Repurpose from closing-position component to opening-position component. Changes:
- Accept an optional `variant` prop: `"opening" | "closing"` (default `"closing"` for backward compatibility)
- When `variant="opening"`: render above `LeadSignalCard`; read from `updates.openingQuestion` first, then fall back to rotation; update `aria-label` and the eyebrow label ("Opening question" vs "Closing question")
- When `variant="closing"`: existing behavior unchanged (reads `updates.dailyQuestion`)
- Do NOT rename the file — the import in DailyBriefing.tsx already exists; adding a prop avoids a rename that would break any future archive page references

**`site/src/components/updates/briefing/ScoreMovementCard.tsx`**
Enrich with optional new fields from the enriched per-entity digest shape:
- `dominantDimension?: string` — show as a dim-code pill (use DIMENSIONS color lookup, already imported in DailyBriefing.tsx; pass through from ScoreMovementDashboard)
- `whySentence?: string` — one-sentence rationale; render below entity name in small muted text when present
- `primaryEvidenceUrl?: string` — render a discreet "Source" link beside the entity name when present
- `distanceToBoundary?: number` — when present and `|distanceToBoundary| <= 2`, render a "X.Xpt to boundary" chip (reuse BoundaryWatch visual pattern)
- `nextForwardSignal?: string` — render below score row in italic muted text when present
- All additions are conditional on field presence; existing render path unchanged when absent

**`site/src/components/updates/briefing/DailyBriefingHeader.tsx`**
No structural change. If the Opening Question is placed inside the header section by the founder's decision (open question F1 below), wire `updates.openingQuestion` to a new sub-block below the KPI grid. Plan defers this placement decision.

**`site/src/components/updates/DailyBriefing.tsx`**
The only file with significant edits:
1. Add `DailyQuestion` call at Section 2 position with `variant="opening"`, reading `updates.openingQuestion`
2. Reorder existing call sites per section order (A above)
3. Remove `DailyQuestion` from its current closing position — replace with a second `DailyQuestion` call using `variant="closing"` if the founder wants both (open question F2), or remove entirely

---

### CREATE NEW

**`site/src/components/updates/briefing/TodaysAnalysisSection.tsx`**
Extract `HighlightsSection` from DailyBriefing.tsx into a standalone briefing sub-component. Rationale: it is being promoted to Section 2 (near-top) and will likely receive further iteration. Moving it out of the monolithic legacy tail:
- Props: `{ updates: any }` (reads `updates.highlights: string[]`)
- Visual: unchanged from current `HighlightsSection` inline function
- Defensive default: returns `null` when `highlights` is empty or absent
- Import and call in DailyBriefing.tsx replaces the inline `HighlightsSection` call

**This is the only net-new file required for the initial redesign. All other components are modifications or reorderings.**

---

### DEPRECATE

None at this time. The `HighlightsSection` inline function in DailyBriefing.tsx is replaced by `TodaysAnalysisSection.tsx`, but the inline function can be deleted in the same commit to avoid confusion. No files are deprecated in the sense of being kept but marked unused.

---

## B. Data Contract Changes

The overnight digest (research pipeline) generates `site/src/data/updates/daily/*.json`. The following JSON paths are new or modified. The PM review will define exact field names — these are the additions the frontend implementation expects.

### Opening Question (Section 1 — Header)

```
updates.openingQuestion: string | undefined
```
When present, `DailyQuestion` (variant="opening") renders it verbatim. When absent, falls back to the existing `QUESTION_ROTATION` array keyed by issue number. No schema breakage on older digests.

Existing field `updates.dailyQuestion` continues to serve the closing-question slot unchanged.

### Enriched ScoreMovementCard fields

These are new optional fields on each item in `updates.recentAssessments[]` and/or `updates.scoreChanges[]`:

```
updates.recentAssessments[n].dominantDimension: string | undefined
  // e.g. "BND", "ACC" — one of the 8 dimension codes

updates.recentAssessments[n].whySentence: string | undefined
  // One sentence: "BND docked 0.25 for state-facilitation of allied war crimes."

updates.recentAssessments[n].primaryEvidenceUrl: string | undefined
  // URL to the single highest-weight source for this assessment

updates.recentAssessments[n].distanceToBoundary: number | undefined
  // Signed float: negative = below next boundary, positive = above
  // e.g. -0.3 means 0.3pt below the Critical threshold

updates.recentAssessments[n].nextForwardSignal: string | undefined
  // e.g. "Xi-Putin joint statement expected May 19-20"
```

The same five fields should also appear on `updates.scoreChanges[n]` items for cross-population when `ScoreMovementDashboard` enriches the merged list.

### Summary of new JSON paths

| Path | Type | Required | Fallback |
|------|------|----------|---------|
| `updates.openingQuestion` | `string` | No | `QUESTION_ROTATION[issueNumber % 12]` |
| `updates.recentAssessments[n].dominantDimension` | `string` | No | No pill rendered |
| `updates.recentAssessments[n].whySentence` | `string` | No | Not rendered |
| `updates.recentAssessments[n].primaryEvidenceUrl` | `string` | No | No link rendered |
| `updates.recentAssessments[n].distanceToBoundary` | `number` | No | Not rendered |
| `updates.recentAssessments[n].nextForwardSignal` | `string` | No | Not rendered |

No existing fields are removed or renamed.

---

## C. Implementation Sequence

### Step 1: Section reordering in DailyBriefing.tsx (independently shippable)
Move call sites to match the required section order without touching any sub-component. The `HighlightsSection` inline function stays in the file temporarily. Test: `npm run build` passes; verify section order in browser at `localhost:3000/updates`; confirm archive dates (April 2026) still render with empty `highlights` array.

### Step 2: Extract TodaysAnalysisSection.tsx (independently shippable after Step 1)
Move the `HighlightsSection` inline function body into `site/src/components/updates/briefing/TodaysAnalysisSection.tsx`. Update DailyBriefing.tsx import. Delete the inline function. Test: visual parity with Step 1 output; `npm run build` passes.

### Step 3: Add Opening Question variant to DailyQuestion.tsx (independently shippable)
Add `variant` prop with default `"closing"`. Wire `variant="opening"` call in DailyBriefing.tsx at Section 2 reading `updates.openingQuestion`. Confirm: with a digest that lacks `openingQuestion`, the fallback rotation renders; with a digest that has it, the explicit value renders. Closing position behavior unchanged.

### Step 4: Enrich ScoreMovementCard.tsx with new optional fields (depends on Step 1; independently shippable once data contract is confirmed by PM)
Add rendering for the five new optional fields. All additions gated on `field !== undefined`. Test: card renders identically for older briefings; new fields appear for a digest that includes them (can be manually injected into a local JSON for testing). `npm run build` passes.

### Step 5: Wire `distanceToBoundary` from ScoreMovementDashboard into ScoreMovementCard (depends on Step 4)
ScoreMovementDashboard already merges `recentAssessments` + `scoreChanges` into the unified list. Confirm `distanceToBoundary` passes through the spread merge without being dropped. BoundaryWatch section already has threshold display; this puts a lighter version on the dashboard cards. Test: entities with active boundary watch (e.g., China, Oracle from May 18 digest) show the chip.

---

## D. Validation Plan

### Older briefings (April 2026) must still render

- All new fields are `| undefined` with explicit `null`/empty-array fallbacks
- DailyBriefing.tsx already has `const { scoreChanges = [], highlights = [], ... } = updates` normalization — new fields follow the same pattern
- Run `npm run build` against the current codebase before any changes; record which archive dates exist in `manifest.json`; confirm the same dates produce identical output post-change
- Spot-check `/updates/2026-04-15` and `/updates/2026-04-16` in browser after each step

### New fields render when present and degrade when absent

- For Steps 3 and 4: inject a minimal test fixture into `site/src/data/updates/latest.json` locally with `openingQuestion` and enriched `recentAssessments` entries; verify visual appearance; revert fixture before commit
- No test framework is currently in the codebase — visual inspection is the primary validation method

### Build commands

```bash
cd site
npm run build
```

Check for:
- Zero TypeScript errors (`tsc --noEmit` is part of the build)
- No missing import warnings
- `out/updates/index.html` exists
- `out/updates/2026-04-15/index.html` exists (and all other manifest dates)
- Static export size has not regressed materially

---

## E. Risks to Flag for QA

### Static export edge cases (Next.js 16, output: 'export')

- `DailyQuestion` with `variant="opening"` will be used in two call sites in DailyBriefing.tsx. Because this is a static export, client state (none in DailyQuestion — it's purely presentational) is not a concern. However, if any future change adds interactivity to the opening question slot, a `"use client"` directive will be needed. Flag this for any Phase 2 scope.
- `SignalStack` already uses `"use client"` for its filter state. Moving it between positions in DailyBriefing.tsx does not affect this — the parent remains a server component.

### Schema drift impact on /updates/[date]/page.tsx

- The `[date]` page uses `getDailyData(date)` to load per-date JSON. If the nightly digest pipeline starts writing new fields (`openingQuestion`, enriched `recentAssessments`) only for new dates, older JSON files will not have them. This is safe because all new fields are optional. QA should confirm that an archive page for a date without `openingQuestion` does not render an empty question block.

### TrackedEntityLink behavior preservation

- `ScoreMovementCard` calls `TrackedEntityLink` for entity name links. Adding `whySentence` and `primaryEvidenceUrl` renders below/beside the entity name — not inside the `TrackedEntityLink` wrapper. QA should verify click targets do not overlap and that the new "Source" link uses a plain `<a>` with `target="_blank" rel="noopener noreferrer"`, not `TrackedEntityLink` (which is for internal entity profiles, not external evidence URLs).

### Section ID anchor stability

- Moving sections changes scroll-position behavior for users who have bookmarked fragment anchors (e.g., `#highlights`, `#score-changes-detail`, `#signals`). The existing `id` attributes on sections are preserved — reordering call sites does not change `id` values. QA should confirm anchors are still reachable after reordering.

### TodaysAnalysisSection extraction

- The inline `HighlightsSection` in DailyBriefing.tsx uses `date` prop for the `SectionHead` description. `TodaysAnalysisSection.tsx` must read `updates.date` from the `updates` prop (same pattern as other briefing sub-components) rather than accepting `date` as a separate prop, to stay consistent with the briefing sub-component interface.

---

## F. Open Questions for Founder (5 maximum)

**F1. Opening question placement:** Should the opening question appear inside `DailyBriefingHeader` (below the KPI grid, before the CTA cluster) or as a standalone section between Header and Today's Analysis? The current plan places it as a separate section. Confirm preferred visual position before Step 3 implementation.

**F2. Closing question retention:** Does the closing question slot (currently `DailyQuestion` at Section 12) remain after adding the opening question? Or does the question move entirely to the opening position and the closing slot is removed? This affects whether DailyBriefing.tsx has one or two `DailyQuestion` calls.

**F3. Today's Analysis data source:** `HighlightsSection` currently renders `updates.highlights: string[]`. The founder's required section name is "Today's Analysis." Should the digest pipeline rename the field to `updates.todaysAnalysis` (breaking change for April archives) or keep `highlights` as the underlying field name with the display title updated to "Today's Analysis"? The plan currently assumes display title change only, field name unchanged.

**F4. ScoreMovementCard enrichment priority:** Of the five new optional fields (`dominantDimension`, `whySentence`, `primaryEvidenceUrl`, `distanceToBoundary`, `nextForwardSignal`), which are required for the initial ship vs. which can follow in a subsequent cycle? This determines whether Step 4 blocks the section-reorder ship or follows independently.

**F5. Enriched card applies to which entity list?** The new ScoreMovementCard fields are most useful for entities with score changes. Should the enriched fields be populated only for `scoreChanges` entries, or for all `recentAssessments` entries (including confirmations)? This affects the digest pipeline scope, not the frontend rendering logic (frontend handles both cases already via optional fields).
