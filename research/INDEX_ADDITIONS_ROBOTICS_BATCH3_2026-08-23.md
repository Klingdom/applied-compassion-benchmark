---
study: "robotics-labs index expansion — Batch 3 baseline assessments"
date: "2026-08-23"
index: "robotics-labs"
type: "BASELINE. First-ever assessments. No published score existed for any entity."
entities_selected: 15
entities_assessed: 15
entities_held: 0
entities_status_flagged: 1
assessments_written: 15
sidecars_written: 15
proposals_filed: 0
manifest: "research/INDEX_ADDITIONS_ROBOTICS_BATCH3_2026-08-23.json"
methodology_version: "v1.2"
constraints_honoured:
  - "No file under site/src/data/indexes/ modified"
  - "No change-proposal file written — there was nothing to change"
  - "research/rotation-state.json, PENDING_CHANGES.md, APPLIED_CHANGES.md, change-proposals/** and site/src/data/updates/** untouched"
  - "No Batch 1 or Batch 2 file touched"
  - "No ranks assigned"
  - "No commit"
---

# Robotics-Labs Batch 3: the regulated cohort did not break the compression — it tightened it, and it broke the correlation instead

**Date:** 2026-08-23
**Index:** robotics-labs
**Type:** Baseline. Every entity here is new. There was no seed, no placeholder and no prior score to regress toward.

---

## 1. The fifteen scores

| Entity | Slug | HQ | Category | Composite | Band | Absence share | Status |
|---|---|---|---|---:|---|---:|---|
| Zimmer Biomet Holdings, Inc. | `zimmer-biomet` | USA | Healthcare/Orthopaedic | **32.5** | Developing | 65% | operating |
| PROCEPT BioRobotics Corporation | `procept-biorobotics` | USA | Healthcare/Urology | **30.6** | Developing | 75% | operating |
| Distalmotion SA | `distalmotion` | Switzerland | Healthcare/Surgical | **26.9** | Developing | 93% | operating |
| Ecovacs Robotics Co., Ltd. | `ecovacs-robotics` | China | Consumer/Home | **26.3** | Developing | 75% | operating |
| Moon Surgical | `moon-surgical` | France | Healthcare/Surgical | **26.2** | Developing | 93% | operating |
| Noah Medical | `noah-medical` | USA | Healthcare/Bronchoscopy | **26.2** | Developing | 90% | operating |
| Doosan Robotics Inc. | `doosan-robotics` | South Korea | Industrial/Collaborative | **26.2** | Developing | 88% | operating |
| Beijing Roborock Technology Co., Ltd. | `roborock` | China | Consumer/Home | **26.2** | Developing | 85% | operating |
| Franka Robotics GmbH | `franka-robotics` | Germany | Research/Collaborative | **25.6** | Developing | 93% | **operating-flagged** |
| Mujin, Inc. | `mujin` | Japan | Logistics/Industrial | **25.6** | Developing | 93% | operating |
| Globus Medical, Inc. | `globus-medical` | USA | Healthcare/Spine | **25.0** | Developing | 75% | operating |
| Rainbow Robotics Co., Ltd. | `rainbow-robotics` | South Korea | Research/Humanoid | **25.0** | Developing | 95% | operating |
| Dexterity, Inc. | `dexterity-inc` | USA | Logistics/Industrial | **25.0** | Developing | 95% | operating |
| Avidbots Corp. | `avidbots` | Canada | Service/Cleaning | **25.0** | Developing | 95% | operating |
| Brain Corp | `brain-corp` | USA | Service/Cleaning | **25.0** | Developing | 93% | operating |

"Absence share" is the share of the 40 subdimensions where **nothing at all bearing on the question was located** — not merely rows that failed to clear a higher anchor.

Every composite was produced by `computeCompositeFromDimensions` in `site/scripts/lib/scoring.mjs`, methodology v1.2. **All fifteen were then rebuilt a second time from the sidecar files alone, with zero failures** (`research/scripts/batch3-verify.mjs`). All 600 subdimension scores are on-grid integers, so every dimension value is a multiple of 0.2 and is reachable by the methodology. The integration premium — the bonus the formula awards for being strong and even across all eight areas — is **0 for all fifteen**, because no dimension anywhere in this batch reaches 4.0. Each composite equals its base composite. No harm flags were applied.

---

## 2. Band distribution

