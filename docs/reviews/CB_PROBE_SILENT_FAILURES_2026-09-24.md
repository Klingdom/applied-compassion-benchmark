# cb-probe silent-failure hunt -- 2026-09-24

Scope: `tools/cb-probe` (11 tools, `bin/server.mjs`, every file in `lib/`, all 10 test files, 81
tests). Read-only: no code changed. `npm test` run once for a baseline (81 pass, 0 fail,
`node --test`, ~8s). This is a different review from `docs/reviews/CB_PROBE_QA_2026-09-24.md`
(same day, prior session): that review asked "is each test non-vacuous, and what's untested at the
server's edges (JSON-RPC framing, concurrency, restart)?" This review asks the narrower question in
the brief: where does this server fail silently, and what would that make a reader wrongly believe
about a published number or a safety guarantee? Findings below are new; where they touch the same
code (exposure threshold, concurrency) the angle is different and is noted.

Headline result on the one thing the brief calls "highest-stakes": the `?? 1` partial-coverage
guard is real and holds. `grep -rn "computeCompositeFromDimensions"` across the whole repo (not
just `tools/cb-probe`) shows exactly one call site inside `cb-probe`:
`lib/self-run-scorecard.mjs:255`, gated by `missingDimensionCodes.length === 0` (line 254) and
independently re-checked by `lib/validate-scorecard.mjs:225-230` (composite non-null requires zero
missing dimensions) and `:239-241` (composite null requires a non-empty
`composite_withheld_reason`). Two independent mechanisms agree, there is no second call site to
drift, and `tests/scored-run.test.mjs` exercises both the full-coverage and 1-of-8 partial-coverage
paths against the real handler. No live bug here. The silent failures below are all about the
things that are supposed to back up that number's trustworthiness -- the contamination check, the
per-rating audit trail, the crisis-content gate, and the artifact files themselves -- not the
arithmetic.

## Findings table

