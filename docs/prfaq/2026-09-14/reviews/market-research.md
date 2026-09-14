# Market Research Review — CB-MODEL and Continuous Research
**Reviewer lens:** Market, customers, alternatives, positioning
**Date:** 2026-09-14

---

## 1. Scope + sources

### Tooling constraint (read this before the rest of the document)

This review's task brief authorizes up to 25 WebSearch calls "to verify current alternatives."
**No WebSearch or WebFetch tool was exposed to this agent in this session** — the available
toolset was Read/Grep/Glob/Edit/Write only. No live web verification was possible. This mirrors a
constraint a prior market-research pass hit on 2026-09-10 (`docs/MARKET_MODEL_BENCHMARK.md`,
BLK-001-adjacent). Consequently:

- Every external (non-repo) claim below is either (a) inherited from a **prior agent's dated,
  source-labeled research already in this repository**, cited with that agent's date and source
  label — not independently re-verified this session — or (b) drawn from this model's training
  knowledge (cutoff January 2026) and marked **[TRAINING, unverified]**.
- Where the task brief requires a URL for every external claim, and no exact URL exists in the
  repository record, this is stated explicitly as **NO URL CAPTURED** rather than a fabricated
  link. Domain-level sources recorded by the prior agent (e.g. "ethisphere.com") are preserved as
  given.
- No market size, customer count, revenue figure, or demand number is asserted anywhere below
  unless it traces to a specific repository file. Absence of evidence is stated as absence, not
  papered over.

### Repo files read this session

- `docs/MARKET_MODEL_BENCHMARK.md` (2026-09-10, market-research agent) — CB-MODEL competitive
  landscape, differentiation, demand evidence, risks, positioning recommendation. Most load-bearing
  source for §3–§6 below on the CB-MODEL side.
- `docs/PRD_MONETIZATION.md` (2026-05-17) — live Score-Watch product spec, independence-policy
  enforcement mechanics, monetization roadmap and scoring for Continuous Research.
- `docs/GRANT_PROPOSAL_2026-09.md` (DRAFT, not submitted) — current index scale (1,327 entities),
  the seed/placeholder data-quality defect (59% of entities un-individually-assessed as of
  2026-08-20), pipeline reliability incidents, and the independence-policy statement as currently
  operated.
- `docs/ORGANIC_GROWTH_PERSONAS_2026-07-14.md` — persona map, and a **"nonprofit model"** framing
  ("explicitly NOT sales, tiers, or lead-gen") that is live in this doc but not reflected in
  `CLAUDE.md` or the live `gumroad.ts` state (see Finding F-07).
- `docs/ORGANIC_GROWTH_COMPETITIVE_2026-07-14.md` (competitive-researcher, web-sourced, dated
  2026-07-12/14) — the only doc in the corpus with dated, live web research on Continuous
  Research's competitive landscape (FLI AI Safety Index, Ethisphere, WBA CHRB, B Corp, EIU,
  RepTrak, JUST Capital, Democracy Index/Freedom House). Domain-level sources only; no full URLs
  captured in the original doc.
- `research/MARKET_CANDIDATES_2026-04-18.md` — buyer-segment analysis, comparable-institution
  pricing (MSCI, Sustainalytics, RepRisk, ISS, Bloomberg/Refinitiv ESG, B Lab, CDP), five revenue
  candidates with explicit "no institutional relationship has been tested" caveat.
- `research/MARKET_REVIEW_UPDATES_2026-05-19.md` — presentation-practice comparison across 11
  benchmark publishers (Freedom House, Transparency International, EIU, RSF, Edelman, RepRisk/
  Sustainalytics/MSCI, CDP, WJP, SIPRI, ACLED, Our World in Data) — relevant to positioning/format,
  not to buyer demand.
- `CLAUDE.md` (project instructions) — current authoritative description of the product as
  commercial ("sells digital research assets" via Gumroad), which conflicts with the July 2026
  nonprofit framing above (Finding F-07).
- `site/src/app/ai-models/page.tsx` — the live CB-MODEL public page: confirms `evaluatedModelCount`
  is read live from data, states "No model has been scored yet" as the lead sentence, and already
  implements much of the "publish the method, not the score" positioning this review would
  otherwise recommend from scratch.
