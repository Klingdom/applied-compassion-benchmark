---
study: "robotics-labs index expansion — Batch 1 baseline assessments"
date: "2026-08-20"
index: "robotics-labs"
type: "BASELINE. First-ever assessments. No published score existed for any entity."
entities_selected: 15
entities_assessed: 14
entities_held: 1
assessments_written: 14
sidecars_written: 14
proposals_filed: 0
manifest: "research/INDEX_ADDITIONS_ROBOTICS_BATCH1_2026-08-20.json"
methodology_version: "v1.2"
constraints_honoured:
  - "No file under site/src/data/indexes/ modified"
  - "No change-proposal file written — there was nothing to change"
  - "research/rotation-state.json, PENDING_CHANGES.md, APPLIED_CHANGES.md, change-proposals/** and site/src/data/updates/** untouched"
  - "No commit"
---

# Robotics-Labs Batch 1: fourteen first numbers and one company we refused to score

**Date:** 2026-08-20
**Index:** robotics-labs
**Type:** Baseline. Every entity here is new. There was no seed, no placeholder and no prior score to regress toward.

---

## 1. The fourteen scores

| Entity | Slug | HQ | Category | Composite | Band | Absence share |
|---|---|---|---|---:|---|---:|
| Intuition Robotics | `intuition-robotics` | Israel | Care/Companionship | **45.0** | Functional | 48% |
| Intuitive Surgical, Inc. | `intuitive-surgical` | USA | Healthcare/Surgical | **38.7** | Developing | 40% |
| CMR Surgical Ltd | `cmr-surgical` | UK | Healthcare/Surgical | **37.5** | Developing | 60% |
| Yaskawa Electric Corporation | `yaskawa-electric` | Japan | Industrial | **31.2** | Developing | 68% |
| KUKA AG | `kuka` | Germany | Industrial | **31.2** | Developing | 70% |
| ABB Robotics | `abb-robotics` | Switzerland/Sweden | Industrial | **30.6** | Developing | 70% |
| FANUC Corporation | `fanuc-corporation` | Japan | Industrial | **30.0** | Developing | 70% |
| Relay Robotics, Inc. | `relay-robotics` | USA | Healthcare/Service | **28.1** | Developing | 80% |
| Symbotic Inc. | `symbotic` | USA | Logistics/Warehouse | **27.5** | Developing | 80% |
| Pudu Robotics | `pudu-robotics` | China | Service/Hospitality | **26.9** | Developing | 93% |
| German Bionic Systems GmbH | `german-bionic` | Germany | Industrial/Exoskeleton | **26.9** | Developing | 80% |
| Keenon Robotics | `keenon-robotics` | China | Service/Healthcare | **26.2** | Developing | 95% |
| AgiBot (Zhiyuan Robotics) | `agibot` | China | Labor/Humanoid | **25.6** | Developing | 98% |
| Bear Robotics | `bear-robotics` | USA/South Korea | Service/Hospitality | **25.6** | Developing | 98% |
| **Hocoma AG (DIH Holding)** | `hocoma` | Switzerland | Healthcare/Rehab | **not scored** | **held** | — |

"Absence share" is the proportion of the 40 subdimensions whose score rests on nothing being found, rather than on located evidence.

Every composite was produced by `computeCompositeFromDimensions` in `site/scripts/lib/scoring.mjs`, methodology v1.2, and every one reproduces from its sidecar. **All 560 subdimension scores are on-grid integers**, so every dimension value is a multiple of 0.2 and is reachable by the methodology. The integration premium is 0 for all fourteen: no dimension anywhere in this batch reaches 4.0, so the weakness factor collapses to zero and each composite equals its base composite. No harm flags were applied.

---

## 2. Band distribution

| Band | Count |
|---|---:|
| Critical (0–20) | 0 |
| Developing (21–40) | **13** |
| Functional (41–60) | **1** |
| Established (61–80) | 0 |
| Exemplary (81–100) | 0 |
| **Not scored (held)** | **1** |

