# Grant Request — Compassion Benchmark: Operations, Research, Expansion and Training

> **DRAFT — NOT SUBMITTED. Figures unaudited.**
> Prepared 2026-09-14 for the founder to review and correct. It has not been sent to any funder or reviewed by an accountant or lawyer. It supersedes the scope of `docs/GRANT_PROPOSAL_2026-09.md`, which was a narrower draft covering only de-seeding.
>
> **How to read the numbers.** Every factual claim cites a file in this repository. Budget figures are **proposals, not facts**: each line is labelled as an estimate and states its assumption. Where a funder would expect a figure the repository does not hold, the text says `[FOUNDER TO SUPPLY: …]`. Open choices are marked `[FOUNDER DECISION: …]`. All of these are collected in Appendix C.

---

## 1. Cover sheet

| Field | Entry |
|---|---|
| Applicant | Compassion Benchmark (compassionbenchmark.com) |
| Project lead | Phil Kling, founder |
| Project title | Measured, Verifiable, Taught: one year of operations, research, expansion and training for an independent compassion benchmark |
| Amount requested | **$250,000 per year** |
| Term | 12 months from `[FOUNDER TO SUPPLY: proposed start date]`, with an optional Years 2–3 outlook (§10.5; estimates only) |
| Contact | `[FOUNDER TO SUPPLY: email, phone, mailing address]` |
| Legal status | **A founder-led project, not a registered nonprofit.** It has no tax-exempt determination. The recommended fast route to receiving grants is a fiscal sponsor (source: `docs/GRANT_FUNDER_MAP.md` §3). `[FOUNDER TO SUPPLY: fiscal sponsor name and agreement status, or current legal entity if any]` |
| Tax ID / EIN | `[FOUNDER TO SUPPLY: sponsor's EIN, or the project's own if one exists]` |
| Mission statement | Measure how institutions recognize, respond to and reduce suffering, and publish the results independently (source: `CLAUDE.md`) |
| Funding type sought | General operating or program support that is compatible with independence (§3.3) |
| Prior funders | `[FOUNDER TO SUPPLY: prior grants or investment, or "none"]` |
| Current annual budget / revenue | `[FOUNDER TO SUPPLY: actual spend and earned revenue to date; the repository holds no revenue total]` |

---

## 2. Executive summary

**Compassion Benchmark is an independent benchmark institution.** It scores how governments, corporations, AI labs, robotics labs, cities and universities recognize, respond to and reduce the suffering of the people they affect. Today it publishes:
- **8 indexes covering 1,325 scored entities** (source: `site/src/data/indexes/*.json`).
- One methodology of **8 dimensions, 40 subdimensions and 5 bands**, now at version 1.2 (sources: `site/src/data/dimensions.ts`, `/methodology`).
- About 79 public daily briefings since 2026-05-20 and 16 special briefings.
- Per-entity public score files, RSS and JSON feeds, and a public citation page.

Entities never pay for inclusion, score changes or suppression of findings (source: `CLAUDE.md`).

**The instrument exists. What it lacks is the capacity to be what it claims to be.** The project has published its own weaknesses:
- **820 of the 1,329 tracked entities (61.7%) have never been individually assessed.** Their published scores are inherited placeholders (source: `research/rotation-state.json`).
- **The research pipeline has never run unattended.** Cadence depends on the founder's time: research cycles ran on 62.5% of days since 2026-04-15 (source: `RISKS.md` RISK-016; PR/FAQ §8).
- **Test-retest reliability has never been measured.** No independent body has reviewed the method (source: PR/FAQ §4 Q6; `.benchmark-ops/BLOCKERS.md` BLK-006).
- **Every person who could assess, check or teach the method is the founder.**

**This grant funds four pillars over 12 months:**

| Pillar | Est. amount | What it buys |
|---|---:|---|
| Operations | $60,000 | An unattended, monitored research pipeline. Verified deploys. Security fixes and integrity gates. Fiscal and governance setup. |
| Research | $85,000 | First individual assessments for at least 200 placeholder entities, including all 42 highest-claim placeholders. A blind test-retest study. One evidence-tier scale. A formula sensitivity note. An interim methods committee. |
| Expansion | $45,000 | Scoped growth of the AI labs index. The validity prerequisites for AI model scoring. Better open data. Reach. |
| Training | $30,000 | An assessor calibration curriculum tied to inter-rater reliability. Workshops for journalists and researchers. Free self-assessment capacity-building for public-interest organizations. |
| Fiscal-sponsor fee and contingency | $30,000 | Sponsor fee (est. 8%) and a 4% contingency |
| **Total** | **$250,000** | |

**The main outcome is a measurable change in what the published record can claim:** fewer placeholders, a published reliability figure, a published independent review, a pipeline that runs without the founder present, and a trained pool of assessors beyond one person. Every target in §6 has a baseline taken from the repository and a stated way to measure it.

---

## 3. Organization background and independence policy

### 3.1 What the organization is

Compassion Benchmark publishes comparative rankings and sells access to, and interpretation of, its research (source: `CLAUDE.md`). Its about page lists four functions: publishing indexes, maintaining the methodology, producing research, and supporting institutions (source: `site/src/app/about/page.tsx`). The founder leads the work with AI-agent assistance. `AUTONOMY.md` sets out what an agent may do alone and what needs founder approval. Every write to a published score is founder-approved (source: `AUTONOMY.md` §1b).

**Team.** `[FOUNDER TO SUPPLY: founder biography; any advisors, contractors or collaborators. The repository names no staff, and this document invents none.]`

### 3.2 A public-interest mission with disclosed earned income

The project pursues a public-interest mission. It also runs **disclosed earned-income lines** (listed in §7.10) behind a firewall. Public scores, the methodology and public findings stay free and public. Paid services cover access, interpretation and institutional use only (sources: `CLAUDE.md`; `site/src/app/about/page.tsx`).

> `[FOUNDER DECISION: nonprofit versus commercial messaging is unresolved (PR/FAQ §7 item 3). This draft uses a hybrid framing: a public-interest mission with disclosed earned-income lines behind an explicit firewall. Confirm it, or choose another framing, before submission. Any external copy that says "kept free by grants" must match the live pricing pages.]`

### 3.3 How independence is protected

**Standing policy.** "Entities never pay for inclusion, score changes, or suppression of findings. Commercial services support access, interpretation, and institutional use only" (source: `CLAUDE.md`). The about page states three public commitments: no paid ranking changes, no methodology for sale, and public findings remain public (source: `site/src/app/about/page.tsx`).

**Structural controls that exist today:**
- **Payment systems cannot write scores.** No code path runs from a payment system to a score (source: PR/FAQ §4 Q11).
- **Score changes require founder approval.** A drift of more than 2.0 points from the live baseline is always a hold (source: `DECISIONS.md` D-00).
- **An assessor's self-veto outranks an approval flag** (source: `DECISIONS.md` D-16).
- **Two conflicting assessments trigger a fresh assessment.** The project never picks one of the two (source: `DECISIONS.md` D-07).

**Gaps we disclose rather than hide:**
- **The independence audit is stale.** The mechanical audit (`research/scripts/integrity-check.mjs`) has run once, on 2026-05-18, and failed 2 of 5 checks. One failure appears to be a false positive (source: PR/FAQ §3.2, §5 Q1; `research/integrity-reports/`). Independence is therefore *policy-enforced*, not *continuously verified*. This grant funds weekly audits (§8.1).
- **No written firewall covers paid engagements.** No written rule yet stops material from paid certified assessments or advisory work from informing a public score (source: PR/FAQ §4 Q11, §7 item 7). **This proposal commits to publishing that firewall in Quarter 1** (§8.1).
- **Approvals cannot be verified from outside.** Approval provenance is a free-text field that any agent could write (source: `RISKS.md` RISK-021). Operations funds a verifiable approval mechanism.

**Independence from this grant.** These conditions are offered as terms of the award:

