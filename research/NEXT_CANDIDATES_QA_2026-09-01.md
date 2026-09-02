# QA Gap Analysis — Top 5 Quality/Validation Gaps (2026-09-01)

Prepared by: QA Engineer. Method: read `OBSERVABILITY.md`, `INCIDENTS.md`, `RISKS.md`, the six
validator scripts named in the brief, `.github/workflows/deploy.yml`, and the relevant agent
specs; then ran every validator live against the current working tree and cross-checked specific
claims against git history and raw JSON, rather than trusting prior write-ups. Every claim below
is either (a) reproduced live in this session, with the command shown, or (b) explicitly marked
as unverifiable / hypothetical. Nothing here was inferred from a prior document without a direct
check.

Constraint honored: no index, rotation-state, change-proposal, assessment, agent spec, workflow,
or `site/src/data/updates/**` file was modified. Nothing was committed. All commands below were
read-only.

---

## 0. What I verified before analyzing

| Check | Command | Live result (this session) | Matches `OBSERVABILITY.md`? |
|---|---|---|---|
| `validate-indexes.mjs` | `node site/scripts/validate-indexes.mjs` | 85,477 checks passed, 0 errors, 65 warnings | Yes, exact match |
| `test-entity-records.mjs` | `node site/scripts/test-entity-records.mjs` | 19,702 passed, 0 failed, 1.7s runtime | Yes, exact match |
| `validate-daily-briefings.mjs` | `node site/scripts/validate-daily-briefings.mjs` | PASS — 77 of 77 briefings | Close (76→77; one more briefing published since) |
| `lint-daily-briefings.mjs` | `node site/scripts/lint-daily-briefings.mjs` | PASS — 79 files clean | Close (78→79, same reason) |
| `validate-rotation-state.mjs` | `node research/scripts/validate-rotation-state.mjs` | 24 blocking failures, 0.1s runtime | Yes, exact match |
| `validate-scan.mjs` | `node research/scripts/validate-scan.mjs 2026-08-26` | PASS | Consistent with "hard gate" framing |
| CI freshness assertion | read `.github/workflows/deploy.yml` lines 163–188 | Compares `manifest.json .latest` to live `/updates/feed.json` first item's `date_published` | Confirmed as described |

Two things I checked that were **not** previously documented and materially change the risk
picture — both feed directly into the gaps below:

1. **`test-entity-records.mjs` (the largest test suite in the repo, 19,702 tests) does not appear
   anywhere in `site/package.json` or `.github/workflows/`.** Confirmed by direct grep. It is
   never run by `npm test`, `npm run build`, or CI — only when a human or agent remembers to
   invoke it by hand.
2. **`validate-scan.mjs` and `validate-rotation-state.mjs` also do not appear anywhere in
   `.github/workflows/`.** Confirmed by direct grep of the one workflow file that exists
   (`deploy.yml`). These are self-administered checks the scanner/assessor agents are *instructed*
   to run (`overnight-scanner.md` Step 9), not mechanically enforced gates.

---

## 1. The five gaps

Ranked by total score (Impact + Strategic + Learning + Confidence − Effort − Risk, each on a 1–5
scale except Effort/Risk which subtract). Full reasoning per gap follows the table; **read the
reasoning, not just the score** — Confidence is deliberately penalized wherever I could not
independently reproduce a claim.

| # | Gap | Score | Escapes it would have caught |
|---|---|---|---|
| 1 | Freshness assertion is blind to score-only deploys | **14** | #5 (stale deploy) — reopens the exact mechanism, for the one artifact class not covered |
| 2 | `test-entity-records.mjs` / `validate-rotation-state.mjs` not wired into CI | **13** | #2 (orphaned slugs), #7 (last_assessed corruption) |
| 3 | `proposed_subdimensions` has no schema validator | **12** | #3 (proposal schema drift) — confirmed still live, right now |
| 4 | `validate-scan.mjs` verdict is unaudited and unenforced downstream | **10** | #6 (assessor coverage gap) — structurally, with a caveat on direct causal proof |
| 5 | No corroboration-count check for single-source severe claims | **8** | #1 (retracted source / near-false-death) |

---

### Gap 1 — Freshness assertion is blind to score-only deploys (Score: 14)

