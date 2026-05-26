# Entity Evidence & Retention — PR Plan (for review & approval)

Owner: Phil Kling
Status: **Ready for review** — implementation not started
Date: 2026-05-26
Author: Coordinator (AI CTO) — synthesized from 4 specialist agents

This document is the approval artifact. Once signed off, individual implementation tickets get dispatched to backend/frontend engineers in sequence — same pattern as the archive PR plan.

---

## Why this matters (90 seconds)

A visitor who lands on `/country/slovakia` today sees a current score of **31.6 (Developing)** — but no indication that this reflects three score changes over 18 days (May 7 −10.9, May 22 −5.5, May 25 −2.0), or that a new Tier-1.5 methodology category (Ruling 5) was established in the same cycle. The evidence is **in the system** — `site/public/data/history/slovakia.json` and the daily briefings — but the entity page never surfaces it.

Two compounding problems:

1. **Traceability gap.** Score changes + the evidence behind them are 1–2 clicks away from the entity page, but visitors don't know it exists.
2. **Retention drift.** At day 41 of the research pipeline, Anthropic has 21 events in its history JSON, six of which are near-duplicate boundary-watch cycles. At day 200, this becomes noise that buries the 3–4 events that actually explain the score.

Building this is **mostly wiring up data that already exists** + adding a deterministic tier classifier at build time. No new routes. No client fetches. Static export preserved.

---

## Source artifacts (subagent outputs feeding this plan)

| Document | Author | Key decision |
|---|---|---|
| `docs/PRD_ENTITY_EVIDENCE_RETENTION.md` | product-manager | Tier model: A (entity page) / B (history) / C (briefings) / D (deferred to ≥50 events or ≥14 watch cycles) |
| `docs/ARCHITECTURE_ENTITY_EVIDENCE_RETENTION.md` | system-architect | Extend `build-entity-history.mjs` in-place; per-event 4 new fields, per-entity 6 derived fields; Tier-D = 90-day compaction window |
| `docs/UX_FLOWS_ENTITY_EVIDENCE.md` | ux-designer | Evidence card placed after hero + freshness stamp, **before** dimensions; **replaces** existing single-event "Latest research update" block — net addition ~2 rows |
| `docs/METRICS_ENTITY_EVIDENCE.md` | analytics | Top 3 events: `entity_evidence_card_viewed`, `entity_evidence_card_clicked` (target=history-link), `entity_history_arrival_path`; Tier-D revision threshold = 15% rollup-expansion rate |

Read those four docs for the full reasoning. This document captures the **execution sequence**.

---

## Architectural North Star

```
   ┌────────────────────────────────────────────────────────────────┐
   │ DAILY BRIEFINGS (source of truth, immutable)                    │
   │ site/src/data/updates/daily/<date>.json                         │
   └─────────────────────┬──────────────────────────────────────────┘
                         │ build-time, deterministic
                         ▼
   ┌────────────────────────────────────────────────────────────────┐
   │ EXTENDED build-entity-history.mjs                               │
   │ • Tiering rules A/B/C/D                                         │
   │ • Methodology-ruling → slug resolution                           │
   │ • Derived: latestScoreChange, daysSinceLastChange,               │
   │   methodologyRulings[], tierCounts, compactedRuns                │
   │ • Tier-D compaction (>90 days, sub-threshold only)               │
   └─────────────────────┬──────────────────────────────────────────┘
                         │ writes
                         ▼
   ┌────────────────────────────────────────────────────────────────┐
   │ public/data/history/<slug>.json (extended shape, single read)   │
   └─────────────────────┬──────────────────────────────────────────┘
                         │
       ┌─────────────────┴──────────────────┐
       ▼                                    ▼
  ┌──────────────────────────┐    ┌──────────────────────────┐
  │ /<kind>/<slug>           │    │ /<kind>/<slug>/history    │
  │ + <EntityEvidenceCard>   │    │ + compactedRuns rendering │
  │   (new — replaces        │    │ + Tier badges (a11y)      │
  │   existing 1-event       │    │ (already exists; extended) │
  │   "Latest change" block) │    │                           │
  └──────────────────────────┘    └──────────────────────────┘
```

**Key property:** Entity pages read **one JSON file** (the per-entity aggregate). They never scan daily briefings at request time or build time. Every fact on the page is the deterministic output of one build pass.

**No new routes. No new dependencies. No client fetches.**

---

## Decisions captured (from specialist outputs)

These came back as explicit recommendations or required answers. Logged here so they're not re-litigated mid-implementation.

