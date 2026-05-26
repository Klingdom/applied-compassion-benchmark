# Architecture — Entity Evidence Surfacing & Retention Tiering

Owner: Phil Kling (solo)
Status: Recommendation, ready for product review
Date: 2026-05-26
Author: System Architect agent

This document specifies how recent score-change evidence and methodology rulings surface directly on entity detail pages (`/country/<slug>`, `/company/<slug>`, `/ai-lab/<slug>`, etc.), and how the existing per-entity history JSON is extended to support a deterministic retention-tiering scheme. It is the operational follow-up to `docs/ARCHITECTURE_ARCHIVE.md` §2.

Scope: build pipeline, data shape, route impact, retention policy. Out of scope: search behavior (already specified in archive doc §3), feeds (§4), commercial alerts.

---

## 1. North-star data flow

```
┌────────────────────────────────────────────────────────────────────────┐
│  SOURCE OF TRUTH (committed, append-only)                              │
│  site/src/data/updates/daily/<date>.json                                │
│    ├── topSignals[]               (headline-level evidence + delta)    │
│    ├── boundaryWatch[]            (cycle, trigger, note)               │
│    ├── recentAssessments[]        (whyHeadline, status, delta, score)  │
│    ├── methodologyNotes[]         (rulings, version, status)           │
│    └── pipeline.subThresholdMovements*  (daily aggregate counts)       │
└────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼  build-time, deterministic
┌────────────────────────────────────────────────────────────────────────┐
│  BUILD STEP — site/scripts/build-entity-history.mjs (EXTENDED)          │
│   • iterates manifest.dates (reverse-chrono)                            │
│   • for each entity, collects events                                    │
│   • NEW: classifies each event into retention tier A/B/C/D              │
│   • NEW: detects methodology rulings that name the entity slug          │
│   • NEW: computes derived fields (daysSinceLastChange, eventCount)      │
│   • NEW: compacts Tier-D events older than COMPACTION_AGE               │
└────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼  writes
┌────────────────────────────────────────────────────────────────────────┐
│  AGGREGATE                                                              │
│  site/public/data/history/<slug>.json (EXTENDED SHAPE)                  │
│  site/public/data/history/_manifest.json (counts by tier)               │
└────────────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴──────────────────────────┐
              ▼                                          ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────────┐
│  ENTITY PAGE (extended)          │   │  HISTORY PAGE (existing PR 2)       │
│  /<kind>/<slug>                  │   │  /<kind>/<slug>/history             │
│   ├── Hero + bands               │   │   • renders Tier A + B chronological│
│   ├── EntityEvidenceCard  NEW    │   │   • renders Tier D as collapsed      │
│   │    – latest Tier-A event     │   │     "N sub-threshold movements"     │
│   │    – methodology rulings     │   │   • Tier C reachable only from      │
│   │    – days-since-last-change  │   │     search / archive                │
│   │    – link to /history        │   │                                     │
│   └── Existing CTAs              │   │                                     │
└─────────────────────────────────┘   └─────────────────────────────────────┘
```

Key design property: the entity page reads a single JSON file (the per-entity aggregate). It does NOT scan daily briefings at request time, at build time, or at all. Every fact on the page is the deterministic output of one build pass over `daily/*.json`.

---

## 2. Data model extensions

The current shape lives in `site/src/types/entity-history.ts` (lines 6–33) and is written by `site/scripts/build-entity-history.mjs` (lines 265–293). It already carries `events[]`, `scoredEventCount`, `boundaryWatchCount`, `firstEventDate`, `lastEventDate`.

### 2.1 Per-event additions

Add three fields to `HistoryEvent`:

