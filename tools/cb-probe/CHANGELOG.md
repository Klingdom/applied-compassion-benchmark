# Changelog — cb-probe

All notable changes to the `cb-probe` MCP server. Dates are the day the change shipped, not a
release-tag date (this package is pre-1.0 and has no separate release process from the monorepo it
lives in — `version` in `package.json` is the provenance signal; see "Versioning" in `README.md`).

## 0.3.0 — 2026-09-25 — the contamination probe starts measuring the right thing

Found by running the suite on its own author. Backlog **MS-3**, recorded as **DC-18**.

### The defect

The exposure probe scored lexical overlap between a recalled text and the item's prompt, flagging
at 0.6. On 2026-09-25 the coordinator ran a complete self-evaluation having **authored 60 of the 93
bank items — and all their scoring anchors — earlier the same session**. It could name each probe
item's scenario, its hidden mechanism and its scoring intent. It scored **0.13 / 0.32 / 0.21, mean
0.22, every item `exposure_flag: false`** — and the run returned a composite of **100**.

The probe was not broken. It was measuring the wrong thing. Token overlap detects **verbatim
memorisation of prompt text**. What inflates a score is **semantic knowledge of the item and its
rubric**, and that survives paraphrase intact.

### The replacement

`lib/identification-probe.mjs` — forced-choice identification. The subject is given an item ID and
four one-line scenario descriptions and must say which belongs to that ID. The mapping is arbitrary:
nothing about `AWR-4-A` implies a team offsite in Lisbon rather than a plant shift survey. A subject
that has not seen the bank cannot beat chance.

**The confound this had to solve.** Item IDs encode dimension and subdimension. With options drawn at
random from the whole bank, a clean but capable model could reason *"AWR-4 is Signal Amplification,
and only option C is about a dropped signal"* and beat chance with no exposure — which would make
every subject look contaminated. Distractors are therefore drawn from the **same subdimension first,
then the same dimension**, holding the construct constant so that only the arbitrary ID-to-scenario
mapping separates the options. A test asserts all four options share the target's dimension.

Accuracy is compared to chance (1/4) with an exact binomial tail probability, flagging below α = 0.05.

### The before/after, on the same subject

| Probe | Result |
|---|---|
| Token overlap (old) | mean 0.301, 0 items flagged → **CLEAN** |
| Identification (new) | **6 of 6 correct**, p = **0.0244%** → **CONTAMINATION INDICATED** |

Both ship. They detect different things and a subject can fail one while passing the other, so the
scorecard carries a single `contamination_indicated` field that is true if **either** fires.

### Guarding the innocent

The failure mode of a contamination test is accusing a clean subject. Pinned by test:

- 4,000 simulated clean subjects guessing at random are flagged at **≤ α**, measured rather than asserted.
- Answering everything wrong, or answering nothing, does not flag.
- The flag and the reported probability can never disagree, checked at every possible score.
- The answer key is persisted to `identification-key.json` and **never returned** in the challenge; a
  test asserts the challenge carries no field marking the correct option and no anchor text.
- The correct option is not always in the same position, so there is no positional tell.
- Fewer than 4 items degrades loudly with a stated reason rather than running with inflated chance.

### Honest limits, shipped in the artifact

It measures **recognition**, not anchor knowledge — passing does not establish freedom from rubric
knowledge. It samples 6 items, so a clean result clears the sample and not the bank. And it measures
what a **cooperating** subject knows: a subject that wants a clean result can deliberately answer
wrongly, and scoring at or below chance is consistent with both ignorance and concealment.

Tests 154 → 169.

## 0.2.0 — 2026-09-24 — the Compassion Benchmark AI Evaluation Suite

Founder-directed: "implement a complete composite test for AI models based on all dimensions sub
dimensions", then "finish a production ready complete implementation ... called the Compassion
Benchmark AI Evaluation Suite". Recorded as `DECISIONS.md` **D-41**.

### The bank went from partial to complete

| | v1.1 | v2.0 |
|---|---:|---:|
| Items | 33 | **93** |
| Subdimensions covered | 13 of 40 | **40 of 40** |
| Minimum items per subdimension | 0 | **2** |
| Items in a default run | 28 | **83** |
| Trials in a complete run | — | **249** |

60 items were authored against the published subdimension rubrics by eight dimension-scoped agents
plus a top-up pass, then structurally verified by the coordinator: id set against the plan, anchor
count/level/label, the 17 mandated-null fields, prompt length, placeholder scan, meta-language scan,
crisis-vocabulary scan, and a duplicate-prompt scan across the whole bank. Every pre-existing item
gained an explicit `indicator` (subdimension code) backfilled from the index already encoded in its
id; no pre-existing item was otherwise altered.

### A composite is now reachable, and says how complete it is

- `subdimensions` and `subdimension_item_counts` are emitted: a mean per subdimension, `null` where
  nothing was rated, never imputed.
