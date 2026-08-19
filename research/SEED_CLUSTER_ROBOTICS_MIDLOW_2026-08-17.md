---
study: "robotics-labs mid/low seed-cluster de-seeding study (62.5, 48.4 and 35.9)"
date: "2026-08-17"
index: "robotics-labs"
cluster_a: ["Bionik Laboratories","Halodi Robotics","Harmonic Bionics"]
cluster_b: ["Figure AI","KAWADA Robotics","Moog Inc.","Omron Robotics","Picasso Labs (Machina)","Symbio Robotics"]
cluster_c: ["Kawasaki Heavy Industries","Richtech Robotics","Sarcos Technology","UBTECH Robotics","Unitree Robotics"]
methodology_template: "research/SEED_CLUSTER_ROBOTICS_EXEMPLARY_2026-08-17.md"
prior_studies_cited:
  - "research/SEED_CLUSTER_ROBOTICS_60.9_CALIBRATION_2026-08-16.md"
  - "research/SEED_CLUSTER_ROBOTICS_EXEMPLARY_2026-08-17.md"
  - "research/SEED_CLUSTER_20.3_CALIBRATION_2026-08-16.md"
assessments_written: 14
sidecars_written: 14
proposals_filed: 13
confirmations: 1
band_crossings: 9
sub_threshold_band_crossings: 0
band_change_evidence_test_failures: 6
entity_status_defects: 6
scoring_convention: "2-convention (absence of disclosure scores 2, never 1)"
hypothesis: "seed error scales with seed height; the low-seeded cluster may diverge in direction"
hypothesis_result: "PARTIALLY CONFIRMED. Seed error scaled with seed height almost perfectly (-35.6, -21.6, -9.0). But the low cluster did NOT diverge in direction: all 14 moved down. What the low cluster produced instead was the study's first CONFIRMATION."
mean_signed_delta: -20.13
mean_absolute_delta: 20.13
---

# The Robotics-Labs Mid and Low Seed Clusters: De-Seeding Study

**Date:** 2026-08-17
**Index:** robotics-labs
**Entities assessed:** 14, each with a full 40-subdimension assessment
**Method template:** `research/SEED_CLUSTER_ROBOTICS_EXEMPLARY_2026-08-17.md`, including its tightened evidence test that excludes self-published corporate material

This study completes the de-seeding of the robotics-labs index below the Exemplary band. Together with the 60.9 study and the Exemplary study, 34 of the index's 50 entities have now been individually assessed.

---

## 1. What was wrong

Fourteen robotics labs held three composite values and three dimension vectors, each byte-identical across its cluster.

**Cluster A, composite 62.5, ranks 15 to 17 — published band Established:**

```
AWR 3.5 · EMP 4 · ACT 3.5 · EQU 3 · BND 3.5 · ACC 3.5 · SYS 3.5 · INT 3.5
```

Bionik Laboratories, Halodi Robotics, Harmonic Bionics.

**Cluster B, composite 48.4, ranks 32 to 37 — published band Functional:**

```
AWR 3 · EMP 3 · ACT 3 · EQU 2.5 · BND 3 · ACC 3 · SYS 3 · INT 3
```

Figure AI, KAWADA Robotics, Moog Inc., Omron Robotics, Picasso Labs (Machina), Symbio Robotics.

**Cluster C, composite 35.9, ranks 39 to 43 — published band Developing:**

```
AWR 2.5 · EMP 2.5 · ACT 2.5 · EQU 2 · BND 2.5 · ACC 2.5 · SYS 2.5 · INT 2.5
```

Kawasaki Heavy Industries, Richtech Robotics, Sarcos Technology, UBTECH Robotics, Unitree Robotics.

Each vector is a never-assessed uniform seed, not a measurement. Ranks inside each block are an artefact of alphabetical ordering inside a tie. Canonical reconstruction through `computeCompositeFromDimensions` returns exactly 62.5, exactly 48.4 and exactly 35.9, each with an integration premium of 0. **The arithmetic was never the problem. The input was never measured.**

### The scoring convention applied

**This study applied the 2-convention.** Absence of disclosure scores **2**, never 1. The floor of 1 is used only where positive documented evidence of a specific failure exists.

Two conflicting conventions are live in this repository: the Cerebras Systems assessment scored 3 on absence, and the four most recent studies scored 2. The 2-convention was used here because it is the majority practice, the more conservative one, and consistent with the peer studies this work sits beside.

**Absence of disclosure is not evidence of harm.** Where a company publishes nothing, the assessment says so explicitly, in every affected subdimension row of every assessment file. Only 5 of the 560 subdimension scores in this study sit at 1, and each rests on a named, dated, documented failure. 510 sit at 2, 44 at 3, exactly one at 4, and none at 5.

---

## 2. Before and after

