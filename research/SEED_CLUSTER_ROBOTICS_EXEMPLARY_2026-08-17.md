---
study: "robotics-labs Exemplary seed-cluster de-seeding study (83.0 and 81.4)"
date: "2026-08-17"
index: "robotics-labs"
cluster_a: ["Cyberdyne Inc.","Diligent Robotics","Ekso Bionics","Kinova Robotics","ReWalk Robotics","Wandercraft"]
cluster_b: ["1X Technologies","Apptronik","PAL Robotics","Sanctuary AI"]
methodology_template: "research/SEED_CLUSTER_ROBOTICS_60.9_CALIBRATION_2026-08-16.md"
prior_studies_cited: ["research/SEED_CLUSTER_ROBOTICS_60.9_CALIBRATION_2026-08-16.md","research/SEED_CLUSTER_20.3_CALIBRATION_2026-08-16.md"]
assessments_written: 10
sidecars_written: 10
proposals_filed: 10
band_crossings: 10
sub_threshold_band_crossings: 0
band_change_evidence_test_failures: 3
entity_currency_defects: 3
hypothesis: "83.0 and 81.4 are unmeasured"
hypothesis_result: "CONFIRMED. Both seeds are unmeasured AND biased upward. All ten fell and all ten left Exemplary. The clusters diverged, but not along the assistive/humanoid line predicted."
mean_signed_delta: -46.37
mean_absolute_delta: -46.37
---

# The Robotics-Labs Exemplary Seed Clusters: De-Seeding Study

**Date:** 2026-08-17
**Index:** robotics-labs
**Entities assessed:** 10, each with a full 40-subdimension assessment
**Method template:** `research/SEED_CLUSTER_ROBOTICS_60.9_CALIBRATION_2026-08-16.md`

---

## 1. What was wrong

Ten robotics labs held ranks 4 to 13 of the robotics-labs index — the entire top of the table below rank 3 — on two composite values and two dimension vectors.

**Cluster A, composite 83.0, ranks 4 to 9:**

```
AWR 4 · EMP 4.5 · ACT 4 · EQU 3.5 · BND 4 · ACC 4 · SYS 4 · INT 4
```

Cyberdyne Inc., Diligent Robotics, Ekso Bionics, Kinova Robotics, ReWalk Robotics, Wandercraft.

**Cluster B, composite 81.4, ranks 10 to 13:**

```
AWR 4 · EMP 4 · ACT 4 · EQU 3.5 · BND 4 · ACC 4 · SYS 4 · INT 4
```

1X Technologies, Apptronik, PAL Robotics, Sanctuary AI.

Each vector is byte-identical across its cluster. Both are never-assessed uniform seeds, not measurements. Ranks 4 through 13 are an artefact of alphabetical ordering inside two ties.

The arithmetic was never the problem. Canonical reconstruction through `computeCompositeFromDimensions` returns exactly 83.0 and exactly 81.4, each with an integration premium of 8.0 — a bonus the formula awards for being strong and even across all eight areas. **The defect was that the input was never measured.**

**Exemplary is the benchmark's highest claim.** It states that an institution's compassion practices are independently verified, consistent and sustained. Ten entities held that label on a placeholder. That is the same defect the 60.9 study corrected one band lower, and it is worse here because the claim is larger.

### Why this cluster needed a different prior than the last one

The 60.9 cluster was industrial automation. This one is not. Cluster A is dominated by assistive and medical robotics: Ekso Bionics, ReWalk Robotics and Wandercraft build exoskeletons for people with spinal-cord injury; Cyberdyne makes the HAL rehabilitation suit; Kinova builds arms for power wheelchair users; Diligent builds hospital support robots. These are companies whose core product exists to reduce suffering. A high score could plausibly have been earned.

The hypothesis tested was therefore **"83.0 and 81.4 are unmeasured"**, not "these labs are overrated". Section 5 reports what actually happened to that distinction.

---

## 2. Before and after

| Lab | Cluster | Stage | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT | Composite | Band |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| *All six* | A | **Before (seed)** | 4.0 | 4.5 | 4.0 | 3.5 | 4.0 | 4.0 | 4.0 | 4.0 | **83.0** | Exemplary |
| *All four* | B | **Before (seed)** | 4.0 | 4.0 | 4.0 | 3.5 | 4.0 | 4.0 | 4.0 | 4.0 | **81.4** | Exemplary |
| **Wandercraft** | A | After (assessed) | 3.8 | 2.6 | 3.0 | 3.0 | 2.8 | 2.2 | 3.2 | 2.2 | **46.2** | Functional |
| **Cyberdyne Inc.** | A | After (assessed) | 2.8 | 2.4 | 3.0 | 3.0 | 3.0 | 2.4 | 3.2 | 2.6 | **45.0** | Functional |
| **PAL Robotics** | B | After (assessed) | 3.2 | 2.8 | 2.8 | 2.4 | 2.8 | 2.6 | 3.0 | 2.2 | **43.1** | Functional |
| **Ekso Bionics** | A | After (assessed) | 3.2 | 2.4 | 2.8 | 3.0 | 3.0 | **2.0** | 2.6 | 2.2 | **41.3** | Functional |
| **ReWalk Robotics** | A | After (assessed) | 2.8 | 2.2 | 2.4 | 3.0 | 2.6 | **2.0** | 3.0 | 2.2 | **38.1** | Developing |
| **Kinova Robotics** | A | After (assessed) | 2.6 | 2.2 | 2.4 | 3.0 | 2.4 | **2.0** | 2.8 | **2.0** | **35.6** | Developing |
| **Diligent Robotics** | A | After (assessed) | 2.6 | 2.4 | 2.4 | **2.0** | 2.2 | 2.2 | 2.4 | **2.0** | **31.9** | Developing |
| **1X Technologies** | B | After (assessed) | **2.0** | 2.2 | **2.0** | **2.0** | 2.4 | **2.0** | **2.0** | **2.0** | **26.9** | Developing |
| **Apptronik** | B | After (assessed) | 2.2 | **2.0** | 2.2 | **2.0** | **2.0** | **2.0** | **2.0** | **2.0** | **26.2** | Developing |
| **Sanctuary AI** | B | After (assessed) | **2.0** | **2.0** | **2.0** | **2.0** | 2.2 | **2.0** | **2.0** | **2.0** | **25.6** | Developing |