1. **Funders never influence scores, methods, entity selection, publication timing or findings.** No grant deliverable may name an entity's score as an outcome.
2. **Funder disclosure.** Every funder, the amount band and the purpose are published within 30 days of award. `[FOUNDER DECISION: where to publish the disclosure (e.g. /supporters or a new funders page) and the amount bands to use]`
3. **Conflict rule for a funder affiliated with a scored entity.** This applies if a funder, its parent, its major backers or its board is affiliated with an entity the benchmark scores:
   - the affiliation is disclosed on that entity's page;
   - anyone with a tie to the funder recuses from approving changes to that entity's score;
   - no grant-funded deliverable is scoped to that entity;
   - the funding is declined if it would be restricted to the index containing that entity.
   The funder map advises caution with pooled funds whose backers include scored AI labs (source: `docs/GRANT_FUNDER_MAP.md` §6).
4. **Donated compute or model access is disclosed.** Where the benchmark must pay the organizations it scores for model API access, that spend is recorded and disclosed. The model programme caps any single model developer or affiliated source at 20% of annual programme funding after Year 1 (source: `.benchmark-ops/COST_LEDGER.md`).
5. **Unrestricted or program-level funding is preferred.** Funding restricted to one sector is a mission-drift risk (source: `docs/GRANT_FUNDER_MAP.md` §6).

---

## 4. Problem statement

### 4.1 Institutions are measured on what they say, not on what happens to the people they affect

Most public accountability instruments rely heavily on what institutions disclose about themselves. Evidence from the benchmark's own routine work shows that disclosure and compassion outcomes are related but separable:

- **High scores came from independent examination, not self-reporting.** Across two robotics assessment batches, 14 subdimension scores reached 4 of 5. Not one came from a corporate sustainability report. All came from state evaluations, regulator records, trial registrations, multilateral project records or statutory bodies (source: `research/INDEX_ADDITIONS_ROBOTICS_BATCH1_2026-08-20.md`).
- **Disclosure density correlated strongly, then broke where it should.** In the first two robotics batches, the share of scores resting on absent disclosure correlated with the composite at −0.905 and then −0.935. In a more heavily regulated third batch the correlation fell to −0.741. That batch contained a company that discloses extensively yet sits at the floor, because its disclosures include a regulator finding (sources: `research/INDEX_ADDITIONS_ROBOTICS_BATCH2_2026-08-23.md`; `research/INDEX_ADDITIONS_ROBOTICS_BATCH3_2026-08-23.md`). A composite alone cannot yet tell that case from a company that simply says nothing (source: `DECISIONS.md` D-21).

For robotics labs and AI labs specifically, the project states it knows of **no comparator index that scores harm accountability** (source: `site/src/data/special-briefings/what-the-product-is-for-2026-06-16.json`). That claim is limited to those two indexes. Established comparators exist for countries, companies and cities.

### 4.2 The instrument needs capacity to meet its own standard

| Need | Evidence |
|---|---|
| **Most published scores are not yet measurements** | 820 of 1,329 tracked entities (61.7%) have `last_assessed` null (source: `research/rotation-state.json`). An earlier count found high-seed placeholders wrong in one direction, with error growing with seed height: up to −46.37 points at the highest seed tested (source: `research/SEED_INVENTORY_2026-08-20.md`). |
| **Freshness depends on one person** | 135 entities (10.2%) were assessed in the last 30 days. Research-cycle cadence is 62.5% of days (95 of 152) and public briefing cadence 67%. The pipeline has never run unattended (sources: `research/rotation-state.json`; PR/FAQ §8; `RISKS.md` RISK-016). |
| **Reliability is unmeasured** | Two accidental repeat assessments moved 2.5 points (crossing a band) and 10.7 points within days. No formal study exists (source: PR/FAQ §4 Q6; `DECISIONS.md` D-07). |
| **Method issues need a body outside the founder** | The evidence-tier scale uses four incompatible numbering schemes. A public claim about the formula was contradicted by the formula itself, and the formula has a cliff at 4.0. Band boundaries disagree at exact integers. There is no methods committee (sources: PR/FAQ §3.1; `RISKS.md` RISK-006, RISK-019; `.benchmark-ops/BLOCKERS.md` BLK-006). |
| **Errors can reach publication** | On 2026-09-14, four factual errors in a daily briefing passed every automated gate and were caught only by human review (source: `RISKS.md` RISK-020). |
| **No trained assessor pool exists** | No human rating panel, calibration set or rater agreement statistic exists (source: `.benchmark-ops/BLOCKERS.md` BLK-005). |

---

## 5. Goals

1. **G1 — Make the published record a record of measurement.** Every published score should be an individual assessment or be clearly labelled as not yet one.
2. **G2 — Run the benchmark as dependable public infrastructure.** Research should run on schedule, deploys should be verified, public data should be correct, and approvals should be checkable from outside.
3. **G3 — Establish, in public, how far the scores can be trusted.** That means measured reliability, one consistent evidence scale, a documented formula and independent methodological review.
4. **G4 — Extend coverage where accountability gaps are largest, without outrunning validity.** That covers AI labs, robotics labs and AI models, each only as far as its prerequisites allow.
5. **G5 — Build the human capacity to produce, read and use the benchmark.** That means trained assessors, informed journalists and researchers, and public-interest organizations able to assess themselves.

---

## 6. Objectives (SMART)

Baselines are dated 2026-09-14 unless stated. "Month" counts from the grant start. Every target is a proposal, and the Methods-related targets are subject to the interim methods committee (R4).