| Lab | Cluster | Stage | AWR | EMP | ACT | EQU | BND | ACC | SYS | INT | Composite | Band |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| *All three* | A | **Before (seed)** | 3.5 | 4.0 | 3.5 | 3.0 | 3.5 | 3.5 | 3.5 | 3.5 | **62.5** | Established |
| *All six* | B | **Before (seed)** | 3.0 | 3.0 | 3.0 | 2.5 | 3.0 | 3.0 | 3.0 | 3.0 | **48.4** | Functional |
| *All five* | C | **Before (seed)** | 2.5 | 2.5 | 2.5 | 2.0 | 2.5 | 2.5 | 2.5 | 2.5 | **35.9** | Developing |
| **Kawasaki Heavy Industries** | C | After (assessed) | **3.0** | 2.2 | 2.4 | 2.0 | 2.0 | **2.8** | 2.4 | 2.2 | **34.4** | Developing |
| **Omron Robotics** | B | After (assessed) | 2.6 | 2.0 | 2.4 | 2.0 | 2.0 | 2.6 | 2.4 | 2.0 | **31.3** | Developing |
| **Harmonic Bionics** | A | After (assessed) | 2.2 | 2.0 | 2.4 | 2.0 | 2.4 | 2.4 | 2.2 | 2.0 | **30.0** | Developing |
| **Moog Inc.** | B | After (assessed) | 2.2 | 2.0 | 2.0 | 2.0 | 2.0 | 2.2 | 2.2 | 2.2 | **27.5** | Developing |
| **KAWADA Robotics** | B | After (assessed) | 2.2 | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | 2.2 | 2.0 | **26.2** | Developing |
| **UBTECH Robotics** | C | After (assessed) | 2.2 | 2.0 | 2.0 | 2.0 | 2.0 | 2.2 | 2.0 | 2.0 | **26.2** | Developing |
| **Bionik Laboratories** | A | After (assessed) | 2.2 | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | **25.6** | Developing |
| **Figure AI** | B | After (assessed) | 2.2 | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | **25.6** | Developing |
| **Halodi Robotics** | A | After (assessed) | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | **25.0** | Developing |
| **Picasso Labs (Machina)** | B | After (assessed) | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | **25.0** | Developing |
| **Symbio Robotics** | B | After (assessed) | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | **25.0** | Developing |
| **Sarcos Technology** | C | After (assessed) | 2.0 | 2.0 | 2.0 | 2.0 | 2.2 | 2.0 | 2.0 | **1.8** | **25.0** | Developing |
| **Richtech Robotics** | C | After (assessed) | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | **1.8** | 2.0 | 2.0 | **24.4** | Developing |
| **Unitree Robotics** | C | After (assessed) | **1.8** | 2.0 | 2.0 | 2.0 | **1.8** | 2.2 | 2.0 | 2.0 | **24.4** | Developing |

Values in bold are either the study's highest dimension scores or its only sub-baseline ones. **No dimension anywhere in this study reaches 4.0.** The highest is Kawasaki Heavy Industries' Awareness at 3.0.

### Composite movement

| Lab | Cluster | Published | Assessed | Delta | Band change | Proposal | Filing clause | Evidence test |
|---|---|---|---|---|---|---|---|---|
| Halodi Robotics | A | 62.5 | **25.0** | **-37.5** | Established → Developing | Yes | Both | **FAIL** |
| Bionik Laboratories | A | 62.5 | **25.6** | **-36.9** | Established → Developing | Yes | Both | PASS |
| Harmonic Bionics | A | 62.5 | **30.0** | **-32.5** | Established → Developing | Yes | Both | PASS |
| Symbio Robotics | B | 48.4 | **25.0** | **-23.4** | Functional → Developing | Yes | Both | **FAIL** |
| Picasso Labs (Machina) | B | 48.4 | **25.0** | **-23.4** | Functional → Developing | Yes | Both | **FAIL** |
| Figure AI | B | 48.4 | **25.6** | **-22.8** | Functional → Developing | Yes | Both | PASS |
| KAWADA Robotics | B | 48.4 | **26.2** | **-22.2** | Functional → Developing | Yes | Both | **FAIL** |
| Moog Inc. | B | 48.4 | **27.5** | **-20.9** | Functional → Developing | Yes | Both | **FAIL** |
| Omron Robotics | B | 48.4 | **31.3** | **-17.1** | Functional → Developing | Yes | Both | **FAIL** |
| Richtech Robotics | C | 35.9 | **24.4** | **-11.5** | none | Yes | Delta only | n/a |
| Unitree Robotics | C | 35.9 | **24.4** | **-11.5** | none | Yes | Delta only | n/a |
| Sarcos Technology | C | 35.9 | **25.0** | **-10.9** | none | Yes | Delta only | n/a |
| UBTECH Robotics | C | 35.9 | **26.2** | **-9.7** | none | Yes | Delta only | n/a |
| **Kawasaki Heavy Industries** | C | 35.9 | **34.4** | **-1.5** | none | **No — confirmed** | — | n/a |

All composites were produced by `computeCompositeFromDimensions` in `site/scripts/lib/scoring.mjs`, methodology v1.2, and every one reproduces. For all 14 the integration premium is 0: every dimension sits below 4.0, so the weakness factor reduces to 0 and the composite equals the base composite. No harm flags were applied. All 560 subdimension scores are on-grid integers, so every dimension value is a multiple of 0.2 and is reachable by the methodology.

**Every band crossing also cleared the 5.0-point composite threshold, so the band-crossing filing clause was again not exercised.** It cost nothing to have and should stay, for the reason the 20.3 study gave.

---

## 3. Band distribution

| Band | Before (seed) | After (assessed) |
|---|---|---|
| Critical (0-20) | 0 | 0 |
| Developing (21-40) | **5** | **14** |
| Functional (41-60) | **6** | 0 |
| Established (61-80) | **3** | 0 |
| Exemplary (81-100) | 0 | 0 |

**All 14 land in Developing.** Nine crossed a band; the five already in Developing stayed there.