| Field | Type | Purpose |
|---|---|---|
| `tier` | `"A" \| "B" \| "C" \| "D"` | Retention classification (see §3). |
| `delta` (existing) | `number \| null` | Already present. |
| `subThreshold` | `boolean` | `true` when the event is a recorded sub-threshold movement (delta below ±0.5 floor but documented). Drives Tier-B/D classification. |
| `directionLabel` | `"upward" \| "downward" \| "hold" \| null` | Direction signal even when `delta` is null (e.g., boundary-watch with no scored move). Surfaced in entity card. |
| `rulingRef` | `{ rulingNumber: number, name: string, version: string } \| null` | Populated when the event corresponds to (or is governed by) a methodology ruling that names this slug. Set from `methodologyNotes[]` in the same briefing. |

### 2.2 Per-entity additions (top-level)

| Field | Type | Purpose |
|---|---|---|
| `latestScoreChange` | `HistoryEvent \| null` | The most recent Tier-A scored event with non-zero `delta`. The entity-evidence card renders this. Null when entity has only Tier-B/C/D events. |
| `methodologyRulings` | `MethodologyRulingRef[]` | Distinct rulings linked to this entity, newest first. See shape below. |
| `daysSinceLastChange` | `number \| null` | Days between today (`generatedAt` date) and the most recent Tier-A `latestScoreChange.date`. Null when no Tier-A exists. |
| `totalEventCount` | `number` | All events across all tiers, pre-compaction. |
| `tierCounts` | `{ A: number, B: number, C: number, D: number }` | Counts by tier post-compaction. Used by the entity card to render "+N more events". |
| `compactedRuns` | `CompactedRun[]` | Roll-up entries for Tier-D events older than `COMPACTION_AGE_DAYS` (see §3). |

```jsonc
// MethodologyRulingRef
{
  "rulingNumber": 5,
  "name": "EU-PARLIAMENTARY-URGING-OF-CONDITIONALITY-MECHANISM",
  "version": "v1.6",
  "establishedDate": "2026-05-25",
  "briefingPath": "/updates/2026-05-25",
  "summary": "EP plenary resolution backed by supermajority of four or more political groups urging the Commission to invoke the conditionality mechanism = Tier-1.5 formal apply."
}

// CompactedRun (replaces N individual Tier-D events in events[])
{
  "type": "compacted-sub-threshold",
  "tier": "D",
  "fromDate": "2026-04-15",
  "toDate": "2026-05-10",
  "count": 7,
  "netDirection": "downward",   // sign of summed magnitudes
  "netMagnitude": -2.4,         // sum of recorded sub-threshold deltas (non-binding; informational)
  "briefingPaths": ["/updates/2026-04-15", ...]
}
```

### 2.3 Manifest additions

`_manifest.json` gains a `tierCountsAcrossAll: { A, B, C, D, compactedRuns }` block so the build-manifest observability story (see `docs/ARCHITECTURE_ARCHIVE.md` §7 build-observability block) extends without a second pass.

---

## 3. Retention policy mechanics

Tiering happens at build time. The rule set is deterministic, derivable purely from the daily briefing JSON, and reversible — change the thresholds and re-run the build.

### 3.1 Tier definitions

| Tier | Meaning | Surface |
|---|---|---|
| **A — Always-visible** | High-signal events that define the entity's record. Surfaced on entity page card AND history page. Never compacted. | Entity page card, history page, search. |
| **B — History-only** | Real cycle events that contribute context but don't dominate the headline. Surfaced on history page in full. | History page, search. |
| **C — Archive-only** | Events emitted by daily monitoring that produced no entity-specific signal. Reachable only via search and the date-based archive index. | Search, archive index. |
| **D — Compactable** | Sub-threshold movements and stale watch cycles that age out of full rendering. Rolled up into a `CompactedRun` after `COMPACTION_AGE_DAYS`. | History page (collapsed run), search. |

### 3.2 Classification rules (build-time, deterministic)

Apply in order. First matching rule wins.

1. **Tier A** if either:
   - `type === "scored"` AND `delta !== null` AND `Math.abs(delta) >= 0.5`, OR
   - the briefing's `methodologyNotes[]` contains a ruling whose `description` matches this entity by slug OR by the briefing's `topSignals` entry pointing at this slug (rulings linked to the entity are always Tier A and populate `rulingRef`).
