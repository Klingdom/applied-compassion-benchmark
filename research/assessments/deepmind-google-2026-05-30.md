---
entity: "DeepMind/Google"
type: "Organization"
sector: "AI Lab"
date: "2026-05-30"
composite_score: 56.9
band: "Functional"
scores:
  AWR: 3.6
  EMP: 3.2
  ACT: 3.4
  EQU: 3.2
  BND: 3.2
  ACC: 3.0
  SYS: 3.6
  INT: 3.0
published_index: "ai-labs"
published_rank: 14
published_composite: 58.4
published_band: "functional"
assessment_kind: "math-hygiene-reconciliation-plus-documented-hold"
---

# Compassion Benchmark Assessment: DeepMind/Google (2026-05-30)

**Trigger:** Priority flag (priority_score 50, T1). Scanner: CEO Hassabis warned of a "species-level transition with little margin for error" (Stanford, May 29); Frontier Safety Framework third iteration published April 17 with Tracked Capability Levels; DeepMind UK workers launched a union campaign demanding an end to military contracts (May 5); whistleblower allegation that Google AI assisted Israeli military drone surveillance. Sector alert EU-AI-ACT-HIGH-RISK-DELAY-TRANSPARENCY-ACTIVE.

## Drift-Guard Check — MATH-HYGIENE FLAG

Published composite **58.4**; canonical reconstruction of published dims = **56.9** (diff **-1.5**). `node site/scripts/validate-indexes.mjs` emits: `ai-labs.json: "DeepMind/Google" composite=58.4 vs formula=56.9 (diff=1.5)` — a **warning** (below the 2.0 error gate). This is a genuine math-hygiene issue (>0.5pt) and must be reconciled on apply. **Working baseline = 56.9** (formula-correct), per the Hungary-2026-05-18 / Turkey-2026-05-29 drift precedent (use the formula-correct value, not the stored value, as the baseline).

## Evidence Window — Net Hold on Dimensions

**Positive / neutral signals (no upward apply warranted yet):**
- FSF third iteration (April 17) with Tracked Capability Levels is a real anticipatory-governance artifact (AWR/A5, SYS), but it is an incremental update to an existing framework already reflected in the AWR 3.6 / SYS 3.6 baseline. No new creditable structural change.
- Hassabis's Stanford remarks (May 29) are awareness rhetoric, not an institutional act.

**Negative / contested signals (insufficient to score down yet):**
- DeepMind UK union campaign (May 5) over military contracts: a worker-voice/internal-consistency signal (INT/I3). It is an active organizing campaign (CWU/Unite seeking recognition for ~1,000 London staff), not yet a resolved governance outcome. The Project-Maven-commitment removal (Feb 2025) is the underlying concern but predates this window.
- Whistleblower allegation re: Google AI assisting Israeli military drone surveillance: **unverified single-source allegation**; does not meet the adjudicated/corroborated threshold to score an INT/SYS downgrade.
- Pentagon/DoD Gemini "any lawful purpose" deal: a documented governance concern (Fortune, May 5) feeding INT and S4 (structural critique), but the military-AI-by-contract-governance question is a methodology-novelty candidate (scanner-flagged, OpenAI-DoD parallel) not yet operationalized into a scoring rule.

**Net: no dimension movement.** The signals are real but either incremental (FSF), in-progress (union recognition), or unverified (whistleblower). The only actionable item this cycle is the math-hygiene reconciliation (58.4 -> 56.9).

| Dimension | Code | Raw | Evidence | Source |
|-----------|------|-----|----------|--------|
| AWR | AWR | 3.6 | FSF 3rd iteration; Tracked Capability Levels (incremental) | DeepMind blog Apr 17 |
| EMP | EMP | 3.2 | Stakeholder engagement; carry-forward | (baseline) |
| ACT | ACT | 3.4 | Safety framework operationalization; carry-forward | (baseline) |
| EQU | EQU | 3.2 | Access/equity programs; carry-forward | (baseline) |
| BND | BND | 3.2 | Frontier-safety boundary discipline; carry-forward | (baseline) |
| ACC | ACC | 3.0 | Transparency mixed; Maven-commitment removal Feb 2025 | Fortune May 5 |
| SYS | SYS | 3.6 | FSF structural; DoD-contract structural-critique tension | Fortune May 5 |
| INT | INT | 3.0 | Union campaign over military contracts; whistleblower (unverified) | Truthout / Fortune May 5 |

**Composite:** 56.9 (formula-correct; reconciles stored 58.4).

## Published Index Comparison

**Published index:** ai-labs | **Rank:** #14 | **Published composite:** 58.4 | **Band:** functional

| | Published (stored) | Canonical (formula) | Difference |
|---|---|---|---|
| Composite | 58.4 | 56.9 | -1.5 |

The dimension raw scores reconstruct to 56.9 under the canonical v1.2 formula (integrationPremium 0; stdDev across dims > 1.5 but weakDims gating yields no premium because multiple dims < 4.0). The stored 58.4 predates the v1.2 reconciliation. Recommend reconciling on next apply.

## Key Findings
- MATH-HYGIENE FLAG: stored composite 58.4 vs canonical-formula 56.9 (diff 1.5, validate-indexes warning, below 2.0 error gate). Working baseline = 56.9.
- FSF third iteration (Apr 17) is incremental; no new upward credit.
- Union campaign (May 5) and whistleblower allegation are real but in-progress/unverified — no downward apply.
- MILITARY-AI-BY-CONTRACT-GOVERNANCE methodology candidate noted (DoD Gemini deal); not yet operationalized into a scoring rule.

## Recommendation
**RECONCILE composite 58.4 -> 56.9 (math-hygiene), hold dimensions.** Delta -1.5 reflects formula reconciliation only, not a substantive re-score. No band change (remains Functional). Confidence: HIGH on the math-hygiene reconciliation; MEDIUM on the held dimensions pending union-recognition and whistleblower-verification outcomes.

## Forward Signals
- Union recognition outcome (CWU/Unite formal legal process if Google declines voluntary recognition) -> potential INT/I3 movement.
- Verification of the Israeli-drone-surveillance allegation -> potential INT/SYS downgrade.
- 2026-08-02: EU AI Act transparency (Art. 50) + GPAI obligations take effect; Colorado AI anti-discrimination law effective June 2026 — compliance posture watch.

## Sources
- https://stanforddaily.com/2026/05/29/deepmind-ceo-warns-about-ai/
- https://deepmind.google/blog/strengthening-our-frontier-safety-framework/
- https://truthout.org/articles/google-ai-workers-in-uk-launch-union-campaign-demand-end-to-military-contracts/
- https://fortune.com/2026/05/05/google-deepmind-unionize-vote-military-ai-contracts-internal-backlash-pentagon-deal-israeli-defense-forces/

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment.*