Bold values sit at 2.0, this study's absence-of-disclosure baseline. **No dimension in this study reaches 4.0.** The highest single dimension anywhere is Wandercraft's Awareness at 3.8.

### Composite movement

| Lab | Cluster | Published | Assessed | Delta | Band change | Proposal filed | Filing clause | Evidence test |
|---|---|---|---|---|---|---|---|---|
| Wandercraft | A | 83.0 | **46.2** | **-36.8** | Exemplary → Functional | Yes | Both | PASS |
| Cyberdyne Inc. | A | 83.0 | **45.0** | **-38.0** | Exemplary → Functional | Yes | Both | PASS |
| PAL Robotics | B | 81.4 | **43.1** | **-38.3** | Exemplary → Functional | Yes | Both | PASS |
| Ekso Bionics | A | 83.0 | **41.3** | **-41.7** | Exemplary → Functional | Yes | Both | PASS |
| ReWalk Robotics | A | 83.0 | **38.1** | **-44.9** | Exemplary → Developing | Yes | Both | PASS |
| Kinova Robotics | A | 83.0 | **35.6** | **-47.4** | Exemplary → Developing | Yes | Both | PASS |
| Diligent Robotics | A | 83.0 | **31.9** | **-51.1** | Exemplary → Developing | Yes | Both | PASS |
| 1X Technologies | B | 81.4 | **26.9** | **-54.5** | Exemplary → Developing | Yes | Both | **FAIL** |
| Apptronik | B | 81.4 | **26.2** | **-55.2** | Exemplary → Developing | Yes | Both | **FAIL** |
| Sanctuary AI | B | 81.4 | **25.6** | **-55.8** | Exemplary → Developing | Yes | Both | **FAIL** |

All composites were produced by `computeCompositeFromDimensions` in `site/scripts/lib/scoring.mjs`, methodology v1.2, and every one reproduces. For all ten the integration premium is 0: every dimension sits below 4.0, so the weakness factor reduces to 0 and the composite equals the base composite. No harm flags were applied. All 400 subdimension scores are on-grid integers, so every dimension value is a multiple of 0.2 and is reachable by the methodology.

**Every one of the ten crossed a band and every one also cleared the 5.0-point composite threshold.** The band-crossing clause was again not needed. As in the 60.9 study, it cost nothing to have and should stay.

---

## 3. Band distribution

| Band | Before (seed) | After (assessed) |
|---|---|---|
| Critical (0-20) | 0 | 0 |
| Developing (21-40) | 0 | **6** |
| Functional (41-60) | 0 | **4** |
| Established (61-80) | 0 | 0 |
| Exemplary (81-100) | **10** | **0** |

**Every one of the ten left the Exemplary band.** Nothing in this cluster survives at the benchmark's highest claim.

Across the whole 50-entity robotics-labs index, applying only these ten corrections moves the band distribution from 13 Exemplary / 15 Established / 10 Functional / 10 Developing / 2 Critical to **3 Exemplary / 15 Established / 14 Functional / 16 Developing / 2 Critical**. The Exemplary band shrinks from 13 entities to 3.

---

## 4. The statistic that matters: signed versus absolute delta

| Statistic | This study (83.0 / 81.4) | 60.9 robotics study | 20.3 countries study |
|---|---|---|---|
| Mean signed delta | **-46.37 points** | -30.04 points | -1.18 points |
| Mean absolute delta | **46.37 points** | 30.04 points | 7.08 points |
| Standard deviation of deltas | **7.12 points** | 7.56 points | 7.61 points |
| Range | -55.8 to -36.8 (spread 19.0) | -47.8 to -20.9 (spread 26.9) | -10.3 to +12.8 (spread 23.1) |
| Verdict on the seed | Biased and unmeasured | Biased and unmeasured | Uninformative, not biased |

**Mean signed delta and mean absolute delta are identical to two decimal places, at -46.37.** That happens only when every entity moves the same way. It is the signature of a placeholder that is *biased*, not merely uninformative.

In the 20.3 country study the two statistics diverged sharply — a signed mean near zero against an absolute mean of 7.1 — because three of twelve countries moved up, one by +12.8 points. **No entity moved up here. Upward movement was a live possibility and it did not occur.**

