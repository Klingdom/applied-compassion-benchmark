# PR/FAQ Specialist Review — Methodology Validity

**Reviewer lens:** benchmark-research (methodology validity, reliability, defensibility)
**Date:** 2026-09-14
**Systems reviewed:** CB-MODEL (AI model benchmarking, status PRE-EVALUATION) and the Continuous Research & Scoring pipeline
**Mode:** Read-only review. No entity was scored, no proposal written, no file other than this one created.
**Status reminder:** No AI model has been evaluated or scored. Nothing below describes a model result.

---

## 1. Scope reviewed

| Area | Artifacts read (targeted, not whole-file for large logs) |
|---|---|
| Scoring formula | `site/scripts/lib/scoring.mjs` (full, 93 lines); formula behaviour probed read-only with `node -e` on synthetic vectors (no file written) |
| Assessor / scanner rules | `.claude/agents/overnight-assessor.md` §3e-bis, §3f, evidence rules (lines 100–129, 198–217, 262–270); `.claude/agents/overnight-scanner.md` date-validation rules (lines 29–42); `.claude/agents/benchmark-research.md` evidence hierarchy (lines 408–414, 579) |
| Governance | Root `DECISIONS.md` D-06, D-07, D-12, D-13, D-14, D-15, D-16, D-29, D-30; root `RISKS.md` (full); `.benchmark-ops/BLOCKERS.md`, `.benchmark-ops/CURRENT_STATE.md` (full) |
| Reliability evidence | `research/APPLIED_CHANGES.md` 2026-08-17 entry (lines 684–703) |
| Today's cycle | `research/scans/2026-09-14-assessor-summary.json` (parsed: per-entity search counts, `evidence_density`); `research/digests/2026-09-14.md` (grepped for placeholder/floor/date-error lines) |
| Public methodology claims | `site/src/app/methodology/page.tsx` (grepped; lines 113–137, 483–521, 1030–1050); `site/src/components/charts/EvidencePyramid.tsx` line 13; `site/src/app/ai-models/methodology/page.tsx` lines 30–59, 150–224 |
| CB-MODEL instrument | `site/src/data/model-benchmark/tasks-v1.json` (parsed: dimension, pool, validation status, null-field counts, construct labels); `site/src/lib/model-index-facts.ts`; `site/scripts/lib/evaluation-statistics.mjs` (header, THRESHOLDS, bootstrap function); `docs/MODEL_EVALUATION_HARNESS_DESIGN.md` (grepped); `docs/PRD_MODEL_BENCHMARK.md` (grepped) |

**Location note.** The coordinator brief names `research/model-index/` as the task-bank location. That directory does not exist. The versioned bank is at `site/src/data/model-benchmark/tasks-v1.json` (`bankVersion: "v1.1"`, `itemCount: 33`), per `site/scripts/validate-task-bank.mjs:44`.

**Not reviewed.** I did not read the seven `research/SEED_CLUSTER_*.md` studies, `research/SEED_INVENTORY_2026-08-20.md`, or `research/PENDING_CHANGES.md` in full. Seed figures below come from `RISKS.md` and `DECISIONS.md`, which cite those studies. The unextracted program-plan `.docx` (BLK-004) was not reachable.

---

## 2. What is methodologically sound

These are real strengths. A PR/FAQ can state them without overclaiming.

