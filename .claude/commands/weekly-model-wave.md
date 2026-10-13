---
description: Run one step of the weekly open-weight model wave (status, plan, judge, analyse, approval packet). Never commits, pushes or deploys without founder approval.
---

# Weekly model wave runbook

Founder directive 2026-10-13: run the AI-model benchmark every week. Design: `docs/META_REVIEW_2026-10-13_ITER97-101.md` sections 5 and 6. Frozen rules: `research/model-runs/weekly/PROTOCOL.json`. Subject queue: `research/model-runs/weekly/QUEUE.json`. Harness details: `research/model-runs/README.md` (do not duplicate it here; follow it).

Split of work:

- **Scheduler (outside any session):** `CompassionBenchmark-WeeklyCollect` runs `weekly-wave.mjs collect --latest` daily at 02:00. Ollama on localhost only. Registered by the founder with `research/model-runs/weekly/register-task.ps1`.
- **This session:** plan, judge, analyse, audit, and write the approval packet.
- **Founder:** ratifies the protocol, approves committing each plan, approves anything published.

Hard rules for this runbook:

- Never run `git add`, `git commit`, `git push`, a deploy, or the register script on your own authority. Print the exact pathspec and stop.
- Never write a score, a ranking, or a site page. Waves are unofficial pilots (D-29a).
- Do not load a model in this session. Subjects are collected by the scheduler; judges are Claude subagents.
- Host memory is tight. Do not run `npm test`, a build or the full chain here. Run only the harness tests you need: `node site/scripts/test-model-runs.mjs`.

## 1. Status first

```bash
node research/model-runs/bin/weekly-wave.mjs status
```

- Exit 3 means the last collect failed or was deferred. **Report that to the founder first**, with the `Last collect` and `stderr tail` lines, before anything else.
- Otherwise read `Phase` and `Next`, and go to the matching step:

| Phase | Go to |
|---|---|
| none yet, or the newest wave is `analysed` and a week has passed | step 2 |
| `planned-uncommitted` | step 2 (stop at the approval request) |
| `planned`, `collecting`, `collect-deferred` | nothing to do; wait for the scheduler |
| `collect-failed` | report it; do not retry collection without the founder |
| `collected`, `judging` | step 3 |
| `analysed` | step 4 |

## 2. Plan the week (only when no current-week wave exists)

1. The protocol must be `ratified`. If `status` says `proposed`, stop and ask the founder to ratify (set `"status": "ratified"` in `PROTOCOL.json` and commit it).
2. Preview. It reads Ollama `/api/tags` only and writes nothing:

   ```bash
   node research/model-runs/bin/weekly-wave.mjs plan --date YYYY-MM-DD --dry-run
   ```

   (`--allow-proposed` is accepted only together with `--dry-run`.) Report the picks, the call count, the anchor size and the memory line.
3. If a pick is not pulled, the output lists `ollama pull <tag>`. The founder runs the pull, or approves you to run it. Never pull without approval. If the pick is `qwen3:8b`, check first how thinking traces would be stored.
4. Real plan, once the picks are pulled:

   ```bash
   node research/model-runs/bin/weekly-wave.mjs plan --date YYYY-MM-DD
   ```

   It writes `research/model-runs/wave-<date>/{run-config.json, PREREGISTRATION.md, weekly.json}` and prints the exact `git add` pathspec.
5. **Stop.** Ask the founder to approve committing the plan, quoting that pathspec. Collection refuses until the files are committed and unmodified, which is what proves the plan came before the data.
6. `node research/model-runs/bin/weekly-wave.mjs check --run-id wave-<date>` must say OK.

## 3. Judge and analyse (phase `collected`)

`RUN=wave-<date>`, `R=research/model-runs/$RUN`. Each step is documented in `research/model-runs/README.md` (sections "Explicit judge set, bridge sample and judge validity", "Excluding a judge and re-routing", "Supplement round", "Arms"). Follow it; the list below is the order.

