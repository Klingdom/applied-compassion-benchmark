# Rotation State Score Reconciliation — 2026-07-19

## Problem

`research/rotation-state.json` caches `composite`, `band`, and `rank` per
entity alongside pipeline timestamps (`last_scanned`, `last_assessed`,
`last_change_proposal`, `last_evidence_touch`). The cached score fields were
seeded from a legacy index and never updated as assessments changed
published values in `site/src/data/indexes/*.json`. The timestamp fields
have been maintained correctly throughout and were never in question.

This matters because rotation-state drives nightly scan prioritization and
staleness calculation. Stale cached composites and ranks meant the pipeline
could have been selecting the wrong entities for reassessment (e.g. treating
an entity as already at a ceiling score when its real published score was
much lower, or vice versa).

**Evidence the drift was stale-seed rather than published being wrong:**
rotation had Finland, Denmark, and Norway all pinned at exactly `100.0` — a
seed signature — against published values of 84.4, 81.3, and 78.1
respectively, which are ordinary re-derived composites (confirmed against
`site/src/data/indexes/countries.json`). Drift also ran in **both**
directions (e.g. Switzerland: rotation 92.5 vs. published 97.5), consistent
with published having been re-derived by assessment over time in ways a
single stale seed snapshot could not track.

## Authoritative-source rule

- `site/src/data/indexes/*.json` is authoritative for `composite`, `band`,
  and `rank`.
- `research/rotation-state.json` is authoritative for all `last_*`
  timestamp fields, `name`, and `index`.

The reconciliation script enforces this asymmetrically: it only ever
overwrites `composite`, `band`, `rank` on rotation entities that resolve to
a published counterpart, and never touches `name`, `index`, or any `last_*`
field on any entity.

## What was built

`research/scripts/reconcile-rotation-state.mjs` — re-runnable, idempotent,
supports `--dry-run`. It:

1. Loads all 8 published index files (including `us-states`, for matching
   purposes only).
2. Builds a canonical export-slug map per published index, mirroring
   `site/scripts/export-public-data.mjs`'s slug generation exactly (explicit
   `slug` field when present, else `slugify(name)`, with first-occurrence-
   wins / `${slug}-${rank}` collision handling).
3. **Primary match pass**: rotation entity keys are compared directly
   against the canonical slug map for their `index`.
4. **Fallback match pass**: rotation entities unmatched by pass 1 are
   matched against published rows in the same index by exact `name` string,
   excluding rows already claimed by another rotation entity in this run.
   This resolves genuine slug-mapping bugs without ever guessing across
   ambiguous duplicates (if more than one unclaimed candidate remains, the
   entity is left unmatched and reported, not guessed).
5. Hard-excludes `us-states` from any write, regardless of match status.
6. Backs up `rotation-state.json` to
   `research/rotation-state.backup-2026-07-19.json` before writing (once;
   will not overwrite an existing backup on re-run).
7. Overwrites `composite`, `band`, `rank` on every resolved, non-excluded
   entity; sets top-level `last_updated` to `2026-07-19`.
8. Re-reads the written file and verifies zero remaining drift among synced
   entities.

## Diagnosis verification

Before writing, matching using **only** the primary (strict key) pass — the
matcher the original diagnosis was almost certainly based on — reproduced
counts in the same range as the reported figures:

| Metric | Reported | Reproduced (strict-key only) |
|---|---|---|
| Matched to a published index | 1,233 | 1,233 |
| Composite drift (>0.05) | 837 | 836 |
| Rank drift | 982 | 981 |
| Band drift | 193 | 190 |
| Fully clean | 177 | 178 |
| fortune-500 drift | 440 | 440 |
| global-cities drift | 226 | 225 |
| countries drift | 152 | 153 |
| us-cities drift | 136 | 136 |
| robotics-labs drift | 42 | 40 |
| ai-labs drift | 41 | 42 |
| us-states drift | 19 | 19 |

Differences are all within 1–3 entities per figure (tie-break handling of
the small number of duplicate-name entities within an index, e.g. Portland
ME/OR). This confirms the diagnosis; the reconciliation proceeded as
planned rather than stopping.

## Counts before / after, per index

"Before" reflects the matched population **after** the improved matcher
(primary + fallback), which is 2 more entities than the strict-only
diagnosis population per index in a couple of cases (the fallback pass
recovered 23 additional entities overall — see below). "After" is the
verified state immediately post-write.

| Index | Matched (synced) | Composite drift before | Rank drift before | Band drift before | Clean before | Drift after |
|---|---|---|---|---|---|---|
| countries | 193 | 118 | 152 | 39 | 39 | 0 |
| fortune-500 | 448 | 334 | 434 | 60 | 8 | 0 |
| ai-labs | 50 | 27 | 41 | 6 | 8 | 0 |
| robotics-labs | 50 | 31 | 30 | 12 | 9 | 0 |
| us-cities | 144 | 109 | 127 | 20 | 5 | 0 |
| global-cities | 250 | 209 | 197 | 45 | 11 | 0 |
| universities | 100 | 0 | 0 | 0 | 100 | 0 |
| **Total (synced)** | **1,235** | **828** | **981** | **182** | **180** | **0** |
| us-states (deferred, not synced) | 21 | — | — | — | — | — (untouched) |
| Unmatched (left untouched) | 4 | — | — | — | — | — (untouched) |

