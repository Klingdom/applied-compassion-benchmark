# UX flows: operating the AI model evaluation (operators, not the public site)

**Date:** 2026-10-22. **Author:** ux-designer. **Status:** DESIGN (internal, D-60). It changes no protocol, data, score, page or decision.
**Users:** the **founder** (approver, one Friday reply per week, D-59 C-FD-2), the **coordinator** (agent that runs a wave), the **reviewer** (human who reads results before the founder is asked).
**Cites:** `RB` = `.claude/commands/weekly-model-wave.md`; `WW` = `.claude/commands/weekly-ai-model-watch.md`; `RM` = `research/model-runs/README.md`; `V2` = `docs/MODEL_TESTING_V2_PROPOSAL.md`; `CP` = `docs/AI_MODEL_WEEKLY_CYCLE_PLAN.md`; `FP` = `docs/FOUNDER_DECISION_PACKET_2026-10-23_FRIDAY.md`; `CA` = `docs/ai-model-report/2026-10-03-pilot-3-claim-audit.md`; `P3` = `research/model-runs/pilot-2026-10-03/`.
**Not built:** anything named `proposed` below. A tool I name does not exist unless a file path proves it. No weekly wave has run (`CP` line 184), so every "measured" figure is from the runbook text or pilot-3.

## 1. Current operator journey: one new model, release to approval packet

Scope: a new open-weight build is released, tested in a weekly wave, and the founder is asked to ship it. Counts are from the runbook text. A "command" is one `node`/`git`/`ollama` invocation the coordinator must type; judge dispatches are counted separately because they dominate.

| # | Stage | What the operator does | Commands | Cite |
|---|---|---|---|---|
| 1 | Learn of the model | Run the Watch edition (research, fact-check, import, compile, build, test), then hand-edit `QUEUE.json` | 9 npm/node (import dry-run, import, `--check`, validate, compile, build data, validate, build, test) + 1 manual edit | WW 22-33; CP 80, 104 |
| 2 | Status | `weekly-wave.mjs status`; exit 3 is reported to the founder first | 1 | RB 25-28 |
| 3 | Ratify protocol (if `proposed`) | Founder edits `PROTOCOL.json` and commits | 0 (founder) | RB 42 |
| 4 | Plan | `plan --dry-run`; founder pulls the model; `plan`; `check` | 3 + 1 `ollama pull` | RB 46, 50, 54, 59 |
| 5 | Commit plan | Stop; founder approves; `git add` + `git commit` | 2 | RB 58 |
| 6 | Collect | Scheduler, unattended. Operator waits | 0 | RB 11, 35 |
| 7 | Judge prep | `ingest-answers`, `build-judge-batches` (dry-run, then real), stage outside repo as `jbNNN`, split any batch over 70 KB | 3 + 1 conditional + manual copy/rename | RB 65 |
| 8 | Judge | One fresh subagent per batch, each exactly 2 tool calls, count read from the completion notice | **about 75 per wave (V2 R1); 185 in pilot-3** (176 accepted + 9 voided) | RB 66; CA row 39 |
| 9 | Validity, requote, supplement | `judge-validity`, `reroute-judges --requote`, judge new batches, `--supplement`, judge, `judge-validity` again | 4 + more judge dispatches | RB 67-68; RM 139-149 |
| 10 | MCP probe | `run-mcp-probe --phase probe`, answer briefs with subject-side calls (one per build), `--phase finish` | 2 + one call per build | RB 69 |
| 11 | Analyse | `analyze-pilot`, `status` (anchor verdict), `export-wave`, draft report | 3 + 1 manual draft | RB 70-72 |
| 12 | Audit | Re-derive every figure from raw files, append `D<n>` deviations, `check` again | 1 + manual | RB 73 |
| 13 | Packet and approve | Write one packet; founder approves; `git add`/`commit` results; edit `QUEUE.json` to `measured`; publish needs a further approval | 2 git + 1 edit | RB 77-86 |

