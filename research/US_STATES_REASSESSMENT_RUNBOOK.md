# US States Full Re-assessment — Runbook

**Created:** 2026-07-19
**Updated:** 2026-07-20 (all 51 complete; all five post-completion steps closed)
**Status:** ✅ **COMPLETE. 51 of 51 assessed, applied, published, and synced.**

All 51 jurisdictions were assessed on 2026-07-19. The corrected index was applied and
published in commit `613473b4`. The final outstanding step — rotation-state sync — was
completed 2026-07-20; see "After all 51 are complete" below.

The historical wave-by-wave narrative is retained below for provenance and for the
process lessons (scrutiny bias, claimed-output failure, search-cap exhaustion), which
generalise to the other indexes carrying the same extraction defect.

Wave 2 (Wisconsin, Virginia, North Carolina, New Jersey, Oregon, Maryland) was launched against an already-drained session and produced **zero assessments**. All six agents correctly refused to write partial work — no contamination, index untouched. Their 32 searches of salvaged evidence are banked in `research/WAVE2_BANKED_EVIDENCE.md` and should be handed to the re-run so it is not re-spent.

**Do not launch wave 3 until prerequisite #1 below is actually applied and verified.**
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

## Wave 1 — completed 2026-07-19 (6 more, total 12 of 51)

| State | Composite | Band | Confidence (H/M/L) | Notes |
|---|---|---|---|---|
| Illinois | 60.0 | Functional | 22/16/2 | Came within 0.6 of the band-boundary defect below. Margin over NY rests entirely on SYS 4.0 |
| Michigan | 53.8 | Functional | 20/20/0 | **Supersedes the degraded 51.9.** BND corrected 2.6→2.8; homicide claim struck; Rx Kids found |
| Colorado | 52.5 | Functional | 17/21/2 | "Writes better law than it delivers" — EQU 65, ACT 45 |
| Alaska | 47.5 | Functional | 23/16/1 | SNAP: injunction, then won on "no enforceable right". B5 medium is generous, downgrade to low |
| Arizona | 36.2 | Developing | 25/13/2 | Flat profile, SD 0.30. Ballot initiatives correctly *not* credited to the state |
| Iowa | 30.6 | Developing | 21/18/1 | First state to delete a protected class from its civil rights code |

**All six verified independently:** schema, 40/40 entries, zero empty `evidence[]` across all 240 subdimensions, rollups exact, composites reproduced via `computeCompositeFromDimensions`, index untouched.

**Iowa and Michigan are both now unblocked** — the two states that failed on the first attempt.

Twelve independent agents have now landed inside the previously empty 25–83 band. The bimodal shape of the published index is confirmed an extraction artifact.

### Open items raised by wave 1

- **Massachusetts must be resolved before publication.** Michigan's FOIA exemption is *statutory and blanket*; Massachusetts' rests only on a court ruling that the law doesn't list the governor. **They are not equivalent — Michigan's is more severe.** Massachusetts sits unexamined at 94.4. Resolve at Massachusetts; do not adjust Michigan.
- **Possible transparency penalty (methodology question).** Michigan generates more adversarial evidence than peers because it *has* an independent Auditor General and an active federal consent decree. Watch for the benchmark systematically penalizing transparent jurisdictions. No adjustment made.
- **Band-boundary defect in `site/scripts/lib/scoring.mjs` — LIVE, affects published data.** Initially logged as latent with "nothing published is affected." That was wrong; a full sweep of all 1,256 published entities found two distinct defects.

  **Defect A — label/logic mismatch (106 entities).** `BAND_RANGES` states Established `61-80`, Functional `41-60`, Developing `21-40`. But `getBand()` uses `score <= 60 → Functional`, `<= 80 → Established`. Any score in (60,61), (40,41) or (20,21) receives a band whose own stated range excludes it. 106 entities are in this state — e.g. 89 entities at composite 60.9 are labelled "Established," a band published as "61-80."

  **Defect B — same score, two different bands (5 entities).** Published `band` values disagree with `getBand()`:

  | Entity | Index | Composite | Published | `getBand()` |
  |---|---|---|---|---|
  | State Street | fortune-500 | 60.2 | functional | Established |
  | Kuala Lumpur | global-cities | 40.6 | developing | Functional |
  | Long Beach | us-cities | 40.6 | developing | Functional |
  | Sacramento | us-cities | 40.6 | developing | Functional |
  | San Diego | us-cities | 40.6 | developing | Functional |

  The result is visible contradiction across the site: **composite 40.6 is published as both Functional and Developing; composite 60.2 as both Functional and Established.** Croatia and Kuala Lumpur have identical composites and different bands. Brown University and State Street have identical composites and different bands.

  All five corrections would move entities **upward**, so this changes public claims about named entities. **Not fixed — requires human decision.** Fixing needs a choice on whether `BAND_RANGES` or `getBand()` is authoritative, and the answer determines whether 106 labels change or 5 do.

  Found only because Illinois landed at 60.0, 0.6 points from a gap.