Note the standard deviation. It is 7.12 here, 7.56 in the 60.9 study and 7.61 in the 20.3 study. **All three studies produce almost the same spread of individual movement.** What changes between them is only the centre. That is now a three-study pattern and it is worth stating plainly: de-seeding moves the typical entity by about 7 points either side of whatever the cluster's central correction turns out to be, and the central correction is set by where the seed sits on the scale.

### The hypothesis under test

The hypothesis was **"83.0 and 81.4 are unmeasured"**. Confirmed. The values carried no information about any individual lab: the assessed spread runs from 25.6 to 46.2, a range of 20.6 points, compressed into two published numbers 1.6 points apart.

The competing hypothesis — "these labs belong below Exemplary" — was not assumed and is not what was tested. It nonetheless turned out to be true for all ten. Section 6 sets out why the magnitude should be read as an upper bound rather than a settled measurement.

---

## 5. Did the two clusters behave differently? Yes — but not along the line predicted

| Cluster | Composition | Mean delta | Assessed range | Bands after |
|---|---|---|---|---|
| A (83.0) | Assistive and medical robotics, plus one hospital-logistics firm | **-43.32** | 31.9 to 46.2 | 3 Functional, 3 Developing |
| B (81.4) | Humanoid robotics, plus one social/assistive research firm | **-50.95** | 25.6 to 43.1 | 1 Functional, 3 Developing |

Cluster A fell 7.63 points less than Cluster B on average. **So the clusters did diverge, and in the direction the brief anticipated.** But the divergence is not clean, and the interesting result is where it breaks.

**PAL Robotics, a Cluster B lab, scored 43.1 — higher than three of the six Cluster A labs.** It outranks Ekso Bionics, ReWalk Robotics, Kinova Robotics and Diligent Robotics. It is 3.1 points below Cyberdyne, the second-strongest lab in the study.

**Diligent Robotics, a Cluster A lab whose robots work in hospitals, scored 31.9** — below every Cluster A peer and only 5 points above 1X Technologies.

So the split is not assistive-versus-humanoid. Regrouping by what the evidence actually rewarded:

| Group | Labs | Mean composite |
|---|---|---|
| Publishes clinical or academic evidence about its own effects | Wandercraft, Cyberdyne, PAL Robotics, Ekso Bionics, ReWalk Robotics | **42.7** |
| Serves high-need users but publishes little about outcomes | Kinova Robotics, Diligent Robotics | **33.8** |
| Publishes essentially nothing a compassion benchmark can read | 1X Technologies, Apptronik, Sanctuary AI | **26.2** |

**The variable that separated these ten labs was not mission. It was whether the company subjects its own effects to outside examination and publishes the result.** PAL Robotics has no medical device and no regulatory clearance, but it publishes a paper called "Lessons Learnt from Deploying ARI in Residential Care" describing what went wrong in its own care-home deployments. That single practice — voluntary, unflattering, externally readable disclosure — is worth more under these anchors than a compassionate product category.

---

## 6. Did assistive or medical mission materially justify high scores?

**Partly, and in a specific and limited way. It justified higher scores than the humanoid cohort. It did not justify anything close to Exemplary.**

This is the central question the brief asked, so the answer is set out with its limits.

### Where mission genuinely earned points

Assistive and medical robotics produced real, checkable tier-4 and tier-5 evidence that industrial robotics does not have, and it concentrated in three dimensions.

**Action, specifically AC3 Efficacy.** Four of the six Cluster A labs and both efficacy-publishing Cluster B labs scored 3 or 4 here. Cyberdyne's HAL was approved for Japanese public insurance after a multicentre randomised controlled crossover trial across nine hospitals (NCY-3001). Wandercraft published a peer-reviewed retrospective safety evaluation of the Atalante exoskeleton in patients with tetraplegia and high paraplegia. Ekso Bionics holds four separate FDA clearances, each supported by clinical data. **This is exactly the evidence the brief said to look for, and it exists.**

**Equity, specifically EQ2 and EQ4.** Cluster A averages 2.83 on Equity against 2.10 for Cluster B. Every one of the five assistive-device firms scored 4 on Access Design. The reasons are concrete public-payer decisions, not marketing:

- Assistive robotic arms became a covered Medi-Cal benefit on **1 September 2024**, with Disability Rights California publishing a guide on claiming it, and a named commercial payer policy (AmeriHealth Caritas VIP Care CCP.1520) covers the Kinova Jaco2.
- A revised US Department of Veterans Affairs policy lets qualified veterans receive the **Ekso Indego Personal exoskeleton at no cost to the veteran**.
- The US Centers for Medicare and Medicaid Services placed exoskeletons in the Medicare brace benefit category effective **1 January 2024**, and finalised reimbursement for the ReWalk Personal Exoskeleton on **11 April 2024**.
- Cyberdyne secured the **world's first public health insurance coverage for a robotic treatment**, on 25 April 2016, later extended to further rare diseases.

The brief was right that device access and cost matter for Equity, and right that this evidence is findable. It is the single largest source of the 7.63-point gap between the clusters.

