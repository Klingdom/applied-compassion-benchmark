---
entity: "Mauritania"
type: "Country"
sector: "Government (national)"
date: "2026-08-16"
composite_score: 17.5
band: "Critical"
scores:
  AWR: 2
  EMP: 1.2
  ACT: 2.2
  EQU: 2
  BND: 1.6
  ACC: 1.2
  SYS: 1.8
  INT: 1.6
published_index: "countries"
published_rank: 141
published_composite: 20.3
published_band: "developing"
assessed_composite: 17.5
score_delta: -2.8
band_change: true
recommendation: "confirm"
change_proposal: false
confidence: "medium"
subdim_sidecar: true
study: "20.3 seed-cluster de-seeding study"
seed_vector_replaced: true
---

# Compassion Benchmark Assessment: Mauritania

**Entity type:** Country
**Sector/Domain:** Government (national)
**Assessment date:** 2026-08-16
**Composite score:** 17.5/100
**Band:** Critical

## Determination

Mauritania is published at a composite of 20.3 on the dimension vector 2 / 2 / 2 / 1.5 / 2 / 1.5 / 2 / 1.5. That vector is byte-identical across twelve countries at ranks 134 to 145 of the countries index. It is a never-assessed uniform seed, not a measurement, and the published rank is an artefact of alphabetical ordering within the tie.

This is a full 40-subdimension assessment that replaces the seed with evidence. It returns 17.5 against the published 20.3, a difference of -2.8 points. The band moves from Developing to Critical. The difference does not clear the 5.0-point proposal threshold, so no change proposal is filed. **This produces a band crossing that the proposal threshold cannot carry** — the published band label is wrong but the composite gap is too small to file. That defect is recorded in the study synthesis.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Published (raw) | Difference |
|---|---|---|---|---|---|
| Awareness | AWR | 2 | 25 | 2 | 0 |
| Empathy | EMP | 1.2 | 5 | 2 | -0.8 |
| Action | ACT | 2.2 | 30 | 2 | +0.2 |
| Equity | EQU | 2 | 25 | 1.5 | +0.5 |
| Boundaries | BND | 1.6 | 15 | 2 | -0.4 |
| Accountability | ACC | 1.2 | 5 | 1.5 | -0.3 |
| Systemic Thinking | SYS | 1.8 | 20 | 2 | -0.2 |
| Integrity | INT | 1.6 | 15 | 1.5 | +0.1 |
| **Composite** | — | — | **17.5** | **20.3** | **-2.8** |

Composite produced by `computeCompositeFromDimensions` in `site/scripts/lib/scoring.mjs` (methodology v1.2). The integration premium is 0 because all eight dimensions sit below 4.0, so the weakness factor reduces to 0 and the composite equals the base composite. No harm flag applied.

## Dimension Details