2. **Tier A** if `type === "scored"` AND `status === "applied"` (regardless of delta — a formal apply is always Tier A, including first-baselines where delta calculation is artifactual).
3. **Tier B** if `type === "boundary-watch"` (cycle data is real evidence of monitoring; but the entity page card surfaces only the latest one as a freshness signal, not as a "score change").
4. **Tier B** if `type === "scored"` AND `0 < Math.abs(delta) < 0.5` (sub-threshold movement explicitly documented in `recentAssessments`).
5. **Tier C** if `type === "scored"` AND `delta === 0` AND `status` ∈ {`"documented"`, `null`, `"pending"`} (assessed-and-held; visible only in the date archive and search, not on the entity page card).
6. **Tier D** if a Tier-B sub-threshold event is older than `COMPACTION_AGE_DAYS` (see 3.3).

### 3.3 Tier-D compaction

- `COMPACTION_AGE_DAYS = 90` (default; flagged for product confirmation in §8).
- During the build, after initial tiering: every Tier-B event whose `date` is older than `(generatedAt - COMPACTION_AGE_DAYS)` is removed from `events[]` and folded into the per-entity `compactedRuns[]`.
- Adjacent compacted-eligible events (same `directionLabel`, contiguous within a 30-day rolling window) are merged into a single `CompactedRun` with `fromDate` = oldest, `toDate` = newest, `count` = number folded, `netMagnitude` = sum of recorded sub-threshold deltas.
- The `HistoryTimeline` component renders `CompactedRun` entries as a single accordion: "7 sub-threshold movements between 2026-04-15 and 2026-05-10 (net −2.4, downward)" with the option to expand and show source briefing links.

### 3.4 What never compacts

- Tier A — never.
- `rulingRef !== null` — never (a methodology ruling about this entity is permanent context).
- Most recent Tier-B event — never (we always keep at least one full boundary-watch cycle visible so the entity page can show "monitored on 2026-05-25" even when no scoring happened).

---

## 4. Build pipeline impact

### 4.1 Script ownership

**Extend** `site/scripts/build-entity-history.mjs`. Do not create a new script.

The existing script (lines 88–207) already iterates `manifest.dates`, reads each daily JSON, and accumulates events per entity key. Adding tier classification, ruling extraction, and compaction is incremental work in the same loop — splitting into two scripts would force two passes over the same JSONs.

New responsibilities, in order, inside `main()`:
1. After event accumulation, scan `daily.methodologyNotes[]` per date and resolve which entity slugs each ruling references (slug appears in `description` text OR in the day's `topSignals` entries with matching slug). Populate per-entity `methodologyRulings[]`.
2. After per-entity loop completes, classify each event into Tier A/B/C/D via §3.2 rules.
3. Compute `latestScoreChange`, `daysSinceLastChange`, `totalEventCount`, `tierCounts`.
4. Apply Tier-D compaction (§3.3): mutate `events[]` and produce `compactedRuns[]`.
5. Write the extended JSON.

### 4.2 Build time impact

At current scale (42 briefings × ~20 assessments/day + 6–8 boundary-watch + 1 methodology note), the additional work is O(events_per_entity) — bounded by the existing pass cost. Estimate: **+5–10% to the prebuild step**, dominated by additional string scans against `methodologyNotes[].description`.

At 250 briefings (year 1) the script still runs in the same complexity class. The script-level cost will remain well under 10 seconds.

### 4.3 Cache key implications

The per-entity history JSON is the cache boundary. CDN/browser caches key on URL + content hash. When today's briefing lands:
- Only entity slugs touched by today's briefing get rewritten (set: today's `recentAssessments.slug` ∪ today's `boundaryWatch.slug` ∪ today's `methodologyNotes`-referenced slugs ∪ entities whose Tier-D compaction window rolled over).
- Other entities' history JSONs are byte-identical → caches stay warm.

