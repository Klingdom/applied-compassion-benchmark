# US States Full Re-assessment — Runbook

**Created:** 2026-07-19
**Status:** BLOCKED on web-search budget. 6 of 51 complete.
**Owner decision on file:** Option B — hold all publication until enough states are done to apply and re-rank as one coherent set.

---

## Why this exists

The US States index is the most defective dataset in the benchmark. This runbook carries the context needed to finish the job correctly in a fresh session, because a state assessed without this context will be subtly wrong in ways that are hard to detect later.

---

## The defect

`site/src/data/indexes/us-states.json` contains **21 of 51** jurisdictions (50 states + DC).

1. **Ranks 9–38 were lost** in the original legacy-HTML extraction. The survivors are the top 8 and bottom 13 — a barbell, not a ranking.
2. **The survivors were renumbered contiguously 1–21.** Displayed rank is not national rank. Idaho renders at rank 9; true position ≈ 39th. Everything below Connecticut is inflated by ~30 places.
3. **15 of 21 have `last_assessed: null`** — never individually assessed. Scores are bulk-import placeholders. Five states share the identical composite 25.0 (Idaho, Indiana, Missouri, North Dakota, South Dakota); three share 12.5 (Alabama, Arkansas, Mississippi). That is banding, not measurement.
4. **A 58-point cliff** sits between rank 8 (Connecticut, 83.0) and rank 9 (Idaho, 25.0). The Established (61–80) and Functional (41–60) bands both held **zero** entities before today.

A coverage disclosure is live on the index page (commit `88052892`) stating all of the above.

---

## The finding that governs everything: scrutiny bias

**Researched entities systematically score below placeholder entities**, because a 40-subdimension adversarial review *finds* flaws and batch-assignment never looked.

The proof case: **Michigan and Massachusetts are the only two states in the country whose governor and legislature are both FOIA-exempt.** Michigan, examined, took its largest dimensional penalty for it (BND 2.6). Massachusetts, unexamined, sits at 94.4 and rank 2. Same fact, opposite scores, decided entirely by whether anyone looked.

Precedent from the countries index: Tunisia's first real assessment dropped it 10.6 points; Eritrea's landed on its placeholder by coincidence.

**Consequence — this is why Option B was chosen:** a mixed index is not publishable. Adding researched states to placeholder states makes researched states look worse and produces a ranking that is actively misleading *and* looks complete. **Do not apply partial results to `us-states.json`.**

---

## Completed (6 of 51)

All committed in `7077dd26`. Assessments in `research/assessments/<slug>-2026-07-19.md` with `.subdims.json` sidecars.

| State | Composite | Band | Confidence | Notes |
|---|---|---|---|---|
| Georgia | 26.9 | Developing | Med-High | Conflicting Cop City dismissal dates — verify before publication |
| Ohio | 38.1 | Developing | Med-High | Score fragile to Jan 2027 governor transition (I1/I2/S4) |
| Michigan | 51.9 | Functional | Med-High | **DEGRADED — re-run.** Hit search cap; EQ3 on 3–6yr old data, B5/A5 low confidence |
| Delaware | 53.8 | Functional | Med-High | HB466 enactment unverified; if enacted → 55.0 |
| Pennsylvania | 54.4 | Functional | Med-High | A3 judgment call; if revised to 3 → 53.8 |
| New York | 56.9 | Functional | Medium | Only state with a documented 5yr peak-and-decline (59.4 in 2024) |

**All six landed inside the previously empty 25–83 band.** Six independent agents with no shared context filling the same vacuum confirms the bimodal shape is an extraction artifact, not real.

**Iowa:** attempted twice, no output both times. Budget exhausted. Needs a clean run.

---

## Remaining (45 assessments)

**44 states never assessed:** Alaska, Arizona, Colorado, Illinois, Indiana, Iowa, Kansas, Kentucky, Maine, Maryland, Montana, Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, North Carolina, Oregon, Rhode Island, South Carolina, Utah, Virginia, West Virginia, Wisconsin, Wyoming — plus re-assessment of the 15 placeholder states currently published (Idaho, Indiana, Missouri, North Dakota, South Dakota, Oklahoma, Tennessee, Louisiana, Florida, Alabama, Arkansas, Mississippi, Washington, Washington DC, Connecticut).

**Plus:** Iowa (never completed), Michigan (re-run for degradation).

**Also verify:** the 6 states with real `last_assessed` dates (Hawaii, Massachusetts, California, Vermont, Minnesota, Texas) — confirm their assessments meet current 40-subdimension depth. Massachusetts specifically: check B3/AB3 against the FOIA exemption Michigan was penalized for.

---

## Execution plan

### Prerequisites

1. `.claude/settings.local.json` → `"env": { "CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION": "2000" }`
2. **Fresh session.** Budget is per-session and does not reset within one.
3. Budget: ~30 searches and ~100k tokens per state → ~1,400 searches, ~4.6M tokens total.

### Wave structure

