---
entity: "Anthropic"
type: "Organization"
sector: "AI Safety/Research"
date: "2026-09-22"
composite_score: 57.5
band: "Functional"
scores:
  AWR: 3.6
  EMP: 3.4
  ACT: 3.4
  EQU: 3
  BND: 3.4
  ACC: 3.6
  SYS: 3
  INT: 3
published_index: "ai-labs"
published_rank: 12
published_composite: 59.1
published_band: "Functional"
assessed_composite: 57.5
score_delta: -1.6
band_change: false
filing_trigger_met: false
outcome: "confirmation"
assessment_type: "screening note (no re-score)"
recommendation: "confirm"
change_proposal: false
confidence: "medium"
subdim_sidecar: false
methodology_version: "v1.2"
source: "priority"
scan_file: "research/scans/2026-09-22.json"
carried_from: "research/assessments/anthropic-2026-09-15.md"
watch_flag: "Boundary watch retained (Established threshold 60.0; published 59.1 sits 0.9 points below it). Re-test B1 and I3 if Anthropic publishes, or is credibly reported to have, a safety-dissent or internal-escalation channel with evidence of use. Re-test S4 when third-party evaluator access announced in September 2026 has a verifiable track record."
---

# Compassion Benchmark Screening Note: Anthropic

**Entity type:** Organization  
**Assessment date:** 2026-09-22  
**Outcome:** confirmation; no dimension moves. An individual employee’s resignation and public speech is not institutional conduct.  
**Published:** 59.1/100 (Functional), ai-labs rank 12  
**Carried measurement:** 57.5/100 (Functional), measured in `research/assessments/anthropic-2026-09-15.md`

## Why this entity was assessed

The scanner flagged Anthropic on Jacob Coxon's resignation, announced 8 September 2026 and first widely reported 9 September. Coxon, a pretraining researcher who had worked at both OpenAI and Anthropic, published a warning that "neither company is acting responsibly" and that both are "racing straight to self-improving superintelligence and gambling with our lives," reportedly forfeiting unvested equity to do so. Anthropic's alignment stress-testing lead, Evan Hubinger, publicly agreed and put his own estimate of AI-driven human extinction above 10% within a decade.

## Prior assessments read first, to avoid double-counting

Both were read before scoring:

- **`research/assessments/anthropic-2026-09-15.md`** — a full measurement at 57.5 against a published 59.1, outcome confirmation, delta -1.6, with a 40-subdimension sidecar. This is the carried measurement used here.
- **`research/assessments/anthropic-2026-09-20.md`** — a screening note on the 19 September antitrust filing, outcome confirmation, no dimension moves. That note also recorded Dario Amodei's 12 September essay "We Must Pace the Frontier" and reported third-party evaluator access as a **positive watch item, explicitly not banked as a score.**

Nothing in this note re-credits or re-charges anything already handled in either. The 12 September essay and evaluator access are **not** re-scored here.

## The instrument question: does the benchmark say anything about a researcher resigning?

**Largely no, and that is the finding.**

Three reasons no dimension moves.

**1. An individual's speech is not institutional conduct.** Jacob Coxon is a private individual who chose to leave a job and say why. The benchmark scores what institutions do. There is no subdimension among the 40 that is answered by "a former employee criticised the institution." To score Anthropic down on Coxon's assessment would be to let any departing employee set an institution's score; to score it up for having employed someone conscientious would be equally unprincipled.

**2. What Anthropic did in response is, so far, nothing that is documented.** No disciplinary action, no non-disparagement enforcement, no retaliation, and no public rebuttal was located. That matters, and it is worth naming plainly: the *absence* of retaliation against a departing critic is a meaningful signal about an institution's tolerance for dissent. But per screening rule 3, **the absence of harm is not positive evidence**, and no upward movement is taken on it. It is recorded as a watch item.

**3. The one arguably institutional element is already reflected in the carried score.** Evan Hubinger is Anthropic's alignment stress-testing team lead, and his statement is closer to institutional speech than Coxon's: he said the company is trying its best but does not yet have a plan to solve alignment for superintelligence and is not clearly on track to. Read at its strongest, that is a senior technical leader conceding a gap between the institution's stated mission and its current capability — which is relevant to S1 (Root Cause Orientation), S2 (Long-Term Impact) and I4 (Values Alignment).

