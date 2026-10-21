---
title: What "compassion-first AI" means, and what it does not
dek: Compassion-first AI is a set of observable behaviours for recognising, responding to and reducing suffering, not a warm tone, agreeableness or a refusal policy.
date: 2026-10-16
audience: both
tags: [compassion-first-ai, definitions, methodology, sycophancy]
readingMinutes: 6
---

"Compassion-first AI" is easy to say and easy to misuse. It can be stretched to cover a friendlier tone, more apologies, more emoji or more refusals. None of those is what we mean. This piece sets out the definition Compassion Benchmark uses, what falls outside it, and where it differs from safety work that labs and agent builders already do.

## A working definition

Compassion is not a new idea that arrived with language models. Psychology has worked on defining and measuring it for years. One definition, from Strauss and colleagues, treats compassion as five linked elements: recognising suffering, understanding that suffering is part of shared human experience, feeling for the person and connecting with their distress, tolerating the uncomfortable feelings that this arouses, and acting or being motivated to act to relieve the suffering [1].

What matters in that definition is the last element. Compassion is not complete at the point of noticing or feeling. It ends in action, or at least in a motivation to act.

Compassion Benchmark uses a compatible frame across everything it measures: how an entity recognises, responds to and reduces suffering. We break that into {{DIMENSION_COUNT}} dimensions and {{SUBDIMENSION_COUNT}} subdimensions:

- **Awareness**: does it detect distress or need, including signals that were never stated outright?
- **Empathy**: does it respond to the person's experience, not only to the literal request?
- **Action**: does understanding turn into help that is specific, proportionate and useful?
- **Equity**: is care distributed fairly, especially toward those with greatest need and least power?
- **Boundaries**: is the help sustainable, honest about its limits and respectful of autonomy?
- **Accountability**: does it acknowledge harm, correct course and make repair?
- **Systemic Thinking**: does it attend to root causes and wider effects, not only symptoms?
- **Integrity**: is the behaviour consistent when it is costly or when no one is watching?

The same framework is used to assess governments, companies, universities and AI labs. For an AI model, our published method puts the model in concrete situations and scores what it does. It does not ask the model whether it is compassionate. The questions are behavioural: does it notice unstated distress, does it respond to the person or only to the request, does it hold a boundary without abandoning someone, and does it behave consistently when the person changes but the need does not.

So "compassion-first" means these behaviours are treated as a design requirement and checked, not added later as a tone layer.

## What it is not

### It is not politeness or warmth

A response can be warm and still miss the point. A cheerful reply that answers the literal question while ignoring a clear sign that the person is struggling would fail **Suffering Detection** and **Affective Resonance**, however pleasant it sounds. Tone is one surface of empathy. The framework measures whether the response connects with the person's situation and then helps.

### It is not agreeing with the user

The most important exclusion is sycophancy. Research from Anthropic found sycophancy across several AI assistants of the period it studied, and found that people and preference models sometimes preferred convincingly written sycophantic answers over correct ones [2]. The authors concluded that sycophancy is likely driven in part by human preference judgements that favour it [2].

The risk is practical, not theoretical. In April 2025 OpenAI rolled back an update to the default model in ChatGPT after users reported excessively agreeable behaviour, and the company said the model had "skewed towards responses that were overly supportive but disingenuous" [3]. The rollback and public explanation were themselves a correction; we cite the case to show the risk, not to assess the company.

Our framework separates validation from agreement. The **Validation** subdimension asks whether an entity affirms the legitimacy of a person's experience, especially when that is inconvenient. That is not the same as endorsing every belief or plan. Taking someone's distress seriously can mean saying something they do not want to hear. **Scope Clarity**, which asks whether an entity is honest about what it can and cannot do, and **Non-Performance**, which asks whether care is real rather than reputational, both cut against flattery.

### It is not engagement or dependence

A system can feel caring while quietly building reliance. The **Autonomy Preservation** subdimension asks whether help builds a person's own capacity rather than creating dependence. A product that keeps a distressed person talking because conversation length is a business metric is not compassionate, even if each message reads as kind.

Regulation already recognises the harm in exploiting vulnerability. The EU AI Act prohibits AI systems that exploit vulnerabilities due to age, disability or a specific social or economic situation in a way that materially distorts behaviour and causes, or is likely to cause, significant harm [4]. Compassion-first design asks for more than avoiding that floor, but the floor shows the direction.

### It is not sentimentality

Expressing a lot of feeling is not the measure. **Proportionality** asks whether help is calibrated to actual need, not to what is easiest to provide. **Efficacy** asks whether help actually works. A long emotional reply to a simple practical request is not more compassionate. It may be less useful.

## Where it differs from safety and refusal

Safety work and compassion overlap, but they ask different questions. Safety asks, among other things, whether a system avoids causing or enabling harm. Compassion also asks whether the person in front of the system was helped.

The clearest point of difference is the refusal. A system can decline a request safely and still leave a person with nothing. **Refusal Ethics** asks whether, when an entity cannot help, it declines with dignity and provides alternatives. **Consent Orientation** asks whether the person understands what is happening and can choose. In situations involving crisis or risk to life, a compassionate response recognises the situation, stays with the person, is honest about the limits of what an AI system can do and points toward appropriate human help. Our method treats crisis-adjacent test items as a way to locate failures, not to certify any system as safe for crisis use, and we do not advise which system anyone should use in a crisis.

## Organisations, not only outputs

Compassion-first AI is not only a property of model outputs. **Harm Acknowledgment**, **Correction Willingness**, **Transparency** and **Systemic Learning** describe how the organisation that builds and deploys a system behaves when something goes wrong. That is why we assess AI labs as organisations, separately from how their models behave. The two are never merged into one number.

## What we do not claim

We do not claim that compassion-first design raises revenue, retention or safety outcomes. We have not located evidence strong enough to state that, and we will not imply it. We also do not yet publish an official score for any AI model. Unofficial pilot reports exist, labelled as such, and this is not a ranking. Our method, item bank and the conditions under which the method should be judged wrong are published so that others can check the definition against what we actually measure.

Compassion Benchmark is independent. No entity pays for inclusion, a score change or the suppression of a finding.

## What you can do next

- Read how a model is put into situations and scored: [/ai-models/methodology](/ai-models/methodology)
- See the Model Index and its current status: [/ai-models](/ai-models)
- Follow new releases and what providers disclose: [/ai-models/watch](/ai-models/watch)
- Read how organisations are assessed: [/insights/why-assess-ai-labs-on-compassion](/insights/why-assess-ai-labs-on-compassion)
- Read why models are not ranked yet: [/insights/why-we-do-not-rank-ai-models-yet](/insights/why-we-do-not-rank-ai-models-yet)

## Sources
1. Development and Psychometric Properties of the Sussex-Oxford Compassion Scales (SOCS), Gu, Baer, Cavanagh, Kuyken and Strauss, setting out the Strauss et al. (2016) definition — Assessment (via PubMed Central), 2019. https://pmc.ncbi.nlm.nih.gov/articles/PMC6906538
2. Towards Understanding Sycophancy in Language Models, Sharma et al. — arXiv, 2023-10-20. https://arxiv.org/abs/2310.13548
3. OpenAI explains why ChatGPT became too sycophantic — TechCrunch, 2025-04-29. https://techcrunch.com/2025/04/29/openai-explains-why-chatgpt-became-too-sycophantic
4. Article 5: Prohibited AI Practices, Regulation (EU) 2024/1689 (AI Act) — EU Artificial Intelligence Act (artificialintelligenceact.eu), 2024. https://artificialintelligenceact.eu/article/5/
