# Frontend Review — Daily Briefing Implementation
**Date:** 2026-05-13
**Reviewer:** Frontend Engineer agent
**Files reviewed:**
- `site/src/app/updates/[date]/page.tsx`
- `site/src/app/updates/page.tsx`
- `site/src/components/updates/DailyBriefing.tsx`
- `site/src/components/updates/TopSignals.tsx`
- `site/src/data/schema.ts`
- `site/src/data/updates/daily/2026-05-12.json` (640 lines)
- `site/src/app/globals.css`

---

## 1. Schema-vs-Render Gap

Fields present in `2026-05-12.json` that are NOT rendered anywhere in `DailyBriefing.tsx` or `TopSignals.tsx`:

| JSON field | Location in JSON | Content value | Render priority |
|---|---|---|---|
| `floorEntities[]` | Top-level array, 3 items | Floor conduct documentations with categories, sources, and multi-phase narrative (Russia bad-faith-format cycle, Myanmar school strike, South Sudan famine) | **P1** — highest narrative density of any unrendered block |
| `mathHygiene{}` | Top-level object | 13-entity cluster; critical flag for Open Bionics at 10 cycles; sub-threshold candidates table | **P1** — publication-integrity signal; already called out in pipeline commentary |
| `signals[]` | Top-level array, 11 items | Forward-dated calendar of upcoming scoring events (May 13 – June 9), each with entity, date, priority, actionRequired | **P1** — unique content not derivable from other sections |
| `boundaryWatchEntities[]` | Top-level array, 7 items | Entities near band thresholds with composite and note; Pakistan watch resolved as downgrade | **P2** — directly supports score-change narrative |
| `carryForwardDimensionalCredits[]` | Top-level array, 4 items | Published vs. reconstructed scores with dimensional breakdown and first-logged date | **P2** — methodology transparency |
| `newConductCategories[]` | Top-level array, 1 item | New category definition, pairing rule, and prior related category | **P2** — methodology callout moment |
| `holds[]` | Top-level array, 4 items | Entities on assessment hold with reason and resume date | **P3** |
| `scoreChanges[].boundaryWatchResolution` | Per change-card | Narrative explaining how a boundary watch resolved | **P1** — visible on Pakistan card; buried behind `any` cast |
| `scoreChanges[].materialityNote` | Per change-card | CVS delta discrepancy explanation (reported -4.4, precise math -6.3) | **P2** |
| `scoreChanges[].scannerCorrection` | Per change-card | CVS scanner source-vs-canonical correction note | **P2** |
| `scoreChanges[].keyEvidence[]` | Per change-card | Bullet list separate from `evidence[]` objects; used in all 3 May 12 score changes | **P1** — `evidence` array is absent on May 12 score changes; `keyEvidence` is the actual evidence field |
| `scoreChanges[].openWatches[]` | Per change-card | Forward watch items per entity | **P2** |
| `scoreChanges[].floorProximityAssessment{}` | UnitedHealth card | Structured declined-floor explanation with partial remediation signals | **P2** |
| `confirmations[].carryForwardDelta` | Per confirmation row | Carry-forward credit magnitude | **P3** |
| `confirmations[].boundaryWatch` | Per confirmation row | Boolean; Senegal and Vanuatu are true | **P3** |
| `confirmations[].firstAgentBaseline` | Per confirmation row | Boolean; 8 confirmations are first baselines | **P3** |
| `pipeline.rotationSubstitution{}` | Pipeline block | Substitution narrative with falsely-flagged vs. substituted entity lists | **P3** |
| `pipeline.holdsRespected[]` | Pipeline block | Entities held out of this cycle | **P3** |

**Critical content loss:** The three `floorEntities[]` items contain the most substantive journalism in the May 12 file. Russia's post-format-offensive-surge documentation, Myanmar's school airstrike, and South Sudan's famine figures are fully absent from the rendered page. The `FloorDesignationsPanel` in `DailyBriefing.tsx` renders a static registry lookup, not the cycle-specific conduct documentation from `floorEntities[]`. These are completely different things.