**Totals (one wave, one or two new models):**
- **Commands:** 18 harness + 1 `ollama pull` + 4 `git` + 2 manual `QUEUE.json` edits = **25**, plus 1 optional `node site/scripts/test-model-runs.mjs` (RB 20), plus 9 for the Watch edition.
- **Judge dispatches:** 75 (planned) to 185 (pilot-3 actual), each with a tool-use gate. This is the bulk of the work.
- **Documents to read before acting:** RB (92 lines), RM (287), `PROTOCOL.json` (50), `QUEUE.json`, `AI_MODEL_ASSESSMENT_TEMPLATE.md`, the pilot-3 audit as procedure (123+ lines), `PREREGISTRATION.md` (181). That is **7 documents, about 800 lines**, with RB sending the reader into 4 RM sections (RB 63).
- **Founder approvals:** **5** (ratify, pull, plan commit, results commit, publish) per `V2` R5 (line 21) and `CP` line 141, plus 1 for the Watch edition (WW 34). Under D-59 the Friday reply folds some of these; the plan commit still comes mid-week (see 3d).
- **Handoffs:** coordinator to founder 4-5 times; scheduler to coordinator 1; coordinator to N subagents; coordinator to an audit pass 1.

## 2. Pain points and where errors are likely

| # | Pain point | Evidence | Likely error | Fix in section |
|---|---|---|---|---|
| E1 | **Two conflicting procedures in RM.** The top "Runbook" (RM 207-251) is the pilot-1 flow: `--batch-size 40`, `assemble-run`. RB says batch size 16 and RM itself says `assemble-run` refuses arms runs. | RM 229, 184 vs RB 65 | Operator copies the stale block; assembles an arms run; batches are the wrong size. | 3b: one linear runbook, stale block marked |
| E2 | **README is chronological, not procedural.** Sections are ordered by "added" date. The weekly flow touches 4 of them in a different order. | RM 58, 83, 121, 151, 189; RB 63 | Step skipped (for example re-measuring validity after requote, RM 144-145). | 3b |
| E3 | **"Tool-less" and "exactly two tool calls" read as contradictory.** One means no repo access; the other means one `Read` and one `Write` of the batch file. | RB 66; RM 30-31, 66-70 | A judge is given real file access, or a valid call is voided. | 3b: one sentence defining both |
| E4 | **Manual staging with neutral names** (`jbNNN`, no "benchmark"/"compassion" in any path). | RB 65 | A leaking path reaches a judge. The harness checks only text it writes (RM 285-286). | 3b: staging is a checked step |
| E5 | **No progress view while judging.** `status` has one `judging` phase; the ledger TSV exists but is not surfaced. | RB 37; `P3/operations/judge-batches.ledger.tsv` | Operator cannot answer "how far along". Void batches are lost in the count. | 3b, 4 |
| E6 | **Voids are common and under-reported.** 9 of 185 calls (4.9%) were voided; the report draft omitted them. | CA row 39 | A reviewer sees 171 clean batches and trusts a number that hides 14 non-clean files. | 3c section 3 |
| E7 | **Deviations are logged by memory.** The second host stop in pilot-3 was missed in the plan's deviation list. | CA B2; `P3/PREREGISTRATION.md` 168-180 | Published process looks stricter than it was. | 3b: deviation capture is a step; 4 |
| E8 | **Automatic checks can be wrong and nobody is asked to look.** The self-identification scan reported 14 replies; the true count was 1 (substring match on `google`, `meta`, `llama`). | CA B1 | A confound story pointed at the wrong build. | 3c section 7 |
| E9 | **The review is 3,150+ lines of JSON.** `analysis.json` has 25 top-level sections; the useful figures are scattered; the audit row for B1 is one table cell of about 3,000 characters. | `P3/analysis.json` (keys end at line 3151); CA row 17 | A reviewer reads either everything or nothing. | 3c |
| E10 | **Friday packet needs lookups.** Items cite IDs (`C-FD-2`, `V2 ask 1`, `M-FD-5`), and pathspecs live in another file. The "not in this packet" list names 8 IDs with no explanation. | FP 18, 74-78 | Founder says "defaults" without knowing what a default does. | 3d |
| E11 | **A deferred collect has no operator action.** `collect-deferred` says "wait", but the host had 0.72 GiB free against 6.57 GiB needed and the task was not registered. | RB 35; V2 R3 (line 17) | The wave sits for days with no one told what unblocks it. | 4 |
| E12 | **Conflicting host rules between runbooks.** RB forbids `npm test` and builds in the wave session (line 20); WW requires `npm run build` and `npm test` (line 33). | RB 20; WW 33 | Out-of-memory kill mid-wave (`CP` line 120 notes one). | 3b: ordering rule |
| E13 | **Plan-before-data is proved only by a commit, and the plan cannot be real until the model is pulled.** Pull, plan and commit are three separate waits. | RB 50, 57-58 | A week lost to one unanswered question (`V2` line 25). | 3d: pre-authorise |