| Band | Count |
|---|---:|
| Critical (0–20) | 0 |
| Developing (21–40) | **15** |
| Functional (41–60) | 0 |
| Established (61–80) | 0 |
| Exemplary (81–100) | 0 |

**All fifteen landed in Developing, for the second batch running.** Mean composite 26.5, standard deviation 2.1, range 25.0 to 32.5 — a spread of **7.5 points**.

---

## 3. The headline finding: the compression did not break

The brief predicted that this cohort should spread wider than Batch 2, because it contains US-listed medical-device makers subject to FDA pre-market review, adverse-event reporting, clinical-trial registration, public-payer coverage decisions and audited filings. **It did not. It compressed further.**

| Batch | n | Mean | Std dev | Range | Spread |
|---|---:|---:|---:|---|---:|
| Batch 1 | 15 | 30.8 | 5.6 | — | **19.4** |
| Batch 2 | 15 | 27.4 | 2.7 | 25.0–33.7 | **8.7** |
| **Batch 3** | **15** | **26.5** | **2.1** | **25.0–32.5** | **7.5** |

The regulatory sources were searched, and they were searched first. FDA recall classifications, MAUDE adverse-event records, an FDA warning letter, a De Novo decision summary, Investigational Device Exemption approvals, NICE health-technology assessment, CMS New Technology Add-on and pass-through payments, four national joint replacement registries, a CISA industrial-control-systems advisory, KOSPI, KOSDAQ, NYSE, Nasdaq, Shanghai Stock Exchange and STAR Market filings, and a Department of Justice deferred prosecution agreement with an independent compliance monitor. **All of them were found. They still did not lift the cohort out of Developing.**

### Score distribution across all 600 subdimensions

| Anchor | Batch 2 count | **Batch 3 count** | Batch 3 share |
|---:|---:|---:|---:|
| 1 | 0 | **3** | 0.5% |
| 2 | 544 | **561** | 93.5% |
| 3 | 54 | **33** | 5.5% |
| 4 | 2 | **3** | 0.5% |
| 5 | 0 | **0** | 0% |

**Batch 3 produced fewer 3s than Batch 2 and the first scores of 1 in the programme.** That is the shape of the finding: regulation did not add mid-range credit, it added evidence at both extremes.

### Why regulation did not lift the scores

The reason is structural, and it is worth stating plainly because it will recur in Batch 4.

**Medical-device regulation measures the product. This framework measures the institution.** An FDA clearance establishes that a device is substantially equivalent to a predicate. A MAUDE record establishes that an adverse event was reported. Neither says anything about whether the company runs a grievance channel, disaggregates outcomes by race or income, tracks staff burnout, obtains consent from the person the machine is used on, or repairs harm it has caused. Those are 30 of the 40 subdimensions, and the regulatory regime is silent on all of them.

**The three subdimensions where regulation did bite are exactly the three that ask about outcomes and access** — AC3 Efficacy, EQ4 Access Design, and A1 Suffering Detection. All three scores of 4 in this batch sit there.

---

## 4. What broke instead: the disclosure correlation

**The correlation between absence share and composite fell to −0.741 in this batch, from −0.935 in Batch 2 and −0.905 in Batch 1.**

That is a real weakening, and it is the most useful methodological result of this run. Disclosure density is no longer very nearly the whole score. Two cases pulled it apart:

**Globus Medical, Inc. has one of the lowest absence shares in the batch (75%) and sits at the exact floor of 25.0.** It publishes a Form 10-K, discloses an open FDA warning letter, and has a substantial public regulatory record. It lands at the floor because what the record says is that a regulator found its harm-detection system did not work.

**PROCEPT BioRobotics and Ecovacs Robotics have identical absence shares (75%) and are 4.3 points apart** — 30.6 against 26.3. The difference is not how much each published. It is what the located evidence says about each.

**Disclosure still predicts a great deal. It no longer predicts almost everything.** The framework separated a company that published a lot and was found wanting from a company that published a lot and was not. That is the behaviour a benchmark needs, and Batches 1 and 2 had not yet demonstrated it because neither contained an entity with a serious adverse regulator finding.

---

## 5. The first scores of 1 in the programme

The standing 2-convention holds that absence of disclosure scores 2, and that the floor of 1 requires **positive documented evidence of a specific failure**. Across 29 entities in two prior batches, that threshold was never met. It was met three times here.

