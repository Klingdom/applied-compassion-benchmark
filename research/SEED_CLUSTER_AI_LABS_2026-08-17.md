---
study: "ai-labs 60.9 and 48.4 seed-cluster de-seeding study"
date: "2026-08-17"
index: "ai-labs"
cluster_a_entities: ["Abridge","AI21 Labs","Cohere","Isomorphic Labs","Recursion Pharma","Sakana AI","Tempus AI"]
cluster_b_entities: ["Adept AI","Databricks","Groq","Harvey AI","Inflection AI","Labelbox","SambaNova Systems","Typeface"]
prior_reference_points: ["Cerebras Systems (ai-labs, 2026-08-11, 60.9 -> 38.8)","Cognition AI (ai-labs, 37.5 -> 27.5)","robotics-labs 60.9 cluster (2026-08-16, mean -30.04)","countries 20.3 cluster (2026-08-16, mean -1.18)"]
methodology_template: "research/SEED_CLUSTER_ROBOTICS_60.9_CALIBRATION_2026-08-16.md"
assessments_written: 15
sidecars_written: 15
proposals_filed: 15
band_crossings: 15
sub_threshold_band_crossings: 0
entity_currency_defects: 5
hypothesis: "60.9 and 48.4 are unmeasured"
hypothesis_result: "CONFIRMED. Both seeds were unmeasured AND both were systematically generous. All 15 moved down and all 15 left their published band."
health_mission_divergence: "NONE. Health and life-sciences labs moved -24.18 on average against -25.07 for the rest of cluster A. Mission did not predict score."
---

# The ai-labs 60.9 and 48.4 Seed Clusters: De-Seeding Study

**Date:** 2026-08-17
**Index:** ai-labs
**Entities assessed:** 15, each with a full 40-subdimension assessment — 600 subdimension scores
**Method template:** `research/SEED_CLUSTER_ROBOTICS_60.9_CALIBRATION_2026-08-16.md`
**Prior reference points:** Cerebras Systems and Cognition AI, same index, not re-scored

---

## 1. What was wrong

Fifteen AI labs sat in two blocks of the ai-labs index on two composite values and two dimension vectors.

**Cluster A — ranks 5 to 11, composite 60.9, band "Established":**

```
AWR 3.5 · EMP 3.5 · ACT 3.5 · EQU 3 · BND 3.5 · ACC 3.5 · SYS 3.5 · INT 3.5
```

**Cluster B — ranks 16 to 23, composite 48.4, band "Functional":**

```
AWR 3 · EMP 3 · ACT 3 · EQU 2.5 · BND 3 · ACC 3 · SYS 3 · INT 3
```

Both vectors are byte-identical within their cluster. Neither is a measurement. The ranks are an artefact of alphabetical ordering inside the tie — Abridge, AI21, Cohere, Isomorphic, Recursion, Sakana, Tempus; then Adept, Databricks, Groq, Harvey, Inflection, Labelbox, SambaNova, Typeface.

The arithmetic was never wrong. Canonical reconstruction of the cluster A vector returns exactly 60.9 and of the cluster B vector exactly 48.4, with an integration premium of 0 in both cases because every dimension sits below 4.0. **The defect was that the input was never measured.**

Cluster A is the more exposed of the two. It sits 0.9 points above the Functional/Established boundary, the same razor margin the robotics 60.9 cluster carried. Seven labs were publicly labelled "Established", the benchmark's second-highest band, because a placeholder landed just above a line.

---

## 2. Before and after