**What it lets through.** A deploy that changes *published scores*
(`site/src/data/indexes/*.json`) but does not also change that day's daily-briefing JSON can go
live stale, indefinitely, with the freshness assertion reporting green — because the assertion
compares `manifest.json .latest` (a briefing-date pointer) against the live feed's first item
date, and if the commit didn't touch the briefing pointer, "expected" and "live" are compared
against the same unchanged value regardless of whether the underlying container is stale. This is
**the exact INC-002 failure mode**, for the one artifact class the INC-002 fix does not cover.

**The real incident that proves it.** I checked git history for commits that modified
`site/src/data/indexes/*.json` without a corresponding same-commit change to
`site/src/data/updates/daily/*.json` or `manifest.json`. Found three, all recent:

```
4c715d9f 2026-08-21  Apply 29 proposals; delist Apexica; add 14 robotics baselines (index 50 -> 63)
  -> touches ai-labs, countries, fortune-500, global-cities, robotics-labs. No daily/ or manifest.json change.
49937b03 2026-08-17  De-seed robotics-labs 60.9 cluster; merge duplicate ADP entity
  -> touches fortune-500 only. No daily/ or manifest.json change.
083e1838 2026-08-16  Apply 16 approved proposals — founder-approved override batch
  -> touches ai-labs, countries, fortune-500, global-cities, universities. No daily/ or manifest.json change.
```

Had a cached-Docker-layer deploy occurred immediately after any of these three, the freshness
assertion would have passed (nothing it compares changed), and the site would have served stale
scores across up to five indexes with every single check in the pipeline — including the
assertion built specifically to catch this — green. This is not the INC-002 incident itself; it
is proof that its fix has an open blind spot for the pipeline's single most sensitive artifact
class (published scores, as opposed to daily-briefing prose).

**The concrete check.** The existing "Per-entity score file is served (sample: slovakia)" step in
`deploy.yml` (lines 137–146) already fetches a live score file and extracts `composite` — but only
logs it, never asserts on it. Two options, in order of cheapness:
- **Cheapest:** turn that existing step into a real assertion. At build time, have
  `site/scripts/export-public-data.mjs` (or a one-line addition to it) also write the commit's
  `slovakia.json` composite (or any fixed sentinel entity) into an env/output value the workflow
  can read from the checked-out repo (`node -p "require('./site/src/data/indexes/countries.json').rankings.find(r=>r.name==='Slovakia').composite"`), then compare that expected value against the
  already-fetched live `composite` in the existing step. Fail if they differ.
- **More robust (covers all 8 indexes, not one sentinel):** add a build step that writes a content
  hash of the concatenated `site/src/data/indexes/*.json` into the static export (e.g.
  `public/data/index-content-hash.txt`), and add a CI step mirroring the existing freshness
  assertion exactly (fetch the live hash, compare to the hash computed from this commit's index
  files, fail loudly with the same remedy text).

**Where it belongs.** `.github/workflows/deploy.yml`, `verify` job, directly beside the existing
freshness assertion (same job, same pattern, reuses the already-checked-out repo).

**Effort.** Small — half a day. The sentinel-value version needs zero new build script; the
hash version needs one ~15-line script addition plus one ~15-line CI step, both copying an
existing pattern.

**False-positive risk.** Low. A deterministic hash or a direct value comparison against the
commit's own data cannot produce a false failure unless the hash/value generation itself is
non-deterministic (it is not — it reads static JSON).

**Score.** Impact 5 (reopens the site's only Critical incident, for an artifact class proven
uncovered) + Strategic 4 (protects the core "our scores are correct and current" claim) +
Learning 3 (the general lesson — "freshness" must be defined per data artifact, not by one proxy
pointer — likely generalizes to future artifact classes) + Confidence 5 (reproduced directly from
git history, not speculative) − Effort 2 − Risk 1 = **14**.

---

### Gap 2 — `test-entity-records.mjs` and `validate-rotation-state.mjs` are not wired into CI (Score: 13)

**What it lets through.** Any commit that corrupts an entity record's invariants — a record whose
`composite`/`band`/`rank` no longer matches its index row (G1), a record with the wrong number of
subdimensions, or a `last_assessed` claim on `rotation-state.json` with no backing report — can
reach `main` and production with **zero automated checks running**, because the only two scripts
that would catch these things are not part of `npm test`, `npm run build`, or
`.github/workflows/deploy.yml`. Both are read-only, deterministic, and fast (confirmed live this
session: `test-entity-records.mjs` completes in 1.7s covering 19,702 assertions;
`validate-rotation-state.mjs` completes in 0.1s) — there is no performance justification for the
omission.