| Entity | Subdimension | The documented failure |
|---|---|---|
| **Globus Medical** | A3 Blind Spot Mitigation | The FDA warning letter of 15 July 2024 states the company **used no additional level of data analyses to understand potential trends or identify appropriate statistical methods to detect ongoing issues related to misplaced screws.** A regulator recorded that no process existed, in the precise area where patients were being harmed. |
| **Ecovacs Robotics** | A1 Suffering Detection | Researcher Dennis Giese reported a serious remotely exploitable flaw in December 2023. Ecovacs did not respond. The flaw reached the public at DEF CON 32 in August 2024 and was still unpatched in October 2024. The company learned of harm inside its customers' homes through a conference talk. |
| **Ecovacs Robotics** | E4 Validation | The same non-response. Failing to acknowledge a named harm report **at all** sits below anchor 2, which presumes at least a stated commitment to take concerns seriously. |

Each of the three is sourced to a regulator, a national cybersecurity agency, or named researchers with dated independent reporting. **None rests on inference.**

---

## 6. The three scores of 4, and where they came from

Consistent with all 14 scores of 4 across Batches 1 and 2, **not one came from a corporate report.**

| Entity | Subdimension | Source |
|---|---|---|
| **Zimmer Biomet** | A1 Suffering Detection | The FDA Class I recall of ROSA Brain 3.0 — 66 US devices withdrawn after five complaints including one patient injury — demonstrates a statutory complaint and Medical Device Reporting system that is regulator-inspected and produced a documented correction. |
| **PROCEPT BioRobotics** | AC3 Efficacy | WATER III, an international randomised controlled trial of 186 men against laser enucleation, publishing head-to-head safety rates: ejaculatory dysfunction 14.8% versus 77.1%, stress incontinence 0% versus 9.1%, with five-year follow-up. WATER IV has enrolled 280 patients against radical prostatectomy under an FDA Investigational Device Exemption. |
| **PROCEPT BioRobotics** | EQ4 Access Design | Two independent public payers removed cost barriers: NICE issued its **standard arrangements** recommendation putting Aquablation on the NHS, and CMS granted both an inpatient New Technology Add-on Payment and an outpatient transitional pass-through payment. |

**This replicates the Batch 2 recommendation exactly.** Public-payer coverage decisions and national health-technology assessments were searched first, as instructed, and they produced one of the three scores of 4 — the same mechanism that produced Myomo's EQ4 = 4 in Batch 2.

---

## 7. Corporate status: fifteen resolved, none withheld, one flagged

The brief required registry, regulator, exchange or dated third-party financial sources, and forbade accepting press releases or company websites as proof. **All fifteen resolved. No entity was withheld.**

| Source class used as the primary status proof | Entities |
|---|---:|
| SEC filing or stock-exchange market data | 5 (Zimmer Biomet NYSE 10-K; Globus Medical SEC 10-K; Roborock SSE STAR page; Ecovacs SHA 603486 financials; Doosan Robotics KRX 454910 financials) |
| Exchange-derived financial data, secondary aggregator | 1 (Rainbow Robotics, KOSDAQ 277810) |
| Regulator record (FDA clearance, De Novo, IDE, CISA advisory) | 4 (PROCEPT BioRobotics, Distalmotion, Moon Surgical, Noah Medical) |
| Named financial newswire, dated | 2 (Mujin — Bloomberg, 10 June 2026; Avidbots — The Globe and Mail) |
| Dated third-party trade and financial reporting | 3 (Franka Robotics, Dexterity, Brain Corp) |
| Customer corporate disclosure | 1 (Brain Corp — Walmart corporate newsroom, corroborating) |

### 7.1 One entity flagged: Franka Robotics GmbH

**Franka Emika GmbH filed for insolvency in September 2023.** Agile Robots AG acquired it on 2 November 2023, roughly two months into preliminary insolvency, for a reported sum above €30 million, retaining about 100 staff. It now trades as **Franka Robotics GmbH** inside Agile Robots SE.

It is currently operating: it produced the 1,000th Franka Research 3 robot at Agile Robots' Kaufbeuren site in February 2025 and is a listed Hannover Messe 2026 exhibitor. **Agile Robots SE holds no published composite in any of the eight indexes**, so under R-SUB-1 the separately incorporated, separately branded subsidiary may hold its own record.

