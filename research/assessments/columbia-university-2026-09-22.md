---
entity: "Columbia University"
type: "Organization"
sector: "Higher education"
date: "2026-09-22"
composite_score: 31.3
band: "Developing"
scores:
  AWR: 2
  EMP: 2
  ACT: 2.8
  EQU: 2.8
  BND: 2.2
  ACC: 2.4
  SYS: 2
  INT: 1.8
published_index: "universities"
published_rank: 59
published_composite: 44.5
published_band: "Functional"
published_dimensions:
  AWR: 3
  EMP: 2.5
  ACT: 3
  EQU: 3.5
  BND: 2.75
  ACC: 2.5
  SYS: 2.75
  INT: 2.25
assessed_composite: 31.3
score_delta: -13.2
band_change: true
filing_trigger_met: true
outcome: "first formal evidence-based baseline; change proposal filed"
assessment_type: "full 40-subdimension first baseline"
recommendation: "downgrade"
change_proposal: true
confidence: "high"
subdim_sidecar: true
methodology_version: "v1.2"
source: "priority"
scan_file: "research/scans/2026-09-22.json"
watch_flag: "Re-test AB1, AB4 and E4 on any ruling, dismissal or settlement in the 14 September 2026 Khalil/SIPA Palestine Working Group suit or the August 2026 Palestinian students and faculty suit — both are currently allegations and neither is scored as a finding. Re-test I1 and I5 if the University Senate governance review’s final report is released to the Senate."
calibration_flag: null
---

# Compassion Benchmark Assessment: Columbia University

**Entity type:** Organization  
**Sector/Domain:** Higher education  
**Assessment date:** 2026-09-22  
**Composite score:** 31.3/100  
**Band:** Developing  
**Cycle:** nightly, lookback 2026-09-08 to 2026-09-22 (scan `research/scans/2026-09-22.json`, source: priority)  
**Outcome:** first formal evidence-based baseline; change proposal filed (recommendation: downgrade)

## Why this entity was assessed

The scanner flagged Columbia on a federal civil-rights lawsuit filed in New York on 14 September 2026 by Mahmoud Khalil and the School of International and Public Affairs Palestine Working Group, alleging the university's "deliberate indifference" to harassment and doxing of pro-Palestinian students. Columbia had never been individually assessed (`last_assessed: null`), so this cycle produces the university's first formal evidence-based baseline.

## Evidence-date and attribution checks

**Dates verified.** The suit was filed 14 September 2026, inside the window. A related suit by Palestinian students and faculty was filed in August 2026, before the window.

**A filed complaint is an allegation, not a finding — the Netflix precedent, applied.** Neither the 14 September 2026 suit nor the August 2026 suit is scored as a finding of conduct. Nothing in either has been decided, and Columbia declined to comment on the pending litigation. **No subdimension score in this assessment rests on either complaint's allegations.**

**What can be scored is documented institutional conduct, and there is a great deal of it.** The following are findings or completed acts, not claims:

1. **A federal finding.** On 23 May 2025 the U.S. Department of Health and Human Services Office for Civil Rights and the U.S. Department of Education jointly issued a Notice of Violation finding Columbia violated Title VI of the Civil Rights Act by acting with deliberate indifference toward student-on-student harassment of Jewish students from 7 October 2023 onward, with factual findings spanning more than 19 months, including that Columbia did not establish effective reporting mechanisms for antisemitism until the summer of 2024 and did not follow its own policies when responding to Jewish students' complaints.
2. **A completed settlement Columbia itself published.** On 23 July 2025 Columbia's board of trustees agreed to pay 200 million dollars to the U.S. Treasury over three years plus 21 million dollars to resolve EEOC charges, and accepted terms including adopting the IHRA definition of antisemitism, disciplining student demonstrators with expulsions, degree revocations and multi-year suspensions, and reviewing its Middle East studies programmes, in exchange for restoration of roughly 400 million dollars in federal funding. The agreement is published at columbia.edu.
3. **An EEOC payout in progress.** The EEOC describes the 21 million dollars as the largest public EEOC settlement in almost 20 years and has begun the payout process to affected employees.
4. **A second completed settlement.** On 27 February 2026 Columbia settled claims brought by Students Against Antisemitism and the StandWithUs Center for Legal Justice, agreeing to appoint a Title VI coordinator, add antisemitism education and training, consider the IHRA definition in its antidiscrimination policies, and establish scholarships.
5. **Documented disciplinary outcomes.** Six students were suspended and evicted from Columbia housing following the March 2024 "Resistance 101" event. (The separate allegation that Columbia retained private investigators to identify participants is an allegation and is **not** scored.)
6. **Documented governance conduct.** Columbia completed a review of the University Senate but as of February 2026 had not given the Senate the final report; the Senate's Rules Committee proceeded with protest and discipline policy revisions in explicit defiance of the trustees in March 2026; Columbia-AAUP published a call for trustee reform in December 2025.

