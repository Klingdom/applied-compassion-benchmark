---
study: "ai-labs and robotics-labs expansion to 100 entities — scoping study"
date: "2026-08-20"
type: "SCOPING — selection only"
status: "PROPOSAL. No index modified. No entity assessed. No score assigned."
indexes_in_scope: ["ai-labs", "robotics-labs"]
target_size_each: 100
author_role: "Compassion Benchmark Research Analyst"
constraints_honoured:
  - "No file under site/src/data/indexes/ modified"
  - "No file under research/change-proposals/, research/assessments/, research/rotation-state.json or site/src/data/updates/ modified"
  - "No entity assessed; no composite, dimension or subdimension value assigned"
  - "No commit"
---

# Expanding ai-labs and robotics-labs to 100: who belongs, and why

**Date:** 2026-08-20
**Scope:** Selection only. This document proposes *who* should be in the two lab indexes. It assigns no scores.

---

## Headline

Both rosters publish 50 rows. Neither contains 50 sound entity records.

| | ai-labs | robotics-labs |
|---|---:|---:|
| Published rows | 50 | 50 |
| Rows that name one identifiable company | 50 | **47** |
| Companies holding a *second* published composite elsewhere in the benchmark | **5** | **2** |
| Companies confirmed defunct | 0 | **1** |
| **True unique, currently-operating, singly-published entities** | **45** | **44–46** |
| **Net-new entities needed to reach 100** | **55** | **54** |

The larger finding sits underneath those numbers. **A "top 50 robotics labs" index that omits every one of the four largest industrial robot makers on earth (FANUC, ABB, Yaskawa, KUKA) and the entire surgical robotics sector (Intuitive Surgical, Medtronic, Stryker, CMR Surgical) — while listing a gripper manufacturer and a product demonstration — is not a top-50 list.** The same is true of an AI index that omits NVIDIA, Alibaba, ByteDance and Tencent while listing four companies with fewer than 200 employees each.

Expanding to 100 is therefore not a growth exercise. It is the repair that makes the existing 50 defensible.

---

# STEP 1 — Existing roster defects

Method: every `name` field in `site/src/data/indexes/ai-labs.json` and `robotics-labs.json` was passed through the canonical slugger in `site/src/lib/slugify.ts` and cross-matched against all eight published indexes. Corporate status was then checked against dated public sources.

## 1.1 robotics-labs — true unique count

**50 rows → 48 unique records → 47 that name one identifiable company → 46 currently operating.**

### Confirmed duplicates (2 rows, 0 new information)

| Rows | Published composites | Finding |
|---|---|---|
| "Boston Dynamics" (rank 14) and "Boston Dynamics (SPOT demo)" (rank 48) | 65.6 and 20.3 | One company, two composites, **45.3 points apart**. The second row names a product demonstration, not a legal entity. |
| "1X Technologies" (rank 10) and "Halodi Robotics" (rank 16) | 81.4 and 62.5 | One company. Halodi Robotics renamed to 1X Technologies in 2023. **18.9 points apart.** |

### Records that do not name one identifiable company (3 rows)