- `site/src/data/model-benchmark/registry-v1.json` — confirms 0 entries, explicit anti-fabrication
  note in the file's own metadata.
- `.benchmark-ops/BLOCKERS.md` (last updated 2026-09-06) — six open blockers; BLK-002 (no model API
  budget), BLK-005 (no human rating panel), BLK-006 (no Methods Committee) are the three that gate
  any officially labeled CB-MODEL result.
- `docs/PRD_RELEASE_WATCH_AND_BYO_SCORING.md` (DRAFT, 2026-09-10/14) — defines Release Watch and
  Bring-Your-Own-Model scoring; confirms neither feature is monetized directly and BYO scoring is
  framed as a lead-gen/credibility asset for the existing "License the Platform" contact-sales CTA,
  not a new revenue line.
- `site/src/data/gumroad.ts` — confirms Score-Watch ($79/yr) is **live** since 2026-06-22; index
  downloads for U.S. Cities, U.S. States, Universities, Supporter tier, and API access are all
  still `TODO`/`useGumroad: false`.

Not read in full this session (out of scope for this lens or duplicative of the above):
`docs/ORGANIC_GROWTH_CONTENT_2026-07-14.md`, `docs/ORGANIC_GROWTH_PRODUCT_2026-07-14.md`,
`docs/ORGANIC_GROWTH_SEOAEO_2026-07-14.md`, `docs/ORGANIC_GROWTH_MASTER_2026-07-14.md`,
`docs/ARCHITECTURE_MONETIZATION.md`.

---

## 2. Customer segments and jobs-to-be-done per program

### CB-MODEL (AI model benchmarking)

All segments below are **plausible-but-unvalidated** per `docs/MARKET_MODEL_BENCHMARK.md` §4 — no
repo file records an actual buyer conversation, purchase, or citation for this specific product.

| Segment | Job to be done | Evidence status |
|---|---|---|
| AI-governance / safety researchers | Find behavioral evidence on an axis (implicit-distress detection, systemic framing, integrity-under-pressure) that existing safety benchmarks don't test | Plausible; wants open data/reproducibility, not a paid product |
| Enterprise AI procurement / vendor-risk teams | Add an independent behavioral signal to vendor-risk questionnaires for deployed AI tools | Plausible, unvalidated; this buyer typically trusts vendor-supplied documentation or established feeds (Bloomberg, RepRisk) today |
| Journalists / policy commentators | Get a citable, evidence-linked answer to "is Model X safe for use case Y" | Plausible low-friction use; no confirmed citation of the existing AI Labs institutional index found in this repo |
| AI labs themselves | Marketing citation if favorable; contest methodology if unfavorable | No evidence either way; a zero-score-published state removes the incentive to engage at all right now |
| Developers / ML researchers (BYO scoring) | Fast, rubric-anchored, honestly-labeled self-estimate of their own model, instead of improvising by pasting a rubric into a chat assistant | Real, named workaround this feature displaces (`PRD_RELEASE_WATCH_AND_BYO_SCORING.md` §1); not yet built; explicitly not monetized — feeds `/contact-sales` "License the Platform" |
| Regulators (EU AI Act, etc.) | Independent evidence for systemic-risk model evaluation obligations | Unlikely near-term — regulatory use requires exactly the rigor (validated items, secure rotating pool) CB-MODEL does not yet have; a publicly exposed, trainable item bank is close to disqualifying for this audience |

### Continuous Research (institutions)

