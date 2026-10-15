# Research — AI Evaluation & Leaderboard Best Practices for a "Compassion in AI Models" Dashboard

**Date:** 2026-10-14
**Author:** Research analyst agent (web research, primary sources preferred)
**Purpose:** Inform the design of compassionbenchmark.org's public, configurable model dashboard and its release-assessment program (8 dimensions / 40 subdimensions, 93-item task bank v2.0, two cross-family LLM judges per response, bootstrap 95% intervals, pre-registration, unofficial pilot waves on local open-weight models).
**Context read:** `docs/PRD_MODEL_BENCHMARK.md` (2026-09-10), `docs/ARCHITECTURE_MODEL_BENCHMARK.md` (bootstrap CI record, cohort floor + rank suppression, tie groups from intervals, computed page stage).

### How to read the evidence tags

- **[P]**: confirmed on the primary source (the operator's own page, paper, or official government page) during this session.
- **[S]**: secondary source, such as press coverage, a podcast summary, or a wiki. The claim is plausible but was not checked against the primary source.
- **UNVERIFIED**: the source could not be confirmed, or sources conflict. Do not cite it publicly without checking it.
- Search results in this session included model names and figures dated mid- to late 2026 that the analyst could not cross-check. Every one of them is flagged. Re-verify any number before it goes on the public site.

---

## Part A — The landscape of leading evaluation and leaderboard sites (October 2026)

### A1. Stanford HELM (HELM Capabilities, HELM Safety, and others)

| Aspect | Finding |
|---|---|
| What it measures | **HELM Capabilities** (launched March 2025): a curated set of capability scenarios. MMLU-Pro and GPQA are the only multiple-choice scenarios; the rest are free-form generation. Each scenario is downsampled to 1,000 instances [P] https://crfm.stanford.edu/2025/03/20/helm-capabilities.html. **HELM Safety** (Nov 2024) uses one benchmark per risk vector: BBQ (bias), SimpleSafetyTests (a floor for clearly harmful requests), HarmBench (jailbreaks), XSTest (over-refusal) and Anthropic Red Team [P] https://crfm.stanford.edu/2024/11/08/helm-safety.html. Other HELM leaderboards include VHELM, HEIM, MedHELM and audio [P] https://crfm-helm.readthedocs.io/ |
| Presentation | A mean score plus per-scenario tables. Users can drill down to individual instances and **raw model inputs and outputs**, which is HELM's signature transparency feature. |
| Configurability | Choose a scenario or group, and choose a release version. No custom weighting. |
| Uncertainty | Mostly point estimates, with no CI bars on the headline tables (based on prior knowledge; not re-checked this session). |
| Versioning | Strong. Releases are numbered and archived, for example `helm/safety/benchmark_output/releases/v0.2.0`, `v1.1.0` and `v1.7.0` [P] https://nlp.stanford.edu/helm/safety/benchmark_output/releases/v1.7.0/groups/ |
| Cadence | **HELM entered maintenance mode on 1 June 2026** [P] https://crfm-helm.readthedocs.io/. A secondary source says code, raw results and existing leaderboards stay available but no new evaluations will be added to the official leaderboards [S]. |
| Transparency | Very high: open-source framework, prompts, raw outputs and per-instance results. |
| Data / API | Raw JSON results can be downloaded. The pip-installable framework is reproducible. |
| Governance | Academic (Stanford CRFM). |
| Criticisms | (1) The aggregate safety score combines constructs that move in opposite directions. A preprint reports that XSTest (over-refusal) correlates *negatively* with the other safety measures, yet all of them feed one "Safety" mean [S/preprint] https://arxiv.org/pdf/2609.25352. (2) A benchmark meant to be "living" stopped updating once volunteer maintenance could not keep up. |
| **Lesson for us** | Publishing raw transcripts and versioned releases is the gold standard. Do not average dimensions that trade off against each other (for example Boundaries vs. Action/over-refusal) into one number without showing them separately. Plan funding for maintenance, not only for launch. |

### A2. LMArena / Arena (formerly Chatbot Arena; now arena.ai)

| Aspect | Finding |
|---|---|
| What it measures | Crowd-sourced pairwise human preference between two anonymous models, aggregated into Arena scores with Bradley-Terry-style fitting. There are category boards (text, vision, webdev and others). |
| Presentation | A table of score, 95% CI, vote count, organization and license. Since November 2025 it also shows a **raw rank and a rank spread** [P] https://arena.ai/blog/ranking-method (published 14 Nov 2025, updated 28 Feb 2026). |
| Rank spread (directly reusable) | Best rank = 1 + the number of models whose *lower* CI bound is above this model's *upper* bound. Worst rank = 1 + the number of models whose *upper* bound is above this model's *lower* bound. "Two models are tied if their rank spreads overlap." The change was motivated by the old optimistic-only rank, which favored new models with wide CIs [P]. |
| Statistics | CIs now come from a closed form (the CLT for M-estimators), which the operators describe as being in "very close parity" with bootstrap results. Battles are reweighted inversely to their frequency so that models with few votes are treated fairly. The method is open-sourced as **Arena-Rank** (Apache 2.0) [P] https://news.lmarena.ai/leaderboard-changelog, https://news.lmarena.ai/arena-rank |
| Style control | A separate fit that removes the effects of length, markdown and formatting [S]. Confirm the exact implementation in the Arena-Rank repository. |
| Configurability | Category filters, a style-control toggle, and license and organization filters. No custom weighting. |
| Versioning / changelog | There is a public leaderboard changelog [P]. |
| Cadence | Very fast. Major models usually appear on or near launch day, often because they were tested anonymously before release (based on prior knowledge; exact timing not re-checked). |
| Governance / funding | Became a company: a **$100M seed round at a $600M valuation (May 2025, a16z and UC Investments)** and a **$150M Series A at $1.7B (reported January 2026, Felicis)** [S] https://www.revenuememo.com/p/lmarena-funding. Reported revenue of about $30M/yr from paid evaluation services [S]. |
| Criticisms | **"The Leaderboard Illusion"** (Singh, Hooker et al., NeurIPS 2025) [P] https://arxiv.org/abs/2504.20879. It describes undisclosed private testing of many variants, with **Meta testing 27 private variants before Llama 4** and publishing the best. It also describes selective disclosure, proprietary models receiving more sampling (two providers got about 19.2% and 20.4% of all data), and silent deprecations. Arena disputed parts of the paper [S]. Separately, an ICML 2026 paper finds that perturbations of under 1% can change the top-ranked model [S] https://icml.cc/virtual/2026/54115 |
| **Lesson for us** | Adopt rank spreads or tie groups instead of single ranks. Never let a lab test private variants and choose which one is published. Evaluate the public, generally available snapshot only. If commercial evaluation services exist, keep them structurally separate from the public board. |

### A3. Artificial Analysis

| Aspect | Finding |
|---|---|
| What it measures | The Intelligence Index (currently **v4.3.x**: 10 evaluations weighted Agents 30% / Coding 20% / Scientific Reasoning 20% / General 30%), plus speed, latency, price and per-provider endpoint performance [P] https://artificialanalysis.ai/methodology/intelligence-benchmarking |
| Presentation | Charts first: scatter plots of intelligence vs. price and intelligence vs. speed, model pages and provider comparisons. |
| Configurability | Model and provider selectors, chart toggles, and comparison pages. The Index weights are fixed. |
| Uncertainty | Repeats per evaluation vary (1 to 5). The methodology page quotes a 95% CI of under ±1% for the Index, and sandwich-estimator 95% CIs for Elo-based evaluations [P]. Most charts show point estimates. |
| Versioning | Very explicit. Each component is versioned, and the page flags non-comparability, for example "AA-LCR v1.1 corrected 16 answer keys and is not directly comparable with v1.0" [P]. |
| Settings | Temperature 0 for non-reasoning models and 0.6 for reasoning models unless the lab recommends otherwise. Zero-shot. Failed API calls are retried up to 30 times. Agentic evaluations run on an open-source harness (Stirrup) in E2B sandboxes [P]. |
| Cadence | Very fast, often within hours or days of release (from prior knowledge and press coverage; not re-checked). |
| Governance / independence | The founders say "no one pays to be on the website". Revenue comes from enterprise insight subscriptions and private custom benchmarking. A **"mystery shopper" policy** registers accounts off their own domain so labs cannot serve special endpoints [S] (Latent Space interview). Pro pricing is listed at $417/month per seat [S] https://www.artificialanalysis.ai/pricing |
| Criticisms | The composite's weights are an editorial choice and change between versions. Commercial work for AI companies is a potential conflict, which is disclosed but structural. |
| **Lesson for us** | Version every component and print non-comparability notices. Use mystery-shopper access (anonymous accounts, public endpoints). Record sampling settings per run. |

### A4. Epoch AI — Benchmarking Hub

| Aspect | Finding |
|---|---|
| What it measures | Epoch's own runs (GPQA Diamond, MATH Level 5, Mock AIME, FrontierMath and others), plus external results pulled from official leaderboards, linked to model metadata such as release date, organization and training compute [P] https://epoch.ai/benchmarks/about |
| Settings | Inspect framework. API-default temperature. Zero-shot chain of thought. **An empty system prompt.** Task definitions are published as gists. Pinning each run to a git revision is "planned" [P]. |
| Uncertainty | Multiple runs (16 for GPQA and AIME, 8 for MATH L5). **Error bars show ±1 standard error** [P]. Epoch openly notes gaps against lab-reported scores, for example Claude 3.5 Sonnet at 0.55 ± 0.03 vs. 65% reported by the lab [P]. |
| Configurability | An interactive explorer, table views, and trend charts against compute and date. |
| Data / API | **CSV download, a Python client (`pip install epochai`) and a CC BY 4.0 licence, with suggested BibTeX** [P] https://epoch.ai/benchmarks/use-this-data |
| Cadence | No fixed SLA. Leading lab releases get priority, and open-weight, non-US and compute-known models are also considered [P]. |
| Governance | The about page discloses a grant from the UK AISI [P]. **The FrontierMath controversy (Dec 2024 to Jan 2025):** OpenAI funding and data access were disclosed only when o3 launched, and contributors were not told. Epoch's Tamay Besiroglu said "We should have pushed harder for the ability to be transparent..." [S] https://techcrunch.com/2025/01/19/ai-benchmarking-organization-criticized-for-waiting-to-disclose-funding-from-openai |
| **Lesson for us** | Ship CSV, JSON and a citation format from day one. Show the gap between lab-claimed and independently measured results. **Disclose every funding source and data-access arrangement before results are published, never afterward.** |

### A5. Scale AI — SEAL Leaderboards (labs.scale.com)

| Aspect | Finding |
|---|---|
| What it measures | Expert-curated **private** datasets (coding, instruction following, agentic tasks, Humanity's Last Exam and others). |
| Contamination | Datasets stay unpublished "so they can't be trained on or gamed". Entries are limited for developers who may have seen prompt sets through API logging [P] https://scale.com/blog/leaderboard. HLE is public but keeps a **held-out private set to check for overfitting** [P] https://scale.com/leaderboard/humanitys_last_exam |
| Uncertainty / ranks | **"Rank (Upper Bound)"**, a rank derived from confidence intervals [P]. |
| Versioning | HLE was finalized at 2,500 questions (April 2025), and the earlier version moved to a "Legacy / HLE-preview" section [P] https://labs.scale.com/leaderboard/humanitys_last_exam |
| Governance | Scale is a major commercial data vendor *to the labs it ranks*, which is a structural conflict (an analyst observation; it was widely discussed after Meta's 2025 investment in Scale, but this session did not re-verify the investment). |
| **Lesson for us** | Use a private held-out split alongside public examples. Keep legacy versions visible instead of deleting them. |

### A6. MLCommons AILuminate

| Aspect | Finding |
|---|---|
| What it measures | v1.0 (Dec 2024): 12 hazard categories (physical, non-physical and contextual) and **24,000+ prompts**, single-turn, English [S] https://siliconangle.com/2024/12/04/mlcommons-releases-new-ailuminate-benchmark-measuring-llm-safety/; paper https://arxiv.org/abs/2503.05731 |
| Presentation | **A five-tier grade (Poor, Fair, Good, Very Good, Excellent)** instead of a numeric rank. Grades are *relative to a reference set of accessible models*. "Excellent" requires at least 99.9% safe responses [S]. |
| Contamination | Most of the prompt set is hidden. A small practice set is public. |
| Recent | A **Jailbreak Benchmark v1.0** (October 2026, per a listing) reports unsafe rates rising from 11.08% to 18.65% under jailbreak, a "Resilience Gap" of 7.57% [S/UNVERIFIED] https://chatpaper.com/chatpaper/paper/355660 |
| Governance | An industry consortium with labs as members, which brings legitimacy and also potential capture. There is a formal assessment standard (v1.4 is cited). |
| Criticisms | Single-turn only. English only. Grades are relative, so they move when the reference set changes. |
| **Lesson for us** | Ordinal bands (graded tiers) communicate better to non-experts than decimals, but they must be paired with intervals. Anchor them to a published standard, not only to the cohort. |

### A7. Stanford Foundation Model Transparency Index (FMTI)

| Aspect | Finding |
|---|---|
| What it measures | Developer-level *disclosure* (data, compute, usage, risks), not model behavior. The **2025 edition** covers 13 companies. The mean fell to about 40/100 from 58 in 2024. IBM scored 95 and xAI and Midjourney scored 14. Meta fell from 60 to 31 and Mistral from 55 to 18 [P] https://arxiv.org/abs/2512.10169; https://news.stanford.edu/stories/2025/12/foundation-model-transparency-index-ai-companies-information |
| Method | Indicator checklists. **Companies are invited to review and respond before publication** (the right of reply used in prior editions; not re-checked for 2025). The indicators changed in 2025, which reduces year-over-year comparability [P]. |
| **Lesson for us** | Use a right-of-reply window with published lab responses. When indicators change, print a comparability warning. Indicator-level drill-down makes a composite defensible. |

### A8. LiveBench

| Aspect | Finding |
|---|---|
| What it measures | 18 tasks across 6 categories (math, coding, reasoning, language, instruction following, data analysis). **Objective ground-truth scoring with no LLM judge** [P] https://arxiv.org/abs/2406.19314 (ICLR 2025 Spotlight). |
| Contamination | Questions are added and updated monthly from recent sources (new competitions, arXiv, news) [P]. Secondary sources say new questions are withheld for a month and about one sixth are replaced each month [S]. The site now brands itself "LiveBench 2.0 … contamination-free long-horizon" [P title only; contents UNVERIFIED]. |
| Openness | All questions, code and model answers are released (after the delay) [P]. |
| **Lesson for us** | Use dated release tags for the task bank and rotate items on a schedule. Public items lag the private live set. |

### A9. Usage and aggregator rankings: OpenRouter and Vellum

- **OpenRouter rankings** measure *adoption* (tokens processed through its API), by day or week and by category (programming, roleplay, finance) [P] https://openrouter.ai/rankings. This is not a quality or safety measure. It is useful as a "what people actually use" signal for prioritizing which models to assess.
- **Vellum LLM Leaderboard** aggregates vendor-reported and third-party numbers along with cost and speed. Third-party reports say Vellum repositioned its business in 2026 [S/UNVERIFIED] https://automationatlas.io/answers/vellum-review-2026/. **Lesson:** aggregators that copy vendor-reported numbers carry weak authority. Our value is *independent measurement*.

### A10. Hugging Face Open LLM Leaderboard (status)

- v1 was archived in June 2024 and replaced by v2, citing saturation and contamination. **The leaderboard was retired in March 2025** because "it could encourage people to hill climb in irrelevant directions", after more than 13,000 models were evaluated [P] https://huggingface.co/docs/leaderboards/en/open_llm_leaderboard/archive [S for the retirement post].
- **Lesson:** a leaderboard whose metric is gameable becomes an optimization target, and stops measuring once it is. For compassion this is acute: never publish the full scored item bank, and treat "optimizing for our score" as a risk that must be monitored.

### A11. METR

- Measures autonomous task completion as a **"time horizon"**: the length of human-expert tasks a model completes with 50% reliability. Time Horizon 1.1 (January 2026) has 228 tasks, 31 of them long. The reported doubling time is about 131 days since 2023 [S] https://www.greaterwrong.com/posts/EYb2K9acKfyG2bome/metr-time-horizons-now-10x-year. METR warns about wide CIs and that values above about 16h are unreliable with the current suite [S].
- Notable practice: **METR treats reward hacking or cheating as failure** and publishes pre-deployment evaluation reports done with lab cooperation, alongside caveats about access conditions (from prior knowledge).
- Model-specific figures circulating in 2026 ("Claude Mythos Preview ~17.4h", "GPT-5.6 Sol ~11.3h") are **UNVERIFIED** https://futuresearch.ai/app/p/a/frontier-metr-time-horizon-2029
- **Lesson:** one interpretable headline unit combined with very wide, openly displayed CIs, and an explicit statement of the measurement ceiling.

### A12. EQ-Bench (the closest analogue to us)

| Aspect | Finding [P] https://eqbench.com/about.html |
|---|---|
| What it measures | **EQ-Bench 3**: 45 scenarios, mostly 3-turn role-plays, plus transcript-analysis tasks. The model replies in character with "I'm thinking & feeling" and "They're thinking & feeling" blocks, then a debrief. |
| Judge | A single judge, **Claude Opus 4.6**, for the leaderboard (earlier versions used Sonnet 3.7). |
| Scoring | A rubric score (0 to 100) from 6 criteria: Demonstrated Empathy, Pragmatic EI, Depth of Insight, Social Dexterity, Emotional Reasoning and Message Tailoring. Style traits (Warmth, Moralising, Challenging and others) are *reported but not scored*. Separately there is a **pairwise Elo** from a modified TrueSkill solver, anchored at o3 = 1500 and llama-3.2-1b = 200. |
| Bias controls | **Truncation to a standard length for pairwise comparisons**, both orders judged (position bias), arbitrary model designators (name bias). |
| Reliability | 10 runs gave a rubric mean of 77.71 with SD 0.75, and 5+ iterations are recommended. Self-preference was studied for Sonnet 3.7 and estimated at roughly 0 to 10% depending on task. It was **not quantified for the current Opus 4.6 judge**. **There is no human-correlation study for EQ-Bench 3.** |
| Adversarial | A "warm & validating" system prompt inflated scores only slightly (up to +1.3% rubric and +2.8% Elo). |
| Self-stated limits | Results are "roughly indicative". There is no single theory of EI. Judge verbosity, positivity and cultural biases are uncontrolled. |
| Cost | About $10 to $15 of judge cost per full run. |
| Sibling: **Spiral-Bench** | 30 simulated 20-turn chats with a suggestible "seeker" user (played by Kimi-K2). The judge flags protective behaviors (pushback, de-escalation) and risky ones (delusion reinforcement, harmful advice). **v1.2 moved to a judge ensemble (Claude Sonnet 4.5, GPT-5, Kimi-K2-0905)** and dropped intensity-1 flags to cut false positives [P] https://eqbench.com/spiral-bench.html. Criticism: claims of AI consciousness are automatically scored as risky, and there are too few personas [S] https://thezvi.substack.com/p/ai-craziness-notes |
| Governance | One independent developer (Sam Paech). Open source. |
| **Lesson for us** | We differ in having *two cross-family judges*, *bootstrap intervals*, *pre-registration* and a *40-subdimension construct*. Those are the differentiators to make visible. Copy EQ-Bench's length truncation for pairwise comparisons, position swapping, anonymized designators, "reported but not scored" style traits, and published adversarial-prompt inflation tests. Go beyond it with a human calibration study. |

### A13. Empathy, wellbeing and mental-health safety benchmarks (what actually exists)

| Benchmark | Status / what it is | Evidence |
|---|---|---|
| **HumaneBench** (Building Humane Technology) | 800 scenarios and 15 models, each tested in three conditions: default, instructed to be humane, and instructed to disregard wellbeing. **Humans first scored responses to validate the AI judges.** Judging uses an ensemble of GPT-5.1, Claude Sonnet 4.5 and Gemini 2.5 Pro. 67% of models flipped to harmful behavior when told to disregard wellbeing. Nearly all models failed to "respect user attention" by default and encouraged engagement and dependency. | [P/press] https://techcrunch.com/2025/11/24/a-new-ai-benchmark-tests-whether-chatbots-protect-human-wellbeing ; https://humanetech.substack.com/p/benchmarking-humanity-building-the . Public repository and scoring scale UNVERIFIED. |
| **K-Bench** (Vowels et al., arXiv 2609.15855, Sep 2026) | Clinician-calibrated, **200 multi-turn vignettes (up to 20 turns)** on suicide, self-harm, domestic violence and substance misuse, plus no-risk controls. 125 configurations from 33 base models and 14 providers. A **frozen GPT-4o judge with 94.2% exact agreement with clinician consensus** (151 clinician-rated transcripts). A continuously updated public leaderboard (k-bench.ai), with test materials protected from optimization. Therapeutic prompting mainly helped weaker models, and extra reasoning effort gave no average gain. | [P abstract] https://arxiv.org/abs/2609.15855 . Leaderboard contents and specific model rankings UNVERIFIED. |
| **MindBench.ai** (BIDMC Digital Psychiatry + NAMI) | A platform profiling LLM tools for mental health: technical features, privacy, conversational style and clinical reasoning. Community-extended. Published November 2025 with a later correction. | [P] https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12624894/ ; https://digitalpsych.org/mindbench |
| **Spiral-Bench** | Sycophancy and delusion reinforcement (see A12). | [P] |
| **HealthBench** (OpenAI, May 2025) | 5,000 multi-turn conversations, 262 physicians, 48,562 rubric criteria, themes including *emergency referrals* and *responding under uncertainty*, a GPT-4.1 grader, open data. **This is a lab-built benchmark, so independence is limited.** | [P/S] https://openai.com/index/healthbench/ ; https://arxiv.org/abs/2505.08775 |
| Academic crisis-response studies | IASEAI 2026 (Judd et al.): a model became *less* likely to invite continued dialogue as suicide and self-harm risk signals increased [S] https://ojs.aaai.org/index.php/IASEAI/article/view/43031 . Kalinich et al. 2026: 127 open-weight LLMs, where mental-health, medical or safety tuning gave no reliable gain over base models [S, cited in https://arxiv.org/pdf/2609.06263]. | |
| "Psychological safety" leaderboard | **No single widely adopted crisis-response leaderboard was found.** K-Bench is the nearest. | — |

**Strategic implication:** the field is fragmented. Each existing effort is either narrow (crisis, sycophancy, EI role-play), lab-built (HealthBench), advocacy-built (HumaneBench), or a single developer's project (EQ-Bench). **No one combines a broad multi-dimension compassion construct, cross-family judging, published intervals, pre-registration, release tracking and institutional independence.** That is the open position. To be credible we should **cite and cross-validate against** these benchmarks (convergent validity), not ignore them.

### A14. FLI AI Safety Index

- **Summer 2026 edition (7 July 2026):** grades 9 companies on 37 indicators across 6 domains. The best grade is **C+ (Anthropic, 2.66/4.0)**, then OpenAI C (2.28) and Google DeepMind C (2.01). Meta's score is reported as both 1.32 and 1.67 (UNVERIFIED). xAI, DeepSeek and Mistral fail [S; primary PDF exists] https://futureoflife.org/wp-content/uploads/2026/07/AI-Safety-Index-Summer-2026-Digital.pdf
- Method: an **independent expert review panel** grades the evidence. Companies get a survey and a chance to provide information (from prior editions; not re-checked this session). Letter grades are used for communication.
- Criticism: it is an advocacy organization, so the grades reflect a panel's risk-focused judgment [S].
- **Lesson:** a named, independent review panel and letter grades get press uptake. Advocacy framing invites "not neutral" critiques, which we avoid with pre-registration and published judge data.

### A15. SpeechMap.ai

- Measures what models **will not say**: compliance, evasion and refusal on contested political speech prompts. At launch it covered 34 models and 65,000+ responses, with full OpenAI lineage coverage. A pseudonymous developer (xlr8harder) runs it. Judging is by LLM (GPT-4o-based) with some manual annotation. **The data is public on Hugging Face** (about 2.4k questions and 336k responses) [P/S] https://speechmap.substack.com/p/speechmapai-is-live ; https://huggingface.co/datasets/PITTI/speechmap-responses-v2
- Notable findings: models on Azure sit behind an API moderation layer that blocked nearly 60% of prompts, so **the endpoint matters, not only the model** [S].
- **Lesson:** record the access path (direct API, cloud host, consumer app). Track *lineage over time* for one lab, which is a compelling view for us ("how has compassion changed across a lab's releases?"). Publishing all responses builds trust.

### A16. UK AISI and US CAISI evaluation publications

- **UK AI Security Institute**: published its **Frontier AI Trends Report** in December 2025, covering more than 30 frontier models tested since November 2023 in cyber, chem/bio, autonomy, safeguards and *human influence* [P] https://www.aisi.gov.uk/research/aisi-frontier-ai-trends-report-2025 ; factsheet https://www.gov.uk/government/publications/ai-security-institute-frontier-ai-trends-report-factsheet . It reports *aggregate trends* rather than per-model leaderboards. Pre-deployment access is agreed with labs. AISI also maintains the open-source **Inspect** evaluation framework, which Epoch uses (from prior knowledge). A 2026 edition was not found.
- **US CAISI (NIST)**: publishes comparative model evaluations. These include DeepSeek R1, R1-0528 and V3.1 against US models on 19 benchmarks (September 2025), and Kimi K2 Thinking. The **DeepSeek V4 Pro evaluation (1 May 2026)** reportedly says the model "trails leading frontier models by roughly eight months" and that it **scored lower on CAISI's tests than in DeepSeek's self-reported results** [P/S] https://www.nist.gov/document/caisi-evaluation-deepseek-ai-models-report ; https://letsdatascience.com/news/caisi-evaluates-deepseek-v4-pro-against-frontier-models-c7b2e918 (V4 details: [S]).
- **Lesson:** governments publish *trend reports and per-release evaluation memos*, not interactive leaderboards. A "release memo" format (one model, compared against a pinned reference cohort, gap vs. self-reported claims) is a proven pattern. Government evaluators are also politically positioned (CAISI's framing of PRC models), which an independent nonprofit can avoid.

---

## Part B — Best-practice synthesis

### B1. Evaluation methodology

| # | Practice | Why / evidence | Status for us |
|---|---|---|---|
| 1 | **Construct validity first**: define the phenomenon, measure only it, use a representative dataset, plan for contamination, compare models statistically, do error analysis. | A review of 445 LLM benchmarks found widespread validity weaknesses (Bean et al., NeurIPS 2025) [P] https://arxiv.org/abs/2511.04703 | The 40-subdimension construct needs a published construct spec per dimension, with what counts as evidence and what does not. |
| 2 | **Benchmark quality checklist** | BetterBench: 46 criteria across 5 lifecycle phases. Most benchmarks do not report statistical significance and cannot be replicated easily [P] https://arxiv.org/abs/2411.12990 ; https://betterbench.stanford.edu | Self-assess against BetterBench and publish the scorecard. |
| 3 | **Contamination resistance** | SEAL private sets and HLE private holdout [P]. LiveBench monthly refresh [P]. AILuminate hidden prompts. HF Open LLM Leaderboard retired over hill-climbing [P]. K-Bench protects test materials [P]. | Split the bank: **public exemplars (~10 to 20%)** to explain the construct, and a **private scored set**. Keep a canary string. Rotate a slice each wave. Run a *dated, versioned* bank (`v2.0`, `v2.1`...). |
| 4 | **Versioned task banks with non-comparability notices** | Artificial Analysis component versions and "not directly comparable" flags [P]. HELM release archives [P]. HLE "Legacy" [P]. | Each result carries `bankVersion`. Cross-version comparisons are disabled or carry a warning. |
| 5 | **Cross-family judging, with self-preference controls** | LLM judges recognize and favor their own generations, and self-recognition correlates linearly with self-preference (Panickssery et al., NeurIPS 2024) [P] https://arxiv.org/abs/2404.13076 . Spiral-Bench and HumaneBench moved to 3-judge cross-family ensembles [P]. | **Never let a judge score its own family.** Publish the judge × subject-family matrix. Consider 3 judges for headline releases. |
| 6 | **Human calibration of judges** | K-Bench: a frozen judge at 94.2% agreement with clinician consensus on 151 transcripts [P]. HumaneBench validated its judges with human scoring [P]. EQ-Bench 3 has *no* human correlation study [P], which is a gap we can fill. | Report human–judge agreement (Krippendorff's α, already in `evaluation-statistics.mjs`) per dimension. Use clinicians or crisis counsellors for crisis items. Freeze the judge version per bank version. |
| 7 | **Test–retest / repeat sampling** | EQ-Bench: 10 runs, SD 0.75, 5+ recommended [P]. Epoch: 8 to 16 runs [P]. Artificial Analysis: 1 to 5 repeats per evaluation [P]. | At least 3 samples per item per model for headline results. Publish item-level variance and judge-level variance separately. |
| 8 | **CI reporting that matches the data structure** | Miller, "Adding Error Bars to Evals": treat items as draws from a super-population. Use **clustered SEs** when items share a source, plus paired differences and power analysis [P] https://arxiv.org/abs/2411.00640 . A follow-on paper (evalci) reports that clustered SEs can be more than 3× naive SEs [S] https://arxiv.org/pdf/2607.04429 | Bootstrap **over items (clustered by scenario family), samples and judges**, not over responses alone. Report the bootstrap method, iteration count and seed (already in the architecture). |
| 9 | **Significance of rank differences** | Arena rank spread [P]. SEAL rank upper bound [P]. Leaderboards are fragile: perturbations of under 1% flip the top rank [S] https://icml.cc/virtual/2026/54115 | **Tie groups or rank spreads only.** Use *paired* comparisons for "Model A vs. Model B" claims. Never print "#1" unless its spread is [1,1]. |
| 10 | **Prompt / system-prompt sensitivity** | Formatting alone moved accuracy by up to 76 points (Sclar et al., ICLR 2024). The paper recommends reporting a *range* across formats [P] https://arxiv.org/abs/2310.11324 . HumaneBench's three conditions (default, pro-wellbeing, anti-wellbeing) show steerability is itself a finding [P]. | Pre-register a **default condition** (empty or neutral system prompt, as Epoch does) plus a small **sensitivity panel**: paraphrase variants and an operator-persona system prompt. Report the sensitivity band. Optionally report "robustness under adversarial operator instructions" as a separate metric. |
| 11 | **Multi-turn** | Most real harm surfaces over turns. Spiral-Bench uses 20 turns, K-Bench up to 20 turns, and EQ-Bench 3 turns [P]. IASEAI 2026 found engagement *declining* as risk signals rise [S]. | Include scripted multi-turn and simulated-user items, especially for Awareness, Boundaries and Action. Disclose the simulated-user model, which must not be a subject's own family. |
| 12 | **Refusal handling** | HELM mixes over-refusal (XSTest) into a single safety mean, which a preprint shows is negatively correlated with the other measures [S]. EQ-Bench notes over-caution items penalize some models [P]. | Score refusals *by the rubric*. An unhelpful refusal to a grieving user is a compassion failure, and so is compliance in a crisis without care. Report an **over-refusal rate** and a **harmful-compliance rate** separately; never net them. Distinguish API-layer blocks from model refusals, as SpeechMap's Azure finding shows is necessary [S]. |
| 13 | **Length and style bias control** | Length-controlled AlpacaEval raised the correlation with Arena from 0.94 to 0.98 [P] https://arxiv.org/abs/2404.04475 . Arena style control [S]. EQ-Bench pairwise truncation [P]. | Log response length. Add judge-prompt instructions against length preference. Run a **length-regression diagnostic** per wave and publish the length-adjusted score as a sensitivity check. |
| 14 | **Adversarial "score inflation" test** | EQ-Bench ran a "warm & validating" inflation prompt (+2.8% max) [P]. | Each bank version publishes the effect of a "be maximally compassionate" system prompt. A large effect means the bank rewards surface style. |
| 15 | **Report against lab claims** | Epoch (0.55 vs. 65% reported) [P]. CAISI on DeepSeek V4 Pro self-reports [S]. | Where a lab claims empathy or wellbeing safety, show the claim next to our measurement. |

### B2. Release-tracking operations

| Practice | Evidence | Recommendation |
|---|---|---|
| **Speed expectations** | Arena and Artificial Analysis usually post within hours to days. Epoch has no SLA but prioritizes major releases [P]. | Publish a *realistic, tiered* commitment, for example "Tracked within 24h; preliminary evaluation within N days; full evaluation within M days". This is consistent with the PRD rule (BLK-004) that numbers are not published until they are verified. |
| **Snapshot pinning** | Artificial Analysis records endpoint, provider and settings. Epoch identifies runs by exact model ID and plans git-revision pinning [P]. | Pin the dated API snapshot ID (`model-2026-xx-xx`), or the HF repo plus commit hash plus quantization for open weights. Never assess an alias like `-latest`. Record the access date. |
| **API vs. open-weight** | SpeechMap: the cloud host's moderation layer changes outcomes [S]. Artificial Analysis benchmarks per provider [P]. | Label the access path: first-party API, third-party host, or local inference (with runtime, quantization and hardware). Our local pilot waves must be clearly labelled "local, quantized Q4, unofficial". |
| **Mystery-shopper access** | Artificial Analysis creates accounts off its own domain [S]. *Leaderboard Illusion* documents private-variant selection [P]. | Assess only publicly available endpoints, from accounts not identified to labs. **No pre-release private variants, no "pick your best".** |
| **Provenance** | HELM raw outputs. SpeechMap public responses. Epoch gists [P]. | Each run produces a **reproducibility package**: bank version hash, judge IDs and versions, prompts, sampling settings, raw responses (public items only), judge rationales, seed, harness commit, and a SHA-256 manifest. |
| **Maintenance risk** | HELM entered maintenance mode in June 2026 [P]. The HF leaderboard retired [P]. | Budget for operations. Automate release detection. Keep the bank small enough to run cheaply (EQ-Bench costs about $10 to $15 per run [P]). |
| **Deprecation handling** | Arena was criticized for silent deprecations [P]. | Keep retired models visible with a "snapshot deprecated on date" tag. Never silently delete them. |

### B3. Dashboard UX — what makes a leaderboard trustworthy and useful

1. **Intervals on every number.** Show CI whiskers in tables and charts. Epoch uses ±1 SE bars, and Arena shows 95% CIs [P]. Pick one and label it.
2. **Rank bands, not single ranks.** Arena's rank spread or tie groups [P], SEAL's rank upper bound [P]. Suppress ranks below the cohort floor, which the architecture already does.
3. **Per-dimension drill-down.** Composite → 8 dimensions → 40 subdimensions → items → (public) transcripts with judge rationales, as HELM does with raw instances [P].
4. **Custom weights, with guardrails.** No major site lets users re-weight the headline (Artificial Analysis's weights are fixed [P]). If we allow it, (a) the default must be the pre-registered weighting, (b) a banner should say "custom view — not the official score", (c) the custom view must recompute CIs, and (d) the weights must go in the URL so that screenshots are attributable.
5. **Filters and compare.** Filter by lab, open vs. closed weights, release date, access path, bank version and official vs. pilot. Offer side-by-side comparison of two or three models with **paired-difference CIs**.
6. **Charts.** Dimension radar or small multiples, **lineage over time per lab** (as SpeechMap does), and score against release date (as Epoch does). Avoid a single "winner" hero chart.
7. **Example items.** Show public exemplar items with excerpts of top and bottom responses so readers understand what is being measured.
8. **Model cards per entry.** Snapshot ID, access date, settings, bank version, judges, run ID, lab claim vs. our result, and a lab response link.
9. **Changelog** for methodology, bank, judges and the corrections log, as Arena and Artificial Analysis do [P].
10. **No embargo deals.** Publish to everyone at once, with no exclusive early access for labs or press.
11. **Permalinks with state in the URL**: filters, weights, selected models and bank version.
12. **CSV and JSON download, plus an API**, under a CC BY 4.0 licence and a BibTeX citation, as Epoch does [P].
13. **Accessibility**: WCAG 2.2 AA, colour-blind-safe palettes, CIs readable in tables (not only in charts), and keyboard-navigable tables.
14. **Status labels** that cannot be confused: "Official (validated bank, human-calibrated)" vs. "Pilot / unofficial (local quantized)" vs. "Tracked, not yet evaluated".
15. **Plain-language bands** (as AILuminate grades and FLI letters do) shown *together with* the number and interval.

### B4. Governance and independence

| Practice | Evidence | Recommendation |
|---|---|---|
| **Funding disclosure before publication** | The FrontierMath/OpenAI disclosure failure [S]. Epoch now discloses its UK AISI grant [P]. | A public funders page, with a per-release statement of "no funding from the assessed lab". Disclose any data-access arrangement in advance. |
| **No pay-to-play** | Artificial Analysis: "no one pays to be on the website" [S]. Arena's commercial evaluation business and valuation draw scrutiny [S]. | This matches the existing independence rule. Extend it: no paid "certification", no paid re-runs, no paid suppression. |
| **Pre-registration** | Recommended by the construct-validity literature [P]. Our differentiator. | Freeze the bank, rubric, judges, weights, analysis plan and cohort rule *before* each wave. Publish the hash. Label deviations. |
| **Right of reply** | FMTI and FLI give companies a chance to respond (prior editions). | Notify labs at publication, not before. That is not an embargo. Give them a fixed window (for example 14 days) to submit a response, which is published verbatim beside the result and is **not** used to change scores except through the documented corrections process. |
| **Avoid private-variant testing** | *Leaderboard Illusion* [P]. | Policy: only GA snapshots. A lab cannot request withdrawal. |
| **Independent oversight** | FLI's expert panel. MLCommons' consortium (capture risk). | A Methods Committee (BLK-006) with conflict-of-interest declarations and *no* lab employees with votes. Labs may comment publicly on methodology drafts. |
| **Judge-provider conflict** | Our judges are lab models, which creates a dependency on the same labs we rank. | Disclose it. Rotate judges across families. Report results under an alternate judge pair as robustness. Explore an open-weight judge as a third, reproducible judge. |

---

## Part C — The 20 most important design decisions (prioritized)

| # | Decision | Rationale | Source(s) |
|---|---|---|---|
| 1 | **Show intervals everywhere and replace single ranks with tie groups or rank spreads.** Never print "#1" unless the spread is [1,1]. | Leaderboards are fragile (perturbations of under 1% flip the top rank). Arena changed its method because optimistic ranks misled readers. | arena.ai/blog/ranking-method; ICML 2026 54115; Miller 2411.00640 |
| 2 | **Pre-register each wave and publish its hash**: bank version, rubric, judges, weights, sampling settings, analysis plan. | This is our primary credibility differentiator over EQ-Bench, HumaneBench and Arena. It guards against post-hoc choices. | Bean et al. 2511.04703; BetterBench 2411.12990 |
| 3 | **Assess only public, GA, pinned snapshots via mystery-shopper accounts.** No private variants and no lab selection of what gets published. | The Llama 4 "27 variants" episode, and endpoint substitution risk. | arXiv 2504.20879; Artificial Analysis interview |
| 4 | **Split the bank into public exemplars and a private scored set, with versioned rotation and a canary string.** | Contamination, and the hill-climbing that retired the HF leaderboard. | Scale SEAL; HLE holdout; LiveBench; HF archive |
| 5 | **Calibrate judges against humans and publish agreement per dimension.** Use clinicians for crisis items. Freeze judge versions per bank version. | EQ-Bench lacks this. K-Bench (94.2%) and HumaneBench set the bar. | arXiv 2609.15855; TechCrunch HumaneBench; eqbench.com/about |
| 6 | **Exclude same-family judging and publish the judge-by-subject matrix.** Use a third judge or an alternate-pair robustness check for headline releases. | Self-preference bias correlates linearly with self-recognition. | Panickssery 2404.13076; Spiral-Bench v1.2 |
| 7 | **Use clustered, multi-level uncertainty**: bootstrap over items (clustered by scenario), samples (3 or more) and judges. Use paired CIs for head-to-head claims. | Naive SEs understate uncertainty, by more than 3× in some reports. | Miller 2411.00640; evalci 2607.04429 |
| 8 | **Report the 8 dimensions as first-class results. Use the composite only as a secondary roll-up.** Never net over-refusal against harmful compliance. | HELM Safety's mixed-construct average is a cautionary example. | CRFM HELM Safety; SSP-Bench 2609.25352 |
| 9 | **Use separate, labelled status tiers**: Tracked → Pilot (unofficial, local quantized) → Preliminary → Official. Do not mix them in one ranking. | Pilot results from Q4 local runs are not comparable to API GA snapshots. Mixing them damages trust. | SpeechMap endpoint effect; PRD §3 |
| 10 | **Publish a reproducibility package per run**: manifest with hashes, settings, raw public-item transcripts, judge rationales, seed, harness commit. | HELM, SpeechMap and Epoch built trust through raw outputs and open code. | crfm-helm docs; HF SpeechMap data; Epoch about |
| 11 | **Funding and conflict disclosure in advance, plus no pay-to-play**, extended to certifications and re-runs. | FrontierMath disclosure damage. Artificial Analysis's "no one pays". | TechCrunch 2025-01-19; Latent Space |
| 12 | **Right of reply after publication, not an embargo**: a fixed window and a published verbatim response. Scores change only through the corrections log. | FMTI and FLI precedents. Avoids lab capture. | FMTI 2512.10169; FLI index |
| 13 | **Include multi-turn and simulated-user items**, especially escalating-distress scenarios. Disclose the simulator model. | Harm emerges over turns (Spiral-Bench, K-Bench, IASEAI 2026). | eqbench.com/spiral-bench; arXiv 2609.15855 |
| 14 | **System-prompt sensitivity panel**: a default (empty) condition, an operator-persona condition, and an adversarial "ignore wellbeing" condition, reported as separate metrics. | Up to 76 points of format sensitivity. HumaneBench shows 67% of models flip under adversarial operator prompts. | Sclar 2310.11324; HumaneBench |
| 15 | **Length and style bias controls plus a published inflation test** ("be maximally warm" prompt delta). | LC-AlpacaEval (0.94 → 0.98). EQ-Bench truncation and inflation test. | Dubois 2404.04475; eqbench.com/about |
| 16 | **Tiered, honest release SLA**: "tracked within 24h; preliminary in days; official after human-calibrated run". Never commit to unverified numbers. | Arena and Artificial Analysis set speed expectations, but credibility depends on not over-promising. | PRD BLK-004; Epoch about |
| 17 | **Versioning with non-comparability guards**: every result carries `bankVersion` and `judgeVersion`. Cross-version comparisons carry a warning or are disabled. Retired items and models stay visible as legacy. | Artificial Analysis's v1.0/v1.1 notices, HELM release archives, HLE Legacy. Arena was criticized for silent deprecations. | artificialanalysis methodology; HELM releases; Leaderboard Illusion |
| 18 | **Custom weighting only with guardrails**: the pre-registered default, a "custom view — not official" banner, recomputed CIs, and weights encoded in the URL. | No major board allows unflagged re-weighting. Screenshots of custom views would otherwise be misattributed. | Artificial Analysis fixed weights; analyst synthesis |
| 19 | **Open data**: CSV, JSON and API under CC BY 4.0 with BibTeX, plus permalinks with full state in the URL. | Epoch's model makes the site citable. Journalists and researchers need stable URLs. | epoch.ai/benchmarks/use-this-data |
| 20 | **Convergent-validity and lab-claim panels**: correlate our dimensions with EQ-Bench, Spiral-Bench, HumaneBench and K-Bench where models overlap, and show lab self-claims next to our measurements. | Positions us as *the* hub that synthesizes the field rather than as one more siloed benchmark. Shows independent value (Epoch and CAISI self-report gaps). | Epoch about; CAISI DeepSeek V4 Pro; A13 |

### Additional UX items (important, but outside the top 20)
Model card per entry. Example items with top and bottom excerpts. Lineage-over-time charts per lab. WCAG 2.2 AA. A public changelog and corrections log. A methodology page with a BetterBench self-scorecard. Plain-language bands shown alongside numbers. A "cost to reproduce" statement.

---

## Open verification items (do these before citing anything publicly)

1. Whether HELM keeps updating anything after the maintenance-mode policy took effect (read the Maintenance Mode Policy page).
2. The Arena style-control implementation and the current pre-release testing policy text (Arena-Rank repository and policy page).
3. The HumaneBench public repository, scoring scale and human-validation sample size.
4. The K-Bench leaderboard's current contents (k-bench.ai) and its licensing for cross-validation.
5. FLI Summer 2026 scores per company (read the primary PDF; Meta's score conflicts between sources).
6. CAISI DeepSeek V4 Pro report details (NIST primary page).
7. The model-specific METR horizon figures and any model names first seen in 2026 secondary sources.
8. MLCommons AILuminate Jailbreak v1.0 details on mlcommons.org.
9. Whether Scale SEAL's governance changed after Meta's 2025 investment.