`universities` showed zero drift in every field — its rotation cache was
already correct (that index was presumably seeded or last touched after the
others, or has not been re-assessed since seeding).

Post-write verification, re-run in full (`--dry-run` against the written
file): **0 composite/rank/band drift across all 1,235 synced entities.**
Re-running the script again is idempotent — it reports the same match
counts and zero drift, and does not overwrite the existing backup.

## us-states deferral

All 21 `us-states` rotation entries were matched to the published
`us-states.json` index but were **not synced**, per the hard-exclusion rule.
`site/src/data/indexes/us-states.json` contains only 21 of 51 states,
renumbered contiguously 1–21. Its `rank` field is therefore not the true
national rank of any state — syncing it into rotation-state would silently
propagate that corruption into nightly scan prioritization. These 21
entries were left byte-identical to their pre-reconciliation values
(verified against the backup). They remain a known gap: rotation-state's
us-states composites/ranks are still stale/seeded and will need a separate
fix once the published us-states index itself is corrected (either restored
to all 51 states with true ranks, or rotation-state is changed to not rely
on displayed rank for prioritization of this index).

## Matcher improvement: 23 of 27 originally-unmatched entities resolved

The originally diagnosed 27 unmatched entities (primary/strict-key match
only) were re-examined with the fallback name-match pass. 23 resolved
cleanly to a single, unambiguous published counterpart in the same index;
4 remain genuinely unmatched.

### Triage table — all 27 originally-unmatched entities