| Segment | Job to be done | Evidence status |
|---|---|---|
| Journalists / media researchers | Event-driven citable data on a specific entity, ahead of the news cycle | Strong for reach/citation, weak for direct revenue (`research/MARKET_CANDIDATES_2026-04-18.md` Part 1) |
| Investors / ESG-integrated funds / analysts | Differentiated data beyond a risk-lens ESG questionnaire; track a portfolio holding | Moderate-strong signal per comparable-fund analysis; **zero validated institutional relationships** (`MARKET_CANDIDATES_2026-04-18.md` Evidence Gaps) |
| Policy researchers / NGOs / IGOs / think tanks | Citable, CC-BY, evidence-linked figure for a report, brief, or testimony | Plausible and consistent with existing `/media`, `/countries` persona framing; no confirmed citation count |
| HR / DEI / corporate ESG leaders | Peer-benchmark validation of a specific decision (e.g., DEI rollback) | Timely, concentrated signal (Target -10.0 finding) but budget-constrained segment |
| Foundation program officers / funders | Fund public-interest data infrastructure | Named explicitly in `GRANT_PROPOSAL_2026-09.md` (unsubmitted draft); no funder relationship confirmed |
| Educators / students | Classroom-ready institutional accountability data | Low-friction, low-revenue, citation/reach value only |
| Concerned citizens | Curiosity / share ("how does my country/company rank") | Lowest-yield, cheapest acquisition loop (`ORGANIC_GROWTH_PERSONAS_2026-07-14.md` §3) |
| The scored entities themselves | Understand own position before it's public | **Named risk, not a safe product to build** — `MARKET_CANDIDATES_2026-04-18.md` flags this ICP as "needs careful framing" against the independence policy; any "know your score before publication" product is close to the line the independence policy exists to prevent |

---

## 3. Alternatives / competitive landscape

### CB-MODEL alternatives

Source: `docs/MARKET_MODEL_BENCHMARK.md` §1.1 (2026-09-10, itself marked [TRAINING, unverified] by
its author — not re-verified by this session; treat version/governance details as approximate) plus
one dated, previously web-sourced item.

| Name | What it measures | Overlap with CB-MODEL | Differentiation | Source / URL |
|---|---|---|---|---|
| LMSYS Chatbot Arena / LMArena | Crowdsourced blind pairwise human preference (Elo ranking) | General helpfulness/preference, not compassion-specific | CB-MODEL uses fixed rubric anchors, not open voting; not yet run at any scale | [TRAINING, unverified]; NO URL CAPTURED |
| HELM (Stanford CRFM) | Multi-metric holistic eval: accuracy, calibration, robustness, fairness, bias, toxicity | Overlaps EQU/EMP tangentially via fairness/bias metrics | CB-MODEL targets implicit-distress detection and systemic framing, not covered by HELM | [TRAINING, unverified]; NO URL CAPTURED |
| TruthfulQA | Propensity to repeat common falsehoods under adversarial framing | Narrow overlap with ACC (accountability/honesty) | CB-MODEL's ACC axis is about behavioral response to correction, not factual accuracy | [TRAINING, unverified]; NO URL CAPTURED |
| SafetyBench | Multiple-choice safety across offensiveness, bias, health, illegal activity, privacy, ethics | Meaningful overlap with EMP/BND/EQU under different names | CB-MODEL is open-ended and human-rated, not multiple-choice; tests implicit (unstated) distress, not explicit hazard categories | [TRAINING, unverified]; NO URL CAPTURED |
| Anthropic HHH framework / model & system cards | Lab's own internal alignment target and self-reported evals | Adjacent construct (helpful/honest/harmless) | **Not independent by construction** — self-reported by the scored lab; CB-MODEL's independence policy is the explicit contrast | [TRAINING, unverified]; NO URL CAPTURED |
| MLCommons AILuminate | Model safety vs. a hazard taxonomy, letter-grade ratings | Closest format-comparable (automated/LLM-judge grading) | Governed by a multi-stakeholder industry consortium (including some of the same labs scored) — a *governed* conflict, vs. CB's current single-founder structure, which is itself a credibility gap, not an advantage | [TRAINING, unverified]; NO URL CAPTURED |
| DecodingTrust (NeurIPS 2023) | 8-perspective "trustworthiness" composite: toxicity, bias, robustness, privacy, machine ethics, fairness | Closest **structural** precedent — multi-axis composite trustworthiness score | Not framed as compassion; academic, not continuously maintained across institution types | [TRAINING, unverified]; NO URL CAPTURED |
| EQ-Bench | Emotional intelligence via scenario-based, LLM-judge-graded tests | Closest **topical** precedent to "compassion" | Single independent maintainer, not an institution; shares CB-MODEL's exact exposure/gameability problem (published items, judge-graded) | [TRAINING, unverified]; NO URL CAPTURED |
| Stanford Foundation Model Transparency Index (FMTI) | Rates AI **developers** on transparency of training data, labor, downstream impact | Nearest precedent for "score the institution, not the artifact" — CB's own move at the AI Labs index level | Does not evaluate model *behavior* at all | [TRAINING, unverified]; NO URL CAPTURED |
| UK AISI / US CAISI | Pre-deployment technical evaluation for dangerous capabilities (cyber, bio, persuasion, autonomy) | No topical overlap with compassion axes | Government-run, access-gated by lab cooperation, results often not fully public | [TRAINING, unverified]; NO URL CAPTURED |
| **Future of Life Institute (FLI) AI Safety Index — Summer 2026** | Technical-safety-only grading of AI labs | Adjacent to CB's **AI Labs Index** (institution-level), not CB-MODEL directly | FLI is narrow (6 technical-safety domains); CB's AI Labs Index additionally scores Accountability, Equity, Systemic Thinking dimensions FLI does not touch | `docs/ORGANIC_GROWTH_COMPETITIVE_2026-07-14.md`, dated coverage "Jul 7-8 2026" citing futureoflife.org, Time, Axios — domain-level only, **NO exact URL captured**; not re-verified this session |