| ID | Objective | Goal | Baseline | 12-month target | Measurement method |
|---|---|---|---|---|---|
| **OBJ-1** | Reduce never-individually-assessed entities on the current roster | G1 | 820 of 1,329 (61.7%) (source: `research/rotation-state.json`) | **≤ 620 of the same 1,329 (≤ 46.7%)**, i.e. at least 200 first-ever assessments. Entities added later are reported separately. | Count `last_assessed == null` over the baseline roster, published quarterly |
| **OBJ-2** | Clear all Tier 1 placeholders (highest published claims) | G1 | 42 Tier 1 placeholder entities as of 2026-08-20 (source: `research/SEED_INVENTORY_2026-08-20.md`) | 0 Tier 1 placeholders by Month 6. The band-boundary documentation is fixed first. | Seed inventory re-run with the same identical-vector method |
| **OBJ-3** | Raise freshness | G2 | 135 of 1,329 (10.2%) assessed within 30 days; median assessment age ≈ 60 days (source: PR/FAQ §8) | ≥ 25% assessed within 30 days; median age ≤ 45 days. The PR/FAQ's long-run target of ≥ 40% is carried into Year 2. | Coverage dashboard generated from `rotation-state.json` each cycle (PR/FAQ rec. U) |
| **OBJ-4** | Make research cadence independent of founder sessions | G2 | 62.5% of days with a completed cycle; briefing cadence 67%; 0 unattended runs (source: PR/FAQ §8; `RISKS.md` RISK-016) | ≥ 85% cycle cadence and ≥ 85% briefing cadence over Months 7–12. An alert fires within 24 hours of any missed cycle. Every gap is disclosed in the next briefing. | Scheduled-job logs; cycle manifests; alert records |
| **OBJ-5** | Zero known data-integrity defects in public data | G2 | 16 cross-index slug collisions and 13 accented-slug mismatches (source: `RISKS.md` RISK-017, RISK-018); stale counts on `/data` and `/media` (e.g. "1,156 entities") (source: `site/src/app/data/page.tsx`, `site/src/app/media/page.tsx`) | 0 collisions, with the build failing on any new one. 0 hand-written entity counts on public pages. | `test-entity-records.mjs` and the collision check wired into CI |
| **OBJ-6** | Verifiable integrity controls | G2 | Independence audit run once (2026-05-18, 2 of 5 failed); approvals unverifiable; build waivers expire 2026-12-09 (source: PR/FAQ §8; `RISKS.md` RISK-015, RISK-021) | Weekly audit with no gap over 8 days. Every score change carries a verifiable approval. No expired-waiver build failure. | Committed reports in `research/integrity-reports/`; CI rejects unapproved index changes |
| **OBJ-7** | Measure reliability | G3 | 0 formal test-retest studies (source: PR/FAQ §4 Q6) | 1 blind test-retest study of ≥ 30 entities published, with band-agreement rate and per-dimension spread. Drift guards recalibrated from the data. | Published methods note; study data in the repository |
| **OBJ-8** | Resolve documented method defects with outside review | G3 | 4 evidence-tier schemes; 0 formula sensitivity notes; 0 external reviews; no methods committee (source: PR/FAQ §3.1, rec. F, G; BLK-006) | 1 evidence-tier scale, schema-enforced. Formula sensitivity note published. Interim methods committee constituted by Month 3. One independent methodology review published by Month 10. | Validator count of inconsistent tier values = 0; published documents |
| **OBJ-9** | Stop errors escaping into public briefings | G2 | Escaped-error rate unmeasured; 1 documented instance with 4 errors (source: PR/FAQ §8; `RISKS.md` RISK-020) | A claim-to-source check runs before every briefing. Escaped errors are counted and published quarterly. | Check logs; public corrections log |
| **OBJ-10** | Expand the AI labs index responsibly | G4 | ai-labs: 50 rows, 45 true unique operating entities; 55 net-new recommended; disclosure-density indicator not built (sources: `research/INDEX_EXPANSION_SCOPE_2026-08-20.md` §1.3; `DECISIONS.md` D-21; no field found in `site/src/`) | Disclosure-density indicator published (clears D-21). Founder decisions D-13 and D-20 recorded. Up to 48 net-new ai-labs baselines (expansion batches 2, 4, 6 and 8). | Index file counts; decision log; entity pages |
| **OBJ-11** | Meet CB-MODEL's pre-registered prerequisites before any model is scored | G4 | 0 models scored by design; 33 bank items, 0 human-reviewed (28 unvalidated, 5 draft); no rater panel; no methods committee; $0 approved budget (sources: `site/src/lib/model-index-facts.ts`, `site/src/data/model-benchmark/tasks-v1.json`, `registry-v1.json`; `.benchmark-ops/BLOCKERS.md`, `COST_LEDGER.md`) | All 28 non-draft items human-reviewed. Held-out pool design. Rater panel with welfare protocol. Fixtures pilot and test-retest on fixtures completed. **A first live pre-registered result only if every gate passes**; no score is promised. | Validation ledger; hashed run records; public status on `/ai-models` |
| **OBJ-12** | Improve open data and citation | G4 | No declared open license (source: PR/FAQ §4 Q12); `/cite` example URL defect (source: PR/FAQ C18) | License decided and published. `/cite` examples resolve 100%. Quarterly versioned data snapshots published. | Link check; release notes |
| **OBJ-13** | Grow audience reach | G4 | `[FOUNDER TO SUPPLY: current monthly visitors, feed and newsletter subscribers, known citations; the repository holds no audience baseline]` | Targets set within 30 days of the baseline being supplied | Site analytics; subscriber counts; citation log |
| **OBJ-14** | Train and calibrate assessors | G5 | 0 trained assessors besides the founder; 0 calibration sets; 0 agreement statistics (source: BLK-005) | Curriculum v1 published. ≥ 6 trainees complete calibration. Certification requires meeting an agreement threshold (proposed weighted kappa ≥ 0.70, confirmed by the methods committee). | Calibration results by trainee and dimension, published in aggregate |
| **OBJ-15** | Train journalists and researchers | G5 | 0 workshops | 4 workshops delivered with ≥ 60 total participants; public guide to reading and citing scores | Attendance; post-workshop check; guide published |
| **OBJ-16** | Build capacity in public-interest organizations | G5 | Free self-assessment tool live; 0 facilitated cohorts (source: `site/src/app/self-assessment/page.tsx`) | 4 free cohorts, ≥ 40 organizations; facilitator guide published | Participation records; anonymous feedback; no score data collected |

---

## 7. Platform features today

Status key: **Live** = publicly available and working as described. **Live, with defects** = available, with issues cited. **Pre-registration** = method published, no results by design. **Listed** = on the site, purchase via inquiry, no sales record in the repository. **Not yet live** = placeholder or disabled. **Not working** = offered but cannot be fulfilled.

### 7.1 Indexes — Live

| Index | Entities | Source |
|---|---:|---|
| Fortune 500 | 447 | `site/src/data/indexes/fortune-500.json` |
| Global cities | 250 | `global-cities.json` |
| Countries | 191 | `countries.json` (193 → 191 after the 2026-09-14 duplicate merge; `RISKS.md` RISK-003) |
| U.S. cities | 144 | `us-cities.json` |
| Universities | 100 | `universities.json` |
| Robotics labs | 92 | `robotics-labs.json` |
| U.S. states | 51 | `us-states.json` |
| AI labs | 50 | `ai-labs.json` |
| **Total** | **1,325** | Sum of `rankings.length` |

The Fortune 500 index holds 447 of 500 companies (source: `DECISIONS.md` D-20).

### 7.2 Methodology — Live, with defects

- **Framework:** 8 dimensions (Awareness, Empathy, Action, Equity, Boundaries, Accountability, Systemic, Integrity), 40 subdimensions with behavioral anchors, a 5-tier evidence hierarchy and 5 bands. Version 1.2 is published at `/methodology` (sources: `site/src/data/dimensions.ts`, `site/src/app/methodology/page.tsx`).
- **Floor designations** require multi-source corroboration. Unadjudicated allegations are recorded as evidence-tier upgrades without moving the composite (source: `site/src/app/methodology/page.tsx`).
- **Defects:**
  - band boundaries disagree at exact integers (RISK-006);
  - a public formula claim was contradicted by the formula (RISK-019; the copy fix is uncommitted and pending deploy);
  - the 3.99→4.0 cliff is still open;
  - evidence-tier numbering is inconsistent across surfaces (PR/FAQ §3.1).

### 7.3 Entity pages — Live, with defects

Every entity has a page with its composite, band, dimension profile and change history. Badge embeds are offered on entity pages (sources: `site/src/app/` entity routes; `site/scripts/build-entity-history.mjs`). **Defect:** the badge host does not resolve, so embeds cannot load (source: `RISKS.md` RISK-014).

### 7.4 Daily briefings — Live

About 79 validated daily briefings between 2026-05-20 and 2026-09-14, each tied to cited sources (source: `site/src/data/updates/daily/`). Cadence is 67% of days (PR/FAQ §8). Briefings pass schema and lint gates, but those gates do not check factual claims (RISK-020).

### 7.5 Special briefings — Live

16 thematic deep-dives, 2026-06-11 to 2026-07-04. Topics include floor designations, exemplars, how allegations are scored against proofs, the equity dimension, famine, aid obstruction, and the university index (source: `site/src/data/special-briefings/manifest.json`). None has been published since 2026-07-04.

### 7.6 Evidence pipeline — Live, founder-operated

Scan → assess → digest → founder approval → apply. Output to date (sources: `research/assessments/`, `research/change-proposals/`, `research/digests/`, git history):
- 1,505 assessment reports;
- 718 change proposals;
- 114 digests;
- about 400 timestamped commits.

A full cycle uses about 265–280 web searches under a 2,000-per-session cap (source: `INCIDENTS.md` INC-008). **Never run unattended** (RISK-016).

### 7.7 Public data, feeds and citation — Live, with defects

- **Per-entity JSON** at `/data/scores/<slug>.json` and a catalog at `/data/index.json` (source: `site/scripts/export-public-data.mjs`). Slug collisions serve the wrong entity for some names (RISK-017, RISK-018).
- **Feeds:** RSS 2.0 at `/updates/feed.xml` and JSON Feed 1.1 at `/updates/feed.json` (source: `site/scripts/build-feeds.mjs`).
- **`llms.txt`** for answer engines, with its entity count derived from the index data at build time (source: `site/scripts/build-llms.mjs`, `site/public/llms.txt`).
- **`/cite`** gives APA, MLA, Chicago and plain-text formats and a table of entity URL prefixes per index (source: `site/src/app/cite/page.tsx`). An example-URL defect flagged 2026-09-14 (PR/FAQ C18) was fixed and deployed the same day (commit f940a80b), verified on production.
- **License:** no formal open license is declared (PR/FAQ §4 Q12).

The static site has about 1,978 pages. It deploys by Docker and Nginx to a VPS, with 7 consecutive successful auto-deploys since 2026-09-09 after 53 failures (source: `RISKS.md` RISK-004).

### 7.8 Search — Live, with a gap

Pagefind static search runs across the site (source: `site/package.json`, `site/scripts/build-search-index.mjs`). There is no alias support, so former names return no results (source: PR/FAQ rec. Y).

### 7.9 Self-assessment and evaluation tools — Live

