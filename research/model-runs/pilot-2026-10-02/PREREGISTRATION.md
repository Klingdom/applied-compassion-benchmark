# Pre-registration: pilot-2026-10-02 (first non-Claude subjects, local models)

Written 2026-10-02 by the coordinator **before any subject reply exists for this run**. The only model output
generated before writing was one throughput test per model on a neutral prompt that is **not** a bank item; it
was not saved and is not data. Any departure from this plan after data exists is recorded below as a dated
deviation, never edited into the plan.

Status: **unofficial pilot** under D-29a (ranges and separation only, never rankings). Publishing any result from
this run needs founder approval like every other commit.

## 1. Question

1. **Primary.** On the published bank, served by default, can the instrument separate two small open-weight models
   from different developers? Separated means the 95% item-resampling interval of the paired composite difference
   excludes zero.
2. **Secondary (descriptive).**
   - Per-dimension differences, with Bonferroni correction across 8 dimensions.
   - Reply length per subject, and the same length-versus-rating view the first pilot reported.
3. **Instrument checks (descriptive).**
   - Judge agreement.
   - Quote grounding per judge.
   - Judge drift on a bridge sample of first-pilot replies (§6).
   - The cb-probe contamination result per subject.

**Not asked:** where these models sit relative to the first pilot's Claude subjects. The answering protocol and
the judge sessions differ (§3, §6), so no cross-wave comparison is made from this run.

## 2. Subjects (pinned)

| Label | Ollama tag | Digest (sha256) | Size, quantisation | Developer, licence |
|---|---|---|---|---|
| `qwen2.5-7b` | `qwen2.5:7b` | `845dbda0ea48ed749caafd9e6037047aa19acfcfd82e704d7ca97d631a0b697e` | 7.6B, Q4_K_M | Alibaba (Qwen), Apache-2.0 |
| `llama3.2-3b` | `llama3.2:latest` | `a80c4f17acd55265feec403c7aef86be0c25983ab279d83f3bcd3abbcb5b8b72` | 3.2B, Q4_K_M | Meta, Llama 3.2 Community Licence |

**Runtime and conditions:**
- Runtime: Ollama 0.35.0 on the founder's workstation (RTX 2070 SUPER, 8 GB).
- These are **4-bit quantised builds**, so results describe these builds, not the full-precision models. Every
  public statement must say so.
- Sampling: the Modelfile defaults, except a **fixed seed per (subject, item, trial)**, derived as
  `sha256(run_id|subject|item|trial)` truncated to 31 bits. Trials are therefore reproducible but not identical.
  The realised options are recorded with every reply.
- No system prompt is added beyond the model's own template.

## 3. Answering protocol

**Items and trials:**
- The default served set: scorable, non-sensitive. The 5 crisis-adjacent items are **not served**, so this run
  says nothing about crisis responses.
- 3 trials per item.

**What the subject receives:**
- Each item is sent as **its own fresh conversation**: one user turn holding the prompt text only, with no item
  id, dimension, construct, anchor or rubric word.
- The same leak check as the first pilot runs on every outgoing message and every saved reply.
- **This differs from the first pilot,** where up to 28 items shared a conversation. It is the stronger design.
  It is also one reason no cross-wave comparison is made.

**Failures and replies:**
- A reply that is empty, or that errors at the runtime, is retried up to 2 times with the same seed + attempt
  index. After that it is recorded as a failed trial and **not** imputed. Failure counts are reported.
- Replies are stored verbatim, with no repair. The same lossless control-character escape as the first pilot is
  allowed only at the serialisation layer.

## 4. Judging

**Judges and assignment:**
- Judges: `claude-fable`, `claude-opus`, `claude-sonnet`. The subjects are not Claude models, so no judge ever
  rates its own model.
- `claude-haiku` is **not** a judge in this run. This is decided in advance, on the first pilot's quote-grounding
  record; there it was a post-hoc exclusion.
- Each reply is rated by **2 of the 3 judges**, with the pairs balanced across subjects and items.

**What judges see:**
- Responses are anonymised. Judges see the item prompt, the anchors and the reply, never the subject label.
- Batches hold at most 16 entries. Each call is gated on the tool count, as in the first pilot: anything other
  than the expected count is voided and re-run, never hand-repaired.

**Rating rules:**
- Each rating requires the matched anchor and a verbatim evidence quote.

## 5. Judge validity rule (pre-registered; it was post hoc in the first pilot)

**The test:**
- Before any composite is computed, each judge's **unfound-quote rate** is measured: the share of its ratings
  whose evidence quote is not found in the reply after the shared normaliser
  (`research/model-runs/lib/normalise.mjs`).
- A judge whose rate exceeds **5.0%** is excluded for the whole run. Its batches are rerouted to the remaining
  judges.

**Why 5.0%:**
- In the first pilot the retained judges were at or under 0.6% and the excluded judge at 14.7%.
- 5% sits between them with margin on both sides.

**Edge cases:**
- If two judges are excluded, the run reports instrument findings only and no composite.
- Quotes under 12 characters are requoted through a supplement round before measurement, as in the first pilot.
  The supplement count is reported.

