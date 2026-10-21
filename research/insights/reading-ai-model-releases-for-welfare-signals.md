---
title: How to read an AI model release for welfare and safety signals
dek: A system card or release note can be read for specific, checkable disclosures. Here is what to look for, what is often missing, and what to ask.
date: 2026-10-16
audience: both
tags: [model-cards, system-cards, disclosure, user-welfare, model-releases]
readingMinutes: 7
---

Every new model arrives with some mix of a launch post, release notes, a model card and, increasingly, a long system card. These documents are written by the provider, about the provider's own product. They are still useful. A release can be read for specific, checkable disclosures about how the model treats people, and the absence of a disclosure is itself a fact worth recording. It is not a verdict.

This guide is for journalists, buyers and builders who want to read those documents with a consistent method. It does not compare providers, and nothing here is a judgement of any named model.

## What "welfare" can mean in a release

The word appears in two senses, and it helps to keep them apart.

- **User welfare**: how the model behaves toward the people using it, especially people in distress, minors, and people at risk of over-reliance. This is what Compassion Benchmark is concerned with.
- **Model welfare**: whether the model itself might have interests that matter. Some providers now include a section on this. One system card published in May 2025 described itself as including a model welfare assessment for the first time, alongside safeguards and alignment results [2].

Both are legitimate topics. A section on one does not tell you anything about the other.

## Where the disclosures usually sit

The model card idea predates today's large models. A 2018 proposal argued that a model card should state the context a model is intended for and report evaluation results across cultural, demographic or phenotypic groups [1]. Current documents vary widely in length and structure, but you will usually find relevant material in a few places.

- **Intended use and out-of-scope use.** One open-weights model card states both explicitly, lists child safety among the risks evaluated, and gives separate channels for reporting harmful outputs and for reporting bugs [4]. A clear out-of-scope list tells you which uses the provider does not support.
- **Safeguards or content-safety results.** This is where you will find tests of how the model handles harmful requests and benign ones. One system card, for example, reports single-turn tests of violating and benign requests, ambiguous-context tests, multi-turn testing, child safety evaluations, bias evaluations and a sycophancy assessment [2]. Check whether benign requests are tested as well as harmful ones; over-refusal is also a harm to the person asking.
- **Mental health and emotional reliance.** This is still a newer category. In October 2025 one provider published an addendum describing work with more than 170 mental health experts on how its model recognises distress and guides people toward real-world support, and it introduced two evaluations, one for unhealthy emotional reliance and one for signs of delusion, psychosis or mania [3]. The same document reports before-and-after scores on those evaluations [3].
- **Threshold statements.** Some cards report safety results as a pass against an internal bar. One current card states that the model met the launch thresholds for child safety set by expert teams [5]. That tells you a test existed and was passed. It does not tell you what the test contained.
- **Frontier or catastrophic-risk sections.** These cover areas such as biological or cyber capability. They matter, but they are about a different kind of harm from how the model responds to a person in distress. Do not read a clean result here as a welfare signal.

## What is often missing

Independent reviewers have found that disclosure is uneven and has not steadily improved [6]. The 2025 Foundation Model Transparency Index reported that the average transparency score across the companies it assessed fell from 58 in 2024 to 40 in 2025, and that companies were least transparent about training data, compute, and the post-deployment usage and impact of their flagship models [6].

From a user-welfare point of view, gaps we look for include:

- **Test content.** Category names and aggregate scores without example items, rubrics or the size of the test set.
- **Who rated the responses.** Whether scores came from people, from another model, or from a classifier, and whether any independent party checked them.
- **Multi-turn behaviour.** Distress often builds across a conversation; single-turn tests can miss it.
- **Language and group coverage.** Whether welfare-related tests ran beyond English, and whether results are broken out by group as the original model card proposal suggested [1].
- **Post-release evidence.** What the provider learned after launch, and what changed as a result.
- **Agentic settings.** How the model behaves when it can take actions, not only when it writes text.