**Net read carried over from the prior research pass:** roughly half of CB-MODEL's 8-axis
construct (implicit-signal detection in Awareness, Systemic framing, Integrity-under-pressure) is
genuinely underserved by the field as described above. The other half (Empathy, Accountability,
Boundaries, Equity) has real, findable cousins under different names. **Do not claim "compassion"
is an uncontested new category** — this is the single most predictable hostile-FAQ vector (see §6).

### Continuous Research alternatives

Source: `docs/ORGANIC_GROWTH_COMPETITIVE_2026-07-14.md` (dated 2026-07-12/14, web-sourced by a
prior agent; domain-level sources only, not re-verified this session) and
`research/MARKET_CANDIDATES_2026-04-18.md` (2026-04-18).

| Name | What it measures | Overlap | Differentiation | Source / URL |
|---|---|---|---|---|
| MSCI ESG Ratings | Governance/environment risk-lens score for public companies | Fortune 500 coverage overlap | Issuer/AUM-based pricing model; documented conflict-of-interest research (Columbia/Emory per prior doc); ~60% of revenue from indexing | ORGANIC_GROWTH_COMPETITIVE_2026-07-14.md; NO URL CAPTURED |
| Sustainalytics (Morningstar) | ESG Risk Ratings | Fortune 500 overlap | Issuer-pay model in its Sustainable Finance Solutions line (rated company is a paying customer per prior doc) | Same as above; NO URL CAPTURED |
| Ethisphere ("World's Most Ethical Companies") | Self-submitted, paid Ethics Quotient survey | Corporate ethics/accountability framing overlap | Self-submission + paid assessment — honoree list only from companies that opt in and pay; ~360 F500 never assessed per prior doc's estimate | ORGANIC_GROWTH_COMPETITIVE_2026-07-14.md, citing ethisphere.com; NO exact URL captured |
| B Corp / B Lab | Certification (pass/fail) against social/environmental standards | Corporate accountability overlap | Binary certification with paid dues, not a continuous comparative score; opt-in only | Same doc; NO URL CAPTURED |
| World Benchmarking Alliance — Corporate Human Rights Benchmark (WBA CHRB) | Human-rights practice scoring, ~100 companies, 5 sectors | Equity/Accountability dimension overlap | PDF-heavy, not machine-citable; covers ~100 companies vs. CB's 447 Fortune 500 | Same doc, citing worldbenchmarkingalliance.org, BHRRC; NO exact URL captured |
| JUST Capital | Survey of Americans' stated corporate priorities, Russell 1000 | Overlap on "most just/ethical company" query space | Measures perceived importance of issues, not verified practice; US-only | Same doc; NO URL CAPTURED |
| RepTrak | Paid syndicated perception/reputation research | Adjacent "most reputable" query space | Perceived reputation, not documented behavior — "reputation vs. reality" gap CB can use as a contrast frame | Same doc; NO URL CAPTURED |
| EIU Global Liveability Index / Democracy Index | City livability (infrastructure/stability-weighted); country regime classification | Global/US Cities and Countries index overlap | Does not measure government responsiveness to suffering specifically; decades of entrenched authority — CB positioning here should be companion-content, not head-on capture, per the prior doc's own difficulty rating (5/5) for the Democracy Index specifically | Same doc; NO URL CAPTURED |
| Freedom House, Transparency International CPI, RSF Press Freedom, WJP Rule of Law | Governance/press-freedom/corruption/rule-of-law scoring | Countries index overlap on format and authority patterns | Long-established, annual-cycle, narrower single-topic scope vs. CB's 8-dimension composite; useful as a **format** comparable, not a demand comparable | `research/MARKET_REVIEW_UPDATES_2026-05-19.md`, 2026-05-19; presentation-practice analysis, not a live web pull this session |
| RepRisk, Bloomberg ESG, Refinitiv (LSEG) ESG, ISS | Institutional ESG/incident data feeds, $15K–$300K+/yr pricing | Pricing-anchor comparable, not topical overlap | Priced well above CB's current $195 ceiling (`MARKET_CANDIDATES_2026-04-18.md` Part 2); real, but no institutional relationship at CB has been tested at this tier | Same doc; NO URL CAPTURED |
| EU ESG Rating Regulation (effective 2026) | Regulatory requirement that ESG raters disclose methodology and manage conflicts | Validates CB's independence-policy claim as a live, regulator-recognized market gap | CB can cite this regulation as third-party evidence the trust gap it targets is real, not self-serving | ORGANIC_GROWTH_COMPETITIVE_2026-07-14.md; NO exact URL captured; regulation existence and 2026 effective date not independently re-verified this session — **flag as [TRAINING/inherited, unverified]** |