- **Alaska B5** marked medium confidence on a single piece of not-yet-effective 2026 legislation. Downgrade to low in the consistency pass.

### Attribution rule — confirmed by convergence

Four wave-1 agents independently applied the same rule with no shared context: score the state's own conduct, not another government's. Alaska excluded Anchorage homelessness, Arizona held AC3 at 3 on county-led heat work, Arizona declined to credit citizen ballot initiatives to the legislature, Illinois scored only state discretion on federal actions. **This rule is working — keep it in every prompt.**

---

## Remaining (45 assessments)

**44 states never assessed:** Alaska, Arizona, Colorado, Illinois, Indiana, Iowa, Kansas, Kentucky, Maine, Maryland, Montana, Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, North Carolina, Oregon, Rhode Island, South Carolina, Utah, Virginia, West Virginia, Wisconsin, Wyoming — plus re-assessment of the 15 placeholder states currently published (Idaho, Indiana, Missouri, North Dakota, South Dakota, Oklahoma, Tennessee, Louisiana, Florida, Alabama, Arkansas, Mississippi, Washington, Washington DC, Connecticut).

**Plus:** Iowa (never completed), Michigan (re-run for degradation).

**Also verify:** the 6 states with real `last_assessed` dates (Hawaii, Massachusetts, California, Vermont, Minnesota, Texas) — confirm their assessments meet current 40-subdimension depth.

### VERIFIED 2026-07-19 — none of the 6 meet current depth. Two have no assessment at all.

Audit run with zero web searches, from `research/assessments/` and `research/rotation-state.json`:

| State | Index composite | `last_assessed` | Assessment file | Subdim codes present | Sidecar |
|---|---|---|---|---|---|
| **Hawaii** | 95.9 (rank 1) | 2026-04-27 | **NONE** | — | none |
| **Massachusetts** | 94.4 (rank 2) | 2026-04-27 | **NONE** | — | none |
| California | 87.7 | 2026-07-01 | 67 lines | **0** | none |
| Texas | 14.1 | 2026-04-29 | 97 lines | **0** | none |
| Minnesota | 84.4 | 2026-04-29 | 77 lines | 7 of 40 | none |
| Vermont | 87.5 | 2026-04-24 | 76 lines | 21 of 40 | none |

**Not one has a `.subdims.json` sidecar. None reaches 40 subdimensions. The two highest-ranked states in the entire index have no assessment artifact whatsoever.**

For scale: wave 1's Alaska assessment is ~47,700 bytes with a 40-entry evidenced sidecar. California's is 67 lines with zero subdimension codes.

**This strengthens the scrutiny-bias case rather than weakening it.** The runbook argued Massachusetts "sits at 94.4 and rank 2, unexamined." That understated it — Massachusetts has *no assessment file at all* while ranking second nationally and carrying the same FOIA defect Michigan was penalized for. Michigan's re-run further established Michigan's exemption is *statutory and blanket* where Massachusetts' rests only on a court ruling, i.e. Michigan's is the more severe form.

**Consequence: all 6 must be re-assessed at full depth. Treat as placeholders, not as assessed.** The count of states needing work is therefore **45, not 39** — the 39 unassessed plus these 6. Only wave 1's 6 (Alaska, Arizona, Colorado, Illinois, Iowa, Michigan) plus the earlier 6 (Georgia, Ohio, Delaware, Pennsylvania, New York, and Michigan's superseded run) meet current standard.

### The +5.0 offset — additional evidence the placeholders are synthetic