| Lab | Cluster | Stage | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT | Composite | Band |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| *All seven* | A | **Before (seed)** | 3.5 | 3.5 | 3.5 | 3.0 | 3.5 | 3.5 | 3.5 | 3.5 | **60.9** | Established |
| **Cohere** | A | After | 3.0 | 2.6 | 2.8 | **3.4** | 2.4 | 2.2 | 3.0 | 2.6 | **43.8** | **Functional** |
| **Recursion Pharma** | A | After | 2.4 | 2.2 | 2.6 | 2.4 | 2.6 | **3.0** | 2.8 | 2.8 | **40.0** | Developing |
| **Abridge** | A | After | 2.6 | 2.6 | 2.8 | 2.8 | **2.0** | 2.2 | 2.6 | 2.2 | **36.9** | Developing |
| **Tempus AI** | A | After | 2.4 | **2.0** | 3.0 | 2.8 | 2.2 | 2.4 | 2.6 | **2.0** | **35.6** | Developing |
| **Isomorphic Labs** | A | After | **3.2** | **2.0** | 2.2 | **2.0** | 2.2 | 2.2 | 3.0 | 2.2 | **34.4** | Developing |
| **Sakana AI** | A | After | 2.4 | 2.2 | 2.2 | 2.6 | 2.2 | **2.0** | 2.8 | 2.2 | **33.1** | Developing |
| **AI21 Labs** | A | After | 2.2 | 2.2 | 2.2 | 2.4 | 2.2 | 2.2 | 2.2 | 2.2 | **30.6** | Developing |
| *All eight* | B | **Before (seed)** | 3.0 | 3.0 | 3.0 | 2.5 | 3.0 | 3.0 | 3.0 | 3.0 | **48.4** | Functional |
| **Databricks** | B | After | 2.4 | 2.2 | 2.2 | 2.2 | 2.4 | 2.2 | 2.4 | **2.0** | **31.3** | Developing |
| **Inflection AI** | B | After | 2.2 | **2.8** | **2.0** | 2.4 | **2.0** | **2.0** | **2.0** | 2.2 | **30.0** | Developing |
| **Harvey AI** | B | After | 2.4 | **2.0** | 2.2 | **2.0** | 2.2 | 2.2 | **2.0** | 2.2 | **28.7** | Developing |
| **Groq** | B | After | **2.0** | 2.2 | 2.2 | **2.0** | 2.2 | **2.0** | **2.0** | 2.2 | **27.5** | Developing |
| **Adept AI** | B | After | **2.0** | **2.0** | **2.0** | **2.0** | 2.2 | **2.0** | **2.0** | **2.0** | **25.6** | Developing |
| **SambaNova Systems** | B | After | **2.0** | **2.0** | 2.2 | **2.0** | **2.0** | **2.0** | **2.0** | **2.0** | **25.6** | Developing |
| **Typeface** | B | After | **2.0** | **2.0** | 2.2 | **2.0** | **2.0** | **2.0** | **2.0** | **2.0** | **25.6** | Developing |
| **Labelbox** | B | After | **1.8** | **2.0** | 2.2 | **1.8** | **1.8** | **2.0** | **2.0** | **2.0** | **23.8** | Developing |

Bold values sit at or below 2.0, the assessment's absence-of-disclosure baseline. No dimension in this study reaches 3.5, and none reaches 4.0.

### Composite movement

| Lab | Cluster | Published | Assessed | Delta | Band change | Proposal | Filing clause | Evidence test |
|---|---|---|---|---|---|---|---|---|
| AI21 Labs | A | 60.9 | **30.6** | **-30.3** | Established → Developing | Yes | Both | FAIL |
| Sakana AI | A | 60.9 | **33.1** | **-27.8** | Established → Developing | Yes | Both | PASS |
| Isomorphic Labs | A | 60.9 | **34.4** | **-26.5** | Established → Developing | Yes | Both | PASS |
| Tempus AI | A | 60.9 | **35.6** | **-25.3** | Established → Developing | Yes | Both | PASS |
| Labelbox | B | 48.4 | **23.8** | **-24.6** | Functional → Developing | Yes | Both | FAIL |
| Abridge | A | 60.9 | **36.9** | **-24.0** | Established → Developing | Yes | Both | PASS |
| Adept AI | B | 48.4 | **25.6** | **-22.8** | Functional → Developing | Yes | Both | FAIL |
| SambaNova Systems | B | 48.4 | **25.6** | **-22.8** | Functional → Developing | Yes | Both | PARTIAL |
| Typeface | B | 48.4 | **25.6** | **-22.8** | Functional → Developing | Yes | Both | FAIL |
| Recursion Pharma | A | 60.9 | **40.0** | **-20.9** | Established → Developing | Yes | Both | PASS |
| Groq | B | 48.4 | **27.5** | **-20.9** | Functional → Developing | Yes | Both | FAIL |
| Harvey AI | B | 48.4 | **28.7** | **-19.7** | Functional → Developing | Yes | Both | FAIL |
| Inflection AI | B | 48.4 | **30.0** | **-18.4** | Functional → Developing | Yes | Both | FAIL |
| Cohere | A | 60.9 | **43.8** | **-17.1** | Established → **Functional** | Yes | Both | PASS |
| Databricks | B | 48.4 | **31.3** | **-17.1** | Functional → Developing | Yes | Both | PASS |

All 15 composites were produced by `computeCompositeFromDimensions` in `site/scripts/lib/scoring.mjs`, methodology v1.2, and all 15 reproduce. For every lab the integration premium is 0: every dimension sits below 4.0, so the weakness factor reduces to 0 and the composite equals the base composite. No harm flags were applied. All 600 subdimension scores are on-grid integers, so every dimension value is a multiple of 0.2 and reachable by the methodology.

**All 15 crossed a band, and all 15 also cleared the 5.0-point composite threshold.** The band-crossing filing clause was again not needed. It cost nothing to have.

---

## 3. Band distribution

| Band | Before (seed) | After (assessed) |
|---|---|---|
| Critical (0-20) | 0 | 0 |
| Developing (21-40) | 0 | **14** |
| Functional (41-60) | **8** | **1** |
| Established (61-80) | **7** | **0** |
| Exemplary (81-100) | 0 | 0 |

Fifteen entities that occupied two bands now occupy two different bands, with fourteen of the fifteen in Developing. Cohere is the only lab that stays in Functional, and it is the only one of the fifteen whose band moves down by exactly one step rather than two.

---

## 4. The statistic that matters: signed versus absolute delta

