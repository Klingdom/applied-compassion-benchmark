# Cross-State Consistency Pass — US States Re-Assessment

**Date:** 2026-07-19
**Scope:** 41 of 51 jurisdictions complete at time of analysis; 10 in flight.
**Required by:** `US_STATES_REASSESSMENT_RUNBOOK.md` — "Cross-state consistency pass … review the full set for calibration coherence before applying."

This pass tests whether 51 independently-run parallel assessments produced a coherent dataset or an artifact of shared prompting.

---

## 1. Anchoring test — PASSED

The wave-3 concern was that parallel agents given the same peer-anchor list would converge on a comfortable mean. Three independent tests say they did not.

**Identical-placeholder cohorts resolved to wide spreads.** Agents were told the placeholder value and, in later waves, what sibling states had scored. They did not inherit those numbers.

| Placeholder | States sharing it | Resolved to | Spread |
|---|---|---|---|
| exactly 25.0 | Idaho, Indiana, Missouri, North Dakota, South Dakota | 27.5 / 31.9 / 35.6 / 40.6 / 52.5 | **25.0 pts** |
| exactly 12.5 | Alabama, Arkansas, Mississippi | 31.9 / 33.1 / 40.0 | 8.1 pts |
| exactly 23.4 | Oklahoma, Tennessee | 30.0 / 41.9 | 11.9 pts |
| exactly 94.4 | Massachusetts, Washington | 59.4 / 59.4 | 0.0 — see §4 |

**Corrections ran in both directions.** 7 placeholder rows fell, 11 rose. Mean absolute correction 23.1 points. This is not a downgrade campaign.

**Distribution is smooth.** Range 26.9–60.6, mean 46.2, sd 10.0. Largest gap between adjacent scores is 3.1 points (47.5 → 50.6). No clustering, no bimodality, no pile-up at round numbers.

**Conclusion:** the convergence flagged in wave 3 was genuine signal, not anchoring.

---

## 2. THE HEADLINE FINDING — Boundaries, and an important caveat

**Boundaries (BND) is the weakest dimension nationally, and uniquely so:**

| Dimension | Mean | Min | Max | States ≥3.5 |
|---|---|---|---|---|
| SYS Systemic Thinking | 3.30 | 2.2 | 4.0 | 18 |
| AWR Awareness | 3.19 | 2.4 | 3.8 | 14 |
| ACC Accountability | 2.91 | 1.8 | 3.8 | 3 |
| EQU Equity | 2.90 | 1.6 | 3.8 | 8 |
| ACT Action | 2.86 | 2.2 | 3.6 | 1 |
| INT Integrity | 2.64 | 1.8 | 3.2 | 0 |
| EMP Empathy | 2.61 | 1.8 | 3.6 | 1 |
| **BND Boundaries** | **2.36** | **1.8** | **2.8** | **0** |

**No jurisdiction assessed scores above 2.8 on Boundaries.** Its range (1.0) is the narrowest of any dimension. 26 of 41 score below 2.5.

### This decomposes into a real finding and an artifact — do not report them together

| Subdim | Mean | Low-confidence rate | Evidence density | Verdict |
|---|---|---|---|---|
| B3 Scope Clarity | **1.98** | 5% | 1.98 | **REAL** — well-evidenced |
| B4 Refusal Ethics | **1.88** | 10% | 2.00 | **REAL** — well-evidenced |
| B1 Self-Sustainability | 2.63 | 7% | 2.29 | Real |
| B2 Autonomy Preservation | 2.88 | 2% | 1.95 | Real |
| B5 Consent Orientation | 2.41 | **63%** | **1.80** (lowest) | **ARTIFACT-CONTAMINATED** |

**B3 and B4 are the genuine finding, and it is strong.** They carry normal evidence density and low low-confidence rates. American state institutions systematically fail at two specific things: **telling people clearly what they will and will not do, and refusing with dignity when they must refuse.** Mean scores of 1.98 and 1.88 make these the two lowest-scoring subdimensions across all 40. This is the most consistent finding in the dataset and it is defensible.

Concrete instances agents surfaced independently: North Carolina staff instructed not to send ineligibility notices; Arkansas ending coverage for ~351,000 people with ~76% for paperwork reasons; Mississippi rejecting >90% of cash-welfare applicants; DC opening rental assistance once instead of four times and removing the eviction-stay rule; Vermont exiting ~1,500 people from motel shelter and publishing no destination data.