Published `us-states.json` composites sit **exactly 5.0 above** the `rotation-state.json` cached value for **18 of 21** states. The exceptions are informative:

- **Vermont and Minnesota match exactly** — both have real assessment files with actual subdimension content.
- **Texas diverges by −1.2** — has an assessment file.
- **All 18 with a clean +5.0 offset are never-assessed placeholders.**

The divergence itself is expected and intentional: commit `6fea878f` deliberately deferred us-states from the rotation-state reconciliation, leaving all 21 entries byte-identical to backup, because syncing from a corrupt index would propagate corrupt ranks into scan prioritisation. **This is not a new bug.**

But the *shape* of the offset is new information. A uniform constant across exactly the never-assessed subset — while individually-assessed states match or diverge irregularly — is a seed signature, directly analogous to the Finland/Denmark/Norway `100.0` signature that commit `6fea878f` cites as proof of stale-seeding. It is further evidence that the 15 placeholder composites are a mechanical transformation of a legacy set, not measurement.

---

## Execution plan

### Prerequisites

1. `.claude/settings.local.json` → `"env": { "CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION": "2000" }`
   **APPLIED 2026-07-19.** Verified: file parses, `env` block present, 106 `permissions.allow` entries preserved. Both wave 1 and wave 2 ran against the default 200-search cap; this single unapplied line was the direct cause of every failure this project has had.

   **The edit does not take effect in the session that made it.** `env` is read at process startup, so the applying session still runs under the old cap. Wave 3 must launch from a session started *after* this commit. `/clear` is not sufficient — it resets conversation context, not the process search budget.

   **Verify at the start of wave 3:** confirm the `env` block is present on disk AND that the session was started after it was committed. If either is unknown, treat the cap as 200.
2. **Fresh session.** Budget is per-session and does not reset within one.
3. Budget: ~30 searches and ~100k tokens per state → ~1,400 searches, ~4.6M tokens total.

### Budget probing — corrected 2026-07-19

**A single successful search does not mean budget remains.** After wave 1, a one-search probe in the parent session succeeded and was read as a green light for wave 2. It was not. Wave 1 had consumed ~155 of 200; roughly 40 remained. All six wave-2 agents starved: Wisconsin 12 searches, Virginia 8, North Carolina 4, New Jersey 4, Oregon 2, Maryland 2 — 32 total, and the wave was over.

A probe proves *a* search works. It says nothing about remaining capacity. Two rules follow:

1. **The probe must be the child agent's first action**, not the parent's. Budget is per-session and shared; a parent-session probe does not prove a child has room. Instruct every agent to probe first and abort at zero cost on failure.
2. **Count spend, don't sample it.** Track cumulative searches across the session and compare against the known cap. ~30 per state × 6 states = ~180; do not launch a wave without that much confirmed headroom.

**WebFetch survives WebSearch exhaustion but is not a fallback.** It requires knowing URLs in advance. Three wave-2 agents tested it: stale cached pages (JLARC, nothing after Oct 2023), HTTP 403, and undecodable binary. Driving an assessment through WebFetch means guessing URLs from a January 2026 knowledge cutoff — inferred data by another route, in exactly the window the methodology weights most heavily.

### Wave 3 — ready to launch (next session)

**Roster:** Wisconsin, Virginia, North Carolina, New Jersey, Oregon, Maryland — the six wave-2 states. Chosen because `research/WAVE2_BANKED_EVIDENCE.md` already holds 32 searches of salvaged leads for exactly these six, so wave 3 starts with a partial head start rather than from zero.

**Every wave-3 prompt must additionally carry:**
- The banked-evidence section for that state from `WAVE2_BANKED_EVIDENCE.md`, pasted inline, with the warning that **every item is UNVERIFIED against publisher URL paths** and must be date-verified before scoring.
- The "Not researched" list for that state, so the agent spends its budget on the gaps rather than re-covering banked ground.
- The standard six required elements from "Per-state agent prompt" below. Banked evidence supplements them; it does not replace any of them.
- **Probe first.** The agent's own first action is a single cheap search; abort at zero cost if it fails.

All six are absent from the published index → `assessment_type: "first-baseline"`, `published_scores: null`, `recommendation: "add-new-entity"`, `status: "pending"`.

