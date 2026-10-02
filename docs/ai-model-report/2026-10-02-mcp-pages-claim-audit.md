# QA claim audit: MCP server section, methodology analysis section, and related copy (2026-10-02)

Audited (source and built HTML, both read):
- `site/src/components/model-benchmark/McpServerSection.tsx` (M) and built `site/out/ai-evaluation-suite.html` `#mcp-server`
- `site/src/components/model-benchmark/AnalysisSection.tsx` (A) and built `site/out/ai-models/methodology.html` `#analysis`
- `git diff` of `site/src/app/ai-evaluation-suite/page.tsx`, `site/src/app/ai-models/methodology/page.tsx`, `site/src/app/ai-models/page.tsx`
- `git diff` of `tools/cb-probe/README.md` (R), `docs/CB_PROBE_USER_GUIDE.md` (G), `.claude/skills/run-compassion-benchmark/SKILL.md` (S; byte-identical to `tools/cb-probe/skills/...`)
- `separationStatement` in `site/src/data/model-benchmark/cb-probe-facts.generated.json` (F)

Sources re-derived (nothing taken from another doc's say-so): `tools/cb-probe/lib/*.mjs`, `bin/server.mjs`, `site/src/data/model-benchmark/tasks-v1.json`, `waves/pilot-2026-10-01.json` (W), `research/model-assessments/pilot-2026-10-01.md` (RR), `DECISIONS.md` D-29a, `git` history and remotes, `claude mcp add --help`.

What was executed (all against the working tree, artifact roots in the scratchpad):
1. `node site/scripts/export-cb-probe-facts.mjs --check` : "matches a fresh export" (F is current with the working-tree cb-probe).
2. `node site/scripts/test-mcp-pages.mjs` : 46 passed, 0 failed. `node --test` in `tools/cb-probe` : 206 pass, 0 fail (Node v24.20.0).
3. JSON-RPC smoke test of `bin/server.mjs` with `CB_ARTIFACT_ROOT='~/cbtest-qa-tilde'` : `serverInfo.version` 0.3.0, `tools/list` returns 12 tools, artifact root logged as `C:\Users\philk\cbtest-qa-tilde` (the server itself expanded `~`).
4. Direct calls to `startScoredRun`, `runExposureProbe`, `openJudgeSession`/`recordItemEstimate`/`summariseJudgeSession` (scratch scripts).
5. A node script over `tasks-v1.json` recomputing served items, per-dimension counts and subdimension coverage.
6. `git rev-list`, `git show origin/main:...`, `gh repo view`.

Severity: blocker = must change before publication; should-fix = overclaim or missing disclosure; nit = wording.
Classes: GEN = generated-from-data, TRUE = verified-true, FALSE, UNV = unverifiable, MIS = misleading.

---

## 1. Summary

Blockers: 6. Should-fix: 15. Nits: 10.

The data-derived figures are right (83 served, 249 ratings, 30 to 33 for one dimension, 10/11 per dimension, 40 of 40 subdimensions, 12 tools, 0.6 / 6 / 4 / 0.05, 2000 iterations, MIT, 0.3.0). The problems are in the prose around them: one contamination claim the code does not enforce, a contradiction the page prints against itself, one false sentence about the unscored output, a pilot-design misstatement already ruled a blocker in the 10-01 audit, a banned contamination word, and a release-order dependency.

No model name or figure appears in either new section (T8 test passes and I read both). No ranking language outside negation lists. No paid or sales link inside either section (checked in the built HTML: zero `contact-sales`, `License the Platform`, pricing or purchase hits between `id="mcp-server"` and the end of that section). Duty-of-care wording is present in `#mcp-server`, `#analysis` and the methodology "On crisis use" paragraph, and is not advisory about which model to use.

---

## 2. BLOCKERS

### B1. The identification probe is not mandatory in the code, but five places say it is

Claims affected:
- M l.367-368 (contamination block): "A run must complete two checks before it can finish."
- M l.229 (table): "Contamination check ... Required to finish."
- A row 8, local column: "Both probes are mandatory: recall overlap flagged at 0.6, and forced-choice identification ..."
- `/ai-models` (unchanged sibling panel, adjacent to the changed one): "Scoring is blocked until a contamination probe has run."
- R / G "Mandatory ... (two probes ...)"

Evidence (re-derived by running it): `scored-run.mjs:707-710` turns a missing `identification_answers` into `[]`. I started an AWR run, called `run_exposure_probe` with `{run_id}` then with only `recall_attempts`. Result: `phase: "completed"`, `contamination_indicated: false`, `identification: {questions_asked: 6, correct: 0, unanswered: 6, probability_if_unexposed: 1, flagged: false, verdict: "No contamination indicated by this test..."}`, and `run_status` reports the probe `completed`. `finish_scored_run` re-derives from the same empty answers (`scored-run.mjs` ~l.900-920), so it does not refuse. A run can finish with the identification half never attempted and a "No contamination indicated" verdict attached.

Aggravating: the skill that the page tells readers to trigger (M l.581, "run the compassion benchmark on yourself") never mentions `identification_answers` (`grep -c identification` on S = 0; S step 2 describes only `recall_attempts`). Following the skill as written produces exactly this bypass. Verdict on the claim: FALSE as enforced behaviour; TRUE only for "recall is required, identification questions are issued".

Fix (preferred, backend-engineer): make `run_exposure_probe` phase 2 refuse when an identification challenge was issued and `identification_answers` is missing or shorter than the question count, and add the field to S step 2. If that cannot land before publication, change the copy:

- M contamination block, first paragraph, replace with: "Every item is published with its answer key, so a model trained since may already know it. A run must complete the recall check before it can finish, and it is also issued forced-choice identification questions. The tool does not currently refuse a run whose identification answers are left blank: unanswered questions count as not correct and cannot raise a flag. Check that `contamination.identification.unanswered` is 0 in the scorecard."
- M table row: "Contamination check | Not required. | Recall check required to finish; identification questions issued with it."
- A row 8 local: "Recall overlap is required, flagged at 0.6. Forced-choice identification (6 items, 4 options each, flagged below 0.05) is issued with it; unanswered questions are scored as not correct and do not block the run."
- `/ai-models` "What it refuses to do": "Scoring is blocked until the recall check of the contamination probe has run."

### B2. The page contradicts itself: "NOT normally" vs "the floor is reachable"

M l.451-455 prints "On the current default served bank the floor is reachable: a complete default run can meet it in every dimension." Fifty lines of DOM later, the verbatim statement in `#mcp-not` (F, rendered by M l.528) says twice that a composite is possible "but NOT normally" ("(b) ... It CAN carry a composite (0-100) and a band, but NOT normally: only when ..." and "SelfRunScorecard DOES compute ... but NOT normally, and only when TWO conditions both hold"). Source lines: `lib/separation-statement.mjs:55` and the second occurrence in the same file; `lib/tool-definitions.mjs:158` (`start_scored_run` description, served to every host). The 2026-10-02 CHANGELOG entry says served text "no longer claims the composite floor is unreachable", and `tests/floor-claim-not-stale.test.mjs` passes, because the test only looks for "unreachable"-style phrasing. A complete default run (83 items, 10 or 11 per dimension, floor 3) does meet both conditions, so "NOT normally" is MIS to FALSE for the default run. Because M renders the statement verbatim, a reader sees both sentences on one screen.

Fix: in `separation-statement.mjs` replace "but NOT normally: only when the run covers" with "but only when the run covers", and "-- but NOT normally, and only when TWO conditions both hold" with "-- but only when TWO conditions both hold". Same edit at `tool-definitions.mjs:158` ("-- but NOT normally, and only when TWO conditions both hold" becomes "-- but only when TWO conditions both hold"). Re-run `export-cb-probe-facts.mjs` and extend `floor-claim-not-stale.test.mjs` to reject "NOT normally". Also README line "which is **not** the normal case" was removed in the diff (good); the guide heading was changed (good).

### B3. "The result contains no number at all." (unscored path)

M l.356-358: "record a 1 to 5 rating with a rationale per item using record_item_estimate, then call summarise_judge_session. The result contains no number at all."

Evidence: I ran the three tools. The returned JudgeEstimate carries `item_estimates[].rating_1_5` (a 1 to 5 number per item), `item_count`, `dimension_counts: {AWR: {n: 1}}`, and `comparability: "none"`. FALSE. What is true: no composite, no band, no dimension mean.

Replacement: "The result holds your per-item 1 to 5 ratings and a count per dimension. It has no dimension mean, composite or band."

### B4. Release order: the pages describe code that is not in `main`

`origin/main` equals `HEAD` (`git rev-list --left-right --count origin/main...HEAD` = 0 0). The install step (M l.276) clones the default branch. At `HEAD`:
- `tools/cb-probe/lib/tool-definitions.mjs` does not declare `identification_answers` (`git show HEAD:... | grep -c identification_answers` = 0) and `validate-args.mjs` enforces `additionalProperties: false`. So walkthrough step 3 (M l.330-331: "call it again with recall_attempts and identification_answers") is refused on a fresh clone of today's `main`. CHANGELOG records this as "Unreleased".
- The separation statement, `start_scored_run` description and scorecard header at `HEAD` still say the floor is not reachable, so a fresh-clone user receives text that contradicts the page.
- `export-cb-probe-facts.mjs`, `cb-probe-facts.generated.json`, `McpServerSection.tsx`, `AnalysisSection.tsx`, `dutyOfCare.ts` are untracked.
The README and guide links use `blob/main/...` and `<repo>/tools/cb-probe/...`, all of which point at the old text until merged.

Fix (coordinator/devops): the cb-probe changes (schema, served text, version read, B1/B2 fixes) must be merged to `main` before or in the same deploy as the site pages. Do not deploy the site pages alone. Verify afterwards with a clean `git clone` of `main` and the smoke test above.

### B5. "3 trials, each in a fresh context" misstates the pilot design

A row 2, pilot column (A l.45): "${trials} trials, each in a fresh context. The 83 items were delivered in parts of up to 28, so up to 28 items shared a conversation."

The first sentence is the same misstatement the 2026-10-01 audit ruled a blocker (line 54 row). Per RR s4, 83-message briefs were answered in 3 fresh-context parts (28/28/27), and two Fable parts were re-delivered as 14-message halves. A trial is not one fresh context; each part is. The next sentence half-corrects it, which leaves the cell self-contradicting. The final published report already uses the corrected wording (`reports/pilot-2026-10-01.md` l.62).

Replacement (keep the token reads from the wave file): "Subjects saw prompts only: no ids, dimensions, constructs or anchors, and a planted-anchor leak check gated every brief. ${trials_per_subject} trials. Within each trial the items were sent in parts of up to ${items_per_conversation_max}, and each part was answered in its own fresh conversation, so up to ${items_per_conversation_max} items shared a conversation."

### B6. "A pass clears the sample only." breaks the contamination wording rule

A row 8, pilot column (A l.118). The section's own rule (M l.363 comment) and template D ban "clean/cleared" for contamination, and M l.383-384 says the only accurate wording is "no contamination indicated on the sampled items". "A pass" also invents a pass/fail framing. The T6 regex (`test-mcp-pages.mjs`) matches only `\bclean\b` and `\bcleared\b`, so "clears" slipped through. (Source of the habit: `identification-probe.mjs` verdict text "This clears the sampled items only", and RR s2; see N10.)

Replacement: "Both probes, on sampled items. Not flagged means only that no contamination was indicated on the sampled items." Extend T6 to `\bclear(s|ed)?\b` / `\bclean\b`.

---

## 3. SHOULD-FIX

| # | Where | Quoted text | Class | Evidence | Replacement |
|---|---|---|---|---|---|
| S1 | M l.581 | "Once installed, ask your assistant: 'run the compassion benchmark on yourself'." | MIS | The phrase is the trigger for the skill, which is not installed by `claude mcp add` (it lives in `.claude/skills/` of the clone, or the plugin). G itself says this prompt is "the ordinary situation" for self-judging, which M l.47 says inflates ratings. The skill also omits identification answers (B1). | "Once installed, ask your assistant to call explain_what_this_is_not, then to run a scored run on one dimension. If it rates its own answers, that is the self configuration; read the notice in the scorecard." |
| S2 | M l.47 | "Flagged prominently in the output, because self-judging inflates ratings." | MIS | Tool text (`scored-run.mjs`/`self-run-scorecard.mjs` D07 notice) says "inflation risk" and cites a 58.1 vs 60.6 score swing, which is instability, not proven inflation. Same word in A row 9 ("Self-judging inflation under the self configuration") and G ("Self-judging inflates results", unchanged). | "Flagged prominently in the output: self-judging carries an inflation risk." A row 9: "Self-judging inflation risk under the self configuration." |
| S3 | M l.223 | JudgeEstimate `comparability` cell: "Not applicable." | FALSE | The JudgeEstimate artifact I generated carries `comparability: "none"` (and `official: false`). | "none." |
| S4 | F (statement), also JudgeEstimate `exposure_warning` | "has been on the open web for months" | FALSE per git | `tasks-v1.json` first commit 2026-09-07; today is 2026-10-02 (25 days). It errs on the cautious side, but it is a dated factual claim. | `separation-statement.mjs:31` and the `exposure_warning` source: "has been published openly on the Compassion Benchmark site." (drop the duration). Regenerate F. |
| S5 | M l.296 area; A | Hero button "Run it from your own AI tool" in the same button row as "License the Platform" (page.tsx hero, built offset 9232 vs 9247) | MIS (policy) | The code comment says the section is "deliberately NOT placed beside the License the Platform buttons (founder decision D1 open)". The hero button row puts a link to the new section next to the paid CTA. Adjacent, not inside. | Founder call on D1. Lowest-risk change: make the hero link a text link in the paragraph below the buttons (the new callout sentence already does this) and remove the `<Button href="#mcp-server">`. |
| S6 | A l.28 intro | "Nine stages, each leaving a recorded artifact" / "Every stage produces a recorded artifact, so a claim can be traced back to the answers and ratings that support it." | UNV / MIS | A local run has no separation stage, and cb-probe records no reply-length or confound artifact; stage 9 is report prose. | "Nine stages, and where the pilot wave, a local cb-probe run and a future official run differ at each one." and "The pilot and a local run each keep a record of every rating, so a figure can be traced back to the answers and ratings behind it." |
| S7 | A l.170-172 | "Reply length ... is measured and disclosed beside any separated figure, never folded into it." | MIS | True of the pilot (W `length`); a local cb-probe run measures no reply length (grep `length`/`words` in `self-run-scorecard.mjs`: none). The sentence sits in a section that spans both. | "In the pilot, reply length was measured and disclosed beside any separated figure, never folded into it. A local cb-probe run does not measure it." |
| S8 | A row 6 "does" and local cells | "A 95% range that reflects the uncertainty that matters." / local: "It is narrower and is not equivalent to the pilot's interval." | MIS | The pilot interval covers item sampling only (W `method.interval`; the 10-01 audit lists what it excludes). The local bootstrap (`self-run-scorecard.mjs:209-232`) resamples each item's trial ratings with the item set held fixed, so it does not cover which items were drawn at all. "Narrower" is sourced only to RR s1 (scorecard bootstrap treats judges as independent trials), not measured for a local run. | does: "A 95% range, with the sources of uncertainty it covers stated." local: "A per-dimension bootstrap that resamples each item's recorded trial ratings and keeps the items fixed (2000 iterations, seeded from the run id). It does not cover which items were drawn, so it is not equivalent to the pilot's interval and should not be read as comparable." |
| S9 | A row 7 | does: "State separation only when the range of the paired difference excludes zero, corrected for the number of comparisons." | MIS | W `pairwise` (6 composite-level pairs) carry plain `interval95`/`separated`, no correction; only the 48 `dimension_pairwise` rows have `bonferroni_separated`. The pilot cell is accurate ("across dimension comparisons"), but the generic row reads as covering the composite-level separation. | does: "State separation only when the range of the paired difference excludes zero." pilot: "Paired differences on the same resampled items. The ${pairwise.length} model pairs at composite level use uncorrected 95% ranges; the ${dimension_pairwise.length} dimension-level comparisons add a Bonferroni correction. Models that could not be told apart are grouped, not ordered." |
| S10 | M l.287-288 | "Verify. The server should show as connected and list 12 tools." with `claude mcp get cb-probe` | UNV | `claude mcp get --help` says it health-checks and shows server details; nothing documents a tool listing. README makes the same claim ("list the twelve tool names"). Server side verified: 12 tools. | "Verify. `claude mcp get cb-probe` should show the server as connected. Your host's MCP panel (in Claude Code, `/mcp`) lists its tools; expect 12." Only keep the `/mcp` clause if someone confirms it. |
| S11 | M l.279-281 | Registration with default scope | MIS (omission) | `claude mcp add --help`: default scope is `local` (this project/directory only). README Option A says "Project scope (this project only)" and gives `-s user`; the page drops this. A reader who registers in one directory and opens another sees no server. | Add under step 2: "This registers the server for the current project only. Add `-s user` after `cb-probe` to make it available everywhere." |
| S12 | A row 2, official | "Blinded, hash-verified subject access to the snapshot, with the access tier stated." | UNV | "hash-verified" appears in no artifact except the spec. F says "a frozen, registry-recorded snapshot". | "A frozen, registry-recorded snapshot, blinded subject access, and the access tier stated." |
| S13 | `/ai-models` page.tsx ~l.811 (changed panel) | "All 8 dimensions and all 40 subdimensions, from 93 published items." | MIS | 93 includes 5 unreviewed drafts that are never scored and 5 crisis items excluded by default; a default run uses 83 (recomputed). The 40 of 40 coverage is true on those 83. | "...all 40 subdimensions, from the {83} items served by default, out of {93} published." Use `CB_PROBE_FACTS.itemsServedDefault` / `itemsTotal`. |
| S14 | `finish_scored_run` tool description (`tool-definitions.mjs:436-437`) | "why the 40 published subdimensions are not scored (the item bank does not carry subdimension tags today)" | FALSE | Bank v2.0: all 93 items carry `indicator`, 40 of 40 covered (recomputed), scorecard emits `subdimensions`, `coverage`. This text is served to hosts via `tools/list`. It contradicts M l.203-205 and the README diff. | "subdimensions_status reports, computed fresh from the bank, whether all 40 published subdimensions are represented by at least one eligible item." |
| S15 | `plugins/compassion-benchmark/skills/run-compassion-benchmark/SKILL.md` | "23 non-sensitive scorable items x 3 trials = 69 ratings", "will NOT produce a composite ... today", "not reachable at all today" | FALSE | This third copy of the skill was not touched. `diff` against `.claude/skills/...` differs; `tests/skill-copies.test.mjs` covers only two copies. Users of the plugin are told the opposite of the pages. | Sync it from `.claude/skills/run-compassion-benchmark/SKILL.md` and add it to `skill-copies.test.mjs`. |

---

## 4. NITS

| # | Where | Text | Fix |
|---|---|---|---|
| N1 | M l.334 | "Call next_item (prompt only, no anchors)" | `next_item` also returns item id, dimension and construct (verified in output; A row 2 says so). "(item id, dimension, construct and prompt; no anchors)". |
| N2 | M l.322 | "an explicit judgeConfiguration" | It defaults to `cross`; "explicit" reads as required. "a judgeConfiguration (defaults to cross)". |
| N3 | M l.296-297 | "Use an absolute path: some hosts do not expand ~ inside arguments." | Accurate for the `node` argument, but the server itself expands `~` in `CB_ARTIFACT_ROOT` (`session-store.mjs:45-52`, tested), so the `-e CB_ARTIFACT_ROOT=~/...` form works from any shell. Add: "The `~` in `CB_ARTIFACT_ROOT` is expanded by the server." |
| N4 | A row 5, row 6 pilot cells | Raw wave strings render as fragments: "computeCompositeFromDimensions (unmodified), dimension = mean of item means"; "item resampling stratified by dimension, paired across subjects, 1000 replicates, seed 20261001." | Capitalise, drop the internal function name: "Dimension means are item means averaged; the composite uses the unmodified canonical function." |
| N5 | A l.162-164 | Link text "here" | "the pilot report". |
| N6 | M l.508 | "A default run says nothing about how any model responds to a person in crisis." | Fine for the five flagged items; "says nothing" is absolute. "A default run does not test crisis responses." |
| N7 | Methodology FAQ heading (unchanged) | "Why publish the method before any results?" | The answer was changed to "any official score" in this diff but the question was not. "Why publish the method before any official results?" Also the page eyebrow "Method & pre-registration" now sits beside a section that documents a post-hoc protocol change. |
| N8 | `/ai-models` page.tsx | "It is not published as a package yet" | "yet" promises a plan nobody has recorded. "It is not published as a package." |
| N9 | R table, `start_scored_run` row | "excluded, (see "Composite coverage" ...)" | Stray comma: "excluded; see "Composite coverage" for what the floor needs." |
| N10 | G "6b" | "a run that is not fully rated falls short of condition 2" | `finish_scored_run` refuses until every planned trial is recorded, so a partly rated run cannot finish. Delete the clause. Also: tool verdict text "This clears the sampled items only" (`identification-probe.mjs`) uses the banned stem; reword at source. |

---

## 5. Sentence-level classification

### 5.1 `#mcp-server` (McpServerSection.tsx; built text checked)

| Line | Claim | Class | Source checked |
|---|---|---|---|
| 85 | "Local, unofficial, no API key" | TRUE | `bin/server.mjs` header; no network imports (grep of `lib`, `bin`, `lib/vendor`: only comments mention network) |
| 112-114 | "different tool from the browser scorer" | TRUE | spec D-30/D-40; separate code paths |
| 115 | "Nothing it produces is a ... score, result or index entry." | TRUE | `outbound-guard.mjs` + `official:false` in both artifacts (run) |
| 117 | "not published as a package" | GEN | F `distribution.npmPublished: false` |
| 128-130 | stdio MCP; "makes no network request and needs no key" | TRUE | `server.mjs` l.10-11; grep; smoke test |
| 134-138 | version 0.3.0, bank v2.0, 93, 83, MIT | GEN | F; `package.json`; recomputed 93/83 |
| 189 | JudgeEstimate "Yes, with a rationale." | TRUE | run output |
| 191 | "matched anchor and a verbatim quote; at least 3 trials" | TRUE | `validateRatingShape`, `MIN_TRIALS` |
| 195-197 | dimension means with interval: No / Always (for rated dims) | TRUE | run output (JudgeEstimate has `dimension_counts` only); `bootstrapDimensionMean` |
| 204 | "40 of 40 ... in a default run" | GEN + TRUE | F; recomputed over the 83 served items: 40 distinct indicators |
| 210 | "Never. The schema has no field that can hold one." | TRUE | `validate-estimate.mjs:47-48` bans `composite`, `band` |
| 212-213 | composite only past floor, otherwise null with reason | TRUE | `self-run-scorecard.mjs` |
| 217-218 | official false, structurally (both) | TRUE | run output; `outbound-guard.mjs` |
| 223 | JudgeEstimate comparability "Not applicable" | FALSE | S3 |
| 229 | contamination "Required to finish" | MIS | B1 |
| 238-260 | tool table, 12 tools, summaries | GEN | F; smoke test lists the same 12 names and order |
| 270 | Node 20+, "no other dependency", checkout required | TRUE (static) | `package.json` engines; `"dependencies": {}`; no Node-22-only APIs in `lib`/`bin` (grep). Not executed on Node 20 (only v24 available). |
| 276 | clone URL `https://github.com/Klingdom/applied-compassion-benchmark.git` | TRUE | matches `git remote -v`, `compassion-benchmark.json` `repository`, F; `gh repo view`: PUBLIC, default branch `main` |
| 280 | `claude mcp add cb-probe -e CB_ARTIFACT_ROOT=~/compassion-probe-sessions -- node "<REPO_PATH>/tools/cb-probe/bin/server.mjs"` | TRUE (syntax) | Same shape as `claude mcp add --help` example (`-e KEY=xxx -- cmd`); identical to well-known `claudeCodeInstall`. `~`: bash may expand it, PowerShell and zsh will not; either way the server expands `~/` and `~\` itself (tested). Scope omission: S11. Works only after B4. |
| 284 | `node <REPO_PATH>/tools/cb-probe/bin/server.mjs` | TRUE | smoke test |
| 287 | "list 12 tools" via `claude mcp get` | UNV | S10 |
| 292 | `claude mcp remove cb-probe` | TRUE | standard CLI |
| 311 | "249 ratings (83 items x 3 trials)" | GEN + TRUE | ran `startScoredRun`: item_count 83, total_planned_trials 249 |
| 312 | "single-dimension first run is 30 to 33 ratings" | GEN + TRUE | ran AWR: 33; recomputed 10 or 11 per dimension |
| 312-313 | "recommended place to start" | TRUE | S and G both recommend a single-dimension first run |
| 313 | "fewer than all dimensions can never carry a composite" | TRUE | `buildCoverageNote`, validate-scorecard condition 1 |
| 321-324 | `start_scored_run` args, trials not below 3, `include_sensitive` default false, returns `run_id` | TRUE | `startScoredRun` l.120-215 |
| 327-331 | challenge returns item ids (never text) and forced-choice set; recall from memory; second call with both fields | TRUE, with caveat | Challenge output: ids plus 4 scenario titles per question (titles are item metadata, not prompt text). The schema accepts the new field only on the working tree (B4). |
| 334-338 | loop, anchors, batch, `status: "complete"`, `run_status` read-only | TRUE | `nextItem`, `runStatus` |
| 336-337 | `anchor_matched` "exactly the published anchor label" | TRUE (normalised) | README: case/whitespace-normalised equality |
| 341-342 | finish re-validates and writes `scorecard.json` | TRUE | `finishScoredRun` |
| 345-347 | read order: contamination, judge_configuration_notice, dimension means, composite or reason, provenance | TRUE | all five keys exist in the scorecard (`self-run-scorecard.mjs:560-581`); order is advice |
| 350-352 | do not publish / no submission endpoint | TRUE | well-known `submitting.accepted: false`; `outbound-guard.mjs` |
| 356-358 | unscored path tools | TRUE; final sentence FALSE | B3 |
| 366-368 | "Every item is published with its answer key"; "complete two checks" | TRUE; second MIS | B1 |
| 372-374 | recall overlap, normalised token overlap, offline, flagged at 0.6 | GEN + TRUE | `exposure-probe.mjs:20,189` (`>= 0.6`) |
| 377-379 | 6 items, 4 options, exact binomial tail, flagged below 0.05 | GEN + TRUE | `identification-probe.mjs:53-59,271-273` |
| 383-387 | contaminated if either fires; "only accurate wording"; screen not proof | TRUE | `scored-run.mjs:~720`; limitations arrays |
| 402-404 | judge configuration copy | cross TRUE; self MIS (S2); panel TRUE | `computeJudgePanel` reports disagreement per item |
| 407-408 | labels self-reported; no configuration blinded or adjudicated; local run not equivalent to pilot | TRUE | `provenance.*_self_reported`; R "Not blinded, not adjudicated"; pilot judges were blind to subject (RR s0). Passes the "must not imply reproduces or comparable" test. |
| 422-427 | composite only if 8 dims and 3 items each; absent dim treated as 1; "documented swing" | TRUE | `lib/vendor/scoring.mjs:77` (`?? 1`); R l.352 cites D-07 swing |
| 428-449 | per-dimension table | GEN + TRUE | recomputed {AWR 11, EMP 10, ACT 10, EQU 11, BND 11, ACC 10, SYS 10, INT 10} |
| 452-453 | "floor is reachable" | GEN + TRUE | F `floorReachable`; recomputed |
| 457-459 | 40 of 40 | GEN + TRUE | as above |
| 469-484 | refusal list | TRUE (9 of 9) | trials: `startScoredRun`; finish preconditions; anchor/quote: `validateRatingShape` (min 3 tokens); recall: `assertSubstantiveRecall`; batch atomicity: tool description; revalidate: `finishScoredRun`; guard: `outbound-guard.mjs`; write root: `assertSafeWriteRoot` (repo and any git tree). Caveat: the "finishing before the contamination check completes" line is true for recall only (B1). |
| 493-497 | data under `CB_ARTIFACT_ROOT`, default `~/compassion-probe-sessions`; no network; delete folder; provider sees what you send | TRUE | `session-store.mjs:17,45-52`; `startScoredRun` `data_handling_notice` |
| 506-508 | 5 crisis items excluded by default; marked with duty-of-care notice when served | GEN + TRUE | `HARDCODED_SENSITIVE_ITEM_IDS`; `nextItem` adds `sensitive`, `duty_of_care` |
| 514 | duty-of-care sentence | TRUE | `dutyOfCare.ts`; not advisory; T10 passes |
| 528 | verbatim statement | GEN | T `M12` test; F matches fresh export. Content defects: B2, S4. |
| 530 | "Not a measurement of how compassionate a model is." | TRUE | statement + README |
| 533-537 | link to unofficial pilot report; "different design" | TRUE | route exists (`out/ai-models/reports/pilot-2026-10-01.html`); no model names or figures in the section |
| 581 | "ask your assistant..." | MIS | S1 |

### 5.2 `#analysis` (AnalysisSection.tsx; built text checked)

| Row | Claim | Class | Source |
|---|---|---|---|
| intro | "official: false, comparability: none" | TRUE | W `official:false`, `comparability:"none"` |
| intro | "names no model and states no result" | TRUE for names; the stage 4 cell does disclose a post-hoc judge exclusion (a design event, figure deferred to the report). Acceptable. |
| intro | stages produce recorded artifacts | UNV | S6 |
| intro | reply length | MIS | S7 |
| 1 pilot | "Bank v2.0: 93 items, 83 served, 5 unreviewed drafts and 5 crisis items not served, 0 human-validated." | GEN + TRUE | W `bank.*` |
| 1 local | "Bank v2.0; 83 items served by default." | GEN | F |
| 1 official | "Human validation (two reviews) and an unpublished pool" | TRUE | `item-reviews-v1.json` invariant "TWO INDEPENDENT REVIEWERS"; separation statement |
| 2 pilot | prompts only, planted-anchor leak check | TRUE | RR s0 table |
| 2 pilot | "3 trials, each in a fresh context" | FALSE | B5 |
| 2 pilot | "parts of up to 28 ... up to 28 items shared a conversation" | GEN + TRUE | W `design.items_per_conversation_max` 28 |
| 2 local | "Not blinded: host sees item id, dimension, construct and prompt, and is also the runner." | TRUE | `nextItem` output |
| 2 official | "hash-verified" | UNV | S12 |
| 3 pilot | "2 judges per response, never the subject's own model; blind to subject, trial and grouping; one model family" | GEN + TRUE | W `judges_per_response` 2, `self_judging` false, `judge_family`; RR s0 |
| 3 local | "One judge per rating"; configs; labels self-reported | TRUE | `recordItemRating` `judge_label` override; F |
| 3 official | "outside the subject's family, and human raters" | TRUE | RR s6 |
| 4 pilot | haiku excluded post hoc, disclosed as protocol change | TRUE | W `excluded_judges`, `exclusion_record` |
| 4 local | "rejects a non-verbatim or one-word quote at write time" | TRUE | `validateRatingShape`, `MIN_EVIDENCE_QUOTE_TOKENS = 3` |
| 4 does | "A rating counts only if it cites a verbatim excerpt." | TRUE | RR s3 (non-verbatim ratings re-asked) |
| 4 official | "exclusion rule written down before ratings are collected" | UNV (prescriptive) | RR says the check pre-existed, not the rule; acceptable as a requirement, mark as proposal if challenged |
| 5 | composite function, dimension = mean of item means; local floor 3 | GEN | W `method.composite`; F |
| 6 | does / local | MIS | S8 |
| 6 pilot | "Chosen because the judges of one response are not independent trials" | TRUE | RR s1 l.31-34 |
| 7 | does / pilot | MIS | S9 |
| 7 official | "fixed publication bar that is not yet canonical" | TRUE | D-29a item 8 ("amended publication bar") still pending |
| 8 pilot | "A pass clears the sample only." | FALSE (wording rule) | B6 |
| 8 local | thresholds | GEN + TRUE; "mandatory" MIS | B1 |
| 9 pilot | confound classes | TRUE | RR s2 (length, same family, bank authored with the family's help, crisis items not served); class names only |
| 9 local | self-judging inflation | MIS | S2 |
| after table | duty of care | TRUE | T10 |
| panel | "A local MCP server lets you run the same item bank ... local, unofficial and not blinded, and the pilot was not produced this way." | TRUE | Text-link only, no button; passes "must not imply a local run reproduces the pilot". Same item bank is true (both v2.0), but the pilot served the same 83 items; fine. |

### 5.3 `ai-evaluation-suite/page.tsx` diff

| Text | Class | Note |
|---|---|---|
| hero: "Export structured results for your own records." (replaces "Track progress, compare models, and export...") | TRUE | Removes compare/track language; consistent with D-29. Browser-scorer claim "all 40 subdimensions" is unchanged pre-existing copy, not audited here. |
| CTA callout: same replacement | TRUE | Same. |
| callout: "Prefer to run it from your own AI tool ... separate tool with different output." | TRUE | |
| hero button "Run it from your own AI tool" | see S5 | adjacent to "License the Platform" |

### 5.4 `ai-models/methodology/page.tsx` diff

| Text | Class | Note |
|---|---|---|
| meta: "Published before any official model result exists." | TRUE | `evaluatedModelCount` 0; pilot is unofficial |
| FAQ answer "ahead of any official score" | TRUE | FAQ question heading still says "any results" (N7) |
| "On crisis use" now ends with `DUTY_OF_CARE` | TRUE | Wording identical to the removed sentences (diff). Not advisory. |

### 5.5 `ai-models/page.tsx` diff

| Text | Class | Note |
|---|---|---|
| "A run reports dimension means with an interval." | TRUE | |
| "A composite appears only when every dimension rests on at least 3 rated items" | TRUE (abbreviated) | Omits "and all 8 dimensions are covered"; acceptable. The "floor cannot reach" branch is not rendered (F `floorReachable: true`). |
| "never comparable to a published score" | TRUE | `comparability: "none"` |
| "The arithmetic is shared with the function that scores countries and companies here" | TRUE | `canonical.mjs` imports the site scoring module (vendored for packing) |
| "from 93 published items" | MIS | S13 |
| "To run it from your own AI tool, see the MCP server section. It is not published as a package yet" | TRUE; "yet" nit | N8 |
| Sibling (unchanged) "Scoring is blocked until a contamination probe has run." | MIS | B1 |
| Sibling (unchanged) "the same task bank ... this benchmark applies to institutions" | UNV, pre-existing | Institution indexes do not use the model task bank; outside this diff, flag to the owner. |

### 5.6 README, guide, skill diffs

| Doc | Claim | Class | Source |
|---|---|---|---|
| R | clone URL now `Klingdom/...` | TRUE | remote, well-known |
| R | "the default plan of the current bank can meet it" / `floorReachable` | TRUE | recomputed |
| R | bank v1 (33 items, two dims with 2 usable) vs v2.0, MCP-S6 completed 2026-09-24 | TRUE | `IMPROVEMENT_BACKLOG.md:885` |
| R | scorecard emits `subdimensions`, `subdimension_item_counts`, `coverage`, `subdimensions_status`; null where unrated | TRUE | `self-run-scorecard.mjs:569-577` |
| R | two probes; distractors share subdimension where possible | TRUE | `identification-probe.mjs:61-68,176-190` |
| R | `identification_answers` missing from schema "until the fix recorded in CHANGELOG.md" | TRUE | `git show HEAD:...tool-definitions.mjs` has none (B4) |
| R | `identification-key.json`, `identification-answers.json` | TRUE | `scored-run.mjs:~637,~714` |
| R | "(The published pilot report's blinding and judging design is different from this tool's; a local run does not reproduce it.)" | TRUE | |
| R | MIT, D-42 | TRUE | `DECISIONS.md:262`, `LICENSE` |
| R | `tests/floor-claim-not-stale.test.mjs` "fails if any of them claims the floor is unreachable" | TRUE but weak | does not catch "NOT normally" (B2) |
| R l.~330 | "the 5 items...every dimension's default served set has at least the floor" | GEN | recomputed |
| R Step 3 | `claude mcp get` lists twelve tool names | UNV | S10 |
| R | "Mandatory" probes | MIS | B1 |
| G | "83 served by default", "10 or 11 per dimension, 30 or 33 ratings" | TRUE | recomputed |
| G | "bank v2.0 tags every question with one (its `indicator`)" | TRUE | 0 items without `indicator` |
| G | "the review log ... records every human review and is empty" | TRUE | `item-reviews-v1.json` `recordCount: 0` |
| G | "a run that is not fully rated falls short of condition 2" | MIS | N10 |
| G | "Self-judging inflates results" (unchanged) | MIS | S2 |
| S | counts removed; points to `run_status` and tool output | TRUE | `startScoredRun` returns `item_count`, `total_planned_trials` |
| S | exposure probe step lacks `identification_answers` | gap | B1 |
| S (third copy in `plugins/`) | stale | FALSE | S15 |

### 5.7 F: `separationStatement`

Rendered verbatim (T `M12` passes) and equal to the live `explain_what_this_is_not` text. Line-by-line:
- "WHAT THIS TOOL IS" (a)/(b): TRUE except "NOT normally" (B2).
- "WHAT THIS TOOL IS NOT" bullets: TRUE (guard, validators, labels self-reported). The bullet that says the statement "does not say how many items a given bank serves" is fine.
- "Compassion Benchmark never sees the output": TRUE (no network).
- "WHAT AN OFFICIAL SCORE REQUIRES" (two blinded human raters, adjudication, >= 3 trials from a frozen snapshot, unpublished pool, human authorisation): consistent with RR s6 and D-29a item 8. TRUE as policy.
- "EXPOSURE ... on the open web for months": FALSE per git (S4).
- "DUTY OF CARE": TRUE, not advisory.
- "WHERE THE DATA GOES": TRUE.

---

## 6. Specific checks requested

| Check | Result |
|---|---|
| 1. cb-probe behaviour claims | All numerics match the code. Exceptions: identification not enforced (B1); "NOT normally" (B2); `finish_scored_run` subdimension text stale (S14); `next_item` "prompt only" (N1). Network: none. Write root: refuses repo and any git tree (`assertSafeWriteRoot`). Judge configs: self/cross/panel, default cross (`scored-run.mjs:60`). Bootstrap: 2000, seeded from run id, items fixed (S8). |
| 2. Pilot claims | Judges, trials, parts, interval method, exclusion, bank counts verified against W and RR; fresh-context sentence FALSE (B5). Nothing on either page implies a local run reproduces or compares to the pilot; M l.407-408, A panel and R say the opposite. |
| 3. Install | Command shape valid (matches `claude mcp add --help`). Node 20: declared and statically plausible, not executed on 20. `CB_ARTIFACT_ROOT=~/...`: works in every form, because the server expands `~/` and `~\` (the shell may or may not). Repo URL matches remote and well-known; repo is public. Would not work end to end on a fresh clone of `main` today (B4). Scope default undisclosed (S11). Tool-count verification unverifiable (S10). |
| 4. Independence / D-29 / D-29a | No ranking language outside negation lists; no model name or figure in either section (T8 passes; read both); no paid CTA inside either section; hero button adjacency flagged (S5). Duty-of-care present and not advisory. The `#mcp-not` block links to the pilot report without naming anything. |
| 5. "official" | Every use is negated or labels the pilot "unofficial"; no sentence implies a self-run is an official score. `official: false` and `comparability: none` verified in both artifacts. |

---

## 7. Recommended next action

1. backend-engineer: B1 (enforce or flag the identification step), B2 (served text), S4, S14, N10; extend `floor-claim-not-stale.test.mjs` and T6; add `plugins/.../SKILL.md` to `skill-copies.test.mjs` and add `identification_answers` to the skill (S15).
2. frontend-engineer: B3, B5, B6, S1-S3, S5-S13, nits; regenerate facts after backend changes (`node site/scripts/export-cb-probe-facts.mjs`), rebuild, re-run `test-mcp-pages.mjs`.
3. coordinator/devops: B4. Merge cb-probe and facts to `main` before or with the deploy, then smoke-test a clean clone of `main` (server starts, 12 tools, `identification_answers` accepted, statement free of "NOT normally").
4. Founder: S5 (D1) hero button placement.
5. Release status: NOT READY. Six blockers. Re-audit B1, B2, B5, B6 after fixes by re-running the live checks listed above.
