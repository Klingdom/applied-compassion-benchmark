# Blinded cross-model pilot harness

Tooling only. Nothing in this directory runs a model, writes a score, or does scoring arithmetic. It orders
data, enforces blinding, and hands ratings to the existing `tools/cb-probe` scorer
(`startScoredRun`, `recordItemRating`, `runExposureProbe`, `finishScoredRun`), so the composite comes from
`computeCompositeFromDimensions` and nowhere else.

## Why it exists

`research/model-assessments/claude-opus-5-2026-09-25.md` section 0 lists four conditions that made the
previous self-run invalid. This harness removes three of them:

| Condition in that report | What removes it |
|---|---|
| 2. Subject saw the rubric | Subjects get prompts-only briefs. A leak check (anchors, labels, constructs, item ids, dimension codes, rubric vocabulary) runs on the exact text, and again on the written files; any hit deletes the output and exits non-zero. |
| 3. Subject graded itself | Each response is judged by two of the other three models, never its own subject (property-tested over every routing). Judges see an anonymised response. |
| 4. Trials not independent | One brief per subject x trial, each answered in its own fresh-context call, in a per-trial shuffled order under per-brief opaque codes. |

Condition 1 (the subject wrote the test) is not addressed by tooling.

## Roles and what each may see

| Party | Receives | Must never receive |
|---|---|---|
| Subject (4 models, labels `claude-haiku`, `claude-sonnet`, `claude-opus`, `claude-fable`) | one file from `subject-briefs/` | `keys/`, `judge-batches/`, the repo, any tool or file access |
| Judge | one file from `judge-batches/` | `keys/`, `subject-briefs/`, subject identity |
| Operator (you) | everything, to unblind | -- |

The task bank is published in this repository, so a subagent that has file tools could read the rubric.
**Dispatch every subject and judge call with tools disabled and pass only the text of its one file.**
That is an operating rule, not something the harness can enforce.

## Layout

```
research/model-runs/<run-id>/
  subject-briefs/    SEND to subjects: <subject>-trial-<n>.md (or .json), answer-schema.json
  keys/              NEVER SEND: subject-brief-key.json, judge-key.json, ingested/answers.json, assembly-state.json
  subject-answers/   you save subject replies here
  judge-batches/     SEND to judges: <judge>__batch-<nn>.md (or .json)
  judge-answers/     you save judge replies here
  probe-answers/     you save probe replies here
  scorecards/        output: <subject>.scorecard.json, <subject>.assembly-audit.json, probe-briefs/
```

`keys/` is a sibling of the briefs, never inside them (`--key-out` inside `--out` is refused). It is still in
the repo checkout, which is why subjects and judges must not have file access.

## Serving rule (not invented here)

Served items are exactly what `tools/cb-probe` `startScoredRun` serves by default: `getScorableItems(bank)`
(drops `validationStatus: "draft-authored-unreviewed"`) minus `isSensitiveItem(item)` (five hardcoded
crisis-content ids, plus any `sensitivity: "high"`). On bank v2.0 that is 93 - 5 - 5 = 83 items.
`assemble-run` asserts the run the scorer opens has the same item set as the briefs, so drift between the
two fails loudly. Matched-pair items and items needing `conversationState` / `userContext` / `allowedTools`
are refused rather than served with an arm or field dropped (none is in the served set today).

## Delivery as parts (added 2026-10-01, used for `pilot-2026-10-01`)

A full brief asks for 83 replies in one message (~25k+ output tokens), which risks truncation and pressures
a model to compress. Each brief was therefore delivered as **3 parts (28 / 28 / 27 messages)**, each in its
own fresh-context call:

1. `bin/split-brief.mjs --brief <brief.json> --parts 3 --out <dir OUTSIDE the repo>` writes neutral part files
   (`b-<id>-p<k>.md`; no "benchmark" or "compassion" anywhere in the path or text). It refuses an in-repo `--out`.