Implementation note: emit files via the existing `writeFileSync` pattern; rely on the build-manifest hash for downstream cache busting. No new cache invalidation mechanism required.

---

## 5. Component changes

No code in this document. Components to touch:

- **New: `<EntityEvidenceCard>`** (`site/src/components/entity/EntityEvidenceCard.tsx`).
  Props: `EntityHistory["latestScoreChange"]`, `EntityHistory["methodologyRulings"]`, `EntityHistory["daysSinceLastChange"]`, `EntityHistory["tierCounts"]`, `historyHref`.
  Renders nothing when `tierCounts.A === 0 && methodologyRulings.length === 0` (empty-state hide; see §7).
- **Modified: `EntityDetail.tsx`** (`site/src/components/entity/EntityDetail.tsx`).
  Insert `<EntityEvidenceCard>` between the existing "Evidence-review freshness stamp" section (line 146) and the "Floor-designation disclosure" section (line 180). The existing `latestChange` prop and "Latest score change callout" block (lines 298–347) is **superseded** by the new card; remove the inline block once the new card ships.
- **Modified: `renderEntityPage.tsx`**. Replace the `getLatestChange()` call (line 73) with `getEntityHistory(entity.slug)?.latestScoreChange`. Pass the full `EntityHistory` summary fields needed by `<EntityEvidenceCard>` as props.
- **Modified: `HistoryTimeline.tsx`** (`site/src/components/entity/HistoryTimeline.tsx`).
  Add rendering for `compactedRuns[]` entries (a collapsed accordion list) and a small per-card "Tier A" / "Tier B" affordance for accessibility. The empty-state branch (lines 188–228) is unaffected.
- **Modified: `entity-history.ts` types**. Add the new fields per §2.

The data-loading helper (`site/src/data/history/index.ts`) needs no change — it already reads `/public/data/history/<slug>.json` whole.

---

## 6. Static-export constraints

Every route remains statically exported. Reaffirmed:

- `/<kind>/<slug>` — already pre-rendered. The entity-evidence card reads from `getEntityHistory(slug)` at build time inside the page component (server component). No client fetch.
- `/<kind>/<slug>/history` — already pre-rendered (PR 2). Reads same JSON.
- `/updates/<date>` — unchanged.
- No new routes.

### 6.1 Cache invalidation when a new briefing lands

A new daily briefing triggers the prebuild → `build-entity-history.mjs` rewrites only entities touched by the briefing → `next build` re-emits only the corresponding static HTML pages.

Concretely, when `2026-05-26.json` is published, the routes that need rebuilding are:
- `/<kind>/<slug>` for every slug in `recentAssessments[] ∪ boundaryWatch[]` of that briefing.
- `/<kind>/<slug>/history` for the same slugs.
- `/updates/archive` (the date list grows).
- `/updates/2026-05-26` (the new briefing).
- The sitemap and feeds.

Untouched entities' static HTML is byte-stable — Next.js's content-hash output naming preserves the existing files. nginx `Cache-Control: immutable` continues to work.

### 6.2 Next.js 16 verification

Per `site/AGENTS.md`: "This is NOT the Next.js you know." Before implementation, the engineering agent MUST re-verify in `node_modules/next/dist/docs/`:
- `params: Promise<{ slug: string }>` semantics (used in `renderEntityPage.tsx` line 30, `renderHistoryPage.tsx` line 62).
- `generateStaticParams` contract under `output: "export"`.
- That `readFileSync` from `process.cwd()/public/data/history/` resolves correctly at build time (already does — confirmed in `site/src/data/history/index.ts` lines 16–18).

No change in Next.js conventions required by this work. All extensions stay inside the existing build-time data pattern.

---

## 7. Risks and tradeoffs