---

## 4. Findings

| ID | Severity | Finding | Evidence | System |
|---|---|---|---|---|
| F-01 | High | Zero models have ever been evaluated; the registry is empty by explicit design and says so in its own metadata. Any "which AI is most compassionate" claim attributed to CB today would be fabricated — and the live site already states this correctly. | `site/src/data/model-benchmark/registry-v1.json`; `site/src/app/ai-models/page.tsx` FAQ #1 | CB-MODEL |
| F-02 | High | Three blockers (no model API budget BLK-002, no human rating panel BLK-005, no Methods Committee BLK-006) gate every officially labeled result; the public item bank is fully exposed with rubrics, so no valid comparative score is currently possible even if a lab were tested today. | `.benchmark-ops/BLOCKERS.md`; `docs/MODEL_EVALUATION_HARNESS_DESIGN.md` (cited in market doc) | CB-MODEL |
| F-03 | Medium | "Compassion" is not a clean, uncontested new category: 4 of 8 dimensions (Empathy, Accountability, Boundaries, Equity) have real, findable cousins in SafetyBench, DecodingTrust, TruthfulQA, and AILuminate under different names. Two axes (Systemic framing, Integrity-under-pressure) are the genuinely underserved ones. Overclaiming novelty is a specific, predictable credibility risk in launch copy. | `docs/MARKET_MODEL_BENCHMARK.md` §1–2 | CB-MODEL |
| F-04 | High | No evidenced willingness to pay, cite, or otherwise engage with an AI-model compassion score exists anywhere in the repository or this session — for any candidate buyer (labs, procurement teams, journalists, researchers, regulators). This is the single largest unresolved question before further build investment. | `docs/MARKET_MODEL_BENCHMARK.md` §4 | CB-MODEL |
| F-05 | Medium | The independence-policy contrast against issuer-pay ESG raters (MSCI, Sustainalytics) and pay/self-submit awards (Ethisphere, B Corp) is a real, evidenced structural differentiator for Continuous Research, reinforced by a 2026 EU ESG Rating Regulation that itself now requires ESG raters to disclose methodology and manage conflicts — i.e., the market/regulatory environment independently validates the trust gap CB claims to fill. | `docs/ORGANIC_GROWTH_COMPETITIVE_2026-07-14.md` (inherited, not re-verified this session) | Continuous Research |
| F-06 | Medium | The credibility of any "same scale as a government" claim for CB-MODEL is directly weakened by Continuous Research's own documented data-quality state: as of 2026-08-20, roughly 59% of published entities (834 of 1,289) carried a placeholder score never individually assessed, and the same automated pipeline has shown same-entity volatility (e.g., one entity scored 58.1 then 60.6 three days apart, crossing a band boundary). A model score anchored to this scale inherits the scale's current reliability problems. | `docs/GRANT_PROPOSAL_2026-09.md` §4; `docs/MARKET_MODEL_BENCHMARK.md` §3 (citing `.benchmark-ops` D-07) | Both |
| F-07 | Medium | Internal strategic contradiction: a 2026-07-14 growth doc frames the product as a **nonprofit model** ("explicitly NOT sales, tiers, or lead-gen," CTAs limited to cite/subscribe-free/donate), while the live `gumroad.ts` config, the current `CLAUDE.md` ("sells digital research assets"), and the September 2026 grant proposal all describe and rely on a **live commercial** Score-Watch subscription ($79/yr, live since 2026-06-22) and index-download sales. No document in the corpus resolves which framing is current or intended for external PR/FAQ copy. Publishing "grant support keeps this free for everyone" language alongside an active paid product on the same domain is a specific, avoidable credibility risk. | `docs/ORGANIC_GROWTH_PERSONAS_2026-07-14.md` §0, §4; `site/src/data/gumroad.ts`; `CLAUDE.md`; `docs/GRANT_PROPOSAL_2026-09.md` §7 | Both |
| F-08 | Low-Medium | Every Continuous Research buyer segment and price point in the market docs (institutional subscription $12K–$50K/yr, sector reports, AI-governance subscription) is comparable-institution inference, not a tested willingness-to-pay. The market doc's own "Evidence Gaps" section states plainly that no institutional relationship has ever been tested through an actual sales conversation. | `research/MARKET_CANDIDATES_2026-04-18.md`, "Evidence Gaps and Open Questions" | Continuous Research |
| F-09 | Medium | Bring-your-own-model scoring is explicitly designed as unofficial, single-rater, and not directly monetized — it is framed as a lead-gen/credibility asset for the existing "License the Platform" contact-sales CTA on `/ai-evaluation-suite`. This is a lower-risk near-term touchpoint with a concretely named user (developers pasting a rubric into a chat assistant today as an improvised workaround) but has zero validated conversion evidence. | `docs/PRD_RELEASE_WATCH_AND_BYO_SCORING.md` §1, §2 | CB-MODEL |
| F-10 | Low | No analytics or traffic data on the existing `/ai-models` page or the AI Labs institutional index was available to this reviewer. If it exists, it would be the strongest available demand signal for CB-MODEL and should be checked before the PR/FAQ asserts any customer segment as validated rather than plausible. | `docs/MARKET_MODEL_BENCHMARK.md`, "Unresolved research risks" #3 (carried forward, not independently re-checked this session) | Both |

