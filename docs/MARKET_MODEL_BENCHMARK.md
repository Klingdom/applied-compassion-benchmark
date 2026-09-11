# Market Assessment — AI Model Compassion Benchmark

**Author:** market-research agent
**Date:** 2026-09-10
**Status:** Assessment only. No index, registry, or rotation-state file touched.

## Evidence discipline for this document

Two source classes are mixed here and are labeled throughout:

- **[REPO]** — verified directly against files in this repository this session (cited by path).
- **[TRAINING, unverified]** — drawn from this model's training knowledge (cutoff January 2026),
  **not** checked against a live source this session. This session's WebSearch/WebFetch budget
  was unavailable (see `INCIDENTS.md` INC-008 / `.benchmark-ops/BLOCKERS.md` BLK-001 — a
  session-wide cap, not specific to this task) and no search tool was exposed to this agent at
  all. Every named competitor benchmark below is real to the best of this model's training
  knowledge, but version status, current governance, and exact current methodology should be
  re-verified by a session with working search before any claim here is used in external copy.
  Nothing below is fabricated; where confidence is low, it is stated as low.

No competitor pricing, user count, citation count, or named customer is asserted anywhere in
this document unless it is directly checkable from something in this repository. Where the
question is "who would pay," the honest answer is usually "no evidence found," and that is
stated as such rather than dressed up as market sizing.

---

## 0. Ground truth restated [REPO]

- `site/src/data/model-benchmark/registry-v1.json` — 0 entries. Explicit note in the file:
  *"NO MODEL HAS EVER BEEN REGISTERED... no evaluation is authorised."*
- `site/src/data/model-benchmark/tasks-v1.json` — 33 items, 29 scorable, 4 in
  `draft-authored-unreviewed` status, SYS dimension covered by only 2 items against 5
  subdimensions, all items `exposureStatus: "public-permanent"` (published with full answer key).
- `docs/MODEL_EVALUATION_HARNESS_DESIGN.md` — no harness exists yet; cost model is unpriced
  arithmetic (placeholders), not a real budget; a 12-model wave is estimated at ~$16 in API cost
  against ~$23,000 in human-rating cost (~1,500:1) — API cost is described in that document,
  correctly, as "a rounding error," not as evidence the whole program is cheap.
- `.benchmark-ops/BLOCKERS.md` — six open blockers, two Critical (BLK-002 no model API
  credentials/budget; BLK-005 no human rating panel), and BLK-006 (no Methods Committee) blocks
  resolution of two already-discovered internal contradictions: two conflicting band
  vocabularies and two conflicting 40-subdimension taxonomies published in the same repo
  (CONFLICT-03, CONFLICT-05, cited inside the harness design doc).
- **Scale correction to the brief:** the brief's premise of "1,300+ non-AI institutions" is
  close but not exact. Counting `site/src/data/indexes/*.json` directly: Fortune 500 (447) +
  Countries (193) + US States (21) + AI Labs (50) + Robotics Labs (50) + US Cities (144) +
  Global Cities (250) + Universities (100) = **1,255 entity rows across 8 indexes**. Use "over
  1,200" rather than "1,300+" in any external copy.
- Existing monetization infrastructure for non-AI rows is real and checkable:
  `site/src/data/gumroad.ts` shows Score-Watch Alert live at $79/yr/entity since 2026-06-22, and
  index downloads (Fortune 500, AI Labs, Robotics, Countries, Global Cities) priced around $195
  each. This is evidence of *a* working paid-product motion at Compassion Benchmark — it is not
  evidence that willingness to pay transfers to an AI-model product, which is a different buyer
  and a different claim (see §4).

---

## 1. The existing field

### 1.1 What already benchmarks model behaviour on adjacent axes