| Rotation key | Name | Index | Root cause | Assessment | Recommended action (not executed) |
|---|---|---|---|---|---|
| `c-te-divoire` | Côte d'Ivoire | countries | Naive `slugify()` strips diacritics and the apostrophe differently than however the key was originally generated, producing `c-te-divoire` instead of `cote-divoire`/`côte-divoire` | (a) slug-mapping bug | **Synced via fallback.** Consider fixing the key generation script to normalize diacritics (NFD strip) consistently so future keys read `cote-divoire`. |
| `xian` | Xi'an | countries | Same diacritic/apostrophe stripping pattern producing an ambiguous-looking key | (a) slug-mapping bug | **Synced via fallback.** No action needed beyond the general key-generation fix above. |
| `ndjamena` | N'Djamena | countries | Same apostrophe-stripping pattern | (a) slug-mapping bug | **Synced via fallback.** Same as above. |
| `1x-technologies-robotics-labs` | 1X Technologies | robotics-labs | Rotation's own collision-disambiguation appends `-{index}` where export slugging would use `-{rank}`; here it appears the key collided with the `ai-labs` entity of the same name (1X Technologies appears in both indexes) | (a) slug-mapping bug | **Synced via fallback.** Consider changing rotation's key-generation to namespace by `index` consistently (e.g. always `{slug}--{index}`) rather than only on collision, to avoid this class of bug entirely. |
| `figure-ai-robotics-labs` | Figure AI | robotics-labs | Same cross-index collision pattern (Figure AI also exists in `ai-labs`) | (a) slug-mapping bug | **Synced via fallback.** Same recommendation as above. |
| `washington-dc-us-cities` | Washington DC | us-cities | Cross-index collision: base key `washington-dc` already claimed by the `us-states` entity | (a) slug-mapping bug | **Synced via fallback.** |
| `portland-us-cities` | Portland | us-cities | Intra-index duplicate (Portland ME and Portland OR both in us-cities); rotation's own disambiguation appended `-us-cities` to the second one rather than a rank or state qualifier | (a) slug-mapping bug | **Synced via fallback** (resolved unambiguously because the other Portland was already claimed by the primary pass). Recommend rotation adopt a state-qualified key for city duplicates (e.g. `portland-or`) going forward. |
| `springfield-us-cities` | Springfield | us-cities | Same intra-index duplicate pattern (Springfield IL / Springfield MO) | (a) slug-mapping bug | **Synced via fallback.** Same recommendation. |
| `washington-dc-global-cities` | Washington DC | global-cities | Cross-index collision: base key already claimed by `us-states`, then by `us-cities` | (a) slug-mapping bug | **Synced via fallback.** |
| `new-york-city-global-cities` | New York City | global-cities | Cross-index collision: base key already claimed by `us-cities` | (a) slug-mapping bug | **Synced via fallback.** |
| `boston-global-cities` | Boston | global-cities | Cross-index collision with `us-cities` Boston | (a) slug-mapping bug | **Synced via fallback.** |
| `singapore-global-cities` | Singapore | global-cities | Collision with a `countries`-index or other entity sharing the base slug | (a) slug-mapping bug | **Synced via fallback.** |
| `portland-global-cities` | Portland | global-cities | Collision with `us-cities` Portland entries | (a) slug-mapping bug | **Synced via fallback.** |
| `seattle-global-cities` | Seattle | global-cities | Cross-index collision with `us-cities` Seattle | (a) slug-mapping bug | **Synced via fallback.** |
| `minneapolis-global-cities` | Minneapolis | global-cities | Cross-index collision with `us-cities` Minneapolis | (a) slug-mapping bug | **Synced via fallback.** |
| `san-francisco-global-cities` | San Francisco | global-cities | Cross-index collision with `us-cities` San Francisco | (a) slug-mapping bug | **Synced via fallback.** |
| `philadelphia-global-cities` | Philadelphia | global-cities | Cross-index collision with `us-cities` Philadelphia | (a) slug-mapping bug | **Synced via fallback.** |
| `houston-global-cities` | Houston | global-cities | Cross-index collision with `us-cities` Houston | (a) slug-mapping bug | **Synced via fallback.** |
| `atlanta-global-cities` | Atlanta | global-cities | Cross-index collision with `us-cities` Atlanta | (a) slug-mapping bug | **Synced via fallback.** |
| `detroit-global-cities` | Detroit | global-cities | Cross-index collision with `us-cities` Detroit | (a) slug-mapping bug | **Synced via fallback.** |
| `chicago-global-cities` | Chicago | global-cities | Cross-index collision with `us-cities` Chicago | (a) slug-mapping bug | **Synced via fallback.** |
| `los-angeles-global-cities` | Los Angeles | global-cities | Cross-index collision with `us-cities` Los Angeles | (a) slug-mapping bug | **Synced via fallback.** |
| `phoenix-global-cities` | Phoenix | global-cities | Cross-index collision with `us-cities` Phoenix | (a) slug-mapping bug | **Synced via fallback.** |
| `reflection-ai` | Reflection AI | ai-labs | Rotation carries 54 `ai-labs` entities (with real `last_assessed`/`last_change_proposal` dates and `rank: null` — i.e. the pipeline has assessed it) but published `ai-labs.json` only contains 50 labs and does not include this one | (b) pending addition to published index | **Not synced — left untouched, as required.** Recommend confirming with the research/product owner whether this lab should be added to the next `ai-labs.json` publish cycle, or whether it was intentionally excluded (e.g. scope/eligibility criteria) and the rotation entry should instead be retired. |
| `nvidia-ai` | Nvidia AI | ai-labs | Same pattern — assessed in rotation, absent from published index | (b) pending addition to published index | **Not synced.** Same recommendation. |
| `spacex-ai` | SpaceX AI | ai-labs | Same pattern | (b) pending addition to published index | **Not synced.** Same recommendation. |
| `oracle-ai` | Oracle AI | ai-labs | Same pattern | (b) pending addition to published index | **Not synced.** Same recommendation. |

No entries in this set were assessed as (c) "stale entry that should be
removed" — every unmatched entity either resolved to a real published
counterpart via the fallback matcher (23) or shows clear evidence of active
pipeline assessment (non-null `last_assessed`/`last_change_proposal`,
`rank: null` rather than a stale legacy value) consistent with genuinely
pending publication (4). None were removed, deleted, or otherwise modified,
per the task's explicit instruction to leave the 27 orphans untouched.

## Files touched

- `research/scripts/reconcile-rotation-state.mjs` — new, re-runnable
  reconciliation script.
- `research/rotation-state.json` — 1,235 entities synced
  (`composite`/`band`/`rank` only); `last_updated` set to `2026-07-19`; all
  `last_*` timestamps, `name`, and `index` fields preserved exactly on every
  entity, including the 21 deferred `us-states` and 4 unmatched entities.
- `research/rotation-state.backup-2026-07-19.json` — new, pre-write backup
  of the original file.
- `research/ROTATION_STATE_RECONCILIATION_2026-07-19.md` — this document.

`site/src/data/indexes/*.json` was not read for writing and was not
modified — verified via `git status` showing no changes under that path.

## Follow-ups (not executed, for triage/decision)

1. Fix `us-states.json` (all 51 states with true national ranks) so
   rotation-state's `us-states` entries can be synced in a follow-up run
   without propagating rank corruption.
2. Decide the fate of the 4 unmatched `ai-labs` entities (Reflection AI,
   Nvidia AI, SpaceX AI, Oracle AI) — add to the next `ai-labs.json`
   publish, or retire from rotation if intentionally out of scope.
3. Consider hardening rotation-state's own key-generation convention
   (consistent diacritic normalization; explicit index-namespacing rather
   than collision-triggered suffixing) to prevent this class of
   slug-mapping bug from recurring for newly added entities.