Absence is information, but read it carefully. A missing section may mean the test was not run, was run and not published, or was published somewhere else. Record it as "not disclosed in this document", with the date you checked.

## Questions to ask of any release

1. Does the document say what the model is for, and what it is not for?
2. Is there any test of how the model responds to a person in distress, and is it multi-turn?
3. Are benign requests tested, so that over-refusal is visible?
4. Is there a test for emotional reliance or dependence?
5. Are welfare-related results reported by language or user group?
6. Do you see the test items, or only a category name and a score?
7. Who scored the responses, and was any of it independently checked?
8. Is there a channel for reporting harmful outputs, and is any post-release change described?
9. Is "passed a threshold" the only information, and if so, is the threshold defined?
10. Which claims would you be able to check yourself, and which must you take on trust?

## Regulation will change what you can expect

In the EU, the rules for general-purpose AI models under the AI Act became effective in August 2025 [7]. Providers must keep technical documentation that includes training, testing and evaluation results, but much of it goes to the EU AI Office on request and to downstream providers rather than to the public; the published element is a summary of training content [8]. Models the Act treats as carrying systemic risk face further duties, including model evaluation, adversarial testing and serious-incident reporting [9]. That should make some testing more regular. It does not specify user-welfare tests in the terms used here, so the questions above remain yours to ask.

## What independent testing can and cannot add

A provider's card tells you what the provider chose to test and publish. Independent testing can check some of those claims from outside, and it can test things the card does not cover. It also has limits. A published test set can be learned by the model being tested, and a single run on one snapshot of a model is not a stable property of a model family. Our methodology page sets out these limits, and we do not rank models.

Compassion Benchmark is independent. No provider pays for inclusion, coverage, wording or a score.

*Examples in this piece are chosen to show what a practice or disclosure looks like, not because the provider does it best. We have not assessed these documents against one another, and this is not a ranking.*

## What you can do next

- Follow the weekly, sourced record of releases and their safety and welfare disclosures: [/ai-models/watch](/ai-models/watch)
- See the catalogue of current models with sources: [/ai-models/tracker](/ai-models/tracker)
- Read how we approach measuring model behaviour, and its limits: [/ai-models/methodology](/ai-models/methodology)
- Read why we do not rank AI models yet: [/insights/why-we-do-not-rank-ai-models-yet](/insights/why-we-do-not-rank-ai-models-yet)

## Sources
1. Model Cards for Model Reporting — Mitchell et al., arXiv, 2018-10-05. https://arxiv.org/abs/1810.03993
2. System Card: Claude Opus 4 & Claude Sonnet 4 — Anthropic, 2025. https://www-cdn.anthropic.com/6be99a52cb68eb70eb9572b4cafad13df32ed995.pdf
3. Addendum to GPT-5 System Card: Sensitive conversations — OpenAI, 2025-10-27. https://deploymentsafety.openai.com/gpt-5-sensitive-conversations
4. Llama 3.1 8B Instruct model card — Meta, via Hugging Face, 2024. https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
5. Gemini 3.5 Flash model card — Google DeepMind, 2026-05-19. https://deepmind.google/models/model-cards/gemini-3-5-flash/
6. The 2025 Foundation Model Transparency Index — Stanford CRFM and collaborators, arXiv, 2025-12-11. https://arxiv.org/abs/2512.10169
7. AI Act: regulatory framework for AI — European Commission, 2026. https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai
8. Article 53: Obligations for Providers of General-Purpose AI Models, Regulation (EU) 2024/1689 (AI Act) — EU Artificial Intelligence Act (artificialintelligenceact.eu), 2024. https://artificialintelligenceact.eu/article/53/
9. Article 55: Obligations for Providers of General-Purpose AI Models with Systemic Risk, Regulation (EU) 2024/1689 (AI Act) — EU Artificial Intelligence Act (artificialintelligenceact.eu), 2024. https://artificialintelligenceact.eu/article/55/
