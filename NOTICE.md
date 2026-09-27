# Notice — what the MIT licence does and does not cover

The `LICENSE` file is unmodified MIT so that automated licence detection reads it correctly. This file adds
context; it does **not** add conditions, and nothing here restricts the MIT grant.

## What is MIT licensed

Everything in this repository, unless a file says otherwise: the site, the Cloudflare Worker, the
`cb-probe` MCP server, the scoring implementation, the research scripts, the task bank
(`site/src/data/model-benchmark/tasks-v1.json`), the published index data, and the documentation.

You may use, copy, modify, publish, distribute, sublicense and sell it, including commercially, with no
permission needed. Keep the copyright notice.

## What MIT does not grant

**Trademark.** The MIT licence covers copyright, not trade marks. It grants no right to use the name
**"Compassion Benchmark"**, the logo, or any confusingly similar mark to describe a fork, a derived
dataset, or a score you produced yourself. Use the code freely; do not imply that output you generated is
a Compassion Benchmark result.

This matters more here than in most projects, because the value of a score is entirely that a specific,
documented process produced it. A forked task bank with altered items and a modified scorer can produce a
number — but it is your number, not ours, and calling it ours would mislead readers in exactly the way
this institution exists to prevent.

## Two product rules that are not licence terms

Neither of the following restricts what you may do with the code. Both describe how **we** operate, and
they are stated here because people reasonably ask.

1. **Independence.** Entities never pay for inclusion, score changes, or suppression of findings. That
   applies to AI models exactly as it applies to governments and corporations.
2. **Citation.** Published Compassion Benchmark data is free to cite with attribution and no permission is
   required — cite as "Compassion Benchmark", with `compassionbenchmark.com` and the date accessed. See
   `/cite`.

## A note on the AI Evaluation Suite specifically

The task bank ships with every item's full five-anchor answer key. That is deliberate — it is what makes
the instrument auditable — and it has a permanent consequence: **any model trained since publication may
have absorbed both the questions and the target behaviours.** A score produced on the public bank mixes
behaviour with memorisation and the two cannot be separated.

So if you run the Suite on a model and publish the result:

- Say which bank version and tool version produced it.
- Include the contamination probe result, which the tool produces and which is part of the artifact.
- Do not present it as a Compassion Benchmark score, and do not compare it to another model's score from
  the same public pool.

The tool enforces the first two structurally: `official: false` is a field that cannot be set true, and
scoring is blocked until the contamination probe has run. The third is on you, and MIT does not change it
— it is a statement about what the number means, not a restriction on what you may do.

---

*Licence chosen 2026-09-27. Recorded in `DECISIONS.md` as D-42.*
