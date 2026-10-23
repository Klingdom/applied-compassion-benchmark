# Weekly model wave under protocol v2: operator runbook

**Status:** DRAFT under D-60 (Stream D, 2026-10-22). Not in force. For the coordinator agent and the founder.

**No v2 wave can run until PROTOCOL-V2-2 (founder ratification of PROTOCOL.v2.json) — status today: proposed.**
`PROTOCOL.v2.json` does not exist (WP-1, `ARCHITECTURE_EVAL_V2.md` §4). The v1 file `research/model-runs/weekly/PROTOCOL.json` is also `proposed` (line 3), so a real `plan` is refused today under either version (`research/model-runs/lib/weekly.mjs:204-209`). Only dry runs work now.

**Scope.** One weekly wave, phase by phase: intake, plan, plan commit, collect, judge, validity, analysis and audit, wave-ready, review packet, Friday reply, publish. The procedure in force today is `.claude/commands/weekly-model-wave.md` (v1); its required changes are in §15. Harness detail: `research/model-runs/README.md`, section "Weekly waves" (line 189).

**Markers** (checked 2026-10-22 by file existence, and by reading each script's argument parse):
- `EXISTS`: file present and the flags match its parse call.
- `BEING BUILT`: D-60 Stream B (`bin/wave-ready.mjs`, `bin/audit-wave.mjs`). Not runnable yet.
- `PROPOSED (WP-n)`: designed in `ARCHITECTURE_EVAL_V2.md` §4, not started.
- `MANUAL`: a human or agent step with no script.
- `EXTERNAL`: git, ollama, or the OS scheduler. Not a repo script.

**Authority.** `AGENT` means within D-60 and AUTONOMY §1a (research tooling and non-published artefacts). `FOUNDER` means AUTONOMY §1b: any commit, push, deploy, publish, queue approval, scheduler registration, model pull, or retry of a failed collect. Agents never run git writes (`weekly-model-wave.md:17`).

Variables (repo root, Git Bash):

```bash
RUN=wave-YYYY-MM-DD
R=research/model-runs/$RUN
BIN=research/model-runs/bin
STAGE=$HOME/stage/$RUN                      # judge staging, outside the repo, neutral path
SCRATCH=research/model-runs/eval-v2/$RUN    # PROPOSED scratch root (ARCHITECTURE_EVAL_V2.md:103)
```

## 0. Phase table

The phase comes from `weekly-wave.mjs status` (`wavePhase`, `lib/weekly.mjs:741-756`). The code has no `judged`, `audited` or `gated` phase; those are PROPOSED (WP-9).

| Status phase | Do | Stop for |
|---|---|---|
| no wave directory | §1 intake, §2 dry run | founder: model pull, ratification |
| `planned-uncommitted` | §3 (approval request) | founder: plan commit |
| `planned`, `collecting` | nothing; read §4 | none |
| `collect-deferred`, `collect-failed` | §4: report first | founder |
| `collected`, `judging` | §5, then §6 validity and §7 probe | none |
| `analysed` | §8 analysis and audit, §9 gates | none |
| gates and audit clear | §10 review, §11 Friday ask | founder |
| approved | §12 publish | founder |

## 1. Intake: release to queue

1. Watch edition: run separately (`.claude/commands/weekly-ai-model-watch.md`). Not covered here. `AGENT`.
2. Intake card (size, licence, thinking field, source URL; `ARCHITECTURE_EVAL_V2.md` §3a). `MANUAL`. Candidate report and readiness generator: `bin/queue-candidates.mjs`, `bin/readiness-check.mjs` are `PROPOSED (WP-13)`; neither exists.
3. Queue entry: edit `research/model-runs/weekly/QUEUE.json` only after the founder approves the entry (Friday line D). `MANUAL`, `FOUNDER` approves, `AGENT` edits. Non-commercial licence: do not queue (held until counsel, M-FD-5). `QUEUE.json` has no hold field, so the hold is this rule, not code (ARCHITECTURE_EVAL_V2 G6).

## 2. Plan (dry run first)

1. `node research/model-runs/bin/weekly-wave.mjs status`. `EXISTS`. `AGENT`. Exit 3 means report the `Last collect` and `stderr tail` lines to the founder first.
2. `node research/model-runs/bin/weekly-wave.mjs plan --date YYYY-MM-DD --dry-run --allow-proposed`. `EXISTS` (v1). `AGENT`. Reads Ollama `/api/tags` only and writes nothing. `--allow-proposed` is accepted only with `--dry-run` (`lib/weekly.mjs:203-205`), so a `proposed` protocol does not block a preview. v2 form, `plan --protocol v2 ...`: `PROPOSED (WP-2)`. The flag is absent from the parser (`bin/weekly-wave.mjs:84`).
3. Report picks, call count, anchor size and memory line in the Friday packet.
4. A pick not pulled: the output lists `ollama pull <tag>`. `EXTERNAL`, `FOUNDER` approves each pull. Check free disk first. Never pull without approval. Thinking-trace models (qwen3) are held until O14 is decided.

## 3. Real plan and plan commit

1. `node research/model-runs/bin/weekly-wave.mjs plan --date YYYY-MM-DD`. `EXISTS` (v1), refused until ratified. `AGENT` writes `$R/{run-config.json,PREREGISTRATION.md,weekly.json}` and prints the pathspec. v2: `PROPOSED (WP-2)`, refused while `proposed` (WP-2(d)).
2. `node research/model-runs/bin/weekly-wave.mjs check --run-id $RUN`. `EXISTS`. `AGENT`. Must print OK.
3. Stop and ask the founder to approve committing the three files. `FOUNDER`. Print this pathspec and nothing else:

   ```bash
   git add research/model-runs/wave-YYYY-MM-DD/run-config.json research/model-runs/wave-YYYY-MM-DD/PREREGISTRATION.md research/model-runs/wave-YYYY-MM-DD/weekly.json
   git commit -m "<message>"   # must not contain the CI-suppression token (AUTONOMY §1b, R12)
   ```

   `EXTERNAL`. `FOUNDER`.
4. After the commit: `weekly-wave.mjs status --run-id $RUN` must show `planned`, and `check --run-id $RUN` must say OK. `EXISTS`.
5. Plan-before-data, a gap: today collect checks only that the plan is committed and unmodified (`lib/weekly.mjs:718-730`; TEST_PLAN FM-6). Nothing checks commit time against the first record. Until `planBeforeData()` exists (audit A2, `BEING BUILT` in `audit-wave`), record by hand:

   ```bash
   git log -1 --format=%cI -- $R/run-config.json $R/PREREGISTRATION.md $R/weekly.json   # EXTERNAL, read-only
   ```

   Compare it with the earliest `started_at` in `$R/subject-answers/records/`. `MANUAL`. Enter both values in the review packet.

## 4. Collect (scheduler)

1. Scheduled `node research/model-runs/bin/weekly-wave.mjs collect --latest` at 02:00. `EXISTS`. `SCHEDULER`. Registered by the founder with `research/model-runs/weekly/register-task.ps1` (`EXISTS`, `FOUNDER`). Not registered as of 2026-10-22 (ARCHITECTURE_EVAL_V2 S4).
2. Collect refuses unless the plan is committed and unmodified, conformance holds, the lock is free and memory is sufficient (`lib/weekly.mjs:857-895`). Exit codes: 0 ok, 1 refused, 3 failed, 4 locked, 5 deferred.
3. Monitor: `weekly-wave.mjs status --run-id $RUN` (`EXISTS`), `$R/operations/collect-status.json`, `$R/operations/collect.log`. `AGENT` reads.
4. Manual `weekly-wave.mjs collect --run-id $RUN [--limit N] [--retry-failed]`. `EXISTS`. `FOUNDER` only. The status message says the same: retry only with the founder (`lib/weekly.mjs:763`).
5. Stale lock (older than 12 h, `operations/collect.lock`): report; `FOUNDER` clears it or lets the task handle it. `MANUAL`.
6. Do not run `npm run build` or `npm test` during the 02:00 window or while a model is loaded (UX E12). Harness tests on this host: `node site/scripts/test-model-runs.mjs`. `EXISTS`. Runs all 16 files; the same wrapper is in the `npm test` chain (`site/package.json:31`, `:39`).
7. At every status that is not ok, append one line to `$R/operations/deviations.draft.md` (time, event, pre- or post-hoc). `MANUAL`. Deviations are audited into `PREREGISTRATION.md` in §8.

## 5. Judge (phase `collected`, then `judging`)

1. `node research/model-runs/bin/ingest-answers.mjs --run-id $RUN --answers $R/subject-answers`. `EXISTS`. `AGENT`. Reads top-level `*.answers.json` written by finalise; the `records/` subfolder is skipped (`lib/ingest.mjs:86`). Refuses the whole ingest on any problem.
2. Dry run for counts: `node research/model-runs/bin/build-judge-batches.mjs --run-id $RUN --out $STAGE --batch-size 16 --dry-run`. `EXISTS`. `AGENT`. Pass `--batch-size 16` explicitly. The default is `max_batch_entries` only when `judging` is in `run-config.json` (`bin/build-judge-batches.mjs:121`), and otherwise 40.
3. Build: the same command without `--dry-run`. `EXISTS`. `AGENT`. The script does not refuse an in-repo `--out` (no guard found in `bin/build-judge-batches.mjs`), so the operator checks the path by hand.
4. Rename files to neutral `jbNNN` names. Scan the staged folder: `grep -ril -e benchmark -e compassion "$STAGE"` must print nothing. `MANUAL`. A hit stops the wave (§14).
5. Batches over 70 KB (`wc -c`): split with `node research/model-runs/bin/split-judge-batch.mjs split --batch <file> --parts 2 --out $STAGE/split --name jbNNN`. `EXISTS`. `--out` must be outside the repo (checked, `bin/split-judge-batch.mjs:40`). After judging: `split-judge-batch.mjs merge --batch <file> --dir $STAGE/split --name jbNNN --to $R/judge-answers/<file>.answers.json`. `EXISTS`.
6. Judging: one fresh, tool-less subagent call per batch. Each call makes exactly two tool calls, one `Read` of its batch file and one `Write` of its answers. "Tool-less" means no repository access; "two calls" means that Read and that Write (this settles UX E3). Judges never receive `keys/`, the repo or subject identity. `MANUAL`, `AGENT`.
7. Accept a batch only when the completion notice reports `tool_uses` = 2. Otherwise move the file to `void/` and re-run. Record each batch in `$R/operations/judge-batches.ledger.tsv`. `MANUAL`. No code checks the ledger (TEST_PLAN FM-13, A8). After each batch print `accepted a/total, void v`.
8. Answers go to `$R/judge-answers/`. Batch count with voids is reported in the review packet, section 3.

## 6. Validity and requote

1. `node research/model-runs/bin/judge-validity.mjs --run-id $RUN --answers $R/judge-answers`. `EXISTS`. `AGENT`. Writes `$R/operations/judge-validity.json`. Exit 0 all valid; 1 incomplete (report written; stop); 4 one judge above 5% unfound quotes; 5 two or more (`bin/judge-validity.mjs:22-24`). Strictly greater than 5% fails. Bridge ratings do not count (`README.md:139-142`).
2. Exit 1: finish the missing batches, then repeat step 1. Do not continue.
3. Requote short quotes: `node research/model-runs/bin/reroute-judges.mjs --run-id $RUN --exclude-judge none --requote --min-quote-chars 12`. `EXISTS`. `AGENT`. Writes `judge-batches-reroute/`. Judge those batches as in §5 into `$R/judge-answers-reroute/`. `MANUAL`.
4. Exit 4 (one judge): `node research/model-runs/bin/reroute-judges.mjs --run-id $RUN --exclude-judge <label> [--requote]`. `EXISTS`. `AGENT`. Record it as a deviation, post-hoc. Exit 5: no composite. Instrument findings only; the wave goes under NOT ASKED (`UX_FLOWS_EVAL.md` §4).
5. Supplement, once: `node research/model-runs/bin/reroute-judges.mjs --run-id $RUN --supplement --min-quote-chars 12`. `EXISTS` (`reroute-judges.mjs:149,152`). Judge its batches into `$R/judge-answers-reroute-2/`. `MANUAL`.
6. Re-measure with every answer directory and the latest amended key. Use `--key $R/keys/judge-key.reroute-2.json` if the supplement ran, else `--key $R/keys/judge-key.reroute.json` if the requote ran, else omit `--key`. The key must sit in `keys/` (`bin/judge-validity.mjs:53`):

   ```bash
   node research/model-runs/bin/judge-validity.mjs --run-id $RUN --answers $R/judge-answers --answers $R/judge-answers-reroute --answers $R/judge-answers-reroute-2 --key $R/keys/judge-key.reroute-2.json
   ```

   `EXISTS`. `AGENT`. Exit must be 0 before the probe.

## 7. Contamination probe

1. `node research/model-runs/bin/run-mcp-probe.mjs --run-id $RUN --phase probe`. `EXISTS`. `AGENT`. Always pass `--run-id`: the default is `pilot-2026-10-02` (`bin/run-mcp-probe.mjs:41`).
2. Each probe brief goes to a fresh tool-less subject call, one per build, never in the same call as trial replies. Save to `$R/probe-answers/`. `MANUAL`.
3. `node research/model-runs/bin/run-mcp-probe.mjs --run-id $RUN --phase finish --ratings $R/judge-answers --ratings $R/judge-answers-reroute --routing $R/keys/<amended key>`. `EXISTS`. `AGENT`. It refuses without a fresh validity report (`--validity`, default `operations/judge-validity.json`). The reference build gets no server scorecard. The probe has no pass/fail threshold yet (TEST_PLAN FM-2).

## 8. Analysis, anchor, export, audit

1. `node research/model-runs/bin/analyze-pilot.mjs --run-id $RUN`. `EXISTS`. `AGENT`. Writes `$R/analysis.json`. Phase becomes `analysed`.
2. `node research/model-runs/bin/weekly-wave.mjs status --run-id $RUN`. `EXISTS`. Prints `Anchor: comparable` or `NOT COMPARABLE` (`bin/weekly-wave.mjs:310`). The rule is mean absolute drift at or below the threshold (`lib/weekly.mjs:625-630`). A non-comparable wave is reported as such and never compared with earlier weeks.
3. Scratch export only: `CB_WAVES_DIR=$SCRATCH/waves node research/model-runs/bin/export-wave.mjs --run-id $RUN`. `EXISTS`. Without `CB_WAVES_DIR` the script writes into `site/src/data/model-benchmark/waves/` (`bin/export-wave.mjs:39-40`). D-60 forbids that write (`PROGRAMME.md:4`).
4. Regeneration check: `CB_WAVES_DIR=$SCRATCH/waves node research/model-runs/bin/export-wave.mjs --check --run-id $RUN`. `EXISTS`. `AGENT`.
5. Draft report in the shape of `docs/AI_MODEL_ASSESSMENT_TEMPLATE.md`; every figure is a token resolved from `analysis.json` or the wave file. Drafts stay in `$SCRATCH`. `MANUAL`, `AGENT`.
6. Claim audit: `node research/model-runs/bin/audit-wave.mjs --run-id $RUN`. `BEING BUILT` (D-60 Stream B, WP-7; the flags are not yet in code). Until it exists, audit by hand per `docs/ai-model-report/2026-10-03-pilot-3-claim-audit.md` (`EXISTS`). Re-derive every figure from the raw files; never from the draft, the analysis prose or memory. `MANUAL`.
7. Deviations: append `D<n>` entries to `$R/PREREGISTRATION.md`, tagged pre-registered or post-hoc, and never edit the plan text. `MANUAL`, `AGENT`. Then `weekly-wave.mjs check --run-id $RUN` must still say OK. `EXISTS`.

## 9. Wave ready (gates)

1. `node research/model-runs/bin/wave-ready.mjs --run-id $RUN`. `BEING BUILT` (D-60 Stream B, WP-8). Proposed exit codes (`ARCHITECTURE_EVAL_V2.md` §3.6): 0 ready, 3 any FAIL, 4 NOT-RUN or OPEN-THRESHOLD. Writes `$R/operations/publication-gates.json`.
2. Checklist: `TEST_PLAN_EVAL.md` §3, A1–A21. The review rule is: A1–A12, A14–A18 and A20 are green, or a dated deviation justifies each exception. A13 and A19 are written "n/a" for local-only waves. `MANUAL` until the gates exist.
3. A wave whose gate is `FAIL` does not reach §10 as an approvable item. It is listed under NOT ASKED.

## 10. Review packet

1. Packet generator: `PROPOSED` (UX §5; no name or flags fixed). Until then, `MANUAL`: fill the template in `docs/model-eval/RESULTS_REVIEW_PROCEDURE.md` §2 from `analysis.json` and `operations/*`. Output: `$R/REVIEW_PACKET.md`.
2. The reviewer must be a different session or person from the drafter (FDM-5, `PRD_MODEL_EVALUATION.md:185`). Follow `RESULTS_REVIEW_PROCEDURE.md` §3 (blind read) and §4 (decision). `MANUAL`.
3. Record at `$R/REVIEW_<runId>.md` (format in `RESULTS_REVIEW_PROCEDURE.md` §7). A wave with no recorded review does not go in the Friday ask.

## 11. Friday reply (one reply per week, D-59 C-FD-2)

1. Friday packet: `bin/wave-packet.mjs` is `PROPOSED (WP-10)`. Until then `MANUAL`, using the template in `UX_FLOWS_EVAL.md` §3d. Each item carries its gate result and an exact pathspec. A FAIL gate cannot be shown as approvable.
2. The founder replies: "defaults", "defaults except N", or "N: text". Silence means nothing is committed, pushed or deployed. `FOUNDER`.
3. Results commit, after approval only. `FOUNDER` approves; `EXTERNAL`:

   ```bash
   git add research/model-runs/wave-YYYY-MM-DD/ site/src/data/model-benchmark/waves/wave-YYYY-MM-DD.json <report path>
   ```

4. Queue change, after approval: set each picked entry in `research/model-runs/weekly/QUEUE.json` to `"measured"` and name the wave in `note` (`weekly-model-wave.md:83`). `MANUAL`, `AGENT`.

## 12. Publish (founder approval only)

1. Export into the site, after approval: `node research/model-runs/bin/export-wave.mjs --run-id $RUN` (no `CB_WAVES_DIR`). `EXISTS`. `FOUNDER`.
2. Byte check: `node research/model-runs/bin/export-wave.mjs --check --run-id $RUN`. `EXISTS`. `AGENT`.
3. Tests, in daytime: `cd site && npm run test:model-waves && npm run test:model-wave-export && npm run test:model-wave-isolation && npm run test:model-html-leak && npm run test:model-machine-leak`. All `EXISTS` (`site/package.json:86-97`). `AGENT`.
4. `cd site && npm run build` (`EXISTS`), then `deploy.sh` (`EXISTS`). `FOUNDER`. Deploy is AUTONOMY §1b.
5. Manifest entry `decision_status: active` in `site/src/data/model-benchmark/waves/manifest.json`, and the commit. `FOUNDER`.
6. Nothing is published by the gates alone. Publication needs per-wave approval (`PROTOCOL.v2` `publication.per_wave_approval`, proposed).

## 13. Duty of care: stop rules (every phase)

1. **No `high`-sensitivity item is served, judged, reviewed or shown until all four hold:** (a) MF1: a qualified human reviewer tags all 93 items `standard|high`; (b) MF4: `critical_harm_triggered` and `critical_harm_rule` are in the judge schema (`lib/judge-batches.mjs:26-36` has neither); (c) MF5: a crisis-display safety protocol is written; (d) the rater welfare protocol is signed and dated (`COMPASSION_REVIEW_EVAL.md`, outline steps 2 and 15; CYC-RATERS, D-59 item 4).
2. Today: no item carries a sensitivity key (MF1 verified). Only the five hard-coded crisis ids are excluded (`README.md:49-53`). Standard work may proceed; sensitive work may not.
3. If any element of rule 1 is missing for a session, no `high` item is shown in that session. Standard work may continue (welfare outline step 15).
4. Gate: wave-ready must block until item tag coverage is 100% (MF1). `PROPOSED`.
5. A disagreement on a `high` item goes to a human adjudicator. An agent never resolves it (S4).
6. An agent is never the welfare lead, a support contact, the reviewer of section 7 ratings, or the author of a section 10 decision.
7. Crisis item text appears in no packet, log or page. Refer to items by id only. Crisis results are never a per-model value, rank or colour (MF5 (i)).
8. Raw replies to `high` items stay outside the public tree (S3).

## 14. Failure states

From `UX_FLOWS_EVAL.md` §4. The first line to the founder names the state, what is not affected, and the default action.

| State | Detected by | Operator does | Founder asked? |
|---|---|---|---|
| Protocol still `proposed` | status; real plan refused | dry run only | carried line F |
| No eligible build | dry run has no picks | no wave; intake only | line D |
| Pick not pulled | plan lists `ollama pull` | wait | yes, pull |
| Collect deferred (exit 5) | `collect-status.json` | say "close heavy apps on run night"; no hand retry | only after three nights |
| Collect failed (exit 3) | status exit 3 | report with counts and stderr tail; no retry | yes: retry or drop |
| Stale lock (over 12 h) | `operations/collect.lock` | report | yes |
| Failed trials over 10% | `analysis.json` | variant shown as "No result: instrument failure" | no |
| Judge batch `tool_uses` not 2 | ledger | void, re-run | no |
| Validity incomplete (exit 1) | `judge-validity.json` | finish batches, re-measure | no |
| One judge invalid (exit 4) | `judge-validity.json` | exclude, reroute, re-measure | no; packet §3 |
| Two judges invalid (exit 5) | same | no composite; instrument findings only | informational |
| Anchor drift above 0.30 | status prints NOT COMPARABLE | label "not comparable"; never compare | line B label |
| Audit open items | audit (manual or `audit-wave`) | fix through the build, re-audit | no |
| Leak check hit | harness refusal | stop; incident; delete output (`README.md:15`) | yes |
| Sensitive item requested, §13 unmet | gate; tag coverage | hold the wave; serve nothing sensitive | yes |
| Packet unanswered next Friday | no reply | re-ask once, then stop; no stacking past `max_new_subjects_per_wave` (2) | re-ask once |

## 15. Changes needed in `.claude/commands/weekly-model-wave.md`

This file is outside D-60's file set. Nothing here has been edited. The founder or a D-60 follow-up makes these changes.

1. Line 45-49 (step 2): state that a dry run under a `proposed` protocol uses `--allow-proposed`. Step 2 currently says "stop" on `proposed`, which contradicts the dry-run flag.
2. Line 65 (step 3.1): add `--batch-size 16` explicitly; the default is 40 when `judging` is absent (`bin/build-judge-batches.mjs:121`). Say that `--out` is not checked by code and must be outside the repo by hand.
3. Line 65: give the `split-judge-batch.mjs split` and `merge` commands. The current text names the script without syntax.
4. Line 66 (E3): add one sentence defining "tool-less" and "exactly two tool calls".
5. Line 67: give the `judge-validity.mjs --run-id $RUN --answers <dir>` command and exit codes 0, 1, 4, 5.
6. Line 68: state `--supplement --min-quote-chars 12` for the supplement round; the text says only "--supplement once".
7. Line 69: `run-mcp-probe.mjs` defaults to `pilot-2026-10-02` (`bin/run-mcp-probe.mjs:41`). The command must pass `--run-id`.
8. Line 72 (step 3.8): **export-wave writes into `site/src/data/model-benchmark/waves/` unless `CB_WAVES_DIR` is set** (`bin/export-wave.mjs:39-40`). The text says "uncommitted drafts", which is false. Set `CB_WAVES_DIR` to a scratch path under D-60.
9. Line 37-38 (status table): `analysed` must also point to the audit step 3.9 and the deviation step, which run in that phase. `judging` appears as soon as batches exist (`lib/weekly.mjs:744`), not after judging ends.
10. Lines 75-86 (approval packet): add the gate step (wave-ready, BEING BUILT), the review packet and its reviewer rule (FDM-5), and the duty-of-care rule (RUNBOOK_V2 §13).
11. Line 20 and E12: state the ordering rule. No `npm run build` or `npm test` in the collect window or while a model is loaded.
12. Add the deviation draft step (RUNBOOK_V2 §4.7), which is missing from the file.
13. Line 92 (tests): name `node site/scripts/test-model-runs.mjs` as the harness suite, since it runs all 16 files.