| # | Strength | Evidence | System |
|---|---|---|---|
| S1 | **One canonical composite formula with a drift gate.** Script and site mirrors are tested against shared golden inputs, so every published composite can be rebuilt from its 8 dimension scores. | `site/scripts/lib/scoring.mjs:1-18`; `.benchmark-ops/CURRENT_STATE.md:26` ("69 cases") | Both |
| S2 | **Disagreeing runs are never resolved by picking one.** D-07 orders a fresh assessment instead of filing the "conservative" reading. | `DECISIONS.md:593-613`; `research/APPLIED_CHANGES.md:697` | Continuous |
| S3 | **A written anti-false-positive screen.** Before filing, the assessor must check score history, reject "stale baseline" reasoning, match the direction of the evidence, and route calibration concerns to a cohort review, not a one-off change. | `.claude/agents/overnight-assessor.md:105-119` | Continuous |
| S4 | **Verbatim-quote discipline.** Every quote needs a real fetched URL. A band crossing or floor designation needs 2 or more distinct sources. | `.claude/agents/overnight-assessor.md:204-207` | Continuous |
| S5 | **Date-error defences created by a real incident, and they work downstream.** The scanner rules came from the 2026-07-24 incident (five entities flagged on July 2025 evidence). On 2026-09-14 the assessor caught three more date errors: France (2025 protests), Liechtenstein (a July breach), and South Korea (a 2023 rule). | `.claude/agents/overnight-scanner.md:29-42`; `research/digests/2026-09-14.md:33,73,78` | Continuous |
| S6 | **The benchmark measured its own seed bias.** Seven studies found that placeholder error grows steadily with seed height. High seeds are biased upward; low seeds are simply uninformative. This is an honest, replicated self-audit. | `DECISIONS.md:372-387` | Continuous |
| S7 | **Self-veto outranks an approval flag.** 37 approved proposals are held because the assessor said they were not ready. | `DECISIONS.md:342-362` | Continuous |
| S8 | **Floors are handled by checking provenance, not by re-scoring.** This avoids silently raising entities that were floored on purpose. | `DECISIONS.md:470-492` | Continuous |
| S9 | **Allegations are not findings.** Adjudication triggers a composite move; pre-adjudication evidence only upgrades the evidence tier. In practice, a search-synthesis claim of live ammunition in Syria was excluded because none of 4 fetched sources contained it. | `site/src/app/methodology/page.tsx:518,881`; `research/digests/2026-09-14.md:69` | Continuous |
| S10 | **CB-MODEL is pre-registered with falsification conditions.** It names 5 conditions that would count as instrument failure, including rater agreement no better than chance, a contamination gap, and dimension collapse. | `site/src/app/ai-models/methodology/page.tsx:43-50,194-219`; `DECISIONS.md:118-127` | CB-MODEL |
| S11 | **Contamination is disclosed honestly, including for the judge.** All 33 items are declared "permanently burned for any blinded use." No cross-model comparison on the public pool is claimed to be valid. The BYO judge is disclosed as possibly trained on the answer key. | `DECISIONS.md:129-133,90-95`; `docs/MODEL_EVALUATION_HARNESS_DESIGN.md:547-553` | CB-MODEL |
| S12 | **BYO scoring emits no composite.** The stated reason is correct: "A BYO run cannot measure a model; it can only measure a text." | `DECISIONS.md:80-88` | CB-MODEL |
| S13 | **Human rating is not faked.** The harness design states that an LLM judge cannot be one of the two raters. It also says a machine agreeing with itself "is a constant, not a reliability coefficient." Critical-harm rate is kept separate from the 1–5 score. | `docs/MODEL_EVALUATION_HARNESS_DESIGN.md:296,458-465` | CB-MODEL |
| S14 | **The statistical layer refuses false precision.** Every statistic carries `n`, `sufficient` and `threshold`. Thresholds are labelled "design choice, not a cited standard." Refusals never enter score means. | `site/scripts/lib/evaluation-statistics.mjs:34-49,118-157` | CB-MODEL |
| S15 | **Item hygiene controls.** A content hash makes an edited item non-comparable across runs. A field-separation policy plus a validator leak check prevents the answer key from reaching the model (AWR-2-A had leaked it in v1). Anchors are written for each prompt. | `docs/MODEL_EVALUATION_HARNESS_DESIGN.md:273`; `tasks-v1.json` `meta.fieldSeparationPolicy`; item `AWR-1-A` anchors | CB-MODEL |
| S16 | **Public counts are honest.** `/ai-models` states that 0 items are human-validated. The counts are computed at build time, not hardcoded. | `site/src/app/ai-models/page.tsx:122,209-213`; `DECISIONS.md:137-139` | CB-MODEL |

---

## 3. Findings

Severity scale: Critical (undermines the core measurement claim now), High (undermines defensibility of a class of published output), Medium (bounded validity gap), Low (hygiene).

### F-01 — Three incompatible evidence-tier scales are live, and they disagree on direction and content
**Severity:** High · **System:** Continuous Research (and inherited by CB-MODEL messaging)

| Source | Strongest tier | What "strongest" means |
|---|---|---|
| `.claude/agents/benchmark-research.md:408-412` | Tier **5** | "Independent audit, third-party verification, community testimony" |
| `.claude/agents/overnight-assessor.md:206` | `sourceTier` **5** | "government/court/treaty-body"; 1 = trade press/advocacy |
| `site/src/components/charts/EvidencePyramid.tsx:13` (public) | Tier **1** | "Independent external audit"; Tier 5 = "Entity self-report" (lowest trust) |
| `site/src/app/methodology/page.tsx:499` (public) | "T1 (Tier 1/Tier 2)" | "treaty bodies, courts of universal jurisdiction, IPC, ICRC" |