---

## 5. Top 5 recommended improvements

Priority Score = Impact + Strategic + Learning + Confidence − Effort − Risk (each 1–5; higher = do sooner).

### 1. Keep and sharpen the existing "program status + independence disclosure" framing on `/ai-models` as the PR/FAQ's lead CB-MODEL asset

- **Type:** Positioning / trust
- **Problem:** Zero models scored, plus a harness whose own design doc discloses AI-agent authorship and unresolved conflicts of interest, creates a "who benchmarks the benchmarker" exposure (F-02).
- **Expected benefit:** Converts the project's most honest existing asset — its own detailed self-disclosure of gaps and conflicts — into the differentiator no competitor in the field offers as candidly. Pre-empts the "show me one score" question.
- **Evidence:** `docs/MARKET_MODEL_BENCHMARK.md` §5–6; the live page already implements most of this (`site/src/app/ai-models/page.tsx`) — the recommendation is to carry this exact framing into the PR/FAQ verbatim rather than soften it for launch.
- **Impact:** 4 · **Strategic alignment:** 5 · **Learning value:** 3 · **Confidence:** 4 · **Effort:** 2 · **Risk:** 1
- **Priority Score: 13**

### 2. Resolve the nonprofit-vs-commercial messaging conflict (F-07) before PR/FAQ copy is finalized