**Second critical loss:** `scoreChanges[].keyEvidence[]` is the actual evidence field for all three May 12 score changes. The `evidence[]` object array that the render code looks for is empty on these cards. Users see no evidence on the Pakistan, CVS, or UnitedHealth cards.

---

## 2. Schema Discipline

`schema.ts` defines `IndexFileSchema` and `ChangeProposalSchema` but has no daily briefing schema. The daily JSON is consumed via `getDailyData(date)` and immediately cast to `any` in both `page.tsx` files (`const u = updates as any`). The `DailyBriefing` component prop type is `updates: any`.

**Daily JSON is not validated at any layer.** Schema drift that caused build failures in the past (noted in the component comments) was caught only by runtime crashes, not by a module-load parse.

**Validation plan:**

1. Add `DailyBriefingSchema` to `schema.ts` using `z.looseObject` for the top-level shape — pin the arrays that are destructured in render code (`scoreChanges`, `confirmations`, `sectorAlerts`, etc.) and add the new top-level arrays (`floorEntities`, `mathHygiene`, `signals`, `boundaryWatchEntities`, `holds`, `carryForwardDimensionalCredits`, `newConductCategories`).

2. In `site/src/data/updates/daily/index.ts`, call `DailyBriefingSchema.parse(raw)` before returning. This mirrors the existing pattern in `entities.ts` where `IndexFileSchema.parse(...)` is called at module load. A parse failure becomes a build error, not a silent render gap.

3. Replace `updates: any` in `DailyBriefingProps` with `updates: DailyBriefing` (the inferred type). The `/* eslint-disable @typescript-eslint/no-explicit-any */` banner can then be removed from all three files.

4. Per-card fields (`boundaryWatchResolution`, `keyEvidence`, etc.) belong on `ChangeProposalSchema` — add them as `.optional()` fields. `ChangeProposalSchema` already uses `z.looseObject`, so this is additive.

---

## 3. Components to Extract

`DailyBriefing.tsx` is 1,076 lines and growing. The score-change card alone is ~180 lines of inline JSX. Five focused extractions:

| Component | Proposed path | What it owns |
|---|---|---|
| `ScoreChangeCard` | `components/updates/ScoreChangeCard.tsx` | The full ~180-line per-entity card: header row, score display, band transition, headline, evidence list (handling both `evidence[]` and `keyEvidence[]`), `boundaryWatchResolution`, `materialityNote`, `openWatches`, `floorProximityAssessment`, entity link footer |
| `FloorConductCard` | `components/updates/FloorConductCard.tsx` | Renders one `floorEntities[]` item: headline, `conductCategories[]` list, `newConductCategory` badge if present, sourced external links |
| `ForwardSignalsList` | `components/updates/ForwardSignalsList.tsx` | Renders `signals[]` as a dated calendar list grouped by week, with priority badge and `actionRequired` |
| `MathHygienePanel` | `components/updates/MathHygienePanel.tsx` | Renders `mathHygiene{}`: cluster count, critical flag callout (styled like `Callout`), `clusterEntities[]` table with severity column, `subThresholdCandidates[]` footnote |
| `BoundaryWatchList` | `components/updates/BoundaryWatchList.tsx` | Renders `boundaryWatchEntities[]` as a compact horizontal chip row or small table, linking to entity pages, with resolved/active state distinction |

The existing `FloorDesignationsPanel` function defined inside `DailyBriefing.tsx` should be moved to `components/updates/FloorDesignationsPanel.tsx` as a named export — it already has a clear boundary.

---

## 4. Accessibility Punch List

Specific items, in order of impact:

1. **Score change cards have no `aria-label`.** A card for "Pakistan — Developing to Critical" announces to a screen reader only as a generic `<div>`. Each card should have `aria-label={`Score change: ${change.entity}, ${change.publishedBand} to ${change.assessedBand}`}` or use a wrapping `<article>` (which TopSignals already does correctly for sector alert cards).

2. **Band transition arrow is `aria-hidden` with no text alternative.** The SVG arrow between `<Band>` components conveys "changed from X to Y" but the only screen reader text is the two `<Band>` labels with no relational context. Add a visually hidden `<span className="sr-only">changed to</span>` between them.