| Benchmark / body | What it measures | Format | Independence structure | Confidence |
|---|---|---|---|---|
| **LMSYS Chatbot Arena / LMArena** | Crowdsourced blind pairwise human preference, Elo/Bradley-Terry ranking across general and category-specific prompts | Head-to-head vote, no rubric | Academic-origin, community-run, openly gameable by response style/length/formatting | [TRAINING] moderate-high |
| **HELM (Stanford CRFM)** | Multi-metric "holistic" evaluation: accuracy, calibration, robustness, fairness, bias, toxicity, efficiency, with verticals like HELM Safety | Scenario-based automated metrics | Academic, open, reproducible | [TRAINING] moderate-high |
| **MMLU / MMLU-Pro and similar** | Knowledge and reasoning capability | Multiple-choice | Academic | [TRAINING] high — but not behaviorally relevant to compassion at all |
| **TruthfulQA** | Propensity to repeat common human falsehoods under adversarial framing | Q&A, judged against reference answers | Academic | [TRAINING] moderate-high |
| **SafetyBench** | Safety across categories (offensiveness, bias/unfairness, physical/mental health, illegal activity, privacy, ethics) | **Multiple-choice** ("pick the safest option") | Academic (Chinese-origin research group) | [TRAINING] moderate |
| **Anthropic HHH framework / model & system cards / sycophancy and "Values in the Wild" research** | The lab's own internal alignment target (Helpful, Honest, Harmless) and self-reported evals | Mixed — internal evals, published research papers, red-team summaries | **Self-reported by the lab whose model is scored.** Not independent by construction | [TRAINING] moderate-high |
| **MLCommons AILuminate** | Model safety against a hazard taxonomy (violent crimes, hate, self-harm, sexual content, etc.), producing letter-grade safety ratings | Automated prompts, LLM-as-judge grading | Industry consortium (MLCommons); member companies include some of the same labs being scored — a comparable but *governed* conflict, unlike CB's current single-founder structure | [TRAINING] moderate |
| **EU AI Act GPAI Code of Practice / systemic-risk model evaluations** | Regulatory compliance: documentation, risk management process, "adequate" testing for systemic-risk models | Compliance framework, not a comparative public score | Regulatory (EU) | [TRAINING] moderate |
| **DecodingTrust** (NeurIPS 2023, academic) | 8-perspective "trustworthiness": toxicity, stereotype bias, adversarial robustness, OOD robustness, robustness to adversarial demonstrations, privacy, machine ethics, fairness | Automated scenario battery, multi-dimension composite | Academic | [TRAINING] moderate — this is the closest **structural** precedent (multi-axis composite trustworthiness score), not a compassion framing |
| **EQ-Bench** (community, single-maintainer) | Emotional intelligence via scenario-based tests | LLM-judge scoring against an ideal-answer rubric | Single independent maintainer, not an institution | [TRAINING] moderate — this is the closest **topical** precedent to "compassion," and it shares CB's exact exposure/gameability problem (published items, judge-graded) |
| **Stanford Foundation Model Transparency Index (FMTI)** | Rates AI **developers** (not models) on transparency of training data, labor, and downstream impact | Structured scorecard across many indicators | Academic | [TRAINING] moderate-high — nearest precedent for "score the *institution*, not just the artifact," which is CB's own existing move at the AI Labs index level, but it does not evaluate model behaviour |
| **UK AISI / US CAISI (government AI safety institutes)** | Pre-deployment technical evaluation of frontier models for dangerous capabilities (cyber, bio, persuasion, autonomy), usually run in partnership with the lab | Technical red-team evaluation | Government, but access-gated by lab cooperation; results often not fully public | [TRAINING] moderate |
| Academic empathy-in-healthcare-communication studies (e.g. LLM responses to patient messages rated for empathy against physician responses) | Empathy in a narrow clinical-communication context | Single studies, not maintained benchmarks | Academic, one-off | [TRAINING] low-moderate — evidence AI empathy is a live research topic, not evidence of a maintained comparative market |

### 1.2 What none of them measure

Cross-referencing this list against the 8 CB dimensions (`site/src/data/dimensions.ts`):