2. Each part is answered by a Claude Code subagent (`general-purpose`, model alias haiku / sonnet / opus /
   fable) told to make **exactly two tool calls**: one `Read` of its part file and one `Write` of its JSON.
   Compliance is verified from the completion notice's `tool_uses` count. **Only `tool_uses == 2` is
   accepted.** A part whose count could not be read (e.g. an agent cut off by a usage limit after writing)
   is **void and re-run**, even if its file looks complete; void files are kept in `<dir>/void/`.
3. `bin/merge-parts.mjs --brief <brief.json> --parts-dir <dir> --out subject-answers/<subject>-trial-<n>.answers.json`
   reassembles the parts. It refuses invalid JSON by default. `--escape-raw-controls` permits exactly one
   repair — escaping raw U+0000-U+001F **inside string literals** (a paragraph break written as a raw LF),
   which is lossless: the parsed reply is identical to what the model wrote. Re-sampling instead would select
   answers for formatting validity. Each repair is logged to `repairs/<name>.repairs.json`, outside the
   answers directory that ingest reads. `lib/escape-controls.mjs` holds the function.

Differences from the original design, disclosed in the run record: replies are produced 27-28 per call rather
than one per call; subjects can see the other messages in their part (each is told to treat every message
independently); re-run parts after the first usage-limit interruption carried one extra formatting sentence
("inside string values write line breaks as \n ...") that does not change what is asked.

## Excluding a judge and re-routing (added 2026-10-01, `pilot-2026-10-01`)

A post-hoc protocol change, disclosed in the run record, for when one model proves unusable as a JUDGE
(it stays a subject). It is triggered by the harness's own quote-grounding check, never by scores.

1. `bin/reroute-judges.mjs --run-id <id> --exclude-judge <label> [--requote]` reads `keys/judge-key.json`
   and `judge-answers/` (never writes them). Each response the excluded judge judged goes to the UNIQUE judge in
   {all judges} minus {excluded, subject, the response's other judge}; any other candidate count refuses. With
   `--requote`, every kept judge's rating whose quote is not a verbatim substring is re-asked of the same judge.
   Output: `judge-batches-reroute/<judge>__reroute-NN.{json,md}` (<= 8 entries, < 70 KB, same rendering and
   identity checks) and the amended key `keys/judge-key.reroute.json` (outside the batch dir) with final judges
   and provenance `original` | `rerouted-excluded-judge` | `requoted` per response.
2. Save replies in `judge-answers-reroute/`, then
   `assemble-run.mjs ... --routing keys/judge-key.reroute.json --ratings judge-answers --ratings judge-answers-reroute`.
   Ratings of an excluded judge, and original ratings superseded by a requote, are ignored only because the amended
   key says so; every used quote must still be a verbatim substring (no normalisation); each response must end
   with exactly two ratings from two distinct non-self judges. Anything else refuses.
3. Each `<subject>.assembly-audit.json` gains `judge_routing`: judge pairs per subject, rerouted/requoted
   counts, the exclusion record and per-judge stats of the ORIGINAL answers (not-verbatim, near-miss counted
   by a reporting-only normalisation, dropped).

### Supplement round: ratings cb-probe rejects (added 2026-10-01)

`--requote` (first round) and `--supplement` (later) both select a rating when its quote is non-verbatim **or**
cb-probe's own per-rating validation rejects it (e.g. a verbatim quote under 3 words). The rule is cb-probe's:
`lib/probe-validate.mjs` offers each rating to cb-probe's `recordItemRating` in a throwaway scored run (scratch
root under the OS temp dir, or `--scratch-dir`; deleted afterwards) and returns its error text. It is O(n^2) in
cb-probe's disk reads, so the full 1,992-rating pilot takes about 2 minutes.