Across the whole 50-entity robotics-labs index, applying only these 14 corrections moves the distribution from 13 Exemplary / 15 Established / 10 Functional / 10 Developing / 2 Critical to **13 Exemplary / 12 Established / 4 Functional / 19 Developing / 2 Critical**. The Functional band nearly empties. (This calculation replaces only these 14 values; the 20 corrections proposed by the two concurrent robotics studies are not applied.)

---

## 4. The statistic that matters: signed versus absolute delta, against all five prior studies

| Study | Seed(s) | Seed dimension mean | Mean signed | Mean absolute | Direction |
|---|---|---|---|---|---|
| countries | 20.3 | 1.81 | **-1.18** | 7.08 | 7 down, **5 up** |
| ai-labs low | 35.9 / 32.8 | ~2.44 | **-4.13** | 6.47 | 6 down, **1 up** |
| **this study, Cluster C** | **35.9** | **2.44** | **-9.02** | **9.02** | **5 down, 0 up, 1 confirmed** |
| ai-labs high | 60.9 / 48.4 | ~3.19 | -22.73 | 22.73 | 15/15 down |
| **this study, Cluster B** | **48.4** | **2.94** | **-21.63** | **21.63** | **6/6 down** |
| robotics 60.9 | 60.9 | 3.44 | -30.04 | 30.04 | 10/10 down |
| **this study, Cluster A** | **62.5** | **3.50** | **-35.63** | **35.63** | **3/3 down** |
| robotics Exemplary | 83.0 / 81.4 | ~4.32 | -46.37 | 46.37 | 10/10 down |
| **this study, all 14** | **mixed** | — | **-20.13** | **20.13** | **14/14 down** |

**Mean signed delta and mean absolute delta are identical to two decimal places in every one of this study's three clusters.** That happens only when every entity moves the same way. It is the signature of a placeholder that is *biased*, not merely uninformative.

### The seed-height rule now has seven data points and it is close to linear

Plotting mean signed delta against the seed's dimension mean across all studies:

| Seed dimension mean | Mean signed delta |
|---|---|
| 1.81 | -1.18 |
| 2.44 | -4.13 to -9.02 |
| 2.94 | -21.63 |
| 3.19 | -22.73 |
| 3.44 | -30.04 |
| 3.50 | -35.63 |
| 4.32 | -46.37 |

**Seed error scales with seed height, monotonically, across seven independent measurements in four indexes.** Within this study alone the relationship is almost perfectly clean: -35.63 at a seed of 62.5, -21.63 at 48.4, -9.02 at 35.9. Each step down the scale roughly halves the error. This is now the single most reliable finding of the de-seeding programme, and it should drive prioritisation directly.

---

## 5. The study's most important question: did the low-seeded cluster diverge?

**No. Cluster C did not move up. But it did something the higher clusters could not: it produced the programme's first confirmation.**

The brief was right to expect divergence and right to name the candidates. It was half right about what would happen.

### What the brief predicted, and what happened

| Prediction | Outcome |
|---|---|
| Cluster C is seeded at 35.9, the same value that produced an upward mover in the ai-labs low study — expect divergence | **Not confirmed.** All five Cluster C entities moved down. Mean signed and mean absolute delta are identical at -9.02. |
| Kawasaki Heavy Industries and Omron may hold or move up | **Half confirmed.** Kawasaki moved -1.5 and is **confirmed**, the only entity in the study below the filing threshold. Omron fell -17.1 but is the highest scorer in its own cluster by 3.8 points. |
| UBTECH is HKEX-listed with real reporting obligations | **Confirmed in direction, not in magnitude.** UBTECH fell -9.7, the second-smallest movement in the study. Its Hong Kong listing duty is visibly worth something; it is worth about 1.2 points against its cluster mean. |
| Cluster B will diverge internally, mixing large listed firms with tiny private ones | **Confirmed.** Omron Robotics at 31.3 and Moog Inc. at 27.5 sit 6.3 and 2.5 points above the three near-silent private firms, all of which land at exactly 25.0. |

### Why the low cluster did not produce an upward mover

The 20.3 country study produced upward movers because states run health systems, courts, ombudsmen and social protection, and are covered by Human Rights Watch, the World Bank and the United Nations. There was real machinery to find that a placeholder could not see.

A seed of 35.9 corresponds to a dimension mean of 2.44. That is only 0.44 above this study's absence-of-disclosure baseline of 2.0. **For an upward mover to appear at this seed, a private robotics company would need positive located evidence across most of eight dimensions, and would have to clear the 3-and-above anchors, which require published institutional data or third-party verification.** Only Kawasaki has that breadth, and Kawasaki is a ¥1.8 trillion listed conglomerate, not a robotics lab. The floor was simply close enough that the seed had almost nowhere to fall.

**The honest conclusion: the low seed was not uninformative here, it was mildly generous. That is a different result from the countries study and it is driven by entity type, not by seed height alone.** A seed of 35.9 for a state is a floor to rise from. A seed of 35.9 for a private robotics company is a ceiling to fall from.

### The confirmation itself is the finding

Kawasaki Heavy Industries assessed at **34.4** against a published **35.9**. A delta of -1.5, no band change, and therefore **no proposal filed**. This is the first entity in the entire de-seeding programme where a uniform seed survived a full 40-subdimension test.