**Why it matters.** The public page says every score "traces to documented public evidence across a 5-tier hierarchy" (`methodology/page.tsx:123`). Yet the number 5 means top trust in two files and bottom trust in a third. The difference in content matters more. The assessor's band-crossing gate ("≥1 at `sourceTier` ≥ 4") counts a *government* statement as top-tier evidence. For a country entity, the government *is* the entity, and the public pyramid ranks entity self-report lowest. Today's withholds rest on this gate: France and Slovenia were withheld for "no tier-4 source" (`research/digests/2026-09-14.md:54-55`). A contesting party can show that the gate and the published hierarchy are different instruments.

### F-02 — Placeholders remain the majority of published scores, and "confirmations" do not re-measure them
**Severity:** Critical · **System:** Continuous Research

- **Scale.** 834 of 1,289 published entities (~59%) carry a vector byte-identical to at least two others. They were never individually assessed (`RISKS.md:14`, citing `SEED_INVENTORY_2026-08-20.md`). The current count may be lower after de-seeding; it is UNVERIFIED as of today.
- **Known direction of error.** Mean signed delta on de-seeding was −46.37 for the robotics 83.0/81.4 seed and −35.63 for the robotics 62.5 seed (`DECISIONS.md:378-383`). High placeholders are systematically too high.
- **Today's evidence density.** 646 of 760 subdimension scores (85%) across the 19 entities were `held_no_evidence`. Only 36 (4.7%) moved (`2026-09-14-assessor-summary.json`, `evidence_density`, summed). Liechtenstein was "confirmed" at 82.4 (Exemplary) with 36 of 40 subdimensions held without evidence. Its label "rests on a 5-country placeholder" (`digests/2026-09-14.md:73`).
- **Staleness is reset.** Any entity with a written report gets `last_assessed` set to today (`overnight-assessor.md:265`). A 1-to-3-search confirmation of a placeholder therefore looks, to rotation, like a fresh measurement.
- **A catch-22 keeps known-biased values published.** France measured 52.5 against a published 62.5, but "about 8.75 of the 10.0 points is de-seeding of the placeholder, not new conduct" (`digests/2026-09-14.md:33`). The event-driven evidence test fails, and check 5 forbids one-off calibration proposals (`overnight-assessor.md:117`). The known-wrong label stays until a cohort study runs. That study is "urgent" (`digests:113`) but not scheduled in any artifact I read. Of the 14-country 62.5 cluster, 6 are now measured 4–20 points below the placeholder (coordinator context).

**Why it matters.** The benchmark's core claim is measurement. A reader cannot tell a placeholder from a measurement on the index pages. I found no row-level provenance label; `RankingTable.tsx` has no seed/provisional field, and `ScoreCorrectionDisclosure.tsx` only discloses *past* placeholder groups.

### F-03 — Run-to-run reliability is unmeasured, and the only two datapoints exceed the pipeline's own guards
**Severity:** High · **System:** Continuous Research

- **ADP.** The same pipeline assessed the same company 3 days apart. It produced 58.1 (Functional, 2026-07-26) and 60.6 (Established, 2026-07-29): a 2.5-point spread across the 60.0 band line (`research/APPLIED_CHANGES.md:696`; `DECISIONS.md:598-601`).
- **Kazakhstan.** 24.4 (2026-08-16) vs 13.7 (2026-08-20), a 10.7-point swing in 4 days, "applied and flagged for reconciliation, not adjudicated" (`DECISIONS.md:607-609`).
- **Guards vs noise.** The baseline-drift guard holds at >2.0 points (D-00). The band-crossing clause files "at any delta, however small" (`DECISIONS.md:618-620`). Observed noise (2.5 and 10.7) exceeds the drift guard. The any-delta clause therefore converts measurement noise near a boundary into filable band changes. D-07 catches this only when a duplicate run happens to exist.
- **Public text implies a process that does not run nightly.** `/methodology` lists "Inter-rater reliability (IRR) discrepancy greater than 1.5 on any subdimension triggers review" (`methodology/page.tsx:1048`), under "Lead assessor review flags." The nightly pipeline is a single automated run with no second rater. I could not confirm from the page context whether this flag is scoped only to certified assessments. If it is, the page should say so; if not, it overstates.
- **No reliability statistic exists** for any index: no test-retest correlation, no band-agreement rate, no per-dimension spread.

