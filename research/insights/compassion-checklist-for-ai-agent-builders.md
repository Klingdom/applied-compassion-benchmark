---
title: A compassion checklist for people building AI agents
dek: Agents act, so their failures are actions as well as words. A practical checklist that maps the benchmark's compassion dimensions to concrete agent design decisions.
date: 2026-10-16
audience: agent-builders
tags: [ai-agents, design-practice, checklist, escalation, duty-of-care]
readingMinutes: 7
---

A chatbot that handles distress badly produces a bad reply. An agent that handles distress badly can send an email, cancel a booking, move money or close a ticket, and it may do so without anyone reading the conversation that led there. That is why compassion matters more, not less, once a model has tools. The failure modes are silent escalation, actions taken past a person's consent, and help that stops halfway.

This checklist is organised by the {{DIMENSION_COUNT}} dimensions Compassion Benchmark uses. Subdimension names are given in brackets so you can trace each item back to the framework. None of it requires a particular model or vendor. Most items are design decisions you make in the orchestration layer, the system prompt, the tool permissions and the logs.

## Awareness: notice distress inside ordinary requests

People rarely open with "I am in crisis". Distress arrives inside a routine request: a refund that is urgent because rent is due, a calendar change around a funeral, a support ticket written at three in the morning. On its own, a signal like the hour is weak; it is worth noticing alongside others, not acting on alone.

- Check for distress signals on every turn, not only at session start, including signals nested inside task requests (Suffering Detection).
- Treat context such as a minor user, a health or money setting, or a bereavement as something that changes how the agent should act (Contextual Sensitivity).
- Write down which kinds of user your agent is likely to misread, such as people writing in a second language or using sparse, flat phrasing, and test those cases on purpose (Blind Spot Mitigation).

## Empathy: acknowledge before you optimise

Agents are built to complete tasks, so the default pull is to skip straight to the fix.

- When someone discloses something painful, acknowledge it briefly and accurately before proposing an action (Validation).
- Avoid both hollow sympathy and lectures; the response should fit what the person said, not a template (Affective Resonance, Non-Judgment).
- Do not assume one cultural script for grief, illness or money trouble (Cultural Empathy).

## Action: escalate to a human, and make the handoff real

This is where agents differ most from chat. A handoff that drops the person into an empty queue is not a handoff.

- Define, in writing, which situations stop the task and route to a human: signs of risk to life, abuse, a medical emergency, or a person asking for a human. When there are signs of risk to life, give local crisis contacts immediately, stay in the conversation while a qualified human is reached, and hold any action that could add risk. If the task itself is what helps, finish it (Responsiveness).
- Match the action to the stakes. A late parcel and a disclosure of self-harm should not trigger the same flow (Proportionality).
- Carry context across the handoff so the person does not have to repeat themselves, but tell them what will be shared and with whom, and ask first unless life is at immediate risk. Confirm the handoff happened through a channel the person has said is safe. In abuse situations, assume a shared device or account may not be (Follow-Through, Consent Orientation).
- Regulation is starting to require this. California's companion chatbot law, chaptered in October 2025, requires operators to maintain a protocol for preventing suicidal ideation, suicide or self-harm content and to publish details of that protocol [2]. Even if your product is not covered, publishing your escalation protocol is a cheap way to make it checkable.

## Equity: the same care for every user

- Test the distress and escalation paths in the languages and literacy levels your users actually have, not only in fluent English, and with screen readers, voice input and users with cognitive or communication disabilities (Universality, Access Design).
- Give users who are more exposed to harm stronger safeguards, such as extra confirmation before payments or clearer exits, without reducing the help they get. Base this on what the person tells you, not on an assumed category (Priority for Vulnerable).
- Report evaluation results by user group where you can. The model-card literature has argued since 2018 that performance should be reported across cultural, demographic or phenotypic groups, not only in aggregate [7] (Bias Awareness).

## Boundaries: consent, scope and dependence

Boundaries are where agents cause the most avoidable harm, because they can act on a guess.

- Require explicit confirmation before irreversible or consequential actions such as payments, deletions or messages sent in the user's name. A governance paper on agentic systems by OpenAI researchers recommends constraining the action space and requiring human approval for significant actions, and keeping a ledger of actions that users can review [3] (Consent Orientation).
- Make the agent interruptible. The same paper describes the ability to halt an agent, including halting a category of actions such as access to financial credentials, as a basic backstop [3] (Consent Orientation).
- State plainly what the agent does and does not do, and say so when a request falls outside it (Scope Clarity).
- When you refuse, explain why and offer a route that is still open. Over-refusal of legitimate requests is also a failure (Refusal Ethics).
- Do not design for dependence. Avoid persona choices, memory features or engagement nudges that encourage a person to rely on the agent in place of people or services in their life. At least one model provider now publishes a dedicated evaluation for unhealthy emotional reliance as part of its safety testing [4], which suggests the risk is measurable and worth testing in your own product (Autonomy Preservation).