| Decision | Choice | Source |
|---|---|---|
| Card placement | After hero + freshness stamp, **before** dimension bars. **Replaces** existing 1-event "Latest research update" block (EntityDetail.tsx lines 297–347). | UX §2 |
| Number of events in card | 1–3 most recent scored events (`type=scored`, `abs(delta)≥0.5`), newest first | PRD §4.1 |
| Methodology ruling callout | Conditional. Render only when ruling explicitly references slug. Resolution: ruling's `description` text co-occurs with same-date `topSignals[]` entry whose `slug` field matches (deterministic; avoids "3m"/"us" false positives) | Architect §7.4 |
| Boundary-watch banner | Show only when most-recent event is unresolved watch cycle. Compact row below hero, distinct from score-change card | PRD §4.2 |
| `COMPACTION_AGE_DAYS` | 90 (default; revisit if needed) | Architect §3.3, §8.1 |
| Tier-D in MVP | **Deferred.** Code path exists, but no entity reaches the threshold yet. Synthetic test fixture exercises the path | PRD §3 + Architect §9 PR 1 |
| Methodology link target | Originating briefing date (`/updates/<date>`). No global `/methodology` page exists yet — that's a separate future PR | Architect §8.3 |
| First-baselines | Tier A always — any `status="applied"` event is Tier A regardless of delta | Architect §3.2 rule 2 |
| Independence policy guardrails | Section heading = "Assessment record" or "Recent assessments" — never "Alerts" / "Risk" / "Warning". No Score-Watch CTA adjacent to card. Delta colors match band colors (no red alert tones) | PRD §6.2 |

---

## Open questions deferred to implementation

These came back from the specialists with no clean answer. Each becomes a flag for the engineer who picks up the relevant PR.

### Q1 — Build-cycle synchronization (PM's top flag)

> "How does `renderEntityPage.tsx` import history data such that the displayed score and the evidence card always reflect the same build cycle?"

**Resolution (from architect §5):** `renderEntityPage.tsx` already imports from `site/src/data/indexes/` for the score. Add a call to `getEntityHistory(slug)` (existing helper at `site/src/data/history/index.ts`) which reads `public/data/history/<slug>.json` at build time via `readFileSync`. Both reads happen in the same build pass; cache invalidation is per-entity (only touched entities get rewritten).

→ Architect resolved this. **No further action needed.**

### Q2 — External citation URL (UX's top flag)

> "The history JSON stores only `briefingPath` (internal). Journalists need a primary-source link (EU Parliament press release, court ruling, etc.). Is `citationUrl` in scope?"

**Recommendation: DEFER to Phase 2.** Rationale:
- The current pipeline doesn't structure citation URLs separately — they're embedded in `whyHeadline` / `description` free text
- Adding `citationUrl` to the history JSON requires a pipeline change (assessor agent must extract structured citations)
- MVP ships with `briefingPath` (internal link). Journalists get the briefing, which references the source
- Phase 2 PR adds structured citations after the pipeline is extended

→ **Confirm this with Phil before PR 1.** If you want external citations in MVP, PR 1 effort grows by ~3–4h for the pipeline change.

### Q3 — Sub-threshold movements in history JSON (PRD A5)

> The current history schema has only `scored` and `boundary-watch` types. Sub-threshold movements (delta < ±0.5, documented) aren't in `events[]` — they only live in briefing `summary` / `topSignals`.

**Resolution:** Out of MVP scope. PR 1's tier classifier handles them when they appear, but does not back-fill. Future pipeline work adds them.

→ Flagged, deferred. No PR 1 dependency.

---

## PR Plan — 3 PRs for MVP

PRs are **independently reviewable** and each leaves the site in a working state. Same pattern as the archive PR plan.

---

### PR 1 — Data model + build pipeline extension
**Branch:** `feat/entity-evidence-data`
**Risk:** 🟡 Medium (locks the data shape for PR 2 + 3)
**Estimated effort:** ~6–8 hours
**Depends on:** none (architectural foundation)

#### Scope
1. Extend `site/src/types/entity-history.ts`:
   - Per-event: add `tier`, `subThreshold`, `directionLabel`, `rulingRef`
   - Per-entity: add `latestScoreChange`, `methodologyRulings`, `daysSinceLastChange`, `totalEventCount`, `tierCounts`, `compactedRuns`
2. Extend `site/scripts/build-entity-history.mjs`:
   - Implement tier classification per architect §3.2 (5 rules, applied in order)
   - Implement methodology-ruling → entity slug resolution with `topSignals` co-occurrence guard (architect §7.4)
   - Compute derived fields (`latestScoreChange`, `daysSinceLastChange`, etc.)
   - Implement Tier-D compaction (90 days default; code path exists, may not engage on real data yet)