### AWR: Awareness (Raw 2 / Scaled 25)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| A1 Suffering Detection | 3/5 | The national Social Registry covers over 200,000 households, a third of the population, nationwide, and identifies 133,510 extremely poor households for quarterly transfers. | [alliance-sahel.org](https://www.alliance-sahel.org/en/news/social-safety-nets-mauritania-tekavoul/), 2026-01-01 (tier 4) |
| A2 Contextual Sensitivity | 3/5 | Two differentiated instruments operate: Tekavoul for the chronic poor and ELMAOUNA as a shock-responsive safety net for the lean season. | [alliance-sahel.org](https://www.alliance-sahel.org/en/projects/support-project-for-the-rollout-of-the-social-registry-and-social-safety-net-program/), 2026-01-01 (tier 4) |
| A3 Blind Spot Mitigation | 1/5 | Blind-spot discovery is refused outright: the government tells UN bodies there is no slavery in the country. | [unwatch.org](https://unwatch.org/mauritania-to-un-watch-no-slavery-in-the-country/), 2026-01-01 (tier 3) |
| A4 Signal Amplification | 2/5 | Anti-slavery advocacy exists and is partly represented in parliament, but freedom of expression and assembly are violated through internet disruption and excessive force. | [amnesty.org](https://www.amnesty.org/en/location/africa/west-and-central-africa/mauritania/report-mauritania/), 2026-01-01 (tier 4) |
| A5 Anticipatory Awareness | 1/5 | No harm assessment preceded the sweeping raids in which some 30,000 migrants were apprehended in four months. | [hrw.org](https://www.hrw.org/news/2025/08/27/mauritania-years-of-migration-control-abuses), 2025-08-27 (tier 5) |

### EMP: Empathy (Raw 1.2 / Scaled 5)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| E1 Affective Resonance | 2/5 | Tekavoul pairs cash transfers with social promotion sessions, a relational element, but treatment of migrants is documented as cruel. | [alliance-sahel.org](https://www.alliance-sahel.org/en/news/social-safety-nets-mauritania-tekavoul/), 2026-01-01 (tier 4) |
| E2 Perspective-Taking | 1/5 | Decisions are made without modelling the experience of those affected: torture, rape, racist treatment and collective expulsions are documented. | [hrw.org](https://www.hrw.org/report/2025/08/27/they-accused-me-of-trying-to-go-to-europe/migration-control-abuses-and-eu), 2025-08-27 (tier 5) |
| E3 Non-Judgment | 1/5 | Racist treatment of West and Central African migrants is documented, alongside descent-based caste exclusion. | [hrw.org](https://www.hrw.org/report/2025/08/27/they-accused-me-of-trying-to-go-to-europe/migration-control-abuses-and-eu), 2025-08-27 (tier 5) |
| E4 Validation | 1/5 | The state denies to UN bodies that slavery exists, which is the direct invalidation of victims' accounts. | [unwatch.org](https://unwatch.org/mauritania-to-un-watch-no-slavery-in-the-country/), 2026-01-01 (tier 3) |
| E5 Cultural Empathy | 1/5 | Harm is itself culturally targeted: descent-based slavery and the exclusion of Haratine and Afro-Mauritanian communities persist. | [ohchr.org](https://www.ohchr.org/en/countries/mauritania), 2026-07-01 (tier 5) |

### ACT: Action (Raw 2.2 / Scaled 30)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AC1 Responsiveness | 2/5 | Transfers are delivered on a defined quarterly cycle, but no published response standards exist for citizen concerns. | [alliance-sahel.org](https://www.alliance-sahel.org/en/news/social-safety-nets-mauritania-tekavoul/), 2026-01-01 (tier 4) |
| AC2 Proportionality | 3/5 | Transfers were augmented over time, from 1,500 to 3,600 MRU per household per quarter between 2021 and 2024, and targeted through the registry. | [alliance-sahel.org](https://www.alliance-sahel.org/en/projects/support-project-for-the-rollout-of-the-social-registry-and-social-safety-net-program/), 2026-01-01 (tier 4) |
| AC3 Efficacy | 2/5 | No independent outcome evaluation of Tekavoul was located; coverage figures are activity data. | [alliance-sahel.org](https://www.alliance-sahel.org/en/news/social-safety-nets-mauritania-tekavoul/), 2026-01-01 (tier 4) |
| AC4 Resource Mobilization | 3/5 | The government finances 76,929 of the 133,510 covered households from its own budget, a majority share, and scaled the programme nationwide. | [alliance-sahel.org](https://www.alliance-sahel.org/en/news/social-safety-nets-mauritania-tekavoul/), 2026-01-01 (tier 4) |
| AC5 Follow-Through | 1/5 | There is no follow-through for those summarily and collectively expelled. | [hrw.org](https://www.hrw.org/report/2025/08/27/they-accused-me-of-trying-to-go-to-europe/migration-control-abuses-and-eu), 2025-08-27 (tier 5) |

### EQU: Equity (Raw 2 / Scaled 25)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| EQ1 Universality | 3/5 | The social register covers a third of the population nationwide, with published household coverage data. | [alliance-sahel.org](https://www.alliance-sahel.org/en/news/social-safety-nets-mauritania-tekavoul/), 2026-01-01 (tier 4) |
| EQ2 Priority for Vulnerable | 3/5 | Tekavoul explicitly targets extremely poor households and the transfer value was raised three times between 2021 and 2024. | [alliance-sahel.org](https://www.alliance-sahel.org/en/projects/support-project-for-the-rollout-of-the-social-registry-and-social-safety-net-program/), 2026-01-01 (tier 4) |
| EQ3 Bias Awareness | 1/5 | No disaggregated bias data is published and at least 149,000 people remained enslaved as of 2023 while the state denies slavery exists. | [unwatch.org](https://unwatch.org/un-watch-calls-on-mauritania-to-strengthen-anti-slavery-laws/), 2026-01-01 (tier 4) |
| EQ4 Access Design | 2/5 | The registry removes the identification barrier and the nationwide rollout removes the geographic one, but no formal barrier mapping with communities is documented. | [alliance-sahel.org](https://www.alliance-sahel.org/en/news/social-safety-nets-mauritania-tekavoul/), 2026-01-01 (tier 4) |
| EQ5 Historical Harm Acknowledgment | 1/5 | Historical harms are effectively denied: the president has responded coolly to the African Commission and the UN Committee on Enforced Disappearances on reconciliation for violence against Afro-Mauritanians. | [bti-project.org](https://bti-project.org/en/reports/country-report/MRT), 2026-01-01 (tier 4) |

### BND: Boundaries (Raw 1.6 / Scaled 15)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| B1 Self-Sustainability | 2/5 | The safety net is majority government-financed, a partial signal of sustainability, but no frontline staffing data exists. | [alliance-sahel.org](https://www.alliance-sahel.org/en/news/social-safety-nets-mauritania-tekavoul/), 2026-01-01 (tier 4) |
| B2 Autonomy Preservation | 2/5 | Social promotion sessions accompany transfers and aim at capacity, but autonomy outcomes are not measured. | [alliance-sahel.org](https://www.alliance-sahel.org/en/news/social-safety-nets-mauritania-tekavoul/), 2026-01-01 (tier 4) |
| B3 Scope Clarity | 2/5 | Entitlements are defined by programme rules, but limitations are not proactively communicated. | [alliance-sahel.org](https://www.alliance-sahel.org/en/news/social-safety-nets-mauritania-tekavoul/), 2026-01-01 (tier 4) |
| B4 Refusal Ethics | 1/5 | People are turned away without explanation or alternatives, through summary and collective expulsions. | [hrw.org](https://www.hrw.org/report/2025/08/27/they-accused-me-of-trying-to-go-to-europe/migration-control-abuses-and-eu), 2025-08-27 (tier 5) |
| B5 Consent Orientation | 1/5 | Consent is absent where arbitrary arrest, inhumane detention and expulsion are documented. | [hrw.org](https://www.hrw.org/report/2025/08/27/they-accused-me-of-trying-to-go-to-europe/migration-control-abuses-and-eu), 2025-08-27 (tier 5) |

### ACC: Accountability (Raw 1.2 / Scaled 5)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| AB1 Harm Acknowledgment | 1/5 | Harm is denied rather than acknowledged; the state tells UN bodies there is no slavery. | [unwatch.org](https://unwatch.org/mauritania-to-un-watch-no-slavery-in-the-country/), 2026-01-01 (tier 3) |
| AB2 Correction Willingness | 2/5 | Correction came eventually and under pressure: anti-slavery legislation exists and slavery is criminalised, but at least 149,000 people remained enslaved as of 2023. | [unwatch.org](https://unwatch.org/un-watch-calls-on-mauritania-to-strengthen-anti-slavery-laws/), 2026-01-01 (tier 4) |
| AB3 Transparency | 1/5 | No performance or violation data is published; internet disruption was used against expression. | [amnesty.org](https://www.amnesty.org/en/location/africa/west-and-central-africa/mauritania/report-mauritania/), 2026-01-01 (tier 4) |
| AB4 Systemic Learning | 1/5 | The same failures recurred across five years, from 2020 to early 2025. | [hrw.org](https://www.hrw.org/report/2025/08/27/they-accused-me-of-trying-to-go-to-europe/migration-control-abuses-and-eu), 2025-08-27 (tier 5) |
| AB5 Reparative Action | 1/5 | No reparative action for historical violence against Afro-Mauritanians is evidenced; reconciliation calls were met coolly. | [bti-project.org](https://bti-project.org/en/reports/country-report/MRT), 2026-01-01 (tier 4) |

### SYS: Systemic Thinking (Raw 1.8 / Scaled 20)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| S1 Root Cause Orientation | 3/5 | Tekavoul plus the shock-responsive ELMAOUNA scheme is an upstream intervention against chronic and seasonal poverty, with resources attached. | [alliance-sahel.org](https://www.alliance-sahel.org/en/projects/support-project-for-the-rollout-of-the-social-registry-and-social-safety-net-program/), 2026-01-01 (tier 4) |
| S2 Long-Term Impact | 2/5 | The safety net has been scaled progressively since 2021, but no published theory of change with long-horizon tracking was located. | [alliance-sahel.org](https://www.alliance-sahel.org/en/projects/support-project-for-the-rollout-of-the-social-registry-and-social-safety-net-program/), 2026-01-01 (tier 4) |
| S3 Interconnection Awareness | 1/5 | Second-order effects are unmanaged: mass expulsions triggered political tensions with Mali and Senegal. | [hrw.org](https://www.hrw.org/news/2025/08/27/mauritania-years-of-migration-control-abuses), 2025-08-27 (tier 5) |
| S4 Structural Critique | 1/5 | The state denies the existence of the structure that produces the suffering. | [unwatch.org](https://unwatch.org/mauritania-to-un-watch-no-slavery-in-the-country/), 2026-01-01 (tier 3) |
| S5 Coalitional Compassion | 2/5 | Mauritania works with the World Bank and the Sahel Adaptive Social Protection Programme, but joint outcomes are not documented. | [alliance-sahel.org](https://www.alliance-sahel.org/en/projects/support-project-for-the-rollout-of-the-social-registry-and-social-safety-net-program/), 2026-01-01 (tier 4) |

### INT: Integrity (Raw 1.6 / Scaled 15)

| Subdimension | Score | Evidence | Source |
|---|---|---|---|
| I1 Consistency Under Pressure | 2/5 | The government kept scaling Tekavoul and raising transfer values through fiscal stress, financing the majority share itself. | [alliance-sahel.org](https://www.alliance-sahel.org/en/news/social-safety-nets-mauritania-tekavoul/), 2026-01-01 (tier 4) |
| I2 Non-Performance | 1/5 | Anti-slavery law exists for international audiences while the state tells UN bodies slavery does not exist. | [unwatch.org](https://unwatch.org/mauritania-to-un-watch-no-slavery-in-the-country/), 2026-01-01 (tier 3) |
| I3 Internal Consistency | 2/5 | No specific internal-culture evidence was located; scored at the low-middle anchor on absence. | [amnesty.org](https://www.amnesty.org/en/location/africa/west-and-central-africa/mauritania/report-mauritania/), 2026-01-01 (tier 4) |
| I4 Values Alignment | 1/5 | The constitution and law prohibit slavery, yet at least 149,000 people remained enslaved as of 2023, without acknowledgement. | [unwatch.org](https://unwatch.org/un-watch-calls-on-mauritania-to-strengthen-anti-slavery-laws/), 2026-01-01 (tier 4) |
| I5 Resilience of Care | 2/5 | The safety net survived a change of government and continued to expand, but political practice has not been tested by a genuine transition. | [alliance-sahel.org](https://www.alliance-sahel.org/en/projects/support-project-for-the-rollout-of-the-social-registry-and-social-safety-net-program/), 2026-01-01 (tier 4) |

---

## Published Index Comparison

**Published index:** countries | **Published rank:** #141 of 193 | **Published composite:** 20.3/100 | **Published band:** developing

### Math-hygiene reconstruction

Canonical reconstruction of the published dimension vector returns 20.3 against a published composite of 20.3, a difference of 0.0. The published number is arithmetically self-consistent. **The defect is not arithmetic. It is that the input vector was never measured.**

| Dimension | Published (raw) | Published (scaled) | Research (raw) | Research (scaled) | Difference (scaled) |
|---|---|---|---|---|---|
| AWR | 2 | 25 | 2 | 25 | 0 |
| EMP | 2 | 25 | 1.2 | 5 | -20 |
| ACT | 2 | 25 | 2.2 | 30 | +5 |
| EQU | 1.5 | 12.5 | 2 | 25 | +12.5 |
| BND | 2 | 25 | 1.6 | 15 | -10 |
| ACC | 1.5 | 12.5 | 1.2 | 5 | -7.5 |
| SYS | 2 | 25 | 1.8 | 20 | -5 |
| INT | 1.5 | 12.5 | 1.6 | 15 | +2.5 |
| **Composite** | — | **20.3** | — | **17.5** | **-2.8** |

### Score Difference Analysis

The published vector assigns exactly 2.0 to five dimensions and exactly 1.5 to three, with no variance attributable to any evidence about Mauritania. Every dimension difference above is therefore a difference between a placeholder and a measurement, not a disagreement between two readings of the same evidence.

The published band of Developing rests on 20.3, which sits 0.3 points above the Critical ceiling of 20.0. This assessment places Mauritania at 17.5, which is 2.5 points clear of that boundary, so the band change is not a rounding effect.

### Recommendation

Do not file a change proposal. Delta -2.8 falls below the 5.0-point threshold. **However, the band label does change**, so the published record remains materially wrong on the most visible claim the benchmark makes. This is recorded as a threshold defect in the study synthesis rather than as a proposal.

## Key Findings

- Why it matters: Mauritania runs a real, mostly self-funded safety net. Its national social register covers over 200,000 households, a third of the population, and quarterly cash transfers reach 133,510 extremely poor households, of which the government finances 76,929 from its own budget.
- Why it matters: the same state tells the UN that slavery does not exist. The Global Slavery Index recorded at least 149,000 people enslaved as of 2023, and the UN Special Rapporteur reported in July that descent-based slavery persists.
- Why it matters: about 30,000 people were swept up in four months. Human Rights Watch documented torture, rape, racist treatment, arbitrary detention and collective expulsions by Mauritanian security forces against migrants between 2020 and early 2025.
- Why it matters: the band changes but no proposal can be filed. Mauritania assesses at 17.5, inside the Critical band, but the 2.8-point gap from the published 20.3 falls below the 5.0-point threshold required to file a change proposal.
- Why it matters: this reverses an earlier reading. A July 2026 assessment put Mauritania at 20.6 by crediting the safety net without weighing the August 2025 migration-abuse report or the denial of slavery. Both are scored here.

## Strongest Dimensions

Action (2.2), Awareness (2.0) and Equity (2.0). The national social registry and the Tekavoul cash transfer programme are genuine, targeted, majority government-financed structures that identify and reach the poorest households nationwide.

## Weakest Dimensions

Empathy (1.2) and Accountability (1.2). Torture, rape and racist treatment of migrants are documented over five years, slavery is denied to UN bodies, and calls for reconciliation over historical violence against Afro-Mauritanians have been met coolly.

## Evidence Gaps

- No independent evaluation of Tekavoul outcomes was located, so Efficacy is scored on coverage rather than effect.
- Whether any prosecutions followed the documented migration abuses could not be established, so Accountability is scored on the absence of one.
- Mauritania's refugee hosting at Mbera could not be sourced to a current primary document within this study and is therefore not scored.

## Attribution Discipline

Only the conduct of the Mauritania state is scored. Harm by non-state armed groups, by foreign states, and by natural disaster is excluded from the state's score. Where such harm occurred, what is measured is the state's own response to it. Every source date was checked against its event date, and publication dates were not treated as event dates.

## Recommended Next Steps

Mauritania sits in the **Critical** band. Consider a [Certified Assessment](/certified-assessments) for a structured improvement roadmap.

## Sources

- [hrw.org](https://www.hrw.org/report/2025/08/27/they-accused-me-of-trying-to-go-to-europe/migration-control-abuses-and-eu) — 2025-08-27 (evidence tier 5)
- [hrw.org](https://www.hrw.org/news/2025/08/27/mauritania-years-of-migration-control-abuses) — 2025-08-27 (evidence tier 5)
- [ohchr.org](https://www.ohchr.org/en/countries/mauritania) — 2026-07-01 (evidence tier 5)
- [unwatch.org](https://unwatch.org/mauritania-to-un-watch-no-slavery-in-the-country/) — 2026-01-01 (evidence tier 3)
- [unwatch.org](https://unwatch.org/un-watch-calls-on-mauritania-to-strengthen-anti-slavery-laws/) — 2026-01-01 (evidence tier 4)
- [bti-project.org](https://bti-project.org/en/reports/country-report/MRT) — 2026-01-01 (evidence tier 4)
- [amnesty.org](https://www.amnesty.org/en/location/africa/west-and-central-africa/mauritania/report-mauritania/) — 2026-01-01 (evidence tier 4)
- [alliance-sahel.org](https://www.alliance-sahel.org/en/news/social-safety-nets-mauritania-tekavoul/) — 2026-01-01 (evidence tier 4)
- [alliance-sahel.org](https://www.alliance-sahel.org/en/projects/support-project-for-the-rollout-of-the-social-registry-and-social-safety-net-program/) — 2026-01-01 (evidence tier 4)

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