**Not charged to Columbia.** The detention of Mahmoud Khalil by immigration agents was carried out by federal authorities, and the termination of 400 million dollars in federal funding was a federal decision. Neither is scored as Columbia's conduct. What is scored is Columbia's own documented response to both.

## Score Summary

| Dimension | Code | Raw (1-5) | Scaled (0-100) | Band |
|-----------|------|-----------|----------------|------|
| Awareness | AWR | 2 | 25 | Developing |
| Empathy | EMP | 2 | 25 | Developing |
| Action | ACT | 2.8 | 45 | Functional |
| Equity | EQU | 2.8 | 45 | Functional |
| Boundaries | BND | 2.2 | 30 | Developing |
| Accountability | ACC | 2.4 | 35 | Developing |
| Systemic Thinking | SYS | 2 | 25 | Developing |
| Integrity | INT | 1.8 | 20 | Critical |
| **Composite** | — | — | **31.3** | **Developing** |

**Composite derivation (canonical formula, methodology v1.2, `site/scripts/lib/scoring.mjs::computeCompositeFromDimensions`):** mean of the 8 raw dimension scores = 2.250; baseComposite = 31.25; dimensions below 4.0 = 8; integration premium applied by the canonical function. Final composite **31.3** (Developing).

## Dimension Details

