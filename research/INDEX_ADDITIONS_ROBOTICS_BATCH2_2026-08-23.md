---
study: "robotics-labs index expansion — Batch 2 baseline assessments"
date: "2026-08-23"
index: "robotics-labs"
type: "BASELINE. First-ever assessments. No published score existed for any entity."
entities_selected: 15
entities_assessed: 15
entities_held: 0
assessments_written: 15
sidecars_written: 15
proposals_filed: 0
manifest: "research/INDEX_ADDITIONS_ROBOTICS_BATCH2_2026-08-23.json"
methodology_version: "v1.2"
constraints_honoured:
  - "No file under site/src/data/indexes/ modified"
  - "No change-proposal file written — there was nothing to change"
  - "research/rotation-state.json, PENDING_CHANGES.md, APPLIED_CHANGES.md, change-proposals/** and site/src/data/updates/** untouched"
  - "No ranks assigned"
  - "No commit"
---

# Robotics-Labs Batch 2: fifteen first numbers, and the tightest band in the benchmark's history

**Date:** 2026-08-23
**Index:** robotics-labs
**Type:** Baseline. Every entity here is new. There was no seed, no placeholder and no prior score to regress toward.

---

## 1. The fifteen scores

| Entity | Slug | HQ | Category | Composite | Band | Absence share |
|---|---|---|---|---:|---|---:|
| Esper Bionics | `esper-bionics` | Ukraine/USA | Healthcare/Prosthetics | **33.7** | Developing | 40% |
| Myomo, Inc. | `myomo` | USA | Healthcare/Assistive | **32.5** | Developing | 53% |
| Glidance, Inc. | `glidance` | USA | Accessibility/Blind mobility | **30.6** | Developing | 70% |
| Skydio, Inc. | `skydio` | USA | Defence/Inspection | **28.1** | Developing | 65% |
| Tyromotion GmbH | `tyromotion` | Austria | Healthcare/Rehab | **27.5** | Developing | 78% |
| Carbon Robotics | `carbon-robotics` | USA | Agriculture | **26.9** | Developing | 83% |
| Exotec | `exotec` | France | Logistics/Warehouse | **26.9** | Developing | 80% |
| Scewo AG | `scewo` | Switzerland | Accessibility/Wheelchair | **26.9** | Developing | 75% |
| LimX Dynamics | `limx-dynamics` | China | Research/Humanoid | **26.2** | Developing | 90% |
| WHILL, Inc. | `whill` | Japan | Accessibility/Personal mobility | **26.2** | Developing | 78% |
| Beijing Geekplus Technology Co., Ltd. | `geekplus` | China | Logistics/Warehouse | **25.6** | Developing | 88% |
| EngineAI Robotics | `engineai-robotics` | China | Research/Humanoid | **25.0** | Developing | 95% |
| Galbot | `galbot` | China | Service/Humanoid | **25.0** | Developing | 90% |
| Locus Robotics | `locus-robotics` | USA | Logistics/Warehouse | **25.0** | Developing | 83% |
| Robot Era | `robot-era` | China | Research/Humanoid | **25.0** | Developing | 98% |

"Absence share" is the share of the 40 subdimensions whose score rests on nothing being found, rather than on located evidence.

Every composite was produced by `computeCompositeFromDimensions` in `site/scripts/lib/scoring.mjs`, methodology v1.2, and **every one reproduces from its sidecar.** All 600 subdimension scores are on-grid integers, so every dimension value is a multiple of 0.2 and is reachable by the methodology. The integration premium — the bonus the formula awards for being strong and even across all eight areas — is **0 for all fifteen**, because no dimension anywhere in this batch reaches 4.0. Each composite equals its base composite. No harm flags were applied.

---

## 2. Band distribution

| Band | Count |
|---|---:|
| Critical (0–20) | 0 |
| Developing (21–40) | **15** |
| Functional (41–60) | 0 |
| Established (61–80) | 0 |
| Exemplary (81–100) | 0 |

**All fifteen landed in Developing.** Mean composite 27.4, standard deviation 2.7, range 25.0 to 33.7 — a spread of **8.7 points**.

That is the tightest cluster any batch in this programme has produced. Batch 1 spanned 19.4 points. The de-seeding study of 17 August spanned 20.6. **Batch 2 is half as differentiated as either, and the reason is in section 3.**

Four entities — Galbot, Robot Era, EngineAI Robotics and Locus Robotics — landed at **exactly 25.0**, the structural minimum for an entity with no located disclosure and no located harm. Batch 1 produced none at the floor; its lowest was 25.6.