1. **Judge batches.** `node research/model-runs/bin/ingest-answers.mjs --run-id $RUN --answers $R/subject-answers`, then `build-judge-batches.mjs --run-id $RUN --out <dir>` (batch size 16 from `max_batch_entries`; use `--dry-run` first for the per-judge counts). Stage the files **outside the repo** under neutral names `jbNNN` (no "benchmark" or "compassion" in any path or text). A batch over 70 KB is split with `split-judge-batch.mjs`.
2. **Judging by Claude subagents.** One fresh, **tool-less**-by-instruction call per batch for each judge named by the batch prefix: `claude-fable`, `claude-opus`, `claude-sonnet`. Each call makes exactly two tool calls (one `Read` of its batch file, one `Write` of its answers). Gate on the completion notice's `tool_uses` count: only 2 is accepted; anything else is voided, kept in a void folder and re-run. Judges never receive `keys/`, the repo, or subject identity.
3. **Judge validity.** `judge-validity.mjs --run-id $RUN --answers <dir> ...` before any assembly. Threshold from `run-config.json` (5%, strictly greater fails). One failing judge is excluded and rerouted; two failing means instrument findings only.
4. **Requote and supplement rounds.** `reroute-judges.mjs --run-id $RUN --exclude-judge none --requote --min-quote-chars 12` (or `--exclude-judge <label>` for a failure), judge the new batches, then `--supplement` once. Re-measure validity with the later answer directories and the amended key.
5. **MCP contamination probe.** `run-mcp-probe.mjs --run-id $RUN --phase probe`, answer the probe briefs with fresh tool-less subject-side calls, then `--phase finish --ratings <dirs> --routing <amended key>`. The reference has 1 trial and gets no server scorecard (README, "Arms").
6. **Analysis.** `analyze-pilot.mjs --run-id $RUN` writes `$R/analysis.json`.
7. **Anchor verdict.** `weekly-wave.mjs status` prints `comparable` or `NOT COMPARABLE` from `analysis.json` `bridge_drift` against the protocol threshold (`anchorVerdict`). A not-comparable wave is reported as such and is not compared with earlier weeks.
8. **Wave export and draft report.** `export-wave.mjs --run-id $RUN` writes `site/src/data/model-benchmark/waves/$RUN.json`. Draft the report in the shape of `docs/AI_MODEL_ASSESSMENT_TEMPLATE.md` (every figure a token resolved from the wave file). Both are uncommitted drafts.
9. **Claim audit.** Follow `docs/ai-model-report/2026-10-03-pilot-3-claim-audit.md`: for every number and every claim in the draft, **run the tools and re-derive it from the raw files** (records, answers, keys, git history for the plan-before-data claim). Do not take figures from the draft, the analysis prose or memory. Any deviation (host stops, voided batches, reroutes) is appended to `PREREGISTRATION.md` as a dated `D<n>` entry, tagged pre-registered or post-hoc, never edited into the plan text; `check --run-id $RUN` must still say OK.

## 4. Founder approval packet (stop here)

Write one packet and stop. It lists:

- the wave, the picks and their digests; the call and failure counts from `operations/collect-status.json`;
- the anchor verdict; judge validity outcome; deviations;
- the claim-audit result with every open item;
- the exact files to commit (`$R/`, the wave export, the draft report) as a `git add` pathspec;
- the queue change: set each picked entry in `QUEUE.json` to `"measured"` with the wave named in `note`;
- what would be published and where (nothing is published by this runbook).

Do not commit, push or deploy. The founder approves, or does not.

## Reference

- Exit codes of `weekly-wave.mjs`: 0 ok or nothing to do, 1 refused, 2 usage, 3 failed, 4 locked, 5 deferred (low memory).
- Collect status: `research/model-runs/wave-<date>/operations/collect-status.json`; log: `operations/collect.log`; lock: `operations/collect.lock` (stale after 12 h).
- Tests: `node --test research/model-runs/tests/weekly-wave.test.mjs`.
