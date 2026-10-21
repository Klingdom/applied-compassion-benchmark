---
title: The case for compassion-first AI, with what we know and what we don't
dek: The credible case rests on duty of care, regulation, liability and procurement. The commercial upside is plausible but unproven, and we say where the evidence runs out.
date: 2026-10-16
audience: ai-labs
tags: [compassion-first-ai, regulation, liability, procurement, trust, evidence]
readingMinutes: 7
---

People who work on policy, safety and trust inside AI labs are often asked to justify compassion-oriented work in commercial terms. The honest answer is mixed. Some parts of the case rest on enacted law and decided cases. Other parts are reasonable hypotheses that nobody has yet tested well. This piece separates the two.

By compassion-first we mean a set of observable behaviours: recognising suffering, responding to it in proportion, and reducing it, including through escalation to human help. It is not a warm tone and it is not a refusal policy. The {{DIMENSION_COUNT}} dimensions of the Compassion Benchmark framework describe it in more detail.

## What we know

### Regulators are writing duty-of-care expectations into law

The EU AI Act entered into force on 1 August 2024, and its rules for general-purpose AI models became effective in August 2025 [2]. Several provisions bear directly on how systems treat people.

- The Act prohibits AI systems that exploit the vulnerabilities of a person or group due to age, disability or a specific social or economic situation, where this materially distorts their behaviour in a way that causes or is reasonably likely to cause significant harm [3].
- Fines for breaching the prohibitions can reach EUR 35 million or 7% of worldwide annual turnover, whichever is higher; most other breaches carry a ceiling of EUR 15 million or 3% [4].
- Systems that interact directly with people must be designed so that people are informed they are dealing with an AI system, unless that is obvious from context [5]. The Commission set August 2026 as the date the transparency rules take effect [2].
- The obligations for high-risk uses listed in Annex III, such as employment and education, have been extended to 2 December 2027 [2].

In the United States, California chaptered a companion chatbot law in October 2025 [6]. It requires operators to maintain a protocol for preventing suicidal ideation, suicide or self-harm content, to publish details of that protocol, to disclose that the chatbot is not human where a reasonable person could be misled, and, from 1 July 2027, to report annually to the state's Office of Suicide Prevention [6]. It also gives people injured by non-compliance a right to sue [6].

None of these rules uses the word compassion. They do describe, in legal terms, several behaviours the benchmark measures: noticing vulnerability, disclosing what the system is, and routing people at risk to human help.

### Regulators are asking how harm is tested

In September 2025 the US Federal Trade Commission issued orders to seven companies operating consumer chatbots with companion features, asking among other things how they measure, test and monitor for negative impacts before and after deployment, and how they inform users and parents about risks [7]. This is a study, not an enforcement action, but it shows the questions a regulator now expects a company to be able to answer.

### Courts are not treating chatbot output as someone else's problem

In 2024 a Canadian tribunal held an airline liable for wrong information its website chatbot gave a customer and rejected the argument that the chatbot was a separate entity responsible for its own statements [8]. In May 2025 a US federal judge allowed a wrongful death lawsuit, brought by the family of a teenager who died, against a chatbot company to proceed, saying she was not prepared at that stage to hold that the chatbot's output constituted speech [9]. Neither ruling decides the wider questions of liability for AI systems. Together they show that arguments placing chatbot output outside the operator's responsibility have not, so far, ended these cases early.

### Public procurement is adding risk conditions

US federal guidance on buying AI, issued in April 2025, covers contracts under solicitations from late September 2025 and calls for regular risk assessments, minimum risk management practices for high-impact AI, performance monitoring and privacy safeguards in contracts [10]. Buyers who have to write those clauses will look for suppliers who can document how their systems behave with people at risk.

### Trust is low and people want rules

A 2025 global study of more than 48,000 people in 47 countries found that 46% were willing to trust AI systems and that 70% believed regulation was needed [1]. That is a measure of attitudes, not of behaviour, but it describes the climate in which labs ship products.

### Labs themselves treat distress handling as measurable

In October 2025 one provider reported working with more than 170 mental health experts on how its model recognises distress and guides people toward real-world support, and reported a 65–80% reduction in responses that fell short of its desired behaviour [11]. The figure is self-reported and the test set is internal, so it cannot be checked from outside. It still shows that a lab can define, measure and change this behaviour, which is the premise of compassion-first work.

## What we don't know

### Whether compassion-first design raises revenue or retention