**Boundaries, specifically B2 Autonomy Preservation and B3 Scope Clarity.** Cluster A averages 2.67 against 2.35. A device whose purpose is to let someone walk, eat or dress without a carer is autonomy-building by construction, and regulatory indications state plainly what the device is and is not for.

### Where mission earned nothing

**Accountability is the flattest and lowest dimension in the study.** Three of the five assistive-device firms — Ekso Bionics, ReWalk Robotics and Kinova Robotics — score exactly **2.0 of 5**, the absence baseline, which is the same as Apptronik and Sanctuary AI. Cluster A averages 2.13 on Accountability against 2.15 for Cluster B. **On accountability the assistive firms are indistinguishable from the humanoid firms.**

The reason matters. Adverse events involving these devices are on the public record through the FDA MAUDE database, and reports for both Ekso Bionics and ReWalk devices were located. **But MAUDE reporting is legally mandatory.** Under the AB1 anchors, acknowledgment that happens only because the law compels it scores 2, not 4. Not one of the ten labs was found to have acknowledged a harm before it was obliged to, corrected course on its own initiative, published a failure voluntarily, or made repair to anyone.

**Empathy is the second flattest.** No lab exceeded 2.8. The E3, E4 and E5 anchors ask about non-judgment across identity, validating inconvenient complaints and cultural adaptation. Not one of the ten publishes anything on these. Building a device that helps disabled people is not the same as demonstrating that the institution treats them as credible when they complain.

### The honest summary

Mission bought Cluster A roughly 7.6 composite points over Cluster B, concentrated in Action, Equity and Boundaries, and it was earned on genuine regulatory and clinical evidence. It bought nothing at all in Accountability, Empathy or Integrity. **A company can build a product that reduces suffering and still have no compassion infrastructure as an institution. Five of these ten are that case.**

---

## 7. Why the magnitude is an upper bound

The 60.9 study's section 4 reasoning applies here with more force, because this seed sits higher still.

**Seed position.** A composite of 83.0 corresponds to a dimension mean of about 4.32 across all eight dimensions. On these anchors 4.5 means "independently audited", "community confirms", "findings public", "harmed parties describe repair as genuine". Sustaining that across all eight dimensions requires an evidence base that essentially no private robotics company of any mission possesses, and that a desk-based assessor could not see even if it existed. **A seed placed at 4.32 is almost maximally exposed to downward correction.** That is a property of the placement, not of the companies. It explains why the mean movement here (-46.4) is larger than at 60.9 (-30.0), which was larger than at 20.3 (-1.2).

**Disclosure asymmetry.** Seven of ten cleared the band-change evidence test; **three failed outright with no independent source above tier 3.** 1X Technologies, Apptronik and Sanctuary AI cannot be verified at tier 4 in either direction. Their scores are the least secure in the study.

**Assessor standard.** Two rules were fixed before scoring and applied identically to all ten:

1. **Absence of evidence scores 2, never 1.** The floor of 1 is reserved for positive documented evidence of a specific failure. **No subdimension anywhere in this study scored 1.** Sanctuary AI, with three chief executives in twenty months and about 30 layoffs, was a candidate for a floor score on I5 Resilience of Care; it scored 2, because no compassionate practice was documented that could be shown to have failed to persist.
2. **A score of 4 requires published institutional data, a regulatory decision or third-party peer review. A score of 5 requires independent audit plus community testimony.** **Nothing reached 5 anywhere in the study**, and only 33 of 400 subdimension scores reached 4.

Under that standard a fully undisclosed entity lands at 2.0 per dimension, which is a composite of 25.0. Sanctuary AI at 25.6, Apptronik at 26.2 and 1X Technologies at 26.9 sit just above that floor, which is the correct place for three companies with no located adverse conduct and no located compassion disclosure.

**Honest caveat, unchanged from the 60.9 study.** A desk-based assessor cannot see private-company practice. If these companies run grievance channels, disaggregated outcome review and reparative processes without publishing them, this assessment understates them. **The direction of correction is a safe finding for all ten. The magnitude should be treated as an upper bound**, particularly for the three labs that failed the evidence test.

---

## 8. New rank ordering

The alphabetical-tie artefact is gone. The ten now span 17 rank positions instead of 10 consecutive ones, and the ordering has inverted relative to the alphabet.

| Lab | Seed rank | New rank | Composite | Band |
|---|---|---|---|---|
| Wandercraft | 9 | **29** | 46.2 | Functional |
| Cyberdyne Inc. | 4 | **30** | 45.0 | Functional |
| PAL Robotics | 12 | **31** | 43.1 | Functional |
| Ekso Bionics | 6 | **32** | 41.3 | Functional |
| ReWalk Robotics | 8 | **33** | 38.1 | Developing |
| Kinova Robotics | 7 | **39** | 35.6 | Developing |
| Diligent Robotics | 5 | **41** | 31.9 | Developing |
| 1X Technologies | 10 | **43** | 26.9 | Developing |
| Apptronik | 11 | **44** | 26.2 | Developing |
| Sanctuary AI | 13 | **45** | 25.6 | Developing |

Ranks are computed against the current published table with only these ten values replaced.

**Confirmation that the alphabetical artefact is removed.** Under the seeds, Cyberdyne ranked 4 and Wandercraft 9, purely because C precedes W inside a tie. On evidence Wandercraft ranks 29 and Cyberdyne 30 — the reverse. Wandercraft, alphabetically last in Cluster A, is the strongest lab in the study. Diligent Robotics, alphabetically second in Cluster A, is second-weakest of the six.

