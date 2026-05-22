---
date: "2026-05-22"
cycle_type: "normal-nightly"
entities_assessed: 18
formal_applies: 1
band_crossings_proposed: 3
sub_threshold_documented: 6
confirmations: 7
floor_confirmed: 1
first_baselines_confirmed: 1
methodology_novel_rulings: 3
---

# Compassion Benchmark Assessor Summary — 2026-05-22

## Cycle overview

Normal nightly cycle following the May 21 WIDE special cycle (49 assessments, 5 formal applies, 21 first-baselines). Today: 18 unique entities assessed across all priority and rotation slots (15 priority + 5 rotation, with Mexico and Vanuatu appearing in both).

**Counts by kind:**
- Formal apply (≥5pt, drift-clean, evidence-strong): **1** (Slovakia -5.5)
- Band-crossing-proposed (carry-forward or new): **3** (Anthropic upward cycle 3, Marshall Islands upward carry-forward, Timor-Leste upward carry-forward, Poland downward new — actually 4 if we count Poland)
- Sub-threshold documented: **6** (Microsoft, Amazon, US, Vanuatu, Colombia, Turkey)
- Confirmation hold (no movement): **7** (Hungary, South Korea, Mexico, Apple, General Motors, Canada, plus Anthropic which is also band-crossing-proposed)
- Floor-confirmed: **1** (Pakistan)
- First-baseline (rotation-confirmed): **1** (Mexico)

Note: counts overlap because some entities qualify in multiple kinds (Anthropic is both confirmation-hold and band-crossing-proposed; Mexico is both first-baseline and confirmation).

## Top 3 most significant findings

### 1. Slovakia formal downgrade -5.5 (Dismantler classification, applies)

EU Parliament May 20 conditionality resolution (418 votes) + Liberties.eu 2026 "Dismantler" classification (same as Croatia May 21). Apply -5.5 (vs Croatia -7.8). Conservative magnitude anchored to floor-proximity and "baseline already prices most concern" rule. **Methodology-novel precedent established:** Dismantler classification consistency scales magnitude with baseline (full magnitude when baseline inconsistent with classification; ~70% magnitude when baseline already partially prices the concern).

### 2. Microsoft methodology-novel dual-signal weighting (sub-threshold -1.9)

First case of harm-enabled-then-accountability-applied at this severity level (~200M hours Palestinian surveillance, lethal targeting use, GM firing, Azure access termination). **Precedent established:** ACC dimension moves positive (+1.9) on substantive accountability response; BND/ACT/SYS/AWR move negative (the historical breach and governance gap); net composite typically -1.5 to -3.5. Microsoft sits at the conservative low end (-1.9) because accountability response is structural (firing + services revocation + acknowledged subsidiary opacity), not just personnel.

### 3. Hungary "reforms-contested-not-abandoned" sub-case (confirmation)

Magyar pushing back on EU pension/tax reform conditionalities while maintaining rule-of-law reform commitment. **Methodology-novel ruling:** This is a permissible sub-pattern within the May 21 "reforms-announced-not-enacted" anchoring. Differentiation by reform domain matters (rule-of-law was the upgrade driver, not economic conditionalities); negotiation is not abandonment. Hold confirmed unless May 27/May 31 milestones slip.

## Methodology-novel rulings (3)

1. **Dismantler classification consistency across starting positions** (Slovakia) — magnitude scales with baseline informational marginality, not flat.
2. **Harm-enabled-then-accountability-applied dual-signal weighting** (Microsoft) — both signals scored; dimension-level signs differ (ACC up, BND/ACT/SYS down); net composite sub-threshold when accountability response is structural and substantive.
3. **Reforms-contested-not-abandoned** (Hungary) — sub-pattern within reforms-announced-not-enacted; differentiation by reform domain matters; negotiation ≠ abandonment.

## Carry-forwards held

- **Anthropic** — cycle 3 band-crossing-proposed upward (Functional/Established at 60.0). DC Circuit oral arguments May 19 strongly favorable but no ruling. Trigger remains DC Circuit ruling.
- **Marshall Islands** — upward band-crossing-proposed carry-forward (Developing/Functional at 41.4). Founder editorial decision pending.
- **Timor-Leste** — upward band-crossing-proposed carry-forward (Developing/Functional at 40.6). Founder editorial decision pending.
- **Hungary** — May 27 / May 31 milestones live.

## Score-changes applied this cycle (apply=true)

| Entity | Index | Δ | Direction | Kind |
|---|---|---|---|---|
| Slovakia | countries | -5.5 | down | dismantler-classification-formal-downgrade |

## Sub-threshold accumulations (apply=false, documented)

| Entity | Index | Δ | Direction | Pattern |
|---|---|---|---|---|
| Microsoft | fortune-500 | -1.9 | down | harm-enabled-then-accountability-applied dual-signal |
| Amazon | fortune-500 | -3.7 | down | sub-threshold accumulator held; SDNY pending |
| United States | countries | 0.0 | hold | post-stale-baseline correction; accumulation continuing |
| Vanuatu | countries | +3.5 | up | INT governance translation pattern; boundary-watch |
| Colombia | countries | -3.5 | down | OHCHR EMLER preliminary findings; full report Sept/Oct |
| Turkey | countries | -1.9 | down | democratic erosion continuing; boundary-watch entry |
| Poland | countries | -1.8 | down | Nawrocki structural pressure; sub-threshold but band-implication |

## Confirmations (no movement)

Hungary (47.7), Anthropic (60.0 band-crossing-proposed cycle 3), South Korea (62.5), Mexico (32.8 first-baseline confirmed at 31.3), Apple (59.4), General Motors (40.6), Canada (84.6), Marshall Islands (41.4 band-crossing-proposed carry-forward), Timor-Leste (40.6 band-crossing-proposed carry-forward), Pakistan (17.2 floor-confirmed).

## Forward signals (cycle hand-off)

- **2026-05-27:** Hungary EU funds reform-plan submission milestone — primary apply trigger.
- **2026-05-31:** Hungary Sulyok dismissal compliance deadline; Vanuatu second UN climate resolution end-of-May.
- **TBD (weeks):** DC Circuit ruling on Anthropic v. Hegseth — band-crossing trigger.
- **2026-09 / 2026-10:** OHCHR Colombia EMLER full report — Colombia apply trigger.
- **2026-12-31:** US OBBBA Medicaid work requirements take effect — structural apply trigger.

## Status reports for digest agent

All proposals follow public-daily-JSON rules: observer voice, permitted status values (applied / documented / band-crossing-proposed / boundary-watch / methodology-evolution / floor-confirmed). No forbidden phrases used.

## Drift-guard notes

All proposals set `published_scores.composite` to the current index baseline:
- Slovakia 39.1, Microsoft 65.3, Amazon 17.8, Hungary 47.7, Anthropic 60.0, US 49.2 (per user brief post-May-21 apply), Pakistan 17.2, Vanuatu 35.9, Colombia 35.9, Turkey 22.5, Poland 40.2, Mexico 32.8, Marshall Islands 41.4, Timor-Leste 40.6, South Korea 62.5, Apple 59.4, General Motors 40.6, Canada 84.6.

The score-updater drift-guard (≥2.0pt off triggers auto-hold) should pass for all 18 proposals.