`reroute-judges.mjs --run-id <id> --supplement` reads `keys/judge-key.reroute.json` and `judge-answers/` +
`judge-answers-reroute/`, inspects only the ratings that key currently uses (excluded judges and superseded ratings
are never looked at), and writes only the rejected ones as new batches `judge-batches-reroute-2/<judge>__reroute-2-NN`
plus `keys/judge-key.reroute-2.json` (previous key + requotes; provenance `requoted` for original slots, and an
explicit `rating_source` per pair; reason text from cb-probe in `supplements[].selected[].reason`). It never edits
or deletes an existing key, batch or answer, and refuses if its outputs exist. One supplement round per chain.
Then: save replies in `judge-answers-reroute-2/` and run
`assemble-run.mjs ... --routing keys/judge-key.reroute-2.json --ratings judge-answers --ratings judge-answers-reroute --ratings judge-answers-reroute-2`.

## Explicit judge set, bridge sample and judge validity (added 2026-10-02, `pilot-2026-10-02`)

For a run whose subjects are not the judges (`run-config.json` has a `judges` array; first-pilot runs have none and
behave exactly as before, proven by regenerating `pilot-2026-10-01/judge-batches` byte for byte). Every number below is read
from `run-config.json`; `tests/judging-prep.test.mjs` ties each to `PREREGISTRATION.md`.

1. **Routing** (`lib/judge-routing.mjs`). Each reply goes to 2 of the judges, never the subject and never a judge of the
   subject's family (unknown family fails closed). Pairs are balanced by (subject, item), then subject, then item, so per-subject
   judge loads are within 1 of equal.
2. **Bridge sample** (`lib/bridge.mjs`, prereg section 6). Seeded draw of first-pilot replies, `per_source_subject` each, only those
   that a judge of this run rated in the first pilot's final ratings (`scorecards/*.assembly-audit.json` row_mapping). Each goes to
   the judge(s) of this run that originally rated it. Same entry shape and `r-xxxxxxxxxx` id scheme as every other entry. The
   key holds them under `bridge` (source ids, text, original ratings), never under `responses`. The assembler builds scorer
   rows from `responses` only and splits bridge ratings off before anything else, so no bridge rating can reach a composite;
   it writes the descriptive `scorecards/bridge-drift.json`.
3. **Build or inspect.** `bin/build-judge-batches.mjs --run-id <id> --out <dir>` (batch size defaults to `max_batch_entries`,
   seed to `master_seed`). `--dry-run` writes nothing and prints per-judge counts, bridge included, and the number of batches;
   `--dry-run --partial` reads finished replies from `subject-answers/records/` so it works while the subject run is going.
4. **Judge validity** (`bin/judge-validity.mjs`, prereg section 5). Run it on the answer directories BEFORE assembly. Writes
   `operations/judge-validity.json`: per judge the unfound-quote rate (shared normaliser), PASS/FAIL (strictly greater than the
   threshold fails), the quotes under `short_quote_min_chars` for the supplement round, and a verdict. Exit 0 all valid, 1
   incomplete, 4 one judge fails, 5 two or more fail. Bridge ratings are reported separately and never count towards a verdict.
5. **Supplement for short quotes.** `reroute-judges.mjs --exclude-judge none --requote --min-quote-chars 12` opens a requote
   round that excludes nobody (the existing `--supplement` chain then applies, with the same `--min-quote-chars`). Requote BEFORE
   measuring: pass the requote answers as a later `--answers` directory to `judge-validity.mjs` and use the amended key with `--key`.
6. **Assembly gate.** For a key with `validity_required`, `assemble-run.mjs` refuses unless the report exists, was made from
   exactly the answer files being assembled (per-file hashes, ratings hash, key hash), and agrees with `--routing`: a failing judge
   must be excluded and a passing judge must not be; two failures mean no composite. The only answer files allowed to be new after
   the measurement are exclusion reroutes. Scorecards say `cross-family`, not `same-family`.

## Arms: one build as several subject variants (added 2026-10-02, for `pilot-2026-10-03`)

A run may hold the same model build several times, as variants ("arms") that differ ONLY in system message and trial
count. Everything downstream treats a variant as an ordinary subject (its label is unique), except where noted.