**Both seed clusters also inverted against each other.** PAL Robotics moves from Cluster B's rank 12 to the third strongest of all ten, ahead of four Cluster A labs.

**No residual ties.** All ten carry distinct composites and distinct dimension vectors. The shapes differ in kind, not only in level: Wandercraft is the only lab whose Awareness (3.8) is its clear peak; Cyberdyne is the only lab whose highest dimension is Systemic Thinking tied with nothing else at that level; Diligent is the only assistive-adjacent lab with Equity at the 2.0 floor; PAL Robotics has the study's highest Empathy (2.8) and highest Accountability (2.6). That is genuine differentiation, not a re-seed at a lower level.

---

## 9. Corporate-status defects found

Three, plus one duplicate-record defect. This is the highest defect rate of any de-seeding study so far: **four of ten records are wrong about what the entity currently is.**

### ReWalk Robotics has not been called that since September 2024

**ReWalk Robotics Ltd. finalised a corporate name change to Lifeward Ltd. on 10 September 2024** and began trading on Nasdaq as LFWD on 13 September 2024. "ReWalk" is now a product line, not the company. The index publishes the entity under a name the company stopped using two years ago.

**There is a second, more serious problem with this record.** In its first-quarter 2026 filing, management disclosed **substantial doubt about the company's ability to continue as a going concern**, citing a $295.5 million accumulated deficit and insufficient cash for at least twelve months without additional funding. First-quarter 2026 revenue was $3.9 million, down from $5.0 million.

The index carries this entity at rank 8 in the **Exemplary** band. The benchmark's highest label is attached to a company that has told its regulator it may not survive the year, under a name it no longer uses.

**Recommended remedy: rename the record to "Lifeward Ltd. (ReWalk)" and attach the going-concern status, regardless of any score decision.**

### Diligent Robotics is now a Serve Robotics subsidiary

**Serve Robotics agreed to acquire Diligent Robotics on 19 January 2026** in an all-stock deal valued at $29 million plus a potential $5.3 million earn-out. The deal was expected to close in the first quarter of 2026, and by **17 August 2026** the company issues press releases as "Diligent Robotics, a Serve Robotics Company".

The index carries it as a standalone entity. **The record should be corrected to show the parent, as the 60.9 study recommended for Aethon.**

### Sanctuary AI is a materially different company from the one the record describes

Sanctuary AI still exists and still operates, so this is not a dissolution case. But three things changed that a published score should reflect:

- The board removed co-founder chief executive **Geordie Rose in November 2024**, with about **30 layoffs** and two co-founder departures.
- Interim chief executive James Wells left, and **Daniel Friedmann was appointed chief executive on 26 June 2026**.
- In **June 2026 the company stopped leading with humanoid hardware** and began selling Physical AI software for other companies' industrial robot arms. Whole humanoids are now described only as a long-term goal.

A robotics-labs record describing Sanctuary AI as a humanoid hardware company is out of date as of June 2026.

### 1X Technologies holds two different Compassion Benchmark scores

**1X Technologies appears in the robotics-labs index at rank 10 with composite 81.4, band Exemplary, and in the ai-labs index at rank 14 with composite 50.0, band Functional.** The same company carries two published composites **31.4 points apart, in two different bands**.

Both are seeds. The ai-labs entry is a uniform 3.0 vector, confirmed at 50.0 by a rotation backfill on 2026-06-25 with low confidence and no evidence reviewed. The robotics-labs entry is the 81.4 seed corrected here.

**This is a governance defect, not a scoring one.** Per the study brief, no ai-labs entity was touched. **The recommended remedy is to decide which index owns 1X Technologies and remove or cross-reference the other**, before either number is corrected. Publishing two contradictory bands for one company is more damaging than either number being wrong.

---

## 10. Labs too thin to score confidently

Named plainly, three of the ten carry materially weaker evidence than the rest, and their scores should be treated as provisional. All three are in Cluster B and all three failed the band-change evidence test.

- **Sanctuary AI** is the thinnest entity in the study. **Thirty-nine of its forty subdimensions rest on absence of disclosure.** The only located institutional evidence concerns leadership churn, layoffs and a strategy change — all of which speak to corporate stability rather than to compassion practice. Its -55.8 is the largest movement in the study and the least secure figure in it. No independent tier-4 source exists.

- **Apptronik** has **thirty-eight of forty subdimensions resting on absence of disclosure**, despite a valuation of roughly $5 billion. The only third-party statement located about its safety posture is a **supplier case study published by Texas Instruments**, which is a commercial partner rather than an independent verifier. Its Apollo robots run at Mercedes-Benz, GXO Logistics and Jabil sites, and no published outcome data, worker consultation record or union agreement was found for any of those deployments.

- **1X Technologies** has **thirty-seven of forty subdimensions resting on absence of disclosure**. Its three above-baseline scores all concern the same thing — the consent design around Expert Mode teleoperation — and the strongest source for the critique is an independent legal-analysis blog at tier 3, not a regulator or auditor. It is also the entity with the duplicate-record defect above.

Two further limitations affect the whole study.

