# Grant Proposal — Compassion Benchmark, One-Year Operating Support

> **DRAFT / TEST DOCUMENT — NOT SUBMITTED. Figures unaudited.**
> This is a working draft written for the founder to react to and correct. It has not been
> reviewed by an accountant, sent to any funder, or checked against any external tax or legal
> requirement. No figure in this document should be treated as final. Every claim traces to a
> file in this repository; where no file supports a number, the number is marked
> `[FOUNDER TO SUPPLY]` rather than invented.

---

## 1. Summary

Compassion Benchmark (compassionbenchmark.com) is asking for **$250,000 to fund one year of
operation**: continuing an independent benchmark that measures how governments, corporations, AI
labs, robotics labs, cities, and universities recognize, respond to, and reduce the suffering of
the people they affect — and finishing a self-discovered data-quality correction that is
currently the project's most important piece of unfinished work.

**The problem this money buys down is not "build a benchmark."** The benchmark already exists:
eight published indexes, roughly 1,327 scored entities (`site/src/data/indexes/*.json`
`entityCount` fields, summed), a 40-subdimension methodology, a nightly evidence pipeline, and
public daily briefings with cited primary sources going back months.

**The problem is that a majority of the entities in that benchmark, as of the last full count,
sat on a score that had never been individually measured.** `research/SEED_INVENTORY_2026-08-20.md`
documents that 834 of 1,289 published entities (roughly 59%) carried an 8-dimension score
byte-identical to at least two others in the same index — a placeholder inherited from an early
seeding process, not a measurement. The project found this defect in its own published data,
quantified it across seven independent replication studies, built and validated a method to
correct it, and has already cleared two of eight indexes (ai-labs and robotics-labs are
described in the inventory as "effectively finished"). This grant funds finishing the other six,
publishing two specific findings that are currently blocking further publication, and closing a
retraction-detection gap the project caught in its own workflow before it reached print.

**What the year buys, concretely:**
- De-seeding the remaining six indexes in the priority order the project has already published
  (`research/SEED_INVENTORY_2026-08-20.md` §6), starting with the highest-visibility placeholders
  (the four highest-ranked Fortune 500 companies, currently unmeasured; `SEED_INVENTORY` Tier 1).
- Publishing the disclosure-density and adverse-finding fields that two internal studies
  identified as a publication blocker before the current robotics additions can go fully live
  (`DECISIONS.md` D-21).
- Building the retraction-recheck step the project identified after catching one wrongly reported
  killing before publication (`site/src/data/updates/daily/2026-08-26.json`).
- Continuing to publish the corrections record in the open, including score movements the
  benchmark declined to publish on its own evidence bar (`research/PENDING_CHANGES.md`, Freetown
  and Abuja, §5 below).

**The ask is not "trust our rankings." It is "fund the year it takes to finish showing our work."**

---

## 2. The problem: institutions are measured on what they say, not on what happens to the people they affect

Every large public-facing accountability instrument — ESG scores, corporate sustainability
indices, CSR ratings — is built substantially from what an institution discloses about itself.
Compassion Benchmark's own evidence, produced in the course of routine assessment work rather
than as a designed experiment, shows that self-disclosure and compassion outcomes are related but
not the same thing, and that the difference is measurable.

