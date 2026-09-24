# Changelog — cb-probe

All notable changes to the `cb-probe` MCP server. Dates are the day the change shipped, not a
release-tag date (this package is pre-1.0 and has no separate release process from the monorepo it
lives in — `version` in `package.json` is the provenance signal; see "Versioning" in `README.md`).

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