- **`/self-assessment`** is free. Organizations rate themselves across all 8 dimensions and 40 subdimensions (about 25 minutes). It is labelled a self-reported Tier 5 assessment, not a certification (source: `site/src/components/assessment/SelfAssessment.tsx`).
- **`/ai-evaluation-suite`** does per-item 1–5 scoring and exports JSON, CSV or a scorecard, each watermarked unofficial. Its copy overclaims "compare models" and "track progress", which the tool cannot do (source: PR/FAQ §3.1).

### 7.10 AI Model Compassion Benchmark (CB-MODEL) — Pre-registration

Published at `/ai-models` and `/ai-models/methodology` with **0 models scored by design** (source: `DECISIONS.md` D-29). What exists:
- **Task bank:** 33 items across 8 dimensions. 0 are human-reviewed (28 unvalidated, 5 draft). All are public-permanent, so none can be used for blinded comparison. Scorable items are as few as 2 per dimension, for Systemic and Integrity (sources: `site/src/data/model-benchmark/tasks-v1.json`; `site/src/lib/model-index-facts.ts`).
- **Scorer and statistics layer** for uncertainty and inter-rater agreement (source: `site/scripts/lib/evaluation-statistics.mjs`).
- **Replay-only evaluation harness**, which cannot make live network calls (source: `research/scripts/model-harness/`).
- **Release watch:** 0 releases tracked and 0 scans ever run (source: `site/src/data/model-benchmark/releases-v1.json`; D-30).
- **Bring-your-own-model scoring** as a clipboard round-trip, with no API key (source: D-30).

Blockers: no model API budget (BLK-002), no human rating panel (BLK-005), no methods committee (BLK-006). $0 spent (source: `.benchmark-ops/COST_LEDGER.md`).

### 7.11 Commercial services — disclosed earned-income lines

| Line | Price (as listed) | Status | Source |
|---|---|---|---|
| Score-Watch alert | $79/yr per entity | **Sold via Gumroad but not working.** The fulfillment host `api.compassionbenchmark.com` does not resolve. No alert delivery is recorded. | `site/src/data/gumroad.ts`; `RISKS.md` RISK-014 |
| Index downloads: countries, Fortune 500, AI labs, robotics, global cities | $49 individual / $195 commercial | Listed with Gumroad links; fulfillment not verified in this draft | `site/src/app/pricing/page.tsx`; `gumroad.ts` |
| Index downloads: U.S. cities, U.S. states, universities | $195 | **Not yet live** (no Gumroad product; routes to contact-sales) | `gumroad.ts` |
| Supporter tier | $5 / $10 / $25 monthly | **Not yet live** | `gumroad.ts`; `site/src/app/supporters/page.tsx` |
| Pro API | $59/mo or $590/yr | **Not yet live** ("coming soon") | `site/src/app/pricing/page.tsx`; `api-access/page.tsx` |
| Data licenses | $500 to $10,000+ | Listed (by inquiry) | `site/src/app/data-licenses/page.tsx` |
| Advisory | $1,500 to $50,000+ | Listed (by inquiry) | `site/src/app/advisory/page.tsx` |
| Certified assessments | $2,500+ to $50,000+ | Listed (by inquiry) | `site/src/app/certified-assessments/page.tsx` |

**Revenue to date:** `[FOUNDER TO SUPPLY: total earned revenue by line, and whether any Score-Watch purchase went unfulfilled]`
`[FOUNDER DECISION: pause Score-Watch sales until fulfillment is verified end-to-end, or deploy and verify first (PR/FAQ §7 item 2). A funder will ask.]`

---

## 8. Program design by pillar

### 8.1 Operations — $60,000 (estimate)

**Purpose.** Make the benchmark run reliably without the founder present, make its integrity claims checkable, and set up the fiscal and governance structure that grant funding requires.

**Activities.**
1. **Unattended research pipeline.** Run one isolated session per cycle with a search-budget preflight, following the INC-008 remediation. Add a dead-man's-switch alert on missed cycles and a written cadence floor in `DECISIONS.md` (PR/FAQ rec. K, §7 item 4). **Unattended publication stays off until the claim-to-source check (R6) is live** (RISK-016).
2. **Deploy verification.** The post-deploy check will assert an applied score value, not just freshness (RISK-004; rec. H).
3. **Data-integrity gates.**
   - Adopt canonical entity IDs and one shared slug function. Migrate the 16 collisions and 13 accented mismatches with redirects, and fail the build on any collision (RISK-017, RISK-018; rec. A).
   - Wire `test-entity-records.mjs`, `validate-scan.mjs` and `validate-rotation-state.mjs` into CI (rec. B).
   - Generate every public entity count from data.
4. **Integrity controls.**
   - Revive the independence audit weekly and fix its false-positive check (rec. O).
   - Adopt verifiable approval provenance: signed commits or founder-only PR approval, with a hash chain from proposal to applied change (RISK-021; rec. N).
   - Turn score-updater rules into a build validator (rec. P).
5. **Security fixes.** Close the public analytics login, add HSTS and CSP, and fix redirect and 404 behavior (RISK-022; rec. T). One independent security review of the approval chain and the commercial plane.
6. **Waiver cliff.** Resolve or consciously extend the six product-separation waivers before 2026-12-09 (RISK-015). *This date may fall before the grant starts; it is scheduled regardless of funding.*
7. **Fiscal and governance setup.**
   - Sign a fiscal-sponsor agreement.
   - Set up bookkeeping and restricted-fund tracking.
   - Publish the grant firewall (§3.3) and the paid-engagement firewall: no paid-engagement material in public scores, assessor recusal, and a public register of engagements (PR/FAQ §7 item 7).
   - Publish a funder disclosure page.
   - Produce quarterly financial reports.

**Deliverables.** Scheduled pipeline with alerting. Asserting deploy check. CI-enforced integrity gates. Weekly audit reports. Verifiable approval mechanism. Security review report. Published firewall policies. Sponsor agreement. Quarterly finance reports.

**Milestones.**
- Month 1: sponsor agreement; firewall policies published.
- Month 3: alerting live; deploy check asserts; security fixes live.
- Month 6: collision gate and approval provenance live; first unattended cycles, human-reviewed before publication.
- Month 9: weekly audit has run 12+ consecutive weeks.
- Month 12: OBJ-4, OBJ-5 and OBJ-6 reported.

**Serves:** OBJ-3, OBJ-4, OBJ-5, OBJ-6, OBJ-9 (with Research).

**Out of scope.** Building a server-side API or new commercial products. Redesigning the site. Resuming Score-Watch sales; that is a founder decision funded from earned income, not from this grant.

### 8.2 Research — $85,000 (estimate)

**Purpose.** Turn placeholders into measurements, and find out, in public, how reliable and valid those measurements are.