**The Wandercraft "Lessons Learnt" analogue could not be parsed directly.** The arXiv PDF for PAL Robotics' "Lessons Learnt from Deploying ARI in Residential Care" returned unreadable binary content on fetch, so its contents were taken from the listing metadata and from the European Commission's Horizon Magazine coverage of the same SPRING project. The paper's existence and title are verified; its internal findings were not read line by line.

**No lab here has community testimony or independent audit evidence of a working compassion practice.** That is why nothing in the study scores 5 on any subdimension, and why the Exemplary band — which requires exactly that evidence — is unreachable for all ten on current disclosure.

---

## 11. Did "absence of disclosure versus evidence of harm" drive the result?

**Yes, and it drove most of it. The distinction is what makes the study defensible.**

Across the ten labs, **257 of 400 subdimension scores sit at the low anchor of 2**, and the overwhelming majority of those rest on nothing having been found in either direction.

For **six of the ten** — Cyberdyne, Kinova Robotics, Wandercraft, 1X Technologies, Apptronik and PAL Robotics — **no adverse conduct of any kind was located.** No lawsuits, no safety incidents, no labour findings, no regulatory action. Their movement is entirely the distance between a placeholder asserting independent audit and community confirmation, and companies that publish neither.

Four labs produced located adverse or negative-context evidence, and in three of the four it moved scores in **both** directions:

- **Diligent Robotics.** The Proof News investigation lowers Awareness, Action, Boundaries and Accountability: two hospitals removed Moxi, one nurse was boxed into an elevator, and a nurse asked "Why do we have the robot if we have a human with her all the time?" It simultaneously supports Correction Willingness at 3, because Moxi 2.0 — rolling out from 17 August 2026 with 10 to 15 times faster environmental processing — is a documented product response to exactly those navigation failures.
- **Ekso Bionics.** The 1-for-15 reverse stock split effective 2 June 2025, after a December 2024 Nasdaq notice, pushes Self-Sustainability and Resource Mobilization to 2. The same financial pressure *raises* Consistency Under Pressure to 3, because the company maintained its medical line through it.
- **ReWalk Robotics (Lifeward).** The going-concern disclosure lowers Self-Sustainability, Resource Mobilization and Follow-Through. The same filings are legally compelled, so Transparency stays at 2 rather than rising.
- **Sanctuary AI.** Leadership churn and about 30 layoffs lower Self-Sustainability and Internal Consistency. The June 2026 statement that whole humanoids are now only a long-term goal *raises* Scope Clarity to 3, because publicly narrowing a promise is honest scope-setting.

**Adverse-event reports were treated with care.** Reports for both Ekso Bionics and ReWalk devices exist in the FDA MAUDE database, including one describing a knee that became hot and swollen after a ReWalk session and required an emergency department visit. **These were not scored as harm findings.** MAUDE is a passive surveillance database for a Class II device class whose known risks — falls, skin injuries, burns — are published in the FDA's own special controls. The presence of adverse events in a regulated device is expected. What was scored is that acknowledgment is legally compelled rather than voluntary, which caps AB1 at 2.

**Practical consequence for how these results should be communicated.** Six of these ten movements are calibration corrections with no conduct finding attached. Publishing them as downgrades would convert a measurement problem into an accusation. Each proposal carries that framing explicitly in its `notes` field.

---

## 12. Filing outcomes

Ten change proposals were filed, one per lab, each with `"recommendation": "flag-for-review"` and `"status": "pending"`. **No score change is applied by this study.**

**No proposal was filed on the band-crossing clause alone.** Every one of the ten cleared the 5.0-point composite threshold as well, the smallest delta being Wandercraft at -36.8.

**Three proposals record a failed band-change evidence test.** The test requires at least two independent sources with at least one at evidence tier 4 or above. Self-published company material was excluded from the test, which is a tightening on the 60.9 study's method.

| Lab | Result | Reason |
|---|---|---|
| Cyberdyne Inc. | PASS | Peer-reviewed randomised controlled trial in PubMed Central (T5) and a Frontiers in Psychology narrative study (T4), both independent of the company |
| Diligent Robotics | PASS | Serve Robotics investor-relations announcement as acquirer (T4), plus independent Proof News investigation (T3) |
| Ekso Bionics | PASS | FDA MAUDE adverse event record (T5), SEC filing (T4), NeurologyLive clearance report (T4), FDA device-class rule coverage (T4) |
| Kinova Robotics | PASS | Disability Rights California Medi-Cal coverage guide (T4) and AmeriHealth Caritas payer policy CCP.1520 (T4) |
| ReWalk Robotics | PASS | SEC Form 10-Q (T5), FDA MAUDE record (T5), ClinicalTrials.gov registration (T5) |
| Wandercraft | PASS | PubMed peer-reviewed retrospective safety evaluation (T5), ASIA conference presentation (T4), MobiHealthNews clearance report (T4) |
| PAL Robotics | PASS | European Commission Horizon Magazine (T4) and two arXiv research papers (T4) |
| **1X Technologies** | **FAIL** | Six independent sources located, none above tier 3. The strongest is an independent legal-analysis blog. |
| **Apptronik** | **FAIL** | Four independent sources located, none above tier 3. The only tier-4 item is Apptronik's own funding press release, which was excluded as self-published. |
| **Sanctuary AI** | **FAIL** | Six independent sources located, none above tier 3. The only tier-4 item is Sanctuary's own chief-executive announcement, which was excluded as self-published. |