## 3. Target flows

Design rules: one place to look; every stop has a default; no step needs a second document; a gate that fails removes an item from the ask instead of adding a question.

### 3a. Intake: "new model released" to "in queue"

**Entry:** the weekly Watch edition (WW) lists a release. **Owner:** coordinator. **Output:** an intake card, then one Friday line. **No ranking effect:** a release makes a build *eligible*; it never moves it up (`CP` line 30; `QUEUE.json` selection rule).

**Intake card** (proposed `research/model-runs/weekly/intake/<tag>.md`, or the output of W-2 `CP` line 176; the same fields fit a `QUEUE.json` entry):

| Field | Source | Rule |
|---|---|---|
| `tag`, `developer`, `family`, `identity_terms` | Watch release row (primary source) | `QUEUE.json` entry shape |
| `approx_size_gb` | Ollama library page, opened this session | Above `max_model_size_gb` 6.0: **not eligible**, reason printed |
| `licence` | Model card | Non-commercial: **held** until counsel (M-FD-5) |
| `thinking_traces` | Model card | Yes (for example `qwen3`): **held** until the M-FD-6 harness change; default keep trace, never show judges |
| `already_measured_developer` | `QUEUE.json` | Decides order by the written rule, nothing else |
| `source_url` | Watch row | Required; `null` means do not queue |

**Flow:** release in Watch (1) card drafted with all six checks (2) result is one of `queue`, `held (reason)`, `not eligible (reason)` (3) one line in the Friday packet, default yes for `queue` only (4) on approval, one `QUEUE.json` edit adds `queued`. **Steps for the coordinator: 2 (draft card, edit queue). Founder: 0 extra, one line in the existing reply.**
**Error states:** unverifiable size shows `unknown` and routes to `held`; a tag that Ollama cannot resolve shows `tag not found: check spelling, do not guess`.

### 3b. Weekly wave, run by the coordinator

**Principle:** `weekly-wave.mjs status` already prints `Phase` and `Next` (RB 29). The runbook becomes one table keyed by phase. The coordinator reads one document and does not open RM.

| Phase | Coordinator does | Done when | Stops for |
|---|---|---|---|
| any | `status`; exit 3 is the first line of the next message to the founder (RB 28) | phase known | none |
| none / `analysed` + week passed | `plan --dry-run`; put picks, call count, memory line, pull list in the packet | picks listed | none |
| `planned-uncommitted` | after the pull is approved: `plan`, `check` (must say OK), commit the exact 3-file pathspec | commit exists | the Friday line (3d) |
| `planned`, `collecting`, `collect-deferred` | nothing; read `operations/collect-status.json` and say what is blocking | n/a | see 4 |
| `collected` | **Judge prep:** `ingest-answers`, `build-judge-batches` (batch size 16), stage as `jbNNN`, run a leak scan on the staged folder, split over 70 KB | batch count printed | none |
| `judging` | Dispatch; after each call, record `tool_uses`; `2` accepted, anything else voided and re-run. Print `accepted/total, voided` after each batch (reads the ledger) | all accepted | none |
| `judging` (validity) | `judge-validity`; then `--requote --min-quote-chars 12`, judge, `--supplement` once, `judge-validity` again | verdict `valid`, or 4/5 handled per section 4 | none |
| `judging` (probe) | `run-mcp-probe` probe, subject-side answers, finish | all builds have a probe | none |
| `judged` | `analyze-pilot`, `status` for the anchor verdict, `export-wave`, draft from the template | analysis, wave file, draft exist | none |
| `analysed` | Claim audit; append any deviation to `PREREGISTRATION.md` as a dated `D<n>` (pre-registered or post-hoc); `check` | audit open items = 0, or listed | none |
| `analysed` | Build the review packet (3c) and the Friday packet (3d). **Stop.** | both written | founder |