3. **Delta values use color alone to convey direction.** `deltaColor()` returns red/green/gray. The numeric value ("−2.8 pts") does convey direction textually, but the color is the only indicator of severity tier. No WCAG issue for the number itself, but the score card header row needs `aria-label` on the score cluster: `aria-label={`Score revised from ${change.publishedScore} to ${change.assessedScore}, delta ${change.delta}`}`.

4. **Date navigation tabs:** Current tab uses `aria-current="page"` — correct. Non-current tabs are `<Link>` — correct. No issue here.

5. **Evidence list uses `<ol>` with numeric badges** — the numbered badge `<span>` is inside the `<li>` alongside the content. Screen readers will read the list item twice (once the `<ol>` count, once the badge). Use `aria-hidden="true"` on the numeric badge span — this is already done for icon SVGs but not for the numbered circle badges.

6. **`<FloorDesignationsPanel>` dimension code badges** use `title` for the full name. `title` is not reliably exposed by screen readers. Prefer `aria-label` on the `<span>` or a `<abbr>` element.

7. **Confirmation table missing `<caption>`.** The table has `<thead>` with `scope="col"` — good. Needs `<caption className="sr-only">Entities confirmed at current score in this briefing</caption>` so screen readers announce table purpose before reading headers.

8. **`showNewsletter` section `id="newsletter"` is a jump target from the hero CTA.** The `<section>` has the id but no `aria-label`. Add `aria-label="Subscribe to the weekly briefing"`.

---

## 5. Three Specific Frontend Improvements

### A. Render `keyEvidence[]` alongside `evidence[]` in score-change cards (Size: S)

**Problem:** All three May 12 score changes ship `keyEvidence: string[]` and no `evidence[]` objects. The render code checks `change.evidence?.length > 0` and renders nothing. Users see the headline but no supporting evidence on the most important cards in the briefing.

**Fix:** In the evidence rendering block of the score-change card, normalize: if `change.evidence` is empty or absent but `change.keyEvidence` is present, render `keyEvidence` as a plain ordered list with the same bullet style. One `??` check in the normalization. No new components needed.

**Effort:** S (30 minutes, single block in `DailyBriefing.tsx`)

### B. Add a `FloorConductSection` rendering `floorEntities[]` (Size: M)

**Problem:** The three floor conduct documentation entries (Russia, Myanmar, South Sudan) represent the most substantive journalism in the May 12 briefing and are invisible to users. The existing `FloorDesignationsPanel` is a registry lookup that serves a different purpose.

**Fix:** Extract `FloorConductCard.tsx`, add a `<FloorConductSection>` block in `DailyBriefing.tsx` positioned after Score Movements (same visual weight, different color register — use the existing `rgba(244,63,94,...)` floor palette). Each card renders: headline, `conductCategories[]` as a bulleted list, sourced external links with `target="_blank" rel="noopener noreferrer"`, and a `newConductCategory` callout badge if present.

**Effort:** M (2–3 hours: component + section slot + empty-state guard)

### C. Add a `ForwardSignals` section rendering `signals[]` as a dated calendar list (Size: M)

**Problem:** The `signals[]` array contains 11 forward-dated items spanning May 13 to June 9 — the only content in the briefing about what comes next. None of it is rendered. Users can read what happened today but not what the methodology pipeline is tracking.

**Fix:** Extract `ForwardSignalsList.tsx`. Group signals by week (ISO week or simple 7-day bucket). Render each item as a compact row: date badge, entity name (linked if slug resolves), priority chip, signal text, `actionRequired` as a muted secondary line. Position the section near the bottom of the page, before the end-of-page CTA.

**Effort:** M (2–3 hours: component + grouping logic + section slot)

---

## 6. Highest-Impact Single Change

**Render `keyEvidence[]` in score-change cards.**

This is the highest-impact change relative to effort. Every score-change card in the May 12 briefing is currently evidence-free from the user's perspective. The Pakistan band-crossing card — the lead story — shows a headline and a score number with no supporting citation. The CVS and UnitedHealth cards are the same. This is the most direct content-accuracy gap in the current implementation.

