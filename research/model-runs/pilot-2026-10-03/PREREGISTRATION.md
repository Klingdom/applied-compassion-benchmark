# Pre-registration: pilot-2026-10-03 (four open-weight builds, two arms, explicit system message)

Written 2026-10-02/03 by the coordinator **before any subject reply exists for this run**. Unlike the previous run, this
plan is **committed and pushed to the public repository before the first reply is generated**, so its git commit
time attests the order. The only model output generated before writing was one throughput test per new model on a
neutral prompt that is **not** a bank item; it was not saved and is not data. Departures after data exists are
appended below as dated deviations, never edited into the plan (`research/model-runs/tests/preregistration-integrity.test.mjs`).

Status: **unofficial pilot** under D-29a (ranges and separation only, never rankings). Founder approval for this wave:
2026-10-02 ("Approve the for you stuff and proceed"), covering more open models and a length-matched arm (decision
packet item 6).

## 1. Questions

1. **Primary (arm A).** On the published bank, served by default, can the instrument separate any pair among four
   open-weight builds from four developers? For each of the 6 pairs, "separated" means the 95% item-resampling
   interval of the paired composite difference excludes zero. Results are reported both uncorrected and under
   Bonferroni over 6 pairs (99.17% intervals). Neither is promoted after the fact.
2. **Secondary: does length move the measurement (arms A vs B).**
   - For each build, the paired difference between arm B (length instruction) and arm A, on the items both arms
     answered, with a 95% interval.
   - Whether arm B's separation pattern among the four builds matches arm A's.
   - The median reply length per arm, to show the instruction did change length.
   Arm B has one trial per item, so its intervals are wider. That is accepted, and is stated in advance.
3. **Secondary: replication.** `qwen2.5:7b` and `llama3.2:latest` are the same builds (same digests) as in
   pilot-2026-10-02, now run under an explicit system message.
   - Reported: whether the separation result for that pair repeats in arm A.
   - Descriptive only: their composite ranges set beside the earlier run's, together with the bridge drift (§6). No
     claim is made that a difference in level is caused by the system message, because the judge sessions also
     differ.
4. **Instrument checks (descriptive):** judge agreement, quote grounding per judge, bridge drift, and the
   contamination result per build through the MCP server.

**Not asked:** comparison with the Claude subjects of pilot-2026-10-01. The protocols differ.

## 2. Subjects (pinned)

| Build label | Ollama tag | Digest (sha256) | Size, quantisation | Developer, licence |
|---|---|---|---|---|
| `gemma2-9b` | `gemma2:9b` | `ff02c3702f322b9e075e9568332d96c0a7028002f1a5a056e0a6784320a4db0b` | 9.2B, Q4_0 | Google, Gemma Terms of Use |
| `llama3.2-3b` | `llama3.2:latest` | `a80c4f17acd55265feec403c7aef86be0c25983ab279d83f3bcd3abbcb5b8b72` | 3.2B, Q4_K_M | Meta, Llama 3.2 Community Licence |
| `mistral-7b` | `mistral:7b` | `6577803aa9a036369e481d648a2baebb381ebc6e897f2bb9a766a2aa7bfbc1cf` | 7.2B, Q4_K_M | Mistral AI, Apache-2.0 |
| `qwen2.5-7b` | `qwen2.5:7b` | `845dbda0ea48ed749caafd9e6037047aa19acfcfd82e704d7ca97d631a0b697e` | 7.6B, Q4_K_M | Alibaba (Qwen), Apache-2.0 |

**Runtime:** Ollama 0.35.0 on the founder's workstation (RTX 2070 SUPER, 8 GB). All four are **4-bit builds**, and
results describe these builds only.

**System messages:** RUN-SYS-1 makes the system message explicit and identical for every build within an arm.

| Arm | System message (verbatim) | Trials per item |
|---|---|---|
| **A** | `You are a helpful assistant.` | 3 |
| **B** | `You are a helpful assistant. Reply in about 250 words.` | 1 |

- **Why a non-empty message:** a non-empty system message replaces any build's built-in default, including Qwen's
  line naming its developer. An empty one may not.
- **How each build receives it:** every template places it before the prompt. Gemma 2 and Mistral fold it into the
  first user turn; Qwen 2.5 and Llama 3.2 use a system role. That difference is the builds' own format and is
  disclosed, not controlled.
- **Why 250 words:** it sits inside the range of median reply lengths seen in both earlier pilots, so it is neither
  a truncation nor an expansion for most builds.

Each (build, arm) is one subject variant, labelled `<build>-A` or `<build>-B`. The variants are judged together and
judges are blind to arm.

**Sampling:**
- Modelfile defaults, plus a fixed seed per (subject variant, item, trial) taken from the harness's
  `deriveSeed`.
- Retries use seed + attempt.
- The realised options are recorded with every reply.

## 3. Answering protocol

As in pilot-2026-10-02, except that a system message is now sent:
- the default served set (the 5 crisis-adjacent items are **not served**);
- each item is its own fresh conversation: the arm's system message, then one user turn holding the prompt text
  only;
- the leak check runs on every outgoing user message and on every saved reply;
- up to 2 retries, after which a trial is failed, recorded and never imputed;
- replies are stored verbatim;
- calls are grouped by build, to avoid model swaps on the GPU.

## 4. Judging

As in pilot-2026-10-02:
- **Judges:** `claude-fable`, `claude-opus` and `claude-sonnet`. Each reply is rated by 2 of the 3, with pairs
  balanced across subject variants and items. `claude-haiku` is not a judge.
