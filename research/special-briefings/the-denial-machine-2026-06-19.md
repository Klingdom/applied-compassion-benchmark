# Special Briefing — The Denial Machine

**When Coverage Becomes the Harm**

- **Edition:** Thematic (event-triggered; companion to the 2026-06-18 Humana downgrade)
- **Date:** 2026-06-19
- **Author:** Special-Briefing agent (interpretive synthesis over the canonical record; read-only of index JSONs and public federal evidence)
- **Scope:** Fortune 500 index, healthcare-payer cohort. The six for-profit insurers that operate the largest Medicare Advantage books — UnitedHealth Group, Humana, CVS Health/Aetna, Cigna, Elevance Health (Anthem), and Centene — read against the full 1,156-entity scored catalog and the eight-dimension framework.
- **Method note:** This is an interpretive synthesis over the *existing* record and the public federal evidence. Composites, bands, and dimension vectors are the published values, reconciled against the canonical formula (`computeCompositeFromDimensions`); the briefing does not re-score any entity. It draws an explicit line between adjudicated findings (the OIG audit, the Senate investigation) and live allegations (the nH Predict litigation), and scores its conclusions only on the former. Where it surfaces a scoring gap, that gap is filed as a methodology question for human review, not applied.

---

## publicSummary

> **Title:** The Denial Machine — When Coverage Becomes the Harm
>
> **Dek:** An institution that exists to fund care for people in distress can fail in a specific, legible way: by systematically refusing that care to the highest-need, lowest-power patients. The for-profit health insurers behind Medicare Advantage are the clearest case of that inversion in the entire record. This briefing reads the published scores of six of them against the federal evidence on prior-authorization denials — and finds a cohort that does not merely score low, but fails on the exact dimensions the benchmark was built to detect.
>
> **The cohort:**
> - Six for-profit health-insurance payers, all in the Fortune 500 index.
> - Five of the six sit in the bottom two bands (Developing 21–40, Critical 0–20); one, Humana, was downgraded on 2026-06-18 (51.6 → 40.6) and now sits **0.6 of a point above the Developing line, inside the Functional band**.
> - The cohort's composites span UnitedHealth Group **10.2 (Critical)**, Cigna **20.3 (Developing)**, CVS Health **25.6 (Developing)**, Elevance Health **30.0 (Developing)**, Centene **32.8 (Developing)**, Humana **40.6 (Functional)**.
> - Every member's weakest or tied-weakest dimension is Equity — the dimension that measures whether the highest-need, lowest-power people are served first — and every member scores below the midpoint on Accountability and Integrity.
>
> **Key findings (observer voice):**
> 1. **Six payers, and not one clears the midpoint of the scale.** UnitedHealth Group (10.2) sits in the Critical band; Cigna (20.3), CVS Health (25.6), Elevance Health (30.0), and Centene (32.8) are all in the Developing band; Humana (40.6), even after losing 11 points on 2026-06-18, only just clears into Functional — 0.6 of a point above the line. The single largest segment of the US health-financing system, read on conduct, clusters at the bottom of the Fortune 500.
> 2. **The failure is concentrated on the exact dimension the harm describes.** For every member of the cohort, Equity (EQU) — care directed first to those with the greatest need and least power — is the weakest or tied-weakest dimension. UnitedHealth posts EQU 1.25 and Cigna 1.5 on the 1–5 scale. An institution whose function is to fund care for the sick and old scoring lowest on serving the highest-need is not a coincidence; it is the pattern the benchmark exists to surface.
> 3. **The federal record documents a denial gradient aimed at post-acute care.** The HHS Office of Inspector General (11 June 2026) found the three largest Medicare Advantage organizations denied long-term acute-care and inpatient-rehabilitation requests at some of the highest rates of any plans: Humana denied 72% of long-term-care-hospital requests and 54% of inpatient-rehab requests; CVS denied 80% of LTCH requests; UnitedHealth denied 71% of LTCH and 66% of IRF requests. These are services that, by definition, only the sickest patients need.
> 4. **Appeals expose the denials as an accountability failure, not a clinical one.** OIG found that when enrollees appealed, plans overturned 36% of LTCH and 43% of IRF denials — with individual plan IRF overturn rates running as high as 86%. A denial that is reversed once a human looks at it on appeal was, by the plan's own subsequent admission, wrong. The benchmark reads a high overturn rate as an Accountability (ACC) signal: the institution was right only because someone forced it to be.
> 5. **The AI-denial allegations are weighed as allegations, not adjudicated harm.** The cohort's most-cited controversy — that UnitedHealth's naviHealth nH Predict algorithm drove post-acute denials a court filing alleges carried a ~90% appeal-reversal rate — remains a live class action in which a federal judge dismissed five of seven counts while letting the case proceed. Under the benchmark's evidence discipline, that is an open allegation, not a ruling, and it is read as enforcement-and-litigation density rather than as a settled finding. The scored harms rest on the federal audit record, not on the suit.
> 6. **Stated values and measured conduct point in opposite directions.** Every payer in the cohort markets itself as member-first and care-centered; every payer in the cohort scores below the midpoint on Integrity (INT) — the dimension that measures the gap between what an institution says and what it does. The cohort is the cleanest illustration in the record of an Integrity failure: not dishonesty in the abstract, but a documented divergence between mission and conduct directed at the people least able to push back.