### AWR: Awareness (Raw 2/5 — Scaled 25/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| A1 Suffering Detection | 2/5 | A federal finding that detection was reactive and late: Columbia did not establish effective reporting mechanisms for antisemitism until the summer of 2024, more than eight months after October 2023, and problems were established through federal investigation and media rather than through the university’s own pathways. | [HHS Office for Civil Rights — joint Notice of Violation to Columbia University](https://www.hhs.gov/civil-rights/for-providers/compliance-enforcement/examples/national-origin/ocr-joint-notice-of-violation-to-columbia/index.html) | 5 |
| A2 Contextual Sensitivity | 2/5 | Awareness was not adjusted to who was actually being served. Two separate groups — Jewish students (federal finding) and Palestinian students and faculty (August 2026 claim, not scored as a finding) — report the same structural failure to be seen. Accommodation appears to have come on request or under compulsion. | [HHS Office for Civil Rights — joint Notice of Violation to Columbia University](https://www.hhs.gov/civil-rights/for-providers/compliance-enforcement/examples/national-origin/ocr-joint-notice-of-violation-to-columbia/index.html) | 5 |
| A3 Blind Spot Mitigation | 2/5 | Blind-spot process exists in principle but did not deliver its finding: Columbia completed a review of the University Senate and then, as of February 2026, had not provided the Senate with the final report. | [Columbia Spectator — Columbia completed its review of the University Senate](https://www.columbiaspectator.com/news/2026/02/11/columbia-completed-its-review-of-the-university-senate-but-the-senate-has-not-received-the-final-report/) | 2 |
| A4 Signal Amplification | 2/5 | Alternative channels for low-power voices exist but are rarely effective. The University Senate is the designated shared-governance channel for students and faculty, and its own Rules Committee had to proceed in defiance of the trustees in March 2026 to keep proposing protest and discipline revisions. | [Columbia Spectator — defying trustees, University Senate Rules committee will continue](https://www.columbiaspectator.com/news/2026/03/10/defying-trustees-university-senate-rules-committee-will-continue-to-propose-revisions-to-protest-and-discipline-policies/) | 2 |
| A5 Anticipatory Awareness | 2/5 | Harm consideration before major decisions was informal at best. The July 2025 agreement committed the university to expulsions, degree revocations and multi-year suspensions without any documented pre-assessment of the consequences for the students affected. | [Wikipedia — Columbia University's settlement with the Trump administration](https://en.wikipedia.org/wiki/Columbia_University's_settlement_with_the_Trump_administration) | 3 |

### EMP: Empathy (Raw 2/5 — Scaled 25/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| E1 Affective Resonance | 2/5 | Occasional acknowledgment without structural expectation. Faculty response to the July 2025 settlement was reported as fear rather than trust, and the federal finding is that Jewish students’ complaints were not handled under the university’s own procedures. | [Columbia Spectator — faculty react to Columbia’s $200 million settlement](https://www.columbiaspectator.com/news/2025/07/26/theres-a-lot-of-fear-faculty-react-to-columbias-200-million-settlement-with-trump-administration/) | 2 |
| E2 Perspective-Taking | 2/5 | Perspective-taking is acknowledged but not structurally embedded. Governance forums were held in March 2026 at both campuses, yet the same period shows the Senate’s decision-making power being reduced rather than used. | [Columbia University Senate — forum on university governance](https://senate.columbia.edu/content/forum-university-governance) | 3 |
| E3 Non-Judgment | 2/5 | Non-judgment is stated but not measured. Columbia adopted the IHRA definition of antisemitism as a settlement term set externally rather than through a measured review of its own differential outcomes. | [Wikipedia — Columbia University's settlement with the Trump administration](https://en.wikipedia.org/wiki/Columbia_University's_settlement_with_the_Trump_administration) | 3 |
| E4 Validation | 2/5 | Harm reports were met with process and legal posture rather than acknowledgment. The federal finding is that Columbia failed to abide by its own policies and procedures when responding to Jewish students’ complaints, and did not investigate or punish classroom vandalism. | [HHS Office for Civil Rights — joint Notice of Violation to Columbia University](https://www.hhs.gov/civil-rights/for-providers/compliance-enforcement/examples/national-origin/ocr-joint-notice-of-violation-to-columbia/index.html) | 5 |
| E5 Cultural Empathy | 2/5 | Cultural adaptation was externally imposed rather than co-designed: the antisemitism definition, the training programmes and the Middle East studies review all arrive as settlement terms. No adaptation co-designed with an affected community is documented. | [StandWithUs Center for Legal Justice — settlement of antisemitism lawsuit against Columbia](https://standwithus.com/news/legal/standwithus-center-for-legal-justice-announces-settlement-of-antisemitism-lawsuit-against-columbia-university/) | 3 |

### ACT: Action (Raw 2.8/5 — Scaled 45/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| AC1 Responsiveness | 2/5 | Standards existed but were not met. The joint Notice of Violation sets out factual findings spanning more than 19 months in which the university continually failed to protect Jewish students. | [U.S. Department of Education — notice to Columbia’s accreditor of Title VI violation](https://www.ed.gov/about/news/press-release/us-department-of-education-notifies-columbia-universitys-accreditor-of-columbias-title-vi-violation) | 5 |
| AC2 Proportionality | 3/5 | Need genuinely informs response in some cases post-2025: a Title VI coordinator was appointed, training was added, and student health capacity was expanded in proportion to demonstrated demand rather than uniformly. | [Office of the President, Columbia University — investing in the undergraduate experience](https://president.columbia.edu/news/investing-undergraduate-experience) | 4 |
| AC3 Efficacy | 2/5 | Outcome data is collected but not shown to be reviewed and published. The one internal evaluation identified — the University Senate review — was completed but its final report was withheld from the body reviewed. | [Columbia Spectator — Columbia completed its review of the University Senate](https://www.columbiaspectator.com/news/2026/02/11/columbia-completed-its-review-of-the-university-senate-but-the-senate-has-not-received-the-final-report/) | 2 |
| AC4 Resource Mobilization | 4/5 | Genuinely large resources brought to bear, with the gap disclosed: 221 million dollars paid under the 2025 federal resolution, a 21 million dollar EEOC fund now in payout to affected employees, a need-blind financial aid programme meeting full demonstrated need without loans, and dated commitments to add clinical providers in autumn 2026 and exam rooms in spring 2027. | [EEOC — Columbia University agrees to pay $21 million](https://www.eeoc.gov/newsroom/largest-eeoc-public-settlement-almost-20-years-columbia-university-agrees-pay-21-million) | 5 |
| AC5 Follow-Through | 3/5 | Defined follow-through protocols for some populations: the EEOC payout process is running to a published schedule, and the February 2026 settlement created a standing Title VI coordinator role rather than a one-off review. | [EEOC — Columbia University begins payout of $21 million settlement](https://www.eeoc.gov/wysk/columbia-university-begins-payout-21-million-eeoc-settlement-what-you-should-know) | 5 |

### EQU: Equity (Raw 2.8/5 — Scaled 45/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| EQ1 Universality | 3/5 | Coverage data is published for the population Columbia measures: a need-blind admission and no-loan aid programme with published eligibility facts extends access broadly across income. Coverage of other identity groups is not disaggregated publicly. | [Columbia Financial Aid — our financial aid program](https://cc-seas.financialaid.columbia.edu/content/our-financial-aid-program) | 4 |
| EQ2 Priority for Vulnerable | 4/5 | A documented prioritisation framework under which higher-need students receive substantially more: Columbia meets 100% of demonstrated financial need with grants rather than loans, so award size scales with need. This is Columbia’s clearest equity strength. | [Columbia Financial Aid — facts and figures](https://cc-seas.financialaid.columbia.edu/eligibility/facts) | 4 |
| EQ3 Bias Awareness | 2/5 | Some disaggregation exists but Columbia did not investigate its own disparities. The disparities were established by federal regulators, the EEOC and private plaintiffs, not by internal monitoring. | [EEOC — Columbia University agrees to pay $21 million](https://www.eeoc.gov/newsroom/largest-eeoc-public-settlement-almost-20-years-columbia-university-agrees-pay-21-million) | 5 |
| EQ4 Access Design | 3/5 | Access barrier mapping completed and at least two barriers removed: Columbia Health added staff and a telehealth partnership after student demands, and has dated commitments to add providers, exam rooms and relocate counselling services through autumn 2027. | [Columbia Spectator — Columbia Health expands after student demands](https://www.columbiaspectator.com/news/2023/10/04/columbia-health-expands-with-more-staff-new-telehealth-partnership-after-student-demands-for-better-mental-healthcare/) | 2 |
| EQ5 Historical Harm Acknowledgment | 2/5 | Vague acknowledgment rather than formal recognition. The February 2026 settlement created scholarships for one harmed group as a negotiated term, but no formal institutional acknowledgment of a specific historical harm with community involvement was located in this review. | [StandWithUs Center for Legal Justice — settlement of antisemitism lawsuit against Columbia](https://standwithus.com/news/legal/standwithus-center-for-legal-justice-announces-settlement-of-antisemitism-lawsuit-against-columbia-university/) | 3 |

### BND: Boundaries (Raw 2.2/5 — Scaled 30/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| B1 Self-Sustainability | 2/5 | Wellbeing resources exist but are not monitored as an outcome, and the foundation is not stable: faculty reaction to the July 2025 settlement was reported as widespread fear, and Columbia-AAUP said in December 2025 that the trustees were risking the university’s mission, autonomy and appeal. | [Columbia Spectator — faculty react to Columbia’s $200 million settlement](https://www.columbiaspectator.com/news/2025/07/26/theres-a-lot-of-fear-faculty-react-to-columbias-200-million-settlement-with-trump-administration/) | 2 |
| B2 Autonomy Preservation | 3/5 | At least one programme designed to build capacity and exit: no-loan financial aid is explicitly structured so students graduate without debt, which is autonomy-preserving by design rather than dependency-creating. | [Columbia Financial Aid — our financial aid program](https://cc-seas.financialaid.columbia.edu/content/our-financial-aid-program) | 4 |
| B3 Scope Clarity | 2/5 | Limitations acknowledged when raised rather than proactively. Disciplinary policy was revised after the events it was applied to, and the Senate review’s findings were withheld from the body being reviewed. | [Columbia Spectator — road map to remodel a "static" body](https://www.columbiaspectator.com/news/2026/05/07/columbias-review-of-the-university-senate-lays-out-road-map-to-remodel-a-static-body/) | 2 |
| B4 Refusal Ethics | 2/5 | Refusal without structured alternatives. Six students were suspended and evicted from Columbia housing after the March 2024 event, with no documented alternative accommodation or warm referral. | [Forward — after settling antisemitism claims, Columbia faces lawsuit from Palestinian students](https://forward.com/news/844430/columbia-university-lawsuit-palestinian-antisemitism/) | 2 |
| B5 Consent Orientation | 2/5 | Consent functions as institutional protection. Students entered a disciplinary regime whose terms were subsequently renegotiated with a third party — the federal government — rather than with them, and no informed-consent or withdrawal architecture for that regime is documented. | [Columbia University — Federal Resolution Agreement](https://www.columbia.edu/content/federal-resolution-agreement) | 4 |

### ACC: Accountability (Raw 2.4/5 — Scaled 35/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| AB1 Harm Acknowledgment | 2/5 | Anchor 2 exactly: acknowledged only after external establishment. Columbia’s acknowledgments of harm follow, in each case, a federal notice of violation, an EEOC charge or a lawsuit. No self-initiated disclosure preceding external establishment was located. | [HHS Office for Civil Rights — joint Notice of Violation to Columbia University](https://www.hhs.gov/civil-rights/for-providers/compliance-enforcement/examples/national-origin/ocr-joint-notice-of-violation-to-columbia/index.html) | 5 |
| AB2 Correction Willingness | 3/5 | At least one significant course correction based on harm evidence: Columbia established antisemitism reporting mechanisms in summer 2024, appointed a Title VI coordinator, and added training and education programmes. Not anchor 4 or 5, because every correction followed an enforcement action rather than an internal process reaching leadership. | [StandWithUs Center for Legal Justice — settlement of antisemitism lawsuit against Columbia](https://standwithus.com/news/legal/standwithus-center-for-legal-justice-announces-settlement-of-antisemitism-lawsuit-against-columbia-university/) | 3 |
| AB3 Transparency | 2/5 | Some data shared, and failures disclosed when legally required. Columbia does publish the Federal Resolution Agreement on its own website, which is real disclosure of an unflattering outcome; against that, the February 2026 settlement terms are strictly confidential and the Senate review report was withheld. | [Algemeiner — Columbia reaches confidential settlement in antisemitism lawsuit](https://www.algemeiner.com/2026/03/11/columbia-university-reaches-confidential-settlement-antisemitism-lawsuit/) | 3 |
| AB4 Systemic Learning | 2/5 | The signature of anchor 2: the same failure recurs. A federal finding of deliberate indifference to harassment of one student group (2023-2025) is followed by claims of the identical structural failure toward a different student group (2024-2026), indicating post-incident review that did not translate into systemic change. | [PBS NewsHour — Khalil lawsuit says Columbia failed to protect pro-Palestinian activists](https://www.pbs.org/newshour/nation/mahmoud-khalil-lawsuit-says-columbia-university-failed-to-protect-pro-palestinian-activists) | 2 |
| AB5 Reparative Action | 3/5 | At least one case of reparative action the harmed parties treated as meaningful: a 21 million dollar EEOC fund now in active payout to affected employees, which the EEOC calls its largest public settlement in almost 20 years, plus scholarships under the February 2026 settlement announced favourably by the plaintiffs’ organisation. | [EEOC — Columbia University begins payout of $21 million settlement](https://www.eeoc.gov/wysk/columbia-university-begins-payout-21-million-eeoc-settlement-what-you-should-know) | 5 |

### SYS: Systemic Thinking (Raw 2/5 — Scaled 25/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| S1 Root Cause Orientation | 2/5 | Root causes are acknowledged but no resources are directed at them. The corrective machinery is procedural and disciplinary — definitions, coordinators, training, sanctions — rather than aimed at the campus conditions that produced harassment of two different groups. | [Wikipedia — Columbia University's settlement with the Trump administration](https://en.wikipedia.org/wiki/Columbia_University's_settlement_with_the_Trump_administration) | 3 |
| S2 Long-Term Impact | 2/5 | A three-to-five year plan that is primarily aspirational, with some dated milestones: added clinical providers in autumn 2026, exam rooms in spring 2027, counselling relocation by autumn 2027. No published theory of change or long-term outcome tracking. | [Office of the President, Columbia University — investing in the undergraduate experience](https://president.columbia.edu/news/investing-undergraduate-experience) | 4 |
| S3 Interconnection Awareness | 2/5 | Adjacent systems were identified but second-order effects were not tracked. Columbia’s disciplinary and security posture interacted with federal immigration enforcement in a way that is now the subject of litigation, and no public tracking of that interaction by the university was located. | [NBC News — Khalil lawsuit says Columbia failed to protect pro-Palestinian activists](https://www.nbcnews.com/news/us-news/mahmoud-khalil-lawsuit-says-columbia-failed-protect-palestinian-activi-rcna597765) | 2 |
| S4 Structural Critique | 2/5 | Structural critique appears in institutional communications but is disconnected from action. Columbia paid 221 million dollars and accepted externally set definitions, discipline mandates and a curriculum review rather than taking any public position carrying institutional risk; its own AAUP chapter said the trustees failed to defend the university from political pressure. | [Columbia Spectator — law professors clash over how to reform university governance](https://www.columbiaspectator.com/news/2026/09/16/columbia-law-professors-clash-over-how-to-reform-university-governance/) | 2 |
| S5 Coalitional Compassion | 2/5 | Some coalition participation, primarily to Columbia’s own benefit. No documented case of contributing resources, learning or leadership to a coalition on the issues at stake was located in this review. | [Columbia University Senate](https://senate.columbia.edu/) | 2 |

### INT: Integrity (Raw 1.8/5 — Scaled 20/100)

| Subdimension | Score | Evidence | Source | Tier |
|-------------|-------|----------|--------|------|
| I1 Consistency Under Pressure | 1/5 | Anchor 1 exactly: commitments abandoned under political and financial pressure. To restore roughly 400 million dollars in federal funding, Columbia agreed on 23 July 2025 to expel, revoke degrees from and suspend student demonstrators, adopt an externally supplied definition of antisemitism, and submit its Middle East studies programmes to review. | [Wikipedia — Columbia University's settlement with the Trump administration](https://en.wikipedia.org/wiki/Columbia_University's_settlement_with_the_Trump_administration) | 3 |
| I2 Non-Performance | 2/5 | Some genuine practice, primarily reputation- and compliance-motivated. The financial aid programme is genuine and long-standing; the compassion-relevant governance and protection practices arrive as negotiated settlement terms with reputational and financial stakes attached. | [Columbia University — Federal Resolution Agreement](https://www.columbia.edu/content/federal-resolution-agreement) | 4 |
| I3 Internal Consistency | 2/5 | A gap acknowledged but not addressed. Columbia held governance forums in March 2026 and commissioned a Senate review, then withheld the review’s final report from the Senate; faculty and AAUP describe eroded shared governance and fear. | [Columbia Spectator — Columbia completed its review of the University Senate](https://www.columbiaspectator.com/news/2026/02/11/columbia-completed-its-review-of-the-university-senate-but-the-senate-has-not-received-the-final-report/) | 2 |
| I4 Values Alignment | 2/5 | Values are consulted for communications but not consistently applied to decisions. The July 2025 agreement committed the university to actions its own faculty read as contrary to academic freedom, with no documented values-alignment review. | [Columbia Spectator — faculty react to Columbia’s $200 million settlement](https://www.columbiaspectator.com/news/2025/07/26/theres-a-lot-of-fear-faculty-react-to-columbias-200-million-settlement-with-trump-administration/) | 2 |
| I5 Resilience of Care | 2/5 | Most practices depend on current leadership and trustees rather than on embedded structure. The trustees moved to reduce the Senate’s decision-making power, and Columbia-AAUP called publicly in December 2025 for trustee reform. | [Columbia Spectator — defying trustees, University Senate Rules committee will continue](https://www.columbiaspectator.com/news/2026/03/10/defying-trustees-university-senate-rules-committee-will-continue-to-propose-revisions-to-protest-and-discipline-policies/) | 2 |

## Published Index Comparison

**Published index:** universities | **Published rank:** #59 | **Published composite:** 44.5/100 | **Published band:** Functional

| Dimension | Published (raw) | Published (scaled) | Research (raw) | Research (scaled) | Difference (scaled) |
|-----------|----------------|-------------------|----------------|-------------------|---------------------|
| AWR | 3 | 50 | 2 | 25 | -25 |
| EMP | 2.5 | 37.5 | 2 | 25 | -12.5 |
| ACT | 3 | 50 | 2.8 | 45 | -5 |
| EQU | 3.5 | 62.5 | 2.8 | 45 | -17.5 |
| BND | 2.75 | 43.8 | 2.2 | 30 | -13.8 |
| ACC | 2.5 | 37.5 | 2.4 | 35 | -2.5 |
| SYS | 2.75 | 43.8 | 2 | 25 | -18.8 |
| INT | 2.25 | 31.3 | 1.8 | 20 | -11.3 |
| **Composite** | — | **44.5** | — | **31.3** | **-13.2** |

**Math-hygiene reconstruction:** the canonical formula applied to the published dimension vector returns 44.5 against a published 44.5 (difference 0). Within the 0.5-point tolerance — no math-hygiene issue.

### Score Difference Analysis

The published 44.5 is a differentiated vector (AWR 3.0, EMP 2.5, EQU 3.5, INT 2.25) rather than a uniform seed artefact, so it plausibly reflects an earlier desk judgement. The measured baseline is materially lower, and the reason is a Tier 5 government finding that was not reflected in it.

**AWR (published 3.0 / 50.0 scaled; research 2.0 / 25.0; -25.0).** A published 3.0 asserts "some proactive mechanisms, inconsistent." The joint federal Notice of Violation of 23 May 2025 establishes something weaker: Columbia had no effective reporting mechanism for antisemitism until the summer of 2024, and the problem was established by federal investigation rather than by the university. That is anchor 2.

**INT (published 2.25 / 31.3; research 1.8 / 20.0; -11.3).** I1 is scored at 1, the lowest value assigned anywhere in this assessment, and it is the single most consequential score here. Anchor 1 reads "commitments abandoned under financial or political pressure." On 23 July 2025 Columbia agreed to expel students, revoke degrees, adopt an externally supplied definition of antisemitism and submit a named academic programme to review, in exchange for restoration of roughly 400 million dollars in federal funding. This is not a marginal judgement.

**ACC (published 2.5 / 37.5; research 2.4 / 35.0; -2.5).** Nearly unchanged, and it is worth saying why. Columbia does make real repair: the 21 million dollar EEOC fund is in active payout and is the largest public EEOC settlement in almost 20 years (AB5 = 3), and it publishes the Federal Resolution Agreement on its own site. What it does not do is acknowledge before compulsion (AB1 = 2) or learn systemically (AB4 = 2) — the same structural failure recurred toward a second student group.

**EQU (published 3.5 / 62.5; research 2.8 / 45.0; -17.5).** Columbia's financial aid is genuinely strong and EQ2 scores 4: it meets full demonstrated need with grants, not loans, so award size scales with need. But EQ3 falls to 2 because Columbia did not identify its own disparities — regulators and plaintiffs did.

**SYS (published 2.75 / 43.8; research 2.0 / 25.0; -18.8).** S4 is the driver. An institution that pays 221 million dollars and accepts external control of its definitions, discipline and curriculum review has not taken a public position carrying institutional risk.

**ACT holds best (published 3.0 / 50.0; research 2.8 / 45.0).** AC4 scores 4. Whatever else is true, Columbia moves large resources: 221 million dollars paid, a 21 million dollar payout in progress, need-blind no-loan aid, and dated health-capacity commitments running to autumn 2027.

**What is explicitly not in these scores.** Neither the 14 September 2026 nor the August 2026 lawsuit is scored as a finding. The September suit appears at AB4 only as evidence that the *pattern* of claims recurs, which is an observation about Columbia's documented learning record rather than an adjudication of the new claim. The allegation that Columbia retained private investigators is not scored at all.

### Recommendation

The published 44.5 (Functional) is **overstated** on current evidence. The measured baseline is 31.3 (Developing), a delta of -13.2 with a band crossing from Functional to Developing. A change proposal is filed on both the magnitude and band-crossing triggers.

Confidence is **high**. The score rests on a joint finding by two federal agencies, an EEOC settlement the EEOC itself characterises as its largest public settlement in almost 20 years, a resolution agreement Columbia published on its own website, a second completed settlement, and documented disciplinary and governance conduct. None of it depends on the two pending lawsuits, and the assessment would reach the same band if both were dismissed tomorrow.

## Screening checks (§3e-bis)

1. **Baseline provenance — checked.** `research/APPLIED_CHANGES.md` contains no Columbia row, no Columbia assessment files exist on disk, and `rotation-state.json` records `last_assessed: null`. The published 44.5 has never been set by an evidence-based assessment.
2. **No "stale baseline" rationale against the record.** The rationale is that the score has never been measured and that a May 2025 federal finding is not reflected in it. Both are consistent with the documented history.
3. **Directionality matches the evidence.** Columbia was surfaced on negative within-window evidence and the proposal moves down. No dimension moves up on the absence of harm. Positive evidence was searched for and found — need-blind no-loan financial aid, a functioning University Senate, dated health-capacity investment, an active EEOC payout — and is scored (EQ2 = 4, AC4 = 4, AB5 = 3).
4. **Rationale-versus-history consistency.** No prior Columbia finding exists for this to contradict.
5. **Not a calibration argument.** No claim is made about Columbia's position relative to peers in the universities index. The move is driven entirely by entity-specific Tier 5 evidence.
6. **Allegation discipline (the Netflix precedent).** The two pending suits are recorded and explicitly excluded from scoring. Every score-moving fact is a completed act, a regulator finding or a published agreement.

## Key Findings

- Two federal agencies found Columbia broke civil-rights law. On 23 May 2025 the Department of Health and Human Services and the Department of Education jointly found Columbia acted with deliberate indifference to harassment of Jewish students from 7 October 2023, with factual findings covering more than 19 months, including that it had no effective antisemitism reporting mechanism until summer 2024.
- Columbia paid 221 million dollars and accepted outside control of its own discipline. On 23 July 2025 it agreed to pay 200 million dollars to the U.S. Treasury and 21 million dollars to settle EEOC charges, and to expel students, revoke degrees and review its Middle East studies programmes, in exchange for restoring about 400 million dollars in federal funding.
- The same failure then recurred toward a different group. Claims filed in August and September 2026 allege the identical structural failure — not protecting students who reported harassment — toward Palestinian students and faculty. These are allegations, not findings, and are not scored as conduct; but the recurrence of the pattern is what caps Columbia’s systemic-learning score at 2 of 5.
- Columbia does make real repair, and it is scored. The 21 million dollar EEOC fund is in active payout to affected employees and is the largest public EEOC settlement in almost 20 years, and Columbia publishes the federal resolution agreement on its own website.
- Financial aid is the genuine strength. Columbia meets 100% of demonstrated financial need with grants rather than loans, so the largest awards go to the students with the least money — the highest-scoring practice in this assessment.

## Strongest Dimensions

**ACT (2.8 raw)** and **EQU (2.8)**, and within them two specific practices. AC4 scores 4 because Columbia moves genuinely large resources, including a 21 million dollar payout now reaching affected employees. EQ2 scores 4 because need-blind admission with no-loan aid makes award size scale with need. Neither dimension is strong in absolute terms; they are simply the least weak.

## Weakest Dimensions

**INT (1.8 raw)** and **AWR (2.0) / SYS (2.0)**. I1 scores 1 of 5 — the only floor-level score in this assessment — because Columbia abandoned commitments on student discipline and academic programme autonomy under financial and political pressure. Awareness is at 2 because a federal finding establishes that the university had no working way to hear about harm for eight months after it began.

## Evidence Gaps

- The HHS and Department of Education primary documents returned HTTP 403 to automated retrieval, so the federal finding is cited through the agencies’ own URLs and corroborating national reporting rather than through fetched verbatim text. No quote is attached to those URLs for that reason.
- The February 2026 settlement terms are confidential, so the adequacy of that repair cannot be assessed and AB5 is held at 3.
- The University Senate governance review’s final report has not been released, which limits assessment of A3, AC3 and I3.
- No formal Columbia acknowledgment of a specific historical institutional harm was located in this review, so EQ5 is scored at the lower anchor with the gap recorded rather than treated as denial.
- Employee and student experience data (Glassdoor, campus climate surveys) was not gathered this cycle, which limits confidence on E1 and B1.

## Recommended Next Steps

- **Critical/Developing**: Consider a [Certified Assessment](/certified-assessments) for a structured improvement roadmap.

## Sources

- [HHS Office for Civil Rights — joint Notice of Violation to Columbia University](https://www.hhs.gov/civil-rights/for-providers/compliance-enforcement/examples/national-origin/ocr-joint-notice-of-violation-to-columbia/index.html)
- [Columbia Spectator — Columbia completed its review of the University Senate](https://www.columbiaspectator.com/news/2026/02/11/columbia-completed-its-review-of-the-university-senate-but-the-senate-has-not-received-the-final-report/)
- [Columbia Spectator — defying trustees, University Senate Rules committee will continue](https://www.columbiaspectator.com/news/2026/03/10/defying-trustees-university-senate-rules-committee-will-continue-to-propose-revisions-to-protest-and-discipline-policies/)
- [Wikipedia — Columbia University's settlement with the Trump administration](https://en.wikipedia.org/wiki/Columbia_University's_settlement_with_the_Trump_administration)
- [Columbia Spectator — faculty react to Columbia’s $200 million settlement](https://www.columbiaspectator.com/news/2025/07/26/theres-a-lot-of-fear-faculty-react-to-columbias-200-million-settlement-with-trump-administration/)
- [Columbia University Senate — forum on university governance](https://senate.columbia.edu/content/forum-university-governance)
- [StandWithUs Center for Legal Justice — settlement of antisemitism lawsuit against Columbia](https://standwithus.com/news/legal/standwithus-center-for-legal-justice-announces-settlement-of-antisemitism-lawsuit-against-columbia-university/)
- [U.S. Department of Education — notice to Columbia’s accreditor of Title VI violation](https://www.ed.gov/about/news/press-release/us-department-of-education-notifies-columbia-universitys-accreditor-of-columbias-title-vi-violation)
- [Office of the President, Columbia University — investing in the undergraduate experience](https://president.columbia.edu/news/investing-undergraduate-experience)
- [EEOC — Columbia University agrees to pay $21 million](https://www.eeoc.gov/newsroom/largest-eeoc-public-settlement-almost-20-years-columbia-university-agrees-pay-21-million)
- [EEOC — Columbia University begins payout of $21 million settlement](https://www.eeoc.gov/wysk/columbia-university-begins-payout-21-million-eeoc-settlement-what-you-should-know)
- [Columbia Financial Aid — our financial aid program](https://cc-seas.financialaid.columbia.edu/content/our-financial-aid-program)
- [Columbia Financial Aid — facts and figures](https://cc-seas.financialaid.columbia.edu/eligibility/facts)
- [Columbia Spectator — Columbia Health expands after student demands](https://www.columbiaspectator.com/news/2023/10/04/columbia-health-expands-with-more-staff-new-telehealth-partnership-after-student-demands-for-better-mental-healthcare/)
- [Columbia Spectator — road map to remodel a "static" body](https://www.columbiaspectator.com/news/2026/05/07/columbias-review-of-the-university-senate-lays-out-road-map-to-remodel-a-static-body/)
- [Forward — after settling antisemitism claims, Columbia faces lawsuit from Palestinian students](https://forward.com/news/844430/columbia-university-lawsuit-palestinian-antisemitism/)
- [Columbia University — Federal Resolution Agreement](https://www.columbia.edu/content/federal-resolution-agreement)
- [Algemeiner — Columbia reaches confidential settlement in antisemitism lawsuit](https://www.algemeiner.com/2026/03/11/columbia-university-reaches-confidential-settlement-antisemitism-lawsuit/)
- [PBS NewsHour — Khalil lawsuit says Columbia failed to protect pro-Palestinian activists](https://www.pbs.org/newshour/nation/mahmoud-khalil-lawsuit-says-columbia-university-failed-to-protect-pro-palestinian-activists)
- [NBC News — Khalil lawsuit says Columbia failed to protect pro-Palestinian activists](https://www.nbcnews.com/news/us-news/mahmoud-khalil-lawsuit-says-columbia-failed-protect-palestinian-activi-rcna597765)
- [Columbia Spectator — law professors clash over how to reform university governance](https://www.columbiaspectator.com/news/2026/09/16/columbia-law-professors-clash-over-how-to-reform-university-governance/)
- [Columbia University Senate](https://senate.columbia.edu/)

---

*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