Mean composite 30.8, standard deviation 5.6, range 25.6 to 45.0.

**Nothing in this batch reaches Established, and nothing comes close to Exemplary.** That is consistent with the de-seeding studies of 17 August 2026, which found nothing above 46.2 across ten robotics labs assessed from evidence.

### Score distribution across all 560 subdimensions

| Anchor | Count | Share |
|---:|---:|---:|
| 1 | **0** | 0% |
| 2 | 442 | 78.9% |
| 3 | 106 | 18.9% |
| 4 | 12 | 2.1% |
| 5 | **0** | 0% |

**No subdimension anywhere scored 1**, because the floor of 1 is reserved for positive documented evidence of a specific failure, and none was found. **No subdimension anywhere scored 5**, because 5 requires independent audit plus community testimony and no entity in this batch has both.

---

## 3. Disclosure was the variable that mattered. Sector was not.

**The correlation between absence share and composite is −0.905 across fourteen entities.** Publish more about your own effects, score higher. That is the strongest single finding of this batch, and it replicates the finding of the 17 August de-seeding study in a cohort with no placeholder to distort it.

Sector means look meaningful at first glance and collapse when you look inside them:

| Grouping | n | Mean composite |
|---|---:|---:|
| Healthcare and care robotics | 5 | 35.1 |
| Industrial and exoskeleton | 5 | 30.0 |
| Service, labour and logistics | 6 | 26.7 |

The healthcare advantage is real but it is not a mission effect. **It is a regulation effect.** Medical devices must pass pre-market review, must report adverse events, and are studied by people other than their makers. That produces exactly the evidence class these anchors reward. Strip the regulated firms out and the pattern vanishes:

- **Relay Robotics builds hospital robots and scores 28.1** — below every industrial robot maker in the batch. It is a healthcare company with no regulatory evidence base.
- **German Bionic exists to prevent worker injury and scores 26.9.** Its central claim is that its exoskeletons "measurably reduce injury risks". No measurement was found.
- **Intuition Robotics is not a regulated medical device company and tops the batch at 45.0**, because a US state government published three years of outcome data about its product.

So the honest statement is narrower than "healthcare scores higher". It is: **entities whose effects on people have been examined and published by somebody other than themselves score higher, and regulation is currently the main mechanism that forces that to happen.**

### The clearest illustration in the batch

**Intuition Robotics has raised about $83 million. Intuitive Surgical earned $10.1 billion in 2025. Intuition Robotics scores 6.3 points higher.**

Intuitive Surgical is the most exposed robotics company on earth — more than 11,100 da Vinci systems installed and 3.2 million procedures in 2025. It has FDA recall records, MAUDE adverse-event data, SEC filings and a completed federal antitrust trial. It is one of the best-evidenced entities the benchmark will ever assess. And nearly all of that evidence is compelled. Under these anchors, acknowledgment that happens only because the law demands it caps at 2 of 5.

Intuition Robotics chose to put a deployment in front of a state agency and publish the result, and chose to publish its own limitations in a peer-reviewed journal. Nobody made it do either.

### Scale cut both ways, as the brief said it would

Intuitive Surgical's 11,100 installed systems produced its highest scores (Awareness 55, Action 50) **and** its lowest. The instrument usage limits and third-party repair restrictions that a federal court heard in detail put Autonomy Preservation at 2 of 5. The 331 layoffs at Sunnyvale in a year revenue grew 21% put Internal Consistency at 2 of 5. Reach is not compassion.

---

## 4. Evidence-rich versus evidence-thin

### Evidence-rich (absence share at or below 60%)