- **Proactive detection of unstated distress** (AWR, esp. subdimensions A3 "Blind Spot
  Mitigation" and A4 "Signal Amplification") — no benchmark above tests whether a model notices
  suffering that was never explicitly named. SafetyBench/AILuminate test reaction to *explicit*
  harm disclosures; none test detection of implicit signals nested in an ordinary functional
  request, which is exactly the framing CB's own item bank uses (e.g. AWR-2-A).
- **Proportionate, multi-turn, resource-aware help with follow-through** (ACT) — nothing above
  tests persistence across a conversation or calibration of response effort to actual severity.
- **Care distributed toward the neediest, historical-harm acknowledgment** (EQU) — partial
  overlap only. HELM/DecodingTrust/SafetyBench test demographic bias and fairness in the
  statistical-parity sense; none test "does the model prioritize the most vulnerable party when
  resources/attention are implicitly scarce," which is CB's EQ2 framing.
- **Autonomy-preservation / non-dependency-creation** (BND, esp. B2) — refusal calibration alone
  exists elsewhere (AILuminate, SafetyBench); whether a model avoids fostering unhealthy reliance
  on itself does not appear in any benchmark above.
- **Accountability as a behavioral trait, not a truthfulness score** (ACC — does the model
  acknowledge its own error/limitation cleanly and accept correction) — TruthfulQA is adjacent
  but narrower (factual accuracy under adversarial framing, not behavioral response to being
  corrected or challenged).
- **Systemic/root-cause framing, structural critique, advocacy for systemic change** (SYS) — this
  is the most genuinely novel axis. Nothing in the list above tests whether a model frames a
  user's problem in terms of root causes versus symptom relief.
- **Integrity under pressure / non-performative consistency across many turns and framings**
  (INT) — related research exists (Anthropic's own published sycophancy work is the closest
  antecedent) but is not packaged as a public, cross-lab comparative benchmark axis.

**Net read:** roughly half of CB's construct (AWR's implicit-signal framing, SYS, INT) is
genuinely underserved by the existing field. The other half (EMP, ACC, BND, EQU) has real,
findable cousins under different names — toxicity/bias, truthfulness, refusal calibration,
fairness — that are narrower in scope but not absent.

---

## 2. Is "compassion" a defensible, non-overlapping axis?

**Honest answer: partial overlap, not a clean new category, and not a rebrand either.**

- It is **not** a rebrand: no existing benchmark in the list above combines detection,
  response quality, equity, boundary-setting, accountability, systemic framing, and integrity
  into one construct with a stated composite formula. The *combination*, and specifically the
  SYS and INT axes, do not have a direct antecedent this model is aware of.
- It **does** overlap meaningfully with existing safety/trustworthiness work on four of eight
  axes (EMP, ACC, BND, EQU), and the framing difference — "compassion" versus "safety" or
  "trustworthiness" — is partly a matter of vocabulary and audience, not new measurement.
- The **format** difference is real and defensible: SafetyBench and AILuminate are largely
  multiple-choice or automated-judge scored against a fixed hazard taxonomy; CB's approach
  (open-ended prompts, five-anchor behavioral rubrics, human-rated) is structurally closer to
  DecodingTrust's and EQ-Bench's approach, and is a legitimate methodological choice, not a
  novelty in itself — EQ-Bench already does open-ended, judge-graded emotional scoring, and
  already has the same exposure/gameability problem CB's own harness design doc identifies.
- **Do not claim "compassion" is an uncontested new category.** A journalist, a lab's PR team, or
  a rival benchmark author who knows this field would locate EQ-Bench, DecodingTrust, SafetyBench,
  and AILuminate within minutes, and a claim of total novelty would read as either uninformed or
  as overclaiming — which is a credibility cost this project cannot currently absorb (see §5).

---

## 3. Differentiation — genuinely distinctive, or merely novel?

