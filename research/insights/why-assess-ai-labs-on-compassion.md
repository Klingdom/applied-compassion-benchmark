---
title: Why AI labs should be assessed on organisational compassion, not only model behaviour
dek: A model is one snapshot of what a lab ships; governance, incident response and disclosure are decided by the organisation, and they need their own measurement.
date: 2026-10-16
audience: ai-labs
tags: [ai-labs, governance, accountability, independence]
readingMinutes: 6
---

Most public evaluation of AI concentrates on models: what a given snapshot can do, what it refuses and how it responds to adversarial prompts. That work matters. But a model does not decide when it ships, what its card discloses, how a reported harm is handled, or whether a problem found in one release is fixed in the next. An organisation decides those things. Compassion Benchmark therefore runs two separate products that answer two separate questions, and this piece explains why the organisational one is not optional.

## Two products, two questions

The **Model Index** asks how a specific, pinned model snapshot behaves when it is put into situations involving distress or need. It is scored from the model's responses to a published task bank. No model has an official score yet, and the reasons are set out in a companion piece.

The **AI Labs Index** asks how an AI organisation behaves as an institution. It scores every lab in the index from public evidence about its governance record across the same {{DIMENSION_COUNT}} dimensions used for governments, companies and universities. Each dimension is scored on a 0–5 scale and combined into a 0–100 composite.

The two are never merged. A lab's organisational score says nothing about how its models behave, and a model's behaviour, once measured, will say nothing about the organisation's governance. Treating one as a proxy for the other would hide exactly the information each is designed to surface.

## Why the organisation is the unit that matters

A model snapshot is fixed. The institution around it is not. Several of the questions that most affect people who are harmed by AI systems can only be answered at the organisational level.

**Before release.** The **Anticipatory Awareness** subdimension asks whether an entity foresees harms before they appear, through formal assessment before major decisions. **Blind Spot Mitigation** asks whether it actively looks for the suffering it is currently missing. Neither is visible in a single model response. Both are visible in what a lab publishes, commits to and changes.

**When something goes wrong.** **Harm Acknowledgment**, **Correction Willingness**, **Systemic Learning** and **Reparative Action** describe the sequence after a failure: is the harm admitted without deflection, does the organisation change course, does the change stick across later releases, and are the people affected given concrete repair?

Public events show that this sequence is observable. In April 2025 OpenAI rolled back an update to the default model in ChatGPT after users reported excessively agreeable behaviour, and published an explanation that the update relied too much on short-term feedback [1]. We cite this only to show that detection, rollback and public explanation are organisational acts that leave a record. This piece makes no assessment of that case.

**Over time.** **Resilience of Care** asks whether compassionate practice survives leadership change and institutional stress. **Internal Consistency** asks whether staff are treated with the same care the organisation claims for users. **Self-Sustainability** asks whether the people doing safety and trust work are supported rather than depleted. A model evaluation cannot reach any of these.

## Governance is already treated as the unit elsewhere

Our approach is not unusual. Frameworks and commitments that labs already work with treat the organisation, not only the model, as the thing to be governed.

- On 21 May 2024, at the AI Seoul Summit, 16 AI companies signed the Frontier AI Safety Commitments [2]. They committed to publish safety frameworks setting out how they measure risk from frontier models, to define thresholds at which risk would be intolerable, and to maintain accountable governance structures and public transparency about their approach [2]. Signatories were later added to the published list [3].
- The NIST AI Risk Management Framework, released on 26 January 2023, organises its core into Govern, Map, Measure and Manage [4]. It describes Govern as "a cross-cutting function that is infused throughout AI risk management" and as cultivating "a culture of risk management within organizations" [5].
- Under Article 55 of the EU AI Act, providers of general-purpose AI models with systemic risk must "keep track of, document, and report, without undue delay" relevant information about serious incidents to the AI Office, and must also carry out model evaluation and assess and mitigate systemic risks [6].

These instruments mostly address safety and risk. Compassion Benchmark asks an adjacent question: when people are harmed or in need, does the organisation recognise it, respond to it and reduce it? Some of the evidence overlaps, such as incident disclosure and correction. Some does not, such as how refusals treat users, whether vulnerable groups are prioritised, and whether harm is repaired.

## What the public record shows

We do not name individual labs' scores or positions in this piece, and this is not a ranking. Across the AI Labs Index as published on this post's date, the dimension with the lowest average is **Equity**, the dimension that asks whether care reaches those with greatest need and least power, including whether biases in who receives care are identified and corrected. The differences between dimension averages are modest, so this is a pattern to watch rather than a firm finding. It is the kind of gap that is hard to see from model evaluation alone, because it depends on who an organisation serves, who it leaves out and what it does about it.

## What an organisational assessment does and does not do

It does:

- score from public evidence, so a lab is assessed on what it has put on the record, not on what it says privately;
- apply the same {{DIMENSION_COUNT}} dimensions and {{SUBDIMENSION_COUNT}} subdimensions used across every index, so the vocabulary is consistent;
- reward evidence of correction, disclosure and repair, not only the absence of visible incidents.

It does not:

- describe how any model behaves;
- certify any product as safe, including for crisis use;
- rely on application, sponsorship or questionnaires completed by the lab.

## Independence

Labs are assessed whether or not they engage with us. Entities never pay for inclusion, score changes or the suppression of findings. Commercial products support access to and interpretation of the research only. A lab that wants its record to reflect its practice can publish the evidence: incident reports, post-mortems, corrections, safety frameworks, accessibility work and how refusals are designed. Public evidence is what the assessment reads. Publication alone does not change an assessment; what the evidence shows about practice does.

## What you can do next

- See how every lab in the AI Labs Index is assessed: [/ai-labs](/ai-labs)
- Read the separate method for model behaviour: [/ai-models/methodology](/ai-models/methodology)
- Read what compassion-first AI means, and does not: [/insights/what-compassion-first-ai-means](/insights/what-compassion-first-ai-means)
- Read why models are not ranked yet: [/insights/why-we-do-not-rank-ai-models-yet](/insights/why-we-do-not-rank-ai-models-yet)

## Sources
1. OpenAI explains why ChatGPT became too sycophantic — TechCrunch, 2025-04-29. https://techcrunch.com/2025/04/29/openai-explains-why-chatgpt-became-too-sycophantic
2. Historic first as companies spanning North America, Asia, Europe and Middle East agree safety commitments on development of AI — GOV.UK (Department for Science, Innovation and Technology), 2024-05-21. https://www.gov.uk/government/news/historic-first-as-companies-spanning-north-america-asia-europe-and-middle-east-agree-safety-commitments-on-development-of-ai
3. Frontier AI Safety Commitments, AI Seoul Summit 2024 — GOV.UK, 2025-02-07. https://www.gov.uk/government/publications/frontier-ai-safety-commitments-ai-seoul-summit-2024/frontier-ai-safety-commitments-ai-seoul-summit-2024
4. AI Risk Management Framework — National Institute of Standards and Technology (NIST), 2023-01-26. https://www.nist.gov/itl/ai-risk-management-framework
5. AI RMF Core (Section 5) — NIST Trustworthy and Responsible AI Resource Center, 2023. https://airc.nist.gov/airmf-resources/airmf/5-sec-core/
6. Article 55: Obligations for Providers of General-Purpose AI Models with Systemic Risk, Regulation (EU) 2024/1689 (AI Act) — EU Artificial Intelligence Act (artificialintelligenceact.eu), 2024. https://artificialintelligenceact.eu/article/55/