**Activities.**
1. **R1 — Finish Tier 1 de-seeding first.** First fix the band-boundary documentation (RISK-006; the seed inventory's §6 step 1). Then assess the 42 Tier 1 entities in the published order: Fortune 500 at seed 92.4, countries at 83.0, Fortune 500 at 60.9, countries at 62.5 and global cities at 75.9 (source: `research/SEED_INVENTORY_2026-08-20.md`). Every study carries the anti-confirmation-bias guard.
2. **R2 — Tier 2 by seed value, across indexes.** One evidentiary standard per seed value, until OBJ-1 is met.
3. **R3 — Provenance inspection of the composite-0.0 entities, with no re-scoring** (`DECISIONS.md` D-12). Resolve the Cerebras convention conflict by re-assessing under the 2-convention (D-14; RISK-005). Work the held-proposal backlog: 37 self-veto holds and 13 entity-record holds (RISK-002).
4. **R4 — Interim methods committee.** Three external reviewers, consulted per decision and logged in `DECISIONS.md`, as the documented interim option in BLK-006. It rules on: band-boundary definitions, one evidence-tier scale (rec. F), the formula's integration premium and 4.0 cliff (RISK-019), and certification thresholds for Training.
5. **R5 — Test-retest reliability study.** At least 30 entities, stratified by index and band, re-assessed blind by a second assessor. Publish the band-agreement rate and per-dimension spread, then recalibrate the 2.0-point drift guard from the data (rec. C).
6. **R6 — Claim-to-source check and escaped-error log for briefings** (RISK-020).
7. **R7 — Formula sensitivity note.** Publish how the composite responds to profile shape, including the cliff (rec. G).
8. **R8 — Independent methodology review.** A reviewer the project does not supervise examines the de-seeding method, the reliability study and the disclosure-density findings. The review is published unedited, with the project's response alongside.

**Deliverables.**
- At least 200 first-ever assessments (all with reports and dated sources).
- Seed inventory re-runs each quarter.
- Provenance findings on floor entities.
- Methods committee decisions log.
- Reliability study and data.
- Evidence-tier unification.
- Formula sensitivity note.
- Published independent review.

**Milestones.**
- Month 2: boundary documentation fixed; methods committee constituted.
- Month 6: Tier 1 cleared; reliability study fieldwork complete.
- Month 8: reliability study published; one tier scale enforced.
- Month 10: independent review published.
- Month 12: OBJ-1 re-count published.

**Serves:** OBJ-1, OBJ-2, OBJ-3, OBJ-7, OBJ-8, OBJ-9.

**Out of scope.** Arithmetic bulk recalibration of seeds, which D-15 rejects. Re-scoring floor entities as de-seeding (D-12). Any change to a published score without founder approval under `AUTONOMY.md`. A promised direction for any score movement.

### 8.3 Expansion — $45,000 (estimate)

**Purpose.** Grow coverage only where the repository already establishes need, and only as far as validity allows.

**Activities.**
1. **X1 — Unblock and extend the lab indexes.**
   - Build and publish the disclosure-density indicator and `adverse_findings_located`, clearing D-21 for the 43 robotics additions.
   - Request founder decisions on index demarcation (D-13) and Zimmer Biomet's index (D-20).
   - Run ai-labs expansion batches 2, 4, 6 and 8 from the scoping study: up to 48 net-new baselines, never mixing indexes within a batch (source: `research/INDEX_EXPANSION_SCOPE_2026-08-20.md` §4.2).
   - Every evidence-thin entity carries the disclosure-capacity note and the sentence "Absence of disclosure, not evidence of harm" (§4.3).
2. **X2 — CB-MODEL validity prerequisites, then at most a gated first result.**
   - Human review of the 28 non-draft items.
   - A held-out item pool design that is not committed to the public repository (PR/FAQ §3.1).
   - Recruit a two-rater panel with the welfare protocol BLK-005 requires *before* raters see crisis-adjacent items.
   - Run a pilot and test-retest on fixtures.
   - Validate buyer and user demand through 3–5 logged conversations (rec. X).
   - Only when every pre-registered gate passes: a first live evaluation within a founder-approved ceiling, with spend recorded in `COST_LEDGER.md` and disclosed. No ranking of models is promised.
3. **X3 — Open data.**
   - Declare the data license.
   - Publish quarterly versioned snapshots with a data dictionary.
   - Add alias search.
   - Add a public coverage and freshness dashboard showing, for each entity, whether its score is an individual assessment or a placeholder (recs. U, E).
4. **X4 — Reach.**
   - Distribute briefings.
   - Commission an accessibility review.
   - Present the method at 1–2 research or journalism convenings.
   - State plainly, in machine-readable surfaces, that the benchmark is distinct from similarly named AI leaderboards (PR/FAQ rec. S).

**Deliverables.** Disclosure-density indicator live. Decisions D-13 and D-20 recorded. Up to 48 ai-labs baselines. CB-MODEL validation ledger entries and hashed fixture runs. License, snapshots and dashboard. Accessibility report. Outreach log.

**Milestones.**
- Month 3: D-21 cleared; license decided.
- Month 4: coverage dashboard live.
- Month 6: ai-labs batches 2 and 4 done; item review done.
- Month 9: rater panel calibrated on fixtures; batches 6 and 8 done.
- Month 12: CB-MODEL gate review published (pass or not-yet).

**Serves:** OBJ-10, OBJ-11, OBJ-12, OBJ-13.

**Out of scope.**
- New indexes. The repository has no scoping study for any, and none is proposed.
- Completing the Fortune 500 index to 500. That creates latent collisions under R-SUB-4 (D-20), so it is Year 2 outlook only.
- Expanding universities. There is no repository basis.
- Any model leaderboard, and any per-model page before a result exists (D-29).

### 8.4 Training — $30,000 (estimate)

**Purpose.** End single-person dependency in assessment, help the people who report on the benchmark read it correctly, and give public-interest organizations a free way to use the framework on themselves.

**Non-negotiable training rule.**
- **Training never affects any entity's score, and is never sold or described as a path to a better score.**
- Participation is not recorded against any entity.
- Trainee assessors may not assess an entity they have ties to.
- Organizations that attend capacity-building sessions receive no review, preview or advantage in the public benchmark.
- All training material uses only the published methodology.
- Free capacity-building is kept separate from paid certified assessments and advisory services, and is never used to sell them.

**Activities.**
1. **T1 — Assessor training and calibration curriculum.**
   - Modules on the 40 subdimension anchors, evidence tiers, the 2-convention for absent disclosure, floor rules, self-veto discipline, and separating silence from harm.
   - A calibration set built from completed, published assessments.
   - Certification requires meeting the agreement threshold set by the methods committee, reported by dimension.
   - Trainees who certify can serve as second assessors in the R5 reliability study and as CB-MODEL raters, subject to the welfare protocol.
2. **T2 — Journalist and researcher training.** Four online workshops and a public guide covering:
   - what a composite and a band mean and do not mean;
   - placeholder versus individual assessment;
   - how to cite a score with its date and version;
   - how to read uncertainty and corrections.
3. **T3 — Free capacity-building for public-interest organizations.**
   - A facilitator guide and four cohort sessions built on `/self-assessment`.
   - Office hours on evidence-based self-review.
   - No participant data enters the benchmark.

**Deliverables.** Curriculum v1 and calibration set. At least 6 trainees through calibration, with aggregate results published. 4 workshops and a guide. Facilitator guide and 4 cohorts.

**Milestones.**
- Month 3: curriculum draft reviewed by the methods committee.
- Month 5: first assessor cohort calibrated.
- Months 4–11: workshops, one per quarter from Q2, plus one extra.
- Months 5–12: capacity cohorts.
- Month 12: OBJ-14, OBJ-15 and OBJ-16 reported.

**Serves:** OBJ-7 (second assessors), OBJ-11 (raters), OBJ-14, OBJ-15, OBJ-16.

**Out of scope.** Paid certification of organizations. Any training content drawn from non-public assessment material. Training for any entity on how to change its own public score.

---

## 9. 12-month work plan

| Quarter | Operations | Research | Expansion | Training |
|---|---|---|---|---|
| **Q1 (M1–3)** | Sponsor agreement. Firewall and funder-disclosure policies published. Missed-cycle alerting live. Deploy check asserts scores. HSTS/CSP and analytics-login fixes. Waiver cliff resolved if not already. | Band-boundary documentation fixed. Interim methods committee constituted. Tier 1: Fortune 500 92.4 and countries 83.0 assessed. Reliability study designed and pre-registered. | Disclosure-density indicator built (D-21). D-13 and D-20 decisions requested. License decision. | Curriculum drafted. Calibration set assembled. Workshop 1 planned. |
| **Q2 (M4–6)** | Canonical IDs and collision gate. Approval provenance live. First isolated unattended cycles, human-reviewed. Security review. | Tier 1 complete (42). Reliability fieldwork. Claim-to-source check live. Evidence-tier scale ruled on. | Coverage dashboard live. ai-labs batches 2 and 4. CB-MODEL item review complete. Demand conversations. | Assessor cohort 1 calibrated. Workshops 1–2. Capacity cohort 1. |
| **Q3 (M7–9)** | Unattended cadence ≥ 85% tracked. Weekly audit 12+ weeks. First quarterly finance report to funder. | Reliability study published. Formula sensitivity note. Tier 2 studies. Provenance inspection of 0.0 entities. | ai-labs batches 6 and 8. Rater panel recruited with welfare protocol. Fixtures pilot. First quarterly data snapshot. | Workshop 3. Capacity cohorts 2–3. Trainees serve as second assessors. |
| **Q4 (M10–12)** | Year-end ops report. Sustainability plan. Year 2 budget. | Independent review published with response. OBJ-1 re-count. Held-backlog report. | Test-retest on fixtures. CB-MODEL gate review published. Accessibility report. | Workshop 4. Capacity cohort 4. Training outcomes report. |

---

## 10. Budget

**Every figure here is an estimate for discussion, not a quote or an actual.** Rates are assumptions to be confirmed by the founder and, where one is engaged, the fiscal sponsor. The repository records no salaries, contractor rates, hosting bills or API spend (sources: `docs/GRANT_PROPOSAL_2026-09.md` §7; `.benchmark-ops/COST_LEDGER.md`).

### 10.1 Summary by pillar

| Pillar | Est. amount | Share |
|---|---:|---:|
| Operations | $60,000 | 24.0% |
| Research | $85,000 | 34.0% |
| Expansion | $45,000 | 18.0% |
| Training | $30,000 | 12.0% |
| Fiscal-sponsor / indirect fee (est. 8%) | $20,000 | 8.0% |
| Contingency | $10,000 | 4.0% |
| **Total** | **$250,000** | **100.0%** |

### 10.2 Line items

| # | Line | Pillar | Est. amount | Basis / assumption (all FOUNDER TO CONFIRM) |
|---|---|---|---:|---|
| O-1 | Program director time: operations, governance, funder reporting | Operations | $18,000 | Assumes 0.15 FTE at $120,000/yr loaded. `[FOUNDER TO SUPPLY: whether founder time is compensated, and the rate]` |
| O-2 | Reliability and DevOps engineering (contract) | Operations | $25,200 | Assumes 280 hours at $90/hr: pipeline scheduling and alerting, deploy verification, CI gates, slug migration, security fixes |
| O-3 | Hosting, domain, Worker, monitoring and backups | Operations | $4,800 | Assumes $400/month. `[FOUNDER TO SUPPLY: actual VPS, domain and Cloudflare costs]` |
| O-4 | Independent security review | Operations | $5,000 | Assumes one fixed-scope engagement on the approval chain and commercial plane |
| O-5 | Accounting, bookkeeping, legal review of policies | Operations | $7,000 | Assumes about $450/month bookkeeping plus about $1,600 policy review (firewalls, funder disclosure, data license), beyond sponsor services `[verify what the sponsor includes]` |
| R-1 | Research analyst / assessor (part-time) | Research | $40,000 | Assumes 0.5 FTE at $80,000/yr loaded: de-seeding assessments, held backlog, provenance inspection |
| R-2 | AI model API and web-search usage for research cycles | Research | $15,000 | Assumes $1,250/month. `[FOUNDER TO SUPPLY: metered per-cycle cost; the repository holds none]` |
| R-3 | Blind test-retest study: second assessors | Research | $12,000 | Assumes 30 entities × 8 hours × $50/hr |
| R-4 | Interim methods committee and independent methodology review | Research | $12,000 | Assumes 3 external reviewers × $4,000 honoraria across the year, one acting as lead independent reviewer |
| R-5 | Briefing fact-check editor | Research | $6,000 | Assumes 120 hours at $50/hr until the automated claim-to-source check is proven |
| X-1 | ai-labs expansion baselines | Expansion | $14,400 | Assumes 48 assessments × 6 assessor hours × $50/hr (batches 2, 4, 6 and 8 of the scoping study) |
| X-2 | CB-MODEL validity prerequisites and gated pilot | Expansion | $14,000 | Assumes 2 raters × 60 hours × $50/hr ($6,000) plus paid lived-experience review ($3,000) plus a **model-API ceiling of $5,000**, spendable only after gates pass and founder approval. Unspent funds return to contingency. |
| X-3 | Open data engineering | Expansion | $9,000 | Assumes 100 hours at $90/hr: license implementation, snapshots, data dictionary, dashboard, alias search |
| X-4 | Reach and accessibility | Expansion | $7,600 | Assumes an accessibility review ($3,000), 1–2 convening trips ($4,000) and email-distribution service ($600) |
| T-1 | Assessor curriculum and calibration set | Training | $9,600 | Assumes 160 hours at $60/hr |
| T-2 | Trainee assessor stipends | Training | $6,000 | Assumes 6 trainees × $1,000 on completing calibration |
| T-3 | Journalist and researcher workshops and guide | Training | $6,000 | Assumes 60 hours prep and delivery at $60/hr ($3,600) plus captioning and platform ($400) plus guide design ($2,000) |
| T-4 | Public-interest capacity-building cohorts | Training | $8,400 | Assumes 140 hours facilitation and guide at $60/hr |
| I-1 | Fiscal-sponsor fee | Indirect | $20,000 | 8% of $250,000. The funder map reports typical fees of 5–15% (most commonly 5–10%), with named sponsors from about 5% to 9% for private grants. **[verify]** against the chosen sponsor. |
| C-1 | Contingency | Contingency | $10,000 | 4%. Released only with a recorded founder decision, reported to the funder |
| | **Total** | | **$250,000** | |

Pillar checks: O-1 to O-5 = $60,000; R-1 to R-5 = $85,000; X-1 to X-4 = $45,000; T-1 to T-4 = $30,000; plus $20,000 and $10,000 = **$250,000**.

### 10.3 Budget narrative

- **People, not compute, are the binding constraint.** The earlier draft put $150,000 into compute (source: `docs/GRANT_PROPOSAL_2026-09.md` §7). This request moves the weight to human assessment, review and training, because four of the largest open risks need people:
  - unmeasured reliability (R5 needs a second assessor);
  - no methods body (BLK-006);
  - no rater panel (BLK-005);
  - errors that pass automated gates (RISK-020).
- **API spend stays modest until metered.** R-2 is a placeholder until the founder supplies actual per-cycle cost. If metering shows it is wrong, the variance is reported and funded from contingency or re-budgeted with the funder's agreement.
- **CB-MODEL spend is gated.** The $5,000 model-API ceiling in X-2 cannot be spent unless every pre-registered prerequisite passes and the founder approves in writing. Paying the organizations the benchmark scores for API access is disclosed (source: `.benchmark-ops/COST_LEDGER.md`).
- **No line pays for an outcome in any entity's score.**

### 10.4 Fiscal sponsor and indirects

The project is not a registered nonprofit. A fiscal sponsor is the recommended fast route to eligibility, typically within weeks, against 6–10+ months for a full IRS Form 1023 determination (source: `docs/GRANT_FUNDER_MAP.md` §3). The fee is modelled at 8%. Candidate sponsors and fee ranges in the funder map are flagged **[verify]** where not published. Choose a sponsor whose independence standards reinforce the no-pay-for-inclusion policy, and confirm the arrangement avoids "mere conduit" treatment (source: `docs/GRANT_FUNDER_MAP.md` §3). `[FOUNDER DECISION: which fiscal sponsor, and Model A (internal program) or Model C (re-grant to a separate entity)]`

### 10.5 Years 2–3 outlook (estimates only)

| Year | Est. range | Focus |
|---|---|---|
| Year 2 | $250,000–$300,000 | Finish de-seeding (target: never-assessed share under 25%). Freshness toward ≥ 40% within 30 days. Scope the Fortune 500 completion after the R-SUB-4 decision. CB-MODEL held-out pool and, if validated, a first multi-model wave. Methods committee becomes standing. Second assessor cohort. |
| Year 3 | $250,000–$325,000 | Repeat the reliability study. A second independent review. Assessors run a meaningful share of assessments. Decide whether to spin out into an independent nonprofit once revenue approaches the $150,000–$300,000 break-even the funder map cites for self-hosting versus sponsorship (source: `docs/GRANT_FUNDER_MAP.md` §3). |

---

## 11. Evaluation and reporting plan

**KPIs.** The objectives table (§6) is the KPI set. Every metric is computed from repository data using the stated method, and all baselines are dated 2026-09-14.

| KPI | Cadence | Source of truth |
|---|---|---|
| Never-assessed share; % assessed within 30 days; median age | Every cycle (dashboard); quarterly (report) | `research/rotation-state.json` |
| Tier 1 / Tier 2 placeholder counts | Quarterly | Seed inventory re-run |
| Research and briefing cadence; missed-cycle alerts | Monthly | Cycle manifests; `site/src/data/updates/daily/` |
| Slug collisions; hand-written counts | Every build | CI |
| Independence audit runs and failures | Weekly | `research/integrity-reports/` |
| Escaped briefing errors | Monthly | Public corrections log |
| Reliability: band-agreement rate, per-dimension spread | Once in Year 1 | Published study |
| Methods decisions and review | As made | `DECISIONS.md`; published review |
| ai-labs baselines; D-21 status | Quarterly | Index files; entity pages |
| CB-MODEL gates | Quarterly | `.benchmark-ops/VALIDATION_LEDGER.md`, `EVALUATION_LEDGER.md` |
| Training outputs and calibration agreement | Quarterly | Training records (aggregate only) |
| Reach | Quarterly after baseline | `[FOUNDER TO SUPPLY: analytics source]` |

**Reporting.**
- **Quarterly public progress notes** on the site. Each note covers every KPI against baseline, including misses and negative results. For example, if the claim-to-source check catches nothing, that is reported rather than omitted.
- **Quarterly financial report** to the funder, by pillar and line, with variances over 10% explained.
- **A year-end public report** and a year-end financial statement from the fiscal sponsor.
- **Corrections continue in public:** declined upgrades and declined downgrades as well as applied changes (sources: `research/PENDING_CHANGES.md`, `research/APPLIED_CHANGES.md`).

---

## 12. Governance, risk and mitigation

**Governance today.** One decision-maker, the founder, with written authority classes for agents (`AUTONOMY.md`), an append-only decision log (`DECISIONS.md`), an incident log (`INCIDENTS.md`) and a risk register (`RISKS.md`). No board or methods committee exists (source: BLK-006). **This grant adds:**
- an interim methods committee;
- a fiscal sponsor's financial oversight;
- verifiable approvals;
- a published funder and paid-engagement firewall.

`[FOUNDER DECISION: whether to form an advisory board in Year 1, and how funders are kept off it]`

| Risk | Source | Likelihood / impact | Mitigation in this program |
|---|---|---|---|
| Majority of scores are placeholders | RISK-001 | High / High | R1–R2 de-seeding by published claim at risk; public labelling (X3) |
| Approved proposals held unapplied (37 self-veto, 13 entity-record) | RISK-002 | Medium / Medium-High | R3 remedy passes; held-status lifecycle |
| Entity-currency defects (defunct, duplicate, renamed) | RISK-003 | Medium / High | D-13 and D-20 decisions before expansion (X1); tombstone and merge rules |
| Stale scores deploy undetected | RISK-004 | Medium / High | Operations activity 2 |
| Two absence-of-disclosure conventions live | RISK-005 | Medium / Medium | R3 re-assessment under the 2-convention |
| Band-boundary ambiguity | RISK-006 | Medium / Medium-High | Fixed before Tier 1 (R1); methods committee |
| Dispute over large moves with no adverse finding | RISK-007 | Low-Medium / High | Mandatory "absence of disclosure, not evidence of harm" caveat; disclosure-density indicator |
| Score-Watch sold but unfulfillable | RISK-014 | High / High | Founder decision to pause or verify; not grant-funded; disclosed here |
| All builds fail from 2026-12-10 | RISK-015 | High / High | Resolved or extended before 2026-12-09, independent of award |
| Pipeline never unattended | RISK-016 | High / High | Operations activity 1; human review gate retained |
| Slug collisions and accent mismatches | RISK-017, RISK-018 | High / Medium-High | Operations activity 3 |
| Formula claim and 4.0 cliff | RISK-019 | Certain / High | R4 and R7 |
| Briefing errors pass gates | RISK-020 | High / High | R6 plus fact-check editor (R-5) |
| Approval provenance unverifiable | RISK-021 | Medium / High | Operations activity 4 |
| Public admin surface; missing headers | RISK-022 | Medium / Medium | Operations activity 5 |
| **Key-person dependency** (founder-led) | `docs/GRANT_FUNDER_MAP.md` §3; §3.1 above | High / High | Training pillar; documented runbooks; contracted roles; unattended pipeline |
| **Funder concentration in one ecosystem** | `docs/GRANT_FUNDER_MAP.md` §6 | Medium / Medium | Diversify across AI-governance, accountability, data-for-good and journalism funders (§13) |
| **Independence perception from scored-entity money** (funders or model-API spend) | `docs/GRANT_FUNDER_MAP.md` §6; `.benchmark-ops/COST_LEDGER.md` | Medium / High | §3.3 conflict rule; disclosure; 20% single-developer cap |
| **Paid-engagement conflict** | PR/FAQ §7 item 7 | Medium / High | Firewall published in Q1 |
| **Contractor recruitment delay** | This plan | Medium / Medium | Quarter-level slack; contingency; report slippage publicly |
| **Rater welfare exposure** on crisis-adjacent items | BLK-005 | Medium / High | Welfare protocol before recruitment; opt-out, rotation and escalation |

---

## 13. Sustainability

**Diversified funding.** The funder map positions the work differently by funder type (source: `docs/GRANT_FUNDER_MAP.md` "How to position"):
- to AI-governance funders, as independent measurement of AI and robotics labs;
- to accountability funders, as a comparative index of governments and corporations;
- to data-for-good funders, as open public-interest data infrastructure;
- to journalism funders, through daily and special briefings.

It separates fast, small sources from slow, relationship-driven ones (source: §2). All open-round statuses, grant sizes and fees carry the map's **[verify]** flags and must be checked on each funder's live site before applying. A concentration guideline is proposed: no single funder above `[FOUNDER DECISION: cap, e.g. 40%]` of annual income after Year 1, alongside the existing 20% cap on any single model developer for CB-MODEL.

**Earned income stays behind the firewall.**
- Commercial lines (§7.11) sell access, interpretation and institutional use only.
- Payment systems have no write path to scores.
- Paid-engagement material never enters public scores.
- Clients who pay are disclosed in a public engagement register, and their assessors recuse from the public review.

`[FOUNDER TO SUPPLY: earned revenue to date and a 12-month earned-income projection]`

**If the grant ends.**
- **Continues:** the static site, published indexes, public data files, briefings archive, methodology, curriculum, calibration set and every published study. Hosting is the main fixed cost (O-3).
- **Slows or stops:** the contracted analyst, reliability and review work, training cohorts and ai-labs expansion.
- **Protected:** scores are never frozen as "current" when they are not. Freshness and assessment status stay visible through the coverage dashboard, so readers can see any slowdown.
- **Wind-down plan:** a three-month plan will be written in Q4 as a deliverable.

---

## 14. Funder recognition and transparency

**What a funder receives:**
- public acknowledgment (name and amount band) on the funder disclosure page and in reports;
- quarterly progress and financial reports;
- early notice of published studies (the reliability study, the independent review), shared at the same time as the public and never in advance of it;
- an invitation to the year-end public briefing;
- all grant-funded outputs published openly under the license decided in X3.

**What a funder can never receive:**
- any influence over any score, band, rank, entity selection, methodology, evidence standard or publication timing;
- advance sight of any score change;
- suppression or softening of any finding, including about the funder or its affiliates;
- exclusive or preferential access to public data;
- a certified assessment, advisory engagement or training framed as a benefit of funding;
- use of the benchmark's name to imply endorsement of the funder.

Any request of this kind is declined in writing and logged.

---

## Appendix A — Source and evidence table

| Claim (short) | Figure | Source file |
|---|---|---|
| Scored entities, 8 indexes | 1,325 | `site/src/data/indexes/*.json` (sum of `rankings.length`) |
| Per-index counts | 447 / 250 / 191 / 144 / 100 / 92 / 51 / 50 | same |
| Fortune 500 loaded | 447 of 500 | `DECISIONS.md` D-20 |
| Framework | 8 dimensions, 40 subdimensions, 5 bands, v1.2, 5 evidence tiers | `site/src/data/dimensions.ts`; `site/scripts/lib/scoring.mjs`; `site/src/app/methodology/page.tsx` |
| Tracked entities; never assessed; assessed in 30 days | 1,329; 820 (61.7%); 135 | `research/rotation-state.json` |
| Median assessment age | ≈ 60 days | PR/FAQ §8 (`docs/PRFAQ_AI_MODEL_BENCHMARK_AND_CONTINUOUS_RESEARCH_2026-09-14.md`) |
| Research / briefing cadence | 62.5% (95/152); 67% | PR/FAQ §8 |
| Daily briefings | ~79 since 2026-05-20 | `site/src/data/updates/daily/` |
| Special briefings | 16 | `site/src/data/special-briefings/manifest.json` |
| Assessments / proposals / digests / commits | 1,505 / 718 / 114 / ~400 | `research/assessments/`, `research/change-proposals/`, `research/digests/`, git |
| Site pages | ~1,978 | build output |
| Auto-deploy | 7 successes since 2026-09-09 after 53 failures | `RISKS.md` RISK-004 |
| Seed inventory and Tier 1 | 42 Tier 1; error up to −46.37 | `research/SEED_INVENTORY_2026-08-20.md`; `DECISIONS.md` D-15 |
| Held proposals | 37 self-veto, 13 entity-record; 37/66 = 56.1% | `RISKS.md` RISK-002; `DECISIONS.md` D-16; PR/FAQ §8 |
| Reliability cases | 58.1→60.6 (3 days); 24.4→13.7 (4 days) | PR/FAQ §4 Q6; `DECISIONS.md` D-07 |
| Robotics disclosure correlations | −0.905, −0.935, −0.741 | `research/INDEX_ADDITIONS_ROBOTICS_BATCH1/2/3_*.md` |
| D-21 blocker; 43 robotics additions | — | `DECISIONS.md` D-21; no disclosure-density field in `site/src/` |
| ai-labs expansion | 45 unique; 55 net-new; batches of 12; 111 total assessments | `research/INDEX_EXPANSION_SCOPE_2026-08-20.md` §1.3, §4 |
| Slug defects | 16 collisions remaining; 13 accent mismatches | `RISKS.md` RISK-017, RISK-018 |
| Stale public counts | "1,156 entities"; "21 U.S. states"; "50 humanoid robotics labs" | `site/src/app/data/page.tsx`; `site/src/app/media/page.tsx` |
| CB-MODEL bank | 33 items; 28 unvalidated, 5 draft, 0 reviewed; all public; 0 models; 0 releases | `site/src/data/model-benchmark/tasks-v1.json`, `registry-v1.json`, `releases-v1.json`; `site/src/lib/model-index-facts.ts`; D-29, D-30 |
| CB-MODEL scorable items per dimension | min 2 (SYS, INT) | `tasks-v1.json` (non-draft count) |
| CB-MODEL budget and spend | none; $0 | `.benchmark-ops/COST_LEDGER.md`; BLK-002 |
| 20% single-developer cap | after Year 1 | `.benchmark-ops/COST_LEDGER.md` |
| Search cap per cycle | ~265–280 of 2,000 per session | `INCIDENTS.md` INC-008; BLK-001 |
| Independence audit | 1 run, 2026-05-18, 2 of 5 failed | PR/FAQ §3.2, §8; `research/integrity-reports/2026-05-18.md` |
| Prices | $79; $49/$195; $5–$25; $59/mo; $500–$10,000+; $1,500–$50,000+; $2,500+–$50,000+ | `site/src/data/gumroad.ts`; `site/src/app/pricing|data-licenses|advisory|certified-assessments|supporters/page.tsx` |
| Score-Watch host NXDOMAIN | — | `RISKS.md` RISK-014 |
| Build waivers expire | 2026-12-09 | `RISKS.md` RISK-015 |
| Fiscal sponsor fees; 1023 timeline; break-even | 5–15%; 6–10+ months; $150k–$300k | `docs/GRANT_FUNDER_MAP.md` §3 [verify] |
| Independence policy | — | `CLAUDE.md`; `site/src/app/about/page.tsx` |

## Appendix B — Glossary

- **Composite.** A 0–100 score computed from 8 dimension scores on a 1–5 anchored scale. It is the rescaled average plus an integration premium of up to 10 points that depends on consistency and on how many dimensions sit below 4.0 (source: `site/scripts/lib/scoring.mjs`). The premium causes a jump at 4.0 (RISK-019).
- **Bands.** Critical, Developing, Functional, Established, Exemplary, covering 0–20, 20–40, 40–60, 60–80 and 80–100 as listed in `dimensions.ts`. The code assigns a value exactly on a boundary to the lower band (e.g. 60.0 is Functional). The written documentation and the code disagree at exact boundaries (RISK-006).
- **Dimension / subdimension.** The 8 top-level constructs, each with 5 subdimensions and behavioral anchors (40 in total).
- **Evidence tier.** The trust level of a source on a 5-tier hierarchy. On `/methodology`, Tier 1/Tier 2 are the strongest (treaty bodies, courts, IPC, ICRC or equivalent), and the self-assessment tool labels self-reported results Tier 5. Some surfaces run the scale the other way: four inconsistent numbering schemes currently exist, two in opposite directions (PR/FAQ §3.1). Unifying them is R4.
- **Placeholder / seed.** A score inherited from early seeding rather than an individual assessment. It is detected either as an identical 8-dimension vector shared within an index or as `last_assessed` null. These two measures differ and must not be mixed.
- **De-seeding.** Replacing placeholders with individual assessments, prioritized by *published claim at risk* (seed height × band-boundary proximity × rank visibility) (D-15).
- **Floor designation.** A deliberate score of 0.0 on documented harm grounds. It is resolved by provenance inspection, not re-scoring (D-12).
- **Self-veto.** An assessor's written instruction not to publish a proposal until a stated remedy is done. It outranks an approval flag (D-16).
- **Band crossing.** A score change that moves an entity into a different band. It files at any delta (D-06).
- **Pre-registration.** Publishing a method, item bank and falsification conditions *before* any result exists, so the method can be criticized before it produces a result someone might defend (D-29).
- **Test-retest reliability.** Agreement between two independent assessments of the same entity under the same method.
- **Inter-rater reliability.** Agreement between independent raters scoring the same material, e.g. weighted kappa.
- **Fiscal sponsor.** A registered charity that receives and administers grants for a project that has no tax-exempt status of its own.

## Appendix C — Founder checklist

**FOUNDER TO SUPPLY**
- [ ] Proposed grant start date (§1)
- [ ] Contact details: email, phone, mailing address (§1)
- [ ] Fiscal sponsor name and agreement status, or current legal entity (§1)
- [ ] EIN (sponsor's or project's) (§1)
- [ ] Prior grants or investment, or "none" (§1)
- [ ] Current annual spend and earned revenue to date (§1)
- [ ] Founder biography; any advisors, contractors or collaborators (§3.1)
- [ ] Earned revenue by line, and whether any Score-Watch purchase went unfulfilled (§7.11)
- [ ] Audience baseline: monthly visitors, feed and newsletter subscribers, known citations (OBJ-13; §11)
- [ ] Analytics source for reach KPIs (§11)
- [ ] Whether founder time is compensated, and the rate (O-1)
- [ ] Actual VPS, domain and Cloudflare costs (O-3)
- [ ] Metered per-cycle AI and search cost (R-2)
- [ ] Earned-income projection for the next 12 months (§13)
- [ ] Confirmation of all rate assumptions in §10.2 (all lines)
- [ ] What the chosen fiscal sponsor's fee includes (O-5) **[verify]**

**FOUNDER DECISION**
- [ ] Nonprofit vs. commercial messaging; confirm or replace the hybrid framing (§3.2; PR/FAQ §7 item 3)
- [ ] Where and in what amount bands to publish funder disclosures (§3.3)
- [ ] Pause Score-Watch sales or deploy and verify first (§7.11; PR/FAQ §7 item 2)
- [ ] Which fiscal sponsor; Model A or Model C (§10.4)
- [ ] Whether to form an advisory board in Year 1, and how funders are kept off it (§12)
- [ ] Funder concentration cap for institutional income (§13)
- [ ] Ratify or resolve D-13 before 2026-12-09 (§8.1; RISK-015)
- [ ] Zimmer Biomet index destination, D-20 (§8.3)
- [ ] Approval-provenance mechanism (§8.1; PR/FAQ §7 item 5)
- [ ] Publish the paid-engagement firewall (§3.3; PR/FAQ §7 item 7)
- [ ] Constitute the interim methods committee (§8.2; BLK-006)
- [ ] Data license (§8.3; OBJ-12)
- [ ] CB-MODEL provider choice, access tier and spend ceiling within X-2 (BLK-002)
- [ ] Cadence floor for institutional research over CB-MODEL build work (§8.1; PR/FAQ §7 item 4)

*End of draft. Not submitted to any funder. Contains no claim of eligibility, endorsement or partnership with any organization.*
