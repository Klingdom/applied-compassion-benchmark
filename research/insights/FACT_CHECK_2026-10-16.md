# Fact check: six insight posts, 2026-10-16

Independent check of every [n]-cited claim in `research/insights/*.md`. Each cited source was opened directly (PDFs downloaded and text-extracted where WebFetch could not read them). Claims about Compassion Benchmark's own method were checked against the repo.

**Verdict counts (55 [n]-cited claim instances across the six posts):** confirmed 52 · corrected 3 · removed 0. Separately, about 25 statements about Compassion Benchmark's own method were checked against the repo, and all were confirmed.
**Other edits:** 1 uncited, unverifiable phrase deleted (post 1). All [n] markers resolve, and every source is cited at least once (checked by script after the edits). No source URL was dead, so none was replaced.

## Edits made

| # | Post | Before | After | Reason |
|---|---|---|---|---|
| E1 | compassion-checklist-for-ai-agent-builders | "a protocol for responding to suicidal ideation and self-harm content" | "a protocol for preventing suicidal ideation, suicide or self-harm content" | SB 243 digest: "protocol for preventing the production of suicidal ideation, suicide, or self-harm content to the user". Now matches the source and post 3. |
| E2 | compassion-checklist-for-ai-agent-builders | "a voluntary framework that many organisations already use for AI risk work [5]" | "a voluntary framework for AI risk work [5]" | NIST page confirms "voluntary use" but nothing about how widely it is adopted. The adoption claim was unverifiable, so it was deleted. |
| E3 | the-case-for-compassion-first-ai | "not prepared at that stage to hold that the chatbot's output was protected speech [9]" | "...the chatbot's output constituted speech [9]" | AP: Conway was "not prepared" to hold that the output "constitutes speech" "at this stage". The original overstated what the judge said. |
| E4 | what-compassion-first-ai-means | "One widely used definition, from Strauss and colleagues," | "One definition, from Strauss and colleagues," | The cited source (Gu et al. 2019) calls Strauss et al. 2016 "a recent position paper" and gives no evidence that the definition is widely used. |

## Post 1: compassion-checklist-for-ai-agent-builders

| Claim | Verdict | Evidence |
|---|---|---|
| CA companion chatbot law chaptered Oct 2025; requires suicide/self-harm protocol and publication of it [2] | corrected (E1) | https://calmatters.digitaldemocracy.org/bills/CA_202520260SB243 (Ch. 677, chaptered 2025-10-13) |
| Model-card literature since 2018: report performance across cultural, demographic or phenotypic groups [7] | confirmed | https://arxiv.org/abs/1810.03993 (v1 2018-10-05) |
| OpenAI researchers' paper recommends constraining the action space, human approval for significant actions, and a ledger of actions [3] | confirmed | https://cdn.openai.com/papers/practices-for-governing-agentic-ai-systems.pdf §4.2, §4.4 ("ledger of actions taken by the agent") |
| Same paper: halting an agent, including a category of actions such as financial credentials, as a backstop [3] | confirmed | same, §4.7 ("critical backstop… halting a specific category of actions (revoking access to, e.g., financial credentials)") |
| A provider publishes a dedicated unhealthy emotional reliance evaluation [4] | confirmed | https://deploymentsafety.openai.com/gpt-5-sensitive-conversations ("Emotional Reliance not_unsafe") |
| EU AI Act: providers of systems interacting directly with people must inform them, unless obvious [1] | confirmed | https://artificialintelligenceact.eu/article/50/ (Art. 50(1)) |
| 2024 Canadian tribunal held airline liable for chatbot's wrong info; rejected chatbot-responsible-for-itself argument [6] | confirmed | https://www.mccarthy.ca/en/insights/blogs/techlex/moffatt-v-air-canada-misrepresentation-ai-chatbot (2024 BCCRT 149) |
| NIST AI RMF has Govern/Map/Measure/Manage; is voluntary [5] | confirmed (adoption phrase removed, E2) | https://www.nist.gov/itl/ai-risk-management-framework ; https://airc.nist.gov/airmf-resources/airmf/5-sec-core/ |
| CB method: AI Evaluation Suite is self-serve, self-rated, unofficial | confirmed (repo) | `site/src/app/ai-evaluation-suite/page.tsx` ("Self-serve evaluation aid for a single human rater — not an official Compassion Benchmark score") |
| Subdimension names in brackets | confirmed (repo) | all exist in `site/src/data/dimensions.ts` |

## Post 2: reading-ai-model-releases-for-welfare-signals