---

## 1. Frame

The Compassion Benchmark measures how institutions recognize, respond to, and reduce suffering. A health insurer occupies a singular position in that frame: its entire reason to exist is to *fund care for people in distress*. When such an institution instead becomes a mechanism for *withholding* that care from the highest-need, lowest-power patients, the failure is not incidental to its mission — it is an inversion of it. That inversion is what this briefing examines.

The trigger is a scored event. On 18 June 2026, **Humana** was downgraded in the Fortune 500 index from a composite of 51.6 to **40.6** — an 11-point drop — on the strength of the HHS Office of Inspector General's documentation of its Medicare Advantage prior-authorization denial rates. The new score leaves Humana 0.6 of a point above the Developing-band line, inside the Functional band: the strongest performer in this cohort, and still only barely above the bottom third of the scale. This briefing is that downgrade's thematic companion: it widens the lens from one payer to the cohort of six for-profit insurers that run the largest Medicare Advantage books, and asks what the published record, read whole, actually shows.

The thesis: **the for-profit Medicare Advantage payers are the benchmark's clearest case of an institution failing on the precise dimensions its harm pattern predicts.** The denials fall on Equity (the highest-need denied first), on Action (a response that withholds rather than delivers), on Accountability (denials overturned the moment they are appealed), and on Integrity (member-first language against care-withholding conduct). This is an interpretation of the existing record and the public federal evidence; it does not re-score any entity, and it draws the line carefully between what has been adjudicated and what has only been alleged.

---

## 2. The cohort

Six for-profit payers, all in the Fortune 500 index, drawn directly from `fortune-500.json` (composites and dimension vectors are the published values; bands follow the canonical thresholds Critical 0–20, Developing 21–40, Functional 41–60):

| Payer | Composite | Band | EQU | ACT | ACC | INT | Weakest dimension(s) |
|-------|----------:|------|----:|----:|----:|----:|----------------------|
| Humana | **40.6** | Functional | 2.0 | 2.5 | 2.5 | 2.5 | EQU (2.0) |
| Centene | 32.8 | Developing | 2.0 | 2.5 | 2.0 | 2.0 | EQU / ACC / INT (2.0) |
| Elevance Health (Anthem) | 30.0 | Developing | 2.0 | 2.5 | 2.0 | 2.0 | EQU / ACC / INT / SYS (2.0) |
| CVS Health / Aetna | 25.6 | Developing | 1.75 | 2.25 | 1.75 | 2.0 | EQU / ACC (1.75) |
| Cigna | 20.3 | Developing | 1.5 | 2.0 | 1.5 | 1.5 | EQU / ACC / INT (1.5) |
| UnitedHealth Group | **10.2** | Critical | 1.25 | 1.5 | 1.125 | 1.375 | EQU / ACC (≈1.2) |