### Score distribution across all 600 subdimensions

| Anchor | Count | Share |
|---:|---:|---:|
| 1 | **0** | 0% |
| 2 | 544 | 90.7% |
| 3 | 54 | 9.0% |
| 4 | **2** | 0.3% |
| 5 | **0** | 0% |

**No subdimension anywhere scored 1**, because the floor of 1 is reserved for positive documented evidence of a specific failure, and none was found in any of the fifteen. **No subdimension anywhere scored 5**, because 5 requires independent audit plus community testimony and no entity here has both.

**Only two scores of 4 exist in the entire batch**, against twelve in Batch 1. Both come from outside the company:

- **Myomo EQ4 Access Design** — the US Centers for Medicare and Medicaid Services moved the MyoPro into the brace benefit category on 1 January 2024, replacing a 13-month rental with a lump-sum payment, and finalised fee-schedule rates from 1 April 2024.
- **Esper Bionics EQ2 Priority for Vulnerable** — the Esper for Ukraine programme, running since May 2022, donates the company's Ukrainian production to war amputees, independently reported by the European Bank for Reconstruction and Development, Voice of America and CNN.

**Neither came from a corporate sustainability report.** That is now true of all fourteen scores of 4 across both batches.

---

## 3. Disclosure was the variable again, and harder than last time

**The correlation between absence share and composite is −0.935 across fifteen entities.** Batch 1 measured −0.905. The finding replicates, and slightly strengthens.

Publish more about what you do to people, score higher. Publish nothing, land at 25.0. That relationship now holds across 29 entities in two independent batches with no shared placeholder to distort either.

### Why this batch compressed

Batch 1 contained four surgical and rehabilitation companies operating under pre-market review and adverse-event reporting, plus one company whose product had been evaluated by a US state government. Those regulatory regimes manufacture exactly the evidence class these anchors reward, and they produced Batch 1's 19.4-point spread.

**Batch 2 has almost none of that.** Two entities are covered by a medical-device reimbursement decision (Myomo, Scewo). One is covered by a development-bank project record (Esper Bionics). One is listed on a stock exchange (Geekplus). The remaining eleven operate in categories with no pre-market review, no adverse-event database, and no public-payer coverage decision: humanoids, warehouse robots, drones, agricultural machinery and consumer mobility.

**Compression is therefore an evidence-regime effect, not a failure to differentiate.** Where evidence exists, the scores separate. Where it does not, they collapse onto the floor.

---

## 4. Sector did not predict score. Being examined by somebody else did.

The sector means look convincing:

| Grouping | n | Mean composite |
|---|---:|---:|
| Accessibility, assistive and rehabilitation | 6 | **29.6** |
| Defence and agriculture | 2 | 27.5 |
| Logistics and warehouse | 3 | 25.8 |
| Humanoid | 4 | 25.3 |

They collapse when you look inside them, exactly as they did in Batch 1.

**The single sharpest test in this batch is WHILL against Skydio.**

- **WHILL, Inc. builds power wheelchairs and airport mobility fleets for disabled travellers. It scores 26.2.**
- **Skydio, Inc. sells autonomous drones to police departments and militaries. It scores 28.1.**

An accessibility mission earned nothing on its own. Skydio scores higher because it published a supply failure to its customers, took a position that cost it its battery supply, and ships a transparency tool. WHILL publishes none of that. **This is not a claim that a drone company is more compassionate than a wheelchair company. It is a measurement of what each institution has made checkable.**

**The second test is Locus Robotics against three Chinese humanoid start-ups.** Locus is a ten-year-old US company with about 490 employees, US$438 million raised and a decade of warehouse deployments. It scores **25.0** — identical to Galbot, Robot Era and EngineAI Robotics. Size, age and nationality predicted nothing.

**The third is inside the accessibility group itself.** Esper Bionics scores 33.7 and WHILL 26.2. Both make mobility products for disabled people. The 7.5-point gap is entirely the European Bank for Reconstruction and Development project record, which examined and published who the prosthetics market was missing.

**The honest statement, unchanged from Batch 1:** entities whose effects on people have been examined and published by somebody other than themselves score higher. Regulation, public-payer coverage and development-bank due diligence are currently the main mechanisms that force that to happen.

---

## 5. Corporate status: fifteen resolved, none withheld, one flagged

The brief required registry, regulator, exchange or dated third-party financial sources, and forbade accepting press releases or company websites as proof. **All fifteen resolved. No entity was withheld.**