**Waves of 6, with a budget check between waves.** Do not fan out wider.

On 2026-07-19 seven agents were launched simultaneously; they drained the session budget and the last two returned degraded (Michigan) and empty (Iowa). A starving wave fails quietly and produces thin work that looks complete — that is the failure mode to avoid.

Between waves, probe with a single cheap search. If it errors, stop and report rather than continuing.

### Per-state agent prompt — required elements

Every state prompt MUST carry:

1. **Framing.** For unassessed states: "This is a FIRST BASELINE, not an update. No prior composite exists." For the 15 placeholders: "The published score is a bulk-import placeholder with `last_assessed: null`. Treat as a first baseline; expect the evidence-based value to differ, and do not anchor to the placeholder."

2. **Calibration warning — verbatim.** "Do NOT calibrate to the published rank order; it is corrupt. DO calibrate to the methodology and to published composite values."

3. **Peer anchors.** "Six states were assessed at full depth on 2026-07-19 under this methodology: Georgia 26.9, Ohio 38.1, Michigan 51.9, Delaware 53.8, Pennsylvania 54.4, New York 56.9. These are the most reliable reference points available."

4. **Scope.** All 8 dimensions, all 40 subdimensions, five-year trajectory (2021–2026), past twelve months weighted most heavily and most granular.

5. **Outputs.**
   - `research/assessments/<slug>-<date>.md`
   - `research/assessments/<slug>-<date>.subdims.json` — 40 entries, each with `code`, `dimension`, `name`, `score`, `confidence`, `assessed_date`, and an `evidence[]` array of `{tier, url, date, quote}`. **Match `research/assessments/delaware-2026-07-19.subdims.json` exactly** — it is the reference implementation.
   - Change proposal with **`rank: null`**.

6. **Constraints.**
   - Do NOT modify `site/src/data/indexes/us-states.json`. Proposals only.
   - Every score backed by dated, cited, verifiable public evidence. No inferred data.
   - **Verify publication dates against primary sources.** On 2026-07-19 a scanner surfaced an ICC citation dated 2025-07-08 described as current — a full year stale. Use the publisher's own URL path as the date authority, never an aggregator.
   - Where evidence is thin, mark confidence low rather than inventing a number.
   - Score the state's OWN conduct, not federal policy imposed on it; note federal interaction where the state exercised discretion.
   - Verify the composite by running `computeCompositeFromDimensions` in `site/scripts/lib/scoring.mjs`. Do not compute by hand.

### After all 51 are complete

1. **Cross-state consistency pass.** Today's six ran in parallel with no cross-calibration; Delaware 53.8, Pennsylvania 54.4 and Michigan 51.9 within 2.5 points may be genuine convergence or coincidence. Review the full set for calibration coherence before applying.
2. **Apply and re-rank** via `score-updater` — **human-triggered only.** Rebuilds `us-states.json` with all 51 entities and true ranks 1–51.
3. **Generate 51 entity-records** with populated `evidence[]` (see below).
4. **Sync rotation-state** — run `research/scripts/reconcile-rotation-state.mjs` and remove the us-states exclusion. Its 21 entries are deliberately stale (commit `6fea878f`) because syncing from a corrupt index would propagate corruption into scan prioritization.
5. **Revise the coverage disclosure** — `site/src/components/index/PartialCoverageDisclosure.tsx`.

---

## Related defect: empty evidence arrays

`site/src/data/entity-records/*.json` already backs every entity detail page, and the schema already supports per-subdimension `evidence[]`.

**Only 18 of 1,238 records have any evidence populated. Zero of 20 us-state records do.**

Placeholder states show `subdims_source: "reconstructed"`, `confidence: "low"`, `assessed_date: null`, `evidence: []` across all 40 subdimensions — numbers back-derived from a composite that was itself a placeholder.

This is not a states-only problem: ~1,187 non-state detail pages have the same defect. Sizing it is a separate exercise. A cheaper path than a dedicated campaign: the nightly pipeline already produces dated, cited evidence for ~15 entities a night and currently discards it after the digest. Wiring that into `evidence[]` would populate records as a by-product of work already happening.

---

## Open items not blocked by budget

- **4 ai-labs entities** — `nvidia-ai`, `oracle-ai`, `spacex-ai`, `reflection-ai` have real assessment dates but no published row (`ai-labs.json` has 50, rotation has 54). Publish or retire.
- **rotation-state key generation** — collision-triggered `-{index}` suffixing plus inconsistent diacritic handling (`c-te-divoire`, `xian`, `ndjamena`) is a latent bug source. Note `us-cities.json` contains legitimately distinct same-name pairs (Portland ME/OR, Springfield IL/MO) distinguished only by a `state` field rotation does not key on.
- **`worker/node_modules/`** is not gitignored.
- **26 OG images** for 2026-06-20 → 07-15 are untracked; those dates are published, so social previews may be missing in production.
- **`last_assessed: null` sweep** on us-cities, global-cities and universities — same extraction origin, likely same defect.
