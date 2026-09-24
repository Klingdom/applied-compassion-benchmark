# cb-probe QA review — 2026-09-24

Scope: `tools/cb-probe`, all 11 MCP tools, 81 tests across 10 test files. Method: read every
`lib/*.mjs` and every test file in full; ran `npm test` (`81 pass, 0 fail`, 7.6s); drove the
suite's own stdio harness reasoning by hand against `bin/server.mjs` / `lib/rpc-handler.mjs`
(no code changed, nothing written outside this one report file). Task bank verified directly:
`site/src/data/model-benchmark/tasks-v1.json` has 33 items, 28 scorable
(`validationStatus !== "draft-authored-unreviewed"`), across 8 dimensions
(AWR 5, EMP 5, ACT 5, EQU 3, BND 3, ACC 3, SYS 2, INT 2) — so a full run at the 3-trial floor is
28 × 3 = 84 planned trials, confirmed by reading `startScoredRun`'s plan-building loop
(`lib/scored-run.mjs:143-148`) and cross-checked against the e2e test's own `total_planned_trials`
assertion for the AWR-only subset (15 = 5×3).

## 1. File-by-file: non-vacuous? shipped path or a copy?

**`tests/validate-scorecard.test.mjs` (18 tests) — genuinely strong, verified by reasoning.**
Every negative-control test builds a `validFixture()` object *by hand in the test file* and
mutates one field, then calls the real `validateSelfRunScorecard`. This is fine here — unlike a
"copy" problem, the object under test is the *input*, and the function under test is the real,
imported validator, never re-implemented. I traced each assertion against the corresponding
`if` block in `lib/validate-scorecard.mjs` and confirmed each would in fact throw without that
block (e.g. `band must match getBand(composite)` line 140-145 maps exactly to the
`getBand(artifact.composite) !== artifact.band` check at line 215-221 in the source; delete that
check and the test fails). Strongest single test: **"a null composite requires a non-empty
composite_withheld_reason; a non-null composite requires all 8 dimensions measured"** — it
exercises *both* directions of the exact defect this project has already shipped once (Iteration
29's composite: 9.4 / band: Critical on a 1-dimension run), as a pure fixture mutation, no server
needed. Non-vacuous: confirmed by code-path reasoning, not taken on faith.

**`tests/scored-run.test.mjs` (17 tests) — mostly strong; one load-bearing test is weaker than its
own comment claims.** All handlers (`startScoredRun`, `nextItem`, `recordItemRating`,
`runExposureProbe`, `finishScoredRun`) are called directly, unmocked, with a real `loadBank()` and
a real temp-dir artifact root — this is the shipped path, not a copy. The refusal tests
(trials < 3, missing anchor, missing quote, quote-not-in-response, probe-not-completed,
probe-issued-but-not-scored, trials-incomplete) each construct the specific bad condition and
assert `ToolError` — I checked each against the corresponding guard clause in
`lib/scored-run.mjs` and they line up one-to-one; these are real negative controls, not just
happy-path repeats.

The exception: **"the scorecard's composite equals computeCompositeFromDimensions on the SAME
dimension means -- no drift"** (line 232). Its own file comment in `lib/self-run-scorecard.mjs`
(lines 6-11) claims: *"if that import is ever broken (replaced with a local reimplementation),
`tests/scored-run-canonical-agreement.test.mjs` fails by name."* **That file does not exist.**
I grepped the whole `tools/cb-probe` tree for `scored-run-canonical-agreement` and found zero
matches — the test this comment promises was apparently folded into `scored-run.test.mjs` at
some point and the comment was never updated. This is exactly the class of drift the review brief
warns about: a claim about test coverage that no longer points at anything. The test itself,
however, is *not* vacuous despite being self-referential-looking (`computeCompositeFromDimensions
(scorecard.dimensions)` calls the same imported function the scorecard used internally): if
`buildSelfRunScorecard` were changed to call a *local* reimplementation instead of the import,
this test's `independent` value (computed via the real import, inside the test) would still
reflect the canonical formula and would diverge from `scorecard.composite` the moment the
reimplementation gave a different number for real inputs. It also hardcodes an independently
reasoned expected value (`AWR..INT: 4` → `composite: 85`, `band: "Exemplary"`), which is a genuine
external check, not just an equality-with-itself. **Verdict: the test is fine; the doc comment
pointing at a nonexistent file name is a small but real piece of rot — fix the comment.**

**`tests/exposure-probe.test.mjs` (9 tests) — real positive/negative controls, but no boundary
test.** `tokenOverlap` is exercised with a true positive (verbatim text → 1.0) and a true negative
(unrelated text → <0.2), which is exactly the V8-style "prove the detector detects" pattern the
file's own header comment names. `scoreRecallAttempts` gets the same treatment end-to-end against
the real bank (`loadBank()`, real item `AWR-1-A`). Confirmed non-vacuous by reasoning: delete the
`tokenOverlap` Jaccard computation and replace it with `return 0` and the "positive control" test
fails immediately. **Gap** (see §4): nothing tests near `EXPOSURE_FLAG_THRESHOLD = 0.6` itself —
every case tested is either ~1.0, ~0.0, or "no memory" prose that's almost certainly well under
0.6 but was never measured at the boundary.

**`tests/rating-validation.test.mjs` (5 tests), `tests/sensitive-default.test.mjs` (5 tests),
`tests/projection.test.mjs` (6 tests) — all shipped-path, all confirmed non-vacuous.**
`isValidRating` is tested both as a pure function and through `recordItemEstimate` end-to-end
(good: catches a regression where the tool handler stops calling the validator, not just one
where the validator itself breaks). `projection.test.mjs`'s **"a fake private field added to a
fixture item never escapes projectItem"** and **"real bank items project cleanly"** are a genuine
allow-list proof: the whitelist is built from `bank.meta.fieldSeparationPolicy` (data), and the
test adds fields (`_fakePrivateField`, `criticalHarmRules`, `promptIntegrity`, etc.) that are not
on that whitelist and asserts they don't survive serialization — this is a real leak test, not a
tautology, because `buildModelFacingWhitelist` is derived from policy data rather than
hand-enumerated in the test.

**`tests/vocabulary-ban.test.mjs` (7 tests) — shipped path, with one static fixture that is doing
real work.** `tests/fixtures/non-compliant-estimate.json` is a hand-authored artifact carrying
`composite`, `band`, `rank` alongside otherwise-valid fields; it's fed into the real
`validateJudgeEstimate`. This is legitimate (it is testing the validator's reaction to *external*
input, which is exactly what the validator exists for), and it's cross-checked by a second test
("a real, freshly-built JudgeEstimate contains no composite and no band field") that builds the
artifact through the *actual* `buildJudgeEstimate()` and serializes it — so both directions
(bad input rejected; good input, built by the shipped function, accepted and clean) are covered.

**`tests/write-root-guard.test.mjs` (7 tests) — shipped path, strong.** Directly exercises
`assertSafeWriteRoot`, `resolveArtifactRoot`, `sessionDir` against real temp dirs, a real `.git`
directory it creates, and the real `REPO_ROOT` of this checkout. The path-traversal test
(`../../etc`, `../escape`, absolute path, empty string) is a genuine negative control against a
crafted `session_id` — I confirmed `sessionDir`'s `isInside()` check (line 93 of
`session-store.mjs`) is what actually rejects these, not the regex alone (the regex
`SESSION_ID_RE = /^[a-zA-Z0-9-]+$/` already rejects `../../etc` on its own via the `/` character,
so this particular test doesn't fully exercise the *second*, path-resolution layer of defense —
see gap below).