- **Intuitive Surgical (40%)** — FDA recall classifications, MAUDE, SEC filings, a completed antitrust trial, WARN Act filings, ESG reports, independent access literature.
- **Intuition Robotics (48%)** — a New York State Office for the Aging outcome evaluation across three years and 834 enrolled older adults, a peer-reviewed lessons-learned paper, a ClinicalTrials.gov registration, and a Washington State Medicaid coverage decision.
- **CMR Surgical (60%)** — FDA de novo and 510(k) decisions, a registered post-market study, IDEAL-framework evaluations publishing an 11.4% 30-day complication rate, and an independent NHS study comparing Versius against da Vinci Xi.

### Evidence-thin (absence share at or above 90%)

- **AgiBot (98%)** — 39 of 40 subdimensions rest on absence. The single positive item is a CR001 safety certification. AgiBot ships more humanoid robots than anyone on earth and publishes nothing readable about their effect on people.
- **Bear Robotics (98%)** — 39 of 40. The single positive item is access design: subscription pricing from about $999 a month and wheelchair-aware navigation.
- **Keenon Robotics (95%)** — 38 of 40. Repeated searches found no sustainability report, no ESG report, no ISO management-system certification disclosure and no independent CSR audit.
- **Pudu Robotics (93%)** — 37 of 40, but the three positives are unusually good: notified-body CE-MD and CE-RED certification, ISO/IEC information security and privacy certification, and a co-authored industry ESG guide with Deloitte.

**In every one of these four cases, no adverse conduct was located either.** No lawsuit, no safety incident, no labour ruling, no regulatory action. These are disclosure findings, and every affected subdimension row says so in its own text, as the brief required.

### The specific injustice the brief warned about

The brief warned that a company building gait trainers for children with cerebral palsy would score 25 for publishing no annual report, and that this must never be phrased as a finding about compassion. **That case did not arise in Batch 1 — the paediatric-gait candidates sit in Batch 4 — but its analogue did.**

German Bionic exists to stop warehouse workers destroying their backs. It scores 26.9. Its assessment says, in the Efficacy row and again in the key findings, that **no injury-reduction data was located**, and that an unsubstantiated claim cannot score above the baseline. It does not say the company fails to care about workers. Those are different statements and the file keeps them apart.

---

## 5. Corporate-status problems: five of fifteen

**One in three entities selected for Batch 1 had a corporate-status problem.** The scope study's §2.4 currency rule earned its place immediately.

### 5.1 Hocoma — not scored

**DIH Holding US, Inc., Hocoma's parent, announced on 6 November 2025 that it would suspend operations**, having determined that the capital needed for daily operations would be unavailable. It was delisted from Nasdaq on 7 November 2025 after a Hearings Panel denied continued listing. Auditors had already flagged substantial doubt about going concern, and the company was delinquent on two filings. By January 2026 the shares were reported at $0.0032.

Hocoma AG's Swiss website remains live with 2026 copyright. **Whether the Swiss operating company still trades could not be resolved in either direction.** No buyer, administration or liquidation was located.

**No score was assigned.** Under §2.4 this entity is currently unclassifiable between Operating, Acquired and Defunct, and the roster already carries a case of a company ranked "Established" eleven months after it ceased operating. A hold is more honest than a number. A dated Swiss commercial-register filing is required before any assessment.

**Note the near-miss in the selection process.** The scope study recorded Hocoma as "Operating, 2025-11" on the strength of a November 2025 platform announcement — the same month the parent told its regulator it was suspending operations. **A product press release is not a corporate-status source.** That is the single most transferable lesson from this batch.

### 5.2 ABB Robotics — scored, flagged

ABB agreed on 8 October 2025 to sell the Robotics division to SoftBank Group for about $5.375 billion, with completion expected mid-to-late 2026 subject to EU, China and US approval. About 7,000 employees move with it.

Two consequences the index must handle. First, **ABB's own 2025 sustainability target already excludes the Robotics division** because of the divestiture — so the group-level disclosure this assessment reads largely does not cover the unit being scored. Second, on completion the disclosure regime changes wholesale. Resilience of Care scores 2 of 5 for exactly this reason: nothing located shows which practices are embedded in the Robotics business rather than in ABB Ltd.