**The flag is carried, and it should be honoured.** This is the twelfth-defect pattern the Hocoma hold was created for: a company whose scope-study entry read `Operating (assumed)` had in fact passed through insolvency and a change of control inside the assessment window. **The scope study's entry for Franka Robotics said nothing about insolvency.** Two open questions remain and should be resolved before publication:

1. Does Franka Robotics GmbH still file separate accounts, or is it now reported only within Agile Robots SE? If the latter, R-SUB-1's "own public disclosure" test is weakened.
2. Re-verify operating status next cycle regardless.

### 7.2 Subsidiary check 1 — Rainbow Robotics and Samsung Electronics

**Finding: Samsung Electronics holds no published composite in any of the eight Compassion Benchmark indexes.** All eight index files were searched for "Samsung" and returned zero matches. **R-SUB-3 therefore does not block the listing.**

The relationship is real and should be stated on the entity page. Samsung agreed on 30 December 2024 to buy a 20.29% stake, completed the purchase on 12 March 2025, exercised a call option raising its holding from about 14.7% to roughly 35%, and now consolidates Rainbow Robotics as a subsidiary. **R-SUB-1 also applies independently**: Rainbow Robotics is separately incorporated, separately listed on KOSDAQ as 277810, and files its own accounts. Listing is permitted on both rules.

**Standing risk to record:** if Samsung Electronics is ever added to fortune-500, R-SUB-3 will not bite — Rainbow Robotics is separately listed, which R-SUB-1 says wins. This is not the Microsoft AI case. Record the reasoning now so it does not have to be re-derived.

### 7.3 Subsidiary check 2 — Zimmer Biomet and R-SUB-4

**Confirmed: Zimmer Biomet is absent from the loaded `fortune-500.json`,** which holds 447 of 500 rows. Listing it in robotics-labs today creates no collision.

**R-SUB-4 applied, and it does not point where the scope study assumed.** The rule's own recommended tie-break is: where AI or robotics is the entity's **majority** revenue, the lab index owns it; where it is a **minority** segment, fortune-500 owns it. Robotic surgery — the ROSA line — is plainly a minority segment of an US$8.232 billion orthopaedic implant business. **That is the identical test that assigned Medtronic and Stryker to fortune-500 and excluded them from robotics-labs.**

**Recommendation: hold `zimmer-biomet` as a fortune-500 candidate rather than publishing it in robotics-labs, unless the founder overrides.** The assessment is sound and stands either way; only the destination index is in question. Publishing it in robotics-labs while Medtronic and Stryker are excluded on the same reasoning would be inconsistent, and completing fortune-500 later would create the collision R-SUB-4 exists to prevent.

### 7.4 The `pre-delivery` status class was not needed

Batch 2 recommended a fifth §2.4 state for a solvent company holding customer deposits against an unshipped product (Glidance). **No entity in Batch 3 fits it.** All fifteen ship product today. The recommendation should stand for Batch 4, where Trexo Robotics and Labrador Systems are the likely candidates.

---

## 8. The two standing prompts

### 8.1 Consent where the buyer is not the person affected

**This prompt fired in 15 of 15 assessments — every entity in the batch, for the first time in the programme.** Batch 2 fired 7 of 15.

| Group | Who buys | Who is affected | Entities |
|---|---|---|---|
| Surgical and diagnostic | The hospital or ambulatory surgery centre | The patient, who does not choose the instrument used inside them | Zimmer Biomet, Globus Medical, PROCEPT, Distalmotion, Moon Surgical, Noah Medical |
| Industrial and logistics | The factory or warehouse operator | The worker sharing the space, whose pace the system sets | Doosan Robotics, Rainbow Robotics, Franka Robotics, Mujin, Dexterity |
| Cleaning fleets | The airport, hospital or retailer | Custodial staff, patients, passengers and shoppers, recorded by cameras and 3D sensors | Avidbots, Brain Corp |
| Consumer home robots | One household member | Everyone else in the home — partners, children, visitors, care workers | Ecovacs, Roborock |

**Fourteen of the fifteen scored 2 on B5. One scored 3 — the first above-2 score this prompt has produced across three batches.**

**Beijing Roborock Technology is that one.** It holds IoT Security and Data Privacy certification against **EN 303 645**, Europe's consumer Internet-of-Things cybersecurity standard, and has appointed a Data Protection Officer under GDPR. That is an outside body checking how a company handles data collected inside people's homes, and no other entity in this batch has it. It caps at 3 rather than 4 because KED Global reported on 3 July 2025 that Roborock's privacy policy permits continued retention of data processed for unrelated purposes and sharing of identification numbers, IP addresses and device details with the platform Tuya Smart — and because household members who did not buy the device still never consent.