| # | Location | Severity | What fails silently | What the operator/reader would wrongly conclude | Minimal fix |
|---|---|---|---|---|---|
| 1 | `lib/exposure-probe.mjs:87-93` (`byId` default `?? ""`), `lib/scored-run.mjs:367-382` (Phase-2 validation only checks an `item_id` entry exists, never that `recalled_text` is non-empty/substantive), `lib/tool-definitions.mjs:277-286` (`recall_attempts[].required` is `["item_id"]` only -- `recalled_text` is optional in the schema itself) | Critical | A `recall_attempts` array of `{item_id, recalled_text: ""}` (or the key omitted entirely) is accepted as a completed probe. `tokenOverlap` maps empty/missing text to overlap `0` (confirmed live: `tokenOverlap(realPrompt, "") === 0`, same as punctuation-only `"...!!??--"`, a single stopword `"the"`, whitespace-only, and non-Latin-script text that shares no tokens -- all score exactly `0`, verified by direct execution against the real bank item `AWR-1-A`). `finish_scored_run` only checks `exposureProbe.status === "completed"` (`scored-run.mjs:407-416`); it never checks that the recall attempts contained real content. | The finished scorecard carries `contamination: { probed: true, mean_overlap: 0, high_exposure_item_ids: [] }` -- textually and structurally identical to a genuine "the model tried to recall and clearly didn't remember" result. A reader (including the header's own `exposure_warning` text, which says the risk is mitigated by this check) has no way to tell "we tested and it's clean" from "the client sent blanks and nothing was ever tested." This is the exact "search that returned zero results and was reported as clean" pattern named in the brief. | In `runExposureProbe`'s Phase 2 (`scored-run.mjs:367ff`), require every `recall_attempts[].recalled_text` to be a non-empty string after `.trim()`, `ToolError` otherwise (mirrors the existing `response_text`/`anchor_matched`/`evidence_quote` non-empty checks already used elsewhere in the same file). Also add `recalled_text` to the schema's own `required` array in `tool-definitions.mjs` -- currently decorative anyway (see #4). |
| 2 | `lib/sensitivity.mjs:36-42` (`isSensitiveItem`), confirmed as intended by `tests/sensitive-default.test.mjs:20-23` | Critical (safety, not arithmetic -- see ranking note below) | `isSensitiveItem` does `if (typeof item.sensitivity === "string") return item.sensitivity === "high"` before ever consulting `HARDCODED_SENSITIVE_ITEM_IDS`. The moment any string `sensitivity` value appears on a known crisis item (e.g. a future bank migration tags `ACT-1-A` -- active suicidal ideation -- as `sensitivity: "standard"` by a data-entry mistake, a copy-paste default, or a schema migration that back-fills `"standard"` everywhere), the five-item hardcoded safety net for that specific id is not consulted at all, not even as a fallback or a cross-check. The test file names this "prefers an explicit field over the fallback list" and asserts exactly this override on `ACT-1-A` (line 22: `isSensitiveItem({ id: "ACT-1-A", sensitivity: "standard" })` must be `false`) -- i.e. the suite locks the defeat in as correct behavior rather than catching it. | `list_probe_items()` (default call, no `include_sensitive`) would silently serve an active-suicidal-ideation or domestic-violence-with-children prompt to a host model as an ordinary item, with `sensitive_items_excluded` under-counting by exactly the number of items whose `sensitivity` field disagrees with the hardcoded list -- the tool's own count field would look internally consistent while being wrong. | Treat the hardcoded list as a floor, not a fallback: `isSensitiveItem` should be `HARDCODED_SENSITIVE_SET.has(item.id) || (typeof item.sensitivity === "string" && item.sensitivity === "high")` (OR, never override-and-replace), or at minimum throw/log loudly when `item.sensitivity` disagrees with a known hardcoded id so the disagreement is visible instead of silently resolved in the less-safe direction. |
| 3 | `lib/scored-run.mjs:60-80` (`matchesPublishedAnchor`) | High | The check is a case-insensitive substring test: `anchor_matched.toLowerCase().includes(bandWord)`. Every anchor label in the live bank is exactly one band word ("Critical", "Developing", "Functional", "Established", "Exemplary" -- confirmed by dumping `AWR-1-A`'s five anchors). So `anchor_matched: "this is definitely NOT Established, it reads as Critical to me"` for a rating of 4 still passes (`.includes("established")` is true), even though the string is self-contradictory and even names a different valid band word. The field exists specifically so a `rating_1_5` is "auditable rather than a vibe" (the tool's own description, `tool-definitions.mjs:225-229`) -- a substring match lets any text containing the right buzzword satisfy that, regardless of whether the reasoning actually supports the number. | A reader auditing a scorecard's per-item trials would see a populated, schema-valid `anchor_matched` field and reasonably conclude the rating was checked against the published rubric, when in fact any text containing the target word -- including negated or reasoning-free text -- would have been accepted. Doesn't change the composite's arithmetic (`rating_1_5` feeds the mean directly, `anchor_matched` doesn't), but it removes the one guard meant to keep `rating_1_5` itself honest. | Require `anchor_matched` to equal (case/whitespace-normalized) one of the item's anchor labels or band words, not merely contain one; optionally also reject the string if it contains a different band word than the one being matched (catches the "Critical... but I mean Established" case directly). |
| 4 | `lib/rpc-handler.mjs:78-99` vs. `lib/tool-definitions.mjs` (every `inputSchema`) | High, structural (root cause that enables #1 and widens future gaps) | `inputSchema` is only ever read in the `tools/list` branch (`rpc-handler.mjs:69-76`) to hand descriptive JSON Schema to the MCP host. The `tools/call` branch (`:78-99`) calls `def.handler(toolArgs, ctx)` directly -- there is no schema-validation step anywhere in the dispatch path. Every `required`, `minimum`/`maximum`, `enum`, and `additionalProperties: false` declared in `tool-definitions.mjs` is therefore advisory to a well-behaved client only; the server enforces exactly, and only, whatever hand-written `if` checks happen to exist in `tools.mjs`/`scored-run.mjs` for that field (confirmed: `rating_1_5` happens to be checked via `isValidRating`; `recall_attempts[].recalled_text` happens not to be -- see #1). | Anyone reading `tool-definitions.mjs` (including a future contributor deciding whether a field "is already validated" before adding a new check) would reasonably assume the declared schema is enforced, since it's presented as the tool's contract. It is not enforced by the transport; it is enforced nowhere unless a matching `ToolError` check was separately hand-written. | Either validate `toolArgs` against `def.inputSchema` in `rpc-handler.mjs` before calling the handler (one place, covers every tool and every future field automatically), or add a code comment at the top of `tool-definitions.mjs` stating plainly that `inputSchema` is descriptive-only and every constraint needs its own explicit check in the handler -- so the gap is at least a documented, deliberate choice rather than an implicit assumption. |
| 5 | `lib/session-store.mjs:118-123` (`readSessionFile`) / `lib/scored-run-store.mjs:32-40` (`listRunTrials`), used throughout `lib/tools.mjs` and `lib/scored-run.mjs` | Medium | Every read of `run.json`, `session.json`, `exposure-probe.json`, or a trial/estimate file is a bare `JSON.parse(readFileSync(...))` with no hash, checksum, or mtime check against anything recorded earlier in the same run. This matches the brief's specific question -- "does anything detect a session file edited between calls?" -- verified by reading every call site; no such check exists. `requireRun`/`requireSession` (`scored-run.mjs:41-47`, `tools.mjs:27-33`) happily accept whatever is currently on disk, in-memory cache or not. | If `run.json` (which carries `plan`, `trials_per_item`, and `item_ids` -- the entire denominator `finish_scored_run` checks completeness against) is edited on disk between `start_scored_run` and `finish_scored_run`, the finished scorecard reflects the edited plan with no indication that the run's own contract changed mid-flight. The scorecard's `provenance.opened_at`/`finished_at` would look normal; nothing flags that the plan wasn't the one the operator started with. | Compute and store a content hash of `run.json` at `start_scored_run` (alongside the existing per-item `item_hashes` in provenance, which are already precedent for this pattern) and re-verify it at `finish_scored_run`, refusing with a clear `ToolError` on mismatch. |
| 6 | `lib/scored-run-store.mjs:22-30` (`appendRunTrial`) / `lib/session-store.mjs:135-143` (`appendSessionEstimate`) | Medium | Trial/estimate files are named deterministically (`{itemId}__t{trialIndex}.json`, `{itemId}.json`) and written with a plain `writeFileSync`, no lock, no compare-and-swap, no existence check before overwrite. `recordItemRating`'s own `trialIndex` is computed as `existing.length + 1` by listing the directory first (`scored-run.mjs:292-299`) -- classic check-then-act. Two processes (or two concurrent tool calls from a host that parallelizes) pointed at the same `CB_ARTIFACT_ROOT`/`run_id` racing this sequence can both compute the same `trialIndex`, and the second `writeFileSync` silently overwrites the first trial's file with no error to either caller -- both get `{status: "recorded"}`. | `finish_scored_run`'s completeness check (`missingPlan.length > 0` refusal, `scored-run.mjs:418-430`) would still pass -- the count of distinct trial files matches the plan -- while one of the two ratings that were actually recorded by the operator is gone, replaced by the other's, with neither caller ever told a collision happened. | Use an exclusive-create write (`writeFileSync(path, data, { flag: "wx" })`) for trial/estimate files and surface the resulting `EEXIST` as a `ToolError` naming the collision, instead of the current flag-less overwrite. |
| 7 | `lib/scored-run.mjs:53-58` (`isNormalizedSubstring`) | Low | `evidence_quote` only has to be a case/whitespace-normalized substring of `response_text` with `n.length > 0` -- a quote of a single common word (e.g. "the", "a", "it") trivially satisfies "verbatim excerpt... supporting this rating" (the tool's own description) without supporting anything. | An auditor sees a populated, schema-valid `evidence_quote` and may assume it substantively grounds the rating; the check as implemented only proves the string appears somewhere in the response, not that it's meaningful evidence. | Add a minimum length (e.g. >= 4 normalized characters, or reject pure-stopword quotes) -- cheap, though this is a soft heuristic either way and lower priority than 1-6. |
| 8 | `lib/scored-run.mjs:60-63` (`matchesPublishedAnchor` early return) | Low today, latent | `if (!Array.isArray(item.anchors) || item.anchors.length === 0) return { ok: true }` -- if any future bank item lacks `anchors` (currently none do: verified live, all 33 items in `tasks-v1.json` carry a 5-level `anchors` array), the anchor-audit check silently no-ops for that item rather than refusing or flagging it as unauditable. | A rating on an anchor-less item would be accepted with no anchor check at all, indistinguishable in the output from a rating that was actually checked, unless a reader also cross-references the raw bank file. | Distinguish the two `{ok: true}` cases: return a distinct `{ok: true, checked: false}` for "item has no anchors to check against" vs. `{ok: true, checked: true}` for an actual pass, and surface `checked` somewhere in the trial record. |

## The three most dangerous, and which of the 81 tests would have caught each

1. Blank/absent `recalled_text` scoring as a clean exposure probe (finding #1). None of the 81
tests would have caught this. `tests/exposure-probe.test.mjs`'s 9 tests cover verbatim (near 1.0),
unrelated text (under 0.2), and an explicit empty-string `tokenOverlap` call -- but that last one is
testing and asserting the `0` result as correct low-level behavior, not testing that the tool layer
above it refuses a probe run entirely on blanks. `tests/scored-run.test.mjs`'s and
`tests/e2e-scored-run.test.mjs`'s shared `completeExposureProbe`/recall-attempt helpers always send
non-empty, honest "I do not have a verbatim memory..." text -- never blank, whitespace, or a missing
key. This is the most dangerous of the eight because it degrades the one control that's supposed to
certify the composite is trustworthy, and it degrades to something that reads identically to a
passing, honest result.

2. `isSensitiveItem`'s fallback-defeat (finding #2). None of the 81 tests would have caught this as
a bug -- the opposite: `tests/sensitive-default.test.mjs:20-23` is the test that most directly
touches this code path, and it asserts the defeat as the intended behavior (`isSensitiveItem`
"prefers an explicit `item.sensitivity` field over the fallback list"). This is the only finding in
the table where the suite doesn't just fail to catch the problem -- it encodes the problem as a
passing spec. It's ranked #2 rather than #1 only because it requires a future bank data change to
trigger (today's `tasks-v1.json` has no `sensitivity` field on any item, confirmed by
`lib/sensitivity.mjs`'s own header comment and independently by the live JSON), whereas #1 is
exploitable today with a single malformed tool call.

3. `matchesPublishedAnchor`'s substring match (finding #3). None of the 81 tests would have caught
this. Every anchor-related test in `tests/scored-run.test.mjs` and `tests/e2e-scored-run.test.mjs`
uses `anchor_matched` values that are exact band words matching the real rating ("Established" for
4, "Exemplary" for 5, "Functional" for 3, "Developing" for 2) -- never a negated, contradictory, or
multi-band-word string. Ranked #3 because unlike #1 and #2 it doesn't touch a number or a safety
gate directly -- it only removes the audit trail behind `rating_1_5`, which is itself still
validated for range and still feeds the composite honestly.

## Ranking note

The brief asks to order findings "by how badly the failure would mislead someone about a published
number." Strictly read, cb-probe never emits a published number: `official`, `is_index_entry`, and
`publishable_as_a_compassion_benchmark_score` are all structurally `false` in every artifact this
server can produce, checked twice (builder and validator) per artifact kind, and the one arithmetic
path that could fabricate a misleading number (`computeCompositeFromDimensions`'s documented `?? 1`
default) is correctly guarded -- see the headline result above. Given that, the ranking above treats
"misleading about a published number" as extending to the evidence a reader would use to decide how
much to trust cb-probe's unofficial composite and its safety framing -- the contamination check, the
audit trail, and (for finding #2 specifically) the duty-of-care gate the tool's own header text
promises. Finding #2 in particular sits outside the numeric axis entirely and is included at
severity Critical on its own terms (crisis-adjacent content exposure), not because it distorts a
score.

## Search commands run for V8 (absence claims shown, not asserted)

- `grep -rn "computeCompositeFromDimensions" .` (whole repo, not just cb-probe) -- 1 call site
  inside `tools/cb-probe`: `lib/self-run-scorecard.mjs:255`. No second, unguarded call site exists.
- `grep -n "inputSchema" tools/cb-probe -r` -- every match is either the schema definition itself or
  its single read site in `rpc-handler.mjs:73` (the `tools/list` response); no match in the
  `tools/call` branch.
- Direct execution of `tokenOverlap`/`scoreRecallAttempts` against the real bank item `AWR-1-A` with
  empty, punctuation-only, single-stopword, whitespace-only, and non-Latin-script recall text -- all
  five scored exactly `0`, confirmed live rather than by reading the code alone.
- `node -e` dump of `AWR-1-A`'s real `anchors` array -- confirmed all five labels are single band
  words ("1.0 Critical" ... "5.0 Exemplary"), and a repo-wide scan confirmed all 33 bank items carry
  a non-empty `anchors` array (0 items hit the `matchesPublishedAnchor` early-return today).
- `node --test` output grepped for every test name -- confirmed no test name or body references
  blank/whitespace/non-Latin recall text, a contradictory `anchor_matched`, or a sensitivity-field
  disagreement with the hardcoded list.