That matters for two reasons. First, it demonstrates that this assessor's standard is not a machine for producing downgrades. The same anchors, the same 2-convention and the same tier rules that moved Halodi Robotics -37.5 moved Kawasaki -1.5. Second, it identifies what an accurate 35.9 actually looks like: a company that publishes 92 whistleblower reports a year with violation counts, runs human rights due diligence with an outside non-profit across 14 countries, interviews workers at overseas subsidiaries, joins an external remedy platform, and then also gets barred from defence bidding for 33 years of falsified inspection data. Real positives and real negatives, both documented, nearly cancelling.

---

## 6. What separated the strong from the weak — the same variable as the Exemplary study

The Exemplary study found that mission did not predict score; **submitting your own effects to outside examination and publishing the result** did. This study reproduces that finding on a completely different set of companies.

| Group | Labs | Mean composite |
|---|---|---|
| Publishes third-party audit or regulator findings about itself, including unflattering ones | Kawasaki Heavy Industries, Omron Robotics | **32.9** |
| Product examined by an independent body that published the result | Harmonic Bionics, Bionik Laboratories | **27.8** |
| Publishes to an external framework or listing rule but no third-party examination | Moog Inc., UBTECH Robotics | **26.9** |
| Publishes essentially nothing a compassion benchmark can read | Halodi, Picasso/Machina, Symbio, KAWADA, Figure AI | **25.4** |
| Documented specific failures on the record | Sarcos, Richtech, Unitree | **24.6** |

The gap between the top and bottom groups is 8.3 points. That is smaller than the equivalent gap in the Exemplary study (16.5 points), because everything here is compressed near the floor. **The ordering is identical.**

Two entities illustrate the rule sharply:

- **Omron Robotics scores 31.3, the second-highest in the study, on one practice.** It lets the Responsible Business Alliance audit its factories and then publishes what the auditor found. Its Vietnam site was found in November 2025 to have miscalculated overtime and to be working a contracted security company's staff excessive hours. OMRON published it. The people protected by that disclosure do not even work for OMRON.
- **Bionik Laboratories scores 25.6 despite having the study's single most rigorous piece of outcome evidence about its product** — the RATULS randomised controlled trial in The Lancet. The reason is that the evidence is unflattering (the InMotion robot did not improve upper limb function versus usual care) and no response to it was located. **Having your effects measured raises your score. Ignoring the measurement does not.**

---

## 7. Corporate-status defects found

**Six of 14 records are wrong about what the entity currently is — the highest defect rate of any de-seeding study so far, and worse than the Exemplary study's four in ten.**

### Halodi Robotics is 1X Technologies, and the index scores both

Halodi Robotics renamed itself 1X Technologies. The company's own page, published 3 July 2023, reads: "As part of an extensive rebranding initiative in 2023, Halodi Robotics unveils our new name."

**The robotics-labs index lists both names as separate entities:** 1X Technologies at rank 10 with composite 81.4 (Exemplary) and Halodi Robotics at rank 16 with composite 62.5 (Established). One company, two published composites 18.9 points apart, in two different bands, **inside a single index**. This is worse than the cross-index duplication found for Figure AI, because no index-ownership decision can fix it — one record is simply wrong.

**Recommended remedy: delete the Halodi Robotics record.** Do not correct its score.

### "Picasso Labs (Machina)" is not a company

The record fuses two unrelated firms. **Picasso Labs** is a New York creative-analytics company founded in 2015 by Anastasia Leng and John Bae; it analyses marketing images and video, it is not a robotics company, and it renamed itself **CreativeX in September 2020**. **Machina Labs** is a separate Los Angeles robotics manufacturer founded in 2019 that builds the RoboCraftsman metal-forming system.

**No honest score can be published against this record.** The 25.0 filed is computed against Machina Labs as the plausible robotics referent and is explicitly marked do-not-apply. Rename the record to "Machina Labs" and reassess, or delete it.

### Sarcos Technology is Palladyne AI and no longer makes robots

Sarcos Technology and Robotics Corporation renamed itself **Palladyne AI Corp.** in March 2024; its Nasdaq ticker changed from STRC to PDYN effective **8 April 2024**. In **November 2023** it announced a pivot to autonomy software and suspended further commercialization of hardware robotics products.

The index carries a robot-hardware company that stopped making robot hardware three years ago, under a name it stopped using two years ago. **Rename the record and correct the sector regardless of any score decision.**

### Bionik Laboratories stopped filing with its securities regulator in 2023

**Bionik Laboratories Corp. filed Form 15-12G on 30 June 2023**, terminating its duty to file public reports, signed by chief executive Rich Russo Jr. and reporting 310 holders of record. It has filed nothing with the US Securities and Exchange Commission since. Four days earlier, four of its seven directors resigned as part of cost-cutting. Two weeks earlier it had launched a private offering of convertible notes bearing **1% interest per month**. No press release later than June 2024 was located.

Its current operating status cannot be confirmed. **Refer for corporate-status verification before publishing any score.**

### Harmonic Bionics was acquired

**Bioness Medical announced on 18 June 2025** that it had acquired "the assets and business of Austin, Texas based Harmonic Bionics, Inc." The index carries it as standalone. Correct the record to show the parent, as earlier studies recommended for Aethon and Diligent Robotics.

### Symbio Robotics may have ceased operating — flagged, not asserted

Search results describe **Onyx Asset Advisors, LLC** engaged as sales agent for the assets of Symbio Robotics, Inc. in connection with the **complete closure of its Emeryville, California headquarters**. A company-profile database records headcount falling from about **11 employees in June 2025 to 1 as at 30 April 2026**, with no funding round since February 2021.