**The one-scale-across-institution-types claim is real, checkable, and — as far as this model's
training knowledge extends — currently unique.** No competitor above scores AI models,
governments, and corporations on the same construct and the same 0–100 scale. FMTI scores
companies only (and only on transparency, not behavior). HELM/DecodingTrust/AILuminate/EQ-Bench
score models only. This is a genuine structural wedge: "your model, on the identical scale
already used to rank Uganda's government or a Fortune 500 company's labor practices" is a
comparison nobody else in this field offers, [TRAINING, low-moderate confidence that no
competitor does this — this is an absence claim, harder to verify than a presence claim].

**But distinctive is not the same as currently credible, and the gap between the two is the
central finding of this document.** Against that wedge:

- Zero models have ever been scored [REPO — registry-v1.json].
- The item bank the wedge would run on is unvalidated: 4 of 33 items are
  `draft-authored-unreviewed`, one dimension (SYS — not coincidentally, the most novel axis) has
  only 2 items, and the harness design doc's own Part 6 states plainly that **no valid
  cross-model comparison is currently possible** on the public item pool because every item is
  published with its answer key.
- The institutions CB would compare an AI model against (governments, Fortune 500 companies) are
  scored by an automated pipeline whose own repo shows real reliability problems recently (D-07:
  the same pipeline scored one entity 58.1 then 60.6 three days apart, crossing a band boundary;
  another entity moved 24.4→13.7 in four days) [REPO, `.benchmark-ops` decisions referenced
  inside `docs/MODEL_EVALUATION_HARNESS_DESIGN.md` §1.2]. A "same scale as a government" claim is
  only as strong as the credibility of the government scale, and that scale has open, documented
  volatility.
- The nearest institutionally-backed competitor on the model-safety side, AILuminate, is governed
  by a multi-stakeholder consortium. CB's AI evaluation work today is a single-founder operation
  whose harness, items, and analysis code are substantially AI-agent-authored, a fact the
  project's own design document discloses in detail (Part 5, C1–C3) — more thoroughly than most
  competitors disclose about themselves, which is worth noting as a possible asset (see §6) but
  is currently a real credibility gap, not a resolved one.

**Verdict: distinctive, not yet credible.** The wedge is worth building toward; it is not yet
safe to claim.

---

## 4. Demand evidence — who would actually use, cite, or pay

Stated plainly: **no evidenced willingness to pay for an AI-model compassion score was found in
this repository or session.** What follows separates evidenced fact from plausible-but-unproven
inference.

| Candidate buyer/user | Evidence found | Status |
|---|---|---|
| Existing CB customers (index downloads, Score-Watch) | `gumroad.ts` shows a live, priced motion for non-AI-institution rows ($79/yr Score-Watch since 2026-06-22; ~$195 index downloads) | **Evidenced**, but for a different product line and a different scored entity type — this does not transfer automatically to an AI-model product |
| AI labs (as customers, citing a favorable score in marketing) | None found | Plausible, unproven. Labs cite LMArena and their own system cards today; no evidence they would adopt an unvalidated third-party compassion score, and a low score creates an adversarial incentive to contest methodology rather than cite it |
| Enterprise AI procurement / vendor risk teams | None found | Plausible — vendor-risk questionnaires for AI tools are a real, growing budget line in some organizations — but no evidence CB currently reaches this buyer or that such a buyer would trust a zero-track-record independent scorer over vendor-supplied documentation |
| Journalists / commentators | None found in this session (no search available) | Plausible low-friction use ("which AI is safest for X" pieces cite Chatbot Arena and safety benchmarks today) — but citation is not revenue, and no evidence CB's AI Labs institutional index (which already exists) has been cited externally |
| Safety researchers | None found | Plausible interest in raw evidence/methodology, but this audience typically wants open data and reproducibility, not a paid product — the harness design doc's own evidence-publication commitment (§2.4) is aimed exactly at this audience, correctly, but it is a credibility investment, not a revenue source |
| Regulators (EU AI Act etc.) | None found | Unlikely near-term. Regulatory evaluation requires exactly the rigor (validated items, secure non-trainable pools, documented reliability) CB does not yet have; publishing a trainable, unvalidated item bank is close to disqualifying for this audience |