| Row | What the name actually refers to | Evidence |
|---|---|---|
| "Picasso Labs (Machina)" (rank 36, 48.4) | Two unrelated companies fused. Picasso Labs was a New York creative-analytics firm that renamed to CreativeX in September 2020 and is not a robotics company. Machina Labs is a separate Los Angeles metal-forming robotics manufacturer. | Established by the prior study at `research/assessments/picasso-labs-machina-2026-08-17.md` |
| "Paladin AI (Shield AI)" (rank 49, 9.4) | **New finding.** Two unrelated companies fused. Paladin AI Inc. is a Montreal pilot-training analytics company founded in 2013 by Adolfo and Mikhail Klassen; it builds no robots and has no relationship to Shield AI. Shield AI is a San Diego defence autonomy company. | [paladin.ai/about-us](https://paladin.ai/about-us/); [Globe and Mail profile](https://www.theglobeandmail.com/business/article-the-ai-advantage-how-a-father-and-son-duo-is-using-technology-to-keep/); [shield.ai](https://shield.ai/shield-ai-and-palantir-technologies-deepen-strategic-partnership-and-announce-deployment-of-warp-speed/) |
| "Apexica (RoboKind)" (rank 3, 85.0) | **New finding.** RoboKind is a real Dallas company that builds the Milo social robot for autism education. **"Apexica" could not be verified as an existing company in any search.** The parenthetical is unsourced. This row currently holds **rank 3 of 50**. | [robokind.com](https://www.robokind.com/press-mentions/how-a-robot-named-milo-helps-children-with-autism-develop-social-skills); [Dallas Innovates](https://dallasinnovates.com/meet-milo-a-new-robokind-robot-that-improves-remote-learning-for-students-with-autism-spectrum-disorder/); Apexica: no result across two searches |

Note the severity ordering. The Picasso Labs defect sits at rank 36. The Apexica defect sits at **rank 3** — inside the Exemplary band, on the public leaderboard.

### Confirmed defunct (1 row)

| Row | Status | Evidence |
|---|---|---|
| "Rethink Robotics" (rank 27, 60.9) | **Defunct.** Ceased operations 3 October 2025 due to insolvency after United Robotics Group's investors withdrew funding. Second closure; the first was 2018. | [The Robot Report, "Rethink Robotics shuts down — again"](https://www.therobotreport.com/rethink-robotics-shuts-down-again/); [Computer&Automation, "Rethink Robotics is insolvent"](https://www.computer-automation.de/robotics-en/images/rethink-robotics-is-insolvent-1.htm) |

### Product names where an entity name is required (1 row)

| Row | Problem |
|---|---|
| "Tesla Optimus" (rank 45, 31.2) | Optimus is a product programme, not a legal entity, and publishes no separate disclosure. The same class of defect as "Boston Dynamics (SPOT demo)". The entity is Tesla, Inc. |

### Names requiring correction, entity unchanged (6 rows)

| Current name | Correct name | Reason |
|---|---|---|
| "Kepler Exploration Robot" | Kepler Exploration Robotics | 24-character truncation from the legacy HTML extraction (`research/DATA_HYGIENE_SPEC_2026-08-16.md`, Class B) |
| "ReWalk Robotics" | Lifeward Ltd. | Renamed 2024 |
| "Sarcos Technology" | Palladyne AI Corp. | Renamed 2024 |
| "Aethon (Teradyne)" | Aethon Inc. | **Wrong parent.** ST Engineering acquired Aethon in 2017. Teradyne never owned it. |
| "Universal Robots (Teradyne)" | Universal Robots A/S | Parent correct but does not belong in the name field |
| "Bionik Laboratories" | Bionik Laboratories Corp. | SEC-deregistered 2023; operating status **requires verification before any further publication** |

### Disposition recommendations — robotics-labs (recommend only; do not execute)

| Row | Recommended disposition |
|---|---|
| Boston Dynamics (SPOT demo) | **Delist.** Merge into "Boston Dynamics". Do not average the two composites; 65.6 was assessed against the company and 20.3 against a product. Retain the SPOT weaponisation evidence inside the Boston Dynamics record. |
| Halodi Robotics | **Delist.** Merge into "1X Technologies". Retain 1X's robotics-labs record; see 1.2 for the cross-index resolution. |
| Rethink Robotics | **Delist**, with a dated tombstone note. See §2.4 for the general rule. |
| Picasso Labs (Machina) | **Delist and re-list as "Machina Labs"** with a fresh baseline assessment. The published 48.4 was never a measurement of any company. |
| Paladin AI (Shield AI) | **Delist and re-list as "Shield AI"** with a fresh baseline assessment. The 9.4 composite was plainly assessed against a defence company; Paladin AI Inc. is owed a correction if any of that evidence attached to it. |
| Apexica (RoboKind) | **Rename to "RoboKind"** and re-assess. A rank-3 Exemplary claim cannot rest on a company name that returns no search result. |
| Tesla Optimus | **Rename to "Tesla, Inc."** with an explicit scope note, or delist and cross-reference. |
| Kepler / ReWalk / Sarcos / Aethon / Universal Robots | **Rename in place.** Each needs a 301 redirect, same pattern as `DATA_HYGIENE_SPEC_2026-08-16.md`. |
| Bionik Laboratories | **Hold.** Verify operating status before the next publication cycle. |

## 1.2 ai-labs — true unique count

**50 rows, no within-index duplicates. But 5 of the 50 name a company that already holds a published composite somewhere else in the Compassion Benchmark.**

### Cross-index double publication (5 rows)

| ai-labs row | Composite | Also published as | Composite | Gap |
|---|---:|---|---:|---:|
| Microsoft AI | 75.9 | fortune-500: Microsoft (#26) | 65.3 | 10.6 |
| Amazon AWS AI | 35.9 | fortune-500: Amazon (#427) | **12.8** | **23.1** |
| Meta AI | 26.3 | fortune-500: Meta Platforms (#445) | **7.8** | **18.5** |
| 1X Technologies | 50.0 | robotics-labs: 1X Technologies (#10) | 81.4 | **31.4** |
| Figure AI | 31.3 | robotics-labs: Figure AI (#32) | 48.4 | 17.1 |

Add the two robotics duplicates and **the benchmark currently publishes seven companies at two different scores each, with gaps of up to 45.3 points.** A reader cannot reconcile Amazon at 12.8 (Critical) with Amazon AWS AI at 35.9 (Developing). Both are published, both are current, and nothing on either page explains the other.

DeepMind/Google, Isomorphic Labs and Waymo are *not* in this category. Each is a separately incorporated Alphabet subsidiary with its own leadership and disclosure. Under the rule proposed in §2.3 they legitimately hold their own record. Their names still need correcting.

### Names requiring correction (5 rows)

| Current | Correct | Reason |
|---|---|---|
| "DeepMind/Google" | Google DeepMind | Canonical entity name since the 2023 merger of DeepMind and Google Brain |
| "xAI/Grok" | xAI | Grok is a product |
| "Palantir AI" | Palantir Technologies Inc. | No entity named "Palantir AI" exists |
| "Axon AI" | Axon Enterprise, Inc. | No entity named "Axon AI" exists |
| "Recursion Pharma" | Recursion Pharmaceuticals, Inc. | Truncation |

### Corporate-status checks required before any further publication (2 rows)

| Row | Question |
|---|---|
| Adept AI | Amazon hired the founders and most staff and licensed the technology in June 2024. Does an operating company remain behind the name? |
| Inflection AI | Microsoft hired the founders and most staff in March 2024. The remaining company pivoted to enterprise AI. Is the entity now assessed the same entity that was scored? |

Both need the §2.4 rule applied. Neither is asserted here as defunct.

### Disposition recommendations — ai-labs (recommend only; do not execute)

| Row | Recommended disposition |
|---|---|
| Microsoft AI, Amazon AWS AI, Meta AI | **Delist from ai-labs.** None is separately incorporated. Each parent already carries a whole-company composite in fortune-500. Replace with a cross-reference link on the ai-labs page. |
| 1X Technologies (ai-labs), Figure AI (ai-labs) | **Delist from ai-labs.** Both fail the primary-product test in §2.2: the thing they sell is a robot. Their robotics-labs records survive. |
| Google DeepMind, xAI, Palantir Technologies, Axon Enterprise, Recursion Pharmaceuticals | **Rename in place** with redirects. |
| Adept AI, Inflection AI | **Hold** pending the §2.4 status check. |

## 1.3 Net-new required

Two scenarios per index, because the founder may choose the minimum fix rather than the full criteria.

**ai-labs**

| Scenario | Retained | Net-new to 100 |
|---|---:|---:|
| A — minimum: reassign 1X and Figure AI to robotics only | 48 | **52** |
| B — recommended: also delist the three division records | **45** | **55** |

**robotics-labs**

| Scenario | Retained | Net-new to 100 |
|---|---:|---:|
| A — minimum: merge the two duplicate pairs | 48 | **52** |
| B — recommended: A, plus delist Rethink Robotics (defunct) | 47 | **53** |
| C — B, plus delist Bionik Laboratories if it is not operating, and delist rather than resolve the three fused records | 43 | **57** |

**Planning figure used in Step 4: 55 + 53 = 108 net-new entities**, plus 3 re-assessments of records resolved to a different company (Machina Labs, Shield AI, RoboKind) = **111 full assessments**.

## 1.4 Incidental finding, outside scope

The same slug-collision scan found that `countries.json` contains **"Sao Tome and Principe" and "São Tomé and Príncipe" as two separate rows.** Both slug to `sao-tome-and-principe`. The published count of 193 countries is inflated by at least one. Logged here because the method found it; not in scope for this study.

---

# STEP 2 — Inclusion criteria

A benchmark that cannot explain its roster cannot defend its rankings. These criteria are written to be reproducible by a third party with a search engine.

## 2.0 What "top 100 in the world" means here

**The measure is exposure-weighted significance: how many people the entity's technology can affect, and how little choice those people have about it.**

Four components. Each is independently checkable.

1. **Reach** — the number of people affected. Robots shipped or installed. Procedures performed. Patients served. Monthly active users. Deployment countries.
2. **Dependency** — can the affected person walk away? A surgical robot in the only hospital within 90 minutes ranks above a consumer image generator with ten substitutes.
3. **Vulnerability of the affected population** — children, patients, disabled people, older adults in care, prisoners, migrants, low-wage workers. Higher vulnerability, higher rank.
4. **Institutional weight** — revenue, capital, headcount or state backing large enough that the entity's practices set norms other firms copy.

Rank is driven by reach, dependency and vulnerability together. Institutional weight breaks ties and sets a floor: an entity with negligible reach and negligible weight is not "top 100" however interesting its research.

### Why not capital raised

Capital measures what investors believe about future returns. For a *compassion* benchmark it is a poor proxy and sometimes an inverted one.

In 2026 two of the largest AI rounds went to Safe Superintelligence Inc. (about $7 billion total, roughly 50 employees, no shipped product) and Thinking Machines Lab ($5 billion Series B at a $50 billion valuation). Their current exposure to real people is close to zero. Over the same period Keenon Robotics reached more than 80,000 units deployed across 60-plus countries, much of it in hospitals and eldercare, on far less capital. A capital-ranked roster puts SSI above Keenon. On the question this benchmark asks — does this institution recognise and reduce suffering — that ordering is backwards.

Capital is admissible, but only forward-looking and capped. **Up to 15 slots per index (15%) may go to pre-deployment frontier entities** whose capital and talent concentration make major exposure likely within 24 months. Each such listing must be flagged on the entity page as earned on prospect, not on record.

### Why not benchmark scores, patents, or publication counts

Those measure technical capability. This index does not rank technology. A lab that publishes nothing and quietly runs a safe, well-governed deployment programme should outrank a lab with 200 NeurIPS papers and no incident-disclosure process. Research output is admissible only as *evidence* inside an assessment, never as an *inclusion* criterion.

## 2.1 Threshold for inclusion

An entity qualifies if it meets **at least one** of the following, verifiable from a dated public source:

- **R1 Deployment scale** — 1,000+ units deployed, OR 100,000+ monthly active users, OR use in 10+ countries, OR 10,000+ clinical procedures or episodes of care.
- **R2 Market position** — top 10 by revenue or unit share in a named robotics or AI segment.
- **R3 Vulnerable-population contact** — the technology is used *on* or *by* a population the methodology treats as vulnerable, at any scale above pilot. This is a deliberately low bar: an eldercare companion robot in 900 homes matters more to this benchmark than a code assistant with a million users.
- **R4 Norm-setting weight** — the entity's published practice (a model card, a weaponisation pledge, a safety policy) is measurably copied or explicitly refused by peers.
- **R5 Forward frontier** — capital and talent concentration make R1–R4 likely within 24 months. Capped at 15 slots per index.

## 2.2 AI lab vs robotics lab: the primary-product test

**PPT. The index is determined by what the customer receives.**

- Receives **software, a model, or an API** → **ai-labs**.
- Receives **a physical machine that senses and acts in the world** → **robotics-labs**.
- Receives both → whichever accounts for the **majority of revenue**; if unknown, whichever the entity leads with in its own product hierarchy.

Applied to the live collisions:

| Entity | What the customer receives | Index |
|---|---|---|
| 1X Technologies | A humanoid robot (NEO) | **robotics-labs** |
| Figure AI | A humanoid robot (Figure 03) | **robotics-labs** |
| Physical Intelligence | A model licensed to robot makers | **ai-labs** |
| Skild AI | "Skild Brain", a model licensed across third-party hardware | **ai-labs** |
| Waymo | A ride, delivered by a machine that senses and acts | **robotics-labs** on a literal PPT reading — but see below |

Waymo is the honest hard case. Its current ai-labs placement is defensible because the customer receives a *service*, not a machine, and Waymo sells no hardware. **Rule: where the machine is retained by the entity and the customer buys the service it performs, the index is ai-labs.** That keeps Waymo in ai-labs and would put Nuro (sells vehicles to partners) in robotics-labs. State the rule; do not decide case by case.

**No entity may hold more than one published composite anywhere in the Compassion Benchmark.** This is the hard constraint the PPT exists to serve.

## 2.3 Subsidiaries and divisions

Three rules, in precedence order.

**R-SUB-1 — Separate incorporation wins.** A separately incorporated body with its own leadership and its own public disclosure is its own entity, even if wholly owned. Qualifying today: Google DeepMind, Isomorphic Labs, Waymo, Naver Labs Corp., Universal Robots A/S, Aethon Inc., Sony AI Inc.

**R-SUB-2 — Named business unit, unpublished parent.** Where a globally significant AI or robotics business sits inside a diversified parent and is *not* separately incorporated, list the **named business unit** and scope the assessment to that unit — but only if the parent holds no published composite anywhere in the benchmark. Qualifying candidates: ABB Robotics, Yaskawa Motoman, LG AI Research, Bear Robotics (LG Electronics).

**R-SUB-3 — Published parent blocks the division.** If the parent already holds a published composite, the division may **not** be scored separately. Cross-reference it from the lab index instead.

R-SUB-3 currently bites in five places and is the reason the recommended ai-labs delistings exist:

| Blocked division | Published parent |
|---|---|
| Microsoft AI | Microsoft (fortune-500 #26) |
| Amazon AWS AI | Amazon (fortune-500 #427) |
| Meta AI | Meta Platforms (fortune-500 #445) |
| Johnson & Johnson MedTech (Ottava, Monarch) — *candidate, blocked* | Johnson & Johnson (fortune-500) |
| John Deere autonomous agriculture — *candidate, blocked* | Deere & Company (fortune-500 #168) |

**R-SUB-4 — Latent collision warning.** `fortune-500.json` holds 447 of 500 companies. Several proposed entrants — NVIDIA, Intuitive Surgical, Medtronic, Stryker, Tesla, Symbotic, Zebra, Palantir, Axon — are genuine Fortune 500 firms **absent from the loaded index**. Adding them to a lab index today creates no collision; completing fortune-500 later would create nine. **Decide ownership now, before assessment, and record it.** Recommended tie-break: where AI or robotics is the entity's majority revenue (NVIDIA, Intuitive Surgical), the lab index owns it and fortune-500 cross-references. Where it is a minority segment (Medtronic, Stryker, Tesla), fortune-500 owns it. Under that tie-break Medtronic, Stryker and Tesla become cross-references rather than robotics-labs entries — they are ranked below in the candidate table and marked accordingly.

## 2.4 Defunct, acquired, merged and renamed entities

The methodology has **no not-applicable state**. Every published row must carry a composite, so a defunct company's row publishes a number that cannot be true. Nine such defects are already open across the benchmark.

Proposed rule, four states:

| State | Definition | Treatment |
|---|---|---|
| **Operating** | Trading under its own name, own management | Score normally |
| **Renamed** | Same legal entity, new name (Halodi→1X, ReWalk→Lifeward, Sarcos→Palladyne AI) | **Rename in place.** Score history carries forward. One record only. 301 redirect from the old slug. |
| **Acquired / merged** | Absorbed into an acquirer, no independent disclosure (Harmonic Bionics, Interpublic Group into Omnicom, Silo AI into AMD) | **Freeze and delist within one publication cycle.** The last assessment stays reachable at its slug, stamped `status: acquired`, `as_of: <date>`, `acquirer: <name>`, and is excluded from ranks, means, medians and band counts. The acquirer inherits nothing — a score is a measurement of an institution's behaviour, not an asset. |
| **Defunct** | Ceased operations, insolvent, or deregistered (Rethink Robotics, Monarch Tractor) | **Delist immediately**, same tombstone treatment. |

Two supporting rules:

- **Currency check at assessment time.** Every baseline assessment must open with a dated corporate-status check. No status check, no assessment.
- **Annual roster re-verification.** All 200 entities re-checked once a year against a dated source. Nine open defects accumulated because nobody was checking; a roster of 200 will accumulate them twice as fast.

**Consequence to accept openly:** freezing acquired entities means the indexes shrink between refreshes. A roster of exactly 100 is a publication target, not an invariant. Publishing 97 with three dated tombstones is more honest than publishing 100 with three fictions.

## 2.5 Geographic and sector balance

**Balance is an outcome, not a quota — with one floor and one caveat.**

No country, region or sector quotas. Quotas would require admitting a weaker entity over a stronger one, which is the same defect as pay-for-inclusion in a different costume, and the independence policy forbids it.

**The coverage floor.** The roster must include the highest-reach entity in every major deployment region for each index. Not because those regions deserve representation, but because omitting them makes the index measure *Western corporate disclosure practice* rather than global institutional compassion. Today's rosters fail this floor badly:

| Index | Region | Current | Reality |
|---|---|---|---|
| ai-labs | China | 1 of 50 (DeepSeek) | Four Chinese labs — DeepSeek, Zhipu, MiniMax, Moonshot — held combined valuations above ¥1 trillion by early 2026 |
| ai-labs | India, Southeast Asia, Africa, Latin America | **0 of 50** | India shipped two sovereign foundation models trained end-to-end on domestic compute in February 2026 |
| robotics-labs | Japan | 4 of 50, none of them FANUC or Yaskawa | FANUC alone holds about 18% of the global industrial robot market |
| robotics-labs | Africa, Latin America, South Asia | **0 of 50** | Reflects genuine market concentration; keep as an outcome, disclose it |

**The disclosure-regime caveat — mandatory on every entity page for affected entities.** Entities headquartered in low-disclosure jurisdictions will score lower on transparency-dependent subdimensions (AB3, EQ3, A1, B1) for reasons that are partly structural rather than behavioural. Under the repo's standing **2-convention — absence of disclosure scores 2, never 1** — this shows up as a systematic drag, not as a finding of harm. Every assessment of such an entity must state plainly, in the affected subdimension rows: *this is absence of disclosure, not evidence of harm.* Without that sentence the expanded index will read as a ranking of press-office maturity.

## 2.6 Would the current 50 survive these criteria?

**No. Say so plainly.**

**robotics-labs: 7 of 50 rows (14%) fail on entity integrity alone** — the SPOT demo, Halodi, Rethink, Picasso Labs (Machina), Paladin AI (Shield AI), Apexica (RoboKind), Tesla Optimus. Two of the failures sit inside the top 20; one sits at rank 3.

**ai-labs: 5 of 50 rows (10%) fail the no-double-publication rule.**

**Both fail the coverage floor**, as tabulated above.

And on the exposure measure in §2.0, several current members would not make a genuine top 50: Typeface, Labelbox, Pika Labs and Poolside in ai-labs; Schunk (a gripper maker, not a robot maker) and Symbio Robotics in robotics-labs. That is not a criticism of those companies. It is what happens when a 50-slot list is filled before the measure is written.

**This is the strongest argument for the expansion.** At 100 slots those companies are legitimate long-tail members. At 50, listing them while omitting NVIDIA, Alibaba, ByteDance, Tencent, FANUC, ABB, Yaskawa, KUKA and Intuitive Surgical is indefensible on any measure anyone would publish.

---

# STEP 3 — Candidate lists

## How to read these tables

**Slug** is derived exactly as `site/src/lib/slugify.ts` would. All 116 candidate slugs were tested against every name in all eight published indexes: **zero collisions.**

**Verification key**

| Code | Meaning |
|---|---|
| **V** | Existence, approximate scale and current operating status all confirmed by a dated source retrieved during this study |
| **P** | Named in a dated source retrieved during this study; scale or operating status not independently confirmed |
| **U** | **Not verified in this study.** Carried on analyst knowledge. Must be verified before assessment. Ranked below all V and P candidates. |

**THIN** marks a candidate expected to be evidence-thin — a small private company with little public disclosure. Under the 2-convention these will score near 2 across most subdimensions. **That is absence of disclosure, not evidence of harm**, and the assessment brief must say so in the affected rows.

**A hard caveat on these sources.** They establish *existence, scale and operating status for selection purposes only*. Several are secondary aggregators of unknown reliability. **None of them is scoring evidence.** Assessment requires Tier 3 or better under the methodology's evidence hierarchy, gathered fresh.

---

## 3.1 ai-labs — 58 ranked candidates for 55 slots

### Batch 1 — ranks 1–15: highest confidence, highest exposure

| # | Entity | Slug | HQ | Sector | Rationale (criterion) | Status | Ver | Source |
|---:|---|---|---|---|---|---|---|---|
| 1 | NVIDIA Corporation | `nvidia-corporation` | USA | AI/Hardware & Open Models | ~90% share of data-centre GPUs; $216B FY2026 revenue; ships the Nemotron open-model family. The index already scores four AI-hardware firms and omits the largest. (R1, R2, R4) | Operating, 2026-05-12 | V | [SEC DEF 14A FY2026](https://www.sec.gov/Archives/edgar/data/0001045810/000104581026000036/nvda-20260512.htm); [Nemotron 3 launch](https://nvidianews.nvidia.com/news/nvidia-debuts-nemotron-3-family-of-open-models) |
| 2 | ByteDance | `bytedance` | China | AI/Consumer & Social | Doubao is China's most-used consumer AI app at 155M weekly active users; recommender systems reach roughly a billion people including minors. Highest raw human exposure of any candidate. (R1, R3) | Operating, 2026-08-01 | V | [Big Hat Group, China AI Weekly 2026-08-01](https://www.bighatgroup.com/blog/china-ai-weekly-2026-08-01/) |
| 3 | Alibaba Group Holding | `alibaba-group-holding` | China | AI/Cloud & Open Models | Qwen is the most-downloaded open-weight model family outside the US; Qwen3.5 released Feb–Mar 2026 under Apache 2.0. Sets the global open-weights norm. (R1, R2, R4) | Operating, 2026-08-01 | V | [Digital Applied, Chinese AI Models Q2 2026](https://www.digitalapplied.com/blog/chinese-ai-models-q2-2026-market-share-report) |
| 4 | Tencent Holdings | `tencent-holdings` | China | AI/Consumer & Social | Hunyuan open weights plus WeChat-scale deployment; largest single point of contact between Chinese AI and everyday life. (R1, R3) | Operating, 2026 | P | [IntuitionLabs, Chinese open-source LLMs](https://intuitionlabs.ai/articles/chinese-open-source-llms-2025) |
| 5 | Zhipu AI | `zhipu-ai` | China | AI Research | Listed in Hong Kong as Knowledge Atlas Technology; market capitalisation about HK$434.7B. Publicly listed, so disclosure exists to assess. (R1, R2) | Operating, listed 2026 | V | [Dealroom, inside China's AI ecosystem](https://dealroom.co/news/136199-inside-chinas-ai-ecosystem-beyond-deepseek-zhipu-minimax-moonshot-byteda/) |
| 6 | MiniMax | `minimax` | China | AI/Consumer & Multimodal | Hong Kong listed at about HK$257.3B; consumer companion and video products place it in direct contact with minors — the exact risk surface that floored Character AI. (R1, R3) | Operating, listed 2026 | V | [Dealroom](https://dealroom.co/news/136199-inside-chinas-ai-ecosystem-beyond-deepseek-zhipu-minimax-moonshot-byteda/) |
| 7 | Moonshot AI | `moonshot-ai` | China | AI Research | Raised $2B at a $20B valuation, May 2026; Kimi is a top-tier open-weights release. (R1, R5) | Operating, 2026-05-07 | V | [TechCrunch, 2026-05-07](https://techcrunch.com/2026/05/07/chinas-moonshot-ai-raises-2b-at-20b-valuation-as-demand-for-open-source-ai-skyrockets/) |
| 8 | Baidu, Inc. | `baidu` | China | AI/Search | ERNIE 5.1 released 2026-05-08; search-scale deployment across Chinese consumers. (R1, R2) | Operating, 2026-07-27 | V | [Digital Applied](https://www.digitalapplied.com/blog/chinese-ai-models-q2-2026-market-share-report) |
| 9 | Hippocratic AI | `hippocratic-ai` | USA | AI/Healthcare | Patient-facing clinical outreach — intake, chronic-care check-ins, discharge follow-up — at a $3.5B valuation. **The single most compassion-relevant candidate in either index:** an AI system talking directly to sick people who did not choose it. (R1, R3) | Operating, 2026 | V | [AI Funding Tracker, top AI healthcare startups](https://aifundingtracker.com/top-ai-healthcare-startups/) |
| 10 | Allen Institute for AI | `allen-institute-for-ai` | USA | AI Research/Open Source | OLMo publishes weights, checkpoints, training data and evaluation code — the highest voluntary transparency of any lab in the index. Its 2026 senior-researcher departures to Microsoft are themselves a live I5 resilience test. (R4) | Operating, 2026 | V | [allenai.org/blog/olmo2](https://allenai.org/blog/olmo2); [Ai2 NSF OMAI](https://allenai.org/omai) |
| 11 | LG AI Research | `lg-ai-research` | South Korea | AI Research | EXAONE 4.5 multimodal release; survived the latest cut in Korea's national sovereign-AI programme on 2026-08-18. Named institute, own leadership, own publication stream (R-SUB-2). (R2, R4) | Operating, 2026-08-18 | V | [Korea Times, 2026-08-18](https://www.koreatimes.co.kr/amp/business/tech-science/20260818/lg-ai-research-sk-telecom-upstage-survive-next-cut-in-national-ai-model-project); [EXAONE 4.5 release](https://www.prnewswire.com/news-releases/lg-reveals-next-gen-multimodal-ai-exaone-4-5-302736993.html) |
| 12 | Sarvam AI | `sarvam-ai` | India | AI Research | Sarvam 30B and 105B open-sourced Feb 2026 — the first Indian foundation models trained end-to-end on IndiaAI Mission compute, covering 22 scheduled languages. Closes the largest coverage-floor gap in the index. (R2, R3, R4) | Operating, 2026-02-19 | V | [Business Standard, 2026-02-19](https://www.business-standard.com/technology/tech-news/india-ai-impact-summit-2026-sovereign-models-sarvam-bharatgen-gnani-126021900417_1.html); [Wikipedia: Sarvam AI](https://en.wikipedia.org/wiki/Sarvam_AI) |
| 13 | Technology Innovation Institute | `technology-innovation-institute` | UAE | AI Research | Falcon is the most-cited open-weights model family from the Gulf; Falcon-H1 leads the Open Arabic LLM Leaderboard. Arabic-language access is a direct EQ1 universality question. (R2, R4) | Operating, 2026 | V | [Middle East AI News](https://www.middleeastainews.com/p/uae-us-plan-5gw-ai-cluster-arabic) |
| 14 | Physical Intelligence | `physical-intelligence` | USA | AI/Robotics Foundation Models | pi-0.5 trained across 7 platforms, 68 tasks and 104 homes; about $470M raised. Licenses a model, not a robot, so ai-labs under the PPT. **Homes** is the key word — this is a model operating in private domestic space. (R3, R5) | Operating, 2026 | V | [New Market Pitch, physical AI fundraising](https://newmarketpitch.com/blogs/news/physical-ai-top-startups-fundraising) |
| 15 | Skild AI | `skild-ai` | USA | AI/Robotics Foundation Models | $1.4B Series C led by SoftBank above a $14B valuation; partnerships with ABB, Universal Robots, MiR, NVIDIA and Foxconn; acquired Zebra's robotics division. One model, many bodies — a systemic-risk surface. (R4, R5) | Operating, 2026 | V | [Black Scarab, Skild AI deep dive](https://www.blackscarab.ai/insights/skild-ai-general-purpose-robot-brain-guide) |

### Batch 2 — ranks 16–30: high people-impact application labs

| # | Entity | Slug | HQ | Sector | Rationale | Status | Ver | Source |
|---:|---|---|---|---|---|---|---|---|
| 16 | Ambience Healthcare | `ambience-healthcare` | USA | AI/Healthcare | $243M Series C, July 2025, at $1.25B; ambient clinical documentation inside consultations. (R1, R3) | Operating, 2025-07 | V | [New Market Pitch, healthcare AI funding](https://newmarketpitch.com/blogs/news/healthcare-ai-funding-analysis) |
| 17 | Nabla | `nabla` | France/USA | AI/Healthcare | Roughly 190 health systems; expanded to 31 additional languages — a direct A2 contextual-sensitivity claim to test. (R1, R3) | Operating, 2026 | V | [AI Funding Tracker](https://aifundingtracker.com/top-ai-healthcare-startups/) |
| 18 | Suki AI | `suki-ai` | USA | AI/Healthcare | About $168M raised; clinical voice documentation at health-system scale. (R1, R3) | Operating, 2026 | P | [AI Scribes 2026 vendor comparison](https://lifevalue.com/blog/ai-scribes-2026) |
| 19 | Slingshot AI | `slingshot-ai` | USA | AI/Mental Health | "Ash" is a leading consumer AI-therapy product in 2026. Given the Character AI floor designation, consumer mental-health AI is the highest-risk unassessed category in the benchmark. (R3) | Operating, 2026 | V | [Psychology.com, AI therapy companies](https://psychology.com/ai-therapy/companies) |
| 20 | Wysa | `wysa` | UK/India | AI/Mental Health | FDA Breakthrough Device Designation; employer and health-system contracts; acquired April Health and Kins in 2025. A rare case with clinical-evidence disclosure to assess. (R1, R3) | Operating, 2026 | V | [PDP Spectra, AI in mental health tech 2026](https://pdpspectra.com/blog/ai-mental-health-tech-2026/) |
| 21 | Safe Superintelligence Inc. | `safe-superintelligence` | USA/Israel | AI Safety/Research | About $7B raised including $5B from NVIDIA in July 2026, roughly 50 staff, no product and no published papers. **Forward-frontier slot (R5).** Also the clearest test of whether the methodology can score an entity that discloses nothing — expect near-uniform 2s. | Operating, 2026-07 | V | [Wikipedia: Safe Superintelligence Inc.](https://en.wikipedia.org/wiki/Safe_Superintelligence_Inc.); [ssi.inc](https://ssi.inc/) |
| 22 | Thinking Machines Lab | `thinking-machines-lab` | USA | AI Research | $12B seed July 2025; $5B Series B at $50B, March 2026. **Forward-frontier slot (R5).** | Operating, 2026-03 | V | [Wikipedia: Thinking Machines Lab](https://en.wikipedia.org/wiki/Thinking_Machines_Lab) |
| 23 | Hume AI | `hume-ai` | USA | AI/Emotion & Voice | Builds emotion recognition and empathic voice interfaces. An institution that sells *simulated empathy* is the sharpest possible test of the EMP dimension and of I2 non-performance. (R3, R4) | Operating, 2026 | P | [hume.ai](https://www.hume.ai/) |
| 24 | Synthesia | `synthesia` | UK | AI/Video & Avatars | About $4B valuation; synthetic human likeness at enterprise scale makes B5 consent orientation a first-order question, not a formality. (R1, R3) | Operating, 2026 | V | [Foundevo, most valuable European AI startups 2026](https://www.foundevo.com/top-most-valuable-ai-startups-in-europe/) |
| 25 | Black Forest Labs | `black-forest-labs` | Germany | AI/Creative | $300M Series B, Feb 2026, at $3.25B; FLUX is the most-used open image model. Non-consensual imagery is the live harm surface. (R1, R2) | Operating, 2026-02 | V | [European Cloud](https://european.cloud/2025/12/black-forest-labs-most-valuable-ai-company/); [Crunchbase News](https://news.crunchbase.com/ai/image-generator-europe-unicorn-black-forest-labs-raise/) |
| 26 | Helsing | `helsing` | Germany | AI/Defence | €600M Series D at €12B. Europe's largest defence-AI company. The index already scores Anduril, Palantir and Shield AI; omitting Helsing makes the defence cohort US-only. (R2, R4) | Operating, 2026 | V | [Foundevo](https://www.foundevo.com/top-most-valuable-ai-startups-in-europe/) |
| 27 | Wayve | `wayve` | UK | AI/Autonomous Driving | $1.2B raised, backed by NVIDIA, Microsoft, Uber, Mercedes-Benz, Nissan and Stellantis. Public-road deployment: bystanders bear the risk without consenting. (R1, R3) | Operating, 2026 | V | [AI Funding Tracker, Europe](https://aifundingtracker.com/top-ai-startups-in-europe/) |
| 28 | G42 | `g42` | UAE | AI/Infrastructure | Anchors Stargate UAE, a planned 5GW compute cluster with OpenAI, Oracle, Cisco, NVIDIA and SoftBank. Compute siting is a water, power and land question for real communities. (R2, R4) | Operating, 2026-04 | V | [UAE Inform, UAE AI ecosystem 2026](https://uaeinform.com/business-guide/uae-ai-ecosystem) |
| 29 | HUMAIN | `humain` | Saudi Arabia | AI/Infrastructure | State-backed; NVIDIA partnership targeting 500MW, first phase 18,000 GB300 systems. State-owned AI is a distinct accountability structure the index has never assessed. (R2, R4) | Operating, 2026 | V | [PDP Spectra, sovereign AI 2026](https://pdpspectra.com/blog/sovereign-ai-initiatives-2026/) |
| 30 | Naver Corporation | `naver-corporation` | South Korea | AI/Search | HyperCLOVA X, Korean-language sovereign model at search scale. Note: Naver Labs Corp. is separately incorporated and already sits in robotics-labs; under R-SUB-1 both records are legitimate. Document the relationship on both pages. (R1, R2) | Operating, 2026 | V | [AI Tech In, AI beyond US and China](https://aitechin.substack.com/p/ai-beyond-the-us-and-china-10-powerful) |

### Batch 3 — ranks 31–45: regional coverage and enterprise scale

| # | Entity | Slug | HQ | Sector | Rationale | Status | Ver | Source |
|---:|---|---|---|---|---|---|---|---|
| 31 | Preferred Networks | `preferred-networks` | Japan | AI Research | PLaMo 2.0 Prime selected by Japan's Digital Agency in March 2026 for deployment to about 180,000 government staff. (R1, R2) | Operating, 2026-03 | V | [AI Tech In](https://aitechin.substack.com/p/ai-beyond-the-us-and-china-10-powerful) |
| 32 | NTT Corporation | `ntt-corporation` | Japan | AI Research | tsuzumi 2 (Oct 2025), 30B parameters on a single H100; selected for the same Japanese government deployment. (R1, R2) | Operating, 2026-03 | V | [AI Tech In](https://aitechin.substack.com/p/ai-beyond-the-us-and-china-10-powerful) |
| 33 | Glean | `glean` | USA | AI/Enterprise Search | About $300M annualised revenue on a $7.2B valuation; reads across employees' entire internal corpus — an I3 internal-consistency and surveillance question. (R1) | Operating, 2026-05 | V | [Crunchbase News](https://news.crunchbase.com/venture/ai-powered-work-assistant-glean-valuation-jumps/) |
| 34 | Sierra AI | `sierra-ai` | USA | AI/Customer Service Agents | $100M ARR in under two years; $350M at a $10B valuation. Its agents *are* the complaints channel for large enterprises — directly load-bearing on AWR and E4. (R1, R3) | Operating, 2026 | V | [AI Funding Tracker, AI agents](https://aifundingtracker.com/top-ai-agent-startups/) |
| 35 | Upstage | `upstage` | South Korea | AI Research | Survived the same 2026-08-18 cut in Korea's national AI programme. (R2) | Operating, 2026-08-18 | V | [Korea Times, 2026-08-18](https://www.koreatimes.co.kr/amp/business/tech-science/20260818/lg-ai-research-sk-telecom-upstage-survive-next-cut-in-national-ai-model-project) |
| 36 | ELYZA | `elyza` | Japan | AI Research | Llama-3.1-ELYZA-JP-70B selected for Japanese government deployment. KDDI subsidiary; separately incorporated (R-SUB-1). (R1, R2) | Operating, 2026-03 | V | [AI Tech In](https://aitechin.substack.com/p/ai-beyond-the-us-and-china-10-powerful) |
| 37 | Krutrim | `krutrim` | India | AI Research | India's first AI unicorn; Krutrim-3 supports all 22 scheduled languages. (R2, R3) | Operating, 2026 | V | [Rest of World, 2026](https://restofworld.org/2026/india-frugal-ai-sarvam-krutrim-sovereign/) |
| 38 | BharatGen | `bharatgen` | India | AI Research/Public | Government-backed Param2, 17B parameters, 22 languages, launched Feb 2026. Publicly funded AI is a distinct accountability structure. (R2, R3) | Operating, 2026-02 | V | [Business Standard, 2026-02-19](https://www.business-standard.com/technology/tech-news/india-ai-impact-summit-2026-sovereign-models-sarvam-bharatgen-gnani-126021900417_1.html) |
| 39 | Sony AI Inc. | `sony-ai` | Japan | AI Research | Separately incorporated (R-SUB-1); publishes AI-ethics research and dataset-bias work that is directly EQ3-relevant. (R4) | Operating, 2026 | U | THIN — verify before assessment |
| 40 | Reflection AI | `reflection-ai` | USA | AI/Agents | Unicorn status Q1 2026 at $1.5B; agentic coding. **Forward-frontier slot (R5).** | Operating, 2026-Q1 | V | [Presenc AI, frontier lab tracker](https://presenc.ai/research/frontier-lab-tracker-thinking-machines-ssi-xai-2026) |
| 41 | World Labs | `world-labs` | USA | AI Research/Spatial | Researcher-led spatial-intelligence lab in the 2026 cohort. **Forward-frontier slot (R5).** THIN. | Operating, 2026 | P | [Radical Ventures, the rise of NeoLabs](https://radical.vc/the-rise-of-the-neolab/) |
| 42 | DeepL | `deepl` | Germany | AI/Translation | Among Germany's six most valuable AI companies. Translation is an access-design (EQ4) technology for migrants, patients and non-dominant-language speakers. (R1, R3) | Operating, 2026 | V | [Foundevo](https://www.foundevo.com/top-most-valuable-ai-startups-in-europe/) |
| 43 | EleutherAI | `eleutherai` | USA | AI Research/Nonprofit | Grassroots nonprofit; produced GPT-NeoX, Pythia and the Pile. Publishes dataset provenance almost no commercial lab discloses. (R4) | Operating, 2026 | P | [Ai2 peer context](https://allenai.org/omai) |
| 44 | Kyutai | `kyutai` | France | AI Research/Nonprofit | French nonprofit open-science lab; open speech models. THIN. (R4) | Operating, 2026 | U | Verify before assessment |
| 45 | Woebot Health | `woebot-health` | USA | AI/Mental Health | **Status caution.** Retired its consumer app on 2025-06-30 after about 1.5 million users and pivoted to enterprise. Founder cited FDA-pathway cost. **Apply the §2.4 currency check first:** if the entity operates, it is a rare case of a company withdrawing a product on safety and regulatory grounds — a genuine I2 and B4 test. If it does not, do not list. | Pivoted 2025-06-30; operating status to confirm | V | [Best AI Therapy, Woebot review](https://bestaitherapy.ai/reviews/woebot-review/) |

### Batch 4 — ranks 46–58: reserve pool (13 candidates for 10 remaining slots)

| # | Entity | Slug | HQ | Sector | Rationale | Status | Ver | Source |
|---:|---|---|---|---|---|---|---|---|
| 46 | Anysphere | `anysphere` | USA | AI/Software Dev | Cursor, roughly $4B annualised revenue by June 2026. **Corporate status contested:** a reported $60B SpaceX acquisition (June 2026) rests on low-quality sources and is not confirmed. **Do not assess until ownership is verified** — an acquisition would trigger §2.4. | **Disputed** | P | [Value Add VC, Cursor](https://valueaddvc.com/company/cursor) |
| 47 | Aidoc | `aidoc` | Israel | AI/Healthcare — radiology triage | Triage decides who is seen first. Directly AC1 and EQ2. THIN on public outcome data. | Operating (assumed) | U | Verify |
| 48 | Owkin | `owkin` | France | AI/Drug Discovery | Federated learning on hospital data; a consent-architecture case. THIN. | Operating (assumed) | U | Verify |
| 49 | Insilico Medicine | `insilico-medicine` | Hong Kong/UAE | AI/Drug Discovery | AI-discovered molecules in clinical trials. THIN. | Operating (assumed) | U | Verify |
| 50 | Nous Research | `nous-research` | USA | AI/Open Source | Open-weights collective; decentralised training. THIN. | Operating (assumed) | U | Verify |
| 51 | Suno | `suno` | USA | AI/Creative — music | Major rights litigation makes AB1, AB5 and EQ5 unusually testable. THIN on governance disclosure. | Operating (assumed) | U | Verify |
| 52 | Luma AI | `luma-ai` | USA | AI/Creative — video | Consumer video generation at scale. THIN. | Operating (assumed) | U | Verify |
| 53 | Tenstorrent | `tenstorrent` | USA/Canada | AI/Hardware | Open-source RISC-V AI silicon. THIN. | Operating (assumed) | U | Verify |
| 54 | Graphcore | `graphcore` | UK | AI/Hardware | SoftBank-owned since 2024. **Check R-SUB-3:** SoftBank Robotics already sits in robotics-labs — confirm no parent conflict before listing. | Acquired by SoftBank, 2024 | U | Verify |
| 55 | d-Matrix | `d-matrix` | USA | AI/Hardware | Inference-efficiency silicon. THIN. | Operating (assumed) | U | Verify |
| 56 | Cresta | `cresta` | USA | AI/Contact Centre | Real-time coaching of call-centre workers — a strong I3 internal-compassion and worker-surveillance case. THIN. | Operating (assumed) | U | Verify |
| 57 | AI Singapore | `ai-singapore` | Singapore | AI Research/Public | SEA-LION covers Southeast Asian languages; closes a coverage-floor gap. THIN. | Operating (assumed) | U | Verify |
| 58 | Writer | `writer` | USA | AI/Enterprise | Enterprise writing platform. **Slug `writer` is generic and collision-prone** — prefer `writer-inc` if listed. THIN. | Operating (assumed) | U | Verify |

**Deliberately excluded, with reasons.** Khan Academy and Duolingo were considered and rejected: both deploy major AI tutoring systems (over 50 million learners combined) but their primary product is education, so they fail the primary-product test. Recommend a future education index instead. Yandex and Sber were rejected on entity-currency grounds — both underwent restructuring whose outcome this study could not verify. StepFun, 01.AI and Baichuan sit just below the line on reach; hold as reserves.

---

## 3.2 robotics-labs — 58 ranked candidates for 53 slots

### Batch 1 — ranks 1–15: highest confidence, highest human contact

| # | Entity | Slug | HQ | Category | Rationale | Status | Ver | Source |
|---:|---|---|---|---|---|---|---|---|
| 1 | Intuitive Surgical, Inc. | `intuitive-surgical` | USA | Healthcare/Surgical | More than 11,100 da Vinci systems installed as of December 2025; roughly 71% segment share. **The largest robotics company by human contact on earth, absent from a top-50 robotics index.** Robotics is essentially 100% of revenue, so the lab index owns it under R-SUB-4. (R1, R2, R3) | Operating, 2025-12 | V | [PDP Spectra, surgical robotics 2026](https://pdpspectra.com/blog/surgical-robotics-2026/); [MedTech Dive, H1 2026](https://www.medtechdive.com/news/top-surgical-robotics-stories-in-the-first-half-of-2026/824547/) |
| 2 | Intuition Robotics | `intuition-robotics` | Israel | Care/Companionship | ElliQ deployed by the New York State Office for the Aging to 800+ older adults, about 900 units; 94% report feeling less lonely. **The only candidate with a state-government outcome evaluation already published** — Tier 4 evidence, ready to assess. (R1, R3) | Operating, 2026-02 | V | [NYSOFA project update, Feb 2026 (PDF)](https://aging.ny.gov/system/files/documents/2026/02/nysofa-elliq-project-update-2026.pdf); [Robotics 24/7](https://www.robotics247.com/article/elliq_companion_robot_reduces_loneliness_95_percent_finds_new_york_state_rollout/healthcare) |
| 3 | FANUC Corporation | `fanuc-corporation` | Japan | Industrial | About 18% of the global industrial robot market; $7.2B 2025 revenue; largest installed base and a 270-location service network. Labour displacement is the core SYS question the index exists to ask. (R1, R2, R4) | Operating, 2026 | V | [EVS International, top industrial robot manufacturers 2026](https://www.evsint.com/top-industrial-robot-manufacturers/); [Visual Capitalist](https://www.visualcapitalist.com/the-worlds-top-industrial-robotics-companies-by-market-share/) |
| 4 | ABB Robotics | `abb-robotics` | Switzerland/Sweden | Industrial | Second largest at about $3.8B 2025 revenue. Named business unit of ABB Ltd, which holds no published composite — permitted under R-SUB-2. (R1, R2) | Operating, 2026 | V | [EVS International](https://www.evsint.com/top-industrial-robot-manufacturers/) |
| 5 | Yaskawa Electric Corporation | `yaskawa-electric` | Japan | Industrial | About 12% global share, $3.5B 2025 revenue, Motoman division. (R1, R2) | Operating, 2026 | V | [EVS International](https://www.evsint.com/top-industrial-robot-manufacturers/) |
| 6 | KUKA AG | `kuka` | Germany | Industrial | About $3.2B 2025 revenue; Midea-owned since 2016. Completes the Big Four. (R1, R2) | Operating, 2026 | V | [EVS International](https://www.evsint.com/top-industrial-robot-manufacturers/) |
| 7 | Keenon Robotics | `keenon-robotics` | China | Service/Healthcare | More than 80,000 units across 60-plus countries, including hospitals and eldercare. Among the highest deployed-unit counts of any service robot maker worldwide. (R1, R3) | Operating, 2026 | V | [Layer3 Labs, service robots 2026](https://www.layer3labs.io/robotics/service-robots-for-business) |
| 8 | Pudu Robotics | `pudu-robotics` | China | Service/Hospitality & Healthcare | PuduBot 2 across restaurants, hotels and healthcare; among the largest service-robot fleets globally. (R1, R3) | Operating, 2026 | V | [pudurobotics.com](https://www.pudurobotics.com/en/products/pudubot2) |
| 9 | Hocoma AG (DIH Holding) | `hocoma` | Switzerland | Healthcare/Rehab | About 16% of the rehabilitation robotics market — the largest share of any firm. Lokomat and Armeo; new platform November 2025. The index already scores five rehab firms and omits the market leader. (R1, R2, R3) | Operating, 2025-11 | V | [Mordor Intelligence, rehab robots companies](https://www.mordorintelligence.com/industry-reports/rehabilitation-robots-market/companies); [OpenPR, Nov 2025](https://www.openpr.com/news/4454159/leading-companies-advancing-innovation-and-growth-in) |
| 10 | AgiBot (Zhiyuan Robotics) | `agibot` | China | Labor/Humanoid | Shipped 5,100+ humanoids in 2025, passing 10,000 cumulative by March 2026 — about 39% of global humanoid share. **Higher shipped volume than any humanoid maker currently in the index.** (R1, R2) | Operating, 2026-03 | V | [Forbes, Chinese robotics startups, 2026-04-01](https://www.forbes.com/sites/edithyeung/2026/04/01/these-10-chinese-robotics-startups-are-winning-the-most-vc-funding/) |
| 11 | Symbotic Inc. | `symbotic` | USA | Logistics/Warehouse | $676M quarterly revenue, up 23% year on year; 70 systems deployed. Warehouse automation is the largest single site of robot-driven labour change. (R1, R2) | Operating, 2026 | V | [ETF Trends, 2026 robotics update](https://www.etftrends.com/artificial-intelligence-content-hub/robotics-update-physical-ai-ecosystem/) |
| 12 | Relay Robotics, Inc. | `relay-robotics` | USA | Healthcare/Service | Hospital delivery robots marketed explicitly on reducing nurse burnout and attrition — a rare vendor claim that maps directly onto B1 self-sustainability and is testable against nursing outcomes. (R1, R3) | Operating, 2026 | V | [relayrobotics.com](https://relayrobotics.com/relay-delivery-robots-for-hospitals) |
| 13 | German Bionic Systems GmbH | `german-bionic` | Germany | Industrial/Exoskeleton | Exia exoskeleton at CES 2026, up to 38kg dynamic lift support; acquired by Archimedes Partners and continuing to operate. Worker musculoskeletal injury is a core compassion outcome. (R1, R3) | Operating; acquired by Archimedes Partners, 2026 | V | [German Bionic, CES 2026](https://www.germanbionic.com/news/ai-to-wear-german-bionic-presents-the-exia-robotic-exoskeleton-at-ces-2026); [acquisition notice](https://www.germanbionic.com/news/archimedes-partners-acquires-german-bionic-to-scale-ai-powered-exoskeleton-platform) |
| 14 | CMR Surgical Ltd | `cmr-surgical` | UK | Healthcare/Surgical | Versius deployed in Europe, India and other markets; still awaiting FDA clearance. Priced and positioned for health systems that cannot afford da Vinci — a direct EQ4 access-design case. (R1, R3) | Operating, 2026 | V | [Standard Bots, surgical robotics companies 2026](https://standardbots.com/blog/surgical-robotics-companies) |
| 15 | Bear Robotics | `bear-robotics` | USA/South Korea | Service/Hospitality | Servi deployed across 25,000+ restaurants. LG Electronics is majority owner and holds no published composite, so R-SUB-2 permits the listing. (R1) | Operating, 2026 | V | [Layer3 Labs](https://www.layer3labs.io/robotics/service-robots-for-business) |

### Batch 2 — ranks 16–30: accessibility, humanoids, logistics

| # | Entity | Slug | HQ | Category | Rationale | Status | Ver | Source |
|---:|---|---|---|---|---|---|---|---|
| 16 | Glidance, Inc. | `glidance` | USA | Accessibility/Blind mobility | Glide, a self-guided mobility aid for blind and low-vision users, using haptic and audio feedback. Precisely the accessibility category where Open Bionics and Ottobock earn the index's two highest scores. (R3) | Operating, 2026 | V | [glidance.io](https://glidance.io/); [MassRobotics profile](https://www.massrobotics.org/meet-glidance-the-us-startup-reinventing-assistive-technology-with-glide-the-worlds-first-self-guided-mobility-aid/) |
| 17 | Esper Bionics | `esper-bionics` | Ukraine/USA | Healthcare/Prosthetics | Esper Hand, AI-driven prosthetic with FDA and PDAC approvals. Founded in wartime Ukraine serving amputees — a distinctive EQ2 and EQ5 case. (R3) | Operating, 2026 | V | [esperbionics.com](https://www.esperbionics.com/) |
| 18 | Myomo, Inc. | `myomo` | USA | Healthcare/Assistive | MyoPro powered arm brace; NYSE-listed, so audited disclosure exists. Named among the leading rehabilitation robotics firms. (R1, R3) | Operating, 2026 | V | [Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/rehabilitation-robots-market/companies) |
| 19 | Tyromotion GmbH | `tyromotion` | Austria | Healthcare/Rehab | Named among the leading rehabilitation robotics manufacturers; upper-limb and hand therapy. (R1, R3) | Operating, 2026 | V | [Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/rehabilitation-robots-market/companies) |
| 20 | Galbot | `galbot` | China | Service/Humanoid | Valuation above ¥20 billion; multiple 2026 rounds; restructured ahead of an IPO. Retail and service deployment. (R2, R5) | Operating, 2026 | V | [The Global Economics, 2026-07-28](https://theglobaleconomics.com/2026/07/28/chinas-humanoid/) |
| 21 | LimX Dynamics | `limx-dynamics` | China | Research/Humanoid | $200M raised at a $2.21B valuation; pursuing a public listing. (R2, R5) | Operating, 2026 | V | [The Global Economics](https://theglobaleconomics.com/2026/07/28/chinas-humanoid/) |
| 22 | Robot Era | `robot-era` | China | Research/Humanoid | Raised more than $200M, April 2026. (R5) | Operating, 2026-04-27 | V | [Caixin Global, 2026-04-27](https://www.caixinglobal.com/2026-04-27/robot-era-raises-more-than-200-million-as-chinas-humanoid-robot-race-heats-up-102438549.html) |
| 23 | EngineAI Robotics | `engineai-robotics` | China | Research/Humanoid | Closed rounds of about ¥1 billion since the start of 2026. (R5) | Operating, 2026 | V | [The Global Economics](https://theglobaleconomics.com/2026/07/28/chinas-humanoid/) |
| 24 | Locus Robotics | `locus-robotics` | USA | Logistics/Warehouse | Among the warehouse-automation firms past major funding milestones; large deployed fleet alongside human pickers. Human-robot pace-setting is a direct I3 question. (R1) | Operating, 2026 | V | [ETF Trends](https://www.etftrends.com/artificial-intelligence-content-hub/robotics-update-physical-ai-ecosystem/) |
| 25 | Geekplus (Beijing Geekplus Technology) | `geekplus` | China | Logistics/Warehouse | Named among the leading warehouse automation firms globally. Note: the trading name "Geek+" slugs to the bare token `geek`; **use the full legal name.** (R1, R2) | Operating, 2026 | V | [ETF Trends](https://www.etftrends.com/artificial-intelligence-content-hub/robotics-update-physical-ai-ecosystem/) |
| 26 | Exotec | `exotec` | France | Logistics/Warehouse | Named among the leading warehouse automation firms; Europe's largest. (R1, R2) | Operating, 2026 | V | [ETF Trends](https://www.etftrends.com/artificial-intelligence-content-hub/robotics-update-physical-ai-ecosystem/) |
| 27 | Skydio, Inc. | `skydio` | USA | Defence/Inspection | $110M Series F; $3.5B planned US manufacturing investment; sells to military and police. **Police drone deployment over residential neighbourhoods is a first-order EQ and BND question**, and the index's defence cohort currently has no US police-facing entity other than Axon. (R1, R3) | Operating, 2026 | V | [ETF Trends](https://www.etftrends.com/artificial-intelligence-content-hub/robotics-update-physical-ai-ecosystem/) |
| 28 | Carbon Robotics | `carbon-robotics` | USA | Agriculture | CNBC Disruptor 50 (May 2026); operating in 15 countries with Netherlands manufacturing. Laser weeding displaces the most precarious agricultural labour there is. (R1, R3) | Operating, 2026-05-19 | V | [CNBC, 2026-05-19](https://www.cnbc.com/2026/05/19/carbon-robotics-cnbc-disruptor-50-ranking.html) |
| 29 | WHILL, Inc. | `whill` | Japan | Accessibility/Personal mobility | Modo Breeze ultralight power chair; airport mobility fleets. Mobility for disabled people is core EQ4. (R1, R3) | Operating, 2026 | P | [Extreme Motus, innovative mobility equipment 2026](https://extrememotus.com/innovative-mobility-equipment/) |
| 30 | Scewo AG | `scewo` | Switzerland | Accessibility/Wheelchair | Scewo BRO, a stair-climbing power wheelchair. Removes a built-environment barrier rather than asking the user to route around it. THIN on outcome data. (R3) | Operating, 2026 | P | [Extreme Motus](https://extrememotus.com/innovative-mobility-equipment/) |

### Batch 3 — ranks 31–45: surgical, mobility and industrial depth (verification required)

| # | Entity | Slug | HQ | Category | Rationale | Status | Ver | Source |
|---:|---|---|---|---|---|---|---|---|
| 31 | Zimmer Biomet Holdings | `zimmer-biomet` | USA | Healthcare/Orthopaedic | ROSA robotic joint replacement. Not in the loaded fortune-500 index; see R-SUB-4. | Operating (assumed) | U | Verify |
| 32 | Globus Medical, Inc. | `globus-medical` | USA | Healthcare/Spine | ExcelsiusGPS robotic spine surgery. | Operating (assumed) | U | Verify |
| 33 | Procept BioRobotics | `procept-biorobotics` | USA | Healthcare/Urology | Aquablation; NASDAQ-listed, so audited disclosure exists. | Operating (assumed) | U | Verify |
| 34 | Distalmotion SA | `distalmotion` | Switzerland | Healthcare/Surgical | Dexter; positioned for smaller hospitals — an EQ4 access case. THIN. | Operating (assumed) | U | Verify |
| 35 | Moon Surgical | `moon-surgical` | France | Healthcare/Surgical | Maestro laparoscopic assistance. THIN. | Operating (assumed) | U | Verify |
| 36 | Noah Medical | `noah-medical` | USA | Healthcare/Bronchoscopy | Galaxy robotic bronchoscopy for early lung-cancer detection. THIN. | Operating (assumed) | U | Verify |
| 37 | Doosan Robotics | `doosan-robotics` | South Korea | Industrial/Collaborative | KOSPI-listed collaborative robot maker. | Operating (assumed) | U | Verify |
| 38 | Rainbow Robotics | `rainbow-robotics` | South Korea | Research/Humanoid | Samsung Electronics is majority owner. **Check R-SUB-3** — Samsung holds no published composite, so listing should be permitted; confirm. | Operating (assumed) | U | Verify |
| 39 | Franka Robotics GmbH | `franka-robotics` | Germany | Research/Collaborative | The dominant research-lab manipulator; sets safety norms across academic robotics. THIN. | Operating (assumed) | U | Verify |
| 40 | Mujin, Inc. | `mujin` | Japan | Logistics/Industrial | Warehouse picking intelligence. THIN. | Operating (assumed) | U | Verify |
| 41 | Dexterity, Inc. | `dexterity-inc` | USA | Logistics/Industrial | Truck loading and parcel handling — replaces one of the most injury-prone jobs in logistics. THIN. | Operating (assumed) | U | Verify |
| 42 | Avidbots | `avidbots` | Canada | Service/Cleaning | Neo floor-scrubbing robots in airports, hospitals and malls; displaces low-wage cleaning labour. THIN. | Operating (assumed) | U | Verify |
| 43 | Brain Corp | `brain-corp` | USA | Service/Cleaning | Autonomy stack behind a large share of commercial cleaning robots. THIN. | Operating (assumed) | U | Verify |
| 44 | Ecovacs Robotics | `ecovacs-robotics` | China | Consumer/Home | Home robots with cameras and microphones in domestic space — a direct B5 consent and privacy case. | Operating (assumed) | U | Verify |
| 45 | Roborock | `roborock` | China | Consumer/Home | Global leader in robot vacuums by revenue; same domestic-surveillance surface. | Operating (assumed) | U | Verify |

### Batch 4 — ranks 46–58: reserve pool

| # | Entity | Slug | HQ | Category | Rationale | Status | Ver | Source |
|---:|---|---|---|---|---|---|---|---|
| 46 | Trexo Robotics | `trexo-robotics` | Canada | Healthcare/Paediatric gait | Robotic gait training for children with cerebral palsy. Highest vulnerability of any candidate; smallest disclosure surface. **THIN — expect near-uniform 2s.** | Operating (assumed) | U | Verify |
| 47 | Marsi Bionics | `marsi-bionics` | Spain | Healthcare/Paediatric gait | Paediatric exoskeleton. **THIN.** | Operating (assumed) | U | Verify |
| 48 | Angel Robotics | `angel-robotics` | South Korea | Healthcare/Rehab | Wearable robots for spinal-cord injury. **THIN.** | Operating (assumed) | U | Verify |
| 49 | PSYONIC | `psyonic` | USA | Healthcare/Prosthetics | Ability Hand; Medicare-reimbursed bionic hand at a lower price point — an explicit affordability claim to test. **THIN.** | Operating (assumed) | U | Verify |
| 50 | Össur hf. | `ossur` | Iceland | Healthcare/Prosthetics | Global prosthetics leader; Nasdaq Copenhagen listed, so audited disclosure exists. Peer to Ottobock, which currently ranks 2. | Operating (assumed) | U | Verify |
| 51 | Labrador Systems | `labrador-systems` | USA | Care/Assistive home | Retriever assistive home robot for people with mobility limitations. **THIN.** | Operating (assumed) | U | Verify |
| 52 | Toyota Research Institute | `toyota-research-institute` | USA/Japan | Research/Assistive | Separately incorporated (R-SUB-1); publishes assistive and eldercare robotics research. Toyota Motor holds no published composite. | Operating (assumed) | U | Verify |
| 53 | Nuro, Inc. | `nuro` | USA | Autonomous delivery | Sells vehicles to partners, so robotics-labs under §2.2. Public-road exposure without bystander consent. | Operating (assumed) | U | Verify |
| 54 | Serve Robotics Inc. | `serve-robotics` | USA | Autonomous sidewalk delivery | NASDAQ-listed. Sidewalk robots interact daily with wheelchair users and blind pedestrians — a live EQ4 conflict. | Operating (assumed) | U | Verify |
| 55 | Starship Technologies | `starship-technologies` | Estonia/USA | Autonomous sidewalk delivery | Large campus and municipal fleets; same sidewalk-access conflict. | Operating (assumed) | U | Verify |
| 56 | Milrem Robotics | `milrem-robotics` | Estonia | Defence/UGV | Europe's largest unmanned ground vehicle maker; THeMIS in active use. Balances a US-only defence cohort. | Operating (assumed) | U | Verify |
| 57 | iRobot Corporation | `irobot` | USA | Consumer/Home | **Status caution.** Publicly reported going-concern doubt following the collapsed Amazon acquisition. **Verify under §2.4 before listing** — this is exactly the class of defect the roster already carries nine of. | **At risk** | U | Verify urgently |
| 58 | Rex Bionics Ltd | `rex-bionics` | New Zealand/UK | Healthcare/Rehab | Named among rehabilitation robotics manufacturers. **Ownership and operating status have changed repeatedly; verify under §2.4.** | **At risk** | P | [Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/rehabilitation-robots-market/companies) |

**Deliberately excluded, with reasons.**

| Candidate | Why excluded |
|---|---|
| Johnson & Johnson MedTech (Ottava, Monarch) | R-SUB-3: parent published in fortune-500. Cross-reference only. |
| John Deere autonomous agriculture | R-SUB-3: Deere & Company published in fortune-500 (#168). |
| Honeywell Intelligrated | R-SUB-3: Honeywell published (#170). |
| Lockheed Martin, Northrop Grumman, General Dynamics, Textron | R-SUB-3: all published in fortune-500. |
| **Medtronic plc** | Verified operating and a major surgical-robotics player (Hugo FDA-cleared; first US cases February 2026), **but robotics is a minority segment**, so R-SUB-4's tie-break assigns it to fortune-500. Listing it in robotics-labs requires a founder override. Source: [MedTech Dive](https://www.medtechdive.com/news/top-surgical-robotics-stories-in-the-first-half-of-2026/824547/) |
| **Stryker Corporation** | Same reasoning. Mako passed 2 million robotic procedures by August 2025; about 15% of the surgical robotics market, concentrated in orthopaedics — but a minority of Stryker revenue. Source: [PDP Spectra](https://pdpspectra.com/blog/surgical-robotics-2026/) |
| **Monarch Tractor** | **Defunct.** Sold its core technology, reportedly to Caterpillar, and shut down operations. A live illustration of why §2.4 exists. Source: [F-Prime Robotics Roundup #28, April 2026](https://roboticsroundup.substack.com/p/robotics-roundup-28-april-2026) |
| Covariant, Embodied Inc. (Moxie), Asensus Surgical, FarmWise, Small Robot Company | Acquired, absorbed or wound down. §2.4 excludes them. |

---

## 3.3 Verification summary

| | ai-labs | robotics-labs | Total |
|---|---:|---:|---:|
| Candidates listed | 58 | 58 | 116 |
| **V** — status confirmed by a dated source | **32** | **28** | **60** |
| **P** — named in a dated source, status not confirmed | 6 | 4 | 10 |
| **U** — **not verified in this study** | **20** | **26** | **46** |
| Marked THIN (evidence-thin expected) | 14 | 17 | 31 |
| Status contested or at risk (do not assess yet) | 2 (Anysphere, Woebot Health) | 2 (iRobot, Rex Bionics) | 4 |
| Slug collisions against existing benchmark entities | 0 | 0 | **0** |

**60 of 116 candidates (52%) are verified to V standard.** The remaining 56 need a corporate-status check before any assessment brief is written. That check is cheap — one search each, roughly one working session for all 56 — and it is not optional. The roster already carries nine entity-currency defects; adding an unverified company would compound exactly the problem this study exists to fix.

The verified candidates alone (60) do not fill 108 slots. **Batches 1 and 2 of each index are fully assessable today; batches 3 and 4 require the verification pass first.**

---

# STEP 4 — Sizing the work

## 4.1 Volume

| Work item | Count |
|---|---:|
| ai-labs net-new baseline assessments (Scenario B) | 55 |
| robotics-labs net-new baseline assessments (Scenario B) | 53 |
| Re-assessments of records resolved to a different company (Machina Labs, Shield AI, RoboKind) | 3 |
| **Total full 40-subdimension assessments** | **111** |
| Corporate-status verification checks (no assessment) | 56 |
| Renames with redirects (no assessment) | 11 |
| Delistings and merges (no assessment) | 9 |

At 40 subdimensions each, 111 assessments produce **4,440 subdimension scores** with evidence citations.

## 4.2 Recommended batch structure

**Batch size 12.** Prior studies handled 10–15 reliably; 14 was the largest verified run (`SEED_CLUSTER_ROBOTICS_MIDLOW_2026-08-17.md`). **Do not attempt 20 — it has never been tried, and a failed 20-entity run costs more to unpick than two 12-entity runs cost to schedule.** If throughput matters, test a single 15-entity run after batch 3 and only widen if it holds.

**Ten batches.**

| Batch | Index | Contents | n | Notes |
|---:|---|---|---:|---|
| 1 | robotics-labs | Batch 1 ranks 1–12 | 12 | Strongest evidence anywhere in the study. Intuitive Surgical and Intuition Robotics both have published third-party outcome data. Start here. |
| 2 | ai-labs | Batch 1 ranks 1–12 | 12 | NVIDIA, ByteDance, Alibaba, Tencent, Zhipu, MiniMax, Moonshot, Baidu, Hippocratic, Ai2, LG AI Research, Sarvam. Establishes the Chinese-lab disclosure standard once, for reuse. |
| 3 | robotics-labs | Ranks 13–24 | 12 | Accessibility and humanoid cohort. |
| 4 | ai-labs | Ranks 13–24 | 12 | Healthcare and mental-health AI cohort — highest harm salience in the whole programme. |
| 5 | robotics-labs | Ranks 25–36 | 12 | Logistics, defence, agriculture. Run **after** the verification pass. |
| 6 | ai-labs | Ranks 25–36 | 12 | Regional coverage cohort. |
| 7 | robotics-labs | Ranks 37–48 | 12 | Verification-dependent. |
| 8 | ai-labs | Ranks 37–48 | 12 | Verification-dependent. |
| 9 | robotics-labs | Ranks 49–53 + the 3 resolved records | 8 | Machina Labs, Shield AI, RoboKind re-assessments land here. |
| 10 | ai-labs | Ranks 49–55 | 7 | Reserve pool. |

**Two rules for every batch.**

1. **Never mix indexes within a batch.** Each index has its own evidence norms; a mixed batch produces two standards in one run and neither is auditable.
2. **Group by sector where possible.** One evidence standard per batch, stated up front. The seed-cluster studies established this and it held.

**Sequencing.** Run the 56 corporate-status checks between batch 4 and batch 5. Batches 1–4 draw entirely on V-verified candidates and can start immediately.

## 4.3 The evidence-thin problem — flag it in the brief, not in the score

**31 of 116 candidates are marked THIN.** These are small private companies with little public disclosure. Under the repo's standing **2-convention** — absence of disclosure scores 2, never 1; the floor of 1 requires positive documented evidence of a specific failure — they will produce composites near 25 with near-uniform dimension vectors.

**A composite of 25 for Trexo Robotics does not mean Trexo Robotics is uncompassionate.** It means a 12-person company building gait trainers for children with cerebral palsy does not publish an annual report, a bias audit or a turnover statistic. Reporting that as a compassion finding would be false, and it would be the benchmark's own credibility that paid.

Three mandatory requirements for the assessment brief:

1. **Every affected subdimension row must carry the sentence:** *"Absence of disclosure, not evidence of harm."* The `SEED_CLUSTER_ROBOTICS_MIDLOW` study did this in every affected row across 14 assessments; do the same.
2. **Every THIN entity page must carry a disclosure-capacity note** naming the company's approximate size and explaining that small private firms have no regulatory obligation to publish what this benchmark measures.
3. **The published index must show a disclosure-density indicator** alongside the composite, so a reader can tell a low score driven by silence from a low score driven by documented harm. Without it, the expanded index systematically punishes small companies serving vulnerable people — the exact population the framework is built to protect.

**Highest-risk THIN candidates**, where a low score would be most likely to be misread: Trexo Robotics, Marsi Bionics, Angel Robotics, PSYONIC, Labrador Systems, Glidance, Esper Bionics, Scewo (robotics); Kyutai, EleutherAI, Nous Research, World Labs, Wysa (AI).

**The mirror-image risk.** Safe Superintelligence Inc. will also score near-uniform 2s — but SSI has raised about $7 billion and employs roughly 50 people. Its silence is a *choice*, made with abundant resources, and should be read as one. **The brief must distinguish silence-from-capacity-constraint from silence-from-choice, using headcount and capital as the discriminator, and must say which applies in each case.**

## 4.4 Decisions needed from the founder before Batch 1

1. **Scenario A or B** for each index — minimum defect fix, or full criteria. Determines 52/53 versus 55/53 net-new.
2. **R-SUB-4 tie-break.** Do Medtronic, Stryker and Tesla belong in robotics-labs or in a completed fortune-500? This study recommends fortune-500 and excludes them; a founder override would add three strong entrants.
3. **Disposition of the three fused records** — Picasso Labs (Machina), Paladin AI (Shield AI), Apexica (RoboKind). Resolve and re-assess, or delist? The Apexica record holds **rank 3** and is the most urgent item in this document.
4. **Publish the acquired/defunct tombstone format**, or accept sub-100 rosters silently. This study recommends publishing it.
5. **Approve the disclosure-density indicator** before any THIN entity is published.

---

## Constraints observed

No file under `site/src/data/indexes/`, `research/rotation-state.json`, `research/change-proposals/`, `research/assessments/` or `site/src/data/updates/` was read for modification or modified. No entity was assessed. No composite, dimension or subdimension value was assigned. Nothing was committed.

Sources cited establish existence, scale and operating status **for selection purposes only**. Several are secondary aggregators of unknown reliability. None is scoring evidence. Assessment requires Tier 3 or better under the methodology's evidence hierarchy, gathered fresh at assessment time.

This scoping study is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.