| Source class used | Entities |
|---|---:|
| Stock exchange listing or filing | 2 (Geekplus on HKEX 2590; Myomo on NYSE American via SEC 10-K) |
| Confidential exchange filing reported by a named financial newswire | 2 (LimX Dynamics, EngineAI Robotics) |
| Commercial register or Legal Entity Identifier record | 1 (Tyromotion) |
| Regulator or public-payer record | 2 (Esper Bionics — FDA GUDID; Scewo — German medical-aid directory 18.50.08.0001) |
| Multilateral development-bank project record | 1 (Esper Bionics — EBRD project 55187) |
| Dated third-party financial reporting | 7 (Galbot, Robot Era, Locus Robotics, Exotec, Skydio, Carbon Robotics, WHILL) |

**One entity carries `operating-flagged`: Glidance, Inc.** It plainly exists and trades, but it is pre-revenue, in beta testing around Seattle, and holds roughly 1,000 customer deposits against a product that had not shipped at scale as of this assessment. That is not the same risk class as ABB's divestiture or Bear Robotics' change of control, but it is a real currency risk and it should be re-verified next cycle.

**Two useful findings for the register:**

1. **A public-payer product listing is an underrated status source.** The strongest independent confirmation that Scewo AG is still trading was not a press release or a funding tracker. It was German medical-aid directory number 18.50.08.0001, which a manufacturer must obtain and maintain for the device to be reimbursable. Batches 3 and 4 should use payer listings as a status check for small medical-device firms.
2. **The `geekplus` naming trap is real and was avoided.** The trading name "Geek+" reduces to the bare token `geek` under the canonical slugger. The full legal name, Beijing Geekplus Technology Co., Ltd., was used and the slug is `geekplus`. Every one of the fifteen slugs was re-checked against all eight published indexes: **zero collisions.**

---

## 6. The two standing prompts both earned their place

### 6.1 Consent where the buyer is not the person affected

**This prompt fired in seven of fifteen assessments, and not one entity scored above 2 on it.**

| Entity | Who buys | Who is affected |
|---|---|---|
| WHILL | Airports and ground handlers | The disabled traveller riding in a sensor-equipped vehicle |
| Locus Robotics | The warehouse operator | Associates wearing Bluetooth tags with individual pick rates recorded |
| Geekplus | The warehouse operator | Pickers whose retrieval pace the system sets |
| Exotec | The warehouse operator | Operators at the picking station |
| Skydio | The police department | Residents recorded from above |
| Carbon Robotics | The grower | Farmworkers whose hand-weeding it replaces |
| Galbot | The retail or pharmacy operator | Members of the public collecting medication from a robot |