**The real incident that proves it.** This is the general mechanism behind two of the seven named
escapes, not a single dated incident on its own:
- **Escape #2 (orphaned slugs)** — a record/page slug mismatch is exactly the class of defect
  `test-entity-records.mjs` check (a) (G1 verbatim match) and `validate-indexes.mjs` checks 12–16
  are built to surface, but `validate-indexes.mjs` *is* wired into `npm run build` while
  `test-entity-records.mjs` is not — meaning the more exhaustive of the two record-integrity gates
  is the one left unenforced.
- **Escape #7 (`last_assessed` corruption, INC-003)** — `INCIDENTS.md` states this was caught by
  `validate-rotation-state.mjs`, but only because someone ran it by hand; nothing forced that run,
  and the instruction that caused the corruption "survived in `score-updater.md` for eight days
  after the repair" per the brief — consistent with a check that exists but isn't gating anything.

Confirmed directly: `grep -rn "test-entity-records" .github/workflows/ site/package.json` returns
nothing. `test-entity-records` is not even listed as an unused npm script — it has no entry point
at all outside a direct `node scripts/test-entity-records.mjs` invocation.

**The concrete check.** No new script needed — wire the two that already exist and already work:
1. Add `"test:entity-records": "node scripts/test-entity-records.mjs"` to `site/package.json` and
   append it to the `"test"` chain, so `npm test` (already run in `deploy.yml`'s `test` job) covers
   it.
2. Add a step in `deploy.yml`'s `test` job: `node research/scripts/validate-rotation-state.mjs`.
   Because it currently has 24 pre-existing, documented, non-blocking "phantom" failures
   (per `INCIDENTS.md` INC-003), do not gate on 0 failures — gate on **no regression past the
   current baseline of 24** (parse the failure count from stdout, or add a `--max-failures 24`
   flag to the script itself, failing only if the count exceeds it). This makes the gate
   meaningful for new corruption without being blocked by the known backlog.

**Where it belongs.** `site/package.json` (`test` script chain) + `.github/workflows/deploy.yml`
(`test` job, alongside the existing `npm test` / `npm run build` steps).

**Effort.** Trivial — under an hour. Both scripts already exist, already exit non-zero on
failure, and already run in seconds. This is pure wiring, not new logic (except the small
`--max-failures` allowance for `validate-rotation-state.mjs`).

**False-positive risk.** Low for `test-entity-records.mjs` (deterministic, currently 0 failures).
Medium for `validate-rotation-state.mjs` if wired as a hard 0-failures gate — mitigated by the
baseline-count approach above; without that mitigation this gap would immediately break the build.

**Score.** Impact 4 (the single highest-assertion-count gate in the repo currently has zero
automated enforcement) + Strategic 4 (the cheapest fix in this entire list — wiring existing,
already-working code) + Learning 2 (mechanical, not a new capability or insight) + Confidence 5
(confirmed by direct grep, zero speculation) − Effort 1 − Risk 1 = **13**.

---

### Gap 3 — `proposed_subdimensions` has no schema validator; malformed shapes are live in applied data today (Score: 12)

**What it lets through.** `score-updater.md` Step 2i documents `proposed_subdimensions` as
required to be an array of subdimension objects; `apply-entity-record.mjs` builds the entity
record from it. Nothing validates the shape before or after. I checked every file in
`research/change-proposals/` for the actual shape of `proposed_subdimensions` today:

```
713 total proposal files, 16 currently status:"pending"
25 files have a non-canonical shape; 23 of those are status:"applied" (live, published data)
Of those 25: 2 (mali.json, niger.json — both status:"applied") are a NESTED MAP
  ({ "AWR": { "A1": 2, "A2": 1, ... }, "EMP": {...}, ... }) instead of the documented
  40-element array. The other 23 are legitimate partial-length arrays (15/20/25/30/35
  elements — multiples of 5, representing "only these dimensions were rescored," which
  score-updater.md explicitly documents as valid: "reconstructed for unchanged dimensions.")
```

I traced the consequence for `mali.json` directly: the *dimension-level* published scores are
correct (I confirmed `mean(nested-map values per dimension)` matches
`site/src/data/indexes/countries.json`'s Mali row exactly, e.g. SYS: [2,1,1,2,1] → mean 1.4 →
published SYS score 1.4) — so no wrong number is live. But
`site/src/data/entity-records/mali.json`'s subdimensions are **all tagged
`"subdims_source": "reconstructed"` with uniform, evidence-free values** (e.g. A1=A2=A3=A4=A5=1.2
for AWR), even though the real proposal had differentiated values (2,1,1,1,1) with cited evidence
for at least A1. The real assessed detail was silently discarded because
`apply-entity-record.mjs` couldn't parse the nested-map shape, fell back to reconstruction, and
nothing in `validate-indexes.mjs`, `test-entity-records.mjs`, or `score-updater.md`'s own gate
compares the *proposal's* content against what the record ends up storing — they only check the
record is internally self-consistent, which a reconstruction trivially is.

**Precision note on the escape as described:** the brief states schema drift proposals "neither
would have applied" — what I found is a milder but still real variant: the proposal *did* apply
(status: "applied", correct composite/band/rank), but its structured subdimension evidence was
silently and untraceably discarded in favor of a fabricated-looking flat reconstruction. This is
the same defect class (an unvalidated shape reaching the pipeline undetected), with a different
downstream consequence than the brief describes. Flagging the discrepancy per instructions.

**The concrete check.** New script `research/scripts/validate-change-proposals.mjs`, run over
every file in `research/change-proposals/**/*.json` regardless of status (so it also serves as a
one-time retroactive audit — it will immediately flag `mali.json` and `niger.json`). For any file
where `proposed_subdimensions` is present:
1. Must be an `Array` (fail with the exact malformed type/shape printed — this alone catches the
   nested-map and any future filepath-string recurrence).
2. `length` must be a positive multiple of 5, and ≤ 40.
3. Every element must have `code` (one of the 40 canonical codes from `dimensions.ts`, no
   duplicates within the file), `dimension` (matching that code's canonical parent), `name`
   (matching canonical), `score` (number, 1.0–5.0 inclusive, or 0 for the harm floor).
4. Every dimension group actually present must have exactly 5 members (guards against a
   truncated/malformed partial array, not just a wrong total length).
5. If the file also states a per-dimension proposed value, `mean(subdims of that dimension)` must
   equal it within 1e-9 (mirrors `validate-indexes.mjs` check 14's own tolerance logic).

**Where it belongs.** New script in `research/scripts/`, alongside `validate-scan.mjs`. Referenced
as a **required pre-apply step in `score-updater.md` Step 2i** (run before
`apply-entity-record.mjs`, refuse to apply on failure — this is a pre-write refusal, not just
detection) and as a required step in `overnight-assessor.md`'s proposal-writing section (catch it
at the source, not just before apply).

**Effort.** Small–medium — half to one day. The pattern (per-file structural check, printed
failures, exit 1) is a direct copy of `validate-scan.mjs`'s existing style; the canonical
40-subdim table is already duplicated in three other scripts in this repo (`validate-indexes.mjs`,
`test-entity-records.mjs`) and can be copied a fourth time or, better, factored into a shared
`site/scripts/lib/subdim-schema.mjs` used by all four.

**False-positive risk.** Low, provided the multiple-of-5 partial-array rule is implemented
correctly (must NOT flag the 23 legitimate partial-rescore files as broken — confirmed these are
by-design per `score-updater.md`: "assessed where provided, reconstructed for unchanged
dimensions").

**Score.** Impact 4 (silent, untraceable loss of real assessment evidence on two currently-live
public records, with a demonstrated 2-of-25-anomalous recurrence rate suggesting this is not a
one-off) + Strategic 3 (protects the "evidence-based" claim that differentiates this product) +
Learning 3 (closes a defect pattern the brief says has already recurred twice) + Confidence 5
(proven live in the repo right now, not inferred) − Effort 2 − Risk 1 = **12**.

---

### Gap 4 — `validate-scan.mjs`'s verdict is self-administered, unaudited, and not enforced downstream (Score: 10)

**What it lets through.** A scan that under-covers the rotation, mistags tiers, or ships unsourced
evidence can be handed to the assessor and produce real, published assessment output even though
`validate-scan.mjs` would say FAIL — because (a) nothing forces the scanner to run it (it's a
self-instruction in `overnight-scanner.md` Step 9: "Do not hand off a scan with unresolved
validator FAILs" — discipline, not a gate), (b) nothing persists whether it ran or what it
returned (confirmed: no scan JSON in the repo carries any validation-result field — I inspected
`research/scans/2026-08-11.json`'s full key list and there is no `validation` key of any kind),
and (c) the assessor stage has no Step 0 that reads a verdict before starting, because there is
nothing to read.

**The real incident that proves it, with an honest caveat.** I attempted to directly reproduce
escape #6 by re-running `validate-scan.mjs` against every historical scan that has a matching
`*-assessor-summary.json` (81 date/summary pairs, `2026-04-15` through `2026-08-26`). **Every
single one fails except the most recent (`2026-08-26`, which passes).** This looked at first like
direct proof the assessor has repeatedly proceeded on failing scans — but I checked further and
found the failures are dominated by `entity_reviews count != rotation entity count`, which is an
artifact of the validator comparing a historical scan against **today's** `rotation-state.json`
(1,331 entities) rather than the entity count that existed on the scan's own date. I confirmed
`rotation-state.json` grew after `2026-08-11` specifically (robotics-labs expanded 50→63→92 in
commits dated `2026-08-21` and later, per `git log`), so re-running the validator today against an
old scan will show a coverage "gap" that may not have existed at run time. **I cannot use this
retroactive run as proof that any specific historical assessor run bypassed a live-failing gate**,
and I am not presenting it as such.

What *is* independently confirmed, without that caveat, and is the actual finding: **there is no
mechanism, today, by which anyone could tell — for any past night — whether `validate-scan.mjs`
passed at the time it mattered.** The gate is structurally unauditable after the fact. That
absence of an audit trail is itself the gap escape #6 depends on: if the assessor coverage miss on
2026-08-11 was in fact caused by proceeding on a failing/under-covering scan, nothing in this
repository could prove or disprove it either way, before or after.

**The concrete check.**
1. Modify `validate-scan.mjs` to write its own verdict to a sibling file
   `research/scans/<date>.validation.json` (`{ passed: bool, failures: [...], warnings: [...],
   checked_at: <ISO timestamp> }`) on every run, in addition to its existing stdout/exit-code
   behavior — cheap, since the `failures`/`warnings` arrays already exist in memory at the point
   the script currently just prints and exits.
2. New script `research/scripts/validate-assessor-lineage.mjs`: for every
   `research/scans/<date>-assessor-summary.json` present, assert a
   `research/scans/<date>.validation.json` exists with `passed: true`. FAIL loudly, naming the
   date, if the summary exists but no passing verdict is on record (covers both "gate never ran"
   and "gate ran and failed but the assessor proceeded anyway").

**Where it belongs.** `research/scripts/validate-scan.mjs` (add the write-back — small change);
new `research/scripts/validate-assessor-lineage.mjs` (new, ~40 lines, same style as
`validate-rotation-state.mjs`); referenced as a mandatory Step 0 pre-flight in
`overnight-assessor.md`, and added to the same QA-run validator suite used each cycle. Not
CI-wired by default (it depends on same-night files that don't exist until the pipeline runs),
but should be part of the standard QA sweep alongside the six scripts named in this brief.

**Effort.** Small — a few hours. `validate-scan.mjs` already computes everything the write-back
needs; the cross-check script is a direct pattern copy of `validate-rotation-state.mjs`.

**False-positive risk.** Low — mechanical file-presence/field check. The only failure vector is a
legitimate re-run of `validate-scan.mjs` after fixing issues not overwriting the earlier failing
verdict; mitigated by always overwriting (never appending) the verdict file.

**Score.** Impact 4 (targets a stage with a real, named coverage-gap incident and zero current
enforcement) + Strategic 3 (makes an already-designed, already-written gate actually load-bearing
instead of advisory) + Learning 3 (the "self-attested, never audited" pattern is worth naming
because it likely recurs at other pipeline handoffs, not just this one) + Confidence 3 (the
structural absence of an audit trail is fully confirmed; the specific causal claim about
2026-08-11 could not be confirmed and I deliberately down-scored confidence for that reason) −
Effort 2 − Risk 1 = **10**.

---

### Gap 5 — No corroboration-count check for single-source severe/atrocity-tier claims (Score: 8)

**What it lets through.** `validate-scan.mjs` §4/4a/4b/4c thoroughly validate that a source is
*dated* and that its date is internally consistent with the claimed `evidence_date` — but nothing
in the pipeline checks whether the underlying claim still *stands*. A single source, correctly
dated, correctly URL-verified, can still have been retracted after the scanner read it, and
nothing downstream would know. This is precisely the confirmed 2026-08-26 pattern the brief
names: "a reported killing was retracted after the scanner read it. Both sources were correctly
dated. No gate re-checks whether a source still stands."

**The real incident that proves it — with a documentation gap flagged.** The brief states this
event as real and dated (2026-08-26). I searched `INCIDENTS.md` in full and could not find a
dedicated `INC-0xx` entry for it — the log's most recent entries are INC-001 through INC-007,
none of which describe a retraction. **I am treating the incident as real per the brief (I have no
basis to doubt it), but flagging as a separate, smaller finding that a Critical-severity near-miss
("nearly published a false death") has no corresponding logged entry in this repository's own
incident log** — which is itself a gap in `INCIDENTS.md`'s completeness, worth a one-line note to
whoever maintains it.

**The concrete check.** Live re-fetching to detect retraction is explicitly out of scope for
`validate-scan.mjs` by design (its header states plainly: "these are heuristics... not a live
fetch"), and building a reliable live-retraction-detector is neither cheap nor deterministic
(flaky on paywalls, rate limits, and false negatives). The cheap, deterministic partial mitigation
is a **corroboration-count gate**, not a retraction-detector:
1. In `validate-scan.mjs`, extend the existing `SUPERLATIVE_PATTERNS` approach with a small,
   explicit, conservatively-curated severity lexicon (`killed`, `killing`, `death`, `dead`,
   `massacre`, `execution` — deliberately narrow to avoid over-triggering). Any `entity_reviews[]`
   record whose `summary` matches this lexicon **and** has fewer than 2 sources from distinct
   registrable domains (reuse the existing `new URL(u).hostname` parsing already in the file) is
   flagged as a WARNING (not a hard fail, given real single-source urgent-but-true stories exist).
2. In `validate-daily-briefings.mjs`'s evidence-integrity section (`checkEvidenceItem` /
   `checkEvidence`), which already has per-item `evidence[]` plumbing, add a rule: any
   `topSignals[]`/`scoreChanges[]` item whose text matches the same severity lexicon must carry
   `evidence.length >= 2` with distinct `source` values before it can pass — this is the last
   deterministic checkpoint before the claim becomes public, so make it a hard ERROR here (not
   just a scan-time warning) since by publish time there has been a full night's opportunity to
   corroborate or downgrade the claim.

**Where it belongs.** `research/scripts/validate-scan.mjs` (flag at scan time, WARNING) +
`site/scripts/validate-daily-briefings.mjs` (block at publish time, ERROR) — deliberately two
checkpoints of increasing strictness, matching how early/late each is in the pipeline.

**Effort.** Medium — about a day. Both additions reuse existing code shapes
(`SUPERLATIVE_PATTERNS`, `checkEvidenceItem`) directly; the real cost is careful, conservative
curation of the severity lexicon to avoid excess noise.

**False-positive risk.** Medium — a real, single-source, urgent, true story (which legitimately
happens in breaking-news coverage) will get flagged and require a manual override at the
scan-time WARNING stage. This is intentional (the check forces a pause and a second source before
a severe, individually-attributable claim goes public) but will generate real friction if the
lexicon is too broad; recommend starting narrow (literally just death/killing terms, not the
full range of atrocity language) and expanding only after observing the false-positive rate over
a few cycles.

**Score.** Impact 5 (the single highest per-instance severity item in this list — a false claim of
a specific death almost reaching a public benchmark) + Strategic 3 (directly mitigates the
reputational/legal exposure already logged as `RISKS.md` RISK-007) + Learning 2 (source-retraction
risk is an inherent, well-understood risk of any pipeline citing live news; the corroboration-gate
mitigation is a known pattern, not a novel insight) + Confidence 3 (the underlying incident is
asserted by the brief and I have no reason to doubt it, but I could not independently corroborate
it against this repo's own incident log the way I could for every other item in this report, so I
scored one point lower on confidence than the other four gaps) − Effort 3 − Risk 2 = **8**.

---

## 2. Recommended next action

**Ship Gap 2 (wire `test-entity-records.mjs` and `validate-rotation-state.mjs` into CI) and Gap 1
(extend the freshness assertion to cover score data, not just briefing date) together, in one PR,
this week.**

Reasoning: Gap 1 has the highest score and the strongest evidence (a reproduced, named git
history showing three real commits that would have been invisible to the existing freshness
assertion) — it is the one item on this list that reopens a **Critical**-severity incident
pathway for the site's core data product. Gap 2 is not far behind on score and is close to
free — it wires two already-written, already-fast, already-passing validators into a pipeline
that already runs `npm test` and `npm run build` on every push; there is no reason not to ship it
in the same PR as Gap 1, since both are pure CI/config changes with no new business logic and no
meaningful false-positive risk (once Gap 2's `validate-rotation-state.mjs` baseline-count
allowance for the 24 known pre-existing failures is implemented as specified).

Gap 3 (proposal schema validator) should follow immediately after — it is the only item on this
list with a **currently live, confirmed defect** (`mali.json`, `niger.json`) sitting in the
repository right now, and running the new validator once, retroactively, over
`research/change-proposals/` would both fix the immediate audit gap and hand `benchmark-research`
a concrete todo (re-derive and correctly write the real subdimension evidence for those two
entities, since the current published records silently misrepresent it as "reconstructed").

Gaps 4 and 5 are real and worth building, but both carry a confidence caveat I disclosed
explicitly above (an unprovable historical causal claim for Gap 4; an unlogged incident for Gap 5)
and both require more careful design (a lexicon that won't create excess noise, a write-back
schema that won't be silently ignored the way the existing self-check already is) — sequence them
after the three cheaper, higher-confidence items above.

---

## 3. Files referenced (all read-only in this session)

- `C:\Users\philk\applied-compassion-benchmark\OBSERVABILITY.md`
- `C:\Users\philk\applied-compassion-benchmark\INCIDENTS.md`
- `C:\Users\philk\applied-compassion-benchmark\RISKS.md`
- `C:\Users\philk\applied-compassion-benchmark\research\scripts\validate-scan.mjs`
- `C:\Users\philk\applied-compassion-benchmark\research\scripts\validate-rotation-state.mjs`
- `C:\Users\philk\applied-compassion-benchmark\site\scripts\validate-indexes.mjs`
- `C:\Users\philk\applied-compassion-benchmark\site\scripts\validate-daily-briefings.mjs`
- `C:\Users\philk\applied-compassion-benchmark\site\scripts\lint-daily-briefings.mjs`
- `C:\Users\philk\applied-compassion-benchmark\site\scripts\test-entity-records.mjs`
- `C:\Users\philk\applied-compassion-benchmark\site\scripts\test-entity-href.mjs`
- `C:\Users\philk\applied-compassion-benchmark\site\src\lib\entityHref.ts`
- `C:\Users\philk\applied-compassion-benchmark\site\src\data\entities.ts`
- `C:\Users\philk\applied-compassion-benchmark\site\scripts\build-entity-records.mjs`
- `C:\Users\philk\applied-compassion-benchmark\site\package.json`
- `C:\Users\philk\applied-compassion-benchmark\.github\workflows\deploy.yml`
- `C:\Users\philk\applied-compassion-benchmark\.claude\agents\overnight-scanner.md`
- `C:\Users\philk\applied-compassion-benchmark\.claude\agents\overnight-assessor.md`
- `C:\Users\philk\applied-compassion-benchmark\.claude\agents\score-updater.md`
- `C:\Users\philk\applied-compassion-benchmark\research\change-proposals\mali.json`
- `C:\Users\philk\applied-compassion-benchmark\research\change-proposals\niger.json`
- `C:\Users\philk\applied-compassion-benchmark\site\src\data\entity-records\mali.json`
- `C:\Users\philk\applied-compassion-benchmark\site\src\data\indexes\countries.json`
- `C:\Users\philk\applied-compassion-benchmark\research\rotation-state.json`
- `C:\Users\philk\applied-compassion-benchmark\research\scans\2026-08-11.json` and
  `2026-08-11-assessor-summary.json`