| Statistic | This study (ai-labs) | Robotics 60.9 | Countries 20.3 |
|---|---|---|---|
| Mean signed delta | **-22.73 points** | -30.04 points | -1.18 points |
| Mean absolute delta | **22.73 points** | 30.04 points | 7.08 points |
| Standard deviation of deltas | **3.71 points** | 7.56 points | 7.61 points |
| Range | -30.3 to -17.1 (spread 13.2) | -47.8 to -20.9 (spread 26.9) | -10.3 to +12.8 (spread 23.1) |
| Direction | 15 of 15 down | 10 of 10 down | 7 down, 5 up |

**Mean signed delta and mean absolute delta are identical to two decimal places, at -22.73.** That is the diagnostic. It happens only when every entity moves the same way.

This reproduces the robotics 60.9 finding exactly in shape, and rejects the countries 20.3 pattern. At 20.3, signed and absolute diverged sharply — a mean of -1.18 against 7.08 — which is the signature of a placeholder that is *uninformative*: right on average, badly wrong for the typical entity. Here, as in robotics, the two coincide. **These seeds were not merely unmeasured. They were unmeasured and set too high.**

One thing is new, and it is the most interesting number in the table. **The standard deviation is 3.71 points, half the 7.56 and 7.61 seen in the two prior studies.** The spread of individual movement collapsed. In the robotics and countries studies, individual entities moved very different distances; here they nearly all moved about 23 points. That is not a sign that the assessment is more precise. It is a sign that the *evidence base is more uniform*: fourteen of the fifteen labs are private companies that disclose almost nothing, so they converge on the absence baseline of roughly 2.0 per dimension, which is a composite of 25.0. Three of them — Adept AI, SambaNova and Typeface — land on exactly 25.6.

### The hypothesis under test

The hypothesis was "60.9 and 48.4 are unmeasured". **Confirmed for both.** Cluster A's assessed values span 30.6 to 43.8 and cluster B's span 23.8 to 31.3, and both ranges were compressed into a single published number each.

The competing hypothesis the brief warned against — "these labs are overrated" — **was not assumed and is not what was tested.** It nonetheless turned out to be true for all fifteen. Section 5 explains why that should be treated with care rather than as vindication.

---

## 5. Did the health-mission labs behave differently? No.

This was the sharpest question in the brief, and the answer is clear and slightly surprising.

Four of cluster A's seven exist to reduce suffering by design: **Abridge** (cutting clinician documentation burden), **Isomorphic Labs** (drug discovery), **Recursion Pharma** (drug discovery) and **Tempus AI** (precision oncology). Several are subject to regulated-healthcare disclosure, so the brief was right that a high score might be earned.

| Group | Mean delta | Mean assessed composite |
|---|---|---|
| Health and life-sciences labs (4) | **-24.18** | **36.73** |
| Rest of cluster A (3) | **-25.07** | **35.83** |

**They did not diverge.** The health labs moved 0.9 points less on average and landed 0.9 points higher — a difference far inside the noise of a desk-based assessment. The highest-scoring lab in the entire study is **Cohere at 43.8**, which is an enterprise language-model company, not a health company.

The brief's caution was still correct in a different way. The health labs *did* earn credit that no other lab could:

- **Abridge scores 4 on Efficacy (AC3) and 4 on Root Cause Orientation (S1)**, on three peer-reviewed studies including a Kaiser Permanente evaluation in NEJM AI covering 1,306 clinicians and more than 4 million patient encounters. It is the largest published independent validation of any ambient AI scribe.
- **Tempus AI scores 4 on Efficacy, 4 on Universality (EQ1) and 4 on Transparency (AB3)**, on Food and Drug Administration approval of its tumor-only xT CDx companion diagnostic in May 2026, a financial assistance programme open to every United States patient regardless of insurance status, and Securities and Exchange Commission registered reporting.
- **Recursion Pharma scores 4 on Efficacy, 4 on Correction Willingness (AB2), 4 on Transparency, 4 on Autonomy Preservation (B2), 4 on Coalitional Compassion (S5) and 4 on Non-Performance (I2)** — the most 4s of any lab in the study — on stopping four of its own drug programmes because the data did not support them, publishing the null SYCAMORE result, and releasing six open datasets and the OpenPhenom-S/16 foundation model free to the research community.
- **Isomorphic Labs scores 4 on Suffering Detection (A1), 4 on Anticipatory Awareness (A5) and 4 on Root Cause Orientation**, on a bioresilience programme that builds outbreak-detection infrastructure and screens for model misuse, with more than 15 government agencies and biosecurity organisations engaged.

So the mission was real and it did show up in the scores. It just did not show up in a way that separated these companies from a multilingual open-science programme run by an enterprise vendor. **What predicted a higher score was not mission but published evidence: peer-reviewed outcome data, regulatory verification, and open release.** Recursion at 40.0 outscores Isomorphic at 34.4 not because drug discovery for cancer is more compassionate than drug discovery for cancer, but because Recursion is listed and discloses its failures while Isomorphic is private and withheld its model.

Two health labs also carry the study's most serious consent findings, in opposite postures:

- **Abridge.** Its terms make the clinician responsible for obtaining patient consent, and the American Bar Association reports that the consent script Abridge recommends does not say where audio is sent, how long it is kept, which subprocessors handle it, or whether it trains the next model. Three California patients sued Sutter Health and MemorialCare in the Northern District of California on 8 April 2026 over recordings made with the platform. **Abridge is not a defendant and nothing is decided.** The script content is documented; the allegations are not scored as harm.
- **Tempus AI.** Class actions filed in Chicago federal court in April 2026 allege Tempus trained models on genetic data from Ambry Genetics, bought for $600 million in 2025, and sold data on hundreds of thousands of people to more than 70 clients in deals allegedly worth $1.1 billion, without written consent. The complaint calls Tempus's de-identification assurances "contradictory and unconvincing". **Nothing is decided and nothing is scored as proven harm.** What is scored is the absence of any located affirmative secondary-use consent practice.

Both were scored at the absence anchor of 2 on Consent Orientation (B5), not at the floor. That restraint is deliberate and is what makes the finding defensible.

---

## 6. Why the pattern held, and what could be wrong with it

Fifteen out of fifteen in one direction is the result that should attract the most scrutiny, not the least. The same four explanations tested in the robotics study apply, with one new observation.

### Explanation 1: seed position on the scale makes downward movement much more available

Structural, and the largest single factor for cluster A. A composite of 60.9 corresponds to a dimension mean of about 3.44 across all eight dimensions. Sustaining 3.44 everywhere requires published disaggregated data, independent audit, community testimony and a reparative-action record. **No private AI lab in this study has all of those, and most have none of them.** A composite of 48.4 corresponds to a dimension mean of about 2.94, which still requires a documented mechanism plus some outcome data in every one of eight dimensions.

Cluster B moved 21.1 points on average against cluster A's 24.6. **The lower seed moved less, exactly as the position-asymmetry rule predicts.** That rule, recommended by the robotics study, is now confirmed on a second index and across two different seed heights within a single study.

### Explanation 2: private AI companies disclose almost nothing

The evidence tier distribution is the study's second-clearest finding.

| Result | Labs | Which |
|---|---|---|
| **PASS** (≥2 independent sources, ≥1 at tier 4) | 7 | Abridge, Cohere, Isomorphic Labs, Recursion Pharma, Sakana AI, Tempus AI, Databricks |
| **PARTIAL** | 1 | SambaNova Systems |
| **FAIL** (no source above tier 3) | 7 | AI21 Labs, Adept AI, Groq, Harvey AI, Inflection AI, Labelbox, Typeface |

**Eight of fifteen cannot be verified at tier 4 in either direction.** Every one of the seven passes came from one of three routes: a court docket, a regulatory filing, or a peer-reviewed publication. Not one came from voluntary institutional reporting.

The pattern splits neatly by corporate form. **Both listed companies pass** — Recursion Pharma and Tempus AI, on Securities and Exchange Commission filings and Food and Drug Administration action. **Every lab that is being sued passes**, because litigation generates tier-4 court records. The labs that fail are private, unsued and unpublished. That is a perverse property of the evidence hierarchy and it deserves naming: *under this framework, being sued makes an entity easier to verify than being quiet.*

### Explanation 3: the assessor's standard may be too harsh

Two rules were fixed before scoring and applied identically to all fifteen labs:

1. **Absence of located evidence scores 2, not 1.** The floor of 1 is used only where positive documented evidence of a specific failure exists.
2. **A score of 4 requires published institutional data, regulatory verification or peer-reviewed third-party evidence. A score of 5 requires independent audit plus beneficiary testimony.** Nothing in this study reaches 5. Twenty-one of 600 subdimension scores reach 4.

Under that standard a fully undisclosed entity lands at about 2.0 per dimension, which is a composite of 25.0. Three labs land within 0.6 points of it. Every lab above it did so on located positive evidence and the one below it, Labelbox at 23.8, did so on located negative evidence.

**One inconsistency with prior work must be recorded honestly.** The Cerebras Systems assessment of 2026-08-11 used a more lenient reading, scoring 3 for "generic operating company doing normal business" on many subdimensions with no located evidence, and landed at 38.8. Under the standard used here, Cerebras would score materially lower. Two published de-seedings in the same index now sit on two different absence conventions. **This study uses the robotics-study convention because it is the more recent and more fully reasoned template, and because the brief named it as the method reference. The discrepancy is a calibration issue for the coordinator, and it means Cerebras's 38.8 is not a safe peer anchor for these fifteen.**

**Honest caveat: explanation 3 cannot be fully ruled out.** A desk-based assessor cannot see private-company practice. If these companies run grievance channels, disaggregated outcome review and reparative processes without publishing them, this assessment understates them.

### Explanation 4: the labs really are worse than the placeholders implied

Partly true, and weaker here than in the robotics study. **Fourteen of the fifteen produced no located adverse conduct that was scored as such.** Only Labelbox carries floor-level scores, and only three of its forty subdimensions.