**B5 is contaminated and must be caveated.** 63% of assessments mark it low confidence — by far the highest of any subdimension — and it has the lowest evidence density. Its 2.41 mean substantially reflects the methodology's "default to the lower anchor when evidence is absent" rule, not measured state conduct. Connecticut's agent stated this explicitly. **B5 is a finding about what is publicly documented, not about how states obtain consent.**

**Recommendation:** publish the Boundaries finding, lead with B3/B4, and disclose the B5 limitation rather than letting it ride inside a dimension average.

---

## 3. Methodological convergence — the AB3 rule

A cross-state transparency rule was proposed by Virginia, then tested by every subsequent assessment. Seven states proposed or refined it; the rest applied it as written.

- **Applied (cap AB3 at 3):** Virginia, Massachusetts, Washington, Missouri, Indiana, Tennessee, Oklahoma, Kentucky, Louisiana, Mississippi, South Dakota
- **Declined — precondition not met:** Idaho, North Dakota, Alabama, Kansas, Arkansas, Florida, Maine, Washington DC
- **Declined as counter-case, scored above the cap:** Connecticut (AB3 = 4), Maine (4), Washington DC (4)

Four refinements were adopted, each from a different state, each correct:
1. **Idaho** — trigger requires branch-level self-exemption, not enumerated carve-outs.
2. **North Dakota** — procedural weakness is not structural failure. *Reached independently, before the Idaho fix was written.*
3. **Connecticut** — it is a cap for the compromised case, not a ceiling for all.
4. **Indiana** — the trigger must cover curtailment of the oversight body itself.

**In no case did the rule change a band.** Maximum observed effect is 1.3 composite points (Tennessee). The rule is a consistency device, not a score driver — which is the correct outcome for a tie-breaking convention.

---

## 4. Items requiring judgment before publication

**a) Massachusetts and Washington both landed on exactly 59.4.** Washington's agent flagged this unprompted as coincidence. Profiles differ materially (WA: SYS 4.0 / BND 2.6; MA: ACT 3.6 / BND 2.4). Both are 0.6 below the Established boundary. Verified as arithmetic coincidence, not anchoring — but two states tying at a band edge invites scrutiny, so the tie is disclosed rather than broken.

**b) Seven jurisdictions sit within 1.0 of a band boundary:**

| Jurisdiction | Composite | Boundary |
|---|---|---|
| Mississippi | 40.0 | exactly at 40 |
| Idaho | 40.6 | near 40 |
| Kansas | 40.6 | near 40 |
| Massachusetts | 59.4 | near 60 |
| Washington | 59.4 | near 60 |
| Illinois | 60.0 | exactly at 60 |
| New Jersey | 60.6 | near 60 |

For all seven, **lead with the number, not the band label.** One subdimension point moves several of them. Mississippi in particular sits exactly on the Developing/Functional line.

**c) Confidence is uniformly medium.** 34 medium, 6 medium-high, 1 high, 0 low. No assessment claims high confidence it has not earned; none is so thin it should be withheld. Appropriate for first baselines.

**d) Idaho's band depends on a methodology judgment.** 40.6 Functional with the AB3 rule declined; 40.0 Developing with it applied. The rule was tightened *because* Idaho identified a real ambiguity, so the tightening is not post-hoc justification — but this is the single most contestable band in the set.

---

## 5. Known limitations to disclose, not conceal

1. **Evidence date precision.** 507 of 2,480 citations (20.4%) in the earliest assessments carry `YYYY-01-01` year-anchored dates rendered with false day-precision. Waves 6–9 carry an explicit `date_precision` field and produced near-zero such dates. Not retro-verified — cost would exceed a full wave's search budget. Claims are sourced; some publication dates are precise only to month or year.

2. **B5 Consent Orientation** — see §2.

3. **Coordinator-brief errors.** Five factual errors in orchestration-supplied prompts were caught by agents (Idaho, Indiana, Louisiana ×2, Washington DC). All caught before scoring. Detection depended entirely on agent verification, not on any orchestration-layer check.

4. **Small-state evidence thinness.** North Dakota, Wyoming and similar carry more low-confidence subdimensions because press coverage is thin. Agents were instructed that absence of reporting is not evidence of good conduct; this appears to have been followed (North Dakota carries 6 of 40 low-confidence).

---

## 6. Verdict

The dataset is **coherent and publishable**, subject to the disclosures in §5 and the boundary-case handling in §4b.

The Boundaries finding (§2) is the most significant substantive result and should lead the publication — with B3/B4 foregrounded and B5 explicitly caveated.