```jsonc
{ "run_id": "...", "trials": 3, "max_retries": 2, "master_seed": 0,
  "system_message": "<neutral message; run-level default, required unless every subject states its own>",
  "subjects": [
    { "label": "gemma2-9b-A", "tag": "gemma2:9b", "digest": "<64 hex>", "family": "google", "arm": "A" },
    { "label": "gemma2-9b-B", "tag": "gemma2:9b", "digest": "<64 hex>", "family": "google", "arm": "B",
      "trials": 1, "system_message": "<neutral message> Reply in about 250 words." } ],
  "comparisons": [ { "a": "gemma2-9b-A", "b": "gemma2-9b-B", "kind": "arm" },      // same build, different arm
                   { "a": "gemma2-9b-A", "b": "mistral-7b-A", "kind": "build" } ] } // different build, same arm
```

- **Build** = same `tag` + `digest`. If any two subjects share a build, every subject needs an `arm` (safe name), and
  (build, arm) must be unique. Variants of one build must differ in system message or trial count and share one `family`.
- **RUN-SYS-1 stays enforced per subject**: the run-level `system_message` is required unless every subject has its own;
  the legacy flag excludes any explicit message.
- **Seeds** come from the variant label, so arms are independent. Records carry `arm`, `build`, `system_message_sha256`.
- **Order**: calls are made build by build (all variants of a build consecutively): one GPU model swap per build.
- **Judging**: arms are routed like any subject; the family rule uses the build's family. Batches carry no arm, build or
  system message (`assertBatchesBlind` refuses an entry field or scaffold text that does, and arm labels longer than two
  characters as identity terms). Judges never see system messages: an entry is the item prompt, the ladder and the reply.
  Reply length can still hint at an arm (the batch instructions already say length is not a criterion).
- **MCP probe: once per build** (`planBuildProbes`). cb-probe seeds a probe's questions from the scored run's server-assigned
  id and `finish_scored_run` needs THAT run's probe, and `start_scored_run` refuses fewer than 3 trials per item. So the probe
  runs in the build's first variant whose subject trials x judges reach 3 (arm A: 3 x 2 = 6), with that variant's system
  message (`probe_system_from` in the state and every question record). A variant below the floor (arm B: 1 x 2 = 2) opens no run:
  `--phase finish` writes `mcp-scorecards/<label>/mcp-rating-map.json` with `scorecard: null` and `probe_subject`; the analysis
  computes its composite from the rating rows with the same canonical function and cites the build's probe. A second eligible
  arm in one build would need its own `server-required-repeat` probe (new questions, same system message): the server cannot
  share one. `assemble-run.mjs` refuses an arms run; use `run-mcp-probe.mjs`.
- **Analysis**: per-subject results are unchanged; a config with arms adds `design.arms`, per-subject `trials_per_subject`
  and `comparisons` (composite difference a minus b, paired item-resampling bootstrap, same replicates as `pairwise`).
  `primary_comparison` is the two-subject pilot's and is not produced for an arms run.

## Runbook

All paths below are relative to the repo root. `RUN=pilot-2026-10-01`. Add `--seed <n>` to any builder for a
reproducible build; otherwise a random seed is recorded in the key.

```bash
RUN=pilot-2026-10-01
R=research/model-runs/$RUN
BIN=research/model-runs/bin

# 1. Subject briefs: 4 subjects x 3 trials = 12 briefs. Refuses on any leak. Key goes to $R/keys.
node $BIN/build-subject-briefs.mjs --run-id $RUN --out $R/subject-briefs

# 2. Collect answers: for each file in $R/subject-briefs, one FRESH tool-less call to that subject model
#    (the file name starts with the subject). Save the reply, a JSON object matching answer-schema.json,
#    as $R/subject-answers/<anything>.json. The reply must echo brief_id. A reply wrapped in a single
#    ```json fence is accepted.
node $BIN/ingest-answers.mjs --run-id $RUN --answers $R/subject-answers
#    Exit 1 lists every problem and ingests nothing: missing/duplicate/extra code, empty response,
#    wrong brief_id, a brief with no answer file.

# 3. Judge batches: every response anonymised, routed to 2 of the other 3 models, <= 40 per batch.
node $BIN/build-judge-batches.mjs --run-id $RUN --out $R/judge-batches --batch-size 40
#    Prints the per-judge load. The blinding key is written to $R/keys/judge-key.json.