Where adverse material exists, it is overwhelmingly litigation that has not been decided — Abridge's customers, Tempus, Cohere, Databricks — and none of it was scored as proven harm. Where it is decided, it is peer review rather than a court: the ACM SIGIR Forum evaluation finding Sakana's AI Scientist has a 42% experimental failure rate.

### Conclusion on the pattern

**The 60.9 and 48.4 seeds were demonstrably wrong for all fifteen labs, and wrong in the same direction, but the size of the movement is inflated by the structural asymmetry of explanation 1 and the disclosure asymmetry of explanation 2.** The *direction* is a real finding and is safe. **The *magnitude* should be treated as an upper bound on the correction, not as a settled measurement**, for the fourteen labs where no adverse conduct was located.

---

## 7. New rank ordering

The alphabetical-tie artefact is gone. The fifteen now span 31 rank positions instead of two blocks of seven and eight.

| Lab | Cluster | Seed rank | New rank | Composite | Band |
|---|---|---|---|---|---|
| Cohere | A | 7 | **12** | 43.8 | Functional |
| Recursion Pharma | A | 9 | **13** | 40.0 | Developing |
| Abridge | A | 5 | **17** | 36.9 | Developing |
| Tempus AI | A | 11 | **23** | 35.6 | Developing |
| Isomorphic Labs | A | 8 | **24** | 34.4 | Developing |
| Sakana AI | A | 10 | **25** | 33.1 | Developing |
| Databricks | B | 17 | **29** | 31.3 | Developing |
| AI21 Labs | A | 6 | **33** | 30.6 | Developing |
| Inflection AI | B | 20 | **34** | 30.0 | Developing |
| Harvey AI | B | 19 | **35** | 28.7 | Developing |
| Groq | B | 18 | **36** | 27.5 | Developing |
| Adept AI | B | 16 | **39** | 25.6 | Developing |
| SambaNova Systems | B | 22 | **40** | 25.6 | Developing |
| Typeface | B | 23 | **41** | 25.6 | Developing |
| Labelbox | B | 21 | **42** | 23.8 | Developing |

Ranks are computed against the current published table with only these fifteen values replaced.

**Confirmation the alphabetical artefact is removed.** Under the seed, Abridge ranked 5 and Tempus AI 11 purely because A precedes T. On evidence Abridge ranks 17 and Tempus 23 — the gap widens and the order changes throughout. **The two clusters now interleave**: Databricks, from the lower cluster B seed, ranks 29 and outscores AI21 Labs from the higher cluster A seed at 33. That crossing is the single clearest demonstration that the two seeds carried no information about the entities beneath them.

**One residual three-way tie, and it is honest.** Adept AI, SambaNova Systems and Typeface all land on 25.6. Their vectors are not all identical — Adept runs 2.0/2.0/2.0/2.0/2.2/2.0/2.0/2.0 while SambaNova and Typeface both run 2.0/2.0/2.2/2.0/2.0/2.0/2.0/2.0 — but SambaNova and Typeface *are* byte-identical to each other. **This is a floor artefact, not a seed.** When near-total absence of evidence is scored consistently, entities with nothing to distinguish them converge on the same value. A seed detector that flags identical vectors will flag this pair, and it should: the correct response is not to re-score them but to ask whether they should be in the index at all. See section 9.

---

## 8. Corporate-status and entity-record defects

**Five, and four of them cluster in one place.** None of the fifteen is defunct. This is not the Rethink Robotics case, where the index carried a dissolved company at "Established" months after it stopped operating. But four of the fifteen are substantially hollowed-out versions of the entity the index names, all through the same mechanism: a large company hired the staff and licensed the technology without buying the company.

| Lab | Published rank / band | What actually happened | Still operating? |
|---|---|---|---|
| **Groq** | 18, Functional | December 2025 Nvidia licensing arrangement reported at about $20 billion. **Around 90% of employees moved to Nvidia**, including chief executive Jonathan Ross and president Sunny Madra. New chief executive Simon Edwards, formerly finance chief. Confirmed a $650 million raise and is re-staffing as of June 2026. | Yes |
| **Adept AI** | 16, Functional | July 2024 Amazon arrangement: Amazon hired the leadership and licensed the technology. **Roughly 20 employees remain of about 100.** Engineering director Zach Brock became chief executive. Four of five co-founders have since left Amazon too, most recently David Luan in February 2026. | Yes, minimally |
| **Inflection AI** | 20, Functional | March 2024: Microsoft hired Mustafa Suleyman, Karén Simonyan and many staff, and paid about $650 million to license the technology. Now led by Sean White, refocused on enterprise and government. **Pi remains online but active development has slowed significantly.** | Yes |
| **AI21 Labs** | 6, **Established** | **110 of 180 employees cut on 18 May 2026 — 61% of the company** — pivoting from standalone language models to the Maestro agent platform. Trade press describes a "fall from unicorn to survival mode". | Yes |

The AI21 Labs case is the most consequential, because it sat in the **Established** band — the benchmark's second-highest public claim — while having cut 61% of its staff three months earlier.