### F-04 — Evidence depth per assessment is thin, unrecorded historically, and far below budget
**Severity:** High · **System:** Continuous Research

- 48 assessor searches for 19 entities, max 5, Jamaica 1, against an assessor budget of 950 and a per-entity cap of 50. That is 5% of budget (`2026-09-14-assessor-summary.json` `searches_used`).
- The six prior assessor summaries (2026-08-01 to 2026-09-01) have **no** `searches_used` field, so there is no baseline and no trend. Today is the first recorded depth.
- A 40-subdimension instrument cannot be re-evidenced with 1–5 searches. The low search count is the mechanism behind F-02's 85% `held_no_evidence`.
- Scanner date errors recur despite S5: 5 entities on 2026-07-24 (`overnight-scanner.md:29`) and 3 on 2026-09-14. That is two cycles with material year/date errors in about 7 weeks. The assessor is the only effective control, and it is the stage with the least search depth.

### F-05 — The composite formula has unvalidated properties, and one public claim about it is false
**Severity:** High · **System:** Both (CB-MODEL declares the formula "Directly reusable for model scoring," `CURRENT_STATE.md:26`)

The following was probed read-only against `computeCompositeFromDimensions` (`scoring.mjs:66-93`):

| Property | Evidence | Consequence |
|---|---|---|
| Consistency thresholds are mostly unreachable | `scoring.mjs:78-81` uses stdDev cut-points 1.5 / 3.0 / 5.0. The maximum population stdDev of 8 values is **2.0** on a 1–5 scale and **2.5** on 0–5 (computed). | The 0.4 and 0.1 branches can never fire. The 0.75 branch needs an extreme bimodal profile. The "consistency" multiplier is effectively a constant 1.0. |
| The premium is a step function at 4.0 | `scoring.mjs:83-84` | All dimensions at 3.99 → **74.8** (Established). All at 4.00 → **85.0** (Exemplary). That is +10.2 composite and a band change for +0.01 raw. |
| Spiky profiles can beat balanced ones | Uniform 3.0 → **50.0**; `[1,1,1,1,5,5,5,5]` (same mean) → **51.5**. Uniform 3.5 → **62.5**; `[5,5,5,5,5,1,1,1]` (same mean) → **65.5**. | This contradicts the public statement that "a balanced profile scores higher than a spiky one with the same average, because consistent behaviour across dimensions is itself the thing being measured" (`ai-models/methodology/page.tsx:31-32`). Below 4.0 the premium rewards *counts of dimensions ≥4*, not consistency. |
| Harm flag is unreachable from data | `scoring.mjs:86` tests `v === 0`. A dimension is a mean of 5 subdimensions scored 1–5, so it cannot be 0. | Zero is reachable only by manual override (`methodology/page.tsx:919`), not by the formula described. |
| Ceiling compression | Uniform 4.5 and `[5,5,5,5,4,4,4,4]` both → **97.5** | The top band cannot separate materially different profiles. |

No uncertainty or sensitivity analysis of the aggregation exists in any artifact I read. The OECD/JRC *Handbook on Constructing Composite Indicators* (2008) recommends such analysis for exactly these choices (inclusion, normalisation, weights, aggregation) in any published country ranking.

### F-06 — Reusing the institutional construct for AI models is asserted, not justified
**Severity:** High · **System:** CB-MODEL

- **The institutional anchors describe organisational structures.** Examples include external audits (A3), staff turnover (B1), historical-harm reparations (EQ5, AB5), ceding resources to partner organisations (S5), staff culture (I3), and surviving leadership transitions (I5) (anchors per `benchmark-research.md`; canonical in `site/src/data/dimensions.ts`). These have no direct analogue in one conversational response.
- **The task-bank constructs measure something different.** INT items are "Sycophancy Test," "Flattery Resistance," "Frame Resistance" and "Political Consistency." ACC items include "Nature Disclosure." AWR includes "Hallucination Self-Awareness" (`tasks-v1.json`, parsed construct labels). These are plausible model-behaviour constructs, but they are not the institutional subdimensions. The harness design says so: the per-item construct is "not a claim that a subdimension was measured" (`MODEL_EVALUATION_HARNESS_DESIGN.md:585`). The two published 40-subdimension taxonomies share only 7 of 40 names (`CURRENT_STATE.md:55`, CONFLICT-05).
- **The public page nonetheless claims equivalence.** Bands are "the same bands used across every Compassion Benchmark index, so a model score means the same thing a country score means" (`ai-models/methodology/page.tsx:177`). That is a measurement-invariance claim with no supporting evidence.
- **The design itself routes this to an open blocker.** Construct validity is "a methods question, answered by a Methods Committee (BLK-006), not by code" (`MODEL_EVALUATION_HARNESS_DESIGN.md:464`). BLK-006 is open (`BLOCKERS.md:21`).