### 5.3 German Bionic — scored, flagged

Acquired by Archimedes Partners, completed March 2026. It retains its name, brand and independent public communications, so it is scored as operating. Re-verify next cycle.

### 5.4 Bear Robotics — scored, flagged

LG Electronics exercised a call option on 22 January 2025 to take a controlling 51% stake and stated an intention to fold Bear into its CLOi commercial robot line. Bear still launches products independently (Servi Q, May 2026), so it is listed under R-SUB-2. If independent disclosure ceases, this record must be re-scoped.

### 5.5 CMR Surgical — scored, flagged

Trade reporting indicates CMR is weighing a full or partial sale at a reported valuation near $4 billion. **No transaction has been announced.** Flagged for re-verification rather than held, because a reported process is not a completed event.

---

## 6. The industrial four: labour displacement, assessed in both directions

The brief asked for FANUC, ABB, Yaskawa and KUKA to be assessed on labour displacement in both directions. Here is what was found.

**In their favour.** Two of the four run substantial upstream skills programmes with real resources. FANUC's Certified Education Robot Training operates at more than 1,700 schools across the Americas and awards certifications built with NOCTI, an independent certification body — credentials that belong to the worker, not to FANUC. ABB works with schools, colleges and universities in more than 40 countries and certifies teachers to run robotics courses themselves. Both score 3 of 5 on Root Cause Orientation and Autonomy Preservation as a result.

**Against them, uniformly.** **Not one of the four publishes any analysis of what its robots do to employment in its customers' plants.** Interconnection Awareness and Structural Critique score 2 of 5 for all four. This is the core systemic question an industrial robot maker exists to raise, and all four are publicly silent on it.

**KUKA is the outlier, and the reason is co-determination.** Facing sustained losses in its Systems division, KUKA agreed with its works council and IG Metall that **every employee including management and executives would forgo 10% of gross salary until the end of 2026** to protect jobs, with a stated preference for avoiding compulsory redundancies and a social plan to follow. That earns the batch's highest Signal Amplification score (4 of 5) and the industrial group's highest Integrity (35 of 100). It is also independently reported by German trade press and IG Metall rather than self-published — which is why it counts.

The good news is bounded: between 215 and 560 jobs are still going at Augsburg across 2025 and 2026.

**Yaskawa is the disclosure leader of the four** on the strength of a human rights due diligence cycle aligned to the UN Guiding Principles — identify, act, follow up, monitor, disclose — plus a monthly satisfaction survey covering all non-consolidated employees. The cycle is described; **its findings are not published**, which is why Transparency caps at 3 and Accountability at 30.

The four land within 1.2 points of each other (30.0 to 31.2). That tight clustering is not a seed artefact — the underlying dimension vectors differ in shape. It reflects four companies with broadly similar disclosure practice and genuinely different strengths inside it.

---

## 7. What should change in the brief for batches 2 to 4

1. **Require a corporate-registry source, not a press release, for every status check.** Hocoma was recorded as operating on the strength of a product announcement issued in the same month its parent told the SEC it was suspending operations. For batches 2 to 4, the status check should cite a filing, a register entry or a regulator record. Twenty-six of the remaining robotics candidates are marked **U — not verified**; that verification pass is not optional and it should use registry sources.

2. **Two Batch 4 candidates are already flagged at risk and should be status-checked before any assessor time is spent.** iRobot Corporation carries publicly reported going-concern doubt. Rex Bionics has changed ownership repeatedly. Hocoma has just shown what happens when that check is skipped.

3. **Add a disclosure-density field to every entity record, and publish it.** The scope study recommended a disclosure-density indicator. This batch supports it strongly: absence share correlates with composite at **−0.905**. Without that field, a reader cannot tell 25.6 for a company that publishes nothing from 25.6 for a company that publishes something bad. Recommended shape is the one used in the manifest: `{ absence_based, evidence_based, absence_share }`.