# 4. Collect ratings: for each file in $R/judge-batches, one FRESH tool-less call to the judge model named
#    by the file prefix. Save its JSON reply as $R/judge-answers/<anything>.json:
#      { "batch_id": "...", "ratings": [ { "response_id", "rating_1_5", "anchor_matched", "evidence_quote" } ] }
#    anchor_matched = the level label as printed ("3.0 Functional"); evidence_quote = verbatim text from the reply.

# 5. Assemble, pass 1. --artifact-root MUST be outside the repo (cb-probe refuses otherwise).
ART=~/compassion-probe-sessions/$RUN
node $BIN/assemble-run.mjs --run-id $RUN --artifact-root $ART --ratings $R/judge-answers
#    Validates every judge file (all-or-nothing), opens one `panel` scored run per subject, records all
#    ratings, then issues one probe brief per subject in $R/scorecards/probe-briefs and exits 3.

# 6. Probe: each subject gets its OWN $R/scorecards/probe-briefs/<subject>.probe.md in a FRESH tool-less
#    call (made after, and never combined with, the trial calls: it names item ids and scenario titles).
#    Save replies as $R/probe-answers/<subject>.probe-answers.json.

# 7. Assemble, pass 2: completes the probes, finishes the runs, validates and writes the scorecards.
node $BIN/assemble-run.mjs --run-id $RUN --artifact-root $ART --probe-answers $R/probe-answers
#    Exit 0 only if all four scorecards pass validateSelfRunScorecard with official:false,
#    comparability:"none" and the provenance note. Ratings are not re-recorded on pass 2.
```

Tests: `node --test "research/model-runs/tests/*.test.mjs"`. Quote the glob; `node --test <dir>` does not
work on Node 24. This is **not** wired into `site/package.json`'s `test` chain (see below).

Exit codes: 0 ok, 1 refused, 2 usage, 3 `assemble-run` awaiting probe answers.

## What each scorecard states about provenance

The scorecard schema is a closed allow-list and may not be extended, so the note rides in the two free-text
provenance fields the schema admits (`provenance.subject_label`, `provenance.judge_label`): access tier
`agent` (Claude Code subagent), model snapshot id unverifiable, judges same-family as the subject, item
pool publicly exposed, no human raters. The structured version is in `<subject>.assembly-audit.json`.
`official` is `false` and `comparability` is `"none"` (both enforced by the validator).

## Limits you must carry into any reading of the results

1. **The scorer has no per-response panel.** It stores one rating row per (item, trial_index), capped at
   `trials_per_item`, and `judge_panel` groups an item's rows by judge label. So each subject is opened
   with `trials = 3 x 2 = 6`, and every (response, judge) rating is one scorer trial. Consequences:
   `provenance.trials_per_item` reads 6, not 3; the bootstrap intervals and `trial_stats` treat the two
   judges' ratings of one response as independent trials, so intervals are narrower than a
   response-clustered interval would be; and `judge_panel.per_item` compares judges that each rated a
   different two-thirds of a subject's responses. Means, dimension means and the composite are unaffected
   (every response has exactly two judges, so every response carries equal weight).
   `<subject>.assembly-audit.json` has the response-level mapping and the within-response judge agreement.
2. **Independence is between contexts, not within one.** A brief holds 83 messages answered in one call;
   the 3 trials are independent calls, but items inside one call are not independent of each other.
3. **Same-family judging.** All four models are Claude. Cross-model, not cross-family. A shared bias is
   not visible in the agreement figures.
4. **Public pool.** Every item and full rubric is public (`public-permanent`); the exposure probe is the
   only contamination check, and it samples a handful of items.
5. **`claude-fable` and the others are `agent` tier, snapshot unverifiable.**
6. **No human raters, and the output is not an official score.**
7. A response that names its own model (for example "As Claude Opus...") unblinds itself to a judge. The
   harness checks only the text it writes, not the subjects' replies.