Note on Humana's band: at 40.6 it sits **0.6 of a point above the Developing/Functional boundary (40.0)** — the only member of the cohort in the Functional band, and the narrowest possible margin into it. The downgrade did not move it out of the bottom third; it left it pressed against the line from above.

Three structural facts stand out, and all three are visible in the columns above rather than asserted:

- **The cohort is a descent.** Read top to bottom, the six payers form a near-continuous slope from Humana's 40.6 down to UnitedHealth's 10.2 — a 30-point spread inside a single line of business. The same activity (administering Medicare Advantage prior authorization) is scored across two full bands, because the conduct evidence against each differs in severity and adjudication.
- **Equity is the floor for all six.** EQU is the weakest or tied-weakest dimension in every row. This is the dimension that asks whether care reaches those with the greatest need and least power first. For a payer whose Medicare Advantage book is, by definition, the old and the sick, an Equity floor is the most diagnostic possible signal.
- **Accountability and Integrity collapse together.** Every payer scores at or below the midpoint on both ACC (denials owned and corrected) and INT (stated values vs conduct). Where Equity describes *who* is failed, ACC and INT describe *how* the institution handles having failed them — and the cohort is weak on both.

---

## 3. The federal record — what the denials actually are

The benchmark's downgrades in this sector rest on the adjudicated, audited federal record, not on advocacy or allegation. Two strands of that record are load-bearing.

**The HHS OIG prior-authorization audit (11 June 2026).** The Office of Inspector General examined Medicare Advantage prior-authorization decisions for post-acute care and found that the three largest organizations denied long-term acute-care and inpatient-rehabilitation requests at some of the highest rates of any plan studied:

| Plan | Long-term acute-care hospital (LTCH) denial rate | Inpatient rehab facility (IRF) denial rate |
|------|---------------------------------------------------|---------------------------------------------|
| CVS Health / Aetna | **80%** | 51% |
| Humana | **72%** | 54% |
| UnitedHealth Group | 71% | **66%** |
| All MA plans (benchmark) | 65% | 54% |

The critical feature of these services is that *only the sickest patients need them*. Long-term acute-care hospitals and inpatient-rehabilitation facilities are where someone goes after a stroke, a severe injury, or a complex hospitalization. A denial gradient concentrated on precisely these services is a denial gradient aimed at the highest-acuity, least-able-to-advocate patients — which is the Equity failure stated as conduct.

**The Senate Permanent Subcommittee on Investigations report.** The Subcommittee's majority-staff investigation found that UnitedHealthcare, Humana, and CVS used prior authorization to raise post-acute denials sharply between 2019 and 2022 — with Humana's post-acute denial rate documented at roughly sixteen times its overall denial rate, and UnitedHealth's skilled-nursing denial rate rising several-fold over the period. The Subcommittee framed this as the intentional use of prior authorization to deny post-acute care.

---

## 4. The accountability gap — denials that don't survive a second look

The single most damning number in the federal record is not the denial rate. It is the **overturn rate**. OIG found that when enrollees appealed, plans reversed **36% of LTCH denials and 43% of IRF denials**, with individual-plan IRF overturn rates running as high as **86%**. A denial that the plan itself reverses the moment a human reviews it on appeal was, by the plan's own subsequent action, a denial of medically necessary care.

This is why the cohort's Accountability (ACC) scores sit at the floor alongside Equity. A high overturn rate is, in benchmark terms, a pure Accountability signal: it shows an institution that issues wrong decisions at scale and is corrected only when an outside party — the patient, the provider, an administrative-law judge — forces the correction. The accountability failure is structural, because the system relies on most patients *not* appealing. The benchmark reads an institution that is right only under external compulsion as failing the dimension, regardless of how the final, appealed number lands.

The cohort's own downgrade record reflects this. Humana's applied 2026-06-18 finding cites the OIG-documented denial rates explicitly. UnitedHealth Group's Critical-band position (10.2) reflects a longer trajectory in which a DOJ Medicare Advantage risk-score probe and coordinated multi-state attorney-general investigations raised the enforcement density around the same conduct. Cigna's 20.3 sits, by its own scored record, just 0.3 of a point above the Critical line on a claim-denial and algorithmic-review profile. The bottom of this cohort is one adjudicated finding away from Critical.