**Ecovacs is the case that shows why the prompt matters.** Researchers demonstrated that an attacker could connect over Bluetooth from up to roughly 130 metres, bypass weak PIN protection, and **disable the camera warning sound by tampering with the device's stored audio files** — so nobody in the house would know they were being watched. Real victims were reported in Minnesota, Los Angeles and El Paso.

**Recommendation: keep the prompt, and promote Roborock's EN 303 645 certification to the brief as the worked example of what clears the bar on B5** — the same role Exotec plays for benefit claims.

### 8.2 Unsubstantiated benefit claims

**This prompt fired in four assessments and — for the first time in the programme — three separate entities cleared the bar.**

**Fired and unevidenced (4):**

| Entity | The claim | What was found |
|---|---|---|
| Avidbots | Neo is designed to free workers for higher-skilled tasks rather than replace maintenance workers | No employment data, no workload study, no custodial-worker survey. Independent trade reporting separately notes that staff anxiety about displacement is the most consistent adoption barrier — the worry is documented, the reassurance is not. |
| Brain Corp | Automating monotonous, low-value tasks makes jobs more enjoyable | No employment data across a fleet of more than 50,000 robots in some of the largest employers in the United States |
| Mujin | Robots improve productivity and safety; throughput comparable to three to four workers per station | No injury, strain or workload data |
| Distalmotion | Dexter's lower cost and smaller footprint bring robotic surgery to centres that cannot afford or house existing systems | No published price and no access outcome data. The design intent is corroborated by MedTech Dive; the affordability outcome is not measured. |

**Cleared the bar (3) — all three are medical, and all three were checked by someone other than the manufacturer:**

| Entity | The claim | Why it cleared |
|---|---|---|
| **PROCEPT BioRobotics** | Aquablation preserves sexual and urinary function better than the alternatives | Randomised controlled trial against an active comparator, with the numbers published: ejaculatory dysfunction 14.8% versus 77.1%, stress incontinence 0% versus 9.1%. NICE independently assessed short-term and long-term safety and efficacy before recommending it. |
| **Noah Medical** | The Galaxy System reliably finds peripheral lung lesions | Diagnostic yield reported under **American Thoracic Society strict definitions** — the conservative definition that lowers the headline number — plus an independent 100-consecutive-patient series at the Cleveland Clinic, a site the company does not control, reporting 90% in routine practice. |
| **Zimmer Biomet** | Its knee systems perform | Not the company's claim to make. Four national joint replacement registries publish device-level revision rates, and the Australian registry has run a formal outlier-identification process since 2004 that names implants with higher-than-anticipated revision rates in its annual report. |

**This is the strongest validation of the prompt so far.** Batch 1 fired three times and credited none. Batch 2 fired four times and credited none. Batch 3 fired four times, credited none of those four, **and separately found three entities whose benefit claims survive independent checking.** The prompt is now doing both jobs: catching the unevidenced and identifying the evidenced.

---

## 9. Sector still did not predict score

The anti-bias guard held again.

| Grouping | n | Mean composite |
|---|---:|---:|
| Surgical and diagnostic medical devices | 6 | **27.9** |
| Consumer home robots | 2 | 26.3 |
| Industrial and research manipulators | 3 | 25.6 |
| Logistics | 2 | 25.3 |
| Cleaning fleets | 2 | 25.0 |

The medical group's 2.9-point advantage over the batch floor collapses on inspection. **Globus Medical, a US$2.9 billion spine-surgery company, scores 25.0 — the same as a cleaning-robot company and a warehouse-robot company, and lower than a Chinese robot-vacuum maker whose products were hijacked to spy on their owners.**

Three sharper tests:

**Ecovacs (26.3) against Globus Medical (25.0).** A consumer appliance maker whose devices were remotely taken over to watch and listen inside private homes outscores a listed surgical-robotics company. Ecovacs scores higher because it then fixed the problem in public, opened a vulnerability-reporting channel, and now publishes dated advisories naming the researchers who find its flaws. Globus Medical's FDA warning letter was still open 19 months after issue. **This is not a claim that a vacuum company is more compassionate than a spine-surgery company. It is a measurement of what each institution did after being told it was causing harm.**