**Recording the failures rather than suppressing the filings is deliberate**, and follows the 60.9 study's recommendation 3. A failed test tells a coordinator the entity cannot be verified at tier 4 in *either* direction, which is the strongest available argument that a tier-4-and-above placeholder was never publishable for it. All three failures are recorded as `"passed": false`.

---

## 13. Reconciliation with pre-existing assessments

**One of the ten carried a prior assessment file.**

`research/assessments/1x-technologies-2026-06-25.md` is a rotation-backfill screening dated 2026-06-25. It assessed the **ai-labs** entry, not the robotics-labs entry, confirmed the ai-labs uniform 3.0 seed at 50.0 with **low confidence**, and explicitly states: "Entire baseline is uniform-seed; no independent evidence reviewed this cycle."

That file is **not superseded and not contradicted**, because it addresses a different index record. It is, however, the evidence that established the duplicate-record defect in section 9. It also named the right priority: it flagged "home-deployment safety governance" and "consumer-data handling for in-home robots" as the areas a future from-evidence assessment should examine. **This assessment did examine them, and they are where 1X's only three above-baseline scores come from.**

Five stale proposal files exist for Apptronik dated May 2026 (`apptronik-2026-05-07.json` through `apptronik-2026-05-16.json`) and one for 1X (`1x-technologies-robotics-labs-2026-05-07.json`). None was modified. The new proposals are written to `research/change-proposals/apptronik.json` and `research/change-proposals/1x-technologies.json`, matching the naming convention the 60.9 study established.

The remaining eight labs carried no prior assessment. `rotation-state.json` was not modified.

---

## 14. Recommended pipeline fixes

These extend the fixes recommended by the Sahel, 20.3 and 60.9 studies rather than replacing them.

1. **Audit the remaining Exemplary entries in robotics-labs immediately.** The 60.9 study flagged this cluster as the next priority and was right. After these ten corrections, three entities remain in the Exemplary band: Open Bionics at 97.5 on a flat 4.5 vector, Ottobock at 95.9, and Apexica (RoboKind) at 85.0 on a flat 4.0 vector. **All three vectors are uniform and show the same seed signature.** Apexica in particular carries a flat 4.0 across all eight dimensions, which is the shape this study has just shown to be indefensible. **The Exemplary band of this index should be presumed unmeasured in its entirety until each entry is assessed.**

2. **Exclude self-published material from the band-change evidence test.** This study tightened the test and three passes became failures. The 60.9 study counted a company's own corporate responsibility report as tier-4 support for a band change about that company. **A company's own press release cannot verify a claim about the company.** It remains legitimate tier-4 evidence for scoring; it should not count toward the independence requirement.

3. **Add a duplicate-entity check to index validation.** 1X Technologies holds two published composites 31.4 points apart in two indexes and two bands. Nothing in the pipeline detects this. The check is cheap: flag any entity name appearing in more than one index file.

4. **Add going-concern and insolvency status to the entity-status check.** Recommendation 4 of the 60.9 study asked for an entity-status check after Rethink Robotics was found dissolved while ranked Established. This study finds a company publishing a going-concern warning while ranked Exemplary. **The check should read regulatory filings, not just news of dissolution.** Seven entity-currency cases are now open in the backlog.

5. **Weight seed-position asymmetry more strongly in the prioritisation rule.** Three studies now give three data points on the same curve: a seed at dimension mean 1.81 moved entities -1.2 points on average, a seed at 3.44 moved them -30.0, and a seed at 4.32 moved them -46.4. **The relationship is steep and monotonic.** Any cluster seeded above a dimension mean of 4.0 should be treated as the highest priority in its index regardless of size or distance to a boundary, because the upper anchors require evidence that private entities essentially never publish.

6. **Retain the band-crossing filing clause.** It was not exercised in this cluster or in the 60.9 cluster, because every delta exceeded 5.0 points. The defect it fixes — Djibouti and Mauritania crossing into Critical on a 2.8-point delta with no route to file — is real and will recur in any cluster whose members land within five points of the seed.

---

## 15. Deliverables

### Files written

| Path | Contents |
|---|---|
| `research/assessments/{slug}-2026-08-17.md` | Full 40-subdimension assessment, 10 files |
| `research/assessments/{slug}-2026-08-17.subdims.json` | 40-subdimension sidecar, integer anchors, tier/url/date/quote per item, 10 files |
| `research/change-proposals/cyberdyne.json` | Delta -38.0, band crossing, `flag-for-review`, `pending` |
| `research/change-proposals/diligent-robotics.json` | Delta -51.1, band crossing, entity-record defect, `flag-for-review`, `pending` |
| `research/change-proposals/ekso-bionics.json` | Delta -41.7, band crossing, `flag-for-review`, `pending` |
| `research/change-proposals/kinova-robotics.json` | Delta -47.4, band crossing, `flag-for-review`, `pending` |
| `research/change-proposals/rewalk-robotics.json` | Delta -44.9, band crossing, name and going-concern defects, `flag-for-review`, `pending` |
| `research/change-proposals/wandercraft.json` | Delta -36.8, band crossing, `flag-for-review`, `pending` |
| `research/change-proposals/1x-technologies.json` | Delta -54.5, band crossing, duplicate-record defect, evidence test FAIL, `flag-for-review`, `pending` |
| `research/change-proposals/apptronik.json` | Delta -55.2, band crossing, evidence test FAIL, `flag-for-review`, `pending` |
| `research/change-proposals/pal-robotics.json` | Delta -38.3, band crossing, `flag-for-review`, `pending` |
| `research/change-proposals/sanctuary-ai.json` | Delta -55.8, band crossing, entity-record defect, evidence test FAIL, `flag-for-review`, `pending` |
| `research/SEED_CLUSTER_ROBOTICS_EXEMPLARY_2026-08-17.md` | This synthesis |