1. **Coupling: entity pages now depend on history aggregation succeeding.**
   Today `renderEntityPage.tsx` calls `getLatestChange()` (`entityChanges.ts`), which is a separate in-memory scan of `daily/*.json`. After this work, entity pages depend on `getEntityHistory()` reading the prebuild output. If `build-entity-history.mjs` fails or is skipped, entity pages render with `latestScoreChange = null` (and the card hides itself — see point 2). **Mitigation:** the prebuild script must exit non-zero on failure (it already does at line 65 and 71). CI must run prebuild before `next build`. The fallback path in `renderEntityPage.tsx` should be: missing JSON → render entity page without the evidence card (degrade gracefully, do not fail the build).

2. **Empty state for entities with zero events.**
   When `tierCounts.A === 0 && methodologyRulings.length === 0`, `<EntityEvidenceCard>` returns null. The card is not shown. The existing "View score history →" link (currently rendered conditionally via `hasEntityHistory()` in `renderEntityPage.tsx` line 76) continues to gate the history-page link. No empty-state rendering on the entity page.

3. **Build-time vs request-time confirmation.**
   Confirmed: all entity page data is build-time. There is no client fetch for evidence card content. The single client-side aspect remains the existing badge embed widget (unrelated).

4. **Methodology-ruling slug detection is heuristic.**
   `methodologyNotes[].description` is free text; matching it to slugs via substring of the slug name (e.g., "Slovakia" → `slovakia`) will produce false positives for short slugs ("3m", "us"). **Mitigation:** require co-occurrence with a `topSignals` entry on the same date whose `slug` matches. The `topSignals` array already carries explicit `slug` fields (see `2026-05-25.json` line 30, 39, 47…), making the join deterministic. Rulings with no co-occurring `topSignals` slug attach only to the entities named explicitly in the assessment's `recentAssessments` block for that date.

5. **Compaction is destructive of granular browsing.**
   Once Tier-D compaction runs, the individual sub-threshold events are no longer in `events[]`. They remain reachable via the underlying `daily/<date>.json` (the source of truth is never modified) and via `compactedRuns[].briefingPaths`. The history page must surface those briefing links inside the accordion expansion so the user can still click through.

6. **Tier-C events are invisible to entity-page visitors.**
   This is intentional — Tier C is the "monitored, no signal" floor. They remain in search and in the archive. Risk: a visitor who arrives via a `/updates/<date>` page and clicks through to an entity page may see no evidence card even though that date's briefing referenced the entity. **Mitigation:** the daysSinceLastChange counter on the card (when present) implies recency; for entities with only Tier-C activity, the card is hidden entirely, which is correct — there is no scoring signal worth surfacing.

---

## 8. Open questions for product-manager

Each is non-trivial and should be resolved before PR 2 of the sequence (§9):

1. **What is `COMPACTION_AGE_DAYS`?** Default proposed: **90**. Trade-off: shorter → more aggressive compaction, less timeline noise; longer → richer per-cycle audit trail. Product should confirm 90 is acceptable or pick a value.
2. **Should boundary-watch cycles ever appear on the entity-evidence card?** Current proposal: no — only the most-recent date is implicitly visible via `daysSinceLastChange`. Boundary-watch detail lives on the history page. Product to confirm we don't surface "On boundary watch — cycle 7" prominently on the entity page.
3. **Where do methodology rulings link?** Two options: (a) the originating briefing date (`/updates/<date>` — exists today); (b) a global `/methodology/rulings#ruling-5` anchor on a methodology page (does not exist yet). Recommendation: link to (a) for v1; a future PR can introduce a global ruling index page and switch the links.
4. **Should Tier-A include first-baselines?** Proposal: yes — rule 3.2.2 forces any `status === "applied"` event to Tier A, including first-baselines where the delta calculation is methodologically artifactual (e.g., the May 22 Slovakia entry, `slovakia.json` event 3). Product to confirm; alternative would be a `firstBaseline` flag and a separate tier rule.