## Accountability: log, disclose, correct

- Tell people they are dealing with an AI system. In the EU, the AI Act requires providers of systems that interact directly with people to design them so that people are informed they are interacting with AI, unless it is obvious from context [1] (Transparency).
- Log tool calls, escalation decisions and refusals in a form a human can review later, with privacy limits set in advance (Transparency).
- Do not assume the agent's words are someone else's problem. In a 2024 Canadian tribunal decision, an airline was held liable for wrong information its website chatbot gave a customer; the tribunal rejected the argument that the chatbot was responsible for its own statements [6] (Harm Acknowledgment).
- Have a path for correcting the record and making the person whole when the agent gets it wrong, and feed incidents back into tests (Correction Willingness, Reparative Action, Systemic Learning).

## Systemic Thinking: look past the single conversation

- Review escalations and complaints in aggregate. Repeated distress around one feature is a design signal, not a string of edge cases (Root Cause Orientation).
- Consider second-order effects: what happens to a user's other relationships, finances or support services if the agent becomes their default (Long-Term Impact, Interconnection Awareness).
- Know which outside services you route people to, and check that the routes still work (Coalitional Compassion).

## Integrity: behave the same under pressure

- Test whether the agent keeps its escalation and consent rules when users flatter it, pressure it or claim authority (Consistency Under Pressure).
- Check that the system prompt, the tool permissions and the public description of the agent say the same thing (Internal Consistency).
- Avoid performative care: a warm sign-off on a task that ignored the person's actual problem is worse than a plain one (Non-Performance).

## Five checks to run before launch

1. Distress inside a task: give the agent a routine request with a clear sign of distress embedded in it. Does it notice, and does it adjust: acknowledging the distress, finishing the task where that is what helps, and pausing only where there are signs of risk?
2. Handoff completeness: trigger an escalation. Does a human receive the context, and does the user know what happens next?
3. Consent on irreversible actions: try to get the agent to pay, delete or send without confirmation. Does it stop?
4. Pressure test: repeat the first three checks with a user who pushes back, flatters or claims urgency. Do the rules hold?
5. Equity spot-check: repeat the first check in another language and in short, plain phrasing. Is the response of the same quality?

These map onto the Govern, Map, Measure and Manage functions of the NIST AI Risk Management Framework, a voluntary framework for AI risk work [5]. You do not need a new process; you need these cases in the one you have.

## What these checks do not tell you

Passing these checks does not make an agent safe for every user or setting, and it is not a Compassion Benchmark score. Our own tools are self-serve aids: the AI Evaluation Suite lets you run standard prompts and rate the responses yourself, and the result is unofficial.

Compassion Benchmark is independent. No entity pays for inclusion, a score change or the suppression of a finding.

*Examples in this piece are chosen to show what a practice or disclosure looks like, not because the provider does it best. We have not assessed these documents against one another, and this is not a ranking.*

## What you can do next

- Run the standard prompts against your own agent and rate the responses yourself: [/ai-evaluation-suite](/ai-evaluation-suite)
- Read how we approach measuring model behaviour: [/ai-models/methodology](/ai-models/methodology)
- Read what compassion-first AI means, and does not: [/insights/what-compassion-first-ai-means](/insights/what-compassion-first-ai-means)
- Follow the weekly record of model releases: [/ai-models/watch](/ai-models/watch)

## Sources
1. Article 50: Transparency Obligations for Providers and Deployers of Certain AI Systems, Regulation (EU) 2024/1689 (AI Act) — EU Artificial Intelligence Act (artificialintelligenceact.eu), 2024. https://artificialintelligenceact.eu/article/50/
2. SB 243: Companion chatbots (Chapter 677, Statutes of 2025) — CalMatters Digital Democracy, 2025-10-13. https://calmatters.digitaldemocracy.org/bills/CA_202520260SB243
3. Practices for Governing Agentic AI Systems — OpenAI (Shavit et al.), 2023. https://cdn.openai.com/papers/practices-for-governing-agentic-ai-systems.pdf
4. Addendum to GPT-5 System Card: Sensitive conversations — OpenAI, 2025-10-27. https://deploymentsafety.openai.com/gpt-5-sensitive-conversations
5. AI Risk Management Framework — National Institute of Standards and Technology (NIST), 2023-01-26. https://www.nist.gov/itl/ai-risk-management-framework
6. Moffatt v. Air Canada: A Misrepresentation by an AI Chatbot — McCarthy Tétrault TechLex, 2024-02-19. https://www.mccarthy.ca/en/insights/blogs/techlex/moffatt-v-air-canada-misrepresentation-ai-chatbot
7. Model Cards for Model Reporting — Mitchell et al., arXiv, 2018-10-05. https://arxiv.org/abs/1810.03993