**Fifth defect, minor and record-level.** The existing assessment file `research/assessments/isomorphic-labs-2026-07-25.md` records `published_rank: 9` where the index carries Isomorphic Labs at rank 8. Recursion Pharma holds rank 9. This should be corrected in the assessment record.

**Recommended remedy for all four hollowed-out entities: an operating-status field on the entity record, not a re-ranking.** A company that has lost 61%, 80% or 90% of its workforce to a larger buyer is not the entity a reader assumes when they see it ranked. Six entity-currency cases were already open before this study; this adds four more and brings the total to ten.

---

## 9. Labs too thin to score confidently

Named plainly, four of the fifteen carry materially weaker evidence than the rest and their scores should be treated as provisional.

- **Typeface is the thinnest entity in the study by a wide margin.** The only sources that exist about it are company database profiles — Tracxn, PitchBook, Crunchbase — and partnership press releases, all at tier 2. **Thirty-nine of its forty subdimensions rest on complete absence of evidence.** No responsible-AI policy, no ethics documentation, no workforce data and no impact reporting were located for a company valued at $1.0 billion. A separate question is raised and not answered here: **whether an entity with no public record beyond funding data belongs in a published compassion ranking at all.** That is a scope question for the index, not a scoring question, and it applies equally to Adept AI at roughly 20 employees.

- **Adept AI.** Thirty-nine of forty subdimensions rest on absence. Its own update page returned HTTP 403 and could not be read, so the account of its post-Amazon operation comes entirely from secondary reporting.

- **SambaNova Systems.** Thirty-nine of forty subdimensions rest on absence. The only located facts about how it treats people are a 15% layoff in April 2025 and three statutory Worker Adjustment and Retraining Notification filings — the legal minimum, reached through an aggregator rather than a state registry, which is why its evidence test is recorded as PARTIAL rather than PASS.

- **Labelbox is the least secure *negative* finding in the study**, and it carries the study's only floor scores. Four independent specialist sources converge on the same specific mechanisms — unpaid evaluation phases, acceptance-gated pay, deactivation without warning, no effective appeal — but **every one of them sits at tier 1 or tier 2**: gig-work review sites and worker forums. SOMO's tier-4 research documents the same pattern across the AI data-work sector but not at Labelbox specifically. Three subdimensions score 1 on this basis and they should be the first thing re-verified in any future cycle.

Two further limitations affect the whole study. Several primary documents could not be retrieved directly: Medscape returned HTTP 402 and Adept's blog returned HTTP 403, so both were sourced through corroborating coverage. And this is a desk-based assessment throughout: **no lab here has community testimony or independent audit evidence of a working compassion practice**, which is why nothing scores 5 anywhere and only 21 of 600 subdimension scores reach 4.

---

## 10. Did "absence of disclosure versus evidence of harm" drive the result? Yes.

**It drove almost all of it, and the distinction is what makes the study defensible.**

For **fourteen of the fifteen labs**, no adverse conduct was scored at all. Their movement is entirely the distance between a placeholder asserting formal pathways, published data and independent verification, and companies that disclose none of those things. Only Labelbox carries floor scores, and only three of its forty.

The rule was applied strictly and in the direction that costs the assessor. The clearest tests were the four undecided lawsuits:

- **Abridge.** It would have been easy to read three patients' allegations that they were recorded without consent as evidence of a consent failure by Abridge. That reading was rejected. Abridge is not a defendant. What is scored is the documented content of the consent script it recommends, at the absence anchor of 2.
- **Tempus AI.** It would have been easy to read a complaint alleging $1.1 billion of genetic-data sales without written consent as a floor-level finding on Consent Orientation. It was scored 2. Nothing has been decided.
- **Cohere and Databricks.** A denied motion to dismiss is a procedural ruling that allegations may proceed, not a finding that they are true. Both were scored at the absence anchor on Consent Orientation.

Where evidence moved a score in **both** directions, it is recorded that way:

- **Groq.** The Nvidia arrangement removed roughly 90% of the workforce and both founders, which drives Resilience of Care to the absence anchor. It simultaneously *raises* Self-Sustainability and Internal Consistency to 3, because departing employees were paid cash for all vested shares at a moment when they had no leverage.
- **Isomorphic Labs.** The bioresilience programme raises Awareness to 3.2, the highest Awareness in the study. The AlphaFold3 access restrictions, which drew a protest letter signed by more than 1,000 scientists, push Equity to 2.0 and Empathy to 2.0.
- **Recursion Pharma.** Killing four drug programmes on unfavourable data raises Accountability to 3.0 and Integrity to 2.8, the two highest in the study on those dimensions. The 20% workforce reduction in March 2026 is recorded and did not raise anything.

**Practical consequence for how these results should be communicated.** Fourteen of these fifteen movements are calibration corrections, not conduct findings. Publishing them as downgrades would convert a measurement problem into an accusation, which is the error the Cerebras Systems filing was written to avoid. Each proposal carries that framing explicitly in its notes field.

---

## 11. Reconciliation with pre-existing assessments