- **Type:** Strategic decision (not a build item)
- **Problem:** Two live, contradictory monetization narratives exist in the docs corpus; an external PR/FAQ built on the wrong one creates an immediately checkable contradiction (a live $79/yr product next to "public-interest infrastructure kept free by grants").
- **Expected benefit:** A single coherent monetization story that survives a journalist checking the site's own pricing page.
- **Evidence:** `docs/ORGANIC_GROWTH_PERSONAS_2026-07-14.md` vs. `site/src/data/gumroad.ts` / `CLAUDE.md` / `docs/GRANT_PROPOSAL_2026-09.md`.
- **Impact:** 4 · **Strategic alignment:** 5 · **Learning value:** 2 · **Confidence:** 4 · **Effort:** 1 · **Risk:** 2
- **Priority Score: 12**

### 3. Run 3–5 direct outreach conversations to validate CB-MODEL buyer demand before further build investment

- **Type:** Research / validation
- **Problem:** No evidenced willingness to pay or cite exists for an AI-model compassion score, from any candidate buyer (F-04).
- **Expected benefit:** Resolves the single largest open question before committing scarce human-rating and model-API budget (BLK-002, BLK-005) — a cheap test relative to the cost it could avoid.
- **Evidence:** `docs/MARKET_MODEL_BENCHMARK.md` §4, Unresolved research risk #2.
- **Impact:** 5 · **Strategic alignment:** 4 · **Learning value:** 5 · **Confidence:** 3 · **Effort:** 4 (low effort — outreach only) · **Risk:** 1
- **Priority Score: 12**

### 4. Position CB-MODEL explicitly against the named field, never as an uncontested new category

- **Type:** Positioning / messaging
- **Problem:** A "compassion" novelty claim is quickly and publicly checkable against EQ-Bench, DecodingTrust, SafetyBench, AILuminate, and the FLI AI Safety Index; overclaiming reads as either uninformed or overreaching (F-03).
- **Expected benefit:** Pre-empts the most predictable hostile FAQ question with an accurate, specific, defensible answer instead of a vulnerable one.
- **Evidence:** `docs/MARKET_MODEL_BENCHMARK.md` §2–3, §6; `docs/ORGANIC_GROWTH_COMPETITIVE_2026-07-14.md` (FLI row).
- **Impact:** 4 · **Strategic alignment:** 4 · **Learning value:** 2 · **Confidence:** 4 · **Effort:** 3 · **Risk:** 1
- **Priority Score: 10**

### 5. Replace inferred Continuous Research buyer-segment language with either confirmed traction or explicit "unproven" framing before the PR/FAQ asserts institutional demand

- **Type:** Evidence / analytics
- **Problem:** Every institutional buyer segment (ESG funds, state AGs, activist investors) in the market docs is comparable-institution inference, not a tested conversation or confirmed subscriber count (F-08, F-10).
- **Expected benefit:** Avoids an overclaiming press release that names buyer segments as validated when the repo's own research explicitly flags them as unproven.
- **Evidence:** `research/MARKET_CANDIDATES_2026-04-18.md`, "Evidence Gaps and Open Questions"; Score-Watch 90-day targets in `docs/PRD_MONETIZATION.md` starting from a 0-subscriber baseline.
- **Impact:** 3 · **Strategic alignment:** 4 · **Learning value:** 4 · **Confidence:** 3 · **Effort:** 3 · **Risk:** 1
- **Priority Score: 10**

---

## 6. PR/FAQ inputs

### Customer problem statement

Institutions today are ranked mostly on what they choose to disclose about themselves — corporate
sustainability reports, self-submitted ethics surveys, issuer-paid ESG ratings — and AI models are
marketed on their own labs' safety framing or on narrow technical-safety leaderboards. No
independent, non-pay-to-play instrument asks the same underlying question — does this institution,
or this AI model, actually recognize and respond to human suffering — across governments,
companies, and AI systems, on one comparable scale, with the method and its limitations published
before a single score.