---

## 7. Concrete File-by-File Diff Plan for the Top Change

**Files touched: 1**
**File: `site/src/components/updates/DailyBriefing.tsx`**

**Change location:** The evidence rendering block inside the `scoreChanges.map()` call, approximately lines 472–531.

Current logic (abbreviated):
```
{(change.evidence as unknown[])?.length > 0 && (
  <div>
    ...renders evidence objects...
  </div>
)}
```

**Replace with:**
```tsx
{/* Normalize evidence: prefer rich evidence objects; fall back to keyEvidence strings */}
{(() => {
  const richEvidence: unknown[] = Array.isArray(change.evidence) && change.evidence.length > 0
    ? change.evidence
    : [];
  const keyEvidence: string[] = Array.isArray(change.keyEvidence) && change.keyEvidence.length > 0
    ? change.keyEvidence
    : [];
  const hasEvidence = richEvidence.length > 0 || keyEvidence.length > 0;
  if (!hasEvidence) return null;

  return (
    <div>
      <div className="text-[0.78rem] font-bold uppercase tracking-widest text-muted mb-3">
        Evidence record
      </div>
      <ol className="space-y-2.5">
        {richEvidence.length > 0
          ? richEvidence.map((evRaw: unknown, i: number) => {
              /* existing rich-object rendering — unchanged */
              ...
            })
          : keyEvidence.map((finding: string, i: number) => (
              <li key={i} className="flex gap-3">
                <span
                  className="text-[0.78rem] font-bold shrink-0 mt-[2px] w-5 h-5 rounded-full flex items-center justify-center border"
                  aria-hidden="true"
                  style={{
                    color: deltaColor(change.delta),
                    borderColor: `${deltaColor(change.delta)}44`,
                    background: `${deltaColor(change.delta)}11`,
                  }}
                >
                  {i + 1}
                </span>
                <div
                  className="flex-1 text-muted text-[0.9rem] leading-relaxed pl-3 border-l"
                  style={{ borderColor: `${deltaColor(change.delta)}28` }}
                >
                  {finding}
                </div>
              </li>
            ))}
      </ol>
    </div>
  );
})()}
```

No new files. No new dependencies. The existing rich-evidence render path is preserved exactly; `keyEvidence` is additive. One test: build with `2026-05-12.json` and verify all three score-change cards now show numbered evidence bullets.

---

## Additional Notes

**Dark theme adherence:** `DailyBriefing.tsx` and `TopSignals.tsx` both use hardcoded hex colors extensively (`#7dd3fc`, `#f87171`, `#fb923c`, `#86efac`, `#fcd34d`). These match the `@theme` values in `globals.css` exactly, so there is no visual drift today. However, if a theme token is ever changed in `globals.css`, the hardcoded values will silently diverge. Medium-term: define Tailwind theme aliases for the band colors so they can be used as classes (`text-band-red`, etc.) instead of inline styles. This is a pattern improvement, not a current bug.

**Empty-state on quiet cycles:** `DailyBriefing.tsx` correctly defaults all arrays to `[]` and renders nothing for empty sections. `TopSignals.tsx` has an explicit `return null` when both `sectorAlerts` and `scoreChanges` are empty. The empty-state handling is sound for the rendered sections; it is not yet relevant for the unrendered sections since they have no render path at all.

**Prev/next cross-cycle navigation:** The date nav tabs show the 5 most recent dates. There is no prev/next link on individual archive pages — only the tab strip and the "Back to latest" archive banner. For a user on the May 9 page, linking to "Pakistan watch first flagged May 8" requires manually navigating to May 8 in the tab strip. This is a UX gap but not a technical defect. A `prev`/`next` pair could be generated from `manifest.dates` at build time with minimal effort (S).

**Performance:** 640-line JSON parsed at SSG build time is not a concern. If chart visualizations are added (e.g., delta history sparklines), the budget question becomes: are the historical data points inlined into each daily JSON, or fetched separately? Keep historical data out of the daily JSON files — load them as separate JSON imports per entity page rather than embedding them in the briefing.