**Finding 1 — of 14 subdimension scores that reached the top-but-one anchor (4 of 5) across two
completed robotics batches, not one came from a corporate sustainability report.** Every one came
from a state evaluation, an FDA record, a ClinicalTrials.gov registration, a multilateral
development bank's project record, or a statutory works council
(`research/INDEX_ADDITIONS_ROBOTICS_BATCH1_2026-08-20.md`: "Neither came from a corporate
sustainability report. That is now true of all fourteen scores of 4 across both batches.").

**Finding 2 — a $10.1bn public company can score lower than an $83M-raised private one, and the
gap is legible.** Intuition Robotics (Israel, ~$83M raised) scored 45.0 against Intuitive
Surgical's 38.7, despite Intuitive Surgical's 2025 revenue of $10.1bn, 11,100+ installed systems,
and a far larger compelled-disclosure record (FDA recalls, MAUDE adverse-event data, SEC filings,
a completed federal antitrust trial). The reason, documented directly: "Intuition Robotics is not
a regulated medical device company and tops the batch at 45.0, because a US state government
published three years of outcome data about its product" — specifically, a New York State Office
for the Aging outcome evaluation across three years and 834 enrolled older adults
(`research/INDEX_ADDITIONS_ROBOTICS_BATCH1_2026-08-20.md`).

Both findings point the same direction: **what an institution is compelled or chooses to have
independently examined predicts its score better than its size, its sector, or its own
disclosure volume alone** — and that relationship, once you can see it, is itself evidence the
instrument is measuring something real rather than reproducing a reputation industry. Section 5
below quantifies this relationship directly.

This is currently unmeasured by any comparable instrument for two of the benchmark's eight
indexes specifically: `site/src/data/special-briefings/what-the-product-is-for-2026-06-16.json`
states plainly that "Compassion Benchmark is the only institution that scores robotics labs on
harm accountability at all. There is no comparator index, no peer ranking, no external floor
designation" for entities like Ghost Robotics or Palantir AI. That claim is scoped explicitly to
the two technology indexes in that briefing's own text — it is not extended here to the other six
indexes, where established comparators (sustainability indices, press freedom indices, city
livability rankings) do exist.

---

## 3. What exists today

- **Eight published indexes** (`site/src/data/indexes/*.json`, `entityCount` field in each file):
  Fortune 500 (447), countries (193), global cities (250), U.S. cities (144), universities (100),
  robotics labs (92), AI labs (50), U.S. states (51). Sum: 1,327. The nightly research pipeline
  currently scans 1,331 tracked entities (`site/src/data/updates/daily/2026-08-26.json`,
  `pipeline.entitiesScanned`); the small difference is unresolved published-vs-tracked entities
  and is not material to this proposal.
- **One methodology across all eight indexes**: 8 dimensions (Awareness, Empathy, Action,
  Equity, Boundaries, Accountability, Systemic effect, Integrity — `site/src/data/dimensions.ts`),
  40 subdimensions, each scored on a 5-point anchored scale, aggregated into a 0–100 composite and
  a five-band label.
- **A nightly evidence pipeline**: scanner → assessor → digest, producing dated assessment
  reports (`research/assessments/**`), change proposals (`research/change-proposals/*.json`), and
  a public digest (`research/PENDING_CHANGES.md`). Every proposal cites a dated source with a
  source-tier rating.
- **Daily public briefings with source links**: `site/src/data/updates/daily/*.json`, each
  headline traceable to a cited primary source (government filings, court records, regulator
  actions, named news outlets with publication dates).
- **An independence policy, stated and operationally enforced**: "Entities never pay for
  inclusion, score changes, or suppression of findings. Commercial services support access,
  interpretation, and institutional use only" (`CLAUDE.md`). The Score-Watch alert product is
  built so the trigger is the research pipeline only — no commercial event can touch it
  (`docs/PRD_MONETIZATION.md` §2).
- **A live corrections record**: `research/APPLIED_CHANGES.md` and `research/PENDING_CHANGES.md`
  document every score change, every founder override of an assessor's routing recommendation,
  and — as described in Section 5 — every self-veto the benchmark's own process has issued
  against its own proposals.

---

## 4. What is wrong with it, stated plainly

**The headline defect.** `research/SEED_INVENTORY_2026-08-20.md`: of 1,289 published entities as
of 2026-08-20, **834 sat in identical-vector clusters** — an 8-dimension score byte-identical to
at least two other entities in the same index, meaning it was never individually assessed. Of
those, 75 already had a pending proposal awaiting founder approval (measured, not yet published);
**759 remained genuinely un-assessed**. Roughly **59% of the published corpus sat on a
placeholder**, including entities published in the two highest bands the benchmark issues
(`RISKS.md` RISK-001).

**This is a structural risk, not an episodic bug**, and the project's own risk register says so
in those words: "the benchmark's core claim is measurement; a majority-placeholder corpus
undercuts it directly" (`RISKS.md` RISK-001).

**Progress to date.** The de-seeding programme (`DECISIONS.md` D-15) has run seven completed
studies since 2026-08-16 and **cleared two of eight indexes**: ai-labs has 4 placeholder entities
remaining (3 of which are a separate, deliberate floor-designation question, not a seeding
question — see below); robotics-labs has 1 remaining
(`research/SEED_INVENTORY_2026-08-20.md` §Headline). The remaining six indexes — fortune-500,
countries, global-cities, us-cities, us-states, universities — still carry the bulk of the 759
un-assessed entities.

**What the studies found, and why it changes the priority order.** Seven completed studies
produced a replicated empirical rule (`research/SEED_INVENTORY_2026-08-20.md` §"The empirical
rule"; `DECISIONS.md` D-15):

| Seed value (dimension-mean) | Mean signed delta | Direction |
|---|---:|---|
| 20.3 countries (1.81) | −1.18 | 7 down, 5 up |
| ai-labs 35.9/32.8 (2.44) | −4.13 | 5 down, 2 up |
| robotics 48.4 (2.94) | −21.63 | 6 down |
| ai-labs 60.9/48.4 (3.19) | −22.73 | 15 down |
| robotics 60.9 (3.44) | −30.04 | 10 down |
| robotics 62.5 (3.50) | −35.63 | 3 down |
| robotics 83.0/81.4 (4.32) | −46.37 | 10 down |

**Seed error scales with seed height, monotonically.** High seeds are wrong in the same direction
for nearly every member, and the size of the error grows with the seed value. Low seeds are
*uninformative* rather than *biased* — the 20.3-seed countries study produced five upward movers
(Papua New Guinea +12.8, Uzbekistan +7.2, Honduras +6.6), and 3 of 12 countries in that study
moved up overall. This is why the priority order is **published claim at risk** (seed height ×
band-boundary proximity × rank visibility), not cluster size: a high seed is wrong for everyone
who holds it, and it is wrong in an amount that grows with how impressive the published claim
looks.

**A related, separately tracked defect: the composite-0.0 entities.** Twelve countries, seven
global-cities and three ai-labs sit at composite 0.0 on a flat minimum-anchor vector. Cluster
detection alone cannot tell a deliberate floor designation (Ghost Robotics, Palantir AI, and
xAI/Grok were floored on documented product-purpose and conduct grounds — see
`site/src/data/special-briefings/what-the-product-is-for-2026-06-16.json`) from an
un-assessed placeholder that happens to share the flat-minimum shape. The project's decision
(`DECISIONS.md` D-12) is to resolve these by provenance inspection, not re-scoring — re-scoring
risks *raising* entities that were floored on purpose. This is scoped explicitly as year-one work
below.

---

## 5. Method, and the evidence that it works

This section is the scientific core of the proposal: not "the benchmark is accurate" but "the
benchmark has a reproducible way of finding out where it isn't, and has tested that method."

**5.1 The seed-error rule replicates across seven independent studies, at different seed heights,
in different indexes, with a consistent shape** (table in §4). Where the *signed* mean delta and
the *absolute* mean delta coincide, the seed was biased — it was wrong in one direction for
almost everyone who held it. Where they diverge, the seed was merely uninformative — noise, not
bias. They diverged only at the two lowest seed values tested. This is a falsifiable,
quantified property of the defect, not an assertion about it.

**5.2 Seed height sets the magnitude of the error; entity type sets its direction — and the
project explicitly guards against confirmation bias by not predicting direction from seed value
alone.** A seed of 35.9 was a *floor* for Papua New Guinea (a state, +12.8) and a *ceiling* for a
small private robotics company in the same seed cluster (−9.02). Three of twelve countries in the
lowest-seed study moved up, one by +12.8, and the study's own framing states this broke a 2-for-2
downward pattern the prior studies had shown (`research/SEED_INVENTORY_2026-08-20.md` §"The
empirical rule," point 2; `DECISIONS.md` D-15). **Every completed study is required to carry an
explicit anti-confirmation-bias guard**, and the record shows it firing in both directions:
downward corrections are the majority, but upward corrections occur and are recorded when the
evidence supports them.

**5.3 Disclosure density correlates with composite score at −0.905, then −0.935 — and then
broke, informatively, to −0.741.** Across the first batch of 14 newly-assessed robotics entities,
absence-of-disclosure correlated with composite at **−0.905**
(`research/INDEX_ADDITIONS_ROBOTICS_BATCH1_2026-08-20.md`: "Publish more about your own effects,
score higher. That is the strongest single finding of this batch"). A second, independent batch
of 15 entities replicated and slightly strengthened it, at **−0.935**
(`research/INDEX_ADDITIONS_ROBOTICS_BATCH2_2026-08-23.md`). A third batch, in a more heavily
regulated cohort, **broke the pattern to −0.741**
(`research/INDEX_ADDITIONS_ROBOTICS_BATCH3_2026-08-23.md`) — and the reason is the finding, not a
flaw: **Globus Medical, a $2.9bn spine-surgery company, discloses extensively (one of the lowest
absence-shares in the batch, at 75%) and still lands at the exact floor of 25.0**, because its
disclosure includes an FDA warning letter documenting a harm-detection process that a regulator
found did not exist. **Dexterity, Inc., also at 25.0, is there because it discloses almost
nothing.** The composite alone cannot currently distinguish the two — logged as a publication
blocker (`DECISIONS.md` D-21; see §6 below) — but the fact that the correlation *breaks exactly
where a company that discloses a lot and was found wanting exists* is evidence the instrument
measures something beyond how much an entity chooses to say about itself.

**5.4 The benchmark's own discipline runs in both directions.** In the same overnight cycle that
produced the retraction catch below, the assessor **measured two upward band-crossings and
declined to file either**: Freetown, global-cities, published 18.8, measured 38.1 (+19.3,
Critical → Developing) — held because the supporting evidence describes a standing municipal
programme (Transform Freetown), not new within-window conduct, and the project's own screening
rule against exactly this kind of evidence-shopping applied. Abuja, published 18.8, measured 27.5
(+8.7, Critical → Developing) — held because the best available source cleared only tier 2, below
the bar the band-crossing filing rule requires
(`research/PENDING_CHANGES.md`, "Band Crossings Measured But Not Filed — 2026-08-26"). The
benchmark declined a measured upgrade on the same evidence bar it applies to a measured downgrade.

---

## 6. Work plan for the year

Organized quarterly around the seed inventory's own priority order
(`research/SEED_INVENTORY_2026-08-20.md` §6), with two named blockers carried forward from
Sections 4–5 as explicit deliverables.

### Q1 — Fix the blockers that gate everything else

1. **Fix the undocumented band-boundary ambiguity at composite 60.9** before de-seeding the
   17-entity fortune-500 cluster sitting on it. The methodology's own documentation states bands
   as `41–60 Functional`, `61–80 Established`; 60.9 falls in the undefined gap between them, and
   the code resolves it to Established with no documentation saying so
   (`research/SEED_INVENTORY_2026-08-20.md` §5; `RISKS.md` RISK-006).
2. **Ship the disclosure-density and adverse-finding fields** (`{ absence_based, evidence_based,
   absence_share }` plus a boolean or count `adverse_findings_located`) that two studies
   identified as required before the 43 robotics-labs additions from Batches 1–3 can go fully
   live (`DECISIONS.md` D-21). This is a schema and page-template change, not a re-assessment.
3. **Build the retraction-recheck step** the project identified after catching a wrongly
   reported killing in Peru before publication: "a source can pass every date check and still
   turn out to be wrong days later... a retraction re-check on any score-moving single-incident
   report, before a proposal is filed, would close this gap"
   (`site/src/data/updates/daily/2026-08-26.json`, methodology note; carried as an open flag in
   `research/PENDING_CHANGES.md` "Open Calibration Flags — 2026-08-26").

### Q1–Q2 — Tier 1: the highest published claims currently on a placeholder (42 entities)

- fortune-500, seed 92.4, Exemplary band, ranks 2–5 (4 entities) — the four highest-ranked
  companies in the flagship index, on a value never individually assessed.
- countries, seed 83.0, Exemplary band, ranks 6–10 (5 entities) — 2.0 points above the Exemplary
  cutoff; the equivalent robotics seed value fell −46.37 when de-seeded.
- fortune-500, seed 60.9, Established band, ranks 35–56 (17 entities) — 0.9 points above the
  boundary, the tightest margin in the benchmark.
- countries, seed 62.5, Established band (13 entities) and global-cities, seed 75.9, Established
  band (3 entities).

(`research/SEED_INVENTORY_2026-08-20.md` §"Priority order," Tier 1.)

### Q2 — Provenance inspection of the composite-0.0 entities (no re-scoring)

Resolve, entity by entity, why each of the 12 countries, 7 global-cities and 3 ai-labs at
composite 0.0 on a flat minimum vector was set there — deliberate floor designation (as with
Ghost Robotics, Palantir AI, xAI/Grok) versus placeholder artifact — without re-scoring any of
them as part of this pass (`DECISIONS.md` D-12; `research/SEED_INVENTORY_2026-08-20.md` §4).

### Q2–Q3 — Tier 2: large mid-band clusters, cross-index by seed value

fortune-500 48.4 (80 entities), fortune-500 35.9 (115), us-cities 35.9 (52), fortune-500 23.4
(38), global-cities 18.8 (29), fortune-500 25.0 (28), countries 35.9 (27). Run as one study per
seed value across indexes so a single evidentiary standard applies to all entities that share it
(`research/SEED_INVENTORY_2026-08-20.md` §"Priority order," Tier 2).

### Q3–Q4 — Tier 3: remaining low-seed entities, prioritized only near a band boundary

Everything at or below roughly seed 25. The seven-study rule found low seeds uninformative rather
than biased, so this tier is deliberately last (`research/SEED_INVENTORY_2026-08-20.md` §"Priority
order," Tier 3).

### Ongoing, all four quarters

- **Resolve D-14** (two live, conflicting scoring conventions for absence-of-disclosure inside
  the ai-labs index — Cerebras Systems was applied under a more lenient convention than every
  study since; `DECISIONS.md` D-14, unresolved) by re-assessing the one entity that needs it,
  as the source study itself recommends, rather than adjusting the 56 peers scored under the
  other convention (`RISKS.md` RISK-005).
- **Continue the entity-currency remediation already scoped but not executed**: 13 held
  proposals on defunct, merged, renamed, or duplicated entities (`AUTONOMY.md` §3; `RISKS.md`
  RISK-003).
- **Publish the corrections record as it happens**, including declined upgrades (Freetown,
  Abuja) and declined downgrades, on the same standing basis as Section 5.4 describes.
- **Independent methodology review** (see Budget) sits in Q3, after Tier 1 and the two blockers
  are complete, so the reviewer has a substantial completed body of de-seeded work to examine
  rather than a plan.

---

## 7. Budget — $250,000 / 12 months

Every line traces to a described cost driver in this repository. Where no repo file establishes
an actual dollar figure (staff pay, current hosting bill, prior grant history), the line is
marked `[FOUNDER TO SUPPLY]` rather than estimated as fact. **No salary figure is invented for
staff who do not exist** — the work today is founder-led with AI agent assistance
(`AUTONOMY.md`; every structural operation in `DECISIONS.md` and `INCIDENTS.md` is agent-executed
under founder approval), and the budget reflects that structure rather than a staffing plan the
project does not have.

| Line | Description | Est. annual cost | Basis |
|---|---:|---:|---|
| **Research compute and model API costs** | The dominant line. De-seeding is search-and-assessment intensive: each of the seven completed studies assessed a cohort ranging from 3 to 17 entities in a single run (`research/SEED_INVENTORY_2026-08-20.md` Tier 1 table), and each entity requires independent evidence-gathering across 40 subdimensions before a score can be assigned — the batch studies cite dozens of distinct primary sources per entity (regulator filings, court records, registries, press). Year one covers roughly 759 remaining un-assessed entities across six indexes plus provenance work on 22 floor entities. | **$150,000** `[estimate — no per-entity API billing figure exists in this repo; FOUNDER TO SUPPLY the actual per-entity compute cost once metered]` | Scale derived from `SEED_INVENTORY_2026-08-20.md`; unit cost not tracked anywhere in-repo |
| **Infrastructure** | Hostinger VPS (`DEPLOYMENT.md`), Cloudflare Worker for the Score-Watch webhook/badge/subscriber API (`worker/`, `worker/README.md`), domain registration, Let's Encrypt/Certbot TLS (free, but the VPS and domain are not) | `[FOUNDER TO SUPPLY — no dollar figure for the current Hostinger plan or domain renewal is recorded in this repo]` | `DEPLOYMENT.md`, `worker/wrangler.toml` |
| **Part-time human review of score changes before publication** | The founder currently reads every approved proposal before an apply, including 66 in one 2026-08-20 cycle alone, and holds any that carry a self-veto regardless of approval status (`AUTONOMY.md` §2b–§2c; `DECISIONS.md` D-16). This line funds compensating that review time explicitly, or a part-time reviewer to share it, rather than treating it as unpaid founder time indefinitely. | `[FOUNDER TO SUPPLY — no hourly or salary rate has been set]` | `AUTONOMY.md` §2, §5 |
| **External methodology audit** | One independent reviewer, engaged in Q3 per the work plan, to examine the de-seeding method, the disclosure-density correlation findings (§5.3), and the composite-0.0 provenance resolution, and to publish a review the benchmark did not write itself | `[FOUNDER TO SUPPLY — no reviewer has been named or quoted]` | New commitment described in §6, not yet sourced |
| **Accessibility and publication work** | Implementing the disclosure-density and `adverse_findings_located` schema fields and their page-template display (§6, Q1 blocker); maintaining the daily-briefing pipeline's public output | Included in compute/engineering line above; no separate figure available | `DECISIONS.md` D-21 |
| **Total requested** | | **$250,000** | |

**What is deliberately not itemized as a fixed dollar figure:** current actual Hostinger VPS
tier and monthly cost, current actual model API spend to date, any existing revenue this project
already generates (Score-Watch is live at $79/year/entity and index downloads at $195 each per
`site/src/data/gumroad.ts` and `docs/PRD_MONETIZATION.md`, but no revenue total is recorded in
this repository and is not claimed here), and any prior grant or investment history. **All are
`[FOUNDER TO SUPPLY]`.**

---

## 8. What the funder gets

- **Open, published data.** All eight indexes are already public at compassionbenchmark.com and
  in this repository (`site/src/data/indexes/*.json`). Nothing produced under this grant is paywalled
  from public view; the commercial products (Score-Watch alerts, index downloads,
  `docs/PRD_MONETIZATION.md`) sell *access and interpretation*, not the underlying scores.
- **An auditable methodology.** The 8-dimension, 40-subdimension framework and its anchors are
  published in `site/src/data/dimensions.ts` and referenced directly in every assessment report.
- **A corrections record, in public, including the ones that made the project look worse.** This
  grant funds continuing the practice already documented in `research/APPLIED_CHANGES.md` and
  `research/PENDING_CHANGES.md` — publishing self-vetoes, declined upgrades, and coverage gaps in
  the project's own prior work (§4–5 above), not only the corrections that flatter it.
- **A completed de-seeding programme** at year end, with the placeholder-share figure (currently
  ~59% of published entities, `RISKS.md` RISK-001) driven toward zero and reported, index by
  index, against the baseline this proposal states.

---

## 9. Risks and limitations, stated honestly

Drawn directly from `RISKS.md` and `INCIDENTS.md`.

- **The floor problem.** Five countries (Sudan, South Sudan, Yemen, Israel, Myanmar) sit at
  composite 0.0 with every one of 40 subdimensions at the scale's minimum anchor — the scale
  cannot currently express further deterioration for these entities. This was logged as a
  methodology finding, not a scoring one, and a sub-floor severity annotation is recommended but
  not yet built (`DECISIONS.md` D-12).
- **Entity-currency defects.** At least 12 confirmed cases of companies ranked while defunct,
  renamed, acquired, or duplicated across indexes — including one company (Boston Dynamics)
  listed twice 45.3 points apart, and five cross-index duplications with gaps up to 23.1 points
  for the same company under two names (`RISKS.md` RISK-003). Remediation is designed but not
  yet executed; this grant's Section 6 work plan includes finishing it.
- **Scores are judgments from public evidence, not audits.** No subdimension score in this
  benchmark reflects an on-site inspection, a subpoenaed record, or private access to an entity's
  internal data. Every score is a documented, dated judgment against published anchors, applied
  by an assessor reading public sources. This is stated in the methodology and is the honest
  limit of what the instrument can claim.
- **An unresolved internal scoring-convention conflict.** Two different conventions for scoring
  "absence of disclosure" are simultaneously live in the ai-labs index; one applied entity
  (Cerebras Systems) is not currently a safe peer anchor for any of 56 entities scored under the
  other convention (`DECISIONS.md` D-14; `RISKS.md` RISK-005). This is disclosed here rather than
  smoothed over, and is named explicitly as Q1–ongoing work in Section 6.
- **Two documented incidents of internal date/queue corruption**, both caught and repaired by the
  project's own validation tooling before reaching a published score (`INCIDENTS.md` INC-003,
  INC-005) — cited here as evidence the project's own error-catching works, not as evidence it
  never errs.
- **The deploy pipeline has never fully automated.** Every publication to production currently
  depends on a manual step because a GitHub Actions SSH credential has been invalid since
  2026-07-19, with zero successful automated deploys on record (`INCIDENTS.md` INC-001). This is
  an operational risk to publication reliability, not a scoring risk, and its fix requires a
  credential action outside agent authority.
- **Reputational and dispute risk from publishing scored judgments about named, real
  institutions.** One documented instance: a company's score moved down 22.1 points on a
  crossing between two published bands with **zero adverse evidence located in either direction**
  — the movement measured absence of disclosure, not misconduct
  (`RISKS.md` RISK-007). **Mitigation, stated as a mitigation rather than an assumption**: every
  proposal of this kind is required to carry an explicit caveat distinguishing "no compassion
  infrastructure was disclosed" from "misconduct was found," and the published record shows this
  caveat was in fact applied (`research/APPLIED_CHANGES.md`; `AUTONOMY.md` §7).

---

## 10. Measurable outcomes — what would be true in 12 months that is not true now

All figures below are counted against the 2026-08-20 baseline stated in
`research/SEED_INVENTORY_2026-08-20.md`, and are intended to be re-counted the same way (byte-
identical-vector cluster detection across the published index files) at year end.

1. **Placeholder share falls from ~59% (834 of 1,289 published entities) to a stated, re-measured
   figure at year end**, with the reduction attributable to named, published de-seeding studies —
   not to a redefinition of "placeholder."
2. **All eight indexes reach the state ai-labs and robotics-labs are already in**: fewer than 5
   remaining un-assessed entities per index, or an explicit, published reason (e.g., a deliberate
   floor designation under provenance review) for any that remain.
3. **Zero remaining Exemplary-band or Established-band placeholders in fortune-500, countries, and
   global-cities** — the Tier 1 set named in Section 6, 42 entities at the highest published claim
   currently unmeasured.
4. **The disclosure-density and `adverse_findings_located` fields are live on every robotics-labs
   entity page**, clearing the D-21 publication blocker that currently holds back full display of
   43 already-assessed entities.
5. **A retraction-recheck step exists in the pipeline and has a documented catch rate** — at
   minimum, the step must exist and run; if it catches nothing in year one, that is reported as a
   negative result, not omitted.
6. **The D-14 scoring-convention conflict is resolved** — Cerebras Systems re-assessed under the
   2-convention, or an explicit, published decision to keep both conventions with a stated reason.
7. **An external methodology review is published**, independent of this project's own authorship,
   covering at minimum the de-seeding method and the disclosure-density findings in Section 5.
8. **The corrections record continues to include declined corrections** (upgrades and downgrades
   the benchmark measured and chose not to publish, with the reason stated) at a rate reported
   publicly, not just applied ones — falsifiable by inspecting `research/PENDING_CHANGES.md`
   entries against `research/APPLIED_CHANGES.md` entries for the same period.

---

*End of draft. This document has not been submitted to any funder and contains no claim of
eligibility, endorsement, or partnership with any organization.*