**Not one of these seven published a consent architecture, a data-retention policy for the affected person, or an opt-out.** Batch 1 found one partial case (Pudu's ISO/IEC privacy certification). Batch 2 found zero.

The Skydio case is the clearest and the least fixable. A police department buys the drone; the residents recorded from above do not, and **no consent architecture is possible in that deployment model.** The most Skydio does is ship a Transparency Dashboard that agencies may switch on at their discretion — and the Chicago Reader found the Cook County Sheriff's Office flying Skydio drones with no agreement at all governing who owns or may use the data collected.

**Recommendation: keep this prompt and make it a standing subdimension note on B5 for every entity whose product is bought by an institution and experienced by an individual.**

### 6.2 Unsubstantiated benefit claims

**This prompt fired in four assessments. Batch 1 found three. All four were scored as unevidenced rather than credited.**

| Entity | The claim | What was found |
|---|---|---|
| Locus Robotics | Companies had fewer injuries after adopting its systems | No injury data, no study, no methodology |
| Carbon Robotics | "We're not really taking away jobs" | No employment data, no farmworker survey, no transition provision — while a company case study reports weeding labour down more than 50% at one farm |
| WHILL | The autonomous service frees airport staff for higher-touch passenger support | No workload or employment data |
| Geekplus | Its technology shifts logistics away from energy-intensive manual labour | No employment or working-conditions analysis |

**Carbon Robotics is this batch's German Bionic.** A company whose product's selling point is eliminating the most precarious agricultural labour there is, asserting that it does not cost jobs, with nothing behind the assertion. Its Interconnection Awareness scores 2 of 5 for exactly that reason, and the file says so in plain words rather than treating it as a finding about the company's character.

**Exotec is the counter-example that proves the prompt works.** Faced with the same claim — that the human role changes rather than disappears — Exotec commissioned the consultancy Action Spinoza to study the social impact of its Skypod system across client sites in 2025, and reports findings on musculoskeletal disorder risk and physical strain. That is the only human-outcome measurement located anywhere in this batch's logistics group, and it is why Exotec (26.9) outscores Locus Robotics (25.0) and Geekplus (25.6).

**Recommendation: keep this prompt. Add Exotec to the brief for batches 3 and 4 as the worked example of what clears the bar.**

---

## 7. The accessibility injustice the brief warned about — and how each file handled it

The brief said plainly that a low score for Glidance, Esper Bionics or Scewo means they publish no outcome data, not that they lack compassion, and required that every affected subdimension say so. **Every one of the fifteen files carries a disclosure-capacity note, and every affected row carries the sentence "Absence of disclosure, not evidence of harm."**

Three cases are worth stating for the record:

**Glidance, Inc. scores 30.6 and has raised about US$1.6 million in total.** It is a pre-seed startup building a mobility aid for blind and low-vision people. It has no legal duty to publish an annual report, a bias audit or a turnover statistic, and it publishes none. Twenty-eight of its 40 subdimensions rest on that silence. What it does have is a community of more than 8,000 blind and low-vision members who helped design the product, monthly open calls, live testing at the American Council of the Blind and National Federation of the Blind conventions, and a public roadmap that admits its own delays. **That earned four above-floor scores and is why it ranks third in this batch.**

**Scewo AG scores 26.9 and publishes its price and its reimbursement odds.** The BRO starts at 32,850 francs or euros excluding tax, and the company sets out the route to public reimbursement while stating plainly that cover may be full, partial or refused. Telling a disabled buyer that the money may not come through is unflattering and unusual. It earns the batch's joint-highest Boundaries score.

**Esper Bionics scores 33.7 — the highest in the batch — and it manufactures in a country under invasion.** Its silence on workforce data, consent architecture and outcome measurement is total. Its evidence base is a development bank's project record.

**The distinction the framework depends on held in all three cases.** These are disclosure findings. In none of the fifteen assessments was any adverse conduct located.

---

## 8. The four at the floor: what 25.0 means, and why it does not mean the same thing four times

Galbot, Robot Era, EngineAI Robotics and Locus Robotics all landed at exactly 25.0. **The disclosure-density field is what keeps them apart, and this batch is the clearest argument yet for publishing it.**

| Entity | Absence share | What 25.0 means here |
|---|---:|---|
| Robot Era | **98%** | 39 of 40 rows rest on absence. The only sourced rows cite funding and unit counts. |
| EngineAI Robotics | 95% | One located safety-relevant event: the chief executive was kicked to the ground by the company's own T800 robot during a staged demonstration, wearing protective gear. **He consented and was the person harmed, so it is not scored as a harm finding.** It is scored as the absence of any published pre-demonstration harm assessment. |
| Galbot | 90% | Robots dispense medication in more than ten unstaffed Beijing pharmacies. **No error-rate, incident or safety-certification data was located for that.** |
| Locus Robotics | **83%** | 11 rows rest on located evidence that simply does not clear a higher anchor — LocusHub productivity dashboards, optional gamified pick competitions, Bluetooth associate tags, an unevidenced injury claim. |

**Locus Robotics' 25.0 is not the same measurement as Robot Era's 25.0.** One is a company that publishes a lot about output and nothing about people. The other is a company that publishes almost nothing at all. Without a disclosure-density indicator on the published page, a reader cannot tell them apart, and the benchmark will be read as having said something it did not say.

### Silence by choice versus silence by constraint

The brief required this distinction, and it is applied in every file.

- **Silence by constraint:** Glidance (US$1.6 million raised), Scewo (US$23.2 million), Tyromotion, WHILL (136 employees). These firms have no compliance department and no legal duty to publish.
- **Silence by choice:** Galbot (about US$362 million raised, preparing a Hong Kong listing), LimX Dynamics (about US$400 million in six months), Robot Era (more than US$200 million, valuation above ¥20 billion), EngineAI (about ¥1 billion since January 2026). These firms can afford to publish safety and human-effect data about robots that dispense medication and walk among people. They do not.

Each of the four humanoid files says so in its disclosure-capacity note, in those words.

---

## 9. Recommendations for batches 3 and 4

1. **Expect the floor, and publish the disclosure-density field before these fifteen go live.** Four entities at exactly 25.0 and 90.7% of all subdimension scores at 2 make this urgent rather than desirable. Batch 1 recommended it; Batch 2 makes it a publication blocker. The manifest shape `{ absence_based, evidence_based, absence_share }` is populated for all fifteen.

2. **Search public-payer coverage decisions and medical-aid directories first for every medical-device candidate.** Both scores of 4 in this batch, and the strongest single piece of evidence for Scewo, came from payer or directory records. Batch 3 contains Zimmer Biomet, Globus Medical, Procept BioRobotics, Distalmotion, Moon Surgical and Noah Medical; batch 4 contains Trexo Robotics, Marsi Bionics, Angel Robotics, PSYONIC and Össur. **For every one of them, check CMS HCPCS coding, the German Hilfsmittelverzeichnis, Medi-Cal and comparable national listings before touching a company website.**

3. **Add multilateral development-bank project records to the standard search set.** The EBRD project record for Esper Bionics produced five above-floor scores including a genuine blind-spot finding — that 20 to 30 per cent of female amputees in Ukraine cannot use the prostheses on the market. Nothing else in this batch came close. EBRD, IFC and EIB project databases are public, searchable and rarely used by this programme.

4. **Treat the pre-shipment startup as its own status class.** Glidance is operating, solvent and trading, and it holds roughly 1,000 customer deposits against an undelivered product. Neither "Operating" nor "At risk" describes it well. Batch 4 candidates Labrador Systems and Trexo Robotics may sit in the same class. Recommend a fifth §2.4 state, **Pre-delivery**, requiring re-verification each cycle.

5. **Do not read this batch's compression as a scoring problem.** Where an evidence regime exists, the anchors separate entities cleanly — 8.7 points across fifteen, with the top two both driven by named third-party institutions. Where no regime exists, the floor binds. Batches 3 and 4 contain more regulated surgical and prosthetics firms than Batch 2 did, and should spread wider again.

6. **Two Batch 4 candidates remain status-flagged and should be checked before any assessor time is spent.** iRobot Corporation carries publicly reported going-concern doubt. Rex Bionics has changed ownership repeatedly. Batch 1's Hocoma hold shows what happens when that check is skipped. Neither was in scope here.

7. **Keep the anti-bias guard. It worked again.** There was no prior to regress toward. A drone company sold to police outscored a wheelchair company. A ten-year-old American logistics firm tied with three Chinese start-ups. A US$362 million humanoid company landed at the same number as a company that has raised US$1.6 million. Sector, size, nationality and capital predicted nothing.

---

## 10. Deliverables

### Files written

| Path | Contents |
|---|---|
| `research/assessments/{slug}-2026-08-23.md` | Full 40-subdimension baseline assessment with a baseline-establishment note in place of a published comparison, 15 files |
| `research/assessments/{slug}-2026-08-23.subdims.json` | 40-subdimension sidecar, canonical order, integer anchors, tier/url/date/quote per item, 15 files |
| `research/INDEX_ADDITIONS_ROBOTICS_BATCH2_2026-08-23.json` | 15 proposed index rows, all `pending-addition`, each carrying an explicit `slug`. **No ranks assigned.** |
| `research/INDEX_ADDITIONS_ROBOTICS_BATCH2_2026-08-23.md` | This synthesis |

Slugs used are exactly those specified in the brief: `glidance`, `esper-bionics`, `myomo`, `tyromotion`, `galbot`, `limx-dynamics`, `robot-era`, `engineai-robotics`, `locus-robotics`, `geekplus`, `exotec`, `skydio`, `carbon-robotics`, `whill`, `scewo`.

### Files deliberately not touched

`site/src/data/indexes/*.json`, `research/rotation-state.json`, `research/PENDING_CHANGES.md`, `research/APPLIED_CHANGES.md`, `research/change-proposals/**`, `site/src/data/updates/**`. **No change proposal was filed, because there was no published score to change.** Nothing was committed.

### Quote convention

Every `quote` field in every sidecar is either a passage explicitly quoted in a retrieved source or the verbatim title of the cited page. **No quote is paraphrased and no source, URL, company or date is invented.** Where a row rests on absence, the sidecar records evidence tier 1 and states so explicitly rather than borrowing a company page as if it were support.

### Known limitations

- The Action Spinoza social-impact study of Exotec's Skypod was not located directly; only Exotec's own summary of it. That is why it caps at 3 of 5 rather than 4.
- Geekplus is bound by the HKEX Environmental, Social and Governance Reporting Code, which requires labour-practice disclosure, but **no turnover, safety or workforce figure was located** in the filings and coverage reviewed. If that reporting exists, this assessment understates the company.
- Employee-forum discussion of 2026 job cuts at Skydio was seen and is **not relied on**, because no dated source corroborates it.
- This is a desk-based assessment. A private company running grievance channels, disaggregated outcome review and reparative processes without publishing them is understated here. **The direction is a safe finding for all fifteen; the magnitude should be treated as an upper bound**, most of all for the four entities above 90% absence share.

---

*This study is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