**This is flagged, not asserted.** A direct fetch of the Onyx listing page did not display a Symbio entry, so the closure is not confirmed at tier 4. Refer for verification. If confirmed, the honest remedy is delisting rather than re-ranking: **the methodology has no not-applicable state, so a defunct entity's score is meaningless regardless of what is computed.**

### Cross-index duplicates: Figure AI, and 1X Technologies again

**Figure AI** holds a genuinely assessed ai-labs record at **31.3** (2026-06-19) and an untouched robotics-labs seed at **48.4** — a 17.1-point gap for one company. This study assessed only the robotics-labs record and reached 25.6. **The ai-labs record was not opened or modified.** The duplication needs an index-ownership decision.

**1X Technologies** holds robotics-labs 81.4 and ai-labs 50.0. Combined with the Halodi record, **one company now appears three times across the benchmark, at 81.4, 62.5 and 50.0.**

The entity-currency backlog now stands at **twelve open cases**.

---

## 8. Filing outcomes

**Thirteen change proposals were filed**, each with `"recommendation": "flag-for-review"` and `"status": "pending"`. **No score change is applied by this study.**

**One entity was confirmed and no proposal was filed: Kawasaki Heavy Industries, delta -1.5, no band change.**

**No proposal was filed on the band-crossing clause alone.** Every band crossing also cleared the 5.0-point threshold.

### Band-change evidence test results

The test requires at least two independent sources with at least one at evidence tier 4 or above, **excluding self-published corporate material**, and applies only to the nine band crossings.

| Lab | Result | Reason |
|---|---|---|
| Bionik Laboratories | **PASS** | RATULS randomised controlled trial in The Lancet (T5) and Form 15-12G filed with the SEC (T5) |
| Harmonic Bionics | **PASS** | FDA MAUDE record (T5), ClinicalTrials.gov registration sponsored by Shirley Ryan AbilityLab (T5), Bioness Medical acquisition release (T4) |
| Figure AI | **PASS** | CNBC (T4), Interesting Engineering (T3), technology review of Figure 03 safety specification (T2) |
| **Halodi Robotics** | **FAIL** | Two sources. The company's own rebranding page is excluded as self-published; the remaining source is a tier-2 opinion column verified on fetch to contain no company statement. |
| **KAWADA Robotics** | **FAIL** | Three independent sources, none above tier 3. Company product and recruitment pages excluded as self-published. |
| **Moog Inc.** | **FAIL** | One qualifying source only — a Form 10-K filed with the SEC. Every other source is a moog.com page, excluded as self-published. |
| **Omron Robotics** | **FAIL** | Every located source sits on omron.com. The Responsible Business Alliance audit findings are third-party in origin and are strong scoring evidence, but no RBA-published document or regulator finding was obtained. |
| **Picasso Labs (Machina)** | **FAIL** | Three independent sources, none above tier 3. The test cannot meaningfully run against a record naming two unrelated companies. |
| **Symbio Robotics** | **FAIL** | Three independent sources, none above tier 3, and the strongest could not be confirmed on direct fetch. |

**Six of nine band crossings failed the evidence test — a 67% failure rate, against 30% in the Exemplary study.** All six are recorded as `"passed": false`.

**The Omron Robotics failure is the most instructive result in this section.** Omron scores 31.3, the second-highest in the study, entirely on third-party audit findings — and it fails an independence test, because the only place those findings are published is Omron's own website. The tightened test is doing exactly what it was designed to do, and it is telling a coordinator something real: **a company reporting an auditor's verdict about itself is still the only witness.**

For the four Cluster C proposals the test is recorded `NOT-APPLICABLE` with `"passed": null`, because there is no band change. Three of the four would have passed had it been required.

---

## 9. New rank ordering

The alphabetical-tie artefact is gone. The 14 now span 16 rank positions and the ordering has inverted relative to both the alphabet and the seed.

| Lab | Seed rank | New rank | Composite | Band |
|---|---|---|---|---|
| Kawasaki Heavy Industries | 39 | **30** | 34.4 | Developing |
| Omron Robotics | 35 | **32** | 31.3 | Developing |
| Harmonic Bionics | 17 | **34** | 30.0 | Developing |
| Moog Inc. | 34 | **35** | 27.5 | Developing |
| KAWADA Robotics | 33 | **36** | 26.2 | Developing |
| UBTECH Robotics | 42 | **37** | 26.2 | Developing |
| Bionik Laboratories | 15 | **38** | 25.6 | Developing |
| Figure AI | 32 | **39** | 25.6 | Developing |
| Halodi Robotics | 16 | **40** | 25.0 | Developing |
| Picasso Labs (Machina) | 36 | **41** | 25.0 | Developing |
| Symbio Robotics | 37 | **42** | 25.0 | Developing |
| Sarcos Technology | 41 | **43** | 25.0 | Developing |
| Richtech Robotics | 40 | **44** | 24.4 | Developing |
| Unitree Robotics | 43 | **45** | 24.4 | Developing |

Ranks are computed against the current published table with only these 14 values replaced.

**Two entities rise.** Kawasaki Heavy Industries moves from rank 39 to rank 30 and UBTECH Robotics from 42 to 37, despite both falling on composite. They rise because everything above them falls further. **A cluster de-seeding can improve an entity's position while lowering its score, and this is the first study in which that happened.**