---

## 5. The allegation line — where AI denials sit in the evidence tier

The cohort's most prominent public controversy is algorithmic. A class-action lawsuit alleges that UnitedHealth's naviHealth subsidiary used an AI model, **nH Predict**, to drive post-acute denials — and that the model's outputs were reversed on appeal at a rate the filing characterizes as roughly **90%**, with the suit alleging the plans continued to rely on it because only a small fraction of enrollees ever appeal. UnitedHealth has stated that the tool is a guide and not used to make coverage determinations.

The benchmark's evidence discipline governs how this enters — or does not enter — the score. A federal judge has **dismissed five of the seven counts** in the suit while allowing the case to proceed. That makes the nH Predict claims a **live allegation, not an adjudicated finding**. Under the benchmark's allegation-versus-ruling rule, an open lawsuit raises enforcement-and-litigation density — it is part of the context that makes a Critical-band placement durable — but it is not itself scored as proven harm. The scored harms in this cohort rest on the OIG audit and the Senate investigation, which are documentary findings, not on the algorithm allegations, which are contested in court.

This distinction is the discipline that keeps the briefing citable. The reader should leave knowing exactly which claims are settled (the federal denial and overturn rates) and which are still being litigated (the AI-as-cause theory). The score does not need the latter to reach its conclusion; the audited denial gradient and the overturn rate are sufficient on their own.

---

## 6. Mapping the harm to the eight dimensions

The value of reading this cohort through the framework is that it shows the harm is not vague. It lands on four specific dimensions, in a specific order of severity:

| Dimension | What it measures | How the cohort fails it |
|-----------|------------------|--------------------------|
| **EQU — Equity** | Care directed first to greatest need, least power | The denial gradient is concentrated on post-acute services only the sickest need. EQU is the weakest dimension for all six payers (UnitedHealth 1.25, Cigna 1.5). |
| **ACT — Action** | The institution responds and delivers | The core product — prior authorization — is operationalized as a mechanism that *withholds* the response rather than delivering it. ACT sits at or below the midpoint for every member. |
| **ACC — Accountability** | Failures owned and corrected without external force | 36–86% of appealed denials are overturned: the institution is corrected only when compelled. ACC is tied-weakest for CVS (1.75) and UnitedHealth (1.125). |
| **INT — Integrity** | Stated values match actual conduct | Uniform member-first marketing against a documented care-withholding record. INT is below the midpoint for all six, and tied-weakest for Cigna, Centene, and Elevance. |

The framework's diagnostic claim is that these four are not independent here — they are one harm seen from four angles. The institution fails to serve the highest-need (EQU) by withholding its core response (ACT), declines to correct the resulting errors until forced (ACC), all while presenting itself as care-centered (INT). The other four dimensions — Awareness, Empathy, Boundaries, Systemic Thinking — are also depressed across the cohort, but they are consequences of the central pattern, not its source.

---

## Forward view — what would move this cohort

- **The Critical cusp.** Cigna (20.3) sits, by its own scored record, 0.3 of a point above the Critical line; CVS Health (25.6) and Elevance (30.0) are within a single adjudicated finding of it. An adjudicated claim-denial ruling, a mental-health-parity finding, or a False Claims Act resolution against any of them would be the kind of event that crosses the line. UnitedHealth (10.2) is already there.
- **The Functional cusp, from the other side.** Humana (40.6) holds the top of the cohort by 0.6 of a point. A single further adverse finding — another OIG cycle, a state enforcement action — would push the cohort's strongest member back below the Developing line and leave all six in the bottom two bands.
- **The nH Predict ruling.** Because the AI-denial suit is currently weighed as an allegation, its eventual resolution is the single highest-leverage event in the sector. An adverse adjudication would convert litigation density into a scored finding and would likely move not just UnitedHealth but the comparators that ran similar algorithmic-review programs. A dismissal would leave the audited denial record standing on its own.
- **The upgrade path is narrow and specific.** The dimensions that drag the cohort — EQU, ACC, INT — are precisely the ones that respond to verifiable, externally-audited change: published, disaggregated denial-and-overturn data; binding limits on prior authorization for post-acute care; and independent verification that denials are not concentrated on the highest-acuity patients. The fastest scored improvement available to any of these payers is to make the denial-and-appeal record transparent and to narrow it where the OIG audit shows it falls hardest.
- **What would falsify the read.** The thesis would weaken if a for-profit Medicare Advantage payer emerged whose audited denial gradient was *not* concentrated on post-acute care and whose overturn rate was low — i.e., a payer denying rarely and rarely being reversed. No member of the current cohort fits that description. Whether one can is the open empirical question the next OIG cycle will test.