**Ecovacs (26.3) against Roborock (26.2).** Two Chinese robot-vacuum makers, effectively tied, arriving from opposite directions. Roborock has independent security certification and no located incident. Ecovacs has a documented incident and a documented, credited, ongoing correction. **Prevention and repair scored almost identically, which is a property of the framework worth watching.**

**Rainbow Robotics (25.0) against Franka Robotics (25.6).** A KOSDAQ-listed Samsung subsidiary with 76% revenue growth scores below a 100-person German company that was insolvent three years ago. Franka's 0.6-point edge is one row: an IEEE peer-reviewed survey establishing that its decision to expose low-level control interfaces made it the shared research platform for the field. **Size, listing status and parent company predicted nothing.**

---

## 10. Silence by choice versus silence by constraint

Recorded in every file, as required.

**Silence by constraint:** Franka Robotics (about 100 staff, post-insolvency subsidiary), Moon Surgical (about US$86.7 million raised, private French company below the duty-of-vigilance threshold), Distalmotion (private Swiss company), Noah Medical (private, one funding round), Avidbots (about 300 staff, private Canadian company).

**Silence by choice:** Zimmer Biomet (US$8.232 billion sales, compliance department, board ESG committee — 26 of 40 rows still rest on absence), Globus Medical (US$2.9 billion sales), Rainbow Robotics (KOSDAQ-listed, Samsung subsidiary, 76% revenue growth, **38 of 40 rows rest on absence**), Mujin (about US$411 million raised, preparing to list), Dexterity (US$1.65 billion valuation), Brain Corp (more than 50,000 deployed robots), Roborock (RMB 18.7 billion revenue), Ecovacs (RMB 19.0 billion revenue), Doosan Robotics (listed, though under genuine financial pressure with revenue down 29.6%).

**Brain Corp is the batch's largest reach-to-disclosure gap.** Its software runs more than 50,000 robots, in at least 1,800 Walmart stores since 2019 and nearly 600 Sam's Club locations. **No measurement of what that has done to store associates — injury, workload, hours, staffing — was located anywhere.**

---

## 11. Recommendations for Batch 4

1. **Do not expect regulation to lift scores, and say so in the brief.** This batch tested the hypothesis that a regulated evidence regime spreads the distribution. It does not, on its own. Medical-device regulation measures products; this framework measures institutions. Regulation produced evidence at the extremes — three scores of 1 and three of 4 — and nothing in the middle. Batch 4 contains Trexo Robotics, Marsi Bionics, Angel Robotics, PSYONIC and Össur, all regulated, and it should be briefed to expect the same shape.

2. **Publish the disclosure-density field before any of these fifteen go live. It is now a publication blocker for a second reason.** Batch 2 needed it to separate four entities tied at 25.0. Batch 3 needs it because **Globus Medical's 25.0 and Dexterity's 25.0 are opposite measurements** — one is a company a regulator found wanting, the other is a company nobody has examined. Without the field, a reader cannot tell them apart, and the benchmark will be read as having said something it did not say. The manifest shape `{ absence_based, evidence_based, absence_share }` is populated for all fifteen.

3. **Add an adverse-finding indicator alongside disclosure density.** Disclosure density alone no longer explains the score — the correlation fell from −0.935 to −0.741 precisely because two entities carry documented adverse findings. A reader needs to see that Globus Medical and Ecovacs sit at their scores for reasons of conduct, not silence. Recommend a simple boolean or count field: `adverse_findings_located`.

4. **Keep searching public payers and health-technology assessment bodies first. It worked again.** NICE and CMS together produced PROCEPT's EQ4 = 4, replicating Myomo's EQ4 = 4 in Batch 2 from the same mechanism. For Batch 4, check CMS HCPCS coding, the German Hilfsmittelverzeichnis, Medi-Cal and comparable national listings for PSYONIC, Össur, Angel Robotics, Marsi Bionics and Trexo Robotics **before touching a company website**.

5. **Add national clinical registries to the standard search set.** The Australian Orthopaedic Association National Joint Replacement Registry and its peers publish device-level revision rates and formally name outlier implants. That is a tier-5 independent evaluation of whether a product works, available for free, and it produced Zimmer Biomet's Efficacy score. Össur, a prosthetics maker in Batch 4, may have registry coverage. **Check.**