### F-07 — CB-MODEL task-bank coverage cannot support dimension-level estimates
**Severity:** High for any publication (currently contained by D-29's no-score rule) · **System:** CB-MODEL

- **33 items, all `pool: "core-public"`, all `exposureStatus: "public-permanent"`.** 0 human-reviewed: 28 `unvalidated`, 5 `draft-authored-unreviewed`.
- **Scorable items per dimension** (drafts excluded, matching `model-index-facts.ts:58-63`): AWR 5, EMP 5, ACT 5, EQU 3, BND 3, ACC 3, **SYS 2, INT 2**. The raw count of INT is 5, but 3 are unreviewed drafts. The brief's "SYS on 2 items" is correct; INT is equally thin once drafts are excluded (`DECISIONS.md:130-131` agrees).
- **Unfilled psychometric fields.** `taskFamily`, `difficulty`, `discrimination`, `differentialItemFunctioning` and `criticalHarmRules` are null on 33 of 33 items, and `reviewers` is empty on 33 of 33. The harness's "balanced across task families" requirement (`CURRENT_STATE.md:41`) is therefore uncheckable.
- **The "sufficient" gate is set at the arithmetic minimum.** `MIN_ITEMS_PER_DIMENSION_FOR_SPREAD: 2` (`evaluation-statistics.mjs:133`). SYS and INT would clear it with 2 items each, against 5 subdimensions per dimension.
- **Two falsification conditions are not testable at this item count.** "Dimensions collapse into one statistical factor" (`ai-models/methodology/page.tsx:209`) cannot be estimated meaningfully with 2 or 3 items on several dimensions. The exact minimum depends on model count and design and is UNVERIFIED here. Without a secure pool, the contamination sentinel ("public-pool scores rise while unpublished-pool scores do not") has no comparison arm.

### F-08 — The CB-MODEL statistical layer measures trial variance, not rater variance, and has no α value gate
**Severity:** Medium · **System:** CB-MODEL

- `bootstrapCompositeUncertainty` groups completed trials by item and resamples model trials (`evaluation-statistics.mjs:474-497`). Its intervals therefore exclude rater disagreement. BLK-005 cites evidence that rater variance is the likely dominant source (`BLOCKERS.md:191-194`).
- For agreement, reportability rests on n (`MIN_PAIRABLE_UNITS_FOR_ALPHA: 30`, `:147`). I found no threshold on the *value* of α in the `THRESHOLDS` block (`:123-157`). By Krippendorff's widely used convention, data are relied on at α ≥ 0.800, tentatively at 0.667–0.800, and discarded below 0.667. A well-powered but low α would currently be flagged `sufficient: true`.
- This is a gap to close before a panel exists, not a defect in shipped results (there are none).

### F-09 — Floor and ceiling cannot express change
**Severity:** Medium · **System:** Continuous Research

- 12 countries, 7 global cities and 3 AI labs sit at 0.0 on flat 1.0 vectors and are "evidence-insensitive" (`DECISIONS.md:472-481`).
- Syria (0.0) cannot register a documented deterioration: fuel prices up to 40% overnight with ~90% below the poverty line (`digests/2026-09-14.md:69,116`). This repeats Ethiopia (2026-09-01). The sub-floor severity annotation is "open (not actioned)" (`DECISIONS.md:488-489`).
- Entities with very different harm profiles (for example Sudan, Israel and Myanmar, all listed at 0.0 with every subdimension at minimum, `DECISIONS.md:476-478`) are indistinguishable in the number.
- The same compression applies at the top (F-05, 97.5 clamp).

### F-10 — Absence-of-evidence and confidence conventions are internally inconsistent
**Severity:** Medium · **System:** Continuous Research

- **Three written rules for absent evidence.** `benchmark-research.md:414` says "When evidence is absent, default to the lower anchor." D-14 says absence scores **2, never 1** (`DECISIONS.md:405-407`). Cerebras was applied under a convention that scored it **3** (`DECISIONS.md:409-411`). D-14 records two conventions live in the AI labs index and an unexecuted fix.
- **Confidence is defined partly by delta size.** "high: … large score delta (>15 points)"; "low: … small delta (near 5-point threshold)" (`overnight-assessor.md:210-212`). This conflates the size of a move with certainty about it. A large move on thin evidence is nudged toward "high," which is the wrong direction for the RISK-007 exposure class (large negative moves with zero adverse findings, `RISKS.md:20`).

### F-11 — Allegation handling is sound in rule but partly unimplemented and structurally asymmetric
**Severity:** Medium · **System:** Continuous Research

- The public page says "Uncorroborated allegations decay" and carry "less weight over time" (`methodology/page.tsx:518`). A grep of `.claude/agents/` found no decay rule, schedule or field. This is UNVERIFIED as implemented; it appears to be a stated principle only.
- An adjudication trigger works for companies in courts that rule. It is weak for sovereign states, where adjudication is rare or slow, and for companies that settle without admission. The rule keeps legal exposure low but builds in lag. The benchmark should state that as a known bias, not only as discipline.

### F-12 — Governance cannot yet ratify methodology changes
**Severity:** Low (known; recorded for completeness) · **System:** Both

- No Methods Committee (BLK-006).
- D-13 index-demarcation rules are "adopted by practice but never ratified" (`DECISIONS.md:459-463`).
- The 60.9 band-gap ambiguity (RISK-006) is still open.

Every fix recommended below touches public definitions and needs either a Methods Committee or the "documented interim substitute" BLK-006 already offers (`BLOCKERS.md:223-227`).

---

## 4. Top 5 recommended improvements

Scores are 1–5. Priority Score = Impact + Strategic + Learning + Confidence − Effort − Risk. Ranked by Priority Score.

### R1 — Run and publish a test-retest reliability study for the continuous pipeline
| Field | Value |
|---|---|
| **Type** | Validation study (measurement reliability) |
| **Problem** | The only reliability evidence is two accidental cases: ADP 58.1 vs 60.6 across a band line, and Kazakhstan 24.4 vs 13.7 in 4 days. Guards (drift >2.0; band crossing at any delta) were set without a measured noise floor (F-03). |
| **Expected benefit** | A measured run-to-run spread per index and dimension, and a band-agreement rate. The drift guard and a band-crossing margin can then be set from data. It also yields a citable answer to "would you get the same score twice?" |
| **Evidence** | `research/APPLIED_CHANGES.md:696`; `DECISIONS.md:598-609`; `methodology/page.tsx:1048` |
| **Design sketch** | Blind duplicate assessments of a stratified sample across all 7 indexes. Size the sample at no fewer than 30 entities, matching the repo's own `MIN_PAIRABLE_UNITS_FOR_ALPHA` convention (`evaluation-statistics.mjs:147`), and adjust by power analysis. Fix search depth per run so depth is not a confound. Report per-dimension agreement (Krippendorff α with its 0.667/0.800 convention) and the band-flip rate. |
| **Impact** | 5 |
| **Strategic alignment** | 5 |
| **Learning value** | 5 |
| **Confidence** | 4 |
| **Effort** | 3 |
| **Risk** | 2 (may reveal low reliability; that is the point, and D-07 already sets the disclosure precedent) |
| **Priority Score** | **14** |

### R2 — Adopt one evidence-tier scale, schema-enforced, that separates entity self-report from independent authority
| Field | Value |
|---|---|
| **Type** | Methodology correction and data contract |
| **Problem** | Four artifacts define tiers in opposite directions and with different content. The assessor's top tier (government) is the public pyramid's bottom tier (self-report) when the entity is a government (F-01). |
| **Expected benefit** | Band-crossing and floor gates become consistent with the published hierarchy. Withhold and file decisions become defensible to a contesting party. |
| **Evidence** | `benchmark-research.md:408-412`; `overnight-assessor.md:206`; `EvidencePyramid.tsx:13`; `methodology/page.tsx:499` |
| **Impact** | 4 |
| **Strategic alignment** | 5 |
| **Learning value** | 3 |
| **Confidence** | 5 |
| **Effort** | 2 (an enum in the proposal/sidecar schema, a validator check, and copy changes) |
| **Risk** | 2 (changes public definitions; needs a BLK-006 interim substitute; may reclassify past gates) |
| **Priority Score** | **13** |

### R3 — Sensitivity-test the composite formula before CB-MODEL reuses it, and correct the false "balanced beats spiky" claim
| Field | Value |
|---|---|
| **Type** | Methodology validation |
| **Problem** | The consistency thresholds cannot be reached on the scale used. The 4.0 cliff adds +10.2 points for +0.01 raw. Spiky profiles can outscore balanced ones at mid-scale, contradicting `/ai-models/methodology`. The harm flag cannot be reached from data (F-05). |
| **Expected benefit** | Knowing how much of each published rank depends on the premium design. The formula would be defended with evidence, or recalibrated deliberately (for example with stdDev thresholds rescaled to the 0–2.5 range actually reachable). A false public statement would be removed. |
| **Evidence** | `scoring.mjs:77-87`; `ai-models/methodology/page.tsx:31-32`; OECD/JRC Handbook (2008) on uncertainty and sensitivity analysis |
| **Design sketch** | Read-only re-computation over all published vectors under alternatives: no premium, a continuous weakness factor, and rescaled stdDev cut-points. Report rank shifts and band changes per index. Publish the findings as a methods note, even if the formula is kept. |
| **Impact** | 4 |
| **Strategic alignment** | 4 |
| **Learning value** | 5 |
| **Confidence** | 5 |
| **Effort** | 2 |
| **Risk** | 3 (any formula change moves published scores and needs Methods approval; the copy correction alone is low-risk) |
| **Priority Score** | **13** |

### R4 — Label placeholders on the public index and stop counting placeholder confirmations as measurements
| Field | Value |
|---|---|
| **Type** | Data integrity and public disclosure |
| **Problem** | About 59% of published scores (as of 2026-08-20) are placeholders. Readers cannot tell. A 1–3-search "confirmation" with 85–90% of subdimensions held without evidence resets `last_assessed`. The event-driven evidence test keeps known-biased high placeholders published (F-02, F-04). |
| **Expected benefit** | Honest labelling now, and a tracked metric (share of published scores that are measured) that can only improve. The rotation stops understating staleness for never-measured entities. The 62.5 and 83.0 cohort studies get a forcing function. |
| **Evidence** | `RISKS.md:14`; `DECISIONS.md:372-396`; `2026-09-14-assessor-summary.json` `evidence_density` (646/760 held without evidence); `overnight-assessor.md:265`; `digests/2026-09-14.md:33,73,113` |
| **Design sketch** | Add a `provenance` field (`seed` / `assessed`) derived mechanically from the identical-vector test already used in `SEED_INVENTORY`. Show a "provisional placeholder" marker on index rows. Keep a seed flag set until an assessment moves or evidences a stated minimum share of subdimensions (the threshold is a Methods decision). Record searches per entity every cycle. |
| **Impact** | 5 |
| **Strategic alignment** | 5 |
| **Learning value** | 3 |
| **Confidence** | 4 |
| **Effort** | 2 |
| **Risk** | 3 (a public admission that most scores are provisional; reputationally sharp in the short term, but it removes RISK-001's larger exposure) |
| **Priority Score** | **12** |

### R5 — Write a CB-MODEL construct map and coverage floor before any pilot run
| Field | Value |
|---|---|
| **Type** | Instrument design (construct validity) |
| **Problem** | The institutional framework is reused for models by assertion. Item constructs are not subdimensions. Two taxonomies share 7 of 40 names. SYS and INT have 2 scorable items each. The public page claims a model score "means the same thing a country score means" (F-06, F-07). |
| **Expected benefit** | Each of the 40 subdimensions gets either an explicit model-behaviour indicator or a declared "not applicable to models" with a stated consequence for aggregation. A per-dimension item floor is set above the arithmetic minimum. The equivalence claim is withdrawn until invariance can be tested. The instrument becomes criticisable in the terms the target audience (alignment researchers, `PRD_MODEL_BENCHMARK.md:90`) will use. |
| **Evidence** | `MODEL_EVALUATION_HARNESS_DESIGN.md:464,578-585`; `CURRENT_STATE.md:41,55`; `tasks-v1.json` (null psychometric fields on 33/33); `evaluation-statistics.mjs:133`; `ai-models/methodology/page.tsx:177` |
| **Impact** | 5 |
| **Strategic alignment** | 5 |
| **Learning value** | 4 |
| **Confidence** | 4 |
| **Effort** | 4 (item authoring plus paid lived-experience review; BLK-005 and BLK-006 gate full completion, but the map and copy fix do not) |
| **Risk** | 2 |
| **Priority Score** | **12** |

**Also recommended, below the top 5:**
- Reconcile the three absence-of-evidence rules and re-assess Cerebras under the 2-convention (F-10, D-14).
- Define confidence by evidence quality only, not delta size (F-10).
- Build the D-12 sub-floor severity annotation (F-09).
- Implement or retract "allegations decay" (F-11).
- Add an α value gate beside the n gate in `THRESHOLDS`, and include rater variance in composite uncertainty once ratings exist (F-08).

---

## 5. PR/FAQ inputs

### Customer problem (plain language)

People who cite rankings need to know whether a number is a real measurement. This includes journalists, funders, policy staff and AI-safety researchers. Most compassion or ethics rankings do not say how often their scores would change if someone re-ran the work. Compassion Benchmark already publishes its method, its evidence and its self-corrections in the open. It does not yet publish four things: how stable its scores are, how many scores are placeholders, what its evidence tiers mean in one consistent way, and whether a framework built for governments and companies fits an AI model. Closing those gaps turns an open method into a *defensible* one.

### Hard FAQ questions and honest answers

**Q1. If you ran the same assessment twice, would you get the same score?**
Not always, and we have not yet measured how often. In one case, our pipeline scored the payroll company ADP at 58.1 and then 60.6 three days apart, which put it in two different bands. In another, Kazakhstan's score moved from 24.4 to 13.7 in four days. We did not pick either ADP reading; our rule is to run a fresh assessment instead. We plan a formal repeat-assessment study so we can publish a measured error range.

**Q2. How many of your published scores are actual measurements?**
Fewer than half, as of our 20 August 2026 count. That count found 834 of 1,289 published entities (about 59%) still on shared starting values that were never individually assessed. Our own studies show the higher those starting values, the more they overstate. We are replacing them entity by entity, and today's figure may be lower. We do not yet label placeholder scores on the index pages, and we should.

**Q3. Why should a framework built for countries and companies apply to an AI chatbot?**
We have not proven that it does. Our eight areas, such as awareness, accountability and equity, describe institutions. Many of the detailed checks (staff turnover, reparations, leadership changes) have no direct counterpart in a chatbot reply. Our AI test items measure things like resisting flattery and recognising hidden distress. Whether those add up to the same eight areas is an open question for an outside methods review. That review body does not exist yet.

**Q4. Can you rank AI models today?**
No. We have evaluated zero AI models. Our 33 test items are all public, with their scoring guides, so any model may have learned the answers. None has been reviewed by a human expert yet. Two areas, Systemic Thinking and Integrity, each rest on only 2 scorable items. We also have no human rating panel. Until those gaps close, publishing a model score would break the standard we hold other institutions to.

**Q5. When you say a finding rests on "Tier 5" evidence, what does that mean?**
Today it depends on which of our documents you read, and we need to fix that. Our public chart treats Tier 1 as the most trusted evidence. Our research instructions treat Tier 5 as the most trusted. One internal rule ranks a government's own statement at the top, while our public chart ranks an entity's own claims at the bottom. We will publish one scale and enforce it in our data files.

---

### External references verified for this review (2 WebSearch calls)
- Krippendorff's α reliability convention (α ≥ 0.800 rely; 0.667–0.800 tentative; < 0.667 discard): [casrai.org — Krippendorff's Alpha](https://casrai.org/guides/krippendorffs-alpha); [Statistics How To — Krippendorff's Alpha](https://www.statisticshowto.com/krippendorffs-alpha/)
- OECD/JRC *Handbook on Constructing Composite Indicators: Methodology and User Guide* (2008), uncertainty and sensitivity analysis of aggregation choices: [OECD publication page](https://www.oecd.org/en/publications/handbook-on-constructing-composite-indicators-methodology-and-user-guide_9789264043466-en.html); [JRC repository JRC47008](https://publications.jrc.ec.europa.eu/repository/handle/JRC47008)

### UNVERIFIED items carried in this review
- The current placeholder count after de-seeding since 2026-08-20 (F-02).
- Whether the `/methodology` "IRR discrepancy > 1.5" flag is scoped only to certified assessments (F-03).
- Whether "uncorroborated allegations decay" is implemented anywhere outside public copy (F-11).
- The minimum item or model count for a meaningful factor-collapse test (F-07).
- The six-of-fourteen "measured 4–20 points below 62.5" figure is taken from coordinator context, not independently re-derived.