**Ordering rule (E12):** no `npm run build` or `npm test` while a model is loaded or during the 02:00 collect window; run them in daytime after collect finishes.
**Deviation capture (E7):** at every `status` that is not `ok`, the coordinator writes one line to `operations/deviations.draft.md` (time, event, pre/post-hoc). Appending to `PREREGISTRATION.md` is the audit step; the draft stops a stop from being forgotten.
**Stale block (E1):** the RM block at lines 207-251 is labelled "pilot-1 only; weekly waves use RB" (proposed edit to RM, backend-engineer).

**Step counts for this flow**

| Measure | Before (measured) | After, docs only | After, with proposed tooling |
|---|---|---|---|
| Documents read | 7 (about 800 lines) | **1** (the phase table) | 1 |
| Commands (coordinator) | 25 (+9 Watch) | 25 | **6**: `status`, `plan`, `judge-prep` (ingest, batches, stage, leak scan), `judge-check` (validity, requote, supplement, loop), `finish` (probe, analyse, export, audit), `packet` |
| Judge dispatches | 75-185 | 75-185 | 75-185 until the V2 API judge exists (V2 item 5) |
| Founder approvals per week | 5 + 1 | **1** (Friday reply, D-59) | 1 |
| Founder stops mid-week | 3 (pull, plan commit, results commit) | **1** (plan commit, see 3d) | 0 if V2 ask 3 is granted |
| Handoffs | about 5 + N subagents | 3 (founder, scheduler, reviewer) + N | same |

Tooling needed for the right-hand column: `wave-ready.mjs` (V2 item 1), `audit-wave.mjs` (V2 item 3), the packet generator W-5 (`CP` line 179), and three small wrappers. None is built.

### 3c. Results-review packet (what a human reviewer reads)

**Purpose:** let a reviewer decide *accept / accept with changes / hold* in about 30 minutes, without opening `analysis.json`. **File:** `research/model-runs/wave-<date>/REVIEW_PACKET.md` (proposed; generated from `analysis.json` and `operations/*`, numbers never typed). **Length:** two screens plus the sample.

**Withheld (D-29a, D-29, and blinding), always:**
- ranks, sorting by result, "best/worst", band labels or colours on models (D-29a item 3); models are **alphabetical**, "Not separated" first (item 4);
- a bare point score in any heading, title or summary cell; a point appears only as a tick inside its 95% range;
- any cross-wave or cross-lab comparison; "which model to use" language (`DUTY_OF_CARE`, `CP` line 29);
- `keys/` contents, judge identities per rating until step 7's blind read is recorded, and qwen3 thinking traces (M-FD-6);
- the text of the five crisis items (not served, `CP` line 29): shown by id only.

**Template (sections in reading order):**

```
# Review packet: <wave-id>   (UNOFFICIAL PILOT: not a score, comparability none)
Reviewer: ____  Date: ____  Time spent: ____
1. VERDICT STRIP (one line each; PASS / FAIL / OPEN)
   Plan before data | Calls complete | Judge validity | Anchor (comparable?) |
   Audit open items | Leak and blinding | Deviations (count)    -> READY / HOLD <reason>
2. WHAT WAS RUN
   Subjects: tag + digest + arm. Calls planned/ok/failed (operations/collect-status.json).
   Plan commit <sha> + time vs first record time. Protocol version + status.
3. HOW THE JUDGING WENT (the part reports leave out)
   Batches accepted / voided (count, reason) / requoted (count, changed value) / supplement.
   Judge unfound-quote rate per judge vs 5%. Exclusions and reroutes.
4. DEVIATIONS (D1.. each: what, when, pre-registered or post-hoc, inputs changed? yes/no)
5. RESULTS (alphabetical; "Not separated" group first)
   Per subject: 95% range with tick, per-dimension ranges, judge exact agreement, failed trials %.
   Reference build this week vs prior weeks (instrument stability, no model claim).
   Anchor: mean abs drift vs 0.30, pairs exact; verdict.
6. KNOWN CONFOUNDS (fixed text list: reply length, arm, quantisation scheme, size, public pool,
   Claude-only judges) next to any separated figure.
7. SAMPLE TO READ (blind first)
   Per subject, 5 replies: 1 random, 1 lowest judge agreement, 1 requoted-with-changed-value,
   1 longest, 1 flagged by the self-identification scan. Reviewer reads item + reply, writes own
   1-5 and a one-line reason; THEN the two judge ratings and quotes are revealed.
   Table: item id | reviewer | judge 1 | judge 2 | quote found? | note
8. AUTOMATED CHECKS TO DOUBT (E8): self-identification hits listed with the matched text
   (reviewer marks real / product name / false); phrase-echo hits likewise.
9. CLAIM AUDIT: open items by severity (blocker / should-fix / nit), each with file and line.
10. DECISION: [ ] Accept  [ ] Accept with changes (list)  [ ] Hold (reason)
    Anything not reproducible from the files named in section 2 is a blocker.
FILES: paths only (analysis.json, judge-validity.json, ledger, PREREGISTRATION.md).
```

