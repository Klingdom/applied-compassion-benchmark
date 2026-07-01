---
entity: "California"
type: "State"
sector: "Government (US State)"
date: "2026-07-01"
assessment_type: "baseline-establishment-confirmation"
composite_score: 87.7
band: "Exemplary"
scores: { AWR: 4.5, EMP: 4.5, ACT: 4.5, EQU: 4, BND: 4, ACC: 3.5, SYS: 4.5, INT: 4 }
published_index: "us-states"
published_rank: 5
published_composite: 87.7
published_band: "Exemplary"
recommendation: "confirm"
delta: 0.0
direction: "none"
confidence: "medium"
watch_flags: ["ACC (LA protest policing — tear gas/batons)", "EQU (homelessness scale 161,548)", "ACT (housing-agency execution)"]
---

# Assessment: California — First Formal Baseline Confirmation

**Composite:** 87.7/100 (CONFIRM — first formal assessment establishes the live baseline)
**Band:** Exemplary

## Why it matters (plain language)
California had never been formally assessed. This run establishes its baseline. On July 1, 2026, the state launched the new California Housing and Homelessness Agency to consolidate housing, homelessness, and civil-rights work — a structural investment in a hard problem. California's SB 243 (Companion Chatbot law, in effect since January 1, 2026) is one of the first US laws to require AI-harm safeguards, including suicide/self-harm protocols and minor protections. These are compassion-forward, anticipatory moves. Against them: California still has 161,548 homeless people (27.9% of the US total, though down 4% year over year), and Los Angeles police used tear gas and batons on "No Kings" protesters. On balance the within-window evidence is net mildly positive and consistent with the Exemplary band.

## Baseline provenance (§3e-bis(1))
- Live baseline **87.7**, rank **5** of 21 published US states, Exemplary. Dimensions AWR/EMP/ACT/SYS 4.5, EQU/BND/INT 4.0, ACC 3.5.
- **Never previously assessed** — this is a baseline-establishment run, not a re-litigation. The composite reconstructs cleanly under the canonical formula (base 79.7 + integration premium 8.0 = 87.7; one dimension below 4.0 → weaknessFactor 0.8). No math-hygiene issue.

## Dimension detail

| Dimension | Code | Raw | Scaled | Evidence (within-window + structural) |
|-----------|------|-----|--------|----------------------------------------|
| Awareness | AWR | 4.5 | 87.5 | Disaggregated state data systems (HCD, HHAP, CalHHS), Point-in-Time counts, early-warning on housing/AI harms (SB 243). Strong detection infrastructure. |
| Empathy | EMP | 4.5 | 87.5 | Extensive community-input mandates; multilingual services; SB 243 minor-protection design signals concern for vulnerable users. |
| Action | ACT | 4.5 | 87.5 | New Housing & Homelessness Agency (Jul 1) consolidates response; Medicaid (Medi-Cal) expansion; 4% homelessness reduction 2024-25 shows response traction. |
| Equity | EQU | 4.0 | 75.0 | Broad safety net and civil-rights focus in CHHA; anti-discrimination rules for automated decision systems. Tempered by 161,548 homeless (largest US caseload) — unmet need at scale. |
| Boundaries | BND | 4.0 | 75.0 | Consent/autonomy protections strong (privacy law, CPRA); SB 243 mandates disclosure and non-deception in AI interactions. |
| Accountability | ACC | 3.5 | 62.5 | State Auditor transparency and published outcome data, but persistent audit findings on homelessness-spending oversight; LA protest policing (tear gas/batons) is a within-window accountability watch. Lowest dimension. |
| Systemic | SYS | 4.5 | 87.5 | Root-cause orientation: housing production reform, climate policy, upstream AI regulation. Strong structural-change posture. |
| Integrity | INT | 4.0 | 75.0 | Values-consistent legislating (SB 243 passed against industry pressure); durable across administrations. |
| **Composite** | — | — | **87.7** | Base 79.7 + integration premium 8.0. |

## §3e-bis screening
- **Directionality:** surfaced on mixed (net-positive) within-window evidence. Positive own-conduct (new agency, SB 243, ADS anti-discrimination rules) supports the Exemplary band but is consistent with the existing 87.7 — not a >=5-point upgrade.
- **Chronic vs new (double-count):** the homelessness caseload is a chronic, already-known structural weakness already priced into EQU 4.0 and ACC 3.5; the 4% year-over-year reduction is directionally positive but modest.
- **Attribution:** LA protest policing is partly municipal (City/County of LA) but carries state-level accountability weight; a single documented incident does not clear the threshold against a state at 87.7. Logged as ACC watch.

## Disposition
**CONFIRM at 87.7. Delta 0.0. No change proposal.** Confidence: medium (first baseline; desk-based).
- **Forward trigger (downgrade):** a pattern of state-sanctioned protest suppression, or reversal of the homelessness-reduction trend, would pressure ACC/EQU.
- **Forward trigger (upgrade):** documented, verified homelessness-reduction outcomes from the new agency plus narrowing equity gaps would support an EQU/ACT move.
- **Watch:** ACC (protest policing), EQU (homelessness scale), ACT (agency execution).

---
*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*

Sources:
- https://www.hcd.ca.gov/about-hcd/newsroom/governor-newsom-restructures-state-government-to-combat-homelessness-boost-housing-and-affordability
- https://californiacouncil.org/news/california-to-launch-new-housing-and-homelessness-agency
- https://www.skadden.com/insights/publications/2025/10/new-california-companion-chatbot-law
- https://perkinscoie.com/insights/update/california-companion-chatbot-law-now-effect
- https://homelessstrategy.com/proposed-2026-california-legislation-concerning-homelessness/
- site/src/data/indexes/us-states.json (live baseline 87.7, rank 5)