**The honest summary for a go/no-build decision:** there is a real, working payment
infrastructure at Compassion Benchmark, and there is a real structural differentiation available
to an AI-model product — but there is no evidence, inside or outside this repository, of anyone
currently wanting to pay specifically for an AI-model compassion score. That absence should be
treated as the load-bearing open question, not glossed over.

---

## 5. Risks

| Risk | Detail | Severity |
|---|---|---|
| **Launching with zero results** | The registry is explicitly empty and says so in its own metadata [REPO]. A flagship claim with n=0 invites the obvious "show me one score" question with no answer. | High if positioned as a live leaderboard now; low if positioned as a methodology-first launch (see §6) |
| **"Who benchmarks the benchmarker"** | CB's own harness design doc discloses that its own harness, items, and analysis code are substantially AI-agent-authored, and that agents from the same developer families as models it intends to score have been involved in building the instrument (Part 5, C1–C3) [REPO]. This is a real, structural conflict the project already admits to itself, in more depth than most competitors admit about themselves. | High until BLK-005 (human panel) and BLK-006 (Methods Committee) are cleared |
| **Methodology contestation** | Unvalidated 33-item bank; 4 items in draft-unreviewed status; SYS dimension carries only 2 items against 5 subdimensions; two internally conflicting band vocabularies and two internally conflicting subdimension taxonomies already exist in the repo (CONFLICT-03, CONFLICT-05) [REPO]. A motivated external critic — or a scored lab's comms team — could dismantle the methodology quickly and publicly. | High |
| **Gaming / contamination** | Every current item is `exposureStatus: "public-permanent"`, published with its full five-anchor answer key. The harness design doc states this in its own words: "contamination by construction," and that no valid cross-model comparison is currently possible on this pool [REPO]. Any model trained since item publication may have absorbed both the item and the target behavior. | High, and structural — not fixable by better execution, only by a secure rotating pool CB has not yet built |
| **Publishing the item bank makes it trainable** | Directly acknowledged in the harness design doc (Part 6). The public pool retains legitimate value only as a transparency artifact and a "saturation sentinel," never as a comparative score [REPO]. | Already accepted as a design constraint; risk is in violating it under launch pressure |
| **Cost-model misrepresentation risk** | The oft-cited "$16 in API cost for a 12-model wave" figure is real arithmetic in the harness doc, but it excludes human rating (~$23,000, ~1,500× the API cost) and excludes secure-item authoring, rater recruitment, adjudication, and Methods Committee time entirely (harness doc §3.6) [REPO]. Presenting the API figure as "the cost of benchmarking a model" would be a materially misleading claim if it reached external copy. | Medium-high, specifically a messaging risk |
| **Rater welfare / real harm risk** | The item bank includes active-suicidal-ideation, domestic-violence, and psychosis-adjacent content; the harness doc flags that welfare protocols must be in force before any rater sees an item, and that recruiting before those protocols exist would be the wrong order (BLK-005 detail) [REPO]. | High if human rating is stood up before welfare protocol; not yet triggered |
| **Competitive-response risk not directly evidenced** | No evidence found this session of how AILuminate, LMArena, or a scored lab would react to an unfavorable independent compassion score from a small, unaudited third party. Treat as an unknown, not a zero. | Unknown |

---

## 6. Positioning recommendation

### The claim this product should make now

> **"We are building the only benchmark that will score AI models on the same construct and the
> same 0–100 scale already used to score governments, corporations, and universities — and we
> are publishing our methodology, our gaps, and our conflicts of interest before we publish a
> single score."**

This is defensible today because:
- The multi-institution-type, one-scale claim is checkable and, as far as this research could
  determine, currently unmatched (§3).