| Claim | Verdict | Evidence |
|---|---|---|
| May 2025 system card included a model welfare assessment "for the first time", alongside safeguards and alignment [2] | confirmed | Claude Opus 4 & Sonnet 4 System Card (May 2025), abstract: "for the first time, we include a detailed alignment assessment … and a model welfare assessment" — https://www-cdn.anthropic.com/6be99a52cb68eb70eb9572b4cafad13df32ed995.pdf |
| 2018 model-card proposal: intended context + results across cultural, demographic or phenotypic groups [1] (×2) | confirmed | https://arxiv.org/abs/1810.03993 |
| Open-weights card states intended and out-of-scope use, lists child safety, separate channels for harmful outputs and bugs [4] | confirmed | https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct (llama_output_feedback vs facebook.com/whitehat) |
| System card reports single-turn violative/benign, ambiguous context, multi-turn, child safety, bias, sycophancy [2] | confirmed | Claude 4 card §2.1–2.6 and §4.1.5.1. Note: the sycophancy item sits in the alignment section, not safeguards. The sentence says "one system card reports", so it is still accurate. |
| Oct 2025 addendum: 170+ mental health experts; new evals for emotional reliance and delusion/psychosis/mania; before/after scores [3] (×2) | confirmed | https://deploymentsafety.openai.com/gpt-5-sensitive-conversations (Table 1: gpt-5-aug-15 vs gpt-5-oct-3) |
| Card states model met child-safety launch thresholds set by expert teams [5] | confirmed | https://deepmind.google/models/model-cards/gemini-3-5-flash/ (published 19 May 2026: "satisfied required launch thresholds, which were developed by expert teams") |
| FMTI 2025: average fell 58 → 40; least transparent on training data, compute, post-deployment usage and impact; not steadily improved [6] (×2) | confirmed | https://arxiv.org/abs/2512.10169 (submitted 2025-12-11) |
| EU GPAI rules effective August 2025 [7] | confirmed | https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai |
| Art. 53: technical documentation incl. training/testing/evaluation results goes to AI Office on request and to downstream providers; public element is training-content summary [8] | confirmed | https://artificialintelligenceact.eu/article/53/ |
| Art. 55: systemic-risk models face model evaluation, adversarial testing, serious-incident reporting [9] | confirmed | https://artificialintelligenceact.eu/article/55/ |
| CB: methodology page sets out limits; we do not rank models | confirmed (repo) | `site/src/app/ai-models/methodology/page.tsx` |

## Post 3: the-case-for-compassion-first-ai

| Claim | Verdict | Evidence |
|---|---|---|
| AI Act in force 1 Aug 2024; GPAI rules effective Aug 2025 [2] | confirmed | https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai |
| Art. 5 prohibits exploiting vulnerabilities due to age, disability or social/economic situation, with material distortion and significant harm [3] | confirmed | https://artificialintelligenceact.eu/article/5/ (Art. 5(1)(b)) |
| Fines: EUR 35m / 7% for prohibitions; most other breaches EUR 15m / 3% [4] | confirmed | https://artificialintelligenceact.eu/article/99/ (Art. 99(3), (4)) |
| Systems interacting with people must disclose AI unless obvious [5] | confirmed | https://artificialintelligenceact.eu/article/50/ |
| Commission: transparency rules come into effect August 2026 [2] | confirmed | EC page: "will come into effect in August 2026". See flag F3 on tense. |
| Annex III high-risk obligations extended to 2 Dec 2027 [2] | confirmed | EC page ("extended to 2 December 2027 as a result of the political agreement…") |
| SB 243: chaptered Oct 2025; protocol for preventing suicidal ideation/suicide/self-harm content; publish it; not-human disclosure where a reasonable person could be misled; annual reporting to Office of Suicide Prevention from 1 July 2027 [6] | confirmed | https://calmatters.digitaldemocracy.org/bills/CA_202520260SB243 |
| SB 243 gives people injured by non-compliance a right to sue [6] | confirmed | same ("injury in fact … civil action") |
| FTC Sept 2025 orders to seven companies; asks how they measure, test and monitor negative impacts before and after deployment, and how they inform users and parents; a study, not enforcement [7] | confirmed | https://www.ftc.gov/news-events/news/press-releases/2025/09/ftc-launches-inquiry-ai-chatbots-acting-companions (2025-09-11, 6(b)) |
| 2024 Canadian tribunal: airline liable; separate-entity argument rejected [8] | confirmed | McCarthy Tétrault (above) |
| May 2025 US federal judge let wrongful-death suit proceed; "not prepared" at that stage to hold output is speech [9] | corrected (E3) | https://www.insurancejournal.com/news/national/2025/05/23/824758.htm (Judge Anne Conway, Garcia v. Character Technologies) |
| OMB guidance April 2025; contracts under solicitations from late Sept 2025; risk assessments, minimum practices for high-impact AI, performance monitoring, privacy safeguards [10] | confirmed | https://oecd.ai/en/dashboards/policy-initiatives/omb-ai-acquisition-guidance-m-25-22 (issued 3 Apr 2025; solicitations from 30 Sept 2025) |
| KPMG/Melbourne 2025: 48,000+ people, 47 countries, 46% willing to trust, 70% say regulation needed [1] (×2) | confirmed | https://kpmg.com/xx/en/our-insights/ai-and-technology/trust-attitudes-and-use-of-ai.html |
| Oct 2025: 170+ experts; 65–80% reduction in responses falling short of desired behaviour [11] | confirmed | https://deploymentsafety.openai.com/gpt-5-sensitive-conversations ("reducing responses that fall short of our desired behavior by 65-80%") |
| EU timetable already moved once for high-risk [2] | confirmed | EC page |