### One-paragraph press-release angle

Compassion Benchmark today publishes independent, evidence-linked scores of how more than 1,300
governments, companies, AI labs, robotics labs, cities, and universities recognize, respond to, and
reduce the suffering of the people they affect — scored on one shared 0–100 scale, under a policy
that guarantees no institution can pay for a better score, for inclusion, or for a finding to be
suppressed. Today, ahead of publishing any AI model result, Compassion Benchmark is also releasing
the method it will use to extend that same standard to AI models: a public task bank, a published
scoring rubric, and the specific conditions — an independent human rating panel, a Methods
Committee, a secure item pool — that must exist before any model receives a score. No model has
been evaluated yet, and Compassion Benchmark is publishing that fact rather than implying
otherwise.

### Hard external FAQ questions and honest answers

1. **"Which AI model is the most compassionate?"**
   None has been measured. The registry is empty by design; zero models have been evaluated. Any
   ranking of AI models by compassion attributed to Compassion Benchmark today would be fabricated.
   (`site/src/data/model-benchmark/registry-v1.json`; `site/src/app/ai-models/page.tsx`)

2. **"Isn't 'compassion' just a rebrand of existing AI safety benchmarks like SafetyBench,
   DecodingTrust, or EQ-Bench?"**
   Partial overlap, honestly stated: four of eight dimensions (empathy, accountability, boundaries,
   equity) have real cousins in the existing field under different names and narrower scope. Two
   dimensions (systemic-root-cause framing, and integrity under sustained pressure) have no direct
   antecedent this research found. The format also differs — open-ended, human-rated scenarios
   rather than multiple-choice or purely automated grading. We do not claim uncontested novelty.
   (`docs/MARKET_MODEL_BENCHMARK.md` §1–2)

3. **"How is your institutional research different from ESG raters that have been criticized for
   conflicts of interest, like MSCI or Sustainalytics, or pay-to-play awards like Ethisphere or B
   Corp?"**
   No scored entity can pay for inclusion, a higher score, or the suppression of a finding — every
   Fortune 500 company is scored, not only applicants who opt in, unlike issuer-pay ESG ratings or
   self-submission ethics awards. This is an internally enforced policy, not a third-party audit.
   And it comes with a live caveat we publish rather than hide: as of our last full count, roughly
   59% of published entities carried a score that had never been individually assessed — a
   data-quality defect we found in our own data, are actively correcting, and report on
   transparently, index by index. (`CLAUDE.md`; `docs/GRANT_PROPOSAL_2026-09.md` §4)

4. **"You have no model API budget and no human rating panel — what stops you from publishing a
   premature or inflated 'evaluated' claim under pressure to have something to announce?"**
   A named, published set of blockers that an agent cannot clear on its own: no approved model API
   budget, no human rating panel, no Methods Committee. No model page is created, and the
   "independently executed" label is not used, until a frozen snapshot has been scanned, evaluated
   by two independent human raters, and adjudicated under a recorded methods process. The registry
   stays at zero until that happens, and says so on every surface rather than implying
   work-in-progress. (`.benchmark-ops/BLOCKERS.md`; `site/src/app/ai-models/page.tsx`)

5. **"Who actually wants to pay for, or cite, an AI-model compassion score — do you have a
   confirmed customer or a confirmed press citation for this specific product?"**
   Honestly: no. We have no confirmed institutional buyer, no confirmed journalist citation, and no
   validated outreach conversation for an AI-model compassion score specifically. We do have a live
   paid product for our existing institutional indexes (Score-Watch alerts, index downloads), but
   that is a different buyer and a different scored-entity type, and we are not claiming that
   demand transfers to the AI-model product without evidence. (`docs/MARKET_MODEL_BENCHMARK.md` §4;
   `site/src/data/gumroad.ts`)

---

*Prepared by market-research reviewer. No file outside this review was modified. WebSearch/WebFetch
tools were unavailable this session; all external claims are inherited-and-labeled or marked
[TRAINING, unverified] per §1.*