But the 15 September assessment already carries **SYS at 3.0 raw**, down from the published 3.2, and **INT at 3.0**, down from 3.2. Those are the two dimensions this evidence touches, and they are already the two lowest in the carried vector. An alignment lead saying publicly that the plan does not yet exist is consistent with a Systemic Thinking score of 3.0; it is not a new finding that would move it further. And there is a countervailing reading that cuts the other way: a company whose own safety lead can publicly state a >10% extinction estimate and a missing plan, without apparent consequence, is displaying an unusual degree of institutional candour — which is AB3 territory, where the carried score is already **3.6, above the published 3.5.**

## What is explicitly not scored

- Coxon's estimate of catastrophic risk, or the merits of his technical argument. The benchmark does not adjudicate AI risk forecasts.
- The claim of 100 million views in 24 hours. Attention is not conduct.
- The forfeiture of unvested equity. That is Coxon's integrity, not Anthropic's.
- The New York Attorney General's 17 September call for AI workers to file whistleblower complaints and California's 10 September child-AI-safety laws. Both are sector context in the scan's own `sector_alerts`, and neither is a finding about Anthropic.

## Screening checks (§3e-bis)

1. **Baseline provenance — checked.** `research/APPLIED_CHANGES.md` shows the published 59.1 was applied on 2026-05-29, following a documented sequence (90.9 to 68.8 in April 2026, then 62.2, 59.7, 60.0, 58.1, 59.1) each driven by Anthropic's own conduct. The most recent apply was a cost-of-conscience event: the Pentagon declared Anthropic a supply-chain risk over its refusal to drop safety guardrails.
2. **No "stale baseline" rationale.** The score is recent and was set on the entity's own conduct.
3. **Directionality.** Anthropic surfaced on evidence that is negative in tone but not attributable to the institution. No movement is taken in either direction. No upward movement on absence of retaliation.
4. **No double-count.** The 09-15 measurement and the 09-20 screening note were both read in full first. The 12 September Amodei essay and the evaluator-access report remain unbanked positive watch items, not re-credited here.
5. **Not a calibration argument.**
6. **Boundary watch retained.** The published 59.1 sits 0.9 points below the 60.0 Functional/Established line, so this entity's band is sensitive to small movements, which is a further reason not to move it on non-institutional evidence.

## Determination

**CONFIRM.** Carried measurement 57.5 against published 59.1, delta -1.6, band unchanged (Functional), no filing trigger met. A screening note is the correct output here, and the reasoning — that the instrument is silent on an individual's resignation — is the substantive finding.

## Score Summary (carried, not re-measured)

| Dimension | Code | Raw (1-5) | Published raw |
|-----------|------|-----------|---------------|
| Awareness | AWR | 3.6 | 3.6 |
| Empathy | EMP | 3.4 | 3.4 |
| Action | ACT | 3.4 | 3.5 |
| Equity | EQU | 3 | 3.1 |
| Boundaries | BND | 3.4 | 3.4 |
| Accountability | ACC | 3.6 | 3.5 |
| Systemic Thinking | SYS | 3 | 3.2 |
| Integrity | INT | 3 | 3.2 |
| **Composite** | — | **57.5** | **59.1** |

## Evidence ledger

| # | Claim | Source | Tier | Date |
|---|-------|--------|------|------|
| 1 | Jacob Coxon, a pretraining researcher who had worked at both OpenAI and Anthropic, resigned from Anthropic on 8 September 2026 and published a public warning that the two companies are racing to self-improving superintelligence. | [TechCrunch](https://techcrunch.com/2026/09/09/gambling-with-our-lives-anthropic-researcher-quits-warns-against-self-improving-ai/) | 2 | 2026-09-09 |
| 2 | Evan Hubinger, Anthropic’s alignment stress-testing team lead, publicly agreed with Coxon, put his own estimate of AI-driven human extinction above 10% within the next decade, and said Anthropic is trying its best but does not yet have a plan to solve alignment for superintelligence and is not clearly on track to. | [TIME](https://time.com/article/2026/09/15/ai-anthropic-researcher-quits-coxon-slowdown/) | 2 | 2026-09-15 |
| 3 | Anthropic was assessed on 2026-09-15 at a composite of 57.5 against a published 59.1 (confirmation, 40-subdimension sidecar), and received a screening note on 2026-09-20 covering the 19 September antitrust filing with no dimension moves. Both were read before this note; nothing from either is re-credited or re-charged. | [Compassion Benchmark prior assessments on file](https://compassionbenchmark.com/ai-labs) | 4 | 2026-09-20 |

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