**The seed clusters fully inverted against each other.** Every one of the three Cluster A labs, published in the Established band, now ranks below three Cluster B labs and two Cluster C labs. Bionik Laboratories fell 23 rank positions; Harmonic Bionics fell 17.

**Four residual ties exist** at 25.0 (Halodi, Picasso/Machina, Symbio, Sarcos), 26.2 (KAWADA, UBTECH), 25.6 (Bionik, Figure AI) and 24.4 (Richtech, Unitree). Only one is a genuine coincidence of different vectors: Sarcos reaches 25.0 through an uneven vector (BND 2.2, INT 1.8) while the other three reach it through a flat 2.0. **The three flat-2.0 entities are not a new seed. They are the correct value for a company that publishes nothing and has done nothing documented.** A fully undisclosed entity lands at exactly 25.0 under this standard, and three companies landing there means three companies disclose nothing — which is the finding, not an artefact.

---

## 10. Reconciliation with pre-existing assessments

Two of the 14 carried prior assessment files.

### Unitree Robotics — superseded, and it is the restatement pattern again

`research/assessments/unitree-robotics-2026-07-29.md` returned **34.4** and recommended **confirm** against the published 35.9, a delta of -1.5. An identical earlier file dated 2026-07-26 exists, and an older `unitree.md` dated 2026-04-15 reached 21.3.

The July file is **superseded**. Its 40 subdimension scores cite **five distinct sources, and all five concern the same story**: the US import ban on Chinese robots and the Pentagon's listing of Unitree. Fourteen of its forty subdimensions cite one CNN article. A five-source evidence base covering a single topic cannot evidence forty distinct behavioural anchors.

**That file's apparent agreement with the seed was not a confirmation. It was a restatement.** This is the fourth time this pattern has been found. The present assessment uses six independent tier-4 sources across three distinct evidence streams — a security vulnerability, a stock market listing and an export restriction — and reaches 24.4, a 10.0-point difference from the July file.

The irony is worth recording: **the July Unitree file produced the same -1.5 delta that this study's genuine Kawasaki confirmation produced.** One is a measurement and one is an echo, and the composite alone cannot tell them apart. Only the source count and source diversity can.

### Figure AI — not superseded, different index

`research/assessments/figure-ai-2026-06-19.md` assessed the **ai-labs** record and moved it to 31.3 on the Gruendel whistleblower complaint. It is **not superseded and not contradicted**, because it addresses a different index record. It is the evidence establishing the cross-index duplication in section 7. Five stale Figure AI proposal files dated May and June 2026 were not modified; the new proposal is written to `research/change-proposals/figure-ai.json`.

The remaining twelve labs carried no prior assessment. `rotation-state.json` was not modified.

---

## 11. How allegations, absence and documented failure were kept apart

This is the discipline that makes the study defensible, and three cases show it working.

**Figure AI — an allegation that is not yet decided in court.** Robert Gruendel, hired to lead Figure's product-safety programme, filed suit on 21 November 2025 in the Northern District of California alleging he was fired for raising written safety warnings. Figure says he was dismissed for poor performance and calls the claims falsehoods. **As of August 2026 no ruling has been reported.** It would have been easy to score A4 Signal Amplification at 1 — the person whose structural job was to raise safety concerns says he was fired for raising them. **That was rejected.** A4 stays at the absence baseline of 2 and the dispute is recorded as context. Not one Figure subdimension was reduced because of it. A further temptation was also refused: Figure's public promise to "push back against them in court" matches the E4 Validation anchor for 1 almost word for word, but defending a wrongful-termination suit is normal lawful conduct and scoring it down would penalise every defendant.

**Unitree Robotics — a documented failure, scored as one.** CVE-2025-2894 describes a hidden "CloudSail" remote-access service in Go1 firmware that started automatically on boot and gave anyone holding the right key full camera, audio and sensor access. Independent researchers confirmed it active on robots at MIT, Princeton, Carnegie Mellon University and the University of Waterloo. That is not an allegation and not an absence. It is a shipped capability, independently verified, and it produces two of the study's five scores of 1, on A5 Anticipatory Awareness and B5 Consent Orientation.

**Kawasaki Heavy Industries — a documented failure that did *not* produce a floor score.** Thirty-three years of falsified engine inspection data and at least forty years of slush-fund purchasing plainly contradict Kawasaki's stated values. The I4 anchor for 1 reads: "Decisions regularly contradict stated values **without acknowledgment**." Kawasaki acknowledged both, notified its own regulator, published external investigators' root-cause findings, and accepted a bidding ban. **The acknowledgment clause in the anchor did real work and I4 scored 2 rather than 1.** Anchors should be read whole.

Across all 14 labs, **510 of 560 subdimension scores sit at 2, and roughly 400 of those rest on absence of disclosure**, and every one is labelled as such in its assessment file with the sentence: *"No published evidence located in either direction. Scored at the study's absence-of-disclosure baseline of 2. Absence of disclosure is not a finding of harm."*

**For eight of the 14 — Halodi, Harmonic Bionics, Figure AI, KAWADA, Moog, Omron, Picasso/Machina and Symbio — no adverse conduct of any kind was located.** No lawsuits, no safety incidents, no labour findings, no regulatory action against the entity. **Their movement is a calibration correction, not an accusation, and each proposal says so in its `notes` field.**

---

## 12. Why the magnitude is an upper bound

The reasoning of the two prior robotics studies applies, with one modification.