**What the reviewer can do:** mark a check as wrong; request a re-judge of up to N entries (coordinator runs it; counts as a deviation); hold the wave. **What happens next:** `Accept` or `Accept with changes` moves the wave into the Friday packet (3d) with the reviewer's name and date; `Hold` removes it from the ask and the edition still ships (`CP` line 199).
**Assumption:** the reviewer is a person. Agents may prepare but may not author the reviewer's section 7 ratings or section 10 decision (`CP` line 328; `item-reviews-v1.json:15` forbids agent-authored reviews).

### 3d. Friday one-reply approval

**Principle:** at most six lines (Meta-review 13 §6, FP line 3); every line has a default; a line whose gate failed is printed under **NOT ASKED** and cannot be approved by "defaults". Each line is self-contained: the pathspec is in the packet, not in another file (E10).

**Template**

```
# Friday reply: <date>   Reply "defaults", or e.g. "defaults except 3: no", or "3: <text>".
Silence = nothing is committed, pushed or deployed.
A. SHIP the Model Watch edition <date>        default: YES   cost of delay: dated lead ages
   Gates: build exit 0, tests exit 0, validate 0 failures.
   Pathspec: <exact pathspec in a copyable block>
B. SHIP wave <wave-id> (unofficial pilot)      default: YES   offered only if every gate is PASS
   Reviewer: <name, date, decision>  Verdict strip: 7/7 PASS  Deviations: n (post-hoc: n)
   Pathspec: research/model-runs/<wave-id>/ site/src/data/model-benchmark/waves/<wave-id>.json <report>
   Queue change: <tag> -> measured.  Manifest entry decision_status: active.  Then deploy.
C. PREPARE next wave                            default: YES
   Pull: ollama pull <tag> (<size> GB; free disk <n> GB). Then plan, check, and commit exactly
   research/model-runs/wave-<next>/{run-config.json,PREREGISTRATION.md,weekly.json} if check says OK.
   Picks from the written rule: <tag>, <tag>. Dry-run output attached.
D. ADD TO QUEUE: <tag> (size, licence)          default: YES   Held: <tag> (reason).
E. CORRECTIONS to publish (dated, append-only)  default: YES   <list or "none">
F. CARRIED DECISION (max 1-3 per packet)        default: <stated>   <one sentence + consequence>

NOT ASKED THIS WEEK: B (judge validity FAIL: two judges failed; instrument findings only) ...
After your reply I will: <ordered list of actions, 5 lines max>.
```

**Mid-week stop removal (E13):** line C asks for the pull and the plan commit *by file set*, because the plan is a deterministic function of `QUEUE.json` and `PROTOCOL.json` and the dry-run output is attached. The coordinator commits only if `check` says OK and the pathspec matches. **Assumption needing founder confirmation:** approving a commit by file set, not by content, is acceptable under AUTONOMY §1b. If not, the plan commit stays one mid-week approval until V2 ask 3.
**Reply parsing:** `defaults` approves every line printed above NOT ASKED. A struck line (`3: no`) is dropped. Free text on a line is treated as an instruction for that line only. Anything ambiguous is not done and is asked again in the next packet.
**After the reply:** the coordinator posts a one-line receipt per line (done / not done / blocked), then runs the V7 live check for A and B (`FP` line 22).