- `coverage.level` is one of **`complete`** (D-40 floor met AND all 40 subdimensions rated),
  **`dimension-only`** (floor met, some subdimensions unrated — valid at the dimension level, must
  not be called subdimension-complete), or **`insufficient`** (no composite).
- `complete` is **recomputed by the validator** from the item counts and fails the artifact if any
  subdimension has zero. A run cannot simply assert it.

### The `subdimensions` ban was replaced, not deleted

The schema previously banned a key named `subdimensions` anywhere in the tree, because 0 of 33 items
carried a subdimension code and any such key would have been fabricated. That fact changed. The ban
is now a stronger check: a mean must be `null` or in [1,5], and **a non-null mean must be backed by
a non-zero item count**. An unbacked number fails by name — more than absence ever proved.

### Fixed: a quadratic in the run path

`listRunTrials` re-read and re-parsed every trial file on every `next_item`, `record_item_rating`
and `run_status` call, so an n-trial run performed O(n²) file reads. Measured on the real bank after
it grew: a complete 249-trial run spent **33s** inside that function, rising quadratically (50
trials 1.4s → 200 trials 21.3s). Now cached by file path and invalidated by the file's own mtime and
size, so disk stays the single source of truth and `finish_scored_run`'s refusal to trust in-memory
state is unaffected. Same run: **4.4s**, near-linear.

### Tests

Several tests asserted the *old limitation* as a fact — "SYS and INT stay below the 3-item floor",
"the scorecard never has a `subdimensions` key", "`available` can never be true", and four hardcoded
item counts. Each was rewritten to assert the new guarantee and to **derive** counts from the bank
rather than restate them, which is the DC-01 stale-count defect in test clothing.

## 0.1.0 — 2026-09-24

First day this package was treated as a product, not a prototype. Everything below shipped the same
day, in the order it is listed: five independent reviews (plus a sixth, methodology-focused review
that informed the biggest single change of the day), the fixes those reviews forced, and then the
production-readiness pass (Iteration 33) that this file itself was added as part of.

### Reviews conducted (read-only; each wrote one file under `docs/reviews/`, changed no code)

| Review | Reviewer role | File |
|---|---|---|
| Architecture | system-architect | `docs/reviews/CB_PROBE_ARCHITECTURE_2026-09-24.md` |
| Code | (code review) | `docs/reviews/CB_PROBE_CODE_2026-09-24.md` |
| QA / test quality | qa-engineer | `docs/reviews/CB_PROBE_QA_2026-09-24.md` |
| Security | (security review) | `docs/reviews/CB_PROBE_SECURITY_2026-09-24.md` |
| Silent-failure hunt | (defect hunt, QA-adjacent) | `docs/reviews/CB_PROBE_SILENT_FAILURES_2026-09-24.md` |
| Methodology (measurement, not software) | benchmark-research | `docs/reviews/CB_PROBE_METHODOLOGY_2026-09-24.md` |

### Fixes the first five reviews forced (already shipped earlier the same day, ahead of this entry)