6. **Promote two worked examples into the Batch 4 brief.** Exotec already stands as the benefit-claim example. Add **Roborock's EN 303 645 certification** as the consent example — the only thing located in three batches that lifted B5 above 2 — and **Noah Medical's use of the American Thoracic Society strict definition** as the example of a company choosing the measurement that lowers its own number.

7. **Two Batch 4 candidates remain status-flagged and must be checked before any assessor time is spent.** iRobot Corporation carries publicly reported going-concern doubt. Rex Bionics has changed ownership repeatedly. **Franka Robotics in this batch is the third case in three batches where a scope-study entry marked `Operating (assumed)` concealed an insolvency or change of control.** The verification pass is not optional and the scope study's own status column cannot be trusted.

8. **Resolve the Zimmer Biomet destination before publication.** See §7.3. R-SUB-4's tie-break, applied literally, assigns it to fortune-500. This needs a founder decision, not an assessor decision.

9. **Keep the anti-bias guard. It worked a third time.** A robot-vacuum maker whose products were hijacked to spy on their owners outscored a listed spine-surgery company. A post-insolvency 100-person German firm outscored a Samsung subsidiary. A US$1.65 billion logistics company tied with a cleaning-robot company at the floor. Sector, size, nationality, listing status and capital predicted nothing.

---

## 12. Deliverables

### Files written

| Path | Contents |
|---|---|
| `research/assessments/{slug}-2026-08-23.md` | Full 40-subdimension baseline assessment with a baseline-establishment note in place of a published comparison, 15 files |
| `research/assessments/{slug}-2026-08-23.subdims.json` | 40-subdimension sidecar, canonical order, integer anchors, tier/url/date/quote per item, 15 files |
| `research/INDEX_ADDITIONS_ROBOTICS_BATCH3_2026-08-23.json` | 15 proposed index rows, all `pending-addition`, each carrying an explicit `slug`. **No ranks assigned.** |
| `research/INDEX_ADDITIONS_ROBOTICS_BATCH3_2026-08-23.md` | This synthesis |
| `research/scripts/batch3-*.mjs` | Generator, data and the independent verification script used to rebuild every composite from the sidecars |

Slugs used are exactly those specified in the brief: `zimmer-biomet`, `globus-medical`, `procept-biorobotics`, `distalmotion`, `moon-surgical`, `noah-medical`, `doosan-robotics`, `rainbow-robotics`, `franka-robotics`, `mujin`, `dexterity-inc`, `avidbots`, `brain-corp`, `ecovacs-robotics`, `roborock`. All fifteen were re-checked against all eight published indexes: **zero collisions.**

### Files deliberately not touched

`site/src/data/indexes/*.json`, `research/rotation-state.json`, `research/PENDING_CHANGES.md`, `research/APPLIED_CHANGES.md`, `research/change-proposals/**`, `site/src/data/updates/**`, and every Batch 1 and Batch 2 file. **No change proposal was filed, because there was no published score to change.** Nothing was committed.

### Quote convention

Every `quote` field in every sidecar is either a passage explicitly quoted in a retrieved source or the verbatim title of the cited page. **No quote is paraphrased and no source, URL, company or date is invented.** Where a row rests on absence, the sidecar records evidence tier 1 and states so explicitly rather than borrowing a company page as if it were support.

### Known limitations

- **No FDA warning letter, sustainability report, NICE guidance document or 10-K was retrieved in full.** All findings from those documents rest on dated third-party reporting of them, or on the issuing organisation's own summary page. Where that caps a score, the row says so.
- The Capitol Forum MAUDE analysis of PROCEPT's haemorrhage reports is paywalled; only the published summary was read.
- Korean-language and Chinese-language filings were not retrieved. Rainbow Robotics, Doosan Robotics, Ecovacs and Roborock may publish safety or workforce disclosure in their home languages that this assessment did not find.
- German, Swiss, French and Japanese commercial register records were not retrieved directly; those four status checks rest on regulator records and dated financial reporting instead.
- Glassdoor discussion of repeated layoffs at Brain Corp was seen and is **not relied on**, because no dated independent source corroborates it — the same convention applied to Skydio in Batch 2.
- This is a desk-based assessment. A private company running grievance channels, disaggregated outcome review and reparative processes without publishing them is understated here. **The direction is a safe finding for all fifteen; the magnitude should be treated as an upper bound**, most of all for the five entities at or above 93% absence share.

---

*This study is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