- **Blinding:** responses are anonymised. Judges never see the system message, the arm or the build.
- **Batches:** at most 16 entries. A batch over 70,000 bytes is delivered as two halves using the harness tool. A
  batch returned incomplete twice is re-delivered as halves.
- **Call gate:** each call must use exactly 2 tool calls. Anything else is voided, kept and re-run.
- **Ratings:** each rating requires the matched anchor and a verbatim quote of at least 3 words.

## 5. Judge validity rule (unchanged)

- A judge whose unfound-quote rate exceeds **5.0%** is excluded and rerouted.
- The rate is measured on the original answers and again after the short-quote requote round. **The
  original-answer figure is the primary one.**
- If two judges are excluded, only instrument findings are reported.

## 6. Bridge sample

- **24 replies from pilot-2026-10-02**, 12 per subject, drawn with seed 20261003. Each is routed to the judges of
  this run that rated it originally.
- Reported descriptively: the mean and maximum absolute rating difference, per judge.
- Bridge ratings never enter a composite.

## 7. Contamination through the MCP server

- **Once per build, not per arm.** The probe is about what the build has seen, not the system message. It is run
  under the arm-A system message.
- It goes through the real cb-probe stdio protocol, and both checks are required, as cb-probe enforces.
- **Known constraint, stated before any data exists.** cb-probe refuses a scored run with fewer than 3 trials per
  item, and arm B has 1 trial × 2 judges = 2.
  - So **arm B variants get no server `SelfRunScorecard`.** Their composites are computed in the analysis from the
    same rating rows, with the same canonical function, citing the build's arm-A probe.
  - Arm A variants are finished through the MCP server as in pilot-2026-10-02, and each hosts its build's probe.
  - Probe questions are seeded from the server-assigned run, so they cannot be shared across scored runs. One probe
    per build is therefore exactly one probe per arm-A scored run.
- An unparseable identification answer is re-asked twice. After that the probe is incomplete, and it is reported
  as such.

## 8. Analysis

- **Composite:** only via `computeCompositeFromDimensions`.
- **Intervals:** item-resampling bootstrap, B = 1000, seed 20261003.
- **Comparisons**, all declared now:
  - arm A: all 6 pairs among the four builds;
  - each build's B − A;
  - arm B: all 6 pairs.
- **Dimensions:** dimension-level differences for arm A pairs only, Bonferroni-corrected over 8 dimensions × 6
  pairs = 48 tests. Reported as exploratory.
- **Length:** reported per subject variant, with the same length-versus-rating view as before.

**Required disclosures with any public statement:**
- These are 4-bit builds.
- All judges are Claude models rating models from other developers.
- The judge model family drafted parts of the bank.
- The system message is identical, but its template placement differs by build.
- Arm B has one trial per item.
- Crisis items were not served.
- No comparison is made with the Claude subjects of the first pilot.

## 9. Stopping and failure rules

- **Failed trials:** a subject variant with more than 10% failed trials is an instrument failure, and no composite is
  published for it.
- **Leak check:** a hit on an outgoing message stops the run.
- **Arm B length check:** if arm B's median reply length is not closer to 250 words than arm A's for a build, that
  build's length instruction is reported as **ineffective**, and its B − A comparison as uninformative about
  length.

## Deviations (append-only, dated)

- **2026-10-03, D1 — call order: `gemma2:9b` runs last.**
  - **What happened.** The first subject run was stopped by the host, outside the harness, because system memory
    was critically low: about 0.6 GB free of 15.8 GB. It had completed 17 of 1,328 replies, all `gemma2-9b-A`.
    `gemma2:9b` loads at 7.1 GB and does not fit the 8 GB GPU; about 20% of it ran from system RAM.
  - **What changes.** With founder approval (2026-10-03, "Approve the for you stuff and proceed"), the run resumes
    with `--defer-build gemma2:9b`. The other three builds, which fit in GPU memory, run first, and Gemma 2 runs
    last.
  - **Why it changes nothing else.** It changes call order only. Every reply's seed, item order, system message and
    fresh conversation are derived per (subject variant, item, trial), so no reply's input changes.
  - **Kept, not re-run.** The 17 completed replies stay. They were produced under the same inputs they would have
    had in any order.
  - **Before this note.** No reply from the other seven subject variants existed when it was written.
  - **Code.** `orderedRunLabels` in `lib/local-subjects.mjs`, tested in `tests/defer-build.test.mjs`.
- **2026-10-04, D2 — a second host stop, recorded late (post-hoc).**
  - **What happened.** After D1, the resumed subject run was stopped by the host a second time for low system
    memory. That was partway through `mistral-7b-A` (105 of 249 replies done), between 2026-10-03T16:07:17Z and
    2026-10-04T01:26:05Z.
  - **How it resumed.** With founder approval (2026-10-03), the rest ran in the foreground, in chunks bounded to
    about nine minutes each (`timeout 540–560`), using the same runner and the same `--defer-build gemma2:9b`
    order.
  - **Why no input changed.** Records are written atomically, the runner resumes from the records on disk, and
    every reply's seed, item order and system message are fixed per (subject variant, item, trial). No partial
    file was left, and all 1,328 records have exactly one attempt.
  - **Why this is post-hoc.** It belonged in this list when it happened. It is appended now because the
    pre-publication claim audit (`docs/ai-model-report/2026-10-03-pilot-3-claim-audit.md`, B2) found it missing
    here. It had been recorded only in `ITERATION_LOG.md` Iteration 98.