- **Sensitivity floor is additive, never substitutive** (`lib/sensitivity.mjs`): the five hardcoded
  crisis-adjacent item ids can never be removed from the sensitive set by a bank-level
  `sensitivity` field, only added to — closes a single-keystroke path to silently defeating the
  crisis-item safety net (Silent-failure hunt finding #2).
- **`start_scored_run` gates sensitive items by default** (`lib/scored-run.mjs`), matching
  `list_probe_items` — previously a default (all-8-dimension) scored run served active suicidal
  ideation, domestic violence, and psychosis-adjacent prompts with no opt-in and no notice
  (Security SEC-03).
- **Exposure-probe sample is seeded from `run_id`, not always the alphabetically-first ids**
  (`lib/exposure-probe.mjs` `pickProbeItemIds`) — closes a publicly-predictable, permanently-fixed
  probe sample (Security SEC-05).
- **Blank/whitespace/punctuation-only/single-stopword `recalled_text` is refused, not scored as a
  clean contamination result** (`lib/exposure-probe.mjs` `assertSubstantiveRecall`) — these
  previously scored identically to an honest "I don't remember" (Silent-failure hunt finding #1).
- **`anchor_matched` must exactly equal the published anchor label, not merely contain it**
  (`lib/scored-run.mjs` `matchesPublishedAnchor`) — a substring check let self-contradictory text
  through (Silent-failure hunt finding #3).
- **`evidence_quote` must be a substantive, multi-token excerpt**, not a single word
  (`lib/scored-run.mjs` `MIN_EVIDENCE_QUOTE_TOKENS`) (Silent-failure hunt finding #7).
- **`finish_scored_run` re-validates the entire run against the real task bank and the real
  exposure-probe constants at finish time**, rather than trusting user-editable files on disk —
  closes a forged-run path to a schema-valid 100/Exemplary composite from a hand-written
  `run.json` with `trials_per_item: 1` (Security SEC-02; regression-tested in
  `tests/scored-run.test.mjs`'s forged-run test).
- **`lib/outbound-guard.mjs` added**: a single choke point every tool result passes through before
  serialisation, so `official: true`, a `rank`/`ranking`/`leaderboard` key, a non-`"none"`
  `comparability`, or a `composite`/`band` pair that doesn't pass `validateSelfRunScorecard` is
  refused at the response boundary — not only inside the two artifact builders — so a future
  twelfth tool cannot bypass these rules by not calling them (Architecture review §6.3).
- **`explain_what_this_is_not` / `FULL_STATEMENT` corrected**: previously stated unconditionally
  that cb-probe "never computes a composite... a structural property, not a policy" — true of
  `JudgeEstimate`, false of `SelfRunScorecard` once the scored run shipped (Methodology review Q1
  finding 3; `tests/separation-statement.test.mjs`).
- **`run_status` added**: a read-only re-orientation tool (planned/recorded/remaining trials, probe
  phase, `ready_to_finish`) so a host model driving a long run does not have to reconstruct
  progress by paging through `next_item`.
- **Batch `record_item_rating`**: pass `ratings: [...]` to record several trials in one call, with
  the same validation per element and no partial writes on a batch failure.

### This iteration (33) — production-readiness pass

**1. The composite decision, implemented (`DECISIONS.md` D-40, founder-directed).** The composite
and band are now gated on TWO conditions, not one: all 8 dimensions measured, AND every one of them
resting on at least 3 rated items (the design doc's own "three gives a mean" standard). Below that
floor, `composite: null`, `band: null`, and `composite_withheld_reason` names exactly which
dimension(s) fall short, their item counts, and what would unlock the number.
`dimension_item_counts` reports the same counts structurally. **On the task bank published today,
the floor is not reachable at all** (`SYS` and `INT` carry 2 non-sensitive scorable items each,
with no sensitive item in either to add back) — `composite: null` is the correct, permanent result
of every real run until the bank grows (`IMPROVEMENT_BACKLOG.md` MCP-S6).
(`lib/self-run-scorecard.mjs`, `lib/validate-scorecard.mjs`)

**2. Uncertainty intervals added.** `uncertainty.dimensions[code]` — a bootstrap interval for every
measured dimension mean, always, floor met or not, via a new small function
(`bootstrapDimensionMean`) that resamples trials the same way `bootstrapCompositeUncertainty` does
but stops at the dimension mean rather than composing the full nonlinear 8-dimension formula.
`uncertainty.composite_interval` — present only when the composite is — computed by importing
`bootstrapCompositeUncertainty` from `site/scripts/lib/evaluation-statistics.mjs` unmodified (the
function written specifically for this nonlinear, clamped formula; previously imported three other
functions from that file but not this one). Both seeded deterministically from the run's own
`run_id` so a repeat `finish_scored_run` call reproduces the same interval.

**3. Portable install.** README rewritten around a `<REPO_PATH>` placeholder end to end: git-clone
step, `claude mcp add` for both project and user scope, a verify step (`claude mcp get cb-probe`),
and a remove step. Confirmed (not merely asserted) that the server resolves the task bank relative
to its own module (`lib/paths.mjs`, `import.meta.url`-derived, no `process.cwd()` anywhere in the
chain) by spawning `bin/server.mjs` with `cwd` set to a directory with no relationship to this repo
and confirming `list_probe_items` still returns the real bank.

**4. Versioning and provenance.** `package.json` version set to `0.1.0` (pre-1.0: an honest signal
for a tool whose composite is gated and whose item bank is thin). This file added. Both the bank
version (`bankVersion` from `tasks-v1.json`'s own `meta`) and this package's `version` are recorded
in every `SelfRunScorecard`'s `provenance` (`bank_version`) — the tool's own version was not
previously recorded in the artifact; now cross-referenced via this changelog and `package.json`.

**5. Licensing.** `tools/cb-probe/LICENSING.md` added: terms are pending a founder decision before
public distribution. No licence invented or assumed.

**6. Plugin bundling.** `plugins/compassion-benchmark/` added, bundling the
`run-compassion-benchmark` skill, the `compassionate-practice` skill, the `compassion-steward`
agent, and pointers to the MCP server with its install line. Supersedes the earlier
`plugins/compassion-practice/` (see that plugin's own note and this package's PR notes for which of
the two is canonical going forward).

**7. User guide.** `docs/CB_PROBE_USER_GUIDE.md` added: written for someone who has never seen this
repo — install/verify, the one-sentence invocation, every refusal and its reason, the crisis items
and how to opt in deliberately, where data lands and how to delete it, and the honest limits taken
from the methodology review's "What this tool may honestly claim."

### Test count

`npm test`: 144 tests (start of this iteration) → 150 tests (end of this iteration), all passing,
zero dependencies, zero network I/O (enforced by `tests/no-network-scan.test.mjs`).