---

## 9. Suggested PR breakdown

Three PRs. Sequenced. Each leaves the site in a working state.

### PR 1 — Data model & build pipeline (highest risk)

**Scope:**
- Extend `site/src/types/entity-history.ts` with new fields (§2).
- Extend `site/scripts/build-entity-history.mjs` to compute tiers, link methodology rulings, compute derived fields, and apply Tier-D compaction.
- Extend `_manifest.json` with `tierCountsAcrossAll`.
- Update the build-manifest observability block (`site/scripts/build-manifest.mjs` if present, or wherever counters live) with new tier counters.
- **No UI changes.**

**Risk:** medium-high. This PR locks the data shape that PRs 2/3 depend on. Mis-classification rules are the most likely defect.

**Effort:** ~6–8 hours (including unit-test coverage of the tiering function with fixtures from Slovakia, Turkey, Anthropic).

**Acceptance:**
- Existing history pages still render (no regression).
- `slovakia.json`, `turkey.json`, `anthropic.json` show populated `latestScoreChange`, `tierCounts`, `methodologyRulings` (Slovakia should reference Ruling 5).
- Tier-D compaction does not yet engage (compaction-age threshold won't trigger on May 2026 dates yet, but the code path must be exercised by a synthetic fixture).

### PR 2 — `<EntityEvidenceCard>` on entity pages

**Scope:**
- New component `site/src/components/entity/EntityEvidenceCard.tsx`.
- Insert into `EntityDetail.tsx` between the freshness stamp and floor-designation sections.
- Remove the old inline "Latest score change callout" block (lines 298–347) once the new card covers its job.
- Update `renderEntityPage.tsx` to source data from `getEntityHistory()` instead of `getLatestChange()`.
- Add JSON-LD `Rating` extension to surface `mostRecentEvent.date` and `mostRecentEvent.delta` where present.

**Risk:** low-medium. UI work, deterministic data input from PR 1.

**Effort:** ~5–7 hours.

**Acceptance:**
- Slovakia entity page shows a card with the −2.0 May 25 event, the Ruling-5 methodology badge, "View score history →" link, and "1 day since last change" counter.
- Turkey entity page shows the May 24 −2.5 event and a boundary-watch indicator.
- Entities with zero Tier-A events show no card (e.g., a never-assessed Fortune 500 company renders the page identically to today).

### PR 3 — History page rendering of compacted runs (lowest risk)

**Scope:**
- Update `HistoryTimeline.tsx` to render `compactedRuns[]` as an accordion-style "N movements between X and Y" entry, expandable to show source briefing links.
- Add per-card Tier badge for accessibility (subtle; A/B only — C never appears here, D appears only as compacted).
- Update the page metadata description to mention compacted-run totals when present.

**Risk:** low. Pure UI; falls back gracefully when no compacted runs exist (which is true today for all 42 briefings).

**Effort:** ~3–4 hours.

**Acceptance:**
- Synthetic test fixture with 7 compaction-eligible events older than `COMPACTION_AGE_DAYS` renders as a single accordion.
- Real-data history pages (today) render identically to PR 2 baseline — no compaction yet.

### Total estimated effort

**~14–19 hours** across the three PRs.

The most risk-loaded PR is **PR 1** — it locks the data shape. Get the tiering rules and the methodology-ruling slug-resolution heuristic right before PR 2 begins.

---

## 10. Handoff

- **Build pipeline / data:** PR 1 (extend `build-entity-history.mjs`, types).
- **Frontend:** PR 2 (new card + entity page integration), PR 3 (history-page compaction rendering).
- **Devops:** no changes. Static-export only; nginx serves the regenerated JSON and HTML as today.
- **Product:** resolve §8 open questions before PR 1 lands.

All downstream agents should read this document and `docs/ARCHITECTURE_ARCHIVE.md` before implementing. Architecture-level questions return here; implementation questions go to the relevant subagent.