**Seed position.** Cluster A at a dimension mean of 3.50 is heavily exposed to downward correction, because the 4-and-above anchors require published disaggregated data, independent audit and community testimony that private robotics companies essentially never have. Cluster C at 2.44 is barely exposed at all, which is why its movement is a quarter of Cluster A's. This is a property of the placement.

**Disclosure asymmetry.** Six of nine band crossings could not be verified at tier 4 by any independent source. Those six scores are the least secure in the study.

**Where the modification comes in.** In previous studies the honest caveat was "a desk-based assessor cannot see private-company practice." That still holds. But **this study contains an entity where the caveat was tested and did not bite**: Kawasaki Heavy Industries publishes enough that a desk-based assessor could see it, and the seed survived. The caveat is therefore not a general excuse for the downward pattern. It applies with full force to the eight silent companies and with little force to Kawasaki, Omron, Moog and UBTECH.

**Thinnest entities, named plainly.** Four scores should be treated as provisional: **Picasso Labs (Machina)**, where the record names two unrelated companies and no honest score exists; **Symbio Robotics**, where the closure evidence could not be confirmed on direct fetch; **Halodi Robotics**, where 37 of 40 subdimensions rest on absence and the only non-self-published source is a tier-2 opinion column; and **KAWADA Robotics**, whose entire evidence base sits at tier 2 and 3.

---

## 13. Recommended pipeline fixes

These extend the fixes recommended by the Sahel, 20.3, 60.9 and Exemplary studies rather than replacing them.

1. **Add a within-index duplicate check, not just a cross-index one.** The Exemplary study recommended flagging any entity name appearing in more than one index file. That would not have caught Halodi Robotics and 1X Technologies, which sit in the **same** index under two names. The check needs a name-alias list, or at minimum a review of former corporate names. One company currently holds three published composites across the benchmark: 81.4, 62.5 and 50.0.

2. **Validate that every index row names exactly one real entity.** "Picasso Labs (Machina)" fuses two unrelated companies, one of which stopped using its name in September 2020. Nothing in the pipeline detects a record that does not correspond to anything. Any record whose name contains a parenthetical should be manually verified.

3. **Formalise the 2-convention in the methodology document.** Two conventions are live in the repository and they differ by a full composite band at scale. Cerebras Systems was scored on the 3-convention and sits at 38.8; every entity in this study was scored on the 2-convention. **Those two numbers are not comparable and the index does not say so.** Pick one, write it down, and re-check Cerebras.

4. **Record source count and source diversity on every assessment, and gate confirmations on them.** Three "confirmations" have now been found that were restatements, most recently Unitree Robotics at 2026-07-29 with five sources all covering one story. A confirmation is the one outcome that leaves a seed in place, so it should carry the highest evidentiary bar, not the lowest. **Propose: a `confirm` recommendation requires at least six distinct sources across at least three distinct evidence streams.** Kawasaki's confirmation here meets that; the July Unitree file does not.

5. **Prioritise remaining clusters by seed dimension mean, using the seven-point curve in section 4.** The relationship between seed height and seed error is now measured seven times and is close to linear. Any cluster seeded above a dimension mean of 3.0 should be presumed materially wrong before it is opened.

6. **Recognise that the low-seed exception is about entity type, not seed height.** The 20.3 country study produced upward movers; this study's identically-seeded Cluster C produced none. States have institutional machinery a placeholder cannot see. Private companies do not. **The prioritisation rule should read: seed height sets the magnitude, entity type sets the direction.**

7. **Retain the band-crossing filing clause.** Not exercised here, for the third study running, because every band crossing also cleared 5.0 points. The defect it fixes is real and will recur.

---

## 14. Deliverables

### Files written

| Path | Contents |
|---|---|
| `research/assessments/{slug}-2026-08-17.md` | Full 40-subdimension assessment, 14 files |
| `research/assessments/{slug}-2026-08-17.subdims.json` | 40-subdimension sidecar, integer anchors, tier/url/date/quote per item, 14 files |
| `research/change-proposals/bionik-laboratories.json` | Delta -36.9, band crossing, status defect, evidence test PASS |
| `research/change-proposals/halodi-robotics.json` | Delta -37.5, band crossing, **within-index duplicate defect**, evidence test FAIL |
| `research/change-proposals/harmonic-bionics.json` | Delta -32.5, band crossing, acquisition defect, evidence test PASS |
| `research/change-proposals/figure-ai.json` | Delta -22.8, band crossing, cross-index duplicate defect, evidence test PASS |
| `research/change-proposals/kawada-robotics.json` | Delta -22.2, band crossing, evidence test FAIL |
| `research/change-proposals/moog-inc.json` | Delta -20.9, band crossing, evidence test FAIL |
| `research/change-proposals/omron-robotics.json` | Delta -17.1, band crossing, naming note, evidence test FAIL |
| `research/change-proposals/picasso-labs-machina.json` | Delta -23.4, band crossing, **entity-identity defect, do not apply**, evidence test FAIL |
| `research/change-proposals/symbio-robotics.json` | Delta -23.4, band crossing, probable cessation, evidence test FAIL |
| `research/change-proposals/richtech-robotics.json` | Delta -11.5, no band change, conduct finding on internal control |
| `research/change-proposals/sarcos-technology.json` | Delta -10.9, no band change, name and sector defect |
| `research/change-proposals/ubtech-robotics.json` | Delta -9.7, no band change |
| `research/change-proposals/unitree-robotics.json` | Delta -11.5, no band change, supersedes 2026-07-29 file, conduct finding |
| `research/SEED_CLUSTER_ROBOTICS_MIDLOW_2026-08-17.md` | This synthesis |