3. Extend `public/data/history/_manifest.json` with `tierCountsAcrossAll: { A, B, C, D, compactedRuns }`
4. Add unit-test fixture (`site/scripts/__tests__/build-entity-history.test.mjs` or similar) covering:
   - Slovakia → 3 scored events Tier A, Ruling 5 in `methodologyRulings[]`
   - Turkey → mixed scored + boundary-watch
   - Anthropic → 7 consecutive watch cycles (tier B; only most recent kept visible on entity card via §3.4)
   - Synthetic entity with 7 sub-threshold events >90 days old → single `CompactedRun`
5. **No UI changes** in this PR

#### Acceptance criteria
- [ ] `npm run build` exits 0
- [ ] `npm test` still passes (existing 80 + new fixture tests)
- [ ] Inspecting `public/data/history/slovakia.json`: `latestScoreChange` = May 25 −2.0 event, `methodologyRulings[0].rulingNumber` = 5
- [ ] Inspecting `public/data/history/anthropic.json`: 7 boundary-watch events all classified Tier B, methodology rulings (if any) populated
- [ ] Inspecting `public/data/history/turkey.json`: `daysSinceLastChange` reflects May 24/25 event
- [ ] Inspecting `_manifest.json`: `tierCountsAcrossAll` block present
- [ ] Existing history pages still render identically (no regression — UI hasn't changed yet)
- [ ] Build time delta < 10% on prebuild step

#### Rollback
Revert PR. `build-entity-history.mjs` was previously functional; the diff is additive. Entity pages and history pages are untouched.

---

### PR 2 — `<EntityEvidenceCard>` on entity pages
**Branch:** `feat/entity-evidence-card`
**Risk:** 🟡 Medium (visible UI change on every entity page; affects ~1,150 pages)
**Estimated effort:** ~5–7 hours
**Depends on:** PR 1 (consumes the new data shape)

#### Scope
1. New component: `site/src/components/entity/EntityEvidenceCard.tsx`
   - Props: `latestScoreChange`, `methodologyRulings[]`, `daysSinceLastChange`, `tierCounts`, `historyHref`
   - Returns null when `tierCounts.A === 0 && methodologyRulings.length === 0` (no card on entities with zero evidence)
   - Renders per UX §3:
     - Section heading: "Assessment record" (independence-policy compliant)
     - Up to 3 score-change rows: date · delta badge · headline (truncated 120 chars) · briefing link
     - Methodology rulings callout (conditional): ruling date · name · briefing link
     - Boundary-watch banner (conditional): direction + cycle + trigger (compact, below hero)
     - Footer: "View full history (N events) →" linking to `/<kind>/<slug>/history`
2. Modify `site/src/components/entity/EntityDetail.tsx`:
   - Insert `<EntityEvidenceCard>` between freshness stamp (line ~146) and floor-designation (line ~180)
   - **Remove** the existing "Latest score change callout" block (lines 297–347) — superseded
3. Modify `site/src/components/entity/renderEntityPage.tsx`:
   - Replace `getLatestChange()` call with `getEntityHistory(slug)`
   - Pass `EntityHistory` summary fields as props to `<EntityEvidenceCard>`
4. Add JSON-LD `Rating` extension (optional polish) to surface `mostRecentEvent.date` and `delta` in structured data
5. Add cross-link from EntityEvidenceCard footer to `/<kind>/<slug>/history?from=entity-page` (the `from` query param is required by analytics PR per METRICS doc — even though analytics events aren't wired in this PR, the URL convention must be established now)

#### Acceptance criteria
- [ ] `npm run build` exits 0
- [ ] `/country/slovakia` shows card with: May 25 −2.0 event, Ruling 5 badge, "View full history (4 events) →" link, "1 day since last change" counter
- [ ] `/country/turkey` shows card with last 3 score-change events + boundary-watch indicator (most recent date)
- [ ] `/ai-lab/anthropic` shows card with most recent scored events; boundary-watch banner "On boundary watch — cycle 7"
- [ ] Entity with zero events (random Fortune 500 with no signal) renders identically to today
- [ ] Independence-policy QA:
  - [ ] Heading text = "Assessment record" or "Recent assessments" (NOT "Alerts" / "Risk" / "Warning")
  - [ ] No Score-Watch CTA adjacent to card (existing position below dimensions preserved)
  - [ ] Delta badge colors match band tokens (orange/green; not red alert)
- [ ] Mobile (375px) QA: dimension bars remain reachable within 2 full scrolls on Turkey (highest-density entity)
- [ ] `npm test` 80/80 still passing
- [ ] Build time delta < 5s
- [ ] Lighthouse SEO score ≥ 95 on `/country/slovakia` (sample)

#### Rollback
Revert PR. `getLatestChange()` is preserved in PR 1; the old "Latest score change callout" block can be restored.

---

### PR 3 — History-page compaction rendering + tier affordances
**Branch:** `feat/entity-history-compaction-ui`
**Risk:** 🟢 Low (additive UI; falls back gracefully when no compaction exists)
**Estimated effort:** ~3–4 hours
**Depends on:** PR 1 (consumes `compactedRuns[]`)

#### Scope
1. Modify `site/src/components/entity/HistoryTimeline.tsx`:
   - Render `compactedRuns[]` as accordion-style entries: "7 sub-threshold movements between Apr 15 and May 10 (net −2.4, downward)" with expand affordance
   - Expanded state lists source `briefingPaths[]` as clickable links
   - Add subtle per-event tier badge (A / B only — C never appears here, D appears as compacted)
2. Update history page metadata description to mention compacted-run totals when present
3. Add discoverability copy at bottom of timeline (per UX §4.4): "Earlier sub-threshold movements are summarized in the archive →" link to `/updates/archive` — but only when `compactedRuns.length > 0`

#### Acceptance criteria
- [ ] `npm run build` exits 0
- [ ] Synthetic test fixture (from PR 1) with 7 compaction-eligible events renders as single accordion
- [ ] Expanding the accordion shows source briefing links
- [ ] Real-data history pages (today) render identically to PR 2 baseline — no compaction engaged yet
- [ ] Tier badges render on each event card (A or B)
- [ ] `npm test` still 80/80
- [ ] Lighthouse score ≥ 95 on a sample history page

#### Rollback
Revert PR. Tier badges + accordion are additive; existing chronological timeline is preserved.

---

### PR 4 (DEFERRED — post-MVP) — Analytics instrumentation
**Branch:** `feat/entity-evidence-analytics`
**Risk:** 🟢 Low
**Estimated effort:** ~2–3 hours

Per `docs/METRICS_ENTITY_EVIDENCE.md` — Phase 2 (2 weeks after PR 2 ships). Wires:
- `entity_evidence_card_viewed` (impression)
- `entity_evidence_card_clicked` (with target enum)
- `entity_history_arrival_path` (reads `?from=entity-page` query param — wiring established in PR 2)
- `entity_methodology_ruling_viewed` (intersection observer)
- `entity_sub_threshold_rollup_expanded` (only fires when Tier-D compaction is real)

Deferred until usage data exists to baseline against.

---

## Total estimated effort

| PR | Effort | Cumulative |
|---|---|---|
| PR 1 — Data model + build pipeline | 6–8h | 8h |
| PR 2 — EntityEvidenceCard on entity pages | 5–7h | 15h |
| PR 3 — History compaction UI | 3–4h | 19h |
| **MVP TOTAL** | | **~14–19 hours** |
| PR 4 — Analytics (deferred) | 2–3h | 22h |

At ~4 hours per session, MVP ships in **4–5 sessions**. Each PR is shippable independently.

---

## Sequencing logic

1. **PR 1 first** — locks data shape. Mis-classification is the single biggest risk; catching it here (with fixtures) is cheaper than after UI ships.
2. **PR 2 second** — biggest user-visible value. ~1,150 entity pages gain evidence cards. Replaces the existing 1-event card, so net visual addition is small (~2 rows).
3. **PR 3 third** — completes the retention loop. Low risk because real data doesn't yet hit compaction (90-day window won't engage until ~July 2026).

---

## Day-30 success criteria (post-MVP launch)

From `docs/METRICS_ENTITY_EVIDENCE.md`:

- ≥ 8% of entity-page sessions with a card visible click through to `/history`
- ≥ 5% of entity-page sessions click "View briefing" from within the card
- Entity-page bounce rate: **no regression** vs. current baseline
- Methodology ruling callout impressions tracked but no target (few entities qualify)
- Tier-D revision threshold: > 15% of Tier-D history sessions expand a compacted rollup → escalate to product

If targets missed by Day 30 → meta-coordinator runs a diagnostic loop on entity-page evidence discoverability.

---

## What I need from you to proceed

Reply with one of:

1. **"Approve all 3 PRs — start PR 1"** → I dispatch backend-engineer to PR 1 immediately
2. **"Approve PRs X, Y — defer Z"** → I dispatch only the approved set
3. **"Confirm Q2: citations IN scope"** or **"Q2: citations DEFERRED"** → resolves the open question; pipeline change adds ~3–4h to PR 1 if IN scope
4. **"Change scope: ____"** → I revise and re-circulate
5. **"Read the source artifacts first"** → no action; review the 4 docs then come back

The 4 source documents are at:
- `docs/PRD_ENTITY_EVIDENCE_RETENTION.md`
- `docs/ARCHITECTURE_ENTITY_EVIDENCE_RETENTION.md`
- `docs/UX_FLOWS_ENTITY_EVIDENCE.md`
- `docs/METRICS_ENTITY_EVIDENCE.md`

No code has been written. No commits made for this plan. Nothing on disk has changed except these 5 planning documents.