---

## Sources

- **Canonical scores (ground truth):** `site/src/data/indexes/fortune-500.json` — published composites, bands, and full eight-dimension vectors for UnitedHealth Group (10.2), Humana (40.6), Centene (32.8), Elevance Health (30.0), CVS Health (25.6), and Cigna (20.3). Each composite was reconciled against the canonical formula in `site/scripts/lib/scoring.mjs` (`computeCompositeFromDimensions`; band thresholds Critical 0–20, Developing 21–40, Functional 41–60) and matches to the published value; Humana's 40.6 sits 0.6 above the Functional floor.
- **Scored-event record:** `site/public/data/history/{humana,unitedhealth-group,cigna,cvs-health,elevance-health}.json` — Humana's 2026-06-18 downgrade (51.6 → 40.6, Δ −11.0) on the OIG-documented denial rates; UnitedHealth's Critical-band trajectory under the DOJ MA risk-score probe and coordinated AG investigations; Cigna's scored note that 20.3 sits 0.3 points above the Critical line; Elevance's DOJ Medicare Advantage False Claims deposition.
- **HHS Office of Inspector General (11 June 2026), "The Three Largest Medicare Advantage Organizations Denied Requests for Long-Term Acute Care and Inpatient Rehabilitation at Some of the Highest Rates":** denial rates (CVS LTCH 80%, Humana LTCH 72% / IRF 54%, UnitedHealth LTCH 71% / IRF 66%; all-plan LTCH 65% / IRF 54%) and appeal-overturn rates (LTCH 36%, IRF 43%, individual-plan IRF up to 86%). <https://oig.hhs.gov/reports/all/2026/the-three-largest-medicare-advantage-organizations-denied-requests-for-long-term-acute-care-and-inpatient-rehabilitation-at-some-of-the-highest-rates/>. Corroborating coverage: AHA News <https://www.aha.org/news/headline/2026-06-11-hhs-oig-reports-highlight-ma-insurer-denials-long-term-care-rehab-services-and-snf-admissions>; Healthcare Dive <https://www.healthcaredive.com/news/medicare-advantage-prior-authorization-denials-hhs-oig-post-acute-care/822724/>.
- **Senate Permanent Subcommittee on Investigations, majority-staff report on Medicare Advantage prior authorization and post-acute denials:** documented 2019–2022 rise in post-acute denials at UnitedHealthcare, Humana, and CVS; Humana post-acute denial rate ~16x its overall rate. <https://www.blumenthal.senate.gov/newsroom/press/release/senate-permanent-subcommittee-on-investigations-releases-majority-staff-report-exposing-medicare-advantage-insurers-refusal-of-care-for-vulnerable-seniors>; Healthcare Dive <https://www.healthcaredive.com/news/medicare-advantage-AI-denials-cvs-humana-unitedhealthcare-senate-report/730383/>.
- **nH Predict / naviHealth class action (allegation, not adjudication):** federal judge dismissed five of seven counts while allowing the case to proceed; filing alleges ~90% appeal-reversal rate and reliance on low appeal participation; UnitedHealth states the tool does not make coverage determinations. STAT <https://www.statnews.com/2023/11/14/unitedhealth-class-action-lawsuit-algorithm-medicare-advantage/>; Healthcare Finance News <https://www.healthcarefinancenews.com/news/class-action-lawsuit-against-unitedhealths-ai-claim-denials-advances>. Used solely to characterize the live allegation and to fix the allegation-versus-ruling line; not scored as proven harm.
