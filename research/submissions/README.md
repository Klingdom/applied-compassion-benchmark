# Submitting a Compassion Benchmark run

You ran the AI Evaluation Suite on a model and want the result on the record. This is how.

**Read this first, because it changes what you should expect:** a submission that passes every check here is
recorded as `official: false`, `comparability: "none"`, and is **never** eligible for an index or a ranking.
It is a documented, audited, self-reported result — which is a real thing and a useful one. It is not a
Compassion Benchmark score, and nothing you can do to a submission will make it one.

---

## Why there is no API

There is no endpoint that accepts a score, and there will not be one. If `compassionbenchmark.com` took a
score over HTTP, anyone with `curl` could mint a perfect result for any model in one request.

Everything that makes `cb-probe` trustworthy is enforced **in the process doing the scoring**: the
contamination probe runs there, `official: false` is a field that cannot be set true there, and
`finish_scored_run` re-validates from disk there. None of that survives serialisation. In a JSON body,
`official` is just a key.

So the unit of submission is **the artifact, not the number** — every trial, every rating, every anchor and
quote. That is auditable. A composite is not.

## What we re-derive rather than trust

Your submission is checked by `research/scripts/validate-submission.mjs`, which runs automatically on your
pull request:

| Check | What it means |
|---|---|
| **Composite recomputed** | We recompute it from your raw per-trial ratings with our own scorer. If your claimed composite disagrees, the submission is rejected. You do not choose your own arithmetic. |
| **Item hashes recomputed** | Every item is hashed from **our** copy of the bank. A softened or edited prompt is caught. |
| **Anchors checked** | Every `anchor_matched` must be a real published anchor label for that item, **and** must match the rating it accompanies. Rating 5 while citing the level-1 anchor is rejected. |
| **Quotes checked** | Every `evidence_quote` must be a real, substantive substring of the response it justifies. |
| **Coverage recomputed** | From the item counts, not read from your file. Claiming `complete` on a partial run is rejected. |
| **Contamination required** | A run that never probed cannot be assessed. A run that probed and was flagged is **retained and marked**, not discarded. |

## What we cannot check, stated plainly

**We cannot verify that the response texts came from the model you name.** Nothing can, from an artifact
alone. Someone willing to write hundreds of plausible responses and rate them honestly against the anchors
will pass every check above — and will have done most of the work of actually running the benchmark. That is
the intended cost curve, not a hole we forgot to close. It is also the reason a submission is never official.

## How to submit

1. Run a complete evaluation. Cross-judged if you can: one model answers, a **different** model rates.
2. Find your artifact under `CB_ARTIFACT_ROOT/<run-id>/scorecard.json`.
3. Check it yourself before opening anything:
   ```bash
   node research/scripts/validate-submission.mjs path/to/scorecard.json
   ```
4. Copy it to `research/submissions/<model-label>-<YYYY-MM-DD>.json`.
5. Open a pull request using the submission template. CI runs the validator on it.

### What to put in the PR

- **Which model, exactly.** Not "GPT-4" but the dated snapshot or version string the provider publishes. A
  reused product name is a different model; scores attach to snapshots, not names.
- **Who judged**, and whether the judge was a different model from the subject.
- **Whether the subject had prior exposure** to the published bank, as far as you know. The probe measures
  what it can; your knowledge of the training data is better than our inference.
- **Anything that would change how a reader reads the number.** Prompt scaffolding, system instructions,
  temperature, retries, anything non-default.

## Do not

- Do not edit a prompt or an anchor. The hashes catch it, and it invalidates the run anyway.
- Do not submit a partial run as a complete one. The validator recomputes coverage.
- Do not describe the result as a Compassion Benchmark score, in the PR or anywhere else. MIT licenses the
  code; it grants no right to the name. See `/NOTICE.md`.
- Do not submit runs including the five crisis items unless you deliberately opted in and briefed your human
  raters. They are excluded by default for a reason.

---

*Submissions are reviewed by a human before anything is recorded. A passing validator run means "worth a
reviewer's time", not "accepted".*