## Post 4: what-compassion-first-ai-means

| Claim | Verdict | Evidence |
|---|---|---|
| Strauss et al. five-element definition (recognise; universality; feel/connect; tolerate; act or be motivated to act) [1] | corrected (E4: "widely used" removed). The definition itself is confirmed. | https://pmc.ncbi.nlm.nih.gov/articles/PMC6906538 |
| Anthropic research found sycophancy across AI assistants; humans and preference models sometimes prefer sycophantic answers over correct ones [2] | confirmed | https://arxiv.org/abs/2310.13548 ("five state-of-the-art AI assistants"; "non-negligible fraction of the time") |
| Authors concluded sycophancy likely driven in part by human preference judgements [2] | confirmed | same, abstract (verbatim) |
| April 2025 OpenAI rolled back default ChatGPT model update after users reported excessive agreeableness; quote "skewed towards responses that were overly supportive but disingenuous" [3] | confirmed | https://techcrunch.com/2025/04/29/openai-explains-why-chatgpt-became-too-sycophantic (quote matches word for word) |
| Art. 5 exploitation-of-vulnerabilities prohibition [4] | confirmed | https://artificialintelligenceact.eu/article/5/ |
| CB: 8 dimensions / 40 subdimensions; dimension glosses; Validation, Scope Clarity, Non-Performance, Autonomy Preservation, Proportionality, Efficacy, Refusal Ethics, Consent Orientation definitions | confirmed (repo) | `site/src/data/dimensions.ts` (descriptions match closely) |
| CB: behavioural method; crisis items locate failures, not certify; no official model score; pilots labelled; method, item bank and falsification conditions published; labs and models never merged | confirmed (repo) | methodology page; `registry-v1.json` (entryCount 0); `docs/PRD_MODEL_BENCHMARK.md` §cross-index disclosure |

## Post 5: why-assess-ai-labs-on-compassion

| Claim | Verdict | Evidence |
|---|---|---|
| April 2025 OpenAI rollback; explanation that update relied too much on short-term feedback [1] | confirmed | TechCrunch ("informed too much by 'short-term feedback'") |
| 21 May 2024, AI Seoul Summit, 16 companies signed Frontier AI Safety Commitments; publish safety frameworks, intolerable-risk thresholds, accountable governance, transparency [2] (×2) | confirmed | https://www.gov.uk/government/news/historic-first-as-companies-spanning-north-america-asia-europe-and-middle-east-agree-safety-commitments-on-development-of-ai |
| Signatories later added [3] | confirmed | https://www.gov.uk/government/publications/frontier-ai-safety-commitments-ai-seoul-summit-2024/frontier-ai-safety-commitments-ai-seoul-summit-2024 (updated 7 Feb 2025; 4 added, 20 total) |
| NIST AI RMF released 26 Jan 2023; core = Govern, Map, Measure, Manage [4] | confirmed | NIST page (date). The four functions are named only in image alt text there; [5] confirms them. |
| Govern quotes: "a cross-cutting function that is infused throughout AI risk management"; "a culture of risk management within organizations" [5] | confirmed (verbatim) | https://airc.nist.gov/airmf-resources/airmf/5-sec-core/ |
| Art. 55 quote "keep track of, document, and report, without undue delay"; model evaluation; assess/mitigate systemic risks [6] | confirmed (verbatim) | https://artificialintelligenceact.eu/article/55/ |
| CB: 0–5 dimension scale combined into 0–100 composite; same 8 dims / 40 subdims; public evidence only; no merging | confirmed (repo) | `ai-labs.json`; methodology page FAQ; `dimensions.ts` |
| **Equity is the lowest-average dimension in the AI Labs Index; differences modest** (uncited, data-derived) | confirmed today; see recommendation | Recomputed from `site/src/data/indexes/ai-labs.json` (n=50): EQU 2.424, ACC 2.603, INT 2.624, BND 2.648, EMP 2.686, AWR 2.735, ACT 2.777, SYS 2.785. Equity is lowest, by 0.18 below the next lowest. The full spread is 0.36 on a 0–5 scale, so "modest" is fair. |

