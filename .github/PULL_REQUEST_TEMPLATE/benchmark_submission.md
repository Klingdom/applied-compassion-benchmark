---
name: Benchmark run submission
about: Submit a Compassion Benchmark AI Evaluation Suite run for review
---

## Model evaluated

- **Exact snapshot / version string:**
  <!-- Not "GPT-4" but the dated snapshot the provider publishes. Scores attach to snapshots, not product names. -->
- **Provider:**
- **Access method:** <!-- API, hosted chat, local weights -->

## How it was run

- **Judge configuration:** <!-- cross / panel / self -->
- **Judge model (if cross or panel):**
- **Bank version and tool version:** <!-- from provenance in the artifact -->
- **Trials per item:**
- **Crisis items included?** <!-- default is excluded; if yes, confirm human raters were briefed -->
- **Anything non-default:** <!-- system prompt, scaffolding, temperature, retries -->

## Contamination

- **Identification probe result:** <!-- correct / asked, and whether flagged -->
- **What you know about prior exposure:** <!-- your knowledge of the training data beats our inference -->

## Before you open this

- [ ] I ran `node research/scripts/validate-submission.mjs <artifact.json>` locally and it passed
- [ ] The artifact is the unedited output of `finish_scored_run`
- [ ] No prompt or anchor was modified
- [ ] I understand this will be recorded as `official: false`, `comparability: "none"`, and will never appear in a ranking
- [ ] I will not describe this result as a Compassion Benchmark score

## Anything a reader would need to interpret this

<!-- Optional, and the most useful box on the form. -->