Four of the fifteen already carried assessment files. All four are superseded, and the reason is the same in every case: **each was a restatement of the seed rather than a test of it.**

| File | Composite returned | Delta from seed | Distinct source domains |
|---|---|---|---|
| `abridge-2026-07-27.md` | 61.2, confirm | +0.3 | **3** |
| `ai21-labs-2026-07-27.md` | 60.6, confirm | -0.3 | **3** |
| `isomorphic-labs-2026-07-25.md` | 60.6, confirm | -0.3 | **2** |
| `cohere-2026-06-02.md` | 60.9, confirm | **0.0** | 4 |

This is the Agility Robotics pattern reproduced four times. A file that cites two or three domains and lands within a third of a point of a placeholder has tested nothing.

The most striking case is **Cohere**, whose 2026-06-02 file reproduces the seed vector byte for byte — 3.5 on seven dimensions and 3.0 on Equity — and records it as a confirmation. **Reproducing a placeholder exactly is a restatement of it.**

**Isomorphic Labs** is the most extreme on source concentration: 33 of its citations point to a single Google DeepMind blog post and the remaining 9 to one Axios article. One blog post cannot evidence forty distinct behavioural anchors.

**AI21 Labs** cites three domains — Stanford HAI, the Future of Life Institute and the International AI Safety Report — all of which are sector-wide AI governance publications rather than sources about AI21 Labs.

The present assessments use between three and seven independent sources each and reach values 17 to 30 points lower.

`rotation-state.json` was not modified.

---

## 12. Recommended pipeline fixes

These extend the fixes recommended by the Sahel, 20.3 and robotics studies rather than replacing them.

1. **Resolve the absence-convention discrepancy before any further ai-labs de-seeding.** Cerebras Systems (38.8, applied) scored 3 on many unevidenced subdimensions; this study and the robotics study score 2. Two conventions are now live in the same index. Pick one, state it in the methodology, and note which prior assessments were run under the other.

2. **Add an operating-status field to entity records.** Four of these fifteen lost 61% to 90% of their workforce to a larger company while retaining their name and their rank. Ten entity-currency cases are now open across the index family. The robotics study recommended a status check; this study shows the failure mode is not only dissolution but hollowing out, which no dissolution check would catch.

3. **Set a minimum-substance threshold for index inclusion.** Typeface has no public record beyond funding data; Adept AI has roughly 20 employees. Publishing any number for such an entity — 48.4 or 25.6 — asserts more than the evidence supports.

4. **Confirm the seed-position asymmetry rule.** Cluster A at a seed of 60.9 moved -24.56; cluster B at 48.4 moved -21.14. Two seeds, one index, one standard, one assessor, one date: the higher seed moved further. This is the cleanest available test of the rule the robotics study proposed, and it holds.

5. **Record failed band-change evidence tests rather than suppressing the filing.** Seven of fifteen proposals here carry FAIL and one carries PARTIAL. That is diagnostic. It tells a coordinator the entity cannot be verified at tier 4 in *either* direction, which is the strongest available argument that a tier-4-level placeholder was never publishable for it.

6. **Flag the evidence-hierarchy perversity for methodology review.** Every tier-4 source in this study came from a court docket, a regulatory filing or a peer-reviewed paper. Not one came from voluntary corporate reporting. Under the current hierarchy, **a private company that is being sued is easier to verify than one that is quiet**, which systematically advantages litigated entities on evidence quality while their conduct remains unproven. That interaction deserves explicit treatment in the methodology.

7. **Audit the rest of the ai-labs index for seeds.** Two clusters totalling fifteen entities have now been de-seeded here, plus Cerebras and Cognition AI earlier. The index has 50 entries and the top of it carries values — 88.1, 81.4, 81.4 — in the **Exemplary** band, the benchmark's highest claim. Whether those are measured should be established before this study's corrections are published.

---

## 13. Deliverables

### Files written

| Path | Contents |
|---|---|
| `research/assessments/{slug}-2026-08-17.md` | Full 40-subdimension assessment, 15 files |
| `research/assessments/{slug}-2026-08-17.subdims.json` | 40-subdimension sidecar, on-grid integer anchors, tier/url/date/quote per item, 15 files |
| `research/change-proposals/abridge.json` | Delta -24.0, band crossing, `flag-for-review`, `pending`, evidence test PASS |
| `research/change-proposals/adept-ai.json` | Delta -22.8, band crossing, entity-status defect, evidence test FAIL |
| `research/change-proposals/ai21-labs.json` | Delta -30.3, band crossing, entity-status defect, evidence test FAIL |
| `research/change-proposals/cohere.json` | Delta -17.1, band crossing, supersedes 2026-06-02 file, evidence test PASS |
| `research/change-proposals/databricks.json` | Delta -17.1, band crossing, evidence test PASS |
| `research/change-proposals/groq.json` | Delta -20.9, band crossing, entity-status defect, evidence test FAIL |
| `research/change-proposals/harvey-ai.json` | Delta -19.7, band crossing, evidence test FAIL |
| `research/change-proposals/inflection-ai.json` | Delta -18.4, band crossing, entity-status defect, evidence test FAIL |
| `research/change-proposals/isomorphic-labs.json` | Delta -26.5, band crossing, supersedes 2026-07-25 file, evidence test PASS |
| `research/change-proposals/labelbox.json` | Delta -24.6, band crossing, only floor scores in study, evidence test FAIL |
| `research/change-proposals/recursion-pharma.json` | Delta -20.9, band crossing, evidence test PASS |
| `research/change-proposals/sakana-ai.json` | Delta -27.8, band crossing, evidence test PASS |
| `research/change-proposals/sambanova-systems.json` | Delta -22.8, band crossing, evidence test PARTIAL |
| `research/change-proposals/tempus-ai.json` | Delta -25.3, band crossing, evidence test PASS |
| `research/change-proposals/typeface.json` | Delta -22.8, band crossing, thinnest entity, evidence test FAIL |
| `research/SEED_CLUSTER_AI_LABS_2026-08-17.md` | This synthesis |