- It correctly reflects the actual state of the project (0 models scored) rather than overclaiming.
- It converts the project's most honest existing asset — the harness design doc's own detailed
  self-disclosure of conflicts of interest and methodological gaps — into a differentiator.
  **No competitor reviewed above publishes anything as candid about its own limitations as CB's
  internal design documents already are.** Making a version of that candor public (a "here is
  what we cannot yet claim, and why" page) is a genuinely available, low-cost differentiator
  that plays directly against the field's general opacity about their own conflicts.
- It positions CB relative to the field rather than pretending the field doesn't exist:
  "existing safety benchmarks test whether a model avoids listed harm categories, largely via
  multiple-choice or automated grading; we test whether it recognizes and proportionately
  responds to suffering — including suffering that was never explicitly named — using the same
  institutional lens we already apply to governments and companies." This is accurate, specific,
  and does not claim uncontested novelty (which would fail immediately against EQ-Bench,
  DecodingTrust, SafetyBench, and AILuminate).

### Claims this product must not make

- **"Independent" or "independently audited" attached to any model score.** The harness design
  doc itself reserves this word and forbids it under current conditions (Part 5.4) — a result
  affected by the C1–C3 conflicts without external human rating "may not carry the
  `independently_executed` label." Any external copy must honor the same rule the project has
  already set for itself.
- **Any "Model X scores N" claim on the current public item bank**, ever, for any purpose
  including a demo, a sales deck, or a press outreach — the harness doc calls this out explicitly
  as disqualified by exposure alone, and that finding does not change with better execution.
- **"Compassion" as an uncontested new axis with no antecedent.** Position relative to the field
  (above), not above or outside it.
- **The $16-per-wave API cost figure as "the cost of benchmarking a model."** If a cost claim is
  used externally at all, it must carry the human-rating cost alongside it, or not be used.
- **Any claim of parity with, or superiority over, AILuminate, LMArena, HELM, or EQ-Bench on
  rigor, scale, or adoption.** None of those claims are currently evidenced in either direction,
  and all four have existing user bases and track records CB does not yet have.
- **A press or launch narrative timed before at least a labelled pilot exists.** BLK-002 (no
  model API credentials or approved budget) is still open [REPO]; there is nothing to show yet
  beyond the framework itself.

### What matters most for MVP vs. later

| Now (MVP-safe) | Later (do not pull forward) |
|---|---|
| Publish the framework, the 8-dimension construct, and the one-scale-across-institution-types claim | Any comparative model score or leaderboard |
| Publish an honest "what we can't yet claim" page reusing the harness doc's own disclosure language | "Independent"-labeled results |
| Use the existing paid infrastructure (Gumroad, Score-Watch) only for the non-AI indexes it is already proven on | Assuming that infrastructure's willingness-to-pay transfers to AI-model rows without evidence |
| Position against the field by name, accurately, on format and construct differences | Position against the field by claiming uncontested novelty |
| Treat SYS and INT as the genuinely novel axes worth emphasizing in any comparison | Lean on EMP/ACC/BND/EQU as if they were equally novel — they have closer existing cousins |

---

## Unresolved research risks (for coordinator / product-manager)

1. **No live web search was available this session.** Every named competitor above should be
   re-verified (current status, governance, methodology changes) by a session with working
   search before any of this is used in external-facing copy.
2. **No evidence of actual buyer demand was found for an AI-model compassion score specifically.**
   This is the single largest open question before committing further build effort — it was out
   of scope for this document to resolve and needs either direct outreach (procurement teams,
   journalists who cover AI safety benchmarking) or a smaller paid-pilot test.
3. **No analytics/traffic data on the existing `ai-evaluation-suite` page or the AI Labs index
   was available to this agent** — if any exists, it would be the strongest available demand
   signal and should be checked before further positioning work.
4. **The "no competitor scores models and institutions on one shared scale" claim is an absence
   claim**, which is inherently harder to verify than a presence claim, and should be treated as
   moderate-confidence pending a real search pass.