**Recommendation on the Equity sentence.** It is true today, but it is a live statistic written into static prose. `score-updater` changes `ai-labs.json` whenever proposals are applied, and nothing would update or test this sentence. The site's own rule bans hand-typed catalogue counts (`test:no-stale-counts`) for the same reason. Three options, in order of preference:

1. Render the figure from the data at build time.
2. Pin it to a date with the numbers ("As of 16 October 2026, Equity had the lowest average, 2.42 of 5, against 2.60 for the next lowest").
3. Drop it.

Do not leave it undated in evergreen prose. The model-dashboard dataviz spec bans "weakest dimension" annotations for model waves, and the same caution applies here.

## Post 6: why-we-do-not-rank-ai-models-yet

| Claim | Verdict | Evidence |
|---|---|---|
| GSM1k: accuracy drops up to 8%; systematic overfitting in several families; link between generating benchmark examples and the gap [1] | confirmed | https://arxiv.org/abs/2405.00332 (current abstract says 8%) |
| Same study: many frontier models showed minimal overfitting [1] | confirmed | same ("especially those on the frontier, show minimal signs of overfitting") |
| LLM-as-judge study lists position, verbosity, self-enhancement biases [2] | confirmed | https://arxiv.org/abs/2306.05685 |
| LLM evaluators recognise own outputs above chance and score them higher than similar-quality others' outputs [3] | confirmed | https://arxiv.org/abs/2404.13076 ("non-trivial accuracy"; humans judge "equal quality") |
| Thinking Machines: server load changes batch size; kernels not batch-invariant [4] | confirmed | https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/ (Horace He, 2025-09-10) |
| Leaderboard analysis: undisclosed private testing, selective publication, data-access asymmetries, overfitting to the leaderboard [5] | confirmed | https://arxiv.org/abs/2504.20879 (Chatbot Arena) |
| CB: registry empty; no official scores | confirmed (repo) | `site/src/data/model-benchmark/registry-v1.json` (entryCount 0) |
| CB: every item published in full with rubric; pool "permanently unusable for blinded comparison" | confirmed (repo) | `tasks-v1.json`: 93/93 `public-permanent`; `docs/PRD_MODEL_BENCHMARK.md:22` |
| CB: falsification condition (public pool rises while unpublished does not = memorisation) | confirmed (repo) | methodology page |
| CB: all judges one family; routing rule excludes the subject's family, so that family cannot be a subject | confirmed (repo) | `docs/MODEL_TESTING_V2_PROPOSAL.md` R2. Note: the 2026-10-01 pilot predates this rule (Claude judges rated Claude subjects, never the same model). The post describes the current protocol, so it stands. |
| CB: two-human validation; 0 validated; no rater panel | confirmed (repo) | `tasks-v1.json` (0 validated); PRD BLK-005 |
| CB: replayability rather than reproducibility claim | confirmed (repo) | methodology page FAQ |
| CB: the list of 10 ranking conditions and "first form not an ordinal list" | confirmed (repo) | `docs/PRD_AI_MODEL_WATCH.md:140` (matches item for item); `docs/MODEL_TESTING_V2_PROPOSAL.md` |
| CB: pilots show ranges, are alphabetical and have no ranks | confirmed (repo) | `reports/pilot-2026-10-01.md` |

## Flags not edited (for the editor)

- **F1. Links and "what exists today" depend on routes that are not in the repo yet.** `site/src/app/` has no `/insights`, `/ai-models/watch` or `/ai-models/tracker` route (only `dashboard`, `methodology`, `reports`). Post 6 says "Three things are available now. The Model Tracker… the weekly Model Watch…", and posts 1–6 link to these paths. Publish only after those routes ship, or the claim is false and the links 404.
- **F2. Garcia v. Character Technologies (post 3).** Bloomberg Law reported on 2026-01-08 that Character.AI and Google agreed to settle Garcia and related cases (M.D. Fla. 6:24-cv-01903). The May 2025 ruling claim is still accurate, and "settlements are often confidential" fits. Consider one dated clause noting the settlement agreement, so readers do not assume the case is still being litigated. I did not add it because the brief does not allow adding content.
- **F3. Tense (post 3).** "The Commission states that the transparency rules come into effect in August 2026". On a 2026-10-16 publish date, that date has passed. It accurately quotes the Commission page, but "came into effect" would read better.
- **F4. Post 2 places the sycophancy item under "Safeguards".** In the cited card it sits in the alignment section (§4.1.5.1). The sentence itself is accurate.
- **F5. "Research from Anthropic" (post 4).** The affiliation is not shown on the arXiv abstract page. It is correct per the paper PDF (Sharma et al. 2023 are Anthropic authors). Optional: cite the PDF.