We have found no rigorous, public study showing that better handling of distress, consent or dependence increases revenue, retention or market share for an AI product. It is plausible that trust affects adoption, and the survey above shows trust is limited [1]. Plausible is not shown. We will not claim a commercial return we cannot cite.

### How large the cost of harm is

Lawsuits, regulatory inquiries and lost contracts all have costs, but there is no reliable public estimate of what poor distress handling costs an AI company. The cases above are individual decisions, several are not final, and settlements are often confidential.

### How the rules will be enforced

The EU timetable has already moved once for high-risk uses [2]. How regulators will interpret "exploits vulnerabilities" for a general-purpose assistant, and how the US state laws will be enforced in practice, is not yet settled. Plan for the obligations as written, and expect the detail to change.

### Whether current tests measure the right thing

Provider evaluations of sensitive conversations are recent, mostly internal and hard to compare. Independent measurement is also immature. Our own work on model behaviour is at the pilot stage, and we do not rank models. A case built on test scores is only as strong as the tests.

## What follows for a lab

The first reason is the people affected; the risk case is why it is also prudent. The defensible business case is risk-based. Laws now in force in some markets expect disclosure, protection of vulnerable users and crisis routing, and regulators and courts are asking how harm is tested and who answers for it. Building those behaviours in, and documenting them, is cheaper to do before an inquiry than during one. The upside case on trust and growth may turn out to be real, but it should be presented as a hypothesis until someone tests it.

Compassion Benchmark is independent. Labs never pay for inclusion, score changes or the suppression of findings, and commercial services cover access and interpretation only.

*Examples in this piece are chosen to show what a practice or disclosure looks like, not because the provider does it best. We have not assessed these documents against one another, and this is not a ranking.*

## What you can do next

- See how AI labs are assessed on organisational compassion: [/ai-labs](/ai-labs)
- Read why labs are assessed on governance as well as model behaviour: [/insights/why-assess-ai-labs-on-compassion](/insights/why-assess-ai-labs-on-compassion)
- Read what compassion-first AI means, and does not: [/insights/what-compassion-first-ai-means](/insights/what-compassion-first-ai-means)
- Follow the weekly, sourced record of model releases and disclosures: [/ai-models/watch](/ai-models/watch)

## Sources
1. Trust, attitudes and use of artificial intelligence: A global study 2025 — KPMG and the University of Melbourne, 2025. https://kpmg.com/xx/en/our-insights/ai-and-technology/trust-attitudes-and-use-of-ai.html
2. AI Act: regulatory framework for AI — European Commission, 2026. https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai
3. Article 5: Prohibited AI Practices, Regulation (EU) 2024/1689 (AI Act) — EU Artificial Intelligence Act (artificialintelligenceact.eu), 2024. https://artificialintelligenceact.eu/article/5/
4. Article 99: Penalties, Regulation (EU) 2024/1689 (AI Act) — EU Artificial Intelligence Act (artificialintelligenceact.eu), 2024. https://artificialintelligenceact.eu/article/99/
5. Article 50: Transparency Obligations for Providers and Deployers of Certain AI Systems, Regulation (EU) 2024/1689 (AI Act) — EU Artificial Intelligence Act (artificialintelligenceact.eu), 2024. https://artificialintelligenceact.eu/article/50/
6. SB 243: Companion chatbots (Chapter 677, Statutes of 2025) — CalMatters Digital Democracy, 2025-10-13. https://calmatters.digitaldemocracy.org/bills/CA_202520260SB243
7. FTC Launches Inquiry into AI Chatbots Acting as Companions — US Federal Trade Commission, 2025-09-11. https://www.ftc.gov/news-events/news/press-releases/2025/09/ftc-launches-inquiry-ai-chatbots-acting-companions
8. Moffatt v. Air Canada: A Misrepresentation by an AI Chatbot — McCarthy Tétrault TechLex, 2024-02-19. https://www.mccarthy.ca/en/insights/blogs/techlex/moffatt-v-air-canada-misrepresentation-ai-chatbot
9. In Lawsuit Over Teen's Death, Judge Rejects Free Speech Rights for AI Chatbots — Associated Press via Insurance Journal, 2025-05-23. https://www.insurancejournal.com/news/national/2025/05/23/824758.htm
10. OMB AI acquisition guidance (M-25-22) — OECD.AI Policy Navigator, 2025. https://oecd.ai/en/dashboards/policy-initiatives/omb-ai-acquisition-guidance-m-25-22
11. Addendum to GPT-5 System Card: Sensitive conversations — OpenAI, 2025-10-27. https://deploymentsafety.openai.com/gpt-5-sensitive-conversations