**`tests/no-network-scan.test.mjs` (2 tests) — non-vacuous but structurally shallow, and it says
so.** It's a lexical grep over `bin/` and `lib/` for `fetch(`, `child_process`, `node:http`, etc.,
comment-stripped. It is a real check (I confirmed it would fail if any of those tokens were
added to source) but it cannot catch dynamic access (`globalThis['fe' + 'tch']`) or a
dependency later added to `package.json` that itself makes network calls — it also asserts
`dependencies === {}` which is a good complementary check for the latter case specifically.
Fair as a smoke test; not a substitute for a real sandbox/permission boundary.

**`tests/e2e-jsonrpc.test.mjs` (3 tests) and `tests/e2e-scored-run.test.mjs` (3 tests) — the
strongest tests in the suite, real stdio, real child process.** Both spawn
`node bin/server.mjs` for real (`spawn(process.execPath, [SERVER_PATH], ...)`), write
newline-delimited JSON-RPC to its stdin, and parse newline-delimited JSON-RPC off its stdout.
This is the one place the *transport* itself (readline framing in `bin/server.mjs`, JSON-RPC
dispatch in `rpc-handler.mjs`) is exercised as shipped, not as a unit under test. I verified this
matters: `tests/scored-run.test.mjs` calls the handler functions directly with a hand-built `ctx`
object, which would not catch a bug in `bin/server.mjs`'s message loop or in `rpc-handler.mjs`'s
`tools/call` dispatch (e.g., forgetting to pass `ctx` through, or double-encoding the JSON
response) — only the two e2e files would catch that class of bug, and they do cover the two most
important flows (a full JudgeEstimate session, and a full partial + full-coverage scored run).