All fifteen proposals carry `"recommendation": "flag-for-review"` and `"status": "pending"`. **No score change is applied by this study.**

### Files deliberately not touched

`site/src/data/indexes/*.json`, `research/rotation-state.json`, `research/PENDING_CHANGES.md`, `research/APPLIED_CHANGES.md`, `site/src/data/updates/**` and all briefings. Nothing was committed. No robotics-labs entity was touched. Character AI, Palantir AI and xAI/Grok were not touched. Cerebras Systems and Cognition AI were not re-scored.

---

## 14. Primary sources

Full source lists with evidence tiers appear in each of the fifteen assessment files. The principal sources are:

**Regulatory filings and actions** — United States Food and Drug Administration approval of Tempus tumor-only xT CDx (29 May 2026) and 510(k) clearance of Tempus xR IVD; Tempus AI Form 10-K for the year ended 31 December 2025; Recursion Pharmaceuticals Form 8-K disclosing the March 2026 workforce reduction and its $11 million cost; Worker Adjustment and Retraining Notification filings for SambaNova Systems, April 2025.

**Federal court records** — *Washington et al. v. Sutter Health*, No. 4:26-cv-03012 (N.D. Cal., filed 8 April 2026); *Advance Local Media LLC et al. v. Cohere Inc.*, No. 1:25-cv-01305, Document 59 (S.D.N.Y., 13 November 2025); *Nazemian et al. v. Databricks* (N.D. Cal.), rulings of June 2025 and April 2026; Tempus AI genetic privacy class actions, No. 1:26-cv-04246 (N.D. Ill., filed 15 April 2026).

**Peer-reviewed research** — *JAMIA Open*, quality improvement survey of ambient AI documentation and clinician burnout (February 2025); *Mayo Clinic Proceedings: Digital Health*, randomized crossover trial of cognitive load (March 2025); *NEJM AI*, Kaiser Permanente evaluation of ambient AI scribes; ACM SIGIR Forum, "Evaluating Sakana's AI Scientist: Bold Claims, Mixed Results"; arXiv, "Aya Model: An Instruction Finetuned Open-Access Multilingual Language Model".

**Scientific press** — Science (AAAS) on the AlphaFold3 access backlash and the 1,000-scientist protest letter; Nature, "AlphaFold3 — why did Nature publish it without its code?"; IEEE Spectrum on Sakana's AI Scientist and on the rise and fall of Inflection's Pi; Genetic Engineering & Biotechnology News and Fierce Biotech on Recursion's pipeline discontinuations; GenomeWeb on the Tempus genetic privacy claims.

**Professional and civil-society bodies** — American Bar Association Health Law Section on ambient AI scribes; Pro Bono Institute on AI and access to justice; SOMO, "Big Tech sets unfair terms and conditions for AI data workers globally"; HIPAA Journal.

**Company documentation** — Cohere Labs Aya and Expedition Aya; Recursion RxRx3-core and OpenPhenom-S/16; AI21 Labs Jamba model card, Jamba Open Model License and the Jamba 1.5a safety whitepaper; Isomorphic Labs IsoDDE technical report and the DeepMind bioresilience approach; Databricks AI Governance Framework; Harvey BigLaw Bench hallucinations; Abridge privacy policy and research summaries; Tempus patient financial assistance.

**Trade and news reporting** — TechCrunch, Axios, CNBC, GeekWire, Data Center Dynamics, EE Times, Fierce Healthcare, Law.com, Publishers Lunch, Bloomberg Law, Press Gazette, Calcalist, Sherwood News, Turing Post, Global Genes.

**Prior reference points (not re-scored)**
- `research/assessments/cerebras-systems-2026-08-11.md` and `research/change-proposals/cerebras-systems.json` — 60.9 to 38.8, ai-labs, different absence convention
- `research/SEED_CLUSTER_ROBOTICS_60.9_CALIBRATION_2026-08-16.md` — method template
- `research/SEED_CLUSTER_20.3_CALIBRATION_2026-08-16.md` — the study where the pattern broke

---

*This study is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