## 4. Empty, partial and failure states

Rule for every state: the coordinator's first line to the founder names the state, what is *not* affected, and the one default action. The Watch edition ships regardless of wave state (`CP` line 96).

| State | Detected by | Operator sees | Coordinator does | Founder asked? |
|---|---|---|---|---|
| **No eligible queued build** (all measured, oversize, held) | `plan --dry-run` returns no picks | "No picks: 0 eligible, n held (reasons)" | No wave. Packet says so. Intake (3a) is the only action | Line D only |
| **Protocol still `proposed`** | `status` says `proposed`; real `plan` refuses (RB 42) | "Wave refused: protocol <ver> not ratified" | Dry-run only; attach what `PROTOCOL.v2` still needs (`FP` item 4) | Carried line F |
| **Pick not pulled** | `plan` lists `ollama pull <tag>` | Pull command, size, free disk | Waits for line C | Line C |
| **Wave incomplete: collect deferred** (exit 5, low memory) | `collect-status.json`, `Last collect` | "Deferred: <n> GiB free, <m> GiB needed" | Report once; say "close heavy apps on run night"; do not retry by hand | Only if three nights in a row |
| **Wave incomplete: collect failed** (exit 3) | `status` exit 3 | `stderr tail` plus count of ok/total calls | Report first (RB 28); no retry without the founder (RB 36) | Yes, one line: retry or drop |
| **Wave incomplete: stale lock** | `collect.lock` older than 12 h (RB 91) | "Lock from <time> is stale" | Report; the founder or the registered task clears it | Yes |
| **Failed trials over 10%** for a variant | `analysis.json` / prereg §9 | "<variant>: instrument failure, no composite" | Packet shows the variant under "No result: instrument failure"; others unaffected | No (informational) |
| **Judge answers incomplete** | `tool_uses` is not 2, or file missing/invalid | Batch shown as `void` with count so far | Keep file in the void folder, re-run (RM 70) | No |
| **Judge invalid, one judge** (validity exit 4) | `judge-validity.json` | "<judge> unfound-quote rate x% > 5%" | Exclude and reroute (`--exclude-judge`), judge the new batches, re-measure | No; shown in packet section 3 |
| **Judge invalid, two or more** (exit 5) | same | "Two judges failed: no composite" | Instrument findings only; wave goes under NOT ASKED | Informational |
| **Drift over threshold** | `status` prints `NOT COMPARABLE`; `bridge_drift` mean above 0.30 | "Anchor drift 0.xx > 0.30: not comparable" | Wave is still reviewed and may ship **labelled not comparable**; never compared with earlier weeks (RB 71). Check the reference build and judge exclusions before blaming judging | Line B states the label; ship stays the founder's choice |
| **Audit open items** | claim audit | Blockers listed with file and line | Fix through the build step, not by editing text; re-audit; if unresolved, wave goes under NOT ASKED | No |
| **Leak check hit** (outgoing message) | harness | Run stopped; offending term | Stop; report as incident; delete output per RM 15 | Yes |
| **Packet unanswered by next Friday** | no reply | Same packet, "second week" tag, with newer items on top | Do nothing mutating; do not stack waves past `max_new_subjects_per_wave` | Re-ask once, then stop |

**Loading and success feedback for the coordinator (text only):** every command ends with a final line `OK <what>` or `REFUSED <why>` plus the exit code meaning (RB 90). Judging prints `accepted a/total, void v` after each batch. A finished wave prints the three paths the founder will see: review packet, Friday packet, pathspec.

## 5. Handoff notes

- **QA:** each section 4 row is a fixture (planted `tool_uses != 2`, a judge at 5.1%, drift 0.31, stale lock, deferred collect); expected text is the "Operator sees" cell.
- **Backend:** W-5 packet generator, `wave-ready.mjs`, `audit-wave.mjs`, review-packet generator, 3b wrappers, W-2 intake report, whole-word self-identification fix (CA B1). **Docs:** replace RB sections 3-4 with the 3b table; mark RM 207-251 pilot-1 only; settle E3 in one sentence.
- **Founder confirms:** approval by file set (3d); reviewer identity (BLK-005: no human panel yet, so the packet names the reviewer).