## 2. Shipped path vs. a copy

No test in this suite reimplements scoring, variance, or Jaccard-overlap logic and asserts against
its own reimplementation — the one place that pattern would be most tempting
(`computeCompositeFromDimensions`) is imported for real in both the production code
(`lib/self-run-scorecard.mjs:17`) and the test (`tests/scored-run.test.mjs:28`), from the same
file (`site/scripts/lib/scoring.mjs`), so there is exactly one implementation, not two drifting
ones. This is the one property the project's own history (the "gate that tested a private copy"
failure mode you flagged) makes worth checking hardest, and it holds up here.

## 3. Negative controls — inventory

Confirmed present (each traced to a specific guard clause in source, not just "the good case
works"):
- `trials < 3` refused (`scored-run.test.mjs` line 75-85, guard at `scored-run.mjs:107-113`)
- Rating outside 1-5 / non-integer / string / null (`rating-validation.test.mjs`,
  `isValidRating` at `validate-estimate.mjs:267-269`)
- Missing `anchor_matched`, missing `evidence_quote`, quote not actually in `response_text`
  (`scored-run.test.mjs` lines 118-179, guards at `scored-run.mjs:269-286`)
- `finish_scored_run` before probe run at all / probe issued-but-not-scored / trials incomplete
  (three distinct negative controls, `scored-run.test.mjs` 184-217 and
  `e2e-scored-run.test.mjs` 226-261 over real stdio)
- `official: true` rejected by both validators (`vocabulary-ban.test.mjs:142`,
  `scored-run.test.mjs:307`, `validate-scorecard.test.mjs:119`)
- Banned-key deny-list AND unlisted-key allow-list, both directions
  (`vocabulary-ban.test.mjs`, `validate-scorecard.test.mjs:96-117`)
- Non-boolean `include_sensitive` rejected (`sensitive-default.test.mjs:46-50`)
- Write root inside this repo, inside an unrelated git tree, and a path-escaping `session_id`,
  all three rejected (`write-root-guard.test.mjs`)
- `band` disagreeing with `getBand(composite)` rejected (`validate-scorecard.test.mjs:140`)
- Composite present with a missing dimension rejected, and composite absent with no reason
  rejected — **both directions** of the specific historical bug (`validate-scorecard.test.mjs:182-211`)

**Not present** (see §4 for the ones that matter most): no negative control on the exposure
threshold boundary itself (only far-from-boundary positive/negative), no negative control for
malformed JSON-RPC framing beyond "unknown tool name," no negative control for a second
`record_item_rating` call on an already-exhausted item under **concurrent** access (the
single-process "already has N recorded rating(s)" guard at `scored-run.mjs:293-297` is exercised
only implicitly, by `completeAllTrials` naturally stopping at `trials_per_item` — no test ever
calls `record_item_rating` one time too many on purpose and asserts the refusal message).

## 4. Gaps, in priority order, with a concrete test for each

**1. Malformed JSON-RPC input is essentially untested — highest priority.**
Search performed: grepped all of `tools/cb-probe/tests` for `-32600`, `-32601`, `-32602`,
`-32700`, `batch`, `restart`, `concurren`, `interleav` — zero matches for all of them. The only
malformed-input case exercised anywhere is "tools/call with an unknown tool name" in
`e2e-jsonrpc.test.mjs:191-207`, which hits the `-32602` "Unknown tool" branch inside
`tools/call`, not the top-level `default:` case in `rpc-handler.mjs:101-104` (unknown *method*,
which should be `-32601`), nor the "Invalid Request" branch at line 39-40 (malformed message
shape, `-32600`), nor `bin/server.mjs`'s own JSON.parse-failure branch (`-32700`, lines 57-69).
A batch request (a JSON array instead of an object) is not tested at all: reading
`rpc-handler.mjs:36-43`, an array would fail `typeof message.method !== "string"`, then fail
`"id" in message` (arrays don't carry an own `id` property), and `handleMessage` would return
`null` — silently dropping a batch request with no reply and no error, which is arguably
spec-incorrect behavior (JSON-RPC 2.0 batch requests should get a batch response) and is entirely
unverified either way. A notification-only message with an unknown method, a request with `id: 0`
or `id: null` (both legal JSON-RPC ids, easy off-by-one for an `"id" in message` check), and a
single oversized line (readline's default has no line-length cap set here — worth knowing whether
Node's readline has an implicit limit) are all unexercised.
*Test to add*: extend `e2e-jsonrpc.test.mjs` with cases for (a) a syntactically invalid JSON line
→ assert `error.code === -32700`; (b) `{"jsonrpc":"2.0","id":1,"method":"nonexistent/method"}`
→ assert `error.code === -32601`; (c) a JSON array `[{...},{...}]` sent as one line → assert *some*
defined behavior (currently: silent drop — decide if that's intended and assert it, or fix and
assert the fix); (d) a notification with an unknown method (no `id`) → assert literally nothing
comes back (currently true by omission, not by an asserted contract).

**2. Concurrency / per-run isolation is not tested at all — second priority, and the riskiest for
a distributed server.** Search performed: grepped for `started2`, `run_id_2`, `second run`,
`runB`, `Promise.all` in `tools/cb-probe/tests` — zero matches. Reading `bin/server.mjs:44-49`,
`ctx.sessions` and `ctx.runs` are two plain `Map`s created **once per process** and shared across
every JSON-RPC message the process ever receives — there is no per-connection or per-client
scoping. For a single stdio client that's fine (one MCP host = one process = one ctx), but nothing
in the suite proves that two runs opened in the same process (e.g., a host that opens
`start_scored_run` twice before finishing the first, which the tool contract does not forbid) stay
isolated — that `record_item_rating` for run A never satisfies run B's plan, that `next_item` for
B never returns an item recorded against A, and that A's `existing.length >= run.trials_per_item`
check in `scored-run.mjs:293` counts only A's own trials (it does, via
`listRunTrials(...).filter(t => t.item_id === itemId)` scoped by `runId`'s own directory — but
this is inferred from reading the code, not demonstrated by a test).
*Test to add*: in `scored-run.test.mjs`, open two runs (`started1`, `started2`) in the same `ctx`,
interleave `nextItem`/`recordItemRating` calls between them (A-item, B-item, A-item, B-item...),
then `finishScoredRun` both and assert each scorecard's `items` only contains that run's own item
ids/trials with the correct ratings — proving the Map-keyed-by-run_id isolation actually holds
under interleaving, not just under sequential single-run use (which is all 17 tests in that file
currently do).

**3. Crash/restart (resuming a session or run after the process dies) is untested, and probably
should be — third priority.** Search performed: grepped for `restart`, `kill`, `SIGKILL`,
`respawn` across `tools/cb-probe/tests` — zero matches (the only `.kill()` calls are each e2e
file's own `t.after(() => server.stop())` cleanup, which is teardown, not a resume scenario).
Reading `lib/scored-run.mjs:41-47` (`requireRun`) and `lib/tools.mjs:27-33` (`requireSession`),
both fall back from the in-memory `Map` to `readRunFile`/`readSessionFile` on disk when the
in-memory entry is absent — this is a deliberate resume path (the in-memory `Map` is a cache, disk
is the source of truth), but no test ever actually kills the server process and starts a *new*
one pointed at the same `CB_ARTIFACT_ROOT` to prove resume works end-to-end. This is exactly the
kind of thing that looks correct by code inspection and then breaks in a subtle way (e.g., if a
future change added anything to the in-memory-only `runMeta` that never made it into `run.json`,
resume would silently lose it, and nothing would fail).
*Test to add*: in `e2e-scored-run.test.mjs`, start a run and record a few (not all) trials against
one server process, `server.stop()` it, `startServer(root)` again against the **same** `root`,
then continue `next_item`/`record_item_rating`/`run_exposure_probe`/`finish_scored_run` against
the *new* process and assert the finished scorecard is complete and correct — this is the only way
to actually prove the disk-fallback path in `requireRun`/`requireSession` works, rather than just
existing as plausible-looking code.

**4. Exposure-probe threshold boundary untested — fourth priority, lower blast radius but cheap to
fix.** Search performed: grepped `exposure-probe.test.mjs` for `0.6`, `0.59`, `0.61`, `threshold`
— only one hit, the import of `EXPOSURE_FLAG_THRESHOLD` itself and its use in
`>= EXPOSURE_FLAG_THRESHOLD` / `< EXPOSURE_FLAG_THRESHOLD` assertions against far-from-boundary
values (verbatim ≈1.0, "no memory" prose presumably ≈0). Reading `scoreRecallAttempts` at
`exposure-probe.mjs:97` (`overlap >= EXPOSURE_FLAG_THRESHOLD`), the boundary is `>=`, i.e.
exactly 0.6 flags. Nothing constructs token sets that land exactly at 0.6, just under it, or just
over it.
*Test to add*: in `exposure-probe.test.mjs`, construct two strings with a hand-computed Jaccard
overlap of exactly 0.6 (e.g., 3 shared tokens out of a 5-token union — solvable directly from
`tokenOverlap`'s definition) and assert `exposure_flag === true`; construct a second pair at the
next representable ratio just below 0.6 and assert `exposure_flag === false`. This directly tests
the `>=` vs `>` decision, which is currently unverified in either direction.

**5. Trial variance is exercised but never checked against a hand-computed number — fifth
priority.** `scored-run.test.mjs`'s "per-item trial variance is reported and marked sufficient at
the 3-trial floor" (line 343) records ratings `[3, 4, 5]` per item and asserts only
`it.trial_stats.variance > 0` and `range === 2`. Reading `computeItemTrialVariance` →
`sampleVariance` in `site/scripts/lib/evaluation-statistics.mjs` (Bessel-corrected, `n-1`
denominator), for `[3, 4, 5]` the exact value is `(1+0+1)/(3-1) = 1`. The test never asserts
`1` — it would pass identically if the denominator were `n` instead of `n-1` (population variance
= `2/3 ≈ 0.667`), which is a real, easy-to-introduce regression (the file's own doc comment in
`evaluation-statistics.mjs` calls out this exact `n` vs `n-1` distinction as deliberate and
easy to get wrong) that this test cannot catch.
*Test to add*: `assert.equal(it.trial_stats.variance, 1)` for the `[3,4,5]` fixture (and/or add a
second fixture with a known non-integer variance, e.g. `[1,3,5]` → mean 3, variance `4`, to rule
out a mean-only coincidence).

**6. The full 84-trial / 8-dimension path is genuinely exercised, but never counted.** This is a
smaller gap than the above five, listed last on purpose: both `e2e-scored-run.test.mjs`'s "a full
8-dimension scored run over real stdio" and `scored-run.test.mjs`'s canonical-agreement test
really do drive all 28 items × 3 trials = 84 `record_item_rating` calls through the real
`next_item` → `record_item_rating` loop (I confirmed this by reading the bank's per-dimension
item counts and the loop termination condition, `status === "complete"`, which is only reached
once every planned trial exists) — so the claim "is the multi-trial, multi-item accumulation
actually exercised, or only a short path?" has a real answer: **exercised**, not short-circuited.
But unlike the AWR-only test (which asserts `guard === 15` and `total_planned_trials === 15`),
neither full-run test asserts the total trial count (84) or item count (28) anywhere — a bank
edit that silently dropped an item's `validationStatus` out of "scorable" would still pass both
tests with a different, unverified total.
*Test to add*: in the full-run e2e test, assert `started.item_count === 28` and
`started.total_planned_trials === 84` (or, to avoid a brittle hardcoded 28/84 if the bank is
expected to grow, assert `started.total_planned_trials === started.item_count * 3` and a
`>=` floor on `item_count` per dimension) — the first form is stronger and matches the
project's stated convention of importing/asserting real counts rather than restating stale ones
(see `CLAUDE.md`'s "never hard-code these counts" policy for the *site*, which the *test* side
should mirror by asserting against `getScorableItems(bank).length` rather than a literal).

**7. Minor: `write-root-guard.test.mjs`'s path-escape test doesn't isolate which of the two
defenses caught it.** `sessionDir refuses a session_id that attempts to escape the artifact root`
passes `../../etc`, `../escape`, `/absolute/path`, and `""` — every one of these is *already*
rejected by the regex `SESSION_ID_RE = /^[a-zA-Z0-9-]+$/` before the `isInside()` path-resolution
check ever runs (none contain only `[a-zA-Z0-9-]`). So this test proves the regex works; it does
not prove the second line of defense (`isInside(resolvedRoot, dir)` at `session-store.mjs:93`)
ever does anything, despite the file's own header comment describing it as "defense in depth."
*Test to add*: a `session_id` that passes the regex but could still resolve outside the root on a
case-insensitive or symlink-aware filesystem is hard to construct with this exact regex (alnum +
hyphen only, no `.` or `/`), which somewhat blunts this gap in practice — but at minimum, add a
comment or a targeted unit test calling `isInside` directly with a synthetic escaping path, so the
"defense in depth" claim has a test that actually depends on the second mechanism rather than
being satisfied entirely by the first.

## 5. Release readiness

**Go, with three tests required first**, not four or more — the suite's core guarantees
(vocabulary ban, official:false, composite-withholding on partial coverage, canonical-formula
reuse, field-separation projection, write-root safety) are real, non-vacuous, and traced by me to
the exact source lines they protect. The gaps above are about the *edges* of a server about to
meet arbitrary third-party MCP hosts, not about its core arithmetic or its separation-of-concerns
promises, which are its whole reason for existing and are well covered.

Required before shipping to third parties, in order:

1. **Malformed JSON-RPC coverage (§4.1)** — this server is about to be driven by MCP hosts this
   team does not control. An unknown top-level method, a bad batch, or a parse error producing
   undefined behavior (silent drop vs. a spec-correct error) is the single most likely thing an
   unfamiliar third-party client will hit first, and it is currently the least-tested surface in
   the whole package.
2. **Concurrency / per-run isolation (§4.2)** — nothing today proves two interleaved runs in one
   process can't cross-contaminate. Given this artifact ends in a composite+band that looks like a
   real number, a cross-contamination bug would be silent and high-consequence (a scorecard citing
   the wrong subject's ratings), not a crash.
3. **Crash/restart resume (§4.3)** — sessions and runs are explicitly designed to survive process
   restart (the disk-fallback in `requireRun`/`requireSession`), but that design has never been
   exercised end-to-end. Ship the code as designed without ever having run the scenario it was
   designed for, and the first person to discover whether it actually works will be a third-party
   user whose MCP host restarted mid-run.

The exposure-threshold boundary (§4.4) and the exact-variance assertion (§4.5) are real gaps and
should be fixed, but they're narrower-blast-radius than the three above (a boundary-value miss on
0.6 changes a flag on a screening heuristic that's already documented as crude; a variance-formula
regression would be caught quickly by anyone eyeballing an obviously-wrong number in a
low-stakes context). They belong in the same PR as the three required tests, not as a blocker on
their own.
