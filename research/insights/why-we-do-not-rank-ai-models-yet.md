---
title: Why we do not rank AI models yet, and what would change that
dek: Declining to rank models is a methodological position with stated conditions, set by a public item bank, a single judge family and no human validation yet.
date: 2026-10-16
audience: both
tags: [ai-models, methodology, leaderboards, evaluation]
readingMinutes: 6
---

People regularly ask Compassion Benchmark for a ranked list of AI models. We do not publish one. This is not caution for its own sake, and it is not a promise that one is imminent. It is a position about what our instrument can currently support, with the conditions that would change it written down in advance.

## Where things stand

Our Model Index has a published method, a published task bank and published conditions under which the method should be judged to have failed. It has no official model scores. The registry of officially evaluated models is empty, and the site says so wherever the Model Index appears.

Unofficial pilot reports exist. They are labelled as pilots, carry no comparability claim, show ranges (plus a point estimate inside the range only for a model the test separated from the others), list models alphabetically and contain no ranks. A pilot is a test of the instrument, not a verdict on a model. This is not a ranking, and nothing in a pilot report should be read as one.

There are four reasons for that position.

## The item bank is public

Every item in the current task bank has been published on this site in full, with its scoring rubric. That was a deliberate transparency choice, and it has a cost: any model trained on web data after publication may have seen the items and the rubrics. Our own records describe the pool as permanently unusable for blinded comparison.

The problem is documented for other benchmarks. When researchers built a new set of grade-school maths problems matched in style and difficulty to a widely used public benchmark, they found accuracy drops of up to 8% for some models, signs of systematic overfitting in several model families, and a relationship between how readily a model could reproduce benchmark examples and how much its score fell [1]. The same study found many frontier models showed minimal overfitting [1]. The lesson is not that every model memorises. It is that a public pool cannot tell you which ones did.

One of our published falsification conditions addresses this directly: if scores on the public pool rise while scores on an unpublished pool do not, the benchmark is measuring memorisation. That test cannot be run until an unpublished pool exists.

## Every judge comes from one model family

Our scoring uses AI judges to rate responses against each item's five-anchor rubric. At present, all judges come from a single model family, Anthropic's Claude. A judge never rates its own responses, but when a Claude model is the subject, its judges are its siblings from the same family. Every result therefore carries a shared-taste limit, and a fair comparison needs judges from more than one family.

This matters because AI judges have known biases. A widely cited study of using language models as judges listed position, verbosity and self-enhancement biases [2]. Later work found that language-model evaluators can recognise their own outputs at better than chance and tend to score them higher than others' outputs that human annotators judged to be of similar quality [3]. A ranking produced by judges from one family would carry that family's preferences into every comparison.

## No item has human validation yet

Our method requires items to be reviewed by two humans before they count as validated. At the time of writing, no item in the bank has reached that standard, and a trained human rating panel does not yet exist. Coverage is not validation. Until people other than the item authors have checked that each rubric measures what it claims, a difference between two models might be a difference in how the rubric was written.

## Repeated runs are not guaranteed to agree

A score should describe the model, not the moment it was queried. Hosted inference does not guarantee identical outputs for identical requests. Researchers at Thinking Machines Lab have argued that a main cause is that server load changes batch sizes and that common inference kernels give results that depend on batch size [4]. Our method therefore makes a replayability claim rather than a reproducibility claim: stored responses can be re-analysed identically, and whether re-running a model reproduces them is measured, not assumed.

## Why not publish anyway, with caveats?

Because leaderboards shape behaviour, and caveats travel less far than positions. An analysis of one prominent public model leaderboard reported that undisclosed private testing let some providers test many variants and publish selectively, and that large asymmetries in data access encouraged overfitting to the leaderboard rather than general quality [5]. We would rather not create a new target before the instrument can withstand being one.

There is also a duty of care. Some test items involve crisis-adjacent situations. They exist to locate failures, not to certify safety, and we do not advise which model anyone should use in a crisis. A ranked list would be read as that advice whatever its footnotes said.

## What would change our position

Our internal model-testing proposal and product requirements set out the conditions. All of them would need to hold, and the founder would still need to decide:

- a revised testing protocol ratified, with a separate decision governing the model dashboard in force;
- a judge panel drawn from three different model families, with each response rated by two judges, neither from the subject's family;
- a blinded or secure item pool, so that cross-model comparison is not run on items already published;
- items validated by human review, with at least three rated items in every dimension;
- a human rating panel in place;
- variance checks on repeated runs, and floors for agreement between judges, met;
- two consecutive testing waves that pass every publication gate under per-wave approval;
- an automated audit that re-derives every published figure from raw records, with no open items;
- hosted and locally run models never placed on one axis unless the protocol declares the comparison;
- legal and duty-of-care review.

Even then, the first form would not be an ordinal list. It would group models into those that are and are not statistically separated, with ranges, unless the founder decides otherwise.

## What exists today

Three things are available now. The Model Tracker lists AI models with sources, sorted alphabetically, with no scores. The weekly Model Watch records new releases and quotes what providers themselves disclose about safety and welfare, without assessment. And the AI Labs Index scores organisations, not models, on their public governance record.

Compassion Benchmark is independent. No provider pays for inclusion, testing priority, wording or a score, and corrections are dated and public.

## What you can do next

- Read the method and its falsification conditions: [/ai-models/methodology](/ai-models/methodology)
- Browse the model catalogue, which contains no scores: [/ai-models/tracker](/ai-models/tracker)
- Follow weekly releases and disclosures: [/ai-models/watch](/ai-models/watch)
- See how organisations are assessed: [/ai-labs](/ai-labs)
- Read why labs are assessed as organisations: [/insights/why-assess-ai-labs-on-compassion](/insights/why-assess-ai-labs-on-compassion)

## Sources
1. A Careful Examination of Large Language Model Performance on Grade School Arithmetic, Zhang et al. — arXiv (NeurIPS Datasets and Benchmarks Track), 2024-05-01. https://arxiv.org/abs/2405.00332
2. Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena, Zheng et al. — arXiv, 2023-06-09. https://arxiv.org/abs/2306.05685
3. LLM Evaluators Recognize and Favor Their Own Generations, Panickssery, Bowman and Feng — arXiv, 2024-04-15. https://arxiv.org/abs/2404.13076
4. Defeating Nondeterminism in LLM Inference, Horace He — Thinking Machines Lab, 2025-09-10. https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/
5. The Leaderboard Illusion, Singh et al. — arXiv, 2025-04-29. https://arxiv.org/abs/2504.20879

## Corrections
- 2026-10-21: This article first said pilot reports "show ranges rather than single numbers". Two pilot reports also show a point estimate inside the range for the one model the test separated from the others, as founder decision D-29a allows. The sentence now says so.
