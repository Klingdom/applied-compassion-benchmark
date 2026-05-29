---
entity: "Democratic Republic of the Congo"
type: "Country"
sector: "Government"
date: "2026-05-29"
composite_score: 2.3
band: "Critical"
scores:
  AWR: 1.125
  EMP: 1
  ACT: 1.1
  EQU: 1
  BND: 1.1
  ACC: 1.1
  SYS: 1.1
  INT: 1.2
published_index: "countries"
published_rank: 181
published_composite: 2.3
published_band: "critical"
assessment_kind: "near-floor-confirmation-with-entity-mapping-flag"
---

# Compassion Benchmark Assessment: Democratic Republic of the Congo (2026-05-29)

**Trigger:** Priority flag (priority_score 57, T2). UN (May 2026): 26.5M facing acute hunger, 3.6M at emergency levels; new Ebola outbreak (Bundibugyo strain) in Ituri; 3.59M internally displaced (N/S Kivu); only 23% of those targeted reached under the 2026 response plan; Goma airport closed disrupting aid; Rwanda-backed M23 conflict ongoing.

## ENTITY-MAPPING FLAG (DATA HYGIENE)

The scanner slug `democratic-republic-of-c` must be matched to the countries.json entry **"Democratic Republic of C"** (composite **2.3**, rank 181), NOT to "Republic of Congo" (composite 20.3, rank 149). A naive substring/slug match resolves to the wrong country. This assessment uses the correct DRC baseline of 2.3. **Recommend a downstream slug-canonicalization fix** so the truncated name "Democratic Republic of C" carries an explicit slug field.

## Drift-Guard Check

Published composite 2.3 (near-floor Critical). Working baseline = 2.3. Drift = 0 → **ACCEPT**.

## Near-Floor Confirmation

DRC sits just above the harm-flag floor (2.3) rather than at 0.0 because the state is not the sole agent of harm — the M23/Rwanda-backed conflict is an external/proxy driver, and some state and UN-partnered relief structures nominally function. The May 2026 evidence (Ebola resurgence, 26.5M acute hunger, 23% reach rate, Goma airport closure) is continuation-and-deepening of the existing crisis, not a discrete state-decision scoring event. No movement off 2.3.

| Dimension | Code | Raw | Evidence | Source |
|-----------|------|-----|----------|--------|
| AWR | AWR | 1.125 | Some UN-partnered detection; Ebola surveillance functioning | AJ May 17 |
| EMP | EMP | 1 | No meaningful state affective response to displaced | UNOCHA |
| ACT | ACT | 1.1 | Only 23% of targeted reached; aid access collapsing | news.un.org 1167495 |
| EQU | EQU | 1 | Eastern populations (Kivu, Ituri) bear concentrated harm | UNOCHA |
| BND | BND | 1.1 | Minimal autonomy/consent infrastructure | UNOCHA |
| ACC | ACC | 1.1 | Limited acknowledgment; conflict externalized to M23/Rwanda | AJ May 17 |
| SYS | SYS | 1.1 | Symptom relief only; conflict root cause unaddressed | UNOCHA |
| INT | INT | 1.2 | Fragile state structures; some continuity | UNOCHA |

**Composite:** 2.3 (verified via canonical formula; harm flag → integration premium 0).

## Key Findings
- ENTITY-MAPPING FLAG: scanner slug resolves ambiguously between DRC (2.3) and Republic of Congo (20.3) — DRC is correct.
- New Ebola outbreak (Bundibugyo strain, high lethality) in Ituri compounds humanitarian collapse.
- 26.5M in acute hunger; 3.6M at emergency levels; only 23% of targeted population reached.
- Goma airport closure severs a primary aid corridor.

## Recommendation
**CONFIRM at 2.3 (near-floor).** No composite movement. Raise ENTITY-MAPPING data-hygiene flag for downstream slug fix. Confidence: HIGH on score; data-hygiene flag MEDIUM-HIGH.

## Sources
- https://news.un.org/en/story/2026/05/1167495
- https://www.aljazeera.com/features/2026/5/17/drc-faces-deadly-ebola-resurgence-amid-worsening-humanitarian-crisis
- https://www.unocha.org/democratic-republic-congo

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment.*