Slugs used are `cyberdyne`, `diligent-robotics`, `ekso-bionics`, `kinova-robotics`, `rewalk-robotics`, `wandercraft`, `1x-technologies`, `apptronik`, `pal-robotics`, `sanctuary-ai`.

### Files deliberately not touched

`site/src/data/indexes/*.json`, `research/rotation-state.json`, `research/PENDING_CHANGES.md`, `research/APPLIED_CHANGES.md`, `site/src/data/updates/**` and all briefings. Nothing was committed. **No ai-labs entity was assessed or modified, including the duplicate 1X Technologies record.** No robotics-labs entity outside these ten was assessed or modified. The ten proposals filed by the concurrent 60.9 study were not touched.

### Quote convention

Every `quote` field in every sidecar and proposal is either a passage explicitly quoted in a retrieved source, or the verbatim title of the cited page. **No quote is paraphrased and no source, URL or date is invented.** Where a source could not be read directly — the arXiv PDF for PAL Robotics — that limitation is recorded in section 10.

---

## 16. Primary sources

Full source lists with evidence tiers appear in each of the ten assessment files. The principal sources are:

**Regulatory and payer decisions** — US Food and Drug Administration 510(k) clearances for EksoNR in acquired brain injury (2020) and multiple sclerosis (June 2022); FDA indication extensions for Wandercraft Atalante X (3 November 2025) and clearance of the Eve personal exoskeleton; FDA MAUDE adverse event database records for Ekso Bionics and ReWalk devices; the FDA Class II device classification for powered exoskeletons; Medicare reimbursement for the ReWalk Personal Exoskeleton (11 April 2024); Medi-Cal coverage of assistive robotic arms (1 September 2024); AmeriHealth Caritas VIP Care coverage policy CCP.1520 for the Kinova Jaco2; Japanese public health insurance coverage for HAL medical treatment (25 April 2016) and its later extension to HAM and hereditary spastic paraplegia.

**Peer-reviewed and academic literature** — "Cybernic treatment with wearable cyborg Hybrid Assistive Limb (HAL) improves ambulatory function in patients with slowly progressive rare neuromuscular diseases: a multicentre, randomised, controlled crossover trial for efficacy and safety (NCY-3001)", PubMed Central; "Retrospective safety evaluation of the atalante exoskeleton in a clinical setting in patients with tetraplegia and high paraplegia", PubMed; "Study on intervention effect of Wearable Cyborg HAL through narrative analysis", Frontiers in Psychology 2025; "Lessons Learnt from Deploying ARI in Residential Care" and "Robot to support older people to live independently", arXiv; ClinicalTrials.gov registration NCT01454570.

**Government and intergovernmental publications** — European Commission Horizon Magazine, "Robo-companion: humanoid robot gets chatty to help elderly hospital patients" (9 March 2025), on the SPRING project coordinated by INRIA; US Securities and Exchange Commission filings for Lifeward Ltd. and Ekso Bionics Holdings; US Department of Veterans Affairs exoskeleton issuance policy as reported by Ekso Bionics; Disability Rights California, "How To Get Medi-Cal To Cover An Assistive Robotic Arm".

**Independent investigative journalism** — Proof News, "Meet the Robot That Nurses Unplugged", on Diligent Robotics' Moxi deployments; The Logic on Sanctuary AI's leadership changes; Bloomberg on Sanctuary AI layoffs.

**Corporate filings and announcements** — Serve Robotics investor relations announcement of the Diligent Robotics acquisition (19 January 2026); Lifeward Ltd. name-change announcement (10 September 2024); Apptronik Series A extension (11 February 2026); Sanctuary AI chief executive appointment (26 June 2026); Wandercraft indication-extension release (3 November 2025).

**Trade and specialist press** — The Robot Report, MassDevice, MobiHealthNews, NeurologyLive, Fierce Biotech, Robotics & Automation News, RoboticsTomorrow, Humanoids Daily, New Mobility, CNBC, Sifted, BetaKit.

**Prior de-seeding studies (not re-scored)**
- `research/SEED_CLUSTER_ROBOTICS_60.9_CALIBRATION_2026-08-16.md` — method template and the magnitude-is-an-upper-bound reasoning
- `research/SEED_CLUSTER_20.3_CALIBRATION_2026-08-16.md` — the case where the downward pattern broke
- `research/SAHEL_BAND_CALIBRATION_2026-08-13.md` — the original threshold-defect finding

---

*This study is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