**No proposal file was written for Kawasaki Heavy Industries.** Its assessment file carries `recommendation: "confirm"`.

### Slug discipline

All 14 slugs were derived exactly as `site/src/lib/slugify.ts` would from the published index name, and each was checked. **No slug mismatch was introduced.** The three flagged risks resolve as follows:

| Index name | Correct slug | Note |
|---|---|---|
| Moog Inc. | `moog-inc` | The full stop is stripped, not the word. `moog` would have been wrong. |
| Picasso Labs (Machina) | `picasso-labs-machina` | Parentheses become a hyphen; no trailing hyphen. |
| Kawasaki Heavy Industries | `kawasaki-heavy-industries` | No truncation to `kawasaki`. |
| KAWADA Robotics | `kawada-robotics` | Lowercased. |
| The other ten | as published | Straightforward. |

**One pre-existing slug defect is noted and not fixed here:** the Exemplary study filed Cyberdyne Inc. under `cyberdyne`, but "Cyberdyne Inc." slugifies to `cyberdyne-inc`. That breaks entity linkage at apply time and needs correcting in that study's files.

### Files deliberately not touched

`site/src/data/indexes/*.json`, `research/rotation-state.json`, `research/PENDING_CHANGES.md`, `research/APPLIED_CHANGES.md`, `site/src/data/updates/**` and all briefings. Nothing was committed. **No ai-labs entity was assessed or modified, including the duplicate Figure AI and 1X Technologies records.** No robotics-labs entity outside these 14 was assessed or modified. The 20 proposals filed by the two concurrent robotics studies were not touched.

### Quote convention

Every `quote` field in every sidecar and proposal is either a passage explicitly quoted in a retrieved source or the verbatim title of the cited page. **No quote is paraphrased and no source, URL or date is invented.** Where a date could only be established to month or year precision, a partial date is recorded rather than a fabricated day. Where a source could not be read directly — omron.com and moog.com returned HTTP 403, the FDA MAUDE detail page returned HTTP 404, the Kawasaki PDFs returned unreadable binary, and the Moog 2025 Sustainability Report exceeded the fetch size limit — that limitation is recorded in the relevant assessment's Evidence Gaps section.

---

## 15. Primary sources

Full source lists with evidence tiers appear in each of the 14 assessment files. The principal sources are:

**Regulatory filings and databases** — US Securities and Exchange Commission filings for Bionik Laboratories Corp. (Form 15-12G of 30 June 2023, Forms 8-K of 16 and 27 June 2023), Richtech Robotics Inc. (Forms 8-K, 10-K, 10-K/A and NT 10-Q, 2025-2026), Moog Inc. (Form 10-K for fiscal 2025) and Palladyne AI Corp. (Form 10-K for fiscal 2025 and Form DEF 14A of 22 April 2026); US Food and Drug Administration MAUDE adverse event record for the Harmonic Bionics Harmony SHR; ClinicalTrials.gov registration NCT05251077; Nasdaq listing-rule notices to Richtech Robotics; Japan Ministry of Defense suspension of Kawasaki Heavy Industries; US Federal Communications Commission Covered List determination of 28 July 2026.

**Peer-reviewed and independent evaluation** — "Robot assisted training for the upper limb after stroke (RATULS): a multicentre randomised controlled trial", The Lancet / PubMed Central PMC6620612; Shirley Ryan AbilityLab's completed Harmony SHR trial with posted results; Sustainalytics ESG Risk Rating for UBTECH Robotics Corp. Ltd.

**Third-party audit and remedy infrastructure** — Responsible Business Alliance external audits of OMRON's Dalian factory (October 2025) and Vietnam production site (November 2025); Business for Social Responsibility human rights impact assessment for Kawasaki Heavy Industries; JaCER, the Japan Center for Engagement and Remedy on Business and Human Rights.

**Corporate disclosure** — Kawasaki Heavy Industries business and human rights, working with suppliers, and compliance pages; OMRON sustainability, procurement, occupational safety and compliance pages and the FY2025 Modern Slavery Act Statement; Moog Inc. sustainability governance page and Human Rights Commitment; UBTECH Robotics annual report with sustainability disclosures on HKEXnews; 1X Technologies rebranding announcement of 3 July 2023; Bioness Medical acquisition announcement of 18 June 2025; Palladyne AI name-change announcement of 18 March 2024.

**Independent journalism** — CNBC on the Figure AI whistleblower suit and on the Unitree initial public offering; The Japan Times and Maritime Executive on the Kawasaki defence-bidding suspension; Caixin Global on Unitree's Shanghai debut; IEEE Spectrum on the FCC Covered List; Al Jazeera on the US robot import ban; TechCrunch on the Pentagon listing; The Robot Report on Machina Labs and on 1X's NEO.

**Prior de-seeding studies (not re-scored)**
- `research/SEED_CLUSTER_ROBOTICS_EXEMPLARY_2026-08-17.md` — method template and the tightened evidence test
- `research/SEED_CLUSTER_ROBOTICS_60.9_CALIBRATION_2026-08-16.md` — the magnitude-is-an-upper-bound reasoning
- `research/SEED_CLUSTER_20.3_CALIBRATION_2026-08-16.md` — the case where the downward pattern broke

---

*This study is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