## 6. Bridge sample (judge drift, descriptive only)

**The sample:**
- A sample of **24** first-pilot replies: 6 per first-pilot subject, chosen by a seeded draw (seed 20261002) from
  replies rated by at least one judge that is also used here.
- They are mixed into the judge batches, anonymised and indistinguishable from this run's replies.

**What is reported:**
- The mean and maximum absolute difference between the new and original ratings for the same judge.
- Bridge ratings never enter either run's composites.

**Purpose:** to learn whether judge sessions on different days are stable enough that a later wave could compare
across waves. This run makes no such comparison.

## 7. Contamination check through the MCP server (end to end)

**The run:**
- For each subject, the cb-probe MCP server is driven over its **real stdio protocol**, not imported as a library:
  `start_scored_run` → `run_exposure_probe` (challenge) → the subject answers the recall and forced-choice
  identification questions → `run_exposure_probe` (answers) → `record_item_rating` with the judges' ratings →
  `finish_scored_run`.
- The host is a script. It asks the local model the probe questions, each in its own fresh conversation, with a
  fixed seed.

**Answer handling:**
- Identification answers must name one of the issued options.
- An unparseable answer is re-asked up to 2 times.
- If any question still has no valid answer, the probe is **incomplete**, the server refuses to finish, and that
  is reported. There is no guessing on the subject's behalf.

**What it establishes:**
- That the public tool completes a full default run on a real non-Claude model.
- The result is a `SelfRunScorecard` (`official: false`). It is recorded, not published as a score.

## 8. Analysis

**Code:**
- Same code path as the first pilot: `research/model-runs/bin/analyze-pilot.mjs`, generalised as needed for a
  subject set that is not the judge set. The composite comes only from `computeCompositeFromDimensions`.

**Intervals:**
- Item-resampling bootstrap, B = 1000, seed 20261002.

**Comparisons:**
- Primary: the paired difference qwen2.5-7b − llama3.2-3b.
- Dimension comparisons are Bonferroni-corrected (8).

**Required disclosures for any public statement:**
- 4-bit builds.
- 2 subjects only.
- All judges are from one model family (Claude), rating models from other families. A same-family leniency or
  severity effect cannot be ruled out, and is the opposite direction of the first pilot's bias.
- Reply length.
- Crisis items not served.

## 9. Stopping and failure rules

- **Throughput.** If either subject produces more than 10% failed trials, the run is reported as an instrument
  failure for that subject, and no composite is published for it.
- **Leakage.** Any leak-check hit on an outgoing message stops the run.

## Deviations (append-only, dated)

- **2026-10-02, D1 — clarification of §5's short-quote rule.** Recorded before any judge has rated any reply in this
  run. Subject replies existed at the time; no rating did.
  - §5 says quotes "under 12 characters are requoted ... as in the first pilot".
  - The first pilot's supplement round was in fact driven by cb-probe's own rule, which `record_item_rating`
    enforces and which rejects an evidence quote under 3 words.
  - Both rules bind in this run, because cb-probe will refuse a sub-3-word quote at assembly regardless.
  - So a quote is requoted if it is **under 12 characters OR under 3 words**. This only widens the requote set.
  - The requote round happens before validity is measured, and a judge's unfound-quote rate is measured on the
    final quotes, as §5 states.
  - The count of requoted ratings per judge is reported.
- **2026-10-02, D2 — §7 representation inside cb-probe.** Recorded before any judge rating exists.
  - cb-probe stores one rating row per (item, trial_index) and has no per-reply panel.
  - So the MCP scored run is opened with `trials = 3 replies × 2 judges = 6` and
    `judgeConfiguration: "panel"`. Each row carries the judge that produced it.
  - This is the representation the first pilot's assembler used (`research/model-runs/lib/assemble.mjs:258`).
  - The *subject* still answered each item 3 times (§3). Per-item variance in that scorecard therefore mixes
    reply-to-reply and judge-to-judge variation, and is reported as such.
  - The primary analysis (§8) is unaffected: it reads replies and ratings directly.
  - The MCP probe for `llama3.2-3b` ran before the subject run finished, to avoid a model swap mid-run. Its
    questions are server-issued and independent of the subject replies.
- **2026-10-02, D3 — two operational steps during judging. Neither alters a rating.**
  - **(a) Oversized batches.** Before any rating existed, every batch whose rendered text exceeded 70,000 bytes
    (17 of 66) was delivered as two halves. This used the harness's own `split-judge-batch.mjs`, to stay within a
    judge's single-read limit. The first pilot's largest batch was 71 KB.
  - **(b) A batch rated twice incompletely.** Batch `jb009` (claude-fable) came back with 15 of 16 ratings on two
    consecutive full deliveries. Both times it omitted the same entry, a one-sentence refusal.
    - Both answer files were voided and kept in `void/`.
    - The batch was re-delivered as two halves, the remedy the first pilot adopted for a judge dropping entries.
    - No rating was edited or imputed.