4. **Expect the same compression in batches 2 and 3, and do not read it as failure to differentiate.** Thirteen of fourteen entities landed in Developing, spanning 25.6 to 38.7. That is what happens when most private robotics firms publish nothing and the absence baseline is 2.0, giving a structural floor of 25.0. **Differentiation is real but small**, and it lives in the shape of the dimension vectors rather than in the composite. Batch 2's accessibility and rehabilitation candidates (Glidance, Esper Bionics, Myomo, Tyromotion, WHILL, Scewo) should show the same regulated-versus-unregulated split that separated CMR Surgical from German Bionic here.

5. **Search regulator and standards-body databases first, not company websites.** The 12 subdimension scores of 4 in this batch came from: a state-government outcome evaluation, FDA recall and clearance records, a ClinicalTrials.gov registration, peer-reviewed IDEAL evaluations, and a statutory works council. **Not one came from a corporate sustainability report.** For batches 2 to 4 the highest-yield first searches are FDA MAUDE and 510(k), CE notified-body certification, ClinicalTrials.gov, public-payer coverage decisions, and national labour-relations records.

6. **Two structural risks recur and deserve a standing prompt.** First, **consent where the buyer is not the person affected** — exoskeleton wearers, care-home residents, restaurant diners, warehouse workers. Only Pudu had any third-party assurance touching it (ISO/IEC privacy certification). Second, **unsubstantiated benefit claims** — German Bionic's injury reduction, Bear Robotics' "assists rather than replaces", Relay Robotics' burnout relief. All three are core compassion claims with no independent evidence. Batches 2 to 4 should test both explicitly.

7. **Keep the anti-bias guard. It worked.** There was no prior to regress toward and the results did not cluster around any expected value: the range is 19.4 points, the top entity is a small Israeli company rather than the $10 billion incumbent, and a hospital robotics firm scored below four industrial automation firms. Sector did not determine score.

---

## 8. Deliverables

### Files written

| Path | Contents |
|---|---|
| `research/assessments/{slug}-2026-08-20.md` | Full 40-subdimension baseline assessment, 14 files |
| `research/assessments/{slug}-2026-08-20.subdims.json` | 40-subdimension sidecar, integer anchors, tier/url/date/quote per item, 14 files |
| `research/assessments/hocoma-2026-08-20.md` | **Corporate-status hold. No score assigned. No sidecar.** |
| `research/INDEX_ADDITIONS_ROBOTICS_BATCH1_2026-08-20.json` | 15 proposed index rows — 14 `pending-addition`, 1 `hold-corporate-status-unresolved`. **No ranks assigned.** |
| `research/INDEX_ADDITIONS_ROBOTICS_BATCH1_2026-08-20.md` | This synthesis |

Slugs used are exactly those specified in the brief: `intuitive-surgical`, `intuition-robotics`, `fanuc-corporation`, `abb-robotics`, `yaskawa-electric`, `kuka`, `keenon-robotics`, `pudu-robotics`, `hocoma`, `agibot`, `symbotic`, `relay-robotics`, `german-bionic`, `cmr-surgical`, `bear-robotics`. All were re-checked against the live `robotics-labs.json` name list: **zero collisions.**

### Files deliberately not touched

`site/src/data/indexes/*.json`, `research/rotation-state.json`, `research/PENDING_CHANGES.md`, `research/APPLIED_CHANGES.md`, `research/change-proposals/**`, `site/src/data/updates/**`. **No change proposal was filed, because there was no published score to change.** Nothing was committed.

### Quote convention

Every `quote` field in every sidecar is either a passage explicitly quoted in a retrieved source or the verbatim title of the cited page. **No quote is paraphrased and no source, URL, company or date is invented.** Where a claim could not be substantiated — German Bionic's injury-reduction claim, Relay Robotics' burnout claim, Bear Robotics' non-replacement claim — the assessment says so rather than crediting it.

---

*This study is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