After wave 3: 18 of 51. Then waves 4–9 (~6 each) cover the remaining 33, including the 6 high-ranked states with no real assessment (Hawaii, Massachusetts, California, Texas, Minnesota, Vermont) — schedule those as their own wave, since Massachusetts must be resolved before any publication.

### Wave structure

**Waves of 6, with a budget check between waves.** Do not fan out wider.

On 2026-07-19 seven agents were launched simultaneously; they drained the session budget and the last two returned degraded (Michigan) and empty (Iowa). A starving wave fails quietly and produces thin work that looks complete — that is the failure mode to avoid.

Between waves, probe with a single cheap search. If it errors, stop and report rather than continuing.

### Per-state agent prompt — required elements

Every state prompt MUST carry:

1. **Framing.** For unassessed states: "This is a FIRST BASELINE, not an update. No prior composite exists." For the 15 placeholders: "The published score is a bulk-import placeholder with `last_assessed: null`. Treat as a first baseline; expect the evidence-based value to differ, and do not anchor to the placeholder."

2. **Calibration warning — verbatim.** "Do NOT calibrate to the published rank order; it is corrupt. DO calibrate to the methodology and to published composite values."

3. **Peer anchors.** Use the full set of 12 assessed at full depth on 2026-07-19 under this methodology — they are the most reliable reference points available:

   Iowa 30.6 · Arizona 36.2 · Ohio 38.1 · Georgia 26.9 · Alaska 47.5 · Michigan 53.8 · Colorado 52.5 · Delaware 53.8 · Pennsylvania 54.4 · New York 56.9 · Illinois 60.0

   **Michigan is 53.8, not 51.9** — 51.9 was the degraded first run and is superseded. Do not cite it.

4. **Scope.** All 8 dimensions, all 40 subdimensions, five-year trajectory (2021–2026), past twelve months weighted most heavily and most granular.

5. **Outputs.** Exactly three files. All three are mandatory — see "Claimed-output failure" below.
   - `research/assessments/<slug>-<date>.md`
   - `research/assessments/<slug>-<date>.subdims.json` — 40 entries, each with `code`, `dimension`, `name`, `score`, `confidence`, `assessed_date`, and an `evidence[]` array of `{tier, url, date, quote}`. **Match `research/assessments/delaware-2026-07-19.subdims.json` exactly** — it is the reference implementation.
   - `research/change-proposals/<slug>-<date>.json` — **match `research/change-proposals/iowa-2026-07-19.json`.** See schema below.

6. **Constraints.**
   - Do NOT modify `site/src/data/indexes/us-states.json`. Proposals only.
   - Every score backed by dated, cited, verifiable public evidence. No inferred data.
   - **Verify publication dates against primary sources.** On 2026-07-19 a scanner surfaced an ICC citation dated 2025-07-08 described as current — a full year stale. Use the publisher's own URL path as the date authority, never an aggregator.
   - Where evidence is thin, mark confidence low rather than inventing a number.
   - Score the state's OWN conduct, not federal policy imposed on it; note federal interaction where the state exercised discretion.
   - Verify the composite by running `computeCompositeFromDimensions` in `site/scripts/lib/scoring.mjs`. Do not compute by hand. **This applies to every figure you report, including hypotheticals and sensitivity cases.** On 2026-07-19 an agent hand-estimated a sensitivity case as ~29.4 when the function returns 30.0. The published score was correct; the habit is not.

### Change-proposal schema (normative)

Reference implementation: `research/change-proposals/iowa-2026-07-19.json`. Build it programmatically from the verified sidecar rather than retyping — Michigan's was generated this way and its 40 entries are byte-identical to its sidecar.

Wave 1 produced three different proposal shapes across six agents. Two inlined subdimensions, two pointed at the sidecar file under two different key names, one wrote no proposal at all. `score-updater` must not be asked to handle that. Required keys:

| Key | Value |
|---|---|
| `entity`, `slug`, `index` | Identity. `index` is always `"us-states"` |
| `assessment_date` | ISO date |
| `assessment_file` | Repo-relative path to the `.md` |
| `assessment_type` | `"first-baseline"`, `"placeholder-replacement"`, or `"re-assessment-supersedes-degraded-run"` |
| `published_scores` | `null` for states absent from the index; the current published object for the 15 placeholders |
| `proposed_scores` | `{composite, band, rank: null, dimensions{8}}` |
| `rank` | **`null`.** Always. Top-level and inside `proposed_scores` |
| `rank_note` | Why rank is null — the corrupt 21-of-51 index |
| `score_delta`, `band_change` | `null` for first baselines |
| `confidence` | Overall confidence |
| `calibration_note` | Peer anchors used, plus the `computeCompositeFromDimensions` verification output |
| `attribution_note` | State-conduct-vs-federal reasoning |
| `key_evidence` | Array of prose findings |
| `proposed_subdimensions` | **All 40 inline**, byte-identical to the sidecar. Do not reference the sidecar by path |
| `recommendation` | `"add-new-entity"` for absent states, `"update-entity"` for the 15 placeholders |
| `status` | **`"pending"`** — not `"proposed"`. `site/scripts/prepare-updates.mjs` line 180 only picks up `status === "pending"`; a proposal marked `"proposed"` is silently skipped. Iowa's reference file originally used `"proposed"` and was corrected, along with Alaska's and Michigan's. **This is the one field not to copy blindly from the reference.** |
| `reviewed_by`, `reviewed_date`, `decision` | `null` — human-triggered only |

Optional, add when the case warrants: `supersedes`, `bnd_correction`, `struck_factual_error`, `cross_state_consistency_flag`, `reviewer_cautions`, `notes`. Each should carry an explicit `adjustment_made` / `scoring_effect` field when it records something *not* acted upon, so a reviewer can tell a flag from a change.

### Claimed-output failure

On 2026-07-19 the Michigan agent reported "Change proposal filed with `rank: null`". No proposal file existed. The assessment and sidecar were both correct and verified; only the proposal was missing, and only file-existence checking caught it.

**Verify every claimed output on disk before accepting a wave.** Do not treat an agent's final report as evidence that a file exists. Minimum per-state acceptance check:

- all three files exist at their expected paths
- sidecar has 40 entries, correct key set, **zero empty `evidence[]` arrays**
- subdimension scores roll up to the reported dimension values
- `computeCompositeFromDimensions` reproduces the reported composite
- `git status --short site/src/data/indexes/us-states.json` is empty
- proposal has `rank: null` and 40 inline `proposed_subdimensions`

### After all 51 are complete — ✅ ALL CLOSED

1. ✅ **Cross-state consistency pass.** Completed — `CROSS_STATE_CONSISTENCY_2026-07-19.md`. Anchoring test passed: identical-placeholder cohorts resolved to spreads up to 25.0 pts, corrections ran in both directions (7 down, 11 up), distribution smooth. The convergence flagged in wave 3 was genuine signal, not anchoring.
2. ✅ **Applied and re-ranked.** `us-states.json` now carries all 51 entities with true ranks 1–51. Published in commit `613473b4`.
3. ✅ **51 entity-records generated** — all 51 present with populated `evidence[]`.
4. ✅ **rotation-state synced (2026-07-20).** The exclusion precondition — a corrupt source index — was resolved by step 2, so `us-states` was removed from `HARD_EXCLUDED_INDEXES`. This required extending `reconcile-rotation-state.mjs`, which by design only overwrites scores on existing matches and never adds entities: **31 of 51 states had no rotation entry at all** and were invisible to nightly scan prioritization. Changes:
   - `--backfill` flag (off by default, so default behaviour stays non-additive) created the 30 missing entries.
   - `KEY_MIGRATIONS`, scoped by source key *and* index, migrated `washington-dc` → `district-of-columbia`, preserving its `last_*` timestamps per the authoritative-source rule. Deliberately does not touch the legitimately distinct `washington-dc-us-cities` / `washington-dc-global-cities`.
   - `FORCE_LAST_ASSESSED` set `last_assessed: 2026-07-19` for all 51, each verified against an on-disk assessment file rather than assumed.
   - Verified: 51/51 entries, 0 drift vs published, max composite 60.6 (was 90.9), 0 non-us-states entities altered, indexes untouched, idempotent across repeat runs.
5. ✅ **Coverage disclosure revised** — `PartialCoverageDisclosure` replaced by `ScoreCorrectionDisclosure` on `/us-states`. The partial-coverage component remains in the tree for reuse by other indexes carrying the same defect.

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
